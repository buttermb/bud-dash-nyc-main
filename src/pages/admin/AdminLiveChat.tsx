import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatSession {
  id: string;
  mode: 'ai' | 'human';
  status: 'active' | 'closed';
  created_at: string;
  user_id?: string;
  guest_id?: string;
}

interface Message {
  id: string;
  sender_type: 'user' | 'ai' | 'admin';
  message: string;
  created_at: string;
}

const AdminLiveChat = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load sessions with proper cleanup
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    const loadSessions = async () => {
      const { data } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (data) setSessions(data as ChatSession[]);
    };

    loadSessions();

    const setupChannel = async () => {
      channel = supabase
        .channel('admin_chat_sessions', {
          config: {
            broadcast: { self: false },
            presence: { key: '' }
          }
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chat_sessions'
          },
          () => loadSessions()
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            console.error('Failed to subscribe to chat sessions channel');
          }
        });
    };

    setupChannel();

    return () => {
      if (channel) {
        supabase.removeChannel(channel).then(() => {
          channel = null;
        });
      }
    };
  }, []);

  // Load messages for selected session with proper cleanup
  useEffect(() => {
    if (!selectedSession) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;

    const loadMessages = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', selectedSession)
        .order('created_at', { ascending: true });

      if (data) setMessages(data as Message[]);
    };

    loadMessages();

    const setupChannel = async () => {
      channel = supabase
        .channel(`admin_chat_${selectedSession}`, {
          config: {
            broadcast: { self: false },
            presence: { key: '' }
          }
        })
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `session_id=eq.${selectedSession}`
          },
          (payload) => {
            setMessages(prev => [...prev, payload.new as Message]);
          }
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            console.error('Failed to subscribe to chat messages channel');
          }
        });
    };

    setupChannel();

    return () => {
      if (channel) {
        supabase.removeChannel(channel).then(() => {
          channel = null;
        });
      }
    };
  }, [selectedSession]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedSession) return;

    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('chat_messages').insert({
      session_id: selectedSession,
      sender_type: 'admin',
      sender_id: user?.id,
      message: input.trim()
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
      return;
    }

    setInput('');
  };

  const takeOver = async (sessionId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase
      .from('chat_sessions')
      .update({ 
        mode: 'human',
        assigned_admin_id: user?.id
      })
      .eq('id', sessionId);

    setSelectedSession(sessionId);
  };

  const humanSessions = sessions.filter(s => s.mode === 'human');
  const aiSessions = sessions.filter(s => s.mode === 'ai');

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Live Chat Support</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* Sessions List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Chats</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {humanSessions.length > 0 && (
                <div className="p-4 space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">Human Support</p>
                  {humanSessions.map(session => (
                    <Button
                      key={session.id}
                      variant={selectedSession === session.id ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => setSelectedSession(session.id)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Badge variant="secondary">👨‍💼</Badge>
                        <span className="truncate">
                          {session.user_id ? 'User' : session.guest_id}
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
              
              {aiSessions.length > 0 && (
                <div className="p-4 space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">AI Assisted</p>
                  {aiSessions.map(session => (
                    <Button
                      key={session.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => takeOver(session.id)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Badge variant="outline">🤖</Badge>
                        <span className="truncate">
                          {session.user_id ? 'User' : session.guest_id}
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
              
              {sessions.length === 0 && (
                <p className="p-4 text-center text-muted-foreground">
                  No active chats
                </p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedSession ? 'Chat Messages' : 'Select a chat'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSession ? (
              <div className="space-y-4">
                <ScrollArea className="h-[500px] pr-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            msg.sender_type === 'admin'
                              ? 'bg-primary text-primary-foreground'
                              : msg.sender_type === 'ai'
                              ? 'bg-blue-100 dark:bg-blue-900'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {msg.sender_type === 'admin' ? 'You' : 
                               msg.sender_type === 'ai' ? 'AI' : 'Customer'}
                            </Badge>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                  />
                  <Button onClick={handleSend} disabled={!input.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-[500px] flex items-center justify-center text-muted-foreground">
                Select a chat session to view messages
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLiveChat;
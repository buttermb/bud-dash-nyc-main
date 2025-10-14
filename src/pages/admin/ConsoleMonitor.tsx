import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Trash2, Search, Download, Filter } from "lucide-react";
import { toast } from "sonner";

interface ConsoleLog {
  id: string;
  type: 'log' | 'warn' | 'error' | 'info';
  message: string;
  timestamp: Date;
  stack?: string;
}

const ConsoleMonitor = () => {
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<ConsoleLog['type'] | 'all'>('all');
  const [isPaused, setIsPaused] = useState(false);
  const originalConsole = useRef({
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info
  });

  useEffect(() => {
    const addLog = (type: ConsoleLog['type'], args: any[]) => {
      if (isPaused) return;
      
      const message = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');

      const log: ConsoleLog = {
        id: Date.now() + Math.random().toString(),
        type,
        message,
        timestamp: new Date(),
        stack: type === 'error' ? new Error().stack : undefined
      };

      setLogs(prev => [...prev, log].slice(-500)); // Keep last 500 logs
    };

    // Override console methods
    console.log = (...args) => {
      originalConsole.current.log(...args);
      addLog('log', args);
    };

    console.warn = (...args) => {
      originalConsole.current.warn(...args);
      addLog('warn', args);
    };

    console.error = (...args) => {
      originalConsole.current.error(...args);
      addLog('error', args);
    };

    console.info = (...args) => {
      originalConsole.current.info(...args);
      addLog('info', args);
    };

    return () => {
      // Restore original console methods
      console.log = originalConsole.current.log;
      console.warn = originalConsole.current.warn;
      console.error = originalConsole.current.error;
      console.info = originalConsole.current.info;
    };
  }, [isPaused]);

  const clearLogs = () => {
    setLogs([]);
    toast.success("Console cleared");
  };

  const exportLogs = () => {
    const data = JSON.stringify(logs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `console-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Logs exported");
  };

  const filteredLogs = logs.filter(log => {
    const matchesText = log.message.toLowerCase().includes(filter.toLowerCase());
    const matchesType = typeFilter === 'all' || log.type === typeFilter;
    return matchesText && matchesType;
  });

  const getTypeColor = (type: ConsoleLog['type']) => {
    switch (type) {
      case 'error': return 'bg-destructive';
      case 'warn': return 'bg-warning';
      case 'info': return 'bg-primary';
      default: return 'bg-muted';
    }
  };

  const stats = {
    total: logs.length,
    errors: logs.filter(l => l.type === 'error').length,
    warnings: logs.filter(l => l.type === 'warn').length,
    info: logs.filter(l => l.type === 'info').length,
    logs: logs.filter(l => l.type === 'log').length
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Console Monitor</h1>
        <p className="text-muted-foreground">Real-time console logging and debugging tool</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-destructive">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.errors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-warning">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.warnings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-primary">Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.info}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.logs}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Controls</CardTitle>
          <CardDescription>Manage console output</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => setIsPaused(!isPaused)} variant="outline">
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button onClick={clearLogs} variant="outline">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
            <Button onClick={exportLogs} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter logs..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={typeFilter === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTypeFilter('all')}
              >
                All
              </Button>
              <Button 
                variant={typeFilter === 'error' ? 'destructive' : 'outline'} 
                size="sm"
                onClick={() => setTypeFilter('error')}
              >
                Errors
              </Button>
              <Button 
                variant={typeFilter === 'warn' ? 'secondary' : 'outline'} 
                size="sm"
                onClick={() => setTypeFilter('warn')}
              >
                Warnings
              </Button>
              <Button 
                variant={typeFilter === 'info' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTypeFilter('info')}
              >
                Info
              </Button>
              <Button 
                variant={typeFilter === 'log' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTypeFilter('log')}
              >
                Logs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Console Output</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {logs.length} logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {filteredLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No logs to display
                </p>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="border rounded p-3 space-y-1 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(log.type)}>
                        {log.type.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <pre className="text-sm whitespace-pre-wrap break-words font-mono">
                      {log.message}
                    </pre>
                    {log.stack && (
                      <details className="text-xs text-muted-foreground">
                        <summary className="cursor-pointer hover:text-foreground">
                          Stack trace
                        </summary>
                        <pre className="mt-2 whitespace-pre-wrap">{log.stack}</pre>
                      </details>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsoleMonitor;

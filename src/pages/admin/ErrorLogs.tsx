import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, CheckCircle2, RefreshCw, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

export default function ErrorLogs() {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [resolvedFilter, setResolvedFilter] = useState<string>('unresolved');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('errors');

  const { data: errorLogs, isLoading: isLoadingErrors, refetch: refetchErrors } = useQuery({
    queryKey: ['error-logs', severityFilter, resolvedFilter, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (severityFilter !== 'all') {
        query = query.eq('severity', severityFilter);
      }

      if (resolvedFilter === 'resolved') {
        query = query.eq('resolved', true);
      } else if (resolvedFilter === 'unresolved') {
        query = query.eq('resolved', false);
      }

      if (searchTerm) {
        query = query.or(`error_message.ilike.%${searchTerm}%,error_type.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: appLogs, isLoading: isLoadingLogs, refetch: refetchLogs } = useQuery({
    queryKey: ['app-logs', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('application_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (searchTerm) {
        query = query.ilike('message', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const markAsResolved = async (id: string) => {
    const { error } = await supabase
      .from('error_logs')
      .update({ resolved: true })
      .eq('id', id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to mark error as resolved',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Error marked as resolved',
      });
      refetchErrors();
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'destructive';
      case 'warn': return 'default';
      case 'info': return 'secondary';
      case 'debug': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">System Monitoring</h1>
        <Button
          onClick={() => {
            refetchErrors();
            refetchLogs();
          }}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search errors and logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="errors">
            Error Logs
            {errorLogs && (
              <Badge variant="secondary" className="ml-2">
                {errorLogs.filter(e => !e.resolved).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="application">
            Application Logs
            {appLogs && (
              <Badge variant="secondary" className="ml-2">
                {appLogs.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="errors" className="space-y-4">
          <div className="flex gap-4">
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={resolvedFilter} onValueChange={setResolvedFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unresolved">Unresolved</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoadingErrors ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Loading error logs...</p>
              </CardContent>
            </Card>
          ) : errorLogs && errorLogs.length > 0 ? (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {errorLogs.map((error) => (
                  <Card key={error.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={getSeverityColor(error.severity)}>
                              {error.severity}
                            </Badge>
                            <Badge variant="outline">{error.error_type}</Badge>
                            {error.resolved && (
                              <Badge variant="secondary">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Resolved
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg">{error.error_message}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(error.created_at), 'PPpp')}
                          </p>
                          {error.page_url && (
                            <p className="text-xs text-muted-foreground">
                              Page: {error.page_url}
                            </p>
                          )}
                        </div>
                        {!error.resolved && (
                          <Button
                            onClick={() => markAsResolved(error.id)}
                            variant="outline"
                            size="sm"
                          >
                            Mark Resolved
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    {error.error_stack && (
                      <CardContent>
                        <details className="text-sm">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground mb-2">
                            Stack Trace
                          </summary>
                          <pre className="p-3 bg-muted rounded text-xs overflow-auto max-h-48">
                            {error.error_stack}
                          </pre>
                        </details>
                        {error.context && Object.keys(error.context).length > 0 && (
                          <details className="text-sm mt-2">
                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground mb-2">
                              Additional Context
                            </summary>
                            <pre className="p-3 bg-muted rounded text-xs overflow-auto">
                              {JSON.stringify(error.context, null, 2)}
                            </pre>
                          </details>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">No error logs found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="application" className="space-y-4">
          {isLoadingLogs ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Loading application logs...</p>
              </CardContent>
            </Card>
          ) : appLogs && appLogs.length > 0 ? (
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {appLogs.map((log) => (
                  <Card key={log.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Badge variant={getLogLevelColor(log.log_level)}>
                          {log.log_level}
                        </Badge>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{log.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(log.created_at), 'PPpp')}
                          </p>
                          {log.page_url && (
                            <p className="text-xs text-muted-foreground">
                              {log.page_url}
                            </p>
                          )}
                          {log.data && Object.keys(log.data).length > 0 && (
                            <details className="text-xs mt-1">
                              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                Details
                              </summary>
                              <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
                                {JSON.stringify(log.data, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">No application logs found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

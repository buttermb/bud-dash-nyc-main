import { useState, useEffect, useRef } from 'react';
import { Bug, X, Trash2, Download, Terminal, Network, AlertTriangle, Database, Gauge, Copy, Filter, ArrowDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface LogEntry {
  id: number;
  timestamp: Date;
  type: 'log' | 'warn' | 'error' | 'info';
  message: string;
  args: any[];
  stack?: string;
}

interface NetworkEntry {
  id: number;
  timestamp: Date;
  method: string;
  url: string;
  status?: number;
  duration?: number;
  error?: string;
}

// Global stores for logs and network requests
const globalLogs: LogEntry[] = [];
const globalNetwork: NetworkEntry[] = [];
let logId = 0;
let networkId = 0;
let intercepted = false;

// Initialize interception once globally
if (!intercepted) {
  intercepted = true;
  
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalInfo = console.info;

  const addLog = (type: LogEntry['type'], args: any[]) => {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');

    globalLogs.push({
      id: logId++,
      timestamp: new Date(),
      type,
      message,
      args,
      stack: type === 'error' ? new Error().stack : undefined,
    });
    
    // Keep only last 1000 logs
    if (globalLogs.length > 1000) {
      globalLogs.shift();
    }
  };

  console.log = (...args) => {
    originalLog(...args);
    addLog('log', args);
  };

  console.warn = (...args) => {
    originalWarn(...args);
    addLog('warn', args);
  };

  console.error = (...args) => {
    originalError(...args);
    addLog('error', args);
  };

  console.info = (...args) => {
    originalInfo(...args);
    addLog('info', args);
  };

  // Intercept fetch
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const [url, options] = args;
    const startTime = Date.now();
    const id = networkId++;

    const networkEntry: NetworkEntry = {
      id,
      timestamp: new Date(),
      method: (options as any)?.method || 'GET',
      url: typeof url === 'string' ? url : url.toString(),
    };

    try {
      const response = await originalFetch(...args);
      const duration = Date.now() - startTime;

      globalNetwork.push({
        ...networkEntry,
        status: response.status,
        duration,
      });
      
      if (globalNetwork.length > 100) {
        globalNetwork.shift();
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      globalNetwork.push({
        ...networkEntry,
        duration,
        error: error instanceof Error ? error.message : String(error),
      });
      
      if (globalNetwork.length > 100) {
        globalNetwork.shift();
      }
      
      throw error;
    }
  };

  // Global error handlers
  window.addEventListener('error', (event: ErrorEvent) => {
    addLog('error', [event.message, event.error]);
  });

  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    addLog('error', ['Unhandled Promise Rejection:', event.reason]);
  });
}

export const DevTools = () => {
  // Only show in development - disable in production to prevent errors
  if (import.meta.env.PROD) return null;
  
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([...globalLogs]);
  const [network, setNetwork] = useState<NetworkEntry[]>([...globalNetwork]);
  const [filter, setFilter] = useState('');
  const [activeTab, setActiveTab] = useState('logs');
  const [typeFilter, setTypeFilter] = useState<LogEntry['type'] | 'all'>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const [storage, setStorage] = useState<Record<string, any>>({});
  const [performance, setPerformance] = useState<any>(null);
  const logScrollRef = useRef<HTMLDivElement>(null);
  const networkScrollRef = useRef<HTMLDivElement>(null);

  // Sync global stores to local state every 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs([...globalLogs]);
      setNetwork([...globalNetwork]);
      
      // Update storage
      const storageData: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            storageData[key] = JSON.parse(localStorage.getItem(key) || '');
          } catch {
            storageData[key] = localStorage.getItem(key);
          }
        }
      }
      setStorage(storageData);
      
      // Update performance metrics
      if (window.performance) {
        const perf = window.performance;
        const timing = perf.timing;
        setPerformance({
          loadTime: timing.loadEventEnd - timing.navigationStart,
          domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
          memory: (perf as any).memory,
        });
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);
  
  // Auto scroll to bottom
  useEffect(() => {
    if (autoScroll && activeTab === 'logs' && logScrollRef.current) {
      const scrollElement = logScrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [logs, autoScroll, activeTab]);

  const clearLogs = () => {
    globalLogs.length = 0;
    setLogs([]);
  };
  
  const clearNetwork = () => {
    globalNetwork.length = 0;
    setNetwork([]);
  };

  const exportLogs = () => {
    const data = JSON.stringify(logs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.json`;
    a.click();
    toast.success('Logs exported successfully');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const filteredLogs = logs
    .filter(log => typeFilter === 'all' || log.type === typeFilter)
    .filter(log => log.message.toLowerCase().includes(filter.toLowerCase()));

  const errorCount = logs.filter(l => l.type === 'error').length;
  const warnCount = logs.filter(l => l.type === 'warn').length;

  const getStatusColor = (status?: number) => {
    if (!status) return 'text-muted-foreground';
    if (status >= 200 && status < 300) return 'text-green-500';
    if (status >= 400 && status < 500) return 'text-yellow-500';
    if (status >= 500) return 'text-red-500';
    return 'text-muted-foreground';
  };

  const getTypeColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'warn': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'info': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-muted text-muted-foreground border-muted';
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        variant="outline"
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg"
      >
        <Bug className="h-5 w-5" />
        {(errorCount > 0 || warnCount > 0) && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500">
            {errorCount + warnCount}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 md:right-4 md:left-auto md:w-[700px]">
      <Card className="h-[600px] flex flex-col shadow-2xl border-2">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            <h3 className="font-semibold">DevTools</h3>
            {errorCount > 0 && (
              <Badge variant="destructive" className="rounded-full">
                {errorCount} errors
              </Badge>
            )}
            {warnCount > 0 && (
              <Badge variant="outline" className="rounded-full bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                {warnCount} warnings
              </Badge>
            )}
          </div>
          <Button onClick={() => setIsOpen(false)} size="icon" variant="ghost">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-4 mt-2">
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Console ({logs.length})
            </TabsTrigger>
            <TabsTrigger value="network" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Network ({network.length})
            </TabsTrigger>
            <TabsTrigger value="storage" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Storage
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="flex-1 flex flex-col p-4 pt-2 space-y-2 overflow-hidden">
            <div className="flex gap-2">
              <Input
                placeholder="Filter logs..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="flex-1"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setTypeFilter('all')}>
                    {typeFilter === 'all' && <Check className="mr-2 h-4 w-4" />}
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter('log')}>
                    {typeFilter === 'log' && <Check className="mr-2 h-4 w-4" />}
                    Log
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter('info')}>
                    {typeFilter === 'info' && <Check className="mr-2 h-4 w-4" />}
                    Info
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter('warn')}>
                    {typeFilter === 'warn' && <Check className="mr-2 h-4 w-4" />}
                    Warn
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter('error')}>
                    {typeFilter === 'error' && <Check className="mr-2 h-4 w-4" />}
                    Error
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                onClick={() => setAutoScroll(!autoScroll)} 
                size="icon" 
                variant={autoScroll ? "default" : "outline"}
                title={autoScroll ? "Disable auto-scroll" : "Enable auto-scroll"}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button onClick={clearLogs} size="icon" variant="outline">
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button onClick={exportLogs} size="icon" variant="outline">
                <Download className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="flex-1 rounded-md border bg-muted/30 p-2" ref={logScrollRef}>
              <div className="font-mono text-xs space-y-1">
                {filteredLogs.length === 0 ? (
                  <div className="text-muted-foreground text-center py-8">No logs to display</div>
                ) : (
                  filteredLogs.map((log) => (
                    <div key={log.id} className={`p-2 rounded border ${getTypeColor(log.type)} group relative`}>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={() => copyToClipboard(log.message)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="shrink-0 mt-0.5 text-xs">
                          {log.type}
                        </Badge>
                        <span className="text-muted-foreground shrink-0 text-xs">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                        <pre className="flex-1 whitespace-pre-wrap break-all pr-8">
                          {log.message}
                        </pre>
                      </div>
                      {log.stack && log.type === 'error' && (
                        <details className="mt-2 text-xs opacity-70">
                          <summary className="cursor-pointer hover:opacity-100">Stack trace</summary>
                          <pre className="mt-1 p-2 bg-background/50 rounded overflow-auto max-h-32">
                            {log.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="network" className="flex-1 flex flex-col p-4 pt-2 space-y-2 overflow-hidden">
            <div className="flex gap-2">
              <Button onClick={clearNetwork} size="sm" variant="outline">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>

            <ScrollArea className="flex-1 rounded-md border bg-muted/30 p-2" ref={networkScrollRef}>
              <div className="font-mono text-xs space-y-1">
                {network.length === 0 ? (
                  <div className="text-muted-foreground text-center py-8">No network requests</div>
                ) : (
                  network.map((req) => (
                    <div key={req.id} className="p-2 rounded border bg-background hover:bg-muted/50 group relative">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={() => copyToClipboard(req.url)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="shrink-0">
                          {req.method}
                        </Badge>
                        {req.status && (
                          <span className={`shrink-0 font-semibold ${getStatusColor(req.status)}`}>
                            {req.status}
                          </span>
                        )}
                        {req.error && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-muted-foreground text-xs shrink-0">
                          {req.duration}ms
                        </span>
                        <span className="text-muted-foreground shrink-0 text-xs">
                          {req.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="mt-1 text-xs break-all pr-8">
                        {req.url}
                      </div>
                      {req.error && (
                        <div className="mt-1 text-xs text-red-500">
                          Error: {req.error}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="storage" className="flex-1 flex flex-col p-4 pt-2 space-y-2 overflow-hidden">
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  localStorage.clear();
                  toast.success('Local storage cleared');
                }} 
                size="sm" 
                variant="outline"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Storage
              </Button>
            </div>

            <ScrollArea className="flex-1 rounded-md border bg-muted/30 p-2">
              <div className="font-mono text-xs space-y-2">
                {Object.keys(storage).length === 0 ? (
                  <div className="text-muted-foreground text-center py-8">No storage items</div>
                ) : (
                  Object.entries(storage).map(([key, value]) => (
                    <div key={key} className="p-2 rounded border bg-background group relative">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={() => copyToClipboard(JSON.stringify(value, null, 2))}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <div className="font-semibold text-primary mb-1 pr-8">{key}</div>
                      <pre className="text-xs whitespace-pre-wrap break-all text-muted-foreground">
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                      </pre>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="performance" className="flex-1 flex flex-col p-4 pt-2 space-y-2 overflow-hidden">
            <ScrollArea className="flex-1 rounded-md border bg-muted/30 p-4">
              <div className="space-y-4">
                {performance ? (
                  <>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Page Load Metrics</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Load Time:</span>
                          <span className="font-mono">{performance.loadTime}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">DOM Ready:</span>
                          <span className="font-mono">{performance.domReady}ms</span>
                        </div>
                      </div>
                    </div>

                    {performance.memory && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Memory Usage</h4>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">JS Heap Size:</span>
                            <span className="font-mono">
                              {(performance.memory.usedJSHeapSize / 1048576).toFixed(2)} MB
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total JS Heap:</span>
                            <span className="font-mono">
                              {(performance.memory.totalJSHeapSize / 1048576).toFixed(2)} MB
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Heap Limit:</span>
                            <span className="font-mono">
                              {(performance.memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Current Stats</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Console Logs:</span>
                          <span className="font-mono">{logs.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Network Requests:</span>
                          <span className="font-mono">{network.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Errors:</span>
                          <span className="font-mono text-red-500">{errorCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Warnings:</span>
                          <span className="font-mono text-yellow-500">{warnCount}</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground text-center py-8">
                    Performance data not available
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

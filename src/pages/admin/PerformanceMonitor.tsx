import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, Zap, Clock, HardDrive, Network } from "lucide-react";
import { toast } from "sonner";

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  description: string;
}

interface ResourceTiming {
  name: string;
  duration: number;
  size?: number;
  type: string;
}

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [resources, setResources] = useState<ResourceTiming[]>([]);
  const [memoryUsage, setMemoryUsage] = useState<any>(null);

  const calculateMetrics = () => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (!perfData) return;

    const newMetrics: PerformanceMetric[] = [
      {
        name: 'First Contentful Paint',
        value: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        rating: getRating(performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0, 1800, 3000),
        description: 'Time until first content is visible'
      },
      {
        name: 'DOM Content Loaded',
        value: perfData.domContentLoadedEventEnd - perfData.fetchStart,
        rating: getRating(perfData.domContentLoadedEventEnd - perfData.fetchStart, 1500, 2500),
        description: 'Time until DOM is fully parsed'
      },
      {
        name: 'Load Complete',
        value: perfData.loadEventEnd - perfData.fetchStart,
        rating: getRating(perfData.loadEventEnd - perfData.fetchStart, 2500, 4000),
        description: 'Total page load time'
      },
      {
        name: 'Time to Interactive',
        value: perfData.domInteractive - perfData.fetchStart,
        rating: getRating(perfData.domInteractive - perfData.fetchStart, 2000, 3500),
        description: 'Time until page is interactive'
      }
    ];

    setMetrics(newMetrics);

    // Get resource timings
    const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const resourceData: ResourceTiming[] = resourceEntries.slice(-50).map(entry => ({
      name: entry.name.split('/').pop() || entry.name,
      duration: entry.duration,
      size: entry.transferSize,
      type: entry.initiatorType
    }));

    setResources(resourceData);

    // Memory usage (if available)
    if ('memory' in performance) {
      setMemoryUsage((performance as any).memory);
    }
  };

  const getRating = (value: number, goodThreshold: number, poorThreshold: number): 'good' | 'needs-improvement' | 'poor' => {
    if (value <= goodThreshold) return 'good';
    if (value <= poorThreshold) return 'needs-improvement';
    return 'poor';
  };

  const getRatingColor = (rating: 'good' | 'needs-improvement' | 'poor') => {
    switch (rating) {
      case 'good': return 'bg-success';
      case 'needs-improvement': return 'bg-warning';
      case 'poor': return 'bg-destructive';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const exportMetrics = () => {
    const data = {
      metrics,
      resources,
      memoryUsage,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Metrics exported");
  };

  useEffect(() => {
    calculateMetrics();
    
    // Recalculate on page load events
    window.addEventListener('load', calculateMetrics);
    
    return () => {
      window.removeEventListener('load', calculateMetrics);
    };
  }, []);

  const overallRating = metrics.length > 0 
    ? metrics.filter(m => m.rating === 'good').length >= metrics.length / 2 
      ? 'good' 
      : metrics.filter(m => m.rating === 'poor').length > metrics.length / 2
        ? 'poor'
        : 'needs-improvement'
    : 'good';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Performance Monitor</h1>
          <p className="text-muted-foreground">Real-time performance metrics and resource usage</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={calculateMetrics} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={exportMetrics} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Overall Performance</CardTitle>
            <Badge className={getRatingColor(overallRating)}>
              {overallRating.toUpperCase().replace('-', ' ')}
            </Badge>
          </div>
          <CardDescription>Core Web Vitals and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.map((metric, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span className="font-medium">{metric.name}</span>
                  </div>
                  <Badge className={getRatingColor(metric.rating)}>
                    {metric.rating}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">{formatTime(metric.value)}</div>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {memoryUsage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Memory Usage
            </CardTitle>
            <CardDescription>Current JavaScript heap size</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Used JS Heap</p>
                <p className="text-2xl font-bold">{formatBytes(memoryUsage.usedJSHeapSize)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total JS Heap</p>
                <p className="text-2xl font-bold">{formatBytes(memoryUsage.totalJSHeapSize)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Heap Limit</p>
                <p className="text-2xl font-bold">{formatBytes(memoryUsage.jsHeapSizeLimit)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Resource Timings
          </CardTitle>
          <CardDescription>Recent network resources loaded</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {resources.map((resource, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{resource.type}</Badge>
                      <span className="text-sm truncate">{resource.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    {resource.size && (
                      <span className="text-muted-foreground">{formatBytes(resource.size)}</span>
                    )}
                    <span className="font-medium">{formatTime(resource.duration)}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>Performance optimization suggestions</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {metrics.some(m => m.rating === 'poor') && (
              <li className="flex items-start gap-2">
                <span>🔴</span>
                <span>Critical: Some metrics need immediate attention. Focus on reducing load times.</span>
              </li>
            )}
            {resources.filter(r => r.duration > 1000).length > 0 && (
              <li className="flex items-start gap-2">
                <span>⚠️</span>
                <span>Some resources are loading slowly (&gt;1s). Consider code splitting or lazy loading.</span>
              </li>
            )}
            {resources.filter(r => r.size && r.size > 500000).length > 0 && (
              <li className="flex items-start gap-2">
                <span>📦</span>
                <span>Large resources detected (&gt;500KB). Consider compression or optimization.</span>
              </li>
            )}
            {memoryUsage && (memoryUsage.usedJSHeapSize / memoryUsage.jsHeapSizeLimit) > 0.7 && (
              <li className="flex items-start gap-2">
                <span>💾</span>
                <span>High memory usage detected. Check for memory leaks.</span>
              </li>
            )}
            {metrics.every(m => m.rating === 'good') && (
              <li className="flex items-start gap-2">
                <span>✅</span>
                <span>Excellent performance! All metrics are within good thresholds.</span>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;

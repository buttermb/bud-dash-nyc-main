import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Play, CheckCircle, XCircle, ExternalLink, Loader2, Download } from "lucide-react";
import { toast } from "sonner";

interface LinkResult {
  url: string;
  status: 'working' | 'broken' | 'external' | 'untested';
  statusCode?: number;
  linkText: string;
  foundOn: string;
}

const LinkChecker = () => {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<LinkResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentUrl, setCurrentUrl] = useState("");

  const checkLink = async (url: string, linkText: string, foundOn: string): Promise<LinkResult> => {
    // Check if external link
    const isExternal = url.startsWith('http') && !url.includes(window.location.hostname);
    
    if (isExternal) {
      return {
        url,
        status: 'external',
        linkText,
        foundOn
      };
    }

    // Check internal links
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return {
        url,
        status: response.ok ? 'working' : 'broken',
        statusCode: response.status,
        linkText,
        foundOn
      };
    } catch (error) {
      return {
        url,
        status: 'broken',
        linkText,
        foundOn
      };
    }
  };

  const getAllLinks = () => {
    const links: { url: string; text: string; page: string }[] = [];
    const currentPage = window.location.pathname;
    
    document.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (href) {
        links.push({
          url: href,
          text: link.textContent?.trim() || 'No text',
          page: currentPage
        });
      }
    });

    return links;
  };

  const runCheck = async () => {
    setChecking(true);
    setResults([]);
    setProgress(0);
    
    const links = getAllLinks();
    const uniqueLinks = Array.from(new Map(links.map(l => [l.url, l])).values());
    
    toast.info(`Checking ${uniqueLinks.length} unique links...`);
    
    const linkResults: LinkResult[] = [];
    
    for (let i = 0; i < uniqueLinks.length; i++) {
      const link = uniqueLinks[i];
      setCurrentUrl(link.url);
      setProgress(((i + 1) / uniqueLinks.length) * 100);
      
      const result = await checkLink(link.url, link.text, link.page);
      linkResults.push(result);
      setResults([...linkResults]);
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setChecking(false);
    setCurrentUrl("");
    setProgress(100);
    
    const broken = linkResults.filter(r => r.status === 'broken').length;
    const working = linkResults.filter(r => r.status === 'working').length;
    
    toast.success(`Check complete: ${working} working, ${broken} broken links`);
  };

  const exportResults = () => {
    const data = JSON.stringify(results, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `link-check-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Results exported");
  };

  const stats = {
    total: results.length,
    working: results.filter(r => r.status === 'working').length,
    broken: results.filter(r => r.status === 'broken').length,
    external: results.filter(r => r.status === 'external').length
  };

  const getStatusIcon = (status: LinkResult['status']) => {
    switch (status) {
      case 'working':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'broken':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'external':
        return <ExternalLink className="h-4 w-4 text-primary" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />;
    }
  };

  const getStatusBadge = (status: LinkResult['status']) => {
    switch (status) {
      case 'working':
        return <Badge className="bg-success">Working</Badge>;
      case 'broken':
        return <Badge variant="destructive">Broken</Badge>;
      case 'external':
        return <Badge variant="outline">External</Badge>;
      default:
        return <Badge variant="outline">Untested</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Link Checker</h1>
        <p className="text-muted-foreground">
          Check all links on the current page for broken URLs
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Check Links</CardTitle>
          <CardDescription>
            This will test all links on the current page and verify they work correctly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {checking && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="truncate">Checking: {currentUrl}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
          
          <div className="flex gap-2">
            <Button onClick={runCheck} disabled={checking} size="lg" className="flex-1">
              {checking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking Links...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Check All Links
                </>
              )}
            </Button>
            {results.length > 0 && (
              <Button onClick={exportResults} variant="outline" size="lg">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-success">Working</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{stats.working}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-destructive">Broken</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{stats.broken}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">External</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.external}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Link Results</CardTitle>
              <CardDescription>
                {checking ? "Checking links..." : `Found ${results.length} links`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 border rounded hover:bg-accent/50 transition-colors"
                    >
                      <div className="mt-0.5">{getStatusIcon(result.status)}</div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium truncate">{result.linkText}</span>
                          {getStatusBadge(result.status)}
                          {result.statusCode && (
                            <Badge variant="outline">{result.statusCode}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {result.url}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Found on: {result.foundOn}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default LinkChecker;

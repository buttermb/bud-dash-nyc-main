import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Play, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

interface ButtonTest {
  label: string;
  path: string;
  status: "pending" | "success" | "error" | "404";
  errorMessage?: string;
}

interface BugReport {
  type: "broken-image" | "missing-alt" | "react-error" | "performance" | "console-warning";
  severity: "low" | "medium" | "high";
  message: string;
  element?: string;
}

interface PageTest {
  path: string;
  tested: boolean;
  buttonResults: ButtonTest[];
  bugs: BugReport[];
}

const ButtonTester = () => {
  const navigate = useNavigate();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<ButtonTest[]>([]);
  const [pageResults, setPageResults] = useState<PageTest[]>([]);
  const [currentPage, setCurrentPage] = useState("");
  const [progress, setProgress] = useState(0);
  const [totalBugs, setTotalBugs] = useState(0);
  
  // All routes to test
  const allRoutes = [
    // Main public pages
    "/",
    "/faq",
    "/support",
    "/about",
    "/blog",
    "/partner-shops",
    
    // Admin pages
    "/admin/dashboard",
    "/admin/products",
    "/admin/inventory",
    "/admin/orders",
    "/admin/live-map",
    "/admin/live-orders",
    "/admin/couriers",
    "/admin/users",
    "/admin/compliance",
    "/admin/analytics",
    "/admin/giveaways",
    "/admin/coupons",
    "/admin/settings",
    
    // Add more routes as needed
  ];

  const getAllButtons = () => {
    const buttons: { label: string; path: string; element: HTMLElement }[] = [];
    
    // Dangerous button patterns to skip
    const dangerousPatterns = [
      /sign\s*out/i,
      /log\s*out/i,
      /logout/i,
      /delete/i,
      /remove/i,
      /clear/i,
      /reset/i,
      /cancel/i,
      /close/i,
      /dismiss/i
    ];
    
    // Get all button elements, links that look like buttons, and elements with onClick
    const buttonElements = document.querySelectorAll('button, a[role="button"], [onclick]');
    
    buttonElements.forEach((btn) => {
      const element = btn as HTMLElement;
      const label = element.textContent?.trim() || element.getAttribute('aria-label') || 'Unnamed Button';
      const href = element.getAttribute('href');
      const path = window.location.pathname;
      
      // Skip dangerous buttons
      const isDangerous = dangerousPatterns.some(pattern => pattern.test(label));
      if (isDangerous) {
        return;
      }
      
      // Skip navigation/sidebar buttons to prevent page navigation
      const isNavigation = element.closest('nav, [role="navigation"], aside, header');
      if (isNavigation) {
        return;
      }
      
      buttons.push({
        label: label.substring(0, 50), // Limit label length
        path,
        element
      });
    });

    return buttons;
  };

  const findBugs = (): BugReport[] => {
    const bugs: BugReport[] = [];
    
    // Check for broken images
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      if (!img.complete || img.naturalHeight === 0) {
        bugs.push({
          type: 'broken-image',
          severity: 'medium',
          message: `Broken image: ${img.src}`,
          element: img.alt || img.src
        });
      }
      
      // Check for missing alt text
      if (!img.alt && !img.getAttribute('aria-label')) {
        bugs.push({
          type: 'missing-alt',
          severity: 'low',
          message: 'Image missing alt text for accessibility',
          element: img.src
        });
      }
    });
    
    // Check for React errors in console
    const reactErrors = document.querySelectorAll('[data-react-error]');
    if (reactErrors.length > 0) {
      bugs.push({
        type: 'react-error',
        severity: 'high',
        message: `${reactErrors.length} React rendering error(s) detected`
      });
    }
    
    // Check performance
    const perfEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (perfEntries.length > 0) {
      const loadTime = perfEntries[0].loadEventEnd - perfEntries[0].fetchStart;
      if (loadTime > 3000) {
        bugs.push({
          type: 'performance',
          severity: 'medium',
          message: `Slow page load: ${Math.round(loadTime)}ms (recommended < 3000ms)`
        });
      }
    }
    
    return bugs;
  };

  const testButton = async (button: { label: string; path: string; element: HTMLElement }): Promise<ButtonTest> => {
    return new Promise((resolve) => {
      const originalFetch = window.fetch;
      const originalXHROpen = XMLHttpRequest.prototype.open;
      const originalXHRSend = XMLHttpRequest.prototype.send;
      let capturedError: string | null = null;
      let is404 = false;
      let networkErrors: string[] = [];

      // Intercept fetch requests
      window.fetch = async (...args) => {
        const url = typeof args[0] === 'string' ? args[0] : args[0] instanceof Request ? args[0].url : 'unknown';
        
        try {
          const response = await originalFetch(...args);
          
          // Check for various error status codes
          if (response.status === 404) {
            is404 = true;
            networkErrors.push(`404 Not Found: ${url}`);
          } else if (response.status >= 400 && response.status < 600) {
            networkErrors.push(`HTTP ${response.status} Error: ${url}`);
          } else if (!response.ok) {
            networkErrors.push(`Request failed (${response.status}): ${url}`);
          }
          
          return response;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Network error';
          networkErrors.push(`Fetch failed for ${url}: ${errorMsg}`);
          throw error;
        }
      };

      // Intercept XHR requests with better error handling
      const xhrInstances = new WeakMap<XMLHttpRequest, string>();
      
      XMLHttpRequest.prototype.open = function(...args: any[]) {
        const url = args[1] as string;
        xhrInstances.set(this, url);
        
        // Add error handlers
        this.addEventListener('error', function() {
          networkErrors.push(`XHR Error: ${url}`);
        });
        
        this.addEventListener('timeout', function() {
          networkErrors.push(`XHR Timeout: ${url}`);
        });
        
        this.addEventListener('load', function() {
          if (this.status === 404) {
            is404 = true;
            networkErrors.push(`404 Not Found: ${url}`);
          } else if (this.status >= 400 && this.status < 600) {
            networkErrors.push(`HTTP ${this.status} Error: ${url}`);
          }
        });
        
        return originalXHROpen.apply(this, args);
      };

      XMLHttpRequest.prototype.send = function(...args: any[]) {
        try {
          return originalXHRSend.apply(this, args);
        } catch (error) {
          const url = xhrInstances.get(this) || 'unknown';
          networkErrors.push(`XHR Send failed for ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          throw error;
        }
      };

      // Capture console errors and warnings
      const originalConsoleError = console.error;
      const originalConsoleWarn = console.warn;
      const consoleErrors: string[] = [];
      const consoleWarnings: string[] = [];
      
      console.error = (...args) => {
        const errorMsg = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
        consoleErrors.push(errorMsg);
        originalConsoleError(...args);
      };
      
      console.warn = (...args) => {
        const warnMsg = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
        consoleWarnings.push(warnMsg);
        originalConsoleWarn(...args);
      };

      // Capture unhandled promise rejections
      const handleRejection = (event: PromiseRejectionEvent) => {
        networkErrors.push(`Unhandled Promise: ${event.reason}`);
      };
      window.addEventListener('unhandledrejection', handleRejection);

      try {
        // Simulate click
        button.element.click();

        // Wait longer for async operations to complete
        setTimeout(() => {
          // Restore original functions
          window.fetch = originalFetch;
          XMLHttpRequest.prototype.open = originalXHROpen;
          XMLHttpRequest.prototype.send = originalXHRSend;
          console.error = originalConsoleError;
          console.warn = originalConsoleWarn;
          window.removeEventListener('unhandledrejection', handleRejection);

          // Compile all errors (include warnings if severe)
          const allErrors = [...networkErrors, ...consoleErrors, ...consoleWarnings];
          capturedError = allErrors.length > 0 ? allErrors.join('\n') : null;

          let status: ButtonTest['status'] = 'success';
          if (is404) {
            status = '404';
          } else if (capturedError) {
            status = 'error';
          }

          resolve({
            label: button.label,
            path: button.path,
            status,
            errorMessage: capturedError || undefined
          });
        }, 2000); // Increased timeout to catch slower requests
      } catch (error) {
        // Restore original functions
        window.fetch = originalFetch;
        XMLHttpRequest.prototype.open = originalXHROpen;
        XMLHttpRequest.prototype.send = originalXHRSend;
        console.error = originalConsoleError;
        console.warn = originalConsoleWarn;
        window.removeEventListener('unhandledrejection', handleRejection);

        resolve({
          label: button.label,
          path: button.path,
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
  };

  const runTests = async () => {
    setTesting(true);
    setResults([]);
    setPageResults([]);
    setProgress(0);
    
    const allPageResults: PageTest[] = [];
    const allButtonResults: ButtonTest[] = [];
    
    toast.info(`Starting tests across ${allRoutes.length} pages...`);

    for (let i = 0; i < allRoutes.length; i++) {
      const route = allRoutes[i];
      setCurrentPage(route);
      setProgress(((i + 1) / allRoutes.length) * 100);
      
      // Navigate to the page
      navigate(route);
      
      // Wait for page to load
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Get buttons on this page
      const buttons = getAllButtons();
      
      // Find bugs on this page
      const pageBugs = findBugs();
      
      if (buttons.length === 0) {
        allPageResults.push({
          path: route,
          tested: true,
          buttonResults: [],
          bugs: pageBugs
        });
        continue;
      }
      
      toast.info(`Testing ${buttons.length} buttons on ${route}`);
      
      const pageTestResults: ButtonTest[] = [];
      
      for (const button of buttons) {
        const result = await testButton(button);
        pageTestResults.push(result);
        allButtonResults.push(result);
        setResults([...allButtonResults]);
      }
      
      allPageResults.push({
        path: route,
        tested: true,
        buttonResults: pageTestResults,
        bugs: pageBugs
      });
      
      setPageResults([...allPageResults]);
    }
    
    const totalBugsFound = allPageResults.reduce((sum, page) => sum + page.bugs.length, 0);
    setTotalBugs(totalBugsFound);

    setTesting(false);
    setProgress(100);
    setCurrentPage("");
    
    const successCount = allButtonResults.filter(r => r.status === 'success').length;
    const errorCount = allButtonResults.filter(r => r.status === 'error').length;
    const notFoundCount = allButtonResults.filter(r => r.status === '404').length;

    toast.success(`All tests complete: ${successCount} working, ${errorCount} errors, ${notFoundCount} 404s, ${totalBugsFound} bugs found across ${allRoutes.length} pages`);
  };

  const getStatusIcon = (status: ButtonTest['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case '404':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />;
    }
  };

  const getStatusBadge = (status: ButtonTest['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-success">Working</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case '404':
        return <Badge variant="secondary" className="bg-warning">404</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const stats = {
    total: results.length,
    success: results.filter(r => r.status === 'success').length,
    error: results.filter(r => r.status === 'error').length,
    notFound: results.filter(r => r.status === '404').length,
    bugs: totalBugs
  };
  
  const getBugSeverityColor = (severity: BugReport['severity']) => {
    switch (severity) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      case 'low': return 'text-muted-foreground';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Button Tester</h1>
        <p className="text-muted-foreground">
          Test all buttons on the current page to identify errors and 404s
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Controls</CardTitle>
          <CardDescription>
            This will test all buttons across every page in your application and report any errors.
            <br />
            <strong>Safe Mode:</strong> Automatically skips sign out, delete, navigation, and other potentially destructive buttons.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h3 className="font-semibold text-sm">Pages to Test ({allRoutes.length}):</h3>
            <p className="text-sm text-muted-foreground">
              Main pages, Admin pages, and all other routes
            </p>
            <h3 className="font-semibold text-sm mt-4">Automatically Excluded:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Sign Out / Logout buttons</li>
              <li>Delete / Remove buttons</li>
              <li>Navigation & Sidebar links</li>
              <li>Close / Cancel / Dismiss buttons</li>
              <li>Clear / Reset buttons</li>
            </ul>
          </div>
          
          {testing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Testing: {currentPage}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
          
          <Button onClick={runTests} disabled={testing} size="lg" className="w-full">
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing All Pages...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Complete Site Test
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Buttons</CardTitle>
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
                <div className="text-2xl font-bold text-success">{stats.success}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-destructive">Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{stats.error}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-warning">404s</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{stats.notFound}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Bugs Found</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.bugs}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Test Results by Page</CardTitle>
              <CardDescription>
                {testing ? `Testing buttons across all pages...` : `Tested ${results.length} buttons across ${pageResults.length} pages`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {pageResults.map((page, pageIndex) => {
                    const pageStats = {
                      total: page.buttonResults.length,
                      success: page.buttonResults.filter(r => r.status === 'success').length,
                      error: page.buttonResults.filter(r => r.status === 'error').length,
                      notFound: page.buttonResults.filter(r => r.status === '404').length,
                      bugs: page.bugs.length
                    };
                    
                    return (
                      <div key={pageIndex} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{page.path}</h3>
                          <div className="flex gap-2">
                            {pageStats.success > 0 && (
                              <Badge variant="default" className="bg-success">
                                {pageStats.success} OK
                              </Badge>
                            )}
                            {pageStats.error > 0 && (
                              <Badge variant="destructive">
                                {pageStats.error} Errors
                              </Badge>
                            )}
                            {pageStats.notFound > 0 && (
                              <Badge variant="secondary" className="bg-warning">
                                {pageStats.notFound} 404s
                              </Badge>
                            )}
                            {pageStats.bugs > 0 && (
                              <Badge variant="outline">
                                {pageStats.bugs} Bugs
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Show bugs found on this page */}
                        {page.bugs.length > 0 && (
                          <div className="bg-muted/50 rounded p-3 space-y-2">
                            <h4 className="font-semibold text-sm">🐛 Bugs Detected:</h4>
                            {page.bugs.map((bug, bugIndex) => (
                              <div key={bugIndex} className="text-xs flex items-start gap-2">
                                <Badge 
                                  variant="outline" 
                                  className={getBugSeverityColor(bug.severity)}
                                >
                                  {bug.severity}
                                </Badge>
                                <div className="flex-1">
                                  <p className="font-medium">{bug.type.replace('-', ' ').toUpperCase()}</p>
                                  <p className="text-muted-foreground">{bug.message}</p>
                                  {bug.element && (
                                    <p className="text-muted-foreground truncate">Element: {bug.element}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {page.buttonResults.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No testable buttons on this page</p>
                        ) : (
                          <div className="space-y-2">
                            {page.buttonResults.map((result, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-3 p-2 border rounded hover:bg-accent/50 transition-colors"
                              >
                                <div className="mt-0.5">{getStatusIcon(result.status)}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium truncate text-sm">{result.label}</span>
                                    {getStatusBadge(result.status)}
                                  </div>
                                  {result.errorMessage && (
                                    <div className="mt-2 p-2 bg-destructive/10 rounded text-xs text-destructive">
                                      {result.errorMessage}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ButtonTester;

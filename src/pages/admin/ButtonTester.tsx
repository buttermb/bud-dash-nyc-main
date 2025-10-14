import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Play, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ButtonTest {
  label: string;
  path: string;
  status: "pending" | "success" | "error" | "404";
  errorMessage?: string;
}

const ButtonTester = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<ButtonTest[]>([]);

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

      // Capture console errors
      const originalConsoleError = console.error;
      const consoleErrors: string[] = [];
      console.error = (...args) => {
        const errorMsg = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
        consoleErrors.push(errorMsg);
        originalConsoleError(...args);
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
          window.removeEventListener('unhandledrejection', handleRejection);

          // Compile all errors
          const allErrors = [...networkErrors, ...consoleErrors];
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
    
    const buttons = getAllButtons();
    toast.info(`Found ${buttons.length} buttons to test`);

    const testResults: ButtonTest[] = [];

    for (const button of buttons) {
      const result = await testButton(button);
      testResults.push(result);
      setResults([...testResults]);
    }

    setTesting(false);
    
    const successCount = testResults.filter(r => r.status === 'success').length;
    const errorCount = testResults.filter(r => r.status === 'error').length;
    const notFoundCount = testResults.filter(r => r.status === '404').length;

    toast.success(`Testing complete: ${successCount} working, ${errorCount} errors, ${notFoundCount} 404s`);
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
    notFound: results.filter(r => r.status === '404').length
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
            This will simulate clicking all buttons on the current page and report any errors.
            <br />
            <strong>Safe Mode:</strong> Automatically skips sign out, delete, navigation, and other potentially destructive buttons.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h3 className="font-semibold text-sm">Automatically Excluded:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Sign Out / Logout buttons</li>
              <li>Delete / Remove buttons</li>
              <li>Navigation & Sidebar links</li>
              <li>Close / Cancel / Dismiss buttons</li>
              <li>Clear / Reset buttons</li>
            </ul>
          </div>
          <Button onClick={runTests} disabled={testing} size="lg">
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Safe Tests
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                {testing ? `Testing ${results.length} buttons...` : `Tested ${results.length} buttons`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="mt-0.5">{getStatusIcon(result.status)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{result.label}</span>
                          {getStatusBadge(result.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Page: {result.path}
                        </div>
                        {result.errorMessage && (
                          <div className="mt-2 p-2 bg-destructive/10 rounded text-sm text-destructive">
                            {result.errorMessage}
                          </div>
                        )}
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

export default ButtonTester;

import { Navigate } from "react-router-dom";
import { useAdmin } from "@/contexts/AdminContext";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  try {
    const { admin, loading, error } = useAdmin();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Verifying admin access...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Error</AlertTitle>
            <AlertDescription className="mt-2 space-y-4">
              <p>{error}</p>
              <Button 
                onClick={() => window.location.href = "/admin/login"}
                variant="outline"
                className="w-full"
              >
                Return to Login
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    if (!admin) {
      return <Navigate to="/admin/login" replace />;
    }

    return <>{children}</>;
  } catch (err) {
    console.error("AdminProtectedRoute error:", err);
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>System Error</AlertTitle>
          <AlertDescription className="mt-2 space-y-4">
            <p>An unexpected error occurred. Please try logging in again.</p>
            <Button 
              onClick={() => window.location.href = "/admin/login"}
              variant="outline"
              className="w-full"
            >
              Go to Login
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
};

export default AdminProtectedRoute;

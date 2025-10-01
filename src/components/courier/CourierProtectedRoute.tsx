import { Navigate } from "react-router-dom";
import { useCourier } from "@/contexts/CourierContext";
import { Loader2 } from "lucide-react";

interface CourierProtectedRouteProps {
  children: React.ReactNode;
}

const CourierProtectedRoute = ({ children }: CourierProtectedRouteProps) => {
  const { courier, loading } = useCourier();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!courier) {
    return <Navigate to="/courier/login" replace />;
  }

  return <>{children}</>;
};

export default CourierProtectedRoute;

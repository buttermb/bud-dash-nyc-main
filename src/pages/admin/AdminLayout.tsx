import { Outlet, useLocation, Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ChevronRight } from "lucide-react";
import InstallPWA from "@/components/InstallPWA";

const AdminLayout = () => {
  const location = useLocation();
  
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = paths.map((path, index) => {
      const url = '/' + paths.slice(0, index + 1).join('/');
      const label = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return { label, url };
    });
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-hidden">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b flex items-center px-2 md:px-4 gap-2 md:gap-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
            <SidebarTrigger />
            <nav className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground overflow-x-auto scrollbar-hide">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.url} className="flex items-center gap-2 flex-shrink-0">
                  {index > 0 && <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="font-medium text-foreground whitespace-nowrap">{crumb.label}</span>
                  ) : (
                    <Link 
                      to={crumb.url}
                      className="hover:text-foreground transition-colors whitespace-nowrap"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </header>
          <main className="flex-1 overflow-auto bg-muted/10">
            <Outlet />
          </main>
        </div>
      </div>
      <InstallPWA />
    </SidebarProvider>
  );
};

export default AdminLayout;

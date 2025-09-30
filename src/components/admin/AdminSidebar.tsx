import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Shield, 
  TrendingUp,
  MapPin,
  FileText,
  LogOut
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useAdmin } from "@/contexts/AdminContext";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Overview", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Live Map", url: "/admin/live-map", icon: MapPin },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Compliance", url: "/admin/compliance", icon: Shield },
  { title: "Analytics", url: "/admin/analytics", icon: TrendingUp },
  { title: "Audit Logs", url: "/admin/audit-logs", icon: FileText },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const { admin, signOut } = useAdmin();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarHeader className="border-b p-4">
        {!isCollapsed && (
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Admin Portal</h2>
            <p className="text-sm text-muted-foreground">{admin?.full_name}</p>
            <p className="text-xs text-muted-foreground capitalize">{admin?.role?.replace('_', ' ')}</p>
          </div>
        )}
        {isCollapsed && (
          <div className="flex justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end
                      className={({ isActive }) =>
                        isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </Sidebar>
  );
}

import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Shield, 
  TrendingUp,
  MapPin,
  FileText,
  LogOut,
  Clock,
  Truck,
  CheckCircle,
  AlertTriangle,
  ShoppingBag,
  Package,
  Image,
  FileUp,
  Settings,
  Gift,
  Ticket
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
  useSidebar,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAdmin } from "@/contexts/AdminContext";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const menuGroups = [
  {
    title: "Dashboard",
    items: [
      { title: "Overview", url: "/admin/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    title: "Product Management",
    items: [
      { title: "Products", url: "/admin/products", icon: ShoppingBag },
      { title: "Inventory", url: "/admin/inventory", icon: Package },
      { title: "Product Analytics", url: "/admin/products/analytics", icon: TrendingUp },
      { title: "Media Library", url: "/admin/media", icon: Image },
      { title: "Templates", url: "/admin/templates", icon: FileText },
      { title: "Import/Export", url: "/admin/import-export", icon: FileUp },
      { title: "COA Management", url: "/admin/coa-management", icon: Shield },
    ]
  },
  {
    title: "Orders & Delivery",
    items: [
      { title: "Live Map", url: "/admin/live-map", icon: MapPin },
      { title: "Live Orders", url: "/admin/live-orders", icon: Clock },
      { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
      { title: "Couriers", url: "/admin/couriers", icon: Truck },
      { title: "Applications", url: "/admin/courier-applications", icon: FileText },
      { title: "Safety", url: "/admin/delivery-safety", icon: AlertTriangle },
    ]
  },
  {
    title: "Users & Security",
    items: [
      { title: "Users", url: "/admin/users", icon: Users },
      { title: "Age Verification", url: "/admin/age-verification", icon: CheckCircle },
      { title: "Compliance", url: "/admin/compliance", icon: Shield },
    ]
  },
  {
    title: "System",
    items: [
      { title: "Analytics", url: "/admin/analytics", icon: TrendingUp },
      { title: "Audit Logs", url: "/admin/audit-logs", icon: FileText },
      { title: "All Giveaways", url: "/admin/giveaways", icon: Gift },
      { title: "Current Giveaway", url: "/admin/giveaway", icon: Gift },
      { title: "Coupon Codes", url: "/admin/coupons", icon: Ticket },
    ]
  }
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const { admin, signOut } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const isCollapsed = state === "collapsed";

  const isGroupActive = (items: typeof menuGroups[0]['items']) => {
    return items.some(item => location.pathname === item.url);
  };

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
        {menuGroups.map((group) => (
          <Collapsible
            key={group.title}
            defaultOpen={isGroupActive(group.items)}
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-muted/50 rounded-md px-2">
                  {!isCollapsed && <span>{group.title}</span>}
                  {!isCollapsed && (
                    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  )}
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
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
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>

      <div className="mt-auto p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={async () => {
            await signOut();
            navigate("/admin/login");
          }}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </Sidebar>
  );
}

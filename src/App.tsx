import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminProvider } from "./contexts/AdminContext";
import { CourierProvider } from "./contexts/CourierContext";
import { CourierPinProvider } from "./contexts/CourierPinContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedCourierRoute from "./components/ProtectedCourierRoute";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import Index from "./pages/Index";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderTracking from "./pages/OrderTracking";
import MyOrders from "./pages/MyOrders";
import FAQ from "./pages/FAQ";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import About from "./pages/About";
import BecomeCourier from "./pages/BecomeCourier";
import PartnerShops from "./pages/PartnerShops";
import OrderLookup from "./pages/OrderLookup";
import Admin from "./pages/Admin";
import ProductDetail from "./pages/ProductDetail";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import CourierLogin from "./pages/CourierLogin";
import CourierDashboard from "./pages/CourierDashboard";
import CourierEarnings from "./pages/CourierEarnings";
import CourierHistory from "./pages/CourierHistory";
import CourierProfile from "./pages/CourierProfile";
import TrackOrder from "./pages/TrackOrder";
import TrackOrderLive from "./pages/TrackOrderLive";
import CustomerTrackingPage from "./pages/CustomerTrackingPage";
import MerchantDashboard from "./pages/MerchantDashboard";
import AdminLogin from "./pages/AdminLogin";
import { NotificationPreferences } from "./components/NotificationPreferences";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminLiveMap from "./pages/admin/AdminLiveMap";
import AdminLiveOrders from "./pages/admin/AdminLiveOrders";
import AdminCouriers from "./pages/admin/AdminCouriers";
import AdminCourierDetails from "./pages/admin/AdminCourierDetails";
import AdminCompliance from "./pages/admin/AdminCompliance";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminAgeVerification from "./pages/admin/AdminAgeVerification";
import AdminCourierApplications from "./pages/admin/AdminCourierApplications";
import AdminDeliverySafety from "./pages/admin/AdminDeliverySafety";
import AdminProducts from "./pages/admin/AdminProducts";
import ProductForm from "./pages/admin/ProductForm";
import ProductAnalytics from "./pages/admin/ProductAnalytics";
import InventoryManagement from "./pages/admin/InventoryManagement";
import MediaLibrary from "./pages/admin/MediaLibrary";
import ProductTemplates from "./pages/admin/ProductTemplates";
import ImportExport from "./pages/admin/ImportExport";
import COAManagement from "./pages/admin/COAManagement";
import CartAbandonmentWrapper from "./components/CartAbandonmentWrapper";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <AdminProvider>
          <CourierProvider>
            <CourierPinProvider>
              <TooltipProvider>
            <BrowserRouter>
              <CartAbandonmentWrapper />
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/support" element={<Support />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/about" element={<About />} />
                <Route path="/become-courier" element={<BecomeCourier />} />
                <Route path="/partner-shops" element={<PartnerShops />} />
                <Route path="/track-order" element={<OrderLookup />} />
                
                {/* Public Order Tracking - New Beautiful Page */}
                <Route path="/track/:code" element={<CustomerTrackingPage />} />
                
                {/* Legacy tracking pages */}
                <Route path="/track" element={<TrackOrder />} />
                <Route path="/track-live/:code" element={<TrackOrderLive />} />
                
                {/* Courier Routes */}
                <Route path="/courier/login" element={<CourierLogin />} />
                <Route
                  path="/courier/dashboard"
                  element={
                    <ProtectedCourierRoute>
                      <CourierDashboard />
                    </ProtectedCourierRoute>
                  }
                />
                <Route
                  path="/courier/earnings"
                  element={
                    <ProtectedCourierRoute>
                      <CourierEarnings />
                    </ProtectedCourierRoute>
                  }
                />
                <Route
                  path="/courier/history"
                  element={
                    <ProtectedCourierRoute>
                      <CourierHistory />
                    </ProtectedCourierRoute>
                  }
                />
                <Route
                  path="/courier/profile"
                  element={
                    <ProtectedCourierRoute>
                      <CourierProfile />
                    </ProtectedCourierRoute>
                  }
                />

                {/* Merchant Dashboard (currently same as admin, can be customized later) */}
                <Route path="/merchant/dashboard" element={<MerchantDashboard />} />

                {/* Admin Login */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Protected User Routes */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/order-confirmation"
                  element={
                    <ProtectedRoute>
                      <OrderConfirmation />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/order-tracking"
                  element={
                    <ProtectedRoute>
                      <OrderTracking />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-orders"
                  element={
                    <ProtectedRoute>
                      <MyOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings/notifications"
                  element={
                    <ProtectedRoute>
                      <NotificationPreferences />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminProtectedRoute>
                      <AdminLayout />
                    </AdminProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="live-map" element={<AdminLiveMap />} />
                  <Route path="live-orders" element={<AdminLiveOrders />} />
                  <Route path="couriers" element={<AdminCouriers />} />
                  <Route path="couriers/:id" element={<AdminCourierDetails />} />
                  <Route path="compliance" element={<AdminCompliance />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="audit-logs" element={<AdminAuditLogs />} />
                  <Route path="age-verification" element={<AdminAgeVerification />} />
                  <Route path="courier-applications" element={<AdminCourierApplications />} />
                  <Route path="delivery-safety" element={<AdminDeliverySafety />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="products/new" element={<ProductForm />} />
                  <Route path="products/edit/:id" element={<ProductForm />} />
                  <Route path="products/analytics" element={<ProductAnalytics />} />
                  <Route path="inventory" element={<InventoryManagement />} />
                  <Route path="media" element={<MediaLibrary />} />
                  <Route path="templates" element={<ProductTemplates />} />
                  <Route path="import-export" element={<ImportExport />} />
                  <Route path="coa-management" element={<COAManagement />} />
                </Route>

                {/* 404 Page */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            </TooltipProvider>
            </CourierPinProvider>
          </CourierProvider>
        </AdminProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

/**
 * New York Minute NYC - Root Application Component
 * 
 * Built by WebFlow Studios Team (2024)
 * Lead: Sarah Chen | UI/UX: Marcus Rodriguez
 * Backend: Aisha Kumar | DevOps: James Martinez
 * 
 * Tech Stack:
 * - React 18.3 with SWC compiler
 * - TanStack Query v5 for state management
 * - React Router v6 for routing
 * - Radix UI primitives
 * - Tailwind CSS utility framework
 * 
 * Architecture Pattern: Lazy-loaded route-based code splitting
 * Error Handling: Global ErrorBoundary with analytics tracking
 * 
 * Contact: contact@webflowstudios.dev
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminProvider } from "./contexts/AdminContext";
import { CourierProvider } from "./contexts/CourierContext";
import { DeviceTracker } from "./components/DeviceTracker";
import { CourierPinProvider } from "./contexts/CourierPinContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { lazy, Suspense } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { SkipToContent } from "./components/SkipToContent";
import { LoadingFallback } from "./components/LoadingFallback";
import { LiveChatWidget } from "./components/LiveChatWidget";

import { NotificationPreferences } from "./components/NotificationPreferences";
import OfflineBanner from "./components/OfflineBanner";
import InstallPWA from "./components/InstallPWA";
import { CartBadgeAnimation } from "./components/CartBadgeAnimation";

// Eager load critical pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout"; // Eager load AdminLayout to avoid context issues

// Lazy load non-critical pages
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Support = lazy(() => import("./pages/Support"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const About = lazy(() => import("./pages/About"));
const BecomeCourier = lazy(() => import("./pages/BecomeCourier"));
const PartnerShops = lazy(() => import("./pages/PartnerShops"));
const OrderLookup = lazy(() => import("./pages/OrderLookup"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const TrackOrderLive = lazy(() => import("./pages/TrackOrderLive"));
const CustomerTrackingPage = lazy(() => import("./pages/CustomerTrackingPage"));
const CourierLogin = lazy(() => import("./pages/CourierLogin"));
const ProtectedCourierRoute = lazy(() => import("./components/ProtectedCourierRoute"));
const CourierDashboard = lazy(() => import("./pages/CourierDashboard"));
const CourierEarnings = lazy(() => import("./pages/CourierEarnings"));
const CourierHistory = lazy(() => import("./pages/CourierHistory"));
const CourierProfile = lazy(() => import("./pages/CourierProfile"));
const MerchantDashboard = lazy(() => import("./pages/MerchantDashboard"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const AdminProtectedRoute = lazy(() => import("./components/admin/AdminProtectedRoute"));
// AdminLayout is now eagerly imported above
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminLiveMap = lazy(() => import("./pages/admin/AdminLiveMap"));
const AdminLiveOrders = lazy(() => import("./pages/admin/AdminLiveOrders"));
const AdminCouriers = lazy(() => import("./pages/admin/AdminCouriers"));
const AdminCourierDetails = lazy(() => import("./pages/admin/AdminCourierDetails"));
const AdminCompliance = lazy(() => import("./pages/admin/AdminCompliance"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminUserDetails = lazy(() => import("./pages/admin/AdminUserDetails"));
const RiskFactorManagement = lazy(() => import("./pages/admin/RiskFactorManagement"));
const UserAccount = lazy(() => import("./pages/UserAccount"));
const VerifyID = lazy(() => import("./pages/VerifyID"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminAuditLogs = lazy(() => import("./pages/admin/AdminAuditLogs"));
const AdminAgeVerification = lazy(() => import("./pages/admin/AdminAgeVerification"));
const AdminCourierApplications = lazy(() => import("./pages/admin/AdminCourierApplications"));
const AdminDeliverySafety = lazy(() => import("./pages/admin/AdminDeliverySafety"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const ProductForm = lazy(() => import("./pages/admin/ProductForm"));
const ProductAnalytics = lazy(() => import("./pages/admin/ProductAnalytics"));
const InventoryManagement = lazy(() => import("./pages/admin/InventoryManagement"));
const MediaLibrary = lazy(() => import("./pages/admin/MediaLibrary"));
const ProductTemplates = lazy(() => import("./pages/admin/ProductTemplates"));
const ImportExport = lazy(() => import("./pages/admin/ImportExport"));
const COAManagement = lazy(() => import("./pages/admin/COAManagement"));
const Giveaway = lazy(() => import("./pages/Giveaway"));
const AdminGiveaway = lazy(() => import("./pages/admin/AdminGiveaway"));
const AdminGiveaways = lazy(() => import("./pages/admin/AdminGiveaways"));
const AdminGiveawayManagement = lazy(() => import("./pages/admin/AdminGiveawayManagement"));
const AdminGiveawayAnalytics = lazy(() => import("./pages/admin/AdminGiveawayAnalytics"));
const AdminGiveawayWinners = lazy(() => import("./pages/admin/AdminGiveawayWinners"));
const AdminGiveawayForm = lazy(() => import("./pages/admin/AdminGiveawayForm"));
const GiveawayRules = lazy(() => import("./pages/GiveawayRules"));
const MyGiveawayEntries = lazy(() => import("./pages/MyGiveawayEntries"));
const CouponList = lazy(() => import("./pages/admin/CouponList"));
const CouponForm = lazy(() => import("./pages/admin/CouponForm"));
const CouponEdit = lazy(() => import("./pages/admin/CouponEdit"));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications"));
const GlobalSearch = lazy(() => import("./pages/admin/GlobalSearch"));
const SystemSettings = lazy(() => import("./pages/admin/SystemSettings"));
const ButtonTester = lazy(() => import("./pages/admin/ButtonTester"));
const AdminLiveChat = lazy(() => import("./pages/admin/AdminLiveChat"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // Data stays fresh for 1 minute
      gcTime: 10 * 60 * 1000, // Garbage collection after 10 minutes
      refetchOnWindowFocus: false, // Reduce unnecessary API calls on focus
      refetchOnMount: false, // Don't refetch when component mounts if data exists
      refetchOnReconnect: true, // Refetch when internet connection is restored
      retry: 2, // Retry failed requests twice
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
  },
});


const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <DeviceTracker />
          <AdminProvider>
            <CourierProvider>
              <CourierPinProvider>
                <TooltipProvider>
                  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <SkipToContent />
                    <OfflineBanner />
                    <InstallPWA />
                    <CartBadgeAnimation />
                    
                    <Toaster />
                    <Sonner />
                    <Suspense fallback={<LoadingFallback />}>
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
                      
                      {/* Giveaway */}
                      <Route path="/giveaway/:slug" element={<Giveaway />} />
                      <Route path="/giveaway/rules" element={<GiveawayRules />} />
                      <Route path="/account/giveaway-entries" element={
                        <ProtectedRoute>
                          <MyGiveawayEntries />
                        </ProtectedRoute>
                      } />
                      
                      {/* Public Order Tracking */}
                      <Route path="/track/:code" element={<CustomerTrackingPage />} />
                      <Route path="/track" element={<TrackOrder />} />
                      <Route path="/track-live/:code" element={<TrackOrderLive />} />
                      
                      {/* Courier Routes */}
                      <Route path="/courier/login" element={<CourierLogin />} />
                      <Route path="/courier/dashboard" element={
                        <ProtectedCourierRoute><CourierDashboard /></ProtectedCourierRoute>
                      } />
                      <Route path="/courier/earnings" element={
                        <ProtectedCourierRoute><CourierEarnings /></ProtectedCourierRoute>
                      } />
                      <Route path="/courier/history" element={
                        <ProtectedCourierRoute><CourierHistory /></ProtectedCourierRoute>
                      } />
                      <Route path="/courier/profile" element={
                        <ProtectedCourierRoute><CourierProfile /></ProtectedCourierRoute>
                      } />

                      {/* Merchant Dashboard */}
                      <Route path="/merchant/dashboard" element={<MerchantDashboard />} />

                      {/* Admin Login */}
                      <Route path="/admin/login" element={<AdminLogin />} />

                      {/* Guest-accessible Routes */}
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/order-confirmation" element={<OrderConfirmation />} />
                      
                      {/* Protected User Routes */}
                      <Route path="/order-tracking" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
                      <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                      <Route path="/account" element={<ProtectedRoute><UserAccount /></ProtectedRoute>} />
                      <Route path="/verify-id" element={<ProtectedRoute><VerifyID /></ProtectedRoute>} />
                      <Route path="/settings/notifications" element={
                        <ProtectedRoute><NotificationPreferences /></ProtectedRoute>
                      } />

                      {/* Admin Routes */}
                      <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
                        <Route index element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="live-map" element={<AdminLiveMap />} />
                        <Route path="live-orders" element={<AdminLiveOrders />} />
                        <Route path="couriers" element={<AdminCouriers />} />
                        <Route path="couriers/:id" element={<AdminCourierDetails />} />
                        <Route path="compliance" element={<AdminCompliance />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="users/:id" element={<AdminUserDetails />} />
                        <Route path="risk-factors" element={<RiskFactorManagement />} />
                        <Route path="analytics" element={<AdminAnalytics />} />
                        <Route path="audit-logs" element={<AdminAuditLogs />} />
                        <Route path="age-verification" element={<AdminAgeVerification />} />
                        <Route path="courier-applications" element={<AdminCourierApplications />} />
                        <Route path="delivery-safety" element={<AdminDeliverySafety />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="products/new" element={<ProductForm />} />
                        <Route path="products/:id/edit" element={<ProductForm />} />
                        <Route path="products/:id/duplicate" element={<ProductForm />} />
                        <Route path="products/analytics" element={<ProductAnalytics />} />
                        <Route path="inventory" element={<InventoryManagement />} />
                        <Route path="media" element={<MediaLibrary />} />
                        <Route path="templates" element={<ProductTemplates />} />
                        <Route path="import-export" element={<ImportExport />} />
                        <Route path="coa-management" element={<COAManagement />} />
                <Route path="giveaway" element={<AdminGiveaway />} />
                <Route path="giveaways" element={<AdminGiveaways />} />
                <Route path="giveaways/manage" element={<Suspense fallback={<LoadingFallback />}><AdminGiveawayManagement /></Suspense>} />
                <Route path="giveaways/new" element={<AdminGiveawayForm />} />
                <Route path="giveaways/:id/edit" element={<AdminGiveawayForm />} />
                <Route path="giveaways/:id/analytics" element={<AdminGiveawayAnalytics />} />
                <Route path="giveaways/:id/winners" element={<AdminGiveawayWinners />} />
                <Route path="coupons" element={<CouponList />} />
                <Route path="coupons/create" element={<CouponForm />} />
                <Route path="coupons/:id/edit" element={<CouponEdit />} />
                <Route path="notifications" element={<AdminNotifications />} />
                <Route path="search" element={<GlobalSearch />} />
                <Route path="settings" element={<SystemSettings />} />
                <Route path="button-tester" element={<ButtonTester />} />
                <Route path="live-chat" element={<AdminLiveChat />} />
              </Route>

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </BrowserRouter>
                <LiveChatWidget />
              </TooltipProvider>
            </CourierPinProvider>
          </CourierProvider>
        </AdminProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

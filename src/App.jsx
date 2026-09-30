import { Suspense, lazy } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { Layout, ScrollToTop } from '@components/layout/Layout'
import { RequireAuth } from '@components/auth/RequireAuth'
import { ThemeProvider } from '@context/ThemeContext'
import { StoreProvider } from '@context/StoreContext'
import { AuthProvider } from '@context/AuthContext'
import { CartProvider } from '@context/CartContext'
import { ToastProvider } from '@context/ToastContext'
import { LocationProvider } from '@context/LocationContext'
import { WishlistProvider } from '@context/WishlistContext'

// Eager: the landing path and the two highest-traffic pages.
import Home from '@pages/Home'
import Events from '@pages/Events'
import EventDetail from '@pages/EventDetail'
import NotFound from '@pages/NotFound'

// Lazy: everything else splits out of the initial bundle.
const Organizers = lazy(() => import('@pages/Organizers'))
const OrganizerProfile = lazy(() => import('@pages/OrganizerProfile'))
const Checkout = lazy(() => import('@pages/Checkout'))
const OrderConfirmation = lazy(() => import('@pages/OrderConfirmation'))
const Blog = lazy(() => import('@pages/Blog'))
const BlogPost = lazy(() => import('@pages/BlogPost'))
const About = lazy(() => import('@pages/About'))
const HowItWorks = lazy(() => import('@pages/HowItWorks'))
const Pricing = lazy(() => import('@pages/Pricing'))
const Faq = lazy(() => import('@pages/Faq'))
const Contact = lazy(() => import('@pages/Contact'))
const Feedback = lazy(() => import('@pages/Feedback'))
const Privacy = lazy(() => import('@pages/Privacy'))
const Terms = lazy(() => import('@pages/Terms'))
const Maintenance = lazy(() => import('@pages/Maintenance'))

const Login = lazy(() => import('@pages/auth/Login'))
const Register = lazy(() => import('@pages/auth/Register'))
const ForgotPassword = lazy(() => import('@pages/auth/ForgotPassword'))
const AdminLogin = lazy(() => import('@pages/admin/AdminLogin'))

// Attendee Portal (eagerly loaded for instant 0ms portal navigation)
import DashboardLayout from '@pages/dashboard/DashboardLayout'
import DashboardOverview from '@pages/dashboard/Overview'
import MyTickets from '@pages/dashboard/MyTickets'
import SavedEvents from '@pages/dashboard/SavedEvents'
import Notifications from '@pages/dashboard/Notifications'
import Profile from '@pages/dashboard/Profile'
import DashboardSettings from '@pages/dashboard/Settings'

// Organizer Portal (eagerly loaded for instant 0ms portal navigation)
import OrganizerLayout from '@pages/organizer/OrganizerLayout'
import OrganizerOverview from '@pages/organizer/Overview'
import MyEvents from '@pages/organizer/MyEvents'
import CreateEvent from '@pages/organizer/CreateEvent'
import Orders from '@pages/organizer/Orders'
import Coupons from '@pages/organizer/Coupons'
import Guests from '@pages/organizer/Guests'
import Scanner from '@pages/organizer/Scanner'

// Admin Portal (eagerly loaded for instant 0ms portal navigation)
import AdminLayout from '@pages/admin/AdminLayout'
import AdminOverview from '@pages/admin/Overview'
import AdminOrganizers from '@pages/admin/Organizers'
import AdminEvents from '@pages/admin/EventsManagement'
import AdminUsers from '@pages/admin/UsersManagement'
import AdminOrders from '@pages/admin/OrdersManagement'
import AdminCms from '@pages/admin/LandingPageCms'

function RouteFallback() {
  return (
    <div className="grid min-h-[60vh] place-items-center" role="status" aria-label="Loading page">
      <div className="size-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <LocationProvider>
          <WishlistProvider>
            <StoreProvider>
              <AuthProvider>
                <CartProvider>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  {/* Full-screen routes and dedicated portals render outside the marketing Layout */}
                  <Route element={<ScrollToTopWrapper />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/maintenance" element={<Maintenance />} />
                    <Route path="/admin/login" element={<AdminLogin />} />

                    {/* Attendee dashboard */}
                    <Route element={<RequireAuth />}>
                      <Route path="/dashboard" element={<DashboardLayout />}>
                        <Route index element={<DashboardOverview />} />
                        <Route path="tickets" element={<MyTickets />} />
                        <Route path="saved" element={<SavedEvents />} />
                        <Route path="wallet" element={<Navigate to="/dashboard" replace />} />
                        <Route path="notifications" element={<Notifications />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="settings" element={<DashboardSettings />} />
                      </Route>
                    </Route>

                    {/* Organizer panel */}
                    <Route element={<RequireAuth role="organizer" />}>
                      <Route path="/organizer" element={<OrganizerLayout />}>
                        <Route index element={<OrganizerOverview />} />
                        <Route path="events" element={<MyEvents />} />
                        <Route path="events/new" element={<CreateEvent />} />
                        <Route path="orders" element={<Orders />} />
                        <Route path="coupons" element={<Coupons />} />
                        <Route path="guests" element={<Guests />} />
                        <Route path="scanner" element={<Scanner />} />
                      </Route>
                    </Route>

                    {/* Admin Console & CMS Command Center */}
                    <Route element={<RequireAuth role="admin" />}>
                      <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminOverview />} />
                        <Route path="organizers" element={<AdminOrganizers />} />
                        <Route path="events" element={<AdminEvents />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="cms" element={<AdminCms />} />
                      </Route>
                    </Route>
                  </Route>

                  <Route element={<Layout />}>
                    <Route index element={<Home />} />

                    {/* Events */}
                    <Route path="events" element={<Events />} />
                    <Route path="events/:slug" element={<EventDetail />} />

                    {/* Organizers */}
                    <Route path="organizers" element={<Organizers />} />
                    <Route path="organizers/:organizerId" element={<OrganizerProfile />} />

                    {/* Booking */}
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="order/:orderId" element={<OrderConfirmation />} />

                    {/* Content */}
                    <Route path="blog" element={<Blog />} />
                    <Route path="blog/:slug" element={<BlogPost />} />
                    <Route path="about" element={<About />} />
                    <Route path="how-it-works" element={<HowItWorks />} />
                    <Route path="pricing" element={<Pricing />} />
                    <Route path="faq" element={<Faq />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="feedback" element={<Feedback />} />
                    <Route path="privacy" element={<Privacy />} />
                    <Route path="terms" element={<Terms />} />

                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </Suspense>
              </CartProvider>
            </AuthProvider>
          </StoreProvider>
        </WishlistProvider>
      </LocationProvider>
    </ToastProvider>
    </ThemeProvider>
  )
}

/** Chrome-less routes (auth, maintenance) still need scroll restoration. */
function ScrollToTopWrapper() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  )
}

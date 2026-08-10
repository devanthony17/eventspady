import { Suspense, lazy } from 'react'
import { Outlet, Route, Routes } from 'react-router-dom'
import { Layout, ScrollToTop } from '@components/layout/Layout'
import { RequireAuth } from '@components/auth/RequireAuth'
import { ThemeProvider } from '@context/ThemeContext'
import { AuthProvider } from '@context/AuthContext'
import { CartProvider } from '@context/CartContext'
import { ToastProvider } from '@context/ToastContext'

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

const DashboardLayout = lazy(() => import('@pages/dashboard/DashboardLayout'))
const DashboardOverview = lazy(() => import('@pages/dashboard/Overview'))
const MyTickets = lazy(() => import('@pages/dashboard/MyTickets'))
const SavedEvents = lazy(() => import('@pages/dashboard/SavedEvents'))
const WalletPage = lazy(() => import('@pages/dashboard/WalletPage'))
const Notifications = lazy(() => import('@pages/dashboard/Notifications'))
const Profile = lazy(() => import('@pages/dashboard/Profile'))
const DashboardSettings = lazy(() => import('@pages/dashboard/Settings'))

const OrganizerLayout = lazy(() => import('@pages/organizer/OrganizerLayout'))
const OrganizerOverview = lazy(() => import('@pages/organizer/Overview'))
const MyEvents = lazy(() => import('@pages/organizer/MyEvents'))
const CreateEvent = lazy(() => import('@pages/organizer/CreateEvent'))
const Orders = lazy(() => import('@pages/organizer/Orders'))
const Coupons = lazy(() => import('@pages/organizer/Coupons'))
const Guests = lazy(() => import('@pages/organizer/Guests'))
const Scanner = lazy(() => import('@pages/organizer/Scanner'))

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
        <AuthProvider>
          <CartProvider>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                {/* Full-screen routes render outside the site chrome */}
                <Route element={<ScrollToTopWrapper />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/maintenance" element={<Maintenance />} />
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

                  {/* Attendee dashboard */}
                  <Route element={<RequireAuth />}>
                    <Route path="dashboard" element={<DashboardLayout />}>
                      <Route index element={<DashboardOverview />} />
                      <Route path="tickets" element={<MyTickets />} />
                      <Route path="saved" element={<SavedEvents />} />
                      <Route path="wallet" element={<WalletPage />} />
                      <Route path="notifications" element={<Notifications />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="settings" element={<DashboardSettings />} />
                    </Route>
                  </Route>

                  {/* Organizer panel */}
                  <Route element={<RequireAuth />}>
                    <Route path="organizer" element={<OrganizerLayout />}>
                      <Route index element={<OrganizerOverview />} />
                      <Route path="events" element={<MyEvents />} />
                      <Route path="events/new" element={<CreateEvent />} />
                      <Route path="orders" element={<Orders />} />
                      <Route path="coupons" element={<Coupons />} />
                      <Route path="guests" element={<Guests />} />
                      <Route path="scanner" element={<Scanner />} />
                    </Route>
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
          </CartProvider>
        </AuthProvider>
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

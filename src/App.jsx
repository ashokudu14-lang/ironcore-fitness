import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Outlet,
  Navigate,
  Route,
} from "react-router-dom";
import RouteBehavior from "./app/RouteBehavior.jsx";
import MarketingLayout from "./components/marketing/MarketingLayout.jsx";
const AppShell = lazy(() => import("./components/app/AppShell.jsx"));
const ProtectedRoute = lazy(() => import("./app/ProtectedRoute.jsx"));
const GymGate = lazy(() => import("./app/GymGate.jsx"));
const HomePage = lazy(() => import("./pages/public/HomePage.jsx"));
const PricingPage = lazy(() => import("./pages/public/PricingPage.jsx"));
const PrivacyPage = lazy(() => import("./pages/public/PrivacyPage.jsx"));
const TermsPage = lazy(() => import("./pages/public/TermsPage.jsx"));
const AuthPage = lazy(() => import("./pages/auth/AuthPage.jsx"));
const OnboardingPage = lazy(() => import("./pages/auth/OnboardingPage.jsx"));
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage.jsx"));
const MembersPage = lazy(() => import("./pages/dashboard/MembersPage.jsx"));
const PaymentsPage = lazy(() => import("./pages/dashboard/PaymentsPage.jsx"));
const RenewalsPage = lazy(() => import("./pages/dashboard/RenewalsPage.jsx"));
const SettingsPage = lazy(() => import("./pages/dashboard/SettingsPage.jsx"));

function RootLayout() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Suspense
        fallback={
          <div className="route-loading" role="status">
            Loading workspace…
          </div>
        }
      >
        <Outlet />
        <RouteBehavior />
      </Suspense>
    </>
  );
}
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}>
      <Route element={<MarketingLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
      </Route>

      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/signup" element={<AuthPage mode="signup" />} />

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <GymGate>
              <AppShell />
            </GymGate>
          </ProtectedRoute>
        }
      >
        <Route path="/app" element={<DashboardPage />} />
        <Route path="/app/members" element={<MembersPage />} />
        <Route path="/app/payments" element={<PaymentsPage />} />
        <Route path="/app/renewals" element={<RenewalsPage />} />
        <Route path="/app/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>,
  ),
);
export default function App() {
  return <RouterProvider router={router} />;
}

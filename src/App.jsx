import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import MarketingLayout from "./components/marketing/MarketingLayout.jsx";
import AppShell from "./components/app/AppShell.jsx";
import ProtectedRoute from "./app/ProtectedRoute.jsx";
import GymGate from "./app/GymGate.jsx";
import HomePage from "./pages/public/HomePage.jsx";
import PricingPage from "./pages/public/PricingPage.jsx";
import PrivacyPage from "./pages/public/PrivacyPage.jsx";
import TermsPage from "./pages/public/TermsPage.jsx";
import AuthPage from "./pages/auth/AuthPage.jsx";
import OnboardingPage from "./pages/auth/OnboardingPage.jsx";
import DashboardPage from "./pages/dashboard/DashboardPage.jsx";
import MembersPage from "./pages/dashboard/MembersPage.jsx";
import PaymentsPage from "./pages/dashboard/PaymentsPage.jsx";
import RenewalsPage from "./pages/dashboard/RenewalsPage.jsx";
import EmptyModulePage from "./pages/dashboard/EmptyModulePage.jsx";

function App() {
  return (
    <BrowserRouter>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <Routes>
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
          <Route
            path="/app/settings"
            element={
              <EmptyModulePage
                title="Settings"
                description="Gym details, plans, currency, timezone, and team access will be managed here."
                actionLabel="Edit gym settings"
              />
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

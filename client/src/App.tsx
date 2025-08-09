import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import ErrorBoundary from "@/components/error-boundary";
import MainLayout from "@/components/layout/main-layout";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Admin from "@/pages/admin";
import AdminPayment from "@/pages/admin-payment";
import AdminMonthlyPackages from "@/pages/admin-monthly-packages";
import Account from "@/pages/account";
import Contact from "@/pages/contact";
import Payment from "@/pages/payment";
import PaymentNew from "@/pages/payment-new";
import CallsPage from "@/pages/calls";
import AccountNew from "@/pages/account-new";

import NotFound from "@/pages/not-found";

function Router() {
  const { user, isLoading, token } = useAuth();

  // DISABLED: Remove domain-specific behavior for preview-deploy parity
  // This ensures identical behavior regardless of domain
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pro-bg">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-400 border-t-transparent mx-auto"></div>
          <div className="space-y-2">
            <p className="text-glow-purple font-semibold">BombCall</p>
            <p className="text-slate-400 text-sm">Đang khởi tạo hệ thống...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {user ? (
        <MainLayout user={user}>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/calls" component={CallsPage} />
            <Route path="/admin" component={user?.role === 'admin' ? Admin : Dashboard} />
            <Route path="/admin/payment" component={user?.role === 'admin' ? AdminPayment : Dashboard} />
            <Route path="/admin/packages" component={user?.role === 'admin' ? AdminMonthlyPackages : Dashboard} />
            <Route path="/account" component={AccountNew} />
            <Route path="/contact" component={Contact} />
            <Route path="/payment" component={user.role === 'admin' ? AdminPayment : PaymentNew} />
            <Route component={NotFound} />
          </Switch>
        </MainLayout>
      ) : (
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/contact" component={Contact} />
          <Route component={Landing} />
        </Switch>
      )}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="dark min-h-screen pro-bg text-slate-100">
            <Toaster />
            <ErrorBoundary>
              <Router />
            </ErrorBoundary>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

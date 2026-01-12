
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoginPage from './components/LoginPage';
import Layout from './components/Layout';
import { Settings, Sparkles, Loader2 } from 'lucide-react';
import { FilterProvider } from './contexts/FilterContext';
import Portfolio from './pages/portfolio';
import OrderBook from './pages/orderbook';

const queryClient = new QueryClient();

// Coming Soon component for new routes
const ComingSoon = () => (
  <div className="flex items-center justify-center h-full min-h-[60vh]">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
        <Sparkles className="h-8 w-8 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
      <p className="text-gray-600 max-w-md">
        This page is under development and will be available shortly.
      </p>
    </div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();

  const authCode = searchParams.get('authCode');
  const userId = searchParams.get('userId');

  // If we are currently loading or have auth params (meaning login is in progress), 
  // show nothing or a loader instead of redirecting
  if (isLoading || (authCode && userId && !isAuthenticated)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Authenticating your session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <Layout>{children}</Layout>;
};

// Add role-based redirection logic
const getDefaultRoute = (role: string | undefined) => {
  switch (role) {
    case 'banking':
      return '/segregation';
    default:
      return '/portfolio';
  }
};

const AppContent = () => {
  const { isAuthenticated, user } = useAuth(); // Add user to destructuring

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ?
            <Navigate to={getDefaultRoute(user?.role)} /> :
            <LoginPage />
        }
      />
      <Route
        path="/downloads"
        element={
          <ProtectedRoute>
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-slate-700">Downloads</h2>
              <p className="text-slate-500 mt-2">Downloads section coming soon...</p>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/portfolio"
        element={
          <ProtectedRoute>
            <Portfolio />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orderbook"
        element={
          <ProtectedRoute>
            <OrderBook />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to={isAuthenticated ? getDefaultRoute(user?.role) : "/login"} />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <FilterProvider>
            <Toaster />
            <Sonner />
            <AppContent />
          </FilterProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

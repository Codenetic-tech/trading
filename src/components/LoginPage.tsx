import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

const LoginPage = () => {
  const { login, isLoading: authLoading } = useAuth();
  const [isProcessing] = useState(false);

  const handleLoginClick = () => {
    login();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden flex items-center justify-center">
      {/* Animated Dot Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.15)_1px,transparent_0)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_40%,transparent_100%)]" />

      {/* Main Card Container */}
      <div className="relative z-10 w-full max-w-lg mx-4">
        <Card className="bg-white/80 backdrop-blur-2xl border-0 shadow-2xl shadow-blue-500/10">
          <CardHeader className="text-center pt-8 pb-4">
            <div className="mx-auto mb-6">
              <img
                src="/expanded-logo.png"
                alt="GoPocket Logo"
                className="w-40 h-40 object-contain mx-auto"
              />
            </div>

            <CardTitle className="text-3xl font-bold mb-2">
              <span className="text-gray-900">Welcome to GoPocket</span>
            </CardTitle>

            <CardDescription className="text-gray-600 text-lg font-medium">
              Securely sign in to your <span className="text-blue-600 font-semibold">Individual Trader Dashboard</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-10">
            <div className="space-y-6">
              <p className="text-center text-gray-500 text-sm">
                Login with your GoPocket credentials to access your personalized trading reports and insights.
              </p>

              <Button
                onClick={handleLoginClick}
                disabled={isProcessing || authLoading}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 group relative overflow-hidden shadow-lg shadow-blue-500/20"
              >
                {isProcessing || authLoading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Login with GoPocket
                    <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 text-emerald-600">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold text-gray-900">Secure</div>
                    <div className="text-gray-500">SSO Protected</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold text-gray-900">Fast</div>
                    <div className="text-gray-500">Direct Access</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-xs text-gray-400 font-medium tracking-wide flex items-center gap-2">
          <span>&copy; 2026 GOPOCKET</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full" />
          <span>SAFE & SECURE TRADING</span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
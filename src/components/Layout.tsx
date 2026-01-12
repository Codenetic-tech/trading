// Layout.tsx
import React, { useState, useMemo } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useLocation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import Header from './Header';
import { Menu, X, Home, Users, BarChart3, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import TradingAppHeader from './TradingAppHeader';
import Breadcrumb from './Breadcrumb';

// Define types for hierarchy
interface HierarchyNode {
  first_name: string;
  email: string;
  reports_to: string;
  branch: string;
  username: string;
  hierarchy_level: number;
}

interface TreeDataNode {
  label: string;
  value: string;
  children?: TreeDataNode[];
}

interface LayoutProps {
  children: React.ReactNode;
}

// Inner component that uses the filter context
const LayoutContent: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isUpdatesPage = location.pathname === '/updates';
  const isProfilePage = location.pathname === '/profile';
  const isConnectPage = location.pathname === '/connect';
  const isLeadDetailsPage = location.pathname.startsWith('/crm/leads/') && location.pathname.split('/').length === 4;
  const { logout } = useAuth();
  const { user } = useAuth();


  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  // Mobile Navigation Items
  const mobileNavItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Users, label: 'Clients', href: '/' },
    {
      icon: LogOut,
      label: 'Logout',
      onClick: handleLogout,
      className: 'text-red-600 hover:text-red-700'
    },
  ];

  return (
    <div className="h-screen flex w-full bg-blue-50 overflow-hidden">

      <div className="flex-1 flex flex-col w-full h-full overflow-hidden">
        {/* Mobile Slide-out Menu */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-out Menu */}
            <div className="lg:hidden fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <nav className="p-4 space-y-2">
                {mobileNavItems.map((item) => {
                  if (item.onClick) {
                    return (
                      <button
                        key={item.label}
                        onClick={() => {
                          item.onClick?.();
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors w-full text-left ${item.className || ''}`}
                      >
                        <item.icon size={20} className={item.className?.includes('red') ? 'text-red-600' : 'text-gray-600'} />
                        <span className={item.className?.includes('red') ? 'text-red-600 font-medium' : 'text-gray-900 font-medium'}>{item.label}</span>
                      </button>
                    );
                  }

                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon size={20} className="text-gray-600" />
                      <span className="text-gray-900 font-medium">{item.label}</span>
                    </a>
                  );
                })}
              </nav>
            </div>
          </>
        )}


        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {(location.pathname === '/portfolio' || location.pathname === '/orderbook') && (
            <div className="flex-col pt-4 px-6 w-full">
              <TradingAppHeader />
              <div className="w-full">
                <Breadcrumb />
              </div>
            </div>
          )}

          <ScrollArea className="flex-1 w-full">
            <main
              className={`min-h-full
              ${isProfilePage || isConnectPage || isLeadDetailsPage || isUpdatesPage
                  ? 'p-0'
                  : (location.pathname === '/portfolio' || location.pathname === '/orderbook')
                    ? 'px-6 pb-16'
                    : 'p-0.5 lg:pl-6 lg:pr-6 lg:pt-6 pb-16'}
            `}
            >
              {children}
            </main>
          </ScrollArea>
        </div>


        {/* Mobile Bottom Navigation - Compact and Fixed */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 shadow-lg">
          <nav className="flex items-center justify-around px-1 py-1.5">
            {mobileNavItems.map((item) => {
              if (item.onClick) {
                return (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors min-w-0 flex-1 ${item.className || ''}`}
                  >
                    <item.icon
                      size={18}
                      className={item.className?.includes('red') ? 'text-red-600' : 'text-gray-600'}
                    />
                    <span className={`text-[10px] truncate ${item.className?.includes('red') ? 'text-red-600' : 'text-gray-600'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              }

              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors min-w-0 flex-1"
                >
                  <item.icon size={18} className="text-gray-600" />
                  <span className="text-[10px] text-gray-600 truncate">{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

// Main Layout component with providers
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <SidebarProvider defaultOpen={true}>

      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
};

export default Layout;
// AppSidebar.tsx
import React, { useState, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  // ... existing imports
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Sunrise,
  FileSpreadsheet,
  TrendingUp,
  Clock,
  CheckSquare,
  Settings,
  Shield,
  IndianRupee,
  LogOut,
  User,
  ChevronLeft,
  Wifi,
  Building2,
  Sparkles,
  User2,
  Ticket,
  AlarmClockCheck,
  ShieldCheck,
  Megaphone,
  MegaphoneIcon,
  Drum,
  MessageSquareDot,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useHRMS } from '@/contexts/HRMSContext';

// Define all possible menu items - removed subitems
// Define all possible menu items
const allMenuItems = [
  {
    title: 'Branch Data',
    url: '/management',
    icon: Building2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    roles: ['Risk Manager', 'Analyst']
  },
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    roles: ['Risk Manager']
  },
  {
    title: 'GlobeFund',
    url: '/globe',
    icon: Wifi,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    roles: ['Risk Manager']
  },
  {
    title: 'Morning BOD',
    url: '/morning-bod',
    icon: Sunrise,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    roles: ['Risk Manager'],
    subItems: [
      {
        title: 'NSE CM',
        url: '/morning-bod/nse-cm',
        roles: ['Risk Manager'],
        icon: Building2,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50'
      },
      {
        title: 'NSE F&O',
        url: '/morning-bod/nse-fo',
        roles: ['Risk Manager'],
        icon: TrendingUp,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50'
      },
      {
        title: 'NSE CD',
        url: '/morning-bod/nse-cd',
        roles: ['Risk Manager'],
        icon: IndianRupee,
        color: 'text-green-500',
        bgColor: 'bg-green-50'
      },
      {
        title: 'MCX',
        url: '/morning-bod/mcx',
        roles: ['Risk Manager'],
        icon: Sparkles, // Using Sparkles as a premium/gem-like icon for MCX
        color: 'text-amber-500',
        bgColor: 'bg-amber-50'
      },
    ]
  },
  {
    title: 'Morning Intersegment',
    url: '/morning-intersegment',
    icon: Clock,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    roles: ['Risk Manager']
  },
  {
    title: 'Reports',
    url: '/reports',
    icon: FileSpreadsheet,
    color: 'text-rose-500',
    bgColor: 'bg-rose-50',
    roles: ['Risk Manager']
  },
  {
    title: 'Brokerage',
    url: '/brokerage',
    icon: TrendingUp,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    roles: ['Risk Manager']
  },
  {
    title: 'Evening Intersegment',
    url: '/evening-intersegment',
    icon: Clock,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    roles: ['Risk Manager']
  },
  {
    title: 'Allocation Check',
    url: '/allocation-check',
    icon: CheckSquare,
    color: 'text-teal-500',
    bgColor: 'bg-teal-50',
    roles: ['Risk Manager']
  },
  {
    title: 'Payout',
    url: '/payout',
    icon: IndianRupee,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    roles: ['Risk Manager', 'banking']
  },
  {
    title: 'Margin Check',
    url: '/margincheck',
    icon: ShieldAlert,
    color: 'text-slate-500',
    bgColor: 'bg-slate-50',
    roles: ['Risk Manager']
  },
  {
    title: 'Segregation',
    url: '/segregation',
    icon: CheckSquare,
    color: 'text-teal-500',
    bgColor: 'bg-teal-50',
    roles: ['Risk Manager', 'banking']
  },
];

const apps = [
  {
    id: 'RMS',
    name: 'RMS App',
    icon: Building2,
    color: 'text-blue-600',
    gradient: 'from-blue-600 to-indigo-700',
    items: ['Dashboard', 'Branch Data', 'GlobeFund', 'Morning BOD', 'Morning Intersegment', 'Reports', 'Brokerage', 'Evening Intersegment', 'Allocation Check', 'Payout', 'Margin Check', 'Segregation'],
    url: '/dashboard'
  },
];

const commonItems = ['Announcement', 'Connect', 'Updates', 'Profile'];


export function AppSidebar() {
  const { hrmsData } = useHRMS();
  const { state, toggleSidebar, setOpen } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { user, logout } = useAuth();
  const [activeAppId, setActiveAppId] = useState('RMS');

  const handleAppChange = (appId: string, url: string) => {
    setActiveAppId(appId);
    navigate(url);
  };

  const activeApp = useMemo(() => apps.find(a => a.id === activeAppId) || apps[0], [activeAppId]);



  const isActive = (path: string) => currentPath === path;
  const isCollapsed = state === 'collapsed' || state === undefined;

  // Filter menu items based on user role
  const menuItems = useMemo(() => {
    if (!user) return [];

    return allMenuItems.filter(item => {
      // Step 1: Role check
      const hasRole = ['admin', 'superadmin', 'hr'].includes(user.role) || item.roles.includes(user.role);
      if (!hasRole) return false;

      // Step 2: App/Common check
      return activeApp.items.includes(item.title) || commonItems.includes(item.title);
    });
  }, [user, activeApp]);

  if (!user) return null;


  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <div className="relative">
      <Sidebar
        className="transition-all duration-300 ease-in-out bg-white shadow-none"
        collapsible="icon"
      >
        <SidebarHeader className="h-16 border-b border-slate-200/60 flex items-center justify-center p-0 px-2">
          <SidebarMenu className={isCollapsed ? "pl-4" : "pl-2"}>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground transition-all duration-300 h-12"
                  >
                    <div className={`flex aspect-square size-10 items-center justify-center rounded-lg bg-gradient-to-br ${activeApp.gradient} text-white shadow-md`}>
                      <activeApp.icon className={isCollapsed ? "mr-2 size-5" : "size-5"} />
                    </div>
                    {!isCollapsed && (
                      <>
                        <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                          <span className="truncate font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent text-lg">{activeApp.name}</span>
                          <span className="truncate text-[10px] text-slate-500 font-medium">Switch App</span>
                        </div>
                        <ChevronDown className="ml-auto size-4 text-slate-400" />
                      </>
                    )}
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl shadow-xl border-slate-200/60 p-2"
                  align="start"
                  side="bottom"
                  sideOffset={8}
                >
                  <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Switch Application
                  </div>
                  {apps.filter(app => app.id !== activeAppId).map((app) => (
                    <DropdownMenuItem
                      key={app.id}
                      onClick={() => handleAppChange(app.id, app.url)}
                      className="gap-3 p-2.5 rounded-lg focus:bg-slate-50 focus:text-slate-900 transition-colors cursor-pointer"
                    >
                      <div className={`flex size-8 items-center justify-center rounded-lg bg-gradient-to-br ${app.gradient} text-white shadow-sm`}>
                        <app.icon className="size-5 shrink-0" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{app.name}</span>
                        <span className="text-[10px] text-slate-400 leading-none">
                          Switch to {app.name}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="bg-transparent">
          {/* Enhanced Navigation Menu - Centered icons in collapsed view */}
          <SidebarGroup className={`transition-all duration-300 ${isCollapsed ? 'px-0 py-4 mt-0' : 'px-3 py-5 mt-0'
            }`}>
            <SidebarGroupContent className="mt-2">
              <SidebarMenu className={`space-y-2 ${isCollapsed ? 'flex flex-col items-center w-full' : ''}`}>
                {menuItems.map((item) => {
                  const isItemActive = isActive(item.url);

                  if (item.subItems && item.subItems.length > 0) {
                    return (
                      <Collapsible
                        key={item.title}
                        asChild
                        defaultOpen={isActive(item.url) || item.subItems.some(sub => isActive(sub.url))}
                        className="group/collapsible"
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              tooltip={item.title}
                              className={isCollapsed ? 'w-auto' : ''}
                              onClick={(e) => {
                                if (isCollapsed) {
                                  e.preventDefault();
                                  setOpen(true);
                                }
                              }}
                            >
                              <div className={`group relative transition-all duration-200 w-full flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className={`flex items-center transition-all duration-200 w-full ${isCollapsed ? 'justify-center p-0' : 'space-x-3 py-3'
                                  } rounded-xl relative z-10`}>
                                  <div className={` ${isCollapsed ? 'p-2' : 'p-2 rounded-lg'
                                    } ${isActive(item.url) || item.subItems.some(sub => isActive(sub.url))
                                      ? 'bg-blue-500/20'
                                      : item.bgColor
                                    }`}>
                                    {item.icon && <item.icon
                                      className={`flex-shrink-0 transition-all duration-200 ${isCollapsed ? 'h-5 w-5' : 'h-5 w-5'} 
                                      ${isActive(item.url) || item.subItems.some(sub => isActive(sub.url)) ? 'text-blue-600' : item.color}`}
                                    />}
                                  </div>
                                  {!isCollapsed && (
                                    <div className="flex-1 min-w-0 transition-all duration-300 flex items-center justify-between">
                                      <span className="text-sm font-semibold truncate">{item.title}</span>
                                      <ChevronRight className="h-4 w-4 text-slate-400 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub className="ml-6 border-l border-slate-200 pl-2 my-1">
                              {item.subItems.map((subItem) => {
                                const isSubActive = isActive(subItem.url);
                                return (
                                  <SidebarMenuSubItem key={subItem.title}>
                                    <SidebarMenuSubButton asChild isActive={isSubActive} className="h-auto">
                                      <NavLink to={subItem.url} className={`${isCollapsed ? 'justify-center' : ''} w-full`}>
                                        <div className={`group relative transition-all duration-200 w-full flex items-center`}>
                                          <div className={`flex items-center transition-all duration-200 w-full ${isCollapsed ? 'justify-center p-0' : 'space-x-2 py-1.5 px-2'} rounded-xl relative z-10`}>
                                            <div className={`p-1.5 rounded-md ${isSubActive ? 'bg-blue-500/20' : subItem.bgColor}`}>
                                              {subItem.icon && <subItem.icon className={`h-3.5 w-3.5 ${isSubActive ? 'text-blue-600' : subItem.color}`} />}
                                            </div>
                                            {!isCollapsed && (
                                              <span className={`text-sm font-medium truncate ${isSubActive ? 'text-blue-700' : 'text-slate-600'}`}>{subItem.title}</span>
                                            )}
                                          </div>
                                        </div>
                                      </NavLink>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                )
                              })}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    )
                  }

                  return (
                    <SidebarMenuItem key={item.title} className={isCollapsed ? 'w-full flex justify-center' : ''}>
                      <SidebarMenuButton
                        asChild
                        tooltip={isCollapsed ? item.title : undefined}
                        className={isCollapsed ? 'w-auto' : ''}
                      >
                        <NavLink
                          to={item.url}
                          className={`group relative transition-all duration-200 ${isItemActive
                            ? "text-blue-700 font-semibold"
                            : ""
                            } ${isCollapsed ? '' : ''} ${isItemActive
                              ? ''
                              : ''
                            }  ${isCollapsed ? 'w-14 h-14 flex items-center justify-center' : ''}`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className={`flex items-center transition-all duration-200 ${isCollapsed ? 'justify-center' : 'space-x-3 py-3'
                            } rounded-xl relative z-10`}>
                            <div className={` ${isCollapsed ? 'p-2' : 'p-2 rounded-lg'
                              } ${isItemActive
                                ? 'bg-blue-500/20'
                                : item.bgColor
                              }`}>
                              <item.icon
                                className={`flex-shrink-0 transition-all duration-200 ${isCollapsed ? 'h-5 w-5' : 'h-5 w-5'
                                  } ${isItemActive ? 'text-blue-600' : item.color}`}
                              />
                            </div>
                            {!isCollapsed && (
                              <div className="flex-1 min-w-0 transition-all duration-300">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold truncate">{item.title}</span>
                                  {isItemActive && (
                                    <div className="text-blue-600"></div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          {/* Enhanced User Profile & Logout Section - Centered in collapsed view */}
          <div className={`transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-4'
            } border-t border-slate-200/60 bg-white`}>
            {user && (
              <div className={`transition-all duration-300`}>
                {!isCollapsed ? (
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/60 transition-all duration-300">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                        <Avatar>
                          <AvatarImage src="/go.png" />
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{user?.id}</p>
                        <p className="text-xs text-slate-500 font-medium">Admin</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 hover:bg-red-50 rounded-lg transition-all duration-200 group border border-transparent hover:border-red-200"
                      title="Logout"
                    >
                      <LogOut className="h-4 w-4 text-slate-500 group-hover:text-red-600 transition-colors duration-200" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <div>
                      <Avatar>
                        <AvatarImage src="/go.png" />
                      </Avatar>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-9 h-9 flex items-center justify-center hover:bg-red-50 rounded-lg transition-all duration-200 group border border-transparent hover:border-red-200"
                      title="Logout"
                    >
                      <LogOut className="h-4 w-4 text-slate-500 group-hover:text-red-600 transition-colors duration-200" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Enhanced Modern Collapse Toggle Button - Fixed Position */}
      {/*  <button
        onClick={toggleSidebar}
        className={`
          fixed top-20 z-50 
          flex items-center justify-center
          w-7 h-7
          bg-gradient-to-br from-blue-500 to-indigo-600
          hover:from-blue-600 hover:to-indigo-700
          rounded-full
          shadow-lg hover:shadow-xl
          transition-all duration-300 ease-in-out
          hover:scale-110
          group
          border-2 border-white
        `}
        style={{ left: isCollapsed ? '65px' : '242px' }}
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronLeft 
          className={`
            h-3 w-3 
            text-white
            transition-all duration-300 ease-in-out
            ${isCollapsed ? 'rotate-180' : 'rotate-0'}
          `}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button> */}
    </div>
  );
}
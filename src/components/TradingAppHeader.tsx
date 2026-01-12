import React from 'react';
import {
    Bell, User, ChevronRight, Settings, LogOut
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

const TradingAppHeader: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        toast({
            title: "Logged Out",
            description: "You have been successfully logged out.",
        });
    };

    return (
        <header className="flex items-center justify-center mb-8 relative z-50 pt-4">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-white/20 px-2 py-1 flex items-center gap-2">
                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuLink
                                className={cn(
                                    navigationMenuTriggerStyle(),
                                    window.location.pathname === '/portfolio' && "bg-white font-semibold text-blue-600 shadow-sm rounded-xl px-6"
                                )}
                                asChild
                            >
                                <Link to="/portfolio">Dashboard</Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <NavigationMenuLink
                                className={cn(
                                    navigationMenuTriggerStyle(),
                                    window.location.pathname === '/orderbook' && "bg-white font-semibold text-blue-600 shadow-sm rounded-xl px-6"
                                )}
                                asChild
                            >
                                <Link to="/orderbook">Order Book</Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                                <Link to="#">Position Book</Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <NavigationMenuTrigger className="gap-2">
                                <User className="w-4 h-4 text-blue-500" />
                                <span>My Details</span>
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid w-[200px] gap-3 p-4">
                                    <li className="p-2 hover:bg-slate-100 rounded-md cursor-pointer transition-colors">
                                        <div className="text-sm font-medium">National Stock Exchange</div>
                                        <p className="text-xs text-slate-500">Live trading for NSE segments</p>
                                    </li>
                                    <li className="p-2 hover:bg-slate-100 rounded-md cursor-pointer transition-colors">
                                        <div className="text-sm font-medium">Bombay Stock Exchange</div>
                                        <p className="text-xs text-slate-500">Global market access via BSE</p>
                                    </li>
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>

                <div className="flex items-center space-x-4 pl-4 ml-2 border-l border-slate-200/60">
                    <button className="p-2 hover:bg-slate-100 rounded-xl transition-all relative group">
                        <Bell className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-3 p-1 pl-1 pr-3 hover:bg-slate-100 rounded-xl transition-all border border-transparent hover:border-slate-200">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                                    <Avatar className="h-full w-full rounded-none">
                                        <AvatarImage src="/go.png" />
                                    </Avatar>
                                </div>
                                <div className="hidden md:block text-left">
                                    <div className="text-sm font-bold text-slate-900 truncate max-w-[100px]">
                                        {user?.userId || 'Admin User'}
                                    </div>
                                </div>
                                <ChevronRight className="w-3 h-3 text-slate-400" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-40 rounded-xl">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate('/profile')}>
                                <User className="mr-2 h-4 w-4" />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                                <LogOut className="mr-2 h-4 w-4" />
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};

export default TradingAppHeader;

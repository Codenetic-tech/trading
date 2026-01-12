// Header.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, User, LogOut, Settings, Bell, AlarmClockCheck, Ticket, TicketIcon, AlarmClockCheckIcon, Sparkle, PanelLeft } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from "react-router-dom";
import { useHRMS } from '@/contexts/HRMSContext';
import { DateRangePicker } from 'rsuite';
import 'rsuite/DateRangePicker/styles/index.css';
import { useFilter } from '@/contexts/FilterContext';

interface User {
  avatar?: string;
}



const Header: React.FC = () => {
  const { hrmsData, isLoading: hrmsLoading, fetchHRMSData } = useHRMS();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');

  const {
    dateRange,
    setDateRange
  } = useFilter();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  // Handle date range change
  const handleDateChange = (value: [Date, Date] | null) => {
    if (value) {
      const [start, end] = value;

      // Format date to avoid timezone issues
      const formatDateForState = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      setDateRange({
        start: formatDateForState(start),
        end: formatDateForState(end)
      });
    }
  };

  // Convert string dates to Date objects for DateRangePicker
  const pickerValue = dateRange.start && dateRange.end
    ? [new Date(dateRange.start), new Date(dateRange.end)] as [Date, Date]
    : null;

  return (
    <header className="h-16 bg-white flex items-center justify-between px-4 shadow-lg shadow-blue-50">
      <div className="flex items-center space-x-4 flex-1">
        <SidebarTrigger className="h-9 w-9 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200" />


        {/* Logo */}
        <img
          src="/expanded-logo.png"
          alt="Gopocket"
          className="h-7 w-auto"
        />


      </div>


      <div className="flex items-center space-x-4">

        {/* Date Range Picker */}
        <div className="flex items-center gap-2">
          <div className="bg-white border border-slate-200 rounded-lg">
            <DateRangePicker
              value={pickerValue}
              onChange={handleDateChange}
              placeholder="Select Date Range"
              style={{ width: 250 }}
              size="md"
              showOneCalendar={false}
              ranges={[
                {
                  label: 'Today',
                  value: [new Date(), new Date()]
                },
                {
                  label: 'Yesterday',
                  value: [new Date(new Date().setDate(new Date().getDate() - 1)), new Date(new Date().setDate(new Date().getDate() - 1))]
                },
                {
                  label: 'Last 7 Days',
                  value: [new Date(new Date().setDate(new Date().getDate() - 6)), new Date()]
                },
                {
                  label: 'Last 30 Days',
                  value: [new Date(new Date().setDate(new Date().getDate() - 29)), new Date()]
                },
                {
                  label: 'This Month',
                  value: [new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date()]
                },
                {
                  label: 'Last Month',
                  value: [
                    new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
                    new Date(new Date().getFullYear(), new Date().getMonth(), 0)
                  ]
                }
              ]}
              appearance="default"
            />
          </div>
        </div>

        {/* Search Bar */}
        {/* <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search UCC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 w-64 bg-slate-50 border-slate-200 rounded-lg"
          />
        </form> */}

        {/* Icons Container */}
        <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
          {/* Updates Icon */}
          <button
            onClick={() => navigate("/updates")}
            className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
          >
            <Sparkle size={20} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              Updates
            </div>
          </button>

          {/* Profile Icon */}
          <button className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group">
            <AlarmClockCheckIcon size={20} />
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              Task
            </div>
          </button>

          {/* GitHub Icon */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 group">
            <TicketIcon size={20} />
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              Tickets
            </div>
          </button>

        </div>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 hover:bg-slate-100">
              <Avatar>
                <AvatarImage src="/go.png" />
              </Avatar>
              <div className="text-left">
                <div className="text-sm font-medium text-slate-800">
                  {user?.id}
                </div>
                <div className="text-xs text-slate-500">
                  Admin
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
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
    </header>
  );
};

export default Header;
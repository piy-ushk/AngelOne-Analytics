import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  LineChart, 
  History, 
  ArrowLeftRight, 
  Wallet, 
  BarChart3,
  TrendingUp,
  Menu,
  X,
  Bell,
  Search,
  User
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
      active 
        ? "bg-foreground text-white shadow-lg" 
        : "text-muted hover:bg-gray-100 hover:text-foreground"
    )}
  >
    <Icon size={20} className={cn(active ? "text-white" : "text-muted group-hover:text-foreground")} />
    <span className="font-medium">{label}</span>
  </button>
);

const Layout = ({ children, activeTab, onTabChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: Briefcase, label: 'Portfolio' },
    { icon: LineChart, label: 'Positions' },
    { icon: History, label: 'Orders' },
    { icon: TrendingUp, label: 'P&L' },
    { icon: ArrowLeftRight, label: 'Trades' },
    { icon: Wallet, label: 'Funds' },
    { icon: BarChart3, label: 'Charges' },
    { icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <div className="flex min-h-screen bg-background font-inter">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          !sidebarOpen && "-translate-x-full lg:w-20"
        )}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center text-white font-bold">
              A
            </div>
            {sidebarOpen && <span className="text-xl font-bold tracking-tight">SmartAPI</span>}
          </div>

          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.label}
                icon={item.icon}
                label={sidebarOpen ? item.label : ''}
                active={activeTab === item.label}
                onClick={() => onTabChange(item.label)}
              />
            ))}
          </nav>

          <div className="pt-4 border-t border-gray-100">
            <div className={cn("flex items-center gap-3 px-2 py-2", !sidebarOpen && "justify-center")}>
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">PK</div>
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">Piyush Kulkarni</p>
                  <p className="text-xs text-muted truncate">Pro Plan</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold text-foreground">{activeTab}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 focus-within:ring-2 focus-within:ring-foreground/10 transition-all">
              <Search size={16} className="text-muted" />
              <input 
                type="text" 
                placeholder="Search stocks..." 
                className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-48"
              />
            </div>
            <button className="p-2 text-muted hover:text-foreground relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
          
          <footer className="mt-12 py-6 border-t border-gray-100 text-center">
            <p className="text-sm text-muted">
              © 2026 SmartAPI Analytics • Integrated with Angel One
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Layout;

import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome,
  FiDollarSign,
  FiPieChart,
  FiTarget,
  FiMessageCircle,
  FiSettings,
  FiMenu,
  FiX,
  FiLogOut,
  FiBarChart2,
  FiMoreHorizontal,
} from 'react-icons/fi';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome },
    { name: 'Transactions', href: '/transactions', icon: FiDollarSign },
    { name: 'Budgets', href: '/budgets', icon: FiPieChart },
    { name: 'Goals', href: '/goals', icon: FiTarget },
    { name: 'Reports', href: '/reports', icon: FiBarChart2 },
    { name: 'AI Assistant', href: '/chatbot', icon: FiMessageCircle },
    { name: 'Settings', href: '/settings', icon: FiSettings },
  ];

  // Bottom nav shows 4 main tabs + "More"
  const bottomNav = [
    { name: 'Home', href: '/dashboard', icon: FiHome },
    { name: 'Transactions', href: '/transactions', icon: FiDollarSign },
    { name: 'Budgets', href: '/budgets', icon: FiPieChart },
    { name: 'Goals', href: '/goals', icon: FiTarget },
  ];

  // Items hidden in "More" sheet
  const moreNav = [
    { name: 'Reports', href: '/reports', icon: FiBarChart2 },
    { name: 'AI Assistant', href: '/chatbot', icon: FiMessageCircle },
    { name: 'Settings', href: '/settings', icon: FiSettings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const isMoreActive = moreNav.some((item) => item.href === location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Desktop Sidebar (lg+) ──────────────────────────────── */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg flex-col">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <FiDollarSign className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Savvy Budget
            </h1>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:translate-x-1'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <Link
            to="/settings"
            className="flex items-center mb-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
              {user?.fullName?.charAt(0)?.toUpperCase() ||
               user?.username?.charAt(0)?.toUpperCase() ||
               user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.fullName || user?.username || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FiLogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ───────────────────────────────────────── */}
      <div className="lg:pl-64 flex flex-col min-h-screen">

        {/* Top Navbar */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 lg:px-8">
            {/* Mobile: Logo */}
            <Link to="/dashboard" className="flex items-center gap-2 lg:hidden">
              <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FiDollarSign className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Savvy Budget
              </span>
            </Link>

            {/* Desktop: Page title */}
            <h2 className="hidden lg:block text-xl font-semibold text-gray-900">
              {navigation.find((item) => item.href === location.pathname)?.name || 'Dashboard'}
            </h2>

            {/* Desktop: Avatar + Settings */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link
                to="/settings"
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Settings"
              >
                <FiSettings className="w-5 h-5" />
              </Link>
              <Link
                to="/settings"
                className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-semibold hover:shadow-lg transition-shadow"
              >
                {user?.fullName?.charAt(0)?.toUpperCase() ||
                 user?.username?.charAt(0)?.toUpperCase() ||
                 user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </Link>
            </div>

            {/* Mobile: Avatar only */}
            <Link
              to="/settings"
              className="lg:hidden w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-semibold"
            >
              {user?.fullName?.charAt(0)?.toUpperCase() ||
               user?.username?.charAt(0)?.toUpperCase() ||
               user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          <Outlet />
        </main>

        {/* Desktop Footer */}
        <footer className="hidden lg:block bg-white border-t border-gray-200 py-4 px-8">
          <div className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Savvy Budget. All rights reserved.
          </div>
        </footer>
      </div>

      {/* ── Mobile Bottom Navigation ───────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 safe-area-pb">
        <div className="flex items-center justify-around h-16">
          {bottomNav.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1 text-xs font-medium transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : ''}`} />
                <span>{item.name}</span>
                {isActive && <div className="absolute bottom-0 w-6 h-0.5 bg-blue-600 rounded-full" />}
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 text-xs font-medium transition-colors ${
              isMoreActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiMoreHorizontal className="w-5 h-5" />
            <span>More</span>
          </button>
        </div>
      </nav>

      {/* ── "More" Bottom Sheet (mobile) ──────────────────────── */}
      {moreOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-40 z-40"
            onClick={() => setMoreOpen(false)}
          />
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <span className="text-base font-semibold text-gray-900">More</span>
              <button onClick={() => setMoreOpen(false)}>
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* User info */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                {user?.fullName?.charAt(0)?.toUpperCase() ||
                 user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.fullName || user?.username || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>

            <div className="px-4 py-2">
              {moreNav.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors mt-1"
              >
                <FiLogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
            <div className="h-6" />
          </div>
        </>
      )}
    </div>
  );
};

export default Layout;

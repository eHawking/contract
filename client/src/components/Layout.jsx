import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  FileStack, 
  LogOut,
  Building2,
  Menu,
  X,
  User,
  Settings
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { settingsAPI } from '../lib/api';
import ThemeToggle from './ThemeToggle';

function Layout({ children }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [publicSettings, setPublicSettings] = React.useState(null);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const { data } = await settingsAPI.getPublic();
        setPublicSettings(data.settings || null);
      } catch {}
    })();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  const navigation = isAdmin ? [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Contracts', href: '/admin/contracts', icon: FileText },
    { name: 'Templates', href: '/admin/templates', icon: FileStack },
    { name: 'Service Providers', href: '/admin/users', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
    { name: 'Profile', href: '/profile', icon: User }
  ] : [
    { name: 'Dashboard', href: '/provider/dashboard', icon: LayoutDashboard },
    { name: 'My Contracts', href: '/provider/contracts', icon: FileText },
    { name: 'Profile', href: '/profile', icon: User }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-800"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {publicSettings?.logo_url ? (
                  <img src={publicSettings.logo_url} alt="Logo" className="w-8 h-8 object-contain" />
                ) : (
                  <Building2 className="text-primary-600 dark:text-primary-400" size={32} />
                )}
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">{publicSettings?.company_name || 'AEMCO'}</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Contract Builder</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="mb-3 px-2">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
              <span className={`
                inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full
                ${isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}
              `}>
                {isAdmin ? 'Administrator' : 'Service Provider'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Top header */}
        <div className="sticky top-0 z-30 bg-white/70 dark:bg-gray-950/70 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-gray-200 dark:border-gray-800">
          <div className="px-6 lg:px-8 py-3 flex items-center justify-end">
            <div className="relative z-40">
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden flex items-center justify-center">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {(user?.name || 'U').split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-4">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 card p-2 z-40">
                    <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <User size={16} />
                      <span>Profile</span>
                    </Link>
                    {isAdmin && (
                      <Link to="/admin/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Settings size={16} />
                        <span>Settings</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default Layout;

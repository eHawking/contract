import { useState, useEffect } from 'react';
import { X, Sparkles, TrendingUp, FileText, Users, Settings as SettingsIcon } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

export default function WelcomeModal() {
  const { user } = useAuthStore();
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    // Check if user has seen welcome message in this session
    const hasSeenWelcome = sessionStorage.getItem(`welcome_${user?.id}`);
    if (!hasSeenWelcome) {
      setShow(true);
      sessionStorage.setItem(`welcome_${user?.id}`, 'true');
    }
  }, [user?.id]);

  if (!show) return null;

  const isAdmin = user?.role === 'admin';

  const features = isAdmin ? [
    {
      icon: FileText,
      title: 'Contract Management',
      description: 'Create, edit, and manage contracts efficiently'
    },
    {
      icon: Users,
      title: 'Service Providers',
      description: 'Manage service provider accounts and permissions'
    },
    {
      icon: SettingsIcon,
      title: 'System Settings',
      description: 'Configure company details, email, and AI features'
    },
    {
      icon: TrendingUp,
      title: 'Analytics',
      description: 'Track contract status and performance metrics'
    }
  ] : [
    {
      icon: FileText,
      title: 'View Contracts',
      description: 'Access and review your assigned contracts'
    },
    {
      icon: Sparkles,
      title: 'Digital Signing',
      description: 'Sign contracts digitally with ease'
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Monitor your contract status in real-time'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 animate-slide-up">
        {/* Header */}
        <div className="relative p-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-t-2xl">
          <button
            onClick={() => setShow(false)}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <div className="flex items-center gap-4 text-white">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">
                Welcome Back, {user?.name?.split(' ')[0]}! 👋
              </h2>
              <p className="text-primary-100 mt-1">
                {isAdmin ? 'Admin Dashboard' : 'Service Provider Portal'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {isAdmin 
              ? 'Manage your contract operations efficiently with our comprehensive admin tools.'
              : 'Access your contracts, sign documents, and manage your work seamlessly.'
            }
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Company Info */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-800/30 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              <strong className="text-gray-900 dark:text-white">AHMED ESSA CONSTRUCTION & TRADING (AEMCO)</strong>
              <br />
              6619, King Fahd Road, Dammam, 32243, Saudi Arabia
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => setShow(false)}
            className="w-full mt-6 btn btn-primary py-3 text-lg"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

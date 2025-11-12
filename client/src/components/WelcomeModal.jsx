import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Sparkles, Users, FileText } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

export default function WelcomeModal() {
  const { user } = useAuthStore();
  const [isVisible, setIsVisible] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  useEffect(() => {
    // Show welcome modal only once per session and if user just logged in
    const justLoggedIn = sessionStorage.getItem('justLoggedIn');
    const welcomeShown = sessionStorage.getItem('welcomeShown');

    if (justLoggedIn === 'true' && !welcomeShown && user) {
      setIsVisible(true);
      setHasShownWelcome(true);
      sessionStorage.setItem('welcomeShown', 'true');
      sessionStorage.removeItem('justLoggedIn'); // Clean up
    }
  }, [user]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || !user) return null;

  const isAdmin = user.role === 'admin';

  const adminWelcome = {
    title: "Welcome back, Administrator!",
    subtitle: "Ready to manage your contract operations",
    icon: <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-pulse-glow" />,
    features: [
      { icon: <Users className="w-5 h-5" />, text: "Manage Service Providers" },
      { icon: <FileText className="w-5 h-5" />, text: "Review Contract Templates" },
      { icon: <Sparkles className="w-5 h-5" />, text: "Configure AI Settings" },
    ],
    gradient: "gradient-success"
  };

  const providerWelcome = {
    title: `Welcome back, ${user.name || 'Service Provider'}!`,
    subtitle: "Your contracts are waiting for you",
    icon: <FileText className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse-glow" />,
    features: [
      { icon: <FileText className="w-5 h-5" />, text: "Review Your Contracts" },
      { icon: <CheckCircle className="w-5 h-5" />, text: "Sign Pending Agreements" },
      { icon: <Users className="w-5 h-5" />, text: "Update Your Profile" },
    ],
    gradient: "gradient-primary"
  };

  const welcome = isAdmin ? adminWelcome : providerWelcome;

  return (
    <div className="welcome-modal animate-fade-in">
      <div className="welcome-content">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close welcome modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="animate-slide-up">
          {welcome.icon}

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {welcome.title}
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {welcome.subtitle}
          </p>

          <div className="space-y-4 mb-8">
            {welcome.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="flex-shrink-0 text-primary-600 dark:text-primary-400">
                  {feature.icon}
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleClose}
              className={`btn btn-primary flex-1 ${welcome.gradient} text-white`}
            >
              Get Started
            </button>
            {isAdmin && (
              <button
                onClick={() => {
                  handleClose();
                  // Could navigate to settings or dashboard
                  window.location.href = '/admin/settings';
                }}
                className="btn btn-outline flex-1"
              >
                <Sparkles className="w-4 h-4" />
                Quick Settings
              </button>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  New Features Available
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  {isAdmin
                    ? "Check out AI-powered content generation and enhanced admin tools."
                    : "Upload profile photos and manage your account settings."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

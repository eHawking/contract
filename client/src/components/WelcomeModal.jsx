import React, { useEffect, useState } from 'react';
import { CheckCircle, X, User, Building2, FileText } from 'lucide-react';

const WelcomeModal = ({ user, onClose }) => {
  const [visible, setVisible] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: CheckCircle,
      title: `Welcome back, ${user?.name}!`,
      message: user?.role === 'admin'
        ? "You're now logged in as an administrator. You have full access to manage contracts, users, and system settings."
        : "You're now logged in as a service provider. You can view and manage your assigned contracts.",
      color: "text-green-600"
    },
    {
      icon: user?.role === 'admin' ? Building2 : FileText,
      title: user?.role === 'admin' ? "Admin Dashboard" : "Your Contracts",
      message: user?.role === 'admin'
        ? "Access your dashboard to view statistics, manage contracts, and configure system settings."
        : "View all your assigned contracts, sign documents, and download completed agreements.",
      color: "text-blue-600"
    },
    {
      icon: User,
      title: "Profile & Settings",
      message: "Update your profile information, change your password, and customize your experience with light/dark theme toggle.",
      color: "text-purple-600"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  useEffect(() => {
    // Auto-close after 10 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="welcome-modal" onClick={handleClose}>
      <div className="welcome-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className={`welcome-icon ${currentStepData.color}`}>
          <Icon size={32} />
        </div>

        <h2 className="welcome-title">{currentStepData.title}</h2>

        <p className="welcome-message">{currentStepData.message}</p>

        {/* Progress indicators */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 justify-center">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="btn btn-ghost"
            >
              Previous
            </button>
          )}

          <button
            onClick={handleNext}
            className="btn btn-primary"
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>

        {/* Skip option */}
        <button
          onClick={handleClose}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Skip welcome tour
        </button>
      </div>
    </div>
  );
};

export default WelcomeModal;

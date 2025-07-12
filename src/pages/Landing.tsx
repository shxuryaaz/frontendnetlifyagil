import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import logo from '../assets/agilow-logo.jpeg';

const agilowBlue = '#1A237E'; // Use a deep blue similar to the Agilow logo

const Landing = () => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    window.location.href = '/select-app';
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ background: agilowBlue }}
    >
      <div className="text-center space-y-8">
        {/* Logo Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: showContent ? 1 : 0, scale: showContent ? 1 : 0.8 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-8"
        >
          <img
            src={logo}
            alt="Agilow Logo"
            className="w-40 h-40 mx-auto rounded-full shadow-lg"
          />
        </motion.div>

        {/* Welcome Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-4"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg">
            Welcome to Agilow
          </h1>
          <p className="text-2xl text-blue-100 max-w-md mx-auto">
            Your AI-powered project management assistant
          </p>
        </motion.div>

        {/* Get Started Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-white text-blue-900 px-10 py-4 text-xl font-bold rounded-full shadow-lg hover:bg-blue-100 transition-all duration-300"
          >
            Get Started
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing; 
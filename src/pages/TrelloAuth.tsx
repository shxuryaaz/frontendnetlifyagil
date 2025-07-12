import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Trello, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const TrelloAuth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [authStatus, setAuthStatus] = useState<'initiating' | 'authorizing' | 'success' | 'error'>('initiating');
  const [errorMessage, setErrorMessage] = useState('');

  // Trello OAuth configuration
  const TRELLO_APP_KEY = import.meta.env.VITE_TRELLO_APP_KEY || 'YOUR_TRELLO_APP_KEY'; // This should come from environment variables
  const REDIRECT_URI = `${window.location.origin}/trello-auth`;
  const TRELLO_AUTH_URL = `https://trello.com/1/authorize?expiration=never&name=Agilow&scope=read,write&response_type=token&key=${TRELLO_APP_KEY}&return_url=${encodeURIComponent(REDIRECT_URI)}`;

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      // Successfully got token from Trello
      setAuthStatus('success');
      // Store the token and redirect to dashboard
      localStorage.setItem('trello_token', token);
      setTimeout(() => {
        navigate('/dashboard', { state: { platform: 'trello', token } });
      }, 2000);
    } else if (error) {
      // Error from Trello
      setAuthStatus('error');
      setErrorMessage(error);
    } else {
      // No token in URL, initiate OAuth flow
      initiateOAuth();
    }
  }, [searchParams, navigate]);

  const initiateOAuth = () => {
    setAuthStatus('authorizing');
    // Redirect to Trello OAuth
    window.location.href = TRELLO_AUTH_URL;
  };

  const handleRetry = () => {
    setAuthStatus('initiating');
    setErrorMessage('');
    initiateOAuth();
  };

  const handleBack = () => {
    navigate('/select-app');
  };

  const renderContent = () => {
    switch (authStatus) {
      case 'initiating':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <Trello className="w-10 h-10 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Connect to Trello
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                We'll redirect you to Trello to authorize Agilow to access your boards and lists.
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={initiateOAuth}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                size="lg"
              >
                Continue to Trello
              </Button>
              <Button
                variant="outline"
                onClick={handleBack}
                className="text-gray-600"
              >
                ← Back to App Selection
              </Button>
            </div>
          </div>
        );

      case 'authorizing':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Authorizing with Trello
              </h2>
              <p className="text-gray-600">
                Please complete the authorization in the Trello window that opened.
              </p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Successfully Connected!
              </h2>
              <p className="text-gray-600">
                You've successfully connected your Trello account. Redirecting to dashboard...
              </p>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Authorization Failed
              </h2>
              <p className="text-gray-600 mb-4">
                {errorMessage || 'There was an error connecting to Trello. Please try again.'}
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={handleRetry}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                size="lg"
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={handleBack}
                className="text-gray-600"
              >
                ← Back to App Selection
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8">
            {renderContent()}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TrelloAuth; 
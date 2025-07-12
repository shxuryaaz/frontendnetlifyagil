import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, useParams } from 'react-router-dom';
import { Zap, Notebook, ArrowLeft, CheckCircle } from 'lucide-react';

interface AppConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  fields: {
    name: string;
    label: string;
    placeholder: string;
    type: 'text' | 'password';
    required: boolean;
  }[];
}

const ConfigureApp = () => {
  const navigate = useNavigate();
  const { appId } = useParams<{ appId: string }>();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Pre-fill form with existing config if present
  useEffect(() => {
    if (appId === 'linear') {
      const saved = localStorage.getItem('linear_config');
      if (saved) setFormData(JSON.parse(saved));
    } else if (appId === 'asana') {
      const saved = localStorage.getItem('asana_config');
      if (saved) setFormData(JSON.parse(saved));
    }
  }, [appId]);

  const appConfigs: Record<string, AppConfig> = {
    linear: {
      id: 'linear',
      name: 'Linear',
      icon: <img src="https://cdn.brandfetch.io/linear.app/fallback/lettermark/theme/dark/h/256/w/256/icon?c=1bfwsmEH20zzEfSNTed" alt="Linear Logo" className="w-full h-full object-contain" />, // updated icon
      color: 'from-purple-500 to-purple-600',
      fields: [
        {
          name: 'apiKey',
          label: 'Linear API Key',
          placeholder: 'Enter your Linear API key',
          type: 'password',
          required: true
        },
        {
          name: 'workspaceId',
          label: 'Workspace ID',
          placeholder: 'Enter your Linear workspace ID',
          type: 'text',
          required: true
        }
      ]
    },
    asana: {
      id: 'asana',
      name: 'Asana',
      icon: <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScD1nIKyMQn9x7WWbGxQqVk31VJ5Vb5YFnwg&s" alt="Asana Logo" className="w-full h-full object-contain" />, // updated icon
      color: 'from-orange-500 to-orange-600',
      fields: [
        {
          name: 'personalAccessToken',
          label: 'Personal Access Token',
          placeholder: 'Enter your Asana personal access token',
          type: 'password',
          required: true
        },
        {
          name: 'projectId',
          label: 'Project ID',
          placeholder: 'Enter your Asana project ID',
          type: 'text',
          required: true
        }
      ]
    }
  };

  const currentApp = appConfigs[appId || ''];

  if (!currentApp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">App Not Found</h2>
            <p className="text-gray-600 mb-6">The requested app configuration is not available.</p>
            <Button onClick={() => navigate('/select-app')} variant="outline">
              ← Back to App Selection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    const missingFields = currentApp.fields
      .filter(field => field.required && !formData[field.name])
      .map(field => field.label);

    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      setIsSubmitting(false);
      return;
    }

    try {
      // Store configuration in localStorage
      if (appId === 'linear') {
        localStorage.setItem('linear_config', JSON.stringify(formData));
      } else if (appId === 'asana') {
        localStorage.setItem('asana_config', JSON.stringify(formData));
      }
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/dashboard', { state: { platform: appId, config: formData } });
      }, 2000);
    } catch (error) {
      console.error('Configuration error:', error);
      alert('Failed to save configuration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Configuration Saved!
              </h2>
              <p className="text-gray-600">
                Your {currentApp.name} configuration has been saved successfully. Redirecting to dashboard...
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-100 relative overflow-x-hidden">
      {/* Decorative blurred background circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-200 rounded-full blur-3xl opacity-30 z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-200 rounded-full blur-3xl opacity-30 z-0" />
      <div className="max-w-2xl mx-auto z-10 w-full flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border border-gray-200 shadow-2xl rounded-2xl bg-white/95 backdrop-blur-lg">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-4 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/select-app')}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 via-white to-blue-100 flex items-center justify-center shadow-lg border border-gray-200">
                  {currentApp.icon}
                </div>
                <div>
                  <CardTitle className="text-3xl font-extrabold text-gray-900">
                    Configure {currentApp.name}
                  </CardTitle>
                  <p className="text-gray-600 mt-2 text-base">
                    Enter your {currentApp.name} credentials to connect your account
                  </p>
                </div>
              </div>
            </CardHeader>
            <hr className="border-t border-gray-200 mx-8" />
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8 mt-4">
                {currentApp.fields.map((field, index) => (
                  <motion.div
                    key={field.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="space-y-2"
                  >
                    <Label htmlFor={field.name} className="text-base font-semibold text-gray-700">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                      id={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      required={field.required}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm hover:border-blue-300"
                    />
                    <p className="text-xs text-gray-500 pl-1">
                      {field.name === 'apiKey' && currentApp.id === 'linear' && 'You can find your Linear API key in your Linear account settings.'}
                      {field.name === 'workspaceId' && currentApp.id === 'linear' && 'Enter your Linear workspace ID.'}
                      {field.name === 'personalAccessToken' && currentApp.id === 'asana' && 'Get your Asana personal access token from your Asana profile settings.'}
                      {field.name === 'projectId' && currentApp.id === 'asana' && 'Enter your Asana project ID.'}
                    </p>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="pt-2"
                >
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg text-lg transition-all duration-200 transform hover:scale-[1.03] active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2`}
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Saving Configuration...
                      </>
                    ) : (
                      `Connect ${currentApp.name}`
                    )}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ConfigureApp; 
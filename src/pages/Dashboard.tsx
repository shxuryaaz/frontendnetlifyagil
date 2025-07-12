import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useLocation, useNavigate } from 'react-router-dom';
import { Trello, Loader2, Mic, Settings, LogOut } from 'lucide-react';
import VoiceManagerNew from '@/components/VoiceManagerNew';
import { Label } from '@/components/ui/label';
import { getTrelloToken, clearTrelloToken } from '@/lib/supabase';
import UnifiedDashboard from '@/components/UnifiedDashboard';
import Cookies from 'js-cookie';

interface TrelloBoard {
  id: string;
  name: string;
  url: string;
  lists: TrelloList[];
}

interface TrelloList {
  id: string;
  name: string;
  cards: TrelloCard[];
}

interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  due: string | null;
  labels: any[];
}

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [platform, setPlatform] = useState<string>('');
  const [boards, setBoards] = useState<TrelloBoard[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [trelloBoardError, setTrelloBoardError] = useState<string | null>(null);


  useEffect(() => {
    const state = location.state as { platform?: string; token?: string; config?: any };
    if (state && state.platform) {
      setPlatform(state.platform);
      setIsLoading(false);
      return;
    }
    // Fallback: check localStorage for Linear/Asana config
    const linearConfig = localStorage.getItem('linear_config');
    if (linearConfig) {
      setPlatform('linear');
      setIsLoading(false);
      return;
    }
    const asanaConfig = localStorage.getItem('asana_config');
    if (asanaConfig) {
      setPlatform('asana');
      setIsLoading(false);
      return;
    }
    const trelloToken = getTrelloToken();
    if (trelloToken) {
      setPlatform('trello');
      fetchTrelloBoards(trelloToken);
      return;
    }
    // Check for legacy Trello token
    const legacyTrelloToken = localStorage.getItem('trello_token');
    if (legacyTrelloToken) {
      setPlatform('trello');
      fetchTrelloBoards(legacyTrelloToken);
      return;
    }
    // No configuration found, redirect to app selection
    navigate('/select-app');
  }, [location, navigate]);

  useEffect(() => {
    if (platform === 'trello') {
      // Always try to get the latest token and API key
      const apiKey = import.meta.env.VITE_TRELLO_APP_KEY;
      let token = getTrelloToken();
      if (!token || token === 'undefined') {
        token = Cookies.get('token');
      }

      if (!apiKey || !token) {
        setTrelloBoardError('Missing Trello API key or token. Please re-authorize.');
        setBoards([]);
        return;
      }
      fetchTrelloBoards(token);
    }
    // eslint-disable-next-line
  }, [platform, location]);

  const fetchTrelloBoards = async (token: string) => {
    try {
      setIsLoading(true);
      setError('');
      setTrelloBoardError(null);
      const apiKey = import.meta.env.VITE_TRELLO_APP_KEY;
      // Fallback: if token is undefined, try to get from cookies
      let realToken = token;
      if (!realToken || realToken === 'undefined') {
        realToken = Cookies.get('token');
      }
      if (!apiKey || !realToken) {
        setTrelloBoardError('Missing Trello API key or token. Please re-authorize.');
        setBoards([]);
        return;
      }
      console.log('Fetching Trello boards with:', { apiKey, token: realToken });
      const response = await fetch(`https://api.trello.com/1/members/me/boards?key=${apiKey}&token=${realToken}&lists=open`);
      const boardsData = await response.json();
      console.log('Fetched boards:', boardsData);
      if (!response.ok) {
        setTrelloBoardError(boardsData.message || 'Failed to fetch Trello boards');
        throw new Error(boardsData.message || 'Failed to fetch Trello boards');
      }
      // Transform the data to match our interface
      const transformedBoards: TrelloBoard[] = boardsData.map((board: any) => ({
        id: board.id,
        name: board.name,
        url: board.url,
        lists: board.lists || []
      }));
      setBoards(transformedBoards);
      if (transformedBoards.length > 0) {
        setSelectedBoard(transformedBoards[0].id);
      }
    } catch (err: any) {
      setError('Failed to load your Trello boards. Please try again.');
      setTrelloBoardError(err.message || 'Failed to fetch Trello boards');
      console.error('Error fetching Trello boards:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear all stored configurations
      clearTrelloToken();
      localStorage.removeItem('linear_config');
      localStorage.removeItem('asana_config');
      
      // Redirect to landing page
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if logout fails
      navigate('/');
    }
  };

  const handleBoardChange = (boardId: string) => {
    setSelectedBoard(boardId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Loading Your Workspace
            </h2>
            <p className="text-gray-600">
              {platform === 'trello' ? 'Fetching your Trello boards...' : 'Setting up your workspace...'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connection Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/select-app')} className="bg-blue-600 hover:bg-blue-700">
                Reconnect Account
              </Button>
              <Button onClick={handleLogout} variant="outline" className="text-gray-600">
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (platform !== 'trello') {
    return <UnifiedDashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {platform === 'trello' && <Trello className="w-8 h-8 text-blue-600" />}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Agilow Dashboard
                  </h1>
                  <p className="text-sm text-gray-600">
                    Connected to {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/select-app')} className="text-gray-600">
                Switch Workspace
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-600">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Workspace
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                {platform === 'trello' && boards.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">Select Board</Label>
                    <Select value={selectedBoard} onValueChange={handleBoardChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a board" />
                      </SelectTrigger>
                      <SelectContent>
                        {boards.map((board) => (
                          <SelectItem key={board.id} value={board.id}>
                            {board.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {trelloBoardError && (
                      <div className="mt-2 text-sm text-red-500">{trelloBoardError}</div>
                    )}
                    
                    <div className="pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Available Boards</h4>
                      <div className="space-y-2">
                        {boards.map((board) => (
                          <div
                            key={board.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedBoard === board.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleBoardChange(board.id)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">{board.name}</span>
                              {selectedBoard === board.id && (
                                <Badge className="bg-blue-100 text-blue-800 text-xs">Active</Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {board.lists?.length || 0} lists
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {platform === 'trello' && boards.length === 0 && (
                  <div className="mt-4 text-sm text-gray-500">
                    No Trello boards found or unable to fetch boards.
                    {trelloBoardError && (
                      <div className="mt-2 text-sm text-red-500">{trelloBoardError}</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Voice Interface */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-3"
          >
            <VoiceManagerNew 
              platform={platform}
              selectedBoard={selectedBoard}
              boards={boards}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
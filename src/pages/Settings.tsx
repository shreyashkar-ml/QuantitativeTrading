
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Save, Upload, RefreshCw, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

export function Settings() {
  // State management for user settings
  const [darkMode, setDarkMode] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState('30');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Initialize dark mode based on system preference
  useEffect(() => {
    // Check if user has previously set dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedDarkMode) {
      // Use saved preference
      const isDark = savedDarkMode === 'true';
      setDarkMode(isDark);
      applyDarkMode(isDark);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
      applyDarkMode(prefersDark);
    }
  }, []);

  // Function to apply dark mode to document
  const applyDarkMode = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Handle dark mode toggle
  const handleDarkModeChange = (checked: boolean) => {
    setDarkMode(checked);
    applyDarkMode(checked);
    localStorage.setItem('darkMode', checked.toString());
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save settings to localStorage
      localStorage.setItem('refreshInterval', refreshInterval);
      localStorage.setItem('autoRefresh', autoRefresh.toString());
      localStorage.setItem('notifications', notifications.toString());
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Page header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Configure your application preferences
          </p>
        </motion.div>

        {/* Settings form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-8"
        >
          {/* Display settings */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              <h2 className="text-xl font-semibold">Display Settings</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Dark Mode</h3>
                  <p className="text-sm text-muted-foreground">
                    Enable dark mode for the application
                  </p>
                </div>
                <Switch 
                  checked={darkMode} 
                  onCheckedChange={handleDarkModeChange} 
                  aria-label="Toggle dark mode"
                />
              </div>
            </div>
          </div>
          
          {/* Data refresh settings */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center mb-4">
              <RefreshCw className="h-5 w-5 mr-2 text-primary" />
              <h2 className="text-xl font-semibold">Data Refresh Settings</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Automatic Refresh</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatically refresh strategy data
                  </p>
                </div>
                <Switch 
                  checked={autoRefresh} 
                  onCheckedChange={setAutoRefresh} 
                  aria-label="Toggle auto refresh"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="refresh-interval">
                  Refresh Interval (minutes)
                </label>
                <input
                  id="refresh-interval"
                  type="number"
                  min="1"
                  max="1440"
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(e.target.value)}
                  disabled={!autoRefresh}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  How often the application should refresh trading strategy results
                </p>
              </div>
            </div>
          </div>
          
          {/* Notification settings */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Bell className="h-5 w-5 mr-2 text-primary" />
              <h2 className="text-xl font-semibold">Notification Settings</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Browser Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when strategy performance changes significantly
                  </p>
                </div>
                <Switch 
                  checked={notifications} 
                  onCheckedChange={setNotifications} 
                  aria-label="Toggle notifications"
                />
              </div>
            </div>
          </div>
          
          {/* Save button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <span className="mr-2">Saving...</span>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-r-transparent animate-spin inline-block"></div>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2 inline" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Settings;

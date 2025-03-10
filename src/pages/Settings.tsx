
import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Clock, Database, Info, Save, Terminal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function Settings() {
  const [pythonPath, setPythonPath] = useState('/usr/local/bin/python3');
  const [scriptPath, setScriptPath] = useState('/path/to/your/main.py');
  const [refreshInterval, setRefreshInterval] = useState('30');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Settings saved",
        description: "Your configuration has been updated successfully.",
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
            Configure your trading strategy environment and application preferences
          </p>
        </motion.div>

        {/* Settings form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-8"
        >
          {/* Python environment section */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Terminal className="h-5 w-5 mr-2 text-primary" />
              <h2 className="text-xl font-semibold">Python Environment</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="python-path">
                  Python Executable Path
                </label>
                <input
                  id="python-path"
                  type="text"
                  value={pythonPath}
                  onChange={(e) => setPythonPath(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="/usr/local/bin/python3"
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  The path to your Python executable that will run the trading scripts
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="script-path">
                  Trading Script Path
                </label>
                <input
                  id="script-path"
                  type="text"
                  value={scriptPath}
                  onChange={(e) => setScriptPath(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="/path/to/your/main.py"
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  The path to your main.py script that contains your trading strategy
                </p>
              </div>
            </div>
          </div>
          
          {/* Data refresh settings */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              <h2 className="text-xl font-semibold">Data Refresh Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="auto-refresh"
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <label className="ml-2 block text-sm font-medium" htmlFor="auto-refresh">
                  Enable automatic refresh
                </label>
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
                  How often the application should run your trading strategy and refresh the results
                </p>
              </div>
            </div>
          </div>
          
          {/* Database settings section */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Database className="h-5 w-5 mr-2 text-primary" />
              <h2 className="text-xl font-semibold">Database Settings</h2>
            </div>
            
            <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-md">
              <div className="flex">
                <Info className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                <p className="text-sm text-yellow-700">
                  Database configuration is handled through environment variables.
                  Update your .env file to configure database connections.
                </p>
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

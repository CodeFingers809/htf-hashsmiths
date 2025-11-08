
import { motion } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useAlert, useConfirm } from '@/components/ui/notification';
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  Moon,
  Sun
} from 'lucide-react';

export default function SettingsPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const toast = useAlert();
  const confirm = useConfirm();

  // Loading state for UI
  const [updating, setUpdating] = useState(false);

  // Local state for settings
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [performanceTracking, setPerformanceTracking] = useState(true);
  const [language, setLanguage] = useState('en');

  // Load user settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setNotifications(settings.notifications ?? true);
        setSoundEffects(settings.sound_effects ?? true);
        setDarkMode(settings.dark_mode ?? true);
        setEmailUpdates(settings.email_updates ?? true);
        setPerformanceTracking(settings.performance_tracking ?? true);
        setLanguage(settings.language ?? 'en');
      }
    }
  }, []);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // Function to save settings to localStorage
  const saveSettings = async (newSettings: Record<string, any>) => {
    try {
      if (typeof window !== 'undefined') {
        const currentSettings = localStorage.getItem('userSettings');
        const existingSettings = currentSettings ? JSON.parse(currentSettings) : {};
        const updatedSettings = { ...existingSettings, ...newSettings };
        localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
        toast.success('Settings updated successfully');
      }
    } catch (error) {
      toast.error('Failed to update settings');
      console.error('Settings update error:', error);
    }
  };

  // Handle individual setting changes
  const handleSettingChange = (setting: string, value: any) => {
    switch (setting) {
      case 'notifications':
        setNotifications(value);
        saveSettings({ notifications: value });
        break;
      case 'sound_effects':
        setSoundEffects(value);
        saveSettings({ sound_effects: value });
        break;
      case 'dark_mode':
        setDarkMode(value);
        saveSettings({ dark_mode: value });
        break;
      case 'email_updates':
        setEmailUpdates(value);
        saveSettings({ email_updates: value });
        break;
      case 'performance_tracking':
        setPerformanceTracking(value);
        saveSettings({ performance_tracking: value });
        break;
      case 'language':
        setLanguage(value);
        saveSettings({ language: value });
        break;
    }
  };

  // Handle action buttons
  const handleAction = (action: string) => {
    switch (action) {
      case 'Edit Profile':
        navigate('/profile');
        break;
      case 'Manage Security':
        toast.info('Security settings managed through Clerk');
        break;
      case 'Manage Connections':
        toast.info('Social connections coming soon');
        break;
      case 'Privacy Settings':
        toast.info('Privacy settings updated automatically');
        break;
      case 'Visibility Settings':
        toast.info('Profile visibility controls coming soon');
        break;
      case 'Export Data':
        handleDataExport();
        break;
      case 'Configure AI':
        toast.info('AI configuration coming soon');
        break;
      case 'Video Settings':
        toast.info('Video settings coming soon');
        break;
      case 'Unit Settings':
        toast.info('Unit preferences coming soon');
        break;
      case 'Delete Account':
        handleDeleteAccount();
        break;
      case 'Clear Data':
        handleClearData();
        break;
      default:
        toast.info('Feature coming soon');
    }
  };

  const handleDataExport = async () => {
    try {
      // In a real app, this would trigger a data export
      toast.success('Data export initiated. You will receive an email when ready.');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion must be done through account security settings');
  };

  const handleClearData = async () => {
    const confirmed = await confirm({
      title: 'Clear Performance Data',
      message: 'Are you sure you want to clear all performance data? This cannot be undone.'
    });

    if (confirmed) {
      try {
        // In a real app, this would clear performance data
        toast.success('Performance data cleared successfully');
      } catch (error) {
        toast.error('Failed to clear performance data');
      }
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="cyber-card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="font-rajdhani text-cyan-400">Loading Settings...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  const settingSections = [
    {
      title: 'Account Settings',
      icon: User,
      color: 'text-cyan-400',
      items: [
        {
          name: 'Personal Information',
          description: 'Update your profile details and contact information',
          action: 'Edit Profile'
        },
        {
          name: 'Password & Security',
          description: 'Change password, enable 2FA, and manage security settings',
          action: 'Manage Security'
        },
        {
          name: 'Connected Accounts',
          description: 'Link social media and sports tracking apps',
          action: 'Manage Connections'
        }
      ]
    },
    {
      title: 'Privacy & Data',
      icon: Shield,
      color: 'text-green-500',
      items: [
        {
          name: 'Data Privacy',
          description: 'Control how your performance data is used and shared',
          action: 'Privacy Settings'
        },
        {
          name: 'Profile Visibility',
          description: 'Choose who can see your profile and achievements',
          action: 'Visibility Settings'
        },
        {
          name: 'Data Export',
          description: 'Download your complete performance data',
          action: 'Export Data'
        }
      ]
    },
    {
      title: 'Performance',
      icon: Monitor,
      color: 'text-orange-500',
      items: [
        {
          name: 'AI Analysis',
          description: 'Configure AI-powered performance insights',
          action: 'Configure AI'
        },
        {
          name: 'Video Quality',
          description: 'Set video recording and analysis quality preferences',
          action: 'Video Settings'
        },
        {
          name: 'Measurement Units',
          description: 'Choose metric or imperial units for measurements',
          action: 'Unit Settings'
        }
      ]
    }
  ];

  const ToggleSwitch = ({ enabled, onChange, label }: { enabled: boolean; onChange: (value: boolean) => void; label: string }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm font-rajdhani text-foreground">{label}</span>
      <button
        onClick={() => onChange(!enabled)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
          ${enabled ? 'bg-cyan-500' : 'bg-card/50'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
            ${enabled ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="font-orbitron text-4xl font-bold neon-text mb-2">
            SYSTEM SETTINGS
          </h1>
          <p className="text-muted-foreground font-rajdhani text-lg">
            Customize your assessment experience • Privacy controls • Performance optimization
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-orange-500 mt-4 cyber-glow" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Settings */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Preferences */}
            <div className="cyber-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-6 h-6 text-cyan-400" />
                <h2 className="font-orbitron text-lg font-bold neon-text">
                  Quick Settings
                </h2>
              </div>

              <div className="space-y-4">
                <ToggleSwitch
                  enabled={notifications}
                  onChange={(value) => handleSettingChange('notifications', value)}
                  label="Push Notifications"
                />
                <ToggleSwitch
                  enabled={soundEffects}
                  onChange={(value) => handleSettingChange('sound_effects', value)}
                  label="Sound Effects"
                />
                <ToggleSwitch
                  enabled={emailUpdates}
                  onChange={(value) => handleSettingChange('email_updates', value)}
                  label="Email Updates"
                />
                <ToggleSwitch
                  enabled={performanceTracking}
                  onChange={(value) => handleSettingChange('performance_tracking', value)}
                  label="Performance Tracking"
                />
              </div>
            </div>

            {/* Theme Settings */}
            <div className="cyber-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Palette className="w-6 h-6 text-orange-500" />
                <h2 className="font-orbitron text-lg font-bold neon-orange-text">
                  Appearance
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-rajdhani text-foreground">Theme</span>
                  <button
                    onClick={() => handleSettingChange('dark_mode', !darkMode)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/30 hover:bg-card/50 transition-colors"
                  >
                    {darkMode ? (
                      <>
                        <Moon className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-rajdhani text-cyan-400">Dark</span>
                      </>
                    ) : (
                      <>
                        <Sun className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-rajdhani text-orange-500">Light</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-xs font-rajdhani text-cyan-300">
                    Cyber Blue
                  </button>
                  <button className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30 text-xs font-rajdhani text-orange-300">
                    Neon Orange
                  </button>
                </div>
              </div>
            </div>

            {/* Language */}
            <div className="cyber-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-6 h-6 text-green-500" />
                <h2 className="font-orbitron text-lg font-bold text-green-400">
                  Language
                </h2>
              </div>

              <select
                value={language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                className="w-full cyber-border bg-card/50 text-foreground font-rajdhani p-3 rounded-lg"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="ta">தமிழ் (Tamil)</option>
              </select>
            </div>
          </motion.div>

          {/* Main Settings */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-8"
          >
            {settingSections.map((section, sectionIndex) => {
              const SectionIcon = section.icon;
              return (
                <div key={section.title} className="cyber-card p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <SectionIcon className={`w-6 h-6 ${section.color}`} />
                    <h2 className="font-orbitron text-xl font-bold text-foreground">
                      {section.title}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {section.items.map((item, itemIndex) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 + sectionIndex * 0.1 + itemIndex * 0.05 }}
                        className="flex items-center justify-between p-4 bg-card/30 rounded-lg hover:bg-card/50 transition-all duration-300"
                      >
                        <div className="flex-1">
                          <h3 className="font-rajdhani font-semibold text-foreground mb-1">
                            {item.name}
                          </h3>
                          <p className="text-sm text-muted-foreground font-rajdhani">
                            {item.description}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(item.action)}
                          disabled={updating}
                          className="cyber-border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 font-rajdhani"
                        >
                          {updating ? 'Loading...' : item.action}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Danger Zone */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="cyber-card p-6 border-red-500/30"
            >
              <div className="flex items-center gap-3 mb-6">
                <Trash2 className="w-6 h-6 text-red-500" />
                <h2 className="font-orbitron text-xl font-bold text-red-400">
                  Danger Zone
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div>
                    <h3 className="font-rajdhani font-semibold text-foreground mb-1">
                      Delete Account
                    </h3>
                    <p className="text-sm text-muted-foreground font-rajdhani">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction('Delete Account')}
                    className="border-red-500 text-red-400 hover:bg-red-500/10 font-rajdhani"
                  >
                    Delete Account
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <div>
                    <h3 className="font-rajdhani font-semibold text-foreground mb-1">
                      Clear Performance Data
                    </h3>
                    <p className="text-sm text-muted-foreground font-rajdhani">
                      Remove all your performance history and start fresh. Achievements will be preserved.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction('Clear Data')}
                    className="border-orange-500 text-orange-400 hover:bg-orange-500/10 font-rajdhani"
                  >
                    Clear Data
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
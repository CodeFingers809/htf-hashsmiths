
import { motion } from 'framer-motion';
import { UserButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  User,
  Trophy,
  BarChart3,
  Settings,
  Users,
  MapPin,
  Menu,
  X,
  Bell,
  UserPlus
} from 'lucide-react';
import { ReactNode, useState, useEffect } from 'react';
import { useApi } from '@/hooks/use-api';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@clerk/clerk-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Competitions', href: '/events', icon: Calendar },
  { name: 'Team Builder', href: '/teams', icon: Users },
  { name: 'Find Network', href: '/network', icon: MapPin },
  { name: 'Connections', href: '/connections', icon: UserPlus },
  { name: 'Performance', href: '/performance', icon: BarChart3 },
  { name: 'Achievements', href: '/achievements', icon: Trophy },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation(); const pathname = location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { userId } = useAuth();

  // Fetch unread notifications count
  const { data: notificationsData, refetch } = useApi<{ notifications: any[] }>('/api/notifications?unread_only=true&limit=99');

  // Realtime subscription for notifications
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        () => {
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications'
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refetch]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Animated Grid Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,217,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,217,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] animate-pulse" />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-cyan-500/20">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="flex items-center gap-2">
            <h1 className="font-orbitron text-xl font-black neon-text">
              SCOUT<span className="neon-orange-text">LETE</span>
            </h1>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/notifications" className="relative p-2 cyber-border cyber-glow bg-card/30 hover:bg-card/50 transition-colors duration-300">
              <Bell className="w-5 h-5 text-cyan-400" />
              {notificationsData?.notifications && notificationsData.notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {notificationsData.notifications.length}
                </span>
              )}
            </Link>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 cyber-border cyber-glow"
                }
              }}
            />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 cyber-border cyber-glow bg-card/30 hover:bg-card/50 transition-colors duration-300"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isMobileMenuOpen ? 0 : '-100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-80 bg-card/95 backdrop-blur-xl border-r border-cyan-500/20"
      >
        <div className="p-6 pt-20">
          {/* Mobile Navigation */}
          <nav className="space-y-2 mb-8">
            <p className="text-xs font-rajdhani font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Main Menu
            </p>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                  <motion.div
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg font-rajdhani font-medium transition-all duration-300
                      ${isActive
                        ? 'bg-cyan-500/20 text-cyan-300 cyber-border cyber-glow'
                        : 'text-muted-foreground hover:text-foreground hover:bg-card/30'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : ''}`} />
                    {item.name}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

        </div>
      </motion.div>

      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:block w-72 min-h-screen bg-card/20 border-r border-cyan-500/20 backdrop-blur-xl"
        >
          <div className="p-6">
            {/* Logo */}
            <Link to="/" className="block mb-8">
              <h1 className="font-orbitron text-2xl font-black neon-text">
                SCOUT<span className="neon-orange-text">LETE</span>
              </h1>
              <div className="w-20 h-0.5 bg-gradient-to-r from-cyan-400 to-orange-500 mt-2 cyber-glow" />
            </Link>

            {/* User Profile Section */}
            <div className="cyber-card p-4 mb-8">
              <div className="flex items-center gap-3 mb-3">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10 cyber-border cyber-glow"
                    }
                  }}
                />
                <div>
                  <p className="font-rajdhani font-semibold text-sm text-cyan-300">Welcome back!</p>
                  <p className="font-rajdhani text-xs text-muted-foreground">Ready to compete?</p>
                </div>
              </div>
              {/* Notifications Button */}
              <Link to="/notifications" className="flex items-center justify-between p-2 rounded-lg cyber-border bg-card/30 hover:bg-card/50 transition-colors duration-300">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-cyan-400" />
                  <span className="font-rajdhani text-sm text-foreground">Notifications</span>
                </div>
                {notificationsData?.notifications && notificationsData.notifications.length > 0 && (
                  <span className="bg-orange-500 text-black text-xs font-bold rounded-full px-2 py-0.5">
                    {notificationsData.notifications.length}
                  </span>
                )}
              </Link>
            </div>

            {/* Main Navigation */}
            <nav className="space-y-2 mb-8">
              <p className="text-xs font-rajdhani font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Main Menu
              </p>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link key={item.name} href={item.href}>
                    <motion.div
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg font-rajdhani font-medium transition-all duration-300
                        ${isActive
                          ? 'bg-cyan-500/20 text-cyan-300 cyber-border cyber-glow'
                          : 'text-muted-foreground hover:text-foreground hover:bg-card/30'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : ''}`} />
                      {item.name}
                    </motion.div>
                  </Link>
                );
              })}
            </nav>


            {/* Version Info */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="text-center">
                <p className="text-xs font-rajdhani text-muted-foreground mb-2">
                  Made with ❤️ by <span className="text-cyan-400">Team Atlas</span>
                </p>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-4 md:p-8 pt-20 lg:pt-8"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Data Stream Effect */}
      <div className="fixed bottom-0 left-0 right-0 h-1 data-stream pointer-events-none" />
    </div>
  );
}
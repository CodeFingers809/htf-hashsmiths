import { motion } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useDashboardData, useEvents } from '@/hooks/use-data';
import {
  Trophy,
  Target,
  Calendar,
  TrendingUp,
  Award,
  Users,
  Clock,
  Zap,
  Loader2
} from 'lucide-react';


export default function Dashboard() {
  const { isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();

  // API hooks
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError } = useDashboardData();
  const { data: upcomingEvents, loading: eventsLoading } = useEvents({
    status: 'registration_open',
    limit: 2
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/sign-in');
    }
  }, [isLoaded, isSignedIn, navigate]);

  if (!isLoaded || dashboardLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="cyber-card p-8 text-center">
          <Loader2 className="animate-spin w-8 h-8 text-cyan-500 mx-auto mb-4" />
          <p className="font-rajdhani text-cyan-400">Loading Assessment Grid...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  if (dashboardError) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <div className="cyber-card p-8 text-center">
            <p className="font-rajdhani text-red-400">Error loading dashboard: {dashboardError}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Create stats from dashboard data
  const stats = dashboardData ? [
    {
      title: 'Total Events',
      value: dashboardData.stats.totalEvents.toString(),
      change: 'participated',
      icon: Target,
      color: 'text-cyan-400'
    },
    {
      title: 'Team Memberships',
      value: dashboardData.stats.totalTeams.toString(),
      change: 'active teams',
      icon: Users,
      color: 'text-green-500'
    },
    {
      title: 'Personal Records',
      value: dashboardData.stats.totalPRs.toString(),
      change: 'achievements',
      icon: Trophy,
      color: 'text-yellow-500'
    },
    {
      title: 'Profile Completion',
      value: `${dashboardData.stats.profileCompletion}%`,
      change: 'complete',
      icon: TrendingUp,
      color: 'text-orange-500'
    }
  ] : [];

  // Create recent activity from recent events and PRs
  const recentActivity: Array<{
    type: string;
    title: string;
    description: string;
    time: string;
    icon: any;
    color: string;
  }> = [];

  if (dashboardData?.recentEvents) {
    dashboardData.recentEvents.slice(0, 2).forEach(event => {
      recentActivity.push({
        type: 'event',
        title: event.title,
        description: `${event.level} level event • ${event.event_type}`,
        time: new Date(event.event_date).toLocaleDateString(),
        icon: Calendar,
        color: 'text-cyan-400'
      });
    });
  }

  if (dashboardData?.personalRecords) {
    dashboardData.personalRecords.slice(0, 1).forEach(pr => {
      recentActivity.push({
        type: 'pr',
        title: `New ${pr.category} Record`,
        description: `${pr.value} ${pr.unit} - ${pr.badge_level || 'Recorded'}`,
        time: new Date(pr.created_at).toLocaleDateString(),
        icon: Award,
        color: 'text-yellow-500'
      });
    });
  }

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
            ATHLETE DASHBOARD
          </h1>
          <p className="text-muted-foreground font-rajdhani text-lg">
            Track your progress, compete globally, achieve greatness
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-orange-500 mt-4 cyber-glow" />
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="cyber-card p-6 cyber-glow hover:border-cyan-500/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                  <span className="text-xs font-rajdhani text-muted-foreground uppercase">
                    {stat.title}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="font-orbitron text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className={`text-sm font-rajdhani ${stat.color}`}>
                    {stat.change}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="cyber-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-6 h-6 text-cyan-400" />
                <h2 className="font-orbitron text-xl font-bold neon-text">
                  Recent Activity
                </h2>
              </div>

              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <motion.div
                        key={`${activity.type}-${index}`}
                        whileHover={{ x: 5 }}
                        className="flex items-start gap-4 p-4 rounded-lg bg-card/30 hover:bg-card/50 transition-all duration-300"
                      >
                        <div className={`p-2 rounded-full bg-card/50 ${activity.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-rajdhani font-semibold text-foreground mb-1">
                            {activity.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {activity.description}
                          </p>
                          <p className="text-xs font-rajdhani text-cyan-400">
                            {activity.time}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="font-rajdhani text-muted-foreground">
                      No recent activity. Start participating in events to see updates here!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Performance Meter */}
            <div className="cyber-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-orange-500" />
                <h2 className="font-orbitron text-lg font-bold neon-orange-text">
                  Performance
                </h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-rajdhani text-muted-foreground">Profile Completion</span>
                  <span className="text-sm font-rajdhani font-semibold text-cyan-300">
                    {dashboardData?.stats.profileCompletion || 0}%
                  </span>
                </div>
                <div className="w-full bg-card/50 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-orange-500 h-2 rounded-full"
                    style={{width: `${dashboardData?.stats.profileCompletion || 0}%`}}
                  />
                </div>
                <p className="text-xs font-rajdhani text-muted-foreground">
                  {(dashboardData?.stats.profileCompletion || 0) > 80
                    ? "Excellent! Your profile is almost complete."
                    : "Complete your profile to unlock more features."}
                </p>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="cyber-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-6 h-6 text-cyan-400" />
                <h2 className="font-orbitron text-lg font-bold neon-text">
                  Upcoming
                </h2>
              </div>
              <div className="space-y-3">
                {upcomingEvents && upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event: any) => (
                    <div key={event.id} className="p-3 bg-card/30 rounded-lg">
                      <h3 className="font-rajdhani font-semibold text-sm text-orange-400">
                        {event.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.event_date).toLocaleDateString()} • {event.level} Level
                      </p>
                    </div>
                  ))
                ) : eventsLoading ? (
                  <div className="p-3 bg-card/30 rounded-lg text-center">
                    <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Loading events...</p>
                  </div>
                ) : (
                  <div className="p-3 bg-card/30 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">
                      No upcoming events. Check back later!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Community */}
            <div className="cyber-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-green-500" />
                <h2 className="font-orbitron text-lg font-bold text-green-400">
                  Community
                </h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-rajdhani">
                  <span className="text-muted-foreground">Team Memberships</span>
                  <span className="text-cyan-300 font-semibold">
                    {dashboardData?.stats.totalTeams || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-rajdhani">
                  <span className="text-muted-foreground">Personal Records</span>
                  <span className="text-orange-400 font-semibold">
                    {dashboardData?.stats.totalPRs || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-rajdhani">
                  <span className="text-muted-foreground">Events Joined</span>
                  <span className="text-green-400 font-semibold">
                    {dashboardData?.stats.totalEvents || 0}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
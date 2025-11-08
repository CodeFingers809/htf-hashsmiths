
import { motion } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { usePersonalRecords, useCurrentUser, useUserGoals, useUserAchievements } from '@/hooks/use-data';
import {
  TrendingUp,
  BarChart3,
  Target,
  Trophy,
  Zap,
  ArrowUp,
  ArrowDown,
  Activity,
  Award,
  Star
} from 'lucide-react';

export default function Performance() {
  const { isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();

  // API hooks
  const { data: personalRecords, loading: recordsLoading } = usePersonalRecords();
  const { data: userGoals, loading: goalsLoading } = useUserGoals({ status: 'active' });
  const { data: userAchievements, loading: achievementsLoading } = useUserAchievements();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="cyber-card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="font-rajdhani text-cyan-400">Loading Performance Data...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  // Process personal records to calculate performance metrics
  const verifiedRecords = personalRecords?.filter(record => record.verification_status === 'verified') || [];
  const totalRecords = personalRecords?.length || 0;
  const verificationRate = totalRecords > 0 ? Math.round((verifiedRecords.length / totalRecords) * 100) : 0;

  // Get recent records (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentRecords = personalRecords?.filter(record =>
    record.created_at && new Date(record.created_at) >= thirtyDaysAgo
  ) || [];

  // Process achievements data
  const totalAchievements = userAchievements?.length || 0;
  const showcasedAchievements = userAchievements?.filter(a => a.is_showcased)?.length || 0;
  const recentAchievements = userAchievements?.filter(achievement => {
    const unlockDate = new Date(achievement.unlocked_at);
    return unlockDate >= thirtyDaysAgo;
  })?.length || 0;

  const performanceMetrics = [
    {
      title: 'Total Records',
      value: totalRecords.toString(),
      change: `+${recentRecords.length}`,
      trend: 'up',
      icon: Trophy,
      color: 'text-yellow-500'
    },
    {
      title: 'Achievements',
      value: totalAchievements.toString(),
      change: recentAchievements > 0 ? `+${recentAchievements}` : '0',
      trend: recentAchievements > 0 ? 'up' : 'down',
      icon: Zap,
      color: 'text-purple-500'
    },
    {
      title: 'Verified Rate',
      value: `${verificationRate}%`,
      change: verifiedRecords.length > 0 ? '+' + Math.round((verifiedRecords.length / Math.max(totalRecords, 1)) * 10) + '%' : '0%',
      trend: verificationRate > 50 ? 'up' : 'down',
      icon: TrendingUp,
      color: 'text-green-500'
    },
    {
      title: 'Active Goals',
      value: (userGoals?.length || 0).toString(),
      change: userGoals?.filter(g => g.progress_percentage > 50)?.length > 0 ? `+${userGoals?.filter(g => g.progress_percentage > 50)?.length}` : '0',
      trend: (userGoals?.length || 0) > 0 ? 'up' : 'down',
      icon: Target,
      color: 'text-cyan-400'
    }
  ];

  // Get recent personal records for the tests section
  const recentTests = personalRecords?.slice(0, 4).map(record => ({
    name: record.category,
    date: record.achievement_date || record.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    score: record.value,
    unit: record.unit,
    improvement: record.verification_status === 'verified' ? 'Verified' : 'Pending',
    category: record.badge_level || 'General',
    color: record.verification_status === 'verified' ? 'text-green-400' : 'text-cyan-400'
  })) || [];

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
            PERFORMANCE ANALYTICS
          </h1>
          <p className="text-muted-foreground font-rajdhani text-lg">
            AI-powered insights • Real-time tracking • Data-driven improvement
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-orange-500 mt-4 cyber-glow" />
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {recordsLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="cyber-card p-6">
                <div className="animate-pulse">
                  <div className="w-8 h-8 bg-card/50 rounded mb-4"></div>
                  <div className="w-16 h-8 bg-card/50 rounded mb-1"></div>
                  <div className="w-24 h-4 bg-card/50 rounded"></div>
                </div>
              </div>
            ))
          ) : (
            performanceMetrics.map((metric) => {
            const Icon = metric.icon;
            const isPositive = metric.trend === 'up';

            return (
              <motion.div
                key={metric.title}
                whileHover={{ scale: 1.02 }}
                className="cyber-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`w-8 h-8 ${metric.color}`} />
                  <div className={`flex items-center text-xs font-rajdhani ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                    {metric.change}
                  </div>
                </div>
                <p className="font-orbitron text-3xl font-bold text-foreground mb-1">
                  {metric.value}
                </p>
                <p className="text-sm font-rajdhani text-muted-foreground">
                  {metric.title}
                </p>
              </motion.div>
            );
          })
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Chart */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="cyber-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-6 h-6 text-cyan-400" />
                <h2 className="font-orbitron text-xl font-bold neon-text">
                  Performance Trend
                </h2>
              </div>

              {/* Performance Chart based on real data */}
              <div className="h-64 bg-card/30 rounded-lg p-4 mb-4">
                {recordsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <div className="flex items-end justify-between h-full">
                    {/* Generate chart data from personal records */}
                    {Array.from({ length: 7 }, (_, index) => {
                      // Calculate progress based on record creation dates
                      const weekStart = new Date();
                      weekStart.setDate(weekStart.getDate() - (6 - index) * 7);
                      const weekEnd = new Date(weekStart);
                      weekEnd.setDate(weekEnd.getDate() + 7);

                      const weekRecords = personalRecords?.filter(record => {
                        const recordDate = new Date(record.created_at);
                        return recordDate >= weekStart && recordDate < weekEnd;
                      }) || [];

                      const recordCount = weekRecords.length;
                      const height = recordCount > 0 ? Math.min(recordCount * 20 + 40, 100) : 20;

                      return (
                        <motion.div
                          key={index}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                          className="bg-gradient-to-t from-cyan-500 to-orange-500 w-8 rounded-t cyber-glow relative group"
                          title={`${recordCount} records this week`}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-between text-sm font-rajdhani text-muted-foreground">
                <span>6 weeks ago</span>
                <span>5 weeks ago</span>
                <span>4 weeks ago</span>
                <span>3 weeks ago</span>
                <span>2 weeks ago</span>
                <span>Last week</span>
                <span>This week</span>
              </div>

              <div className="mt-6 p-4 bg-card/30 rounded-lg">
                <h3 className="font-rajdhani font-semibold text-cyan-300 mb-2">
                  AI Insights
                </h3>
                <p className="text-sm text-muted-foreground font-rajdhani">
                  {personalRecords && personalRecords.length > 0 ? (
                    `Based on your ${personalRecords.length} personal records, you show ${
                      verifiedRecords.length > personalRecords.length / 2 ? 'consistent' : 'improving'
                    } performance. ${
                      recentRecords.length > 0
                        ? `You've been active recently with ${recentRecords.length} new records.`
                        : 'Consider adding more recent performance data to track your progress.'
                    }`
                  ) : (
                    'Start tracking your personal records to get AI-powered insights about your performance trends and areas for improvement.'
                  )}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Recent Tests */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            <div className="cyber-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-6 h-6 text-orange-500" />
                <h2 className="font-orbitron text-lg font-bold neon-orange-text">
                  Recent Tests
                </h2>
              </div>

              <div className="space-y-4">
                {recordsLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="p-4 bg-card/30 rounded-lg">
                      <div className="animate-pulse">
                        <div className="w-32 h-4 bg-card/50 rounded mb-2"></div>
                        <div className="w-16 h-6 bg-card/50 rounded"></div>
                      </div>
                    </div>
                  ))
                ) : recentTests.length > 0 ? (
                  recentTests.map((test, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 5 }}
                    className="p-4 bg-card/30 rounded-lg hover:bg-card/50 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-rajdhani font-semibold text-foreground text-sm">
                        {test.name}
                      </h3>
                      <span className={`text-xs font-rajdhani px-2 py-1 rounded-full ${test.color} bg-card/50`}>
                        {test.category}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-orbitron text-lg font-bold text-cyan-300">
                          {test.score} {test.unit}
                        </span>
                        <span className={`text-xs font-rajdhani px-2 py-1 rounded ${test.improvement === 'Verified' ? 'text-green-400 bg-green-500/20' : 'text-orange-400 bg-orange-500/20'}`}>
                          {test.improvement}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground font-rajdhani">
                        {test.date}
                      </span>
                    </div>
                  </motion.div>
                  ))
                ) : (
                  <div className="p-4 bg-card/30 rounded-lg text-center">
                    <p className="text-muted-foreground font-rajdhani">
                      No personal records yet. Start tracking your performance!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Goals */}
            <div className="cyber-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-green-500" />
                <h2 className="font-orbitron text-lg font-bold text-green-400">
                  Active Goals
                </h2>
              </div>

              <div className="space-y-4">
                {goalsLoading ? (
                  Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="w-24 h-4 bg-card/50 rounded mb-2"></div>
                      <div className="w-full bg-card/50 rounded-full h-2 mb-1"></div>
                      <div className="w-32 h-3 bg-card/50 rounded"></div>
                    </div>
                  ))
                ) : userGoals && userGoals.length > 0 ? (
                  userGoals.slice(0, 3).map((goal: any) => {
                    const progressPercentage = goal.progress_percentage || 0;
                    const progressColor = progressPercentage >= 80 ? 'from-green-400 to-cyan-500' :
                                         progressPercentage >= 50 ? 'from-cyan-400 to-orange-500' :
                                         'from-orange-400 to-red-500';

                    return (
                      <div key={goal.id}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-rajdhani text-muted-foreground">
                            {goal.title}
                          </span>
                          <span className={`text-sm font-rajdhani ${
                            progressPercentage >= 80 ? 'text-green-300' :
                            progressPercentage >= 50 ? 'text-cyan-300' : 'text-orange-300'
                          }`}>
                            {progressPercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-card/50 rounded-full h-2">
                          <div
                            className={`bg-gradient-to-r ${progressColor} h-2 rounded-full transition-all duration-300`}
                            style={{width: `${progressPercentage}%`}}
                          />
                        </div>
                        <p className="text-xs font-rajdhani text-muted-foreground mt-1">
                          Target: {goal.target_value} {goal.target_unit} • Current: {goal.current_value || 0} {goal.target_unit}
                          {goal.target_date && (
                            <span className="ml-2">• Due: {new Date(goal.target_date).toLocaleDateString()}</span>
                          )}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4">
                    <Target className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground font-rajdhani text-sm">
                      No active goals set. Create goals to track your progress!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="cyber-card p-6 mt-6">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-6 h-6 text-purple-500" />
                <h2 className="font-orbitron text-lg font-bold text-purple-400">
                  Recent Achievements
                </h2>
              </div>

              <div className="space-y-3">
                {achievementsLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="animate-pulse p-3 bg-card/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-card/50 rounded"></div>
                        <div className="flex-1">
                          <div className="w-24 h-4 bg-card/50 rounded mb-1"></div>
                          <div className="w-32 h-3 bg-card/50 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : userAchievements && userAchievements.length > 0 ? (
                  userAchievements.slice(0, 4).map((userAchievement: any) => {
                    const achievement = userAchievement.achievement;
                    const rarityColors = {
                      common: 'text-gray-400 bg-gray-500/20',
                      uncommon: 'text-green-400 bg-green-500/20',
                      rare: 'text-blue-400 bg-blue-500/20',
                      epic: 'text-purple-400 bg-purple-500/20',
                      legendary: 'text-yellow-400 bg-yellow-500/20'
                    };
                    const rarityColor = rarityColors[achievement.rarity as keyof typeof rarityColors] || rarityColors.common;

                    return (
                      <motion.div
                        key={userAchievement.id}
                        whileHover={{ x: 5 }}
                        className="p-3 bg-card/30 rounded-lg hover:bg-card/50 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded flex items-center justify-center ${rarityColor}`}>
                            {achievement.badge_icon ? (
                              <span className="text-lg">{achievement.badge_icon}</span>
                            ) : (
                              <Award className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-rajdhani font-semibold text-foreground text-sm">
                                {achievement.name}
                              </h3>
                              <span className={`text-xs font-rajdhani px-2 py-0.5 rounded ${rarityColor}`}>
                                {achievement.rarity}
                              </span>
                              {userAchievement.is_showcased && (
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground font-rajdhani">
                              {achievement.description} • Unlocked {new Date(userAchievement.unlocked_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-orbitron font-bold text-cyan-300">
                              +{achievement.points || 0}
                            </span>
                            <p className="text-xs text-muted-foreground font-rajdhani">points</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-4">
                    <Award className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground font-rajdhani text-sm">
                      No achievements unlocked yet. Keep training to earn your first achievement!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
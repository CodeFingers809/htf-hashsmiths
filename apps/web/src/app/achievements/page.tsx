
import { motion } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Trophy,
  Medal,
  Star,
  Target,
  Zap,
  TrendingUp,
  Award,
  Crown,
  Shield,
  Flame
} from 'lucide-react';

export default function Achievements() {
  const { isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();

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
          <p className="font-rajdhani text-cyan-400">Loading Achievements...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  const achievementStats = [
    { title: 'Total Earned', value: '24', icon: Trophy, color: 'text-yellow-500' },
    { title: 'This Month', value: '5', icon: Medal, color: 'text-cyan-400' },
    { title: 'Rare Badges', value: '3', icon: Crown, color: 'text-purple-500' },
    { title: 'Points Earned', value: '1,240', icon: Star, color: 'text-orange-500' }
  ];

  const unlockedAchievements = [
    {
      title: 'First Steps',
      description: 'Complete your first virtual trial',
      icon: Target,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
      date: '2024-08-15',
      points: 50,
      rarity: 'Common'
    },
    {
      title: 'Speed Demon',
      description: 'Achieve sub-13 second 100m sprint time',
      icon: Zap,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/20',
      date: '2024-08-28',
      points: 100,
      rarity: 'Uncommon'
    },
    {
      title: 'Rising Star',
      description: 'Rank in top 500 nationally',
      icon: Star,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/20',
      date: '2024-09-05',
      points: 200,
      rarity: 'Rare'
    },
    {
      title: 'Consistency King',
      description: 'Complete trials for 30 consecutive days',
      icon: Shield,
      color: 'text-green-500',
      bgColor: 'bg-green-500/20',
      date: '2024-09-20',
      points: 150,
      rarity: 'Uncommon'
    },
    {
      title: 'Perfect Score',
      description: 'Achieve 100% accuracy in technique analysis',
      icon: Crown,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/20',
      date: '2024-09-22',
      points: 300,
      rarity: 'Epic'
    },
    {
      title: 'Improvement Master',
      description: 'Show 25% performance improvement',
      icon: TrendingUp,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/20',
      date: '2024-09-25',
      points: 175,
      rarity: 'Rare'
    }
  ];

  const lockedAchievements = [
    {
      title: 'National Champion',
      description: 'Rank #1 in your age category nationally',
      icon: Crown,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/10',
      points: 500,
      rarity: 'Legendary'
    },
    {
      title: 'Olympic Prospect',
      description: 'Get selected for national training program',
      icon: Medal,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/10',
      points: 1000,
      rarity: 'Legendary'
    },
    {
      title: 'Mentor',
      description: 'Help 10 athletes improve their performance',
      icon: Award,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/10',
      points: 250,
      rarity: 'Epic'
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-gray-400';
      case 'Uncommon': return 'text-green-400';
      case 'Rare': return 'text-blue-400';
      case 'Epic': return 'text-purple-400';
      case 'Legendary': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

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
            ACHIEVEMENTS
          </h1>
          <p className="text-muted-foreground font-rajdhani text-lg">
            Unlock badges • Earn points • Showcase your progress
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-orange-500 mt-4 cyber-glow" />
        </motion.div>

        {/* Achievement Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {achievementStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                whileHover={{ scale: 1.02 }}
                className="cyber-card p-6 text-center"
              >
                <Icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                <p className="font-orbitron text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                </p>
                <p className="text-sm font-rajdhani text-muted-foreground">
                  {stat.title}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Achievement Sections */}
        <div className="space-y-8">
          {/* Unlocked Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h2 className="font-orbitron text-2xl font-bold text-yellow-400">
                Earned Achievements
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-yellow-500/30 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {unlockedAchievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <motion.div
                    key={achievement.title}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className={`cyber-card p-6 ${achievement.bgColor} border-opacity-60 hover:border-opacity-100 transition-all duration-300`}
                  >
                    <div className="text-center mb-4">
                      <div className={`w-16 h-16 rounded-full ${achievement.bgColor} flex items-center justify-center mx-auto mb-3 cyber-glow`}>
                        <Icon className={`w-8 h-8 ${achievement.color}`} />
                      </div>
                      <h3 className="font-orbitron text-lg font-bold text-foreground mb-1">
                        {achievement.title}
                      </h3>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-rajdhani ${getRarityColor(achievement.rarity)} bg-card/30`}>
                        <Flame className="w-3 h-3 mr-1" />
                        {achievement.rarity}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground font-rajdhani mb-4 text-center">
                      {achievement.description}
                    </p>

                    <div className="flex justify-between items-center text-xs font-rajdhani">
                      <span className="text-cyan-400">
                        +{achievement.points} points
                      </span>
                      <span className="text-muted-foreground">
                        {achievement.date}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Locked Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-muted-foreground" />
              <h2 className="font-orbitron text-2xl font-bold text-muted-foreground">
                Upcoming Challenges
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-muted-foreground/30 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lockedAchievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <motion.div
                    key={achievement.title}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    whileHover={{ y: -2 }}
                    className="cyber-card p-6 bg-card/20 opacity-60 hover:opacity-80 transition-all duration-300"
                  >
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-3 relative">
                        <Icon className="w-8 h-8 text-muted-foreground" />
                        <div className="absolute inset-0 bg-background/20 rounded-full flex items-center justify-center">
                          <Shield className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                      <h3 className="font-orbitron text-lg font-bold text-muted-foreground mb-1">
                        {achievement.title}
                      </h3>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-rajdhani ${getRarityColor(achievement.rarity)} bg-card/30`}>
                        <Flame className="w-3 h-3 mr-1" />
                        {achievement.rarity}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground font-rajdhani mb-4 text-center">
                      {achievement.description}
                    </p>

                    <div className="text-center">
                      <span className="text-xs font-rajdhani text-muted-foreground">
                        Reward: +{achievement.points} points
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Progress Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="cyber-card p-6"
          >
            <h3 className="font-orbitron text-xl font-bold neon-text mb-6">
              Achievement Progress
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-rajdhani text-muted-foreground">Speed Achievements</span>
                    <span className="text-sm font-rajdhani text-cyan-300">3/5</span>
                  </div>
                  <div className="w-full bg-card/50 rounded-full h-2">
                    <div className="bg-gradient-to-r from-cyan-400 to-orange-500 h-2 rounded-full" style={{width: '60%'}} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-rajdhani text-muted-foreground">Consistency Achievements</span>
                    <span className="text-sm font-rajdhani text-green-300">4/6</span>
                  </div>
                  <div className="w-full bg-card/50 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-400 to-cyan-500 h-2 rounded-full" style={{width: '66%'}} />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-rajdhani text-muted-foreground">Competition Achievements</span>
                    <span className="text-sm font-rajdhani text-orange-300">2/7</span>
                  </div>
                  <div className="w-full bg-card/50 rounded-full h-2">
                    <div className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full" style={{width: '28%'}} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-rajdhani text-muted-foreground">Special Achievements</span>
                    <span className="text-sm font-rajdhani text-purple-300">1/4</span>
                  </div>
                  <div className="w-full bg-card/50 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full" style={{width: '25%'}} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
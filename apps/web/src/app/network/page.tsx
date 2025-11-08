
import { motion } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Users,
  Star,
  MessageCircle,
  Search,
  Award,
  Calendar,
  Clock,
  ChevronRight,
  User,
  GraduationCap,
  Target
} from 'lucide-react';
import { useCoaches, useAthletes, useCreateConnection } from '@/hooks/use-data';
import { useAlert } from '@/components/ui/notification';


const filterOptions = ['All', 'Coaches', 'Athletes', 'Within 5km', 'Within 10km', 'Verified Only'];

export default function Network() {
  const { isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Connection hooks
  const { mutate: createConnection, loading: connectingUser } = useCreateConnection();
  const toast = useAlert();

  // API hooks
  const { data: coaches, loading: loadingCoaches, pagination: coachesPagination } = useCoaches({
    page: 1,
    limit: 10
  });
  const { data: athletes, loading: loadingAthletes, pagination: athletesPagination } = useAthletes({
    page: 1,
    limit: 10
  });

  // Handler for connecting with coaches/athletes
  const handleConnect = async (userId: string, userType: string) => {
    try {
      await createConnection({
        connected_user_id: userId,
        connection_type: userType === 'coach' ? 'coaching_request' : 'follow',
        message: `Hi! I'd like to connect with you on SCOUTLETE.`
      });

      toast.success('Connection request sent successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to send connection request. Please try again.');
    }
  };

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
          <p className="font-rajdhani text-cyan-400">Loading Network...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
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
            FIND NETWORK
          </h1>
          <p className="text-muted-foreground font-rajdhani text-lg">
            Connect with coaches and athletes near you • Build your sports network
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-orange-500 mt-4 cyber-glow" />
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Search coaches, athletes, or sports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-card/30 border border-cyan-500/20 rounded-lg focus:border-cyan-500/50 focus:outline-none font-rajdhani text-foreground placeholder-muted-foreground"
            />
          </div>

          {/* Filter Options */}
          <div className="flex flex-wrap gap-3">
            {filterOptions.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`
                  px-4 py-2 rounded-lg font-rajdhani font-semibold transition-all duration-300
                  ${activeFilter === filter
                    ? 'cyber-border cyber-glow bg-cyan-500/20 text-cyan-300'
                    : 'bg-card/30 text-muted-foreground hover:text-foreground hover:bg-card/50'
                  }
                `}
              >
                {filter}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Network Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="cyber-card p-4 text-center">
            <GraduationCap className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="font-orbitron text-xl font-bold text-foreground">
              {coachesPagination?.count || 0}
            </p>
            <p className="text-sm font-rajdhani text-muted-foreground">Verified Coaches</p>
          </div>
          <div className="cyber-card p-4 text-center">
            <Users className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <p className="font-orbitron text-xl font-bold text-foreground">
              {athletesPagination?.count || 0}
            </p>
            <p className="text-sm font-rajdhani text-muted-foreground">Active Athletes</p>
          </div>
          <div className="cyber-card p-4 text-center">
            <Target className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="font-orbitron text-xl font-bold text-foreground">
              {coaches && coaches.length > 0 ? coaches.reduce((sum: number, coach: any) => sum + (coach.experience_years || 0), 0) : 0}
            </p>
            <p className="text-sm font-rajdhani text-muted-foreground">Total Experience Years</p>
          </div>
          <div className="cyber-card p-4 text-center">
            <Award className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="font-orbitron text-xl font-bold text-foreground">
              {coaches && coaches.length > 0 ? Math.round(coaches.reduce((sum: number, coach: any) => sum + (coach.rating || 0), 0) / coaches.length * 10) / 10 : 0}
            </p>
            <p className="text-sm font-rajdhani text-muted-foreground">Avg Rating</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Coaches Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="font-orbitron text-2xl font-bold text-cyan-300 mb-6 flex items-center gap-3">
              <GraduationCap className="w-6 h-6" />
              Nearby Coaches
            </h2>
            <div className="space-y-6">
              {loadingCoaches ? (
                <div className="cyber-card p-6 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground font-rajdhani">Loading coaches...</p>
                </div>
              ) : coaches && coaches.length > 0 ? (
                coaches.map((coach: any) => (
                <motion.div
                  key={coach.id}
                  whileHover={{ scale: 1.01 }}
                  className="cyber-card p-6 border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-orange-500/20 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-cyan-400" />
                      </div>
                      {coach.user?.is_verified && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <Award className="w-3 h-3 text-black" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-orbitron text-lg font-bold text-foreground">
                          {coach.user?.display_name || `${coach.user?.first_name || ''} ${coach.user?.last_name || ''}`.trim() || 'Coach'}
                        </h3>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-rajdhani text-foreground">{coach.rating || 0}</span>
                          <span className="text-sm font-rajdhani text-muted-foreground">({coach.total_reviews || 0})</span>
                        </div>
                      </div>
                      <p className="text-cyan-400 font-rajdhani font-semibold mb-2">
                        {coach.specialization?.join(', ') || 'General Coaching'}
                      </p>
                      {coach.bio && (
                        <p className="text-sm text-muted-foreground font-rajdhani mb-3 line-clamp-2">
                          {coach.bio}
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-4 text-sm font-rajdhani mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-orange-500" />
                          <span className="text-foreground">
                            {coach.user?.city || coach.user?.state ?
                              `${coach.user?.city || ''}${coach.user?.city && coach.user?.state ? ', ' : ''}${coach.user?.state || ''}` :
                              'Location not specified'
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-green-500" />
                          <span className="text-foreground">Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-purple-500" />
                          <span className="text-foreground">{coach.experience_years || 0} years</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-cyan-500" />
                          <span className="text-foreground">Available soon</span>
                        </div>
                      </div>
                      {coach.certifications && coach.certifications.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {coach.certifications.map((cert: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-rajdhani rounded"
                            >
                              {cert}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="font-orbitron text-lg font-bold text-cyan-300">
                          ₹{coach.hourly_rate ? Number(coach.hourly_rate).toLocaleString() : 0}/hour
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="cyber-border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
                            onClick={() => handleConnect(coach.user_id || coach.id, 'coach')}
                            disabled={connectingUser}
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            {connectingUser ? 'Connecting...' : 'Connect'}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => navigate(`/users/${coach.user_id || coach.id}`)}
                            className="bg-cyan-500 hover:bg-cyan-400 text-black font-rajdhani"
                          >
                            View Profile
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                ))
              ) : (
                <div className="cyber-card p-6 text-center">
                  <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-orbitron text-xl font-bold text-foreground mb-2">No Coaches Found</h3>
                  <p className="text-muted-foreground font-rajdhani">
                    No verified coaches available at the moment. Check back later!
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Athletes Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="font-orbitron text-2xl font-bold text-orange-400 mb-6 flex items-center gap-3">
              <Users className="w-6 h-6" />
              Nearby Athletes
            </h2>
            <div className="space-y-6">
              {loadingAthletes ? (
                <div className="cyber-card p-6 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground font-rajdhani">Loading athletes...</p>
                </div>
              ) : athletes && athletes.length > 0 ? (
                athletes.map((athlete: any) => (
                <motion.div
                  key={athlete.id}
                  whileHover={{ scale: 1.01 }}
                  className="cyber-card p-6 border-orange-500/30 hover:border-orange-500/60 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-cyan-500/20 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-orange-400" />
                      </div>
                      {athlete.is_verified && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <Award className="w-3 h-3 text-black" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-orbitron text-lg font-bold text-foreground">
                          {athlete.display_name || `${athlete.first_name || ''} ${athlete.last_name || ''}`.trim() || 'Athlete'}
                        </h3>
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-rajdhani rounded">
                          {athlete.primary_sport?.experience_level || 'Beginner'}
                        </span>
                      </div>
                      <p className="text-orange-400 font-rajdhani font-semibold mb-2">
                        {athlete.primary_sport?.sport_name || 'General Sports'} • Age {athlete.age || 'N/A'}
                      </p>
                      <div className="grid grid-cols-1 gap-2 text-sm font-rajdhani mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-cyan-500" />
                          <span className="text-foreground">
                            {athlete.city || athlete.state ?
                              `${athlete.city || ''}${athlete.city && athlete.state ? ', ' : ''}${athlete.state || ''}` :
                              'Location not specified'
                            }
                          </span>
                        </div>
                        {athlete.best_personal_record && (
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-green-500" />
                            <span className="text-foreground">
                              PB: {athlete.best_personal_record.value} {athlete.best_personal_record.unit} ({athlete.best_personal_record.category})
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-500" />
                          <span className="text-foreground">
                            {athlete.primary_sport?.years_experience ? `${athlete.primary_sport.years_experience} years experience` : 'Available for training'}
                          </span>
                        </div>
                      </div>
                      {athlete.personal_records && athlete.personal_records.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {athlete.personal_records.slice(0, 3).map((record: any, index: number) => (
                            <span
                              key={index}
                              className={`px-2 py-1 text-xs font-rajdhani rounded ${
                                record.verification_status === 'verified'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-cyan-500/20 text-cyan-400'
                              }`}
                            >
                              {record.category}: {record.value} {record.unit}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-rajdhani text-muted-foreground">
                          Looking for: <span className="text-orange-400">Training Partners</span>
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="cyber-border border-orange-500 text-orange-400 hover:bg-orange-500/10"
                            onClick={() => handleConnect(athlete.id, 'athlete')}
                            disabled={connectingUser}
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            {connectingUser ? 'Connecting...' : 'Connect'}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => navigate(`/users/${athlete.id}`)}
                            className="bg-orange-500 hover:bg-orange-400 text-black font-rajdhani"
                          >
                            View Profile
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                ))
              ) : (
                <div className="cyber-card p-6 text-center">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-orbitron text-xl font-bold text-foreground mb-2">No Athletes Found</h3>
                  <p className="text-muted-foreground font-rajdhani">
                    No active athletes available at the moment. Check back later!
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Load More */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <Button
            variant="outline"
            className="cyber-border px-8 py-3 font-rajdhani font-semibold border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
          >
            Load More Results
          </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
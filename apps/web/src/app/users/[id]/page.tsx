
import { motion } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  User,
  MapPin,
  Calendar,
  Trophy,
  Target,
  Star,
  Award,
  MessageCircle,
  UserPlus,
  BarChart3,
  Clock,
  Medal,
  Shield
} from 'lucide-react';

export default function PublicProfile() {
  const { isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const params = useParams();
  const userId = params.id as string;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (userId) {
      fetchPublicProfile();
    }
  }, [userId]);

  const fetchPublicProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Profile not found or is private');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="cyber-card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="font-rajdhani text-cyan-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="cyber-card p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="font-rajdhani text-cyan-400">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !profile) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="cyber-card p-8 text-center">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-orbitron text-xl font-bold text-foreground mb-2">Profile Not Found</h2>
            <p className="text-muted-foreground font-rajdhani mb-4">
              {error || 'This profile does not exist or is set to private.'}
            </p>
            <Button
              onClick={() => router.back()}
              className="cyber-border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
            >
              Go Back
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(profile.date_of_birth);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mb-4 cyber-border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
          >
            ← Back
          </Button>

          <div className="cyber-card p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Profile Avatar */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-orange-500/20 rounded-lg flex items-center justify-center">
                    <User className="w-16 h-16 text-cyan-400" />
                  </div>
                  {profile.is_verified && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-black" />
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  <div className="mb-4 lg:mb-0">
                    <h1 className="font-orbitron text-3xl font-bold neon-text mb-2">
                      {profile.display_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Athlete'}
                    </h1>

                    <div className="flex flex-wrap gap-4 text-sm font-rajdhani text-muted-foreground mb-4">
                      {profile.city && profile.state && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-cyan-400" />
                          {profile.city}, {profile.state}
                        </div>
                      )}
                      {age && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-orange-400" />
                          {age} years old
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-green-400" />
                        Joined {new Date(profile.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {profile.bio && (
                      <p className="text-muted-foreground font-rajdhani mb-4">
                        {profile.bio}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      className="cyber-border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
                      variant="outline"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button
                      className="bg-cyan-500 hover:bg-cyan-400 text-black font-rajdhani"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sports & Skills */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Sports */}
            {profile.user_sports && profile.user_sports.length > 0 && (
              <div className="cyber-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Target className="w-6 h-6 text-cyan-400" />
                  <h2 className="font-orbitron text-xl font-bold neon-text">Sports</h2>
                </div>

                <div className="space-y-4">
                  {profile.user_sports.map((sport: any, index: number) => (
                    <div key={index} className="p-4 bg-card/30 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-rajdhani font-semibold text-foreground">
                          {sport.sport_name}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-rajdhani ${
                          sport.experience_level === 'Expert' ? 'bg-orange-500/20 text-orange-400' :
                          sport.experience_level === 'Advanced' ? 'bg-cyan-500/20 text-cyan-400' :
                          sport.experience_level === 'Intermediate' ? 'bg-green-500/20 text-green-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {sport.experience_level}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground font-rajdhani">
                        <span>{sport.years_experience} years experience</span>
                        {sport.is_primary && (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                            Primary Sport
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personal Records */}
            {profile.personal_records && profile.personal_records.length > 0 && (
              <div className="cyber-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="w-6 h-6 text-orange-500" />
                  <h2 className="font-orbitron text-xl font-bold neon-orange-text">Personal Records</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.personal_records.slice(0, 6).map((record: any, index: number) => (
                    <div key={index} className="p-4 bg-card/30 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-rajdhani font-semibold text-foreground text-sm">
                          {record.category}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-rajdhani ${
                          record.verification_status === 'verified' ? 'bg-green-500/20 text-green-400' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>
                          {record.verification_status === 'verified' ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-orbitron text-lg font-bold text-cyan-300">
                          {record.value} {record.unit}
                        </span>
                        {record.badge_level && (
                          <span className="text-xs text-muted-foreground font-rajdhani">
                            {record.badge_level}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Stats Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Quick Stats */}
            <div className="cyber-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <h2 className="font-orbitron text-lg font-bold text-yellow-400">Stats</h2>
              </div>

              <div className="space-y-4">
                <div className="text-center p-3 bg-card/30 rounded-lg">
                  <p className="font-orbitron text-2xl font-bold text-cyan-300">
                    {profile.personal_records?.filter((r: any) => r.verification_status === 'verified').length || 0}
                  </p>
                  <p className="text-xs font-rajdhani text-muted-foreground">Verified Records</p>
                </div>

                <div className="text-center p-3 bg-card/30 rounded-lg">
                  <p className="font-orbitron text-2xl font-bold text-orange-300">
                    {profile.user_sports?.length || 0}
                  </p>
                  <p className="text-xs font-rajdhani text-muted-foreground">Sports</p>
                </div>

                <div className="text-center p-3 bg-card/30 rounded-lg">
                  <p className="font-orbitron text-2xl font-bold text-green-300">
                    {profile.personal_records?.filter((r: any) => r.badge_level).length || 0}
                  </p>
                  <p className="text-xs font-rajdhani text-muted-foreground">Achievements</p>
                </div>
              </div>
            </div>

            {/* Badges/Achievements Preview */}
            {profile.personal_records && profile.personal_records.some((r: any) => r.badge_level) && (
              <div className="cyber-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Medal className="w-6 h-6 text-purple-500" />
                  <h2 className="font-orbitron text-lg font-bold text-purple-400">Achievements</h2>
                </div>

                <div className="space-y-2">
                  {profile.personal_records
                    .filter((r: any) => r.badge_level)
                    .slice(0, 5)
                    .map((record: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-card/30 rounded">
                        <Award className="w-4 h-4 text-yellow-500" />
                        <div>
                          <p className="text-sm font-rajdhani font-semibold text-foreground">
                            {record.badge_level}
                          </p>
                          <p className="text-xs text-muted-foreground font-rajdhani">
                            {record.category}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
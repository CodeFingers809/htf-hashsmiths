
import { motion } from 'framer-motion';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/common/file-upload';
import { useAlert, useConfirm } from '@/components/ui/notification';
import {
  useCurrentUser,
  useUpdateUser,
  usePersonalRecords,
  useCreatePersonalRecord,
  useDeletePersonalRecord,
  useSportsCategories
} from '@/hooks/use-data';
import { useApi } from '@/hooks/use-api';
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Edit3,
  Trophy,
  Target,
  Medal,
  Shield,
  Plus,
  CheckCircle,
  Weight,
  Zap,
  Activity,
  Award,
  Video,
  X,
  Save,
  Loader2,
  Trash2
} from 'lucide-react';
import statesAndCities from 'indian-states-cities';

// Badge configuration
const BADGE_CONFIG = {
  'Elite': { color: 'text-yellow-500', icon: Award },
  'Strong': { color: 'text-purple-500', icon: Weight },
  'Fast': { color: 'text-cyan-500', icon: Zap },
  'Endurance': { color: 'text-green-500', icon: Activity },
};

export default function Profile() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const navigate = useNavigate();
  const toast = useAlert();
  const confirm = useConfirm();

  const [activeTab, setActiveTab] = useState<'overview' | 'personal-records'>('overview');
  const [showAddPR, setShowAddPR] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  // API hooks
  const { data: user, loading: userLoading, refetch: refetchUser } = useCurrentUser();
  const { data: personalRecords, loading: prLoading, refetch: refetchPRs } = usePersonalRecords();
  const { data: connectionsData } = useApi<{ connections: any[] }>('/api/connections?type=friends');
  const { data: sportsData, loading: sportsLoading } = useSportsCategories();
  const { mutate: updateUser, loading: updating } = useUpdateUser();
  const { mutate: createPR, loading: creatingPR } = useCreatePersonalRecord();
  const { mutate: deletePR, loading: deletingPR } = useDeletePersonalRecord();

  // Debug sports data
  useEffect(() => {
  }, [sportsData, sportsLoading]);

  // Form states
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    state: '',
    city: '',
    address: '',
    pincode: '',
  });

  // Get all states for autocomplete
  const allStates = statesAndCities.allStates();

  // Get cities for selected state
  const citiesForSelectedState = profileForm.state
    ? statesAndCities.citiesForState(profileForm.state)
    : [];

  const [prForm, setPrForm] = useState({
    sport_category_id: '',
    category: '',
    value: '',
    unit: '',
    description: '',
    achievement_date: '',
    location: '',
    event_context: '',
    primary_video_id: '',
  });

  // Time input state for compound time values
  const [timeInput, setTimeInput] = useState({
    hours: '',
    minutes: '',
    seconds: '',
  });

  // Check if unit is time-based
  const isTimeUnit = (unit: string) => {
    const timeUnits = ['seconds', 'second', 'sec', 'minutes', 'minute', 'min', 'hours', 'hour', 'hr', 'time'];
    return timeUnits.some(tu => unit.toLowerCase().includes(tu));
  };

  // Convert compound time to seconds
  const convertTimeToSeconds = () => {
    const h = parseInt(timeInput.hours) || 0;
    const m = parseInt(timeInput.minutes) || 0;
    const s = parseFloat(timeInput.seconds) || 0;
    return h * 3600 + m * 60 + s;
  };

  // Format seconds for display
  const formatSecondsForDisplay = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = (totalSeconds % 60).toFixed(2);

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (parseFloat(seconds) > 0) parts.push(`${seconds}s`);

    return parts.join(' ') || '0s';
  };

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || '',
        state: user.state || '',
        city: user.city || '',
        address: user.address || '',
        pincode: user.pincode || '',
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      await updateUser({
        ...profileForm,
        gender: profileForm.gender as 'male' | 'female' | 'other' | 'prefer_not_to_say'
      });
      await refetchUser();
      setShowEditProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCreatePR = async () => {
    try {
      if (!prForm.sport_category_id || !prForm.category || !prForm.unit) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Calculate final value based on unit type
      let finalValue: number;
      if (isTimeUnit(prForm.unit)) {
        finalValue = convertTimeToSeconds();
        if (finalValue === 0) {
          toast.error('Please enter a valid time value');
          return;
        }
      } else {
        finalValue = parseFloat(prForm.value);
        if (isNaN(finalValue) || finalValue === 0) {
          toast.error('Please enter a valid numeric value');
          return;
        }
      }

      await createPR({
        ...prForm,
        user_id: user!.id,
        value: finalValue,
        unit: isTimeUnit(prForm.unit) ? 'seconds' : prForm.unit, // Normalize time units to seconds
      });

      await refetchPRs();
      setShowAddPR(false);
      setPrForm({
        sport_category_id: '',
        category: '',
        value: '',
        unit: '',
        description: '',
        achievement_date: '',
        location: '',
        event_context: '',
        primary_video_id: '',
      });
      setTimeInput({ hours: '', minutes: '', seconds: '' });
    } catch (error) {
      console.error('Error creating PR:', error);
    }
  };

  const handleVideoUpload = (file: any) => {
    setPrForm(prev => ({ ...prev, primary_video_id: file.id }));
    toast.success('Video uploaded successfully');
  };

  const handleViewVideo = async (filePath: string) => {
    try {
      // Generate signed URL for secure video access
      const response = await fetch('/api/files/signed-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath,
          bucket: 'pr-videos',
          expiresIn: 3600 // 1 hour
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate video URL');
      }

      const { signedUrl } = await response.json();
      setSelectedVideoUrl(signedUrl);
      setShowVideoModal(true);
    } catch (error) {
      toast.error('Failed to load video');
      console.error('Error loading video:', error);
    }
  };

  const handleDeletePR = async (recordId: string, recordCategory: string) => {
    const confirmed = await confirm({
      title: 'Delete Personal Record',
      message: `Are you sure you want to delete "${recordCategory}"? This will also delete any associated videos and cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (!confirmed) return;

    try {
      await deletePR({ id: recordId });
      await refetchPRs();
      toast.success('Personal record deleted successfully');
    } catch (error) {
      toast.error('Failed to delete personal record');
      console.error('Error deleting PR:', error);
    }
  };

  if (!isLoaded || userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="cyber-card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="font-rajdhani text-cyan-400">Loading Profile Data...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn || !clerkUser || !user) {
    return null;
  }

  const profileStats = [
    {
      title: 'Connections',
      value: connectionsData?.connections?.length.toString() || '0',
      icon: User,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    },
    {
      title: 'PRs Verified',
      value: personalRecords?.filter(pr => pr.verification_status === 'verified').length.toString() || '0',
      icon: CheckCircle,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20'
    },
    {
      title: 'Total Records',
      value: personalRecords?.length.toString() || '0',
      icon: Trophy,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/20'
    },
    {
      title: 'Badge Count',
      value: personalRecords?.filter(pr => pr.badge_level).length.toString() || '0',
      icon: Medal,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/20'
    },
    {
      title: 'Profile Complete',
      value: `${user.profile_completion_percentage || 0}%`,
      icon: Target,
      color: 'text-green-500',
      bgColor: 'bg-green-500/20'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="cyber-card p-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 cyber-border cyber-glow rounded-full overflow-hidden">
                <img
                  src={user.avatar_url || clerkUser.imageUrl || '/default-avatar.png'}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              {user.is_verified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                  <Shield className="w-3 h-3 text-black" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <div>
                  <h1 className="font-orbitron text-3xl font-black neon-text">
                    {user.display_name || `${user.first_name} ${user.last_name}`.trim() || 'Athlete'}
                  </h1>
                  <p className="font-rajdhani text-muted-foreground capitalize">
                    {user.account_type} • {user.city && user.state ? `${user.city}, ${user.state}` : 'Location not set'}
                  </p>
                </div>

                <Button
                  onClick={() => setShowEditProfile(true)}
                  variant="outline"
                  className="cyber-border border-cyan-500/40 hover:border-cyan-500 text-cyan-400"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {user.phone}
                  </div>
                )}
                {user.date_of_birth && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Born {new Date(user.date_of_birth).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {profileStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="cyber-card p-6 text-center"
              >
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="font-orbitron text-2xl font-bold neon-text">{stat.value}</p>
                <p className="font-rajdhani text-muted-foreground text-sm">{stat.title}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="cyber-card">
          <div className="flex border-b border-cyan-500/20">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'personal-records', label: 'Personal Records', icon: Trophy }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center gap-2 px-6 py-4 font-rajdhani font-semibold transition-all duration-300
                    ${activeTab === tab.id
                      ? 'text-cyan-300 border-b-2 border-cyan-500'
                      : 'text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-orbitron text-xl font-bold neon-text mb-4">Profile Completion</h3>
                  <div className="w-full bg-background/50 rounded-full h-3 cyber-border">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-400 to-orange-500 rounded-full cyber-glow"
                      initial={{ width: 0 }}
                      animate={{ width: `${user.profile_completion_percentage || 0}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                  <p className="font-rajdhani text-sm text-muted-foreground mt-2">
                    {user.profile_completion_percentage || 0}% Complete
                  </p>
                </div>

                <div>
                  <h3 className="font-orbitron text-xl font-bold neon-text mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {personalRecords?.slice(0, 3).map((record, index) => (
                      <div key={record.id} className="flex items-center gap-4 p-3 bg-card/30 rounded-lg">
                        <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <p className="font-rajdhani font-semibold text-foreground">
                            {record.category}: {record.unit === 'seconds'
                              ? formatSecondsForDisplay(record.value)
                              : `${record.value} ${record.unit}`
                            }
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {record.verification_status === 'verified' ? 'Verified' : 'Pending verification'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'personal-records' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-orbitron text-xl font-bold neon-text">Personal Records</h3>
                  <Button
                    onClick={() => setShowAddPR(true)}
                    className="cyber-border cyber-glow bg-cyan-500 hover:bg-cyan-400 text-black font-rajdhani font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add PR
                  </Button>
                </div>

                {prLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-4" />
                    <p className="font-rajdhani text-muted-foreground">Loading personal records...</p>
                  </div>
                ) : personalRecords?.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h4 className="font-orbitron text-lg font-semibold text-muted-foreground mb-2">
                      No Personal Records Yet
                    </h4>
                    <p className="font-rajdhani text-muted-foreground mb-6">
                      Start by adding your first personal record to showcase your achievements.
                    </p>
                    <Button
                      onClick={() => setShowAddPR(true)}
                      className="cyber-border cyber-glow bg-cyan-500 hover:bg-cyan-400 text-black font-rajdhani font-semibold"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First PR
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {personalRecords?.map((record) => {
                      const badgeConfig = record.badge_level ? BADGE_CONFIG[record.badge_level as keyof typeof BADGE_CONFIG] : null;
                      const BadgeIcon = badgeConfig?.icon || Trophy;

                      return (
                        <motion.div
                          key={record.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="cyber-card p-6"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="w-12 h-12 bg-card/30 rounded-lg flex items-center justify-center">
                                <BadgeIcon className={`w-6 h-6 ${badgeConfig?.color || 'text-cyan-400'}`} />
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-orbitron text-lg font-bold text-foreground">
                                    {record.category}
                                  </h4>
                                  {record.badge_level && (
                                    <span className={`px-2 py-1 text-xs font-rajdhani font-semibold rounded-full bg-current/20 ${badgeConfig?.color}`}>
                                      {record.badge_level}
                                    </span>
                                  )}
                                </div>

                                <p className="font-rajdhani text-2xl font-bold neon-orange-text mb-2">
                                  {record.unit === 'seconds'
                                    ? formatSecondsForDisplay(record.value)
                                    : `${record.value} ${record.unit}`
                                  }
                                </p>

                                {record.description && (
                                  <p className="font-rajdhani text-muted-foreground mb-2">
                                    {record.description}
                                  </p>
                                )}

                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <CheckCircle className={`w-4 h-4 ${record.verification_status === 'verified' ? 'text-green-500' : 'text-yellow-500'}`} />
                                    {record.verification_status === 'verified' ? 'Verified' : 'Pending'}
                                  </div>
                                  {record.achievement_date && (
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      {new Date(record.achievement_date).toLocaleDateString()}
                                    </div>
                                  )}
                                  {record.location && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-4 h-4" />
                                      {record.location}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              {record.primary_video && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewVideo(record.primary_video.file_path)}
                                  className="cyber-border border-cyan-500/40 hover:border-cyan-500"
                                >
                                  <Video className="w-4 h-4 mr-2" />
                                  View Video
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeletePR(record.id, record.category)}
                                disabled={deletingPR}
                                className="cyber-border border-orange-500/40 hover:border-orange-500 text-orange-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Edit Profile Modal */}
        {showEditProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="cyber-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-orbitron text-2xl font-bold neon-text">Edit Profile</h2>
                <Button
                  onClick={() => setShowEditProfile(false)}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={profileForm.first_name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, first_name: e.target.value }))}
                    className="cyber-border bg-card/30"
                  />
                </div>

                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={profileForm.last_name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, last_name: e.target.value }))}
                    className="cyber-border bg-card/30"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="cyber-border bg-card/30"
                  />
                </div>

                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={profileForm.date_of_birth}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, date_of_birth: e.target.value }))}
                    className="cyber-border bg-card/30"
                  />
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    list="states"
                    value={profileForm.state}
                    onChange={(e) => setProfileForm(prev => ({
                      ...prev,
                      state: e.target.value,
                      city: '' // Reset city when state changes
                    }))}
                    className="cyber-border bg-card/30"
                    placeholder="Select or type your state"
                  />
                  <datalist id="states">
                    {allStates.map((state: string) => (
                      <option key={state} value={state} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    list="cities"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, city: e.target.value }))}
                    className="cyber-border bg-card/30"
                    placeholder={profileForm.state ? "Select or type your city" : "Select state first"}
                    disabled={!profileForm.state}
                  />
                  <datalist id="cities">
                    {citiesForSelectedState.map((city: string) => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                    className="cyber-border bg-card/30"
                  />
                </div>

                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={profileForm.pincode}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, pincode: e.target.value }))}
                    className="cyber-border bg-card/30"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleUpdateProfile}
                  disabled={updating}
                  className="flex-1 cyber-border cyber-glow bg-cyan-500 hover:bg-cyan-400 text-black font-rajdhani font-semibold"
                >
                  {updating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => setShowEditProfile(false)}
                  variant="outline"
                  className="cyber-border border-orange-500 text-orange-400 hover:bg-orange-500/10"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Add PR Modal */}
        {showAddPR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="cyber-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-orbitron text-2xl font-bold neon-text">Add Personal Record</h2>
                <Button
                  onClick={() => setShowAddPR(false)}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="sport_category">Sport Category</Label>
                  <select
                    id="sport_category"
                    value={prForm.sport_category_id}
                    onChange={(e) => {
                      setPrForm(prev => ({ ...prev, sport_category_id: e.target.value }));
                    }}
                    className="w-full px-3 py-2 cyber-border bg-card/30 text-foreground rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="">Select a sport category</option>
                    {sportsLoading ? (
                      <option disabled>Loading sports...</option>
                    ) : Array.isArray(sportsData) && sportsData.length > 0 ? (
                      sportsData.map((category: any) => (
                        <option key={category.id} value={category.id} className="bg-card text-foreground">
                          {category.sport_name} - {category.category}
                        </option>
                      ))
                    ) : (
                      <option disabled>No sports available</option>
                    )}
                  </select>
                  {sportsLoading && (
                    <p className="text-xs text-muted-foreground mt-1">Loading sports categories...</p>
                  )}
                  {!sportsLoading && (!Array.isArray(sportsData) || sportsData.length === 0) && (
                    <p className="text-xs text-orange-400 mt-1">No sports categories found</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={prForm.category}
                    onChange={(e) => setPrForm(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., 100m Sprint, Marathon, Long Jump"
                    className="cyber-border bg-card/30"
                  />
                </div>

                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <select
                    id="unit"
                    value={prForm.unit}
                    onChange={(e) => {
                      setPrForm(prev => ({ ...prev, unit: e.target.value }));
                      // Reset values when changing unit type
                      if (isTimeUnit(e.target.value)) {
                        setTimeInput({ hours: '', minutes: '', seconds: '' });
                      } else {
                        setPrForm(prev => ({ ...prev, value: '' }));
                      }
                    }}
                    className="w-full px-3 py-2 cyber-border bg-card/30 text-foreground rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="">Select unit</option>
                    <optgroup label="Time">
                      <option value="seconds">Time (HH:MM:SS)</option>
                    </optgroup>
                    <optgroup label="Distance">
                      <option value="meters">Meters (m)</option>
                      <option value="kilometers">Kilometers (km)</option>
                      <option value="feet">Feet (ft)</option>
                      <option value="inches">Inches (in)</option>
                    </optgroup>
                    <optgroup label="Weight">
                      <option value="kilograms">Kilograms (kg)</option>
                      <option value="pounds">Pounds (lbs)</option>
                    </optgroup>
                    <optgroup label="Speed">
                      <option value="km/h">Kilometers/hour (km/h)</option>
                      <option value="mph">Miles/hour (mph)</option>
                    </optgroup>
                    <optgroup label="Repetitions">
                      <option value="reps">Repetitions</option>
                      <option value="count">Count</option>
                    </optgroup>
                    <optgroup label="Other">
                      <option value="points">Points</option>
                      <option value="score">Score</option>
                    </optgroup>
                  </select>
                </div>

                {/* Conditional value input based on unit type */}
                {prForm.unit && (
                  isTimeUnit(prForm.unit) ? (
                    <div>
                      <Label>Time Value</Label>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Hours"
                            value={timeInput.hours}
                            onChange={(e) => setTimeInput(prev => ({ ...prev, hours: e.target.value }))}
                            className="cyber-border bg-card/30"
                          />
                          <p className="text-xs text-muted-foreground mt-1">Hours</p>
                        </div>
                        <div>
                          <Input
                            type="number"
                            min="0"
                            max="59"
                            placeholder="Minutes"
                            value={timeInput.minutes}
                            onChange={(e) => setTimeInput(prev => ({ ...prev, minutes: e.target.value }))}
                            className="cyber-border bg-card/30"
                          />
                          <p className="text-xs text-muted-foreground mt-1">Minutes</p>
                        </div>
                        <div>
                          <Input
                            type="number"
                            min="0"
                            max="59.99"
                            step="0.01"
                            placeholder="Seconds"
                            value={timeInput.seconds}
                            onChange={(e) => setTimeInput(prev => ({ ...prev, seconds: e.target.value }))}
                            className="cyber-border bg-card/30"
                          />
                          <p className="text-xs text-muted-foreground mt-1">Seconds</p>
                        </div>
                      </div>
                      {(timeInput.hours || timeInput.minutes || timeInput.seconds) && (
                        <p className="text-sm text-cyan-400 mt-2 font-rajdhani">
                          Total: {formatSecondsForDisplay(convertTimeToSeconds())}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="value">Value</Label>
                      <Input
                        id="value"
                        type="number"
                        step="0.01"
                        min="0"
                        value={prForm.value}
                        onChange={(e) => setPrForm(prev => ({ ...prev, value: e.target.value }))}
                        placeholder={`e.g., ${prForm.unit === 'meters' ? '100' : prForm.unit === 'kilograms' ? '75' : '10.5'}`}
                        className="cyber-border bg-card/30"
                      />
                    </div>
                  )
                )}

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={prForm.description}
                    onChange={(e) => setPrForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description"
                    className="cyber-border bg-card/30"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="achievement_date">Achievement Date</Label>
                    <Input
                      id="achievement_date"
                      type="date"
                      value={prForm.achievement_date}
                      onChange={(e) => setPrForm(prev => ({ ...prev, achievement_date: e.target.value }))}
                      className="cyber-border bg-card/30"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={prForm.location}
                      onChange={(e) => setPrForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Mumbai Stadium"
                      className="cyber-border bg-card/30"
                    />
                  </div>
                </div>

                <div>
                  <Label>Video Proof (Required for verification)</Label>
                  {prForm.primary_video_id ? (
                    <div className="cyber-card p-4 mt-2 bg-cyan-500/10 border-cyan-500/40">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Video className="w-5 h-5 text-cyan-400" />
                          <div>
                            <p className="text-sm font-rajdhani font-semibold text-cyan-400">
                              Video uploaded successfully
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Ready for verification
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPrForm(prev => ({ ...prev, primary_video_id: '' }))}
                          className="cyber-border border-orange-500/40 text-orange-400 hover:bg-orange-500/10"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <FileUpload
                      bucket="pr-videos"
                      usageType="pr_verification"
                      accept="video/*"
                      multiple={false}
                      onUploadComplete={handleVideoUpload}
                      className="mt-2"
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleCreatePR}
                  disabled={
                    creatingPR ||
                    !prForm.category ||
                    !prForm.unit ||
                    (isTimeUnit(prForm.unit)
                      ? !timeInput.hours && !timeInput.minutes && !timeInput.seconds
                      : !prForm.value
                    )
                  }
                  className="flex-1 cyber-border cyber-glow bg-cyan-500 hover:bg-cyan-400 text-black font-rajdhani font-semibold"
                >
                  {creatingPR ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Record
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => setShowAddPR(false)}
                  variant="outline"
                  className="cyber-border border-orange-500 text-orange-400 hover:bg-orange-500/10"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Video Modal */}
        {showVideoModal && selectedVideoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowVideoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="cyber-card p-6 w-full max-w-6xl max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="font-orbitron text-2xl font-bold neon-text">Video Proof</h2>
                <Button
                  onClick={() => setShowVideoModal(false)}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="cyber-border rounded-lg overflow-hidden flex-1 min-h-0 flex items-center justify-center bg-black/50">
                <video
                  controls
                  crossOrigin="anonymous"
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                  src={selectedVideoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
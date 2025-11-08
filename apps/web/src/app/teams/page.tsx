
import { motion } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState, Suspense } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAlert } from '@/components/ui/notification';
import {
  Users,
  Plus,
  Search,
  UserPlus,
  Crown,
  Calendar,
  MapPin,
  Trophy,
  Target,
  Copy,
  Check,
  MessageCircle,
  LogIn,
  CheckCircle,
  XCircle,
  Clock,
  User
} from 'lucide-react';
import { useCreateTeam, useMyTeams, useTeams, useSendTeamJoinRequest, useTeamInvites, useRespondToTeamInvite } from '@/hooks/use-data';
import { TeamWithMembers } from '@/types/database';



function TeamsContent() {
  const { isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const toast = useAlert();
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'my-teams' | 'requests'>('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // API hooks
  const { mutate: createTeam, loading: creatingTeam } = useCreateTeam();
  const { data: myTeams, loading: loadingMyTeams, refetch: refetchMyTeams } = useMyTeams();
  const { data: allTeams, loading: loadingTeams, pagination: teamsPagination } = useTeams({
    sport: selectedSport === 'all' ? undefined : selectedSport,
    exclude_user_teams: true,
    page: 1,
    limit: 20
  });
  const { mutate: sendJoinRequest, loading: sendingRequest } = useSendTeamJoinRequest();
  const { data: teamRequests, loading: loadingRequests, refetch: refetchRequests } = useTeamInvites('team_requests');
  const { mutate: respondToInvite, loading: respondingToInvite } = useRespondToTeamInvite();

  // Create team form state
  const [createTeamForm, setCreateTeamForm] = useState({
    name: '',
    sport: '',
    event: '',
    description: '',
    maxMembers: 4,
    requirements: [''],
    skills: [''],
    isPublic: true
  });

  // Join team form state
  const [joinTeamCode, setJoinTeamCode] = useState('');

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['browse', 'create', 'my-teams', 'requests'].includes(tab)) {
      setActiveTab(tab as 'browse' | 'create' | 'my-teams' | 'requests');
    }
  }, [searchParams]);

  const copyToClipboard = (text: string | undefined, teamId: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedCode(teamId);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateTeam = async () => {
    try {
      const teamData = {
        name: createTeamForm.name,
        description: createTeamForm.description,
        sport_category_id: undefined, // You may want to map sport to sport_category_id
        event_id: undefined, // You may want to map event to event_id
        max_members: createTeamForm.maxMembers,
        is_public: createTeamForm.isPublic,
        required_skills: createTeamForm.skills.filter(skill => skill.trim() !== ''),
        requirements: createTeamForm.requirements.filter(req => req.trim() !== ''),
        experience_level: 'intermediate' as const, // You may want to add this to the form
        location_city: undefined, // You may want to add location to the form
        location_state: undefined, // You may want to add location to the form
        practice_schedule: undefined, // You may want to add schedule to the form
        created_by: '' // This will be set by the API
      };

      const result = await createTeam(teamData);
      console.log('Team created successfully:', result);

      // Refetch user's teams to show the new team
      await refetchMyTeams();

      // Reset form and switch to my teams
      setCreateTeamForm({
        name: '',
        sport: '',
        event: '',
        description: '',
        maxMembers: 4,
        requirements: [''],
        skills: [''],
        isPublic: true
      });
      setActiveTab('my-teams');
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team. Please try again.');
    }
  };

  const handleJoinTeam = async (teamCode: string) => {
    try {
      await sendJoinRequest({ team_code: teamCode });
      toast.success('Join request sent successfully! The team captain will review your request.');
      setJoinTeamCode('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send join request. Please try again.');
    }
  };

  const handleJoinTeamById = async (teamId: string, teamName: string) => {
    try {
      await sendJoinRequest({ team_id: teamId });
      toast.success(`Join request sent to ${teamName}! The team captain will review your request.`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send join request. Please try again.');
    }
  };

  const updateCreateTeamField = (field: string, value: any) => {
    setCreateTeamForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addRequirement = () => {
    setCreateTeamForm(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setCreateTeamForm(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  const addSkill = () => {
    setCreateTeamForm(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }));
  };

  const updateSkill = (index: number, value: string) => {
    setCreateTeamForm(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => i === index ? value : skill)
    }));
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="cyber-card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="font-rajdhani text-cyan-400">Loading Team Builder...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  const filteredTeams = (allTeams as TeamWithMembers[])?.filter((team: TeamWithMembers) => {
    const matchesSearch = !searchTerm ||
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.sport_category?.sport_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

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
            TEAM BUILDER
          </h1>
          <p className="text-muted-foreground font-rajdhani text-lg">
            Create teams, find teammates, and compete together
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-orange-500 mt-4 cyber-glow" />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="cyber-card p-4 text-center">
            <Users className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="font-orbitron text-xl font-bold text-foreground">
              {teamsPagination?.count || 0}
            </p>
            <p className="text-sm font-rajdhani text-muted-foreground">Active Teams</p>
          </div>
          <div className="cyber-card p-4 text-center">
            <UserPlus className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <p className="font-orbitron text-xl font-bold text-foreground">
              {allTeams?.reduce((sum, team) => sum + (team.max_members - team.current_members), 0) || 0}
            </p>
            <p className="text-sm font-rajdhani text-muted-foreground">Open Spots</p>
          </div>
          <div className="cyber-card p-4 text-center">
            <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <p className="font-orbitron text-xl font-bold text-foreground">
              {allTeams?.filter(team => team.current_members >= team.max_members).length || 0}
            </p>
            <p className="text-sm font-rajdhani text-muted-foreground">Teams Full</p>
          </div>
          <div className="cyber-card p-4 text-center">
            <Target className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="font-orbitron text-xl font-bold text-foreground">
              {allTeams?.reduce((sum, team) => sum + team.current_members, 0) || 0}
            </p>
            <p className="text-sm font-rajdhani text-muted-foreground">Total Members</p>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-4">
            {[
              { id: 'browse', label: 'Browse Teams', icon: Search },
              { id: 'create', label: 'Create Team', icon: Plus },
              { id: 'my-teams', label: 'My Teams', icon: Users },
              { id: 'requests', label: `Requests${teamRequests?.length ? ` (${teamRequests.length})` : ''}`, icon: UserPlus }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-lg font-rajdhani font-semibold transition-all duration-300
                    ${activeTab === tab.id
                      ? 'cyber-border cyber-glow bg-cyan-500/20 text-cyan-300'
                      : 'bg-card/30 text-muted-foreground hover:text-foreground hover:bg-card/50'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {activeTab === 'browse' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="cyber-card p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      placeholder="Search teams, sports, or events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 cyber-border bg-card/30 font-rajdhani"
                    />
                  </div>
                  <select
                    value={selectedSport}
                    onChange={(e) => setSelectedSport(e.target.value)}
                    className="px-3 py-2 cyber-border bg-card/30 font-rajdhani text-foreground"
                  >
                    <option value="all">All Sports</option>
                    <option value="athletics">Athletics</option>
                    <option value="football">Football</option>
                    <option value="gymnastics">Gymnastics</option>
                    <option value="swimming">Swimming</option>
                  </select>
                </div>

                {/* Quick Join */}
                <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4">
                  <h3 className="font-orbitron text-lg font-bold text-orange-400 mb-2">Quick Join with Code</h3>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Enter team code (e.g., BOLT2024)"
                      value={joinTeamCode}
                      onChange={(e) => setJoinTeamCode(e.target.value.toUpperCase())}
                      className="cyber-border bg-card/30 font-rajdhani"
                    />
                    <Button
                      onClick={() => handleJoinTeam(joinTeamCode)}
                      disabled={!joinTeamCode || sendingRequest}
                      className="bg-orange-500 hover:bg-orange-400 text-black font-rajdhani"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      {sendingRequest ? 'Sending...' : 'Join'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Teams List */}
              <div className="space-y-6">
                {loadingTeams ? (
                  <div className="cyber-card p-6 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground font-rajdhani">Loading teams...</p>
                  </div>
                ) : filteredTeams.length === 0 ? (
                  <div className="cyber-card p-6 text-center">
                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-orbitron text-xl font-bold text-foreground mb-2">No Teams Found</h3>
                    <p className="text-muted-foreground font-rajdhani">
                      {searchTerm ? 'No teams match your search. Try different keywords.' : 'No teams available. Be the first to create one!'}
                    </p>
                  </div>
                ) : (
                  filteredTeams.map((team) => (
                  <motion.div
                    key={team.id}
                    whileHover={{ scale: 1.01 }}
                    className="cyber-card p-6 border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-300"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-orange-500/20 rounded-lg flex items-center justify-center">
                            <Users className="w-8 h-8 text-cyan-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-orbitron text-xl font-bold text-foreground">{team.name}</h3>
                              {team.sport_category && (
                                <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-rajdhani rounded">
                                  {team.sport_category.sport_name}
                                </span>
                              )}
                            </div>
                            <p className="text-orange-400 font-rajdhani font-semibold mb-2">
                              {team.experience_level ? `${team.experience_level} Level` : 'Open to All Levels'}
                            </p>
                            <p className="text-muted-foreground font-rajdhani mb-4">{team.description || 'No description provided'}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-rajdhani mb-4">
                              <div className="flex items-center gap-2">
                                <Crown className="w-4 h-4 text-yellow-500" />
                                <span className="text-foreground">
                                  Captain: {team.created_by_user?.display_name || 'Team Leader'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-cyan-500" />
                                <span className="text-foreground">
                                  {team.current_members}/{team.max_members} members
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-green-500" />
                                <span className="text-foreground">
                                  {team.location_city || team.location_state ?
                                    `${team.location_city || ''}${team.location_city && team.location_state ? ', ' : ''}${team.location_state || ''}` :
                                    'Location TBD'
                                  }
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-purple-500" />
                                <span className="text-foreground">
                                  Created: {new Date(team.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            {team.requirements && team.requirements.length > 0 && (
                              <div className="mb-4">
                                <h4 className="font-rajdhani font-semibold text-foreground mb-2">Requirements:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {team.requirements.map((req: string, index: number) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-rajdhani rounded"
                                    >
                                      {req}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {team.required_skills && team.required_skills.length > 0 && (
                              <div className="mb-4">
                                <h4 className="font-rajdhani font-semibold text-foreground mb-2">Skills Needed:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {team.required_skills.map((skill: string, index: number) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-rajdhani rounded"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="lg:w-64 space-y-4">
                        <div className="cyber-card p-4 bg-card/30">
                          <h4 className="font-rajdhani font-semibold text-foreground mb-2">Team Code</h4>
                          <div className="flex items-center gap-2">
                            <code className="font-mono text-cyan-400 bg-card/50 px-2 py-1 rounded">
                              {team.join_code || 'N/A'}
                            </code>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(team.join_code, team.id)}
                              className="cyber-border border-cyan-500 text-cyan-400"
                            >
                              {copiedCode === team.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Button
                            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-rajdhani font-semibold"
                            onClick={() => handleJoinTeamById(team.id, team.name)}
                            disabled={team.current_members >= team.max_members || sendingRequest}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            {sendingRequest ? 'Sending...' : team.current_members >= team.max_members ? 'Team Full' : 'Request to Join'}
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full cyber-border border-orange-500 text-orange-400 hover:bg-orange-500/10"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Contact Captain
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'create' && (
            <div className="cyber-card p-8 max-w-4xl mx-auto">
              <h2 className="font-orbitron text-2xl font-bold text-cyan-300 mb-6">Create New Team</h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-rajdhani text-foreground">Team Name *</Label>
                    <Input
                      value={createTeamForm.name}
                      onChange={(e) => updateCreateTeamField('name', e.target.value)}
                      placeholder="Enter team name"
                      className="cyber-border bg-card/30 font-rajdhani"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-rajdhani text-foreground">Sport *</Label>
                    <select
                      value={createTeamForm.sport}
                      onChange={(e) => updateCreateTeamField('sport', e.target.value)}
                      className="w-full px-3 py-2 cyber-border bg-card/30 font-rajdhani text-foreground"
                    >
                      <option value="">Select Sport</option>
                      <option value="Athletics">Athletics</option>
                      <option value="Football">Football</option>
                      <option value="Gymnastics">Gymnastics</option>
                      <option value="Swimming">Swimming</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-rajdhani text-foreground">Event *</Label>
                    <Input
                      value={createTeamForm.event}
                      onChange={(e) => updateCreateTeamField('event', e.target.value)}
                      placeholder="Event or competition"
                      className="cyber-border bg-card/30 font-rajdhani"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-rajdhani text-foreground">Max Members *</Label>
                    <Input
                      type="number"
                      value={createTeamForm.maxMembers}
                      onChange={(e) => updateCreateTeamField('maxMembers', parseInt(e.target.value))}
                      min="2"
                      max="20"
                      className="cyber-border bg-card/30 font-rajdhani"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-rajdhani text-foreground">Description *</Label>
                  <textarea
                    value={createTeamForm.description}
                    onChange={(e) => updateCreateTeamField('description', e.target.value)}
                    placeholder="Describe your team, goals, and what you're looking for..."
                    className="w-full px-3 py-2 cyber-border bg-card/30 font-rajdhani text-foreground min-h-[100px]"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-rajdhani text-foreground">Requirements</Label>
                    <Button
                      type="button"
                      onClick={addRequirement}
                      size="sm"
                      variant="outline"
                      className="cyber-border border-cyan-500 text-cyan-400"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  {createTeamForm.requirements.map((req, index) => (
                    <Input
                      key={index}
                      value={req}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      placeholder={`Requirement ${index + 1}`}
                      className="cyber-border bg-card/30 font-rajdhani"
                    />
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-rajdhani text-foreground">Skills Needed</Label>
                    <Button
                      type="button"
                      onClick={addSkill}
                      size="sm"
                      variant="outline"
                      className="cyber-border border-orange-500 text-orange-400"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  {createTeamForm.skills.map((skill, index) => (
                    <Input
                      key={index}
                      value={skill}
                      onChange={(e) => updateSkill(index, e.target.value)}
                      placeholder={`Skill ${index + 1}`}
                      className="cyber-border bg-card/30 font-rajdhani"
                    />
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={createTeamForm.isPublic}
                    onChange={(e) => updateCreateTeamField('isPublic', e.target.checked)}
                    className="w-4 h-4 text-cyan-500"
                  />
                  <Label htmlFor="isPublic" className="font-rajdhani text-foreground">
                    Make team publicly visible
                  </Label>
                </div>

                <Button
                  onClick={handleCreateTeam}
                  disabled={!createTeamForm.name || !createTeamForm.sport || !createTeamForm.event || creatingTeam}
                  className="w-full cyber-border cyber-glow bg-cyan-500 hover:bg-cyan-400 text-black font-rajdhani font-semibold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {creatingTeam ? 'Creating Team...' : 'Create Team'}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'my-teams' && (
            <div className="space-y-6">
              {loadingMyTeams ? (
                <div className="cyber-card p-6 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground font-rajdhani">Loading your teams...</p>
                </div>
              ) : myTeams && myTeams.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {myTeams.map((team) => (
                    <div key={team.id} className="cyber-card p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-orbitron text-xl font-bold text-foreground mb-1">{team.name}</h3>
                          <p className="text-cyan-400 font-rajdhani">Team Sport</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground font-rajdhani">
                            {team.current_members}/{team.max_members} members
                          </div>
                        </div>
                      </div>

                      {team.description && (
                        <p className="text-muted-foreground font-rajdhani mb-4">{team.description}</p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground font-rajdhani">
                          Created {new Date(team.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => copyToClipboard(team.join_code, team.id)}
                            className="cyber-border text-xs"
                            variant="outline"
                          >
                            {copiedCode === team.id ? 'Copied!' : `Code: ${team.join_code || 'N/A'}`}
                          </Button>
                          <Button
                            onClick={() => team.id && navigate(`/teams/${team.id}`)}
                            size="sm"
                            className="bg-cyan-500 hover:bg-cyan-400 text-black font-rajdhani text-xs"
                            disabled={!team.id}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="cyber-card p-6 text-center">
                  <Users className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                  <h3 className="font-orbitron text-xl font-bold text-foreground mb-2">My Teams</h3>
                  <p className="text-muted-foreground font-rajdhani mb-6">
                    Teams you've created or joined will appear here
                  </p>
                  <Button
                    onClick={() => setActiveTab('create')}
                    className="cyber-border cyber-glow bg-cyan-500 hover:bg-cyan-400 text-black font-rajdhani font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Team
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-6">
              <div className="cyber-card p-6">
                <h2 className="font-orbitron text-2xl font-bold text-cyan-300 mb-4">Team Join Requests</h2>
                <p className="text-muted-foreground font-rajdhani mb-6">
                  Review and manage join requests for your teams
                </p>

                {loadingRequests ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground font-rajdhani">Loading requests...</p>
                  </div>
                ) : teamRequests && teamRequests.length > 0 ? (
                  <div className="space-y-4">
                    {teamRequests.map((request: any) => (
                      <motion.div
                        key={request.id}
                        whileHover={{ scale: 1.01 }}
                        className="cyber-card p-6 border-orange-500/30 hover:border-orange-500/60 transition-all duration-300"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-cyan-500/20 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-orange-400" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-orbitron text-lg font-bold text-foreground">
                                    {request.invitee?.display_name || 'Unknown User'}
                                  </h3>
                                  <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-rajdhani rounded">
                                    Join Request
                                  </span>
                                  <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-rajdhani rounded">
                                    {request.team?.name}
                                  </span>
                                </div>

                                <p className="text-muted-foreground font-rajdhani mb-3">
                                  {request.message || 'Wants to join your team'}
                                </p>

                                <div className="flex items-center gap-4 text-sm font-rajdhani text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>
                                      {new Date(request.created_at).toLocaleDateString()} at{' '}
                                      {new Date(request.created_at).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  {request.team?.sport_category && (
                                    <div className="flex items-center gap-1">
                                      <Trophy className="w-4 h-4" />
                                      <span>{request.team.sport_category.sport_name}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="lg:w-64 space-y-3">
                            <Button
                              onClick={() => navigate(`/users/${request.invitee_id}`)}
                              variant="outline"
                              className="w-full cyber-border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
                            >
                              <User className="w-4 h-4 mr-2" />
                              View Profile
                            </Button>

                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                onClick={async () => {
                                  try {
                                    await respondToInvite({
                                      invite_id: request.id,
                                      status: 'accepted',
                                      response_message: 'Welcome to the team!'
                                    });
                                    await refetchRequests();
                                    await refetchMyTeams();
                                    toast.success('Request accepted! The user has been added to your team.');
                                  } catch (error: any) {
                                    toast.error(error.message || 'Failed to accept request');
                                  }
                                }}
                                disabled={respondingToInvite}
                                className="bg-green-500 hover:bg-green-400 text-black font-rajdhani text-sm"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Accept
                              </Button>

                              <Button
                                onClick={async () => {
                                  try {
                                    await respondToInvite({
                                      invite_id: request.id,
                                      status: 'declined',
                                      response_message: 'Thank you for your interest.'
                                    });
                                    await refetchRequests();
                                    toast.success('Request declined.');
                                  } catch (error: any) {
                                    toast.error(error.message || 'Failed to decline request');
                                  }
                                }}
                                disabled={respondingToInvite}
                                className="bg-red-500 hover:bg-red-400 text-black font-rajdhani text-sm"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Decline
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <UserPlus className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-orbitron text-xl font-bold text-foreground mb-2">
                      No Pending Requests
                    </h3>
                    <p className="text-muted-foreground font-rajdhani">
                      When athletes request to join your teams, they'll appear here for your review.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

export default function Teams() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="cyber-card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="font-rajdhani text-cyan-400">Loading Team Builder...</p>
        </div>
      </div>
    }>
      <TeamsContent />
    </Suspense>
  );
}
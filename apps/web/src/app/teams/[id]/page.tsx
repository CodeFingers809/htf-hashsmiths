
import { motion } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAlert, useConfirm } from '@/components/ui/notification';
import {
  Users,
  Crown,
  Trophy,
  Calendar,
  MapPin,
  Settings,
  UserPlus,
  Shield,
  Star,
  TrendingUp,
  Award,
  Target,
  Activity,
  Edit,
  Copy,
  Check,
  UserMinus,
  MessageCircle,
  Mail,
  Phone,
  ExternalLink,
  ArrowLeft,
  Trash2,
  Plus,
  X,
  Megaphone,
  LogOut
} from 'lucide-react';
import { useTeam, useTeamInvites, useRespondToTeamInvite, useUpdateTeam, useCurrentUser, useRemoveTeamMember, useDeleteTeam } from '@/hooks/use-data';
import { TeamWithMembers } from '@/types/database';
import { TeamChat } from '@/components/team/TeamChat';
import { TeamAnnouncements } from '@/components/team/TeamAnnouncements';

export default function TeamDetails() {
  const { isLoaded, isSignedIn } = useAuth();
  const params = useParams();
  const navigate = useNavigate();
  const teamId = params.id as string;
  const toast = useAlert();
  const confirm = useConfirm();

  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'chat' | 'announcements' | 'management'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // API hooks
  const { data: team, loading: loadingTeam, refetch: refetchTeam } = useTeam(teamId);
  const { data: teamRequests, refetch: refetchRequests } = useTeamInvites('team_requests', teamId);
  const { data: currentUser } = useCurrentUser();
  const { mutate: respondToInvite } = useRespondToTeamInvite();
  const { mutate: updateTeam } = useUpdateTeam(teamId);
  const { mutate: removeMember, loading: removingMember } = useRemoveTeamMember(teamId);
  const { mutate: deleteTeam, loading: deletingTeam } = useDeleteTeam(teamId);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    requirements: [] as string[],
    required_skills: [] as string[],
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (team) {
      setEditForm({
        name: team.name || '',
        description: team.description || '',
        requirements: Array.isArray(team.requirements) ? team.requirements : [],
        required_skills: Array.isArray(team.required_skills) ? team.required_skills : [],
      });
    }
  }, [team]);

  const copyToClipboard = (text: string | undefined) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSaveChanges = async () => {
    try {
      await updateTeam(editForm);
      await refetchTeam();
      setIsEditing(false);
      toast.success('Team updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update team');
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    const confirmed = await confirm({
      title: 'Remove Team Member',
      message: `Are you sure you want to remove ${memberName} from the team?`
    });

    if (!confirmed) {
      return;
    }

    try {
      await removeMember({ member_id: memberId });
      await refetchTeam();
      toast.success(`${memberName} has been removed from the team.`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove member');
    }
  };

  const handleDeleteTeam = async () => {
    try {
      await deleteTeam();
      setShowDeleteConfirm(false);
      toast.success('Team deleted successfully!');
      navigate('/teams');
    } catch (error: any) {
      setShowDeleteConfirm(false);
      toast.error(error.message || 'Failed to delete team');
    }
  };

  const handleLeaveTeam = async () => {
    const confirmed = await confirm(
      'Leave this team?',
      'You will need to request to join again if you change your mind.'
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/teams/${teamId}/leave`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to leave team');
      }

      toast.success('You have left the team');
      navigate('/teams');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Helper functions for requirements and skills
  const addRequirement = () => {
    setEditForm(prev => ({ ...prev, requirements: [...prev.requirements, ''] }));
  };

  const removeRequirement = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setEditForm(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  const addSkill = () => {
    setEditForm(prev => ({ ...prev, required_skills: [...prev.required_skills, ''] }));
  };

  const removeSkill = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter((_, i) => i !== index)
    }));
  };

  const updateSkill = (index: number, value: string) => {
    setEditForm(prev => ({
      ...prev,
      required_skills: prev.required_skills.map((skill, i) => i === index ? value : skill)
    }));
  };

  const isTeamLeader = currentUser && team && team.created_by === currentUser.id;
  const isTeamMember = currentUser && team?.members?.some((member: any) =>
    member.user_id === currentUser.id && member.status === 'active'
  );

  if (!isLoaded || loadingTeam) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="cyber-card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="font-rajdhani text-cyan-400">Loading Team Details...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  if (!team) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <div className="cyber-card p-8 text-center">
            <h1 className="font-orbitron text-2xl font-bold text-foreground mb-4">Team Not Found</h1>
            <p className="text-muted-foreground font-rajdhani mb-6">
              The team you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => navigate('/teams')} className="cyber-border">
              Back to Teams
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Back Button & Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex items-center justify-between"
        >
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="cyber-border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Teams
          </Button>

          {!isTeamLeader && (
            <Button
              variant="outline"
              onClick={handleLeaveTeam}
              className="cyber-border border-red-500 text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Leave Team
            </Button>
          )}
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-orange-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                  <h1 className="font-orbitron text-3xl font-bold neon-text">
                    {team.name}
                  </h1>
                  <div className="flex items-center gap-3 mt-2">
                    {team.sport_category && (
                      <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-sm font-rajdhani rounded">
                        {team.sport_category.sport_name}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-sm font-rajdhani rounded">
                      {team.experience_level || 'Open Level'}
                    </span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-sm font-rajdhani rounded">
                      {team.current_members}/{team.max_members} Members
                    </span>
                    {isTeamMember && (
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-sm font-rajdhani rounded">
                        Member
                      </span>
                    )}
                    {isTeamLeader && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-sm font-rajdhani rounded flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        Captain
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {team.description && (
                <p className="text-muted-foreground font-rajdhani text-lg max-w-3xl">
                  {team.description}
                </p>
              )}
            </div>

            <div className="lg:w-72 space-y-4">
              <div className="cyber-card p-4">
                <h3 className="font-rajdhani font-semibold text-foreground mb-2">Team Code</h3>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-cyan-400 bg-card/50 px-2 py-1 rounded flex-1">
                    {team.join_code || 'N/A'}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(team.join_code)}
                    className="cyber-border border-cyan-500 text-cyan-400"
                  >
                    {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {isTeamLeader && (
                <>
                  <Button
                    onClick={() => setActiveTab('management')}
                    className="w-full cyber-border cyber-glow bg-orange-500 hover:bg-orange-400 text-black font-rajdhani font-semibold"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Team
                  </Button>
                  {isEditing && (
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      className="w-full cyber-border border-red-500 text-red-400"
                    >
                      Cancel Edit
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Edit Mode */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="cyber-card p-6 mb-8"
          >
            <h2 className="font-orbitron text-xl font-bold text-orange-400 mb-4">Edit Team</h2>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label className="font-rajdhani text-foreground">Team Name</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="cyber-border bg-card/30 font-rajdhani"
                />
              </div>
              <div>
                <Label className="font-rajdhani text-foreground">Description</Label>
                <Input
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="cyber-border bg-card/30 font-rajdhani"
                />
              </div>
            </div>

            {/* Requirements */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <Label className="font-rajdhani text-foreground text-lg">Team Requirements</Label>
                <Button
                  type="button"
                  onClick={addRequirement}
                  size="sm"
                  className="cyber-border bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Requirement
                </Button>
              </div>
              <div className="space-y-2">
                {editForm.requirements.map((requirement, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={requirement}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      placeholder="e.g., Must have previous tournament experience"
                      className="cyber-border bg-card/30 font-rajdhani flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      size="sm"
                      variant="outline"
                      className="cyber-border border-red-500 text-red-400 hover:bg-red-500/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {editForm.requirements.length === 0 && (
                  <p className="text-muted-foreground font-rajdhani text-sm">No requirements set</p>
                )}
              </div>
            </div>

            {/* Required Skills */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <Label className="font-rajdhani text-foreground text-lg">Required Skills</Label>
                <Button
                  type="button"
                  onClick={addSkill}
                  size="sm"
                  className="cyber-border bg-purple-500/20 hover:bg-purple-500/30 text-purple-400"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Skill
                </Button>
              </div>
              <div className="space-y-2">
                {editForm.required_skills.map((skill, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={skill}
                      onChange={(e) => updateSkill(index, e.target.value)}
                      placeholder="e.g., Advanced ball handling, Strategic thinking"
                      className="cyber-border bg-card/30 font-rajdhani flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => removeSkill(index)}
                      size="sm"
                      variant="outline"
                      className="cyber-border border-red-500 text-red-400 hover:bg-red-500/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {editForm.required_skills.length === 0 && (
                  <p className="text-muted-foreground font-rajdhani text-sm">No specific skills required</p>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={handleSaveChanges}
                className="bg-green-500 hover:bg-green-400 text-black font-rajdhani"
              >
                Save Changes
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="cyber-border border-red-500 text-red-400"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-4">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'members', label: 'Members', icon: Users },
              { id: 'chat', label: 'Team Chat', icon: MessageCircle },
              { id: 'announcements', label: 'Announcements', icon: Megaphone },
              { id: 'achievements', label: 'Achievements', icon: Trophy },
              ...(isTeamLeader ? [{ id: 'management', label: 'Management', icon: Settings }] : [])
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
                  {tab.id === 'management' && teamRequests && teamRequests.length > 0 && (
                    <span className="bg-orange-500 text-black text-xs px-2 py-1 rounded-full">
                      {teamRequests.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Team Stats */}
              <div className="lg:col-span-2 space-y-6">
                <div className="cyber-card p-6">
                  <h3 className="font-orbitron text-lg font-bold text-cyan-400 mb-4">Team Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <Users className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                      <p className="font-orbitron text-xl font-bold text-foreground">{team.current_members}</p>
                      <p className="text-sm font-rajdhani text-muted-foreground">Members</p>
                    </div>
                    <div className="text-center">
                      <Calendar className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                      <p className="font-orbitron text-xl font-bold text-foreground">
                        {Math.floor((new Date().getTime() - new Date(team.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                      </p>
                      <p className="text-sm font-rajdhani text-muted-foreground">Days Active</p>
                    </div>
                    <div className="text-center">
                      <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                      <p className="font-orbitron text-xl font-bold text-foreground">0</p>
                      <p className="text-sm font-rajdhani text-muted-foreground">Achievements</p>
                    </div>
                    <div className="text-center">
                      <Target className="w-6 h-6 text-green-500 mx-auto mb-2" />
                      <p className="font-orbitron text-xl font-bold text-foreground">0</p>
                      <p className="text-sm font-rajdhani text-muted-foreground">Events</p>
                    </div>
                  </div>
                </div>

                {/* Team Info */}
                <div className="cyber-card p-6">
                  <h3 className="font-orbitron text-lg font-bold text-cyan-400 mb-4">Team Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Crown className="w-5 h-5 text-yellow-500" />
                      <span className="font-rajdhani text-foreground">
                        Captain: {team.created_by_user?.display_name || 'Team Leader'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-cyan-500" />
                      <span className="font-rajdhani text-foreground">
                        Created: {new Date(team.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {(team.location_city || team.location_state) && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-green-500" />
                        <span className="font-rajdhani text-foreground">
                          {team.location_city}{team.location_city && team.location_state ? ', ' : ''}{team.location_state}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Requirements & Skills */}
                {((team.requirements && team.requirements.length > 0) || (team.required_skills && team.required_skills.length > 0)) && (
                  <div className="cyber-card p-6">
                    <h3 className="font-orbitron text-lg font-bold text-cyan-400 mb-4">Requirements & Skills</h3>
                    {team.requirements && team.requirements.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-rajdhani font-semibold text-foreground mb-2">Requirements:</h4>
                        <div className="flex flex-wrap gap-2">
                          {team.requirements.map((req: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm font-rajdhani rounded"
                            >
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {team.required_skills && team.required_skills.length > 0 && (
                      <div>
                        <h4 className="font-rajdhani font-semibold text-foreground mb-2">Skills:</h4>
                        <div className="flex flex-wrap gap-2">
                          {team.required_skills.map((skill: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm font-rajdhani rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Team Activity */}
              <div className="space-y-6">
                <div className="cyber-card p-6">
                  <h3 className="font-orbitron text-lg font-bold text-cyan-400 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-rajdhani text-muted-foreground">Team created</span>
                      <span className="font-rajdhani text-xs text-muted-foreground ml-auto">
                        {new Date(team.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-6">
              <div className="cyber-card p-6">
                <h3 className="font-orbitron text-lg font-bold text-cyan-400 mb-4">Team Members</h3>
                {team.members && team.members.length > 0 ? (
                  <div className="grid gap-4">
                    {team.members.map((member: any) => (
                      <div
                        key={member.id}
                        className="cyber-card p-4 border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-orange-500/20 rounded-full flex items-center justify-center">
                              <Users className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div>
                              <h4 className="font-orbitron font-bold text-foreground">
                                {member.user?.display_name || 'Team Member'}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`
                                  px-2 py-1 text-xs font-rajdhani rounded
                                  ${member.role === 'captain' ? 'bg-yellow-500/20 text-yellow-400' :
                                    member.role === 'co_captain' ? 'bg-orange-500/20 text-orange-400' :
                                    'bg-cyan-500/20 text-cyan-400'}
                                `}>
                                  {member.role === 'captain' ? 'Captain' :
                                   member.role === 'co_captain' ? 'Co-Captain' : 'Member'}
                                </span>
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-rajdhani rounded">
                                  {member.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/users/${member.user_id}`)}
                              className="cyber-border border-cyan-500 text-cyan-400"
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Profile
                            </Button>
                            {isTeamLeader && member.role !== 'captain' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveMember(member.id, member.user?.display_name || 'Unknown User')}
                                disabled={removingMember}
                                className="cyber-border border-red-500 text-red-400 hover:bg-red-500/10"
                              >
                                <UserMinus className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="font-rajdhani text-muted-foreground">No team members yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="max-w-4xl mx-auto">
              <TeamChat teamId={teamId} />
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="max-w-4xl mx-auto">
              <TeamAnnouncements teamId={teamId} isCaptain={isTeamLeader} />
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <div className="cyber-card p-6 text-center">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="font-orbitron text-xl font-bold text-foreground mb-2">
                  Team Achievements
                </h3>
                <p className="text-muted-foreground font-rajdhani">
                  Team achievements and milestones will appear here as you progress together.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'management' && isTeamLeader && (
            <div className="space-y-6">
              <div className="cyber-card p-6">
                <h3 className="font-orbitron text-lg font-bold text-orange-400 mb-4">Team Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <Button
                    onClick={() => navigate('/teams?tab=requests')}
                    className="cyber-border cyber-glow bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 font-rajdhani"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    View Join Requests
                    {teamRequests && teamRequests.length > 0 && (
                      <span className="ml-2 bg-orange-500 text-black text-xs px-2 py-1 rounded-full">
                        {teamRequests.length}
                      </span>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                    className="cyber-border border-orange-500 text-orange-400 hover:bg-orange-500/10"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Team Settings
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={deletingTeam}
                    className="cyber-border border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {deletingTeam ? 'Deleting...' : 'Delete Team'}
                  </Button>
                </div>

                {/* Pending Requests Preview */}
                {teamRequests && teamRequests.length > 0 && (
                  <div>
                    <h4 className="font-orbitron text-lg font-bold text-cyan-400 mb-4">
                      Recent Join Requests ({teamRequests.length})
                    </h4>
                    <div className="space-y-3">
                      {teamRequests.slice(0, 3).map((request: any) => (
                        <div key={request.id} className="cyber-card p-4 bg-card/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-orange-500/20 to-cyan-500/20 rounded-full flex items-center justify-center">
                                <Users className="w-4 h-4 text-orange-400" />
                              </div>
                              <div>
                                <h5 className="font-rajdhani font-semibold text-foreground">
                                  {request.invitee?.display_name || 'Unknown User'}
                                </h5>
                                <p className="text-xs font-rajdhani text-muted-foreground">
                                  {new Date(request.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => navigate('/teams?tab=requests')}
                              className="bg-cyan-500 hover:bg-cyan-400 text-black font-rajdhani text-xs"
                            >
                              Review
                            </Button>
                          </div>
                        </div>
                      ))}
                      {teamRequests.length > 3 && (
                        <Button
                          variant="outline"
                          onClick={() => navigate('/teams?tab=requests')}
                          className="w-full cyber-border border-cyan-500 text-cyan-400"
                        >
                          View All {teamRequests.length} Requests
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Delete Team Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="cyber-card p-6 max-w-md mx-4"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="font-orbitron text-xl font-bold text-foreground mb-2">
                  Delete Team
                </h3>
                <p className="text-muted-foreground font-rajdhani mb-6">
                  Are you sure you want to delete "{team?.name}"? This action cannot be undone.
                  All team members will be removed and team data will be permanently deleted.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    variant="outline"
                    className="flex-1 cyber-border border-muted-foreground text-muted-foreground"
                    disabled={deletingTeam}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteTeam}
                    disabled={deletingTeam}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-rajdhani"
                  >
                    {deletingTeam ? 'Deleting...' : 'Delete Team'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
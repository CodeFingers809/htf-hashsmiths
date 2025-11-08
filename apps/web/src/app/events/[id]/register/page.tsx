
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, CreditCard, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  event_type: string;
  level: string;
  event_date: string;
  registration_start_date: string;
  registration_end_date: string;
  submission_deadline: string;
  registration_fee: number;
  processing_fee: number;
  prize_pool: number;
  max_participants: number;
  current_participants: number;
  min_age: number;
  max_age: number;
  gender_restriction: string;
  status: string;
  sport_category: {
    sport_name: string;
    category: string;
  };
}

interface Team {
  id: string;
  name: string;
  sport: string;
  current_members: number;
  max_members: number;
  members: Array<{
    id: string;
    user_id: string;
    display_name: string;
    avatar_url: string;
    role: string;
    status: string;
  }>;
}

export default function EventRegistrationPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const [event, setEvent] = useState<Event | null>(null);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    registration_type: 'individual', // individual or team
    selected_team_id: '',
    selected_team_members: [] as string[],
    emergency_contact_name: '',
    emergency_contact_phone: '',
    dietary_requirements: '',
    medical_conditions: '',
    experience_level: '',
    motivation: '',
    additional_notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      navigate('/sign-in');
      return;
    }
    fetchEventAndUserData();
  }, [params.id, isSignedIn]);

  const fetchEventAndUserData = async () => {
    try {
      // Fetch event details
      const eventResponse = await fetch(`/api/events/${params.id}`);
      if (eventResponse.ok) {
        const eventResult = await eventResponse.json();
        setEvent(eventResult.data);
      }

      // Fetch user teams
      const teamsResponse = await fetch('/api/teams/my-teams');
      if (teamsResponse.ok) {
        const teamsResult = await teamsResponse.json();
        setUserTeams(teamsResult.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!registrationData.emergency_contact_name.trim()) {
      newErrors.emergency_contact_name = 'Emergency contact name is required';
    }

    if (!registrationData.emergency_contact_phone.trim()) {
      newErrors.emergency_contact_phone = 'Emergency contact phone is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(registrationData.emergency_contact_phone)) {
      newErrors.emergency_contact_phone = 'Please enter a valid phone number';
    }

    if (!registrationData.experience_level.trim()) {
      newErrors.experience_level = 'Experience level is required';
    }

    if (!registrationData.motivation.trim()) {
      newErrors.motivation = 'Please tell us your motivation for participating';
    }

    if (registrationData.registration_type === 'team') {
      if (!registrationData.selected_team_id) {
        newErrors.selected_team_id = 'Please select a team';
      }
      if (registrationData.selected_team_members.length === 0) {
        newErrors.selected_team_members = 'Please select at least one team member';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegistration = async () => {
    if (!validateForm()) return;

    setRegistering(true);
    try {
      const response = await fetch('/api/event-registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event?.id,
          registration_type: registrationData.registration_type,
          team_id: registrationData.registration_type === 'team' ? registrationData.selected_team_id : null,
          team_members: registrationData.registration_type === 'team' ? registrationData.selected_team_members : null,
          emergency_contact: {
            name: registrationData.emergency_contact_name,
            phone: registrationData.emergency_contact_phone
          },
          dietary_requirements: registrationData.dietary_requirements,
          medical_conditions: registrationData.medical_conditions,
          experience_level: registrationData.experience_level,
          motivation: registrationData.motivation,
          additional_notes: registrationData.additional_notes
        })
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        const error = await response.json();
        setErrors({ general: error.error || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setRegistering(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 100).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-cyan-400">Loading registration form...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Event Not Found</h1>
          <Button onClick={() => navigate('/events')} className="bg-cyan-600 hover:bg-cyan-700">
            Browse Events
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-gray-900/50 border-green-500/30 p-8 text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Registration Successful!</h1>
          <p className="text-gray-300 mb-6">
            You have successfully registered for {event.title}. You will receive a confirmation email shortly.
          </p>
          <p className="text-sm text-gray-400">Redirecting to dashboard...</p>
        </Card>
      </div>
    );
  }

  const totalCost = event.registration_fee + event.processing_fee;

  // More comprehensive registration check
  const isRegistrationOpen = (() => {
    const now = new Date();
    const regStart = new Date(event.registration_start_date || '2024-01-01');
    const regEnd = new Date(event.registration_end_date);

    // Check event status first
    if (!event.status || event.status === 'completed' || event.status === 'cancelled') {
      return false;
    }

    // Check date range
    if (now < regStart) {
      return false;
    }

    if (now > regEnd) {
      return false;
    }

    // Check capacity
    if (event.max_participants && event.current_participants >= event.max_participants) {
      return false;
    }

    return true;
  })();

  const selectedTeam = userTeams.find(team => team.id === registrationData.selected_team_id);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-orbitron">Register for Event</h1>
            <p className="text-gray-400">{event.title}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Registration Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Registration Type */}
            <Card className="bg-gray-900/50 border-cyan-500/30 p-6">
              <h2 className="text-xl font-bold mb-4 text-cyan-400">Registration Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant={registrationData.registration_type === 'individual' ? "default" : "outline"}
                  onClick={() => setRegistrationData(prev => ({ ...prev, registration_type: 'individual' }))}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Users className="w-6 h-6" />
                  <div>
                    <div className="font-semibold">Individual</div>
                    <div className="text-sm opacity-75">Register as individual participant</div>
                  </div>
                </Button>

                <Button
                  variant={registrationData.registration_type === 'team' ? "default" : "outline"}
                  onClick={() => setRegistrationData(prev => ({ ...prev, registration_type: 'team' }))}
                  disabled={userTeams.length === 0}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Users className="w-6 h-6" />
                  <div>
                    <div className="font-semibold">Team</div>
                    <div className="text-sm opacity-75">
                      {userTeams.length > 0 ? 'Register with your team' : 'Join a team first'}
                    </div>
                  </div>
                </Button>
              </div>
            </Card>

            {/* Team Selection */}
            {registrationData.registration_type === 'team' && (
              <Card className="bg-gray-900/50 border-cyan-500/30 p-6">
                <h2 className="text-xl font-bold mb-4 text-cyan-400">Select Team</h2>

                <div className="space-y-4">
                  <div>
                    <Label>Choose Team</Label>
                    <select
                      value={registrationData.selected_team_id}
                      onChange={(e) => setRegistrationData(prev => ({
                        ...prev,
                        selected_team_id: e.target.value,
                        selected_team_members: []
                      }))}
                      className="w-full mt-2 p-3 bg-gray-800 border border-gray-600 rounded-md text-white"
                    >
                      <option value="">Select a team</option>
                      {userTeams.map(team => (
                        <option key={team.id} value={team.id}>
                          {team.name} ({team.current_members} members)
                        </option>
                      ))}
                    </select>
                    {errors.selected_team_id && (
                      <p className="text-red-400 text-sm mt-1">{errors.selected_team_id}</p>
                    )}
                  </div>

                  {/* Team Member Selection */}
                  {selectedTeam && (
                    <div>
                      <Label>Select Team Members</Label>
                      <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                        {selectedTeam.members.map(member => (
                          <label key={member.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-md cursor-pointer hover:bg-gray-700">
                            <input
                              type="checkbox"
                              checked={registrationData.selected_team_members.includes(member.user_id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setRegistrationData(prev => ({
                                    ...prev,
                                    selected_team_members: [...prev.selected_team_members, member.user_id]
                                  }));
                                } else {
                                  setRegistrationData(prev => ({
                                    ...prev,
                                    selected_team_members: prev.selected_team_members.filter(id => id !== member.user_id)
                                  }));
                                }
                              }}
                              className="rounded text-cyan-500"
                            />
                            <img
                              src={member.avatar_url || '/default-avatar.png'}
                              alt={member.display_name}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <div className="font-medium">{member.display_name}</div>
                              <div className="text-sm text-gray-400">{member.role}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                      {errors.selected_team_members && (
                        <p className="text-red-400 text-sm mt-1">{errors.selected_team_members}</p>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Emergency Contact */}
            <Card className="bg-gray-900/50 border-cyan-500/30 p-6">
              <h2 className="text-xl font-bold mb-4 text-cyan-400">Emergency Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergency_name">Contact Name *</Label>
                  <Input
                    id="emergency_name"
                    value={registrationData.emergency_contact_name}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                    className="mt-2"
                    placeholder="Full name"
                  />
                  {errors.emergency_contact_name && (
                    <p className="text-red-400 text-sm mt-1">{errors.emergency_contact_name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="emergency_phone">Contact Phone *</Label>
                  <Input
                    id="emergency_phone"
                    value={registrationData.emergency_contact_phone}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                    className="mt-2"
                    placeholder="+91 98765 43210"
                  />
                  {errors.emergency_contact_phone && (
                    <p className="text-red-400 text-sm mt-1">{errors.emergency_contact_phone}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Additional Information */}
            <Card className="bg-gray-900/50 border-cyan-500/30 p-6">
              <h2 className="text-xl font-bold mb-4 text-cyan-400">Additional Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="experience">Experience Level *</Label>
                  <select
                    id="experience"
                    value={registrationData.experience_level}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, experience_level: e.target.value }))}
                    className="w-full mt-2 p-3 bg-gray-800 border border-gray-600 rounded-md text-white"
                  >
                    <option value="">Select your experience level</option>
                    <option value="beginner">Beginner (0-1 years)</option>
                    <option value="intermediate">Intermediate (1-3 years)</option>
                    <option value="advanced">Advanced (3-5 years)</option>
                    <option value="expert">Expert (5+ years)</option>
                  </select>
                  {errors.experience_level && (
                    <p className="text-red-400 text-sm mt-1">{errors.experience_level}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="motivation">Motivation *</Label>
                  <Textarea
                    id="motivation"
                    value={registrationData.motivation}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, motivation: e.target.value }))}
                    className="mt-2"
                    rows={3}
                    placeholder="Tell us why you want to participate in this event..."
                  />
                  {errors.motivation && (
                    <p className="text-red-400 text-sm mt-1">{errors.motivation}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="dietary">Dietary Requirements</Label>
                  <Input
                    id="dietary"
                    value={registrationData.dietary_requirements}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, dietary_requirements: e.target.value }))}
                    className="mt-2"
                    placeholder="e.g., Vegetarian, Vegan, No nuts"
                  />
                </div>

                <div>
                  <Label htmlFor="medical">Medical Conditions</Label>
                  <Textarea
                    id="medical"
                    value={registrationData.medical_conditions}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, medical_conditions: e.target.value }))}
                    className="mt-2"
                    rows={2}
                    placeholder="Any medical conditions we should be aware of..."
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={registrationData.additional_notes}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, additional_notes: e.target.value }))}
                    className="mt-2"
                    rows={2}
                    placeholder="Any other information you'd like to share..."
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Registration Summary */}
          <div className="space-y-6">
            <Card className="bg-gray-900/50 border-cyan-500/30 p-6">
              <h3 className="text-lg font-bold mb-4 text-cyan-400">Registration Summary</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Event:</span>
                  <span className="text-white font-medium">{event.title}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-300">Type:</span>
                  <Badge className={registrationData.registration_type === 'team' ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-400'}>
                    {registrationData.registration_type === 'team' ? 'Team Registration' : 'Individual Registration'}
                  </Badge>
                </div>

                {registrationData.registration_type === 'team' && selectedTeam && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">Team:</span>
                    <span className="text-white font-medium">{selectedTeam.name}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-300">Registration Fee:</span>
                  <span className="text-white">{formatCurrency(event.registration_fee)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-300">Processing Fee:</span>
                  <span className="text-white">{formatCurrency(event.processing_fee)}</span>
                </div>

                <div className="border-t border-gray-600 pt-3">
                  <div className="flex justify-between font-bold">
                    <span className="text-cyan-400">Total:</span>
                    <span className="text-cyan-400">{formatCurrency(totalCost)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>Registration closes: {formatDate(event.registration_end_date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <CreditCard className="w-4 h-4" />
                  <span>Submission deadline: {formatDate(event.submission_deadline)}</span>
                </div>
              </div>
            </Card>

            {/* Error Display */}
            {errors.general && (
              <Card className="bg-red-900/20 border-red-500/30 p-4">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span>{errors.general}</span>
                </div>
              </Card>
            )}

            {/* Registration Button */}
            {isRegistrationOpen ? (
              <Button
                onClick={handleRegistration}
                disabled={registering}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 text-lg"
              >
                {registering ? 'Processing Registration...' : `Register Now - ${formatCurrency(totalCost)}`}
              </Button>
            ) : (
              <Button disabled className="w-full bg-gray-600 text-gray-400">
                Registration Closed
              </Button>
            )}

            <p className="text-xs text-gray-400 text-center">
              By registering, you agree to our terms and conditions and privacy policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
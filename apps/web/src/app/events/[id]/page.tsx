
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Users, Trophy, CreditCard, Shield, FileText, User, Award, HelpCircle, Building, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

interface Event {
  id: string;
  title: string;
  description: string;
  full_description: string;
  event_type: string;
  level: string;
  event_date: string;
  event_time_start: string;
  event_time_end: string;
  registration_start_date: string;
  registration_end_date: string;
  submission_deadline: string;
  max_participants: number;
  current_participants: number;
  min_age: number;
  max_age: number;
  gender_restriction: string;
  registration_fee: number;
  processing_fee: number;
  prize_pool: number;
  is_featured: boolean;
  status: string;
  location_type: string;
  venue_details: string;
  organizer: string;
  sport_category: {
    sport_name: string;
    category: string;
    measurement_type: string;
    measurement_unit: string;
    description: string;
  };
}

export default function EventDetailsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchEventDetails();
  }, [params.id]);

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`/api/events/${params.id}`);
      if (response.ok) {
        const result = await response.json();
        setEvent(result.data);
      }
    } catch (error) {
      // Handle error silently
    } finally {
      setLoading(false);
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

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-cyan-400">Loading event details...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Event Not Found</h1>
          <p className="text-gray-400">The event you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const isRegistrationOpen = event.status === 'registration_open';
  const registrationDeadlinePassed = new Date() > new Date(event.registration_end_date);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'prizes', label: 'Prizes', icon: Trophy },
    { id: 'rules', label: 'Rules', icon: Shield },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'sponsors', label: 'Sponsors', icon: Building }
  ];

  const TabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <Card className="bg-gray-900/50 border-cyan-500/30 p-6">
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">About This Event</h2>
              <p className="text-gray-300 leading-relaxed mb-6">{event.full_description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-cyan-400 mb-3">Event Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-cyan-400" />
                      <span className="text-white">{formatDate(event.event_date)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-cyan-400" />
                      <span className="text-white">{formatTime(event.event_time_start)} - {formatTime(event.event_time_end)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-cyan-400" />
                      <span className="text-white">{event.venue_details}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-cyan-400" />
                      <span className="text-white">{event.current_participants}/{event.max_participants} participants</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-cyan-400 mb-3">Eligibility</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-cyan-400" />
                      <span className="text-white">Age: {event.min_age} - {event.max_age} years</span>
                    </div>
                    {event.gender_restriction !== 'any' && (
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-cyan-400" />
                        <span className="text-white capitalize">Gender: {event.gender_restriction}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-cyan-400" />
                      <span className="text-white">Sport: {event.sport_category.sport_name}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'schedule':
        return (
          <Card className="bg-gray-900/50 border-cyan-500/30 p-6">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">Event Schedule</h2>
            <div className="space-y-4">
              {[
                { time: '09:00 AM', event: 'Registration & Check-in', description: 'Participants arrive and complete registration process' },
                { time: '10:00 AM', event: 'Opening Ceremony', description: 'Welcome address and event briefing' },
                { time: '11:00 AM', event: 'Warm-up Session', description: 'Guided warm-up and preparation time' },
                { time: '12:00 PM', event: 'Competition Begins', description: 'Main event competition starts' },
                { time: '04:00 PM', event: 'Results & Closing', description: 'Results announcement and prize distribution' }
              ].map((item, index) => (
                <div key={index} className="flex gap-4 p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-cyan-400 font-semibold min-w-[80px]">{item.time}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{item.event}</h3>
                    <p className="text-gray-400 text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );

      case 'prizes':
        return (
          <Card className="bg-gray-900/50 border-cyan-500/30 p-6">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">Prize Distribution</h2>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-6 rounded-lg border border-yellow-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Award className="w-8 h-8 text-yellow-500" />
                    <div>
                      <h3 className="text-xl font-bold text-yellow-500">1st Place</h3>
                      <p className="text-gray-300">Champion</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-500">₹{((event.prize_pool * 0.4) / 100).toLocaleString()}</div>
                    <div className="text-sm text-gray-400">40% of prize pool</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-400/20 to-gray-500/20 p-6 rounded-lg border border-gray-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Award className="w-8 h-8 text-gray-400" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-400">2nd Place</h3>
                      <p className="text-gray-300">Runner-up</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-400">₹{((event.prize_pool * 0.3) / 100).toLocaleString()}</div>
                    <div className="text-sm text-gray-400">30% of prize pool</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-600/20 to-orange-700/20 p-6 rounded-lg border border-orange-600/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Award className="w-8 h-8 text-orange-600" />
                    <div>
                      <h3 className="text-xl font-bold text-orange-600">3rd Place</h3>
                      <p className="text-gray-300">Second Runner-up</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">₹{((event.prize_pool * 0.2) / 100).toLocaleString()}</div>
                    <div className="text-sm text-gray-400">20% of prize pool</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-6 rounded-lg border border-cyan-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-cyan-500" />
                    <div>
                      <h3 className="text-xl font-bold text-cyan-500">Participation</h3>
                      <p className="text-gray-300">All other participants</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-cyan-500">₹{((event.prize_pool * 0.1) / 100).toLocaleString()}</div>
                    <div className="text-sm text-gray-400">10% of prize pool</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );

      case 'rules':
        return (
          <Card className="bg-gray-900/50 border-cyan-500/30 p-6">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">Rules & Guidelines</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">General Rules</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>All participants must register before the deadline</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Valid identification must be presented during registration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Participants must meet age and eligibility criteria</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Medical clearance may be required for certain events</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Competition Rules</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Follow all safety protocols and guidelines</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Use of performance-enhancing substances is strictly prohibited</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Respect officials, volunteers, and fellow participants</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Disputes will be resolved by event officials</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        );

      case 'faq':
        return (
          <Card className="bg-gray-900/50 border-cyan-500/30 p-6">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  question: 'What documents do I need to bring?',
                  answer: 'Please bring a valid government ID (Aadhar card, passport, or driving license) and any relevant sports certificates.'
                },
                {
                  question: 'Can I register as part of a team?',
                  answer: 'This depends on the event type. Individual events require solo registration, while team events allow group participation.'
                },
                {
                  question: 'What happens if it rains on event day?',
                  answer: 'The event will proceed as scheduled. In case of extreme weather, we will notify all participants 24 hours in advance.'
                },
                {
                  question: 'Are there any accommodation arrangements?',
                  answer: 'Accommodation is not provided by the organizers. However, we can recommend nearby hotels and lodging options.'
                },
                {
                  question: 'How will winners be selected?',
                  answer: 'Winners will be selected based on their performance in the event according to standard competition rules and judging criteria.'
                }
              ].map((faq, index) => (
                <div key={index} className="border-b border-gray-700 pb-4">
                  <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
                  <p className="text-gray-400">{faq.answer}</p>
                </div>
              ))}
            </div>
          </Card>
        );

      case 'sponsors':
        return (
          <Card className="bg-gray-900/50 border-cyan-500/30 p-6">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">Our Sponsors</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-orange-400 mb-4">Title Sponsor</h3>
                <div className="bg-gray-800/50 p-6 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <Building className="w-8 h-8 text-orange-500" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">Sports Authority of India</h4>
                      <p className="text-gray-400">National Sports Development Body</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-4">Official Partners</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'National Olympic Committee', type: 'Sports Partner' },
                    { name: 'Athletes Federation', type: 'Training Partner' },
                    { name: 'Sports Equipment Co.', type: 'Equipment Partner' },
                    { name: 'Health & Nutrition', type: 'Wellness Partner' }
                  ].map((sponsor, index) => (
                    <div key={index} className="bg-gray-800/30 p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                          <Building className="w-6 h-6 text-cyan-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{sponsor.name}</h4>
                          <p className="text-sm text-gray-400">{sponsor.type}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-b border-cyan-500/30">
        <div className="absolute inset-0 bg-[url('/grid.png')] opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center gap-4 mb-6">
            {event.is_featured && (
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                Featured
              </Badge>
            )}
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              {event.level}
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              {event.event_type}
            </Badge>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold font-orbitron mb-4 cyber-glow">
            {event.title}
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-3xl">
            {event.description}
          </p>

          <div className="flex items-center gap-8 text-gray-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <span>{formatDate(event.event_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span>{formatTime(event.event_time_start)} - {formatTime(event.event_time_end)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span>{event.current_participants}/{event.max_participants}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content with Tabs */}
          <div className="lg:col-span-3 space-y-8">
            {/* Unstop-like Tab Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-b border-gray-700"
            >
              <div className="flex space-x-0 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-300 border-b-2 whitespace-nowrap
                        ${activeTab === tab.id
                          ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
                          : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TabContent />
            </motion.div>
          </div>

          {/* Registration Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gray-900/50 border-cyan-500/30 p-6 sticky top-4">
                <h3 className="text-xl font-bold mb-4 text-cyan-400">Registration</h3>

                {/* Prize Pool */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-orange-400" />
                    <span className="text-orange-400 font-semibold">Prize Pool</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(event.prize_pool)}
                  </div>
                </div>

                {/* Registration Fee */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-5 h-5 text-cyan-400" />
                    <span className="text-cyan-400 font-semibold">Registration Fee</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-white">
                      {formatCurrency(event.registration_fee)}
                    </div>
                    <div className="text-sm text-gray-400">
                      + {formatCurrency(event.processing_fee)} processing fee
                    </div>
                  </div>
                </div>

                {/* Important Dates */}
                <div className="mb-6 space-y-3">
                  <div>
                    <span className="text-cyan-400 font-semibold">Registration Deadline:</span>
                    <div className="text-white">{formatDate(event.registration_end_date)}</div>
                  </div>
                  <div>
                    <span className="text-cyan-400 font-semibold">Submission Deadline:</span>
                    <div className="text-white">{formatDate(event.submission_deadline)}</div>
                  </div>
                </div>

                {/* Registration Button */}
                <div className="space-y-3">
                  {isRegistrationOpen && !registrationDeadlinePassed ? (
                    <Button
                      onClick={() => navigate(`/events/${event.id}/register`)}
                      className="w-full cyber-border cyber-glow bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 group"
                    >
                      Register Now - {formatCurrency(event.registration_fee + event.processing_fee)}
                      <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  ) : (
                    <Button disabled className="w-full bg-gray-600">
                      Registration Closed
                    </Button>
                  )}

                  {!isSignedIn && (
                    <p className="text-sm text-gray-400 text-center">
                      Please sign in to register for this event
                    </p>
                  )}
                </div>

                {/* Participants Stats */}
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h4 className="text-lg font-semibold text-cyan-400 mb-3">Participation</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Registered:</span>
                      <span className="text-white font-semibold">{event.current_participants}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Available Spots:</span>
                      <span className="text-white font-semibold">
                        {event.max_participants - event.current_participants}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${(event.current_participants / event.max_participants) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
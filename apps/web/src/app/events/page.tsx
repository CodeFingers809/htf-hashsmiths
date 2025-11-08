
import { motion } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useEvents, useSportsCategories } from '@/hooks/use-data';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Trophy,
  Target,
  Zap,
  Medal,
  ChevronRight,
  Loader2,
  Search,
  X
} from 'lucide-react';


export default function Events() {
  const { isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // API hooks
  const { data: events, pagination, loading: eventsLoading, error: eventsError, setFilters } = useEvents({
    sport: selectedSport === 'all' ? undefined : selectedSport,
    level: selectedLevel || undefined,
    page: 1,
    limit: 20
  });
  const { data: sportsData, loading: sportsLoading } = useSportsCategories();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || eventsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="cyber-card p-8 text-center">
          <Loader2 className="animate-spin w-8 h-8 text-cyan-500 mx-auto mb-4" />
          <p className="font-rajdhani text-cyan-400">Loading Competitions...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  if (eventsError) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <div className="cyber-card p-8 text-center">
            <p className="font-rajdhani text-red-400">Error loading events: {eventsError}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Helper function to check if event registration is open
  const isRegistrationOpen = (event: any) => {
    const now = new Date();
    const regStart = new Date(event.registration_start_date);
    const regEnd = new Date(event.registration_end_date);

    // First check if the event status allows registration
    if (event.status !== 'registration_open') {
      return false;
    }

    // Check if registration period is active
    if (now < regStart) {
      return false;
    }

    if (now > regEnd) {
      return false;
    }

    // Check if event is not full
    if (event.max_participants && event.current_participants >= event.max_participants) {
      return false;
    }

    return true;
  };

  // Helper function to get registration status text
  const getRegistrationStatus = (event: any) => {
    const now = new Date();
    const regStart = new Date(event.registration_start_date);
    const regEnd = new Date(event.registration_end_date);

    // Event lifecycle statuses
    if (event.status === 'completed') return 'Completed';
    if (event.status === 'cancelled') return 'Cancelled';
    if (event.status === 'ongoing') return 'Ongoing';
    if (event.status === 'draft') return 'Coming Soon';

    // Registration timing checks
    if (now < regStart) return 'Opens Soon';
    if (now > regEnd) return 'Registration Closed';

    // Capacity checks
    if (event.max_participants && event.current_participants >= event.max_participants) return 'Full';

    // If all checks pass and status is registration_open
    if (event.status === 'registration_open') return 'Open';

    // Default case
    return 'Closed';
  };

  // Helper function to get event styling
  const getEventStyling = (level: string) => {
    switch (level) {
      case 'National':
        return {
          color: 'border-orange-500/30',
          glowColor: 'text-orange-500',
          buttonClass: 'bg-orange-500 hover:bg-orange-400 text-black'
        };
      case 'State':
        return {
          color: 'border-cyan-500/30',
          glowColor: 'text-cyan-500',
          buttonClass: 'bg-cyan-500 hover:bg-cyan-400 text-black'
        };
      default:
        return {
          color: 'border-purple-500/30',
          glowColor: 'text-purple-500',
          buttonClass: 'bg-purple-500 hover:bg-purple-400 text-black'
        };
    }
  };

  // Create sport categories for filtering
  const sportCategories = [
    { name: 'All Events', value: 'all', count: pagination?.count || 0 },
    ...(sportsData?.grouped ? Object.entries(sportsData.grouped).map(([sport, categories]) => ({
      name: sport,
      value: sport.toLowerCase(),
      count: categories.length
    })) : [])
  ];

  // Filter events based on search and status
  const filteredEvents = events?.filter((event: any) => {
    const matchesSearch = !searchQuery ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizer?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' ||
      (selectedStatus === 'open' && isRegistrationOpen(event)) ||
      (selectedStatus === 'closed' && !isRegistrationOpen(event)) ||
      (selectedStatus === event.status);

    return matchesSearch && matchesStatus;
  }) || [];

  const handleSportFilter = (sportValue: string) => {
    setSelectedSport(sportValue);
    setFilters({
      sport: sportValue === 'all' ? undefined : sportValue,
      level: selectedLevel || undefined
    });
  };

  const handleLevelFilter = (level: string) => {
    setSelectedLevel(level);
    setFilters({
      sport: selectedSport === 'all' ? undefined : selectedSport,
      level: level || undefined
    });
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
  };

  const clearFilters = () => {
    setSelectedSport('all');
    setSelectedLevel('');
    setSelectedStatus('all');
    setSearchQuery('');
    setFilters({});
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
            COMPETITIONS
          </h1>
          <p className="text-muted-foreground font-rajdhani text-lg">
            Compete from anywhere • AI-powered assessment • Direct SAI pipeline
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-orange-500 mt-4 cyber-glow" />
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="cyber-card p-4 text-center">
            <Calendar className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="font-orbitron text-xl font-bold text-foreground">
              {pagination?.count || 0}
            </p>
            <p className="text-sm font-rajdhani text-muted-foreground">Active Events</p>
          </div>
          <div className="cyber-card p-4 text-center">
            <Users className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <p className="font-orbitron text-xl font-bold text-foreground">
              {events?.reduce((sum: number, event: any) => sum + event.current_participants, 0) || 0}
            </p>
            <p className="text-sm font-rajdhani text-muted-foreground">Total Participants</p>
          </div>
          <div className="cyber-card p-4 text-center">
            <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <p className="font-orbitron text-xl font-bold text-foreground">
              ₹{((events?.reduce((sum: number, event: any) => sum + (event.prize_pool || 0), 0) || 0) / 100).toLocaleString()}
            </p>
            <p className="text-sm font-rajdhani text-muted-foreground">Prize Money</p>
          </div>
          <div className="cyber-card p-4 text-center">
            <Target className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="font-orbitron text-xl font-bold text-foreground">
              {sportsData?.data?.length || 0}
            </p>
            <p className="text-sm font-rajdhani text-muted-foreground">Sports Categories</p>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-8"
        >
          <div className="cyber-card p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search events, organizers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-card/50 border border-cyan-500/30 rounded-lg font-rajdhani focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 text-foreground placeholder-muted-foreground"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Level Filter */}
              <div>
                <select
                  value={selectedLevel}
                  onChange={(e) => handleLevelFilter(e.target.value)}
                  className="w-full py-2 px-3 bg-card/50 border border-cyan-500/30 rounded-lg font-rajdhani focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 text-foreground"
                >
                  <option value="">All Levels</option>
                  <option value="National">National</option>
                  <option value="State">State</option>
                  <option value="Regional">Regional</option>
                  <option value="District">District</option>
                  <option value="Local">Local</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="flex-1 py-2 px-3 bg-card/50 border border-cyan-500/30 rounded-lg font-rajdhani focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 text-foreground"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="completed">Completed</option>
                  <option value="ongoing">Ongoing</option>
                </select>

                {(searchQuery || selectedLevel || selectedStatus !== 'all' || selectedSport !== 'all') && (
                  <button
                    onClick={clearFilters}
                    className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-rajdhani text-sm"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchQuery || selectedLevel || selectedStatus !== 'all' || selectedSport !== 'all') && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm font-rajdhani text-muted-foreground">Active filters:</span>
                {selectedSport !== 'all' && (
                  <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs font-rajdhani">
                    Sport: {selectedSport}
                  </span>
                )}
                {selectedLevel && (
                  <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs font-rajdhani">
                    Level: {selectedLevel}
                  </span>
                )}
                {selectedStatus !== 'all' && (
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-rajdhani">
                    Status: {selectedStatus}
                  </span>
                )}
                {searchQuery && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-rajdhani">
                    Search: "{searchQuery}"
                  </span>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-4">
            {!sportsLoading && sportCategories.map((category) => (
              <button
                key={category.value}
                onClick={() => handleSportFilter(category.value)}
                className={`
                  px-6 py-3 rounded-lg font-rajdhani font-semibold transition-all duration-300
                  ${selectedSport === category.value
                    ? 'cyber-border cyber-glow bg-cyan-500/20 text-cyan-300'
                    : 'bg-card/30 text-muted-foreground hover:text-foreground hover:bg-card/50'
                  }
                `}
              >
                {category.name}
                <span className="ml-2 text-xs opacity-70">({category.count})</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Events Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-6"
        >
          {filteredEvents && filteredEvents.length > 0 ? (
            filteredEvents.map((event: any) => {
              const styling = getEventStyling(event.level);
              return (
                <motion.div
                  key={event.id}
                  whileHover={{ scale: 1.01 }}
                  className={`cyber-card p-6 ${styling.color} hover:border-opacity-60 transition-all duration-300`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Event Details */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full bg-card/50 ${styling.glowColor}`}>
                          <Medal className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-orbitron text-xl font-bold text-foreground">
                              {event.title}
                            </h3>
                            <span className={`
                              px-3 py-1 rounded-full text-xs font-rajdhani font-semibold
                              ${event.level === 'National' ? 'bg-orange-500/20 text-orange-400' :
                                event.level === 'State' ? 'bg-cyan-500/20 text-cyan-400' :
                                'bg-purple-500/20 text-purple-400'}
                            `}>
                              {event.level}
                            </span>
                            <span className={`
                              px-3 py-1 rounded-full text-xs font-rajdhani font-semibold
                              ${isRegistrationOpen(event) ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
                            `}>
                              {getRegistrationStatus(event)}
                            </span>
                          </div>
                          <p className="text-muted-foreground font-rajdhani mb-4">
                            {event.description || 'Virtual sports assessment with AI-powered analysis'}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-rajdhani">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-cyan-400" />
                              <span className="text-foreground">
                                {new Date(event.event_date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-orange-500" />
                              <span className="text-foreground">
                                {event.event_time_start || '12:00 PM'} - {event.event_time_end || '6:00 PM'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-green-500" />
                              <span className="text-foreground">
                                {event.location_type === 'virtual' ? 'Virtual • Record from Home' : event.venue || 'Virtual'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats and Actions */}
                    <div className="lg:w-72 space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-card/30 p-3 rounded-lg">
                          <p className="font-orbitron text-lg font-bold text-cyan-300">
                            {event.current_participants.toLocaleString()}
                          </p>
                          <p className="text-xs font-rajdhani text-muted-foreground">
                            Registered
                          </p>
                        </div>
                        <div className="bg-card/30 p-3 rounded-lg">
                          <p className="font-orbitron text-lg font-bold text-orange-400">
                            ₹{((event.prize_pool || 0) / 100).toLocaleString()}
                          </p>
                          <p className="text-xs font-rajdhani text-muted-foreground">
                            Prize Pool
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={() => {
                          if (isRegistrationOpen(event)) {
                            navigate(`/events/${event.id}/register`);
                          }
                        }}
                        disabled={!isRegistrationOpen(event)}
                        className={`
                          w-full cyber-border cyber-glow font-rajdhani font-semibold transition-all duration-300 group
                          ${isRegistrationOpen(event) ? styling.buttonClass : 'bg-gray-600 hover:bg-gray-600 text-gray-400 cursor-not-allowed'}
                        `}
                      >
                        <Zap className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                        {isRegistrationOpen(event) ? 'Register Now' : getRegistrationStatus(event)}
                        <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>

                      <div className="text-center">
                        <button
                          onClick={() => navigate(`/events/${event.id}`)}
                          className="text-xs font-rajdhani text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          View Details & Rules
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-orbitron text-xl font-bold text-foreground mb-2">
                No Events Found
              </h3>
              <p className="font-rajdhani text-muted-foreground">
                {searchQuery || selectedLevel || selectedStatus !== 'all' || selectedSport !== 'all'
                  ? 'No events match your current filters. Try adjusting your search criteria.'
                  : 'No events are currently available. Check back later!'}
              </p>
              {(searchQuery || selectedLevel || selectedStatus !== 'all' || selectedSport !== 'all') && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="mt-4 cyber-border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          )}
        </motion.div>

        {/* Load More */}
        {pagination?.hasNext && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Button
              variant="outline"
              onClick={() => {
                // TODO: Implement load more functionality
                console.log('Load more events');
              }}
              className="cyber-border px-8 py-3 font-rajdhani font-semibold border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
            >
              Load More Events
            </Button>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
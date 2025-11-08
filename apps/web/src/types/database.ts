// Database types for SCOUTLETE platform
// Generated from Supabase schema

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      user_sports: {
        Row: UserSport;
        Insert: UserSportInsert;
        Update: UserSportUpdate;
      };
      user_preferences: {
        Row: UserPreferences;
        Insert: UserPreferencesInsert;
        Update: UserPreferencesUpdate;
      };
      user_goals: {
        Row: UserGoals;
        Insert: UserGoalsInsert;
        Update: UserGoalsUpdate;
      };
      user_achievements: {
        Row: UserAchievements;
        Insert: UserAchievementsInsert;
        Update: UserAchievementsUpdate;
      };
      user_connections: {
        Row: UserConnections;
        Insert: UserConnectionsInsert;
        Update: UserConnectionsUpdate;
      };
      user_dashboard_stats: {
        Row: UserDashboardStats;
        Insert: UserDashboardStatsInsert;
        Update: UserDashboardStatsUpdate;
      };
      emergency_contacts: {
        Row: EmergencyContact;
        Insert: EmergencyContactInsert;
        Update: EmergencyContactUpdate;
      };
      coach_profiles: {
        Row: CoachProfile;
        Insert: CoachProfileInsert;
        Update: CoachProfileUpdate;
      };
      sports_categories: {
        Row: SportCategory;
        Insert: SportCategoryInsert;
        Update: SportCategoryUpdate;
      };
      events: {
        Row: Event;
        Insert: EventInsert;
        Update: EventUpdate;
      };
      event_registrations: {
        Row: EventRegistrations;
        Insert: EventRegistrationsInsert;
        Update: EventRegistrationsUpdate;
      };
      event_analytics: {
        Row: EventAnalytics;
        Insert: EventAnalyticsInsert;
        Update: EventAnalyticsUpdate;
      };
      teams: {
        Row: Team;
        Insert: TeamInsert;
        Update: TeamUpdate;
      };
      team_members: {
        Row: TeamMember;
        Insert: TeamMemberInsert;
        Update: TeamMemberUpdate;
      };
      team_events: {
        Row: TeamEvents;
        Insert: TeamEventsInsert;
        Update: TeamEventsUpdate;
      };
      team_invites: {
        Row: TeamInvites;
        Insert: TeamInvitesInsert;
        Update: TeamInvitesUpdate;
      };
      team_roles: {
        Row: TeamRoles;
        Insert: TeamRolesInsert;
        Update: TeamRolesUpdate;
      };
      team_performance_summary: {
        Row: TeamPerformanceSummary;
        Insert: TeamPerformanceSummaryInsert;
        Update: TeamPerformanceSummaryUpdate;
      };
      personal_records: {
        Row: PersonalRecord;
        Insert: PersonalRecordInsert;
        Update: PersonalRecordUpdate;
      };
      performance_metrics: {
        Row: PerformanceMetrics;
        Insert: PerformanceMetricsInsert;
        Update: PerformanceMetricsUpdate;
      };
      performance_benchmarks: {
        Row: PerformanceBenchmarks;
        Insert: PerformanceBenchmarksInsert;
        Update: PerformanceBenchmarksUpdate;
      };
      training_sessions: {
        Row: TrainingSessions;
        Insert: TrainingSessionsInsert;
        Update: TrainingSessionsUpdate;
      };
      training_exercises: {
        Row: TrainingExercises;
        Insert: TrainingExercisesInsert;
        Update: TrainingExercisesUpdate;
      };
      achievements: {
        Row: Achievements;
        Insert: AchievementsInsert;
        Update: AchievementsUpdate;
      };
      notifications: {
        Row: Notifications;
        Insert: NotificationsInsert;
        Update: NotificationsUpdate;
      };
      messages: {
        Row: Messages;
        Insert: MessagesInsert;
        Update: MessagesUpdate;
      };
      conversations: {
        Row: Conversations;
        Insert: ConversationsInsert;
        Update: ConversationsUpdate;
      };
      conversation_participants: {
        Row: ConversationParticipants;
        Insert: ConversationParticipantsInsert;
        Update: ConversationParticipantsUpdate;
      };
      files: {
        Row: FileRecord;
        Insert: FileRecordInsert;
        Update: FileRecordUpdate;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_current_user_id: {
        Args: {};
        Returns: string;
      };
    };
    Enums: {
      gender_type: 'male' | 'female' | 'other' | 'prefer_not_to_say';
      account_type: 'athlete' | 'coach' | 'official' | 'admin';
      experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      measurement_type: 'time' | 'distance' | 'weight' | 'score' | 'count';
      event_type: 'competition' | 'trial' | 'assessment' | 'championship';
      event_level: 'National' | 'State' | 'Regional' | 'District' | 'Local';
      gender_restriction: 'male' | 'female' | 'mixed' | 'any';
      event_status: 'draft' | 'published' | 'registration_open' | 'registration_closed' | 'ongoing' | 'completed' | 'cancelled';
      location_type: 'virtual' | 'physical' | 'hybrid';
      team_role: 'captain' | 'co_captain' | 'member';
      member_status: 'active' | 'inactive' | 'removed';
      team_status: 'active' | 'inactive' | 'disbanded' | 'completed';
      verification_status: 'pending' | 'in_review' | 'verified' | 'rejected' | 'requires_resubmission';
      verification_method: 'video' | 'live_event' | 'official_event' | 'sensor_data';
      processing_status: 'pending' | 'processing' | 'completed' | 'failed';
      access_level: 'public' | 'private' | 'restricted';
      registration_status: 'pending' | 'confirmed' | 'cancelled' | 'waitlisted';
      payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
      notification_priority: 'low' | 'medium' | 'high' | 'urgent';
      conversation_type: 'direct' | 'team' | 'event' | 'group';
      message_type: 'text' | 'image' | 'video' | 'file' | 'system';
      goal_status: 'active' | 'completed' | 'paused' | 'cancelled';
      connection_status: 'pending' | 'accepted' | 'blocked' | 'declined';
      achievement_rarity: 'common' | 'rare' | 'epic' | 'legendary';
    };
  };
}

// Core entity types
export interface User {
  id: string;
  clerk_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  avatar_url?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: Database['public']['Enums']['gender_type'];
  profile_completed: boolean;
  profile_completion_percentage: number;
  is_verified: boolean;
  is_active: boolean;
  account_type: Database['public']['Enums']['account_type'];
  country: string;
  state?: string;
  city?: string;
  address?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
  last_active_at: string;
}

export interface UserInsert {
  id?: string;
  clerk_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  avatar_url?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: Database['public']['Enums']['gender_type'];
  profile_completed?: boolean;
  profile_completion_percentage?: number;
  is_verified?: boolean;
  is_active?: boolean;
  account_type?: Database['public']['Enums']['account_type'];
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
}

export interface UserUpdate {
  clerk_id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  avatar_url?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: Database['public']['Enums']['gender_type'];
  profile_completed?: boolean;
  profile_completion_percentage?: number;
  is_verified?: boolean;
  is_active?: boolean;
  account_type?: Database['public']['Enums']['account_type'];
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
}

export interface UserSport {
  id: string;
  user_id: string;
  sport_name: string;
  category?: string;
  experience_level?: Database['public']['Enums']['experience_level'];
  years_experience?: number;
  is_primary: boolean;
  created_at: string;
}

export interface UserSportInsert {
  id?: string;
  user_id: string;
  sport_name: string;
  category?: string;
  experience_level?: Database['public']['Enums']['experience_level'];
  years_experience?: number;
  is_primary?: boolean;
}

export interface UserSportUpdate {
  user_id?: string;
  sport_name?: string;
  category?: string;
  experience_level?: Database['public']['Enums']['experience_level'];
  years_experience?: number;
  is_primary?: boolean;
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  is_primary: boolean;
  created_at: string;
}

export interface EmergencyContactInsert {
  id?: string;
  user_id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  is_primary?: boolean;
}

export interface EmergencyContactUpdate {
  user_id?: string;
  name?: string;
  relationship?: string;
  phone?: string;
  email?: string;
  is_primary?: boolean;
}

export interface CoachProfile {
  id: string;
  user_id: string;
  bio?: string;
  certifications?: string[];
  specializations?: string[];
  experience_years?: number;
  fee_per_month?: number;
  availability_schedule?: Record<string, any>;
  success_rate?: number;
  rating?: number;
  total_reviews: number;
  total_athletes: number;
  is_verified_coach: boolean;
  created_at: string;
  updated_at: string;
}

export interface CoachProfileInsert {
  id?: string;
  user_id: string;
  bio?: string;
  certifications?: string[];
  specializations?: string[];
  experience_years?: number;
  fee_per_month?: number;
  availability_schedule?: Record<string, any>;
  success_rate?: number;
  rating?: number;
  total_reviews?: number;
  total_athletes?: number;
  is_verified_coach?: boolean;
}

export interface CoachProfileUpdate {
  user_id?: string;
  bio?: string;
  certifications?: string[];
  specializations?: string[];
  experience_years?: number;
  fee_per_month?: number;
  availability_schedule?: Record<string, any>;
  success_rate?: number;
  rating?: number;
  total_reviews?: number;
  total_athletes?: number;
  is_verified_coach?: boolean;
}

export interface SportCategory {
  id: string;
  sport_name: string;
  category: string;
  description?: string;
  measurement_unit?: string;
  measurement_type?: Database['public']['Enums']['measurement_type'];
  is_active: boolean;
  created_at: string;
}

export interface SportCategoryInsert {
  id?: string;
  sport_name: string;
  category: string;
  description?: string;
  measurement_unit?: string;
  measurement_type?: Database['public']['Enums']['measurement_type'];
  is_active?: boolean;
}

export interface SportCategoryUpdate {
  sport_name?: string;
  category?: string;
  description?: string;
  measurement_unit?: string;
  measurement_type?: Database['public']['Enums']['measurement_type'];
  is_active?: boolean;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description?: string;
  full_description?: string;
  sport_category_id?: string;
  event_type: Database['public']['Enums']['event_type'];
  level: Database['public']['Enums']['event_level'];
  event_date: string;
  event_time_start?: string;
  event_time_end?: string;
  registration_start_date: string;
  registration_end_date: string;
  submission_deadline?: string;
  max_participants?: number;
  current_participants: number;
  min_age?: number;
  max_age?: number;
  gender_restriction?: Database['public']['Enums']['gender_restriction'];
  registration_fee: number;
  processing_fee: number;
  prize_pool: number;
  prize_distribution?: Record<string, any>;
  eligibility_criteria?: string[];
  rules_and_guidelines?: string[];
  required_documents?: string[];
  equipment_requirements?: string[];
  organizer?: string;
  contact_email?: string;
  contact_phone?: string;
  location_type: Database['public']['Enums']['location_type'];
  venue_details?: string;
  status: Database['public']['Enums']['event_status'];
  is_featured: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface EventInsert {
  id?: string;
  title: string;
  slug: string;
  description?: string;
  full_description?: string;
  sport_category_id?: string;
  event_type?: Database['public']['Enums']['event_type'];
  level: Database['public']['Enums']['event_level'];
  event_date: string;
  event_time_start?: string;
  event_time_end?: string;
  registration_start_date: string;
  registration_end_date: string;
  submission_deadline?: string;
  max_participants?: number;
  current_participants?: number;
  min_age?: number;
  max_age?: number;
  gender_restriction?: Database['public']['Enums']['gender_restriction'];
  registration_fee?: number;
  processing_fee?: number;
  prize_pool?: number;
  prize_distribution?: Record<string, any>;
  eligibility_criteria?: string[];
  rules_and_guidelines?: string[];
  required_documents?: string[];
  equipment_requirements?: string[];
  organizer?: string;
  contact_email?: string;
  contact_phone?: string;
  location_type?: Database['public']['Enums']['location_type'];
  venue_details?: string;
  status?: Database['public']['Enums']['event_status'];
  is_featured?: boolean;
  is_public?: boolean;
  created_by?: string;
}

export interface EventUpdate {
  title?: string;
  slug?: string;
  description?: string;
  full_description?: string;
  sport_category_id?: string;
  event_type?: Database['public']['Enums']['event_type'];
  level?: Database['public']['Enums']['event_level'];
  event_date?: string;
  event_time_start?: string;
  event_time_end?: string;
  registration_start_date?: string;
  registration_end_date?: string;
  submission_deadline?: string;
  max_participants?: number;
  current_participants?: number;
  min_age?: number;
  max_age?: number;
  gender_restriction?: Database['public']['Enums']['gender_restriction'];
  registration_fee?: number;
  processing_fee?: number;
  prize_pool?: number;
  prize_distribution?: Record<string, any>;
  eligibility_criteria?: string[];
  rules_and_guidelines?: string[];
  required_documents?: string[];
  equipment_requirements?: string[];
  organizer?: string;
  contact_email?: string;
  contact_phone?: string;
  location_type?: Database['public']['Enums']['location_type'];
  venue_details?: string;
  status?: Database['public']['Enums']['event_status'];
  is_featured?: boolean;
  is_public?: boolean;
  created_by?: string;
}

export interface Team {
  id: string;
  uuid: string;
  name: string;
  description?: string;
  sport_category_id?: string;
  event_id?: string;
  max_members: number;
  current_members: number;
  is_public: boolean;
  join_code: string;
  required_skills?: string[];
  requirements?: string[];
  experience_level?: Database['public']['Enums']['experience_level'];
  location_city?: string;
  location_state?: string;
  practice_schedule?: Record<string, any>;
  status: Database['public']['Enums']['team_status'];
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface TeamInsert {
  id?: string;
  uuid?: string;
  name: string;
  description?: string;
  sport_category_id?: string;
  event_id?: string;
  max_members?: number;
  current_members?: number;
  is_public?: boolean;
  join_code?: string;
  required_skills?: string[];
  requirements?: string[];
  experience_level?: Database['public']['Enums']['experience_level'];
  location_city?: string;
  location_state?: string;
  practice_schedule?: Record<string, any>;
  status?: Database['public']['Enums']['team_status'];
  created_by: string;
}

export interface TeamUpdate {
  uuid?: string;
  name?: string;
  description?: string;
  sport_category_id?: string;
  event_id?: string;
  max_members?: number;
  current_members?: number;
  is_public?: boolean;
  join_code?: string;
  required_skills?: string[];
  requirements?: string[];
  experience_level?: Database['public']['Enums']['experience_level'];
  location_city?: string;
  location_state?: string;
  practice_schedule?: Record<string, any>;
  status?: Database['public']['Enums']['team_status'];
  created_by?: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: Database['public']['Enums']['team_role'];
  skills?: string[];
  personal_best?: string;
  position?: string;
  jersey_number?: number;
  status: Database['public']['Enums']['member_status'];
  joined_at: string;
}

export interface TeamMemberInsert {
  id?: string;
  team_id: string;
  user_id: string;
  role?: Database['public']['Enums']['team_role'];
  skills?: string[];
  personal_best?: string;
  position?: string;
  jersey_number?: number;
  status?: Database['public']['Enums']['member_status'];
}

export interface TeamMemberUpdate {
  team_id?: string;
  user_id?: string;
  role?: Database['public']['Enums']['team_role'];
  skills?: string[];
  personal_best?: string;
  position?: string;
  jersey_number?: number;
  status?: Database['public']['Enums']['member_status'];
}

export interface PersonalRecord {
  id: string;
  user_id: string;
  sport_category_id?: string;
  category: string;
  value: number;
  unit: string;
  description?: string;
  achievement_date?: string;
  location?: string;
  event_context?: string;
  weather_conditions?: string;
  equipment_used?: string;
  verification_status: Database['public']['Enums']['verification_status'];
  verification_method: Database['public']['Enums']['verification_method'];
  verified_at?: string;
  verified_by?: string;
  verification_notes?: string;
  badge_level?: string;
  badge_criteria_met?: Record<string, any>;
  ai_analysis_score?: number;
  ai_analysis_details?: Record<string, any>;
  manual_review_required: boolean;
  primary_video_id?: string;
  secondary_videos?: string[];
  is_active: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface PersonalRecordInsert {
  id?: string;
  user_id: string;
  sport_category_id?: string;
  category: string;
  value: number;
  unit: string;
  description?: string;
  achievement_date?: string;
  location?: string;
  event_context?: string;
  weather_conditions?: string;
  equipment_used?: string;
  verification_status?: Database['public']['Enums']['verification_status'];
  verification_method?: Database['public']['Enums']['verification_method'];
  verified_at?: string;
  verified_by?: string;
  verification_notes?: string;
  badge_level?: string;
  badge_criteria_met?: Record<string, any>;
  ai_analysis_score?: number;
  ai_analysis_details?: Record<string, any>;
  manual_review_required?: boolean;
  primary_video_id?: string;
  secondary_videos?: string[];
  is_active?: boolean;
  is_public?: boolean;
}

export interface PersonalRecordUpdate {
  user_id?: string;
  sport_category_id?: string;
  category?: string;
  value?: number;
  unit?: string;
  description?: string;
  achievement_date?: string;
  location?: string;
  event_context?: string;
  weather_conditions?: string;
  equipment_used?: string;
  verification_status?: Database['public']['Enums']['verification_status'];
  verification_method?: Database['public']['Enums']['verification_method'];
  verified_at?: string;
  verified_by?: string;
  verification_notes?: string;
  badge_level?: string;
  badge_criteria_met?: Record<string, any>;
  ai_analysis_score?: number;
  ai_analysis_details?: Record<string, any>;
  manual_review_required?: boolean;
  primary_video_id?: string;
  secondary_videos?: string[];
  is_active?: boolean;
  is_public?: boolean;
}

export interface FileRecord {
  id: string;
  user_id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  mime_type: string;
  file_size_bytes: number;
  storage_path: string;
  storage_bucket: string;
  public_url?: string;
  duration_seconds?: number;
  resolution?: string;
  frame_rate?: number;
  video_codec?: string;
  audio_codec?: string;
  processing_status: Database['public']['Enums']['processing_status'];
  processed_at?: string;
  processing_error?: string;
  thumbnail_url?: string;
  preview_url?: string;
  usage_type: string;
  related_entity_type?: string;
  related_entity_id?: string;
  is_public: boolean;
  access_level: Database['public']['Enums']['access_level'];
  created_at: string;
  updated_at: string;
}

export interface FileRecordInsert {
  id?: string;
  user_id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  mime_type: string;
  file_size_bytes: number;
  storage_path: string;
  storage_bucket?: string;
  public_url?: string;
  duration_seconds?: number;
  resolution?: string;
  frame_rate?: number;
  video_codec?: string;
  audio_codec?: string;
  processing_status?: Database['public']['Enums']['processing_status'];
  processed_at?: string;
  processing_error?: string;
  thumbnail_url?: string;
  preview_url?: string;
  usage_type: string;
  related_entity_type?: string;
  related_entity_id?: string;
  is_public?: boolean;
  access_level?: Database['public']['Enums']['access_level'];
}

export interface FileRecordUpdate {
  user_id?: string;
  filename?: string;
  original_filename?: string;
  file_type?: string;
  mime_type?: string;
  file_size_bytes?: number;
  storage_path?: string;
  storage_bucket?: string;
  public_url?: string;
  duration_seconds?: number;
  resolution?: string;
  frame_rate?: number;
  video_codec?: string;
  audio_codec?: string;
  processing_status?: Database['public']['Enums']['processing_status'];
  processed_at?: string;
  processing_error?: string;
  thumbnail_url?: string;
  preview_url?: string;
  usage_type?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  is_public?: boolean;
  access_level?: Database['public']['Enums']['access_level'];
}

// Utility types for API responses
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Personal Record Badge Types
export type BadgeLevel = 'Elite' | 'Strong' | 'Fast' | 'Endurance';

export interface PersonalRecordWithBadge extends PersonalRecord {
  badge?: {
    level: BadgeLevel;
    color: string;
    icon: string;
  };
}

// Team with members
export interface TeamWithMembers extends Team {
  members: (TeamMember & { user: User })[];
  sport_category?: SportCategory;
  created_by_user?: User;
}

// Event with additional info
export interface EventWithDetails extends Event {
  sport_category?: SportCategory;
  registrations_count?: number;
  is_registered?: boolean;
  registration?: EventRegistrations;
  analytics?: EventAnalytics;
}

// Extended types for new entities
export interface UserPreferences {
  id: string;
  user_id: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  notification_frequency: string;
  notification_types: Record<string, any>;
  profile_visibility: string;
  show_performance_data: boolean;
  show_location: boolean;
  show_contact_info: boolean;
  show_training_data: boolean;
  allow_team_invites: boolean;
  allow_coach_contact: boolean;
  performance_tracking_enabled: boolean;
  auto_sync_devices: boolean;
  metric_units: string;
  auto_share_achievements: boolean;
  performance_goals_public: boolean;
  theme: string;
  language: string;
  timezone: string;
  date_format: string;
  time_format: string;
  currency: string;
  preferred_contact_method: string;
  marketing_emails: boolean;
  coaching_tips: boolean;
  performance_reports: boolean;
  default_session_privacy: string;
  reminder_notifications: boolean;
  workout_rest_reminders: boolean;
  form_check_reminders: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPreferencesInsert {
  id?: string;
  user_id: string;
  notifications_enabled?: boolean;
  email_notifications?: boolean;
  push_notifications?: boolean;
  sms_notifications?: boolean;
  notification_frequency?: string;
  notification_types?: Record<string, any>;
  profile_visibility?: string;
  show_performance_data?: boolean;
  show_location?: boolean;
  show_contact_info?: boolean;
  show_training_data?: boolean;
  allow_team_invites?: boolean;
  allow_coach_contact?: boolean;
  performance_tracking_enabled?: boolean;
  auto_sync_devices?: boolean;
  metric_units?: string;
  auto_share_achievements?: boolean;
  performance_goals_public?: boolean;
  theme?: string;
  language?: string;
  timezone?: string;
  date_format?: string;
  time_format?: string;
  currency?: string;
  preferred_contact_method?: string;
  marketing_emails?: boolean;
  coaching_tips?: boolean;
  performance_reports?: boolean;
  default_session_privacy?: string;
  reminder_notifications?: boolean;
  workout_rest_reminders?: boolean;
  form_check_reminders?: boolean;
}

export interface UserPreferencesUpdate {
  user_id?: string;
  notifications_enabled?: boolean;
  email_notifications?: boolean;
  push_notifications?: boolean;
  sms_notifications?: boolean;
  notification_frequency?: string;
  notification_types?: Record<string, any>;
  profile_visibility?: string;
  show_performance_data?: boolean;
  show_location?: boolean;
  show_contact_info?: boolean;
  show_training_data?: boolean;
  allow_team_invites?: boolean;
  allow_coach_contact?: boolean;
  performance_tracking_enabled?: boolean;
  auto_sync_devices?: boolean;
  metric_units?: string;
  auto_share_achievements?: boolean;
  performance_goals_public?: boolean;
  theme?: string;
  language?: string;
  timezone?: string;
  date_format?: string;
  time_format?: string;
  currency?: string;
  preferred_contact_method?: string;
  marketing_emails?: boolean;
  coaching_tips?: boolean;
  performance_reports?: boolean;
  default_session_privacy?: string;
  reminder_notifications?: boolean;
  workout_rest_reminders?: boolean;
  form_check_reminders?: boolean;
}

export interface UserGoals {
  id: string;
  user_id: string;
  goal_type: string;
  sport_category_id?: string;
  title: string;
  description?: string;
  target_value?: number;
  target_unit?: string;
  current_value?: number;
  target_date?: string;
  status: Database['public']['Enums']['goal_status'];
  progress_percentage?: number;
  priority?: string;
  difficulty?: string;
  is_public: boolean;
  reminder_frequency?: string;
  milestone_rewards?: Record<string, any>;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserGoalsInsert {
  id?: string;
  user_id: string;
  goal_type: string;
  sport_category_id?: string;
  title: string;
  description?: string;
  target_value?: number;
  target_unit?: string;
  current_value?: number;
  target_date?: string;
  status?: Database['public']['Enums']['goal_status'];
  progress_percentage?: number;
  priority?: string;
  difficulty?: string;
  is_public?: boolean;
  reminder_frequency?: string;
  milestone_rewards?: Record<string, any>;
  completed_at?: string;
}

export interface UserGoalsUpdate {
  user_id?: string;
  goal_type?: string;
  sport_category_id?: string;
  title?: string;
  description?: string;
  target_value?: number;
  target_unit?: string;
  current_value?: number;
  target_date?: string;
  status?: Database['public']['Enums']['goal_status'];
  progress_percentage?: number;
  priority?: string;
  difficulty?: string;
  is_public?: boolean;
  reminder_frequency?: string;
  milestone_rewards?: Record<string, any>;
  completed_at?: string;
}

export interface UserAchievements {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  progress_data?: Record<string, any>;
  unlock_source?: string;
  is_showcased: boolean;
  notification_sent: boolean;
  shared_socially: boolean;
  created_at: string;
}

export interface UserAchievementsInsert {
  id?: string;
  user_id: string;
  achievement_id: string;
  unlocked_at?: string;
  progress_data?: Record<string, any>;
  unlock_source?: string;
  is_showcased?: boolean;
  notification_sent?: boolean;
  shared_socially?: boolean;
}

export interface UserAchievementsUpdate {
  user_id?: string;
  achievement_id?: string;
  unlocked_at?: string;
  progress_data?: Record<string, any>;
  unlock_source?: string;
  is_showcased?: boolean;
  notification_sent?: boolean;
  shared_socially?: boolean;
}

export interface UserConnections {
  id: string;
  user_id: string;
  connected_user_id: string;
  connection_type?: string;
  status: Database['public']['Enums']['connection_status'];
  initiated_by: string;
  message?: string;
  mutual_friends?: number;
  interaction_count?: number;
  last_interaction?: string;
  connection_strength?: number;
  connected_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserConnectionsInsert {
  id?: string;
  user_id: string;
  connected_user_id: string;
  connection_type?: string;
  status?: Database['public']['Enums']['connection_status'];
  initiated_by: string;
  message?: string;
  mutual_friends?: number;
  interaction_count?: number;
  last_interaction?: string;
  connection_strength?: number;
  connected_at?: string;
}

export interface UserConnectionsUpdate {
  user_id?: string;
  connected_user_id?: string;
  connection_type?: string;
  status?: Database['public']['Enums']['connection_status'];
  initiated_by?: string;
  message?: string;
  mutual_friends?: number;
  interaction_count?: number;
  last_interaction?: string;
  connection_strength?: number;
  connected_at?: string;
}

export interface UserDashboardStats {
  user_id: string;
  display_name?: string;
  account_type?: Database['public']['Enums']['account_type'];
  training_sessions_30d?: number;
  event_registrations?: number;
  teams_count?: number;
  personal_records_count?: number;
  achievements_count?: number;
  avg_training_intensity?: number;
  connections_count?: number;
  unread_notifications?: number;
}

export interface UserDashboardStatsInsert {
  user_id: string;
  display_name?: string;
  account_type?: Database['public']['Enums']['account_type'];
  training_sessions_30d?: number;
  event_registrations?: number;
  teams_count?: number;
  personal_records_count?: number;
  achievements_count?: number;
  avg_training_intensity?: number;
  connections_count?: number;
  unread_notifications?: number;
}

export interface UserDashboardStatsUpdate {
  user_id?: string;
  display_name?: string;
  account_type?: Database['public']['Enums']['account_type'];
  training_sessions_30d?: number;
  event_registrations?: number;
  teams_count?: number;
  personal_records_count?: number;
  achievements_count?: number;
  avg_training_intensity?: number;
  connections_count?: number;
  unread_notifications?: number;
}

export interface EventRegistrations {
  id: string;
  event_id: string;
  user_id: string;
  team_id?: string;
  registration_type?: string;
  status: Database['public']['Enums']['registration_status'];
  payment_status: Database['public']['Enums']['payment_status'];
  payment_amount?: number;
  payment_id?: string;
  payment_gateway?: string;
  additional_info?: Record<string, any>;
  emergency_contact?: Record<string, any>;
  medical_info?: Record<string, any>;
  dietary_requirements?: string;
  t_shirt_size?: string;
  checked_in_at?: string;
  result_position?: number;
  result_time?: number;
  result_score?: number;
  result_details?: Record<string, any>;
  disqualification_reason?: string;
  feedback?: string;
  rating?: number;
  created_at: string;
  updated_at: string;
}

export interface EventRegistrationsInsert {
  id?: string;
  event_id: string;
  user_id: string;
  team_id?: string;
  registration_type?: string;
  status?: Database['public']['Enums']['registration_status'];
  payment_status?: Database['public']['Enums']['payment_status'];
  payment_amount?: number;
  payment_id?: string;
  payment_gateway?: string;
  additional_info?: Record<string, any>;
  emergency_contact?: Record<string, any>;
  medical_info?: Record<string, any>;
  dietary_requirements?: string;
  t_shirt_size?: string;
  checked_in_at?: string;
  result_position?: number;
  result_time?: number;
  result_score?: number;
  result_details?: Record<string, any>;
  disqualification_reason?: string;
  feedback?: string;
  rating?: number;
}

export interface EventRegistrationsUpdate {
  event_id?: string;
  user_id?: string;
  team_id?: string;
  registration_type?: string;
  status?: Database['public']['Enums']['registration_status'];
  payment_status?: Database['public']['Enums']['payment_status'];
  payment_amount?: number;
  payment_id?: string;
  payment_gateway?: string;
  additional_info?: Record<string, any>;
  emergency_contact?: Record<string, any>;
  medical_info?: Record<string, any>;
  dietary_requirements?: string;
  t_shirt_size?: string;
  checked_in_at?: string;
  result_position?: number;
  result_time?: number;
  result_score?: number;
  result_details?: Record<string, any>;
  disqualification_reason?: string;
  feedback?: string;
  rating?: number;
}

export interface EventAnalytics {
  event_id: string;
  title?: string;
  status?: Database['public']['Enums']['event_status'];
  current_participants?: number;
  max_participants?: number;
  fill_percentage?: number;
  actual_registrations?: number;
  participants?: number;
  paid_registrations?: number;
  avg_rating?: number;
  total_revenue?: number;
}

export interface EventAnalyticsInsert {
  event_id: string;
  title?: string;
  status?: Database['public']['Enums']['event_status'];
  current_participants?: number;
  max_participants?: number;
  fill_percentage?: number;
  actual_registrations?: number;
  participants?: number;
  paid_registrations?: number;
  avg_rating?: number;
  total_revenue?: number;
}

export interface EventAnalyticsUpdate {
  event_id?: string;
  title?: string;
  status?: Database['public']['Enums']['event_status'];
  current_participants?: number;
  max_participants?: number;
  fill_percentage?: number;
  actual_registrations?: number;
  participants?: number;
  paid_registrations?: number;
  avg_rating?: number;
  total_revenue?: number;
}

// Additional types for teams
export interface TeamEvents {
  id: string;
  team_id: string;
  event_id: string;
  registration_status?: Database['public']['Enums']['registration_status'];
  team_registration_id?: string;
  registered_members?: string[];
  team_captain_for_event?: string;
  strategy_notes?: string;
  preparation_plan?: Record<string, any>;
  expected_results?: Record<string, any>;
  actual_results?: Record<string, any>;
  team_ranking?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamEventsInsert {
  id?: string;
  team_id: string;
  event_id: string;
  registration_status?: Database['public']['Enums']['registration_status'];
  team_registration_id?: string;
  registered_members?: string[];
  team_captain_for_event?: string;
  strategy_notes?: string;
  preparation_plan?: Record<string, any>;
  expected_results?: Record<string, any>;
  actual_results?: Record<string, any>;
  team_ranking?: number;
  notes?: string;
}

export interface TeamEventsUpdate {
  team_id?: string;
  event_id?: string;
  registration_status?: Database['public']['Enums']['registration_status'];
  team_registration_id?: string;
  registered_members?: string[];
  team_captain_for_event?: string;
  strategy_notes?: string;
  preparation_plan?: Record<string, any>;
  expected_results?: Record<string, any>;
  actual_results?: Record<string, any>;
  team_ranking?: number;
  notes?: string;
}

export interface TeamInvites {
  id: string;
  team_id: string;
  inviter_id: string;
  invitee_id: string;
  type: string;
  message?: string;
  status: Database['public']['Enums']['connection_status'];
  role: Database['public']['Enums']['team_role'];
  position?: string;
  expires_at?: string;
  responded_at?: string;
  response_message?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamInvitesInsert {
  id?: string;
  team_id: string;
  inviter_id: string;
  invitee_id: string;
  type: string;
  message?: string;
  status?: Database['public']['Enums']['connection_status'];
  role?: Database['public']['Enums']['team_role'];
  position?: string;
  expires_at?: string;
  responded_at?: string;
  response_message?: string;
}

export interface TeamInvitesUpdate {
  team_id?: string;
  inviter_id?: string;
  invitee_id?: string;
  type?: string;
  message?: string;
  status?: Database['public']['Enums']['connection_status'];
  role?: Database['public']['Enums']['team_role'];
  position?: string;
  expires_at?: string;
  responded_at?: string;
  response_message?: string;
}

export interface TeamRoles {
  id: string;
  name: string;
  description?: string;
  permissions: Record<string, any>;
  can_invite_members: boolean;
  can_remove_members: boolean;
  can_edit_team: boolean;
  can_manage_events: boolean;
  can_view_member_data: boolean;
  is_leadership: boolean;
  hierarchy_level?: number;
  created_at: string;
}

export interface TeamRolesInsert {
  id?: string;
  name: string;
  description?: string;
  permissions: Record<string, any>;
  can_invite_members?: boolean;
  can_remove_members?: boolean;
  can_edit_team?: boolean;
  can_manage_events?: boolean;
  can_view_member_data?: boolean;
  is_leadership?: boolean;
  hierarchy_level?: number;
}

export interface TeamRolesUpdate {
  name?: string;
  description?: string;
  permissions?: Record<string, any>;
  can_invite_members?: boolean;
  can_remove_members?: boolean;
  can_edit_team?: boolean;
  can_manage_events?: boolean;
  can_view_member_data?: boolean;
  is_leadership?: boolean;
  hierarchy_level?: number;
}

export interface TeamPerformanceSummary {
  team_id: string;
  team_name?: string;
  status?: Database['public']['Enums']['team_status'];
  active_members?: number;
  events_participated?: number;
  total_registrations?: number;
  avg_event_position?: number;
  total_training_sessions?: number;
  avg_training_intensity?: number;
}

export interface TeamPerformanceSummaryInsert {
  team_id: string;
  team_name?: string;
  status?: Database['public']['Enums']['team_status'];
  active_members?: number;
  events_participated?: number;
  total_registrations?: number;
  avg_event_position?: number;
  total_training_sessions?: number;
  avg_training_intensity?: number;
}

export interface TeamPerformanceSummaryUpdate {
  team_id?: string;
  team_name?: string;
  status?: Database['public']['Enums']['team_status'];
  active_members?: number;
  events_participated?: number;
  total_registrations?: number;
  avg_event_position?: number;
  total_training_sessions?: number;
  avg_training_intensity?: number;
}

// Performance and Training types
export interface PerformanceMetrics {
  id: string;
  user_id: string;
  session_id?: string;
  personal_record_id?: string;
  metric_name: string;
  value: number;
  unit: string;
  measurement_time?: string;
  device_source?: string;
  device_model?: string;
  is_estimated: boolean;
  accuracy_level?: string;
  context?: Record<string, any>;
  created_at: string;
}

export interface PerformanceMetricsInsert {
  id?: string;
  user_id: string;
  session_id?: string;
  personal_record_id?: string;
  metric_name: string;
  value: number;
  unit: string;
  measurement_time?: string;
  device_source?: string;
  device_model?: string;
  is_estimated?: boolean;
  accuracy_level?: string;
  context?: Record<string, any>;
}

export interface PerformanceMetricsUpdate {
  user_id?: string;
  session_id?: string;
  personal_record_id?: string;
  metric_name?: string;
  value?: number;
  unit?: string;
  measurement_time?: string;
  device_source?: string;
  device_model?: string;
  is_estimated?: boolean;
  accuracy_level?: string;
  context?: Record<string, any>;
}

export interface PerformanceBenchmarks {
  id: string;
  sport_category_id?: string;
  metric_name: string;
  age_group_min?: number;
  age_group_max?: number;
  gender?: Database['public']['Enums']['gender_type'];
  skill_level?: Database['public']['Enums']['experience_level'];
  country?: string;
  region?: string;
  percentile_10?: number;
  percentile_25?: number;
  percentile_50?: number;
  percentile_75?: number;
  percentile_90?: number;
  percentile_95?: number;
  percentile_99?: number;
  sample_size?: number;
  data_source?: string;
  methodology?: string;
  last_updated?: string;
  created_at: string;
}

export interface PerformanceBenchmarksInsert {
  id?: string;
  sport_category_id?: string;
  metric_name: string;
  age_group_min?: number;
  age_group_max?: number;
  gender?: Database['public']['Enums']['gender_type'];
  skill_level?: Database['public']['Enums']['experience_level'];
  country?: string;
  region?: string;
  percentile_10?: number;
  percentile_25?: number;
  percentile_50?: number;
  percentile_75?: number;
  percentile_90?: number;
  percentile_95?: number;
  percentile_99?: number;
  sample_size?: number;
  data_source?: string;
  methodology?: string;
  last_updated?: string;
}

export interface PerformanceBenchmarksUpdate {
  sport_category_id?: string;
  metric_name?: string;
  age_group_min?: number;
  age_group_max?: number;
  gender?: Database['public']['Enums']['gender_type'];
  skill_level?: Database['public']['Enums']['experience_level'];
  country?: string;
  region?: string;
  percentile_10?: number;
  percentile_25?: number;
  percentile_50?: number;
  percentile_75?: number;
  percentile_90?: number;
  percentile_95?: number;
  percentile_99?: number;
  sample_size?: number;
  data_source?: string;
  methodology?: string;
  last_updated?: string;
}

export interface TrainingSessions {
  id: string;
  user_id: string;
  sport_category_id?: string;
  session_type: string;
  title: string;
  description?: string;
  date: string;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  intensity_level?: number;
  location?: string;
  indoor_outdoor?: string;
  weather_conditions?: string;
  equipment_used?: string[];
  coach_id?: string;
  team_id?: string;
  notes?: string;
  feeling_before?: number;
  feeling_after?: number;
  rpe_score?: number;
  calories_burned?: number;
  heart_rate_avg?: number;
  heart_rate_max?: number;
  is_public: boolean;
  session_photos?: string[];
  session_videos?: string[];
  created_at: string;
  updated_at: string;
}

export interface TrainingSessionsInsert {
  id?: string;
  user_id: string;
  sport_category_id?: string;
  session_type: string;
  title: string;
  description?: string;
  date: string;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  intensity_level?: number;
  location?: string;
  indoor_outdoor?: string;
  weather_conditions?: string;
  equipment_used?: string[];
  coach_id?: string;
  team_id?: string;
  notes?: string;
  feeling_before?: number;
  feeling_after?: number;
  rpe_score?: number;
  calories_burned?: number;
  heart_rate_avg?: number;
  heart_rate_max?: number;
  is_public?: boolean;
  session_photos?: string[];
  session_videos?: string[];
}

export interface TrainingSessionsUpdate {
  user_id?: string;
  sport_category_id?: string;
  session_type?: string;
  title?: string;
  description?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  intensity_level?: number;
  location?: string;
  indoor_outdoor?: string;
  weather_conditions?: string;
  equipment_used?: string[];
  coach_id?: string;
  team_id?: string;
  notes?: string;
  feeling_before?: number;
  feeling_after?: number;
  rpe_score?: number;
  calories_burned?: number;
  heart_rate_avg?: number;
  heart_rate_max?: number;
  is_public?: boolean;
  session_photos?: string[];
  session_videos?: string[];
}

export interface TrainingExercises {
  id: string;
  session_id: string;
  exercise_name: string;
  exercise_type?: string;
  muscle_groups?: string[];
  sets?: number;
  reps?: string[];
  weight?: string[];
  distance?: number;
  time_duration?: number;
  rest_time?: number;
  tempo?: string;
  notes?: string;
  form_rating?: number;
  difficulty_rating?: number;
  order_in_session?: number;
  video_reference?: string;
  created_at: string;
}

export interface TrainingExercisesInsert {
  id?: string;
  session_id: string;
  exercise_name: string;
  exercise_type?: string;
  muscle_groups?: string[];
  sets?: number;
  reps?: string[];
  weight?: string[];
  distance?: number;
  time_duration?: number;
  rest_time?: number;
  tempo?: string;
  notes?: string;
  form_rating?: number;
  difficulty_rating?: number;
  order_in_session?: number;
  video_reference?: string;
}

export interface TrainingExercisesUpdate {
  session_id?: string;
  exercise_name?: string;
  exercise_type?: string;
  muscle_groups?: string[];
  sets?: number;
  reps?: string[];
  weight?: string[];
  distance?: number;
  time_duration?: number;
  rest_time?: number;
  tempo?: string;
  notes?: string;
  form_rating?: number;
  difficulty_rating?: number;
  order_in_session?: number;
  video_reference?: string;
}

// Achievements and Social types
export interface Achievements {
  id: string;
  name: string;
  description: string;
  category: string;
  sport_category_id?: string;
  criteria: Record<string, any>;
  badge_icon?: string;
  badge_color?: string;
  points?: number;
  rarity: Database['public']['Enums']['achievement_rarity'];
  unlock_message?: string;
  share_message?: string;
  prerequisites?: string[];
  is_active: boolean;
  is_secret: boolean;
  unlock_count?: number;
  created_at: string;
  updated_at: string;
}

export interface AchievementsInsert {
  id?: string;
  name: string;
  description: string;
  category: string;
  sport_category_id?: string;
  criteria: Record<string, any>;
  badge_icon?: string;
  badge_color?: string;
  points?: number;
  rarity?: Database['public']['Enums']['achievement_rarity'];
  unlock_message?: string;
  share_message?: string;
  prerequisites?: string[];
  is_active?: boolean;
  is_secret?: boolean;
  unlock_count?: number;
}

export interface AchievementsUpdate {
  name?: string;
  description?: string;
  category?: string;
  sport_category_id?: string;
  criteria?: Record<string, any>;
  badge_icon?: string;
  badge_color?: string;
  points?: number;
  rarity?: Database['public']['Enums']['achievement_rarity'];
  unlock_message?: string;
  share_message?: string;
  prerequisites?: string[];
  is_active?: boolean;
  is_secret?: boolean;
  unlock_count?: number;
}

export interface Notifications {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  read_at?: string;
  is_read: boolean;
  priority: Database['public']['Enums']['notification_priority'];
  action_url?: string;
  action_type?: string;
  expires_at?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationsInsert {
  id?: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  read_at?: string;
  is_read?: boolean;
  priority?: Database['public']['Enums']['notification_priority'];
  action_url?: string;
  action_type?: string;
  expires_at?: string;
  related_entity_type?: string;
  related_entity_id?: string;
}

export interface NotificationsUpdate {
  user_id?: string;
  type?: string;
  title?: string;
  message?: string;
  data?: Record<string, any>;
  read_at?: string;
  is_read?: boolean;
  priority?: Database['public']['Enums']['notification_priority'];
  action_url?: string;
  action_type?: string;
  expires_at?: string;
  related_entity_type?: string;
  related_entity_id?: string;
}

// Communication types
export interface Messages {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: Database['public']['Enums']['message_type'];
  file_urls?: string[];
  file_ids?: string[];
  reply_to_id?: string;
  is_edited: boolean;
  edited_at?: string;
  edit_history?: Record<string, any>;
  is_deleted: boolean;
  deleted_at?: string;
  deleted_by?: string;
  read_by?: Record<string, any>;
  reactions?: Record<string, any>;
  mention_user_ids?: string[];
  priority?: Database['public']['Enums']['notification_priority'];
  scheduled_for?: string;
  created_at: string;
  updated_at: string;
}

export interface MessagesInsert {
  id?: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type?: Database['public']['Enums']['message_type'];
  file_urls?: string[];
  file_ids?: string[];
  reply_to_id?: string;
  is_edited?: boolean;
  edited_at?: string;
  edit_history?: Record<string, any>;
  is_deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
  read_by?: Record<string, any>;
  reactions?: Record<string, any>;
  mention_user_ids?: string[];
  priority?: Database['public']['Enums']['notification_priority'];
  scheduled_for?: string;
}

export interface MessagesUpdate {
  conversation_id?: string;
  sender_id?: string;
  content?: string;
  message_type?: Database['public']['Enums']['message_type'];
  file_urls?: string[];
  file_ids?: string[];
  reply_to_id?: string;
  is_edited?: boolean;
  edited_at?: string;
  edit_history?: Record<string, any>;
  is_deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
  read_by?: Record<string, any>;
  reactions?: Record<string, any>;
  mention_user_ids?: string[];
  priority?: Database['public']['Enums']['notification_priority'];
  scheduled_for?: string;
}

export interface Conversations {
  id: string;
  type: Database['public']['Enums']['conversation_type'];
  title?: string;
  description?: string;
  team_id?: string;
  event_id?: string;
  created_by: string;
  is_active: boolean;
  is_archived: boolean;
  last_message_at?: string;
  message_count: number;
  participant_count: number;
  settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ConversationsInsert {
  id?: string;
  type: Database['public']['Enums']['conversation_type'];
  title?: string;
  description?: string;
  team_id?: string;
  event_id?: string;
  created_by: string;
  is_active?: boolean;
  is_archived?: boolean;
  last_message_at?: string;
  message_count?: number;
  participant_count?: number;
  settings?: Record<string, any>;
}

export interface ConversationsUpdate {
  type?: Database['public']['Enums']['conversation_type'];
  title?: string;
  description?: string;
  team_id?: string;
  event_id?: string;
  created_by?: string;
  is_active?: boolean;
  is_archived?: boolean;
  last_message_at?: string;
  message_count?: number;
  participant_count?: number;
  settings?: Record<string, any>;
}

export interface ConversationParticipants {
  id: string;
  conversation_id: string;
  user_id: string;
  role?: string;
  joined_at: string;
  last_read_at?: string;
  last_activity_at?: string;
  is_muted: boolean;
  notification_settings?: Record<string, any>;
  message_count: number;
}

export interface ConversationParticipantsInsert {
  id?: string;
  conversation_id: string;
  user_id: string;
  role?: string;
  joined_at?: string;
  last_read_at?: string;
  last_activity_at?: string;
  is_muted?: boolean;
  notification_settings?: Record<string, any>;
  message_count?: number;
}

export interface ConversationParticipantsUpdate {
  conversation_id?: string;
  user_id?: string;
  role?: string;
  joined_at?: string;
  last_read_at?: string;
  last_activity_at?: string;
  is_muted?: boolean;
  notification_settings?: Record<string, any>;
  message_count?: number;
}

// User with profile completion info
export interface UserProfile extends User {
  sports: UserSport[];
  emergency_contacts: EmergencyContact[];
  coach_profile?: CoachProfile;
  personal_records_count?: number;
  teams_count?: number;
  preferences?: UserPreferences;
  goals?: UserGoals[];
  achievements?: (UserAchievements & { achievement: Achievements })[];
  connections?: UserConnections[];
  dashboard_stats?: UserDashboardStats;
}
// Generated TypeScript types from Supabase schema

export interface Achievements {
  id: string;
  name: string;
  description: string;
  category: string;
  sport_category_id: string | null;
  criteria: Record<string, any>;
  badge_icon: string | null;
  badge_color: string | null;
  points: number | null;
  rarity: string | null;
  unlock_message: string | null;
  share_message: string | null;
  prerequisites: string[] | null;
  is_active: boolean | null;
  is_secret: boolean | null;
  unlock_count: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CoachProfiles {
  id: string;
  user_id: string | null;
  experience_years: number | null;
  specialization: string[] | null;
  certifications: string[] | null;
  coaching_location: string | null;
  available_slots: Record<string, any> | null;
  hourly_rate: number | null;
  bio: string | null;
  languages: string[] | null;
  coaching_philosophy: string | null;
  success_stories: string[] | null;
  availability_status: string | null;
  rating: number | null;
  total_reviews: number | null;
  verification_status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ConversationParticipants {
  id: string;
  conversation_id: string | null;
  user_id: string | null;
  role: string | null;
  joined_at: string | null;
  last_read_at: string | null;
  last_activity_at: string | null;
  is_muted: boolean | null;
  notification_settings: Record<string, any> | null;
  message_count: number | null;
}

export interface Conversations {
  id: string;
  type: string;
  title: string | null;
  description: string | null;
  team_id: string | null;
  event_id: string | null;
  created_by: string | null;
  is_active: boolean | null;
  is_archived: boolean | null;
  last_message_at: string | null;
  message_count: number | null;
  participant_count: number | null;
  settings: Record<string, any> | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface EmergencyContacts {
  id: string;
  user_id: string | null;
  name: string;
  relationship: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  is_primary: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface EventAnalytics {
  event_id: string | null;
  title: string | null;
  status: string | null;
  current_participants: number | null;
  max_participants: number | null;
  fill_percentage: number | null;
  actual_registrations: any | null;
  participants: any | null;
  paid_registrations: any | null;
  avg_rating: number | null;
  total_revenue: any | null;
}

export interface EventRegistrations {
  id: string;
  event_id: string | null;
  user_id: string | null;
  team_id: string | null;
  registration_type: string | null;
  status: string | null;
  payment_status: string | null;
  payment_amount: number | null;
  payment_id: string | null;
  payment_gateway: string | null;
  additional_info: Record<string, any> | null;
  emergency_contact: Record<string, any> | null;
  medical_info: Record<string, any> | null;
  dietary_requirements: string | null;
  t_shirt_size: string | null;
  checked_in_at: string | null;
  result_position: number | null;
  result_time: number | null;
  result_score: number | null;
  result_details: Record<string, any> | null;
  disqualification_reason: string | null;
  feedback: string | null;
  rating: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Events {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  full_description: string | null;
  sport_category_id: string | null;
  event_type: string | null;
  level: string;
  event_date: string;
  event_time_start: string | null;
  event_time_end: string | null;
  registration_start_date: string;
  registration_end_date: string;
  submission_deadline: string | null;
  max_participants: number | null;
  current_participants: number | null;
  min_age: number | null;
  max_age: number | null;
  gender_restriction: string | null;
  registration_fee: number | null;
  processing_fee: number | null;
  prize_pool: number | null;
  prize_distribution: Record<string, any> | null;
  eligibility_criteria: string[] | null;
  rules_and_guidelines: string[] | null;
  required_documents: string[] | null;
  equipment_requirements: string[] | null;
  organizer: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  location_type: string | null;
  venue_details: string | null;
  status: string | null;
  is_featured: boolean | null;
  is_public: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
}

export interface Files {
  id: string;
  user_id: string | null;
  filename: string;
  original_name: string | null;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  mime_type: string | null;
  bucket_name: string | null;
  upload_context: string | null;
  description: string | null;
  is_public: boolean | null;
  is_verified: boolean | null;
  metadata: Record<string, any> | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Messages {
  id: string;
  conversation_id: string | null;
  sender_id: string | null;
  content: string;
  message_type: string | null;
  file_urls: string[] | null;
  file_ids: string[] | null;
  reply_to_id: string | null;
  is_edited: boolean | null;
  edited_at: string | null;
  edit_history: Record<string, any> | null;
  is_deleted: boolean | null;
  deleted_at: string | null;
  deleted_by: string | null;
  read_by: Record<string, any> | null;
  reactions: Record<string, any> | null;
  mention_user_ids: string[] | null;
  priority: string | null;
  scheduled_for: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Notifications {
  id: string;
  user_id: string | null;
  type: string;
  title: string;
  message: string;
  data: Record<string, any> | null;
  read_at: string | null;
  is_read: boolean | null;
  priority: string | null;
  action_url: string | null;
  action_type: string | null;
  expires_at: string | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PerformanceBenchmarks {
  id: string;
  sport_category_id: string | null;
  metric_name: string;
  age_group_min: number | null;
  age_group_max: number | null;
  gender: string | null;
  skill_level: string | null;
  country: string | null;
  region: string | null;
  percentile_10: number | null;
  percentile_25: number | null;
  percentile_50: number | null;
  percentile_75: number | null;
  percentile_90: number | null;
  percentile_95: number | null;
  percentile_99: number | null;
  sample_size: number | null;
  data_source: string | null;
  methodology: string | null;
  last_updated: string | null;
  created_at: string | null;
}

export interface PerformanceMetrics {
  id: string;
  user_id: string | null;
  session_id: string | null;
  personal_record_id: string | null;
  metric_name: string;
  value: number;
  unit: string;
  measurement_time: string | null;
  device_source: string | null;
  device_model: string | null;
  is_estimated: boolean | null;
  accuracy_level: string | null;
  context: Record<string, any> | null;
  created_at: string | null;
}

export interface PersonalRecords {
  id: string;
  user_id: string | null;
  sport_category_id: string | null;
  category: string;
  value: number;
  unit: string;
  description: string | null;
  achievement_date: string | null;
  location: string | null;
  event_context: string | null;
  weather_conditions: string | null;
  equipment_used: string | null;
  verification_method: string | null;
  verification_status: string | null;
  verifier_notes: string | null;
  badge_level: string | null;
  badge_criteria_met: Record<string, any> | null;
  primary_video_id: string | null;
  secondary_videos: string[] | null;
  is_public: boolean | null;
  manual_review_required: boolean | null;
  improvement_percentage: number | null;
  previous_best: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface SportsCategories {
  id: string;
  sport_name: string;
  category: string;
  description: string | null;
  measurement_unit: string | null;
  measurement_type: string | null;
  is_active: boolean | null;
  created_at: string | null;
  min_value: number | null;
  max_value: number | null;
}

export interface TeamEvents {
  id: string;
  team_id: string | null;
  event_id: string | null;
  registration_status: string | null;
  team_registration_id: string | null;
  registered_members: string[] | null;
  team_captain_for_event: string | null;
  strategy_notes: string | null;
  preparation_plan: Record<string, any> | null;
  expected_results: Record<string, any> | null;
  actual_results: Record<string, any> | null;
  team_ranking: number | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface TeamInvites {
  id: string;
  team_id: string | null;
  inviter_id: string | null;
  invitee_id: string | null;
  type: string;
  message: string | null;
  status: string | null;
  role: string | null;
  position: string | null;
  expires_at: string | null;
  responded_at: string | null;
  response_message: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface TeamMembers {
  id: string;
  team_id: string | null;
  user_id: string | null;
  role: string | null;
  skills: string[] | null;
  personal_best: string | null;
  position: string | null;
  jersey_number: number | null;
  status: string | null;
  joined_at: string | null;
  role_id: string | null;
  performance_metrics: Record<string, any> | null;
  attendance_rate: number | null;
  last_active: string | null;
}

export interface TeamPerformanceSummary {
  team_id: string | null;
  team_name: string | null;
  status: string | null;
  active_members: any | null;
  events_participated: any | null;
  total_registrations: any | null;
  avg_event_position: number | null;
  total_training_sessions: any | null;
  avg_training_intensity: number | null;
}

export interface TeamRoles {
  id: string;
  name: string;
  description: string | null;
  permissions: Record<string, any>;
  can_invite_members: boolean | null;
  can_remove_members: boolean | null;
  can_edit_team: boolean | null;
  can_manage_events: boolean | null;
  can_view_member_data: boolean | null;
  is_leadership: boolean | null;
  hierarchy_level: number | null;
  created_at: string | null;
}

export interface Teams {
  id: string;
  uuid: string;
  name: string;
  description: string | null;
  sport_category_id: string | null;
  event_id: string | null;
  max_members: number;
  current_members: number | null;
  is_public: boolean | null;
  join_code: string;
  required_skills: string[] | null;
  requirements: string[] | null;
  experience_level: string | null;
  location_city: string | null;
  location_state: string | null;
  practice_schedule: Record<string, any> | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  created_by: string;
}

export interface TrainingExercises {
  id: string;
  session_id: string | null;
  exercise_name: string;
  exercise_type: string | null;
  muscle_groups: string[] | null;
  sets: number | null;
  reps: string[] | null;
  weight: string[] | null;
  distance: number | null;
  time_duration: number | null;
  rest_time: number | null;
  tempo: string | null;
  notes: string | null;
  form_rating: number | null;
  difficulty_rating: number | null;
  order_in_session: number | null;
  video_reference: string | null;
  created_at: string | null;
}

export interface TrainingSessions {
  id: string;
  user_id: string | null;
  sport_category_id: string | null;
  session_type: string;
  title: string;
  description: string | null;
  date: string;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  intensity_level: number | null;
  location: string | null;
  indoor_outdoor: string | null;
  weather_conditions: string | null;
  equipment_used: string[] | null;
  coach_id: string | null;
  team_id: string | null;
  notes: string | null;
  feeling_before: number | null;
  feeling_after: number | null;
  rpe_score: number | null;
  calories_burned: number | null;
  heart_rate_avg: number | null;
  heart_rate_max: number | null;
  is_public: boolean | null;
  session_photos: string[] | null;
  session_videos: string[] | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserAchievements {
  id: string;
  user_id: string | null;
  achievement_id: string | null;
  unlocked_at: string | null;
  progress_data: Record<string, any> | null;
  unlock_source: string | null;
  is_showcased: boolean | null;
  notification_sent: boolean | null;
  shared_socially: boolean | null;
  created_at: string | null;
}

export interface UserConnections {
  id: string;
  user_id: string | null;
  connected_user_id: string | null;
  connection_type: string | null;
  status: string | null;
  initiated_by: string | null;
  message: string | null;
  mutual_friends: number | null;
  interaction_count: number | null;
  last_interaction: string | null;
  connection_strength: number | null;
  connected_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserDashboardStats {
  user_id: string | null;
  display_name: string | null;
  account_type: string | null;
  training_sessions_30d: any | null;
  event_registrations: any | null;
  teams_count: any | null;
  personal_records_count: any | null;
  achievements_count: any | null;
  avg_training_intensity: number | null;
  connections_count: any | null;
  unread_notifications: any | null;
}

export interface UserGoals {
  id: string;
  user_id: string | null;
  goal_type: string;
  sport_category_id: string | null;
  title: string;
  description: string | null;
  target_value: number | null;
  target_unit: string | null;
  current_value: number | null;
  target_date: string | null;
  status: string | null;
  progress_percentage: number | null;
  priority: string | null;
  difficulty: string | null;
  is_public: boolean | null;
  reminder_frequency: string | null;
  milestone_rewards: Record<string, any> | null;
  completed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserPreferences {
  id: string;
  user_id: string | null;
  notifications_enabled: boolean | null;
  email_notifications: boolean | null;
  push_notifications: boolean | null;
  sms_notifications: boolean | null;
  notification_frequency: string | null;
  notification_types: Record<string, any> | null;
  profile_visibility: string | null;
  show_performance_data: boolean | null;
  show_location: boolean | null;
  show_contact_info: boolean | null;
  show_training_data: boolean | null;
  allow_team_invites: boolean | null;
  allow_coach_contact: boolean | null;
  performance_tracking_enabled: boolean | null;
  auto_sync_devices: boolean | null;
  metric_units: string | null;
  auto_share_achievements: boolean | null;
  performance_goals_public: boolean | null;
  theme: string | null;
  language: string | null;
  timezone: string | null;
  date_format: string | null;
  time_format: string | null;
  currency: string | null;
  preferred_contact_method: string | null;
  marketing_emails: boolean | null;
  coaching_tips: boolean | null;
  performance_reports: boolean | null;
  default_session_privacy: string | null;
  reminder_notifications: boolean | null;
  workout_rest_reminders: boolean | null;
  form_check_reminders: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserSports {
  id: string;
  user_id: string | null;
  sport_category_id: string | null;
  sport_name: string;
  experience_level: string | null;
  years_experience: number | null;
  is_primary: boolean | null;
  achievements: string[] | null;
  preferred_position: string | null;
  current_training_frequency: number | null;
  goals: Record<string, any> | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Users {
  id: string;
  clerk_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  profile_completed: boolean | null;
  profile_completion_percentage: number | null;
  is_verified: boolean | null;
  is_active: boolean | null;
  account_type: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string | null;
  updated_at: string | null;
  last_active_at: string | null;
}


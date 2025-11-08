# Database Schema Reference

**30 Tables** | **528 Total Columns**

## achievements (18)
- id: uuid
- name: text
- description: text
- category: text
- sport_category_id?: uuid
- criteria: jsonb
- badge_icon?: text
- badge_color?: text
- points?: integer
- rarity?: text
- unlock_message?: text
- share_message?: text
- prerequisites?: ARRAY
- is_active?: boolean
- is_secret?: boolean
- unlock_count?: integer
- created_at?: timestamp with time zone
- updated_at?: timestamp with time zone

## coach_profiles (18)
- id: uuid
- user_id?: uuid
- experience_years?: integer
- specialization?: ARRAY
- certifications?: ARRAY
- coaching_location?: text
- available_slots?: jsonb
- hourly_rate?: numeric
- bio?: text
- languages?: ARRAY
- coaching_philosophy?: text
- success_stories?: ARRAY
- availability_status?: text
- rating?: numeric
- total_reviews?: integer
- verification_status?: text
- created_at?: timestamp with time zone
- updated_at?: timestamp with time zone

## conversation_participants (10)
- id: uuid
- conversation_id?: uuid
- user_id?: uuid
- role?: text
- joined_at?: timestamp with time zone
- last_read_at?: timestamp with time zone
- last_activity_at?: timestamp with time zone
- is_muted?: boolean
- notification_settings?: jsonb
- message_count?: integer

## conversations (15)
- id: uuid
- type: text
- title?: text
- description?: text
- team_id?: uuid
- event_id?: uuid
- created_by?: uuid
- is_active?: boolean
- is_archived?: boolean
- last_message_at?: timestamp with time zone
- message_count?: integer
- participant_count?: integer
- settings?: jsonb
- created_at?: timestamp with time zone
- updated_at?: timestamp with time zone

## emergency_contacts (10)
- id: uuid
- user_id?: uuid
- name: text
- relationship?: text
- phone: text
- email?: text
- address?: text
- is_primary?: boolean
- created_at?: timestamp with time zone
- updated_at?: timestamp with time zone

## event_analytics (11)
- event_id?: uuid
- title?: character varying
- status?: character varying
- current_participants?: integer
- max_participants?: integer
- fill_percentage?: numeric
- actual_registrations?: bigint
- participants?: bigint
- paid_registrations?: bigint
- avg_rating?: numeric
- total_revenue?: bigint

## event_registrations (25)
- id: uuid
- event_id?: uuid
- user_id?: uuid
- team_id?: uuid
- registration_type?: text
- status?: text
- payment_status?: text
- payment_amount?: integer
- payment_id?: text
- payment_gateway?: text
- additional_info?: jsonb
- emergency_contact?: jsonb
- medical_info?: jsonb
- dietary_requirements?: text
- t_shirt_size?: text
- checked_in_at?: timestamp with time zone
- result_position?: integer
- result_time?: numeric
- result_score?: numeric
- result_details?: jsonb
- disqualification_reason?: text
- feedback?: text
- rating?: integer
- created_at?: timestamp with time zone
- updated_at?: timestamp with time zone

## events (38)
- id: uuid
- title: character varying
- slug: character varying
- description?: text
- full_description?: text
- sport_category_id?: uuid
- event_type?: character varying
- level: character varying
- event_date: date
- event_time_start?: time without time zone
- event_time_end?: time without time zone
- registration_start_date: timestamp with time zone
- registration_end_date: timestamp with time zone
- submission_deadline?: timestamp with time zone
- max_participants?: integer
- current_participants?: integer
- min_age?: integer
- max_age?: integer
- gender_restriction?: character varying
- registration_fee?: integer
- processing_fee?: integer
- prize_pool?: integer
- prize_distribution?: jsonb
- eligibility_criteria?: ARRAY
- rules_and_guidelines?: ARRAY
- required_documents?: ARRAY
- equipment_requirements?: ARRAY
- organizer?: character varying
- contact_email?: character varying
- contact_phone?: character varying
- location_type?: character varying
- venue_details?: text
- status?: character varying
- is_featured?: boolean
- is_public?: boolean
- created_at?: timestamp with time zone
- updated_at?: timestamp with time zone
- created_by?: uuid

## files (16)
- id: uuid
- user_id?: uuid
- filename: text
- original_name?: text
- file_path: text
- file_size?: integer
- file_type?: text
- mime_type?: text
- bucket_name?: text
- upload_context?: text
- description?: text
- is_public?: boolean
- is_verified?: boolean
- metadata?: jsonb
- created_at?: timestamp with time zone
- updated_at?: timestamp with time zone

## messages (21)
- id: uuid
- conversation_id?: uuid
- sender_id?: uuid
- content: text
- message_type?: text
- file_urls?: ARRAY
- file_ids?: ARRAY
- reply_to_id?: uuid
- is_edited?: boolean
- edited_at?: timestamp with time zone
- edit_history?: jsonb
- is_deleted?: boolean
- deleted_at?: timestamp with time zone
- deleted_by?: uuid
- read_by?: jsonb
- reactions?: jsonb
- mention_user_ids?: ARRAY
- priority?: text
- scheduled_for?: timestamp with time zone
- created_at?: timestamp with time zone
- updated_at?: timestamp with time zone

## notifications (16)
- id: uuid
- user_id?: uuid
- type: text
- title: text
- message: text
- data?: jsonb
- read_at?: timestamp with time zone
- is_read?: boolean
- priority?: text
- action_url?: text
- action_type?: text
- expires_at?: timestamp with time zone
- related_entity_type?: text
- related_entity_id?: uuid
- created_at?: timestamp with time zone
- updated_at?: timestamp with time zone

## performance_benchmarks (21)
- id: uuid
- sport_category_id?: uuid
- metric_name: text
- age_group_min?: integer
- age_group_max?: integer
- gender?: text
- skill_level?: text
- country?: text
- region?: text
- percentile_10?: numeric
- percentile_25?: numeric
- percentile_50?: numeric
- percentile_75?: numeric
- percentile_90?: numeric
- percentile_95?: numeric
- percentile_99?: numeric
- sample_size?: integer
- data_source?: text
- methodology?: text
- last_updated?: timestamp with time zone
- created_at?: timestamp with time zone

## performance_metrics (14)
- id: uuid
- user_id?: uuid
- session_id?: uuid
- personal_record_id?: uuid
- metric_name: text
- value: numeric
- unit: text
- measurement_time?: timestamp with time zone
- device_source?: text
- device_model?: text
- is_estimated?: boolean
- accuracy_level?: text
- context?: jsonb
- created_at?: timestamp with time zone

## personal_records (25)
- id: uuid
- user_id?: uuid
- sport_category_id?: uuid
- category: text
- value: numeric
- unit: text
- description?: text
- achievement_date?: date
- location?: text
- event_context?: text
- weather_conditions?: text
- equipment_used?: text
- verification_method?: text
- verification_status?: text
- verifier_notes?: text
- badge_level?: text
- badge_criteria_met?: jsonb
- primary_video_id?: uuid
- secondary_videos?: ARRAY
- is_public?: boolean
- manual_review_required?: boolean
- improvement_percentage?: numeric
- previous_best?: numeric
- created_at?: timestamp with time zone
- updated_at?: timestamp with time zone

## sports_categories (10)
- id: uuid
- sport_name: character varying
- category: character varying
- description?: text
- measurement_unit?: character varying
- measurement_type?: character varying
- is_active?: boolean
- created_at?: timestamp with time zone
- min_value?: numeric
- max_value?: numeric

## team_events (15)
- id: uuid
- team_id?: uuid
- event_id?: uuid
- registration_status?: text
- team_registration_id?: uuid
- registered_members?: ARRAY
- team_captain_for_event?: uuid
- strategy_notes?: text
- preparation_plan?: jsonb
- expected_results?: jsonb
- actual_results?: jsonb
- team_ranking?: integer
- notes?: text
- created_at?: timestamp with time zone
- updated_at?: timestamp with time zone

## team_invites (14)
- id: uuid
- team_id?: uuid
- inviter_id?: uuid
- invitee_id?: uuid
- type: text
- message?: text
- status?: text
- role?: text
- position?: text
- expires_at?: timestamp with time zone
- responded_at?: timestamp with time zone
- response_message?: text
- created_at?: timestamp with time zone
- updated_at?: timestamp with time zone

## team_members (14)
- id: uuid
- team_id?: uuid
- user_id?: uuid
- role?: character varying
- skills?: ARRAY
- personal_best?: character varying
- position?: character varying
- jersey_number?: integer
- status?: character varying
- joined_at?: timestamp with time zone
- role_id?: uuid
- performance_metrics?: jsonb
- attendance_rate?: numeric
- last_active?: timestamp with time zone

## team_performance_summary (9)
- team_id?: uuid
- team_name?: character varying
- status?: character varying
- active_members?: bigint
- events_participated?: bigint
- total_registrations?: bigint
- avg_event_position?: numeric
- total_training_sessions?: bigint
- avg_training_intensity?: numeric

## team_roles (12)
- id: uuid
- name: text
- description?: text
- permissions: jsonb
- can_invite_members?: boolean
- can_remove_members?: boolean
- can_edit_team?: boolean
- can_manage_events?: boolean
- can_view_member_data?: boolean
- is_leadership?: boolean
- hierarchy_level?: integer
- created_at?: timestamp with time zone

## teams (20)
- id: uuid
- uuid: character varying
- name: character varying
- description?: text
- sport_category_id?: uuid
- event_id?: uuid
- max_members: integer
- current_members?: integer
- is_public?: boolean
- join_code: character varying
- required_skills?: ARRAY
- requirements?: ARRAY
- experience_level?: character varying
- location_city?: character varying
- location_state?: character varying
- practice_schedule?: jsonb
- status?: character varying
- created_at?: timestamp with time zone
- updated_at?: timestamp with time zone
- created_by: uuid

## training_exercises (18)
- id: uuid
- session_id?: uuid
- exercise_name: text
- exercise_type?: text
- muscle_groups?: ARRAY
- sets?: integer
- reps?: ARRAY
- weight?: ARRAY
- distance?: numeric
- time_duration?: numeric
- rest_time?: integer
- tempo?: text
- notes?: text
- form_rating?: integer
- difficulty_rating?: integer
- order_in_session?: integer
- video_reference?: uuid
- created_at?: timestamp with time zone

## training_sessions (29)
- id: uuid
- user_id?: uuid
- sport_category_id?: uuid
- session_type: text
- title: text
- description?: text
- date: date
- start_time?: time without time zone
- end_time?: time without time zone
- duration_minutes?: integer
- intensity_level?: integer
- location?: text
- indoor_outdoor?: text
- weather_conditions?: text
- equipment_used?: ARRAY
- coach_id?: uuid
- team_id?: uuid
- notes?: text
- feeling_before?: integer
- feeling_after?: integer
- rpe_score?: integer
- calories_burned?: integer
- heart_rate_avg?: integer
- heart_rate_max?: integer
- is_public?: boolean
- session_photos?: ARRAY
- session_videos?: ARRAY
- created_at?: timestamp with time zone
- updated_at?: timestamp with time zone

## user_achievements (10)
- id: uuid
- user_id?: uuid
- achievement_id?: uuid
- unlocked_at?: timestamp with time zone
- progress_data?: jsonb
- unlock_source?: text
- is_showcased?: boolean
- notification_sent?: boolean
- shared_socially?: boolean
- created_at?: timestamp with time zone

## user_connections (14)
- id: uuid
- user_id?: uuid
- connected_user_id?: uuid
- connection_type?: text
- status?: text
- initiated_by?: uuid
- message?: text
- mutual_friends?: integer
- interaction_count?: integer
- last_interaction?: timestamp with time zone
- connection_strength?: numeric
- connected_at?: timestamp with time zone
- created_at?: timestamp with time zone
- updated_at?: timestamp with time zone

## user_dashboard_stats (11)
- user_id?: uuid
- display_name?: character varying
- account_type?: character varying
- training_sessions_30d?: bigint
- event_registrations?: bigint
- teams_count?: bigint
- personal_records_count?: bigint
- achievements_count?: bigint
- avg_training_intensity?: numeric
- connections_count?: bigint
- unread_notifications?: bigint

## user_goals (20)
- id: uuid
- user_id?: uuid
- goal_type: text
- sport_category_id?: uuid
- title: text
- description?: text
- target_value?: numeric
- target_unit?: text
- current_value?: numeric
- target_date?: date
- status?: text
- progress_percentage?: integer
- priority?: text
- difficulty?: text
- is_public?: boolean
- reminder_frequency?: text
- milestone_rewards?: jsonb
- completed_at?: timestamp with time zone
- created_at?: timestamp with time zone
- updated_at?: timestamp with time zone

## user_preferences (36)
- id: uuid
- user_id?: uuid
- notifications_enabled?: boolean
- email_notifications?: boolean
- push_notifications?: boolean
- sms_notifications?: boolean
- notification_frequency?: text
- notification_types?: jsonb
- profile_visibility?: text
- show_performance_data?: boolean
- show_location?: boolean
- show_contact_info?: boolean
- show_training_data?: boolean
- allow_team_invites?: boolean
- allow_coach_contact?: boolean
- performance_tracking_enabled?: boolean
- auto_sync_devices?: boolean
- metric_units?: text
- auto_share_achievements?: boolean
- performance_goals_public?: boolean
- theme?: text
- language?: text
- timezone?: text
- date_format?: text
- time_format?: text
- currency?: text
- preferred_contact_method?: text
- marketing_emails?: boolean
- coaching_tips?: boolean
- performance_reports?: boolean
- default_session_privacy?: text
- reminder_notifications?: boolean
- workout_rest_reminders?: boolean
- form_check_reminders?: boolean
- created_at?: timestamp with time zone
- updated_at?: timestamp with time zone

## user_sports (13)
- id: uuid
- user_id?: uuid
- sport_category_id?: uuid
- sport_name: text
- experience_level?: text
- years_experience?: integer
- is_primary?: boolean
- achievements?: ARRAY
- preferred_position?: text
- current_training_frequency?: integer
- goals?: jsonb
- created_at?: timestamp with time zone
- updated_at?: timestamp with time zone

## users (25)
- id: uuid
- clerk_id: character varying
- email: character varying
- first_name?: character varying
- last_name?: character varying
- display_name?: character varying
- avatar_url?: text
- phone?: character varying
- date_of_birth?: date
- gender?: character varying
- profile_completed?: boolean
- profile_completion_percentage?: integer
- is_verified?: boolean
- is_active?: boolean
- account_type?: character varying
- country?: character varying
- state?: character varying
- city?: character varying
- address?: text
- pincode?: character varying
- latitude?: numeric
- longitude?: numeric
- created_at?: timestamp with time zone
- updated_at?: timestamp with time zone
- last_active_at?: timestamp with time zone


# Missing API Routes Analysis

## achievements 
**Columns**: 18
**Key fields**: id, name, description, category, sport_category_id
**Priority**: HIGH - Create full CRUD API

## coach_profiles 
**Columns**: 18
**Key fields**: id, user_id, experience_years, specialization, certifications
**Priority**: HIGH - Create full CRUD API

## conversation_participants 
**Columns**: 10
**Key fields**: id, conversation_id, user_id, role, joined_at
**Priority**: HIGH - Create full CRUD API

## conversations 
**Columns**: 15
**Key fields**: id, type, title, description, team_id
**Priority**: HIGH - Create full CRUD API

## emergency_contacts 
**Columns**: 10
**Key fields**: id, user_id, name, relationship, phone
**Priority**: HIGH - Create full CRUD API

## event_analytics 
**Columns**: 11
**Key fields**: event_id, title, status, current_participants, max_participants
**Priority**: HIGH - Create full CRUD API

## event_registrations 
**Columns**: 25
**Key fields**: id, event_id, user_id, team_id, registration_type

## events 
**Columns**: 38
**Key fields**: id, title, slug, description, full_description

## files 
**Columns**: 16
**Key fields**: id, user_id, filename, original_name, file_path

## messages 
**Columns**: 21
**Key fields**: id, conversation_id, sender_id, content, message_type
**Priority**: HIGH - Create full CRUD API

## notifications 
**Columns**: 16
**Key fields**: id, user_id, type, title, message
**Priority**: HIGH - Create full CRUD API

## performance_benchmarks 
**Columns**: 21
**Key fields**: id, sport_category_id, metric_name, age_group_min, age_group_max
**Priority**: HIGH - Create full CRUD API

## performance_metrics 
**Columns**: 14
**Key fields**: id, user_id, session_id, personal_record_id, metric_name
**Priority**: HIGH - Create full CRUD API

## personal_records 
**Columns**: 25
**Key fields**: id, user_id, sport_category_id, category, value

## sports_categories 
**Columns**: 10
**Key fields**: id, sport_name, category, description, measurement_unit

## team_events 
**Columns**: 15
**Key fields**: id, team_id, event_id, registration_status, team_registration_id
**Priority**: HIGH - Create full CRUD API

## team_invites 
**Columns**: 14
**Key fields**: id, team_id, inviter_id, invitee_id, type
**Priority**: HIGH - Create full CRUD API

## team_members 
**Columns**: 14
**Key fields**: id, team_id, user_id, role, skills
**Priority**: HIGH - Create full CRUD API

## team_performance_summary 
**Columns**: 9
**Key fields**: team_id, team_name, status, active_members, events_participated
**Priority**: HIGH - Create full CRUD API

## team_roles 
**Columns**: 12
**Key fields**: id, name, description, permissions, can_invite_members
**Priority**: HIGH - Create full CRUD API

## teams 
**Columns**: 20
**Key fields**: id, uuid, name, description, sport_category_id

## training_exercises 
**Columns**: 18
**Key fields**: id, session_id, exercise_name, exercise_type, muscle_groups
**Priority**: HIGH - Create full CRUD API

## training_sessions 
**Columns**: 29
**Key fields**: id, user_id, sport_category_id, session_type, title
**Priority**: HIGH - Create full CRUD API

## user_achievements 
**Columns**: 10
**Key fields**: id, user_id, achievement_id, unlocked_at, progress_data
**Priority**: HIGH - Create full CRUD API

## user_connections 
**Columns**: 14
**Key fields**: id, user_id, connected_user_id, connection_type, status
**Priority**: HIGH - Create full CRUD API

## user_dashboard_stats 
**Columns**: 11
**Key fields**: user_id, display_name, account_type, training_sessions_30d, event_registrations
**Priority**: HIGH - Create full CRUD API

## user_goals 
**Columns**: 20
**Key fields**: id, user_id, goal_type, sport_category_id, title
**Priority**: HIGH - Create full CRUD API

## user_preferences 
**Columns**: 36
**Key fields**: id, user_id, notifications_enabled, email_notifications, push_notifications
**Priority**: HIGH - Create full CRUD API

## user_sports 
**Columns**: 13
**Key fields**: id, user_id, sport_category_id, sport_name, experience_level
**Priority**: HIGH - Create full CRUD API

## users 
**Columns**: 25
**Key fields**: id, clerk_id, email, first_name, last_name


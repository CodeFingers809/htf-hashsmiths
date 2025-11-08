// Specific data hooks for SCOUTLETE entities
import { useState } from 'react';
import { useApi, usePaginatedApi, useMutation } from './use-api';
import {
  User,
  UserUpdate,
  Event,
  EventInsert,
  Team,
  TeamInsert,
  TeamWithMembers,
  PersonalRecord,
  PersonalRecordInsert,
  SportCategory,
} from '@/types/database';

// User hooks
export function useCurrentUser() {
  return useApi<User>('/api/users');
}

export function useUpdateUser() {
  return useMutation<User, UserUpdate>('/api/users', 'PUT');
}

// Sports categories hooks
export function useSportsCategories() {
  return useApi<{
    data: SportCategory[];
    grouped: Record<string, SportCategory[]>;
    count: number;
  }>('/api/sports-categories');
}

// Events hooks
export function useEvents(filters?: {
  level?: string;
  sport?: string;
  status?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}) {
  return usePaginatedApi<Event>('/api/events', {
    filters,
    page: filters?.page,
    limit: filters?.limit,
  });
}

export function useEvent(eventId: string) {
  return useApi<Event>(`/api/events/${eventId}`, {
    dependencies: [eventId],
  });
}

export function useCreateEvent() {
  return useMutation<Event, EventInsert>('/api/events');
}

export function useUpdateEvent(eventId: string) {
  return useMutation<Event, Partial<Event>>(`/api/events/${eventId}`, 'PUT');
}

export function useDeleteEvent(eventId: string) {
  return useMutation<{ message: string }, void>(`/api/events/${eventId}`, 'DELETE');
}

// Teams hooks
export function useTeams(filters?: {
  sport?: string;
  location?: string;
  experience_level?: string;
  exclude_user_teams?: boolean;
  page?: number;
  limit?: number;
}) {
  return usePaginatedApi<Team>('/api/teams', {
    filters,
    page: filters?.page,
    limit: filters?.limit,
  });
}

export function useTeam(teamId: string) {
  return useApi<TeamWithMembers>(`/api/teams/${teamId}`, {
    dependencies: [teamId],
  });
}

export function useCreateTeam() {
  return useMutation<Team, TeamInsert>('/api/teams');
}

export function useMyTeams() {
  return useApi<TeamWithMembers[]>('/api/teams/my-teams');
}

export function useUpdateTeam(teamId: string) {
  return useMutation<Team, Partial<Team>>(`/api/teams/${teamId}`, 'PUT');
}

export function useDeleteTeam(teamId: string) {
  return useMutation<{ message: string }, void>(`/api/teams/${teamId}`, 'DELETE');
}

// Team Invites hooks
export function useTeamInvites(type?: 'sent' | 'received' | 'team_requests', teamId?: string) {
  const params = new URLSearchParams();
  if (type) params.append('type', type);
  if (teamId) params.append('team_id', teamId);

  return useApi<any[]>(`/api/team-invites?${params.toString()}`, {
    dependencies: [type, teamId],
  });
}

export function useSendTeamJoinRequest() {
  return useMutation<any, { team_code?: string; team_id?: string; message?: string }>('/api/team-invites');
}

export function useRespondToTeamInvite() {
  return useMutation<any, { invite_id: string; status: 'accepted' | 'declined'; response_message?: string }>('/api/team-invites', 'PUT');
}

export function useJoinTeam(teamId: string) {
  return useMutation<{ message: string }, { join_code?: string }>(`/api/teams/${teamId}/join`);
}

export function useLeaveTeam(teamId: string) {
  return useMutation<{ message: string }, void>(`/api/teams/${teamId}/leave`, 'DELETE');
}

export function useRemoveTeamMember(teamId: string) {
  return useMutation<{ message: string }, { member_id: string }>(`/api/teams/${teamId}/members`, 'DELETE');
}

// Personal Records hooks
export function usePersonalRecords(userId?: string, verified?: boolean) {
  const params = new URLSearchParams();
  if (userId) params.set('user_id', userId);
  if (verified !== undefined) params.set('verified', verified.toString());

  const url = `/api/personal-records${params.toString() ? '?' + params.toString() : ''}`;

  return useApi<PersonalRecord[]>(url, {
    dependencies: [userId, verified],
  });
}

export function usePersonalRecord(recordId: string) {
  return useApi<PersonalRecord>(`/api/personal-records/${recordId}`, {
    dependencies: [recordId],
  });
}

export function useCreatePersonalRecord() {
  return useMutation<PersonalRecord, PersonalRecordInsert>('/api/personal-records');
}

export function useUpdatePersonalRecord(recordId: string) {
  return useMutation<PersonalRecord, Partial<PersonalRecord>>(`/api/personal-records/${recordId}`, 'PUT');
}

export function useDeletePersonalRecord() {
  // Custom mutation that adds id as query param
  const [state, setState] = useState<{
    loading: boolean;
    error: string | null;
    data: { success: boolean; message: string } | null;
  }>({
    loading: false,
    error: null,
    data: null,
  });

  const mutate = async (variables: { id: string }) => {
    setState({ loading: true, error: null, data: null });

    try {
      const response = await fetch(`/api/personal-records?id=${variables.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      setState({
        loading: false,
        error: null,
        data: result,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState({
        loading: false,
        error: errorMessage,
        data: null,
      });
      throw error;
    }
  };

  return {
    ...state,
    mutate,
  };
}

// File upload hooks
export function useUploadFile() {
  return useMutation<{
    file: {
      id: string;
      filename: string;
      public_url: string;
      storage_path: string;
    };
  }, FormData>('/api/files/upload');
}

// Dashboard data hooks
export function useDashboardData() {
  return useApi<{
    user: User;
    recentEvents: Event[];
    userTeams: Team[];
    personalRecords: PersonalRecord[];
    stats: {
      totalEvents: number;
      totalTeams: number;
      totalPRs: number;
      profileCompletion: number;
    };
  }>('/api/dashboard');
}

// User sports hooks
export function useUserSports() {
  return useApi<any[]>('/api/users/sports');
}

export function useAddUserSport() {
  return useMutation<any, {
    sport_name: string;
    category?: string;
    experience_level?: string;
    years_experience?: number;
    is_primary?: boolean;
  }>('/api/users/sports');
}

export function useUpdateUserSport(sportId: string) {
  return useMutation<any, Partial<any>>(`/api/users/sports/${sportId}`, 'PUT');
}

export function useDeleteUserSport(sportId: string) {
  return useMutation<{ message: string }, void>(`/api/users/sports/${sportId}`, 'DELETE');
}

// User Goals hooks
export function useUserGoals(filters?: {
  status?: string;
  goal_type?: string;
  sport_category_id?: string;
  priority?: string;
  public_only?: boolean;
}) {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.goal_type) params.set('goal_type', filters.goal_type);
  if (filters?.sport_category_id) params.set('sport_category_id', filters.sport_category_id);
  if (filters?.priority) params.set('priority', filters.priority);
  if (filters?.public_only) params.set('public_only', filters.public_only.toString());

  const url = `/api/user-goals${params.toString() ? '?' + params.toString() : ''}`;

  return useApi<any[]>(url, {
    dependencies: [filters?.status, filters?.goal_type, filters?.sport_category_id, filters?.priority, filters?.public_only],
  });
}

export function useCreateUserGoal() {
  return useMutation<any, {
    goal_type: string;
    sport_category_id?: string;
    title: string;
    description?: string;
    target_value?: number;
    target_unit?: string;
    target_date?: string;
    priority?: string;
    difficulty?: string;
    is_public?: boolean;
  }>('/api/user-goals');
}

export function useUpdateUserGoal() {
  return useMutation<any, {
    goal_id: string;
    current_value?: number;
    status?: string;
    progress_percentage?: number;
    [key: string]: any;
  }>('/api/user-goals', 'PUT');
}

export function useDeleteUserGoal() {
  return useMutation<{ message: string }, { goal_id: string }>('/api/user-goals', 'DELETE');
}

// Search hooks
export function useSearch(query: string, type?: 'events' | 'teams' | 'users') {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (type) params.set('type', type);

  const url = `/api/search${params.toString() ? '?' + params.toString() : ''}`;

  return useApi<{
    events: Event[];
    teams: Team[];
    users: User[];
  }>(url, {
    dependencies: [query, type],
    immediate: Boolean(query),
  });
}

// Notifications hooks
export function useNotifications() {
  return useApi<any[]>('/api/notifications');
}

export function useMarkNotificationRead(notificationId: string) {
  return useMutation<{ message: string }, void>(`/api/notifications/${notificationId}/read`, 'PUT');
}

export function useMarkAllNotificationsRead() {
  return useMutation<{ message: string }, void>('/api/notifications/mark-all-read', 'PUT');
}

// Coaches hooks
export function useCoaches(filters?: {
  sport?: string;
  location?: string;
  max_fee?: number;
  page?: number;
  limit?: number;
}) {
  return usePaginatedApi<any>('/api/coaches', {
    filters,
    page: filters?.page,
    limit: filters?.limit,
  });
}

// Athletes hooks
export function useAthletes(filters?: {
  sport?: string;
  location?: string;
  level?: string;
  age_min?: number;
  age_max?: number;
  page?: number;
  limit?: number;
}) {
  return usePaginatedApi<any>('/api/athletes', {
    filters,
    page: filters?.page,
    limit: filters?.limit,
  });
}

// Achievements hooks
export function useAchievements(filters?: {
  category?: string;
  rarity?: string;
  active_only?: boolean;
  public_only?: boolean;
}) {
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.rarity) params.set('rarity', filters.rarity);
  if (filters?.active_only !== undefined) params.set('active_only', filters.active_only.toString());
  if (filters?.public_only !== undefined) params.set('public_only', filters.public_only.toString());

  const url = `/api/achievements${params.toString() ? '?' + params.toString() : ''}`;

  return useApi<any[]>(url, {
    dependencies: [filters?.category, filters?.rarity, filters?.active_only, filters?.public_only],
  });
}

export function useUserAchievements(showcased_only?: boolean) {
  const params = new URLSearchParams();
  if (showcased_only !== undefined) params.set('showcased_only', showcased_only.toString());

  const url = `/api/user-achievements${params.toString() ? '?' + params.toString() : ''}`;

  return useApi<any[]>(url, {
    dependencies: [showcased_only],
  });
}

export function useUnlockAchievement() {
  return useMutation<any, {
    achievement_id: string;
    progress_data?: any;
    unlock_source?: string;
  }>('/api/user-achievements');
}

export function useUpdateAchievement() {
  return useMutation<any, {
    achievement_id: string;
    is_showcased?: boolean;
    shared_socially?: boolean;
  }>('/api/user-achievements', 'PUT');
}

// User Connections hooks
export function useUserConnections(filters?: {
  connection_type?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (filters?.connection_type) params.set('connection_type', filters.connection_type);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.page) params.set('page', filters.page.toString());
  if (filters?.limit) params.set('limit', filters.limit.toString());

  const url = `/api/user-connections${params.toString() ? '?' + params.toString() : ''}`;

  return usePaginatedApi<any>(url, {
    filters,
    page: filters?.page,
    limit: filters?.limit,
  });
}

export function useCreateConnection() {
  return useMutation<any, {
    connected_user_id: string;
    connection_type?: string;
    message?: string;
  }>('/api/connections');
}

export function useUpdateConnection() {
  return useMutation<any, {
    connection_id: string;
    status: 'accepted' | 'declined' | 'blocked';
  }>('/api/user-connections', 'PUT');
}

export function useDeleteConnection() {
  return useMutation<{ message: string }, { connection_id: string }>('/api/user-connections', 'DELETE');
}
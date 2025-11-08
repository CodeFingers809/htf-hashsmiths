// Custom hooks for API interactions
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface PaginatedApiState<T> extends ApiState<T[]> {
  pagination: {
    page: number;
    limit: number;
    count: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
}

interface UseApiOptions {
  immediate?: boolean;
  dependencies?: any[];
}

interface UsePaginatedApiOptions extends UseApiOptions {
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
}

/**
 * Generic API hook for data fetching
 */
export function useApi<T>(
  url: string,
  options: UseApiOptions = {}
): ApiState<T> & {
  refetch: () => Promise<void>;
  mutate: (newData: T) => void;
} {
  const { immediate = true, dependencies = [] } = options;
  const { getToken } = useAuth();
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const token = await getToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      setState({
        data: result.data || result,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }, [url, getToken]);

  const mutate = useCallback((newData: T) => {
    setState(prev => ({ ...prev, data: newData }));
  }, []);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate, ...dependencies]);

  return {
    ...state,
    refetch: fetchData,
    mutate,
  };
}

/**
 * Paginated API hook for lists with pagination
 */
export function usePaginatedApi<T>(
  baseUrl: string,
  options: UsePaginatedApiOptions = {}
): PaginatedApiState<T> & {
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  setPage: (page: number) => void;
  setFilters: (filters: Record<string, any>) => void;
} {
  const {
    immediate = true,
    dependencies = [],
    page: initialPage = 1,
    limit = 12,
    filters: initialFilters = {}
  } = options;

  const { getToken } = useAuth();
  const [page, setPageState] = useState(initialPage);
  const [filters, setFiltersState] = useState(initialFilters);
  const [state, setState] = useState<PaginatedApiState<T>>({
    data: [],
    loading: false,
    error: null,
    pagination: null,
  });

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== null && value !== undefined && value !== '')
      ),
    });
    return `${baseUrl}?${params.toString()}`;
  }, [baseUrl, page, limit, filters]);

  const fetchData = useCallback(async (append = false) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const token = await getToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(buildUrl(), { headers });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      setState(prev => ({
        data: append && prev.data ? [...prev.data, ...result.data] : result.data,
        loading: false,
        error: null,
        pagination: result.pagination,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  }, [buildUrl]);

  const loadMore = useCallback(async () => {
    if (state.pagination?.hasNext) {
      setPageState(prev => prev + 1);
      await fetchData(true);
    }
  }, [state.pagination?.hasNext, fetchData]);

  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
  }, []);

  const setFilters = useCallback((newFilters: Record<string, any>) => {
    setFiltersState(newFilters);
    setPageState(1); // Reset to first page when filters change
  }, []);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate, page, filters, ...dependencies]);

  return {
    ...state,
    refetch: () => fetchData(false),
    loadMore,
    setPage,
    setFilters,
  };
}

/**
 * Mutation hook for POST, PUT, DELETE operations
 */
export function useMutation<TData, TVariables = any>(
  url: string,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST'
) {
  const { getToken } = useAuth();
  const [state, setState] = useState({
    loading: false,
    error: null as string | null,
    data: null as TData | null,
  });

  const mutate = useCallback(async (variables?: TVariables): Promise<TData | null> => {
    setState({ loading: true, error: null, data: null });

    try {
      const token = await getToken();
      const isFormData = variables instanceof FormData;

      const headers: HeadersInit = isFormData ? {} : {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method,
        headers,
        body: variables ? (isFormData ? variables : JSON.stringify(variables)) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      setState({
        loading: false,
        error: null,
        data: result.data || result,
      });

      return result.data || result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState({
        loading: false,
        error: errorMessage,
        data: null,
      });
      throw error;
    }
  }, [url, method, getToken]);

  const reset = useCallback(() => {
    setState({ loading: false, error: null, data: null });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}
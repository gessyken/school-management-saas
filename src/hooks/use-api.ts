import { useState, useCallback } from 'react';
import api from '@/lib/api';

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseApiReturn<T, P = any> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  fetchData: (params?: P) => Promise<T | null>;
  postData: (data: any) => Promise<T | null>;
  putData: (id: string, data: any) => Promise<T | null>;
  deleteData: (id: string) => Promise<boolean>;
  resetState: () => void;
}

/**
 * Hook personnalisé pour gérer les appels API
 */
export function useApi<T, P = any>(endpoint: string): UseApiReturn<T, P> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const resetState = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
    });
  }, []);

  const fetchData = useCallback(
    async (params?: P): Promise<T | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await api.get<T>(endpoint, { params });
        setState({
          data: response.data,
          isLoading: false,
          error: null,
        });
        return response.data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
        setState({
          data: null,
          isLoading: false,
          error: errorMessage,
        });
        return null;
      }
    },
    [endpoint]
  );

  const postData = useCallback(
    async (data: any): Promise<T | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await api.post<T>(endpoint, data);
        setState({
          data: response.data,
          isLoading: false,
          error: null,
        });
        return response.data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
        setState({
          data: null,
          isLoading: false,
          error: errorMessage,
        });
        return null;
      }
    },
    [endpoint]
  );

  const putData = useCallback(
    async (id: string, data: any): Promise<T | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await api.put<T>(`${endpoint}/${id}`, data);
        setState({
          data: response.data,
          isLoading: false,
          error: null,
        });
        return response.data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
        setState({
          data: null,
          isLoading: false,
          error: errorMessage,
        });
        return null;
      }
    },
    [endpoint]
  );

  const deleteData = useCallback(
    async (id: string): Promise<boolean> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        await api.delete(`${endpoint}/${id}`);
        setState({
          data: null,
          isLoading: false,
          error: null,
        });
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
        setState({
          data: null,
          isLoading: false,
          error: errorMessage,
        });
        return false;
      }
    },
    [endpoint]
  );

  return {
    ...state,
    fetchData,
    postData,
    putData,
    deleteData,
    resetState,
  };
}
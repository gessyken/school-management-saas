import { useState, useCallback } from 'react';

interface PaginationState {
  page: number;
  perPage: number;
  total: number;
  data: any[];
}

interface UsePaginationReturn<T> {
  page: number;
  perPage: number;
  total: number;
  data: T[];
  totalPages: number;
  updatePaginatedData: (data: T[], total: number) => void;
  goToPage: (page: number) => void;
  changeItemsPerPage: (perPage: number) => void;
  getPaginationParams: () => { page: number; per_page: number };
}

/**
 * Hook personnalisé pour gérer la pagination
 */
export function usePagination<T>(
  initialPage = 1,
  initialPerPage = 10
): UsePaginationReturn<T> {
  const [state, setState] = useState<PaginationState>({
    page: initialPage,
    perPage: initialPerPage,
    total: 0,
    data: [],
  });

  const totalPages = Math.ceil(state.total / state.perPage) || 1;

  const updatePaginatedData = useCallback((data: T[], total: number) => {
    setState((prev) => ({
      ...prev,
      data,
      total,
    }));
  }, []);

  const goToPage = useCallback((page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    setState((prev) => ({
      ...prev,
      page,
    }));
  }, [totalPages]);

  const changeItemsPerPage = useCallback((perPage: number) => {
    setState((prev) => ({
      ...prev,
      perPage,
      page: 1, // Réinitialiser à la première page lors du changement d'éléments par page
    }));
  }, []);

  const getPaginationParams = useCallback(() => {
    return {
      page: state.page,
      per_page: state.perPage,
    };
  }, [state.page, state.perPage]);

  return {
    ...state,
    totalPages,
    updatePaginatedData,
    goToPage,
    changeItemsPerPage,
    getPaginationParams,
  };
}
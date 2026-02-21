import { useState, useCallback } from 'react';

export interface Advertisement {
  id: number;
  title: string;
  short_description: string;
  long_description?: string;
  teacher_id: number;
  instrument_id: number;
  location_id: number;
  status: string;
  featured: boolean;
  views: number;
  contacts: number;
  created_at: string;
  teacher: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  instrument: {
    id: number;
    name: string;
    name_hu: string;
  };
  location: {
    id: number;
    city: string;
    district?: string;
  };
}

export interface SearchFilters {
  instrument?: string;
  city?: string;
  keyword?: string;
  online_only?: boolean;
  featured_only?: boolean;
}

interface SearchResult {
  advertisements: Advertisement[];
  total: number;
  page: number;
  per_page: number;
}

const API_URL = 'http://localhost:8000/api';

export const useSearch = () => {
  const [results, setResults] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const search = useCallback(async (filters: SearchFilters, pageNum: number = 1) => {
    setLoading(true);
    
    try {
      const params = new URLSearchParams();
      
      if (filters.instrument) params.append('instrument', filters.instrument);
      if (filters.city) params.append('city', filters.city);
      if (filters.keyword) params.append('keyword', filters.keyword);
      if (filters.online_only) params.append('online_only', 'true');
      if (filters.featured_only) params.append('featured_only', 'true');
      params.append('page', pageNum.toString());
      params.append('per_page', '12');

      const response = await fetch(`${API_URL}/advertisements?${params}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data: SearchResult = await response.json();
      
      if (pageNum === 1) {
        setResults(data.advertisements);
      } else {
        setResults(prev => [...prev, ...data.advertisements]);
      }
      
      setTotal(data.total);
      setPage(pageNum);
      setHasMore(data.advertisements.length === 12);
      
      return data;
    } catch (error) {
      console.error('Search error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback((filters: SearchFilters) => {
    if (!loading && hasMore) {
      search(filters, page + 1);
    }
  }, [loading, hasMore, page, search]);

  return {
    results,
    loading,
    total,
    page,
    hasMore,
    search,
    loadMore,
  };
};

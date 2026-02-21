import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

export interface AdminUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  is_active: boolean;
  created_at: string;
  advertisement_count: number;
}

export interface AdminAdvertisement {
  id: number;
  title: string;
  short_description: string;
  status: string;
  featured: boolean;
  views: number;
  contacts: number;
  created_at: string;
  expires_at?: string;
  teacher: {
    id: number;
    name: string;
    email: string;
  };
  instrument: string;
  location: string;
}

export interface DashboardStats {
  users: {
    total: number;
    teachers: number;
    students: number;
  };
  advertisements: {
    total: number;
    pending: number;
    active: number;
    expired: number;
    expiring_soon: number;
  };
  revenue: number;
}

const API_URL = 'http://localhost:8000/api';

export const useAdmin = () => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'admin';

  const fetchStats = useCallback(async (): Promise<DashboardStats | null> => {
    if (!token || !isAdmin) return null;
    
    try {
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to fetch stats');
      return await response.json();
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [token, isAdmin]);

  const fetchUsers = useCallback(async (): Promise<AdminUser[]> => {
    if (!token || !isAdmin) return [];
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to fetch users');
      return await response.json();
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [token, isAdmin]);

  const fetchUserEmails = useCallback(async (): Promise<{email: string; name: string; role: string}[]> => {
    if (!token || !isAdmin) return [];
    
    try {
      const response = await fetch(`${API_URL}/admin/users/emails`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to fetch emails');
      return await response.json();
    } catch (err: any) {
      setError(err.message);
      return [];
    }
  }, [token, isAdmin]);

  const fetchAdvertisements = useCallback(async (status?: string): Promise<AdminAdvertisement[]> => {
    if (!token || !isAdmin) return [];
    
    setLoading(true);
    try {
      const url = status 
        ? `${API_URL}/admin/advertisements?status=${status}`
        : `${API_URL}/admin/advertisements`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to fetch advertisements');
      return await response.json();
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [token, isAdmin]);

  const approveAdvertisement = useCallback(async (adId: number) => {
    if (!token || !isAdmin) return { success: false };
    
    try {
      const response = await fetch(`${API_URL}/admin/advertisements/${adId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to approve');
      return { success: true, data: await response.json() };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [token, isAdmin]);

  const rejectAdvertisement = useCallback(async (adId: number, reason?: string) => {
    if (!token || !isAdmin) return { success: false };
    
    try {
      const response = await fetch(`${API_URL}/admin/advertisements/${adId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });
      
      if (!response.ok) throw new Error('Failed to reject');
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [token, isAdmin]);

  const extendAdvertisement = useCallback(async (adId: number, days: number = 30) => {
    if (!token || !isAdmin) return { success: false };
    
    try {
      const response = await fetch(`${API_URL}/admin/advertisements/${adId}/extend?days=${days}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to extend');
      return { success: true, data: await response.json() };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [token, isAdmin]);

  const deleteAdvertisement = useCallback(async (adId: number) => {
    if (!token || !isAdmin) return { success: false };
    
    try {
      const response = await fetch(`${API_URL}/admin/advertisements/${adId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to delete');
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [token, isAdmin]);

  const updatePricing = useCallback(async (pricing: {
    premium_monthly?: number;
    commission_percent?: number;
    commission_max?: number;
    ad_duration_days?: number;
  }) => {
    if (!token || !isAdmin) return { success: false };
    
    try {
      const response = await fetch(`${API_URL}/admin/pricing`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pricing),
      });
      
      if (!response.ok) throw new Error('Failed to update pricing');
      return { success: true, data: await response.json() };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [token, isAdmin]);

  return {
    isAdmin,
    loading,
    error,
    fetchStats,
    fetchUsers,
    fetchUserEmails,
    fetchAdvertisements,
    approveAdvertisement,
    rejectAdvertisement,
    extendAdvertisement,
    deleteAdvertisement,
    updatePricing,
  };
};

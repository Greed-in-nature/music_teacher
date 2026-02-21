import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

export interface Advertisement {
  id: number;
  title: string;
  short_description: string;
  long_description?: string;
  status: 'pending' | 'active' | 'expired' | 'suspended';
  featured: boolean;
  views: number;
  contacts: number;
  created_at: string;
  expires_at: string;
  days_remaining?: number;
  instrument: string;
  location: string;
}

export interface TeacherProfile {
  bio_short?: string;
  bio_long?: string;
  video_url?: string;
  years_experience: number;
  lesson_price?: number;
  price_currency: string;
  teaching_online: boolean;
  teaching_at_student: boolean;
  teaching_at_teacher: boolean;
  subscription_type: 'free' | 'premium';
  subscription_expires?: string;
}

export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'student' | 'teacher' | 'admin';
  created_at: string;
  teacher_profile?: TeacherProfile;
  advertisements: Advertisement[];
}

const API_URL = 'http://localhost:8000/api';

export const useProfile = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      setProfile(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const updateProfile = useCallback(async (profileData: Partial<UserProfile> & { teacher_profile?: Partial<TeacherProfile> }) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update profile');
      }
      
      await fetchProfile(); // Refresh profile data
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [token, fetchProfile]);

  const fetchMyAdvertisements = useCallback(async () => {
    if (!token) return [];
    
    try {
      const response = await fetch(`${API_URL}/users/my-advertisements`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch advertisements');
      }
      
      return await response.json();
    } catch (err) {
      return [];
    }
  }, [token]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    fetchMyAdvertisements,
  };
};

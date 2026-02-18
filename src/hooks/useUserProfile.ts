import { useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '../types';
import { extractSkills, detectExperienceLevel } from '../lib/aiMatcher';

const STORAGE_KEY = 'jobhunt_user_profile_v2';
const USER_ID_KEY = 'jobhunt_user_id';
const API_BASE_URL = 'http://localhost:8001/api';

const DEFAULT_PROFILE: UserProfile = {
  id: '',
  fullName: '',
  email: '',
  location: '',
  resumeText: '',
  extractedSkills: [],
  experienceLevel: 'mid',
  yearsOfExperience: 0,
  preferredRoles: [],
  preferredIndustries: [],
  workStyle: 'flexible',
  createdAt: '',
  updatedAt: ''
};

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load profile from localStorage on mount
  useEffect(() => {
    const loadProfile = () => {
      try {
        // Always try to load from localStorage first
        const stored = localStorage.getItem(STORAGE_KEY);
        const storedId = localStorage.getItem(USER_ID_KEY);
        
        if (stored) {
          const parsed = JSON.parse(stored);
          setProfile(parsed);
          console.log('Profile loaded from localStorage:', parsed.fullName);
        }
        
        if (storedId) {
          setUserId(storedId);
          setIsAuthenticated(true);
          // Sync with server in background
          syncWithServer(storedId);
        }
      } catch (e) {
        console.error('Failed to load profile:', e);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, []);

  // Background sync with server
  const syncWithServer = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/${id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.profile) {
          setProfile(data.profile);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.profile));
        }
      }
    } catch (e) {
      // Silent fail - we already have local data
      console.log('Server sync failed, using local data');
    }
  };

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    if (profile) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      console.log('Profile saved to localStorage');
    }
  }, [profile]);

  const createProfile = useCallback(async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const now = new Date().toISOString();
    const newProfile: UserProfile = {
      ...DEFAULT_PROFILE,
      id: crypto.randomUUID(),
      ...data,
      createdAt: now,
      updatedAt: now
    };
    
    setProfile(newProfile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
    console.log('New profile created:', newProfile.fullName);
    
    return newProfile;
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<void> => {
    setProfile(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      console.log('Profile updated');
      return updated;
    });
  }, []);

  const processResume = useCallback(async (text: string, fileName?: string) => {
    const skills = extractSkills(text);
    const { level, years } = detectExperienceLevel(text);
    
    await updateProfile({
      resumeText: text,
      resumeFileName: fileName,
      extractedSkills: skills,
      experienceLevel: level as UserProfile['experienceLevel'],
      yearsOfExperience: years
    });
    
    return { skills, level, years };
  }, [updateProfile]);

  const clearProfile = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_ID_KEY);
    setProfile(null);
    setUserId(null);
    setIsAuthenticated(false);
    console.log('Profile cleared');
  }, []);

  const register = useCallback(async (
    email: string, 
    password: string, 
    profileData: Partial<UserProfile>
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          profile: {
            ...DEFAULT_PROFILE,
            ...profileData,
            email
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem(USER_ID_KEY, data.userId);
        setUserId(data.userId);
        setIsAuthenticated(true);
        
        const now = new Date().toISOString();
        const newProfile: UserProfile = {
          ...DEFAULT_PROFILE,
          ...profileData,
          id: data.userId,
          email,
          createdAt: now,
          updatedAt: now
        };
        setProfile(newProfile);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
        
        return true;
      }
      
      return false;
    } catch (e) {
      console.error('Registration failed:', e);
      return false;
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem(USER_ID_KEY, data.userId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.profile));
        setUserId(data.userId);
        setProfile(data.profile);
        setIsAuthenticated(true);
        return true;
      }
      
      return false;
    } catch (e) {
      console.error('Login failed:', e);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(USER_ID_KEY);
    setUserId(null);
    setIsAuthenticated(false);
    // Keep profile in localStorage for convenience
  }, []);

  const isProfileComplete = useCallback((): boolean => {
    if (!profile) return false;
    return !!(
      profile.fullName &&
      profile.email &&
      profile.location &&
      profile.resumeText
    );
  }, [profile]);

  const calculateCompletionPercentage = useCallback((): number => {
    if (!profile) return 0;
    
    const fields = [
      profile.fullName,
      profile.email,
      profile.location,
      profile.resumeText,
      profile.linkedinUrl,
      profile.portfolioUrl,
      profile.extractedSkills.length > 0,
      profile.preferredRoles.length > 0
    ];
    
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  return {
    profile,
    isLoading,
    hasProfile: !!profile,
    isComplete: isProfileComplete(),
    completionPercentage: calculateCompletionPercentage(),
    isAuthenticated,
    userId,
    createProfile,
    updateProfile,
    processResume,
    clearProfile,
    register,
    login,
    logout
  };
}

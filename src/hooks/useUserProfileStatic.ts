import { useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '../types';
import { extractSkills, detectExperienceLevel } from '../lib/aiMatcher';

const STORAGE_KEY = 'jobhunt_user_profile_v2';

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

// Simple version without backend - perfect for sharing with friends
export function useUserProfileStatic() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile from localStorage on mount
  useEffect(() => {
    const loadProfile = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setProfile(parsed);
          console.log('✅ Profile loaded:', parsed.fullName);
        }
      } catch (e) {
        console.error('Failed to load profile:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    if (profile) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      console.log('💾 Profile saved');
    }
  }, [profile]);

  const createProfile = useCallback((data: Partial<UserProfile>): UserProfile => {
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
    return newProfile;
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>): void => {
    setProfile(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
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
    setProfile(null);
  }, []);

  const isProfileComplete = useCallback((): boolean => {
    if (!profile) return false;
    return !!(profile.fullName && profile.email && profile.location && profile.resumeText);
  }, [profile]);

  const calculateCompletionPercentage = useCallback((): number => {
    if (!profile) return 0;
    const fields = [
      profile.fullName, profile.email, profile.location, profile.resumeText,
      profile.linkedinUrl, profile.portfolioUrl,
      profile.extractedSkills.length > 0, profile.preferredRoles.length > 0
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [profile]);

  return {
    profile,
    isLoading,
    hasProfile: !!profile,
    isComplete: isProfileComplete(),
    completionPercentage: calculateCompletionPercentage(),
    isAuthenticated: false, // No backend = no auth
    userId: profile?.id || null,
    createProfile,
    updateProfile,
    processResume,
    clearProfile,
    // Auth methods that do nothing (for compatibility)
    register: async () => false,
    login: async () => false,
    logout: () => {},
  };
}

export default useUserProfileStatic;

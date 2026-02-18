import { useState, useEffect, useCallback } from 'react';
import type { JobListing } from '../types';

interface JobsData {
  jobs: JobListing[];
  lastScraped: string;
  totalJobs: number;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  refreshJobs: () => Promise<void>;
}

const JOBS_URL = '/data/jobs.json';
const API_URL = 'http://localhost:5000/api';

export function useJobs(): JobsData {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [lastScraped, setLastScraped] = useState<string>('');
  const [totalJobs, setTotalJobs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Add cache-buster
      const response = await fetch(`${JOBS_URL}?t=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      
      const data = await response.json();
      setJobs(data.jobs || []);
      setLastScraped(data.last_scraped || new Date().toISOString());
      setTotalJobs(data.total_jobs || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching jobs:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshJobs = useCallback(async () => {
    try {
      setIsUpdating(true);
      setError(null);
      
      // Call the API to trigger update
      const response = await fetch(`${API_URL}/jobs/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Update failed: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Refetch jobs after update
        await fetchJobs();
      } else {
        throw new Error(result.error || 'Update failed');
      }
    } catch (err) {
      // If API is not available, just refetch local file
      console.warn('API not available, fetching local jobs:', err);
      await fetchJobs();
    } finally {
      setIsUpdating(false);
    }
  }, [fetchJobs]);

  useEffect(() => {
    fetchJobs();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchJobs, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchJobs]);

  return {
    jobs,
    lastScraped,
    totalJobs,
    isLoading,
    isUpdating,
    error,
    refreshJobs
  };
}

export interface JobListing {
  id: string;
  company: string;
  role: string;
  role_type: 'Full-time' | 'Contract' | 'Part-time' | 'Internship';
  location: string;
  remote_status: 'Remote' | 'Hybrid' | 'On-site';
  salary_range: string;
  salary_min?: number;
  salary_max?: number;
  url: string;
  date_posted: string;
  date_scraped: string;
  match_rating: number;
  status: 'new' | 'applied' | 'interview' | 'offer' | 'rejected' | 'archived';
  notes: string;
  source: string; // company career page URL
  is_ghost_job: boolean;
  // AI-extracted fields (like HiringCafe)
  years_experience?: string;
  skills?: string[];
  industry?: string;
  visa_sponsorship?: boolean;
  job_description_summary?: string;
}

export interface DreamCompany {
  id: string;
  company: string;
  industry: string;
  website: string;
  careers_url: string;
  jobs_email?: string;
  recent_news?: string;
  direction?: string;
  known_contacts?: string;
  date_added: string;
  last_checked: string;
  is_verified: boolean; // Manually verified (no recruiting agency)
  open_positions?: number;
}

export interface SearchConfig {
  primary_role: string;
  secondary_roles: string[];
  industries: string[];
  keywords: string[];
  location_base: string;
  remote: boolean;
  hybrid: boolean;
  on_site: boolean;
  salary_minimum: number;
  exclude_recruiters: boolean;
  exclude_ghost_jobs: boolean;
  days_since_posted: number;
}

export interface JobFilter {
  query: string;
  remote: ('Remote' | 'Hybrid' | 'On-site')[];
  location: string;
  salary_min: number;
  salary_max: number;
  date_range: '24h' | '3d' | '7d' | '30d' | 'all';
  exclude_recruiters: boolean;
  exclude_ghost_jobs: boolean;
}

// AI Profile & Matching Types
export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  location: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  twitterUrl?: string;
  otherLinks?: { name: string; url: string }[];
  resumeText: string;
  resumeFileName?: string;
  extractedSkills: string[];
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  yearsOfExperience: number;
  preferredRoles: string[];
  preferredIndustries: string[];
  workStyle: 'remote' | 'hybrid' | 'onsite' | 'flexible';
  salaryExpectation?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MatchScore {
  overall: number;
  skills: number;
  experience: number;
  location: number;
  salary: number;
  culture: number;
  reasons: string[];
}

export interface MatchedJob extends JobListing {
  matchScore: MatchScore;
  matchedSkills: string[];
  missingSkills: string[];
  recommendationReason: string;
}

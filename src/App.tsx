import { useState, useEffect, useMemo } from 'react';
import { 
  Briefcase, Search, MapPin, DollarSign, ExternalLink, Clock,
  Filter, Globe, ChevronDown, Bookmark, RefreshCw,
  BriefcaseBusiness, Loader2, X, Plus, Trash2, Building2,
  Calendar, Tag, ArrowRight, Sparkles, User, Bot, Target,
  Star, TrendingUp, Wand2, FileText, Mail, Lightbulb
} from 'lucide-react';
import type { JobListing, MatchedJob, UserProfile } from './types';
import { Button, Card, Badge, Input, Modal, EmptyState } from './components/ui';
import { getRelativeTime, stripHtml, getTimezoneFromLocation, getRegionFromLocation, formatTime } from './lib/utils';
import { useJobs } from './hooks/useJobs';
import { useUserProfile } from './hooks/useUserProfile';
import { isDesignRole } from './lib/aiMatcher';
import { ProfileSetup } from './components/ProfileSetup';
import { MatchScoreBadge } from './components/MatchScore';
import { CompanyLogo } from './components/CompanyLogo';
import { rankJobs } from './lib/aiMatcher';

// Constants
const REGIONS = [
  { code: 'AU', name: 'Australia', flag: '🇦🇺', timezoneMin: 8, timezoneMax: 11 },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', timezoneMin: 12, timezoneMax: 13 },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', timezoneMin: 8, timezoneMax: 8 },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', timezoneMin: 9, timezoneMax: 9 },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', timezoneMin: 8, timezoneMax: 8 },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', timezoneMin: 9, timezoneMax: 9 },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', timezoneMin: 8, timezoneMax: 8 },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', timezoneMin: 8, timezoneMax: 8 },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', timezoneMin: 8, timezoneMax: 8 },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', timezoneMin: 7, timezoneMax: 9 },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', timezoneMin: 7, timezoneMax: 7 },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', timezoneMin: 7, timezoneMax: 7 },
  { code: 'IN', name: 'India', flag: '🇮🇳', timezoneMin: 5.5, timezoneMax: 5.5 },
  { code: 'US', name: 'United States', flag: '🇺🇸', timezoneMin: -8, timezoneMax: -5 },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', timezoneMin: 0, timezoneMax: 1 },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', timezoneMin: -8, timezoneMax: -3.5 },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', timezoneMin: 1, timezoneMax: 2 },
  { code: 'REMOTE', name: 'Remote/Global', flag: '🌍', timezoneMin: -12, timezoneMax: 14 },
];

const FILTER_PRESETS = [
  { name: 'Australia + Asia', icon: '🌏', regions: ['AU', 'SG', 'JP', 'HK', 'REMOTE'], timezoneMin: 7, timezoneMax: 12, remoteTypes: ['Remote', 'Hybrid', 'On-site'] },
  { name: 'SE Asia Only', icon: '🏝️', regions: ['SG', 'HK', 'TH', 'VN', 'MY', 'ID', 'PH', 'REMOTE'], timezoneMin: 7, timezoneMax: 9, remoteTypes: ['Remote', 'Hybrid'] },
  { name: 'Australia Only', icon: '🦘', regions: ['AU', 'NZ'], timezoneMin: 8, timezoneMax: 13, remoteTypes: ['Remote', 'Hybrid', 'On-site'] },
  { name: 'All Remote', icon: '💻', regions: ['REMOTE'], timezoneMin: -12, timezoneMax: 14, remoteTypes: ['Remote'] },
];

// Components
function WorldMapSVG({ timezoneRange, onTimezoneChange }: { timezoneRange: { min: number; max: number }; onTimezoneChange: (min: number, max: number) => void }) {
  const tzToX = (tz: number) => ((tz + 12) / 24) * 100;
  
  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const clickedTz = Math.round((x / 100) * 24 - 12);
    onTimezoneChange(Math.max(-12, clickedTz - 2), Math.min(14, clickedTz + 2));
  };

  return (
    <div className="relative">
      <svg 
        viewBox="0 0 1000 500" 
        className="w-full h-auto cursor-pointer rounded-xl shadow-inner"
        onClick={handleClick}
        style={{ background: 'linear-gradient(to right, #1e3a5f 0%, #3b82f6 25%, #fbbf24 50%, #f59e0b 75%, #7c2d12 100%)' }}
      >
        <g fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" strokeWidth="1">
          <path d="M50,80 Q150,60 250,100 T350,150 T200,200 T80,180 Z" />
          <path d="M200,220 Q280,250 300,350 T220,450 T180,350 Z" />
          <path d="M420,90 Q480,70 520,100 T500,160 T440,150 Z" />
          <path d="M420,180 Q500,170 520,250 T480,380 T420,300 Z" />
          <path d="M540,80 Q700,60 850,100 T900,200 T750,250 T600,200 T550,150 Z" />
          <path d="M750,320 Q850,310 880,360 T820,420 T740,380 Z" />
        </g>
        <rect x={tzToX(timezoneRange.min) + '%'} y="0" width={tzToX(timezoneRange.max) - tzToX(timezoneRange.min) + '%'} height="100%" fill="rgba(255,255,255,0.35)" stroke="white" strokeWidth="3" style={{ pointerEvents: 'none' }} />
        <text x="5%" y="30" fill="white" fontSize="14" fontWeight="bold">UTC-12</text>
        <text x="45%" y="30" fill="white" fontSize="14" fontWeight="bold">UTC+0</text>
        <text x="88%" y="30" fill="white" fontSize="14" fontWeight="bold">UTC+12</text>
        <circle cx="820" cy="360" r="10" fill="#fbbf24" stroke="white" strokeWidth="3" />
        <text x="820" y="390" fill="white" fontSize="14" textAnchor="middle" fontWeight="bold">AU</text>
        <circle cx="760" cy="280" r="7" fill="#fbbf24" stroke="white" strokeWidth="2" />
        <text x="760" y="255" fill="white" fontSize="12" textAnchor="middle">SG</text>
        <circle cx="860" cy="160" r="7" fill="#fbbf24" stroke="white" strokeWidth="2" />
        <text x="860" y="135" fill="white" fontSize="12" textAnchor="middle">JP</text>
        <text x="50%" y="480" fill="white" fontSize="20" fontWeight="bold" textAnchor="middle" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
          UTC{timezoneRange.min >= 0 ? '+' : ''}{timezoneRange.min} to UTC{timezoneRange.max >= 0 ? '+' : ''}{timezoneRange.max}
        </text>
      </svg>
      <p className="text-sm text-gray-500 mt-3 text-center font-medium">Click anywhere on the map to select your timezone</p>
    </div>
  );
}

function JobCard({ job, isSaved, onToggleSave, onClick, showMatch = false }: { 
  job: MatchedJob | JobListing; 
  isSaved: boolean;
  onToggleSave: (e: React.MouseEvent) => void;
  onClick: () => void;
  showMatch?: boolean;
}) {
  const matchedJob = job as MatchedJob;
  const hasMatchScore = showMatch && matchedJob.matchScore;
  
  return (
    <Card hover onClick={onClick} className="group relative">
      {/* Match Score Badge */}
      {hasMatchScore && (
        <div className="absolute -top-3 -right-3 z-10">
          <MatchScoreBadge score={matchedJob.matchScore} size="md" />
        </div>
      )}

      <div className="flex items-start justify-between gap-4 mb-6">
        <CompanyLogo company={job.company} size="md" />
        <button 
          onClick={onToggleSave}
          className={`p-2.5 rounded-xl transition-all ${isSaved ? 'text-yellow-500 bg-yellow-50' : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50'}`}
        >
          <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      <h3 className="font-semibold text-lg text-[var(--color-text-primary)] mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
        {job.role}
      </h3>
      <p className="text-[var(--color-text-secondary)] mb-4 font-medium">{job.company}</p>

      {/* Match Reasons */}
      {hasMatchScore && matchedJob.matchedSkills.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {matchedJob.matchedSkills.slice(0, 3).map(skill => (
              <span key={skill} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                {skill}
              </span>
            ))}
            {matchedJob.matchedSkills.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                +{matchedJob.matchedSkills.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant={job.remote_status === 'Remote' ? 'success' : job.remote_status === 'Hybrid' ? 'primary' : 'default'}>
          {job.remote_status}
        </Badge>
        {job.salary_range && job.salary_range !== 'Not disclosed' && (
          <Badge variant="default">{job.salary_range}</Badge>
        )}
      </div>

      <div className="flex items-center gap-2 text-[var(--color-text-tertiary)] mb-4">
        <MapPin className="w-4 h-4" />
        <span className="text-sm truncate">{job.location}</span>
      </div>

      <div className="pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
        <span className="text-sm text-[var(--color-text-muted)]">{getRelativeTime(job.date_posted || new Date().toISOString())}</span>
        <div className="flex items-center gap-2 text-[var(--color-primary-600)] font-medium group-hover:gap-3 transition-all">
          <span className="text-sm">View Details</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Card>
  );
}

// Application content component
function ApplicationContent({ job, profile }: { job: JobListing; profile: UserProfile }) {
  const [generated, setGenerated] = useState<import('./lib/applicationHelper').GeneratedApplication | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const generateDocs = async () => {
    setIsGenerating(true);
    const { generateApplicationDocs } = await import('./lib/applicationHelper');
    const docs = generateApplicationDocs(job, profile, {});
    setGenerated(docs);
    setIsGenerating(false);
  };

  const copyToClipboard = async (text: string, section: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  if (!generated) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">AI Application Helper</h3>
        <p className="text-gray-500 mb-4 max-w-sm mx-auto">
          Generate a personalized cover letter and email templates based on your profile and this job.
        </p>
        <Button 
          onClick={generateDocs}
          isLoading={isGenerating}
          leftIcon={<Wand2 className="w-5 h-5" />}
        >
          {isGenerating ? 'Generating...' : 'Generate Application Materials'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
      {/* Cover Letter */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-blue-900 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Cover Letter
          </h4>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => copyToClipboard(generated.coverLetter.text, 'cover')}
          >
            {copiedSection === 'cover' ? 'Copied!' : 'Copy'}
          </Button>
        </div>
        <textarea
          value={generated.coverLetter.text}
          onChange={(e) => setGenerated({...generated, coverLetter: {...generated.coverLetter, text: e.target.value}})}
          className="w-full h-32 p-3 bg-white border border-blue-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Email */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-purple-900 flex items-center gap-2">
            <Mail className="w-4 h-4" /> Email to Hiring Manager
          </h4>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => copyToClipboard(generated.emails[0].body, 'email')}
          >
            {copiedSection === 'email' ? 'Copied!' : 'Copy'}
          </Button>
        </div>
        <p className="text-xs text-purple-600 mb-2">Subject: {generated.emails[0].subject}</p>
        <textarea
          value={generated.emails[0].body}
          onChange={(e) => {
            const updated = [...generated.emails];
            updated[0] = {...updated[0], body: e.target.value};
            setGenerated({...generated, emails: updated});
          }}
          className="w-full h-24 p-3 bg-white border border-purple-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <h4 className="font-semibold text-amber-900 flex items-center gap-2 mb-2">
          <Lightbulb className="w-4 h-4" /> Tips
        </h4>
        <ul className="space-y-1 text-sm text-amber-800">
          {generated.tips.slice(0, 3).map((tip, i) => (
            <li key={i}>• {tip.replace('💡 ', '').replace('💡', '')}</li>
          ))}
        </ul>
      </div>

      <Button 
        variant="secondary" 
        onClick={generateDocs}
        className="w-full"
      >
        Regenerate
      </Button>
    </div>
  );
}

function JobDetailModal({ job, isOpen, onClose, isSaved, onToggleSave, profile }: {
  job: JobListing | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
  profile: UserProfile | null;
}) {
  const [activeTab, setActiveTab] = useState<'details' | 'apply'>('details');

  if (!job) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button 
            variant={isSaved ? 'secondary' : 'ghost'} 
            onClick={onToggleSave}
            leftIcon={<Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />}
          >
            {isSaved ? 'Saved' : 'Save Job'}
          </Button>
          <Button 
            variant="primary" 
            size="lg"
            rightIcon={<ExternalLink className="w-5 h-5" />}
            onClick={() => window.open(job.url, '_blank')}
          >
            Apply Now
          </Button>
        </>
      }
    >
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b pb-4">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'details' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Job Details
        </button>
        <button
          onClick={() => setActiveTab('apply')}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeTab === 'apply' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Wand2 className="w-4 h-4" />
          Apply Helper
        </button>
      </div>

      {activeTab === 'apply' ? (
        profile ? <ApplicationContent job={job} profile={profile} /> : <div className="text-center py-8 text-gray-500">Create a profile to use Apply Helper</div>
      ) : (
        <>
          <div className="flex items-start gap-5 mb-8">
            <CompanyLogo company={job.company} size="lg" />
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">{job.role}</h2>
              <p className="text-lg text-[var(--color-text-secondary)]">{job.company}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-[var(--color-surface-subtle)] rounded-xl">
              <MapPin className="w-5 h-5 text-[var(--color-text-muted)]" />
              <div>
                <p className="text-xs text-[var(--color-text-tertiary)] font-medium uppercase tracking-wide">Location</p>
                <p className="font-semibold text-[var(--color-text-primary)]">{job.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-[var(--color-surface-subtle)] rounded-xl">
              <Building2 className="w-5 h-5 text-[var(--color-text-muted)]" />
              <div>
                <p className="text-xs text-[var(--color-text-tertiary)] font-medium uppercase tracking-wide">Work Type</p>
                <p className="font-semibold text-[var(--color-text-primary)]">{job.remote_status}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-[var(--color-surface-subtle)] rounded-xl">
              <DollarSign className="w-5 h-5 text-[var(--color-text-muted)]" />
              <div>
                <p className="text-xs text-[var(--color-text-tertiary)] font-medium uppercase tracking-wide">Salary</p>
                <p className="font-semibold text-[var(--color-text-primary)]">{job.salary_range || 'Not disclosed'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-[var(--color-surface-subtle)] rounded-xl">
              <Calendar className="w-5 h-5 text-[var(--color-text-muted)]" />
              <div>
                <p className="text-xs text-[var(--color-text-tertiary)] font-medium uppercase tracking-wide">Posted</p>
                <p className="font-semibold text-[var(--color-text-primary)]">{getRelativeTime(job.date_posted || new Date().toISOString())}</p>
              </div>
            </div>
          </div>

          {job.skills && job.skills.length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" /> Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill: string) => (
                  <Badge key={skill} variant="primary">{skill}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">About this role</h3>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              {stripHtml(job.job_description_summary || '') || 'No description available.'}
            </p>
          </div>

          <div className="p-4 bg-[var(--color-surface-subtle)] rounded-xl">
            <p className="text-sm text-[var(--color-text-secondary)]">
              <span className="font-medium text-[var(--color-text-primary)]">Source:</span> {job.source}
            </p>
          </div>
        </>
      )}
    </Modal>
  );
}

// AI Profile Summary Card
function ProfileSummaryCard({ profile, onEdit }: { profile: UserProfile; onEdit: () => void }) {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <User className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{profile.fullName}</h3>
            <p className="text-sm text-gray-600">
              {profile.experienceLevel} • {profile.yearsOfExperience} years • {profile.extractedSkills.length} skills
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          Edit
        </Button>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-2">
        {profile.preferredRoles.slice(0, 3).map(role => (
          <Badge key={role} variant="primary">{role}</Badge>
        ))}
        {profile.preferredIndustries.slice(0, 2).map(ind => (
          <Badge key={ind} variant="default">{ind}</Badge>
        ))}
      </div>
    </Card>
  );
}

// Main App
function App() {
  const { jobs, lastScraped, isLoading, isUpdating, refreshJobs } = useJobs();
  const { 
    profile, 
    hasProfile, 
    isComplete, 
    completionPercentage, 
    createProfile, 
    updateProfile,
    isAuthenticated,
    register,
    login,
    logout
  } = useUserProfile();
  
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'jobs' | 'saved' | 'ai-matches'>('jobs');
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'company' | 'random' | 'match'>('random');
  const [searchQuery, setSearchQuery] = useState('');
  // Auto-set regions based on user profile location
  const getInitialRegions = () => {
    if (profile?.location) {
      const loc = profile.location.toLowerCase();
      if (loc.includes('sydney') || loc.includes('melbourne') || loc.includes('australia')) {
        return ['AU', 'NZ', 'REMOTE'];
      }
      if (loc.includes('singapore')) return ['SG', 'REMOTE'];
      if (loc.includes('tokyo') || loc.includes('japan')) return ['JP', 'REMOTE'];
    }
    return ['AU', 'SG', 'JP', 'HK', 'REMOTE'];
  };
  
  const [selectedRegions, setSelectedRegions] = useState<string[]>(getInitialRegions());
  const [remoteTypes, setRemoteTypes] = useState<string[]>(['Remote', 'Hybrid', 'On-site']);
  const [dateRange, setDateRange] = useState<'24h' | '3d' | '7d' | '30d' | 'all'>('30d');
  const [timezoneRange, setTimezoneRange] = useState<{min: number, max: number}>({ min: 7, max: 12 });
  const [showFilters, setShowFilters] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [savedSearches, setSavedSearches] = useState<Array<{id: string; name: string; filters: any}>>(() => {
    const saved = localStorage.getItem('savedSearches');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false);
  const [newSearchName, setNewSearchName] = useState('');

  useEffect(() => { localStorage.setItem('savedSearches', JSON.stringify(savedSearches)); }, [savedSearches]);

  // Filter jobs to show design roles only
  const designJobs = useMemo(() => {
    return jobs.filter(job => isDesignRole(job.role));
  }, [jobs]);

  // AI Matching: Rank DESIGN jobs based on profile (filter out non-design roles)
  const matchedJobs = useMemo(() => {
    if (!profile || !isComplete) return designJobs as MatchedJob[];
    return rankJobs(designJobs, profile);
  }, [designJobs, profile, isComplete]);

  const filteredJobs = useMemo(() => {
    let filtered = matchedJobs.filter(job => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match = job.role.toLowerCase().includes(q) || job.company.toLowerCase().includes(q) || job.skills?.some((s: string) => s.toLowerCase().includes(q));
        if (!match) return false;
      }
      const jobRegions = getRegionFromLocation(job.location);
      if (!selectedRegions.some(r => jobRegions.includes(r))) return false;
      if (job.remote_status !== 'Remote') {
        const jobTz = getTimezoneFromLocation(job.location);
        if (jobTz < timezoneRange.min || jobTz > timezoneRange.max) return false;
      }
      if (!remoteTypes.includes(job.remote_status)) return false;
      if (dateRange !== 'all') {
        const days = { '24h': 1, '3d': 3, '7d': 7, '30d': 30 };
        const jobDate = new Date(job.date_posted);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days[dateRange]);
        if (jobDate < cutoff) return false;
      }
      return true;
    });

    if (sortBy === 'random') filtered = [...filtered].sort(() => Math.random() - 0.5);
    else if (sortBy === 'date') filtered = [...filtered].sort((a, b) => new Date(b.date_posted).getTime() - new Date(a.date_posted).getTime());
    else if (sortBy === 'company') filtered = [...filtered].sort((a, b) => a.company.localeCompare(b.company));
    else if (sortBy === 'match' && profile) filtered = [...filtered].sort((a, b) => (b.matchScore?.overall || 0) - (a.matchScore?.overall || 0));

    return filtered;
  }, [matchedJobs, searchQuery, selectedRegions, remoteTypes, dateRange, timezoneRange, sortBy, profile]);

  const displayedJobs = useMemo(() => {
    if (activeTab === 'saved') return filteredJobs.filter(j => savedJobs.has(j.id));
    if (activeTab === 'ai-matches' && profile) {
      // Show top 50 AI matches
      return filteredJobs.filter(j => (j.matchScore?.overall || 0) >= 60).slice(0, 50);
    }
    return filteredJobs;
  }, [filteredJobs, savedJobs, activeTab, profile]);

  const toggleSave = (id: string) => {
    setSavedJobs(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const toggleRegion = (code: string) => setSelectedRegions(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
  const applyPreset = (preset: typeof FILTER_PRESETS[0]) => { setSelectedRegions(preset.regions); setTimezoneRange({ min: preset.timezoneMin, max: preset.timezoneMax }); setRemoteTypes(preset.remoteTypes); };
  const clearAllFilters = () => { setSearchQuery(''); setSelectedRegions(REGIONS.map(r => r.code)); setRemoteTypes(['Remote', 'Hybrid', 'On-site']); setDateRange('all'); setTimezoneRange({ min: -12, max: 14 }); };
  const saveCurrentSearch = () => { if (!newSearchName.trim()) return; setSavedSearches([...savedSearches, { id: Date.now().toString(), name: newSearchName, filters: { regions: selectedRegions, timezoneMin: timezoneRange.min, timezoneMax: timezoneRange.max, remoteTypes, dateRange } }]); setNewSearchName(''); setShowSaveSearchModal(false); };
  const loadSavedSearch = (search: typeof savedSearches[0]) => { setSelectedRegions(search.filters.regions); setTimezoneRange({ min: search.filters.timezoneMin, max: search.filters.timezoneMax }); setRemoteTypes(search.filters.remoteTypes); setDateRange(search.filters.dateRange); };
  const deleteSavedSearch = (id: string) => setSavedSearches(savedSearches.filter(s => s.id !== id));
  
  const activeFilterCount = [searchQuery, selectedRegions.length !== REGIONS.length, remoteTypes.length !== 3, dateRange !== 'all', timezoneRange.min !== -12 || timezoneRange.max !== 14].filter(Boolean).length;

  const handleProfileSave = (data: Partial<UserProfile>) => {
    if (profile) {
      updateProfile(data);
    } else {
      createProfile(data);
    }
    setShowProfileSetup(false);
    
    // Update regions based on new location
    if (data.location) {
      const loc = data.location.toLowerCase();
      if (loc.includes('sydney') || loc.includes('melbourne') || loc.includes('australia')) {
        setSelectedRegions(['AU', 'NZ', 'REMOTE']);
      } else if (loc.includes('singapore')) {
        setSelectedRegions(['SG', 'REMOTE']);
      }
    }
  };
  
  // Get user's home location for priority
  const userHomeLocation = useMemo(() => {
    if (!profile?.location) return null;
    const loc = profile.location.toLowerCase();
    if (loc.includes('sydney')) return 'Sydney';
    if (loc.includes('melbourne')) return 'Melbourne';
    if (loc.includes('brisbane')) return 'Brisbane';
    if (loc.includes('perth')) return 'Perth';
    if (loc.includes('australia')) return 'Australia';
    return profile.location;
  }, [profile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-page)] flex items-center justify-center">
        <div className="flex items-center gap-4 text-[var(--color-text-secondary)] bg-[var(--color-surface-default)] px-8 py-6 rounded-2xl shadow-lg">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary-600)]" />
          <span className="text-lg font-medium">Loading jobs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)]">
      {/* Header */}
      <header className="bg-[var(--color-surface-default)]/80 backdrop-blur-md border-b border-[var(--color-border-default)] sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-[var(--color-primary-600)] to-indigo-700 p-3 rounded-xl shadow-lg">
                <BriefcaseBusiness className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">JobHunt AI</h1>
                <p className="text-sm text-[var(--color-text-secondary)]">{designJobs.length} design jobs • {displayedJobs.length} showing</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* AI Profile / Auth Buttons */}
              {hasProfile ? (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    leftIcon={<Sparkles className="w-4 h-4 text-purple-500" />}
                    onClick={() => setShowProfileSetup(true)}
                    className="hidden sm:flex"
                  >
                    {isAuthenticated ? '✓ ' : ''}AI Profile {completionPercentage}%
                  </Button>
                  {isAuthenticated && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={logout}
                      className="text-gray-500"
                    >
                      Logout
                    </Button>
                  )}
                </div>
              ) : (
                <Button 
                  variant="primary" 
                  size="sm"
                  leftIcon={<Sparkles className="w-4 h-4" />}
                  onClick={() => setShowProfileSetup(true)}
                >
                  Create AI Profile
                </Button>
              )}

              {/* Live Data Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live Data
              </div>
              
              {/* Last Updated */}
              <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)] bg-[var(--color-surface-subtle)] px-4 py-2 rounded-full">
                <Clock className="w-4 h-4" />
                <span>Updated {formatTime(lastScraped)}</span>
              </div>
              
              {/* Refresh Button */}
              <Button 
                variant="secondary" 
                size="sm"
                isLoading={isUpdating}
                leftIcon={<RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />}
                onClick={refreshJobs}
              >
                {isUpdating ? 'Updating...' : 'Refresh Jobs'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Filter Bar */}
      <div className="bg-gradient-to-r from-[var(--color-primary-600)] to-indigo-700 text-white">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium text-blue-100">Quick Filters:</span>
            {FILTER_PRESETS.map((preset) => (
              <button key={preset.name} onClick={() => applyPreset(preset)} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-full border border-white/20 backdrop-blur-sm transition-all">
                <span className="text-lg">{preset.icon}</span>
                <span>{preset.name}</span>
              </button>
            ))}
            <div className="w-px h-6 bg-white/20 mx-2" />
            {savedSearches.map((search) => (
              <div key={search.id} className="flex items-center gap-1 group">
                <button onClick={() => loadSavedSearch(search)} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-full border border-white/20 transition-all">
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{search.name}</span>
                </button>
                <button onClick={() => deleteSavedSearch(search.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button onClick={() => setShowSaveSearchModal(true)} className="flex items-center gap-2 px-4 py-2 text-blue-100 text-sm rounded-full border border-dashed border-blue-300 hover:bg-white/10 transition-all">
              <Plus className="w-4 h-4" />
              <span>Save Current</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[var(--color-surface-default)] border-b border-[var(--color-border-default)] shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
              <input 
                type="text" 
                placeholder="Search by job title, company, or skills..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full pl-14 pr-12 py-4 bg-[var(--color-surface-subtle)] border border-[var(--color-border-default)] rounded-2xl text-lg text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-200)] focus:border-[var(--color-primary-500)] transition-all" 
              />
              {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-5 top-1/2 -translate-y-1/2 p-2 hover:bg-[var(--color-surface-hover)] rounded-full"><X className="w-5 h-5 text-[var(--color-text-muted)]" /></button>}
            </div>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)} 
              className="px-6 py-4 bg-[var(--color-surface-default)] border border-[var(--color-border-default)] rounded-2xl text-sm font-medium text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-200)]"
            >
              <option value="random">Sort: Random</option>
              <option value="date">Sort: Newest First</option>
              <option value="company">Sort: Company A-Z</option>
              {hasProfile && <option value="match">Sort: Best Match</option>}
            </select>
            <button 
              onClick={() => setShowFilters(!showFilters)} 
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all font-medium ${showFilters ? 'bg-[var(--color-primary-50)] border-[var(--color-primary-200)] text-[var(--color-primary-700)]' : 'bg-[var(--color-surface-default)] border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'}`}
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
              {activeFilterCount > 0 && <span className="ml-1 px-2.5 py-0.5 bg-[var(--color-primary-600)] text-white text-xs rounded-full font-bold">{activeFilterCount}</span>}
              <ChevronDown className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-[var(--color-surface-default)] border-b border-[var(--color-border-subtle)]">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-8 py-4">
            <button 
              onClick={() => setActiveTab('jobs')} 
              className={`flex items-center gap-3 px-5 py-2.5 rounded-xl transition-all ${activeTab === 'jobs' ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)] shadow-sm' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'}`}
            >
              <Briefcase className="w-5 h-5" />
              <span className="font-semibold">{filteredJobs.length}</span>
              <span className="text-[var(--color-text-tertiary)]">Jobs</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('saved')} 
              className={`flex items-center gap-3 px-5 py-2.5 rounded-xl transition-all ${activeTab === 'saved' ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)] shadow-sm' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'}`}
            >
              <Bookmark className="w-5 h-5" />
              <span className="font-semibold">{savedJobs.size}</span>
              <span className="text-[var(--color-text-tertiary)]">Saved</span>
            </button>

            {/* AI Matches Tab */}
            {hasProfile && (
              <button 
                onClick={() => setActiveTab('ai-matches')} 
                className={`flex items-center gap-3 px-5 py-2.5 rounded-xl transition-all ${activeTab === 'ai-matches' ? 'bg-purple-50 text-purple-700 shadow-sm' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'}`}
              >
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">AI Matches</span>
                {profile && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    {filteredJobs.filter(j => (j.matchScore?.overall || 0) >= 60).length}
                  </span>
                )}
              </button>
            )}

            <div className="flex-1" />
            {activeFilterCount > 0 && (
              <button 
                onClick={clearAllFilters} 
                className="flex items-center gap-2 px-5 py-2.5 text-[var(--color-danger-600)] bg-[var(--color-danger-50)] hover:bg-[var(--color-danger-100)] border border-[var(--color-danger-200)] rounded-xl font-medium transition-all"
              >
                <X className="w-4 h-4" />
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="w-96 flex-shrink-0 space-y-6">
              {/* AI Profile Card */}
              {hasProfile && profile && (
                <ProfileSummaryCard 
                  profile={profile} 
                  onEdit={() => setShowProfileSetup(true)} 
                />
              )}
              
              {/* Location Priority Notice */}
              {userHomeLocation && (
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-900">Priority: {userHomeLocation}</p>
                      <p className="text-sm text-green-600">Jobs in your location shown first</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Create Profile CTA */}
              {!hasProfile && (
                <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bot className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Unlock AI Matching</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload your resume and get personalized job recommendations with match scores.
                    </p>
                    <Button 
                      onClick={() => setShowProfileSetup(true)}
                      leftIcon={<Sparkles className="w-4 h-4" />}
                      className="w-full"
                    >
                      Create Profile
                    </Button>
                  </div>
                </Card>
              )}

              <Card padding="lg">
                <h3 className="font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2 text-lg">
                  <Globe className="w-5 h-5 text-[var(--color-primary-600)]" />
                  Select Timezone
                </h3>
                <WorldMapSVG timezoneRange={timezoneRange} onTimezoneChange={(min, max) => setTimezoneRange({ min, max })} />
                <div className="mt-6 space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-[var(--color-text-secondary)] mb-2 font-medium">
                      <span>Start Timezone</span>
                      <span className="text-[var(--color-primary-600)] font-bold">UTC{timezoneRange.min >= 0 ? '+' : ''}{timezoneRange.min}</span>
                    </div>
                    <input type="range" min="-12" max="14" step="1" value={timezoneRange.min} onChange={(e) => setTimezoneRange({ ...timezoneRange, min: parseInt(e.target.value) })} className="w-full h-3 bg-[var(--color-surface-hover)] rounded-full accent-[var(--color-primary-600)]" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-[var(--color-text-secondary)] mb-2 font-medium">
                      <span>End Timezone</span>
                      <span className="text-[var(--color-primary-600)] font-bold">UTC{timezoneRange.max >= 0 ? '+' : ''}{timezoneRange.max}</span>
                    </div>
                    <input type="range" min="-12" max="14" step="1" value={timezoneRange.max} onChange={(e) => setTimezoneRange({ ...timezoneRange, max: parseInt(e.target.value) })} className="w-full h-3 bg-[var(--color-surface-hover)] rounded-full accent-[var(--color-primary-600)]" />
                  </div>
                </div>
                <p className="text-sm text-[var(--color-text-tertiary)] mt-5 text-center font-medium">🌏 Australia: UTC+8 to +11 • Asia: UTC+7 to +9</p>
              </Card>

              <Card padding="lg">
                <h3 className="font-bold text-[var(--color-text-primary)] mb-4 text-lg">Countries & Regions</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {REGIONS.map((region) => (
                    <label key={region.code} className="flex items-center gap-4 cursor-pointer hover:bg-[var(--color-surface-hover)] p-3 rounded-xl transition-colors">
                      <input type="checkbox" checked={selectedRegions.includes(region.code)} onChange={() => toggleRegion(region.code)} className="w-5 h-5 rounded-lg border-[var(--color-border-default)] text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)]" />
                      <span className="text-2xl">{region.flag}</span>
                      <span className="text-[var(--color-text-secondary)] flex-1 font-medium">{region.name}</span>
                      <span className="text-sm text-[var(--color-text-muted)] font-mono">UTC{region.timezoneMin >= 0 ? '+' : ''}{region.timezoneMin}</span>
                    </label>
                  ))}
                </div>
              </Card>

              <Card padding="lg">
                <h3 className="font-bold text-[var(--color-text-primary)] mb-4 text-lg">Work Type</h3>
                <div className="space-y-3">
                  {['Remote', 'Hybrid', 'On-site'].map((type) => (
                    <label key={type} className="flex items-center gap-4 cursor-pointer hover:bg-[var(--color-surface-hover)] p-3 rounded-xl transition-colors">
                      <input type="checkbox" checked={remoteTypes.includes(type)} onChange={(e) => setRemoteTypes(e.target.checked ? [...remoteTypes, type] : remoteTypes.filter(t => t !== type))} className="w-5 h-5 rounded-lg border-[var(--color-border-default)] text-[var(--color-primary-600)]" />
                      <span className="text-[var(--color-text-secondary)] font-medium">{type}</span>
                    </label>
                  ))}
                </div>
              </Card>

              <Button variant="danger" size="lg" leftIcon={<X className="w-5 h-5" />} onClick={clearAllFilters} className="w-full">
                Reset All Filters
              </Button>
            </aside>
          )}

          {/* Job Grid */}
          <main className="flex-1 min-w-0">
            {/* AI Matches Header */}
            {activeTab === 'ai-matches' && profile && (
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Your Top AI Matches</h2>
                    <p className="text-sm text-gray-500">
                      Jobs ranked by how well they match your profile, skills, and preferences
                    </p>
                  </div>
                </div>
                
                {/* Match Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <Card className="bg-green-50 border-green-200">
                    <div className="flex items-center gap-3">
                      <Star className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold text-green-700">
                          {matchedJobs.filter(j => (j.matchScore?.overall || 0) >= 80).length}
                        </p>
                        <p className="text-sm text-green-600">Excellent Matches</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="bg-blue-50 border-blue-200">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold text-blue-700">
                          {matchedJobs.filter(j => (j.matchScore?.overall || 0) >= 60).length}
                        </p>
                        <p className="text-sm text-blue-600">Good Matches</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {displayedJobs.length === 0 ? (
              <EmptyState
                icon={<Briefcase className="w-20 h-20" />}
                title="No jobs found"
                description={activeTab === 'ai-matches' 
                  ? "Complete your profile to get AI-powered job matches"
                  : "Try adjusting your filters or timezone range"
                }
                action={{ label: 'Clear all filters', onClick: clearAllFilters }}
              />
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                {displayedJobs.map((job) => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    isSaved={savedJobs.has(job.id)}
                    onToggleSave={(e) => { e.stopPropagation(); toggleSave(job.id); }}
                    onClick={() => setSelectedJob(job)}
                    showMatch={hasProfile && (activeTab === 'ai-matches' || sortBy === 'match')}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Job Detail Modal */}
      <JobDetailModal 
        job={selectedJob} 
        isOpen={!!selectedJob} 
        onClose={() => setSelectedJob(null)} 
        isSaved={selectedJob ? savedJobs.has(selectedJob.id) : false}
        onToggleSave={() => selectedJob && toggleSave(selectedJob.id)}
        profile={profile}
      />

      {/* Profile Setup Modal */}
      <ProfileSetup
        isOpen={showProfileSetup}
        onClose={() => setShowProfileSetup(false)}
        onSave={handleProfileSave}
        existingProfile={profile}
        onRegister={register}
        onLogin={login}
      />

      {/* Save Search Modal */}
      <Modal
        isOpen={showSaveSearchModal}
        onClose={() => setShowSaveSearchModal(false)}
        title="Save Current Search"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowSaveSearchModal(false)}>Cancel</Button>
            <Button onClick={saveCurrentSearch} disabled={!newSearchName.trim()}>Save</Button>
          </>
        }
      >
        <Input
          placeholder="e.g., 'Australia Remote Design'"
          value={newSearchName}
          onChange={(e) => setNewSearchName(e.target.value)}
          autoFocus
        />
        <div className="mt-4 text-sm text-[var(--color-text-tertiary)]">
          <p>Saving with filters:</p>
          <ul className="mt-2 space-y-1">
            <li>• Regions: {selectedRegions.length} selected</li>
            <li>• Timezone: UTC{timezoneRange.min} to UTC{timezoneRange.max}</li>
            <li>• Work types: {remoteTypes.join(', ')}</li>
          </ul>
        </div>
      </Modal>
    </div>
  );
}

export default App;

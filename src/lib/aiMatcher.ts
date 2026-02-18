import type { JobListing, UserProfile, MatchScore, MatchedJob } from '../types';

// Design-specific skills for better matching
const DESIGN_SKILLS = [
  // Design tools
  'figma', 'sketch', 'adobe xd', 'adobe photoshop', 'adobe illustrator',
  'invision', 'principle', 'framer', 'proto.io', 'balsamiq',
  'after effects', 'premiere pro', 'cinema 4d', 'blender',
  'midjourney', 'dalle', 'dall-e', 'stable diffusion', 'runway',
  
  // Design disciplines
  'ui design', 'ux design', 'product design', 'visual design',
  'interaction design', 'motion design', 'graphic design', 'brand design',
  'web design', 'mobile design', 'responsive design', 'app design',
  'design systems', 'component library', 'design ops',
  
  // UX methods
  'user research', 'usability testing', 'user interviews', 'surveys',
  'wireframing', 'prototyping', 'mockups', 'user flows',
  'information architecture', 'ia', 'content strategy',
  'design thinking', 'service design', 'design sprint',
  'journey mapping', 'personas', 'competitive analysis',
  
  // Technical
  'html', 'css', 'javascript', 'typescript',
  'react', 'vue', 'angular', 'next.js', 'gatsby',
  'tailwind css', 'styled components', 'sass', 'less',
  'github', 'git', 'storybook',
  
  // Collaboration tools
  'jira', 'confluence', 'notion', 'linear', 'asana',
  'miro', 'figjam', ' mural', 'whimsical',
  'slack', 'discord', 'zoom',
  
  // Analytics
  'google analytics', 'mixpanel', 'amplitude', 'hotjar',
  'optimizely', 'vwo', 'user testing',
  
  // Soft skills
  'communication', 'collaboration', 'presentation', 'storytelling',
  'problem solving', 'critical thinking', 'empathy',
];

// Role categories for strict filtering
const DESIGN_ROLES = {
  exact: [
    'product designer', 'ux designer', 'ui designer', 'ux/ui designer', 'ui/ux designer',
    'visual designer', 'interaction designer', 'graphic designer', 'motion designer',
    'brand designer', 'web designer', 'digital designer',
  ],
  senior: [
    'senior product designer', 'senior ux designer', 'senior ui designer',
    'lead product designer', 'lead ux designer', 'lead ui designer',
    'staff product designer', 'staff ux designer', 'principal designer',
  ],
  management: [
    'design manager', 'head of design', 'design director', 'creative director',
    'vp of design', 'head of product design', 'director of design',
  ],
  specialist: [
    'ux researcher', 'user researcher', 'design researcher', 'design strategist',
    'design system', 'design ops', 'ux writer', 'content designer',
    'accessibility specialist', 'a11y',
  ],
  related: [
    'product design', 'ux design', 'ui design', 'user experience', 'user interface',
  ]
};

// Non-design roles to explicitly exclude
const EXCLUDED_ROLES = [
  'software engineer', 'software developer', 'full stack', 'fullstack', 'frontend developer',
  'backend developer', 'devops', 'data engineer', 'data scientist', 'product manager',
  'project manager', 'scrum master', 'agile coach', 'business analyst', 'qa engineer',
  'marketing manager', 'sales', 'account executive', 'customer success',
  'operations', 'hr', 'recruiter', 'talent acquisition',
];

// Experience level indicators
const EXPERIENCE_INDICATORS = {
  entry: ['junior', 'entry level', 'associate', 'graduate', 'intern', '0-1 years', '0-2 years', '1-2 years'],
  mid: ['mid level', 'mid-level', '2-3 years', '2-4 years', '3-5 years', 'intermediate'],
  senior: ['senior', 'sr.', '5+ years', '5-7 years', '5-8 years', '6+ years'],
  lead: ['lead', 'principal', 'architect', 'manager', 'director', 'head of', '8+ years', '10+ years', 'staff'],
  executive: ['vp', 'vice president', 'cto', 'ceo', 'chief', 'executive', 'director', 'head of']
};

export function extractSkills(text: string): string[] {
  const lowerText = text.toLowerCase();
  const foundSkills = new Set<string>();
  
  DESIGN_SKILLS.forEach(skill => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lowerText)) {
      // Normalize skill name
      const normalized = skill.split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      foundSkills.add(normalized);
    }
  });
  
  return Array.from(foundSkills);
}

export function isDesignRole(role: string): boolean {
  const roleLower = role.toLowerCase();
  
  // Check exclusions first
  for (const excluded of EXCLUDED_ROLES) {
    if (roleLower.includes(excluded)) {
      return false;
    }
  }
  
  // Check if it's a design role
  const allDesignRoles = [
    ...DESIGN_ROLES.exact,
    ...DESIGN_ROLES.senior,
    ...DESIGN_ROLES.management,
    ...DESIGN_ROLES.specialist,
  ];
  
  return allDesignRoles.some(designRole => roleLower.includes(designRole));
}

export function getRoleCategory(role: string): string {
  const roleLower = role.toLowerCase();
  
  for (const role of DESIGN_ROLES.management) {
    if (roleLower.includes(role)) return 'Management';
  }
  for (const role of DESIGN_ROLES.senior) {
    if (roleLower.includes(role)) return 'Senior';
  }
  for (const role of DESIGN_ROLES.specialist) {
    if (roleLower.includes(role)) return 'Specialist';
  }
  for (const role of DESIGN_ROLES.exact) {
    if (roleLower.includes(role)) return 'Individual Contributor';
  }
  
  return 'Other';
}

export function detectExperienceLevel(text: string): { level: string; years: number } {
  const lowerText = text.toLowerCase();
  
  // Check for years of experience
  const yearMatches = lowerText.match(/(\d+)\+?\s*years?/g);
  let years = 0;
  if (yearMatches) {
    years = Math.max(...yearMatches.map(m => parseInt(m)));
  }
  
  // Detect level based on keywords
  for (const [level, indicators] of Object.entries(EXPERIENCE_INDICATORS)) {
    if (indicators.some(ind => lowerText.includes(ind))) {
      return { level, years };
    }
  }
  
  // Default based on years
  if (years >= 10) return { level: 'executive', years };
  if (years >= 8) return { level: 'lead', years };
  if (years >= 5) return { level: 'senior', years };
  if (years >= 2) return { level: 'mid', years };
  return { level: 'entry', years };
}

function calculateSkillMatch(job: JobListing, userSkills: string[]): { score: number; matched: string[]; missing: string[] } {
  const jobText = `${job.role} ${job.job_description_summary || ''}`.toLowerCase();
  const jobSkills = extractSkills(jobText);
  
  if (jobSkills.length === 0) {
    return { score: 50, matched: [], missing: [] };
  }
  
  const matched = jobSkills.filter(skill => 
    userSkills.some(userSkill => 
      skill.toLowerCase().includes(userSkill.toLowerCase()) || 
      userSkill.toLowerCase().includes(skill.toLowerCase())
    )
  );
  
  const missing = jobSkills.filter(skill => 
    !matched.some(m => m.toLowerCase() === skill.toLowerCase())
  );
  
  const matchRatio = jobSkills.length > 0 ? matched.length / jobSkills.length : 0;
  const score = Math.min(100, Math.round(matchRatio * 100));
  
  return { score, matched, missing };
}

function calculateRoleMatch(job: JobListing, preferredRoles: string[]): number {
  if (!preferredRoles || preferredRoles.length === 0) {
    return 70; // Neutral score if no preferences set
  }
  
  const jobRole = job.role.toLowerCase();
  let bestMatch = 0;
  
  for (const preferred of preferredRoles) {
    const preferredLower = preferred.toLowerCase();
    
    // Exact match
    if (jobRole === preferredLower) {
      return 100;
    }
    
    // Contains match
    if (jobRole.includes(preferredLower) || preferredLower.includes(jobRole)) {
      bestMatch = Math.max(bestMatch, 90);
    }
    
    // Partial word match
    const jobWords = jobRole.split(/\s+/);
    const prefWords = preferredLower.split(/\s+/);
    const commonWords = jobWords.filter(w => prefWords.includes(w) && w.length > 2);
    
    if (commonWords.length > 0) {
      const partialScore = Math.min(100, commonWords.length * 30);
      bestMatch = Math.max(bestMatch, partialScore);
    }
  }
  
  return bestMatch || 30; // Minimum 30 if it's a design role
}

function calculateExperienceMatch(job: JobListing, userLevel: string, userYears: number): number {
  const jobText = `${job.role} ${job.job_description_summary || ''}`.toLowerCase();
  const { level: jobLevel, years: jobYears } = detectExperienceLevel(jobText);
  
  const levelScores: Record<string, number> = { entry: 1, mid: 2, senior: 3, lead: 4, executive: 5 };
  const userLevelScore = levelScores[userLevel] || 2;
  const jobLevelScore = levelScores[jobLevel] || 2;
  
  // Calculate level match
  const levelDiff = Math.abs(userLevelScore - jobLevelScore);
  let levelMatch = Math.max(0, 100 - levelDiff * 25);
  
  // Boost score if user exceeds requirements
  if (userYears >= (jobYears || 0) * 1.5) {
    levelMatch = Math.min(100, levelMatch + 15);
  }
  
  // Slight penalty if job requires significantly more experience
  if (jobYears > userYears * 1.5) {
    levelMatch = Math.max(0, levelMatch - 20);
  }
  
  return Math.round(levelMatch);
}

function calculateLocationMatch(job: JobListing, userLocation: string, workStyle: string): { score: number; priority: number } {
  const jobLocation = job.location.toLowerCase();
  const userLoc = userLocation.toLowerCase();
  
  // Location priority scores (higher = more relevant for AU designers)
  const locationPriorities: Record<string, number> = {
    'sydney': 10, 'melbourne': 10, 'brisbane': 9, 'perth': 9, 'adelaide': 9, 'canberra': 9,
    'australia': 8, 'au': 8,
    'auckland': 8, 'wellington': 8, 'new zealand': 8, 'nz': 8,
    'singapore': 7, 'sg': 7,
    'tokyo': 6, 'japan': 6, 'osaka': 6,
    'hong kong': 6, 'hk': 6,
    'remote': 5, 'anywhere': 5, 'worldwide': 5,
  };
  
  let priority = 1;
  for (const [loc, p] of Object.entries(locationPriorities)) {
    if (jobLocation.includes(loc)) {
      priority = Math.max(priority, p);
    }
  }
  
  // Remote jobs are always a good match
  if (job.remote_status === 'Remote') {
    const remoteScore = workStyle === 'remote' || workStyle === 'flexible' ? 100 : 85;
    return { score: remoteScore, priority };
  }
  
  // Check for exact location match
  const locationMatch = jobLocation.includes(userLoc) || 
    userLoc.split(',').some(part => jobLocation.includes(part.trim()));
  
  if (locationMatch) {
    return { score: 100, priority };
  }
  
  // Same country/region match
  const countries = ['australia', 'new zealand', 'singapore', 'japan'];
  const userCountry = countries.find(c => userLoc.includes(c));
  const jobCountry = countries.find(c => jobLocation.includes(c));
  
  if (userCountry && jobCountry && userCountry === jobCountry) {
    return { score: 90, priority };
  }
  
  // Timezone match for hybrid/remote-flexible
  if (workStyle === 'hybrid' || workStyle === 'flexible') {
    return { score: job.remote_status === 'Hybrid' ? 75 : 50, priority };
  }
  
  return { score: workStyle === 'onsite' ? 20 : 40, priority };
}

function calculateSalaryMatch(job: JobListing, userExpectation?: number): number {
  if (!userExpectation || !job.salary_range || job.salary_range === 'Not disclosed') {
    return 70; // Neutral score
  }
  
  // Extract salary from range string
  const salaryMatch = job.salary_range.match(/\$?([\d,]+)/g);
  if (!salaryMatch) return 70;
  
  const salaries = salaryMatch.map(s => parseInt(s.replace(/,/g, '')));
  const minSalary = Math.min(...salaries);
  
  if (minSalary >= userExpectation) {
    return 100;
  } else if (minSalary >= userExpectation * 0.8) {
    return 80;
  } else if (minSalary >= userExpectation * 0.6) {
    return 50;
  }
  
  return 30;
}

function calculateIndustryMatch(job: JobListing, preferredIndustries: string[]): number {
  if (!preferredIndustries || preferredIndustries.length === 0) {
    return 70;
  }
  
  const jobIndustry = (job.industry || '').toLowerCase();
  
  for (const industry of preferredIndustries) {
    if (jobIndustry.includes(industry.toLowerCase())) {
      return 100;
    }
  }
  
  return 60;
}

export function calculateJobMatch(job: JobListing, userProfile: UserProfile): MatchScore {
  // Filter out non-design roles entirely
  if (!isDesignRole(job.role)) {
    return {
      overall: 0,
      skills: 0,
      experience: 0,
      location: 0,
      salary: 0,
      culture: 0,
      reasons: ['Not a design role']
    };
  }
  
  const skillMatch = calculateSkillMatch(job, userProfile.extractedSkills);
  const roleMatch = calculateRoleMatch(job, userProfile.preferredRoles);
  const experienceMatch = calculateExperienceMatch(job, userProfile.experienceLevel, userProfile.yearsOfExperience);
  const locationResult = calculateLocationMatch(job, userProfile.location, userProfile.workStyle);
  const salaryMatch = calculateSalaryMatch(job, userProfile.salaryExpectation);
  const industryMatch = calculateIndustryMatch(job, userProfile.preferredIndustries);
  
  // Weight the scores - prioritize role match and skills
  const weights = {
    role: 0.30,
    skills: 0.25,
    experience: 0.15,
    location: 0.15,
    salary: 0.10,
    industry: 0.05
  };
  
  const overall = Math.round(
    roleMatch * weights.role +
    skillMatch.score * weights.skills +
    experienceMatch * weights.experience +
    locationResult.score * weights.location +
    salaryMatch * weights.salary +
    industryMatch * weights.industry
  );
  
  // Generate reasons
  const reasons: string[] = [];
  
  if (roleMatch >= 80) {
    reasons.push('Perfect role match');
  } else if (roleMatch >= 60) {
    reasons.push('Good role alignment');
  }
  
  if (skillMatch.score >= 80) {
    reasons.push(`Strong skills match (${skillMatch.matched.slice(0, 2).join(', ')})`);
  } else if (skillMatch.score >= 50) {
    reasons.push('Relevant skills');
  }
  
  if (locationResult.score >= 90) {
    reasons.push(job.remote_status === 'Remote' ? 'Fully remote' : 'Great location match');
  }
  
  if (experienceMatch >= 80) {
    reasons.push('Experience level aligns');
  }
  
  if (salaryMatch >= 80) {
    reasons.push('Salary meets expectations');
  }
  
  if (industryMatch >= 80) {
    reasons.push('Preferred industry');
  }
  
  return {
    overall,
    skills: skillMatch.score,
    experience: experienceMatch,
    location: locationResult.score,
    salary: salaryMatch,
    culture: industryMatch,
    reasons: reasons.length > 0 ? reasons : ['Design role match']
  };
}

export function generateMatchExplanation(job: JobListing, userProfile: UserProfile, matchScore: MatchScore): string {
  const explanations: string[] = [];
  
  if (matchScore.overall >= 85) {
    explanations.push('Excellent match for your profile!');
  } else if (matchScore.overall >= 70) {
    explanations.push('Strong match with your experience.');
  } else if (matchScore.overall >= 55) {
    explanations.push('Good potential match with some transferable skills.');
  } else {
    explanations.push('Review if this aligns with your career goals.');
  }
  
  // Add specific details
  if (matchScore.skills >= 70) {
    const jobText = `${job.role} ${job.job_description_summary || ''}`.toLowerCase();
    const jobSkills = extractSkills(jobText);
    const matchedSkills = jobSkills.filter(skill => 
      userProfile.extractedSkills.some(userSkill => 
        skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );
    
    if (matchedSkills.length > 0) {
      explanations.push(`You have ${matchedSkills.length} matching skills.`);
    }
  }
  
  if (job.remote_status === 'Remote' && userProfile.workStyle === 'remote') {
    explanations.push('Fully remote position matches your preference.');
  }
  
  return explanations.join(' ');
}

export function rankJobs(jobs: JobListing[], userProfile: UserProfile): MatchedJob[] {
  const matched = jobs.map(job => {
    const matchScore = calculateJobMatch(job, userProfile);
    const jobText = `${job.role} ${job.job_description_summary || ''}`.toLowerCase();
    const jobSkills = extractSkills(jobText);
    
    const matchedSkills = jobSkills.filter(skill => 
      userProfile.extractedSkills.some(userSkill => 
        skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );
    
    const missingSkills = jobSkills.filter(skill => 
      !matchedSkills.some(m => m.toLowerCase() === skill.toLowerCase())
    );
    
    return {
      ...job,
      matchScore,
      matchedSkills,
      missingSkills,
      recommendationReason: generateMatchExplanation(job, userProfile, matchScore)
    };
  });
  
  // Filter out non-design roles (match score of 0)
  const designJobs = matched.filter(job => job.matchScore.overall > 0);
  
  // Sort by match score descending
  return designJobs.sort((a, b) => b.matchScore.overall - a.matchScore.overall);
}

// Get filter suggestions based on user profile
export function getFilterSuggestions(profile: UserProfile): {
  recommendedRoles: string[];
  recommendedSkills: string[];
  recommendedLocations: string[];
} {
  const recommendedRoles = profile.preferredRoles.length > 0 
    ? profile.preferredRoles 
    : ['Product Designer', 'UX Designer', 'UI Designer'];
  
  const recommendedSkills = profile.extractedSkills.slice(0, 10);
  
  const userLocation = profile.location.toLowerCase();
  const recommendedLocations = ['Australia', 'New Zealand', 'Singapore', 'Remote'];
  
  // Prioritize user's location
  if (userLocation.includes('sydney')) {
    recommendedLocations.unshift('Sydney');
  } else if (userLocation.includes('melbourne')) {
    recommendedLocations.unshift('Melbourne');
  }
  
  return {
    recommendedRoles,
    recommendedSkills,
    recommendedLocations
  };
}

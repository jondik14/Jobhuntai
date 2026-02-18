import type { JobListing, UserProfile } from '../types';

interface CoverLetterTemplate {
  name: string;
  style: 'professional' | 'casual' | 'enthusiastic';
  template: (data: TemplateData) => string;
}

interface TemplateData {
  userName: string;
  userTitle: string;
  company: string;
  role: string;
  skills: string[];
  experience: string;
  whyFit: string;
  companyMission?: string;
}

interface EmailTemplate {
  subject: (data: TemplateData & { hiringManager?: string }) => string;
  body: (data: TemplateData & { hiringManager?: string }) => string;
}

// Cover letter templates
const COVER_LETTER_TEMPLATES: CoverLetterTemplate[] = [
  {
    name: 'Professional',
    style: 'professional',
    template: (data) => `Dear Hiring Manager,

I am writing to express my strong interest in the ${data.role} position at ${data.company}. With ${data.experience} of experience in ${data.userTitle.toLowerCase()}, I am excited about the opportunity to contribute to your team.

Throughout my career, I have developed expertise in ${data.skills.slice(0, 4).join(', ')}, and more. ${data.whyFit}

What draws me to ${data.company} is ${data.companyMission || 'your commitment to building exceptional products that make a real difference in users\' lives'}. I am particularly impressed by your recent work and would love to contribute my skills in ${data.skills.slice(0, 2).join(' and ')} to help drive continued success.

I would welcome the opportunity to discuss how my background in ${data.userTitle.toLowerCase()} and passion for creating exceptional user experiences can benefit your team. Thank you for considering my application.

Sincerely,
${data.userName}`
  },
  {
    name: 'Enthusiastic',
    style: 'enthusiastic',
    template: (data) => `Hi there!

I'm thrilled to apply for the ${data.role} role at ${data.company}! As a ${data.userTitle.toLowerCase()} with ${data.experience}, I've been following ${data.company}'s work for a while and have been consistently impressed by your innovative approach.

${data.whyFit}

My toolkit includes ${data.skills.slice(0, 5).join(', ')}, and I'm always eager to learn new technologies and methodologies. What excites me most about this opportunity is ${data.companyMission || 'the chance to work on products that genuinely impact how people interact with technology'}.

I'd love the chance to chat about how my passion for design and my experience with ${data.skills.slice(0, 3).join(', ')} could contribute to your team's upcoming projects.

Looking forward to hearing from you!

Best,
${data.userName}`
  },
  {
    name: 'Concise',
    style: 'professional',
    template: (data) => `Dear Hiring Manager,

I'm applying for the ${data.role} position at ${data.company}. With ${data.experience} in ${data.userTitle.toLowerCase()}, I bring expertise in ${data.skills.slice(0, 3).join(', ')}.

${data.whyFit}

I'm drawn to ${data.company} because of ${data.companyMission || 'your reputation for design excellence'}. I'm confident my skills in ${data.skills[0] || 'design'} would add value to your team.

I'd welcome an interview to discuss this opportunity further.

Regards,
${data.userName}`
  }
];

// Email templates
const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  initial: {
    subject: (data) => `Application: ${data.role} - ${data.userName}`,
    body: (data) => `Dear ${data.hiringManager || 'Hiring Manager'},

I hope this email finds you well. I recently came across the ${data.role} position at ${data.company} and wanted to reach out directly to express my interest.

With ${data.experience} as a ${data.userTitle.toLowerCase()}, I've developed strong skills in ${data.skills.slice(0, 3).join(', ')}. ${data.whyFit}

I've attached my resume and portfolio for your review. I would love the opportunity to discuss how my background aligns with your team's needs.

Thank you for your time and consideration.

Best regards,
${data.userName}`
  },
  followUp: {
    subject: (data) => `Following up: ${data.role} Application`,
    body: (data) => `Dear ${data.hiringManager || 'Hiring Manager'},

I hope you're doing well. I wanted to follow up on my application for the ${data.role} position at ${data.company} that I submitted recently.

I'm very excited about the opportunity to bring my experience in ${data.skills.slice(0, 2).join(' and ')} to your team. I understand you likely have many applications to review, but I wanted to reiterate my strong interest in this role.

Please let me know if you need any additional information from me. I'd be happy to provide work samples, references, or anything else that might be helpful.

Thank you again for your consideration.

Best,
${data.userName}`
  },
  linkedin: {
    subject: (data) => `${data.role} at ${data.company}`,
    body: (data) => `Hi ${data.hiringManager || 'there'},

I came across the ${data.role} opening at ${data.company} and was immediately drawn to the opportunity. With ${data.experience} in ${data.userTitle.toLowerCase()}, I believe I could make a meaningful contribution to your team.

My background includes:
• ${data.skills.slice(0, 3).join('\n• ')}

${data.whyFit.substring(0, 150)}...

I'd love to connect and learn more about the role. Would you be open to a brief conversation?

Thanks,
${data.userName}`
  }
};

// Generate why fit text based on job and profile
function generateWhyFit(job: JobListing, profile: UserProfile): string {
  const jobSkills = job.skills || [];
  const userSkills = profile.extractedSkills || [];
  const matchedSkills = jobSkills.filter(skill => 
    userSkills.some(us => us.toLowerCase().includes(skill.toLowerCase()) || 
    skill.toLowerCase().includes(us.toLowerCase()))
  );

  const experiences = [
    `I have extensive experience with ${matchedSkills.slice(0, 2).join(' and ')}, which aligns perfectly with the requirements outlined in your job description.`,
    `My background has given me hands-on experience with ${matchedSkills.slice(0, 2).join(' and ')}, skills that are directly transferable to this role.`,
    `I've successfully leveraged ${matchedSkills.slice(0, 2).join(' and ')} in previous roles to deliver exceptional results, and I'm eager to bring this expertise to ${job.company}.`,
  ];

  return experiences[Math.floor(Math.random() * experiences.length)] || 
    `My skills in ${userSkills.slice(0, 2).join(' and ')} make me well-suited for this position.`;
}

// Generate company mission text
function generateCompanyMission(job: JobListing): string {
  const missions: Record<string, string> = {
    'figma': 'your mission to make design accessible to all and your innovative approach to collaborative design tools',
    'stripe': 'your commitment to simplifying online payments and empowering businesses of all sizes',
    'notion': 'your vision of creating a connected workspace that brings together notes, docs, and wikis',
    'linear': 'your focus on building exceptional tools that help teams ship better products faster',
    'vercel': 'your dedication to making the web faster and more accessible for developers everywhere',
    'anthropic': 'your commitment to developing AI systems that are safe, beneficial, and understandable',
    'airbnb': 'your mission to create a world where anyone can belong anywhere',
    'shopify': 'your goal of making commerce better for everyone',
    'duolingo': 'your mission to make education free and accessible to everyone in the world',
  };

  const companyLower = job.company.toLowerCase();
  for (const [company, mission] of Object.entries(missions)) {
    if (companyLower.includes(company)) {
      return mission;
    }
  }

  return `your company's innovative approach and commitment to excellence in ${job.industry || 'the industry'}`;
}

// Get user's professional title
function getUserTitle(profile: UserProfile): string {
  if (profile.preferredRoles && profile.preferredRoles.length > 0) {
    return profile.preferredRoles[0];
  }
  if (profile.extractedSkills.some(s => s.toLowerCase().includes('product'))) {
    return 'Product Designer';
  }
  if (profile.extractedSkills.some(s => s.toLowerCase().includes('ux'))) {
    return 'UX Designer';
  }
  return 'Designer';
}

// Get experience text
function getExperienceText(profile: UserProfile): string {
  const years = profile.yearsOfExperience;
  if (years === 0) return 'several years';
  if (years === 1) return '1 year';
  return `${years}+ years`;
}

export interface GeneratedApplication {
  coverLetter: {
    text: string;
    templateName: string;
  };
  emails: Array<{
    type: string;
    subject: string;
    body: string;
  }>;
  tips: string[];
}

export function generateApplicationDocs(
  job: JobListing, 
  profile: UserProfile,
  options: {
    coverLetterStyle?: 'professional' | 'casual' | 'enthusiastic';
    hiringManagerName?: string;
  } = {}
): GeneratedApplication {
  const templateData: TemplateData = {
    userName: profile.fullName,
    userTitle: getUserTitle(profile),
    company: job.company,
    role: job.role,
    skills: profile.extractedSkills.slice(0, 8),
    experience: getExperienceText(profile),
    whyFit: generateWhyFit(job, profile),
    companyMission: generateCompanyMission(job)
  };

  // Select cover letter template
  const template = COVER_LETTER_TEMPLATES.find(t => t.style === options.coverLetterStyle) || 
                   COVER_LETTER_TEMPLATES[0];

  // Generate emails
  const emails = Object.entries(EMAIL_TEMPLATES).map(([type, tmpl]) => ({
    type,
    subject: tmpl.subject(templateData),
    body: tmpl.body({ ...templateData, hiringManager: options.hiringManagerName })
  }));

  // Generate application tips
  const tips = generateTips(job, profile);

  return {
    coverLetter: {
      text: template.template(templateData),
      templateName: template.name
    },
    emails,
    tips
  };
}

function generateTips(job: JobListing, profile: UserProfile): string[] {
  const tips: string[] = [];
  
  const jobSkills = job.skills || [];
  const userSkills = profile.extractedSkills || [];
  const missingSkills = jobSkills.filter(skill => 
    !userSkills.some(us => us.toLowerCase().includes(skill.toLowerCase()))
  );

  if (missingSkills.length > 0) {
    tips.push(`💡 Consider highlighting any experience with ${missingSkills.slice(0, 2).join(' or ')} if you've used similar tools.`);
  }

  if (job.remote_status === 'Remote') {
    tips.push('💡 For remote roles, emphasize your experience with async communication and self-directed work.');
  }

  if (profile.portfolioUrl) {
    tips.push('💡 Include a link to relevant case studies in your portfolio that demonstrate similar work.');
  }

  tips.push(`💡 Research ${job.company}'s recent product launches and mention one that genuinely interests you.`);
  tips.push('💡 Keep your cover letter under 400 words - hiring managers appreciate conciseness.');

  return tips;
}

// Export templates for customization
export { COVER_LETTER_TEMPLATES, EMAIL_TEMPLATES };

import { useState, useEffect } from 'react';

interface CompanyLogoProps {
  company: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-14 h-14 text-xl',
  lg: 'w-16 h-16 text-2xl'
};

// Major company domains for logo lookup
const COMPANY_DOMAINS: Record<string, string> = {
  // Tech Giants
  'google': 'google.com',
  'microsoft': 'microsoft.com',
  'apple': 'apple.com',
  'amazon': 'amazon.com',
  'meta': 'meta.com',
  'facebook': 'facebook.com',
  'netflix': 'netflix.com',
  'twitter': 'twitter.com',
  'x': 'x.com',
  'linkedin': 'linkedin.com',
  
  // Design/Tech Companies
  'figma': 'figma.com',
  'sketch': 'sketch.com',
  'notion': 'notion.so',
  'linear': 'linear.app',
  'vercel': 'vercel.com',
  'framer': 'framer.com',
  'webflow': 'webflow.com',
  'canva': 'canva.com',
  'invision': 'invisionapp.com',
  'adobe': 'adobe.com',
  'shopify': 'shopify.com',
  'stripe': 'stripe.com',
  'airbnb': 'airbnb.com',
  'pinterest': 'pinterest.com',
  'reddit': 'reddit.com',
  'discord': 'discord.com',
  'slack': 'slack.com',
  'github': 'github.com',
  'gitlab': 'gitlab.com',
  'atlassian': 'atlassian.com',
  'dropbox': 'dropbox.com',
  'spotify': 'spotify.com',
  'uber': 'uber.com',
  'lyft': 'lyft.com',
  'airtable': 'airtable.com',
  'miro': 'miro.com',
  'loom': 'loom.com',
  'figjam': 'figma.com',
  
  // Australian Companies
  'atlassian au': 'atlassian.com',
  'canva au': 'canva.com',
  'culture amp': 'cultureamp.com',
  'safetyculture': 'safetyculture.com',
  'deputy': 'deputy.com',
  'employment hero': 'employmenthero.com',
  'airwallex': 'airwallex.com',
  'afterpay': 'afterpay.com',
  'zip co': 'zip.co',
  '99designs': '99designs.com',
  'redbubble': 'redbubble.com',
  'envato': 'envato.com',
  'dovetail': 'dovetail.com',
  'eucalyptus': 'eucalyptus.io',
  'hotdoc': 'hotdoc.com.au',
  'kin fertility': 'kinfertility.com.au',
  'mryum': 'mryum.com',
  'airtasker': 'airtasker.com',
  'kogan': 'kogan.com',
  'temple & webster': 'templeandwebster.com.au',
  'pet circle': 'petcircle.com.au',
  'linktree': 'linktree.com',
  'mr yum': 'mryum.com',
  'rokt': 'rokt.com',
  
  // AI Companies
  'anthropic': 'anthropic.com',
  'openai': 'openai.com',
  'midjourney': 'midjourney.com',
  
  // Fintech
  'plaid': 'plaid.com',
  'brex': 'brex.com',
  'mercury': 'mercury.com',
  'square': 'squareup.com',
  
  // Education
  'khan academy': 'khanacademy.org',
  'duolingo': 'duolingo.com',
  'coursera': 'coursera.org',
  
  // Other notable
  'twilio': 'twilio.com',
  'segment': 'segment.com',
  'zendesk': 'zendesk.com',
  'hubspot': 'hubspot.com',
  'salesforce': 'salesforce.com',
  'zapier': 'zapier.com',
};

// Gradient colors for fallback
const GRADIENTS = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-orange-500 to-red-500',
  'from-green-500 to-emerald-500',
  'from-indigo-500 to-violet-500',
  'from-rose-500 to-orange-500',
  'from-teal-500 to-cyan-500',
  'from-fuchsia-500 to-purple-500',
  'from-amber-500 to-yellow-500',
  'from-lime-500 to-green-500',
  'from-sky-500 to-blue-500',
  'from-violet-500 to-indigo-500',
];

function getCompanyDomain(company: string): string | null {
  const lowerCompany = company.toLowerCase();
  
  // Direct lookup
  if (COMPANY_DOMAINS[lowerCompany]) {
    return COMPANY_DOMAINS[lowerCompany];
  }
  
  // Partial match
  for (const [name, domain] of Object.entries(COMPANY_DOMAINS)) {
    if (lowerCompany.includes(name) || name.includes(lowerCompany)) {
      return domain;
    }
  }
  
  // Try to guess from company name (e.g., "Acme Corp" -> "acmecorp.com")
  const cleanName = company.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/(inc|llc|ltd|corp|corporation|company|co)$/i, '');
  
  if (cleanName.length > 2) {
    return `${cleanName}.com`;
  }
  
  return null;
}

function getInitials(company: string): string {
  return company
    .split(/\s+/)
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getGradientForCompany(company: string): string {
  let hash = 0;
  for (let i = 0; i < company.length; i++) {
    hash = company.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
}

export function CompanyLogo({ company, size = 'md', className = '' }: CompanyLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const domain = getCompanyDomain(company);
    if (domain) {
      // Try Clearbit Logo API
      const url = `https://logo.clearbit.com/${domain}?size=256`;
      setLogoUrl(url);
    } else {
      setError(true);
      setLoading(false);
    }
  }, [company]);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  const sizeClass = SIZE_CLASSES[size];
  const initials = getInitials(company);
  const gradient = getGradientForCompany(company);

  // If logo failed to load, show gradient fallback
  if (error) {
    return (
      <div 
        className={`${sizeClass} ${className} bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white font-bold shadow-md`}
        title={company}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className={`relative ${sizeClass} ${className}`}>
      {/* Loading state */}
      {loading && (
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white font-bold shadow-md animate-pulse`}
        >
          {initials}
        </div>
      )}
      
      {/* Logo image */}
      {logoUrl && (
        <img
          src={logoUrl}
          alt={`${company} logo`}
          className={`w-full h-full object-contain rounded-xl bg-white shadow-md p-1 transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}

// Smaller inline version for lists
export function CompanyLogoSmall({ company }: { company: string }) {
  const domain = getCompanyDomain(company);
  const gradient = getGradientForCompany(company);
  const [hasError, setHasError] = useState(!domain);

  if (hasError) {
    return (
      <div 
        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold`}
      >
        {company.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={`https://logo.clearbit.com/${domain}?size=64`}
      alt={company}
      className="w-8 h-8 rounded-lg object-contain bg-white shadow-sm p-0.5"
      onError={() => setHasError(true)}
    />
  );
}

export default CompanyLogo;

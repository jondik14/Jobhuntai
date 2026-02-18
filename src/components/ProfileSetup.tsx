import { useState, useRef } from 'react';
import { 
  Upload, User, Mail, MapPin, Linkedin, Github, 
  Globe, Link2, Briefcase, DollarSign, X, Check, Loader2,
  Sparkles, ChevronRight, Building2, Award, Lock,
  Eye, EyeOff, LogIn, UserPlus
} from 'lucide-react';
import type { UserProfile } from '../types';
import { Button, Card, Badge, Input, Modal } from './ui';
import { parseResumeFile, extractEmail, extractLinkedInUrl, extractName } from '../lib/pdfParser';

interface ProfileSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: Partial<UserProfile>) => void;
  existingProfile?: UserProfile | null;
  onRegister?: (email: string, password: string, profile: Partial<UserProfile>) => Promise<boolean>;
  onLogin?: (email: string, password: string) => Promise<boolean>;
}

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level', description: '0-2 years', icon: '🌱' },
  { value: 'mid', label: 'Mid Level', description: '2-5 years', icon: '🚀' },
  { value: 'senior', label: 'Senior', description: '5-8 years', icon: '⭐' },
  { value: 'lead', label: 'Lead / Principal', description: '8+ years', icon: '👑' },
  { value: 'executive', label: 'Executive', description: '10+ years', icon: '💼' }
];

const WORK_STYLES = [
  { value: 'remote', label: 'Remote Only', icon: '🏠' },
  { value: 'hybrid', label: 'Hybrid', icon: '🏢🏠' },
  { value: 'onsite', label: 'In-Office', icon: '🏢' },
  { value: 'flexible', label: 'Flexible', icon: '🌐' }
];

const INDUSTRIES = [
  'SaaS', 'Fintech', 'Health Tech', 'E-commerce', 'AI/ML', 'EdTech',
  'Gaming', 'Social Media', 'Cybersecurity', 'Blockchain', 'IoT',
  'Clean Tech', 'AgTech', 'PropTech', 'Legal Tech', 'HR Tech'
];

const COMMON_ROLES = [
  'Product Designer', 'UX Designer', 'UI Designer', 'Product Manager',
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Scientist', 'Data Engineer', 'DevOps Engineer', 'QA Engineer',
  'Marketing Manager', 'Sales Manager', 'Customer Success', 'Operations'
];

export function ProfileSetup({ isOpen, onClose, onSave, existingProfile, onRegister, onLogin }: ProfileSetupProps) {
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [resumeText, setResumeText] = useState(existingProfile?.resumeText || '');
  const [extractedSkills, setExtractedSkills] = useState<string[]>(existingProfile?.extractedSkills || []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Auth state
  const [authMode, setAuthMode] = useState<'none' | 'login' | 'register'>('none');
  const [email, setEmail] = useState(existingProfile?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [skipAuth, setSkipAuth] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    fullName: existingProfile?.fullName || '',
    email: existingProfile?.email || '',
    phone: existingProfile?.phone || '',
    location: existingProfile?.location || '',
    linkedinUrl: existingProfile?.linkedinUrl || '',
    githubUrl: existingProfile?.githubUrl || '',
    portfolioUrl: existingProfile?.portfolioUrl || '',
    twitterUrl: existingProfile?.twitterUrl || '',
    experienceLevel: existingProfile?.experienceLevel || 'mid',
    yearsOfExperience: existingProfile?.yearsOfExperience || 3,
    preferredRoles: existingProfile?.preferredRoles || [],
    preferredIndustries: existingProfile?.preferredIndustries || [],
    workStyle: existingProfile?.workStyle || 'flexible',
    salaryExpectation: existingProfile?.salaryExpectation
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { text } = await parseResumeFile(file);
      setResumeText(text);
      
      // Auto-extract info
      const extractedEmail = extractEmail(text);
      const linkedin = extractLinkedInUrl(text);
      const name = extractName(text);
      
      setFormData(prev => ({
        ...prev,
        ...(extractedEmail && { email: extractedEmail }),
        ...(linkedin && { linkedinUrl: linkedin }),
        ...(name && { fullName: name })
      }));
      
      if (extractedEmail && !email) {
        setEmail(extractedEmail);
      }

      // Extract skills
      const { extractSkills, detectExperienceLevel } = await import('../lib/aiMatcher');
      const skills = extractSkills(text);
      const { level, years } = detectExperienceLevel(text);
      
      setExtractedSkills(skills);
      setFormData(prev => ({
        ...prev,
        experienceLevel: level as UserProfile['experienceLevel'],
        yearsOfExperience: years
      }));

      setStep(2); // Move to next step
    } catch (error) {
      alert('Failed to parse resume. Please paste the text manually.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAuth = async () => {
    setAuthError('');
    setIsAuthLoading(true);
    
    try {
      if (authMode === 'register' && onRegister) {
        const success = await onRegister(email, password, {
          ...formData,
          resumeText,
          extractedSkills
        });
        
        if (success) {
          onSave({
            ...formData,
            email,
            resumeText,
            extractedSkills
          });
          onClose();
        } else {
          setAuthError('Email already registered or registration failed');
        }
      } else if (authMode === 'login' && onLogin) {
        const success = await onLogin(email, password);
        
        if (success) {
          onClose();
        } else {
          setAuthError('Invalid email or password');
        }
      } else {
        // Skip auth - save locally only
        onSave({
          ...formData,
          email,
          resumeText,
          extractedSkills
        });
        onClose();
      }
    } catch (e) {
      setAuthError('An error occurred. Please try again.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return resumeText.length > 100;
      case 2:
        return formData.fullName && email && formData.location;
      case 3:
        return formData.preferredRoles && formData.preferredRoles.length > 0;
      case 4:
        return true;
      case 5:
        if (authMode === 'none') return skipAuth;
        return email && password.length >= 6;
      default:
        return true;
    }
  };

  const updateField = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: 'preferredRoles' | 'preferredIndustries', item: string) => {
    setFormData(prev => {
      const current = prev[field] || [];
      const updated = current.includes(item)
        ? current.filter(i => i !== item)
        : [...current, item];
      return { ...prev, [field]: updated };
    });
  };

  const renderAuthStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Save Your Profile
        </h2>
        <p className="text-gray-500 text-sm">
          Create an account to access your profile from any device and get personalized job alerts.
        </p>
      </div>

      {authError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {authError}
        </div>
      )}

      {/* Auth Mode Selection */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setAuthMode('register')}
          className={`p-4 rounded-xl border-2 text-center transition-all ${
            authMode === 'register'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <UserPlus className="w-6 h-6 mx-auto mb-2 text-blue-600" />
          <span className="font-medium text-gray-900">Create Account</span>
        </button>
        <button
          onClick={() => setAuthMode('login')}
          className={`p-4 rounded-xl border-2 text-center transition-all ${
            authMode === 'login'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <LogIn className="w-6 h-6 mx-auto mb-2 text-green-600" />
          <span className="font-medium text-gray-900">Sign In</span>
        </button>
      </div>

      {/* Email & Password Fields */}
      {authMode !== 'none' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" /> Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-1" /> Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {authMode === 'register' && (
              <p className="text-xs text-gray-500 mt-1">Min 6 characters</p>
            )}
          </div>
        </div>
      )}

      {/* Skip Option */}
      <div className="pt-4 border-t">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={skipAuth}
            onChange={(e) => {
              setSkipAuth(e.target.checked);
              if (e.target.checked) setAuthMode('none');
            }}
            className="w-5 h-5 rounded border-gray-300 text-blue-600"
          />
          <span className="text-sm text-gray-600">
            Skip account creation (save locally only)
          </span>
        </label>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title=""
      footer={
        <div className="flex justify-between w-full">
          {step > 1 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-3">
            {step < 5 ? (
              <Button 
                onClick={() => setStep(step + 1)} 
                disabled={!canProceed()}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Continue
              </Button>
            ) : (
              <Button 
                onClick={handleAuth} 
                disabled={!canProceed() || isAuthLoading}
                isLoading={isAuthLoading}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                {authMode === 'login' ? 'Sign In' : authMode === 'register' ? 'Create Account' : 'Save Profile'}
              </Button>
            )}
          </div>
        </div>
      }
    >
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500">
            Step {step} of {onRegister ? 5 : 4}
          </span>
          <span className="text-sm font-medium text-blue-600">
            {step === 1 && 'Upload Resume'}
            {step === 2 && 'Basic Info'}
            {step === 3 && 'Preferences'}
            {step === 4 && 'Social Links'}
            {step === 5 && 'Save Profile'}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
            style={{ width: `${(step / (onRegister ? 5 : 4)) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Resume Upload */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Let's Build Your AI Profile
            </h2>
            <p className="text-gray-500">
              Upload your resume and our AI will extract your skills and experience to find your perfect job matches.
            </p>
          </div>

          {!resumeText ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                  <p className="text-gray-600 font-medium">Analyzing your resume...</p>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Upload your resume
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    PDF or TXT files supported
                  </p>
                  <Button variant="secondary" size="sm">
                    Select File
                  </Button>
                </>
              )}
            </div>
          ) : (
            <Card className="bg-green-50 border-green-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 mb-1">Resume Uploaded!</h3>
                  <p className="text-sm text-green-700 mb-3">
                    We found {extractedSkills.length} skills and detected {formData.yearsOfExperience} years of experience.
                  </p>
                  {extractedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {extractedSkills.slice(0, 8).map(skill => (
                        <Badge key={skill} variant="success" className="text-xs">{skill}</Badge>
                      ))}
                      {extractedSkills.length > 8 && (
                        <Badge variant="default" className="text-xs">+{extractedSkills.length - 8} more</Badge>
                      )}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setResumeText('')}
                  className="p-2 hover:bg-green-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-green-700" />
                </button>
              </div>
            </Card>
          )}

          {/* Manual text input fallback */}
          {!resumeText && (
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-3">Or paste your resume text</p>
              <textarea
                value={resumeText}
                onChange={(e) => {
                  setResumeText(e.target.value);
                  if (e.target.value.length > 200) {
                    import('../lib/aiMatcher').then(({ extractSkills, detectExperienceLevel }) => {
                      const skills = extractSkills(e.target.value);
                      const { level, years } = detectExperienceLevel(e.target.value);
                      setExtractedSkills(skills);
                      setFormData(prev => ({
                        ...prev,
                        experienceLevel: level as UserProfile['experienceLevel'],
                        yearsOfExperience: years
                      }));
                    });
                  }
                }}
                placeholder="Paste your resume content here..."
                className="w-full h-40 p-4 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>
      )}

      {/* Step 2: Basic Info */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Tell us about yourself</h2>
            <p className="text-gray-500 text-sm">This helps us personalize your job matches</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" /> Full Name
              </label>
              <Input
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" /> Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  updateField('email', e.target.value);
                }}
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" /> Location
              </label>
              <Input
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="Sydney, Australia"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone (optional)
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+61 400 000 000"
              />
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Award className="w-4 h-4 inline mr-1" /> Experience Level
            </label>
            <div className="grid grid-cols-2 gap-3">
              {EXPERIENCE_LEVELS.map(level => (
                <button
                  key={level.value}
                  onClick={() => updateField('experienceLevel', level.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    formData.experienceLevel === level.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl mb-1 block">{level.icon}</span>
                  <span className="font-medium text-gray-900 block">{level.label}</span>
                  <span className="text-sm text-gray-500">{level.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Work Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Briefcase className="w-4 h-4 inline mr-1" /> Preferred Work Style
            </label>
            <div className="grid grid-cols-4 gap-3">
              {WORK_STYLES.map(style => (
                <button
                  key={style.value}
                  onClick={() => updateField('workStyle', style.value)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    formData.workStyle === style.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl mb-1 block">{style.icon}</span>
                  <span className="text-sm font-medium text-gray-900">{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Salary Expectation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" /> Expected Salary (optional)
            </label>
            <Input
              type="number"
              value={formData.salaryExpectation || ''}
              onChange={(e) => updateField('salaryExpectation', parseInt(e.target.value) || undefined)}
              placeholder="e.g., 120000"
            />
          </div>
        </div>
      )}

      {/* Step 3: Preferences */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">What are you looking for?</h2>
            <p className="text-gray-500 text-sm">Select your target roles and industries</p>
          </div>

          {/* Preferred Roles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Briefcase className="w-4 h-4 inline mr-1" /> Target Roles
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_ROLES.map(role => (
                <button
                  key={role}
                  onClick={() => toggleArrayItem('preferredRoles', role)}
                  className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                    formData.preferredRoles?.includes(role)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {formData.preferredRoles?.includes(role) && <Check className="w-3 h-3 inline mr-1" />}
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Industries */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Building2 className="w-4 h-4 inline mr-1" /> Preferred Industries
            </label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map(industry => (
                <button
                  key={industry}
                  onClick={() => toggleArrayItem('preferredIndustries', industry)}
                  className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                    formData.preferredIndustries?.includes(industry)
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {formData.preferredIndustries?.includes(industry) && <Check className="w-3 h-3 inline mr-1" />}
                  {industry}
                </button>
              ))}
            </div>
          </div>

          {/* Skills Review */}
          {extractedSkills.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium text-gray-900 mb-2">Skills detected from your resume:</h4>
              <div className="flex flex-wrap gap-2">
                {extractedSkills.map(skill => (
                  <Badge key={skill} variant="primary">{skill}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Social Links */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Connect your profiles</h2>
            <p className="text-gray-500 text-sm">Add your social links for a complete profile (optional)</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Linkedin className="w-4 h-4 inline mr-1 text-blue-600" /> LinkedIn
              </label>
              <Input
                value={formData.linkedinUrl}
                onChange={(e) => updateField('linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Github className="w-4 h-4 inline mr-1" /> GitHub
              </label>
              <Input
                value={formData.githubUrl}
                onChange={(e) => updateField('githubUrl', e.target.value)}
                placeholder="https://github.com/yourusername"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4 inline mr-1 text-green-600" /> Portfolio Website
              </label>
              <Input
                value={formData.portfolioUrl}
                onChange={(e) => updateField('portfolioUrl', e.target.value)}
                placeholder="https://yourportfolio.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Link2 className="w-4 h-4 inline mr-1 text-blue-400" /> Twitter / X
              </label>
              <Input
                value={formData.twitterUrl}
                onChange={(e) => updateField('twitterUrl', e.target.value)}
                placeholder="https://twitter.com/yourusername"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Your AI Profile Summary
            </h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• {formData.fullName} — {EXPERIENCE_LEVELS.find(l => l.value === formData.experienceLevel)?.label}</li>
              <li>• {formData.yearsOfExperience} years experience</li>
              <li>• {extractedSkills.length} skills detected</li>
              <li>• Looking for: {formData.preferredRoles?.slice(0, 2).join(', ')}{formData.preferredRoles && formData.preferredRoles.length > 2 ? '...' : ''}</li>
              <li>• Work style: {WORK_STYLES.find(w => w.value === formData.workStyle)?.label}</li>
            </ul>
          </div>
        </div>
      )}

      {/* Step 5: Account / Save */}
      {step === 5 && onRegister && renderAuthStep()}
    </Modal>
  );
}

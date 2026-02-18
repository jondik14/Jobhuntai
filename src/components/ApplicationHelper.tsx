import { useState } from 'react';
import { 
  FileText, Mail, Copy, Check, Sparkles, 
  Lightbulb, Building2, Send, Edit3
} from 'lucide-react';
import type { GeneratedApplication } from '../lib/applicationHelper';
import type { JobListing, UserProfile } from '../types';
import { Button, Card, Badge, Modal } from './ui';
import { generateApplicationDocs } from '../lib/applicationHelper';

interface ApplicationHelperProps {
  job: JobListing;
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'cover-letter' | 'email' | 'tips';

export function ApplicationHelper({ job, profile, isOpen, onClose }: ApplicationHelperProps) {
  const [activeTab, setActiveTab] = useState<TabType>('cover-letter');
  const [generated, setGenerated] = useState<GeneratedApplication | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverStyle, setCoverStyle] = useState<'professional' | 'casual' | 'enthusiastic'>('professional');
  const [hiringManagerName, setHiringManagerName] = useState('');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [selectedEmailType, setSelectedEmailType] = useState('initial');

  const generateDocs = async () => {
    setIsGenerating(true);
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const docs = generateApplicationDocs(job, profile, {
      coverLetterStyle: coverStyle,
      hiringManagerName: hiringManagerName || undefined
    });
    
    setGenerated(docs);
    setIsGenerating(false);
  };

  const copyToClipboard = async (text: string, section: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const selectedEmail = generated?.emails.find(e => e.type === selectedEmailType);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="AI Application Assistant"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      {!generated ? (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Generate Application Materials
            </h3>
            <p className="text-gray-500">
              AI will create a personalized cover letter and emails based on your profile and this job.
            </p>
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{job.role}</p>
                <p className="text-gray-600">{job.company}</p>
                <p className="text-sm text-gray-500 mt-1">{job.location} • {job.remote_status}</p>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter Style
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'professional', label: 'Professional', icon: '💼' },
                  { value: 'enthusiastic', label: 'Enthusiastic', icon: '🚀' },
                  { value: 'casual', label: 'Concise', icon: '✨' }
                ].map((style) => (
                  <button
                    key={style.value}
                    onClick={() => setCoverStyle(style.value as any)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      coverStyle === style.value
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hiring Manager Name (optional)
              </label>
              <input
                type="text"
                value={hiringManagerName}
                onChange={(e) => setHiringManagerName(e.target.value)}
                placeholder="e.g., Sarah Johnson"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Check LinkedIn or the job posting to find the hiring manager's name
              </p>
            </div>
          </div>

          <Button
            onClick={generateDocs}
            isLoading={isGenerating}
            leftIcon={<Sparkles className="w-5 h-5" />}
            className="w-full"
            size="lg"
          >
            {isGenerating ? 'Generating...' : 'Generate Application Materials'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 border-b pb-4">
            <button
              onClick={() => setActiveTab('cover-letter')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === 'cover-letter'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              Cover Letter
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === 'email'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Mail className="w-4 h-4" />
              Email Templates
            </button>
            <button
              onClick={() => setActiveTab('tips')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === 'tips'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              Tips
            </button>
          </div>

          {/* Cover Letter Tab */}
          {activeTab === 'cover-letter' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">Cover Letter</h4>
                  <p className="text-sm text-gray-500">{generated.coverLetter.templateName} style</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copyToClipboard(generated.coverLetter.text, 'cover-letter')}
                  leftIcon={copiedSection === 'cover-letter' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                >
                  {copiedSection === 'cover-letter' ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              
              <div className="relative">
                <textarea
                  value={generated.coverLetter.text}
                  onChange={(e) => setGenerated({
                    ...generated,
                    coverLetter: { ...generated.coverLetter, text: e.target.value }
                  })}
                  className="w-full h-96 p-4 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm leading-relaxed resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Badge variant="default">{generated.coverLetter.text.split(' ').length} words</Badge>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setGenerated(null)}
                  leftIcon={<Edit3 className="w-4 h-4" />}
                >
                  Regenerate
                </Button>
                <Button
                  onClick={() => copyToClipboard(generated.coverLetter.text, 'cover-letter')}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Copy for Application
                </Button>
              </div>
            </div>
          )}

          {/* Email Tab */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                {[
                  { value: 'initial', label: 'Initial Application' },
                  { value: 'followUp', label: 'Follow Up' },
                  { value: 'linkedin', label: 'LinkedIn Message' }
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedEmailType(type.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedEmailType === type.value
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {selectedEmail && (
                <>
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <p className="text-sm font-medium text-purple-900 mb-1">Subject Line</p>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-purple-800">{selectedEmail.subject}</p>
                      <button
                        onClick={() => copyToClipboard(selectedEmail.subject, 'email-subject')}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        {copiedSection === 'email-subject' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">Email Body</h4>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => copyToClipboard(selectedEmail.body, 'email-body')}
                      leftIcon={copiedSection === 'email-body' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    >
                      {copiedSection === 'email-body' ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>

                  <textarea
                    value={selectedEmail.body}
                    onChange={(e) => {
                      const newBody = e.target.value;
                      const updatedEmails = generated.emails.map(email => 
                        email.type === selectedEmailType ? { ...email, body: newBody } : email
                      );
                      setGenerated({ ...generated, emails: updatedEmails });
                    }}
                    className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm leading-relaxed resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />

                  <p className="text-sm text-gray-500">
                    💡 Pro tip: Personalize the email by mentioning something specific about the company or team.
                  </p>
                </>
              )}
            </div>
          )}

          {/* Tips Tab */}
          {activeTab === 'tips' && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Application Tips</h4>
              <div className="space-y-3">
                {generated.tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">{tip}</p>
                  </div>
                ))}
              </div>

              <Card className="bg-green-50 border-green-200">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Before You Apply</p>
                    <ul className="mt-2 space-y-1 text-sm text-green-700">
                      <li>• Double-check your portfolio link works</li>
                      <li>• Update your LinkedIn to match your resume</li>
                      <li>• Research the company's recent news</li>
                      <li>• Tailor at least one sentence to the specific role</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

export default ApplicationHelper;

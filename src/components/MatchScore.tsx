import { useState } from 'react';
import { Sparkles, Check } from 'lucide-react';
import type { MatchScore as MatchScoreType } from '../types';

interface MatchScoreProps {
  score: MatchScoreType;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-500 bg-green-50 border-green-200';
  if (score >= 75) return 'text-blue-500 bg-blue-50 border-blue-200';
  if (score >= 60) return 'text-yellow-500 bg-yellow-50 border-yellow-200';
  return 'text-gray-500 bg-gray-50 border-gray-200';
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Great';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Low';
}

export function MatchScoreBadge({ score, size = 'md', showTooltip = true }: MatchScoreProps) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base'
  };

  const circumference = 2 * Math.PI * 16;
  const strokeDashoffset = circumference - (score.overall / 100) * circumference;

  return (
    <div 
      className="relative"
      onMouseEnter={() => showTooltip && setIsTooltipOpen(true)}
      onMouseLeave={() => setIsTooltipOpen(false)}
    >
      {/* Circular Progress */}
      <div className={`relative ${sizeClasses[size]} rounded-full flex items-center justify-center`}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          {/* Background circle */}
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="3"
          />
          {/* Progress circle */}
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-500 ${score.overall >= 90 ? 'text-green-500' : score.overall >= 75 ? 'text-blue-500' : score.overall >= 60 ? 'text-yellow-500' : 'text-gray-400'}`}
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-bold text-gray-900">{score.overall}</span>
        </div>
      </div>

      {/* Tooltip */}
      {isTooltipOpen && showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64">
          <div className="bg-gray-900 text-white rounded-xl p-4 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="font-semibold">{getScoreLabel(score.overall)} Match</span>
            </div>
            
            {/* Score breakdown */}
            <div className="space-y-2">
              <ScoreBar label="Skills" score={score.skills} color="bg-blue-500" />
              <ScoreBar label="Experience" score={score.experience} color="bg-purple-500" />
              <ScoreBar label="Location" score={score.location} color="bg-green-500" />
              <ScoreBar label="Salary" score={score.salary} color="bg-yellow-500" />
              <ScoreBar label="Culture" score={score.culture} color="bg-pink-500" />
            </div>

            {/* Reasons */}
            {score.reasons.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-xs text-gray-400 mb-1">Why this matches:</p>
                <ul className="text-xs space-y-1">
                  {score.reasons.slice(0, 3).map((reason, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <Check className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 w-16">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-medium w-8 text-right">{score}%</span>
    </div>
  );
}

interface MatchReasonsProps {
  reasons: string[];
  matchedSkills: string[];
  missingSkills: string[];
}

export function MatchReasons({ reasons, matchedSkills, missingSkills }: MatchReasonsProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-2">
      {/* Top reasons */}
      <div className="flex flex-wrap gap-2">
        {reasons.slice(0, 2).map((reason, i) => (
          <span 
            key={i}
            className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium"
          >
            <Check className="w-3 h-3" />
            {reason}
          </span>
        ))}
        {(matchedSkills.length > 0 || missingSkills.length > 0) && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            {showDetails ? 'Hide details' : `+${matchedSkills.length} skills match`}
          </button>
        )}
      </div>

      {/* Detailed skills breakdown */}
      {showDetails && (
        <div className="p-3 bg-gray-50 rounded-lg space-y-2 animate-in slide-in-from-top-2">
          {matchedSkills.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Matching skills:</p>
              <div className="flex flex-wrap gap-1">
                {matchedSkills.slice(0, 6).map(skill => (
                  <span key={skill} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {missingSkills.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Skills to develop:</p>
              <div className="flex flex-wrap gap-1">
                {missingSkills.slice(0, 4).map(skill => (
                  <span key={skill} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function RecommendationCard({ 
  recommendation, 
  score 
}: { 
  recommendation: string; 
  score: number;
}) {
  return (
    <div className={`p-3 rounded-lg border ${getScoreColor(score)}`}>
      <div className="flex items-start gap-2">
        <Sparkles className={`w-4 h-4 mt-0.5 flex-shrink-0 ${score >= 75 ? 'text-blue-500' : 'text-gray-400'}`} />
        <p className="text-sm text-gray-700">{recommendation}</p>
      </div>
    </div>
  );
}

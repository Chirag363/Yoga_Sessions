import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { sessionsAPI } from '../services/api';

interface SessionWithUser {
  _id: string;
  title: string;
  tags: string[];
  jsonUrl: string;
  content: any;
  isDraft: boolean;
  isPublished: boolean;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  lastAutoSave?: string;
}

const SessionView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentText, setContentText] = useState('{}');
  const [viewMode, setViewMode] = useState<'readable' | 'json'>('readable');

  const getJsonUrl = (jsonUrl: string) => {
    // If it's already a full URL, return as is
    if (jsonUrl.startsWith('http://') || jsonUrl.startsWith('https://')) {
      return jsonUrl;
    }
    // If it's a local filename, construct the API URL
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/json/${jsonUrl}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  useEffect(() => {
    const loadSession = async () => {
      if (!id) {
        toast.error('Session ID not provided');
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const sessionData = await sessionsAPI.getPublicSession(id);
        setSession(sessionData as unknown as SessionWithUser);
        setContentText(JSON.stringify(sessionData.content || {}, null, 2));
      } catch (error: any) {
        if (error.response?.status === 404) {
          toast.error('Session not found');
        } else {
          toast.error('Failed to load session');
        }
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [id, navigate]);

  const renderReadableContent = (content: any) => {
    if (!content || typeof content !== 'object') {
      return <p className="text-gray-600">No content available</p>;
    }

    return (
      <div className="space-y-6">
        {/* Description */}
        {content.description && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Description</h4>
            <p className="text-gray-600">{content.description}</p>
          </div>
        )}

        {/* Session Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {content.duration && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h5 className="font-medium text-blue-800 text-sm">Duration</h5>
              <p className="text-blue-600 font-semibold">{content.duration} minutes</p>
            </div>
          )}
          {content.difficulty && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h5 className="font-medium text-green-800 text-sm">Difficulty</h5>
              <p className="text-green-600 font-semibold capitalize">{content.difficulty}</p>
            </div>
          )}
          {content.exercises && content.exercises.length > 0 && (
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <h5 className="font-medium text-purple-800 text-sm">Exercises</h5>
              <p className="text-purple-600 font-semibold">{content.exercises.length} exercises</p>
            </div>
          )}
        </div>

        {/* Exercises */}
        {content.exercises && content.exercises.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-800 mb-4">Exercises</h4>
            <div className="space-y-4">
              {content.exercises.map((exercise: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                    <h5 className="font-medium text-gray-900 text-lg">
                      {index + 1}. {exercise.name || `Exercise ${index + 1}`}
                    </h5>
                    {exercise.duration && (
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full flex-shrink-0">
                        {exercise.duration}min
                      </span>
                    )}
                  </div>
                  {exercise.description && (
                    <p className="text-gray-600 text-sm">{exercise.description}</p>
                  )}
                  {exercise.instructions && exercise.instructions.length > 0 && (
                    <div className="mt-3">
                      <h6 className="text-sm font-medium text-gray-700 mb-1">Instructions:</h6>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {exercise.instructions.map((instruction: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-indigo-500 mr-2">•</span>
                            {instruction}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional content fields */}
        {Object.entries(content)
          .filter(([key]) => !['description', 'duration', 'difficulty', 'exercises'].includes(key))
          .map(([key, value]) => (
            <div key={key}>
              <h4 className="font-medium text-gray-800 mb-2 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </h4>
              <div className="text-gray-600">
                {typeof value === 'string' ? (
                  <p>{value}</p>
                ) : Array.isArray(value) ? (
                  <ul className="list-disc list-inside space-y-1">
                    {value.map((item, idx) => (
                      <li key={idx}>{typeof item === 'object' ? JSON.stringify(item) : item}</li>
                    ))}
                  </ul>
                ) : typeof value === 'object' ? (
                  <pre className="text-sm bg-gray-50 p-3 rounded overflow-x-auto">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                ) : (
                  <p>{String(value)}</p>
                )}
              </div>
            </div>
          ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container-responsive py-12">
        <div className="flex justify-center items-center">
          <div className="text-center">
            <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container-responsive py-12">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-gray-400 text-4xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Session not found</h2>
          <p className="text-gray-600 mb-6">The session you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Browse Sessions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-responsive py-6 sm:py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="btn-secondary mb-6 text-sm"
        >
          ← Back to Sessions
        </button>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {session.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600 mb-6">
            <span>By {session.userId?.name || 'Anonymous'}</span>
            <span className="hidden sm:inline">•</span>
            <span>Published {formatDate(session.createdAt)}</span>
          </div>

          {/* Tags */}
          {session.tags && session.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {session.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 text-sm font-medium rounded-full border border-primary-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* JSON URL */}
          {session.jsonUrl && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Session JSON File</h3>
              <a
                href={getJsonUrl(session.jsonUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary-600 hover:text-primary-800 text-sm font-medium"
              >
                📄 {session.jsonUrl}
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <p className="text-xs text-gray-500 mt-1">
                Click to download the session configuration as JSON
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Session Content</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('readable')}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                viewMode === 'readable'
                  ? 'bg-primary-600 text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📖 Readable View
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                viewMode === 'json'
                  ? 'bg-primary-600 text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🔧 JSON View
            </button>
          </div>
        </div>

        {viewMode === 'readable' ? (
          <div className="prose prose-gray max-w-none">
            {renderReadableContent(session.content)}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-4 overflow-x-auto">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap">
              {contentText}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionView;

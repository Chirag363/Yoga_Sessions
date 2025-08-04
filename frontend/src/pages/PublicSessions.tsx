import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';
import { Session, sessionsAPI } from '../services/api';

const PublicSessions: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [tagFilter, setTagFilter] = useState(searchParams.get('tags') || '');

  useEffect(() => {
    loadSessions();
  }, [tagFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadSessions = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 20 };
      if (tagFilter) {
        params.tags = tagFilter;
      }
      
      const response = await sessionsAPI.getPublicSessions(params);
      setSessions(response.sessions);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleTagFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagFilter(value);
    
    // Update URL params
    if (value) {
      setSearchParams({ tags: value });
    } else {
      setSearchParams({});
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="loading-spinner-lg w-16 h-16 text-green-500"></div>
            <div className="absolute inset-0 loading-spinner-lg w-16 h-16 text-emerald-500 animate-ping opacity-20"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Sessions</h2>
          <p className="text-gray-600">Discovering amazing wellness content for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl mb-8 shadow-xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-emerald-800 bg-clip-text text-transparent mb-6">
              Wellness Sessions
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover and explore public wellness sessions shared by our community. 
              Find guided meditations, mindfulness exercises, and wellness practices crafted by experts.
            </p>
          </div>

          {/* Enhanced Search Filter */}
          <div className="mb-12">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <label htmlFor="tag-filter" className="block text-lg font-semibold text-gray-800 mb-4 text-center">
                  <svg className="w-5 h-5 inline-block mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Find Sessions by Tags
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <input
                    id="tag-filter"
                    type="text"
                    value={tagFilter}
                    onChange={handleTagFilterChange}
                    placeholder="e.g., meditation, mindfulness, breathing, yoga"
                    className="input-field-elegant w-full pl-12 text-lg"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-3 text-center">
                  Enter multiple tags separated by commas to find specific types of sessions
                </p>
              </div>
            </div>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mb-8">
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">No Sessions Found</h3>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                {tagFilter 
                  ? 'No sessions match your current filters. Try adjusting your search terms or clear the filter to see all sessions.' 
                  : 'No public sessions are available yet. Check back soon for new content from our community.'}
              </p>
              {tagFilter && (
                <button
                  onClick={() => {
                    setTagFilter('');
                    setSearchParams({});
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {sessions.map((session) => (
                <div key={session._id} className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 hover:shadow-2xl hover:border-green-200/50 transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-green-800 transition-colors line-clamp-2">
                      {session.title}
                    </h3>
                    
                    {session.tags && session.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {session.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-block bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 text-xs px-3 py-1.5 rounded-full font-medium border border-green-200/50"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="bg-gray-50/50 rounded-lg p-3 mb-6">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="font-medium">{session.author?.username || 'Anonymous'}</span>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/sessions/${session._id}`}
                      className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg text-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <svg className="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Session
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicSessions;

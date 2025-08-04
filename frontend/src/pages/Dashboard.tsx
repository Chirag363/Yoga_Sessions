import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Session, sessionsAPI } from '../services/api';

const Dashboard: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all');

  const loadSessions = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 50 };
      if (filter !== 'all') {
        params.status = filter;
      }
      const response = await sessionsAPI.getMySessions(params);
      setSessions(response.sessions);
    } catch (error) {
      toast.error('Failed to load your sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      await sessionsAPI.deleteSession(id);
      setSessions(sessions.filter(session => session._id !== id));
      toast.success('Session deleted successfully');
    } catch (error) {
      toast.error('Failed to delete session');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await sessionsAPI.publishSession(id);
      // Reload sessions to update the status
      loadSessions();
      toast.success('Session published successfully');
    } catch (error) {
      toast.error('Failed to publish session');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (session: Session) => {
    if (session.isPublished) {
      return (
        <span className="inline-block bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
          Published
        </span>
      );
    } else {
      return (
        <span className="inline-block bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">
          Draft
        </span>
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Sessions</h1>
                 <Link to="/session/new" className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
           Create New Session
         </Link>
      </div>

             {/* Filters */}
       <div className="flex space-x-4 mb-6">
         {['all', 'draft', 'published'].map((filterType) => (
           <button
             key={filterType}
             onClick={() => setFilter(filterType as typeof filter)}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
               filter === filterType
                 ? 'bg-green-600 text-white shadow-md'
                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
             }`}
           >
             {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
           </button>
         ))}
       </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      ) : (
        <>
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {filter === 'all' 
                  ? "You haven't created any sessions yet." 
                  : `No ${filter} sessions found.`}
              </p>
                             <Link to="/session/new" className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors mt-4 inline-block">
                 Create Your First Session
               </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((session) => (
                <div key={session._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  {/* Header with title and status */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex-1 pr-3 line-clamp-2">
                      {session.title}
                    </h3>
                    {getStatusBadge(session)}
                  </div>
                  
                  {/* Tags */}
                  {session.tags && session.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {session.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {session.tags.length > 3 && (
                        <span className="text-xs text-gray-500 flex items-center">
                          +{session.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Metadata */}
                  <div className="text-sm text-gray-500 mb-6 space-y-1 border-t border-gray-100 pt-4">
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Updated: {formatDate(session.updatedAt)}
                    </p>
                    {session.lastAutoSave && (
                      <p className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Auto-saved: {formatDate(session.lastAutoSave)}
                      </p>
                    )}
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Link
                      to={`/session/${session._id}`}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm text-center transition-colors"
                    >
                      Edit
                    </Link>
                    
                    {session.isDraft && (
                      <button
                        onClick={() => handlePublish(session._id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
                      >
                        Publish
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDelete(session._id)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-3 rounded-lg text-sm transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;

import React, { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { sessionsAPI } from '../services/api';

const SessionEditor: React.FC = () => {
  // Router hooks
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewSession = id === 'new' || id === undefined;

  // Auto-save timers
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Session form data
  const [formData, setFormData] = useState({
    title: '',
    tags: [] as string[],
    jsonUrl: '',
    content: {},
  });

  // Content editing states
  const [contentText, setContentText] = useState('{}');
  const [contentError, setContentError] = useState('');
  const [naturalLanguageText, setNaturalLanguageText] = useState('');
  const [isJsonMode, setIsJsonMode] = useState(true);

  // UI states
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingFromUrl, setLoadingFromUrl] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [sessionExists, setSessionExists] = useState(true);

  // Utility Functions
  const generateJsonFileName = (title: string): string => {
    if (!title.trim()) return '';
    
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')  // Remove special characters
      .replace(/\s+/g, '-')          // Replace spaces with hyphens
      .replace(/-+/g, '-')           // Replace multiple hyphens with single
      .replace(/^-|-$/g, '')         // Remove leading/trailing hyphens
      + '.json';
  };

  // Session Management Functions
  const loadSession = useCallback(async (sessionId: string) => {
    try {
      setLoading(true);
      const session = await sessionsAPI.getMySession(sessionId);
      const jsonUrl = session.jsonUrl || generateJsonFileName(session.title);
      
      setFormData({
        title: session.title,
        tags: session.tags || [],
        jsonUrl: jsonUrl,
        content: session.content || {},
      });
      setContentText(JSON.stringify(session.content || {}, null, 2));
      setContentError('');
      setSessionExists(true);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setSessionExists(false);
        toast.error('Session not found');
      } else {
        toast.error('Failed to load session');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-save functionality
  const handleAutoSave = useCallback(async () => {
    if (!hasUnsavedChanges || isNewSession || !sessionExists || id === 'new') return;

    try {
      setAutoSaveStatus('saving');
      await sessionsAPI.updateSession(id!, formData);
      setHasUnsavedChanges(false);
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    } catch (error) {
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus('idle'), 3000);
    }
  }, [hasUnsavedChanges, isNewSession, sessionExists, id, formData]);

  // Load session when editing existing session
  useEffect(() => {
    if (!isNewSession && id && id !== 'new') {
      loadSession(id);
    }
  }, [id, isNewSession, loadSession]);

  // Auto-save timer setup
  useEffect(() => {
    if (hasUnsavedChanges && !isNewSession && sessionExists && id !== 'new') {
      // Set up auto-save timer
      autoSaveTimerRef.current = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Auto-save after 30 seconds of inactivity

      return () => {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }
      };
    }
  }, [hasUnsavedChanges, isNewSession, sessionExists, handleAutoSave]);

  // Content handling functions
  const handleContentChange = (value: string) => {
    setContentText(value);
    try {
      const parsed = JSON.parse(value);
      setFormData(prev => ({ ...prev, content: parsed }));
      setContentError('');
      setHasUnsavedChanges(true);
    } catch (error) {
      setContentError('Invalid JSON format');
    }
  };

  // JSON manipulation functions
  const handleLoadFromUrl = async () => {
    if (!formData.jsonUrl.trim()) {
      toast.error('Please enter a URL first');
      return;
    }

    if (!formData.jsonUrl.startsWith('http')) {
      toast.error('Please enter a valid HTTP/HTTPS URL');
      return;
    }

    try {
      setLoadingFromUrl(true);
      const response = await fetch(formData.jsonUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const jsonData = await response.json();
      const formattedJson = JSON.stringify(jsonData, null, 2);
      
      setContentText(formattedJson);
      setFormData(prev => ({ ...prev, content: jsonData }));
      setContentError('');
      setHasUnsavedChanges(true);
      toast.success('JSON content loaded successfully');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load JSON from URL';
      toast.error(errorMessage);
    } finally {
      setLoadingFromUrl(false);
    }
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(contentText);
      const formatted = JSON.stringify(parsed, null, 2);
      setContentText(formatted);
      setContentError('');
      toast.success('JSON formatted successfully');
    } catch (error) {
      toast.error('Cannot format invalid JSON');
    }
  };

  const handleMinifyJson = () => {
    try {
      const parsed = JSON.parse(contentText);
      const minified = JSON.stringify(parsed);
      setContentText(minified);
      setContentError('');
      toast.success('JSON minified successfully');
    } catch (error) {
      toast.error('Cannot minify invalid JSON');
    }
  };

  // Natural language to JSON conversion
  const convertToJson = () => {
    if (!naturalLanguageText.trim()) {
      toast.error('Please enter some content to convert');
      return;
    }

    try {
      const lines = naturalLanguageText.split('\n').filter(line => line.trim());
      const sessionData: any = {
        title: formData.title || 'Wellness Session',
        description: '',
        exercises: [],
        duration: 0,
        difficulty: 'beginner',
        notes: []
      };

      let currentExercise: any = null;
      let currentSection = 'description';

      for (const line of lines) {
        const cleanLine = line.trim();
        
        // Check for duration patterns
        const durationMatch = cleanLine.match(/(\d+)\s*(minute|min|second|sec)/i);
        if (durationMatch) {
          const value = parseInt(durationMatch[1]);
          const unit = durationMatch[2].toLowerCase();
          sessionData.duration = unit.startsWith('min') ? value : Math.round(value / 60);
          continue;
        }

        // Check for difficulty patterns
        if (cleanLine.match(/\b(beginner|intermediate|advanced|easy|hard|difficult)\b/i)) {
          const difficultyMap: {[key: string]: string} = {
            'easy': 'beginner',
            'beginner': 'beginner',
            'intermediate': 'intermediate',
            'advanced': 'advanced',
            'hard': 'advanced',
            'difficult': 'advanced'
          };
          const match = cleanLine.match(/\b(beginner|intermediate|advanced|easy|hard|difficult)\b/i);
          if (match) {
            sessionData.difficulty = difficultyMap[match[1].toLowerCase()] || 'beginner';
          }
          continue;
        }

        // Check for exercise patterns (numbered or bulleted lists)
        if (cleanLine.match(/^(\d+\.|\-|\*)\s*(.+)/)) {
          if (currentExercise) {
            sessionData.exercises.push(currentExercise);
          }
          const exerciseMatch = cleanLine.match(/^(\d+\.|\-|\*)\s*(.+)/);
          currentExercise = {
            name: exerciseMatch![2],
            duration: null,
            instructions: [],
            repetitions: null
          };
          
          // Check for duration in exercise name
          const exDurationMatch = currentExercise.name.match(/(.+?)\s*[-–]\s*(\d+)\s*(min|minute|sec|second)/i);
          if (exDurationMatch) {
            currentExercise.name = exDurationMatch[1].trim();
            const value = parseInt(exDurationMatch[2]);
            const unit = exDurationMatch[3].toLowerCase();
            currentExercise.duration = unit.startsWith('min') ? value : Math.round(value / 60);
          }

          // Check for repetitions
          const repMatch = currentExercise.name.match(/(.+?)\s*[-–]\s*(\d+)\s*(rep|time|x)/i);
          if (repMatch) {
            currentExercise.name = repMatch[1].trim();
            currentExercise.repetitions = parseInt(repMatch[2]);
          }
          continue;
        }

        // If we have a current exercise, add as instruction
        if (currentExercise && cleanLine.length > 0) {
          currentExercise.instructions.push(cleanLine);
          continue;
        }

        // Otherwise, add to description or notes
        if (currentSection === 'description' && sessionData.description === '') {
          sessionData.description = cleanLine;
        } else if (cleanLine.length > 0) {
          sessionData.notes.push(cleanLine);
        }
      }

      // Add last exercise if exists
      if (currentExercise) {
        sessionData.exercises.push(currentExercise);
      }

      // Clean up empty arrays and null values
      sessionData.exercises = sessionData.exercises.filter((ex: any) => ex.name);
      if (sessionData.notes.length === 0) delete sessionData.notes;

      const jsonString = JSON.stringify(sessionData, null, 2);
      setContentText(jsonString);
      setFormData(prev => ({ ...prev, content: sessionData }));
      setContentError('');
      setIsJsonMode(true);
      toast.success('Content converted to JSON successfully!');
      
    } catch (error) {
      toast.error('Failed to convert content to JSON');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value,
      };
      
      // Auto-generate JSON URL when title changes
      if (field === 'title' && value.trim()) {
        newData.jsonUrl = generateJsonFileName(value);
      }
      
      return newData;
    });
    setHasUnsavedChanges(true);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title for your session');
      return;
    }

    // Auto-convert natural language to JSON if in natural language mode
    if (!isJsonMode && naturalLanguageText.trim() && !formData.content) {
      convertToJson();
      return; // Let the user see the conversion result first
    }

    if (contentError) {
      toast.error('Please fix the JSON content before saving');
      return;
    }

    try {
      setLoading(true);
      
      if (isNewSession) {
        const response = await sessionsAPI.createSession(formData);
        toast.success('Session created successfully');
        navigate(`/session/${response.session._id}`);
      } else {
        await sessionsAPI.updateSession(id!, formData);
        setHasUnsavedChanges(false);
        toast.success('Session saved successfully');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to save session';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (isNewSession) {
      toast.error('Please save the session first');
      return;
    }

    if (contentError) {
      toast.error('Please fix the JSON content before publishing');
      return;
    }

    // Show conversion notification if in natural language mode
    if (!isJsonMode && naturalLanguageText.trim()) {
      toast.success('Natural language content will be converted to JSON upon publishing!', {
        duration: 4000,
      });
    }

    try {
      await sessionsAPI.publishSession(id!);
      toast.success('Session published successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to publish session');
    }
  };

  if (!sessionExists) {
    return (
      <div className="container-responsive py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Session Not Found</h1>
          <p className="text-gray-600 mb-4">The session you're looking for doesn't exist or has been deleted.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-responsive py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isNewSession ? 'Create New Session' : 'Edit Session'}
        </h1>
        
        {/* Auto-save status */}
        {!isNewSession && (
          <div className={`auto-save-indicator ${autoSaveStatus}`}>
            {autoSaveStatus === 'saving' && (
              <>
                <div className="loading-spinner w-3 h-3"></div>
                <span>Saving...</span>
              </>
            )}
            {autoSaveStatus === 'saved' && <span>✓ Auto-saved</span>}
            {autoSaveStatus === 'error' && <span>⚠ Auto-save failed</span>}
            {autoSaveStatus === 'idle' && hasUnsavedChanges && <span>● Unsaved changes</span>}
          </div>
        )}
      </div>

      {loading && isNewSession ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Title */}
          <div className="card">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Session Title *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="input-field"
              placeholder="Enter your session title..."
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.title.length}/100 characters
            </p>
          </div>

          {/* Tags */}
          <div className="card">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="input-field flex-1"
                placeholder="Add a tag..."
                maxLength={30}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="btn-secondary"
              >
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center bg-green-50 text-green-700 text-sm px-3 py-1.5 rounded-full border border-green-200"
                  >
                    <span className="truncate max-w-24">{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-green-600 hover:text-green-800 focus:outline-none focus:text-green-800 flex-shrink-0"
                      aria-label={`Remove ${tag} tag`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* JSON URL */}
          <div className="card">
            <label htmlFor="jsonUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Session JSON File Name
            </label>
            <div className="flex space-x-2">
              <input
                id="jsonUrl"
                type="text"
                value={formData.jsonUrl}
                onChange={(e) => handleInputChange('jsonUrl', e.target.value)}
                className="input-field flex-1"
                placeholder="my-session-title.json"
              />
              {formData.jsonUrl.startsWith('http') && (
                <button
                  type="button"
                  onClick={handleLoadFromUrl}
                  disabled={loadingFromUrl}
                  className="btn-secondary whitespace-nowrap"
                >
                  {loadingFromUrl ? 'Loading...' : 'Load JSON'}
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formData.title.trim() ? (
                <>
                  <span className="text-green-600">✓ Auto-generated from title:</span> {generateJsonFileName(formData.title)}
                  {formData.jsonUrl !== generateJsonFileName(formData.title) && (
                    <span className="text-orange-600 ml-2">(manually modified)</span>
                  )}
                </>
              ) : (
                'Enter a session title to auto-generate the file name, or manually specify a file name.'
              )}
              {formData.jsonUrl.startsWith('http') && ' Click "Load JSON" to fetch content from URL.'}
            </p>
          </div>

          {/* Content Editor */}
          <div className="card">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
              <label className="block text-sm font-medium text-gray-700">
                Session Content
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center rounded-lg bg-gray-100 p-1">
                  <button
                    type="button"
                    onClick={() => setIsJsonMode(false)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      !isJsonMode 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Natural Language
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsJsonMode(true)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      isJsonMode 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    JSON Mode
                  </button>
                </div>
                {isJsonMode && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleFormatJson}
                      className="text-xs btn-secondary py-1.5 px-3"
                      disabled={!!contentError}
                    >
                      Format
                    </button>
                    <button
                      type="button"
                      onClick={handleMinifyJson}
                      className="text-xs btn-secondary py-1.5 px-3"
                      disabled={!!contentError}
                    >
                      Minify
                    </button>
                  </div>
                )}
              </div>
            </div>

            {!isJsonMode ? (
              <div>
                <textarea
                  value={naturalLanguageText}
                  onChange={(e) => setNaturalLanguageText(e.target.value)}
                  className="input-field text-sm"
                  rows={12}
                  placeholder="Describe your wellness session in natural language:

Example:
30 minute beginner yoga session

1. Mountain Pose - 2 minutes
   Stand tall with feet together
   Breathe deeply and center yourself

2. Downward Dog - 3 minutes  
   Start on hands and knees
   Lift hips up and back
   
3. Child's Pose - 5 minutes
   Sit back on heels
   Rest forehead on mat

Focus on breathing throughout the session
Remember to stay hydrated"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    Describe your session naturally. Use numbers for exercises, mention duration and difficulty.
                  </p>
                  <button
                    type="button"
                    onClick={convertToJson}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg text-sm"
                    disabled={!naturalLanguageText.trim()}
                  >
                    Convert to JSON
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <textarea
                  id="content"
                  value={contentText}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className={`input-field font-mono text-sm ${contentError ? 'border-red-500' : ''}`}
                  rows={12}
                  placeholder='{"title": "Wellness Session", "exercises": [], "duration": 60, "difficulty": "beginner"}'
                />
                {contentError && (
                  <p className="text-xs text-red-500 mt-1">
                    {contentError}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Enter your session data in JSON format. Use Format/Minify buttons to clean up the JSON.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary order-2 sm:order-1"
            >
              Cancel
            </button>
            
            <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="btn-secondary flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Draft'
                )}
              </button>
              
              {!isNewSession && (
                <button
                  onClick={handlePublish}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Publish Session
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionEditor;

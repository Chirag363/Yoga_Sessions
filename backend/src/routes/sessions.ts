import express, { Response } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import Session from '../models/Session';

const router = express.Router();

// @route   GET /api/sessions/public
// @desc    Get all published sessions
// @access  Public
router.get('/public', async (req, res: Response) => {
  try {
    const { page = 1, limit = 10, tags } = req.query;
    const query: any = { isPublished: true };
    
    if (tags) {
      const tagArray = (tags as string).split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    const sessions = await Session.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .select('-content'); // Don't send full content in list view

    const total = await Session.countDocuments(query);

    res.json({
      sessions,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      totalCount: total
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ message: 'Server error while fetching sessions' });
  }
});

// @route   GET /api/sessions/public/:id
// @desc    Get a single published session
// @access  Public
router.get('/public/:id', async (req, res: Response) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      isPublished: true
    }).populate('userId', 'name email');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ message: 'Server error while fetching session' });
  }
});

// @route   GET /api/sessions/my
// @desc    Get user's sessions
// @access  Private
router.get('/my', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query: any = { userId: req.user!._id };
    
    if (status === 'draft') {
      query.isDraft = true;
    } else if (status === 'published') {
      query.isPublished = true;
    }

    const sessions = await Session.find(query)
      .sort({ updatedAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Session.countDocuments(query);

    res.json({
      sessions,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      totalCount: total
    });
  } catch (error) {
    console.error('Get my sessions error:', error);
    res.status(500).json({ message: 'Server error while fetching your sessions' });
  }
});

// @route   GET /api/sessions/my/:id
// @desc    Get a specific user session
// @access  Private
router.get('/my/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user!._id
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Get my session error:', error);
    res.status(500).json({ message: 'Server error while fetching session' });
  }
});

// @route   POST /api/sessions
// @desc    Create a new session
// @access  Private
router.post('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { title, tags, jsonUrl, content } = req.body;

    const session = new Session({
      title,
      tags: tags || [],
      jsonUrl,
      content,
      userId: req.user!._id,
      isDraft: true,
      isPublished: false,
      lastAutoSave: new Date()
    });

    await session.save();

    res.status(201).json({
      message: 'Session created successfully',
      session
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ message: 'Server error while creating session' });
  }
});

// @route   PUT /api/sessions/:id
// @desc    Update a session (auto-save or manual save)
// @access  Private
router.put('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { title, tags, jsonUrl, content, isAutoSave } = req.body;

    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user!._id
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Update fields
    if (title !== undefined) session.title = title;
    if (tags !== undefined) session.tags = tags;
    if (jsonUrl !== undefined) session.jsonUrl = jsonUrl;
    if (content !== undefined) session.content = content;
    
    if (isAutoSave) {
      session.lastAutoSave = new Date();
    }

    await session.save();

    res.json(session);
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ message: 'Server error while updating session' });
  }
});

// @route   POST /api/sessions/:id/publish
// @desc    Publish a session
// @access  Private
router.post('/:id/publish', auth, async (req: AuthRequest, res: Response) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user!._id
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.isPublished = true;
    session.isDraft = false;
    await session.save();

    res.json(session);
  } catch (error) {
    console.error('Publish session error:', error);
    res.status(500).json({ message: 'Server error while publishing session' });
  }
});

// @route   DELETE /api/sessions/:id
// @desc    Delete a session
// @access  Private
router.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user!._id
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    await Session.findByIdAndDelete(req.params.id);

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ message: 'Server error while deleting session' });
  }
});

export default router;

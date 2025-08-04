import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  title: string;
  tags: string[];
  jsonUrl: string;
  content?: any; // JSON content for the session
  isDraft: boolean;
  isPublished: boolean;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  lastAutoSave?: Date;
}

const sessionSchema = new Schema<ISession>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  jsonUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(url: string) {
        if (!url) return true; // Optional field
        // Allow either full URLs or just filenames (for local storage)
        return /^https?:\/\/.+/.test(url) || /^[\w\-_.]+\.(json|JSON)$/.test(url);
      },
      message: 'Please provide a valid URL or JSON filename'
    }
  },
  content: {
    type: Schema.Types.Mixed,
    default: {}
  },
  isDraft: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastAutoSave: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
sessionSchema.index({ userId: 1, createdAt: -1 });
sessionSchema.index({ isPublished: 1, createdAt: -1 });
sessionSchema.index({ tags: 1 });

export default mongoose.model<ISession>('Session', sessionSchema);

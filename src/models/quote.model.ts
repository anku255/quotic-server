import mongoose, { Schema } from 'mongoose';

const quoteSchema = new Schema(
  {
    markup: {
      type: String,
    },
    raw: {
      type: String,
      required: true,
    },
    show: {
      type: Schema.Types.ObjectId,
      ref: 'Show',
      required: true,
    },
    characters: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Character',
      },
    ],
    mainCharacter: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
    },
    season: Number,
    episode: Number,
    timestamp: String,
    tags: [String],
    audio: String,
  },
  { timestamps: true },
);

export default mongoose.model('Quote', quoteSchema);

import mongoose, { Schema } from 'mongoose';


const episodeSchema = new Schema({
  season: {
    type: Number,
    required: true,
  },
  episodes: {
    type: Number,
    required: 'true'
  }
}, {_id: false})

const showSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    genre: {
      type: [String],
      required: true,
    },
    type: {
      type: String,
      enum: ['SERIES', 'MOVIE'],
      required: true
    },
    year: Number,
    seasons: Number,
    episodes: [episodeSchema],
    characters: [{ type: Schema.Types.ObjectId, ref: 'Character' }],
    coverPicture: String,
    imdbLink: String,
    rating: Number,
  },
  { timestamps: true },
);

export default mongoose.model('Show', showSchema);


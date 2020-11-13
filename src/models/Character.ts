import mongoose, { Schema } from 'mongoose';


const characterSchema = new Schema(
  {
    characterName: {
      type: String,
      required: true,
    },
    realName: {
      type: String,
      required: true,
    },
    imdbLink: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
    },
    coverPicture: {
      type: String,
      required: true,
    },
    shows: [{ type: mongoose.Types.ObjectId, ref: 'Show' }],
    bioMarkup: {
      type: String
    }
  },
  { timestamps: true },
);

export default mongoose.model('Character', characterSchema);


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
      required: true,
    },
    coverPicture: {
      type: String,
      required: true,
    },
    shows: [{ type: mongoose.Types.ObjectId, ref: 'Show' }]
  },
  { timestamps: true },
);

export default mongoose.model('Character', characterSchema);


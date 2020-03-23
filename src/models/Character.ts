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
    imdbLink: String,
    age: Number,
    coverPicture: String,
    shows: [{ type: mongoose.Types.ObjectId, ref: 'Show' }]
  },
  { timestamps: true },
);

export default mongoose.model('Character', characterSchema);


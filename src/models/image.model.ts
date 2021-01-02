import mongoose, { Schema } from 'mongoose';


const imageSchema = new Schema(
  {
    cloudinaryUrl: {
      type: String,
      required: true,
    },
    s3Url: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      required: true,
      enum: ['CHARACTER', 'SHOW']
    }
  },
  { timestamps: true },
);

export default mongoose.model('Image', imageSchema);


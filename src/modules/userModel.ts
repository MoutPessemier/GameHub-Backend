import mongoose, { Document, Schema } from 'mongoose';

export interface User {
  _id: any;
  firstName: string;
  lastName: string;
  telephone: string;
  email: string;
  birthDate: Date;
  location: any;
}

export interface UserDocument extends User, Document {}

const schema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    telephone: {
      type: String,
      required: true
    },
    email: { type: String, required: true },
    birthDate: { type: Date, required: true },
    location: { type: Schema.Types.ObjectId, ref: 'location', required: true }
  },
  { _id: true, timestamps: true }
);

export const model = mongoose.model<UserDocument>('users', schema);

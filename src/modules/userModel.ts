import mongoose, { Document, Schema } from 'mongoose';

enum UserRole {
  OWNER,
  ADMIN,
  USER
}

export interface User {
  _id: any;
  firstName: string;
  lastName: string;
  telephone: string;
  email: string;
  birthDate: Date;
  userRole: UserRole;
  password: string;
  //location: any;
}

export interface UserDocument extends User, Document {}

const schema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    telephone: { type: String, required: true },
    email: { type: String, required: true },
    birthDate: { type: Date, required: true },
    userRole: { type: String, enum: Object.values(UserRole), required: true },
    password: { type: String, required: true }
    //location: {}
  },
  { _id: true, timestamps: true }
);

export const model = mongoose.model<UserDocument>('users', schema);

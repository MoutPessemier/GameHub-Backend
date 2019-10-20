import mongoose, { Document, Schema } from 'mongoose';
import { User } from './userModel';

export interface GameParty {
  _id: any;
  //location: any;
  name: string;
  date: Date;
  maxSize: number;
  participants: User[];
  location: Location;
}

export interface GamePartyDocument extends GameParty, Document {}

const schema = new Schema(
  {
    //location: {},
    name: { type: String, required: true },
    date: { type: Date, required: true },
    maxSize: { type: Number, required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'users', required: true }],
    location: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true }
    }
  },
  { _id: true, timestamps: true }
);

export const model = mongoose.model<GamePartyDocument>('parties', schema);

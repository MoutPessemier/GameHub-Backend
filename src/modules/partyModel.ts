import mongoose, { Document, Schema } from 'mongoose';
import { User } from './userModel';

export interface GameParty {
  _id: any;
  name: string;
  date: Date;
  maxSize: number;
  participants: any[];
  gameId: any;
  location: { type: string; coordinates: number[] };
  declines: any[];
}

export interface GamePartyDocument extends GameParty, Document {}

const schema = new Schema(
  {
    name: { type: String, required: true },
    date: { type: Date, required: true },
    maxSize: { type: Number, required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'users', required: true }],
    gameId: { type: Schema.Types.ObjectId, ref: 'games', required: true },
    location: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true }
    },
    declines: [{ type: Schema.Types.ObjectId, ref: 'users', required: false }]
  },
  { _id: true, timestamps: true }
);

schema.index({ location: '2dsphere' });
export const model = mongoose.model<GamePartyDocument>('parties', schema);

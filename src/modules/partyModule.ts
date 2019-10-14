import mongoose, { Document, Schema } from 'mongoose';

export interface GameParty {
  _id: any;
  location: any;
  date: Date;
  maxSize: number;
  participants: number;
}

export interface GamePartyDocument extends GameParty, Document {}

const schema = new Schema(
  {
    location: { type: Schema.Types.ObjectId, ref: 'location', required: true },
    date: { type: Date, required: true },
    maxSize: { type: Number, required: true },
    participants: { type: Number, required: true }
  },
  { _id: true, timestamps: true }
);

export const model = mongoose.model<GamePartyDocument>('parties', schema);

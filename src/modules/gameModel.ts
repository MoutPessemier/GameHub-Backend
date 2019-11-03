import mongoose, { Document, Schema } from 'mongoose';

enum GameType {
  BOARD_GAME,
  CARD_GAME,
  VIDEO_GAME,
  DnD,
  PARTY_GAME,
  FAMILY_GAME
}
export interface Game {
  _id: any;
  name: string;
  description: string;
  rules: string;
  requirements: string;
  type: GameType;
}

export interface GameDocument extends Game, Document {}

const schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    rules: { type: String, required: true },
    requirements: { type: String, required: false },
    type: { type: String, enum: Object.values(GameType), required: true }
  },
  { _id: true, timestamps: true }
);

export const model = mongoose.model<GameDocument>('games', schema);

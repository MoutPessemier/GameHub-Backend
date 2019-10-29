import * as user from './modules/userModel';
import * as game from './modules/gameModel';
import * as party from './modules/partyModel';

export type Models = typeof models;

const models = {
  user,
  game,
  party
};

export default models;

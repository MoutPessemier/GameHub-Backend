import { Router } from 'express';
import models from '../models';

const routes = Router();

routes.get('/allGames', async (req, res) => {
  const games = await models.game.model.find({});
  res.send({ games });
});

routes.post('/makeGame', async (req, res) => {
  const game = await models.game.model.create({
    name: req.body.name,
    description: req.body.description,
    rules: req.body.rules,
    requirements: req.body.requirements,
    type: req.body.type
  });
  res.send({ game });
});

routes.put('/updateGame', async (req, res) => {
  const updatedGame = await models.game.model.findByIdAndUpdate(
    { _id: req.body.id },
    {
      name: req.body.name,
      description: req.body.description,
      rules: req.body.rules,
      requirements: req.body.requirements,
      type: req.body.type
    },
    { new: true, upsert: true }
  );
  res.send({ updatedGame });
});

routes.delete('deleteGame', async (req, res) => {
  await models.game.model.deleteOne({ _id: req.body.id });
  res.send({ id: req.body.id });
});

export default routes;

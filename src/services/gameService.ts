import { Router } from 'express';
import * as Sentry from '@sentry/node';
import models from '../models';

const routes = Router();

Sentry.configureScope(scope => {
  scope.setLevel(Sentry.Severity.Fatal);
  scope.setTag('GameService', `http://localhost:${process.env.PORT}`);
});

routes.get('/games', async (req, res) => {
  const games = await models.game.model.find({ visible: true }).catch(e => {
    Sentry.captureException(e);
    res.status(400).send(e);
  });
  res.send({ games });
});

routes.post('/createGame', async (req, res) => {
  const game = await models.game.model
    .create({
      name: req.body.name,
      description: req.body.description,
      rules: req.body.rules,
      requirements: req.body.requirements,
      type: req.body.type,
      visible: req.body.visible
    })
    .catch(e => {
      Sentry.captureException(e);
      res.status(400).send(e);
    });
  res.send(game);
});

routes.put('/updateGame', async (req, res) => {
  const updatedGame = await models.game.model
    .findByIdAndUpdate(
      { _id: req.body.id },
      {
        name: req.body.name,
        description: req.body.description,
        rules: req.body.rules,
        requirements: req.body.requirements,
        type: req.body.type,
        visible: req.body.visible
      },
      { new: true, upsert: true }
    )
    .catch(e => {
      Sentry.captureException(e);
      res.status(404).send(e);
    });
  res.send(updatedGame);
});

routes.delete('/deleteGame', async (req, res) => {
  const parties = await models.party.model.find({ gameId: req.body.id });
  // if there are parties still with this game
  if (parties.length) {
    const invisbleGame = await models.game.model
      .findByIdAndUpdate(
        { _id: req.body.id },
        {
          name: req.body.name,
          description: req.body.description,
          rules: req.body.rules,
          requirements: req.body.requirements,
          type: req.body.type,
          visible: false
        },
        { new: true, upsert: true }
      )
      .catch(e => {
        Sentry.captureException(e);
        res.status(400).send(e);
      });
    res.send(invisbleGame);
  } else {
    const deletedGame = await models.game.model.findByIdAndDelete({ _id: req.body.id }).catch(e => {
      Sentry.captureException(e);
      res.status(400).send(e);
    });
    res.send(deletedGame);
  }
});

export default routes;

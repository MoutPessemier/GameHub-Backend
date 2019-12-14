import { Router } from 'express';
import * as Sentry from '@sentry/node';
import models from '../models';

const routes = Router();

Sentry.configureScope(scope => {
  scope.setLevel(Sentry.Severity.Fatal);
  scope.setTag('UserService', `http://localhost:${process.env.PORT}`);
});

routes.get('/doesUserExist', async (req, res) => {
  const user = await models.user.model.findOne({ email: req.query.email });
  if (user) {
    return res.send(true);
  } else {
    return res.send(false);
  }
});

routes.get('/getUserByEmail', async (req, res) => {
  const user = await models.user.model.findOne({ email: req.query.email }).catch(e => {
    Sentry.captureException(e);
    return res.sendStatus(404).send(e);
  });
  return res.send(user);
});

// Athentication is handled by Auth0, this is used to sync users with Auth0

routes.post('/register', async (req, res) => {
  const user = await models.user.model.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    userRole: 'USER',
    maxDistance: 10
  });
  return res.send({ user });
});

routes.post('/login', async (req, res) => {
  const user = await models.user.model.findOne({ email: req.body.email });
  if (!user) return res.sendStatus(400).send({ error: `No user found with email: ${req.body.email}.` });
  return res.send({ user });
});

routes.put('/updateUser', async (req, res) => {
  const user = await models.user.model
    .findByIdAndUpdate(
      { _id: req.body._id },
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        userRole: req.body.userRole,
        maxDistance: req.body.maxDistance
      },
      { new: true, upsert: true }
    )
    .catch(e => {
      Sentry.captureException(e);
      return res.sendStatus(404).send(e);
    });
  return res.send({ user });
});

routes.delete('/deleteUser', async (req, res) => {
  const deletedUser = await models.user.model.findByIdAndDelete({ _id: req.body.id }).catch(e => {
    Sentry.captureException(e);
    return res.sendStatus(400).send(e);
  });
  await models.party.model
    .updateMany({ declines: { $in: [req.body.userId] } }, { $pull: { declines: req.body.userId } })
    .catch(e => {
      Sentry.captureException(e);
      return res.sendStatus(400).send(e);
    });
  await models.party.model
    .updateMany({ participants: { $in: [req.body.userId] } }, { $pull: { participants: req.body.userId } })
    .catch(e => {
      Sentry.captureException(e);
      return res.sendStatus(400).send(e);
    });
  return res.send(deletedUser);
});

export default routes;

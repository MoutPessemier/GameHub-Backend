import { Router } from 'express';
import * as Sentry from '@sentry/node';
import models from '../models';
import { stringToDate, dateFix } from '../util/helpers';

const routes = Router();

Sentry.configureScope(scope => {
  scope.setLevel(Sentry.Severity.Fatal);
  scope.setTag('PartyService', `http://localhost:${process.env.PORT}`);
});

routes.get('/getPartiesNearYou', async (req, res) => {
  const maxDistance = parseInt(req.query.distance) * 1000; //convert to meters
  const myCoords = [parseFloat(req.query.lat), parseFloat(req.query.long)];
  let parties = await models.party.model
    .find({
      $and: [
        {
          location: {
            $nearSphere: {
              $geometry: {
                type: 'Point',
                coordinates: myCoords
              },
              $maxDistance: maxDistance,
              $minDistance: 0
            }
          }
        },
        { declines: { $nin: [req.query.userId] } },
        { participants: { $nin: [req.query.userId] } }
      ]
    })
    .limit(25);
  parties = parties.filter(p => p.participants.length < p.maxSize);
  return res.send({ parties });
});

routes.get('/getJoinedParties', async (req, res) => {
  const parties = await models.party.model.find({ participants: { $in: [req.query.userId] } }).catch(e => {
    Sentry.captureException(e);
    return res.sendStatus(400).send(e);
  });
  return res.send({ parties });
});

routes.post('/createParty', async (req, res) => {
  const party = await models.party.model
    .create({
      name: req.body.name,
      date: stringToDate(req.body.date),
      //date: dateFix(req.body.date),
      maxSize: req.body.maxSize,
      participants: req.body.participants,
      gameId: req.body.gameId,
      location: {
        type: 'Point',
        coordinates: req.body.location.coordinates
      },
      declines: req.body.declines
    })
    .catch(e => {
      Sentry.captureException(e);
      return res.sendStatus(200).send(e);
    });
  return res.send(party);
});

routes.put('/updateParty', async (req, res) => {
  const updatedParty = await models.party.model
    .findByIdAndUpdate(
      { _id: req.body.id },
      {
        name: req.body.name,
        date: dateFix(req.body.date),
        maxSize: req.body.maxSize,
        participants: req.body.participants,
        gameId: req.body.gameId,
        location: {
          type: 'Point',
          coordinates: req.body.coordinates
        },
        declines: req.body.declines
      },
      { new: true, upsert: true }
    )
    .catch(e => {
      Sentry.captureException(e);
      return res.sendStatus(404).send(e);
    });
  return res.send(updatedParty);
});

routes.delete('/deleteParty', async (req, res) => {
  const deletedParty = await models.party.model.findByIdAndDelete({ _id: req.body.id }).catch(e => {
    Sentry.captureException(e);
    return res.sendStatus(400).send(e);
  });
  return res.send(deletedParty);
});

routes.post('/joinParty', async (req, res) => {
  const party = await models.party.model.findById({ _id: req.body.partyId });
  if (!(party.participants.length + 1 <= party.maxSize))
    return res.sendStatus(403).send({ error: 'The party is already full.' });
  if (party.participants.includes(req.body.userId))
    return res.sendStatus(403).send({ error: 'You already joined this party!' });
  const joinedParty = await models.party.model
    .findByIdAndUpdate(
      { _id: req.body.partyId },
      {
        name: party.name,
        date: party.date,
        maxSize: party.maxSize,
        participants: [...party.participants, req.body.userId],
        gameId: party.gameId,
        location: {
          type: party.location.type,
          coordinates: party.location.coordinates
        },
        declines: party.declines
      },
      { new: true, upsert: true }
    )
    .catch(e => {
      Sentry.captureException(e);
      return res.sendStatus(400).send(e);
    });
  return res.send(joinedParty);
});

routes.post('/declineParty', async (req, res) => {
  const party = await models.party.model.findById({ _id: req.body.partyId });
  if (!party) return res.sendStatus(404).send({ error: `No party found with id ${req.body.partyId}` });
  const declinedParty = await models.party.model
    .findByIdAndUpdate(
      { _id: req.body.partyId },
      {
        name: party.name,
        date: party.date,
        maxSize: party.maxSize,
        participants: party.participants,
        gameId: party.gameId,
        location: {
          type: party.location.type,
          coordinates: party.location.coordinates
        },
        declines: [...party.declines, req.body.userId]
      },
      { new: true, upsert: true }
    )
    .catch(e => {
      Sentry.captureException(e);
      return res.sendStatus(400).send(e);
    });
  return res.send(declinedParty);
});

export default routes;

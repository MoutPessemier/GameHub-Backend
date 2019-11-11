import { Router } from 'express';
import models from '../models';
import { stringToDate } from '../util/helpers';

const routes = Router();

routes.get('/getPartiesNearYou', async (req, res) => {
  const maxDistance = parseInt(req.query.distance) * 1000; //convert to meters
  const myCoords = [parseInt(req.query.lat), parseInt(req.query.long)];
  const parties = await models.party.model
    .find({
      $and: [
        {
          location: {
            $near: {
              $maxDistance: maxDistance,
              $geometry: {
                type: 'Point',
                coordinates: myCoords
              }
            }
          }
        },
        { declines: { $nin: [req.query.userId] } },
        { participants: { $nin: [req.query.userId] } }
      ]
    })
    .limit(25);
  res.send({ parties });
});

routes.post('/createParty', async (req, res) => {
  const party = await models.party.model.create({
    name: req.body.name,
    date: stringToDate(req.body.date),
    maxSize: req.body.maxSize,
    participants: req.body.participants,
    gameId: req.body.gameId,
    location: {
      type: 'Point',
      coordinates: req.body.coordinates
    },
    declines: req.body.declines
  });
  res.send(party);
});

routes.put('/updateParty', async (req, res) => {
  const updatedParty = await models.party.model.findByIdAndUpdate(
    { _id: req.body.id },
    {
      name: req.body.name,
      date: stringToDate(req.body.date),
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
  );
  res.send(updatedParty);
});

routes.delete('/deleteParty', async (req, res) => {
  const deletedParty = await models.party.model.findByIdAndDelete({ _id: req.body.id });
  res.send(deletedParty);
});

routes.post('/joinParty', async (req, res) => {
  const party = await models.party.model.findById({ _id: req.body.partyId });
  if (!(party.participants.length + 1 <= party.maxSize)) res.send({ error: 'The party is already full.' });
  if (party.participants.includes(req.body.userId)) res.send({ error: 'You already joined this party!' });
  const joinedParty = await models.party.model.findByIdAndUpdate(
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
  );
  res.send(joinedParty);
});

routes.post('/declineParty', async (req, res) => {
  const party = await models.party.model.findById({ _id: req.body.partyId });
  if (!party) res.send({ error: `No party found with id ${req.body.partyId}` });
  const declinedParty = await models.party.model.findByIdAndUpdate(
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
      declines: [...party.declines, , req.body.userId]
    },
    { new: true, upsert: true }
  );
  res.send(declinedParty);
});

export default routes;

import { Router } from 'express';
import models from '../models';
import { stringToDate } from '../util/parsers';

const routes = Router();

routes.get('/getPartiesNearYou', async (req, res) => {
  const maxDistance = req.body.distance * 1000; //convert to meters
  const myCoords = req.body.coordinates;
  const parties = await models.party.model
    .find({
      location: {
        $near: {
          $maxDistance: maxDistance,
          $geometry: {
            type: 'Point',
            coordinates: myCoords
          }
        }
      }
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
    game: req.body.game,
    location: {
      type: 'Point',
      coordinates: req.body.coordinates
    }
  });
  res.send({ party });
});

routes.put('/updateParty', async (req, res) => {
  const updatedParty = await models.party.model.findByIdAndUpdate(
    { _id: req.body.id },
    {
      name: req.body.name,
      date: stringToDate(req.body.date),
      maxSize: req.body.maxSize,
      participants: req.body.participants,
      game: req.body.game,
      location: {
        type: 'Point',
        coordinates: req.body.coordinates
      }
    },
    { new: true, upsert: true }
  );
  res.send({ updatedParty });
});

routes.delete('/deleteParty', async (req, res) => {
  await models.party.model.deleteOne({ _id: req.body.id });
  res.send({ id: req.body.id });
});

routes.post('/joinParty', async (req, res) => {
  const party = await models.party.model.findById({ _id: req.body.partyId });
  if (!(party.participants.length + 1 <= party.maxSize)) res.send({ error: 'The party is already full.' });
  party.updateOne({
    name: party.name,
    date: party.date,
    maxSize: party.maxSize,
    participants: [...party.participants, req.body.userId],
    game: party.game,
    location: {
      type: party.location.type,
      coordinates: party.location.coordinates
    }
  });
});

export default routes;

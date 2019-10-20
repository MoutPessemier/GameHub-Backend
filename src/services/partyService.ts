import { Router } from 'express';
import models from '../models';
import { stringToDate } from '../util/parsers';

const routes = Router();

routes.get('/getPartiesNearYou', (req, res) => {});

routes.post('/createParty', async (req, res) => {
  const party = await models.party.model.create({
    name: req.body.name,
    date: stringToDate(req.body.date),
    maxSize: req.body.maxSize,
    participants: req.body.participants,
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

export default routes;

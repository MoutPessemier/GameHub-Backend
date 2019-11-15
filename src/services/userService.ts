import { Router } from 'express';
import * as Sentry from '@sentry/node';
import models from '../models';
import { validatePhone, validateEmail, isOldEnough } from '../util/validators';
import { hashPassword, comparePasswords, stringToDate } from '../util/helpers';

const routes = Router();

Sentry.configureScope(scope => {
  scope.setLevel(Sentry.Severity.Fatal);
  scope.setTag('UserService', `http://localhost:${process.env.PORT}`);
});

// Athentication is handled by Auth0

// routes.post('/register', async (req, res) => {
//   const errors = { email: '', phone: '', birthDate: '' };
//   if (!validateEmail(req.body.email)) errors.email = '';
//   if (!validatePhone(req.body.phone)) errors.phone = '';
//   if (!isOldEnough(stringToDate(req.body.birthDate))) errors.birthDate = '';
//   if (errors.email !== '' || errors.phone !== '' || errors.birthDate !== '') res.send({ errors });
//   const hashedPass = await hashPassword(req.body.password);
//   const user = await models.user.model.create({
//     firstName: req.body.firstName,
//     lastName: req.body.lastName,
//     telephone: req.body.telephone,
//     email: req.body.email,
//     birthDate: stringToDate(req.body.birthDate),
//     userRole: req.body.userRole,
//     password: hashedPass,
//     maxDistance: req.body.maxDistance
//   });
//   res.send(user);
// });

// routes.post('/login', async (req, res) => {
//   const user = await models.user.model.findOne({ email: req.body.email });
//   if (!user) res.send({ error: `No user found with email: ${req.body.email}.` });
//   const isEqual = await comparePasswords(req.body.password, user.password);
//   if (!isEqual) {
//     res.send({ error: `Passwords does not match, try again.` });
//   }
//   res.send(user);
// });

routes.put('/updateUser', async (req, res) => {
  const errors = { email: '', phone: '', birthDate: '' };
  if (!validateEmail(req.body.email)) errors.email = '';
  if (!validatePhone(req.body.phone)) errors.phone = '';
  if (!isOldEnough(stringToDate(req.body.birthDate))) errors.birthDate = '';
  if (errors.email !== '' || errors.phone !== '' || errors.birthDate !== '') res.status(406).send({ errors });
  const hashedPass = await hashPassword(req.body.password);
  const updatedUser = await models.user.model
    .findByIdAndUpdate(
      { _id: req.body.id },
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        telephone: req.body.telephone,
        email: req.body.email,
        birthDate: stringToDate(req.body.birthDate),
        userRole: req.body.userRole,
        password: hashedPass,
        maxDistance: req.body.maxDistance
      },
      { new: true, upsert: true }
    )
    .catch(e => {
      Sentry.captureException(e);
      res.send(404).send(e);
    });
  res.send(updatedUser);
});

routes.delete('/deleteUser', async (req, res) => {
  const deletedUser = await models.user.model.findByIdAndDelete({ _id: req.body.id }).catch(e => {
    Sentry.captureException(e);
    res.status(400).send(e);
  });
  const partiesWithUser = await models.party.model.find({
    $or: [{ participants: { $in: [req.body.userId] } }, { declines: { $in: [req.body.userId] } }]
  });
  await Promise.all(
    partiesWithUser.map(p => {
      if (p.declines.includes(req.body.id)) {
        const index = p.declines.indexOf(req.body.id);
        p.declines.splice(index, 1);
      }
      if (p.participants.includes(req.body.id)) {
        const index = p.participants.indexOf(req.body.id);
        p.participants.splice(index, 1);
      }
    })
  );
  res.send(deletedUser);
});

export default routes;

import { Router } from 'express';
import * as Sentry from '@sentry/node';
import models from '../models';
import { validatePhone, validateEmail, isOldEnough } from '../util/validators';
import { hashPassword, comparePasswords, dateFix, stringToDate } from '../util/helpers';
import { UserRole } from '../modules/userModel';

const routes = Router();

Sentry.configureScope(scope => {
  scope.setLevel(Sentry.Severity.Fatal);
  scope.setTag('UserService', `http://localhost:${process.env.PORT}`);
});

routes.get('/getUserByEmail', async (req, res) => {
  const user = await models.user.model.findOne({ email: req.query.email }).catch(e => {
    Sentry.captureException(e);
    res.status(404).send(e);
  });
  res.send(user);
});

// Athentication is handled by Auth0

routes.post('/register', async (req, res) => {
  const errors = { email: '', phone: '', birthDate: '' };
  if (!validateEmail(req.body.email)) errors.email = '';
  //if (!validatePhone(req.body.phone)) errors.phone = '';
  //if (!isOldEnough(stringToDate(req.body.birthDate))) errors.birthDate = '';
  if (errors.email !== '' || errors.phone !== '' || errors.birthDate !== '') res.send({ errors });
  //const hashedPass = await hashPassword(req.body.password);
  const user = await models.user.model.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    //telephone: req.body.telephone,
    email: req.body.email,
    //birthDate: stringToDate(req.body.birthDate),
    userRole: UserRole.USER,
    //password: hashedPass,
    maxDistance: req.body.maxDistance
  });
  res.send(user);
});

routes.post('/login', async (req, res) => {
  const user = await models.user.model.findOne({ email: req.body.email });
  if (!user) res.send({ error: `No user found with email: ${req.body.email}.` });
  //const isEqual = await comparePasswords(req.body.password, user.password);
  // if (!isEqual) {
  //   res.send({ error: `Passwords does not match, try again.` });
  // }
  res.send(user);
});

routes.put('/updateUser', async (req, res) => {
  const errors = { email: '', phone: '', birthDate: '' };
  if (!validateEmail(req.body.email)) errors.email = '';
  //if (!validatePhone(req.body.phone)) errors.phone = '';
  //if (!isOldEnough(dateFix(req.body.birthDate))) errors.birthDate = '';
  if (errors.email !== '' || errors.phone !== '' || errors.birthDate !== '') res.sendStatus(406).send({ errors });
  //const hashedPass = await hashPassword(req.body.password);
  const updatedUser = await models.user.model
    .findByIdAndUpdate(
      { _id: req.body._id },
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        //telephone: req.body.telephone,
        email: req.body.email,
        //birthDate: dateFix(req.body.birthDate),
        userRole: req.body.userRole,
        //password: hashedPass,
        maxDistance: req.body.maxDistance
      },
      { new: true, upsert: true }
    )
    .catch(e => {
      Sentry.captureException(e);
      res.sendStatus(404).send(e);
    });
  res.send(updatedUser);
});

routes.delete('/deleteUser', async (req, res) => {
  const deletedUser = await models.user.model.findByIdAndDelete({ _id: req.body.id }).catch(e => {
    Sentry.captureException(e);
    res.sendStatus(400).send(e);
  });
  await models.party.model.updateMany(
    { declines: { $in: [req.body.userId] } },
    { $pull: { declines: req.body.userId } }
  );
  await models.party.model.updateMany(
    { participants: { $in: [req.body.userId] } },
    { $pull: { participants: req.body.userId } }
  );
  res.send(deletedUser);
});

export default routes;

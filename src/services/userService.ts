import { Router } from 'express';
import models from '../models';
import { validatePhone, validateEmail, isOldEnough } from '../util/validators';
import { hashPassword, comparePasswords, stringToDate } from '../util/helpers';

const routes = Router();

routes.post('/register', async (req, res) => {
  const errors = { email: '', phone: '', birthDate: '' };
  if (!validateEmail(req.body.email)) errors.email = '';
  if (!validatePhone(req.body.phone)) errors.phone = '';
  if (!isOldEnough(stringToDate(req.body.birthDate))) errors.birthDate = '';
  if (errors.email !== '' || errors.phone !== '' || errors.birthDate !== '') res.send({ errors });
  const hashedPass = await hashPassword(req.body.password);
  const user = await models.user.model.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    telephone: req.body.telephone,
    email: req.body.email,
    birthDate: stringToDate(req.body.birthDate),
    userRole: req.body.userRole,
    password: hashedPass,
    maxDistance: req.body.maxDistance
  });
  res.send(user);
});

routes.post('/login', async (req, res) => {
  const user = await models.user.model.findOne({ email: req.body.email });
  if (!user) res.send({ error: `No user found with email: ${req.body.email}.` });
  const isEqual = await comparePasswords(req.body.password, user.password);
  if (!isEqual) {
    res.send({ error: `Passwords does not match, try again.` });
  }
  res.send(user);
});

routes.put('/updateUser', async (req, res) => {
  const errors = { email: '', phone: '', birthDate: '' };
  if (!validateEmail(req.body.email)) errors.email = '';
  if (!validatePhone(req.body.phone)) errors.phone = '';
  if (!isOldEnough(stringToDate(req.body.birthDate))) errors.birthDate = '';
  if (errors.email !== '' || errors.phone !== '' || errors.birthDate !== '') res.send({ errors });
  const hashedPass = await hashPassword(req.body.password);
  const updatedUser = await models.user.model.findByIdAndUpdate(
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
  );
  res.send(updatedUser);
});

routes.delete('/deleteUser', async (req, res) => {
  const deletedUser = await models.user.model.findByIdAndDelete({ _id: req.body.id });
  res.send(deletedUser);
});

export default routes;

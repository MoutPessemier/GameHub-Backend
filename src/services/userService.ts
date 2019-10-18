import { Router } from 'express';
import models from '../models';
import { validatePhone, validateEmail } from '../util/validators';
import { stringToDate } from '../util/parsers';

const routes = Router();

//TODO: encrypt password
routes.put('/updateUser', async (req, res) => {
  const errors = { email: '', phone: '' };
  if (!validateEmail(req.body.email)) errors.email = '';
  if (!validatePhone(req.body.phone)) errors.phone = '';
  if (errors.email !== '' && errors.phone !== '') res.send({ errors });
  const updatedUser = await models.user.model.findByIdAndUpdate(
    { _id: req.body.id },
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      telephone: req.body.telephone,
      email: req.body.email,
      birthDate: stringToDate(req.body.birthDate),
      userRole: req.body.userRole,
      password: req.body.password
    },
    { new: true, upsert: true }
  );
  res.send({ updatedUser });
});

routes.delete('deleteUser', async (req, res) => {
  await models.user.model.deleteOne({ _id: req.body.id });
  res.send({ id: req.body.id });
});

routes.post('/login', async (req, res) => {});

//TODO: encrypt password
//TODO: jwt
routes.post('/register', async (req, res) => {
  const errors = { email: '', phone: '' };
  if (!validateEmail(req.body.email)) errors.email = '';
  if (!validatePhone(req.body.phone)) errors.phone = '';
  if (errors.email !== '' && errors.phone !== '') res.send({ errors });
  const user = await models.user.model.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    telephone: req.body.telephone,
    email: req.body.email,
    birthDate: stringToDate(req.body.birthDate),
    userRole: req.body.userRole,
    password: req.body.password
  });
  res.send({ user });
});

export default routes;

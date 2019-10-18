import './config/environment';
import http, { Server } from 'http';
import express, { Express, Router } from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import * as Sentry from '@sentry/node';
import connect from './database/index';
import userRoutes from './services/userService';
import gameRoutes from './services/gameService';
import partyRoutes from './services/partyService';

// Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV });

const startServer = async () => {
  try {
    await connect();
    const app: Express = express();
    const routes = Router();
    app.use(bodyParser.json());
    app.use(routes);
    routes.get('/', (req, res) => res.send('OK'));
    routes.use('/', userRoutes);
    routes.use('/', gameRoutes);
    routes.use('/', partyRoutes);
    const httpServer: Server = http.createServer(app);
    httpServer.listen(process.env.PORT, async () => {
      console.log(`🚀 Server ready at http://localhost:${process.env.PORT}`);
    });
    const shutdown = async () => {
      await new Promise(resolve => httpServer.close(() => resolve()));
      await mongoose.disconnect();
      if (process.env.NODE_ENV === 'test') return;
      process.exit(0);
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    process.on('SIGQUIT', shutdown);
  } catch (e) {
    console.log(e);
  }
};

startServer();

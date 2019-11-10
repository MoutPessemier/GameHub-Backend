import mongoose from 'mongoose';
import * as Sentry from '@sentry/node';

const connect = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGOOSE_URI, {
      useNewUrlParser: true,
      dbName: process.env.MONGOOSE_NAME,
      config: { autoIndex: true },
      useFindAndModify: false,
      useCreateIndex: true,
      useUnifiedTopology: true
    });
    return connection;
  } catch (e) {
    Sentry.configureScope(scope => {
      scope.setLevel(Sentry.Severity.Fatal);
      scope.setTag('MongoDB', process.env.MONGODB_URI);
    });
    Sentry.captureException(e);
  }
};

export default connect;

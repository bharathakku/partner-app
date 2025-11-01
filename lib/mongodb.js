import { MongoClient } from 'mongodb';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongo;

if (!cached) {
  cached = global.mongo = { conn: null, promise: null };
}

export async function connectToDatabase() {
  // Validate env only when a connection is actually requested (prevents build-time crashes)
  if (!process.env.MONGODB_URI || !process.env.MONGODB_DB) {
    throw new Error('Please set MONGODB_URI and MONGODB_DB in environment to use the database');
  }
  if (cached.conn) {
    console.log('Using cached database connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    console.log('Creating new database connection to MongoDB');
    cached.promise = MongoClient.connect(process.env.MONGODB_URI, opts).then((client) => {
      console.log('Successfully connected to MongoDB');
      return {
        client,
        db: client.db(process.env.MONGODB_DB),
      };
    }).catch(error => {
      console.error('MongoDB connection error:', error);
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}


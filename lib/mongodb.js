import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

if (!process.env.MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB environment variable inside .env.local');
}

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

// Test the connection when this module is imported
connectToDatabase().then(() => {
  console.log('MongoDB connection test successful');
}).catch(err => {
  console.error('MongoDB connection test failed:', err);
});

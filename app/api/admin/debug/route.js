import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  console.log('=== DATABASE DEBUG ENDPOINT ===');
  
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const { db, client } = await connectToDatabase();
    
    if (!client || !client.topology || !client.topology.isConnected()) {
      throw new Error('❌ MongoDB client is not connected');
    }
    
    console.log('✅ Successfully connected to MongoDB');
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('📚 Collections:', collections.map(c => c.name));
    
    // Check if 'drivers' collection exists
    const driversCollection = collections.find(c => c.name === 'drivers');
    
    if (!driversCollection) {
      return Response.json({
        status: 'error',
        message: 'Drivers collection not found',
        availableCollections: collections.map(c => c.name)
      }, { status: 404 });
    }
    
    // Get count of all drivers
    const totalDrivers = await db.collection('drivers').countDocuments({});
    console.log(`📊 Total drivers: ${totalDrivers}`);
    
    // Get one sample driver
    const sampleDriver = await db.collection('drivers').findOne({});
    
    // Get recent drivers (last 10)
    const recentDrivers = await db.collection('drivers')
      .find({})
      .sort({ lastSeen: -1 })
      .limit(5)
      .toArray();
    
    // Get online drivers
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const onlineDrivers = await db.collection('drivers')
      .find({
        lastSeen: { $gte: fiveMinutesAgo },
        'location.coordinates': { $exists: true }
      })
      .toArray();
    
    return Response.json({
      status: 'success',
      database: db.databaseName,
      totalDrivers,
      sampleDriver,
      recentDrivers: recentDrivers.map(d => ({
        _id: d._id,
        name: d.name,
        phone: d.phone,
        lastSeen: d.lastSeen,
        isOnline: d.isOnline,
        location: d.location ? 'Exists' : 'Missing',
        status: d.status || 'unknown'
      })),
      onlineDriversCount: onlineDrivers.length,
      collections: collections.map(c => c.name)
    });
    
  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    return Response.json({
      status: 'error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

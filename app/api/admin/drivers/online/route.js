export async function GET() {
  console.log('=== FETCHING ONLINE DRIVERS ===');
  
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4001';
    const apiUrl = `${apiBase}/api/drivers/online`;
    
    console.log(`🌐 Fetching from backend API: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        // Add any required authentication headers here
      },
      // Add any other required options
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Backend API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      // Return a meaningful error response
      return Response.json({
        error: 'Failed to fetch drivers from backend',
        status: response.status,
        details: errorData
      }, { status: response.status });
    }
    
    const drivers = await response.json();
    console.log(`✅ Fetched ${Array.isArray(drivers) ? drivers.length : 0} drivers from backend`);
    
    // Transform the data to match the expected format
    const formattedDrivers = Array.isArray(drivers) ? drivers.map(driver => ({
      id: driver._id || driver.id || `driver-${Math.random().toString(36).substr(2, 9)}`,
      name: driver.name || 'Unknown Driver',
      email: driver.email || '',
      phone: driver.phone || '',
      vehicleNumber: driver.vehicleNumber || 'N/A',
      vehicleType: driver.vehicleType || 'bike',
      isOnline: driver.isOnline || false,
      lastSeen: driver.lastSeen || new Date(),
      status: driver.status || 'offline',
      location: driver.location || {
        type: 'Point',
        coordinates: [80.2319, 13.0827], // Default to Chennai
        address: 'Location not available'
      },
      currentOrder: driver.currentOrder || null,
      rating: driver.rating || 0,
      totalDeliveries: driver.totalDeliveries || 0,
      profilePhoto: driver.profilePhoto || '/default-avatar.png'
    })) : [];
    
    // If no drivers found, return empty array instead of test data
    if (formattedDrivers.length === 0) {
      console.log('ℹ️ No online drivers found');
      return Response.json([]);
    }
    
    return Response.json(formattedDrivers);
    
  } catch (error) {
    console.error('❌ Error in GET /api/admin/drivers/online:', error);
    return Response.json({
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
      profilePhoto: driver.profilePhoto || '/default-avatar.png'
    }));
    
    console.log('Returning drivers:', formattedDrivers.length);
    return Response.json(formattedDrivers);
    
  } catch (error) {
    console.error('Error in /api/admin/drivers/online:', error);
    
    // Return test data if there's an error in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Returning test data due to error');
      const testDriver = {
        id: 'test-error-123',
        name: 'Test Driver (Error Mode)',
        email: 'test@example.com',
        phone: '+1234567890',
        vehicleNumber: 'TN 01 CD 5678',
        vehicleType: 'car',
        isOnline: true,
        lastSeen: new Date(),
        status: 'online',
        location: {
          type: 'Point',
          coordinates: [80.2319, 13.0827], // Chennai coordinates
          address: 'Test Location (Error Mode), Chennai'
        },
        rating: 4.2,
        totalDeliveries: 24,
        profilePhoto: '/default-avatar.png'
      };
      
      return Response.json([testDriver]);
    }
    
    return Response.json(
      { 
        error: 'Failed to fetch online drivers',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

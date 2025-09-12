// Registration fees and vehicle types utility

export const VEHICLE_TYPES = {
  ACE_PICKUP: {
    id: 'ace_pickup',
    name: 'Ace Pickup',
    category: 'three-wheeler',
    description: '3-wheeler commercial pickup',
    registrationFee: 0,
    includes: [],
    icon: '🛻'
  },
  VAN: {
    id: 'van',
    name: 'Van',
    category: 'four-wheeler',
    description: 'Commercial van',
    registrationFee: 0,
    includes: [], 
    icon: '🚐'
  },
  TRUCK: {
    id: 'truck',
    name: 'Truck',
    category: 'heavy-vehicle',
    description: 'Light commercial vehicle',
    registrationFee: 0,
    includes: [],
    icon: '🚚'
  }
}

export const getVehicleTypesArray = () => {
  return Object.values(VEHICLE_TYPES)
}

export const getVehicleTypeById = (vehicleId) => {
  return getVehicleTypesArray().find(vehicle => vehicle.id === vehicleId)
}

export const calculateRegistrationFee = (vehicleType) => {
  const vehicle = typeof vehicleType === 'string' 
    ? getVehicleTypeById(vehicleType) 
    : vehicleType
  
  return vehicle ? vehicle.registrationFee : 0
}

export const getVehicleCategory = (vehicleType) => {
  const vehicle = typeof vehicleType === 'string' 
    ? getVehicleTypeById(vehicleType) 
    : vehicleType
  
  return vehicle ? vehicle.category : 'unknown'
}

export const isTwoWheeler = (vehicleType) => {
  const category = getVehicleCategory(vehicleType)
  return category === 'two-wheeler'
}

export const getRegistrationIncludes = (vehicleType) => {
  const vehicle = typeof vehicleType === 'string' 
    ? getVehicleTypeById(vehicleType) 
    : vehicleType
  
  return vehicle ? vehicle.includes : []
}

export const formatRegistrationFee = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Vehicle number validation
export const validateVehicleNumber = (vehicleNumber) => {
  // Indian vehicle number format validation
  const cleanNumber = vehicleNumber.replace(/\s/g, '').toUpperCase()
  
  // Format: XX00XX0000 (e.g., KA05AB1234)
  const vehicleRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/
  
  return vehicleRegex.test(cleanNumber)
}

export const formatVehicleNumber = (vehicleNumber) => {
  const cleanNumber = vehicleNumber.replace(/\s/g, '').toUpperCase()
  
  if (cleanNumber.length >= 4) {
    // Format as XX 00 XX 0000
    return cleanNumber.replace(/^([A-Z]{2})([0-9]{2})([A-Z]{1,2})([0-9]{4}).*/, '$1 $2 $3 $4')
  }
  
  return cleanNumber
}

// Default registration state
export const getDefaultRegistrationState = () => ({
  personalInfo: {
    fullName: '',
    email: '',
    aadharNumber: '',
    panNumber: ''
  },
  vehicleInfo: {
    vehicleType: 'ace_pickup',
    vehicleNumber: '',
    drivingLicense: '',
    vehiclePicture: null
  },
  documents: {
    aadhar: null,
    pan: null,
    drivingLicense: null,
    vehicleRC: null,
    vehiclePicture: null
  },
  registrationFee: {
    amount: 0,
    paid: true,
    paymentId: 'NO_FEE_REQUIRED'
  }
})

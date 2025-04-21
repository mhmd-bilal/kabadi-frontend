// Define interfaces for our data structure
export interface Player {
  id: string;
  number: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  city: string;
  players: Player[];
}

export interface MatchResult {
  homeScore: number;
  awayScore: number;
  winnerTeamId: string | null;
  bestRaider?: string;
  bestDefender?: string;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  location: string;
  groundName: string;
  startTime: string; // ISO string format
  status: 'scheduled' | 'in-progress' | 'completed';
  result: MatchResult | null;
}

export interface Ground {
  id: string;
  name: string;
  location: string;
  address: string;
  description: string;
  facilities: string[];
  contactNumber: string;
  capacity: number;
  status: 'open' | 'closed' | 'maintenance';
  rating: number;
  bookingFee: number;
  photos: string[];
  mapUrl: string;
  upcomingMatches: string[]; // Match IDs
  nearbyAmenities: {
    name: string;
    distance: string;
    type: 'restaurant' | 'parking' | 'hotel' | 'hospital' | 'transport';
  }[];
}

// Dummy Data
const dummyPlayers: Player[] = [
  { id: 'p1', number: '7', name: 'Arjun Singh' },
  { id: 'p2', number: '12', name: 'Vikram Rathore' },
  { id: 'p3', number: '5', name: 'Kabir Khan' }
];

const dummyTeams: Team[] = [
  {
    id: 't1',
    name: 'Thunderbolts',
    city: 'Mumbai',
    players: dummyPlayers
  },
  {
    id: 't2',
    name: 'Desert Storm',
    city: 'Jaipur',
    players: dummyPlayers
  }
];

const dummyMatches: Match[] = [
  {
    id: 'm1',
    homeTeamId: 't1',
    awayTeamId: 't2',
    location: 'Mumbai Arena',
    groundName: 'Kabaddi Ground 1',
    startTime: new Date().toISOString(),
    status: 'scheduled',
    result: null
  },
  {
    id: 'm2',
    homeTeamId: 't2',
    awayTeamId: 't1',
    location: 'Jaipur Stadium',
    groundName: 'Pink Arena',
    startTime: new Date().toISOString(),
    status: 'completed',
    result: {
      homeScore: 35,
      awayScore: 32,
      winnerTeamId: 't2',
      bestRaider: 'Vikram Rathore',
      bestDefender: 'Kabir Khan'
    }
  },
  {
    id: 'm3',
    homeTeamId: 't1',
    awayTeamId: 't2',
    location: 'Delhi Stadium',
    groundName: 'Central Court',
    startTime: new Date().toISOString(),
    status: 'in-progress',
    result: null
  }
];

const dummyGrounds: Ground[] = [
  {
    id: 'g1',
    name: 'Sunrise Arena',
    location: 'Mumbai, India',
    address: '123 Sports Complex, Andheri East, Mumbai 400069',
    description: 'A state-of-the-art kabaddi arena with modern facilities and a seating capacity of 5,000 spectators. Known for hosting major league matches and tournaments throughout the year.',
    facilities: ['Changing rooms', 'Spectator seating', 'Floodlights', 'Medical room', 'Cafeteria', 'Parking'],
    contactNumber: '+91 9876543210',
    capacity: 5000,
    status: 'open',
    rating: 4.8,
    bookingFee: 15000,
    photos: [
      'https://steelrays.in/assets-new/images/floorings/Kabbadi-02.jpg',
      'https://i.ytimg.com/vi/VVIVgUN7TIk/maxresdefault.jpg',
      'https://www.sportsturfaustralia.com.au/wp-content/uploads/2019/09/Melb-indoor-kabaddi-2.jpg'
    ],
    mapUrl: 'https://maps.google.com/?q=19.1136,72.8697',
    upcomingMatches: ['m1', 'm3'],
    nearbyAmenities: [
      { name: 'Sports Cafe', distance: '0.2 km', type: 'restaurant' },
      { name: 'Metro Station', distance: '0.5 km', type: 'transport' },
      { name: 'City Hospital', distance: '1.2 km', type: 'hospital' },
      { name: 'Hotel Comfort', distance: '0.8 km', type: 'hotel' }
    ]
  },
  {
    id: 'g2',
    name: 'Twilight Turf',
    location: 'Jaipur, India',
    address: '45 Heritage Sports Lane, Pink City, Jaipur 302001',
    description: 'A traditional kabaddi ground located in the heart of Jaipur. Features natural clay surface and open-air seating. Perfect for authentic kabaddi experience.',
    facilities: ['Basic changing areas', 'Traditional seating', 'Clay surface', 'Water facilities'],
    contactNumber: '+91 9876543211',
    capacity: 2000,
    status: 'closed',
    rating: 4.2,
    bookingFee: 8000,
    photos: [
      'https://rtescollege.co.in/wp-content/uploads/2023/03/KABADDI-COURT.jpeg',
      'https://img.indiafilings.com/learn/wp-content/uploads/2023/05/12010922/kabaddi-dimensions.jpg',
      'https://i0.wp.com/sportsmag.co.in/wp-content/uploads/2020/08/Screenshot_2020-08-30-KABADDI19-Google-Search.jpg'
    ],
    mapUrl: 'https://maps.google.com/?q=26.9124,75.7873',
    upcomingMatches: ['m2'],
    nearbyAmenities: [
      { name: 'Royal Spice Restaurant', distance: '0.3 km', type: 'restaurant' },
      { name: 'City Bus Station', distance: '1.0 km', type: 'transport' },
      { name: 'Heritage Hospital', distance: '2.0 km', type: 'hospital' },
      { name: 'Pink Palace Hotel', distance: '0.5 km', type: 'hotel' }
    ]
  },
  {
    id: 'g3',
    name: 'Central Court',
    location: 'Delhi, India',
    address: '67 National Sports Complex, New Delhi 110001',
    description: 'A premium indoor kabaddi court in the heart of Delhi. Features air conditioning, synthetic mats, and modern amenities for professional tournaments.',
    facilities: ['Air conditioning', 'VIP lounge', 'Premium seating', 'Media box', 'Food court', 'Pro shop', 'Gym'],
    contactNumber: '+91 9876543212',
    capacity: 8000,
    status: 'maintenance',
    rating: 4.9,
    bookingFee: 25000,
    photos: [
      'https://cdn.siasat.com/wp-content/uploads/2022/08/20220805_195541.jpg',
      'https://www.vhv.rs/dpng/d/541-5411917_kabaddi-court-measurement-in-meters-hd-png-download.png',
      'https://images.indianexpress.com/2016/01/kabaddi-l.jpg'
    ],
    mapUrl: 'https://maps.google.com/?q=28.6139,77.2090',
    upcomingMatches: [],
    nearbyAmenities: [
      { name: 'Delhi Food Plaza', distance: '0.1 km', type: 'restaurant' },
      { name: 'Metro Junction', distance: '0.3 km', type: 'transport' },
      { name: 'AIIMS Branch', distance: '1.5 km', type: 'hospital' },
      { name: 'Luxury Inn', distance: '0.7 km', type: 'hotel' },
      { name: 'Multi-level Parking', distance: '0.2 km', type: 'parking' }
    ]
  }
];

// Mocked data service
const dataHelper = {
  getTeams: async (): Promise<Team[]> => {
    return dummyTeams;
  },

  getMatches: async (): Promise<Match[]> => {
    return dummyMatches;
  },

  getTeamById: async (id: string): Promise<Team | undefined> => {
    return dummyTeams.find(team => team.id === id);
  },

  getMatchById: async (id: string): Promise<Match | undefined> => {
    return dummyMatches.find(match => match.id === id);
  },
  
  // Add new match or update existing match
  saveMatch: async (match: Match): Promise<void> => {
    const index = dummyMatches.findIndex(m => m.id === match.id);
    if (index !== -1) {
      // Update existing match
      dummyMatches[index] = match;
    } else {
      // Add new match
      dummyMatches.push(match);
    }
  },
  
  // Delete a match by ID
  deleteMatch: async (id: string): Promise<void> => {
    const index = dummyMatches.findIndex(match => match.id === id);
    if (index !== -1) {
      dummyMatches.splice(index, 1);
    }
  },

  // Get all grounds
  getGrounds: async (): Promise<Ground[]> => {
    return dummyGrounds;
  },

  // Get ground by ID
  getGroundById: async (id: string): Promise<Ground | undefined> => {
    return dummyGrounds.find(ground => ground.id === id);
  }
};

export default dataHelper;

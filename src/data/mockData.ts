import { 
  User, 
  PlatformRole, 
  Neighborhood, 
  Membership, 
  NeighborhoodRole, 
  Post, 
  Comment, 
  Listing, 
  Event, 
  EventRsvp, 
  Notification, 
  Report 
} from '../types';

export const SEED_USERS: User[] = [
  {
    id: 'user-shivanshu',
    name: 'Shivanshu Sharma',
    email: 'shivann2006@gmail.com',
    phone: '+91 98765 43210',
    role: PlatformRole.USER, // Creator
    isPhoneVerified: true,
    isEmailVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    bio: 'Software engineer and co-founder of ApnaArea. Passionate about hyper-local community development and civil public discussions.',
    joinedAt: '2026-06-01T09:00:00Z'
  },
  {
    id: 'user-priya',
    name: 'Priya Nair',
    email: 'priya.nair@example.com',
    phone: '+91 87654 32109',
    role: PlatformRole.USER,
    isPhoneVerified: true,
    isEmailVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    bio: 'Home baker and ceramicist. Love organizing community events and sharing freshly baked sourdough breads in Indiranagar.',
    joinedAt: '2026-06-10T11:30:00Z'
  },
  {
    id: 'user-arjun',
    name: 'Arjun Patel',
    email: 'arjun.patel@example.com',
    phone: '+91 76543 21098',
    role: PlatformRole.USER,
    isPhoneVerified: true,
    isEmailVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    bio: 'Dog dad, tree hugger, and active volunteer for lake restoration drives.',
    joinedAt: '2026-06-12T14:45:00Z'
  },
  {
    id: 'user-aditya',
    name: 'Aditya Rao',
    email: 'aditya.rao@example.com',
    phone: '+91 91234 56789',
    role: PlatformRole.USER,
    isPhoneVerified: false,
    isEmailVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    bio: 'Vintage enthusiast and mechanical typewriter collector. Running a quiet hardware repair shop around the corner.',
    joinedAt: '2026-06-15T10:15:00Z'
  },
  {
    id: 'user-dianne',
    name: 'Dinesh Rajput',
    email: 'dinesh.r@example.com',
    phone: '+91 99999 88888',
    role: PlatformRole.USER,
    isPhoneVerified: true,
    isEmailVerified: false,
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
    bio: 'Vintage curator. Love reading, writing, and meeting neighbors for tea.',
    joinedAt: '2026-06-18T16:20:00Z'
  }
];

export const SEED_NEIGHBORHOODS: Neighborhood[] = [
  {
    id: 'nb-miraloma',
    name: 'Miraloma Park',
    description: 'A cozy residential enclave in south Delhi, known for tree-lined avenues, quiet parks, and an active welfare association.',
    pincode: '110016',
    createdAt: '2026-06-01T09:00:00Z'
  },
  {
    id: 'nb-indiranagar',
    name: 'Indiranagar 2nd Stage',
    description: 'Bangalore\'s vibrant hub, blending leafy lanes, independent houses, boutique stores, and a deeply active resident community.',
    pincode: '560038',
    createdAt: '2026-06-05T10:00:00Z'
  },
  {
    id: 'nb-powai',
    name: 'Powai Hiranandani',
    description: 'Neoclassical towers, serene lakeside promenades, and a bustling neighborhood of tech builders and young families in Mumbai.',
    pincode: '400076',
    createdAt: '2026-06-08T12:00:00Z'
  }
];

export const SEED_MEMBERSHIPS: Membership[] = [
  // Shivanshu is a MODERATOR in Miraloma Park and Indiranagar
  {
    id: 'mem-1',
    userId: 'user-shivanshu',
    neighborhoodId: 'nb-miraloma',
    role: NeighborhoodRole.MODERATOR,
    createdAt: '2026-06-01T09:00:00Z'
  },
  {
    id: 'mem-2',
    userId: 'user-shivanshu',
    neighborhoodId: 'nb-indiranagar',
    role: NeighborhoodRole.MODERATOR,
    createdAt: '2026-06-05T11:00:00Z'
  },
  // Priya is a MODERATOR in Indiranagar and Resident in Miraloma
  {
    id: 'mem-3',
    userId: 'user-priya',
    neighborhoodId: 'nb-indiranagar',
    role: NeighborhoodRole.MODERATOR,
    createdAt: '2026-06-10T11:35:00Z'
  },
  {
    id: 'mem-4',
    userId: 'user-priya',
    neighborhoodId: 'nb-miraloma',
    role: NeighborhoodRole.RESIDENT,
    createdAt: '2026-06-11T12:00:00Z'
  },
  // Arjun is resident in Miraloma Park
  {
    id: 'mem-5',
    userId: 'user-arjun',
    neighborhoodId: 'nb-miraloma',
    role: NeighborhoodRole.RESIDENT,
    createdAt: '2026-06-12T14:50:00Z'
  },
  // Aditya is resident in Indiranagar
  {
    id: 'mem-6',
    userId: 'user-aditya',
    neighborhoodId: 'nb-indiranagar',
    role: NeighborhoodRole.RESIDENT,
    createdAt: '2026-06-15T10:30:00Z'
  },
  // Dianne is resident in Miraloma
  {
    id: 'mem-7',
    userId: 'user-dianne',
    neighborhoodId: 'nb-miraloma',
    role: NeighborhoodRole.RESIDENT,
    createdAt: '2026-06-18T16:25:00Z'
  }
];

export const SEED_POSTS: Post[] = [
  {
    id: 'post-1',
    neighborhoodId: 'nb-miraloma',
    userId: 'user-arjun',
    authorName: 'Arjun Patel',
    authorPhone: '+91 76543 21098',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    text: 'Looking for a reliable house cleaner! The lady who has been helping me with home cleaning for the past 15+ years is moving back to her hometown. Do you have any recommendations? Looking for someone who is punctual and trust-worthy for daily dusting and mopping.',
    createdAt: '2026-07-01T14:30:00Z',
    likesCount: 3,
    commentsCount: 2,
    reportsCount: 0,
    isHidden: false
  },
  {
    id: 'post-2',
    neighborhoodId: 'nb-miraloma',
    userId: 'user-dianne',
    authorName: 'Dinesh Rajput',
    authorPhone: '+91 99999 88888',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
    text: 'Lost and Found: Found a cute black pug wandering near Park Sector 3. It has a blue collar but no name tag. Currently, we have kept it safe inside our garage with some food and water. Extremely friendly! If this is yours or you know the owner, please let me know.',
    image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=600',
    createdAt: '2026-07-02T08:15:00Z',
    likesCount: 7,
    commentsCount: 1,
    reportsCount: 0,
    isHidden: false
  },
  {
    id: 'post-3',
    neighborhoodId: 'nb-indiranagar',
    userId: 'user-priya',
    authorName: 'Priya Nair',
    authorPhone: '+91 87654 32109',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    text: 'Community alert! The water supply in Indiranagar 2nd Stage will be restricted tomorrow (Saturday) from 9:00 AM to 5:00 PM due to standard pipeline cleaning works near the reservoir. Please store sufficient water beforehand.',
    createdAt: '2026-07-02T18:45:00Z',
    likesCount: 12,
    commentsCount: 0,
    reportsCount: 0,
    isHidden: false
  },
  // A post with multiple reports to demonstrate the threshold (currently 4 reports. 1 more triggers auto-hide!)
  {
    id: 'post-reported',
    neighborhoodId: 'nb-miraloma',
    userId: 'user-aditya',
    authorName: 'Aditya Sharma',
    authorPhone: '+91 00000 00000',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    text: 'CHEAP LOANS!!! Instant money credited to your account, no documents required! Click this suspicious link right now: http://scamloans.com/free-money-now',
    createdAt: '2026-07-02T22:00:00Z',
    likesCount: 0,
    commentsCount: 0,
    reportsCount: 4, // 4 reports
    isHidden: false
  }
];

export const SEED_COMMENTS: Comment[] = [
  {
    id: 'cmt-1',
    postId: 'post-1',
    userId: 'user-priya',
    authorName: 'Priya Nair',
    authorPhone: '+91 87654 32109',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    text: 'Hi Arjun! My house helper Geeta has an opening for a morning slot (8 AM to 9 AM). She has been with us for 4 years and is extremely reliable and thorough. I can share her contact details on personal message if you\'d like!',
    createdAt: '2026-07-01T15:10:00Z',
    likesCount: 2,
    reportsCount: 0,
    isHidden: false
  },
  {
    id: 'cmt-2',
    postId: 'post-1',
    userId: 'user-shivanshu',
    authorName: 'Shivanshu Sharma',
    authorPhone: '+91 98765 43210',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    text: 'Geeta is indeed very good! She also works at my neighbor\'s house and they speak very highly of her.',
    createdAt: '2026-07-01T15:45:00Z',
    likesCount: 1,
    reportsCount: 0,
    isHidden: false
  },
  {
    id: 'cmt-3',
    postId: 'post-2',
    userId: 'user-arjun',
    authorName: 'Arjun Patel',
    authorPhone: '+91 76543 21098',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    text: 'Oh, that looks like "Tyson"! He belongs to Sharma Uncle in Lane 4. I\'ll quickly give him a ring and tell him Tyson is safe with you. He was searching everywhere in the park!',
    createdAt: '2026-07-02T09:00:00Z',
    likesCount: 4,
    reportsCount: 0,
    isHidden: false
  }
];

export const SEED_LISTINGS: Listing[] = [
  {
    id: 'list-1',
    neighborhoodId: 'nb-miraloma',
    userId: 'user-dianne',
    authorName: 'Dinesh Rajput',
    authorPhone: '+91 99999 88888',
    title: 'Apple iPad Pro 11-inch (M1, Wi-Fi, 128GB)',
    description: 'Excellent condition iPad Pro with M1 chip. Always used with a screen protector and a rugged case. Includes the original box and charger. Battery health is at 92%, extremely snappy and perfect for taking notes, sketching, or watching videos.',
    price: 42000,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=600',
    status: 'ACTIVE',
    createdAt: '2026-06-25T11:00:00Z'
  },
  {
    id: 'list-2',
    neighborhoodId: 'nb-miraloma',
    userId: 'user-arjun',
    authorName: 'Arjun Patel',
    authorPhone: '+91 76543 21098',
    title: 'Lee Cooper Leather Boots (Size 9)',
    description: 'Genuine leather boots. Handcrafted, stylish finish, barely used (only twice for events). Free doorstep delivery in Miraloma Park!',
    price: 2499,
    category: 'Footwear',
    image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&q=80&w=600',
    status: 'ACTIVE',
    createdAt: '2026-06-28T14:00:00Z'
  },
  {
    id: 'list-3',
    neighborhoodId: 'nb-indiranagar',
    userId: 'user-priya',
    authorName: 'Priya Nair',
    authorPhone: '+91 87654 32109',
    title: 'Teal Ceramic Teapot Set',
    description: 'Charming handcrafted tea set. Includes 1 teapot and 4 matching cups. Made with local clay and organic non-toxic glazes.',
    price: 1200,
    category: 'Kitchenware',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600',
    status: 'ACTIVE',
    createdAt: '2026-06-30T10:00:00Z'
  },
  {
    id: 'list-4',
    neighborhoodId: 'nb-miraloma',
    userId: 'user-aditya',
    authorName: 'Aditya Rao',
    authorPhone: '+91 91234 56789',
    title: 'Ergonomic Mesh Office Chair',
    description: 'Highly comfortable work-from-home chair with adjustable lumbar support, neck rest, and 3D armrests. Selling because of relocation.',
    price: 1800,
    category: 'Furniture',
    image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=600',
    status: 'SOLD', // Test Sold rendering
    createdAt: '2026-06-20T09:30:00Z'
  }
];

export const SEED_EVENTS: Event[] = [
  {
    id: 'evt-1',
    neighborhoodId: 'nb-miraloma',
    userId: 'user-shivanshu',
    authorName: 'Shivanshu Sharma',
    title: 'Monsoon Chai & Gup-Shup Meetup',
    description: 'Let\'s gather at the central community park gazbo to welcome the monsoon with hot, freshly brewed ginger-cardamom cutting chai, hot samosas, and friendly local banter. Open to all residents!',
    dateTime: '2026-07-05T17:00:00',
    venue: 'Sector 3 Central Gazebo, Miraloma Park',
    createdAt: '2026-07-01T10:00:00Z'
  },
  {
    id: 'evt-2',
    neighborhoodId: 'nb-miraloma',
    userId: 'user-arjun',
    authorName: 'Arjun Patel',
    title: 'Neighborhood Anti-Plastic Drive',
    description: 'We will be collecting single-use plastic covers and bottles from public spots and parks. We will hand them over to the local recycling authority. Gloves and bags will be provided. Let\'s keep Miraloma green!',
    dateTime: '2026-07-12T07:30:00',
    venue: 'Sector 3 Park Main Gate',
    createdAt: '2026-07-02T11:00:00Z'
  },
  {
    id: 'evt-3',
    neighborhoodId: 'nb-indiranagar',
    userId: 'user-priya',
    authorName: 'Priya Nair',
    title: 'Sourdough Baking Workshop',
    description: 'Learn the fundamentals of wild yeast, stretch-and-fold techniques, scoring, and baking perfect open-crumb sourdough loaves at home. Limited to 8 participants.',
    dateTime: '2026-07-19T15:00:00',
    venue: 'Bakehouse Kitchen, Lane 12 Indiranagar',
    createdAt: '2026-06-29T16:00:00Z'
  }
];

export const SEED_RSVPS: EventRsvp[] = [
  {
    id: 'rsvp-1',
    eventId: 'evt-1',
    userId: 'user-shivanshu',
    response: 'GOING'
  },
  {
    id: 'rsvp-2',
    eventId: 'evt-1',
    userId: 'user-arjun',
    response: 'GOING'
  },
  {
    id: 'rsvp-3',
    eventId: 'evt-1',
    userId: 'user-priya',
    response: 'GOING'
  },
  {
    id: 'rsvp-4',
    eventId: 'evt-2',
    userId: 'user-arjun',
    response: 'GOING'
  }
];

export const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    recipientId: 'user-shivanshu',
    actorName: 'Priya Nair',
    type: 'LIKE_POST',
    targetId: 'post-1',
    targetTitle: 'Looking for a reliable house cleaner!',
    isRead: false,
    createdAt: '2026-07-01T15:50:00Z'
  },
  {
    id: 'notif-2',
    recipientId: 'user-shivanshu',
    actorName: 'Arjun Patel',
    type: 'COMMENT_POST',
    targetId: 'post-2',
    targetTitle: 'Lost and Found: Found a cute black pug',
    isRead: false,
    createdAt: '2026-07-02T09:05:00Z'
  },
  {
    id: 'notif-3',
    recipientId: 'user-shivanshu',
    actorName: 'System',
    type: 'WELCOME',
    targetId: 'nb-miraloma',
    targetTitle: 'Miraloma Park',
    isRead: true,
    createdAt: '2026-06-01T09:05:00Z'
  }
];

export const SEED_REPORTS: Report[] = [
  {
    id: 'rep-1',
    reporterId: 'user-shivanshu',
    reporterName: 'Shivanshu Sharma',
    targetId: 'post-reported',
    targetType: 'POST',
    targetText: 'CHEAP LOANS!!! Instant money credited...',
    reason: 'Spam',
    status: 'PENDING',
    createdAt: '2026-07-02T22:05:00Z'
  },
  {
    id: 'rep-2',
    reporterId: 'user-arjun',
    reporterName: 'Arjun Patel',
    targetId: 'post-reported',
    targetType: 'POST',
    targetText: 'CHEAP LOANS!!! Instant money credited...',
    reason: 'Spam',
    status: 'PENDING',
    createdAt: '2026-07-02T22:10:00Z'
  },
  {
    id: 'rep-3',
    reporterId: 'user-priya',
    reporterName: 'Priya Nair',
    targetId: 'post-reported',
    targetType: 'POST',
    targetText: 'CHEAP LOANS!!! Instant money credited...',
    reason: 'Spam',
    status: 'PENDING',
    createdAt: '2026-07-02T22:12:00Z'
  },
  {
    id: 'rep-4',
    reporterId: 'user-dianne',
    reporterName: 'Dinesh Rajput',
    targetId: 'post-reported',
    targetType: 'POST',
    targetText: 'CHEAP LOANS!!! Instant money credited...',
    reason: 'Spam',
    status: 'PENDING',
    createdAt: '2026-07-02T22:15:00Z'
  }
];

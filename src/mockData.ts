/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Pet, GroomingAppointment, VetVisit, VaccinationRecord, WeightEntry, DailyCareLog, VoiceProfile, VoiceLogEntry } from './types';

export const INITIAL_PETS: Pet[] = [
  {
    id: 'pet-1',
    name: 'Cooper',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: 3,
    weight: 32.4,
    photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400',
    gender: 'Male',
    emergencyContact: 'Dr. Sarah Woods (555-0192) / Owner: (555-0101)',
    medicalAlerts: 'Allergic to chicken proteins. Sensitive stomach; do not feed table scraps.'
  },
  {
    id: 'pet-2',
    name: 'Luna',
    species: 'Cat',
    breed: 'British Shorthair',
    age: 2,
    weight: 4.8,
    photoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400',
    gender: 'Female',
    emergencyContact: 'Westside Animal Hospital (555-0144) / Owner: (555-0101)',
    medicalAlerts: 'Slightly prone to dental tartar. Needs dental chews.'
  },
  {
    id: 'pet-3',
    name: 'Barnaby',
    species: 'Rabbit',
    breed: 'Holland Lop',
    age: 1,
    weight: 1.7,
    photoUrl: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=400',
    gender: 'Male',
    emergencyContact: 'Dr. Robert Carter - Exotic Pet Care (555-0188) / Owner: (555-0101)',
    medicalAlerts: 'Requires unlimited fresh Timothy Hay daily.'
  }
];

export const INITIAL_APPOINTMENTS: GroomingAppointment[] = [
  {
    id: 'appt-1',
    petId: 'pet-1',
    serviceName: 'Full Grooming',
    cost: 70,
    dateTime: '2026-06-11T10:00',
    instructions: 'Please deshed brush thoroughly. Keep ears clean.',
    status: 'scheduled'
  },
  {
    id: 'appt-2',
    petId: 'pet-2',
    serviceName: 'Nail Trim',
    cost: 15,
    dateTime: '2026-06-15T14:30',
    instructions: 'Luna is a bit nervous. Use soft towels and handles gently.',
    status: 'scheduled'
  },
  {
    id: 'appt-3',
    petId: 'pet-3',
    serviceName: 'Bath & Brush',
    cost: 25,
    dateTime: '2026-06-02T11:00',
    instructions: 'Extremely gentle dry brush. No water bath, use rabbit-safe dry spray.',
    status: 'completed'
  }
];

export const INITIAL_VET_VISITS: VetVisit[] = [
  {
    id: 'visit-1',
    petId: 'pet-1',
    date: '2026-05-15',
    reason: 'Annual Vaccination & Wellness check',
    vetName: 'Dr. Sarah Woods',
    cost: 120,
    notes: 'Heart looks strong. Lungs clear. Advised to stay active. Administered DHPP Booster.'
  },
  {
    id: 'visit-2',
    petId: 'pet-2',
    date: '2026-03-10',
    reason: 'Ear Scratching / Vet Check',
    vetName: 'Dr. Alan Miller',
    cost: 85,
    notes: 'Minor yeast build-up in left ear. Prescribed Otomax drops twice daily for 7 days. Resolved.'
  }
];

export const INITIAL_VACCINATIONS: VaccinationRecord[] = [
  {
    id: 'vac-1',
    petId: 'pet-1',
    vaccineName: 'Rabies Booster',
    dateGiven: '2025-05-15',
    dateDue: '2028-05-15'
  },
  {
    id: 'vac-2',
    petId: 'pet-1',
    vaccineName: 'DHPP (Distemper, Hepatitis, Parvovirus)',
    dateGiven: '2026-05-15',
    dateDue: '2027-05-15'
  },
  {
    id: 'vac-3',
    petId: 'pet-2',
    vaccineName: 'FVRCP',
    dateGiven: '2025-11-20',
    dateDue: '2026-11-20'
  },
  {
    id: 'vac-4',
    petId: 'pet-2',
    vaccineName: 'Rabies (1-Year)',
    dateGiven: '2026-02-14',
    dateDue: '2027-02-14'
  },
  {
    id: 'vac-overdue-1',
    petId: 'pet-3',
    vaccineName: 'RVHD (Rabbit Viral Haemorrhagic Disease)',
    dateGiven: '2025-05-10',
    dateDue: '2026-05-10'
  },
  {
    id: 'vac-upcoming-1',
    petId: 'pet-1',
    vaccineName: 'Bordetella Booster (Kennel Cough)',
    dateGiven: '2025-06-25',
    dateDue: '2026-06-25'
  }
];

export const INITIAL_WEIGHT_ENTRIES: WeightEntry[] = [
  // Cooper weight history
  { id: 'w-1', petId: 'pet-1', date: '2026-01-10', weight: 31.2 },
  { id: 'w-2', petId: 'pet-1', date: '2026-02-12', weight: 31.6 },
  { id: 'w-3', petId: 'pet-1', date: '2026-03-15', weight: 32.0 },
  { id: 'w-4', petId: 'pet-1', date: '2026-04-10', weight: 32.2 },
  { id: 'w-5', petId: 'pet-1', date: '2026-05-15', weight: 32.4 },
  { id: 'w-6', petId: 'pet-1', date: '2026-06-08', weight: 32.5 },

  // Luna weight history
  { id: 'w-7', petId: 'pet-2', date: '2026-01-15', weight: 4.4 },
  { id: 'w-8', petId: 'pet-2', date: '2026-02-18', weight: 4.5 },
  { id: 'w-9', petId: 'pet-2', date: '2026-03-10', weight: 4.6 },
  { id: 'w-10', petId: 'pet-2', date: '2026-04-12', weight: 4.7 },
  { id: 'w-11', petId: 'pet-2', date: '2026-05-14', weight: 4.8 },

  // Barnaby weight history
  { id: 'w-12', petId: 'pet-3', date: '2026-03-01', weight: 1.5 },
  { id: 'w-13', petId: 'pet-3', date: '2026-04-05', weight: 1.6 },
  { id: 'w-14', petId: 'pet-3', date: '2026-05-10', weight: 1.65 },
  { id: 'w-15', petId: 'pet-3', date: '2026-06-02', weight: 1.7 }
];

export const INITIAL_CARE_LOGS: DailyCareLog[] = [
  // Cooper Logs
  {
    id: 'log-1',
    petId: 'pet-1',
    type: 'feeding',
    date: '2026-06-09',
    time: '07:30',
    details: 'Salmon & Sweet Potato Kibble (2 cups)'
  },
  {
    id: 'log-2',
    petId: 'pet-1',
    type: 'walking',
    date: '2026-06-09',
    time: '08:00',
    details: 'Park run & fetch (40 mins)'
  },
  {
    id: 'log-3',
    petId: 'pet-1',
    type: 'medication',
    date: '2026-06-09',
    time: '08:30',
    details: 'Glucosamine joint supplement (1 tablet)'
  },

  // Luna Logs
  {
    id: 'log-4',
    petId: 'pet-2',
    type: 'feeding',
    date: '2026-06-09',
    time: '07:00',
    details: 'Wet canned food - Turkey paté (1 can)'
  },

  // Barnaby Logs
  {
    id: 'log-5',
    petId: 'pet-3',
    type: 'feeding',
    date: '2026-06-09',
    time: '07:15',
    details: 'Timothy hay refill & handful of fresh Romaine'
  },
  {
    id: 'log-6',
    petId: 'pet-3',
    type: 'walking',
    date: '2026-06-08',
    time: '16:00',
    details: 'Garden roaming playtime in fenced pen (60 mins)'
  }
];

export const INITIAL_TRACKING_STATES = [
  {
    petId: 'pet-1',
    latitude: 30,
    longitude: -45,
    safeZoneRadius: 150,
    batteryLevel: 82,
    beaconOn: false,
    signalStrength: 'excellent' as const
  },
  {
    petId: 'pet-2',
    latitude: -12,
    longitude: 20,
    safeZoneRadius: 100,
    batteryLevel: 94,
    beaconOn: false,
    signalStrength: 'good' as const
  },
  {
    petId: 'pet-3',
    latitude: -130,
    longitude: 110,
    safeZoneRadius: 100,
    batteryLevel: 35,
    beaconOn: true,
    signalStrength: 'poor' as const
  }
];

export const INITIAL_TRACKING_HISTORY = [
  {
    id: 'tr-1',
    petId: 'pet-1',
    timestamp: '11:15',
    date: '2026-06-09',
    locationName: 'Front Porch Steps',
    latitude: 10,
    longitude: -15,
    stepsCount: 4210
  },
  {
    id: 'tr-2',
    petId: 'pet-1',
    timestamp: '10:30',
    date: '2026-06-09',
    locationName: 'Backyard Lawn',
    latitude: 35,
    longitude: -55,
    stepsCount: 3950
  },
  {
    id: 'tr-3',
    petId: 'pet-1',
    timestamp: '08:45',
    date: '2026-06-09',
    locationName: 'Living Room Mat',
    latitude: 0,
    longitude: 0,
    stepsCount: 1120
  },
  // Luna History
  {
    id: 'tr-4',
    petId: 'pet-2',
    timestamp: '11:22',
    date: '2026-06-09',
    locationName: 'Sunny Windowsill Loft',
    latitude: -5,
    longitude: 12,
    stepsCount: 890
  },
  {
    id: 'tr-5',
    petId: 'pet-2',
    timestamp: '09:10',
    date: '2026-06-09',
    locationName: 'Kitchen Counterside',
    latitude: 15,
    longitude: -5,
    stepsCount: 520
  },
  // Barnaby Escaped History!
  {
    id: 'tr-6',
    petId: 'pet-3',
    timestamp: '11:32',
    date: '2026-06-09',
    locationName: 'Neighbor\'s Rose Bushes ⚠️',
    latitude: -130,
    longitude: 110,
    stepsCount: 1980
  },
  {
    id: 'tr-7',
    petId: 'pet-3',
    timestamp: '11:00',
    date: '2026-06-09',
    locationName: 'Fenced Rabbit Grass Pen',
    latitude: -30,
    longitude: 35,
    stepsCount: 1650
  },
  {
    id: 'tr-8',
    petId: 'pet-3',
    timestamp: '09:30',
    date: '2026-06-09',
    locationName: 'Rabbit Hutch Bedding',
    latitude: 0,
    longitude: 0,
    stepsCount: 410
  }
];

export const INITIAL_VOICE_PROFILES: VoiceProfile[] = [
  {
    petId: 'pet-1', // Cooper (Dog)
    hasTrainedVoice: true,
    frequencyHz: 480,
    vocalTexture: 'resonant bass boom',
    barkPattern: 'double-burst-staccato',
    trainedDate: '2026-06-05'
  },
  {
    petId: 'pet-2', // Luna (Cat)
    hasTrainedVoice: true,
    frequencyHz: 310,
    vocalTexture: 'musical high harmonic',
    barkPattern: 'single-chirp meow',
    trainedDate: '2026-06-07'
  },
  {
    petId: 'pet-3', // Barnaby (Rabbit)
    hasTrainedVoice: false,
    frequencyHz: 1100,
    vocalTexture: 'ultra-high raspy scratch',
    barkPattern: 'rhythmic-squeak',
    trainedDate: '2026-06-08'
  }
];

export const INITIAL_VOICE_LOGS: VoiceLogEntry[] = [
  {
    id: 'vlog-1',
    petId: 'pet-1',
    timestamp: '11:45',
    date: '2026-06-09',
    vocalDurationSec: 0.8,
    pitchHz: 495,
    identifiedEmotion: 'Playful Excitement',
    confidenceScore: 92,
    translatedText: "Human! I brought you the red tennis ball. Throw it immediately! Run!"
  },
  {
    id: 'vlog-2',
    petId: 'pet-2',
    timestamp: '08:30',
    date: '2026-06-09',
    vocalDurationSec: 1.2,
    pitchHz: 305,
    identifiedEmotion: 'Demanding food',
    confidenceScore: 97,
    translatedText: "My dry food bowl surface contains a visual spot of silver metal. This means I am starving. Please rectify this immediately."
  },
  {
    id: 'vlog-3',
    petId: 'pet-1',
    timestamp: '19:15',
    date: '2026-06-08',
    vocalDurationSec: 2.1,
    pitchHz: 530,
    identifiedEmotion: 'Alert / Warning Alarm',
    confidenceScore: 89,
    translatedText: "An intruder (which might be a tiny dust particle or leaf) is floating on the patio! Immediate alarm sequence!"
  }
];



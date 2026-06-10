/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Pet {
  id: string;
  name: string;
  species: 'Dog' | 'Cat' | 'Rabbit' | 'Bird' | 'Other';
  breed: string;
  age: number; // in years or months
  weight: number; // in kg or lbs
  photoUrl: string;
  gender: 'Male' | 'Female' | 'Unknown';
  emergencyContact: string; // Phone number or name & number
  medicalAlerts: string; // Allergies, chronic conditions, etc.
}

export interface GroomingAppointment {
  id: string;
  petId: string;
  serviceName: string;
  cost: number;
  dateTime: string; // ISO string or YYYY-MM-DDTHH:MM
  instructions: string;
  status: 'scheduled' | 'cancelled' | 'completed';
}

export interface VetVisit {
  id: string;
  petId: string;
  date: string; // YYYY-MM-DD
  reason: string;
  vetName: string;
  cost: number;
  notes: string;
}

export interface VaccinationRecord {
  id: string;
  petId: string;
  vaccineName: string;
  dateGiven: string; // YYYY-MM-DD
  dateDue: string; // YYYY-MM-DD
}

export interface WeightEntry {
  id: string;
  petId: string;
  date: string; // YYYY-MM-DD
  weight: number;
}

export type CareLogType = 'feeding' | 'walking' | 'medication';

export interface DailyCareLog {
  id: string;
  petId: string;
  type: CareLogType;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  details: string; // "Premium Kibble, 1.5 cups" or "30 mins stroll" or "Heartworm tablet"
}

export interface PetTrackingState {
  petId: string;
  latitude: number; // offset from home center (-200 to +200 px for our custom visual radar)
  longitude: number; // offset from home center (-200 to +200 px)
  safeZoneRadius: number; // safe perimeter radius in pixels / meters
  batteryLevel: number; // 0 to 100
  beaconOn: boolean;
  signalStrength: 'excellent' | 'good' | 'poor' | 'searching';
}

export interface TrackingHistoryEntry {
  id: string;
  petId: string;
  timestamp: string; // HH:MM
  date: string; // YYYY-MM-DD
  locationName: string; // e.g., "Living Room Lounge", "Over the Geofence Edge", "Front Yard Porch"
  latitude: number;
  longitude: number;
  stepsCount: number;
}

export interface VoiceProfile {
  petId: string;
  hasTrainedVoice: boolean;
  frequencyHz: number; // Pitch fundamental frequency
  vocalTexture: string; // e.g. "raspy", "resonant", "high-staccato", "harmonic-purr"
  barkPattern: string; // e.g. "double-burst-staccato", "single-chirp", "rhythmic-rumble"
  trainedDate: string; // YYYY-MM-DD
}

export interface VoiceLogEntry {
  id: string;
  petId: string;
  timestamp: string; // HH:MM
  date: string; // YYYY-MM-DD
  vocalDurationSec: number;
  pitchHz: number;
  identifiedEmotion: string; // e.g., "Demanding food", "Playful Excitement", "Alert / Warning Alarm"
  confidenceScore: number; // 0 to 100
  translatedText: string;
}



/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Pet, GroomingAppointment, VetVisit, VaccinationRecord, WeightEntry, DailyCareLog, PetTrackingState, TrackingHistoryEntry, VoiceProfile, VoiceLogEntry } from './types';
import {
  INITIAL_PETS,
  INITIAL_APPOINTMENTS,
  INITIAL_VET_VISITS,
  INITIAL_VACCINATIONS,
  INITIAL_WEIGHT_ENTRIES,
  INITIAL_CARE_LOGS,
  INITIAL_TRACKING_STATES,
  INITIAL_TRACKING_HISTORY,
  INITIAL_VOICE_PROFILES,
  INITIAL_VOICE_LOGS
} from './mockData';

// Component Imports
import Dashboard from './components/Dashboard';
import PetProfiles from './components/PetProfiles';
import GroomingScheduler from './components/GroomingScheduler';
import HealthTracker from './components/HealthTracker';
import DailyCareLogTab from './components/DailyCareLogTab';
import QrCodeGenerator from './components/QrCodeGenerator';
import PetTracking from './components/PetTracking';
import PetVoiceRecognition from './components/PetVoiceRecognition';

// Icon imports
import { PawPrint, Home, User, Scissors, HeartPulse, Clipboard, QrCode, Radio, Mic } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Core State Engine
  const [pets, setPets] = useState<Pet[]>([]);
  const [appointments, setAppointments] = useState<GroomingAppointment[]>([]);
  const [vetVisits, setVetVisits] = useState<VetVisit[]>([]);
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([]);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [careLogs, setCareLogs] = useState<DailyCareLog[]>([]);
  const [trackingStates, setTrackingStates] = useState<PetTrackingState[]>([]);
  const [trackingHistory, setTrackingHistory] = useState<TrackingHistoryEntry[]>([]);
  const [voiceProfiles, setVoiceProfiles] = useState<VoiceProfile[]>([]);
  const [voiceLogs, setVoiceLogs] = useState<VoiceLogEntry[]>([]);

  // Load state from localStorage on Mount
  useEffect(() => {
    try {
      const storedPets = localStorage.getItem('petCare_pets');
      const storedAppts = localStorage.getItem('petCare_appointments');
      const storedVisits = localStorage.getItem('petCare_vetVisits');
      const storedVaccines = localStorage.getItem('petCare_vaccinations');
      const storedWeights = localStorage.getItem('petCare_weightEntries');
      const storedLogs = localStorage.getItem('petCare_careLogs');
      const storedTrackingStates = localStorage.getItem('petCare_trackingStates');
      const storedTrackingHistory = localStorage.getItem('petCare_trackingHistory');
      const storedVoiceProfiles = localStorage.getItem('petCare_voiceProfiles');
      const storedVoiceLogs = localStorage.getItem('petCare_voiceLogs');

      setPets(storedPets ? JSON.parse(storedPets) : INITIAL_PETS);
      setAppointments(storedAppts ? JSON.parse(storedAppts) : INITIAL_APPOINTMENTS);
      setVetVisits(storedVisits ? JSON.parse(storedVisits) : INITIAL_VET_VISITS);
      setVaccinations(storedVaccines ? JSON.parse(storedVaccines) : INITIAL_VACCINATIONS);
      setWeightEntries(storedWeights ? JSON.parse(storedWeights) : INITIAL_WEIGHT_ENTRIES);
      setCareLogs(storedLogs ? JSON.parse(storedLogs) : INITIAL_CARE_LOGS);
      setTrackingStates(storedTrackingStates ? JSON.parse(storedTrackingStates) : INITIAL_TRACKING_STATES);
      setTrackingHistory(storedTrackingHistory ? JSON.parse(storedTrackingHistory) : INITIAL_TRACKING_HISTORY);
      setVoiceProfiles(storedVoiceProfiles ? JSON.parse(storedVoiceProfiles) : INITIAL_VOICE_PROFILES);
      setVoiceLogs(storedVoiceLogs ? JSON.parse(storedVoiceLogs) : INITIAL_VOICE_LOGS);
    } catch (e) {
      console.error('LocalStorage parsing error. Reverting to initial templates.', e);
      setPets(INITIAL_PETS);
      setAppointments(INITIAL_APPOINTMENTS);
      setVetVisits(INITIAL_VET_VISITS);
      setVaccinations(INITIAL_VACCINATIONS);
      setWeightEntries(INITIAL_WEIGHT_ENTRIES);
      setCareLogs(INITIAL_CARE_LOGS);
      setTrackingStates(INITIAL_TRACKING_STATES);
      setTrackingHistory(INITIAL_TRACKING_HISTORY);
      setVoiceProfiles(INITIAL_VOICE_PROFILES);
      setVoiceLogs(INITIAL_VOICE_LOGS);
    }
  }, []);

  // Save states to local storage upon modification
  const saveState = (key: string, data: any) => {
    try {
      localStorage.setItem(`petCare_${key}`, JSON.stringify(data));
    } catch (e) {
      console.error(`Local file system storage failure for key ${key}:`, e);
    }
  };

  // State Mutation Actions
  const handleAddPet = (newPet: Omit<Pet, 'id'>) => {
    const freshPet: Pet = {
      ...newPet,
      id: `pet-${Date.now()}`
    };
    const updated = [...pets, freshPet];
    setPets(updated);
    saveState('pets', updated);

    // Seed an initial weight entry for the new pet so they show on the charts!
    const freshWeight: WeightEntry = {
      id: `w-${Date.now()}`,
      petId: freshPet.id,
      date: new Date().toISOString().split('T')[0],
      weight: freshPet.weight
    };
    const updatedWeights = [...weightEntries, freshWeight];
    setWeightEntries(updatedWeights);
    saveState('weightEntries', updatedWeights);

    // Seed a tracker telemetry state for the new companion!
    const freshTracker: PetTrackingState = {
      petId: freshPet.id,
      latitude: 0,
      longitude: 0,
      safeZoneRadius: 120,
      batteryLevel: 100,
      beaconOn: false,
      signalStrength: 'excellent' as const
    };
    const updatedTrackers = [...trackingStates, freshTracker];
    setTrackingStates(updatedTrackers);
    saveState('trackingStates', updatedTrackers);

    // Seed an initial history checkin
    const freshTrackHist: TrackingHistoryEntry = {
      id: `tr-${Date.now()}`,
      petId: freshPet.id,
      timestamp: new Date().toTimeString().slice(0, 5),
      date: new Date().toISOString().split('T')[0],
      locationName: 'Registration Point / Home Base Center',
      latitude: 0,
      longitude: 0,
      stepsCount: 0
    };
    const updatedHist = [freshTrackHist, ...trackingHistory];
    setTrackingHistory(updatedHist);
    saveState('trackingHistory', updatedHist);

    // Seed a voice recognition profile!
    const freshVoiceProfile: VoiceProfile = {
      petId: freshPet.id,
      hasTrainedVoice: false,
      frequencyHz: freshPet.species === 'Dog' ? 450 : freshPet.species === 'Cat' ? 310 : 1000,
      vocalTexture: 'untrained frequency signature',
      barkPattern: 'standard dynamic pulse',
      trainedDate: 'Untrained'
    };
    const updatedVoiceProfiles = [...voiceProfiles, freshVoiceProfile];
    setVoiceProfiles(updatedVoiceProfiles);
    saveState('voiceProfiles', updatedVoiceProfiles);
  };

  const handleEditPet = (id: string, updatedFields: Partial<Pet>) => {
    const updated = pets.map(pet => (pet.id === id ? { ...pet, ...updatedFields } : pet));
    setPets(updated);
    saveState('pets', updated);
  };

  const handleDeletePet = (id: string) => {
    // 1. Remove pet
    const updatedPets = pets.filter(pet => pet.id !== id);
    setPets(updatedPets);
    saveState('pets', updatedPets);

    // 2. Cascade delete dependent elements to keep state clean (like a real SQL cascading delete!)
    const updatedAppts = appointments.filter(a => a.petId !== id);
    setAppointments(updatedAppts);
    saveState('appointments', updatedAppts);

    const updatedVisits = vetVisits.filter(v => v.petId !== id);
    setVetVisits(updatedVisits);
    saveState('vetVisits', updatedVisits);

    const updatedVaccines = vaccinations.filter(v => v.petId !== id);
    setVaccinations(updatedVaccines);
    saveState('vaccinations', updatedVaccines);

    const updatedWeights = weightEntries.filter(w => w.petId !== id);
    setWeightEntries(updatedWeights);
    saveState('weightEntries', updatedWeights);

    const updatedLogs = careLogs.filter(l => l.petId !== id);
    setCareLogs(updatedLogs);
    saveState('careLogs', updatedLogs);

    const updatedTracking = trackingStates.filter(s => s.petId !== id);
    setTrackingStates(updatedTracking);
    saveState('trackingStates', updatedTracking);

    const updatedTrackHist = trackingHistory.filter(h => h.petId !== id);
    setTrackingHistory(updatedTrackHist);
    saveState('trackingHistory', updatedTrackHist);

    const updatedVProfiles = voiceProfiles.filter(vp => vp.petId !== id);
    setVoiceProfiles(updatedVProfiles);
    saveState('voiceProfiles', updatedVProfiles);

    const updatedVLogs = voiceLogs.filter(vl => vl.petId !== id);
    setVoiceLogs(updatedVLogs);
    saveState('voiceLogs', updatedVLogs);
  };

  const handleUpdateTrackingState = (updatedState: PetTrackingState) => {
    const exists = trackingStates.some(s => s.petId === updatedState.petId);
    let next: PetTrackingState[];
    if (exists) {
      next = trackingStates.map(s => s.petId === updatedState.petId ? updatedState : s);
    } else {
      next = [...trackingStates, updatedState];
    }
    setTrackingStates(next);
    saveState('trackingStates', next);
  };

  const handleUpdateVoiceProfile = (updatedProfile: VoiceProfile) => {
    const exists = voiceProfiles.some(v => v.petId === updatedProfile.petId);
    let next: VoiceProfile[];
    if (exists) {
      next = voiceProfiles.map(v => v.petId === updatedProfile.petId ? updatedProfile : v);
    } else {
      next = [...voiceProfiles, updatedProfile];
    }
    setVoiceProfiles(next);
    saveState('voiceProfiles', next);
  };

  const handleAddVoiceLog = (newEntry: VoiceLogEntry) => {
    const next = [newEntry, ...voiceLogs];
    setVoiceLogs(next);
    saveState('voiceLogs', next);
  };

  const handleClearVoiceLogs = (petId: string) => {
    const next = voiceLogs.filter(log => log.petId !== petId);
    setVoiceLogs(next);
    saveState('voiceLogs', next);
  };

  const handleAddTrackingHistory = (newEntry: TrackingHistoryEntry) => {
    const next = [newEntry, ...trackingHistory];
    setTrackingHistory(next);
    saveState('trackingHistory', next);
  };

  const handleClearTrackingHistory = (petId: string) => {
    const next = trackingHistory.filter(h => h.petId !== petId);
    setTrackingHistory(next);
    saveState('trackingHistory', next);
  };

  const handleAddAppointment = (newAppt: Omit<GroomingAppointment, 'id'>) => {
    const fresh: GroomingAppointment = {
      ...newAppt,
      id: `appt-${Date.now()}`
    };
    const updated = [...appointments, fresh];
    setAppointments(updated);
    saveState('appointments', updated);
  };

  const handleCancelAppointment = (id: string) => {
    // Modify status style instead of hard deleting to preserve historic registries
    const updated = appointments.map(appt =>
      appt.id === id ? { ...appt, status: 'cancelled' as const } : appt
    );
    setAppointments(updated);
    saveState('appointments', updated);
  };

  const handleAddVetVisit = (newVisit: Omit<VetVisit, 'id'>) => {
    const fresh: VetVisit = {
      ...newVisit,
      id: `visit-${Date.now()}`
    };
    const updated = [...vetVisits, fresh];
    setVetVisits(updated);
    saveState('vetVisits', updated);
  };

  const handleAddVaccination = (newRecord: Omit<VaccinationRecord, 'id'>) => {
    const fresh: VaccinationRecord = {
      ...newRecord,
      id: `vac-${Date.now()}`
    };
    const updated = [...vaccinations, fresh];
    setVaccinations(updated);
    saveState('vaccinations', updated);
  };

  const handleAddWeightEntry = (newWeight: Omit<WeightEntry, 'id'>) => {
    const fresh: WeightEntry = {
      ...newWeight,
      id: `w-${Date.now()}`
    };
    const updated = [...weightEntries, fresh];
    setWeightEntries(updated);
    saveState('weightEntries', updated);

    // Automatically update current weight on the respective Pet Profile!
    const updatedPets = pets.map(pet =>
      pet.id === newWeight.petId ? { ...pet, weight: newWeight.weight } : pet
    );
    setPets(updatedPets);
    saveState('pets', updatedPets);
  };

  const handleAddCareLog = (newLog: Omit<DailyCareLog, 'id'>) => {
    const fresh: DailyCareLog = {
      ...newLog,
      id: `log-${Date.now()}`
    };
    const updated = [...careLogs, fresh];
    setCareLogs(updated);
    saveState('careLogs', updated);
  };

  return (
    <div id="application-container" className="min-h-screen bg-stone-50/50 flex flex-col antialiased text-stone-800">
      
      {/* Primary Header */}
      <header id="site-header" className="bg-white border-b border-stone-150 px-4 py-4.5 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-3">
        {/* Title */}
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 bg-amber-800 rounded-2xl flex items-center justify-center text-white text-xl shadow-xs">
            <PawPrint size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-stone-800 select-none">PetCare Central</h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#d97706] mt-0.5">Compassionate Wellness Index</p>
          </div>
        </div>

        {/* Global Date Panel */}
        <div id="header-diagnostics" className="flex items-center gap-1.5 font-mono text-stone-400 font-bold bg-stone-50 border border-stone-200/50 px-3 py-1.5 rounded-xl text-xs">
          <span>📅 Date: June 9, 2026</span>
          <span className="text-amber-500">•</span>
          <span>Companion Count: {pets.length}</span>
        </div>
      </header>

      {/* Main Workspace Layout (Sidebar Navigation + Dynamic Dashboard) */}
      <div id="main-application-workspace" className="flex-1 flex flex-col md:flex-row">
        
        {/* Sticky Sidebar Navigation (Responsive Bottom dock on mobile, Left rail on desktop) */}
        <aside id="sidebar-panel" className="bg-white border-b md:border-b-0 md:border-r border-stone-150 p-4 shrink-0 w-full md:w-64">
          <nav id="nav-primary" className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-none">
            {/* List links */}
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <Home size={16} />, emoji: '🏠' },
              { id: 'profiles', label: 'Companion Profiles', icon: <User size={16} />, emoji: '🐾' },
              { id: 'grooming', label: 'Grooming Scheduler', icon: <Scissors size={16} />, emoji: '✂️' },
              { id: 'health', label: 'Health & Vaccines', icon: <HeartPulse size={16} />, emoji: '💊' },
              { id: 'logs', label: 'Care Log', icon: <Clipboard size={16} />, emoji: '📝' },
              { id: 'voice', label: 'Voice Identifier', icon: <Mic size={16} />, emoji: '🎙️' },
              { id: 'tracking', label: 'Live GPS Tracking', icon: <Radio size={16} />, emoji: '📡' },
              { id: 'qr', label: 'Emergency QR Tags', icon: <QrCode size={16} />, emoji: '🛡️' }
            ].map(tab => (
              <button
                key={tab.id}
                id={`nav-link-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-amber-800 text-stone-50 shadow-md font-extrabold scale-102 border-amber-900 duration-150'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900 border border-transparent'
                }`}
              >
                <span className="shrink-0">{tab.icon}</span>
                <span className="font-sans leading-none">{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Dynamic Canvas Workspace */}
        <main id="active-viewport" className="flex-1 p-4 sm:p-7 max-w-7xl mx-auto w-full overflow-hidden">
          {activeTab === 'dashboard' && (
            <Dashboard
              pets={pets}
              appointments={appointments}
              vaccinations={vaccinations}
              careLogs={careLogs}
              weightEntries={weightEntries}
              onAddCareLog={handleAddCareLog}
              onSetActiveTab={setActiveTab}
              trackingStates={trackingStates}
            />
          )}

          {activeTab === 'profiles' && (
            <PetProfiles
              pets={pets}
              onAddPet={handleAddPet}
              onEditPet={handleEditPet}
              onDeletePet={handleDeletePet}
            />
          )}

          {activeTab === 'grooming' && (
            <GroomingScheduler
              pets={pets}
              appointments={appointments}
              onAddAppointment={handleAddAppointment}
              onCancelAppointment={handleCancelAppointment}
            />
          )}

          {activeTab === 'health' && (
            <HealthTracker
              pets={pets}
              vetVisits={vetVisits}
              vaccinations={vaccinations}
              weightEntries={weightEntries}
              onAddVetVisit={handleAddVetVisit}
              onAddVaccination={handleAddVaccination}
              onAddWeightEntry={handleAddWeightEntry}
            />
          )}

          {activeTab === 'logs' && (
            <DailyCareLogTab
              pets={pets}
              careLogs={careLogs}
              onAddCareLog={handleAddCareLog}
            />
          )}

          {activeTab === 'tracking' && (
            <PetTracking
              pets={pets}
              trackingStates={trackingStates}
              trackingHistory={trackingHistory}
              onUpdateState={handleUpdateTrackingState}
              onAddHistory={handleAddTrackingHistory}
              onClearHistory={handleClearTrackingHistory}
            />
          )}

          {activeTab === 'qr' && (
            <QrCodeGenerator
              pets={pets}
            />
          )}

          {activeTab === 'voice' && (
            <PetVoiceRecognition
              pets={pets}
              voiceProfiles={voiceProfiles}
              voiceLogs={voiceLogs}
              onUpdateProfile={handleUpdateVoiceProfile}
              onAddVoiceLog={handleAddVoiceLog}
              onClearLogs={handleClearVoiceLogs}
            />
          )}
        </main>

      </div>

      {/* Humble Footer */}
      <footer id="site-footer" className="bg-white border-t border-stone-150 p-4 text-center text-[10px] text-stone-400 font-sans tracking-wide">
        &copy; 2026 PetCare Ltd. Built with clinical precision and friendly warmth for happy companions.
      </footer>
    </div>
  );
}


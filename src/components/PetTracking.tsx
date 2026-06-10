/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect, useRef } from 'react';
import { Pet, PetTrackingState, TrackingHistoryEntry } from '../types';
import {
  Compass,
  Battery,
  Signal,
  MapPin,
  Radio,
  Navigation,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  Footprints,
  Flame,
  Plus,
  RefreshCw,
  Volume2,
  Waves,
  Lightbulb,
  Trash2,
  Locate,
  History
} from 'lucide-react';

interface PetTrackingProps {
  pets: Pet[];
  trackingStates: PetTrackingState[];
  trackingHistory: TrackingHistoryEntry[];
  onUpdateState: (state: PetTrackingState) => void;
  onAddHistory: (entry: TrackingHistoryEntry) => void;
  onClearHistory: (petId: string) => void;
}

export default function PetTracking({
  pets,
  trackingStates,
  trackingHistory,
  onUpdateState,
  onAddHistory,
  onClearHistory
}: PetTrackingProps) {
  // Master state for current selected pet
  const [selectedPetId, setSelectedPetId] = useState<string>(pets.length > 0 ? pets[0].id : '');
  
  // Custom manual tracking spot form state
  const [customPlace, setCustomPlace] = useState<string>('');
  
  // Feedback logs for collar action transmissions
  const [collarMessage, setCollarMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' | null }>({
    text: '',
    type: null
  });

  // Automatically select first pet on mount if not selected
  useEffect(() => {
    if (!selectedPetId && pets.length > 0) {
      setSelectedPetId(pets[0].id);
    }
  }, [pets, selectedPetId]);

  const selectedPet = pets.find(p => p.id === selectedPetId);
  const selectedState = trackingStates.find(s => s.petId === selectedPetId) || {
    petId: selectedPetId,
    latitude: 0,
    longitude: 0,
    safeZoneRadius: 150,
    batteryLevel: 100,
    beaconOn: false,
    signalStrength: 'excellent' as const
  };

  const selectedHistory = trackingHistory.filter(h => h.petId === selectedPetId);

  // Compute distance from Home Base (0, 0)
  const distance = Math.round(
    Math.sqrt(selectedState.latitude * selectedState.latitude + selectedState.longitude * selectedState.longitude)
  );

  const isBreached = distance > selectedState.safeZoneRadius;

  // Sound Buzzer dispatch
  const handleTriggerBuzzer = () => {
    setCollarMessage({
      text: `🔊 Transmitting warning beep to ${selectedPet?.name}'s collar speaker! (Simulated Sound emitted)`,
      type: 'success'
    });
    setTimeout(() => setCollarMessage({ text: '', type: null }), 4500);

    // Logging to history
    logTrackingEvent('Smart collar audio buzzer triggered', selectedState.latitude, selectedState.longitude);
  };

  // Vibrate collar dispatch
  const handleTriggerVibrate = () => {
    setCollarMessage({
      text: `📳 Collar vibrating on ${selectedPet?.name}'s neck to encourage homecoming! (3 pulses)`,
      type: 'info'
    });
    setTimeout(() => setCollarMessage({ text: '', type: null }), 4500);

    logTrackingEvent('Collar vibration alert pulsed', selectedState.latitude, selectedState.longitude);
  };

  // Toggle high visibility LED Beacon locator night-light
  const handleToggleBeacon = () => {
    const nextBeacon = !selectedState.beaconOn;
    onUpdateState({
      ...selectedState,
      beaconOn: nextBeacon
    });

    setCollarMessage({
      text: nextBeacon 
        ? `💡 High-output LED Strobe light turned ON for ${selectedPet?.name}'s rescue visibility`
        : `💡 LED Strobe light powered OFF`,
      type: 'info'
    });
    setTimeout(() => setCollarMessage({ text: '', type: null }), 4500);

    logTrackingEvent(nextBeacon ? 'LED Beacon enabled' : 'LED Beacon deactivated', selectedState.latitude, selectedState.longitude);
  };

  // Log track endpoint
  const logTrackingEvent = (placeName: string, lat: number, lng: number) => {
    const timeNow = new Date().toTimeString().slice(0, 5);
    const dateToday = new Date().toISOString().split('T')[0];
    
    // Add cumulative step check
    const lastSteps = selectedHistory[0]?.stepsCount ?? 1200;
    const addedSteps = Math.floor(Math.random() * 250) + 10;
    
    onAddHistory({
      id: `tr-${Date.now()}`,
      petId: selectedPetId,
      timestamp: timeNow,
      date: dateToday,
      locationName: placeName,
      latitude: lat,
      longitude: lng,
      stepsCount: lastSteps + addedSteps
    });
  };

  // Click on Radar SVG map to simulate moving the collar
  const handleRadarClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    
    // SVG center coordinates (width is 300, height is 300)
    // Scale click event to SVG coordinate space
    const clickX = ((e.clientX - rect.left) / rect.width) * 300;
    const clickY = ((e.clientY - rect.top) / rect.height) * 300;
    
    // Home point is (150, 150). Calculate offset
    const offsetLng = Math.round(clickX - 150);
    const offsetLat = Math.round(150 - clickY); // flip y so north is positive

    const currentRadius = selectedState.safeZoneRadius;
    const newDistance = Math.round(Math.sqrt(offsetLng * offsetLng + offsetLat * offsetLat));
    const newlyBreached = newDistance > currentRadius;

    let destinationName = 'Coordinate Checkpoint';
    if (newlyBreached) {
      destinationName = 'Out of Geofence Boundary ⚠️';
    } else {
      const placesNear = [
        { name: 'Sofa corner', dist: 30 },
        { name: 'Backyard flowerbed', dist: 70 },
        { name: 'Patio lounge chair', dist: 95 },
        { name: 'Kitchen treat box', dist: 15 }
      ];
      const match = placesNear.find(p => Math.abs(newDistance - p.dist) < 25);
      destinationName = match ? match.name : 'Inside Secure Zone';
    }

    // Pick dynamic battery drain
    const nextBattery = Math.max(0, selectedState.batteryLevel - (Math.random() > 0.5 ? 1 : 0));

    // Update telemetry state
    onUpdateState({
      ...selectedState,
      latitude: offsetLat,
      longitude: offsetLng,
      batteryLevel: nextBattery,
      signalStrength: newlyBreached ? 'poor' : 'excellent'
    });

    logTrackingEvent(destinationName, offsetLat, offsetLng);
  };

  // Adjust Safe Zone Radius range
  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 100;
    onUpdateState({
      ...selectedState,
      safeZoneRadius: value
    });
  };

  // Handle manual coordinate logger submission
  const handleCustomTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPlace.trim()) return;

    logTrackingEvent(customPlace.trim(), selectedState.latitude, selectedState.longitude);
    setCustomPlace('');
  };

  // Return standard color classes based on battery level
  const getBatteryColor = (level: number) => {
    if (level <= 20) return 'text-rose-500 fill-rose-100';
    if (level <= 50) return 'text-amber-500 fill-amber-100';
    return 'text-emerald-500 fill-emerald-100';
  };

  // Quick preset relocation pings helper
  const handleRelocatePreset = (name: string, lat: number, lng: number) => {
    onUpdateState({
      ...selectedState,
      latitude: lat,
      longitude: lng,
      signalStrength: Math.sqrt(lat*lat + lng*lng) > selectedState.safeZoneRadius ? 'poor' : 'excellent'
    });
    logTrackingEvent(name, lat, lng);
  };

  return (
    <div id="pet-tracking-container" className="space-y-6">
      
      {/* Title block */}
      <div id="tracking-title-section" className="flex items-center justify-between border-b border-stone-150 pb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-black text-stone-800 tracking-tight flex items-center gap-2">
            <Radio className="text-amber-800 animate-pulse" size={24} />
            Smart Tracker & Telemetry Hub
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Surveil physical GPS coordinates, geofenced zones, and issue collar commands to happy companions.
          </p>
        </div>

        {/* Companion Picker tabs */}
        <div className="flex gap-1.5 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
          {pets.map((pet) => {
            const state = trackingStates.find(s => s.petId === pet.id) || { latitude: 0, longitude: 0, safeZoneRadius: 100 };
            const dist = Math.sqrt(state.latitude * state.latitude + state.longitude * state.longitude);
            const petBreached = dist > state.safeZoneRadius;

            return (
              <button
                key={pet.id}
                id={`btn-select-tracker-pet-${pet.id}`}
                onClick={() => setSelectedPetId(pet.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedPetId === pet.id
                    ? 'bg-amber-800 text-white shadow-sm'
                    : 'text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>{pet.photoUrl ? (
                  <img src={pet.photoUrl} alt="" className="w-5.5 h-5.5 rounded-lg object-cover" referrerPolicy="no-referrer" />
                ) : '🐾'}</span>
                <span>{pet.name}</span>
                {petBreached && (
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" title="Breached Boundary!" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {!selectedPet ? (
        <div id="tracking-no-pets-state" className="bg-white rounded-3xl p-12 text-center border border-stone-150 max-w-lg mx-auto">
          <AlertTriangle size={36} className="text-amber-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-stone-800">No Companion Registered Yet</h3>
          <p className="text-xs text-stone-500 mt-1">Please add a companion in Companion Profiles to enable telemetry tracking chips.</p>
        </div>
      ) : (
        <div id="tracking-main-workspace" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: Radar map dashboard */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Visual Radar Component */}
            <div id="radar-viewport-card" className="bg-stone-900 rounded-3xl p-6 text-white border border-stone-800 shadow-md relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
              
              {/* Star background effect */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

              {/* Radar Grid Container */}
              <div className="relative shrink-0 select-none">
                <svg
                  id="radar-grid-svg"
                  width="290"
                  height="290"
                  className="bg-stone-950 rounded-2xl border border-stone-800 cursor-crosshair relative z-10 hover:border-amber-600/50 transition-colors"
                  onClick={handleRadarClick}
                >
                  {/* Subtle Grid cross lines */}
                  <line x1="145" y1="0" x2="145" y2="290" stroke="#1f2937" strokeWidth="1" />
                  <line x1="0" y1="145" x2="290" y2="145" stroke="#1f2937" strokeWidth="1" />
                  
                  {/* Concentric rings */}
                  <circle cx="145" cy="145" r="45" stroke="#111827" fill="none" strokeWidth="1" />
                  <circle cx="145" cy="145" r="95" stroke="#111827" fill="none" strokeWidth="1.5" />
                  <circle cx="145" cy="145" r="140" stroke="#1f2937" fill="none" strokeWidth="1" strokeDasharray="4,4" />

                  {/* Landmarks markers */}
                  <g opacity="0.4" className="text-[10px] font-mono fill-stone-500">
                    <text x="10" y="25">🌳 Park</text>
                    <text x="180" y="30">✂️ Groomer</text>
                    <text x="210" y="275">🏥 Clinic</text>
                    <text x="15" y="240">🍖 Pet Shop</text>
                  </g>
                  
                  {/* Safe Zone Boundary Circle */}
                  <circle
                    cx="145"
                    cy="145"
                    r={Math.min(145, selectedState.safeZoneRadius)}
                    stroke={isBreached ? '#ef4444' : '#10b981'}
                    fill={isBreached ? 'rgba(239, 68, 68, 0.03)' : 'rgba(16, 185, 129, 0.02)'}
                    strokeWidth="2.5"
                    strokeDasharray="4,2"
                    className={isBreached ? 'animate-pulse' : ''}
                  />

                  {/* Safe boundary warning text on SVG */}
                  {isBreached && (
                    <g transform="translate(145, 12)">
                      <rect x="-84" y="0" width="168" height="18" rx="5" fill="#ef4444" />
                      <text x="0" y="12" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle" letterSpacing="0.5">
                        ⚠️ GEOFENCE EXCEEDED
                      </text>
                    </g>
                  )}

                  {/* Home Base Icon / Flag in Center */}
                  <g transform="translate(145, 145)">
                    <circle r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                    <text x="10" y="4" fill="#f59e0b" fontSize="9" fontWeight="800">HOME</text>
                  </g>

                  {/* Draw Other Companions on same screen for comparative tracking as faint references */}
                  {pets.filter(p => p.id !== selectedPetId).map(otherPet => {
                    const otherState = trackingStates.find(os => os.petId === otherPet.id);
                    if (!otherState) return null;
                    const otherSvgX = 145 + otherState.longitude;
                    const otherSvgY = 145 - otherState.latitude;
                    return (
                      <g key={otherPet.id} transform={`translate(${otherSvgX}, ${otherSvgY})`} opacity="0.45" className="cursor-not-allowed">
                        <circle r="4.5" fill="#78716c" stroke="#ffffff" strokeWidth="1" />
                        <text x="7" y="3" fill="#a8a29e" fontSize="8" fontWeight="bold">{otherPet.name}</text>
                      </g>
                    );
                  })}

                  {/* Selected Pet Pulsing Target Dot */}
                  <g transform={`translate(${145 + selectedState.longitude}, ${145 - selectedState.latitude})`}>
                    {/* Pulsing expander ring */}
                    <circle 
                      r="16" 
                      fill="none" 
                      stroke={isBreached ? '#f43f5e' : '#10b981'} 
                      strokeWidth="2" 
                      className="origin-center animate-ping" 
                      opacity="0.6"
                    />
                    {/* Central core dot */}
                    <circle 
                      r="7.5" 
                      fill={isBreached ? '#f43f5e' : '#10b981'} 
                      stroke="#ffffff" 
                      strokeWidth="2.5" 
                      className="shadow-md"
                    />
                    {/* Callout Tag */}
                    <g transform="translate(0, -14)" className="pointer-events-none">
                      <rect x="-32" y="-9" width="64" height="13" rx="3.5" fill="#1c1917" stroke="#ffffff" strokeWidth="0.5" />
                      <text x="0" y="0" fill="#ffffff" fontSize="8.5" fontWeight="900" textAnchor="middle">
                        {selectedPet.name}
                      </text>
                    </g>
                  </g>
                </svg>
                {/* SVG Hint */}
                <div className="absolute bottom-2.5 left-2.5 bg-stone-900/90 text-[10px] font-mono text-stone-400 px-2 py-1 rounded border border-stone-800 z-20 flex items-center gap-1">
                  <Locate size={10} />
                  <span>Click grid area to force move GPS chip</span>
                </div>
              </div>

              {/* Collar Location Stats block */}
              <div className="flex-1 space-y-4 relative z-10 w-full">
                
                {/* Boundary system message badge */}
                <div className="flex items-center justify-between">
                  <span className="text-stone-400 text-xs font-bold uppercase tracking-widest font-mono">Telemetry Check</span>
                  {isBreached ? (
                    <span id="collar-breached-system-badge" className="bg-rose-500 text-white font-black text-[10px] uppercase px-3 py-1.5 rounded-xl border border-rose-600 animate-pulse flex items-center gap-1.5">
                      <AlertCircle size={13} className="shrink-0" />
                      BREACHED BOUNDS
                    </span>
                  ) : (
                    <span id="collar-safe-system-badge" className="bg-emerald-600/90 text-white font-black text-[10px] uppercase px-3 py-1.5 rounded-xl border border-emerald-700 flex items-center gap-1.5">
                      <ShieldCheck size={13} className="shrink-0" />
                      SECURE PERIMETER
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl font-black text-white">{selectedPet.name}'s Tracker Coordinates</h3>
                  <div className="flex items-center gap-2 font-mono text-sm text-[#f59e0b] font-bold">
                    <Compass size={16} />
                    <span>Offset: {selectedState.latitude}°N, {selectedState.longitude}°E</span>
                    <span>•</span>
                    <span>Distance: {distance}m from base</span>
                  </div>
                </div>

                {/* Simulated Address Box */}
                <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 space-y-1">
                  <p className="text-[10px] text-stone-500 uppercase font-black font-mono">Decoded Cellular Spot</p>
                  <p className="text-xs text-stone-200 font-bold flex items-center gap-1.5">
                    <MapPin size={14} className="text-amber-500" />
                    <span>
                      {isBreached 
                        ? `Exceeded the secure geofence. Estimated zone: Neighbor's Yard / Wild Forest Border`
                        : `Estimated Safe Zone: Near Main House ${distance < 40 ? 'Living Quarters' : 'Rear Garden Lawn'}`
                      }
                    </span>
                  </p>
                </div>

                {/* Quick relocation presets panel */}
                <div id="radar-presets" className="space-y-1.5 pt-1.5">
                  <p className="text-[10px] text-stone-400 uppercase font-black font-mono">Instant Test Relocator Mockers</p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleRelocatePreset('Backyard Sandbox', 20, 60)}
                      className="text-[10px] font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 px-2.5 py-1.5 rounded-lg border border-stone-750 cursor-pointer"
                    >
                      🎪 Backyard Sandbox
                    </button>
                    <button
                      onClick={() => handleRelocatePreset('Bedside Mat', 0, 0)}
                      className="text-[10px] font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 px-2.5 py-1.5 rounded-lg border border-stone-750 cursor-pointer"
                    >
                      🛌 Bedside Mat
                    </button>
                    <button
                      onClick={() => handleRelocatePreset('Out of Boundary Meadow', -130, 115)}
                      className="text-[10px] font-extrabold bg-rose-950 hover:bg-rose-900 border border-rose-900 text-rose-200 px-2.5 py-1.5 rounded-lg cursor-pointer"
                    >
                      🏃 Boundary Breach (Barnaby Escape)
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* Collar Direct Signal Controls */}
            <div id="collar-telemetry-controls" className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-stone-850">Collar Signal & Training Controls</h3>
                <p className="text-xs text-stone-400 mt-0.5">Transmit commands and visual light beacons to physical localization collars.</p>
              </div>

              {/* Remote response prompt */}
              {collarMessage.text && (
                <div id="collar-transmission-log" className={`p-3.5 rounded-2xl border text-xs font-bold font-mono transition-all animate-bounce flex items-center gap-2 ${
                  collarMessage.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-150 text-emerald-800'
                    : 'bg-amber-5 border-amber-150 text-amber-900'
                }`}>
                  <Radio size={14} className="animate-pulse shrink-0" />
                  <span>{collarMessage.text}</span>
                </div>
              )}

              <div id="control-grid" className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* 1. Beep collar */}
                <button
                  onClick={handleTriggerBuzzer}
                  className="bg-stone-50 hover:bg-amber-50 hover:text-amber-900 border border-stone-150 hover:border-amber-200 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2.5 transition-all text-stone-700 font-bold hover:scale-102 cursor-pointer group"
                >
                  <div className="h-10 w-10 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                    <Volume2 size={20} />
                  </div>
                  <div className="text-xs">
                    <p className="font-extrabold">Trigger Sound Alert</p>
                    <p className="text-[10px] text-stone-400 mt-0.5 font-medium">Bip-bop recall cue code</p>
                  </div>
                </button>

                {/* 2. Buzz vibration */}
                <button
                  onClick={handleTriggerVibrate}
                  className="bg-stone-50 hover:bg-sky-50 hover:text-sky-900 border border-stone-150 hover:border-sky-200 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2.5 transition-all text-stone-700 font-bold hover:scale-102 cursor-pointer group"
                >
                  <div className="h-10 w-10 bg-sky-50 text-sky-700 rounded-full flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                    <Waves size={20} />
                  </div>
                  <div className="text-xs">
                    <p className="font-extrabold">Trigger Haptic Buzz</p>
                    <p className="text-[10px] text-stone-400 mt-0.5 font-medium">Tactile boundary check response</p>
                  </div>
                </button>

                {/* 3. Beacon Strobe Toggle */}
                <button
                  onClick={handleToggleBeacon}
                  className={`border p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2.5 transition-all font-bold hover:scale-102 cursor-pointer group ${
                    selectedState.beaconOn 
                      ? 'bg-amber-800 text-white border-amber-950 shadow-sm' 
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-750 border-stone-150'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                    selectedState.beaconOn
                      ? 'bg-amber-900 text-[#f59e0b] shadow-inner'
                      : 'bg-stone-100 text-stone-600 group-hover:bg-stone-200'
                  }`}>
                    <Lightbulb size={20} className={selectedState.beaconOn ? 'animate-pulse text-amber-400 fill-amber-300' : ''} />
                  </div>
                  <div className="text-xs">
                    <p className="font-extrabold">{selectedState.beaconOn ? 'Turn Off Beacon' : 'Enable LED Beacon'}</p>
                    <p className={`text-[10px] ${selectedState.beaconOn ? 'text-amber-200' : 'text-stone-400'} mt-0.5 font-medium`}>
                      {selectedState.beaconOn ? 'Beacon Active Now' : 'Night search spotlight'}
                    </p>
                  </div>
                </button>
              </div>

            </div>

          </div>

          {/* RIGHT: Parameters & History column */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Battery & Hardware Signals Card */}
            <div id="device-hardware-info-card" className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-stone-850">Collar Hardware Health</h3>
              
              <div className="space-y-4.5">
                
                {/* Custom Battery level gauge */}
                <div className="flex items-center justify-between border-b border-stone-50 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                      <Battery className={`h-5 w-5 ${getBatteryColor(selectedState.batteryLevel)}`} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-800">Battery Level</p>
                      <p className="text-[10px] text-stone-400">Recharges via Solar Dock</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-stone-800">{selectedState.batteryLevel}%</span>
                    <div className="w-16 bg-stone-100 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          selectedState.batteryLevel <= 20 
                            ? 'bg-rose-500' 
                            : selectedState.batteryLevel <= 50 
                              ? 'bg-amber-500' 
                              : 'bg-emerald-500'
                        }`}
                        style={{ width: `${selectedState.batteryLevel}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Cellular network strength */}
                <div className="flex items-center justify-between border-b border-stone-50 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                      <Signal className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-800">Collar Signal Strength</p>
                      <p className="text-[10px] text-stone-400">Active Satellite Sync</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black uppercase text-indigo-700 px-2 py-1 bg-indigo-50 rounded-lg border border-indigo-100">
                      {selectedState.signalStrength}
                    </span>
                  </div>
                </div>

                {/* FitStep Fitness tracker parameters */}
                <div id="fitstep-activity-tracker" className="p-4 bg-amber-50/30 rounded-2xl border border-amber-100/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#92400e] flex items-center gap-1">
                      <Footprints size={14} />
                      FitStep™ Goal Status
                    </span>
                    <span className="text-[10px] font-bold text-[#b45309] font-mono">5k Goal</span>
                  </div>

                  {/* Cumulated step counts */}
                  {(() => {
                    const steps = selectedHistory[0]?.stepsCount || 1200;
                    const percent = Math.min(100, Math.round((steps / 5000) * 100));
                    const calBurned = Math.round(steps * 0.04);

                    return (
                      <div className="space-y-2">
                        <div className="flex items-baseline justify-between">
                          <span className="text-lg font-black text-[#78350f]">{steps.toLocaleString()} <span className="text-[10.5px] font-bold text-[#b45309]">steps</span></span>
                          <span className="text-xs font-bold text-[#b45309] font-mono">{percent}%</span>
                        </div>
                        {/* Custom progress gauge bar */}
                        <div className="w-full bg-amber-200/40 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-amber-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        {/* Dynamic Health Estimation */}
                        <div className="flex items-center justify-between text-[10px] text-[#b45309] font-bold pt-1.5 border-t border-amber-200/30">
                          <span className="flex items-center gap-0.5">
                            <Flame size={11} className="text-red-500 fill-red-100" />
                            Burned: {calBurned} kcal
                          </span>
                          <span>Active: ~{Math.round(steps / 110)} mins</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

              </div>
            </div>

            {/* Geofence safe perimeter controller settings */}
            <div id="geofence-range-manager" className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-stone-850">Safe Perimeter Limits</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-baseline mb-1">
                  <label htmlFor="radius-slider" className="text-xs font-bold text-stone-600">Home Safe Zone Radius:</label>
                  <span className="text-sm font-black text-amber-800 font-mono">{selectedState.safeZoneRadius} meters</span>
                </div>
                
                {/* HTML radius slides range */}
                <input
                  id="radius-slider"
                  type="range"
                  min="40"
                  max="240"
                  step="10"
                  value={selectedState.safeZoneRadius}
                  onChange={handleRadiusChange}
                  className="w-full h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-amber-850"
                />

                <div className="flex justify-between text-[9px] text-stone-400 font-bold font-mono">
                  <span>40m (Small Yard)</span>
                  <span>140m (Suburban)</span>
                  <span>240m (Acre Estate)</span>
                </div>

                <div className="p-3.5 bg-stone-50 border border-stone-150 rounded-2xl text-[11px] text-stone-500 leading-normal">
                  💡 Large safety zones reduce warning frequency but increase risk of delayed alerts if they sneak loose. Adjust based on backyard enclosure strength.
                </div>
              </div>
            </div>

            {/* Form to manual ping coordinates */}
            <form onSubmit={handleCustomTrackSubmit} className="bg-white rounded-3xl p-5 border border-stone-100 shadow-sm space-y-3.5">
              <div>
                <h4 className="text-xs font-black text-stone-850 uppercase tracking-wider">Log Manual Spotting Location</h4>
                <p className="text-[10px] text-stone-400 mt-0.5">Visually confirm location with manual checkout report notes</p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Master Bedroom Couch"
                  value={customPlace}
                  onChange={(e) => setCustomPlace(e.target.value)}
                  className="flex-1 bg-stone-50 border border-stone-200 focus:border-amber-550 focus:bg-white text-xs px-3 py-2 rounded-xl focus:outline-none"
                  maxLength={40}
                />
                <button
                  type="submit"
                  className="px-3 bg-stone-100 text-stone-700 hover:bg-amber-800 hover:text-white border border-stone-200 hover:border-amber-900 transition-colors text-xs font-bold rounded-xl flex items-center justify-center cursor-pointer"
                >
                  <Plus size={16} />
                </button>
              </div>
            </form>

          </div>

        </div>
      )}

      {/* FOOTER ROW: Location Ping Log database */}
      {selectedPet && (
        <div id="collar-pings-table-card" className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-50 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <History size={18} className="text-amber-800" />
              <div>
                <h3 className="text-base font-bold text-stone-850">Location Ping & Sensor Activity Stream</h3>
                <p className="text-xs text-stone-400">Chronological history registry parsed from GPS coordinate logs</p>
              </div>
            </div>

            {selectedHistory.length > 0 && (
              <button
                type="button"
                onClick={() => onClearHistory(selectedPetId)}
                className="text-stone-500 hover:text-red-800 text-xs font-bold flex items-center gap-1.5 px-3 py-2 border border-stone-150 hover:border-red-100 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Format Tracker History Logs ({selectedHistory.length})</span>
              </button>
            )}
          </div>

          {selectedHistory.length === 0 ? (
            <div className="py-8 text-center text-stone-400 flex flex-col items-center">
              <Compass className="animate-spin text-stone-300 mb-2" size={24} />
              <p className="text-xs font-bold">Waiting for cellular beacon heartbeat...</p>
              <p className="text-[11px] text-stone-400/80 mt-1">Submit manual spots or click on the green radar map to generate telemetry data.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-stone-100">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100 text-[10px] text-stone-400 uppercase font-black font-sans">
                    <th className="px-4 py-3">Timestamp / Time</th>
                    <th className="px-4 py-3">Descripted Sector Point</th>
                    <th className="px-4 py-3">Exact Coordinate Offset</th>
                    <th className="px-4 py-3">FitStep Steps Cumulative</th>
                    <th className="px-4 py-3 text-right">Perimeter Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50 font-medium text-stone-600">
                  {selectedHistory.map((log) => {
                    const distFromBase = Math.round(Math.sqrt(log.latitude * log.latitude + log.longitude * log.longitude));
                    const logBreached = distFromBase > selectedState.safeZoneRadius;

                    return (
                      <tr key={log.id} className="hover:bg-stone-55/40 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-stone-400 font-bold">
                          {log.date} @ {log.timestamp}
                        </td>
                        <td className="px-4 py-3 font-semibold text-stone-800">{log.locationName}</td>
                        <td className="px-4 py-3 font-mono text-[11px] text-[#b45309]">
                          {log.latitude}°N, {log.longitude}°E ({distFromBase}m)
                        </td>
                        <td className="px-4 py-3">{log.stepsCount.toLocaleString()} steps</td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {logBreached ? (
                            <span className="text-[9.5px] font-black uppercase text-rose-700 bg-rose-50 border border-rose-100 px-2 py-1 rounded-full">
                              ⚠️ Expelled Breached
                            </span>
                          ) : (
                            <span className="text-[9.5px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full animate-pulse">
                              🟢 Secure
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

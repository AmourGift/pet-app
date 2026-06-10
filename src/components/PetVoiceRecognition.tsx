/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Pet, VoiceProfile, VoiceLogEntry } from '../types';
import {
  Mic,
  MicOff,
  Activity,
  Radio,
  Volume2,
  Trash2,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Clock,
  CheckCircle,
  Info,
  Sliders,
  AlertCircle
} from 'lucide-react';

interface PetVoiceRecognitionProps {
  pets: Pet[];
  voiceProfiles: VoiceProfile[];
  voiceLogs: VoiceLogEntry[];
  onUpdateProfile: (profile: VoiceProfile) => void;
  onAddVoiceLog: (entry: VoiceLogEntry) => void;
  onClearLogs: (petId: string) => void;
}

export default function PetVoiceRecognition({
  pets,
  voiceProfiles,
  voiceLogs,
  onUpdateProfile,
  onAddVoiceLog,
  onClearLogs
}: PetVoiceRecognitionProps) {
  const [selectedPetId, setSelectedPetId] = useState<string>(pets.length > 0 ? pets[0].id : '');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainingProgress, setTrainingProgress] = useState<number>(0);
  const [customPhrase, setCustomPhrase] = useState<string>('');
  
  // Real or Simulated microphone status
  const [micMode, setMicMode] = useState<'simulated' | 'authorized'>('simulated');
  const [alertText, setAlertText] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  // Synced selected pet entities
  const selectedPet = pets.find(p => p.id === selectedPetId);
  const selectedProfile = voiceProfiles.find(vp => vp.petId === selectedPetId) || {
    petId: selectedPetId,
    hasTrainedVoice: false,
    frequencyHz: selectedPet?.species === 'Dog' ? 450 : selectedPet?.species === 'Cat' ? 320 : 900,
    vocalTexture: 'resonant clear pulse',
    barkPattern: 'standard single emission',
    trainedDate: 'Untrained'
  };

  const selectedLogs = voiceLogs.filter(log => log.petId === selectedPetId);

  // Auto-select first pet if none is selected
  useEffect(() => {
    if (!selectedPetId && pets.length > 0) {
      setSelectedPetId(pets[0].id);
    }
  }, [pets, selectedPetId]);

  // Procedural visual canvas wave loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const midY = height / 2;

      // Draw horizontal reference line
      ctx.strokeStyle = '#2d2a2e';
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(width, midY);
      ctx.stroke();

      if (isListening || isTraining) {
        phase += 0.15; // Speed of sine wave motion
        
        // If we have an active Web Audio Analyzer, combine real data with simulation
        let frequencies: Uint8Array = new Uint8Array(0);
        if (analyserRef.current && micMode === 'authorized') {
          frequencies = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(frequencies);
        }

        // Draw multiple beautiful layered sine waves
        const wavesCount = 3;
        for (let i = 0; i < wavesCount; i++) {
          const intensityMultiplier = isTraining ? 1.5 : 1.0;
          const amplitude = (35 - i * 11) * (0.4 + Math.sin(phase * 0.5 + i) * 0.3) * intensityMultiplier;
          const frequency = 0.015 + i * 0.008;

          ctx.strokeStyle = i === 0 
            ? 'rgba(217, 119, 6, 0.85)' // Amber main
            : i === 1
              ? 'rgba(245, 158, 11, 0.5)' // Orange mid
              : 'rgba(251, 191, 36, 0.25)'; // Light secondary

          ctx.lineWidth = i === 0 ? 2.5 : 1.5;
          ctx.beginPath();

          for (let x = 0; x < width; x++) {
            // Check if there is high audio input in real Mic mode
            let micOffset = 0;
            if (frequencies.length > 0) {
              const binIndex = Math.min(frequencies.length - 1, Math.floor((x / width) * 128));
              micOffset = (frequencies[binIndex] / 255) * 35;
            }

            const y = midY + Math.sin(x * frequency + phase + i * 1.5) * (amplitude + micOffset);
            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
        }

        // Add scientific vertical grid bars indicating frequency analysis bands
        ctx.fillStyle = 'rgba(217, 119, 6, 0.06)';
        for (let x = 20; x < width; x += 40) {
          ctx.fillRect(x, 10, 1.5, height - 20);
        }
      } else {
        // Draw flat quiet standing baseline with ambient pulse
        ctx.strokeStyle = 'rgba(120, 113, 108, 0.35)'; // Stone color
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const y = midY + Math.sin(x * 0.01) * 2.5;
          if (x === 0) ctx.moveTo(x, y);
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isListening, isTraining, micMode]);

  // Clean up Web Audio configurations on unmount
  useEffect(() => {
    return () => {
      stopRealMicrophone();
    };
  }, []);

  const startRealMicrophone = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Setup Web Audio nodes
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctxNode = new AudioCtx();
        const analyserNode = ctxNode.createAnalyser();
        analyserNode.fftSize = 256;

        const sourceNode = ctxNode.createMediaStreamSource(stream);
        sourceNode.connect(analyserNode);

        audioContextRef.current = ctxNode;
        analyserRef.current = analyserNode;
        micStreamRef.current = stream;
        setMicMode('authorized');
        setAlertText('🎙️ Real-time microphone capture activated. Analyzing actual surrounding room acoustics.');
        setTimeout(() => setAlertText(''), 5000);
      } else {
        throw new Error('getUserMedia not supported in this frame environment.');
      }
    } catch (err) {
      console.warn('Microphone block. Falling back to procedural audio analyzer emulation.', err);
      setMicMode('simulated');
      setAlertText('⚠️ Microphone authorization blocked or unsuited for this iframe. Seamlessly swapped to Interactive Simulator mode.');
      setTimeout(() => setAlertText(''), 6000);
    }
  };

  const stopRealMicrophone = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setMicMode('simulated');
  };

  const handleToggleMicMode = () => {
    if (micMode === 'simulated') {
      startRealMicrophone();
    } else {
      stopRealMicrophone();
      setAlertText('🔇 Suspended microphone feed. Device privacy restored.');
    }
  };

  // Launch vocal calibration/training workflow
  const handleLaunchTraining = () => {
    if (!selectedPet) return;
    setIsTraining(true);
    setTrainingProgress(0);

    const interval = setInterval(() => {
      setTrainingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          
          // Generate customized voice profile statistics based on selected Pet species
          let pitch = 450;
          let texture = 'resonant medium bark';
          let pattern = 'staccato bursts';

          if (selectedPet.species === 'Dog') {
            pitch = Math.floor(Math.random() * 200) + 350; // 350 - 550 Hz
            const textures = ['husky baritoned', 'booming echoic', 'raspy short-growl', 'high harmonic yip'];
            const patterns = ['double-burst-staccato', 'intermittent alert triple', 'single-drawn howls'];
            texture = textures[Math.floor(Math.random() * textures.length)];
            pattern = patterns[Math.floor(Math.random() * patterns.length)];
          } else if (selectedPet.species === 'Cat') {
            pitch = Math.floor(Math.random() * 150) + 260; // 260 - 410 Hz
            const textures = ['high musical purr', 'throated gravel squeal', 'melodic chirp-vowel'];
            const patterns = ['single rise-fall meow', 'triple-speed rapid trill', 'prolonged food pleading'];
            texture = textures[Math.floor(Math.random() * textures.length)];
            pattern = patterns[Math.floor(Math.random() * patterns.length)];
          } else {
            pitch = Math.floor(Math.random() * 400) + 800; // 800 - 1200 Hz
            texture = 'high metallic squeak';
            pattern = 'fast repetitive high tweets';
          }

          onUpdateProfile({
            petId: selectedPetId,
            hasTrainedVoice: true,
            frequencyHz: pitch,
            vocalTexture: texture,
            barkPattern: pattern,
            trainedDate: new Date().toISOString().split('T')[0]
          });

          // Log training confirmation to translation history logs
          onAddVoiceLog({
            id: `vlog-trained-${Date.now()}`,
            petId: selectedPetId,
            timestamp: new Date().toTimeString().slice(0, 5),
            date: new Date().toISOString().split('T')[0],
            vocalDurationSec: 4.0,
            pitchHz: pitch,
            identifiedEmotion: 'Calibration Tuning Success ✅',
            confidenceScore: 100,
            translatedText: `Recalibrated acoustic signature metrics. Profile locked: Found ${texture} spectrum with ${pattern} fingerprint.`
          });

          return 100;
        }
        return prev + 10;
      });
    }, 450);
  };

  // Playback sound trigger simulator
  const handleSimulateSound = (soundPreset: {
    label: string,
    durationSec: number,
    emotion: string,
    pitch: number,
    translation: string
  }) => {
    if (!selectedPet) return;
    setIsListening(true);
    setAlertText(`🔉 Listening to vocalization segment... Match index scoring running.`);

    // Wait 1.5s to pretend we are running rigorous voice print analyses!
    setTimeout(() => {
      setIsListening(false);
      setAlertText('');

      onAddVoiceLog({
        id: `vlog-${Date.now()}`,
        petId: selectedPetId,
        timestamp: new Date().toTimeString().slice(0, 5),
        date: new Date().toISOString().split('T')[0],
        vocalDurationSec: soundPreset.durationSec,
        pitchHz: soundPreset.pitch,
        identifiedEmotion: soundPreset.emotion,
        confidenceScore: Math.floor(Math.random() * 12) + 88, // 88% to 99% accuracy
        translatedText: soundPreset.translation
      });
    }, 1800);
  };

  // Process manual translation simulation entry
  const handleManualTranslationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPhrase.trim()) return;

    // Standard species pitch map
    const standardPitch = selectedPet?.species === 'Dog' ? 440 : selectedPet?.species === 'Cat' ? 310 : 950;
    const emotions = ['Affection Request', 'Attention Seeking', 'Expressing Contentment', 'Alert Warning'];
    const chosenEmotion = emotions[Math.floor(Math.random() * emotions.length)];

    onAddVoiceLog({
      id: `vlog-${Date.now()}`,
      petId: selectedPetId,
      timestamp: new Date().toTimeString().slice(0, 5),
      date: new Date().toISOString().split('T')[0],
      vocalDurationSec: 1.5,
      pitchHz: standardPitch + Math.floor(Math.random() * 40 - 20),
      identifiedEmotion: chosenEmotion,
      confidenceScore: 90,
      translatedText: customPhrase.trim()
    });

    setCustomPhrase('');
  };

  // List of useful sample voice presets based on species
  const getSimulatePresets = () => {
    if (!selectedPet) return [];

    if (selectedPet.species === 'Dog') {
      return [
        {
          label: '🔊 Playful Yelp (Happy Buster)',
          durationSec: 0.6,
          emotion: 'Playful Happiness',
          pitch: 510,
          translation: `“Hey! Play trigger detected! Throw the red toy, let me fetch it or let us romp outside right now!”`
        },
        {
          label: '🔊 Low Warning Growl',
          durationSec: 1.4,
          emotion: 'Alert / Warning Alarm',
          pitch: 340,
          translation: `“Suspicious anomaly spotted near boundary line. I hear fence vibrations or a neighborhood stranger!”`
        },
        {
          label: '🔊 High Soft Whimper',
          durationSec: 0.9,
          emotion: 'Vocal Complaint / Loneliness',
          pitch: 580,
          translation: `“Pardon me... you went to the computer and didn't pet my ears for nine minutes. I am neglected.”`
        }
      ];
    }

    if (selectedPet.species === 'Cat') {
      return [
        {
          label: '🔊 Sharp Chirp (Morning Bird Watching)',
          durationSec: 0.4,
          emotion: 'Hunting Focus / Chattering',
          pitch: 350,
          translation: `“Look! A miniature flying snack outside the screen! I must sit perfectly silent and snap my jaw to scare it.”`
        },
        {
          label: '🔊 Elongated High Meow',
          durationSec: 1.5,
          emotion: 'Demanding food / Treatment',
          pitch: 280,
          translation: `“Human, I require the gourmet salmon paté immediately. This dry kibble is unacceptable for royalty.”`
        },
        {
          label: '🔊 Steady Purring hum',
          durationSec: 3.5,
          emotion: 'Deep Contentment',
          pitch: 80,
          translation: `“My engine is clicking. Your warmth is suitable. Do not move your leg so I can sleep safely.”`
        }
      ];
    }

    // Default presets for other or rabbit
    return [
      {
        label: '🔊 Fast Squeaks',
        durationSec: 0.5,
        emotion: 'Urgent Excitement / Snack Need',
        pitch: 1150,
        translation: `“Lettuce leaves rustle! Give me the organic parsley or carrots immediately. Crunch-crunch clock starts now!”`
      },
      {
        label: '🔊 Restless Foot Thump',
        durationSec: 1.8,
        emotion: 'Territorial Alert',
        pitch: 120,
        translation: `“Danger check! I detected structural thudding noise. Stay on immediate alert!”`
      }
    ];
  };

  return (
    <div id="voice-recognition-tabs-wrapper" className="space-y-6">
      
      {/* Title Header Section */}
      <div id="voice-banner-section" className="flex items-center justify-between border-b border-stone-150 pb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-black text-stone-880 tracking-tight flex items-center gap-2">
            <Mic className="text-amber-800" size={24} />
            Companion Voice Identifier & Translator
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Analyze acoustic peak frequencies, identify vocal signatures, and transcribe bark/meow frequencies into actionable translations.
          </p>
        </div>

        {/* Companion Selector */}
        <div id="voice-pet-selector" className="flex gap-1.5 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
          {pets.map((pet) => (
            <button
              key={pet.id}
              id={`voice-select-${pet.id}`}
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
            </button>
          ))}
        </div>
      </div>

      {alertText && (
        <div id="mic-status-banner" className="p-3 bg-stone-900 border border-stone-800 text-white rounded-2xl text-[11px] font-mono leading-relaxed transition-all flex items-center gap-2">
          <Info size={14} className="text-[#f59e0b] shrink-0" />
          <span>{alertText}</span>
        </div>
      )}

      {/* Main Grid content */}
      {!selectedPet ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-150 max-w-lg mx-auto">
          <AlertCircle size={36} className="text-amber-600 mx-auto mb-3" />
          <p className="text-xs text-stone-500">Add a companion first in profiles to activate the voice analyzer sensors.</p>
        </div>
      ) : (
        <div id="voice-workspace-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: Spectrogram Canvas visualizer & presets */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Real Audio visualizer screen */}
            <div id="vocal-spectrogram-screen" className="bg-stone-950 p-6 rounded-3xl border border-stone-900 text-white relative overflow-hidden flex flex-col gap-4">
              
              {/* Header metrics */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity size={16} className={`${isListening ? 'text-[#f59e0b] animate-bounce' : 'text-stone-500'}`} />
                  <span className="text-[10px] font-mono uppercase font-black text-stone-400">ACOUSTIC BIOMARKER SPECTRUM</span>
                </div>
                
                {/* Active hardware mode pill */}
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-amber-500 animate-ping' : 'bg-stone-600'}`} />
                  <span className="text-[9px] font-mono font-bold text-stone-400">
                    {micMode === 'authorized' ? 'REAL_MIC_FEED' : 'EMULATOR_LOOP'}
                  </span>
                </div>
              </div>

              {/* HTML Canvas Waveform rendering screen */}
              <div className="relative bg-stone-900/60 rounded-2xl border border-stone-850 p-2 overflow-hidden flex items-center justify-center">
                <canvas
                  id="vocal-waveform-canvas"
                  ref={canvasRef}
                  width="480"
                  height="160"
                  className="w-full max-w-full h-40 bg-stone-950/80 rounded-xl"
                />

                {isListening && (
                  <div className="absolute top-3.5 left-3.5 bg-rose-500/85 text-[9px] font-mono font-black text-white px-2 py-0.5 rounded tracking-widest uppercase animate-pulse">
                    ANALYZING LIVE...
                  </div>
                )}

                {isTraining && (
                  <div className="absolute inset-x-0 bottom-0 bg-stone-950/90 p-4 border-t border-stone-850 text-center space-y-2">
                    <p className="text-xs font-black text-amber-500 flex items-center justify-center gap-1.5">
                      <Sparkles size={14} className="animate-spin" />
                      Capturing {selectedPet.name}'s vocal cords traits... ({trainingProgress}%)
                    </p>
                    <div className="w-3/4 mx-auto bg-stone-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${trainingProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Toggle real mic authorization block */}
              <div className="flex items-center justify-between font-mono text-[10px] border-t border-stone-850 pt-4 text-stone-500">
                <span className="flex items-center gap-1">
                  <Sliders size={12} className="text-amber-600" />
                  Fundamental: <strong className="text-stone-300 font-bold">{selectedProfile.frequencyHz} Hz</strong>
                </span>

                <button
                  type="button"
                  onClick={handleToggleMicMode}
                  className={`px-3 py-1.5 rounded-lg font-bold border cursor-pointer flex items-center gap-1.5 uppercase transition-all ${
                    micMode === 'authorized' 
                      ? 'bg-rose-950 text-rose-300 border-rose-900 font-extrabold hover:bg-rose-900'
                      : 'bg-stone-800 text-stone-200 border-stone-700 hover:bg-stone-750'
                  }`}
                >
                  {micMode === 'authorized' ? (
                    <>
                      <MicOff size={11} className="text-rose-400" />
                      Deactivate Mic Feed
                    </>
                  ) : (
                    <>
                      <Mic size={11} className="text-amber-500" />
                      Authorize Real Microphone
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Test voice presets trigger list */}
            <div id="sound-presets-card" className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-black text-stone-850">Acoustic Pitch Trigger Simulator</h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Play simulated vocal cords triggers below to dry-test classifications without making your companion bark on-stage.
                </p>
              </div>

              <div id="preset-list" className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {getSimulatePresets().map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSimulateSound(preset)}
                    disabled={isListening || isTraining}
                    className="p-4 rounded-2xl bg-stone-55/65 hover:bg-amber-50 hover:text-amber-950 border border-stone-150/80 hover:border-amber-250 text-left transition-all cursor-pointer font-semibold group disabled:opacity-40"
                  >
                    <p className="text-[12.5px] font-black text-stone-800 group-hover:text-amber-900 transition-colors uppercase leading-snug">
                      {preset.label.split(' ')[1]} {preset.label.split(' ').slice(2).join(' ')}
                    </p>
                    <div className="flex items-center gap-1 font-mono text-[9px] text-stone-400 group-hover:text-amber-700 mt-2 font-black">
                      <span>{preset.pitch}Hz</span>
                      <span>•</span>
                      <span>{preset.durationSec}s</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Direct translate parser mock translation submission */}
              <form onSubmit={handleManualTranslationSubmit} className="pt-2 border-t border-stone-100 space-y-2">
                <label htmlFor="custom-trans-box" className="text-xs font-bold text-stone-500">Simulate Custom Vocalization Transcript:</label>
                <div className="flex gap-2">
                  <input
                    id="custom-trans-box"
                    type="text"
                    placeholder="e.g. Buster whining: 'Please open this door! I left my bone in the garden!'"
                    value={customPhrase}
                    onChange={(e) => setCustomPhrase(e.target.value)}
                    className="flex-1 bg-stone-50 border border-stone-200 focus:border-amber-550 focus:bg-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none"
                    maxLength={100}
                  />
                  <button
                    type="submit"
                    className="px-4 bg-stone-800 hover:bg-amber-800 text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    Translate
                  </button>
                </div>
              </form>

            </div>

          </div>

          {/* RIGHT: Voice Passport & Matches stream */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Biometric Passport Badge Card */}
            <div id="voice-passport-card" className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm space-y-4">
              <h3 className="text-base font-black text-stone-850">Acoustic Vocal Passport</h3>

              <div className="p-4 bg-amber-50/20 rounded-2xl border border-amber-100/50 space-y-4">
                
                {/* Voice Trained/Locked status label badge */}
                <div className="flex items-center justify-between border-b border-amber-100/30 pb-3 flex-wrap gap-2">
                  <span className="text-xs font-mono uppercase font-black text-stone-400">Fingerprint Registry</span>
                  {selectedProfile.hasTrainedVoice ? (
                    <span className="bg-emerald-50 border border-emerald-150 text-emerald-800 font-extrabold text-[10px] uppercase px-3 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle size={12} className="text-emerald-600" />
                      Acoustic Locked
                    </span>
                  ) : (
                    <span className="bg-rose-50 border border-rose-150 text-rose-800 font-extrabold text-[10px] uppercase px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
                      <AlertCircle size={12} className="text-rose-600 animate-spin" />
                      Calibrating Required
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 font-sans text-xs">
                  <div>
                    <p className="text-stone-400 text-[10px] font-mono uppercase">Fundamental Pitch</p>
                    <p className="text-sm font-black text-stone-800 mt-0.5">{selectedProfile.frequencyHz} Hz</p>
                  </div>
                  <div>
                    <p className="text-stone-400 text-[10px] font-mono uppercase">Vocal Amplitude Profile</p>
                    <p className="text-sm font-black text-stone-800 mt-0.5 capitalize">{selectedProfile.vocalTexture}</p>
                  </div>
                  <div>
                    <p className="text-stone-400 text-[10px] font-mono uppercase">Signature Emission</p>
                    <p className="text-sm font-black text-stone-800 mt-0.5 capitalize">{selectedProfile.barkPattern}</p>
                  </div>
                  <div>
                    <p className="text-stone-400 text-[10px] font-mono uppercase">Last Calibrated</p>
                    <p className="text-sm font-black text-stone-800 mt-0.5">{selectedProfile.trainedDate}</p>
                  </div>
                </div>

              </div>

              {/* Fingerprint training recalibrate button */}
              <button
                type="button"
                onClick={handleLaunchTraining}
                disabled={isListening || isTraining}
                className="w-full bg-stone-900 border border-stone-800 hover:bg-amber-800 hover:border-amber-900 text-stone-50 hover:text-white font-black text-xs py-3 rounded-2xl flex items-center justify-center gap-2 group transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-40"
              >
                <RotateCcw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                <span>
                  {selectedProfile.hasTrainedVoice ? 'Recalibrate Acoustic Model' : 'Train Custom Voice Print Model'}
                </span>
              </button>

            </div>

            {/* Visual Emotion Diagnostic Indicator */}
            <div id="voice-emotion-indicator-card" className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-stone-850">Live Emotion Diagnostic</h3>
                <span className="bg-amber-100 text-amber-900 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-md">
                  Active Scanner
                </span>
              </div>
              
              <div className="relative group overflow-hidden rounded-2xl border border-stone-150">
                <img 
                  src="/src/assets/images/happy_pet_status_1781057137747.png" 
                  alt="Happy Pet Analyzer Model" 
                  className="w-full h-auto object-cover hover:scale-102 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-900/35 to-transparent flex flex-col justify-end p-4 text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black uppercase tracking-wider text-amber-400">Emotion: Happy</span>
                    <span className="text-[10px] font-mono text-stone-300">Confidence: 92%</span>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-stone-750 space-y-1 text-xs text-stone-200">
                    <p className="font-bold flex items-center gap-1.5">
                      <span className="text-[#f59e0b] font-black">✓</span> Relaxed ears
                    </p>
                    <p className="font-bold flex items-center gap-1.5">
                      <span className="text-[#f59e0b] font-black">✓</span> Open eyes
                    </p>
                    <p className="font-bold flex items-center gap-1.5">
                      <span className="text-[#f59e0b] font-black">✓</span> Comfortable posture
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-[10.5px] text-stone-400 leading-relaxed">
                Biometric visual parsing engine overlays. Body scanning technology works synchronously with vocal track amplitude logs.
              </p>
            </div>

            {/* Translation Results Column */}
            <div id="voice-log-stream-card" className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-50 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-1.5 text-stone-800">
                  <Play size={16} className="text-amber-800" />
                  <h3 className="text-sm font-black uppercase tracking-wider font-mono">Translation Stream</h3>
                </div>

                {selectedLogs.length > 0 && (
                  <button
                    onClick={() => onClearLogs(selectedPetId)}
                    className="text-stone-400 hover:text-red-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Trash2 size={11} />
                    Clear Logs
                  </button>
                )}
              </div>

              {selectedLogs.length === 0 ? (
                <div className="text-center py-10 text-stone-400">
                  <Radio size={24} className="mx-auto text-stone-200 animate-pulse mb-2" />
                  <p className="text-xs font-bold leading-normal">No translation logs captured yet.</p>
                  <p className="text-[10px] text-stone-400/80 mt-1">Play preset voice triggers or train vocal pitch parameters above to parse acoustics.</p>
                </div>
              ) : (
                <div className="max-h-76 overflow-y-auto space-y-3.5 pr-1.5 scrollbar-thin">
                  {selectedLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className={`p-4 rounded-2xl border transition-all ${
                        log.confidenceScore > 98 
                          ? 'bg-amber-50/20 border-amber-100/40' 
                          : 'bg-stone-55/40 border-stone-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-stone-400 font-bold flex items-center gap-1">
                          <Clock size={10} />
                          {log.timestamp} • Duration: {log.vocalDurationSec}s
                        </span>
                        
                        <span className="text-[9.5px] font-mono font-black text-amber-800 uppercase px-1.5 py-0.5 rounded bg-amber-50">
                          {log.confidenceScore}% Certainty
                        </span>
                      </div>

                      <p className="text-[11px] font-black uppercase text-stone-800 mt-2 flex items-center gap-1">
                        <Sparkles size={11} className="text-[#f59e0b]" />
                        Emotion: {log.identifiedEmotion}
                      </p>

                      <p className="text-xs italic text-stone-605 mt-1.5 leading-relaxed font-semibold">
                        {log.translatedText}
                      </p>
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

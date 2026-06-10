/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Pet } from '../types';
import QRCode from 'qrcode';
import { QrCode, Download, ShieldAlert, Heart, PhoneCall } from 'lucide-react';

interface QrCodeGeneratorProps {
  pets: Pet[];
}

export default function QrCodeGenerator({ pets }: QrCodeGeneratorProps) {
  const [selectedPetId, setSelectedPetId] = useState<string>(pets[0]?.id || '');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const selectedPet = pets.find(p => p.id === selectedPetId);

  useEffect(() => {
    if (!selectedPet || !canvasRef.current) return;

    // Structure the QR payload beautifully
    // Contains emergency metadata so any scanner can read it quickly
    const qrPayload = `🚨 PET EMERGENCY ALERT 🚨
-------------------------
Companion: ${selectedPet.name}
Species/Breed: ${selectedPet.species} (${selectedPet.breed})
Age: ${selectedPet.age} yrs | Weight: ${selectedPet.weight} kg
Gender: ${selectedPet.gender}

⚠️ CLINICAL MEDICAL ALERTS:
${selectedPet.medicalAlerts || 'None registered'}

📞 EMERGENCY CONTACT INFO:
${selectedPet.emergencyContact || 'None registered'}`;

    // Render the Canvas
    QRCode.toCanvas(
      canvasRef.current,
      qrPayload,
      {
        width: 260,
        margin: 2,
        color: {
          dark: '#1c1917', // Beautiful deep stone-900 charcoal
          light: '#ffffff' // High contrast crisp white for standard camera scanning
        },
        errorCorrectionLevel: 'M'
      },
      (error) => {
        if (error) {
          console.error('QR Code Generation Error:', error);
          setGenerationError('Failed to generate high-contrast tracking QR.');
        } else {
          setGenerationError(null);
        }
      }
    );
  }, [selectedPetId, pets, selectedPet]);

  // Handle PNG downloads
  const handleDownloadPng = () => {
    if (!canvasRef.current || !selectedPet) return;

    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = `${selectedPet.name.replace(/\s+/g, '_')}_Emergency_Alert_QR.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error('Download QR Code PNG Failure:', err);
      alert('Unable to extract PNG download stream due to security policies.');
    }
  };

  return (
    <div id="qr-generator-tab" className="space-y-6">
      
      {/* Informational intro banner */}
      <div id="qr-intro-banner" className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-3xl p-6 shadow-xs flex items-center gap-4">
        <span className="text-3xl">🛡️</span>
        <div>
          <h2 className="text-lg font-extrabold text-stone-800">Scannable Emergency QR Smart Tags</h2>
          <p className="text-xs text-stone-500 mt-1 mb-1">
            Generate and export a unique life-saving code for each pet. Strap this code to their collars or travel carriers!
          </p>
          <p className="text-[10px] text-red-700 font-semibold uppercase tracking-wider">
            In case of emergency, rescuers scanning this code instantly reveal contacts & vital health caveats offline.
          </p>
        </div>
      </div>

      <div id="qr-interactive-workspace" className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Selection panel (left 2/5ths) */}
        <div className="lg:col-span-2 bg-white border border-stone-100 p-6 rounded-3xl shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
              <QrCode className="text-amber-500 shrink-0" size={18} />
              Companion Selector
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">Toggle pets to render emergency tags</p>
          </div>

          {pets.length === 0 ? (
            <p className="text-xs text-stone-400 font-sans italic">Please register a pet profile to activate QR capabilities.</p>
          ) : (
            <div id="qr-selector-list" className="space-y-2.5">
              {pets.map((pet) => (
                <button
                  key={pet.id}
                  id={`btn-select-qr-${pet.id}`}
                  onClick={() => setSelectedPetId(pet.id)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    selectedPetId === pet.id
                      ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-300'
                      : 'bg-white border-stone-150 hover:bg-stone-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={pet.photoUrl}
                      alt={pet.name}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-xl object-cover border border-stone-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-stone-800 truncate">{pet.name}</h4>
                      <p className="text-[10px] text-stone-400 truncate">{pet.species} · {pet.breed}</p>
                    </div>
                  </div>
                  <span className="text-xs">{(selectedPetId === pet.id) ? '🛡️' : '🔘'}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* QR Rendering and Tag display workspace (right 3/5ths) */}
        <div className="lg:col-span-3">
          {selectedPet ? (
            <div
              id="qr-mockup-collar-tag"
              className="bg-white border-2 border-stone-150 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row items-stretch"
            >
              {/* Collar Tag Mock Layout Left block (The QR canvas) */}
              <div className="bg-stone-50 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-stone-150 shrink-0">
                <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-stone-150 flex items-center justify-center">
                  <canvas ref={canvasRef} id={`canvas-qr-${selectedPet.id}`} className="max-w-full h-auto" />
                </div>
                {generationError && (
                  <p className="text-[10px] text-rose-600 font-bold mt-2">{generationError}</p>
                )}

                <button
                  type="button"
                  id="btn-download-qr-png"
                  onClick={handleDownloadPng}
                  className="mt-4 bg-amber-800 hover:bg-amber-900 text-stone-50 text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-xs hover:shadow-md"
                >
                  <Download size={13} />
                  <span>Download QR PNG</span>
                </button>
              </div>

              {/* Tag text details printed (Right block) */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold text-red-700 bg-red-100/60 max-w-max px-2.5 py-0.5 rounded-full font-sans uppercase tracking-widest">
                    <ShieldAlert size={11} className="shrink-0" />
                    Emergency Info Card
                  </div>

                  <h3 className="text-xl font-black text-stone-800 mt-2 flex items-center gap-1.5">
                    {selectedPet.name}
                    <span className="text-sm font-semibold text-stone-400 capitalize">({selectedPet.species})</span>
                  </h3>
                  <p className="text-xs text-stone-500 font-medium font-sans">Breed: {selectedPet.breed} | Age: {selectedPet.age} yrs</p>

                  {/* Contact Block */}
                  <div className="mt-4 space-y-3.5">
                    <div className="flex gap-2.5 items-start">
                      <div className="h-8 w-8 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center shrink-0">
                        <PhoneCall size={14} className="text-pink-600" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold text-pink-800 uppercase tracking-wide">Emergency Hotlines</h4>
                        <p className="text-xs text-stone-700 font-semibold font-mono leading-relaxed mt-0.5">
                          {selectedPet.emergencyContact || 'No contact numbers on file'}
                        </p>
                      </div>
                    </div>

                    {/* Medical Alerts Block */}
                    <div className="flex gap-2.5 items-start">
                      <div className="h-8 w-8 rounded-lg bg-amber-50 border border-amber-150 flex items-center justify-center shrink-0">
                        <Heart size={14} className="text-amber-700 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">Critical Health Notes</h4>
                        <p className="text-xs text-stone-700 font-semibold leading-relaxed mt-0.5 font-sans">
                          {selectedPet.medicalAlerts || 'None listed'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-4 text-[10px] text-stone-400 font-sans leading-relaxed">
                  Tip: print this card out or attach the downloaded PNG to collar loops, travel cages, or pet passports.
                </div>
              </div>
            </div>
          ) : (
            <div id="qr-mockup-empty" className="h-64 border border-dashed border-stone-200 bg-stone-50/50 rounded-3xl flex flex-col items-center justify-center text-center p-6 text-stone-400">
              <span className="text-3xl mb-1">🛡️</span>
              <p className="font-bold text-stone-600 text-xs">No registered companions to tag</p>
              <p className="text-[10px] mt-0.5">Please add companion profiles in the "Profiles" tab first.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

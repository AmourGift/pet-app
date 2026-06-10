/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Pet, GroomingAppointment } from '../types';
import { CalendarDays, ShoppingBag, Trash2, CalendarCheck, FileText, Sparkles } from 'lucide-react';

interface GroomingSchedulerProps {
  pets: Pet[];
  appointments: GroomingAppointment[];
  onAddAppointment: (appointment: Omit<GroomingAppointment, 'id'>) => void;
  onCancelAppointment: (id: string) => void;
}

const SERVICE_CATALOG = [
  { name: 'Nail Trim', price: 15, duration: '15 mins', icon: '✂️', desc: 'Claw clipping & safe mechanical dremel filing.' },
  { name: 'Bath & Brush', price: 25, duration: '45 mins', icon: '🧼', desc: 'Soothing organic shampoo, warm blow dry, and custom deshedding brushing.' },
  { name: 'Haircut', price: 45, duration: '60 mins', icon: '💈', desc: 'Stylish breed-specific trim, hygienic shaving, pet-friendly cologne spray.' },
  { name: 'Full Grooming', price: 70, duration: '90 mins', icon: '👑', desc: 'The royal treatment: Bath, conditioning, scissor styling, ear cleaning, and gland care.' }
];

export default function GroomingScheduler({
  pets,
  appointments,
  onAddAppointment,
  onCancelAppointment
}: GroomingSchedulerProps) {
  // Input fields state
  const [selectedPetId, setSelectedPetId] = useState<string>(pets[0]?.id || '');
  const [selectedService, setSelectedService] = useState<string>(SERVICE_CATALOG[0].name);
  const [dateTime, setDateTime] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');
  const [bookSuccess, setBookSuccess] = useState<boolean>(false);

  // Auto-derived price
  const activeService = SERVICE_CATALOG.find(s => s.name === selectedService);
  const servicePrice = activeService ? activeService.price : 0;

  // Handle book click from Catalog directly
  const handleQuickBook = (serviceName: string) => {
    setSelectedService(serviceName);
    // Focus down on the form or scroll smoothly
    const formElement = document.getElementById('book-grooming-form-box');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPetId || !selectedService || !dateTime) {
      alert('Please fill out all required fields to register a grooming appointment.');
      return;
    }

    onAddAppointment({
      petId: selectedPetId,
      serviceName: selectedService,
      cost: servicePrice,
      dateTime,
      instructions: instructions.trim() || 'No special requirements.',
      status: 'scheduled'
    });

    setInstructions('');
    setDateTime('');
    setBookSuccess(true);
    setTimeout(() => setBookSuccess(false), 3500);
  };

  // Split appointments to active (upcoming) and historic
  const sortedAppts = [...appointments].sort((a, b) => a.dateTime.localeCompare(b.dateTime));
  
  const upcomingAppts = sortedAppts.filter(
    app => app.status === 'scheduled'
  );

  const closedAppts = sortedAppts.filter(
    app => app.status === 'cancelled' || app.status === 'completed'
  );

  return (
    <div id="grooming-scheduler-tab" className="space-y-6">
      
      {/* Visual Service Catalog banner */}
      <div id="service-catalog-section" className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <ShoppingBag className="text-amber-500" size={20} />
            Our Professional Grooming Services
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">Select a service level tailored for your companion’s health and fresh looks</p>
        </div>

        <div id="catalog-card-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICE_CATALOG.map((serv) => (
            <div
              key={serv.name}
              id={`catalog-serv-${serv.name.replace(/\s+/g, '-').toLowerCase()}`}
              className="bg-white border border-stone-100 rounded-2xl p-5 hover:border-amber-200 hover:shadow-xs transition-all relative flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{serv.icon}</span>
                  <span className="text-sm font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl">
                    ${serv.price}
                  </span>
                </div>
                <h4 className="font-bold text-stone-800 text-sm mt-3">{serv.name}</h4>
                <p className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 max-w-max px-1.5 py-0.5 rounded-md mt-1 mb-2 font-mono">{serv.duration}</p>
                <p className="text-xs text-stone-500 leading-relaxed font-sans">{serv.desc}</p>
              </div>

              <button
                type="button"
                id={`btn-catalog-book-${serv.name.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => handleQuickBook(serv.name)}
                className="w-full text-xs font-bold text-center mt-4 bg-stone-50 group-hover:bg-amber-800 group-hover:text-stone-50 transition-all text-stone-600 py-2 rounded-xl border border-stone-200/50 group-hover:border-amber-805 cursor-pointer"
              >
                Book {serv.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div id="grooming-forms-and-lists" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Book Appointment Form (Column left) */}
        <div id="book-grooming-form-box" className="lg:col-span-1 bg-white border border-stone-100 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
            <CalendarCheck className="text-amber-500 shrink-0" size={18} />
            Schedule Grooming
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">Register a time window at our spa salon</p>

          <form id="grooming-form-submit" onSubmit={handleBookingSubmit} className="mt-4 space-y-4">
            {/* Companion Selection */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Companion *</label>
              <select
                id="groom-pet-select"
                value={selectedPetId}
                onChange={(e) => setSelectedPetId(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:outline-none focus:ring-amber-500 text-stone-700 font-medium"
                required
              >
                <option value="" disabled>Select Companion</option>
                {pets.map(pet => (
                  <option key={pet.id} value={pet.id}>{pet.name} ({pet.species})</option>
                ))}
              </select>
            </div>

            {/* Service Selection */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1 font-sans">Service Choice *</label>
              <select
                id="groom-service-select"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:outline-none focus:ring-amber-500 text-stone-700 font-semibold"
                required
              >
                {SERVICE_CATALOG.map(serv => (
                  <option key={serv.name} value={serv.name}>{serv.icon} {serv.name} — ${serv.price}</option>
                ))}
              </select>
            </div>

            {/* DateTime Selection */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Date & Time *</label>
              <input
                type="datetime-local"
                id="groom-datetime-input"
                required
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:outline-none focus:ring-amber-500 text-stone-700"
              />
            </div>

            {/* Dynamic Price Display */}
            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 flex justify-between items-center">
              <span className="text-xs font-semibold text-stone-700">Estimated Total:</span>
              <span className="text-base font-extrabold text-amber-905 font-mono">${servicePrice}.00</span>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Style Notes & Special Instructions</label>
              <textarea
                id="groom-instructions-input"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Groomer should be patient, avoid wetting head, uses oatmeal sensitive formula shampoo..."
                rows={3}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:outline-none focus:ring-amber-500 text-stone-700 resize-none font-sans placeholder-stone-400"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="groom-submit-btn"
              disabled={pets.length === 0}
              className="w-full bg-amber-800 hover:bg-amber-900 disabled:bg-stone-300 disabled:cursor-not-allowed text-stone-50 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Schedule Spa Session 🗓️</span>
            </button>

            {bookSuccess && (
              <div id="booking-success-log" className="bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-100 px-3 py-2.5 rounded-xl text-center">
                ✓ Spa Appointment scheduled. Look at the upcoming calendar!
              </div>
            )}
          </form>
        </div>

        {/* Appointment Lists Content (Column right 2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Upcoming Card Panel */}
          <div id="upcoming-appointments-box" className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
              <CalendarDays className="text-amber-500 shrink-0" size={18} />
              Upcoming Schedules ({upcomingAppts.length})
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">Current confirmed visits requested</p>

            {upcomingAppts.length === 0 ? (
              <div id="appts-upcoming-empty" className="h-48 border border-dashed border-stone-200 bg-stone-50/50 rounded-2xl flex flex-col items-center justify-center text-center p-6 mt-4">
                <span className="text-3xl mb-1">📅</span>
                <p className="font-bold text-stone-600 text-xs">No upcoming grooming appointments</p>
                <p className="text-[11px] text-stone-400 mt-0.5">Select a service level on the left catalog or quick logger to book.</p>
              </div>
            ) : (
              <div id="appts-upcoming-list" className="mt-4 space-y-3.5">
                {upcomingAppts.map((appt) => {
                  const pet = pets.find(p => p.id === appt.petId);
                  const formattedDate = new Date(appt.dateTime).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });
                  const formattedTime = new Date(appt.dateTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div
                      key={appt.id}
                      id={`appt-upcoming-card-${appt.id}`}
                      className="border border-stone-150 rounded-2xl p-4 hover:bg-stone-50/30 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div className="flex gap-3items-start">
                        {/* Status Icon */}
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-amber-50 border border-amber-100 text-lg flex items-center justify-center mt-0.5">
                          💈
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-stone-800 text-sm">
                              {pet ? pet.name : 'Registered Pet'}
                            </span>
                            <span className="text-xs text-stone-400">({pet?.species || 'Other'})</span>
                            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-full font-bold">
                              {appt.serviceName}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 mt-1.5 text-stone-500 font-medium text-xs font-mono">
                            <span>📅 {formattedDate}</span>
                            <span>•</span>
                            <span>⏰ {formattedTime}</span>
                            <span>•</span>
                            <span className="text-amber-700 font-bold">${appt.cost}</span>
                          </div>

                          {appt.instructions && appt.instructions !== 'No special requirements.' && (
                            <p className="mt-2 text-xs text-stone-500 bg-stone-50 border border-stone-100 p-2 rounded-xl flex gap-1 items-start leading-relaxed font-sans">
                              <FileText size={12} className="text-stone-400 shrink-0 mt-0.5" />
                              <span className="italic">Note: "{appt.instructions}"</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        id={`btn-cancel-appt-${appt.id}`}
                        onClick={() => {
                          if (confirm(`Are you sure you want to cancel the ${appt.serviceName} grooming appointment for ${pet ? pet.name : 'this pet'}?`)) {
                            onCancelAppointment(appt.id);
                          }
                        }}
                        className="bg-rose-50 hover:bg-rose-100/80 text-rose-700 text-xs font-bold border border-rose-100 py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Cancel</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Historical Card Panel */}
          {closedAppts.length > 0 && (
            <div id="past-appointments-box" className="bg-stone-50/40 border border-stone-100 rounded-3xl p-6">
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest">
                Grooming Visit Logs ({closedAppts.length})
              </h3>
              <div id="past-appointments-list" className="mt-3 space-y-2">
                {closedAppts.map((appt) => {
                  const pet = pets.find(p => p.id === appt.petId);
                  const isCompleted = appt.status === 'completed';
                  const apptDate = new Date(appt.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                  return (
                    <div key={appt.id} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-white border border-stone-150/50">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{isCompleted ? '✅' : '❌'}</span>
                        <div className="font-sans">
                          <span className="font-bold text-stone-700">{pet ? pet.name : 'Pet'}</span>
                          <span className="text-stone-400 font-medium"> — {appt.serviceName} ({apptDate})</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md font-bold font-mono ${isCompleted ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-400'}`}>
                        {appt.status.toUpperCase()} (${appt.cost})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

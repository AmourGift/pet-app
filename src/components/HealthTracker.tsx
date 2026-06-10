/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Pet, VetVisit, VaccinationRecord, WeightEntry } from '../types';
import CustomChart from './CustomChart';
import { HeartPulse, Stethoscope, Plus, Syringe, Scale, CalendarCheck2, ShieldAlert } from 'lucide-react';

interface HealthTrackerProps {
  pets: Pet[];
  vetVisits: VetVisit[];
  vaccinations: VaccinationRecord[];
  weightEntries: WeightEntry[];
  onAddVetVisit: (visit: Omit<VetVisit, 'id'>) => void;
  onAddVaccination: (record: Omit<VaccinationRecord, 'id'>) => void;
  onAddWeightEntry: (entry: Omit<WeightEntry, 'id'>) => void;
}

export default function HealthTracker({
  pets,
  vetVisits,
  vaccinations,
  weightEntries,
  onAddVetVisit,
  onAddVaccination,
  onAddWeightEntry
}: HealthTrackerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'vaccines' | 'weight' | 'visits'>('weight');
  const [selectedPetId, setSelectedPetId] = useState<string>(pets[0]?.id || '');

  // Form states - Vaccinations
  const [vacPetId, setVacPetId] = useState<string>(pets[0]?.id || '');
  const [vaccineName, setVaccineName] = useState<string>('');
  const [vacDateGiven, setVacDateGiven] = useState<string>('');
  const [vacDateDue, setVacDateDue] = useState<string>('');
  const [vacSuccess, setVacSuccess] = useState<boolean>(false);

  // Form states - Weight Entry
  const [weightPetId, setWeightPetId] = useState<string>(pets[0]?.id || '');
  const [weightValue, setWeightValue] = useState<string>('');
  const [weightDate, setWeightDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [weightSuccess, setWeightSuccess] = useState<boolean>(false);

  // Form states - Vet Visit
  const [vetPetId, setVetPetId] = useState<string>(pets[0]?.id || '');
  const [vetDate, setVetDate] = useState<string>('');
  const [vetReason, setVetReason] = useState<string>('');
  const [vetName, setVetName] = useState<string>('');
  const [vetCost, setVetCost] = useState<string>('');
  const [vetNotes, setVetNotes] = useState<string>('');
  const [vetSuccess, setVetSuccess] = useState<boolean>(false);

  // Today context date for vaccination alerts (June 2026)
  const todayStr = '2026-06-09';

  // Submissions
  const handleVaccineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacPetId || !vaccineName || !vacDateGiven || !vacDateDue) return;

    onAddVaccination({
      petId: vacPetId,
      vaccineName: vaccineName.trim(),
      dateGiven: vacDateGiven,
      dateDue: vacDateDue
    });

    setVaccineName('');
    setVacDateGiven('');
    setVacDateDue('');
    setVacSuccess(true);
    setTimeout(() => setVacSuccess(false), 3000);
  };

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedWeight = parseFloat(weightValue);
    if (!weightPetId || isNaN(parsedWeight) || !weightDate) return;

    onAddWeightEntry({
      petId: weightPetId,
      date: weightDate,
      weight: parsedWeight
    });

    setWeightValue('');
    setWeightSuccess(true);
    setTimeout(() => setWeightSuccess(false), 3000);
  };

  const handleVetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedCost = parseFloat(vetCost) || 0;
    if (!vetPetId || !vetDate || !vetReason || !vetName) return;

    onAddVetVisit({
      petId: vetPetId,
      date: vetDate,
      reason: vetReason.trim(),
      vetName: vetName.trim(),
      cost: parsedCost,
      notes: vetNotes.trim() || 'General wellness check. Up to code.'
    });

    setVetDate('');
    setVetReason('');
    setVetName('');
    setVetCost('');
    setVetNotes('');
    setVetSuccess(true);
    setTimeout(() => setVetSuccess(false), 3000);
  };

  // Preparation of selected weight chart data
  const matchingWeightEntries = weightEntries
    .filter(w => w.petId === selectedPetId)
    .sort((a, b) => a.date.localeCompare(b.date));

  const chartData = matchingWeightEntries.map(w => ({
    label: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    value: w.weight
  }));

  const activeChartPet = pets.find(p => p.id === selectedPetId);

  return (
    <div id="health-tracker-tab" className="space-y-6">
      
      {/* Tab Nav Header */}
      <div id="health-sub-navigation" className="bg-white p-2 rounded-2xl border border-stone-150 flex items-center gap-1.5 overflow-x-auto">
        <button
          id="btn-sub-weight"
          onClick={() => setActiveSubTab('weight')}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'weight'
              ? 'bg-amber-100 text-amber-900 border border-amber-200'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Scale size={15} />
          <span>Weight Trends</span>
        </button>

        <button
          id="btn-sub-vaccines"
          onClick={() => setActiveSubTab('vaccines')}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'vaccines'
              ? 'bg-amber-100 text-amber-900 border border-amber-200'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Syringe size={15} />
          <span>Vaccinations</span>
        </button>

        <button
          id="btn-sub-visits"
          onClick={() => setActiveSubTab('visits')}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'visits'
              ? 'bg-amber-100 text-amber-900 border border-amber-200'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Stethoscope size={15} />
          <span>Vet Visit Logs</span>
        </button>
      </div>

      {activeSubTab === 'weight' && (
        <div id="weight-sub-tab" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart visualizers (Column 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-stone-800 flex items-center gap-2">
                    <Scale className="text-amber-500" size={20} />
                    Weight Trend Diagnostics
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">Is checking growth on target? View standard scaling histories.</p>
                </div>
                
                {pets.length > 0 && (
                  <select
                    id="health-pet-select-wt"
                    value={selectedPetId}
                    onChange={(e) => setSelectedPetId(e.target.value)}
                    className="bg-stone-50 border border-stone-200 text-stone-700 text-xs rounded-xl px-3 py-2 focus:ring-1 focus:ring-amber-500 text-sans font-semibold"
                  >
                    {pets.map(pet => (
                      <option key={pet.id} value={pet.id}>📊 {pet.name} ({pet.species})</option>
                    ))}
                  </select>
                )}
              </div>

              <CustomChart
                data={chartData}
                unit="kg"
                title={activeChartPet ? `${activeChartPet.name}'s Interactive Progress` : 'Companion weight logs'}
                colorTheme={activeChartPet?.species === 'Dog' ? 'amber' : activeChartPet?.species === 'Cat' ? 'indigo' : 'emerald'}
              />
            </div>
          </div>

          {/* Add entry form (Column 1/3) */}
          <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
              <Plus className="text-amber-500 shrink-0" size={18} />
              Add Weight Entry
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">Increment companion scaling metrics</p>

            <form id="weight-entry-submit" onSubmit={handleWeightSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Companion *</label>
                <select
                  id="we-pet-select"
                  value={weightPetId}
                  onChange={(e) => setWeightPetId(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-700 font-medium focus:ring-1 focus:ring-amber-500"
                  required
                >
                  <option value="" disabled>Select Companion</option>
                  {pets.map(pet => (
                    <option key={pet.id} value={pet.id}>{pet.name} ({pet.species})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Weight Value (kg) *</label>
                <input
                  type="number"
                  id="we-value"
                  required
                  step="0.01"
                  min="0.1"
                  max="150"
                  value={weightValue}
                  onChange={(e) => setWeightValue(e.target.value)}
                  placeholder="e.g. 32.8"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:outline-none focus:ring-amber-500 text-stone-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Recording Date *</label>
                <input
                  type="date"
                  id="we-date"
                  required
                  value={weightDate}
                  onChange={(e) => setWeightDate(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:outline-none focus:ring-amber-500 text-stone-700"
                />
              </div>

              <button
                type="submit"
                id="we-submit-btn"
                disabled={pets.length === 0}
                className="w-full bg-amber-800 hover:bg-amber-900 disabled:bg-stone-300 disabled:cursor-not-allowed text-stone-50 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Save Weight Node
              </button>

              {weightSuccess && (
                <div id="we-success-log" className="bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-100 px-3 py-2 rounded-xl text-center">
                  ✓ Weight logged! Watch chart updates immediately.
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {activeSubTab === 'vaccines' && (
        <div id="vaccines-sub-tab" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Form Card (Column 1/3) */}
          <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
              <Syringe className="text-indigo-500 shrink-0" size={18} />
              Track Vaccination
            </h3>
            <p className="text-xs text-stone-400 mt-0.5 font-sans">Document defensive vaccines given at diagnostic vet visits</p>

            <form id="vaccine-form" onSubmit={handleVaccineSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Companion *</label>
                <select
                  id="vac-pet-select"
                  value={vacPetId}
                  onChange={(e) => setVacPetId(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-700 focus:ring-1 focus:ring-amber-500"
                  required
                >
                  <option value="" disabled>Select Companion</option>
                  {pets.map(pet => (
                    <option key={pet.id} value={pet.id}>{pet.name} ({pet.species})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Vaccine / Protection Name *</label>
                <input
                  type="text"
                  id="vac-name"
                  required
                  placeholder="e.g. DHPP Booster, Feline Rabies"
                  value={vaccineName}
                  onChange={(e) => setVaccineName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:outline-none focus:ring-amber-500 text-stone-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Date Administered *</label>
                  <input
                    type="date"
                    id="vac-date-given"
                    required
                    value={vacDateGiven}
                    onChange={(e) => setVacDateGiven(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-2 text-xs focus:ring-1 focus:outline-none text-stone-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Next Due Date *</label>
                  <input
                    type="date"
                    id="vac-date-due"
                    required
                    value={vacDateDue}
                    onChange={(e) => setVacDateDue(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-2 text-xs focus:ring-1 focus:outline-none text-stone-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="vac-submit-btn"
                disabled={pets.length === 0}
                className="w-full bg-amber-800 hover:bg-amber-900 disabled:bg-stone-300 disabled:cursor-not-allowed text-stone-50 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Log Vaccine Record 🛡️
              </button>

              {vacSuccess && (
                <div id="vac-success-log" className="bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-100 px-3 py-2 rounded-xl text-center">
                  ✓ Protection recorded! List is successfully updated.
                </div>
              )}
            </form>
          </div>

          {/* List and booster schedules (Column 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
              <h3 className="text-base font-extrabold text-stone-800 flex items-center gap-2">
                <CalendarCheck2 className="text-amber-500" size={18} />
                Vaccination Calendar & Schedule List
              </h3>
              <p className="text-xs text-stone-400 mt-1">Overview of immunized state and pending renewals</p>

              {vaccinations.length === 0 ? (
                <div id="vac-tracker-empty" className="h-48 border border-dashed border-stone-200 bg-stone-50/50 rounded-2xl flex flex-col items-center justify-center p-6 text-center mt-4">
                  <span className="text-3xl">🛡️</span>
                  <p className="text-stone-600 font-bold mt-1 text-xs">No vaccination records stored</p>
                  <p className="text-stone-400 text-[11px] mt-0.5">Use the ledger form on the left to add safety injections.</p>
                </div>
              ) : (
                <div id="vac-tracker-list" className="mt-4 space-y-3">
                  {vaccinations.map((vac) => {
                    const pet = pets.find(p => p.id === vac.petId);

                    // Calculations: Is the due date soon?
                    const isOverdue = vac.dateDue < todayStr;
                    
                    // Simple warning logic: within 90 days of todayStr (2026-06-09)
                    const timeDiff = new Date(vac.dateDue).getTime() - new Date(todayStr).getTime();
                    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    const isDueSoon = !isOverdue && daysRemaining <= 90;

                    return (
                      <div
                        key={vac.id}
                        id={`vac-item-${vac.id}`}
                        className="p-4 rounded-2xl border border-stone-150 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-stone-800 text-sm">{pet ? pet.name : 'Unknown Pet'}</span>
                            <span className="text-xs text-stone-400 font-mono">({pet?.breed || 'Breed undisclosed'})</span>
                            <span className="text-[10px] bg-slate-100 border border-stone-200 font-bold px-2 py-0.5 rounded-full text-stone-600">
                              💉 {vac.vaccineName}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-xs font-mono text-stone-500 font-medium">
                            <p>Administered: <span className="font-bold text-stone-600">{vac.dateGiven}</span></p>
                            <p>Booster Due: <span className="font-bold text-stone-600">{vac.dateDue}</span></p>
                          </div>
                        </div>

                        {/* Status tag */}
                        <div className="shrink-0 flex items-center justify-end">
                          {isOverdue ? (
                            <span className="bg-rose-50 text-rose-800 border border-rose-100 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1 leading-none">
                              <ShieldAlert size={12} className="text-rose-500 shrink-0" />
                              ⚠️ Overdue
                            </span>
                          ) : isDueSoon ? (
                            <span className="bg-amber-50 text-amber-800 border border-amber-150 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1 leading-none">
                              ⏳ Due in {daysRemaining} days
                            </span>
                          ) : (
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1 leading-none">
                              ✓ Safe
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'visits' && (
        <div id="visits-sub-tab" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vet log form (Column 1/3) */}
          <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-stone-800 flex items-center gap-2 font-sans">
              <Stethoscope className="text-rose-500 shrink-0" size={18} />
              Log Vet Clinic Visit
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">Register doctor wellness notes manually</p>

            <form id="vet-visit-form" onSubmit={handleVetSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Companion *</label>
                <select
                  id="vet-pet-select"
                  value={vetPetId}
                  onChange={(e) => setVetPetId(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-700 font-medium focus:ring-1 focus:ring-amber-500Heading"
                  required
                >
                  <option value="" disabled>Select Companion</option>
                  {pets.map(pet => (
                    <option key={pet.id} value={pet.id}>{pet.name} ({pet.species})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Visit Date *</label>
                <input
                  type="date"
                  id="vet-date-input"
                  required
                  value={vetDate}
                  onChange={(e) => setVetDate(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:outline-none focus:ring-amber-500 text-stone-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Reason for Visit *</label>
                <input
                  type="text"
                  id="vet-reason-input"
                  required
                  placeholder="e.g. Ear scratching, annual wellness, dental scaling"
                  value={vetReason}
                  onChange={(e) => setVetReason(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:outline-none focus:ring-amber-500 text-stone-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Doctor Name *</label>
                  <input
                    type="text"
                    id="vet-doctor-input"
                    required
                    placeholder="e.g. Dr. Woods"
                    value={vetName}
                    onChange={(e) => setVetName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-2 text-xs focus:ring-1 focus:outline-none text-stone-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1 font-sans">Cost ($ USD) *</label>
                  <input
                    type="number"
                    id="vet-cost-input"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 120"
                    required
                    value={vetCost}
                    onChange={(e) => setVetCost(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-2 text-xs focus:ring-1 focus:outline-none text-stone-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Clinical Notes & Diagnosis</label>
                <textarea
                  id="vet-notes-textarea"
                  value={vetNotes}
                  onChange={(e) => setVetNotes(e.target.value)}
                  placeholder="e.g. Slight plaque identified, heart sounds normal. Advised dry kibble twice a day."
                  rows={3}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:outline-none focus:ring-amber-500 text-stone-700 resize-none placeholder-stone-400"
                />
              </div>

              <button
                type="submit"
                id="vet-submit-btn"
                disabled={pets.length === 0}
                className="w-full bg-amber-800 hover:bg-amber-900 disabled:bg-stone-300 disabled:cursor-not-allowed text-stone-50 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Log Clinic Records
              </button>

              {vetSuccess && (
                <div id="vet-success-log" className="bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-100 px-3 py-2 rounded-xl text-center">
                  Notice: Wellness checklist update saved!
                </div>
              )}
            </form>
          </div>

          {/* Visits register list (Column 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
              <h3 className="text-base font-extrabold text-stone-800 flex items-center gap-2">
                <Stethoscope className="text-rose-500" size={18} />
                Clinic Ledger & Diagnostics List
              </h3>
              <p className="text-xs text-stone-400 mt-1">Chronological clinic treatment notes</p>

              {vetVisits.length === 0 ? (
                <div id="vet-visits-empty" className="h-48 border border-dashed border-stone-200 bg-stone-50/50 rounded-2xl flex flex-col items-center justify-center p-6 text-center mt-4">
                  <span className="text-3xl">🏥</span>
                  <p className="text-stone-600 font-bold mt-1 text-xs font-sans">No clinical logs on file</p>
                  <p className="text-stone-400 text-[11px] mt-0.5">Use the clinical form on the left to log physical diagnostics.</p>
                </div>
              ) : (
                <div id="vet-visits-list" className="mt-4 space-y-4">
                  {[...vetVisits].sort((a, b) => b.date.localeCompare(a.date)).map((visit) => {
                    const pet = pets.find(p => p.id === visit.petId);

                    return (
                      <div
                        key={visit.id}
                        id={`vet-entry-${visit.id}`}
                        className="p-4 rounded-2xl border border-stone-150 hover:bg-stone-50/30 transition-all bg-white"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-stone-800 text-sm">{pet ? pet.name : 'Companion'}</span>
                            <span className="text-xs text-stone-400 font-medium font-sans">({pet?.breed || 'Other'})</span>
                            <span className="text-[10px] bg-amber-50 text-amber-900 border border-amber-100 font-extrabold px-2 py-0.5 rounded-full">
                              🤒 {visit.reason}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-stone-105 text-stone-600 font-serif font-semibold px-2 py-0.5 rounded-md">
                              🧑‍⚕️ {visit.vetName}
                            </span>
                            <span className="text-xs bg-rose-50 text-rose-800 font-semibold border border-rose-100 px-2 py-0.5 rounded-md font-mono">
                              ${visit.cost} USD
                            </span>
                          </div>
                        </div>

                        {/* Clinic Notes */}
                        <div className="mt-3 text-xs bg-stone-50 border border-stone-100 p-3 rounded-2xl">
                          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1 font-mono">Diagnosis & Instructions:</p>
                          <p className="text-stone-600 leading-relaxed font-sans">{visit.notes}</p>
                        </div>

                        <div className="mt-2 text-right">
                          <span className="text-[10px] font-mono font-medium text-stone-400">Treatment date: {visit.date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

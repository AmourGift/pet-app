/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Pet, DailyCareLog, CareLogType } from '../types';
import { ClipboardList, PlusCircle, CalendarRange, HeartHandshake, History, FileHeart } from 'lucide-react';

interface DailyCareLogTabProps {
  pets: Pet[];
  careLogs: DailyCareLog[];
  onAddCareLog: (log: Omit<DailyCareLog, 'id'>) => void;
}

export default function DailyCareLogTab({ pets, careLogs, onAddCareLog }: DailyCareLogTabProps) {
  // Input form state
  const [selectedPetId, setSelectedPetId] = useState<string>(pets[0]?.id || '');
  const [logType, setLogType] = useState<CareLogType>('feeding');
  const [logTime, setLogTime] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [logDate, setLogDate] = useState<string>('2026-06-09'); // Preset virtual today date context (June 9, 2026)
  const [logDetails, setLogDetails] = useState<string>('');
  const [logSuccess, setLogSuccess] = useState<boolean>(false);

  // Filters
  const [historyPetFilter, setHistoryPetFilter] = useState<string>('All');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>('All');

  // Virtual today date
  const todayStr = '2026-06-09';

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPetId || !logDetails.trim() || !logTime || !logDate) return;

    onAddCareLog({
      petId: selectedPetId,
      type: logType,
      date: logDate,
      time: logTime,
      details: logDetails.trim()
    });

    setLogDetails('');
    setLogSuccess(true);
    setTimeout(() => setLogSuccess(false), 3000);
  };

  // Group logs
  const logsToday = careLogs.filter(log => log.date === todayStr);

  // Filter history
  const filteredHistoryLogs = careLogs.filter(log => {
    const matchesPet = historyPetFilter === 'All' || log.petId === historyPetFilter;
    const matchesType = historyTypeFilter === 'All' || log.type === historyTypeFilter;
    return matchesPet && matchesType;
  }).sort((a, b) => {
    // Sort chronology descending: most recent first
    const dateComp = b.date.localeCompare(a.date);
    if (dateComp !== 0) return dateComp;
    return b.time.localeCompare(a.time);
  });

  return (
    <div id="care-logging-tab" className="space-y-6">
      
      {/* Title block */}
      <div id="care-logging-banner" className="bg-gradient-to-r from-emerald-50 to-amber-50 border border-emerald-100 rounded-3xl p-6 shadow-xs flex items-center gap-4">
        <span className="text-3xl">🧺</span>
        <div>
          <h2 className="text-lg font-extrabold text-stone-800">Daily Grooming & Activity Log</h2>
          <p className="text-xs text-stone-500 mt-1">Check today’s status or write food, health pills, and outdoor wander times.</p>
        </div>
      </div>

      <div id="care-log-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form (1/3 Width) */}
        <div id="new-care-log-form-box" className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm h-fit">
          <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
            <PlusCircle className="text-emerald-500 shrink-0" size={18} />
            Write Care Activity
          </h3>
          <p className="text-xs text-stone-400 mt-0.5 font-sans">Submit companion activity details below</p>

          <form id="new-care-log-form" onSubmit={handleLogSubmit} className="mt-4 space-y-4">
            
            {/* Pick Companion */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Companion *</label>
              <select
                id="log-pet-select"
                value={selectedPetId}
                onChange={(e) => setSelectedPetId(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-700 font-medium focus:ring-1 focus:ring-amber-500"
                required
              >
                <option value="" disabled>Select Companion</option>
                {pets.map(pet => (
                  <option key={pet.id} value={pet.id}>{pet.name} ({pet.species})</option>
                ))}
              </select>
            </div>

            {/* Pick Activity Type */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Activity Type *</label>
              <div className="grid grid-cols-3 gap-2">
                {(['feeding', 'walking', 'medication'] as CareLogType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    id={`btn-care-type-${type}`}
                    onClick={() => setLogType(type)}
                    className={`py-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      logType === type
                        ? 'bg-emerald-800 border-emerald-800 text-stone-50 shadow-xs animate-scale'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <span>{type === 'feeding' ? '🥣' : type === 'walking' ? '🦮' : '💊'}</span>
                    <span className="capitalize text-[10px] font-sans font-medium">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date and Time selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1 font-sans">Date *</label>
                <input
                  type="date"
                  id="log-date-input"
                  required
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-2 text-xs focus:ring-1 focus:outline-none focus:ring-emerald-500 text-stone-700"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1 font-sans">Time *</label>
                <input
                  type="time"
                  id="log-time-input"
                  required
                  value={logTime}
                  onChange={(e) => setLogTime(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-2 text-xs focus:ring-1 focus:outline-none focus:ring-emerald-500 text-stone-700"
                />
              </div>
            </div>

            {/* Description Details */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Details & Remarks *</label>
              <textarea
                id="log-details-textarea"
                required
                value={logDetails}
                onChange={(e) => setLogDetails(e.target.value)}
                placeholder={
                  logType === 'feeding'
                    ? 'e.g. Pure salmon wet kibble, 1.5 cups.'
                    : logType === 'walking'
                    ? 'e.g. Fast park walk (30 mins), socialized.'
                    : 'e.g. Bravecto flea chewable pill (1 capsule).'
                }
                rows={3}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:outline-none focus:ring-emerald-500 text-stone-700 resize-none font-sans placeholder-stone-400"
              />
            </div>

            <button
              type="submit"
              id="log-submit-btn"
              disabled={pets.length === 0}
              className="w-full bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-300 disabled:cursor-not-allowed text-stone-50 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Commit Log entry ✓</span>
            </button>

            {logSuccess && (
              <div id="log-success-alert" className="bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-100 px-3 py-2 rounded-xl text-center">
                ✓ Recorded successfully! Check schedule outputs.
              </div>
            )}
          </form>
        </div>

        {/* Right Columns: Today's Summary & Back History (2/3 Width) */}
        <div id="care-history-column" className="lg:col-span-2 space-y-6">
          
          {/* Today's visual checkboxes checklist planner */}
          <div id="today-checklist-box" className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-stone-800 flex items-center gap-2 font-sans">
              <ClipboardList className="text-rose-500 shrink-0" size={18} />
              Today's Completed Checklist
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">Summary tracker for June 9, 2026</p>

            {logsToday.length === 0 ? (
              <div id="today-checklist-empty" className="h-32 border border-dashed border-stone-200 bg-stone-50/50 rounded-2xl flex flex-col items-center justify-center p-6 text-center mt-3 text-stone-400">
                <span className="text-2xl mb-1">🏡</span>
                <p className="font-extrabold text-stone-600 text-xs">No care records logged today</p>
                <p className="text-[10px] mt-0.5">Log actions on the left sidebar to populate today’s completed list.</p>
              </div>
            ) : (
              <div id="today-checklist-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {logsToday.map((log) => {
                  const pet = pets.find(p => p.id === log.petId);

                  const symbol = {
                    feeding: { emoji: '🥣', bg: 'bg-amber-50 border-amber-100', text: 'text-amber-800' },
                    walking: { emoji: '🦮', bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-800' },
                    medication: { emoji: '💊', bg: 'bg-indigo-50 border-indigo-100', text: 'text-indigo-800' }
                  }[log.type] || { emoji: '✅', bg: 'bg-stone-50 border-stone-100', text: 'text-stone-700' };

                  return (
                    <div
                      key={log.id}
                      className="p-3 bg-stone-50/50 border border-stone-150/60 rounded-2xl flex gap-3 items-center"
                    >
                      <span className={`h-9 w-9 text-base flex items-center justify-center rounded-xl border shrink-0 ${symbol.bg} ${symbol.text}`}>
                        {symbol.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-stone-800 text-xs truncate max-w-[80px]">
                            {pet ? pet.name : 'Pet'}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${symbol.bg} ${symbol.text}`}>
                            {log.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 truncate mt-0.5 font-medium">{log.details}</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-stone-400 shrink-0">
                        {log.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Weekly history filtering timeline */}
          <div id="weekly-history-box" className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
                  <History className="text-amber-500 shrink-0" size={18} />
                  Historical Care Register
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">Filter and query historic activity entries on file</p>
              </div>

              {/* Filtering drop Group */}
              <div id="history-filter-controls" className="flex items-center gap-2 flex-wrap">
                <select
                  id="historian-pet-filter"
                  value={historyPetFilter}
                  onChange={(e) => setHistoryPetFilter(e.target.value)}
                  className="bg-stone-50 border border-stone-200 text-stone-700 text-xs rounded-xl px-2.5 py-1.5 font-semibold focus:outline-none"
                >
                  <option value="All">All Companions 🐶</option>
                  {pets.map(pet => (
                    <option key={pet.id} value={pet.id}>{pet.name}</option>
                  ))}
                </select>

                <select
                  id="historian-type-filter"
                  value={historyTypeFilter}
                  onChange={(e) => setHistoryTypeFilter(e.target.value)}
                  className="bg-stone-50 border border-stone-200 text-stone-700 text-xs rounded-xl px-2.5 py-1.5 font-semibold focus:outline-none"
                >
                  <option value="All">All Activities 📋</option>
                  <option value="feeding">🥣 Feeding</option>
                  <option value="walking">🦮 Walking</option>
                  <option value="medication">💊 Medication</option>
                </select>
              </div>
            </div>

            {filteredHistoryLogs.length === 0 ? (
              <div id="history-list-empty" className="h-40 border border-dashed border-stone-200 bg-stone-50/50 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-stone-400">
                <span className="text-2xl mb-1">📋</span>
                <p className="font-bold text-stone-600 text-xs">No entries match your historical criteria</p>
                <p className="text-[10px] mt-0.5 font-sans">Clear or expand the filters to see archived records.</p>
              </div>
            ) : (
              <div id="care-weekly-scroll-timeline" className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {filteredHistoryLogs.map((log) => {
                  const pet = pets.find(p => p.id === log.petId);

                  const symbol = {
                    feeding: { label: 'Feeding 🥣', styles: 'bg-amber-50 text-amber-800' },
                    walking: { label: 'Walking 🦮', styles: 'bg-emerald-50 text-emerald-800' },
                    medication: { label: 'Medication 💊', styles: 'bg-indigo-50 text-indigo-800' }
                  }[log.type] || { label: 'Action ✓', styles: 'bg-stone-100 text-stone-700' };

                  return (
                    <div
                      key={log.id}
                      className="p-3 bg-white hover:bg-stone-50/50 border border-stone-150 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-2 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="shrink-0">
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-xl uppercase tracking-wider font-sans ${symbol.styles}`}>
                            {symbol.label}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-stone-700 font-bold">
                            {pet ? pet.name : 'Unknown Companion'}
                            <span className="font-medium text-stone-500 font-sans"> logged action: </span>
                            <span className="font-semibold text-emerald-800 font-sans">"{log.details}"</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono font-medium text-stone-400 bg-stone-100 px-2 py-0.5 rounded-lg">
                          📅 {log.date} @ {log.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

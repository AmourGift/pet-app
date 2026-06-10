/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Pet, GroomingAppointment, VaccinationRecord, DailyCareLog, WeightEntry, CareLogType, PetTrackingState } from '../types';
import CustomChart from './CustomChart';
import { 
  PlusCircle, 
  HeartPulse, 
  Sparkles, 
  Footprints, 
  ClipboardList, 
  TrendingUp,
  Bell,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  CheckCircle2,
  ExternalLink,
  RotateCcw
} from 'lucide-react';

interface DashboardAlert {
  id: string;
  type: 'overdue' | 'upcoming' | 'task_overdue' | 'task_pending';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  badgeText: string;
  dateStr?: string;
  petId?: string;
  petName?: string;
  petPhoto?: string;
  actionTab?: string;
  actionLabel?: string;
}

interface DashboardProps {
  pets: Pet[];
  appointments: GroomingAppointment[];
  vaccinations: VaccinationRecord[];
  careLogs: DailyCareLog[];
  weightEntries: WeightEntry[];
  onAddCareLog: (log: Omit<DailyCareLog, 'id'>) => void;
  onSetActiveTab: (tab: string) => void;
  trackingStates?: PetTrackingState[];
}

export default function Dashboard({
  pets,
  appointments,
  vaccinations,
  careLogs,
  weightEntries,
  onAddCareLog,
  onSetActiveTab,
  trackingStates
}: DashboardProps) {
  const [selectedPetId, setSelectedPetId] = useState<string>(pets[0]?.id || '');
  
  // Quick Log states
  const [quickPetId, setQuickPetId] = useState<string>(pets[0]?.id || '');
  const [quickType, setQuickType] = useState<CareLogType>('feeding');
  const [quickTime, setQuickTime] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [quickDetails, setQuickDetails] = useState<string>('');
  const [logSuccess, setLogSuccess] = useState<boolean>(false);

  // Dismissed Alert State using LocalStorage for durability
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('petCare_dismissedAlerts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleDismissAlert = (id: string) => {
    const updated = [...dismissedAlertIds, id];
    setDismissedAlertIds(updated);
    try {
      localStorage.setItem('petCare_dismissedAlerts', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save dismissed alert:', e);
    }
  };

  const handleResetDismissed = () => {
    setDismissedAlertIds([]);
    try {
      localStorage.removeItem('petCare_dismissedAlerts');
    } catch (e) {
      console.error('Failed to reset dismissed alerts:', e);
    }
  };

  // Formatting date for comparisons: Today is 2026-06-09 dynamically matching layout
  const todayStr = '2026-06-09';

  // Days difference calculation
  const daysBetween = (date1: string, date2: string) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = d2.getTime() - d1.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Action processor for alert items
  const handleAlertAction = (alert: DashboardAlert) => {
    if (alert.actionTab === 'dashboard' && alert.petId) {
      setQuickPetId(alert.petId);
      setQuickType('feeding');
      const loggerElement = document.getElementById('quick-care-logger-widget');
      if (loggerElement) {
        loggerElement.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (alert.actionTab) {
      onSetActiveTab(alert.actionTab);
    }
  };

  // Compute Alerts list dynamically based on companions, vaccinations, schedules, activities
  const alerts: DashboardAlert[] = [];

  pets.forEach((pet) => {
    // 0. Check tracker geofence boundary violation
    if (trackingStates) {
      const pState = trackingStates.find(s => s.petId === pet.id);
      if (pState) {
        const dist = Math.sqrt(pState.latitude * pState.latitude + pState.longitude * pState.longitude);
        if (dist > pState.safeZoneRadius) {
          alerts.push({
            id: `fence-breached-${pet.id}`,
            type: 'overdue',
            severity: 'critical',
            title: `⚠️ GEOFENCE BREACH: ${pet.name} is Loose!`,
            description: `${pet.name} is currently ${Math.round(dist)}m away from home center, exceeding the safe limit of ${pState.safeZoneRadius}m. Immediate recall requested!`,
            badgeText: 'GPS Perimeter Alarm',
            petId: pet.id,
            petName: pet.name,
            petPhoto: pet.photoUrl,
            actionTab: 'tracking',
            actionLabel: 'Pinpoint Collar'
          });
        }
      }
    }

    // 1. Check Vaccinations due date
    const petVaccines = vaccinations.filter(vac => vac.petId === pet.id);
    petVaccines.forEach((vac) => {
      if (vac.dateDue < todayStr) {
        alerts.push({
          id: `vac-overdue-${vac.id}`,
          type: 'overdue',
          severity: 'critical',
          title: `${pet.name}'s ${vac.vaccineName} is Overdue!`,
          description: `This vaccination was due on ${vac.dateDue}. Recommended priority action for active immunity.`,
          badgeText: 'Overdue Vaccine',
          dateStr: vac.dateDue,
          petId: pet.id,
          petName: pet.name,
          petPhoto: pet.photoUrl,
          actionTab: 'health',
          actionLabel: 'Update Vaccine'
        });
      } else {
        const diff = daysBetween(todayStr, vac.dateDue);
        if (diff >= 0 && diff <= 30) {
          alerts.push({
            id: `vac-upcoming-${vac.id}`,
            type: 'upcoming',
            severity: 'warning',
            title: `${pet.name}'s ${vac.vaccineName} Due Soon`,
            description: `Booster injection should be administered on or by ${vac.dateDue} (in ${diff} ${diff === 1 ? 'day' : 'days'}).`,
            badgeText: 'Upcoming Vaccine',
            dateStr: vac.dateDue,
            petId: pet.id,
            petName: pet.name,
            petPhoto: pet.photoUrl,
            actionTab: 'health',
            actionLabel: 'Schedule Vaccine'
          });
        }
      }
    });

    // 2. Overdue scheduled grooming appointments (considered health tasks)
    const petAppts = appointments.filter(appt => appt.petId === pet.id);
    petAppts.forEach((appt) => {
      const apptDateStr = appt.dateTime.slice(0, 10);
      if (apptDateStr < todayStr && appt.status === 'scheduled') {
        alerts.push({
          id: `appt-overdue-${appt.id}`,
          type: 'task_overdue',
          severity: 'critical',
          title: `${pet.name}'s Grooming is Overdue!`,
          description: `Scheduled "${appt.serviceName}" on ${appt.dateTime.replace('T', ' ')} has passed but is still marked as scheduled.`,
          badgeText: 'Overdue Task',
          dateStr: appt.dateTime.slice(0, 10),
          petId: pet.id,
          petName: pet.name,
          petPhoto: pet.photoUrl,
          actionTab: 'grooming',
          actionLabel: 'Manage Appointments'
        });
      }
    });

    // 3. Daily physical health needs: feeding schedules
    const petLogsToday = careLogs.filter(log => log.petId === pet.id && log.date === todayStr);
    const wasFedToday = petLogsToday.some(log => log.type === 'feeding');
    if (!wasFedToday) {
      alerts.push({
        id: `feed-pending-${pet.id}`,
        type: 'task_pending',
        severity: 'info',
        title: `Nutritional Need: Feed ${pet.name}`,
        description: `No food consumption log written for today. Ensure dietary checks are complete.`,
        badgeText: 'Nutrition Due',
        petId: pet.id,
        petName: pet.name,
        petPhoto: pet.photoUrl,
        actionTab: 'dashboard',
        actionLabel: 'Log Food'
      });
    }
  });

  const activeAlerts = alerts.filter(alert => !dismissedAlertIds.includes(alert.id));

  // Metrics calculations
  const totalPets = pets.length;
  
  const upcomingGrooming = appointments.filter(
    app => app.status === 'scheduled' && app.dateTime >= todayStr
  ).length;

  const logsToday = careLogs.filter(log => log.date === todayStr);
  const totalLogsToday = logsToday.length;

  const upcomingVaccines = vaccinations.filter(vac => {
    // Vaccines due in the future from 2026-06-09
    return vac.dateDue >= todayStr;
  }).length;

  // Chart Data preparation
  const filteredWeightEntries = weightEntries
    .filter(w => w.petId === selectedPetId)
    .sort((a, b) => a.date.localeCompare(b.date));

  const chartData = filteredWeightEntries.map(w => ({
    label: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: w.weight
  }));

  const selectedPet = pets.find(p => p.id === selectedPetId);

  // Handle Quick Log submission
  const handleQuickLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPetId || !quickDetails.trim()) return;

    onAddCareLog({
      petId: quickPetId,
      type: quickType,
      date: todayStr,
      time: quickTime,
      details: quickDetails.trim()
    });

    setQuickDetails('');
    setLogSuccess(true);
    setTimeout(() => setLogSuccess(false), 3000);
  };

  return (
    <div id="dashboard-tab" className="space-y-6">
      {/* Welcome Banner */}
      <div id="welcome-banner" className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-3xl p-6 sm:p-8 shadow-sm border border-amber-200/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-3xl mb-2 block">🐾</span>
          <h2 className="text-2xl font-bold font-sans tracking-tight text-amber-900">Welcome to PetCare Central!</h2>
          <p className="text-amber-800 text-sm mt-1 max-w-xl">
            Everything is running smoothly. All of your companions are happy, healthy, and on track today!
          </p>
        </div>
        <button
          id="btn-add-pet-dash"
          onClick={() => onSetActiveTab('profiles')}
          className="bg-amber-800 hover:bg-amber-900 text-white px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-150 inline-flex items-center gap-2 shadow-sm cursor-pointer hover:shadow-md"
        >
          <PlusCircle size={16} />
          <span>Add Companion</span>
        </button>
      </div>

      {/* Reminders & Alerts Center */}
      <div id="alerts-container" className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm space-y-4">
        <div id="alerts-header-row" className="flex items-center justify-between border-b border-stone-100 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Bell className="text-amber-600 active:animate-bounce" size={20} />
              {activeAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-rose-500 text-[9px] font-extrabold text-white rounded-full flex items-center justify-center border border-white">
                  {activeAlerts.length}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">Reminders & Wellness Alerts</h3>
              <p className="text-xs text-stone-400 mt-0.5">Real-time surveillance of upcoming immunizations, scheduled grooming, and daily routines</p>
            </div>
          </div>
          {dismissedAlertIds.length > 0 && (
            <button
              id="btn-restore-alerts"
              onClick={handleResetDismissed}
              className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-amber-50 cursor-pointer"
              title="Restore dismissed alerts"
            >
              <RotateCcw size={13} />
              <span>Restore Dismissed ({dismissedAlertIds.length})</span>
            </button>
          )}
        </div>

        {activeAlerts.length === 0 ? (
          <div id="alerts-empty-state" className="flex flex-col items-center justify-center py-6 text-center text-stone-400">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-xl mb-2">
              <CheckCircle2 size={24} />
            </div>
            <p className="text-sm font-bold text-stone-700">All Companions Up to Date!</p>
            <p className="text-xs mt-0.5">No overdue vaccinology sheets or pending care tasks found. Outstanding job!</p>
          </div>
        ) : (
          <div id="alerts-list-viewport" className="grid grid-cols-1 gap-3.5 max-h-[360px] overflow-y-auto pr-1">
            {activeAlerts.map((alert) => {
              // Styling configurations depending on severity levels
              let cardStyles = '';
              let badgeStyles = '';
              let actionBtnStyles = '';
              let indicatorColor = '';
              let IconComponent = Info;

              if (alert.severity === 'critical') {
                cardStyles = 'bg-rose-50/25 border-rose-100/70 hover:bg-rose-50/60';
                badgeStyles = 'bg-rose-100 text-rose-800 border-rose-200';
                actionBtnStyles = 'bg-rose-700 hover:bg-rose-800 text-white focus:ring-rose-500';
                indicatorColor = 'text-rose-600 bg-rose-50 border border-rose-100';
                IconComponent = AlertCircle;
              } else if (alert.severity === 'warning') {
                cardStyles = 'bg-amber-50/20 border-amber-100/70 hover:bg-amber-50/50';
                badgeStyles = 'bg-amber-100 text-amber-900 border-amber-200';
                actionBtnStyles = 'bg-amber-700 hover:bg-amber-800 text-white focus:ring-amber-500';
                indicatorColor = 'text-amber-600 bg-amber-50 border border-amber-100';
                IconComponent = AlertTriangle;
              } else {
                cardStyles = 'bg-sky-50/20 border-sky-100/70 hover:bg-sky-50/50';
                badgeStyles = 'bg-sky-100 text-sky-900 border-sky-200';
                actionBtnStyles = 'bg-sky-700 hover:bg-sky-800 text-white focus:ring-sky-500';
                indicatorColor = 'text-sky-600 bg-sky-50 border border-sky-100';
                IconComponent = ClipboardList;
              }

              return (
                <div 
                  key={alert.id} 
                  id={`alert-card-${alert.id}`} 
                  className={`border p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-150 relative ${cardStyles}`}
                >
                  <div className="flex gap-3.5 items-start">
                    {/* Pet thumbnail with status indicator */}
                    <div className="relative shrink-0">
                      {alert.petPhoto ? (
                        <img 
                          src={alert.petPhoto} 
                          alt={alert.petName || 'Pet'} 
                          className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-sm shrink-0">
                          🐾
                        </div>
                      )}
                      <span className={`absolute -bottom-1 -right-1 p-0.5 rounded-full text-[10px] ${indicatorColor}`}>
                        <IconComponent size={12} className="stroke-[2.5]" />
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-stone-850 text-sm leading-snug">
                          {alert.title}
                        </span>
                        <span className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeStyles}`}>
                          {alert.badgeText}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-1 font-medium">{alert.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end mt-2 md:mt-0">
                    <button
                      onClick={() => handleAlertAction(alert)}
                      className={`text-xs font-semibold py-2 px-3.5 rounded-xl transition-all duration-150 flex items-center gap-1.5 focus:outline-none focus:ring-1 cursor-pointer w-full md:w-auto justify-center ${actionBtnStyles}`}
                    >
                      <span>{alert.actionLabel}</span>
                      <ExternalLink size={13} />
                    </button>
                    <button
                      onClick={() => handleDismissAlert(alert.id)}
                      className="p-2 border border-stone-100 hover:border-stone-200 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-xl transition-all cursor-pointer"
                      title="Dismiss alert"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div id="metrics-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div
          id="metric-pets"
          onClick={() => onSetActiveTab('profiles')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-100 shadow-xs cursor-pointer hover:shadow-md transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Companions</span>
            <span className="p-2 bg-amber-50 rounded-lg text-amber-600">🐶</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-stone-800 font-sans tracking-tight">{totalPets}</h3>
            <p className="text-[11px] text-stone-400 mt-1">Registered family members</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div
          id="metric-grooming"
          onClick={() => onSetActiveTab('grooming')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-100 shadow-xs cursor-pointer hover:shadow-md transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Groomings</span>
            <span className="p-2 bg-emerald-50 rounded-lg text-emerald-600">✂️</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-stone-800 font-sans tracking-tight">{upcomingGrooming}</h3>
            <p className="text-[11px] text-stone-400 mt-1">Scheduled appointments</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div
          id="metric-vaccines"
          onClick={() => onSetActiveTab('health')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-100 shadow-xs cursor-pointer hover:shadow-md transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Active Vaccines</span>
            <span className="p-2 bg-indigo-50 rounded-lg text-indigo-600">💊</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-stone-800 font-sans tracking-tight">{upcomingVaccines}</h3>
            <p className="text-[11px] text-stone-400 mt-1">Defensive records active</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div
          id="metric-daily"
          onClick={() => onSetActiveTab('logs')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-100 shadow-xs cursor-pointer hover:shadow-md transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Care Logs Today</span>
            <span className="p-2 bg-rose-50 rounded-lg text-rose-600">📝</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-stone-800 font-sans tracking-tight">{totalLogsToday}</h3>
            <p className="text-[11px] text-stone-400 mt-1">Activities logged today</p>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div id="dashboard-layouts-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns - Charts and Summary (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Charts Widget */}
          <div id="chart-widget" className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                  <TrendingUp className="text-amber-500" size={20} />
                  Weight Tracker
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">Visualize companion growth and health patterns</p>
              </div>

              {/* Selector */}
              {pets.length > 0 && (
                <select
                  id="chart-pet-select"
                  value={selectedPetId}
                  onChange={(e) => setSelectedPetId(e.target.value)}
                  className="bg-stone-50 border border-stone-200 text-stone-700 text-xs rounded-xl px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 font-medium"
                >
                  {pets.map(pet => (
                    <option key={pet.id} value={pet.id}>📈 {pet.name} ({pet.species})</option>
                  ))}
                </select>
              )}
            </div>

            {/* Render Custom Chart */}
            <CustomChart
              data={chartData}
              title={selectedPet ? `${selectedPet.name}'s Weight Journey` : 'Weight Trends'}
              unit="kg"
              colorTheme={selectedPet?.species === 'Dog' ? 'amber' : selectedPet?.species === 'Cat' ? 'indigo' : 'emerald'}
            />
          </div>

          {/* Today's Care Summary */}
          <div id="todays-summary-widget" className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                  <ClipboardList className="text-rose-500" size={20} />
                  Today's Care Summary
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">Activities logged for June 9, 2026</p>
              </div>
              <button
                id="btn-goto-logs"
                onClick={() => onSetActiveTab('logs')}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors cursor-pointer"
              >
                Detailed Logs →
              </button>
            </div>

            {logsToday.length === 0 ? (
              <div id="todays-summary-empty" className="h-44 flex flex-col items-center justify-center border border-dashed border-stone-200 rounded-2xl bg-stone-50/30 text-stone-400 text-xs text-center p-6">
                <span className="text-3xl mb-2">🥣</span>
                <p className="font-medium text-stone-600">No logs written for today yet!</p>
                <p className="mt-1">Use the quick logger or head over to the Care Log tab to add food, walks, or pills.</p>
              </div>
            ) : (
              <div id="todays-summary-timeline" className="relative pl-4 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-stone-100">
                {logsToday.map((log) => {
                  const pet = pets.find(p => p.id === log.petId);
                  
                  // Detail icon mapping
                  const iconStyle = {
                    feeding: { emoji: '🥣', bg: 'bg-amber-50 border-amber-100', text: 'text-amber-800' },
                    walking: { emoji: '🦮', bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-800' },
                    medication: { emoji: '💊', bg: 'bg-indigo-50 border-indigo-100', text: 'text-indigo-800' }
                  };
                  const currentStyle = iconStyle[log.type] || iconStyle.feeding;

                  return (
                    <div key={log.id} className="relative flex gap-4 items-start group">
                      {/* Timeline dot */}
                      <span className="absolute -left-[14px] top-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white border-2 border-stone-200 text-[9px] group-hover:border-amber-400 transition-all">
                        •
                      </span>

                      {/* Content Card */}
                      <div className="flex-1 bg-stone-50/50 hover:bg-stone-50 border border-stone-100 p-3.5 rounded-2xl transition-all duration-150 flex items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <span className={`h-10 w-10 shrink-0 text-lg flex items-center justify-center rounded-xl border ${currentStyle.bg}`}>
                            {currentStyle.emoji}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-stone-800 text-sm">
                                {pet ? pet.name : 'Unknown Pet'}
                              </span>
                              <span className="text-xs text-stone-400">({pet?.species})</span>
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${currentStyle.bg} ${currentStyle.text}`}>
                                {log.type}
                              </span>
                            </div>
                            <p className="text-xs text-stone-600 mt-1 font-medium">{log.details}</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono font-medium text-stone-400 bg-white border border-stone-150 px-2 py-0.5 rounded-lg shrink-0">
                          {log.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Quick Logger (1/3 width on desktop) */}
        <div className="space-y-6">
          {/* Quick Care Logger */}
          <div id="quick-care-logger-widget" className="bg-amber-50/40 border border-amber-100 p-6 rounded-3xl shadow-xs">
            <h3 className="text-base font-bold text-amber-900 flex items-center gap-2">
              <Sparkles className="text-amber-600 shrink-0" size={18} />
              Quick Care Logger
            </h3>
            <p className="text-xs text-amber-800 mt-0.5">Quickly register today's actions</p>

            <form id="quick-logger-form" onSubmit={handleQuickLogSubmit} className="mt-4 space-y-3.5">
              {/* Pet Select */}
              <div>
                <label className="block text-xs font-semibold text-amber-800 mb-1">Companion *</label>
                <select
                  id="ql-pet-select"
                  value={quickPetId}
                  onChange={(e) => setQuickPetId(e.target.value)}
                  className="w-full bg-white border border-amber-200/60 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none text-stone-700 font-medium"
                  required
                >
                  <option value="" disabled>Select Companion</option>
                  {pets.map(pet => (
                    <option key={pet.id} value={pet.id}>{pet.name} ({pet.species})</option>
                  ))}
                </select>
              </div>

              {/* Type Grid */}
              <div>
                <label className="block text-xs font-semibold text-amber-800 mb-1">Activity Type *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['feeding', 'walking', 'medication'] as CareLogType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      id={`ql-type-${type}`}
                      onClick={() => setQuickType(type)}
                      className={`py-2 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        quickType === type
                          ? 'bg-amber-800 border-amber-800 text-white shadow-xs'
                          : 'bg-white border-amber-105 text-amber-900 hover:bg-amber-100/40'
                      }`}
                    >
                      <span>{type === 'feeding' ? '🥣' : type === 'walking' ? '🦮' : '💊'}</span>
                      <span className="capitalize text-[10px]">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time select */}
              <div>
                <label className="block text-xs font-semibold text-amber-800 mb-1">Time *</label>
                <input
                  type="time"
                  id="ql-time-input"
                  value={quickTime}
                  onChange={(e) => setQuickTime(e.target.value)}
                  className="w-full bg-white border border-amber-200/60 rounded-xl px-3 py-1.5 text-xs text-stone-700 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              {/* Details Input */}
              <div>
                <label className="block text-xs font-semibold text-amber-800 mb-1">Details & Remarks *</label>
                <input
                  type="text"
                  id="ql-details-input"
                  value={quickDetails}
                  onChange={(e) => setQuickDetails(e.target.value)}
                  placeholder={
                    quickType === 'feeding'
                      ? 'e.g. Wet canned tuna, 1 can'
                      : quickType === 'walking'
                      ? 'e.g. 20 min stroll around block'
                      : 'e.g. Heartworm tablet, 1 dose'
                  }
                  className="w-full bg-white border border-amber-200/60 rounded-xl px-3 py-2 text-xs text-stone-700 placeholder-amber-900/40 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="ql-submit-btn"
                disabled={pets.length === 0}
                className="w-full bg-amber-800 hover:bg-amber-900 disabled:bg-stone-300 disabled:cursor-not-allowed text-stone-50 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                <span>Write log entry 🐾</span>
              </button>

              {logSuccess && (
                <div id="ql-success-msg" className="bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-100 px-3 py-2 rounded-xl text-center animate-fade-in">
                  ✓ Activity logged successfully!
                </div>
              )}
            </form>
          </div>

          {/* Quick Pet List Status Widget */}
          <div id="quick-health-checker-widget" className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
            <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
              <HeartPulse className="text-rose-500 shrink-0" size={18} />
              Condition Snapshot
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">Quick look at registered pets</p>

            <div className="mt-4 space-y-3">
              {pets.map((pet) => (
                <div key={pet.id} className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-stone-50/50 transition-colors border border-stone-50">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={pet.photoUrl}
                      alt={pet.name}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-xl object-cover shrink-0 border border-stone-100"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-stone-800">{pet.name}</h4>
                      <p className="text-[10px] text-stone-400 capitalize">{pet.species} · {pet.breed}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-stone-700 block">{pet.weight} kg</span>
                    <span className="text-[10px] font-mono text-stone-400">Age: {pet.age} {pet.age === 1 ? 'yr' : 'yrs'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

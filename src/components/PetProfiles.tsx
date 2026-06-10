/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Pet } from '../types';
import { Search, UserRoundPlus, Edit2, Trash2, X, ShieldAlert, HeartCrack, Info } from 'lucide-react';

interface PetProfilesProps {
  pets: Pet[];
  onAddPet: (pet: Omit<Pet, 'id'>) => void;
  onEditPet: (id: string, updatedFields: Partial<Pet>) => void;
  onDeletePet: (id: string) => void;
}

export default function PetProfiles({ pets, onAddPet, onEditPet, onDeletePet }: PetProfilesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeciesFilter, setSelectedSpeciesFilter] = useState<string>('All');

  // Form toggles
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPetId, setEditingPetId] = useState<string | null>(null);

  // Form Fields State
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<'Dog' | 'Cat' | 'Rabbit' | 'Bird' | 'Other'>('Dog');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState<number>(1);
  const [weight, setWeight] = useState<number>(3);
  const [photoUrl, setPhotoUrl] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Unknown'>('Male');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [medicalAlerts, setMedicalAlerts] = useState('');

  // Default illustrative pet pictures based on species
  const DEFAULT_PET_PHOTOS = {
    Dog: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400',
    Cat: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=400',
    Rabbit: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=400',
    Bird: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&q=80&w=400',
    Other: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&q=80&w=400'
  };

  // Reset Add Form
  const resetForm = () => {
    setName('');
    setSpecies('Dog');
    setBreed('');
    setAge(1);
    setWeight(3);
    setPhotoUrl('');
    setGender('Male');
    setEmergencyContact('');
    setMedicalAlerts('');
  };

  // Open Edit Form
  const triggerEdit = (pet: Pet) => {
    setEditingPetId(pet.id);
    setName(pet.name);
    setSpecies(pet.species);
    setBreed(pet.breed);
    setAge(pet.age);
    setWeight(pet.weight);
    setPhotoUrl(pet.photoUrl);
    setGender(pet.gender);
    setEmergencyContact(pet.emergencyContact);
    setMedicalAlerts(pet.medicalAlerts);
    setIsAddOpen(true);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Use default illustrative photo if empty
    const finalPhoto = photoUrl.trim() || DEFAULT_PET_PHOTOS[species];

    if (editingPetId) {
      // Edit mode
      onEditPet(editingPetId, {
        name,
        species,
        breed: breed.trim() || 'Mixed',
        age,
        weight,
        photoUrl: finalPhoto,
        gender,
        emergencyContact: emergencyContact.trim() || 'No emergency contact registered',
        medicalAlerts: medicalAlerts.trim() || 'No active medical alerts'
      });
      setEditingPetId(null);
    } else {
      // Add mode
      onAddPet({
        name,
        species,
        breed: breed.trim() || 'Mixed',
        age,
        weight,
        photoUrl: finalPhoto,
        gender,
        emergencyContact: emergencyContact.trim() || 'No emergency contact registered',
        medicalAlerts: medicalAlerts.trim() || 'No active medical alerts'
      });
    }

    setIsAddOpen(false);
    resetForm();
  };

  const handleClose = () => {
    setIsAddOpen(false);
    setEditingPetId(null);
    resetForm();
  };

  // Search and Filter Logic
  const filteredPets = pets.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecies = selectedSpeciesFilter === 'All' || pet.species === selectedSpeciesFilter;
    return matchesSearch && matchesSpecies;
  });

  return (
    <div id="profiles-tab" className="space-y-6">
      
      {/* Search and Action Bar */}
      <div id="search-action-bar" className="bg-white p-4 rounded-2xl border border-stone-150 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
          <input
            type="text"
            id="profiles-search-input"
            placeholder="Search companions by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2 text-xs text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Species Filters */}
        <div id="species-filter-btn-group" className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {['All', 'Dog', 'Cat', 'Rabbit', 'Other'].map(f => (
            <button
              key={f}
              id={`filter-species-${f.toLowerCase()}`}
              onClick={() => setSelectedSpeciesFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedSpeciesFilter === f
                  ? 'bg-amber-800 text-stone-50 shadow-xs'
                  : 'bg-stone-50 text-stone-600 border border-stone-200/60 hover:bg-stone-100'
              }`}
            >
              {f === 'All' ? '🐾 All' : f === 'Dog' ? '🐶 Dogs' : f === 'Cat' ? '🐱 Cats' : f === 'Rabbit' ? '🐰 Rabbits' : '✨ Others'}
            </button>
          ))}
        </div>

        {/* Add Companion Trigger */}
        <button
          id="btn-add-pet-profiles"
          onClick={() => {
            setIsAddOpen(true);
            setEditingPetId(null);
          }}
          className="bg-amber-800 hover:bg-amber-900 text-white rounded-xl py-2 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer shadow-xs"
        >
          <UserRoundPlus size={15} />
          <span>Register Pet</span>
        </button>
      </div>

      {/* Grid of Profiles */}
      {filteredPets.length === 0 ? (
        <div id="pets-grid-empty" className="h-64 bg-white rounded-3xl border border-stone-100 p-8 flex flex-col items-center justify-center text-center">
          <PartyHatEmptyState text="No companion profiles found" />
        </div>
      ) : (
        <div id="pets-cards-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPets.map((pet) => (
            <div
              key={pet.id}
              id={`pet-card-${pet.id}`}
              className="bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between"
            >
              {/* Pet Banner Img */}
              <div className="relative h-44 overflow-hidden bg-stone-100">
                <img
                  src={pet.photoUrl}
                  alt={pet.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
                
                {/* Gender Indicator overlay */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-xl text-[11px] font-bold text-stone-700 flex items-center gap-1 shadow-xs border border-white">
                  <span>{pet.species === 'Dog' ? '🐶' : pet.species === 'Cat' ? '🐱' : pet.species === 'Rabbit' ? '🐰' : '✨'}</span>
                  <span>{pet.gender === 'Male' ? 'Boy' : pet.gender === 'Female' ? 'Girl' : 'Companion'}</span>
                </div>

                {/* Edit & Delete Action overlay buttons */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    id={`btn-edit-pet-${pet.id}`}
                    onClick={() => triggerEdit(pet)}
                    className="p-2 bg-white/95 backdrop-blur-xs rounded-xl text-stone-600 hover:text-amber-800 border border-white hover:bg-stone-50 transition-colors shadow-xs cursor-pointer"
                    title="Edit Companion details"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    id={`btn-delete-pet-${pet.id}`}
                    onClick={() => {
                      if (confirm(`Are you sure you want to remove ${pet.name} from the system?`)) {
                        onDeletePet(pet.id);
                      }
                    }}
                    className="p-2 bg-white/95 backdrop-blur-xs rounded-xl text-stone-500 hover:text-rose-600 border border-white hover:bg-stone-50 transition-colors shadow-xs cursor-pointer"
                    title="Remove Companion profile"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Pet Description Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline justify-between mb-2">
                    <h3 className="text-lg font-extrabold text-stone-800">{pet.name}</h3>
                    <span className="text-xs bg-stone-100 text-stone-500 font-semibold px-2 py-0.5 rounded-full font-mono">
                      {pet.breed}
                    </span>
                  </div>

                  {/* Facts list */}
                  <div className="grid grid-cols-2 gap-3 mb-4 mt-2">
                    <div className="bg-amber-50/20 border border-amber-100/30 p-2.5 rounded-2xl">
                      <p className="text-[10px] text-stone-400 font-semibold uppercase font-sans">Age</p>
                      <p className="text-sm font-bold text-stone-700 mt-0.5">{pet.age} {pet.age === 1 ? 'Year' : 'Years'}</p>
                    </div>
                    <div className="bg-amber-50/20 border border-amber-100/30 p-2.5 rounded-2xl">
                      <p className="text-[10px] text-stone-400 font-semibold uppercase font-sans">Weight</p>
                      <p className="text-sm font-bold text-stone-700 mt-0.5">{pet.weight} kg</p>
                    </div>
                  </div>

                  {/* Medical Warning and Alerts */}
                  {pet.medicalAlerts && pet.medicalAlerts !== 'No active medical alerts' && (
                    <div className="mt-3 bg-rose-50/40 border border-rose-100 p-3 rounded-2xl flex gap-2 items-start">
                      <ShieldAlert className="text-rose-500 shrink-0 mt-0.5" size={15} />
                      <div>
                        <p className="text-[10px] font-bold text-rose-800 uppercase tracking-wider font-sans">Health Advisory</p>
                        <p className="text-xs text-rose-700 mt-0.5 leading-relaxed font-semibold">{pet.medicalAlerts}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer details (emergency contact) */}
                <div className="border-t border-stone-100 pt-3 mt-4 flex items-center justify-between text-xs text-stone-400">
                  <span className="flex items-center gap-1 text-[11px] font-sans">
                    <Info size={12} className="text-amber-500 shrink-0" />
                    Emergency Contact:
                  </span>
                  <span className="font-mono text-[10px] text-stone-500 font-semibold truncate max-w-xs">{pet.emergencyContact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Popup Dialog Form (Add / Edit Companion) */}
      {isAddOpen && (
        <div id="pet-form-overlay" className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div
            id="pet-form-container"
            className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-stone-100 relative mt-4 mb-4"
          >
            {/* Header */}
            <div className="bg-amber-50 px-6 py-4 flex items-center justify-between border-b border-amber-100">
              <h3 className="font-bold text-amber-900 flex items-center gap-2 text-base">
                🐶 {editingPetId ? 'Update Pet Profile' : 'Register New Companion'}
              </h3>
              <button
                id="btn-close-pet-form"
                onClick={handleClose}
                className="p-1.5 hover:bg-amber-100 rounded-full text-amber-900 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form body */}
            <form id="pet-profile-modal-form" onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Field Grid 1 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Companion Name *</label>
                  <input
                    type="text"
                    id="form-pet-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Daisy"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:outline-none focus:ring-amber-500 text-stone-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Gender *</label>
                  <select
                    id="form-pet-gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-700"
                  >
                    <option value="Male">Boy (Male)</option>
                    <option value="Female">Girl (Female)</option>
                    <option value="Unknown">Companion (Unknown)</option>
                  </select>
                </div>
              </div>

              {/* Field Grid 2 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Species *</label>
                  <select
                    id="form-pet-species"
                    value={species}
                    onChange={(e) => setSpecies(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-700"
                  >
                    <option value="Dog">Dog 🐶</option>
                    <option value="Cat">Cat 🐱</option>
                    <option value="Rabbit">Rabbit 🐰</option>
                    <option value="Bird">Bird 🦜</option>
                    <option value="Other">Other Species 🐾</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Breed / Hybrid *</label>
                  <input
                    type="text"
                    id="form-pet-breed"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    placeholder="e.g. Ragdoll, Beagle"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:outline-none focus:ring-amber-500 text-stone-700"
                    required
                  />
                </div>
              </div>

              {/* Field Grid 3 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Age (Years) *</label>
                  <input
                    type="number"
                    id="form-pet-age"
                    min="0"
                    max="35"
                    step="0.1"
                    required
                    value={age}
                    onChange={(e) => setAge(parseFloat(e.target.value) || 0)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:outline-none focus:ring-amber-500 text-stone-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Weight (kg) *</label>
                  <input
                    type="number"
                    id="form-pet-weight"
                    min="0.1"
                    max="150"
                    step="0.05"
                    required
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:outline-none focus:ring-amber-500 text-stone-700"
                  />
                </div>
              </div>

              {/* Photo URL */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Photo URL (Optional)</label>
                <input
                  type="url"
                  id="form-pet-photo"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or leave blank for dynamic illustration"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:outline-none focus:ring-amber-500 text-stone-700"
                />
              </div>

              {/* Emergency Contact */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1 font-sans">Emergency Contact *</label>
                <input
                  type="text"
                  id="form-pet-emergency"
                  required
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="Contact Name & Phone, e.g. Dr.Woods (555-0100)"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:outline-none focus:ring-amber-500 text-stone-700"
                />
              </div>

              {/* Medical Alerts */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Dietary, Allergies or Medical Alerts</label>
                <textarea
                  id="form-pet-alerts"
                  value={medicalAlerts}
                  onChange={(e) => setMedicalAlerts(e.target.value)}
                  placeholder="e.g. Allergic to wheat. Scheduled medication in morning."
                  rows={2}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:outline-none focus:ring-amber-500 text-stone-700 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  id="btn-cancel-pet-form"
                  onClick={handleClose}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl py-2 px-4 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-submit-pet-form"
                  className="bg-amber-800 hover:bg-amber-900 text-stone-50 rounded-xl py-2 px-5 text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  {editingPetId ? 'Confirm Profile Changes' : 'Register Companion 🐾'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Subcomponent for simple empty layouts
function PartyHatEmptyState({ text }: { text: string }) {
  return (
    <div id="profiles-empty-state" className="flex flex-col items-center justify-center p-6 text-stone-400">
      <div className="text-3xl mb-3">🏡</div>
      <p className="font-bold text-stone-600 text-sm mb-1">{text}</p>
      <p className="text-xs max-w-sm mt-0.5 leading-relaxed">
        Let's click "Register Pet" or relax the filters to see registered family members.
      </p>
    </div>
  );
}

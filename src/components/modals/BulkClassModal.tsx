import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FRANCOPHONE_LEVELS, ANGLOPHONE_LEVELS, getAvailableSpecialties } from '@/constants/cameroonEducation';

export interface BulkClassItem {
  name?: string;
  level: string;
  section: string;
  specialty?: string;
  educationSystem: 'francophone' | 'anglophone';
  capacity: number;
  teacher: string;
  room: string;
  description?: string;
}

interface BulkClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (items: BulkClassItem[]) => void;
}

const BulkClassModal: React.FC<BulkClassModalProps> = ({ isOpen, onClose, onSave }) => {
  const [educationSystem, setEducationSystem] = useState<'francophone' | 'anglophone'>('francophone');
  const [level, setLevel] = useState<string>('');
  const [specialty, setSpecialty] = useState<string>('');
  const [sectionsSelected, setSectionsSelected] = useState<string[]>([]);
  const [defaultTeacher, setDefaultTeacher] = useState<string>('');
  const [defaultRoom, setDefaultRoom] = useState<string>('');
  const [defaultCapacity, setDefaultCapacity] = useState<number>(30);
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Overrides par section
  const [overrides, setOverrides] = useState<Record<string, { teacher?: string; room?: string; capacity?: number }>>({});

  useEffect(() => {
    if (!isOpen) return;
    // Reset minimal à l'ouverture
    setSectionsSelected([]);
    setOverrides({});
  }, [isOpen]);

  const levels = educationSystem === 'francophone' ? FRANCOPHONE_LEVELS : ANGLOPHONE_LEVELS;
  const specialties = getAvailableSpecialties(educationSystem, level);
  const availableSections = educationSystem === 'francophone' ? ['A','B','C','D','E','F','G'] : ['A','B','C','D'];

  const toggleSection = (s: string) => {
    setSectionsSelected((prev) => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const setOverride = (s: string, field: 'teacher' | 'room' | 'capacity', value: string | number) => {
    setOverrides((prev) => ({
      ...prev,
      [s]: { ...prev[s], [field]: value as any }
    }));
  };

  const canSubmit = level && sectionsSelected.length > 0 && (defaultTeacher || sectionsSelected.every(s => overrides[s]?.teacher)) && (defaultRoom || sectionsSelected.every(s => overrides[s]?.room));

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      setIsSubmitting(true);
      const items: BulkClassItem[] = sectionsSelected.map((section) => ({
        educationSystem,
        level,
        specialty: specialties.length > 0 ? (specialty || '') : '',
        section,
        teacher: (overrides[section]?.teacher || defaultTeacher)!,
        room: (overrides[section]?.room || defaultRoom)!,
        capacity: (overrides[section]?.capacity ?? defaultCapacity)!,
        description,
        name: `${level} ${section}${(specialties.length > 0 && (specialty || '')) ? ` (${specialty})` : ''}`.trim(),
      }));
      onSave(items);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Création en masse (niveau + sections)</DialogTitle>
          <DialogDescription>
            Sélectionnez un niveau et plusieurs sections (A, B, C...). Définissez des valeurs par défaut et surchargez-les par section si besoin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ligne 1: Système & Niveau */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Système éducatif *</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="edu"
                    value="francophone"
                    checked={educationSystem === 'francophone'}
                    onChange={(e) => { setEducationSystem(e.target.value as any); setLevel(''); setSpecialty(''); }}
                    className="rounded border-input"
                  />
                  <span>Francophone</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="edu"
                    value="anglophone"
                    checked={educationSystem === 'anglophone'}
                    onChange={(e) => { setEducationSystem(e.target.value as any); setLevel(''); setSpecialty(''); }}
                    className="rounded border-input"
                  />
                  <span>Anglophone</span>
                </label>
              </div>
            </div>

            <div>
              <Label>Niveau *</Label>
              <select
                value={level}
                onChange={(e) => { setLevel(e.target.value); setSpecialty(''); }}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring mt-2"
                required
              >
                <option value="">Sélectionner un niveau</option>
                {levels.map((l) => (
                  <option key={l.id} value={l.id}>{l.name} ({l.cycle})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Spécialité si applicable */}
          {specialties.length > 0 && (
            <div>
              <Label>Spécialité *</Label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring mt-2"
                required
              >
                <option value="">Sélectionner une spécialité</option>
                {specialties.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Sections multi-sélection */}
          <div>
            <Label>Sections à créer *</Label>
            <div className="flex flex-wrap gap-3 mt-2">
              {availableSections.map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer border rounded-md px-3 py-1">
                  <input type="checkbox" checked={sectionsSelected.includes(s)} onChange={() => toggleSection(s)} />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Valeurs par défaut */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Professeur (défaut)</Label>
              <Input value={defaultTeacher} onChange={(e) => setDefaultTeacher(e.target.value)} placeholder="Nom du professeur" />
            </div>
            <div>
              <Label>Salle (défaut)</Label>
              <Input value={defaultRoom} onChange={(e) => setDefaultRoom(e.target.value)} placeholder="Numéro de salle" />
            </div>
            <div>
              <Label>Capacité (défaut)</Label>
              <Input type="number" min={1} max={50} value={defaultCapacity} onChange={(e) => setDefaultCapacity(parseInt(e.target.value) || 0)} />
            </div>
          </div>

          <div>
            <Label>Description (optionnel)</Label>
            <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description pour toutes les classes" />
          </div>

          {/* Overrides par section sélectionnée */}
          {sectionsSelected.length > 0 && (
            <div className="space-y-3">
              <Label>Overrides par section (optionnels)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sectionsSelected.map((s) => (
                  <div key={s} className="border border-border rounded-lg p-3 space-y-3">
                    <h5 className="font-semibold">Section {s}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input placeholder={`Prof (défaut: ${defaultTeacher || '—'})`} value={overrides[s]?.teacher || ''} onChange={(e) => setOverride(s, 'teacher', e.target.value)} />
                      <Input placeholder={`Salle (défaut: ${defaultRoom || '—'})`} value={overrides[s]?.room || ''} onChange={(e) => setOverride(s, 'room', e.target.value)} />
                      <Input type="number" placeholder={`Capacité (défaut: ${defaultCapacity})`} value={overrides[s]?.capacity?.toString() || ''} onChange={(e) => setOverride(s, 'capacity', parseInt(e.target.value) || 0)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="button" disabled={!canSubmit || isSubmitting} onClick={handleSubmit}>
            Créer {sectionsSelected.length} classe(s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkClassModal;

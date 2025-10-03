import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Trash2, ChevronDown, ChevronRight, BookOpen, Layers } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  AcademicYear, 
  Term, 
  Sequence, 
  AcademicYearProgress,
  CreateAcademicYearData,
  CreateTermData,
  CreateSequenceData 
} from '@/types/settings';
import { settingsService } from '@/services/settingsService';

const AcademicSettingsTab: React.FC = () => {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [currentAcademicYear, setCurrentAcademicYear] = useState<AcademicYear | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [progressData, setProgressData] = useState<Record<string, AcademicYearProgress>>({});

  // Form states
  const [showAcademicYearForm, setShowAcademicYearForm] = useState(false);
  const [showTermForm, setShowTermForm] = useState<string | null>(null);
  const [showSequenceForm, setShowSequenceForm] = useState<string | null>(null);

  // Form data
  const [academicYearForm, setAcademicYearForm] = useState<CreateAcademicYearData>({
    name: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: ''
  });

  const [termForm, setTermForm] = useState<CreateTermData>({
    name: '',
    code: '',
    order: 1,
    academicYear: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: ''
  });

  const [sequenceForm, setSequenceForm] = useState<CreateSequenceData>({
    name: '',
    code: '',
    order: 1,
    term: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: ''
  });

  // Generate year options (5 years before and after current year)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      const yearString = `${i}-${i + 1}`;
      years.push(yearString);
    }
    
    return years;
  };

  // Term name options
  const termOptions = [
    'Trimestre 1', 'Trimestre 2', 'Trimestre 3',
    'Semestre 1', 'Semestre 2',
    'Période 1', 'Période 2', 'Période 3', 'Période 4',
    'Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4'
  ];

  // Sequence name options
  const sequenceOptions = [
    'Séquence 1', 'Séquence 2', 'Séquence 3', 'Séquence 4', 'Séquence 5',
    'Séquence 6', 'Séquence 7', 'Séquence 8', 'Séquence 9', 'Séquence 10',
    'Module 1', 'Module 2', 'Module 3', 'Module 4', 'Module 5',
    'Unité 1', 'Unité 2', 'Unité 3', 'Unité 4', 'Unité 5'
  ];

  // Term code options based on name
  const getTermCodeOptions = (termName: string) => {
    const codeMap: Record<string, string[]> = {
      'Trimestre 1': ['T1', 'TRIM1'],
      'Trimestre 2': ['T2', 'TRIM2'],
      'Trimestre 3': ['T3', 'TRIM3'],
      'Semestre 1': ['S1', 'SEM1'],
      'Semestre 2': ['S2', 'SEM2'],
      'Période 1': ['P1', 'PER1'],
      'Période 2': ['P2', 'PER2'],
      'Période 3': ['P3', 'PER3'],
      'Période 4': ['P4', 'PER4'],
      'Quarter 1': ['Q1', 'QUAR1'],
      'Quarter 2': ['Q2', 'QUAR2'],
      'Quarter 3': ['Q3', 'QUAR3'],
      'Quarter 4': ['Q4', 'QUAR4']
    };
    
    return codeMap[termName] || ['T1'];
  };

  // Sequence code options based on name
  const getSequenceCodeOptions = (sequenceName: string) => {
    const codeMap: Record<string, string[]> = {
      'Séquence 1': ['SEQ1', 'S1'],
      'Séquence 2': ['SEQ2', 'S2'],
      'Séquence 3': ['SEQ3', 'S3'],
      'Séquence 4': ['SEQ4', 'S4'],
      'Séquence 5': ['SEQ5', 'S5'],
      'Séquence 6': ['SEQ6', 'S6'],
      'Séquence 7': ['SEQ7', 'S7'],
      'Séquence 8': ['SEQ8', 'S8'],
      'Séquence 9': ['SEQ9', 'S9'],
      'Séquence 10': ['SEQ10', 'S10'],
      'Module 1': ['MOD1', 'M1'],
      'Module 2': ['MOD2', 'M2'],
      'Module 3': ['MOD3', 'M3'],
      'Module 4': ['MOD4', 'M4'],
      'Module 5': ['MOD5', 'M5'],
      'Unité 1': ['UNIT1', 'U1'],
      'Unité 2': ['UNIT2', 'U2'],
      'Unité 3': ['UNIT3', 'U3'],
      'Unité 4': ['UNIT4', 'U4'],
      'Unité 5': ['UNIT5', 'U5']
    };
    
    return codeMap[sequenceName] || ['SEQ1'];
  };

  useEffect(() => {
    loadAcademicData();
  }, []);

  const loadAcademicData = async () => {
    try {
      setLoading(true);
      const [years, currentYear] = await Promise.all([
        settingsService.getAcademicYears(),
        settingsService.getCurrentAcademicYear().catch(() => null)
      ]);
      console.log("years",years)
      console.log("currentYear",currentYear)
      setAcademicYears(years);
      setCurrentAcademicYear(currentYear);

      // Load progress data for each academic year
      const progressPromises = years.map(year => 
        settingsService.getAcademicYearProgress(year.id).catch(() => null)
      );
      const progressResults = await Promise.all(progressPromises);
      
      const progressMap: Record<string, AcademicYearProgress> = {};
      years.forEach((year, index) => {
        if (progressResults[index]) {
          progressMap[year.id] = progressResults[index]!;
        }
      });
      setProgressData(progressMap);
    } catch (error) {
      console.error('Error loading academic data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleCreateAcademicYear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await settingsService.createAcademicYear(academicYearForm);
      setShowAcademicYearForm(false);
      setAcademicYearForm({
        name: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: ''
      });
      await loadAcademicData();
    } catch (error) {
      console.error('Error creating academic year:', error);
    }
  };

  const handleCreateTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await settingsService.createTerm(termForm);
      setShowTermForm(null);
      setTermForm({
        name: '',
        code: '',
        order: 1,
        academicYear: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: ''
      });
      await loadAcademicData();
    } catch (error) {
      console.error('Error creating term:', error);
    }
  };

  const handleCreateSequence = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await settingsService.createSequence(sequenceForm);
      setShowSequenceForm(null);
      setSequenceForm({
        name: '',
        code: '',
        order: 1,
        term: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: ''
      });
      await loadAcademicData();
    } catch (error) {
      console.error('Error creating sequence:', error);
    }
  };

  const handleSetCurrent = async (type: 'academicYear' | 'term' | 'sequence', id: string) => {
    try {
      switch (type) {
        case 'academicYear':
          await settingsService.updateAcademicYear(id, { isCurrent: true });
          break;
        case 'term':
          await settingsService.updateTerm(id, { isCurrent: true });
          break;
        case 'sequence':
          await settingsService.updateSequence(id, { isCurrent: true });
          break;
      }
      await loadAcademicData();
    } catch (error) {
      console.error('Error setting current:', error);
    }
  };

  const handleDelete = async (type: 'academicYear' | 'term' | 'sequence', id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      switch (type) {
        case 'academicYear':
          await settingsService.deleteAcademicYear(id);
          break;
        case 'term':
          await settingsService.deleteTerm(id);
          break;
        case 'sequence':
          await settingsService.deleteSequence(id);
          break;
      }
      await loadAcademicData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      upcoming: { variant: 'secondary' as const, label: 'À venir' },
      active: { variant: 'default' as const, label: 'Actif' },
      completed: { variant: 'outline' as const, label: 'Terminé' },
      cancelled: { variant: 'destructive' as const, label: 'Annulé' },
      scheduled: { variant: 'secondary' as const, label: 'Planifié' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.upcoming;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Handle term name change and auto-set code
  const handleTermNameChange = (termName: string) => {
    const codes = getTermCodeOptions(termName);
    setTermForm(prev => ({
      ...prev,
      name: termName,
      code: codes[0] // Auto-select first code option
    }));
  };

  // Handle sequence name change and auto-set code
  const handleSequenceNameChange = (sequenceName: string) => {
    const codes = getSequenceCodeOptions(sequenceName);
    setSequenceForm(prev => ({
      ...prev,
      name: sequenceName,
      code: codes[0] // Auto-select first code option
    }));
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6 overflow-auto">
      {/* Current Academic Year Overview */}
      {currentAcademicYear && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Année académique actuelle</span>
            </CardTitle>
            <CardDescription>
              {currentAcademicYear.name} • {new Date(currentAcademicYear.startDate).toLocaleDateString()} - {new Date(currentAcademicYear.endDate).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{currentAcademicYear.terms?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Périodes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {currentAcademicYear.terms?.reduce((acc, term) => acc + (term.sequences?.length || 0), 0) || 0}
                </div>
                <div className="text-sm text-muted-foreground">Séquences</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {progressData[currentAcademicYear.id]?.overallProgress || 0}%
                </div>
                <div className="text-sm text-muted-foreground">Progression</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Academic Years Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gestion académique</CardTitle>
            <CardDescription>
              Configurez les années académiques, périodes et séquences
            </CardDescription>
          </div>
          <Button onClick={() => setShowAcademicYearForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle année
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Academic Year Form */}
          {showAcademicYearForm && (
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleCreateAcademicYear} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nom de l'année</Label>
                      <select
                        value={academicYearForm.name}
                        onChange={(e) => setAcademicYearForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        required
                      >
                        <option value="">Sélectionnez une année</option>
                        {generateYearOptions().map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={academicYearForm.isCurrent}
                        onCheckedChange={(checked) => setAcademicYearForm(prev => ({ ...prev, isCurrent: checked }))}
                      />
                      <Label>Définir comme année actuelle</Label>
                    </div>
                    <div>
                      <Label>Date de début</Label>
                      <Input
                        type="date"
                        value={academicYearForm.startDate}
                        onChange={(e) => setAcademicYearForm(prev => ({ ...prev, startDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label>Date de fin</Label>
                      <Input
                        type="date"
                        value={academicYearForm.endDate}
                        onChange={(e) => setAcademicYearForm(prev => ({ ...prev, endDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Description</Label>
                      <Input
                        value={academicYearForm.description}
                        onChange={(e) => setAcademicYearForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description optionnelle"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit">Créer</Button>
                    <Button variant="outline" onClick={() => setShowAcademicYearForm(false)}>
                      Annuler
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Academic Years List */}
          {academicYears.map((year) => (
            <Card key={year.id} className={year.isCurrent ? 'border-primary' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(year.id)}
                    >
                      {expandedItems.has(year.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{year.name}</h3>
                        {getStatusBadge(year.status)}
                        {year.isCurrent && <Badge variant="default">Actuelle</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(year.startDate).toLocaleDateString()} - {new Date(year.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!year.isCurrent && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetCurrent('academicYear', year.id)}
                      >
                        Définir comme actuelle
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTermForm(year.id)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Période
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete('academicYear', year.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Term Form */}
                {showTermForm === year.id && (
                  <div className="mt-4 ml-8 p-4 border rounded-lg">
                    <form onSubmit={handleCreateTerm} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Nom de la période</Label>
                          <select
                            value={termForm.name}
                            onChange={(e) => handleTermNameChange(e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            required
                          >
                            <option value="">Sélectionnez une période</option>
                            {termOptions.map((term) => (
                              <option key={term} value={term}>
                                {term}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Code</Label>
                          <select
                            value={termForm.code}
                            onChange={(e) => setTermForm(prev => ({ ...prev, code: e.target.value }))}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            required
                          >
                            <option value="">Sélectionnez un code</option>
                            {termForm.name && getTermCodeOptions(termForm.name).map((code) => (
                              <option key={code} value={code}>
                                {code}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Ordre</Label>
                          <select
                            value={termForm.order}
                            onChange={(e) => setTermForm(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            required
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <option key={num} value={num}>
                                {num}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={termForm.isCurrent}
                            onCheckedChange={(checked) => setTermForm(prev => ({ ...prev, isCurrent: checked }))}
                          />
                          <Label>Période actuelle</Label>
                        </div>
                        <div>
                          <Label>Date de début</Label>
                          <Input
                            type="date"
                            value={termForm.startDate}
                            onChange={(e) => setTermForm(prev => ({ ...prev, startDate: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label>Date de fin</Label>
                          <Input
                            type="date"
                            value={termForm.endDate}
                            onChange={(e) => setTermForm(prev => ({ ...prev, endDate: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          type="submit"
                          onClick={() => setTermForm(prev => ({ ...prev, academicYear: year.id }))}
                        >
                          Créer
                        </Button>
                        <Button variant="outline" onClick={() => setShowTermForm(null)}>
                          Annuler
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Expanded Terms List */}
                {expandedItems.has(year.id) && (
                  <div className="mt-4 ml-8 space-y-3">
                    {year.terms?.map((term) => (
                      <Card key={term.id} className={term.isCurrent ? 'border-primary/50' : ''}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpand(term.id)}
                              >
                                {expandedItems.has(term.id) ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </Button>
                              <BookOpen className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium">{term.name} ({term.code})</h4>
                                  {getStatusBadge(term.status)}
                                  {term.isCurrent && <Badge variant="default">Actuelle</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(term.startDate).toLocaleDateString()} - {new Date(term.endDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {!term.isCurrent && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSetCurrent('term', term.id)}
                                >
                                  Définir comme actuelle
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowSequenceForm(term.id)}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Séquence
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete('term', term.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Sequence Form */}
                          {showSequenceForm === term.id && (
                            <div className="mt-4 ml-8 p-4 border rounded-lg">
                              <form onSubmit={handleCreateSequence} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label>Nom de la séquence</Label>
                                    <select
                                      value={sequenceForm.name}
                                      onChange={(e) => handleSequenceNameChange(e.target.value)}
                                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                      required
                                    >
                                      <option value="">Sélectionnez une séquence</option>
                                      {sequenceOptions.map((sequence) => (
                                        <option key={sequence} value={sequence}>
                                          {sequence}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <Label>Code</Label>
                                    <select
                                      value={sequenceForm.code}
                                      onChange={(e) => setSequenceForm(prev => ({ ...prev, code: e.target.value }))}
                                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                      required
                                    >
                                      <option value="">Sélectionnez un code</option>
                                      {sequenceForm.name && getSequenceCodeOptions(sequenceForm.name).map((code) => (
                                        <option key={code} value={code}>
                                          {code}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <Label>Ordre</Label>
                                    <select
                                      value={sequenceForm.order}
                                      onChange={(e) => setSequenceForm(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                      required
                                    >
                                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                        <option key={num} value={num}>
                                          {num}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      checked={sequenceForm.isCurrent}
                                      onCheckedChange={(checked) => setSequenceForm(prev => ({ ...prev, isCurrent: checked }))}
                                    />
                                    <Label>Séquence actuelle</Label>
                                  </div>
                                  <div>
                                    <Label>Date de début</Label>
                                    <Input
                                      type="date"
                                      value={sequenceForm.startDate}
                                      onChange={(e) => setSequenceForm(prev => ({ ...prev, startDate: e.target.value }))}
                                      required
                                    />
                                  </div>
                                  <div>
                                    <Label>Date de fin</Label>
                                    <Input
                                      type="date"
                                      value={sequenceForm.endDate}
                                      onChange={(e) => setSequenceForm(prev => ({ ...prev, endDate: e.target.value }))}
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button 
                                    type="submit"
                                    onClick={() => setSequenceForm(prev => ({ ...prev, term: term.id }))}
                                  >
                                    Créer
                                  </Button>
                                  <Button variant="outline" onClick={() => setShowSequenceForm(null)}>
                                    Annuler
                                  </Button>
                                </div>
                              </form>
                            </div>
                          )}

                          {/* Expanded Sequences List */}
                          {expandedItems.has(term.id) && (
                            <div className="mt-4 ml-8 space-y-2">
                              {term.sequences?.map((sequence) => (
                                <Card key={sequence.id} className={sequence.isCurrent ? 'border-primary/30' : ''}>
                                  <CardContent className="p-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        <Layers className="w-4 h-4 text-muted-foreground" />
                                        <div>
                                          <div className="flex items-center space-x-2">
                                            <h5 className="font-medium">{sequence.name} ({sequence.code})</h5>
                                            {getStatusBadge(sequence.status)}
                                            {sequence.isCurrent && <Badge variant="default">Actuelle</Badge>}
                                          </div>
                                          <p className="text-sm text-muted-foreground">
                                            {new Date(sequence.startDate).toLocaleDateString()} - {new Date(sequence.endDate).toLocaleDateString()}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        {!sequence.isCurrent && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleSetCurrent('sequence', sequence.id)}
                                          >
                                            Définir comme actuelle
                                          </Button>
                                        )}
                                        <Button variant="outline" size="sm">
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleDelete('sequence', sequence.id)}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                              {(!term.sequences || term.sequences.length === 0) && (
                                <div className="text-center py-4 text-muted-foreground">
                                  Aucune séquence créée
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    {(!year.terms || year.terms.length === 0) && (
                      <div className="text-center py-4 text-muted-foreground">
                        Aucune période créée
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {academicYears.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucune année académique créée
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AcademicSettingsTab;
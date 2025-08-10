import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { BookOpen, Download, Loader2, CheckCircle } from 'lucide-react';
import { 
  getAllCameroonSubjects, 
  getSubjectsByLevel, 
  getAllLevels,
  getLevelsByCycle,
  SubjectData 
} from '@/data/cameroonSubjects';
import { subjectService } from '@/lib/services/subjectService';

interface CameroonSubjectsImporterProps {
  onImportComplete?: () => void;
}

const CameroonSubjectsImporter: React.FC<CameroonSubjectsImporterProps> = ({ 
  onImportComplete 
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<'francophone' | 'anglophone' | ''>('');
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importMode, setImportMode] = useState<'all' | 'by-level' | 'custom'>('all');

  const allSubjects = getAllCameroonSubjects();
  const allLevels = getAllLevels();
  const levelsByCycle = getLevelsByCycle();

  const handleSystemChange = (system: 'francophone' | 'anglophone') => {
    setSelectedSystem(system);
    setSelectedLevels([]);
    setSelectedSubjects([]);
  };

  const handleLevelToggle = (level: string) => {
    setSelectedLevels(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const handleSubjectToggle = (subjectCode: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectCode) 
        ? prev.filter(s => s !== subjectCode)
        : [...prev, subjectCode]
    );
  };

  const getSubjectsToImport = (): SubjectData[] => {
    if (!selectedSystem) return [];

    const systemSubjects = selectedSystem === 'francophone' 
      ? allSubjects.francophone 
      : allSubjects.anglophone;

    switch (importMode) {
      case 'all':
        return systemSubjects;
      
      case 'by-level':
        if (selectedLevels.length === 0) return [];
        return systemSubjects.filter(subject => 
          subject.levels.some(level => selectedLevels.includes(level))
        );
      
      case 'custom':
        return systemSubjects.filter(subject => 
          selectedSubjects.includes(subject.subjectCode)
        );
      
      default:
        return [];
    }
  };

  const handleImport = async () => {
    const subjectsToImport = getSubjectsToImport();
    
    if (subjectsToImport.length === 0) {
      toast({
        title: "Aucune matière sélectionnée",
        description: "Veuillez sélectionner au moins une matière à importer.",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    
    try {
      // Préparer les données pour l'API
      const subjectsData = subjectsToImport.map(subject => ({
        subjectCode: subject.subjectCode,
        subjectName: subject.subjectName,
        description: subject.description,
        isActive: true
      }));

      // Importer via l'API
      await subjectService.bulkImport(subjectsData);
      
      toast({
        title: "Import réussi",
        description: `${subjectsToImport.length} matière(s) ont été ajoutées avec succès.`,
      });
      
      setIsOpen(false);
      onImportComplete?.();
      
      // Reset form
      setSelectedSystem('');
      setSelectedLevels([]);
      setSelectedSubjects([]);
      setImportMode('all');
      
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Erreur d'import",
        description: error.response?.data?.message || "Une erreur est survenue lors de l'import.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const subjectsToImport = getSubjectsToImport();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Importer Matières Camerounaises
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Importer les Matières du Système Scolaire Camerounais
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Sélection du système */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Système Scolaire</label>
            <Select value={selectedSystem} onValueChange={handleSystemChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir le système scolaire" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="francophone">🇫🇷 Système Francophone</SelectItem>
                <SelectItem value="anglophone">🇬🇧 Système Anglophone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedSystem && (
            <>
              {/* Mode d'import */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Mode d'Import</label>
                <div className="flex gap-2">
                  <Button 
                    variant={importMode === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setImportMode('all')}
                  >
                    Toutes les matières
                  </Button>
                  <Button 
                    variant={importMode === 'by-level' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setImportMode('by-level')}
                  >
                    Par niveau
                  </Button>
                  <Button 
                    variant={importMode === 'custom' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setImportMode('custom')}
                  >
                    Sélection personnalisée
                  </Button>
                </div>
              </div>

              {/* Sélection par niveau */}
              {importMode === 'by-level' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Niveaux</label>
                  <div className="grid grid-cols-3 gap-2">
                    {allLevels[selectedSystem].map(level => (
                      <div key={level} className="flex items-center space-x-2">
                        <Checkbox 
                          id={level}
                          checked={selectedLevels.includes(level)}
                          onCheckedChange={() => handleLevelToggle(level)}
                        />
                        <label htmlFor={level} className="text-sm">{level}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sélection personnalisée */}
              {importMode === 'custom' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Matières</label>
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {(selectedSystem === 'francophone' ? allSubjects.francophone : allSubjects.anglophone).map(subject => (
                      <div key={subject.subjectCode} className="flex items-center space-x-2">
                        <Checkbox 
                          id={subject.subjectCode}
                          checked={selectedSubjects.includes(subject.subjectCode)}
                          onCheckedChange={() => handleSubjectToggle(subject.subjectCode)}
                        />
                        <label htmlFor={subject.subjectCode} className="text-sm">
                          {subject.subjectName}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Aperçu des matières à importer */}
              {subjectsToImport.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Aperçu de l'Import ({subjectsToImport.length} matières)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {subjectsToImport.map(subject => (
                        <div key={subject.subjectCode} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <span className="font-medium">{subject.subjectName}</span>
                            <span className="text-xs text-muted-foreground ml-2">({subject.subjectCode})</span>
                          </div>
                          <Badge variant="secondary">
                            Coef. {subject.coefficient || 'N/A'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Boutons d'action */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={handleImport} 
                  disabled={isImporting || subjectsToImport.length === 0}
                  className="gap-2"
                >
                  {isImporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {isImporting ? 'Import en cours...' : `Importer ${subjectsToImport.length} matière(s)`}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CameroonSubjectsImporter;
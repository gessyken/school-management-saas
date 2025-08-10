import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  GraduationCap,
  MoreHorizontal,
  Pencil,
  CheckCircle,
  Trash,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface Class {
  _id?: string;
  classesName: string;
  status: string;
  studentList?: any[];
  capacity?: number;
  level: string;
  year: string;
}

interface ClassesGroupedViewProps {
  currentData: Class[];
  expandedLevels: Record<string, boolean>;
  setExpandedLevels: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  loading: boolean;
  submitting: boolean;
  handleEdit: (cls: Class) => void;
  toggleStatus: (cls: Class) => void;
  handleDelete: (id: string) => void;
}

const ClassesGroupedView: React.FC<ClassesGroupedViewProps> = ({
  currentData,
  expandedLevels,
  setExpandedLevels,
  loading,
  submitting,
  handleEdit,
  toggleStatus,
  handleDelete,
}) => {
  // Group classes by level
  const groupedClasses = currentData.reduce((acc, cls) => {
    const level = cls.level;
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(cls);
    return acc;
  }, {} as Record<string, Class[]>);

  // Sort levels in educational order
  const levelOrder = ['6e', '5e', '4e', '3e', '2nde', '1ère A', '1ère C', '1ère D', '1ère TI', 'Terminale A', 'Terminale C', 'Terminale D', 'Terminale TI', 'Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth A', 'Lower Sixth C', 'Lower Sixth D', 'Lower Sixth TI', 'Upper Sixth A', 'Upper Sixth C', 'Upper Sixth D', 'Upper Sixth TI'];
  const sortedLevels = Object.keys(groupedClasses).sort((a, b) => {
    const indexA = levelOrder.indexOf(a);
    const indexB = levelOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const toggleExpanded = (level: string) => {
    setExpandedLevels(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  };

  return (
    <div className="space-y-4">
      {sortedLevels.map((level) => {
        const levelClasses = groupedClasses[level];
        const isExpanded = expandedLevels[level] ?? true;

        return (
          <div key={level} className="border rounded-lg overflow-hidden">
            <div 
              className="bg-muted/50 p-4 cursor-pointer hover:bg-muted/70 transition-colors flex items-center justify-between"
              onClick={() => toggleExpanded(level)}
            >
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{level}</h3>
                  <p className="text-sm text-muted-foreground">
                    {levelClasses.length} classe{levelClasses.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {levelClasses.reduce((sum, cls) => sum + (cls.studentList?.length ?? 0), 0)} élèves
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
            
            {isExpanded && (
              <div className="p-4 space-y-3">
                {levelClasses.map((cls) => (
                  <div key={cls._id} className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <p className="font-medium">{cls.classesName}</p>
                          <p className="text-sm text-muted-foreground">Nom de la classe</p>
                        </div>
                        <div>
                          <p className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            cls.status === 'Ouvert' || cls.status === 'Open' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {cls.status}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">Statut</p>
                        </div>
                        <div>
                          <p className="font-medium">{cls.studentList?.length ?? 0}</p>
                          <p className="text-sm text-muted-foreground">Étudiants</p>
                        </div>
                        <div>
                          <p className="font-medium">{cls.capacity ?? 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">Capacité</p>
                        </div>
                        <div>
                          <p className="font-medium">{cls.year}</p>
                          <p className="text-sm text-muted-foreground">Année</p>
                        </div>
                      </div>
                      <div className="ml-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={loading || submitting}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(cls)}>
                              <Pencil className="h-4 w-4 mr-2" /> Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleStatus(cls)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {cls.status === "Ouvert" ? "Fermer" : "Ouvrir"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(cls._id!)}>
                              <Trash className="h-4 w-4 mr-2" /> Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ClassesGroupedView;
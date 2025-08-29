import React, { useMemo } from 'react';
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

import { getAllLevelsStructured } from '@/data/cameroonSubjects'; // Import structured levels

// Interface for a single class object
interface Class {
  _id?: string;
  classesName: string;
  status: string; // Expected to be "Open" or "Closed"
  studentList?: string[]; // Assuming array of student ObjectIds
  capacity?: number;
  level: string;
  year: string;
}

// Props interface for the ClassesGroupedView component
interface ClassesGroupedViewProps {
  currentData: Class[]; // Array of class data to display
  expandedLevels: Record<string, boolean>; // Object to manage expanded/collapsed state of each level
  setExpandedLevels: React.Dispatch<React.SetStateAction<Record<string, boolean>>>; // Setter for expandedLevels
  loading: boolean; // General loading state from parent
  submitting: boolean; // Submission state from parent
  handleEdit: (cls: Class) => void; // Callback for editing a class
  toggleStatus: (cls: Class) => void; // Callback for toggling class status
  handleDelete: (id: string) => void; // Callback for deleting a class
  t: (key: string, options?: { [key: string]: any }) => string; // Translation function from parent
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
  t, // Receive t function from parent
}) => {
  // Memoize grouped classes to avoid re-calculation on every render
  const groupedClasses = useMemo(() => {
    return currentData.reduce((acc, cls) => {
      const level = cls.level;
      if (!acc[level]) {
        acc[level] = [];
      }
      acc[level].push(cls);
      return acc;
    }, {} as Record<string, Class[]>);
  }, [currentData]); // Re-calculate only when currentData changes

  // Dynamically create a master level order from cameroonSubjects.ts
  const masterLevelOrder = useMemo(() => {
    const allLevelsStructured = getAllLevelsStructured();
    return [
      ...allLevelsStructured.francophone,
      ...allLevelsStructured.anglophone
    ];
  }, []); // Only re-calculate if getAllLevelsStructured changes (unlikely)

  // Sort levels present in currentData according to the master order
  const sortedLevels = useMemo(() => {
    return Object.keys(groupedClasses).sort((a, b) => {
      const indexA = masterLevelOrder.indexOf(a);
      const indexB = masterLevelOrder.indexOf(b);

      // Handle levels not found in the master list: put them at the end, sorted alphabetically
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1; // 'b' is in master list, 'a' is not, so 'a' comes after 'b'
      if (indexB === -1) return -1; // 'a' is in master list, 'b' is not, so 'a' comes before 'b'
      return indexA - indexB; // Sort by their order in the master list
    });
  }, [groupedClasses, masterLevelOrder]); // Re-calculate when groupedClasses or masterLevelOrder changes

  // Function to toggle the expanded state of a level group
  const toggleExpanded = (level: string) => {
    setExpandedLevels(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  };

  return (
    <div className="space-y-4">
      {/* Display message if no classes are found after grouping */}
      {sortedLevels.length === 0 && (
        <div className="text-center py-8">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">{t('classes.errors.no_classes_grouped')}</p>
        </div>
      )}

      {/* Map through sorted levels to display each group */}
      {sortedLevels.map((level) => {
        const levelClasses = groupedClasses[level];
        // Default to true if expanded state for this level is not explicitly set
        const isExpanded = expandedLevels[level] ?? true;

        return (
          <div key={level} className="border rounded-lg overflow-hidden">
            {/* Level group header, acts as a toggle button */}
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
                    {/* Localized summary of classes in this level */}
                    {t('classes.level_summary', { count: levelClasses.length })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {/* Localized summary of students in this level */}
                  {t('classes.students_count', { count: levelClasses.reduce((sum, cls) => sum + (cls.studentList?.length ?? 0), 0) })}
                </span>
                {/* Chevron icon to indicate expanded/collapsed state */}
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Collapsible content for classes within this level */}
            {isExpanded && (
              <div className="p-4 space-y-3">
                {levelClasses.length === 0 ? (
                  // Message if no classes found within an expanded level (e.g., after search)
                  <p className="text-center text-muted-foreground py-4">{t('classes.errors.no_classes_in_level')}</p>
                ) : (
                  levelClasses.map((cls) => (
                    <div key={cls._id} className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                          {/* Class Name */}
                          <div>
                            <p className="font-medium">{cls.classesName}</p>
                            <p className="text-sm text-muted-foreground">{t('classes.table.name')}</p>
                          </div>
                          {/* Class Status */}
                          <div>
                            <p className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              // Consistent check for "Open" status for styling
                              cls.status === 'Open'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {/* Localized status text */}
                              {cls.status === 'Open' ? t('classes.status.open') : t('classes.status.closed')}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">{t('classes.table.status')}</p>
                          </div>
                          {/* Student Count */}
                          <div>
                            <p className="font-medium">{cls.studentList?.length ?? 0}</p>
                            <p className="text-sm text-muted-foreground">{t('classes.table.students_count')}</p>
                          </div>
                          {/* Capacity */}
                          <div>
                            <p className="font-medium">{cls.capacity ?? 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">{t('classes.table.capacity')}</p>
                          </div>
                          {/* Academic Year */}
                          <div>
                            <p className="font-medium">{cls.year}</p>
                            <p className="text-sm text-muted-foreground">{t('classes.table.year')}</p>
                          </div>
                        </div>
                        {/* Dropdown menu for class actions */}
                        <div className="ml-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={loading || submitting}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(cls)}>
                                <Pencil className="h-4 w-4 mr-2" /> {t('classes.action.edit')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleStatus(cls)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {/* Localized toggle status text */}
                                {cls.status === "Open" ? t('classes.action.close') : t('classes.action.open')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(cls._id!)} className="text-destructive">
                                <Trash className="h-4 w-4 mr-2" /> {t('classes.action.delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ClassesGroupedView;
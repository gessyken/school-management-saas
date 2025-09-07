import { useState, useEffect, useMemo, useCallback } from 'react';
import locationService, { cameroonRegions, cameroonDepartments } from '../services/locationService';

// Types pour les régions et départements du Cameroun
type Region = {
  id: number;
  name: string;
  name_en?: string;
};

type Department = {
  id: number;
  name: string;
  name_en?: string;
  region_id: number;
};

// Cache pour les données des régions et départements
let regionsCache: Region[] = [];
let departmentsCache: Department[] = [];


interface UseCameroonLocationsProps {
  language?: 'fr' | 'en';
  initialRegionId?: number;
}

/**
 * Hook personnalisé pour gérer les sélecteurs de régions et départements du Cameroun
 */
export function useCameroonLocations({
  language = 'fr',
  initialRegionId,
}: UseCameroonLocationsProps = {}) {
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(
    initialRegionId || null
  );
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);

  // Liste des régions formatée selon la langue
  const regions = useMemo(() => {
    return cameroonRegions.map((region) => ({
      id: region.id,
      name: language === 'en' && region.name_en ? region.name_en : region.name,
    }));
  }, [language]);

  // Liste des départements filtrée par région et formatée selon la langue
  const departments = useMemo(() => {
    if (!selectedRegionId) return [];
    
    return cameroonDepartments
      .filter((dept) => dept.region_id === selectedRegionId)
      .map((dept) => ({
        id: dept.id,
        name: language === 'en' && dept.name_en ? dept.name_en : dept.name,
      }));
  }, [selectedRegionId, language]);

  // Réinitialiser le département sélectionné lorsque la région change
  useEffect(() => {
    setSelectedDepartmentId(null);
  }, [selectedRegionId]);

  // Obtenir le nom de la région sélectionnée
  const getSelectedRegionName = () => {
    if (!selectedRegionId) return '';
    const region = cameroonRegions.find((r) => r.id === selectedRegionId);
    return region ? (language === 'en' && region.name_en ? region.name_en : region.name) : '';
  };

  // Obtenir le nom du département sélectionné
  const getSelectedDepartmentName = () => {
    if (!selectedDepartmentId) return '';
    const department = cameroonDepartments.find((d) => d.id === selectedDepartmentId);
    return department ? (language === 'en' && department.name_en ? department.name_en : department.name) : '';
  };

  // Sélectionner une région par son ID
  const selectRegionById = (regionId: number | null) => {
    setSelectedRegionId(regionId);
  };

  // Sélectionner un département par son ID
  const selectDepartmentById = (departmentId: number | null) => {
    setSelectedDepartmentId(departmentId);
  };

  // Sélectionner une région par son nom
  const selectRegionByName = (regionName: string) => {
    const region = cameroonRegions.find(
      (r) => 
        r.name.toLowerCase() === regionName.toLowerCase() || 
        (r.name_en && r.name_en.toLowerCase() === regionName.toLowerCase())
    );
    setSelectedRegionId(region ? region.id : null);
  };

  // Sélectionner un département par son nom
  const selectDepartmentByName = (departmentName: string) => {
    const department = cameroonDepartments.find(
      (d) => 
        d.name.toLowerCase() === departmentName.toLowerCase() || 
        (d.name_en && d.name_en.toLowerCase() === departmentName.toLowerCase())
    );
    if (department) {
      setSelectedRegionId(department.region_id);
      setSelectedDepartmentId(department.id);
    }
  };

  return {
    regions,
    departments,
    selectedRegionId,
    selectedDepartmentId,
    selectRegionById,
    selectDepartmentById,
    selectRegionByName,
    selectDepartmentByName,
    getSelectedRegionName,
    getSelectedDepartmentName,
  };
}
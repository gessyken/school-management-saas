// Configuration centralisée des couleurs pour MI-TECH
// Utilise les couleurs bleu pastel et jaune moutarde définies dans tailwind.config.ts

export const colors = {
  // Couleurs principales - Bleu pastel et jaune moutarde
  primary: {
    skyblue: '#87CEEB',  // Bleu pastel
    mustard: '#DAA520',  // Jaune moutarde
  },
  
  // Classes Tailwind pour les couleurs principales
  tailwind: {
    skyblue: {
      text: 'text-skyblue',
      bg: 'bg-skyblue',
      bgLight: 'bg-skyblue/10',
      bgMedium: 'bg-skyblue/20',
      bgStrong: 'bg-skyblue/30',
      border: 'border-skyblue',
      borderLight: 'border-skyblue/20',
      borderMedium: 'border-skyblue/30',
      hover: 'hover:bg-skyblue',
      hoverLight: 'hover:bg-skyblue/10',
      shadow: 'shadow-skyblue/20',
    },
    mustard: {
      text: 'text-mustard',
      bg: 'bg-mustard',
      bgLight: 'bg-mustard/10',
      bgMedium: 'bg-mustard/20',
      bgStrong: 'bg-mustard/30',
      border: 'border-mustard',
      borderLight: 'border-mustard/20',
      borderMedium: 'border-mustard/30',
      hover: 'hover:bg-mustard',
      hoverLight: 'hover:bg-mustard/10',
      shadow: 'shadow-mustard/20',
    },
  },
  
  // États avec les couleurs principales
  states: {
    success: {
      text: 'text-skyblue',
      bg: 'bg-skyblue/10',
      border: 'border-skyblue/30',
    },
    warning: {
      text: 'text-mustard',
      bg: 'bg-mustard/10',
      border: 'border-mustard/30',
    },
    error: {
      text: 'text-mustard',
      bg: 'bg-mustard/10',
      border: 'border-mustard/30',
    },
    info: {
      text: 'text-skyblue',
      bg: 'bg-skyblue/10',
      border: 'border-skyblue/30',
    },
  },
  
  // Boutons avec les couleurs principales
  buttons: {
    primary: {
      skyblue: 'bg-skyblue hover:bg-skyblue/90 text-white',
      mustard: 'bg-mustard hover:bg-mustard/90 text-white',
    },
    secondary: {
      skyblue: 'bg-skyblue/10 hover:bg-skyblue/20 text-skyblue border border-skyblue/30',
      mustard: 'bg-mustard/10 hover:bg-mustard/20 text-mustard border border-mustard/30',
    },
    outline: {
      skyblue: 'border border-skyblue text-skyblue hover:bg-skyblue/10',
      mustard: 'border border-mustard text-mustard hover:bg-mustard/10',
    },
  },
  
  // Badges et statuts
  badges: {
    active: {
      skyblue: 'bg-skyblue/10 text-skyblue border border-skyblue/30',
      mustard: 'bg-mustard/10 text-mustard border border-mustard/30',
    },
    inactive: {
      skyblue: 'bg-gray-100 text-gray-600 border border-gray-200',
      mustard: 'bg-gray-100 text-gray-600 border border-gray-200',
    },
  },
};

// Fonction utilitaire pour obtenir les classes de couleur
export const getColorClasses = (color: 'skyblue' | 'mustard', type: 'text' | 'bg' | 'border' | 'hover' = 'text') => {
  return colors.tailwind[color][type];
};

// Fonction pour obtenir les classes de bouton
export const getButtonClasses = (variant: 'primary' | 'secondary' | 'outline', color: 'skyblue' | 'mustard') => {
  return colors.buttons[variant][color];
};

// Fonction pour obtenir les classes d'état
export const getStateClasses = (state: 'success' | 'warning' | 'error' | 'info') => {
  return colors.states[state];
};

// Fonction pour obtenir les classes de badge
export const getBadgeClasses = (status: 'active' | 'inactive', color: 'skyblue' | 'mustard' = 'skyblue') => {
  return colors.badges[status][color];
};
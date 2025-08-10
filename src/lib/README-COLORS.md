# Guide des Couleurs MI-TECH

Ce projet utilise un système de couleurs standardisé basé sur deux couleurs principales : **Skyblue** et **Mustard**.

## Couleurs Principales

- **Skyblue**: `#33C3F0` - Utilisée pour les éléments principaux, succès, et informations
- **Mustard**: `#E3B505` - Utilisée pour les avertissements, actions secondaires, et accents

## Utilisation

### 1. Import du système de couleurs

```typescript
import { colors, getColorClasses, getButtonClasses, getStateClasses, getBadgeClasses } from '../lib/colors';
```

### 2. Classes Tailwind disponibles

#### Couleurs de base
- `text-skyblue` / `text-mustard`
- `bg-skyblue` / `bg-mustard`
- `border-skyblue` / `border-mustard`

#### Couleurs avec opacité
- `bg-skyblue/10` / `bg-mustard/10` (10% d'opacité)
- `bg-skyblue/20` / `bg-mustard/20` (20% d'opacité)
- `bg-skyblue/30` / `bg-mustard/30` (30% d'opacité)
- `border-skyblue/30` / `border-mustard/30`

### 3. Composants utilitaires

#### ColorButton
```tsx
import { ColorButton } from '../components/ui/color-button';

<ColorButton variant="primary" color="skyblue">
  Bouton Principal
</ColorButton>

<ColorButton variant="outline" color="mustard">
  Bouton Secondaire
</ColorButton>
```

#### ColorBadge
```tsx
import { ColorBadge } from '../components/ui/color-badge';

<ColorBadge variant="success" color="skyblue">
  Succès
</ColorBadge>

<ColorBadge variant="warning" color="mustard">
  Avertissement
</ColorBadge>
```

### 4. Fonctions utilitaires

```typescript
// Obtenir les classes de couleur
const textClass = getColorClasses('skyblue', 'text'); // 'text-skyblue'
const bgClass = getColorClasses('mustard', 'bg'); // 'bg-mustard'

// Obtenir les classes de bouton
const primaryButton = getButtonClasses('primary', 'skyblue');
const outlineButton = getButtonClasses('outline', 'mustard');

// Obtenir les classes d'état
const successClasses = getStateClasses('success'); // Classes pour succès
const warningClasses = getStateClasses('warning'); // Classes pour avertissement
```

## États et Contextes

### Mapping des états
- **Succès / Actif / Positif**: Skyblue
- **Avertissement / Attention / Neutre**: Mustard
- **Erreur / Critique**: Mustard (avec nuances plus sombres si nécessaire)
- **Information / Navigation**: Skyblue

### Exemples d'utilisation par contexte

#### Statuts d'étudiants
```tsx
// Actif
<span className="bg-skyblue/10 text-skyblue border border-skyblue/30">
  Actif
</span>

// Inactif / Suspendu
<span className="bg-mustard/10 text-mustard border border-mustard/30">
  Suspendu
</span>
```

#### Boutons d'action
```tsx
// Action principale
<button className="bg-skyblue hover:bg-skyblue/90 text-white">
  Enregistrer
</button>

// Action secondaire
<button className="bg-mustard hover:bg-mustard/90 text-white">
  Modifier
</button>
```

#### Notifications
```tsx
// Information
<div className="bg-skyblue/10 text-skyblue border border-skyblue/30">
  Information importante
</div>

// Avertissement
<div className="bg-mustard/10 text-mustard border border-mustard/30">
  Attention requise
</div>
```

## Migration des couleurs existantes

Pour migrer les couleurs existantes vers le nouveau système :

### Remplacements recommandés
- `text-blue-*` → `text-skyblue`
- `bg-blue-*` → `bg-skyblue` ou `bg-skyblue/10`
- `text-green-*` → `text-skyblue` (pour succès)
- `bg-green-*` → `bg-skyblue/10` (pour succès)
- `text-yellow-*` → `text-mustard`
- `bg-yellow-*` → `bg-mustard/10`
- `text-red-*` → `text-mustard` (pour erreurs)
- `bg-red-*` → `bg-mustard/10` (pour erreurs)

## Bonnes Pratiques

1. **Cohérence**: Utilisez toujours les mêmes couleurs pour les mêmes types d'éléments
2. **Contraste**: Assurez-vous que le contraste est suffisant pour l'accessibilité
3. **Hiérarchie**: Utilisez skyblue pour les éléments principaux, mustard pour les secondaires
4. **États**: Maintenez une logique cohérente pour les états (succès = skyblue, attention = mustard)
5. **Composants**: Privilégiez les composants utilitaires (ColorButton, ColorBadge) pour la réutilisabilité

## Maintenance

Toutes les couleurs sont centralisées dans `src/lib/colors.ts`. Pour modifier ou ajouter des variantes :

1. Modifiez le fichier `colors.ts`
2. Mettez à jour la configuration Tailwind si nécessaire
3. Testez les changements sur tous les composants
4. Mettez à jour cette documentation
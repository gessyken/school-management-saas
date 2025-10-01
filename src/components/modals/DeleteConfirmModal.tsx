import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, X, Loader2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  message?: string;
  itemName?: string;
  itemType?: string;
  confirmText?: string;
  cancelText?: string;
  isProcessing?: boolean;
  variant?: 'destructive' | 'warning' | 'info';
  dependencies?: {
    count: number;
    type: string;
    description?: string;
  }[];
  requiresConfirmation?: boolean;
  confirmationText?: string;
  customIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  itemType = "l'élément",
  confirmText,
  cancelText = "Annuler",
  isProcessing = false,
  variant = 'destructive',
  dependencies = [],
  requiresConfirmation = false,
  confirmationText = "Je comprends les conséquences",
  customIcon,
  size = 'md'
}) => {
  const [isConfirmed, setIsConfirmed] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  // Generate default texts based on variant
  const getDefaultTexts = () => {
    switch (variant) {
      case 'warning':
        return {
          title: "Action nécessite une confirmation",
          message: "Cette action peut avoir des impacts importants. Veuillez vérifier les détails avant de continuer.",
          confirmText: "Confirmer"
        };
      case 'info':
        return {
          title: "Confirmer l'action",
          message: "Veuillez confirmer que vous souhaitez effectuer cette action.",
          confirmText: "Continuer"
        };
      case 'destructive':
      default:
        return {
          title: "Confirmer la suppression",
          message: "Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.",
          confirmText: "Supprimer"
        };
    }
  };

  const defaultTexts = getDefaultTexts();
  const finalTitle = title || defaultTexts.title;
  const finalMessage = message || defaultTexts.message;
  const finalConfirmText = confirmText || defaultTexts.confirmText;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setIsConfirmed(false);
    } else {
      // Delay unmounting for smooth animation
      const timer = setTimeout(() => setIsMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !isProcessing) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isProcessing, onClose]);

  const handleConfirm = async () => {
    if (requiresConfirmation && !isConfirmed) return;
    
    try {
      await onConfirm();
      // Don't close automatically - let parent handle it
    } catch (error) {
      // Error handling is done by parent
      console.error('Confirmation error:', error);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          iconBg: 'bg-amber-100 dark:bg-amber-900/20',
          iconColor: 'text-amber-600 dark:text-amber-400',
          borderColor: 'border-amber-200 dark:border-amber-800',
          textColor: 'text-amber-800 dark:text-amber-200',
          bgColor: 'bg-amber-50 dark:bg-amber-900/10',
          buttonVariant: 'default' as const,
          accentColor: 'amber'
        };
      case 'info':
        return {
          iconBg: 'bg-blue-100 dark:bg-blue-900/20',
          iconColor: 'text-blue-600 dark:text-blue-400',
          borderColor: 'border-blue-200 dark:border-blue-800',
          textColor: 'text-blue-800 dark:text-blue-200',
          bgColor: 'bg-blue-50 dark:bg-blue-900/10',
          buttonVariant: 'default' as const,
          accentColor: 'blue'
        };
      case 'destructive':
      default:
        return {
          iconBg: 'bg-red-100 dark:bg-red-900/20',
          iconColor: 'text-red-600 dark:text-red-400',
          borderColor: 'border-red-200 dark:border-red-800',
          textColor: 'text-red-800 dark:text-red-200',
          bgColor: 'bg-red-50 dark:bg-red-900/10',
          buttonVariant: 'destructive' as const,
          accentColor: 'red'
        };
    }
  };

  const getIcon = () => {
    if (customIcon) return customIcon;
    
    switch (variant) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      case 'destructive':
      default:
        return <Trash2 className="w-5 h-5" />;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-sm';
      case 'lg':
        return 'max-w-lg';
      case 'md':
      default:
        return 'max-w-md';
    }
  };

  const styles = getVariantStyles();

  if (!isMounted && !isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={isProcessing ? undefined : onClose}>
      <DialogContent 
        className={cn(
          "p-0 overflow-hidden transition-all duration-300",
          getSizeClasses()
        )}
        onInteractOutside={(e) => {
          if (isProcessing) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader className={cn(
          "p-6 pb-4 transition-colors",
          styles.borderColor,
          variant === 'destructive' ? 'border-b' : 'border-b'
        )}>
          <div className="flex items-start space-x-3">
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0",
              styles.iconBg
            )}>
              {getIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <DialogTitle className={cn(
                "text-lg font-semibold leading-6",
                styles.textColor
              )}>
                {finalTitle}
              </DialogTitle>
              
              <DialogDescription className="mt-2 text-sm text-muted-foreground">
                {finalMessage}
              </DialogDescription>
            </div>

            {!isProcessing && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full flex-shrink-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                disabled={isProcessing}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Item Details */}
        {itemName && (
          <div className="px-6 py-3">
            <div className={cn(
              "px-4 py-3 rounded-lg border transition-colors",
              styles.borderColor,
              styles.bgColor
            )}>
              <p className="text-sm font-medium text-foreground">
                {itemType} concerné
                {/* {e.itemType?.endsWith('e') ? 'e' : ''} : */}
              </p>
              <p className={cn(
                "text-sm font-semibold mt-1 break-words",
                styles.textColor
              )}>
                {itemName}
              </p>
            </div>
          </div>
        )}

        {/* Dependencies Warning */}
        {dependencies.length > 0 && (
          <div className="px-6 py-3">
            <Alert variant={variant === 'destructive' ? 'destructive' : 'default'} className="bg-muted/50">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription className="text-sm">
                <div className="font-medium mb-2">Éléments associés qui seront affectés :</div>
                <div className="space-y-1">
                  {dependencies.map((dep, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span>{dep.type} :</span>
                      <Badge variant="secondary" className="ml-2">
                        {dep.count} élément{dep.count > 1 ? 's' : ''}
                      </Badge>
                    </div>
                  ))}
                </div>
                {dependencies.some(dep => dep.description) && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {dependencies.find(dep => dep.description)?.description}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Additional Warning */}
        <div className="px-6 py-3">
          <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
            <AlertTriangle className={cn(
              "w-4 h-4 mt-0.5 flex-shrink-0",
              styles.iconColor
            )} />
            <div className="space-y-1 flex-1">
              <p className={cn(
                "text-sm font-medium",
                styles.textColor
              )}>
                {variant === 'destructive' 
                  ? "Action irréversible"
                  : variant === 'warning'
                  ? "Action importante"
                  : "Confirmation requise"
                }
              </p>
              <p className={cn(
                "text-xs leading-relaxed",
                variant === 'destructive' 
                  ? "text-red-600 dark:text-red-400"
                  : variant === 'warning'
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-blue-600 dark:text-blue-400"
              )}>
                {variant === 'destructive' 
                  ? "Cette action est irréversible. Toutes les données associées seront définitivement supprimées et ne pourront pas être récupérées."
                  : variant === 'warning'
                  ? "Cette action peut affecter les données associées. Veuillez vérifier les dépendances avant de continuer."
                  : "Veuillez vérifier que toutes les informations sont correctes avant de confirmer cette action."
                }
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation Checkbox */}
        {requiresConfirmation && (
          <div className="px-6 py-3 border-t">
            <label className="flex items-start space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                className={cn(
                  "mt-0.5 rounded border-gray-300 text-primary focus:ring-primary focus:ring-2 focus:ring-offset-2",
                  "transition-colors duration-200",
                  variant === 'destructive' && "focus:ring-red-500",
                  variant === 'warning' && "focus:ring-amber-500",
                  variant === 'info' && "focus:ring-blue-500"
                )}
                disabled={isProcessing}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground group-hover:text-foreground/80 transition-colors">
                  {confirmationText}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Cochez cette case pour confirmer que vous comprenez les conséquences de cette action.
                </p>
              </div>
            </label>
          </div>
        )}

        <DialogFooter className="px-6 py-4 bg-muted/30 border-t">
          <div className="flex w-full gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 transition-all duration-200"
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              variant={styles.buttonVariant}
              onClick={handleConfirm}
              disabled={isProcessing || (requiresConfirmation && !isConfirmed)}
              className={cn(
                "flex-1 transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                variant === 'destructive' && "bg-red-600 hover:bg-red-700 text-white",
                variant === 'warning' && "bg-amber-600 hover:bg-amber-700 text-white",
                variant === 'info' && "bg-blue-600 hover:bg-blue-700 text-white"
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Traitement en cours...
                </>
              ) : (
                finalConfirmText
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmModal;
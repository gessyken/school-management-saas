import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  itemType?: string;
  confirmText?: string;
  cancelText?: string;
  isProcessing?: boolean;
  variant?: 'destructive' | 'warning';
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmer la suppression",
  message = "Êtes-vous sûr de vouloir supprimer cet élément ?",
  itemName,
  itemType = "l'élément",
  confirmText = "Supprimer",
  cancelText = "Annuler",
  isProcessing = false,
  variant = 'destructive'
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
          borderColor: 'border-amber-200',
          textColor: 'text-amber-800',
          bgColor: 'bg-amber-50'
        };
      case 'destructive':
      default:
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          bgColor: 'bg-red-50'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className={cn(
          "p-6 pb-4",
          variant === 'destructive' ? 'border-b border-red-100' : 'border-b border-amber-100'
        )}>
          <div className="flex items-center space-x-3">
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full",
              styles.iconBg
            )}>
              {variant === 'warning' ? (
                <AlertTriangle className={cn("w-5 h-5", styles.iconColor)} />
              ) : (
                <Trash2 className={cn("w-5 h-5", styles.iconColor)} />
              )}
            </div>
            <div className="flex-1">
              <DialogTitle className={cn(
                "text-lg font-semibold",
                variant === 'destructive' ? 'text-red-900' : 'text-amber-900'
              )}>
                {title}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-muted-foreground">
                {message}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Item Details */}
        {itemName && (
          <div className="px-6 py-3">
            <div className={cn(
              "px-4 py-3 rounded-lg border",
              styles.borderColor,
              styles.bgColor
            )}>
              <p className="text-sm font-medium">
                {itemType} à supprimer :
              </p>
              <p className={cn(
                "text-sm font-semibold mt-1",
                styles.textColor
              )}>
                "{itemName}"
              </p>
            </div>
          </div>
        )}

        {/* Warning Message */}
        <div className="px-6 py-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className={cn(
              "w-4 h-4 mt-0.5 flex-shrink-0",
              variant === 'destructive' ? 'text-red-500' : 'text-amber-500'
            )} />
            <div className="space-y-1">
              <p className={cn(
                "text-sm font-medium",
                variant === 'destructive' ? 'text-red-800' : 'text-amber-800'
              )}>
                Action irréversible
              </p>
              <p className={cn(
                "text-xs",
                variant === 'destructive' ? 'text-red-600' : 'text-amber-600'
              )}>
                {variant === 'warning' 
                  ? "Cette action peut affecter les données associées. Veuillez vérifier les dépendances avant de continuer."
                  : "Cette action est irréversible. Toutes les données associées seront définitivement supprimées."
                }
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex w-full gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1"
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              variant={variant === 'warning' ? 'default' : 'destructive'}
              onClick={handleConfirm}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Suppression...
                </>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmModal;
// components/SchoolCreateModal.tsx
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } 
from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";


const SchoolCreateModal = ({ open, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = await api.post("/schools/register", { name, email, subdomain });
      toast({ title: "École créée avec succès" });
      console.log(data.data.school._id)
      if (data?.data?.school?._id)
        onSuccess(data?.data?.school?._id);
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error?.response?.data?.message || "Erreur de création",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer une nouvelle école</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Nom de l’école</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>Sous-domaine (facultatif)</Label>
            <Input value={subdomain} onChange={(e) => setSubdomain(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Création..." : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolCreateModal;

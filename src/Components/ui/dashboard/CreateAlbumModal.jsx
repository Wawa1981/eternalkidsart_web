import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { Loader2, Folder } from 'lucide-react';

export default function CreateAlbumModal({ open, onClose, children, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    child_name: '',
    year: new Date().getFullYear()
  });

  const handleSave = async () => {
    if (!formData.name || !formData.child_name) return;
    setLoading(true);
    try {
      await base44.entities.Album.create(formData);
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Error creating album:', error);
    }
    setLoading(false);
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      child_name: '',
      year: new Date().getFullYear()
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Folder className="w-5 h-5 text-white" />
            </div>
            Créer un album
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Nom de l'album *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Les dessins de Lucas 2024"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label>Prénom de l'enfant *</Label>
            <Input
              value={formData.child_name}
              onChange={(e) => setFormData({ ...formData, child_name: e.target.value })}
              placeholder="Ex: Lucas"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Année</Label>
            <Input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description optionnelle..."
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 rounded-xl"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formData.name || !formData.child_name || loading}
            className="flex-1 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-xl"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Création...
              </>
            ) : (
              'Créer l\'album'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

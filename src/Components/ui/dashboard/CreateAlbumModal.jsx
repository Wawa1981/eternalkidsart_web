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

export default function CreateAlbumModal({
  open,
  onClose,
  children,
  onSuccess,
  createdBy, // ✅ AJOUT
}) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    child_name: '',
    year: new Date().getFullYear(),
  });

  const buildPayload = () => {
    return {
      name: formData.name.trim(),
      child_name: formData.child_name.trim(),
      year: Number.isFinite(Number(formData.year)) ? Number(formData.year) : new Date().getFullYear(),
      description: formData.description?.trim() || null,

      // ✅ IMPORTANT : pour que les policies et tes filtres marchent
      created_by: createdBy || null,
    };
  };

  const handleSave = async () => {
    setErrorMsg('');
    if (!formData.name.trim() || !formData.child_name.trim()) return;

    setLoading(true);
    try {
      const payload = buildPayload();
      await base44.entities.Album.create(payload);

      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Error creating album:', error);
      console.error('Album create status:', error?.response?.status);
      console.error('Album create details:', error?.response?.data || error?.data || error);

      setErrorMsg(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          `Erreur création album (${error?.response?.status || 'no status'})`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrorMsg('');
    setFormData({
      name: '',
      description: '',
      child_name: '',
      year: new Date().getFullYear(),
    });
    onClose?.();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose(); // ✅ ne ferme que sur close
      }}
    >
	<DialogContent className="max-w-md bg-white text-gray-900 shadow-2xl border border-gray-200 z-[100]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Folder className="w-5 h-5 text-white" />
            </div>
            Créer un album
          </DialogTitle>
        </DialogHeader>

        {!createdBy && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm">
            Identifiant utilisateur introuvable (createdBy). Vérifie le retour de <code>base44.auth.me()</code>.
          </div>
        )}

        {!!errorMsg && (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
            {errorMsg}
          </div>
        )}

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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  year: e.target.value === '' ? '' : parseInt(e.target.value, 10),
                })
              }
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
          <Button variant="outline" onClick={handleClose} className="flex-1 rounded-xl">
            Annuler
          </Button>

          <Button
            onClick={handleSave}
            disabled={!createdBy || !formData.name.trim() || !formData.child_name.trim() || loading}
            className="flex-1 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-xl"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Création...
              </>
            ) : (
              "Créer l'album"
            )}
          </Button>
        </div>

        {children}
      </DialogContent>
    </Dialog>
  );
}

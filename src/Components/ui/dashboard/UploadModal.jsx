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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { Upload, Wand2, Loader2, Image as ImageIcon, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadModal({ open, onClose, children, albums, onSuccess }) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [enhancedUrl, setEnhancedUrl] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    child_name: '',
    child_age: '',
    drawing_date: '',
    category: '',
    album_id: '',
    is_public: false
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedUrl(file_url);
      setStep(2);
    } catch (error) {
      console.error('Upload error:', error);
    }
    setUploading(false);
  };

  const handleEnhance = async () => {
    if (!uploadedUrl) return;
    setEnhancing(true);
    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: `Transform this child's drawing into a beautiful, professional artistic interpretation while keeping the original charm and creativity. Enhance colors, add depth and dimension, make it look like a museum-worthy piece of art that celebrates the child's imagination. Keep the same subject and composition but elevate it artistically.`,
        existing_image_urls: [uploadedUrl]
      });
      setEnhancedUrl(result.url);
    } catch (error) {
      console.error('Enhancement error:', error);
    }
    setEnhancing(false);
  };

  const handleSave = async () => {
    setUploading(true);
    try {
      await base44.entities.Drawing.create({
        ...formData,
        image_url: uploadedUrl,
        enhanced_image_url: enhancedUrl,
        child_age: formData.child_age ? parseInt(formData.child_age) : null
      });
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Save error:', error);
    }
    setUploading(false);
  };

  const handleClose = () => {
    setStep(1);
    setFile(null);
    setPreview(null);
    setUploadedUrl(null);
    setEnhancedUrl(null);
    setFormData({
      title: '',
      description: '',
      child_name: '',
      child_age: '',
      drawing_date: '',
      category: '',
      album_id: '',
      is_public: false
    });
    onClose();
  };

  const categories = [
    { value: 'portrait', label: 'Portrait' },
    { value: 'paysage', label: 'Paysage' },
    { value: 'animal', label: 'Animal' },
    { value: 'abstrait', label: 'Abstrait' },
    { value: 'famille', label: 'Famille' },
    { value: 'imaginaire', label: 'Imaginaire' },
    { value: 'nature', label: 'Nature' },
    { value: 'autre', label: 'Autre' }
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
            {step === 1 ? 'Ajouter un dessin' : step === 2 ? 'Amélioration IA' : 'Informations'}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                  preview ? 'border-rose-300 bg-rose-50' : 'border-gray-200 hover:border-rose-300'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {preview ? (
                  <div className="relative">
                    <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-xl shadow-lg" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setPreview(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-rose-400" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-700">Déposez votre image ici</p>
                      <p className="text-sm text-gray-500">ou cliquez pour sélectionner</p>
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-xl h-12"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Téléchargement...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Télécharger
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Original</Label>
                  <div className="aspect-square rounded-xl overflow-hidden shadow-lg">
                    <img src={uploadedUrl} alt="Original" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-500" />
                    Version IA
                  </Label>
                  <div className="aspect-square rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center">
                    {enhancedUrl ? (
                      <img src={enhancedUrl} alt="Enhanced" className="w-full h-full object-cover" />
                    ) : enhancing ? (
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-violet-600">Transformation en cours...</p>
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <Wand2 className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Cliquez sur "Transformer" pour créer une version IA</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                {!enhancedUrl && (
                  <Button
                    onClick={handleEnhance}
                    disabled={enhancing}
                    variant="outline"
                    className="flex-1 rounded-xl h-12 border-violet-200 text-violet-600 hover:bg-violet-50"
                  >
                    {enhancing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Transformation...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 mr-2" />
                        Transformer avec l'IA
                      </>
                    )}
                  </Button>
                )}
                <Button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-xl h-12"
                >
                  Continuer
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Titre du dessin *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Ma famille au soleil"
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
                  <Label>Âge au moment du dessin</Label>
                  <Input
                    type="number"
                    value={formData.child_age}
                    onChange={(e) => setFormData({ ...formData, child_age: e.target.value })}
                    placeholder="Ex: 6"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Date du dessin</Label>
                  <Input
                    type="date"
                    value={formData.drawing_date}
                    onChange={(e) => setFormData({ ...formData, drawing_date: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Catégorie</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choisir une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {albums && albums.length > 0 && (
                  <div className="col-span-2">
                    <Label>Album</Label>
                    <Select
                      value={formData.album_id}
                      onValueChange={(value) => setFormData({ ...formData, album_id: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choisir un album" />
                      </SelectTrigger>
                      <SelectContent>
                        {albums.map((album) => (
                          <SelectItem key={album.id} value={album.id}>
                            {album.name} - {album.child_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="col-span-2">
                  <Label>Anecdote ou description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Racontez l'histoire de ce dessin..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={formData.is_public}
                    onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_public" className="text-sm cursor-pointer">
                    Partager dans la galerie publique
                  </Label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1 rounded-xl h-12"
                >
                  Retour
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!formData.title || !formData.child_name || uploading}
                  className="flex-1 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-xl h-12"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer'
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

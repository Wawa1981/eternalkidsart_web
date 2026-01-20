import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { 
  X, 
  Heart, 
  Share2, 
  Download, 
  Calendar, 
  User, 
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';

export default function DrawingDetailModal({ drawing, onClose }) {
  if (!drawing) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = drawing.enhanced_image_url || drawing.image_url;
    link.download = `${drawing.title}.jpg`;
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: drawing.title,
          text: `Découvrez ce magnifique dessin de ${drawing.child_name}`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  return (
    <Dialog open={!!drawing} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white rounded-3xl">
        <button
          onClick={() => onClose()}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur rounded-full hover:bg-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Image Section */}
          <div className="relative bg-gradient-to-br from-rose-50 to-amber-50 p-6">
            <motion.img
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              src={drawing.enhanced_image_url || drawing.image_url}
              alt={drawing.title}
              className="w-full rounded-2xl shadow-xl object-contain max-h-[500px]"
            />
            {drawing.enhanced_image_url && (
              <div className="absolute top-8 left-8 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center gap-2 shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm text-white font-medium">Amélioré par IA</span>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{drawing.title}</h2>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className="flex items-center gap-1 border-rose-200 text-rose-600">
                  <User className="w-3 h-3" />
                  {drawing.child_name}{drawing.child_age ? `, ${drawing.child_age} ans` : ''}
                </Badge>
                {drawing.drawing_date && (
                  <Badge variant="outline" className="flex items-center gap-1 border-amber-200 text-amber-600">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(drawing.drawing_date), 'd MMMM yyyy', { locale: fr })}
                  </Badge>
                )}
                {drawing.category && (
                  <Badge className="bg-gradient-to-r from-sky-100 to-blue-100 text-sky-700 border-0">
                    {drawing.category}
                  </Badge>
                )}
              </div>
            </div>

            {drawing.description && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Anecdote</h3>
                <p className="text-gray-700">{drawing.description}</p>
              </div>
            )}

            {drawing.votes > 0 && (
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <span className="font-semibold text-gray-700">{drawing.votes} j'aime</span>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-4">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="flex-1 rounded-xl h-12"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="flex-1 rounded-xl h-12"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Partager
                </Button>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-xl h-12"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Commander une impression
              </Button>
            </div>

            {/* Compare Views */}
            {drawing.enhanced_image_url && drawing.image_url && (
              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Comparer</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <img 
                      src={drawing.image_url} 
                      alt="Original"
                      className="w-full aspect-square object-cover rounded-xl"
                    />
                    <p className="text-xs text-center text-gray-500">Original</p>
                  </div>
                  <div className="space-y-1">
                    <img 
                      src={drawing.enhanced_image_url} 
                      alt="Amélioré"
                      className="w-full aspect-square object-cover rounded-xl"
                    />
                    <p className="text-xs text-center text-gray-500">Version IA</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  User,
  Image as ImageIcon,
  Plus
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import DrawingCard from '@/Components/ui/dashboard/DrawingCard';
import DrawingDetailModal from '@/Components/ui/dashboard/DrawingDetailModal';
import UploadModal from '@/Components/ui/dashboard/UploadModal';

export default function AlbumDetail() {
  const [user, setUser] = useState(null);
  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  
  const urlParams = new URLSearchParams(window.location.search);
  const albumId = urlParams.get('id');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: album } = useQuery({
    queryKey: ['album', albumId],
    queryFn: async () => {
      const albums = await base44.entities.Album.filter({ id: albumId });
      return albums[0];
    },
    enabled: !!albumId
  });

  const { data: drawings = [], refetch } = useQuery({
    queryKey: ['albumDrawings', albumId],
    queryFn: () => base44.entities.Drawing.filter({ album_id: albumId }, '-drawing_date'),
    enabled: !!albumId
  });

  const { data: albums = [] } = useQuery({
    queryKey: ['albums'],
    queryFn: () => base44.entities.Album.filter({ created_by: user?.email }),
    enabled: !!user
  });

  if (!user || !album) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link 
            to={createPageUrl('Dashboard')}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-rose-500 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord
          </Link>

          <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{album.name}</h1>
                <div className="flex items-center gap-4 mt-2 text-gray-500">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {album.child_name}
                  </span>
                  {album.year && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {album.year}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-4 h-4" />
                    {drawings.length} dessins
                  </span>
                </div>
                {album.description && (
                  <p className="text-gray-600 mt-3">{album.description}</p>
                )}
              </div>
              <Button
                onClick={() => setUploadModalOpen(true)}
                className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un dessin
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Drawings Grid */}
        {drawings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white/50 rounded-2xl"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center mb-4">
              <ImageIcon className="w-10 h-10 text-rose-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Album vide</h3>
            <p className="text-gray-500 mb-6">Ajoutez des dessins à cet album</p>
            <Button
              onClick={() => setUploadModalOpen(true)}
              className="bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter le premier dessin
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {drawings.map((drawing, idx) => (
              <DrawingCard 
                key={drawing.id} 
                drawing={drawing} 
                onClick={setSelectedDrawing}
                delay={idx * 0.05}
              />
            ))}
          </div>
        )}
      </div>

      <UploadModal 
        open={uploadModalOpen} 
        onClose={() => setUploadModalOpen(false)}
        albums={albums}
        onSuccess={() => refetch()}
      />

      <DrawingDetailModal
        drawing={selectedDrawing}
        onClose={() => setSelectedDrawing(null)}
      />
    </div>
  );
}

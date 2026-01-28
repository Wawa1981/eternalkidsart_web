import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Plus,
  Image as ImageIcon,
  Folder,
  TrendingUp,
  Users,
  Sparkles,
  Search,
  Grid,
  List,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import StatsCard from '@/Components/ui/dashboard/StatsCard';
import AlbumCard from '@/Components/ui/dashboard/AlbumCard';
import DrawingCard from '@/Components/ui/dashboard/DrawingCard';
import UploadModal from '@/Components/ui/dashboard/UploadModal';
import DrawingDetailModal from '@/Components/ui/dashboard/DrawingDetailModal';
import CreateAlbumModal from '@/Components/ui/dashboard/CreateAlbumModal';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        // Debug utile (tu peux enlever après)
        console.log('[auth.me] userData =', userData);
      } catch (e) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  // ✅ createdBy robuste : on essaye plusieurs champs
  const createdBy = useMemo(() => {
    if (!user) return null;
    return (
      user.email ||
      user.email_address ||
      user.primary_email ||
      user.username ||
      user.id ||
      null
    );
  }, [user]);

  useEffect(() => {
    if (user && !createdBy) {
      console.warn(
        '[Dashboard] Aucun identifiant trouvé pour createdBy. Vérifie les champs de base44.auth.me().'
      );
    }
  }, [user, createdBy]);

  const { data: drawings = [], isLoading: drawingsLoading } = useQuery({
    queryKey: ['drawings', createdBy],
    enabled: !!createdBy,
    queryFn: async () => {
      // Si ta DB utilise created_by, on filtre.
      // Sinon tu peux enlever ce filtre plus tard.
      return base44.entities.Drawing.filter({ created_by: createdBy }, '-created_date');
    },
  });

  const { data: albums = [], isLoading: albumsLoading } = useQuery({
    queryKey: ['albums', createdBy],
    enabled: !!createdBy,
    queryFn: async () => {
      return base44.entities.Album.filter({ created_by: createdBy }, '-created_date');
    },
  });

  const { data: children = [] } = useQuery({
    queryKey: ['children', createdBy],
    enabled: !!createdBy,
    queryFn: async () => {
      return base44.entities.Child.filter({ created_by: createdBy });
    },
  });

  const filteredDrawings = drawings.filter(
    (d) =>
      d.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.child_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDrawingsCount = (albumId) => drawings.filter((d) => d.album_id === albumId).length;

  const stats = [
    { icon: ImageIcon, title: 'Dessins', value: drawings.length, color: 'from-rose-400 to-pink-500' },
    { icon: Folder, title: 'Albums', value: albums.length, color: 'from-amber-400 to-orange-500' },
    { icon: Users, title: 'Enfants', value: [...new Set(drawings.map((d) => d.child_name))].length, color: 'from-sky-400 to-blue-500' },
    { icon: Sparkles, title: 'Transformations IA', value: drawings.filter((d) => d.enhanced_image_url).length, color: 'from-violet-400 to-purple-500' },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
      </div>
    );
  }

  // Si createdBy est vide, on affiche une alerte claire au lieu de faire “comme si”
  if (!createdBy) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Problème de compte</h2>
          <p className="text-gray-600 mb-4">
            Je n’arrive pas à déterminer ton identifiant utilisateur (email/id). Du coup, tes filtres
            `created_by` ne peuvent pas fonctionner.
          </p>
          <p className="text-sm text-gray-500">
            Ouvre la console et regarde le log <code>[auth.me] userData</code> pour voir quel champ contient l’email/id.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Bonjour,{' '}
              <span className="font-handwritten text-4xl bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
                {user.full_name?.split(' ')[0] || 'Artiste'}
              </span>{' '}
              👋
            </h1>
            <p className="text-gray-500 mt-1">Gérez les chefs-d'œuvre de vos petits artistes</p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setAlbumModalOpen(true)} className="rounded-xl">
              <Folder className="w-4 h-4 mr-2" />
              Nouvel album
            </Button>

            <Button
              onClick={() => setUploadModalOpen(true)}
              className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un dessin
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <StatsCard key={idx} {...stat} delay={idx * 0.1} />
          ))}
        </div>

        <Tabs defaultValue="drawings" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="bg-white/80 backdrop-blur p-1 rounded-xl shadow-sm">
              <TabsTrigger value="drawings" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-100 data-[state=active]:to-amber-100">
                <ImageIcon className="w-4 h-4 mr-2" />
                Dessins
              </TabsTrigger>
              <TabsTrigger value="albums" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-100 data-[state=active]:to-amber-100">
                <Folder className="w-4 h-4 mr-2" />
                Albums
              </TabsTrigger>
              <TabsTrigger value="evolution" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-100 data-[state=active]:to-amber-100">
                <TrendingUp className="w-4 h-4 mr-2" />
                Évolution
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl bg-white/80 backdrop-blur w-full sm:w-64"
                />
              </div>

              <div className="flex bg-white/80 backdrop-blur rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-rose-100 text-rose-600' : 'text-gray-400'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-rose-100 text-rose-600' : 'text-gray-400'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <TabsContent value="drawings" className="mt-0">
            {drawingsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1,2,3,4,5,6,7,8].map((i) => (
                  <div key={i} className="aspect-square bg-white/50 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredDrawings.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-white/50 rounded-2xl">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center mb-4">
                  <ImageIcon className="w-10 h-10 text-rose-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun dessin pour le moment</h3>
                <p className="text-gray-500 mb-6">Commencez à créer la galerie de vos enfants</p>
                <Button onClick={() => setUploadModalOpen(true)} className="bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter le premier dessin
                </Button>
              </motion.div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-4'}>
                {filteredDrawings.map((drawing, idx) => (
                  <DrawingCard key={drawing.id} drawing={drawing} onClick={setSelectedDrawing} delay={idx * 0.05} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="albums" className="mt-0">
            {albumsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3].map((i) => (
                  <div key={i} className="aspect-video bg-white/50 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : albums.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-white/50 rounded-2xl">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center mb-4">
                  <Folder className="w-10 h-10 text-rose-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Pas encore d'album</h3>
                <p className="text-gray-500 mb-6">Organisez les dessins par enfant ou par année</p>
                <Button onClick={() => setAlbumModalOpen(true)} className="bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un album
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {albums.map((album, idx) => (
                  <AlbumCard key={album.id} album={album} drawingsCount={getDrawingsCount(album.id)} delay={idx * 0.1} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="evolution" className="mt-0">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/80 backdrop-blur rounded-2xl p-8 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mb-4">
                <TrendingUp className="w-10 h-10 text-violet-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Timeline d'évolution</h3>
              <p className="text-gray-500 mb-4 max-w-md mx-auto">
                Ajoutez plus de dessins avec des dates pour voir l'évolution artistique de vos enfants au fil du temps
              </p>

              {drawings.filter((d) => d.drawing_date).length > 0 && (
                <div className="mt-8 space-y-4">
                  {drawings
                    .filter((d) => d.drawing_date)
                    .sort((a, b) => new Date(a.drawing_date) - new Date(b.drawing_date))
                    .map((drawing, idx) => (
                      <motion.div
                        key={drawing.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedDrawing(drawing)}
                      >
                        <img
                          src={drawing.enhanced_image_url || drawing.image_url}
                          alt={drawing.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 text-left">
                          <h4 className="font-semibold text-gray-800">{drawing.title}</h4>
                          <p className="text-sm text-gray-500">
                            {drawing.child_name} - {drawing.child_age ? `${drawing.child_age} ans` : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-rose-500">
                            {new Date(drawing.drawing_date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
	<UploadModal
  open={uploadModalOpen}
  onClose={() => setUploadModalOpen(false)}
  albums={albums}
  createdBy={createdBy}
  onSuccess={() => queryClient.invalidateQueries({ queryKey: ['drawings', createdBy] })}
/>

<CreateAlbumModal
  open={albumModalOpen}
  onClose={() => setAlbumModalOpen(false)}
  children={children}
  createdBy={createdBy}
  onSuccess={() => queryClient.invalidateQueries({ queryKey: ['albums', createdBy] })}
/>
      <DrawingDetailModal drawing={selectedDrawing} onClose={() => setSelectedDrawing(null)} />
    </div>
  );
}

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Search, 
  Filter,
  Sparkles,
  TrendingUp,
  Clock,
  Eye
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import DrawingDetailModal from '@/Components/ui/dashboard/DrawingDetailModal';

export default function Gallery() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const queryClient = useQueryClient();

  const { data: drawings = [], isLoading } = useQuery({
    queryKey: ['publicDrawings'],
    queryFn: () => base44.entities.Drawing.filter({ is_public: true }, '-created_date')
  });

  const voteMutation = useMutation({
    mutationFn: async (drawing) => {
      await base44.entities.Drawing.update(drawing.id, { votes: (drawing.votes || 0) + 1 });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['publicDrawings'] })
  });

  const categories = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'portrait', label: 'Portrait' },
    { value: 'paysage', label: 'Paysage' },
    { value: 'animal', label: 'Animal' },
    { value: 'abstrait', label: 'Abstrait' },
    { value: 'famille', label: 'Famille' },
    { value: 'imaginaire', label: 'Imaginaire' },
    { value: 'nature', label: 'Nature' }
  ];

  const filteredDrawings = drawings
    .filter(d => {
      const matchesSearch = d.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           d.child_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === 'all' || d.category === category;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return (b.votes || 0) - (a.votes || 0);
      return new Date(b.created_date) - new Date(a.created_date);
    });

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Galerie <span className="font-handwritten text-4xl sm:text-5xl bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">Publique</span>
          </h1>
          <p className="text-gray-500">Découvrez les créations de nos petits artistes</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/80 backdrop-blur rounded-2xl p-4 shadow-lg"
        >
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Rechercher un dessin ou un artiste..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl bg-white border-gray-200 h-12"
            />
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-48 rounded-xl h-12">
                <Filter className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex bg-white rounded-xl p-1 border">
              <button
                onClick={() => setSortBy('recent')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  sortBy === 'recent' ? 'bg-rose-100 text-rose-600' : 'text-gray-500'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Récents</span>
              </button>
              <button
                onClick={() => setSortBy('popular')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  sortBy === 'popular' ? 'bg-rose-100 text-rose-600' : 'text-gray-500'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Populaires</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-square bg-white/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredDrawings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white/50 rounded-2xl"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center mb-4">
              <Sparkles className="w-10 h-10 text-rose-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun dessin trouvé</h3>
            <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredDrawings.map((drawing, idx) => (
              <motion.div
                key={drawing.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="group bg-white/80 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <div className="aspect-square relative overflow-hidden">
                    <img 
                      src={drawing.enhanced_image_url || drawing.image_url} 
                      alt={drawing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                      onClick={() => setSelectedDrawing(drawing)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {drawing.enhanced_image_url && (
                      <div className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-white" />
                        <span className="text-xs text-white font-medium">IA</span>
                      </div>
                    )}
                    
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setSelectedDrawing(drawing)}
                        className="p-2 bg-white/90 backdrop-blur rounded-full hover:bg-white transition-colors"
                      >
                        <Eye className="w-4 h-4 text-gray-700" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          voteMutation.mutate(drawing);
                        }}
                        className="p-2 bg-white/90 backdrop-blur rounded-full hover:bg-white transition-colors group/heart"
                      >
                        <Heart className="w-4 h-4 text-rose-500 group-hover/heart:fill-rose-500 transition-all" />
                      </button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-1 truncate">{drawing.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {drawing.child_name}{drawing.child_age ? `, ${drawing.child_age} ans` : ''}
                      </span>
                      <div className="flex items-center gap-1 text-rose-500">
                        <Heart className="w-4 h-4 fill-rose-500" />
                        <span className="text-sm font-medium">{drawing.votes || 0}</span>
                      </div>
                    </div>
                    {drawing.category && (
                      <Badge 
                        variant="outline" 
                        className="mt-2 text-xs border-rose-200 text-rose-600"
                      >
                        {drawing.category}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <DrawingDetailModal
        drawing={selectedDrawing}
        onClose={() => setSelectedDrawing(null)}
      />
    </div>
  );
}

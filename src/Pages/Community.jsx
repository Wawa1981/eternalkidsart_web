import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Users, 
  Heart, 
  MessageCircle, 
  Trophy,
  Sparkles,
  Search,
  Star,
  TrendingUp
} from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';

export default function Community() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: drawings = [], isLoading } = useQuery({
    queryKey: ['communityDrawings'],
    queryFn: () => base44.entities.Drawing.filter({ is_public: true }, '-votes', 50)
  });

  // Group by child to create "artist profiles"
  const artists = drawings.reduce((acc, drawing) => {
    const key = drawing.child_name;
    if (!acc[key]) {
      acc[key] = {
        name: drawing.child_name,
        drawings: [],
        totalVotes: 0
      };
    }
    acc[key].drawings.push(drawing);
    acc[key].totalVotes += drawing.votes || 0;
    return acc;
  }, {});

  const sortedArtists = Object.values(artists)
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .filter(artist => 
      artist.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const topDrawings = [...drawings].sort((a, b) => (b.votes || 0) - (a.votes || 0)).slice(0, 10);

  const challenges = [
    {
      title: "Ma famille",
      description: "Dessine ta famille avec tous ceux que tu aimes",
      endDate: "15 février 2024",
      participants: 124,
      color: "from-rose-400 to-pink-500"
    },
    {
      title: "Mon animal préféré",
      description: "Représente l'animal que tu préfères",
      endDate: "1 mars 2024",
      participants: 89,
      color: "from-amber-400 to-orange-500"
    },
    {
      title: "Le printemps",
      description: "Célèbre l'arrivée des beaux jours",
      endDate: "21 mars 2024",
      participants: 56,
      color: "from-emerald-400 to-green-500"
    }
  ];

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
            <span className="font-handwritten text-4xl sm:text-5xl bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">Communauté</span>
          </h1>
          <p className="text-gray-500">Découvrez nos petits artistes et leurs créations</p>
        </motion.div>

        <Tabs defaultValue="artists" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <TabsList className="bg-white/80 backdrop-blur p-1 rounded-xl shadow-sm">
              <TabsTrigger value="artists" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-100 data-[state=active]:to-purple-100">
                <Users className="w-4 h-4 mr-2" />
                Artistes
              </TabsTrigger>
              <TabsTrigger value="challenges" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-100 data-[state=active]:to-purple-100">
                <Trophy className="w-4 h-4 mr-2" />
                Défis
              </TabsTrigger>
              <TabsTrigger value="top" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-100 data-[state=active]:to-purple-100">
                <TrendingUp className="w-4 h-4 mr-2" />
                Top 10
              </TabsTrigger>
            </TabsList>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl bg-white/80 backdrop-blur"
              />
            </div>
          </div>

          <TabsContent value="artists" className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-64 bg-white/50 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : sortedArtists.length === 0 ? (
              <div className="text-center py-16 bg-white/50 rounded-2xl">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">Aucun artiste trouvé</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedArtists.map((artist, idx) => (
                  <motion.div
                    key={artist.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="bg-white/80 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                      <CardContent className="p-0">
                        {/* Artist Header */}
                        <div className="relative h-32 bg-gradient-to-br from-violet-400 to-purple-500 p-4">
                          <div className="absolute -bottom-10 left-4">
                            <div className="w-20 h-20 rounded-full bg-white p-1 shadow-lg">
                              <div className="w-full h-full rounded-full bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center">
                                <span className="text-2xl font-bold text-rose-500">
                                  {artist.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>
                          {idx < 3 && (
                            <Badge className="absolute top-4 right-4 bg-amber-400 text-white">
                              <Trophy className="w-3 h-3 mr-1" />
                              Top {idx + 1}
                            </Badge>
                          )}
                        </div>

                        {/* Artist Info */}
                        <div className="pt-12 p-4">
                          <h3 className="text-xl font-bold text-gray-800">{artist.name}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-4 h-4" />
                              {artist.drawings.length} œuvres
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-4 h-4 text-rose-500" />
                              {artist.totalVotes} j'aime
                            </span>
                          </div>

                          {/* Preview Images */}
                          <div className="flex gap-2 mt-4">
                            {artist.drawings.slice(0, 4).map((drawing, i) => (
                              <div key={drawing.id} className="w-12 h-12 rounded-lg overflow-hidden">
                                <img 
                                  src={drawing.enhanced_image_url || drawing.image_url}
                                  alt={drawing.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                            {artist.drawings.length > 4 && (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                                +{artist.drawings.length - 4}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="challenges" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {challenges.map((challenge, idx) => (
                <motion.div
                  key={challenge.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-white/80 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden group cursor-pointer">
                    <CardContent className="p-0">
                      <div className={`h-32 bg-gradient-to-br ${challenge.color} p-6 flex items-end`}>
                        <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Trophy className="w-7 h-7 text-white" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{challenge.title}</h3>
                        <p className="text-sm text-gray-500 mb-3">{challenge.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Fin: {challenge.endDate}</span>
                          <Badge variant="outline" className="border-violet-200 text-violet-600">
                            <Users className="w-3 h-3 mr-1" />
                            {challenge.participants} participants
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="top" className="mt-0">
            <div className="space-y-4">
              {topDrawings.map((drawing, idx) => (
                <motion.div
                  key={drawing.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-white/80 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                          idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-amber-700' : 'bg-gray-300'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="w-16 h-16 rounded-xl overflow-hidden">
                          <img 
                            src={drawing.enhanced_image_url || drawing.image_url}
                            alt={drawing.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{drawing.title}</h3>
                          <p className="text-sm text-gray-500">par {drawing.child_name}</p>
                        </div>
                        <div className="flex items-center gap-1 text-rose-500">
                          <Heart className="w-5 h-5 fill-rose-500" />
                          <span className="font-bold">{drawing.votes || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Image as ImageIcon,
  Shirt,
  Coffee,
  BookOpen,
  Frame,
  Sparkles,
  Check,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';

export default function Shop() {
  const [user, setUser] = useState(null);
  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        // User not logged in
      }
    };
    loadUser();
  }, []);

  const { data: drawings = [] } = useQuery({
    queryKey: ['shopDrawings'],
    queryFn: () => base44.entities.Drawing.filter({ created_by: user?.email }, '-created_date'),
    enabled: !!user
  });

  const products = [
    {
      id: 'poster',
      name: 'Affiche Premium',
      description: 'Impression haute qualité sur papier mat 300g',
      icon: Frame,
      sizes: ['A4 (21x29,7cm)', 'A3 (29,7x42cm)', 'A2 (42x59,4cm)'],
      prices: [19.90, 29.90, 49.90],
      color: 'from-rose-400 to-pink-500'
    },
    {
      id: 'canvas',
      name: 'Toile Canvas',
      description: 'Toile tendue sur châssis bois',
      icon: ImageIcon,
      sizes: ['30x30cm', '40x40cm', '60x60cm'],
      prices: [39.90, 59.90, 89.90],
      color: 'from-amber-400 to-orange-500'
    },
    {
      id: 'mug',
      name: 'Mug Personnalisé',
      description: 'Mug céramique 330ml, compatible lave-vaisselle',
      icon: Coffee,
      sizes: ['Standard'],
      prices: [14.90],
      color: 'from-sky-400 to-blue-500'
    },
    {
      id: 'tshirt',
      name: 'T-Shirt Enfant',
      description: 'T-shirt 100% coton bio, impression DTG',
      icon: Shirt,
      sizes: ['2-4 ans', '4-6 ans', '6-8 ans', '8-10 ans'],
      prices: [24.90, 24.90, 24.90, 24.90],
      color: 'from-emerald-400 to-green-500'
    },
    {
      id: 'book',
      name: 'Livre d\'Art',
      description: 'Compilation de dessins en livre relié',
      icon: BookOpen,
      sizes: ['20 pages', '40 pages', '60 pages'],
      prices: [34.90, 54.90, 74.90],
      color: 'from-violet-400 to-purple-500'
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
            <span className="font-handwritten text-4xl sm:text-5xl bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">Boutique</span> Créative
          </h1>
          <p className="text-gray-500">Transformez les dessins en objets uniques</p>
        </motion.div>

        {/* Product Selection */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, idx) => {
            const Icon = product.icon;
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card 
                  className={`bg-white/80 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden ${
                    selectedProduct?.id === product.id ? 'ring-2 ring-rose-400' : ''
                  }`}
                  onClick={() => setSelectedProduct(product)}
                >
                  <CardContent className="p-0">
                    <div className={`h-32 bg-gradient-to-br ${product.color} p-6 flex items-end justify-between`}>
                      <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-white font-bold text-xl">
                        à partir de {product.prices[0]}€
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{product.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                        </div>
                        {selectedProduct?.id === product.id && (
                          <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {product.sizes.map(size => (
                          <Badge key={size} variant="outline" className="text-xs">
                            {size}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Order Section */}
        {user && drawings.length > 0 && selectedProduct && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-xl"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Personnaliser votre {selectedProduct.name}</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Drawing Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choisissez un dessin
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {drawings.slice(0, 9).map(drawing => (
                    <button
                      key={drawing.id}
                      onClick={() => setSelectedDrawing(drawing)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        selectedDrawing?.id === drawing.id 
                          ? 'border-rose-500 scale-105 shadow-lg' 
                          : 'border-transparent hover:border-rose-200'
                      }`}
                    >
                      <img 
                        src={drawing.enhanced_image_url || drawing.image_url}
                        alt={drawing.title}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview & Options */}
              <div>
                <div className="bg-gray-50 rounded-2xl p-6 mb-4">
                  {selectedDrawing ? (
                    <div className="text-center">
                      <div className="relative inline-block">
                        <img 
                          src={selectedDrawing.enhanced_image_url || selectedDrawing.image_url}
                          alt={selectedDrawing.title}
                          className="max-h-48 rounded-xl shadow-lg mx-auto"
                        />
                        {selectedDrawing.enhanced_image_url && (
                          <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-violet-500 to-purple-500">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Version IA
                          </Badge>
                        )}
                      </div>
                      <p className="mt-3 font-medium text-gray-700">{selectedDrawing.title}</p>
                      <p className="text-sm text-gray-500">par {selectedDrawing.child_name}</p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                      <p>Sélectionnez un dessin</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Taille / Format</label>
                    <Select>
                      <SelectTrigger className="w-full rounded-xl">
                        <SelectValue placeholder="Choisir une taille" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedProduct.sizes.map((size, idx) => (
                          <SelectItem key={size} value={size}>
                            {size} - {selectedProduct.prices[idx]}€
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    disabled={!selectedDrawing}
                    className="w-full bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-xl h-14 text-lg"
                  >
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Ajouter au panier
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* NFT Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-3xl p-8 text-white text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 border-4 border-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-60 h-60 border-4 border-white rounded-full translate-x-1/2 translate-y-1/2" />
          </div>
          
          <div className="relative">
            <Badge className="bg-white/20 text-white mb-4">Bientôt disponible</Badge>
            <h2 className="text-3xl font-bold mb-2">NFT Kids Art</h2>
            <p className="text-white/80 max-w-lg mx-auto mb-6">
              Transformez les dessins de vos enfants en œuvres d'art numériques uniques et certifiées sur la blockchain
            </p>
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-xl"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              M'avertir du lancement
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

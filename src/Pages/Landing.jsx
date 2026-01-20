import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Upload, 
  Image, 
  Users, 
  ShoppingBag, 
  Star,
  ArrowRight,
  Play,
  Heart,
  Palette,
  Wand2,
  Crown,
  Zap
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';

export default function Landing() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const features = [
    {
      icon: Upload,
      title: "Upload Intelligent",
      description: "Importez les dessins de vos enfants et laissez notre IA les sublimer",
      color: "from-rose-400 to-pink-500"
    },
    {
      icon: Sparkles,
      title: "Musée Virtuel 3D",
      description: "Exposez les œuvres dans une galerie immersive personnalisable",
      color: "from-violet-400 to-purple-500"
    },
    {
      icon: Wand2,
      title: "Transformation IA",
      description: "Transformez les dessins en versions HD artistiques époustouflantes",
      color: "from-amber-400 to-orange-500"
    },
    {
      icon: Users,
      title: "Communauté",
      description: "Partagez et découvrez les créations d'autres petits artistes",
      color: "from-sky-400 to-blue-500"
    },
    {
      icon: ShoppingBag,
      title: "Boutique Créative",
      description: "Imprimez les dessins sur mugs, t-shirts et affiches",
      color: "from-emerald-400 to-green-500"
    },
    {
      icon: Crown,
      title: "NFT Kids Art",
      description: "Tokenisez les œuvres pour créer des souvenirs numériques uniques",
      color: "from-fuchsia-400 to-pink-500"
    }
  ];

  const testimonials = [
    {
      name: "Marie L.",
      role: "Maman de Lucas, 6 ans",
      content: "Les dessins de mon fils sont maintenant exposés dans un musée virtuel magnifique. Il est tellement fier !",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
    },
    {
      name: "Thomas D.",
      role: "Papa d'Emma, 4 ans",
      content: "L'IA a transformé le dessin d'Emma en une œuvre d'art incroyable. On l'a imprimé sur une toile !",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
    },
    {
      name: "Sophie M.",
      role: "Maman de Léa et Tom",
      content: "La timeline d'évolution artistique est géniale. On voit les progrès de nos enfants au fil des années.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
    }
  ];

  const sampleDrawings = [
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1499892477393-f675706cbe6e?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=400&h=400&fit=crop"
  ];

  return (
    <div className="min-h-screen">
      {/* Floating Header for Landing */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-300 to-amber-300 flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <span className="font-handwritten text-2xl font-bold bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
                Dessins Éternels
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {user ? (
                <Link to={createPageUrl('Dashboard')}>
                  <Button className="bg-gradient-to-r from-rose-400 to-amber-400 hover:from-rose-500 hover:to-amber-500 text-white rounded-full">
                    Mon Espace
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => base44.auth.redirectToLogin()}
                    className="text-gray-600 hidden sm:flex"
                  >
                    Se connecter
                  </Button>
                  <Button
                    onClick={() => base44.auth.redirectToLogin()}
                    className="bg-gradient-to-r from-rose-400 to-amber-400 hover:from-rose-500 hover:to-amber-500 text-white rounded-full"
                  >
                    Créer un compte
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200/30 rounded-full blur-3xl" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-sky-200/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur rounded-full border border-rose-200 mb-6">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-gray-700">La magie de l'art enfantin préservée</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                  Transformez les dessins
                </span>
                <br />
                <span className="text-gray-800">de vos enfants en</span>
                <br />
                <span className="font-handwritten text-5xl sm:text-6xl lg:text-7xl bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">
                  souvenirs éternels
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
                Créez une galerie d'art unique pour chaque enfant. Sublimez leurs œuvres avec l'IA, 
                exposez-les dans un musée virtuel et imprimez-les sur vos objets préférés.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  onClick={() => base44.auth.redirectToLogin()}
                  className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-full px-8 h-14 text-lg shadow-lg shadow-rose-500/25"
                >
                  Commencer gratuitement
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 h-14 text-lg border-2 border-gray-200 hover:border-rose-300 hover:bg-rose-50"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Voir la démo
                </Button>
              </div>
              
              <div className="flex items-center gap-6 mt-8 justify-center lg:justify-start">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                      <img 
                        src={`https://images.unsplash.com/photo-${1500000000000 + i * 10000000000}?w=100&h=100&fit=crop`}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=User${i}&background=FFD6E0`}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">+2,500 familles conquises</p>
                </div>
              </div>
            </motion.div>

            {/* Hero Image Gallery */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4 p-4">
                {sampleDrawings.map((img, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className={`relative rounded-2xl overflow-hidden shadow-xl ${
                      idx % 2 === 0 ? 'mt-8' : ''
                    }`}
                  >
                    <div className="aspect-square">
                      <img 
                        src={img} 
                        alt={`Exemple de dessin ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <div className="px-2 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-medium text-gray-700">
                        {['Lucas, 6 ans', 'Emma, 4 ans', 'Léa, 7 ans', 'Tom, 5 ans'][idx]}
                      </div>
                    </div>
                    <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full">
                      <Heart className="w-4 h-4 text-rose-500" />
                    </button>
                  </motion.div>
                ))}
              </div>
              
              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-2xl shadow-xl p-4 hidden lg:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                    <Wand2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">IA Créative</p>
                    <p className="text-xs text-gray-500">Transformation HD</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              Tout ce dont vous avez besoin pour
              <span className="font-handwritten text-4xl sm:text-5xl block mt-2 bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
                immortaliser la créativité
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Des outils puissants et intuitifs pour transformer chaque coup de crayon en un souvenir précieux
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="h-full bg-white/80 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
                    <CardContent className="p-6">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              Ce que disent les
              <span className="font-handwritten text-4xl sm:text-5xl ml-2 bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">
                familles
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full bg-white border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-gray-800">{testimonial.name}</p>
                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500 rounded-3xl p-8 sm:p-12 text-center overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 border-4 border-white rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-60 h-60 border-4 border-white rounded-full translate-x-1/2 translate-y-1/2" />
            </div>
            
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Prêt à immortaliser les créations de vos enfants ?
              </h2>
              <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto">
                Rejoignez des milliers de familles qui préservent la magie de l'enfance
              </p>
              <Button
                size="lg"
                onClick={() => base44.auth.redirectToLogin()}
                className="bg-white text-rose-600 hover:bg-gray-100 rounded-full px-8 h-14 text-lg font-semibold shadow-lg"
              >
                Commencer maintenant
                <Zap className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-rose-100 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-300 to-amber-300 flex items-center justify-center">
                <Palette className="w-4 h-4 text-white" />
              </div>
              <span className="font-handwritten text-xl font-bold text-gray-700">Dessins Éternels</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2024 Dessins Éternels. Tous droits réservés.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-sm text-gray-500 hover:text-rose-500">Confidentialité</a>
              <a href="#" className="text-sm text-gray-500 hover:text-rose-500">Conditions</a>
              <a href="#" className="text-sm text-gray-500 hover:text-rose-500">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

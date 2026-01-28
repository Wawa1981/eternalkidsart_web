import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Sparkles, 
  Rocket, 
  Gamepad2, 
  Monitor,
  Code,
  Cpu,
  Stars
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import DrawingCanvas from '@/Components/ui/paint/DrawingCanvas';
import TutorialCard from '@/Components/ui/paint/TutorialCard';

export default function PaintStudio() {
  const tutorials = {
    informatique: [
      {
        title: "Découvrir le clavier et la souris",
        description: "Apprends à utiliser ton ordinateur comme un pro ! Clics, double-clics et raccourcis clavier.",
        thumbnail: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop",
        duration: "10 min",
        level: "Débutant",
        isPopular: true
      },
      {
        title: "Créer ton premier fichier",
        description: "Apprends à créer, sauvegarder et organiser tes fichiers et dossiers sur l'ordinateur.",
        thumbnail: "https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=400&h=300&fit=crop",
        duration: "8 min",
        level: "Débutant"
      },
      {
        title: "Internet et navigation sécurisée",
        description: "Découvre comment utiliser Internet en toute sécurité et trouver des informations fiables.",
        thumbnail: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop",
        duration: "15 min",
        level: "Débutant",
        isPopular: true
      },
      {
        title: "Les bases du codage",
        description: "Initie-toi à la programmation avec Scratch ! Crée ton premier jeu interactif.",
        thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=300&fit=crop",
        duration: "20 min",
        level: "Intermédiaire"
      },
      {
        title: "Créer une présentation PowerPoint",
        description: "Apprends à faire des présentations colorées et animées pour tes exposés !",
        thumbnail: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=300&fit=crop",
        duration: "12 min",
        level: "Intermédiaire"
      },
      {
        title: "Utiliser les raccourcis clavier",
        description: "Deviens super rapide avec les raccourcis magiques : Ctrl+C, Ctrl+V et bien plus !",
        thumbnail: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop",
        duration: "10 min",
        level: "Intermédiaire"
      }
    ],
    roblox: [
      {
        title: "Débuter sur Roblox",
        description: "Crée ton compte, personnalise ton avatar et explore les meilleurs jeux de Roblox !",
        thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop",
        duration: "12 min",
        level: "Débutant",
        isPopular: true
      },
      {
        title: "Créer ton premier jeu dans Roblox Studio",
        description: "Apprends les bases de Roblox Studio et construis ton premier Obby (parcours d'obstacles) !",
        thumbnail: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=300&fit=crop",
        duration: "25 min",
        level: "Débutant",
        isPopular: true
      },
      {
        title: "Les bases du scripting Lua",
        description: "Découvre le langage Lua et ajoute de l'interactivité à ton jeu Roblox !",
        thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop",
        duration: "30 min",
        level: "Intermédiaire"
      },
      {
        title: "Créer des effets visuels",
        description: "Ajoute des particules, des lumières et des effets spéciaux à ton jeu !",
        thumbnail: "https://images.unsplash.com/photo-1614294149010-950b698f72c0?w=400&h=300&fit=crop",
        duration: "18 min",
        level: "Intermédiaire"
      },
      {
        title: "Monétiser ton jeu Roblox",
        description: "Apprends comment gagner des Robux avec ton jeu et créer des Game Passes.",
        thumbnail: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop",
        duration: "22 min",
        level: "Avancé",
        isPopular: true
      },
      {
        title: "Créer un système de combat",
        description: "Développe un système de combat avec des armes, des dégâts et des animations !",
        thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
        duration: "35 min",
        level: "Avancé"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 py-12 px-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-xl shadow-cyan-500/50 animate-pulse">
              <Palette className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Paint Studio
            </h1>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-purple-500/50 animate-pulse" style={{ animationDelay: '0.5s' }}>
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            🚀 Crée tes œuvres d'art numériques et découvre le monde du code et de Roblox !
          </p>
        </motion.div>

        {/* Drawing Canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-16"
        >
          <DrawingCanvas />
        </motion.div>

        {/* Tutorials Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Rocket className="w-8 h-8 text-cyan-400" />
            <h2 className="text-3xl font-bold text-white">
              Tutoriels Futuristes
            </h2>
            <Stars className="w-8 h-8 text-purple-400" />
          </div>

          <Tabs defaultValue="informatique" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 backdrop-blur-lg border border-cyan-500/20 h-14 rounded-2xl">
              <TabsTrigger 
                value="informatique"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white text-gray-400"
              >
                <Monitor className="w-5 h-5 mr-2" />
                Initiation Informatique
              </TabsTrigger>
              <TabsTrigger 
                value="roblox"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-gray-400"
              >
                <Gamepad2 className="w-5 h-5 mr-2" />
                Roblox Studio
              </TabsTrigger>
            </TabsList>

            <TabsContent value="informatique" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tutorials.informatique.map((tutorial, index) => (
                  <TutorialCard key={index} tutorial={tutorial} index={index} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="roblox" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tutorials.roblox.map((tutorial, index) => (
                  <TutorialCard key={index} tutorial={tutorial} index={index} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Fun Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-lg border border-cyan-500/20 rounded-2xl p-6 text-center">
            <Code className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
            <h3 className="text-3xl font-bold text-white mb-2">12+</h3>
            <p className="text-gray-400">Tutoriels disponibles</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-lg border border-purple-500/20 rounded-2xl p-6 text-center">
            <Cpu className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <h3 className="text-3xl font-bold text-white mb-2">100%</h3>
            <p className="text-gray-400">Gratuit et amusant</p>
          </div>
          <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 backdrop-blur-lg border border-pink-500/20 rounded-2xl p-6 text-center">
            <Sparkles className="w-12 h-12 text-pink-400 mx-auto mb-3" />
            <h3 className="text-3xl font-bold text-white mb-2">∞</h3>
            <p className="text-gray-400">Créativité sans limite</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

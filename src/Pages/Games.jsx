import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { 
  Dices, 
  Gamepad2, 
  Heart, 
  Spade, 
  Trophy,
  Sparkles,
  Star,
  Smile
} from 'lucide-react';
import MemoryGame from '../Components/ui/games/MemoryGame';
import MathGame from '../Components/ui/games/MathGame';
import QuizGame from '../Components/ui/games/QuizGame';
import TicTacToe from "@/Components/ui/games/TicTacToe";
import WordGame from "@/Components/ui/games/WordGame";
import CardGame from "@/Components/ui/games/Cardgame";

export default function GamesPage() {
  const [selectedGame, setSelectedGame] = useState(null);

  const games = [
    {
      id: 'memory',
      name: 'Jeu de Mémoire',
      icon: Star,
      description: 'Trouve les paires de cartes identiques (3-6 ans)',
      color: 'from-pink-400 to-rose-400',
      component: MemoryGame
    },
    {
      id: 'tictactoe',
      name: 'Morpion',
      icon: Trophy,
      description: 'Aligne 3 symboles pour gagner (5-8 ans)',
      color: 'from-purple-400 to-violet-400',
      component: TicTacToe
    },
    {
      id: 'cards',
      name: 'Bataille de Cartes',
      icon: Heart,
      description: 'Joue à la bataille contre l\'ordinateur (4-7 ans)',
      color: 'from-red-400 to-pink-400',
      component: CardGame
    },
    {
      id: 'math',
      name: 'Calcul Mental',
      icon: Sparkles,
      description: 'Résous des calculs mathématiques (7-12 ans)',
      color: 'from-blue-400 to-cyan-400',
      component: MathGame
    },
    {
      id: 'words',
      name: 'Le Pendu',
      icon: Gamepad2,
      description: 'Devine le mot lettre par lettre (8-14 ans)',
      color: 'from-green-400 to-emerald-400',
      component: WordGame
    },
    {
      id: 'quiz',
      name: 'Quiz Culture',
      icon: Dices,
      description: 'Teste tes connaissances générales (10-16 ans)',
      color: 'from-amber-400 to-orange-400',
      component: QuizGame
    }
  ];

  const selectedGameData = games.find(g => g.id === selectedGame);
  const GameComponent = selectedGameData?.component;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <Gamepad2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-handwritten bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 bg-clip-text text-transparent mb-3">
            Espace Jeux
          </h1>
          <p className="text-gray-600 text-lg">
            Amuse-toi avec nos jeux colorés et amusants ! 🎮
          </p>
        </motion.div>

        {selectedGame ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <Button
              onClick={() => setSelectedGame(null)}
              variant="outline"
              className="rounded-full"
            >
              ← Retour aux jeux
            </Button>
            
            <Card className="bg-white/90 backdrop-blur shadow-2xl border-2 border-purple-200">
              <CardHeader className={`bg-gradient-to-r ${selectedGameData.color} text-white rounded-t-xl`}>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  {React.createElement(selectedGameData.icon, { className: 'w-8 h-8' })}
                  {selectedGameData.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {GameComponent && <GameComponent />}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game, index) => {
              const Icon = game.icon;
              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-300 bg-white/80 backdrop-blur overflow-hidden"
                    onClick={() => setSelectedGame(game.id)}
                  >
                    <div className={`h-40 bg-gradient-to-br ${game.color} flex items-center justify-center relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                      <Icon className="w-20 h-20 text-white relative z-10 drop-shadow-lg" />
                      <div className="absolute top-2 right-2">
                        <Smile className="w-8 h-8 text-white/50" />
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-gray-800">
                        {game.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{game.description}</p>
                      <Button
                        className={`w-full bg-gradient-to-r ${game.color} text-white hover:opacity-90 rounded-full`}
                      >
                        Jouer maintenant
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

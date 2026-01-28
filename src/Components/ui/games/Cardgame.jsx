import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/Components/ui/button';
import { Heart, Diamond, Club, Spade, Trophy } from 'lucide-react';

const suits = [
  { name: 'hearts', icon: Heart, color: 'text-red-500' },
  { name: 'diamonds', icon: Diamond, color: 'text-red-500' },
  { name: 'clubs', icon: Club, color: 'text-gray-800' },
  { name: 'spades', icon: Spade, color: 'text-gray-800' }
];

const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export default function CardGame() {
  const [playerCard, setPlayerCard] = useState(null);
  const [computerCard, setComputerCard] = useState(null);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState({ player: 0, computer: 0 });
  const [playing, setPlaying] = useState(false);

  const drawCards = () => {
    setPlaying(true);
    const playerSuit = suits[Math.floor(Math.random() * suits.length)];
    const computerSuit = suits[Math.floor(Math.random() * suits.length)];
    const playerValue = values[Math.floor(Math.random() * values.length)];
    const computerValue = values[Math.floor(Math.random() * values.length)];

    const pCard = { suit: playerSuit, value: playerValue, numValue: values.indexOf(playerValue) };
    const cCard = { suit: computerSuit, value: computerValue, numValue: values.indexOf(computerValue) };

    setPlayerCard(pCard);
    setComputerCard(cCard);

    let gameResult;
    if (pCard.numValue > cCard.numValue) {
      gameResult = 'win';
      setScore({ ...score, player: score.player + 1 });
    } else if (pCard.numValue < cCard.numValue) {
      gameResult = 'lose';
      setScore({ ...score, computer: score.computer + 1 });
    } else {
      gameResult = 'draw';
    }
    setResult(gameResult);
  };

  const reset = () => {
    setPlayerCard(null);
    setComputerCard(null);
    setResult(null);
    setPlaying(false);
  };

  const renderCard = (card, label) => {
    if (!card) return null;
    const Icon = card.suit.icon;
    return (
      <motion.div
        initial={{ rotateY: 180 }}
        animate={{ rotateY: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-xl p-6 w-40 h-56 flex flex-col items-center justify-between border-2 border-gray-200"
      >
        <div className={`text-2xl font-bold ${card.suit.color}`}>
          {card.value}
        </div>
        <Icon className={`w-16 h-16 ${card.suit.color}`} />
        <div className={`text-2xl font-bold ${card.suit.color}`}>
          {card.value}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 text-center bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6">
        <div>
          <div className="text-3xl font-bold text-red-600">{score.player}</div>
          <div className="text-sm text-gray-600">Toi</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-600">{score.computer}</div>
          <div className="text-sm text-gray-600">Ordinateur</div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-8">
        <div className="text-center">
          {renderCard(playerCard, 'Toi')}
          <p className="mt-3 font-semibold text-gray-700">Ta carte</p>
        </div>

        <div className="text-3xl font-bold text-gray-400">VS</div>

        <div className="text-center">
          {renderCard(computerCard, 'Ordi')}
          <p className="mt-3 font-semibold text-gray-700">Carte ordi</p>
        </div>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`text-center p-6 rounded-xl ${
            result === 'win' ? 'bg-gradient-to-r from-green-100 to-emerald-100' :
            result === 'lose' ? 'bg-gradient-to-r from-red-100 to-pink-100' :
            'bg-gradient-to-r from-yellow-100 to-amber-100'
          }`}
        >
          <h3 className="text-2xl font-bold mb-2">
            {result === 'win' && '🎉 Tu as gagné !'}
            {result === 'lose' && '😢 L\'ordinateur gagne !'}
            {result === 'draw' && '🤝 Égalité !'}
          </h3>
        </motion.div>
      )}

      <div className="text-center">
        <Button
          onClick={result ? reset : drawCards}
          disabled={playing && !result}
          className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full px-8 py-6 text-lg"
        >
          {result ? 'Rejouer' : 'Tirer les cartes'}
        </Button>
      </div>
    </div>
  );
}

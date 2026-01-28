import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/Components/ui/button';
import { Trophy, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

const wordCategories = {
  animaux: ['ELEPHANT', 'GIRAFE', 'CROCODILE', 'PAPILLON', 'DAUPHIN', 'KANGOUROU', 'PINGOUIN'],
  pays: ['FRANCE', 'BELGIQUE', 'JAPON', 'BRESIL', 'AUSTRALIE', 'EGYPTE', 'MEXIQUE'],
  fruits: ['FRAISE', 'BANANE', 'ANANAS', 'MANGUE', 'CERISE', 'PASTEQUE', 'MYRTILLE'],
  metiers: ['DOCTEUR', 'POMPIER', 'CUISINIER', 'MUSICIEN', 'ASTRONAUTE', 'ARTISTE']
};

export default function WordGame() {
  const [category, setCategory] = useState('animaux');
  const [word, setWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState('playing');
  const [score, setScore] = useState(0);

  const maxWrongGuesses = 6;

  useEffect(() => {
    startNewGame();
  }, [category]);

  const startNewGame = () => {
    const words = wordCategories[category];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setWord(randomWord);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameStatus('playing');
  };

  const guessLetter = (letter) => {
    if (guessedLetters.includes(letter) || gameStatus !== 'playing') return;

    const newGuessed = [...guessedLetters, letter];
    setGuessedLetters(newGuessed);

    if (!word.includes(letter)) {
      const newWrong = wrongGuesses + 1;
      setWrongGuesses(newWrong);
      if (newWrong >= maxWrongGuesses) {
        setGameStatus('lost');
      }
    } else {
      const wordLetters = [...new Set(word.split(''))];
      const allGuessed = wordLetters.every(l => newGuessed.includes(l));
      if (allGuessed) {
        setGameStatus('won');
        setScore(score + 1);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    }
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const renderHangman = () => {
    const parts = [
      <circle key="head" cx="50" cy="25" r="10" stroke="currentColor" fill="none" strokeWidth="2" />,
      <line key="body" x1="50" y1="35" x2="50" y2="60" stroke="currentColor" strokeWidth="2" />,
      <line key="leftarm" x1="50" y1="45" x2="35" y2="50" stroke="currentColor" strokeWidth="2" />,
      <line key="rightarm" x1="50" y1="45" x2="65" y2="50" stroke="currentColor" strokeWidth="2" />,
      <line key="leftleg" x1="50" y1="60" x2="40" y2="80" stroke="currentColor" strokeWidth="2" />,
      <line key="rightleg" x1="50" y1="60" x2="60" y2="80" stroke="currentColor" strokeWidth="2" />
    ];
    
    return (
      <svg width="100" height="120" className="text-red-500">
        <line x1="10" y1="110" x2="90" y2="110" stroke="currentColor" strokeWidth="3" />
        <line x1="30" y1="110" x2="30" y2="10" stroke="currentColor" strokeWidth="3" />
        <line x1="30" y1="10" x2="50" y2="10" stroke="currentColor" strokeWidth="3" />
        <line x1="50" y1="10" x2="50" y2="15" stroke="currentColor" strokeWidth="2" />
        {parts.slice(0, wrongGuesses)}
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <span className="font-bold text-xl">{score} victoires</span>
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 rounded-xl border-2 border-green-300 font-semibold"
          disabled={gameStatus === 'playing' && guessedLetters.length > 0}
        >
          <option value="animaux">🐘 Animaux</option>
          <option value="pays">🌍 Pays</option>
          <option value="fruits">🍎 Fruits</option>
          <option value="metiers">👷 Métiers</option>
        </select>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex gap-1">
            {Array.from({ length: maxWrongGuesses }).map((_, i) => (
              <Heart
                key={i}
                className={`w-6 h-6 ${i < maxWrongGuesses - wrongGuesses ? 'text-red-500 fill-red-500' : 'text-gray-300'}`}
              />
            ))}
          </div>
        </div>
        {renderHangman()}
      </div>

      <div className="bg-white rounded-xl p-8 text-center">
        <div className="text-4xl font-bold tracking-wider mb-6 font-mono">
          {word.split('').map((letter, idx) => (
            <span key={idx} className="inline-block mx-1">
              {guessedLetters.includes(letter) ? letter : '_'}
            </span>
          ))}
        </div>

        {gameStatus === 'playing' && (
          <div className="grid grid-cols-7 gap-2">
            {alphabet.map(letter => (
              <Button
                key={letter}
                onClick={() => guessLetter(letter)}
                disabled={guessedLetters.includes(letter)}
                variant={guessedLetters.includes(letter) ? 'outline' : 'default'}
                className={`${
                  guessedLetters.includes(letter) 
                    ? word.includes(letter) 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-300 text-white'
                    : 'bg-gradient-to-r from-green-400 to-emerald-400 text-white'
                }`}
              >
                {letter}
              </Button>
            ))}
          </div>
        )}
      </div>

      {gameStatus !== 'playing' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`text-center p-6 rounded-xl ${
            gameStatus === 'won' 
              ? 'bg-gradient-to-r from-green-100 to-emerald-100'
              : 'bg-gradient-to-r from-red-100 to-pink-100'
          }`}
        >
          <Trophy className={`w-16 h-16 mx-auto mb-3 ${gameStatus === 'won' ? 'text-yellow-500' : 'text-gray-400'}`} />
          <h3 className="text-2xl font-bold mb-2">
            {gameStatus === 'won' ? '🎉 Bravo !' : '😢 Perdu !'}
          </h3>
          <p className="text-gray-700 mb-4">
            Le mot était : <span className="font-bold text-2xl">{word}</span>
          </p>
          <Button
            onClick={startNewGame}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full px-8"
          >
            Nouveau mot
          </Button>
        </motion.div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/Components/ui/button';
import { Heart, Star, Sparkles, Sun, Moon, Cloud, Zap, Trophy, Image as ImageIcon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const icons = [Heart, Star, Sparkles, Sun, Moon, Cloud, Zap, Trophy];

const levels = {
  facile: { pairs: 4, gridCols: 4, label: 'Facile (4 paires)' },
  moyen: { pairs: 6, gridCols: 4, label: 'Moyen (6 paires)' },
  difficile: { pairs: 8, gridCols: 4, label: 'Difficile (8 paires)' }
};

export default function MemoryGame() {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]); // cardId[]
  const [solved, setSolved] = useState([]);   // cardId[]
  const [moves, setMoves] = useState(0);
  const [level, setLevel] = useState('moyen');
  const [mode, setMode] = useState('icons'); // 'icons' | 'photos'
  const [isChecking, setIsChecking] = useState(false);

  // ⚠ Ne fetch que si mode photos
  const { data: drawings = [] } = useQuery({
    queryKey: ['drawings', 'memory-game'], // clé dédiée pour éviter des effets bizarres
    queryFn: () => base44.entities.Drawing.list('-created_date', 50),
    enabled: mode === 'photos',
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 0,
  });

  // On calcule si on PEUT jouer en mode photos (sinon fallback icônes)
  const numPairs = levels[level].pairs;
  const canUsePhotos = useMemo(() => mode === 'photos' && drawings.length >= numPairs, [mode, drawings.length, numPairs]);

  const initGame = (usePhotos) => {
    let gameItems;

    if (usePhotos) {
      const selectedDrawings = drawings.slice(0, numPairs).map(d => ({
        type: 'photo',
        url: d.image_url,
        id: d.id, // pairId
      }));
      gameItems = selectedDrawings;
    } else {
      const gameIcons = icons.slice(0, numPairs).map((icon, idx) => ({
        type: 'icon',
        icon,
        id: idx, // pairId
      }));
      gameItems = gameIcons;
    }

    const duplicated = [...gameItems, ...gameItems];

    // IMPORTANT : cardId unique + shuffle stable
    const shuffled = duplicated
      .map((item, index) => ({ ...item, cardId: index }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setFlipped([]);
    setSolved([]);
    setMoves(0);
    setIsChecking(false);
  };

  // ✅ Réinit uniquement quand level change OU quand mode change OU quand on vient d’avoir assez de photos
  useEffect(() => {
    if (mode === 'icons') {
      initGame(false);
      return;
    }
    // mode photos :
    if (canUsePhotos) {
      initGame(true);
    } else {
      // pas assez de photos → fallback icônes (mais on reste en mode photos, ça évite le crash)
      initGame(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, mode, canUsePhotos]); // ⚠ PAS "drawings" ici

  const handleClick = (cardId) => {
    if (isChecking) return;
    if (flipped.length === 2) return;
    if (flipped.includes(cardId)) return;
    if (solved.includes(cardId)) return;

    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setIsChecking(true);
      setMoves((m) => m + 1);

      const [first, second] = newFlipped;
      const firstCard = cards.find(c => c.cardId === first);
      const secondCard = cards.find(c => c.cardId === second);

      const match = firstCard && secondCard && firstCard.id === secondCard.id;

      if (match) {
        setSolved((prev) => [...prev, first, second]);

        // on laisse juste un mini délai pour rendre la flip visible
        setTimeout(() => {
          setFlipped([]);
          setIsChecking(false);
        }, 250);

        // victoire
        if (solved.length + 2 === cards.length) {
          setTimeout(() => {
            confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
          }, 350);
        }
      } else {
        setTimeout(() => {
          setFlipped([]);
          setIsChecking(false);
        }, 800);
      }
    }
  };

  const onNewGame = () => {
    if (mode === 'photos' && canUsePhotos) initGame(true);
    else initGame(false);
  };

  return (
    <div className="space-y-6">
      {/* Options de jeu */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Niveau</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.keys(levels).map(lvl => (
              <Button
                key={lvl}
                onClick={() => setLevel(lvl)}
                variant={level === lvl ? 'default' : 'outline'}
                size="sm"
                className={level === lvl ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : ''}
              >
                {lvl === 'facile' ? '😊' : lvl === 'moyen' ? '🤔' : '🤯'}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Mode</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => setMode('icons')}
              variant={mode === 'icons' ? 'default' : 'outline'}
              size="sm"
              className={mode === 'icons' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : ''}
            >
              <Star className="w-4 h-4 mr-1" />
              Icônes
            </Button>

            <Button
              onClick={() => setMode('photos')}
              variant={mode === 'photos' ? 'default' : 'outline'}
              size="sm"
              className={mode === 'photos' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : ''}
            >
              <ImageIcon className="w-4 h-4 mr-1" />
              Photos
            </Button>
          </div>

          {/* petit hint si pas assez de photos */}
          {mode === 'photos' && !canUsePhotos && (
            <p className="mt-2 text-xs text-gray-500">
              Pas assez de dessins pour ce niveau : on utilise des icônes pour l’instant.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
        <div className="text-lg font-semibold">
          Coups: <span className="text-purple-600">{moves}</span>
        </div>
        <Button onClick={onNewGame} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
          Nouvelle partie
        </Button>
      </div>

      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${levels[level].gridCols}, minmax(0, 1fr))` }}
      >
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.cardId) || solved.includes(card.cardId);
          const isSolved = solved.includes(card.cardId);

          return (
            <motion.div
              key={card.cardId}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleClick(card.cardId)}
              className="aspect-square cursor-pointer"
            >
              <div
                className={`relative w-full h-full rounded-xl transition-all duration-300 ${
                  isSolved ? 'opacity-50' : ''
                } shadow-lg hover:shadow-xl overflow-hidden`}
              >
                <div
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                    isFlipped
                      ? 'bg-gradient-to-br from-purple-400 to-pink-400'
                      : 'bg-gradient-to-br from-gray-300 to-gray-400'
                  }`}
                >
                  {isFlipped ? (
                    card.type === 'photo' ? (
                      <img src={card.url} alt="Dessin" className="w-full h-full object-cover" />
                    ) : (
                      React.createElement(card.icon, { className: 'w-12 h-12 text-white' })
                    )
                  ) : (
                    <div className="text-4xl">?</div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {solved.length === cards.length && cards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl"
        >
          <Trophy className="w-16 h-16 mx-auto mb-3 text-yellow-500" />
          <h3 className="text-2xl font-bold text-purple-700 mb-2">Bravo ! 🎉</h3>
          <p className="text-gray-700">Tu as gagné en {moves} coups !</p>
        </motion.div>
      )}
    </div>
  );
}

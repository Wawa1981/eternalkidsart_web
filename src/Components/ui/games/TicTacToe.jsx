import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/Components/ui/button';
import { Trophy, X as XIcon, Circle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [score, setScore] = useState({ X: 0, O: 0, draws: 0 });

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let line of lines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (i) => {
    if (board[i] || calculateWinner(board)) return;

    const newBoard = [...board];
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const winner = calculateWinner(newBoard);
    if (winner) {
      setScore({ ...score, [winner]: score[winner] + 1 });
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } else if (newBoard.every(cell => cell !== null)) {
      setScore({ ...score, draws: score.draws + 1 });
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every(cell => cell !== null);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-4 text-center bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6">
        <div>
          <div className="text-3xl font-bold text-purple-600">{score.X}</div>
          <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
            <XIcon className="w-4 h-4" /> Joueur X
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-600">{score.draws}</div>
          <div className="text-sm text-gray-600">Égalités</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-pink-600">{score.O}</div>
          <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
            <Circle className="w-4 h-4" /> Joueur O
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="grid grid-cols-3 gap-3 w-full max-w-md">
          {board.map((cell, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: cell ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleClick(i)}
              disabled={cell || winner}
              className={`aspect-square rounded-xl text-4xl font-bold flex items-center justify-center transition-all ${
                cell === 'X' ? 'bg-gradient-to-br from-purple-400 to-violet-400 text-white' :
                cell === 'O' ? 'bg-gradient-to-br from-pink-400 to-rose-400 text-white' :
                'bg-white border-2 border-gray-200 hover:border-purple-300'
              } ${(cell || winner) ? 'cursor-not-allowed' : 'cursor-pointer shadow-lg hover:shadow-xl'}`}
            >
              {cell === 'X' && <XIcon className="w-12 h-12" />}
              {cell === 'O' && <Circle className="w-12 h-12" />}
            </motion.button>
          ))}
        </div>

        {!winner && !isDraw && (
          <div className="text-xl font-semibold text-gray-700">
            Tour de: <span className={isXNext ? 'text-purple-600' : 'text-pink-600'}>
              {isXNext ? 'X' : 'O'}
            </span>
          </div>
        )}

        {(winner || isDraw) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-center p-6 rounded-xl ${
              winner ? 'bg-gradient-to-r from-purple-100 to-pink-100' :
              'bg-gradient-to-r from-gray-100 to-slate-100'
            }`}
          >
            <Trophy className={`w-16 h-16 mx-auto mb-3 ${winner ? 'text-yellow-500' : 'text-gray-400'}`} />
            <h3 className="text-2xl font-bold mb-2">
              {winner ? `🎉 Le joueur ${winner} a gagné !` : '🤝 Égalité !'}
            </h3>
            <Button
              onClick={resetGame}
              className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full"
            >
              Nouvelle partie
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Trophy, Clock, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

const difficulties = {
  facile: { min: 1, max: 10, time: 30, points: 10 },
  moyen: { min: 10, max: 50, time: 20, points: 20 },
  difficile: { min: 20, max: 100, time: 15, points: 30 }
};

const operations = ['+', '-', '×'];

export default function MathGame() {
  const [difficulty, setDifficulty] = useState('facile');
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(difficulties[difficulty].time);
  const [gameActive, setGameActive] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameActive && timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, gameActive]);

  const generateQuestion = () => {
    const { min, max } = difficulties[difficulty];
    const op = operations[Math.floor(Math.random() * operations.length)];
    let num1 = Math.floor(Math.random() * (max - min + 1)) + min;
    let num2 = Math.floor(Math.random() * (max - min + 1)) + min;
    
    if (op === '-' && num1 < num2) [num1, num2] = [num2, num1];
    
    let result;
    switch(op) {
      case '+': result = num1 + num2; break;
      case '-': result = num1 - num2; break;
      case '×': result = num1 * num2; break;
    }
    
    setQuestion({ num1, num2, op, result });
  };

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setHistory([]);
    setTimeLeft(difficulties[difficulty].time);
    generateQuestion();
  };

  const checkAnswer = () => {
    const userAnswer = parseInt(answer);
    const isCorrect = userAnswer === question.result;
    
    if (isCorrect) {
      setScore(score + difficulties[difficulty].points);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    }
    
    setHistory([{ ...question, userAnswer, isCorrect }, ...history].slice(0, 5));
    setAnswer('');
    generateQuestion();
  };

  const endGame = () => {
    setGameActive(false);
    if (score > 0) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="space-y-6">
      {!gameActive ? (
        <div className="space-y-6">
          <div className="text-center bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6">
            <Zap className="w-12 h-12 mx-auto mb-3 text-blue-500" />
            <h3 className="text-xl font-bold mb-4">Choisis ton niveau</h3>
            <div className="grid grid-cols-3 gap-3">
              {Object.keys(difficulties).map(diff => (
                <Button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  variant={difficulty === diff ? 'default' : 'outline'}
                  className={difficulty === diff ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' : ''}
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 space-y-3">
            <h4 className="font-bold">Règles :</h4>
            <ul className="space-y-2 text-gray-700">
              <li>• Tu as {difficulties[difficulty].time} secondes</li>
              <li>• Chaque bonne réponse : {difficulties[difficulty].points} points</li>
              <li>• Réponds le plus rapidement possible !</li>
            </ul>
          </div>

          <Button onClick={startGame} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-6 text-lg rounded-xl">
            Commencer
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span className="font-bold text-xl">{score} pts</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-500" />
              <span className={`font-bold text-xl ${timeLeft < 10 ? 'text-red-500' : ''}`}>
                {timeLeft}s
              </span>
            </div>
          </div>

          {question && (
            <motion.div
              key={`${question.num1}-${question.op}-${question.num2}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl p-8 text-center shadow-lg"
            >
              <div className="text-5xl font-bold text-gray-800 mb-6">
                {question.num1} {question.op} {question.num2} = ?
              </div>
              <div className="flex gap-3">
                <Input
                  type="number"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && answer && checkAnswer()}
                  placeholder="Ta réponse"
                  className="text-2xl text-center"
                  autoFocus
                />
                <Button
                  onClick={checkAnswer}
                  disabled={!answer}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8"
                >
                  ✓
                </Button>
              </div>
            </motion.div>
          )}

          {history.length > 0 && (
            <div className="bg-white rounded-xl p-4">
              <h4 className="font-bold mb-3">Historique</h4>
              <div className="space-y-2">
                {history.map((item, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-2 rounded ${
                    item.isCorrect ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <span>{item.num1} {item.op} {item.num2}</span>
                    <span className="font-bold">
                      {item.userAnswer} {item.isCorrect ? '✓' : `✗ (${item.result})`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!gameActive && score > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-6 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl"
        >
          <Trophy className="w-16 h-16 mx-auto mb-3 text-yellow-500" />
          <h3 className="text-2xl font-bold text-blue-700 mb-2">Partie terminée !</h3>
          <p className="text-gray-700 text-xl">Score final : {score} points</p>
        </motion.div>
      )}
    </div>
  );
}

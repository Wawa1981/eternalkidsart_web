import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/Components/ui/button';
import { Trophy, Brain, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

const quizzes = [
  { question: "Quelle est la capitale de la France ?", answers: ["Paris", "Lyon", "Marseille", "Bordeaux"], correct: 0 },
  { question: "Combien de continents y a-t-il sur Terre ?", answers: ["5", "6", "7", "8"], correct: 2 },
  { question: "Quel est le plus grand océan du monde ?", answers: ["Atlantique", "Indien", "Arctique", "Pacifique"], correct: 3 },
  { question: "En quelle année l'homme a-t-il marché sur la Lune ?", answers: ["1965", "1969", "1972", "1975"], correct: 1 },
  { question: "Quel est le plus grand mammifère terrestre ?", answers: ["Rhinocéros", "Hippopotame", "Éléphant", "Girafe"], correct: 2 },
  { question: "Combien de planètes y a-t-il dans le système solaire ?", answers: ["7", "8", "9", "10"], correct: 1 },
  { question: "Quel est le plus haut sommet du monde ?", answers: ["K2", "Mont Blanc", "Everest", "Kilimandjaro"], correct: 2 },
  { question: "Qui a peint la Joconde ?", answers: ["Picasso", "Van Gogh", "Léonard de Vinci", "Michel-Ange"], correct: 2 },
  { question: "Combien de jours y a-t-il dans une année bissextile ?", answers: ["364", "365", "366", "367"], correct: 2 },
  { question: "Quelle est la langue la plus parlée au monde ?", answers: ["Anglais", "Espagnol", "Mandarin", "Hindi"], correct: 2 },
  { question: "Quel organe pompe le sang dans notre corps ?", answers: ["Poumons", "Foie", "Cœur", "Estomac"], correct: 2 },
  { question: "Combien de côtés a un hexagone ?", answers: ["5", "6", "7", "8"], correct: 1 },
  { question: "Quelle planète est surnommée la planète rouge ?", answers: ["Vénus", "Mars", "Jupiter", "Saturne"], correct: 1 },
  { question: "Quel animal est le symbole de l'Australie ?", answers: ["Koala", "Kangourou", "Wombat", "Émeu"], correct: 1 },
  { question: "Combien de dents a un adulte normalement ?", answers: ["28", "30", "32", "34"], correct: 2 }
];

export default function QuizGame() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  const quiz = quizzes[currentQuestion];

  const startGame = () => {
    setGameStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
  };

  const handleAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === quiz.correct;
    
    if (isCorrect) {
      setScore(score + 1);
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
    }

    setTimeout(() => {
      if (currentQuestion < quizzes.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
        if (score + (isCorrect ? 1 : 0) > quizzes.length / 2) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
      }
    }, 1500);
  };

  if (!gameStarted) {
    return (
      <div className="space-y-6">
        <div className="text-center bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-8">
          <Brain className="w-16 h-16 mx-auto mb-4 text-amber-500" />
          <h3 className="text-2xl font-bold mb-3">Quiz Culture Générale</h3>
          <p className="text-gray-700 mb-4">Réponds à {quizzes.length} questions de culture générale</p>
          <div className="bg-white rounded-lg p-4 space-y-2 text-left">
            <p className="font-semibold">📚 Thèmes variés :</p>
            <ul className="text-gray-600 space-y-1">
              <li>• Géographie</li>
              <li>• Histoire</li>
              <li>• Sciences</li>
              <li>• Culture générale</li>
            </ul>
          </div>
        </div>
        <Button onClick={startGame} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-6 text-lg rounded-xl">
          Commencer le Quiz
        </Button>
      </div>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / quizzes.length) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl space-y-6"
      >
        <Trophy className="w-20 h-20 mx-auto text-yellow-500" />
        <div>
          <h3 className="text-3xl font-bold mb-2">Quiz terminé !</h3>
          <p className="text-5xl font-bold text-amber-600 my-4">{score} / {quizzes.length}</p>
          <p className="text-xl text-gray-700">Score : {percentage}%</p>
        </div>
        <div className="text-lg">
          {percentage >= 80 && <p>🏆 Excellent ! Tu es un champion !</p>}
          {percentage >= 60 && percentage < 80 && <p>👍 Très bien ! Continue comme ça !</p>}
          {percentage >= 40 && percentage < 60 && <p>😊 Pas mal ! Tu peux faire mieux !</p>}
          {percentage < 40 && <p>💪 Continue à apprendre !</p>}
        </div>
        <Button
          onClick={startGame}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full px-8 py-6 text-lg"
        >
          Recommencer
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <span className="font-bold">Score : {score}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6 text-amber-500" />
          <span className="font-bold">Question {currentQuestion + 1}/{quizzes.length}</span>
        </div>
      </div>

      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-xl p-6 space-y-6"
      >
        <h3 className="text-xl font-bold text-gray-800">{quiz.question}</h3>
        
        <div className="grid grid-cols-1 gap-3">
          {quiz.answers.map((answer, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === quiz.correct;
            const showCorrect = selectedAnswer !== null && isCorrect;
            const showWrong = selectedAnswer === index && !isCorrect;

            return (
              <Button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
                className={`p-4 text-left h-auto justify-start text-base ${
                  showCorrect ? 'bg-green-500 text-white hover:bg-green-500' :
                  showWrong ? 'bg-red-500 text-white hover:bg-red-500' :
                  'bg-white border-2 border-amber-200 text-gray-800 hover:bg-amber-50 hover:border-amber-400'
                }`}
              >
                <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                {answer}
                {showCorrect && <span className="ml-auto">✓</span>}
                {showWrong && <span className="ml-auto">✗</span>}
              </Button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

import React from 'react';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Play, 
  Clock, 
  Star,
  Zap
} from 'lucide-react';

export default function TutorialCard({ tutorial, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/20 cursor-pointer">
        {/* Glowing effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative">
          {/* Thumbnail */}
          <div className="relative h-40 overflow-hidden rounded-t-xl">
            <img 
              src={tutorial.thumbnail}
              alt={tutorial.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
            
            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-16 h-16 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                <Play className="w-8 h-8 text-white ml-1" fill="white" />
              </div>
            </div>

            {/* Badge */}
            <div className="absolute top-3 left-3">
              <Badge className={`${tutorial.level === 'Débutant' ? 'bg-green-500' : tutorial.level === 'Intermédiaire' ? 'bg-yellow-500' : 'bg-red-500'} text-white border-0`}>
                {tutorial.level}
              </Badge>
            </div>
          </div>

          <CardContent className="p-4">
            <h3 className="font-bold text-white text-lg mb-2 group-hover:text-cyan-400 transition-colors">
              {tutorial.title}
            </h3>
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
              {tutorial.description}
            </p>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{tutorial.duration}</span>
              </div>
              {tutorial.isPopular && (
                <div className="flex items-center gap-1 text-yellow-500">
                  <Zap className="w-4 h-4" fill="currentColor" />
                  <span>Populaire</span>
                </div>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}

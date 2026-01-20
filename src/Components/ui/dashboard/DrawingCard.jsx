import React from 'react';
import { Card, CardContent } from '@/Components/ui/card';
import { motion } from 'framer-motion';
import { Heart, Eye, Calendar, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function DrawingCard({ drawing, onClick, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      onClick={() => onClick?.(drawing)}
    >
      <Card className="group bg-white/80 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer">
        <div className="aspect-square relative overflow-hidden">
          <img 
            src={drawing.enhanced_image_url || drawing.image_url} 
            alt={drawing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {drawing.enhanced_image_url && (
            <div className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-white" />
              <span className="text-xs text-white font-medium">IA</span>
            </div>
          )}
          
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-2 bg-white/90 backdrop-blur rounded-full hover:bg-white transition-colors">
              <Eye className="w-4 h-4 text-gray-700" />
            </button>
            <button className="p-2 bg-white/90 backdrop-blur rounded-full hover:bg-white transition-colors">
              <Heart className="w-4 h-4 text-rose-500" />
            </button>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-800 mb-1 truncate">{drawing.title}</h3>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{drawing.child_name}{drawing.child_age ? `, ${drawing.child_age} ans` : ''}</span>
            {drawing.drawing_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{format(new Date(drawing.drawing_date), 'd MMM yyyy', { locale: fr })}</span>
              </div>
            )}
          </div>
          {drawing.votes > 0 && (
            <div className="flex items-center gap-1 mt-2 text-rose-500">
              <Heart className="w-4 h-4 fill-rose-500" />
              <span className="text-sm font-medium">{drawing.votes}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

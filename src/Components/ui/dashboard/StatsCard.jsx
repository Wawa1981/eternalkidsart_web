import React from 'react';
import { Card, CardContent } from '@/Components/ui/card';
import { motion } from 'framer-motion';

export default function StatsCard({ icon: Icon, title, value, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="bg-white/80 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center`}>
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{title}</p>
              <p className="text-3xl font-bold text-gray-800">{value}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

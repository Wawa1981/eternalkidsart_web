import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/Components/ui/card';
import { motion } from 'framer-motion';
import { Folder, Image as ImageIcon } from 'lucide-react';

export default function AlbumCard({ album, drawingsCount, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
    >
      <Link to={createPageUrl(`AlbumDetail?id=${album.id}`)}>
        <Card className="group bg-white/80 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer">
          <div className="aspect-video relative overflow-hidden">
            {album.cover_image ? (
              <img 
                src={album.cover_image} 
                alt={album.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center">
                <Folder className="w-16 h-16 text-rose-300" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <ImageIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{drawingsCount} dessins</span>
              </div>
              {album.year && (
                <span className="px-2 py-1 bg-white/20 backdrop-blur rounded-full text-xs text-white">
                  {album.year}
                </span>
              )}
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-800 mb-1">{album.name}</h3>
            <p className="text-sm text-gray-500">{album.child_name}</p>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

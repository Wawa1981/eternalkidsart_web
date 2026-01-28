import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { 
  Palette, 
  Eraser, 
  Trash2, 
  Download, 
  Sparkles,
  Undo,
  CircleDot,
  Minus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function DrawingCanvas() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ff6b9d');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState('brush'); // brush or eraser
  const [history, setHistory] = useState([]);

  const colors = [
    '#ff6b9d', // Rose
    '#c084fc', // Violet
    '#60a5fa', // Bleu
    '#34d399', // Vert
    '#fbbf24', // Jaune
    '#f97316', // Orange
    '#ef4444', // Rouge
    '#8b5cf6', // Violet foncé
    '#14b8a6', // Turquoise
    '#ffffff', // Blanc
    '#000000'  // Noir
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Save initial state
    setHistory([canvas.toDataURL()]);
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = tool === 'eraser' ? '#1a1a2e' : color;
    ctx.lineWidth = tool === 'eraser' ? brushSize * 3 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      // Save to history
      const canvas = canvasRef.current;
      setHistory([...history, canvas.toDataURL()]);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHistory([canvas.toDataURL()]);
  };

  const undo = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = newHistory[newHistory.length - 1];
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
    }
  };

  const saveDrawing = async () => {
    const canvas = canvasRef.current;
    canvas.toBlob(async (blob) => {
      try {
        const file = new File([blob], 'mon-dessin.png', { type: 'image/png' });
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        toast.success('Dessin sauvegardé !');
        
        // Optionally save to Drawing entity
        const user = await base44.auth.me();
        await base44.entities.Drawing.create({
          title: 'Mon dessin numérique',
          image_url: file_url,
          child_name: user.full_name || 'Artiste',
          category: 'imaginaire'
        });
        toast.success('Ajouté à votre galerie !');
      } catch (error) {
        toast.error('Erreur lors de la sauvegarde');
      }
    });
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'mon-dessin.png';
    link.href = canvas.toDataURL();
    link.click();
    toast.success('Dessin téléchargé !');
  };

  return (
    <div className="relative">
      {/* Canvas */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-cyan-500/30 bg-gradient-to-br from-purple-900/20 to-cyan-900/20 backdrop-blur-sm">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="cursor-crosshair w-full h-auto"
          style={{ touchAction: 'none' }}
        />
        
        {/* Floating toolbar */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl rounded-2xl p-3 border border-cyan-500/30 shadow-xl"
        >
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {/* Colors */}
            <div className="flex gap-1 px-2 border-r border-white/10">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setColor(c);
                    setTool('brush');
                  }}
                  className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                    color === c && tool === 'brush' 
                      ? 'border-white scale-110 shadow-lg' 
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            {/* Tools */}
            <div className="flex gap-1 px-2 border-r border-white/10">
              <Button
                onClick={() => setTool('brush')}
                size="icon"
                variant={tool === 'brush' ? 'default' : 'ghost'}
                className={`rounded-xl ${tool === 'brush' ? 'bg-cyan-500 hover:bg-cyan-600' : 'hover:bg-white/10'}`}
              >
                <Palette className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => setTool('eraser')}
                size="icon"
                variant={tool === 'eraser' ? 'default' : 'ghost'}
                className={`rounded-xl ${tool === 'eraser' ? 'bg-purple-500 hover:bg-purple-600' : 'hover:bg-white/10'}`}
              >
                <Eraser className="w-5 h-5" />
              </Button>
            </div>

            {/* Brush size */}
            <div className="flex items-center gap-2 px-2 border-r border-white/10">
              <CircleDot className="w-4 h-4 text-white/60" />
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-20 accent-cyan-500"
              />
              <span className="text-white text-xs">{brushSize}px</span>
            </div>

            {/* Actions */}
            <div className="flex gap-1 px-2">
              <Button
                onClick={undo}
                size="icon"
                variant="ghost"
                className="rounded-xl hover:bg-white/10 text-white"
                disabled={history.length <= 1}
              >
                <Undo className="w-5 h-5" />
              </Button>
              <Button
                onClick={clearCanvas}
                size="icon"
                variant="ghost"
                className="rounded-xl hover:bg-white/10 text-white"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
              <Button
                onClick={saveDrawing}
                size="icon"
                variant="ghost"
                className="rounded-xl hover:bg-white/10 text-white"
              >
                <Sparkles className="w-5 h-5" />
              </Button>
              <Button
                onClick={downloadDrawing}
                size="icon"
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
              >
                <Download className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Textarea } from '@/Components/ui/textarea';
import {
  X,
  Heart,
  Share2,
  Download,
  Calendar,
  User,
  Sparkles,
  ShoppingBag,
  MessageCircle,
  Send,
  Facebook,
  Instagram,
  Twitter,
  Link as LinkIcon,
  Coins,
  Trash2,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function DrawingDetailModal({ drawing, onClose }) {
  const [user, setUser] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showNFT, setShowNFT] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        const voted = localStorage.getItem(`voted_${drawing?.id}`);
        setHasVoted(!!voted);
      } catch (e) {
        setUser(null);
      }
    };
    if (drawing) loadUser();
  }, [drawing]);

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', drawing?.id],
    queryFn: () => base44.entities.Comment.filter({ drawing_id: drawing.id }, '-created_date'),
    enabled: !!drawing && showComments
  });

  const voteMutation = useMutation({
    mutationFn: async () => {
      const newVotes = hasVoted ? (drawing.votes || 0) - 1 : (drawing.votes || 0) + 1;
      await base44.entities.Drawing.update(drawing.id, { votes: newVotes });
      return newVotes;
    },
    onSuccess: (newVotes) => {
      queryClient.invalidateQueries({ queryKey: ['museumDrawings'] });
      queryClient.invalidateQueries({ queryKey: ['drawings'] });
      if (hasVoted) {
        localStorage.removeItem(`voted_${drawing.id}`);
        setHasVoted(false);
        toast.success('Vote retiré');
      } else {
        localStorage.setItem(`voted_${drawing.id}`, 'true');
        setHasVoted(true);
        toast.success('Vote ajouté !');
      }
      drawing.votes = newVotes;
    }
  });

  const commentMutation = useMutation({
    mutationFn: (content) =>
      base44.entities.Comment.create({
        drawing_id: drawing.id,
        content,
        author_name: user?.full_name || user?.email
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', drawing.id] });
      setNewComment('');
      toast.success('Commentaire ajouté !');
    },
    onError: (e) => {
      console.error('Comment create error:', e);
      toast.error("Impossible d'ajouter le commentaire");
    }
  });

  if (!drawing) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = drawing.enhanced_image_url || drawing.image_url;
    link.download = `${drawing.title}.jpg`;
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: drawing.title,
          text: `Découvrez ce magnifique dessin de ${drawing.child_name}`,
          url: window.location.href
        });
      } catch (err) {
        // share annulé
      }
    } else {
      toast.info("Le partage natif n'est pas disponible sur ce navigateur.");
    }
  };

  const handleSocialShare = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Découvrez "${drawing.title}" de ${drawing.child_name}`);
    const imageUrl = encodeURIComponent(drawing.enhanced_image_url || drawing.image_url);

    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      instagram: imageUrl
    };

    if (platform === 'instagram') {
      toast.info("Téléchargez l'image et partagez-la sur Instagram");
      handleDownload();
    } else {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Lien copié !');
  };

  const handleNFTMint = async () => {
    toast.info('Fonctionnalité NFT bientôt disponible !', {
      description: 'La tokenisation de vos dessins arrive très prochainement'
    });
  };

  const handleDelete = async () => {
    const ok = window.confirm('Supprimer ce dessin ? (action irréversible)');
    if (!ok) return;

    setDeleting(true);
    try {
      await base44.entities.Drawing.delete(drawing.id);

      queryClient.invalidateQueries({ queryKey: ['museumDrawings'] });
      queryClient.invalidateQueries({ queryKey: ['drawings'] });

      toast.success('Dessin supprimé');
      onClose?.();
    } catch (error) {
      console.error('Delete drawing error:', error);
      console.error('Delete status:', error?.response?.status);
      console.error('Delete details:', error?.response?.data || error?.data || error);
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          `Suppression impossible (${error?.response?.status || 'no status'})`
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={!!drawing} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-y-auto bg-white rounded-3xl">
        <button
          onClick={() => onClose()}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur rounded-full hover:bg-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Image Section */}
          <div className="relative bg-gradient-to-br from-rose-50 to-amber-50 p-6">
            <motion.img
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              src={drawing.enhanced_image_url || drawing.image_url}
              alt={drawing.title}
              className="w-full rounded-2xl shadow-xl object-contain max-h-[500px]"
            />
            {drawing.enhanced_image_url && (
              <div className="absolute top-8 left-8 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center gap-2 shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm text-white font-medium">Amélioré par IA</span>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{drawing.title}</h2>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className="flex items-center gap-1 border-rose-200 text-rose-600">
                  <User className="w-3 h-3" />
                  {drawing.child_name}
                  {drawing.child_age ? `, ${drawing.child_age} ans` : ''}
                </Badge>

                {drawing.drawing_date && (
                  <Badge variant="outline" className="flex items-center gap-1 border-amber-200 text-amber-600">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(drawing.drawing_date), 'd MMMM yyyy', { locale: fr })}
                  </Badge>
                )}

                {drawing.category && (
                  <Badge className="bg-gradient-to-r from-sky-100 to-blue-100 text-sky-700 border-0">
                    {drawing.category}
                  </Badge>
                )}
              </div>
            </div>

            {drawing.description && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Anecdote</h3>
                <p className="text-gray-700">{drawing.description}</p>
              </div>
            )}

            {/* Votes */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => voteMutation.mutate()}
                disabled={voteMutation.isPending}
                className={`rounded-xl ${hasVoted ? 'border-rose-500 bg-rose-50' : ''}`}
              >
                <Heart
                  className={`w-5 h-5 mr-2 ${hasVoted ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`}
                />
                <span className="font-semibold">{drawing.votes || 0}</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowComments(!showComments)}
                className="rounded-xl"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                {comments.length}
              </Button>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleDownload} className="flex-1 rounded-xl h-12">
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger
                </Button>
                <Button variant="outline" onClick={handleShare} className="flex-1 rounded-xl h-12">
                  <Share2 className="w-4 h-4 mr-2" />
                  Partager
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => handleSocialShare('facebook')} className="rounded-xl">
                  <Facebook className="w-4 h-4 text-blue-600" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleSocialShare('twitter')} className="rounded-xl">
                  <Twitter className="w-4 h-4 text-sky-500" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleSocialShare('instagram')} className="rounded-xl">
                  <Instagram className="w-4 h-4 text-pink-600" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleCopyLink} className="rounded-xl flex-1">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Copier lien
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-xl h-12">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Commander
                </Button>
                <Button
                  onClick={handleNFTMint}
                  className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white rounded-xl h-12"
                >
                  <Coins className="w-4 h-4 mr-2" />
                  NFT
                </Button>
              </div>

              {/* ✅ DELETE */}
              <Button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full rounded-xl h-12 bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer ce dessin
                  </>
                )}
              </Button>
            </div>

            {/* Compare Views */}
            {drawing.enhanced_image_url && drawing.image_url && (
              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Comparer</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <img
                      src={drawing.image_url}
                      alt="Original"
                      className="w-full aspect-square object-cover rounded-xl"
                    />
                    <p className="text-xs text-center text-gray-500">Original</p>
                  </div>
                  <div className="space-y-1">
                    <img
                      src={drawing.enhanced_image_url}
                      alt="Amélioré"
                      className="w-full aspect-square object-cover rounded-xl"
                    />
                    <p className="text-xs text-center text-gray-500">Version IA</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section Commentaires */}
        {showComments && (
          <div className="col-span-2 border-t p-6 bg-gray-50">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-rose-500" />
                Commentaires ({comments.length})
              </h3>

              {user && (
                <div className="mb-6 flex gap-3">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Ajoutez un commentaire..."
                    className="flex-1 rounded-xl"
                    rows={2}
                  />
                  <Button
                    onClick={() => commentMutation.mutate(newComment)}
                    disabled={!newComment.trim() || commentMutation.isPending}
                    className="bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-xl"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <div className="space-y-4">
                {comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-amber-400 flex items-center justify-center text-white font-semibold">
                        {comment.author_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{comment.author_name}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(comment.created_date), 'dd MMM yyyy à HH:mm', { locale: fr })}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </motion.div>
                ))}

                {comments.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    Aucun commentaire pour le moment. Soyez le premier à commenter !
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

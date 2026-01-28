import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Users, 
  Heart, 
  MessageCircle, 
  Send,
  Image as ImageIcon,
  Mail,
  Loader2
} from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

export default function Community() {
  const [user, setUser] = useState(null);
  const [newPost, setNewPost] = useState('');
  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const [showDrawingSelector, setShowDrawingSelector] = useState(false);
  const [commentingPost, setCommentingPost] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [messagingUser, setMessagingUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ['posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 100)
  });

  const { data: myDrawings = [] } = useQuery({
    queryKey: ['myDrawings'],
    queryFn: () => base44.entities.Drawing.filter({ created_by: user?.email }, '-created_date', 20),
    enabled: !!user
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    enabled: !!user
  });

  const createPostMutation = useMutation({
    mutationFn: (data) => base44.entities.Post.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setNewPost('');
      setSelectedDrawing(null);
      toast.success('Post publié !');
    }
  });

  const likeMutation = useMutation({
    mutationFn: async (postId) => {
      // Vérifier si déjà liké
      const existingLikes = await base44.entities.Like.filter({ 
        post_id: postId, 
        user_email: user.email 
      });
      
      const post = posts.find(p => p.id === postId);
      
      if (existingLikes.length > 0) {
        // Unlike
        await base44.entities.Like.delete(existingLikes[0].id);
        await base44.entities.Post.update(postId, { 
          likes_count: Math.max(0, (post.likes_count || 0) - 1) 
        });
      } else {
        // Like
        await base44.entities.Like.create({ 
          post_id: postId, 
          user_email: user.email 
        });
        await base44.entities.Post.update(postId, { 
          likes_count: (post.likes_count || 0) + 1 
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });

  const commentMutation = useMutation({
    mutationFn: async ({ postId, content }) => {
      await base44.entities.PostComment.create({
        post_id: postId,
        content,
        author_name: user.full_name || user.email
      });
      const post = posts.find(p => p.id === postId);
      await base44.entities.Post.update(postId, {
        comments_count: (post.comments_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['postComments'] });
      setNewComment('');
      setCommentingPost(null);
      toast.success('Commentaire ajouté !');
    }
  });

  const messageMutation = useMutation({
    mutationFn: (data) => base44.entities.Message.create(data),
    onSuccess: () => {
      setNewMessage('');
      setMessagingUser(null);
      toast.success('Message envoyé !');
    }
  });

  const { data: postComments = [] } = useQuery({
    queryKey: ['postComments', commentingPost?.id],
    queryFn: () => base44.entities.PostComment.filter(
      { post_id: commentingPost.id }, 
      '-created_date'
    ),
    enabled: !!commentingPost
  });

  const handleCreatePost = () => {
    if (!newPost.trim() && !selectedDrawing) return;
    
    createPostMutation.mutate({
      content: newPost,
      author_name: user.full_name || user.email,
      drawing_id: selectedDrawing?.id,
      image_url: selectedDrawing?.enhanced_image_url || selectedDrawing?.image_url
    });
  };

  const handleSelectDrawing = (drawing) => {
    setSelectedDrawing(drawing);
    setShowDrawingSelector(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="font-handwritten text-4xl sm:text-5xl bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent mb-2">
            Communauté
          </h1>
          <p className="text-gray-500">Partagez vos créations et discutez avec d'autres familles</p>
        </motion.div>

        {/* Create Post */}
        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
          <CardContent className="p-4 space-y-3">
            <Textarea
              placeholder={`Quoi de neuf, ${user.full_name || 'artiste'} ?`}
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="border-0 bg-gray-50 rounded-xl resize-none"
              rows={3}
            />
            
            {selectedDrawing && (
              <div className="relative w-32 h-32 rounded-xl overflow-hidden">
                <img 
                  src={selectedDrawing.enhanced_image_url || selectedDrawing.image_url}
                  alt={selectedDrawing.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedDrawing(null)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDrawingSelector(true)}
                className="text-violet-600"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Ajouter un dessin
              </Button>
              <Button
                onClick={handleCreatePost}
                disabled={(!newPost.trim() && !selectedDrawing) || createPostMutation.isPending}
                className="bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full"
              >
                {createPostMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Publier
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-4">
          {loadingPosts ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto" />
            </div>
          ) : posts.length === 0 ? (
            <Card className="bg-white/50 text-center p-8">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucun post pour le moment. Soyez le premier à partager !</p>
            </Card>
          ) : (
            posts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold">
                        {post.author_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{post.author_name}</h3>
                        <p className="text-xs text-gray-500">
                          {format(new Date(post.created_date), 'dd MMM yyyy à HH:mm', { locale: fr })}
                        </p>
                      </div>
                      {post.created_by === user.email && allUsers.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMessagingUser(allUsers.find(u => u.email !== user.email))}
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-3">
                    <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                    
                    {post.image_url && (
                      <div className="rounded-xl overflow-hidden">
                        <img 
                          src={post.image_url}
                          alt="Post"
                          className="w-full max-h-96 object-contain bg-gray-50"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => likeMutation.mutate(post.id)}
                        disabled={likeMutation.isPending}
                        className="text-rose-500"
                      >
                        <Heart className={`w-5 h-5 mr-1 ${post.likes_count > 0 ? 'fill-rose-500' : ''}`} />
                        {post.likes_count || 0}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCommentingPost(post)}
                        className="text-violet-600"
                      >
                        <MessageCircle className="w-5 h-5 mr-1" />
                        {post.comments_count || 0}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Drawing Selector Dialog */}
        <Dialog open={showDrawingSelector} onOpenChange={setShowDrawingSelector}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Choisir un dessin</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-3">
              {myDrawings.map(drawing => (
                <div
                  key={drawing.id}
                  onClick={() => handleSelectDrawing(drawing)}
                  className="cursor-pointer rounded-xl overflow-hidden hover:ring-2 ring-violet-500 transition-all"
                >
                  <img 
                    src={drawing.enhanced_image_url || drawing.image_url}
                    alt={drawing.title}
                    className="w-full aspect-square object-cover"
                  />
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Comments Dialog */}
        <Dialog open={!!commentingPost} onOpenChange={() => setCommentingPost(null)}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Commentaires</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {postComments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {comment.author_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-xl p-3">
                    <p className="font-semibold text-sm">{comment.author_name}</p>
                    <p className="text-gray-700 text-sm mt-1">{comment.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(comment.created_date), 'dd MMM à HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>
              ))}
              {postComments.length === 0 && (
                <p className="text-center text-gray-500 py-4">Aucun commentaire</p>
              )}
              
              <div className="flex gap-2 pt-3 border-t">
                <Input
                  placeholder="Écrire un commentaire..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => commentMutation.mutate({ 
                    postId: commentingPost.id, 
                    content: newComment 
                  })}
                  disabled={!newComment.trim() || commentMutation.isPending}
                  className="bg-gradient-to-r from-violet-500 to-purple-500 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Message Dialog */}
        <Dialog open={!!messagingUser} onOpenChange={() => setMessagingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Envoyer un message à {messagingUser?.full_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Votre message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={5}
              />
              <Button
                onClick={() => messageMutation.mutate({
                  recipient_email: messagingUser.email,
                  sender_name: user.full_name || user.email,
                  content: newMessage
                })}
                disabled={!newMessage.trim() || messageMutation.isPending}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-500 text-white"
              >
                Envoyer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Loader2,
  Upload,
  X,
  Trash2,
  Inbox
} from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader } from '@/Components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Community() {
  const [user, setUser] = useState(null);

  const [newPost, setNewPost] = useState('');

  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const [selectedUploadUrl, setSelectedUploadUrl] = useState(null);
  const [uploadingAttach, setUploadingAttach] = useState(false);

  const [showDrawingSelector, setShowDrawingSelector] = useState(false);

  const [commentingPost, setCommentingPost] = useState(null);
  const [newComment, setNewComment] = useState('');

  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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
    queryKey: ['myDrawings', user?.email],
    queryFn: () => base44.entities.Drawing.filter({ created_by: user?.email }, '-created_date', 30),
    enabled: !!user
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    enabled: !!user
  });

  const { data: postComments = [] } = useQuery({
    queryKey: ['postComments', commentingPost?.id],
    queryFn: () => base44.entities.PostComment.filter({ post_id: commentingPost.id }, '-created_date'),
    enabled: !!commentingPost
  });

  const { data: inboxMessages = [] } = useQuery({
    queryKey: ['messagesInbox', user?.email],
    queryFn: () => base44.entities.Message.filter({ recipient_email: user.email }, '-created_date', 200),
    enabled: !!user
  });

  const unreadCount = useMemo(() => {
    return (inboxMessages || []).filter((m) => !m.is_read).length;
  }, [inboxMessages]);

  const createPostMutation = useMutation({
    mutationFn: (data) => base44.entities.Post.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setNewPost('');
      setSelectedDrawing(null);
      setSelectedUploadUrl(null);
      toast.success('Post publié !');
    },
    onError: (e) => {
      console.error('Create post error:', e);
      toast.error('Impossible de publier.');
    }
  });

  const likeMutation = useMutation({
    mutationFn: async (postId) => {
      const existingLikes = await base44.entities.Like.filter({
        post_id: postId,
        user_email: user.email
      });

      const post = posts.find((p) => p.id === postId);

      if (existingLikes.length > 0) {
        await base44.entities.Like.delete(existingLikes[0].id);
        await base44.entities.Post.update(postId, {
          likes_count: Math.max(0, (post.likes_count || 0) - 1)
        });
      } else {
        await base44.entities.Like.create({
          post_id: postId,
          user_email: user.email,
          created_by: user.email
        });
        await base44.entities.Post.update(postId, {
          likes_count: (post.likes_count || 0) + 1
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
    onError: (e) => {
      console.error('Like error:', e);
      toast.error("Impossible d'aimer ce post.");
    }
  });

  const commentMutation = useMutation({
    mutationFn: async ({ postId, content }) => {
      await base44.entities.PostComment.create({
        post_id: postId,
        content,
        author_name: user.full_name || user.email,
        created_by: user.email
      });

      const post = posts.find((p) => p.id === postId);
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
    },
    onError: (e) => {
      console.error('Comment error:', e);
      toast.error("Impossible d'ajouter le commentaire.");
    }
  });

  const markReadMutation = useMutation({
    mutationFn: async (msg) => {
      if (msg.is_read) return;
      await base44.entities.Message.update(msg.id, { is_read: true });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messagesInbox', user?.email] })
  });

  const deletePostMutation = useMutation({
    mutationFn: async (post) => {
      const postId = post.id;

      try {
        await base44.entities.Post.delete(postId);
        return;
      } catch (e1) {
        console.log('DELETE POST ERROR', e1?.response?.status, e1?.response?.data || e1);
      }

      const isMine =
        post?.created_by === user.email ||
        post?.author_email === user.email ||
        post?.author_name === user.email ||
        post?.author_name === user.full_name;

      if (isMine) {
        try {
          await base44.entities.Post.update(postId, { created_by: user.email, author_email: user.email });
        } catch (e2) {
          console.log('OWNER REPAIR FAILED', e2?.response?.status, e2?.response?.data || e2);
        }
      }

      const likes = await base44.entities.Like.filter({ post_id: postId });
      for (const like of likes) await base44.entities.Like.delete(like.id);

      const comments = await base44.entities.PostComment.filter({ post_id: postId });
      for (const c of comments) await base44.entities.PostComment.delete(c.id);

      await base44.entities.Post.delete(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Publication supprimée');
    },
    onError: (e) => {
      console.error('Delete post error:', e);
      toast.error('Impossible de supprimer la publication.');
    }
  });

  const handleCreatePost = () => {
    if (!newPost.trim() && !selectedDrawing && !selectedUploadUrl) return;

    const imageUrl =
      selectedUploadUrl ||
      selectedDrawing?.enhanced_image_url ||
      selectedDrawing?.image_url ||
      null;

    createPostMutation.mutate({
      content: newPost,
      author_name: user.full_name || user.email,
      author_email: user.email,
      drawing_id: selectedDrawing?.id || null,
      image_url: imageUrl,
      created_by: user.email
    });
  };

  const handleSelectDrawing = (drawing) => {
    setSelectedDrawing(drawing);
    setSelectedUploadUrl(null);
    setShowDrawingSelector(false);
  };

  const handleRemoveAttachment = () => {
    setSelectedDrawing(null);
    setSelectedUploadUrl(null);
  };

  const openDrawingSelector = () => {
    setCommentingPost(null);
    setShowDrawingSelector(true);
  };

  const openComments = (post) => {
    setShowDrawingSelector(false);
    setCommentingPost(post);
  };

  // ✅ Enveloppe => go page Messages avec ?to=
  const openMessageForPost = (post) => {
    setShowDrawingSelector(false);
    setCommentingPost(null);

    let to = post?.author_email || '';

    if (!to) {
      const guess =
        allUsers.find((u) => u.email && u.email === post?.author_name) ||
        allUsers.find((u) => u.full_name && u.full_name === post?.author_name) ||
        null;
      to = guess?.email || '';
    }

    if (!to) {
      toast.info("Impossible de contacter cet auteur : ce post n'a pas d'email associé.");
      return;
    }
    if (to === user.email) {
      toast.info("Tu ne peux pas t'envoyer un message.");
      return;
    }

    navigate(`/Messages?to=${encodeURIComponent(to)}`);
  };

  const handlePickFromPhone = () => {
    setCommentingPost(null);
    setShowDrawingSelector(true);
    setTimeout(() => fileInputRef.current?.click(), 0);
  };

  const handleFileChosen = async (file) => {
    if (!file) return;

    setUploadingAttach(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setSelectedUploadUrl(file_url);
      setSelectedDrawing(null);
      setShowDrawingSelector(false);
      toast.success('Image ajoutée au post');
    } catch (e) {
      console.error('Upload attach error:', e);
      toast.error('Upload impossible.');
    } finally {
      setUploadingAttach(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  const attachmentPreviewUrl =
    selectedUploadUrl ||
    selectedDrawing?.enhanced_image_url ||
    selectedDrawing?.image_url ||
    null;

  if (!posts) return null;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3">
            <h1 className="font-handwritten text-4xl sm:text-5xl bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
              Communauté
            </h1>

          </div>
          <p className="text-gray-500 mt-1">Partagez vos créations et discutez avec d'autres familles</p>
        </motion.div>

        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
          <CardContent className="p-4 space-y-3">
            <Textarea
              placeholder={`Quoi de neuf, ${user.full_name || 'artiste'} ?`}
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="border-0 bg-gray-50 rounded-xl resize-none"
              rows={3}
            />

            {attachmentPreviewUrl && (
              <div className="relative w-40 h-40 rounded-xl overflow-hidden bg-gray-50 border">
                <img src={attachmentPreviewUrl} alt="Attachment" className="w-full h-full object-cover" />
                <button
                  onClick={handleRemoveAttachment}
                  className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-7 h-7 flex items-center justify-center"
                  title="Retirer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={openDrawingSelector} className="text-violet-600">
                <ImageIcon className="w-4 h-4 mr-2" />
                Ajouter un dessin
              </Button>

              <Button
                onClick={handleCreatePost}
                disabled={(!newPost.trim() && !selectedDrawing && !selectedUploadUrl) || createPostMutation.isPending}
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
            posts.map((post, idx) => {
              const canDelete =
                post?.created_by === user.email ||
                post?.author_email === user.email ||
                post?.author_name === user.email ||
                post?.author_name === user.full_name;

              const canMessage = (() => {
                const direct = post?.author_email;
                if (direct && direct !== user.email) return true;
                const guess =
                  allUsers.find((u) => u.email && u.email === post?.author_name) ||
                  allUsers.find((u) => u.full_name && u.full_name === post?.author_name) ||
                  null;
                return !!guess?.email && guess.email !== user.email;
              })();

              return (
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
                          {String(post.author_name || '?').charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{post.author_name}</h3>
                          <p className="text-xs text-gray-500">
                            {format(new Date(post.created_date), 'dd MMM yyyy à HH:mm', { locale: fr })}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Supprimer"
                              onClick={() => {
                                const ok = window.confirm('Supprimer cette publication ? (irréversible)');
                                if (!ok) return;
                                deletePostMutation.mutate(post);
                              }}
                              disabled={deletePostMutation.isPending}
                              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}

                          {canMessage && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openMessageForPost(post)}
                              title="Envoyer un message"
                              className="text-violet-600 hover:bg-violet-50"
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 pt-2 space-y-3">
                      <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>

                      {post.image_url && (
                        <div className="rounded-xl overflow-hidden">
                          <img src={post.image_url} alt="Post" className="w-full max-h-96 object-contain bg-gray-50" />
                        </div>
                      )}

                      <div className="flex items-center gap-4 pt-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => likeMutation.mutate(post.id)}
                          disabled={likeMutation.isPending}
                          className="text-rose-500 hover:bg-rose-50"
                        >
                          <Heart className={`w-5 h-5 mr-1 ${(post.likes_count || 0) > 0 ? 'fill-rose-500' : ''}`} />
                          {post.likes_count || 0}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openComments(post)}
                          className="text-violet-600 hover:bg-violet-50"
                        >
                          <MessageCircle className="w-5 h-5 mr-1" />
                          {post.comments_count || 0}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>

        <Dialog open={showDrawingSelector} onOpenChange={(v) => setShowDrawingSelector(v)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>Ajouter un dessin au post</DialogTitle>
            </DialogHeader>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (f) handleFileChosen(f);
              }}
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handlePickFromPhone}
                disabled={uploadingAttach}
                className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white"
              >
                {uploadingAttach ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Upload...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Choisir depuis mon téléphone
                  </>
                )}
              </Button>

              <Button variant="outline" onClick={() => setShowDrawingSelector(false)} className="rounded-xl">
                Fermer
              </Button>
            </div>

            <div className="mt-5">
              <p className="text-sm text-gray-500 mb-3">Ou sélectionne un dessin déjà dans ton espace :</p>

              {myDrawings.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl">
                  <p className="text-gray-500">Aucun dessin trouvé.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Ajoute d'abord un dessin dans “Mon Espace”, ou utilise “Choisir depuis mon téléphone”.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {myDrawings.map((drawing) => (
                    <div
                      key={drawing.id}
                      onClick={() => handleSelectDrawing(drawing)}
                      className="cursor-pointer rounded-xl overflow-hidden hover:ring-2 ring-violet-500 transition-all"
                      title={drawing.title}
                    >
                      <img
                        src={drawing.enhanced_image_url || drawing.image_url}
                        alt={drawing.title}
                        className="w-full aspect-square object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={!!commentingPost}
          onOpenChange={() => {
            setCommentingPost(null);
            setNewComment('');
          }}
        >
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>Commentaires</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {postComments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {String(comment.author_name || '?').charAt(0).toUpperCase()}
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

              {postComments.length === 0 && <p className="text-center text-gray-500 py-4">Aucun commentaire</p>}

              <div className="flex gap-2 pt-3 border-t">
                <Input
                  placeholder="Écrire un commentaire..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 rounded-xl"
                />
                <Button
                  onClick={() => commentMutation.mutate({ postId: commentingPost.id, content: newComment })}
                  disabled={!newComment.trim() || commentMutation.isPending}
                  className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white"
                >
                  {commentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

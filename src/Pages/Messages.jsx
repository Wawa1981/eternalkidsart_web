// src/Pages/Messages.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Inbox, Loader2, Send, Trash2, Reply } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';

export default function Messages() {
  const [user, setUser] = useState(null);

  const [tab, setTab] = useState('inbox'); // inbox | sent | new
  const [search, setSearch] = useState('');
  const [composeTo, setComposeTo] = useState('');
  const [composeMessage, setComposeMessage] = useState('');

  const [openMsg, setOpenMsg] = useState(null); // message sélectionné (modal)

  const location = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
      } catch {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  // ✅ préremplir depuis ?to=
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const to = params.get('to');
    if (to) {
      setTab('new');
      setComposeTo(to);
      setComposeMessage('');
    }
  }, [location.search]);

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    enabled: !!user
  });

  const { data: inboxMessagesRaw = [], isLoading: inboxLoading } = useQuery({
    queryKey: ['messagesInbox', user?.email],
    queryFn: () => base44.entities.Message.filter({ recipient_email: user.email }, '-created_date', 200),
    enabled: !!user
  });

  const { data: sentMessagesRaw = [], isLoading: sentLoading } = useQuery({
    queryKey: ['messagesSent', user?.email],
    queryFn: () => base44.entities.Message.filter({ sender_email: user.email }, '-created_date', 200),
    enabled: !!user
  });

  // ✅ Soft-delete (filtré côté front)
  const inboxMessages = useMemo(
    () => (inboxMessagesRaw || []).filter((m) => !m.deleted_by_recipient),
    [inboxMessagesRaw]
  );
  const sentMessages = useMemo(
    () => (sentMessagesRaw || []).filter((m) => !m.deleted_by_sender),
    [sentMessagesRaw]
  );

  const unreadCount = useMemo(
    () => (inboxMessages || []).filter((m) => !m.is_read).length,
    [inboxMessages]
  );

  const usersForSelect = (allUsers || []).filter((u) => u.email && u.email !== user?.email);

  const filteredInbox = (inboxMessages || []).filter((m) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      String(m.sender_name || '').toLowerCase().includes(s) ||
      String(m.sender_email || '').toLowerCase().includes(s) ||
      String(m.content || '').toLowerCase().includes(s)
    );
  });

  const filteredSent = (sentMessages || []).filter((m) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      String(m.recipient_email || '').toLowerCase().includes(s) ||
      String(m.content || '').toLowerCase().includes(s)
    );
  });

  const markReadMutation = useMutation({
    mutationFn: async (msg) => {
      if (msg.is_read) return;
      await base44.entities.Message.update(msg.id, { is_read: true });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messagesInbox', user?.email] })
  });

  const messageMutation = useMutation({
    mutationFn: (data) => base44.entities.Message.create(data),
    onSuccess: () => {
      toast.success('Message envoyé !');
      queryClient.invalidateQueries({ queryKey: ['messagesInbox', user?.email] });
      queryClient.invalidateQueries({ queryKey: ['messagesSent', user?.email] });
      setComposeMessage('');
      setTab('sent');
    },
    onError: (e) => {
      console.error('Message error:', e);
      toast.error("Impossible d'envoyer le message.");
    }
  });

  // ✅ Soft delete (cache le message pour toi)
  const deleteMessageMutation = useMutation({
    mutationFn: async ({ msg, where }) => {
      // where: 'inbox' | 'sent'
      try {
        if (where === 'inbox') {
          await base44.entities.Message.update(msg.id, { deleted_by_recipient: true });
        } else {
          await base44.entities.Message.update(msg.id, { deleted_by_sender: true });
        }
        return;
      } catch (e1) {
        console.error('Soft delete failed:', e1);

        // fallback: si tu es l'expéditeur, on tente un hard delete
        const isSender = (msg.sender_email && user?.email && msg.sender_email === user.email) || msg.created_by === user?.email;
        if (isSender) {
          await base44.entities.Message.delete(msg.id);
          return;
        }

        // sinon on informe clairement
        throw e1;
      }
    },
    onSuccess: () => {
      toast.success('Message supprimé');
      setOpenMsg(null);
      queryClient.invalidateQueries({ queryKey: ['messagesInbox', user?.email] });
      queryClient.invalidateQueries({ queryKey: ['messagesSent', user?.email] });
    },
    onError: (e) => {
      console.error('Delete message error:', e);
      toast.error("Impossible de supprimer : ajoute 'deleted_by_recipient' / 'deleted_by_sender' dans Message si nécessaire.");
    }
  });

  const sendMessage = () => {
    if (!composeTo || !composeMessage.trim()) return;

    messageMutation.mutate({
      recipient_email: composeTo,
      sender_email: user.email,
      sender_name: user.full_name || user.email,
      content: composeMessage,
      is_read: false,
      created_by: user.email
    });
  };

  const openMessage = async (m, where) => {
    setOpenMsg({ ...m, _where: where });
    if (where === 'inbox') {
      markReadMutation.mutate(m);
    }
  };

  const replyToMessage = (m) => {
    const to = m.sender_email || '';
    if (!to) {
      toast.info("Impossible de répondre : pas d'email expéditeur.");
      return;
    }
    if (to === user.email) {
      toast.info("Tu ne peux pas te répondre à toi-même.");
      return;
    }

    const dateStr = m.created_date ? format(new Date(m.created_date), 'dd MMM yyyy HH:mm', { locale: fr }) : '';
    const header = `\n\n—\nRéponse à ${m.sender_name || m.sender_email || 'Inconnu'} (${dateStr}) :\n`;
    const quoted = String(m.content || '')
      .split('\n')
      .map((l) => `> ${l}`)
      .join('\n');

    setTab('new');
    setComposeTo(to);
    setComposeMessage((prev) => (prev?.trim() ? prev : '') + header + quoted + '\n\n');
    setOpenMsg(null);
  };

  const tabBtn = (active) =>
    active
      ? 'rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600 px-3 py-2 text-sm'
      : 'rounded-xl border bg-white hover:bg-gray-50 px-3 py-2 text-sm';

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
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="flex items-center justify-center gap-2">
            <Inbox className="w-6 h-6 text-violet-600" />
            <h1 className="font-handwritten text-4xl sm:text-5xl bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
              Messages
            </h1>
          </div>
          <p className="text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} non lu(s)` : 'Ta boîte de réception'}
          </p>
        </motion.div>

        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <div className="flex gap-2 flex-wrap">
                <button className={tabBtn(tab === 'inbox')} onClick={() => setTab('inbox')} type="button">
                  Réception {unreadCount > 0 ? `(${unreadCount})` : ''}
                </button>
                <button className={tabBtn(tab === 'sent')} onClick={() => setTab('sent')} type="button">
                  Envoyés
                </button>
                <button className={tabBtn(tab === 'new')} onClick={() => setTab('new')} type="button">
                  Nouveau
                </button>
              </div>

              <Input
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl sm:w-64"
              />
            </div>

            {/* INBOX */}
            {tab === 'inbox' && (
              <div className="space-y-2">
                {inboxLoading ? (
                  <div className="text-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto" />
                  </div>
                ) : filteredInbox.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-xl text-gray-500">Aucun message reçu.</div>
                ) : (
                  filteredInbox.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => openMessage(m, 'inbox')}
                      className={`w-full text-left p-4 rounded-xl border hover:bg-gray-50 transition ${
                        m.is_read ? 'bg-white' : 'bg-violet-50 border-violet-200'
                      }`}
                      type="button"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 truncate">
                            {m.sender_name || m.sender_email || 'Inconnu'}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">{m.content}</p>
                        </div>
                        <div className="text-xs text-gray-400 whitespace-nowrap">
                          {m.created_date ? format(new Date(m.created_date), 'dd MMM yyyy HH:mm', { locale: fr }) : ''}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* SENT */}
            {tab === 'sent' && (
              <div className="space-y-2">
                {sentLoading ? (
                  <div className="text-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto" />
                  </div>
                ) : filteredSent.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-xl text-gray-500">Aucun message envoyé.</div>
                ) : (
                  filteredSent.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => openMessage(m, 'sent')}
                      className="w-full text-left p-4 rounded-xl border hover:bg-gray-50 transition bg-white"
                      type="button"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 truncate">À : {m.recipient_email || 'Inconnu'}</p>
                          <p className="text-sm text-gray-600 line-clamp-2">{m.content}</p>
                        </div>
                        <div className="text-xs text-gray-400 whitespace-nowrap">
                          {m.created_date ? format(new Date(m.created_date), 'dd MMM yyyy HH:mm', { locale: fr }) : ''}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* NEW */}
            {tab === 'new' && (
              <div className="bg-violet-50/50 rounded-xl p-4 space-y-3 border border-violet-100">
                <div>
                  <label className="text-sm font-medium text-gray-700">Destinataire</label>
                  <select
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Choisir un destinataire…</option>
                    {usersForSelect.map((u) => (
                      <option key={u.email} value={u.email}>
                        {u.full_name ? `${u.full_name} (${u.email})` : u.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Message</label>
                  <Textarea
                    value={composeMessage}
                    onChange={(e) => setComposeMessage(e.target.value)}
                    rows={6}
                    className="mt-1 rounded-xl bg-white"
                    placeholder="Écris ton message…"
                  />
                </div>

                <Button
                  onClick={sendMessage}
                  disabled={!composeTo || !composeMessage.trim() || messageMutation.isPending}
                  className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white"
                >
                  {messageMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Envoyer
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ✅ MODAL DÉTAIL MESSAGE + RÉPONDRE + SUPPRIMER */}
        <Dialog open={!!openMsg} onOpenChange={() => setOpenMsg(null)}>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle>Détail du message</DialogTitle>
            </DialogHeader>

            {openMsg && (
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  {openMsg._where === 'inbox' ? (
                    <>
                      <div>
                        <span className="font-medium text-gray-800">De :</span>{' '}
                        {openMsg.sender_name || openMsg.sender_email || 'Inconnu'}
                        {openMsg.sender_email ? ` (${openMsg.sender_email})` : ''}
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">À :</span> {user.email}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="font-medium text-gray-800">À :</span>{' '}
                        {openMsg.recipient_email || 'Inconnu'}
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">De :</span> {user.full_name || user.email}
                      </div>
                    </>
                  )}

                  {openMsg.created_date && (
                    <div>
                      <span className="font-medium text-gray-800">Date :</span>{' '}
                      {format(new Date(openMsg.created_date), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </div>
                  )}
                </div>

                <div className="whitespace-pre-wrap bg-gray-50 border rounded-xl p-4 text-gray-800">
                  {openMsg.content}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                  {openMsg._where === 'inbox' && (
                    <Button
                      variant="outline"
                      onClick={() => replyToMessage(openMsg)}
                      className="rounded-xl"
                    >
                      <Reply className="w-4 h-4 mr-2" />
                      Répondre
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    onClick={() => {
                      const ok = window.confirm('Supprimer ce message ?');
                      if (!ok) return;
                      deleteMessageMutation.mutate({ msg: openMsg, where: openMsg._where });
                    }}
                    disabled={deleteMessageMutation.isPending}
                    className="rounded-xl text-rose-600 hover:bg-rose-50"
                  >
                    {deleteMessageMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Supprimer
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// src/Pages/Messages.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';

import {
  ArrowLeft,
  Search,
  Send,
  Trash2,
  Filter,
  Inbox,
  Smile,
  Loader2,
  Paperclip,
  X,
  Image as ImageIcon,
  Video as VideoIcon
} from 'lucide-react';

function useQueryParams() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function safeDate(d) {
  try {
    return d ? new Date(d) : null;
  } catch {
    return null;
  }
}

function pickOtherParticipant(msg, myEmail) {
  const sender = msg?.sender_email || msg?.created_by || '';
  const recipient = msg?.recipient_email || '';
  if (!myEmail) return sender || recipient || '';
  return sender === myEmail ? recipient : sender;
}

function displayNameForThread(otherEmail, usersIndex) {
  const u = usersIndex.get(otherEmail);
  if (!u) return otherEmail || 'Inconnu';
  return u.full_name ? `${u.full_name}` : (u.email || otherEmail || 'Inconnu');
}

function initials(nameOrEmail) {
  const s = String(nameOrEmail || '').trim();
  if (!s) return '?';
  const parts = s.split(/[\s.@_-]+/).filter(Boolean);
  const a = parts[0]?.[0] || '?';
  const b = parts[1]?.[0] || '';
  return (a + b).toUpperCase();
}

function safeParseAttachments(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function attachmentLabel(atts) {
  const a = atts || [];
  if (!a.length) return '';
  const hasImg = a.some((x) => String(x?.type || '').startsWith('image/'));
  const hasVid = a.some((x) => String(x?.type || '').startsWith('video/'));
  if (hasImg && hasVid) return '📎 Photos & vidéos';
  if (hasImg) return '📷 Photo';
  if (hasVid) return '🎬 Vidéo';
  return '📎 Fichier';
}

function clampSnippet(text, n = 80) {
  const t = String(text || '').trim();
  if (!t) return '';
  return t.length > n ? `${t.slice(0, n)}…` : t;
}

async function uploadFile(file) {
  const out = await base44.integrations.Core.UploadFile({ file });
  const url = out?.file_url;
  if (!url) throw new Error('upload_failed');
  return { url, name: file.name, type: file.type, size: file.size };
}

function EmojiPicker({ open, onClose, onPick }) {
  const [q, setQ] = useState('');
  const EMOJIS = useMemo(
    () => [
      '😀','😁','😂','🤣','😊','😍','😘','😎','🥳','🤩','😅','😇','🙂','😉','😭','😤','😡','🤯','😴','🤔',
      '👍','👎','👏','🙌','🙏','💪','🤝','👌','🔥','💯','❤','🧡','💛','💚','💙','💜','🖤','🤍','💔',
      '🎉','🎈','✨','⭐','🌟','⚡','☀','🌙','🌈','🍕','🍔','🍟','🍩','🍪','☕','🍫','🧁',
      '🎮','🎨','🖌','📸','🎵','🎶','💬','🫶'
    ],
    []
  );

  const filtered = useMemo(() => {
    if (!q.trim()) return EMOJIS;
    const s = q.trim().toLowerCase();
    return EMOJIS.filter((e) => e.includes(s));
  }, [q, EMOJIS]);

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smile className="w-5 h-5 text-violet-600" />
            Emojis
          </DialogTitle>
        </DialogHeader>

        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filtrer (optionnel)…"
          className="rounded-xl"
        />

        <div className="mt-3 grid grid-cols-8 gap-2 max-h-64 overflow-y-auto p-2 rounded-xl bg-gray-50 border">
          {filtered.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => onPick(e)}
              className="text-xl hover:scale-110 transition rounded-lg h-10 w-10 flex items-center justify-center bg-white border"
              title={e}
            >
              {e}
            </button>
          ))}
        </div>

        <Button variant="outline" onClick={onClose} className="rounded-xl">
          Fermer
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function DaySeparator({ date }) {
  return (
    <div className="flex items-center gap-3 my-3">
      <div className="h-px bg-gray-200 flex-1" />
      <div className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border">
        {format(date, 'EEEE dd MMMM', { locale: fr })}
      </div>
      <div className="h-px bg-gray-200 flex-1" />
    </div>
  );
}

function MediaGrid({ attachments }) {
  const atts = attachments || [];
  if (!atts.length) return null;

  return (
    <div className="mt-2 grid grid-cols-2 gap-2">
      {atts.map((a, idx) => {
        const url = a?.url;
        const type = String(a?.type || '');
        const name = a?.name || 'media';

        if (!url) return null;

        const isImg = type.startsWith('image/');
        const isVid = type.startsWith('video/');

        if (isImg) {
          return (
            <a
              key={`${url}-${idx}`}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-2xl border bg-white shadow-sm"
              title={name}
            >
              <img src={url} alt={name} className="w-full h-40 object-cover" />
            </a>
          );
        }

        if (isVid) {
          return (
            <div key={`${url}-${idx}`} className="overflow-hidden rounded-2xl border bg-white shadow-sm" title={name}>
              <video src={url} controls className="w-full h-40 object-cover" />
            </div>
          );
        }

        return (
          <a
            key={`${url}-${idx}`}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border bg-white shadow-sm p-3 text-sm text-gray-700 hover:bg-gray-50"
          >
            📎 {name}
          </a>
        );
      })}
    </div>
  );
}

function ChatBubble({ mine, text, time, attachments }) {
  const hasText = Boolean(String(text || '').trim());
  const hasMedia = (attachments || []).length > 0;

  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={[
          'max-w-[78%] sm:max-w-[65%] rounded-2xl px-4 py-2 shadow-sm border',
          mine
            ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white border-transparent'
            : 'bg-white text-gray-800 border-gray-200'
        ].join(' ')}
      >
        {hasText && <div className="whitespace-pre-wrap break-words leading-relaxed">{text}</div>}
        {hasMedia && <MediaGrid attachments={attachments} />}

        {time && (
          <div className={`mt-1 text-[11px] ${mine ? 'text-white/80' : 'text-gray-400'}`}>
            {time}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Messages() {
  const navigate = useNavigate();
  const params = useQueryParams();
  const preselectTo = params.get('to') || '';

  const queryClient = useQueryClient();

  const [user, setUser] = useState(null);
  const [selectedThread, setSelectedThread] = useState(preselectTo);
  const [search, setSearch] = useState('');
  const [onlyUnread, setOnlyUnread] = useState(false);

  const [draft, setDraft] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);

  const [tab, setTab] = useState('inbox'); // inbox | sent | new

  // UPLOAD
  const fileInputRef = useRef(null);
  const [pendingFiles, setPendingFiles] = useState([]); // File[]
  const [pendingPreviews, setPendingPreviews] = useState([]); // {id,url,type,name}
  const [isDragging, setIsDragging] = useState(false);

  const listRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
      } catch {
        base44.auth.redirectToLogin();
      }
    })();
  }, []);

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    enabled: !!user
  });

  const usersIndex = useMemo(() => {
    const m = new Map();
    (allUsers || []).forEach((u) => {
      if (u?.email) m.set(u.email, u);
    });
    return m;
  }, [allUsers]);

  const { data: inbox = [], isLoading: loadingInbox } = useQuery({
    queryKey: ['messagesInbox', user?.email],
    queryFn: () => base44.entities.Message.filter({ recipient_email: user.email }, '-created_date', 500),
    enabled: !!user
  });

  const { data: sent = [], isLoading: loadingSent } = useQuery({
    queryKey: ['messagesSent', user?.email],
    queryFn: () => base44.entities.Message.filter({ sender_email: user.email }, '-created_date', 500),
    enabled: !!user
  });

  const loading = loadingInbox || loadingSent;

  const allMessages = useMemo(() => {
    const merged = [...(inbox || []), ...(sent || [])];
    const seen = new Set();
    const res = [];
    for (const m of merged) {
      if (!m?.id) continue;
      if (seen.has(m.id)) continue;
      seen.add(m.id);
      res.push(m);
    }
    res.sort((a, b) => {
      const da = safeDate(a.created_date)?.getTime() || 0;
      const db = safeDate(b.created_date)?.getTime() || 0;
      return da - db;
    });
    return res;
  }, [inbox, sent]);

  const threads = useMemo(() => {
    const myEmail = user?.email || '';
    const groups = new Map();
    for (const m of allMessages) {
      const other = pickOtherParticipant(m, myEmail);
      if (!other) continue;
      const prev = groups.get(other) || {
        otherEmail: other,
        lastDate: 0,
        unreadCount: 0,
        lastSnippet: ''
      };
      const t = safeDate(m.created_date)?.getTime() || 0;
      const atts = safeParseAttachments(m.attachments);
      const mediaLabel = attachmentLabel(atts);

      if (t >= prev.lastDate) {
        prev.lastDate = t;
        prev.lastSnippet = clampSnippet(m.content, 80) || mediaLabel || '—';
      }
      const recipient = m?.recipient_email || '';
      const isForMe = myEmail && recipient === myEmail;
      if (isForMe && !m.is_read) prev.unreadCount += 1;
      groups.set(other, prev);
    }

    let arr = Array.from(groups.values());
    if (search.trim()) {
      const s = search.toLowerCase();
      arr = arr.filter((t) => {
        const name = displayNameForThread(t.otherEmail, usersIndex).toLowerCase();
        return name.includes(s) || String(t.otherEmail || '').toLowerCase().includes(s);
      });
    }
    if (onlyUnread) arr = arr.filter((t) => t.unreadCount > 0);

    arr.sort((a, b) => (b.lastDate || 0) - (a.lastDate || 0));
    return arr;
  }, [allMessages, user?.email, search, onlyUnread, usersIndex]);

  const sentThreads = useMemo(() => {
    const myEmail = user?.email || '';
    const groups = new Map();
    for (const m of sent) {
      const other = pickOtherParticipant(m, myEmail);
      if (!other) continue;
      const prev = groups.get(other) || {
        otherEmail: other,
        lastDate: 0,
        lastSnippet: ''
      };
      const t = safeDate(m.created_date)?.getTime() || 0;
      const atts = safeParseAttachments(m.attachments);
      const mediaLabel = attachmentLabel(atts);

      if (t >= prev.lastDate) {
        prev.lastDate = t;
        prev.lastSnippet = clampSnippet(m.content, 80) || mediaLabel || '—';
      }
      groups.set(other, prev);
    }

    let arr = Array.from(groups.values());
    if (search.trim()) {
      const s = search.toLowerCase();
      arr = arr.filter((t) => {
        const name = displayNameForThread(t.otherEmail, usersIndex).toLowerCase();
        return name.includes(s) || String(t.otherEmail || '').toLowerCase().includes(s);
      });
    }

    arr.sort((a, b) => (b.lastDate || 0) - (a.lastDate || 0));
    return arr;
  }, [sent, user?.email, search, usersIndex]);

  const selectedMessages = useMemo(() => {
    const myEmail = user?.email || '';
    if (!selectedThread) return [];
    return allMessages.filter((m) => pickOtherParticipant(m, myEmail) === selectedThread);
  }, [allMessages, selectedThread, user?.email]);

  const selectedSentMessages = useMemo(() => {
    const myEmail = user?.email || '';
    if (!selectedThread) return [];
    return sent.filter((m) => pickOtherParticipant(m, myEmail) === selectedThread);
  }, [sent, selectedThread, user?.email]);

  const unreadCountTotal = useMemo(() => {
    return (inbox || []).filter((m) => !m.is_read).length;
  }, [inbox]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [selectedThread, selectedMessages.length, selectedSentMessages.length, tab]);

  const markThreadReadMutation = useMutation({
    mutationFn: async (otherEmail) => {
      const myEmail = user.email;
      const msgs = (inbox || []).filter((m) => {
        const other = pickOtherParticipant(m, myEmail);
        return other === otherEmail && !m.is_read;
      });
      for (const m of msgs) {
        await base44.entities.Message.update(m.id, { is_read: true });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messagesInbox', user?.email] });
    }
  });

  // UPLOAD UI helpers
  useEffect(() => {
    return () => {
      pendingPreviews.forEach((p) => {
        try {
          URL.revokeObjectURL(p.url);
        } catch {
          // ignore
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPendingPreviews((prev) => {
      prev.forEach((p) => {
        try {
          URL.revokeObjectURL(p.url);
        } catch {
          // ignore
        }
      });

      return pendingFiles.map((f) => ({
        id: `${f.name}-${f.size}-${f.lastModified}`,
        url: URL.createObjectURL(f),
        type: f.type,
        name: f.name
      }));
    });
  }, [pendingFiles]);

  function addFiles(fileList) {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;

    const allowed = incoming.filter((f) => {
      const t = String(f.type || '');
      return t.startsWith('image/') || t.startsWith('video/');
    });

    if (allowed.length !== incoming.length) {
      toast.error('Seulement photos / vidéos.');
    }

    const MAX = 6;
    setPendingFiles((prev) => {
      const merged = [...prev, ...allowed];
      if (merged.length > MAX) {
        toast.error(`Max ${MAX} fichiers.`);
        return merged.slice(0, MAX);
      }
      return merged;
    });
  }

  function removePending(idx) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  function clearPending() {
    setPendingFiles([]);
  }

  const sendMutation = useMutation({
    mutationFn: async () => {
      const to = selectedThread;
      if (!to) throw new Error('no recipient');

      const content = draft.trim();
      const hasText = !!content;
      const hasMedia = pendingFiles.length > 0;

      if (!hasText && !hasMedia) throw new Error('empty');

      let attachments = [];
      if (hasMedia) {
        toast.message('Upload en cours…');
        const uploaded = [];
        for (const f of pendingFiles) {
          const up = await uploadFile(f);
          uploaded.push({
            url: up.url,
            name: up.name,
            type: up.type,
            size: up.size
          });
        }
        attachments = uploaded;
      }

      return base44.entities.Message.create({
        recipient_email: to,
        sender_email: user.email,
        sender_name: user.full_name || user.email,
        content: hasText ? content : '',
        attachments, // ✅ champ ajouté dans Message
        is_read: false,
        created_by: user.email
      });
    },
    onSuccess: () => {
      setDraft('');
      clearPending();
      queryClient.invalidateQueries({ queryKey: ['messagesInbox', user?.email] });
      queryClient.invalidateQueries({ queryKey: ['messagesSent', user?.email] });
      toast.success('Envoyé ✅');
    },
    onError: (e) => {
      console.error(e);
      if (String(e?.message || '').includes('empty')) {
        toast.error('Écris un message ou ajoute une photo/vidéo 🙂');
        return;
      }
      toast.error("Impossible d'envoyer le message.");
    }
  });

  const deleteOneMutation = useMutation({
    mutationFn: async (msg) => {
      await base44.entities.Message.delete(msg.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messagesInbox', user?.email] });
      queryClient.invalidateQueries({ queryKey: ['messagesSent', user?.email] });
      toast.success('Message supprimé');
    },
    onError: (e) => {
      console.error(e);
      toast.error('Suppression impossible.');
    }
  });

  const deleteThreadMutation = useMutation({
    mutationFn: async (otherEmail) => {
      const myEmail = user.email;
      const msgs = allMessages.filter((m) => pickOtherParticipant(m, myEmail) === otherEmail);
      for (const m of msgs) {
        await base44.entities.Message.delete(m.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messagesInbox', user?.email] });
      queryClient.invalidateQueries({ queryKey: ['messagesSent', user?.email] });
      toast.success('Conversation supprimée');
      setSelectedThread('');
      navigate('/Messages', { replace: true });
    },
    onError: (e) => {
      console.error(e);
      toast.error('Suppression impossible.');
    }
  });

  useEffect(() => {
    if (preselectTo && !selectedThread) setSelectedThread(preselectTo);
  }, [preselectTo, selectedThread]);

  useEffect(() => {
    if (selectedThread && user?.email && tab === 'inbox') {
      markThreadReadMutation.mutate(selectedThread);
    }
  }, [selectedThread, user?.email, tab]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  const selectedTitle = selectedThread
    ? displayNameForThread(selectedThread, usersIndex)
    : 'Sélectionne une conversation';

  const tabBtn = (active) =>
    active
      ? 'rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600 px-3 py-2 text-sm'
      : 'rounded-xl border bg-white hover:bg-gray-50 px-3 py-2 text-sm';

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="rounded-xl" onClick={() => navigate(-1)} title="Retour">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-handwritten text-4xl bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
              Messages
            </h1>

            {unreadCountTotal > 0 && (
              <span className="ml-2 text-xs bg-rose-500 text-white rounded-full px-2 py-1">
                {unreadCountTotal} non lu{unreadCountTotal > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Onglets (inchangés) */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={tabBtn(tab === 'inbox')}
            onClick={() => setTab('inbox')}
          >
            Réception {unreadCountTotal > 0 ? `(${unreadCountTotal})` : ''}
          </button>
          <button
            type="button"
            className={tabBtn(tab === 'sent')}
            onClick={() => setTab('sent')}
          >
            Envoyés
          </button>
          <button
            type="button"
            className={tabBtn(tab === 'new')}
            onClick={() => setTab('new')}
          >
            Nouveau
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Sidebar threads / liste des envoyés / nouveau */}
          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg lg:col-span-1">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    className="pl-9 rounded-xl"
                    placeholder="Rechercher…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                {tab === 'inbox' && (
                  <Button
                    variant={onlyUnread ? 'default' : 'outline'}
                    className={`rounded-xl ${onlyUnread ? 'bg-violet-600 hover:bg-violet-700' : ''}`}
                    onClick={() => setOnlyUnread((v) => !v)}
                    title="Filtrer non lus"
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-2">
              {loading ? (
                <div className="py-10 text-center text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-violet-500" />
                  Chargement…
                </div>
              ) : (
                <>
                  {/* ONGLET RÉCEPTION */}
                  {tab === 'inbox' && (
                    <>
                      {threads.length === 0 ? (
                        <div className="py-10 text-center text-gray-500">
                          <Inbox className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                          Aucune conversation
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {threads.map((t) => {
                            const active = t.otherEmail === selectedThread;
                            const name = displayNameForThread(t.otherEmail, usersIndex);
                            return (
                              <button
                                key={t.otherEmail}
                                type="button"
                                onClick={() => {
                                  setSelectedThread(t.otherEmail);
                                  navigate(`/Messages?to=${encodeURIComponent(t.otherEmail)}`, { replace: true });
                                }}
                                className={[
                                  'w-full text-left p-3 rounded-2xl border transition flex items-center gap-3',
                                  active ? 'bg-violet-50 border-violet-200' : 'bg-white hover:bg-gray-50 border-gray-200'
                                ].join(' ')}
                              >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-300 to-amber-300 flex items-center justify-center text-white font-bold text-sm">
                                  {initials(name)}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="font-semibold text-gray-800 truncate">{name}</div>
                                    {!!t.lastDate && (
                                      <div className="text-[11px] text-gray-400 whitespace-nowrap">
                                        {format(new Date(t.lastDate), 'dd MMM HH:mm', { locale: fr })}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-600 truncate">{t.lastSnippet || '—'}</div>
                                </div>

                                {t.unreadCount > 0 && (
                                  <div className="bg-rose-500 text-white text-xs rounded-full px-2 py-0.5 flex-shrink-0">
                                    {t.unreadCount}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}

                  {/* ONGLET ENVOYÉS */}
                  {tab === 'sent' && (
                    <>
                      {sentThreads.length === 0 ? (
                        <div className="py-10 text-center text-gray-500">
                          <Inbox className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                          Aucun message envoyé.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {sentThreads.map((t) => {
                            const active = t.otherEmail === selectedThread;
                            const name = displayNameForThread(t.otherEmail, usersIndex);
                            return (
                              <button
                                key={t.otherEmail}
                                type="button"
                                onClick={() => {
                                  setSelectedThread(t.otherEmail);
                                  navigate(`/Messages?to=${encodeURIComponent(t.otherEmail)}`, { replace: true });
                                }}
                                className={[
                                  'w-full text-left p-3 rounded-2xl border transition flex items-center gap-3',
                                  active ? 'bg-violet-50 border-violet-200' : 'bg-white hover:bg-gray-50 border-gray-200'
                                ].join(' ')}
                              >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-300 to-amber-300 flex items-center justify-center text-white font-bold text-sm">
                                  {initials(name)}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="font-semibold text-gray-800 truncate">{name}</div>
                                    {!!t.lastDate && (
                                      <div className="text-[11px] text-gray-400 whitespace-nowrap">
                                        {format(new Date(t.lastDate), 'dd MMM HH:mm', { locale: fr })}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-600 truncate">{t.lastSnippet || '—'}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}

                  {/* ONGLET NOUVEAU */}
                  {tab === 'new' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Destinataire</label>
                        <select
                          value={selectedThread}
                          onChange={(e) => setSelectedThread(e.target.value)}
                          className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                        >
                          <option value="">Choisir un destinataire…</option>
                          {allUsers
                            .filter((u) => u.email && u.email !== user.email)
                            .map((u) => (
                              <option key={u.email} value={u.email}>
                                {u.full_name ? `${u.full_name} (${u.email})` : u.email}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">Message</label>
                        <Textarea
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          rows={6}
                          className="mt-1 rounded-xl bg-white"
                          placeholder="Écris ton message…"
                        />
                      </div>

                      <Button
                        onClick={() => {
                          if (!selectedThread || (!draft.trim() && pendingFiles.length === 0)) {
                            toast.error('Destinataire et message requis.');
                            return;
                          }
                          sendMutation.mutate();
                        }}
                        disabled={!selectedThread || (!draft.trim() && pendingFiles.length === 0) || sendMutation.isPending}
                        className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white"
                      >
                        {sendMutation.isPending ? (
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
                </>
              )}
            </CardContent>
          </Card>

          {/* Chat panel (affiche messages différents selon l'onglet) */}
          <Card
            className={`bg-white/80 backdrop-blur border-0 shadow-lg lg:col-span-2 ${
              tab === 'new' ? 'hidden lg:block' : ''
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-800 truncate">{selectedTitle}</div>
                  {selectedThread && (
                    <div className="text-xs text-gray-500 truncate">{selectedThread}</div>
                  )}
                </div>

                {selectedThread && tab !== 'new' && (
                  <Button
                    variant="outline"
                    className="rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50"
                    onClick={() => {
                      const ok = window.confirm('Supprimer toute la conversation ? (irréversible)');
                      if (!ok) return;
                      deleteThreadMutation.mutate(selectedThread);
                    }}
                    disabled={deleteThreadMutation.isPending}
                    title="Supprimer la conversation"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-2">
              {!selectedThread ? (
                <div className="py-16 text-center text-gray-500">
                  Choisis une conversation à gauche.
                </div>
              ) : (
                <>
                  <div
                    ref={listRef}
                    className="h-[52vh] sm:h-[58vh] overflow-y-auto rounded-2xl border bg-gradient-to-b from-white to-gray-50 p-4"
                  >
                    {tab === 'inbox' && selectedMessages.length === 0 ? (
                      <div className="py-14 text-center text-gray-500">
                        Aucun message. Dis bonjour 👋
                      </div>
                    ) : tab === 'sent' && selectedSentMessages.length === 0 ? (
                      <div className="py-14 text-center text-gray-500">
                        Aucun message envoyé à cette personne.
                      </div>
                    ) : (
                      (() => {
                        const myEmail = user.email;
                        const msgs = tab === 'inbox' ? selectedMessages : selectedSentMessages;
                        const chunks = [];
                        let lastDay = null;

                        msgs.forEach((m) => {
                          const d = safeDate(m.created_date);
                          if (d) {
                            if (!lastDay || !isSameDay(lastDay, d)) {
                              chunks.push(<DaySeparator key={`day-${d.toISOString()}`} date={d} />);
                              lastDay = d;
                            }
                          }

                          const sender = m.sender_email || m.created_by || '';
                          const mine = sender === myEmail;
                          const atts = safeParseAttachments(m.attachments);

                          chunks.push(
                            <div key={m.id} className="group relative">
                              <ChatBubble
                                mine={mine}
                                text={m.content || ''}
                                attachments={atts}
                                time={d ? format(d, 'HH:mm', { locale: fr }) : ''}
                              />

                              <div className={`mt-1 flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const ok = window.confirm('Supprimer ce message ?');
                                    if (!ok) return;
                                    deleteOneMutation.mutate(m);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition text-xs text-gray-400 hover:text-rose-600 px-2 py-1"
                                  title="Supprimer"
                                >
                                  Supprimer
                                </button>
                              </div>
                            </div>
                          );
                        });

                        return chunks;
                      })()
                    )}
                  </div>

                  {tab !== 'sent' && (
                    <div
                      className={[
                        'mt-3 p-3 rounded-2xl border bg-white',
                        isDragging ? 'border-violet-400 ring-2 ring-violet-200' : ''
                      ].join(' ')}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDragging(true);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDragging(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDragging(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDragging(false);
                        addFiles(e.dataTransfer.files);
                      }}
                    >
                      {/* PREVIEW */}
                      {pendingPreviews.length > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-600">Pièces jointes</div>
                            <button
                              type="button"
                              onClick={clearPending}
                              className="text-xs text-rose-600 hover:text-rose-700"
                            >
                              Tout enlever
                            </button>
                          </div>

                          <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {pendingPreviews.map((p, idx) => {
                              const isImg = String(p.type || '').startsWith('image/');
                              const isVid = String(p.type || '').startsWith('video/');
                              return (
                                <div key={p.id} className="relative overflow-hidden rounded-2xl border bg-white">
                                  <button
                                    type="button"
                                    onClick={() => removePending(idx)}
                                    className="absolute top-1 right-1 z-10 bg-white/90 hover:bg-white rounded-full p-1 shadow"
                                    title="Retirer"
                                  >
                                    <X className="w-4 h-4 text-gray-700" />
                                  </button>

                                  {isImg ? (
                                    <img src={p.url} alt={p.name} className="h-24 w-full object-cover" />
                                  ) : isVid ? (
                                    <video src={p.url} className="h-24 w-full object-cover" />
                                  ) : (
                                    <div className="h-24 flex items-center justify-center text-xs text-gray-600 p-2">
                                      📎 {p.name}
                                    </div>
                                  )}

                                  <div className="px-2 py-1 text-[11px] text-gray-500 truncate">{p.name}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex items-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => setEmojiOpen(true)}
                          title="Ajouter un emoji"
                        >
                          <Smile className="w-4 h-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => fileInputRef.current?.click()}
                          title="Ajouter une photo ou une vidéo"
                        >
                          <Paperclip className="w-4 h-4 mr-2" />
                          Photo/Vidéo
                        </Button>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            addFiles(e.target.files);
                            e.target.value = '';
                          }}
                        />

                        <Textarea
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          placeholder={isDragging ? 'Dépose tes photos/vidéos ici ✨' : 'Écris un message…'}
                          rows={2}
                          className="rounded-2xl resize-none bg-gray-50 border-gray-200 flex-1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              if (!sendMutation.isPending) sendMutation.mutate();
                            }
                          }}
                        />

                        <Button
                          onClick={() => sendMutation.mutate()}
                          disabled={sendMutation.isPending || (!draft.trim() && pendingFiles.length === 0)}
                          className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white"
                          title="Envoyer"
                        >
                          {sendMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Envoyer
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                        <div>Entrée = envoyer • Shift+Entrée = saut de ligne</div>
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1">
                            <ImageIcon className="w-4 h-4" /> Photos
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <VideoIcon className="w-4 h-4" /> Vidéos
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {tab !== 'sent' && (
                    <EmojiPicker
                      open={emojiOpen}
                      onClose={() => setEmojiOpen(false)}
                      onPick={(e) => {
                        setDraft((d) => (d ? `${d}${e}` : e));
                        setEmojiOpen(false);
                      }}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

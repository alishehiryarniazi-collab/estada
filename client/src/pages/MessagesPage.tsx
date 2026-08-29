/**
 * Messages — in-app chat between buyers and dealers, one thread per enquiry.
 * Real-time via Socket.IO; falls back to the stored history on load. Phone
 * numbers stay hidden until BOTH sides tap "Share my number".
 */
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Send, Phone, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { getSocket } from '../lib/socket';
import * as chatService from '../services/chatService';
import type { Thread, ChatMessage, PhoneState } from '../services/chatService';
import { apiErrorMessage } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';

export default function MessagesPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const openAuth = useUiStore((s) => s.openAuth);

  const [threads, setThreads] = useState<Thread[]>([]);
  const [selected, setSelected] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [phone, setPhone] = useState<{ state: PhoneState; buyer: string | null; dealer: string | null } | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const selectedRef = useRef<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Load threads + wire the socket once.
  useEffect(() => {
    if (!user) return;
    chatService.getThreads().then(setThreads).catch(() => undefined);

    const socket = getSocket();
    const onMessage = (msg: ChatMessage & { enquiryId?: string }) => {
      if (msg.enquiryId && msg.enquiryId === selectedRef.current) {
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      }
      // Bump the thread's last message in the list.
      setThreads((prev) =>
        prev.map((t) => (t.id === msg.enquiryId ? { ...t, lastMessage: msg.content, lastAt: msg.createdAt } : t)),
      );
    };
    const onPhone = (state: PhoneState) =>
      setPhone((p) => (p ? { ...p, state } : { state, buyer: null, dealer: null }));

    socket.on('message', onMessage);
    socket.on('phone-updated', onPhone);
    return () => {
      socket.off('message', onMessage);
      socket.off('phone-updated', onPhone);
    };
  }, [user]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openThread = async (t: Thread) => {
    setSelected(t);
    selectedRef.current = t.id;
    setPhone({ state: t.phone, buyer: null, dealer: null });
    setLoading(true);
    try {
      const data = await chatService.getMessages(t.id);
      setMessages(data.messages);
      getSocket().emit('join', t.id);
    } catch (e) {
      apiErrorMessage(e);
    } finally {
      setLoading(false);
    }
  };

  const send = (e: FormEvent) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || !selected) return;
    getSocket().emit('message', { enquiryId: selected.id, content });
    setInput('');
  };

  const sharePhone = async () => {
    if (!selected) return;
    const res = await chatService.sharePhone(selected.id);
    setPhone({ state: res.phone, buyer: res.buyerPhone, dealer: res.dealerPhone });
  };

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-canvas">
        <Navbar />
        <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-6 text-center">
          <p className="text-ink">{t('msg.loginPrompt')}</p>
          <button onClick={() => openAuth('login')} className="mt-4 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white">
            {t('nav.login')}
          </button>
        </main>
      </div>
    );
  }

  const mySideShared = phone && (selected?.isBuyer ? phone.state.sharedByBuyer : phone.state.sharedByDealer);

  return (
    <div className="flex h-screen flex-col bg-canvas">
      <Navbar />
      <div className="mx-auto flex w-full max-w-6xl flex-1 overflow-hidden px-0 sm:px-6 sm:py-4">
        {/* Thread list */}
        <aside className={`${selected ? 'hidden' : 'block'} w-full border-r border-hairline bg-surface sm:block sm:w-80`}>
          <h1 className="border-b border-hairline p-4 font-heading text-lg font-semibold text-ink">{t('msg.title')}</h1>
          {threads.length === 0 ? (
            <p className="p-4 text-sm text-ink-muted">{t('msg.noConversations')}</p>
          ) : (
            <ul className="divide-y divide-hairline">
              {threads.map((t) => (
                <li key={t.id}>
                  <button onClick={() => openThread(t)} className={`flex w-full items-center gap-3 p-3 text-left hover:bg-canvas ${selected?.id === t.id ? 'bg-canvas' : ''}`}>
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-canvas">
                      {t.propertyImage && <img src={t.propertyImage} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-medium text-ink">{t.counterpartName}</p>
                      <p className="line-clamp-1 text-xs text-ink-muted">{t.propertyTitle}</p>
                      <p className="line-clamp-1 text-xs text-ink-muted">{t.lastMessage}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Chat window */}
        <section className={`${selected ? 'flex' : 'hidden'} min-w-0 flex-1 flex-col bg-canvas sm:flex`}>
          {!selected ? (
            <div className="flex flex-1 items-center justify-center text-ink-muted">{t('msg.select')}</div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-hairline bg-surface p-3">
                <button onClick={() => setSelected(null)} className="sm:hidden" aria-label="Back">
                  <ArrowLeft size={20} />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 font-medium text-ink">{selected.counterpartName}</p>
                  <p className="line-clamp-1 text-xs text-ink-muted">{selected.propertyTitle}</p>
                </div>
                {phone?.state.revealed ? (
                  <span className="flex items-center gap-1 rounded-lg bg-verify-light px-3 py-1.5 text-sm font-medium text-verify">
                    <Phone size={14} /> {selected.isBuyer ? phone.dealer : phone.buyer}
                  </span>
                ) : (
                  <button
                    onClick={sharePhone}
                    disabled={!!mySideShared}
                    className="flex items-center gap-1 rounded-lg border border-hairline px-3 py-1.5 text-sm font-medium text-ink hover:bg-canvas disabled:opacity-60"
                  >
                    <Phone size={14} /> {mySideShared ? t('msg.waiting') : t('msg.shareNumber')}
                  </button>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-2 overflow-y-auto p-4">
                {loading ? (
                  <div className="flex justify-center py-6 text-ink-muted"><Loader2 className="animate-spin" /></div>
                ) : (
                  messages.map((m) => {
                    const mine = m.senderId === user.id;
                    return (
                      <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${mine ? 'bg-primary text-white' : 'bg-surface text-ink border border-hairline'}`}>
                          {m.content}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={endRef} />
              </div>

              {/* Composer */}
              <form onSubmit={send} className="flex gap-2 border-t border-hairline bg-surface p-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('msg.typeMessage')}
                  className="flex-1 rounded-full border border-hairline bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-primary"
                />
                <button type="submit" className="grid h-11 w-11 place-items-center rounded-full bg-cta text-white hover:bg-cta-hover" aria-label="Send">
                  <Send size={18} />
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

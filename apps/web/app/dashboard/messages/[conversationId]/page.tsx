"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { toast } from "sonner";

interface MessageRow {
  id: string;
  sender_id: string;
  body: string | null;
  type: string;
  payment_link_url: string | null;
  payment_link_amount: number | null;
  payment_link_used: boolean;
  created_at: string;
  sender: { display_name: string };
}

interface ConversationDetail {
  id: string;
  buyer_id: string;
  artwork: { id: string; title: string; primary_image_url: string; price: number; price_currency: string };
  buyer: { display_name: string };
  artist: { full_name: string };
}

interface Props {
  params: { conversationId: string };
}

export default function ConversationPage({ params }: Props) {
  const { user, isArtist } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabaseRef = useRef(createSupabaseBrowserClient());

  // Charger la conversation et les messages
  useEffect(() => {
    const supabase = supabaseRef.current;

    supabase
      .from("conversations")
      .select("id, buyer_id, artwork:artworks(id, title, primary_image_url, price, price_currency), buyer:profiles!conversations_buyer_id_fkey(display_name), artist:artist_profiles!conversations_artist_id_fkey(full_name)")
      .eq("id", params.conversationId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          toast.error("Impossible de charger la conversation : " + error.message);
          return;
        }
        setConversation(data as unknown as ConversationDetail);
      });

    supabase
      .from("messages")
      .select("*, sender:profiles!messages_sender_id_fkey(display_name)")
      .eq("conversation_id", params.conversationId)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          toast.error("Impossible de charger les messages : " + error.message);
          return;
        }
        setMessages((data as unknown as MessageRow[]) || []);
      });

    // Marquer comme lu
    if (user) {
      const field = isArtist ? "artist_unread" : "buyer_unread";
      supabase
        .from("conversations")
        .update({ [field]: 0 })
        .eq("id", params.conversationId)
        .then(({ error }) => {
          if (error) {
            toast.error("Erreur lors du marquage comme lu : " + error.message);
          }
        });
    }
  }, [params.conversationId, user, isArtist]);

  // Realtime
  useEffect(() => {
    const supabase = supabaseRef.current;
    const channel = supabase
      .channel(`conversation:${params.conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${params.conversationId}`,
        },
        async (payload) => {
          // Charger le sender
          const { data: sender } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("id", payload.new.sender_id)
            .single();

          const msg = { ...payload.new, sender } as unknown as MessageRow;
          setMessages((prev) => [...prev, msg]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [params.conversationId]);

  // Scroll en bas a chaque nouveau message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!user || !newMessage.trim()) return;
    setSending(true);

    const { error } = await supabaseRef.current.from("messages").insert({
      conversation_id: params.conversationId,
      sender_id: user.id,
      body: newMessage.trim(),
      type: "text",
    });

    if (error) {
      toast.error("Erreur lors de l'envoi du message : " + error.message);
      setSending(false);
      return;
    }

    setNewMessage("");
    setSending(false);
  }

  async function handleArchive() {
    const { error } = await supabaseRef.current
      .from("conversations")
      .update({ is_archived: true })
      .eq("id", params.conversationId);
    if (error) {
      toast.error("Erreur lors de l'archivage : " + error.message);
      return;
    }
    toast.success("Conversation archivee");
    router.push("/dashboard/messages");
  }

  async function handleSendPaymentLink() {
    if (!conversation) return;

    try {
      const response = await fetch("/api/stripe/create-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artworkId: conversation.artwork.id,
          conversationId: conversation.id,
          senderId: user?.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast.error(data.error || "Erreur lors de la creation du lien de paiement");
        return;
      }

      toast.success("Lien de paiement envoye !");
    } catch {
      toast.error("Erreur reseau lors de la creation du lien de paiement");
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      {/* Header */}
      {conversation && (
        <div className="flex items-center gap-4 border-b px-6 py-4">
          <img
            src={conversation.artwork.primary_image_url}
            alt={conversation.artwork.title}
            className="h-10 w-10 rounded-lg object-cover"
          />
          <div>
            <p className="font-medium">{conversation.artwork.title}</p>
            <p className="text-sm text-gray-500">
              {isArtist ? conversation.buyer.display_name : conversation.artist?.full_name || "Artiste"} · {conversation.artwork.price} {conversation.artwork.price_currency}
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            {isArtist && (
              <button
                onClick={handleSendPaymentLink}
                className="rounded-md bg-brand-600 px-4 py-1.5 text-sm text-white hover:bg-brand-700"
              >
                Proposer cette oeuvre
              </button>
            )}
            <button
              onClick={handleArchive}
              className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200"
              title="Archiver"
            >
              Archiver
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-sm md:max-w-md rounded-2xl px-4 py-2 ${
                isMe ? "bg-black text-white" : "bg-gray-100"
              }`}>
                {msg.type === "payment_link" ? (
                  <div>
                    <p className="text-sm font-medium">Lien de paiement</p>
                    <p className="text-sm">{msg.payment_link_amount} EUR</p>
                    {msg.payment_link_url && !msg.payment_link_used && (
                      <a href={msg.payment_link_url} target="_blank" rel="noopener noreferrer" className={`mt-1 block text-sm underline ${isMe ? "text-gray-300" : "text-brand-600"}`}>
                        Payer maintenant
                      </a>
                    )}
                    {msg.payment_link_used && (
                      <p className="mt-1 text-xs text-green-400">Paye</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm">{msg.body}</p>
                )}
                <time className={`mt-1 block text-xs ${isMe ? "text-gray-400" : "text-gray-500"}`}>
                  {new Date(msg.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </time>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t px-6 py-4">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-3"
        >
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Votre message..."
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="rounded-full bg-black px-6 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
          >
            Envoyer
          </button>
        </form>
      </div>
    </div>
  );
}

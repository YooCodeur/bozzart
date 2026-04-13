import { useEffect, useState, useRef } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "../../../lib/supabase";

interface MessageRow {
  id: string;
  sender_id: string;
  body: string | null;
  type: string;
  created_at: string;
}

export default function ConversationScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });

    // Charger les messages
    supabase
      .from("messages")
      .select("id, sender_id, body, type, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .then(({ data }) => setMessages((data as MessageRow[]) || []));

    // Realtime
    const channel = supabase
      .channel(`conv-mobile:${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as MessageRow]);
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  async function handleSend() {
    if (!userId || !input.trim()) return;
    setSending(true);
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: userId,
      body: input.trim(),
      type: "text",
    });
    setInput("");
    setSending(false);
  }

  const renderMessage = ({ item }: { item: MessageRow }) => {
    const isMe = item.sender_id === userId;
    return (
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
        <Text style={[styles.msgText, isMe && { color: "#fff" }]}>{item.body}</Text>
        <Text style={[styles.time, isMe && { color: "rgba(255,255,255,0.6)" }]}>
          {new Date(item.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputBar}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Votre message..."
          style={styles.input}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={sending || !input.trim()}
          style={[styles.sendBtn, (!input.trim() || sending) && { opacity: 0.4 }]}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: "80%", borderRadius: 16, padding: 10, marginBottom: 8 },
  bubbleMe: { alignSelf: "flex-end", backgroundColor: "#000" },
  bubbleOther: { alignSelf: "flex-start", backgroundColor: "#f0f0f0" },
  msgText: { fontSize: 15 },
  time: { fontSize: 11, color: "#999", marginTop: 4 },
  inputBar: { flexDirection: "row", padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: "#eee" },
  input: { flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15 },
  sendBtn: { backgroundColor: "#000", borderRadius: 24, paddingHorizontal: 20, justifyContent: "center" },
});

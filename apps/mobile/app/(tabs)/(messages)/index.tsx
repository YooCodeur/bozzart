import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../../lib/supabase";

interface ConversationRow {
  id: string;
  last_message_at: string | null;
  buyer_unread: number;
  artist_unread: number;
  artwork: { title: string; primary_image_url: string };
  buyer: { display_name: string };
}

export default function MessagesScreen() {
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("conversations")
        .select("id, last_message_at, buyer_unread, artist_unread, artwork:artworks(title, primary_image_url), buyer:profiles!conversations_buyer_id_fkey(display_name)")
        .order("last_message_at", { ascending: false, nullsFirst: false });

      setConversations((data as unknown as ConversationRow[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <View style={styles.center}><Text style={{ color: "#999" }}>Chargement...</Text></View>;
  }

  if (conversations.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>Messages</Text>
        <Text style={{ color: "#666", marginTop: 8 }}>Aucune conversation</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Text style={styles.title}>Messages</Text>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push(`/(tabs)/(messages)/${item.id}` as never)}
          >
            <Image source={{ uri: item.artwork.primary_image_url }} style={styles.thumb} />
            <View style={{ flex: 1 }}>
              <Text style={styles.artworkTitle} numberOfLines={1}>{item.artwork.title}</Text>
              <Text style={styles.buyerName} numberOfLines={1}>{item.buyer.display_name}</Text>
            </View>
            {item.artist_unread > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.artist_unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", padding: 16, paddingTop: 60 },
  row: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  thumb: { width: 50, height: 50, borderRadius: 8 },
  artworkTitle: { fontWeight: "600", fontSize: 15 },
  buyerName: { fontSize: 13, color: "#999", marginTop: 2 },
  badge: { backgroundColor: "#7e22ce", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
});

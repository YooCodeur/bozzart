import { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, RefreshControl, StyleSheet } from "react-native";
import { supabase } from "../../../lib/supabase";

interface PostRow {
  id: string;
  type: string;
  caption: string | null;
  media_urls: string[];
  reaction_counts: Record<string, number>;
  comment_count: number;
  created_at: string;
  artist: { full_name: string; slug: string };
}

export default function FeedScreen() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadFeed() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Pas connecte : afficher les posts recents
      const { data } = await supabase
        .from("carnet_posts")
        .select("id, type, caption, media_urls, reaction_counts, comment_count, created_at, artist:artist_profiles(full_name, slug)")
        .order("created_at", { ascending: false })
        .limit(20);
      setPosts((data as unknown as PostRow[]) || []);
    } else {
      // Connecte : posts des artistes suivis
      const { data: follows } = await supabase
        .from("follows")
        .select("artist_id")
        .eq("follower_id", user.id);

      const artistIds = (follows || []).map((f) => f.artist_id);

      if (artistIds.length > 0) {
        const { data } = await supabase
          .from("carnet_posts")
          .select("id, type, caption, media_urls, reaction_counts, comment_count, created_at, artist:artist_profiles(full_name, slug)")
          .in("artist_id", artistIds)
          .order("created_at", { ascending: false })
          .limit(30);
        setPosts((data as unknown as PostRow[]) || []);
      }
    }
  }

  useEffect(() => {
    loadFeed().then(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  }, []);

  const totalReactions = (counts: Record<string, number>) =>
    Object.values(counts || {}).reduce((a, b) => a + b, 0);

  const renderPost = ({ item }: { item: PostRow }) => (
    <View style={styles.post}>
      <View style={styles.postHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(item.artist as unknown as { full_name: string }).full_name.charAt(0)}
          </Text>
        </View>
        <View>
          <Text style={styles.artistName}>{(item.artist as unknown as { full_name: string }).full_name}</Text>
          <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString("fr-FR")}</Text>
        </View>
      </View>

      {item.media_urls.length > 0 && (
        <Image source={{ uri: item.media_urls[0] }} style={styles.media} resizeMode="cover" />
      )}

      {item.caption && <Text style={styles.caption}>{item.caption}</Text>}

      <View style={styles.stats}>
        <Text style={styles.statText}>{totalReactions(item.reaction_counts)} reactions</Text>
        <Text style={styles.statText}>{item.comment_count} commentaires</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#999" }}>Chargement...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      renderItem={renderPost}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingBottom: 80 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>Bienvenue sur Bozzart</Text>
          <Text style={{ color: "#666", marginTop: 8, textAlign: "center" }}>
            Suivez des artistes pour voir leurs posts ici
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  post: { borderBottomWidth: 1, borderBottomColor: "#eee", paddingBottom: 16, marginBottom: 16 },
  postHeader: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, marginBottom: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#eee", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 14, fontWeight: "600", color: "#666" },
  artistName: { fontWeight: "600", fontSize: 15 },
  date: { fontSize: 12, color: "#999" },
  media: { width: "100%", height: 300 },
  caption: { paddingHorizontal: 16, marginTop: 10, fontSize: 15, lineHeight: 21 },
  stats: { flexDirection: "row", gap: 16, paddingHorizontal: 16, marginTop: 10 },
  statText: { fontSize: 13, color: "#999" },
});

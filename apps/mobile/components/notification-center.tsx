import { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";

interface NotificationRow {
  id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  deep_link: string | null;
  created_at: string;
}

export function NotificationCenterMobile() {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  async function loadNotifications() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);

    setNotifications((data as NotificationRow[]) || []);
  }

  useEffect(() => {
    loadNotifications();

    // Realtime
    let channel: ReturnType<typeof supabase.channel> | null = null;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      channel = supabase
        .channel(`notif-mobile:${user.id}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
          (payload) => {
            setNotifications((prev) => [payload.new as NotificationRow, ...prev]);
          },
        )
        .subscribe();
    });

    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, []);

  async function handleTap(notif: NotificationRow) {
    // Marquer comme lu
    if (!notif.is_read) {
      await supabase.from("notifications").update({ is_read: true }).eq("id", notif.id);
      setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, is_read: true } : n));
    }
    if (notif.deep_link) {
      router.push(notif.deep_link as never);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Text style={styles.title}>Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={{ padding: 32, alignItems: "center" }}>
            <Text style={{ color: "#999" }}>Aucune notification</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleTap(item)}
            style={[styles.row, !item.is_read && styles.unread]}
          >
            <Text style={styles.notifTitle}>{item.title}</Text>
            {item.body && <Text style={styles.notifBody}>{item.body}</Text>}
            <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString("fr-FR")}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "bold", padding: 16, paddingTop: 60 },
  row: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  unread: { backgroundColor: "#faf5ff" },
  notifTitle: { fontWeight: "600", fontSize: 15 },
  notifBody: { color: "#666", fontSize: 13, marginTop: 2 },
  date: { color: "#999", fontSize: 12, marginTop: 4 },
});

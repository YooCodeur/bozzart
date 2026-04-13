import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../../lib/supabase";

interface ProfileData {
  display_name: string;
  username: string;
  bio: string | null;
  role: string;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("display_name, username, bio, role")
        .eq("id", user.id)
        .single();

      setProfile(data as ProfileData | null);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSignOut() {
    // Desactiver le push token avant deconnexion
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("push_tokens")
        .update({ is_active: false })
        .eq("user_id", user.id);
    }
    await supabase.auth.signOut();
    router.replace("/(auth)/login");
  }

  if (loading) {
    return <View style={styles.center}><Text style={{ color: "#999" }}>Chargement...</Text></View>;
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>Bozzart</Text>
        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          style={styles.btn}
        >
          <Text style={styles.btnText}>Se connecter</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/(auth)/signup")}
          style={[styles.btn, { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd", marginTop: 10 }]}
        >
          <Text style={[styles.btnText, { color: "#000" }]}>Creer un compte</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }} contentContainerStyle={{ padding: 24, paddingTop: 80 }}>
      {/* Avatar placeholder */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{profile.display_name.charAt(0)}</Text>
      </View>

      <Text style={styles.name}>{profile.display_name}</Text>
      <Text style={styles.username}>@{profile.username}</Text>
      {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Role</Text>
        <Text style={styles.sectionValue}>
          {profile.role === "artist" ? "Artiste" : profile.role === "both" ? "Artiste & Acheteur" : "Acheteur"}
        </Text>
      </View>

      <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
        <Text style={{ color: "#dc2626", fontWeight: "600" }}>Deconnexion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  btn: { backgroundColor: "#000", borderRadius: 8, paddingHorizontal: 32, paddingVertical: 14, width: "100%", alignItems: "center" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#f0f0f0", alignItems: "center", justifyContent: "center", alignSelf: "center" },
  avatarText: { fontSize: 28, fontWeight: "bold", color: "#666" },
  name: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginTop: 16 },
  username: { fontSize: 15, color: "#999", textAlign: "center", marginTop: 4 },
  bio: { fontSize: 15, color: "#666", textAlign: "center", marginTop: 12 },
  section: { marginTop: 32, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#f0f0f0" },
  sectionTitle: { fontSize: 13, color: "#999", textTransform: "uppercase" },
  sectionValue: { fontSize: 16, marginTop: 4 },
  signOutBtn: { marginTop: 40, padding: 16, alignItems: "center", borderRadius: 8, borderWidth: 1, borderColor: "#fecaca" },
});

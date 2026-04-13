import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link } from "expo-router";
import { supabase } from "../../lib/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: "bozzart://callback" },
    });

    if (error) {
      Alert.alert("Erreur", error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <View style={styles.container}>
        <View style={styles.centeredContent}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkMark}>&#10003;</Text>
          </View>
          <Text style={styles.sentTitle}>Verifiez votre email</Text>
          <Text style={styles.sentText}>
            Un lien de connexion a ete envoye a
          </Text>
          <Text style={styles.sentEmail}>{email}</Text>
          <TouchableOpacity
            onPress={() => {
              setSent(false);
              setEmail("");
            }}
            style={styles.linkButton}
          >
            <Text style={styles.linkButtonText}>Utiliser une autre adresse</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centeredContent}>
          {/* Logo */}
          <Text style={styles.logo}>Bozzart</Text>

          {/* Title */}
          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>
            Recevez un lien de connexion par email
          </Text>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="vous@exemple.com"
              placeholderTextColor="#ccc"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              style={styles.input}
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading || !email.includes("@")}
            style={[
              styles.button,
              (loading || !email.includes("@")) && styles.buttonDisabled,
            ]}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>
              {loading ? "Envoi..." : "Envoyer le lien"}
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Pas encore de compte ? </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>S&apos;inscrire</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
  },
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  logo: {
    fontSize: 38,
    fontWeight: "700",
    color: "#000",
    letterSpacing: -0.5,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginBottom: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#999",
  },
  fieldGroup: {
    width: "100%",
    marginTop: 32,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: "#999",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 15,
    color: "#000",
    backgroundColor: "#fff",
  },
  button: {
    width: "100%",
    marginTop: 24,
    backgroundColor: "#000",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    marginTop: 48,
  },
  footerText: {
    fontSize: 14,
    color: "#999",
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  // Sent state
  checkCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  checkMark: {
    fontSize: 20,
    color: "#000",
  },
  sentTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  sentText: {
    fontSize: 14,
    color: "#999",
  },
  sentEmail: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginTop: 4,
    marginBottom: 32,
  },
  linkButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  linkButtonText: {
    fontSize: 14,
    color: "#999",
  },
});

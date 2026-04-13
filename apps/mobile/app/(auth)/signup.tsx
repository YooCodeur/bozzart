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

type Role = "buyer" | "artist";

export default function SignupScreen() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const usernameClean = username.toLowerCase().replace(/[^a-z0-9-]/g, "");

  function canAdvance() {
    if (step === 1) return role !== null;
    if (step === 2)
      return displayName.trim().length > 0 && usernameClean.length >= 3;
    return email.includes("@");
  }

  async function handleSignup() {
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "bozzart://callback",
        data: { username: usernameClean, display_name: displayName, role },
      },
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
            Un lien de confirmation a ete envoye a
          </Text>
          <Text style={styles.sentEmail}>{email}</Text>
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
          <Text style={styles.title}>Creer un compte</Text>
          <Text style={styles.subtitle}>Etape {step} sur 3</Text>

          {/* Step dots */}
          <View style={styles.dotsRow}>
            {[1, 2, 3].map((s) => (
              <View
                key={s}
                style={[
                  styles.dot,
                  s === step && styles.dotActive,
                  s < step && styles.dotDone,
                ]}
              />
            ))}
          </View>

          {/* Step 1: Role */}
          {step === 1 && (
            <View style={styles.stepContent}>
              <TouchableOpacity
                onPress={() => setRole("artist")}
                style={[
                  styles.roleCard,
                  role === "artist" && styles.roleCardActive,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.roleTitle,
                    role === "artist" && styles.roleTitleActive,
                  ]}
                >
                  Artiste
                </Text>
                <Text
                  style={[
                    styles.roleDesc,
                    role === "artist" && styles.roleDescActive,
                  ]}
                >
                  Exposez et vendez vos oeuvres
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setRole("buyer")}
                style={[
                  styles.roleCard,
                  role === "buyer" && styles.roleCardActive,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.roleTitle,
                    role === "buyer" && styles.roleTitleActive,
                  ]}
                >
                  Collectionneur
                </Text>
                <Text
                  style={[
                    styles.roleDesc,
                    role === "buyer" && styles.roleDescActive,
                  ]}
                >
                  Decouvrez et achetez des oeuvres
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 2: Identity */}
          {step === 2 && (
            <View style={styles.stepContent}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nom affiche</Text>
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Marie Dupont"
                  placeholderTextColor="#ccc"
                  autoComplete="name"
                  style={styles.input}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nom d&apos;utilisateur</Text>
                <TextInput
                  value={username}
                  onChangeText={(t) =>
                    setUsername(t.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                  }
                  placeholder="marie-dupont"
                  placeholderTextColor="#ccc"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
                {usernameClean.length > 0 && (
                  <Text style={styles.hint}>
                    bozzart.art/
                    <Text style={styles.hintBold}>{usernameClean}</Text>
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Step 3: Email */}
          {step === 3 && (
            <View style={styles.stepContent}>
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
            </View>
          )}

          {/* Navigation */}
          <View style={styles.navRow}>
            {step > 1 && (
              <TouchableOpacity
                onPress={() => setStep(step - 1)}
                style={styles.backBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.backBtnText}>Retour</Text>
              </TouchableOpacity>
            )}
            {step < 3 ? (
              <TouchableOpacity
                onPress={() => setStep(step + 1)}
                disabled={!canAdvance()}
                style={[
                  styles.button,
                  step === 1 && { width: "100%" },
                  !canAdvance() && styles.buttonDisabled,
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>Continuer</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleSignup}
                disabled={loading || !canAdvance()}
                style={[
                  styles.button,
                  (loading || !canAdvance()) && styles.buttonDisabled,
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Creation..." : "Creer mon compte"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Deja un compte ? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Se connecter</Text>
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
  dotsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#e5e5e5",
  },
  dotActive: {
    width: 20,
    backgroundColor: "#000",
  },
  dotDone: {
    backgroundColor: "#000",
  },
  stepContent: {
    width: "100%",
    marginTop: 32,
  },
  // Role cards
  roleCard: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 10,
  },
  roleCardActive: {
    borderColor: "#000",
    backgroundColor: "#000",
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  roleTitleActive: {
    color: "#fff",
  },
  roleDesc: {
    fontSize: 13,
    color: "#999",
    marginTop: 4,
  },
  roleDescActive: {
    color: "rgba(255,255,255,0.6)",
  },
  // Fields
  fieldGroup: {
    width: "100%",
    marginBottom: 16,
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
  hint: {
    marginTop: 8,
    fontSize: 12,
    color: "#999",
  },
  hintBold: {
    fontWeight: "600",
    color: "#000",
  },
  // Navigation
  navRow: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
    marginTop: 24,
  },
  button: {
    flex: 1,
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
  backBtn: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
  // Footer
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
  },
});

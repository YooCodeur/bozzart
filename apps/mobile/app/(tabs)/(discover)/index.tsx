import { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../../lib/supabase";

interface DiscoveryArtwork {
  id: string;
  title: string;
  primary_image_url: string;
  price: number;
  price_currency: string;
  slug: string;
  artist: { full_name: string; slug: string };
}

export default function DiscoverScreen() {
  const [artworks, setArtworks] = useState<DiscoveryArtwork[]>([]);
  const [slideHeight, setSlideHeight] = useState<number>(0);
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    supabase
      .from("artworks")
      .select("id, title, primary_image_url, price, price_currency, slug, artist:artist_profiles(full_name, slug)")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setArtworks((data as unknown as DiscoveryArtwork[]) || []);
      });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: DiscoveryArtwork }) => (
      <View style={{ height: slideHeight, width: SCREEN_WIDTH, position: "relative" }}>
        <Image source={{ uri: item.primary_image_url }} style={styles.image} resizeMode="cover" />
        
        {/* Dégradé fluide uniquement sur la moitié basse pour garder l'œuvre visible */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.85)"]}
          style={styles.gradient}
          locations={[0.4, 1]}
        />
        
        <View style={[styles.info, { paddingBottom: 24 }]}>
          <Text style={styles.artistName}>{item.artist.full_name}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.price}>
            {item.price} {item.price_currency}
          </Text>
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.buyButton}>
              <Text style={styles.buyText}>Acheter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.viewText}>Voir l&apos;œuvre</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    ),
    [slideHeight, SCREEN_WIDTH]
  );

  return (
    <View
      style={styles.container}
      onLayout={(e) => setSlideHeight(e.nativeEvent.layout.height)}
    >
      {slideHeight > 0 && (
        <FlatList
          data={artworks}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={slideHeight}
          decelerationRate="fast"
          bounces={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  info: {
    position: "absolute",
    bottom: 0,
    left: 20,
    right: 20,
    justifyContent: "flex-end",
  },
  artistName: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    fontWeight: "500",
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 4,
    fontFamily: "serif", // À relier à la police Playfair si configurée en natif
  },
  price: {
    color: "#fff",
    fontSize: 20,
    marginTop: 8,
    fontWeight: "600",
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  buyButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buyText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 16,
  },
  viewButton: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  viewText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

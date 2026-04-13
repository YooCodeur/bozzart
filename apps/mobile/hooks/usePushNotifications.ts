import { useEffect } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function usePushNotifications() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function register() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Demande de permission
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") return;

      // Recuperer le token Expo
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) return;

      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      const token = tokenData.data;

      // Sauvegarder en base
      if (isMounted) {
        await supabase.from("push_tokens").upsert(
          {
            user_id: user.id,
            token,
            platform: Platform.OS,
            is_active: true,
          },
          { onConflict: "user_id,token" },
        );
      }
    }

    register();

    // Handler quand l'utilisateur tape sur une notification
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const deepLink = response.notification.request.content.data?.deepLink;
        if (deepLink && typeof deepLink === "string") {
          router.push(deepLink as never);
        }
      },
    );

    return () => {
      isMounted = false;
      Notifications.removeNotificationSubscription(subscription);
    };
  }, [router]);
}

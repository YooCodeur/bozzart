# Mobile push tokens (Phase 12.2)

TODO: locate the Expo push token registration call in the mobile app (typically
wrapped around `Notifications.getExpoPushTokenAsync()`) and ensure the insert
into `push_tokens` sets `platform: Platform.OS` (i.e. `'ios'` or `'android'`).

Expected shape:

```ts
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { supabase } from "@/lib/supabase";

const { data: tokenData } = await Notifications.getExpoPushTokenAsync();
await supabase.from("push_tokens").upsert(
  {
    user_id: userId,
    token: tokenData.data,
    platform: Platform.OS, // 'ios' | 'android'
    is_active: true,
  },
  { onConflict: "user_id,token" },
);
```

The unified `send-push-notification` Edge Function fans out to Expo Push for
`platform IN ('ios','android')` and to web-push (VAPID) for `platform='web'`.

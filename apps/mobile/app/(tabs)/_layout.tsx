import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="(feed)"
        options={{ title: "Feed", headerShown: false }}
      />
      <Tabs.Screen
        name="(discover)"
        options={{ title: "Decouvrir", headerShown: false }}
      />
      <Tabs.Screen
        name="(messages)"
        options={{ title: "Messages", headerShown: false }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{ title: "Profil", headerShown: false }}
      />
    </Tabs>
  );
}

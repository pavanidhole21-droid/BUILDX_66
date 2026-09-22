import { Stack } from "expo-router";

export default function UserLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="search" />
      <Stack.Screen name="details" />
      <Stack.Screen name="request" />
      <Stack.Screen name="confirmation" />
      <Stack.Screen name="requests" />
      <Stack.Screen name="emergency" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="language" />
    </Stack>
  );
}

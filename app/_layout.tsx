import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack initialRouteName="(tabs)"
      screenOptions={{
        headerStyle:{
          backgroundColor: "#025c57"
        },
        headerTintColor: "white",
      }}
    >
      <Stack.Screen name="(tabs)" options={{headerShown: true, title:"KONTROL"}}/>
      <Stack.Screen name="details" options={{headerShown: true, title:"Détails"}}/>
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

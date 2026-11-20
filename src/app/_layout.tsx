import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { PaperProvider, Text } from "react-native-paper";

import { AuthProvider, useAuth } from "../context/AuthContext";

import { getDatabase } from "../database/database";
import { appTheme, palette } from "../theme/theme";

function RootNavigator() {
  const { token, isLoading } = useAuth();

  const [databaseReady, setDatabaseReady] = useState(false);
  const [databaseError, setDatabaseError] = useState(false);

  useEffect(() => {
    let mounted = true;

    getDatabase()
      .then(() => {
        if (mounted) {
          setDatabaseReady(true);
        }
      })
      .catch((error) => {
        console.error("Database initialization failed", error);

        if (mounted) {
          setDatabaseError(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (databaseError) {
    return (
      <View style={styles.center}>
        <Text variant="titleMedium">Database açıla bilmədi.</Text>

        <Text>Logları yoxlayıb tətbiqi yenidən başladın.</Text>
      </View>
    );
  }

  if (isLoading || !databaseReady) {
    return (
      <View style={styles.center}>
        {/* <ActivityIndicator size="large" /> */}
        <Text>First Loader</Text>
      </View>
    );
  }

  console.log(databaseReady);
  console.log(token);
  console.log();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!token}>
        <Stack.Screen name="login" />
      </Stack.Protected>

      <Stack.Protected guard={!!token}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <PaperProvider theme={appTheme}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 24,
    backgroundColor: palette.background,
  },
});

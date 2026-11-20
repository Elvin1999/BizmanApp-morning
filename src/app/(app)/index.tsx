import { useCallback, useState } from "react";

import { Alert, ScrollView, StyleSheet, View } from "react-native";

import { router, useFocusEffect } from "expo-router";

import { ActivityIndicator, Button, Text } from "react-native-paper";

import { BarChart } from "../../components/BarChart";
import { StatCard } from "../../components/StatCard";
import { useAuth } from "../../context/AuthContext";

import { getDashboardStats } from "../../database/saleRepository";

import { palette } from "../../theme/theme";

import type { DashboardStats } from "../../types/models";

import { money } from "../../utils/format";

export default function DashboardPage() {
  const { signOut } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);

  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      setLoading(true);

      getDashboardStats()
        .then((data) => {
          if (active) {
            setStats(data);
          }
        })
        .catch((error) => {
          console.error(error);

          if (active) {
            Alert.alert("Xəta", "Statistikanı yükləmək olmadı.");
          }
        })
        .finally(() => {
          if (active) {
            setLoading(false);
          }
        });

      return () => {
        active = false;
      };
    }, []),
  );

  const logout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error(error);

      Alert.alert("Xəta", "Çıxış zamanı problem yarandı.");
    }
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <Text variant="headlineMedium" style={styles.title}>
            Bizman CRM
          </Text>

          <Text style={styles.subtitle}>Biznesiniz bir baxışda</Text>
        </View>

        <Button icon="logout" mode="text" compact onPress={logout}>
          Çıxış
        </Button>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={styles.spinner} />
      ) : (
        <>
          <View style={styles.grid}>
            <StatCard
              label="Müştərilər"
              value={String(stats?.clientCount ?? 0)}
            />

            <StatCard
              label="Satışlar"
              value={String(stats?.saleCount ?? 0)}
              accent={palette.success}
            />

            <StatCard
              label="Ümumi gəlir"
              value={money(stats?.revenue ?? 0)}
              accent="#F1AA34"
            />
          </View>

          <BarChart title="Son 6 satış ayı" points={stats?.monthSales ?? []} />

          <Button
            icon="account-plus"
            mode="contained"
            style={styles.action}
            onPress={() => router.push("/clients")}
          >
            Müştərilərə keç
          </Button>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: palette.background,
  },

  content: {
    padding: 18,
    paddingTop: 48,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 23,
  },

  heading: {
    flex: 1,
  },

  title: {
    color: palette.navy,
    fontWeight: "800",
  },

  subtitle: {
    color: palette.muted,
    marginTop: 3,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  spinner: {
    marginTop: 60,
  },

  action: {
    marginTop: 20,
    borderRadius: 12,
  },
});

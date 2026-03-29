import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONTS } from '../utils/theme';
import { studentAPI, analyticsAPI } from '../utils/api';
import { useUser } from '../utils/UserContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, logout } = useUser();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    eligible: 0,
    shortage: 0,
    avgAttendance: 0
  });

  const fetchStats = async () => {
    try {
      const data = await analyticsAPI.semesterWise();
      const avg =
        data.students.reduce((sum: number, s: any) => sum + s.attendancePercent, 0) /
        data.students.length;
      setStats({
        total: data.total,
        eligible: data.eligible,
        shortage: data.shortage,
        avgAttendance: Math.round(avg * 10) / 10
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <Text style={styles.headerSubtitle}>Welcome, {user?.name || 'User'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name='log-out-outline' size={22} color={COLORS.primary} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: COLORS.primary }]}>
            <Ionicons name='people' size={36} color={COLORS.white} />
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Students</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: COLORS.accent }]}>
            <Ionicons name='checkmark-circle' size={36} color={COLORS.white} />
            <Text style={styles.statValue}>{stats.eligible}</Text>
            <Text style={styles.statLabel}>Eligible</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: COLORS.danger }]}>
            <Ionicons name='alert-circle' size={36} color={COLORS.white} />
            <Text style={styles.statValue}>{stats.shortage}</Text>
            <Text style={styles.statLabel}>Shortage</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: COLORS.secondary }]}>
            <Ionicons name='bar-chart' size={36} color={COLORS.white} />
            <Text style={styles.statValue}>{stats.avgAttendance}%</Text>
            <Text style={styles.statLabel}>Avg Attendance</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name='information-circle' size={24} color={COLORS.primary} />
              <Text style={styles.infoTitle}>Attendance Policy</Text>
            </View>
            <Text style={styles.infoText}>
              Students must maintain a minimum of 75% attendance to be eligible for examinations. 
              Students falling below this threshold will be marked as "Shortage" and alerts will be generated automatically.
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Quick Summary</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{stats.eligible}</Text>
                <Text style={styles.summaryLabel}>Students Eligible</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: COLORS.danger }]}>{stats.shortage}</Text>
                <Text style={styles.summaryLabel}>Need Attention</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionsCard}>
            <Text style={styles.actionsTitle}>Quick Access</Text>
            <Text style={styles.actionsSubtitle}>Use bottom navigation to access different sections</Text>
            <View style={styles.actionsList}>
              <View style={styles.actionItem}>
                <Ionicons name='calendar' size={20} color={COLORS.primary} />
                <Text style={styles.actionText}>Mark daily attendance</Text>
              </View>
              <View style={styles.actionItem}>
                <Ionicons name='people' size={20} color={COLORS.accent} />
                <Text style={styles.actionText}>View student records</Text>
              </View>
              {user?.role === 'Admin' && (
                <>
                  <View style={styles.actionItem}>
                    <Ionicons name='notifications' size={20} color={COLORS.danger} />
                    <Text style={styles.actionText}>Send alerts to shortage students</Text>
                  </View>
                  <View style={styles.actionItem}>
                    <Ionicons name='document-text' size={20} color={COLORS.secondary} />
                    <Text style={styles.actionText}>Generate certificates</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background
  },
  header: {
    marginBottom: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: SPACING.sm
  },
  headerLeft: {
    flex: 1
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  logoutText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.primary
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: SPACING.lg,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 140
  },
  statValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs
  },
  statLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: '600'
  },
  infoSection: {
    gap: SPACING.md
  },
  infoCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm
  },
  infoTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.text
  },
  infoText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    lineHeight: 20
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  summaryTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center'
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: SPACING.xs
  },
  summaryLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    textAlign: 'center'
  },
  summaryDivider: {
    width: 1,
    height: 50,
    backgroundColor: COLORS.border
  },
  actionsCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  actionsTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs
  },
  actionsSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    marginBottom: SPACING.md
  },
  actionsList: {
    gap: SPACING.sm
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8
  },
  actionText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    flex: 1
  }
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONTS } from '../utils/theme';
import { alertAPI } from '../utils/api';

export default function AlertsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const data = await alertAPI.getAll();
      setAlerts(data.alerts);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAlerts();
    setRefreshing(false);
  };

  const handleSendAlert = async (alertId: string, studentName: string) => {
    Alert.alert(
      'Send Alert',
      `Send attendance shortage alert to ${studentName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            setSending(alertId);
            try {
              await alertAPI.send(alertId);
              Alert.alert('Success', `Alert sent to ${studentName}!`);
              fetchAlerts();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to send alert');
            } finally {
              setSending(null);
            }
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
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Alerts</Text>
          <Text style={styles.headerSubtitle}>
            Manage attendance shortage notifications
          </Text>
        </View>

        {alerts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle-outline" size={80} color={COLORS.accent} />
            <Text style={styles.emptyTitle}>All Good!</Text>
            <Text style={styles.emptyText}>
              No attendance shortage alerts at the moment.
            </Text>
          </View>
        ) : (
          <View style={styles.alertsList}>
            {alerts.map(alert => (
              <View
                key={alert.alert_id}
                style={[
                  styles.alertCard,
                  alert.status === 'Sent' && styles.alertCardSent
                ]}
              >
                <View style={styles.alertHeader}>
                  <View style={styles.alertIconContainer}>
                    <Ionicons
                      name={alert.status === 'Sent' ? 'mail' : 'alert-circle'}
                      size={28}
                      color={alert.status === 'Sent' ? COLORS.accent : COLORS.danger}
                    />
                  </View>
                  <View style={styles.alertInfo}>
                    <Text style={styles.alertName}>{alert.name}</Text>
                    <Text style={styles.alertDetails}>
                      {alert.rollNo} • {alert.className}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      alert.status === 'Sent' ? styles.statusBadgeSent : styles.statusBadgePending
                    ]}
                  >
                    <Text style={styles.statusBadgeText}>{alert.status}</Text>
                  </View>
                </View>

                <View style={styles.alertContent}>
                  <View style={styles.attendanceInfo}>
                    <Ionicons name="bar-chart" size={20} color={COLORS.danger} />
                    <Text style={styles.attendanceLabel}>Attendance:</Text>
                    <Text style={styles.attendanceValue}>
                      {alert.attendancePercent.toFixed(1)}%
                    </Text>
                    <View style={styles.shortageTag}>
                      <Text style={styles.shortageTagText}>Below 75%</Text>
                    </View>
                  </View>

                  {alert.status === 'Pending' && (
                    <TouchableOpacity
                      style={styles.sendButton}
                      onPress={() => handleSendAlert(alert.alert_id, alert.name)}
                      disabled={sending === alert.alert_id}
                    >
                      {sending === alert.alert_id ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                      ) : (
                        <>
                          <Ionicons name="send" size={18} color={COLORS.white} />
                          <Text style={styles.sendButtonText}>Send Alert</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}

                  {alert.status === 'Sent' && alert.sent_at && (
                    <View style={styles.sentInfo}>
                      <Ionicons name="checkmark-circle" size={16} color={COLORS.accent} />
                      <Text style={styles.sentText}>
                        Sent on {new Date(alert.sent_at).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background
  },
  headerSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    marginBottom: SPACING.sm
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    lineHeight: 22
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    marginTop: SPACING.xxl
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm
  },
  emptyText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    textAlign: 'center'
  },
  alertsList: {
    padding: SPACING.md,
    gap: SPACING.md
  },
  alertCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  alertCardSent: {
    borderLeftColor: COLORS.accent,
    opacity: 0.8
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.md
  },
  alertIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center'
  },
  alertInfo: {
    flex: 1
  },
  alertName: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4
  },
  alertDetails: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 16
  },
  statusBadgePending: {
    backgroundColor: COLORS.warning
  },
  statusBadgeSent: {
    backgroundColor: COLORS.accent
  },
  statusBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: 'bold',
    color: COLORS.white
  },
  alertContent: {
    gap: SPACING.md
  },
  attendanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: '#FFEBEE',
    borderRadius: 12
  },
  attendanceLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    fontWeight: '600'
  },
  attendanceValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.danger
  },
  shortageTag: {
    marginLeft: 'auto',
    backgroundColor: COLORS.danger,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12
  },
  shortageTagText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: 'bold',
    color: COLORS.white
  },
  sendButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    minHeight: 50
  },
  sendButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.white
  },
  sentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.md,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12
  },
  sentText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray
  }
});

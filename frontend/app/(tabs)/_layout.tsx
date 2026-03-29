import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/theme';
import { Platform } from 'react-native';
import { useUser } from '../utils/UserContext';

export default function TabLayout() {
  const { user } = useUser();
  const router = useRouter();

  // Redirect to login if no user
  useEffect(() => {
    if (!user) {
      router.replace('/');
    }
  }, [user]);

  const isTeacher = user?.role === 'Teacher';
  const isAdmin = user?.role === 'Admin';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.darkGray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 8,
          paddingTop: 8,
          paddingHorizontal: 8
        },
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600'
        }
      }}
    >
      {/* Dashboard - Visible to all */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          )
        }}
      />

      {/* Attendance - Only for Teachers */}
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Attendance',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
          href: isTeacher ? '/(tabs)/attendance' : null
        }}
      />

      {/* Students - Visible to all */}
      <Tabs.Screen
        name="students"
        options={{
          title: 'Students',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          )
        }}
      />

      {/* Analytics - Only for Admin */}
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
          href: isAdmin ? '/(tabs)/analytics' : null
        }}
      />

      {/* Alerts - Only for Admin */}
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
          href: isAdmin ? '/(tabs)/alerts' : null
        }}
      />

      {/* Letters - Only for Admin */}
      <Tabs.Screen
        name="letters"
        options={{
          title: 'Letters',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" size={size} color={color} />
          ),
          href: isAdmin ? '/(tabs)/letters' : null
        }}
      />
    </Tabs>
  );
}

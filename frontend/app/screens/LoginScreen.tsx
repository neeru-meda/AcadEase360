import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONTS } from '../utils/theme';
import { authAPI, seedAPI } from '../utils/api';
import { useUser } from '../utils/UserContext';

const AU_LOGO_URL = 'https://customer-assets.emergentagent.com/job_au-mobile-suite/artifacts/wrksjzfy_image.png';

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('Teacher');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    setLoading(true);
    try {
      // First, seed data if needed
      await seedAPI.seedData();
      
      // Then login (no role needed - auto-detected)
      const response = await authAPI.login(username, password);
      
      if (response.success) {
        // Store user in context
        setUser(response.user);
        // Navigate to appropriate dashboard
        router.replace('/(tabs)/dashboard');
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: AU_LOGO_URL }} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>AcadEase 360°</Text>
          <Text style={styles.subtitle}>AU CSSE Smart Utility</Text>

          {/* Username */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              placeholderTextColor={COLORS.darkGray}
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              placeholderTextColor={COLORS.darkGray}
              secureTextEntry
            />
          </View>

          {/* Role Selector */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Role</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity 
                style={styles.roleOption} 
                onPress={() => setSelectedRole('Teacher')}
              >
                <View style={[styles.radioOuter, selectedRole === 'Teacher' && styles.radioOuterActive]}>
                  {selectedRole === 'Teacher' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.roleText}>Teacher</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.roleOption} 
                onPress={() => setSelectedRole('Admin')}
              >
                <View style={[styles.radioOuter, selectedRole === 'Admin' && styles.radioOuterActive]}>
                  {selectedRole === 'Admin' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.roleText}>Admin</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <Text style={styles.footerText}>Andhra University - CSSE Department</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: SPACING.lg,
    paddingTop: 32,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  logoImage: {
    width: 90,
    height: 90
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 4
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 28
  },
  inputContainer: {
    marginBottom: SPACING.lg
  },
  label: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: SPACING.md,
    fontSize: FONTS.sizes.md,
    backgroundColor: COLORS.white,
    color: COLORS.text,
    minHeight: 50
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.darkGray,
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioOuterActive: {
    borderColor: COLORS.primary
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary
  },
  roleText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.sm,
    minHeight: 52
  },
  loginButtonText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.white
  },
  footerText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: 20
  }
});
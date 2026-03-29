import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONTS } from '../utils/theme';
import { studentAPI } from '../utils/api';
import { Picker } from '@react-native-picker/picker';

export default function StudentsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('All');
  const [filter, setFilter] = useState<'all' | 'eligible' | 'shortage'>('all');

  const classes = ['All', 'Class A', 'Class B', 'Class C', 'Class D'];

  useEffect(() => {
    fetchStudents();
  }, [selectedClass]);

  const fetchStudents = async () => {
    try {
      const data = await studentAPI.getAll();
      if (selectedClass === 'All') {
        setStudents(data.students);
      } else {
        const filtered = data.students.filter((s: any) => s.className === selectedClass);
        setStudents(filtered);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStudents();
    setRefreshing(false);
  };

  const filteredStudents = students.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'eligible') return s.status === 'Eligible';
    if (filter === 'shortage') return s.status === 'Shortage';
    return true;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Students</Text>
        <Text style={styles.headerSubtitle}>{students.length} Students</Text>
      </View>

      <View style={styles.filtersContainer}>
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Class</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedClass}
              onValueChange={setSelectedClass}
              style={styles.picker}
            >
              {classes.map(cls => (
                <Picker.Item key={cls} label={cls} value={cls} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.filterChips}>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'eligible' && styles.filterChipActive]}
            onPress={() => setFilter('eligible')}
          >
            <Text style={[styles.filterText, filter === 'eligible' && styles.filterTextActive]}>
              Eligible
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'shortage' && styles.filterChipActive]}
            onPress={() => setFilter('shortage')}
          >
            <Text style={[styles.filterText, filter === 'shortage' && styles.filterTextActive]}>
              Shortage
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {filteredStudents.map(student => (
          <View
            key={student.rollNo}
            style={[
              styles.studentCard,
              student.status === 'Shortage' && styles.studentCardShortage
            ]}
          >
            <View style={styles.studentHeader}>
              <View>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentRoll}>{student.rollNo} • {student.className}</Text>
              </View>
              <View
                style={[
                  styles.badge,
                  student.status === 'Eligible' ? styles.badgeGreen : styles.badgeRed
                ]}
              >
                <Text style={styles.badgeText}>{student.status}</Text>
              </View>
            </View>

            <View style={styles.attendanceBar}>
              <View style={styles.attendanceBarBg}>
                <View
                  style={[
                    styles.attendanceBarFill,
                    {
                      width: `${student.attendancePercent}%`,
                      backgroundColor:
                        student.attendancePercent >= 75 ? COLORS.accent : COLORS.danger
                    }
                  ]}
                />
              </View>
              <Text style={styles.attendanceText}>
                {student.attendancePercent.toFixed(1)}%
              </Text>
            </View>

            <View style={styles.subjectAttendance}>
              <View style={styles.subjectItem}>
                <Text style={styles.subjectLabel}>Math</Text>
                <Text style={styles.subjectValue}>{student.subjectAttendance.math.toFixed(1)}%</Text>
              </View>
              <View style={styles.subjectItem}>
                <Text style={styles.subjectLabel}>DBMS</Text>
                <Text style={styles.subjectValue}>{student.subjectAttendance.dbms.toFixed(1)}%</Text>
              </View>
              <View style={styles.subjectItem}>
                <Text style={styles.subjectLabel}>OS</Text>
                <Text style={styles.subjectValue}>{student.subjectAttendance.os.toFixed(1)}%</Text>
              </View>
              <View style={styles.subjectItem}>
                <Text style={styles.subjectLabel}>CN</Text>
                <Text style={styles.subjectValue}>{student.subjectAttendance.cn.toFixed(1)}%</Text>
              </View>
              <View style={styles.subjectItem}>
                <Text style={styles.subjectLabel}>SE</Text>
                <Text style={styles.subjectValue}>{student.subjectAttendance.se.toFixed(1)}%</Text>
              </View>
            </View>
          </View>
        ))}
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
  header: {
    padding: SPACING.md,
    paddingTop: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray
  },
  filtersContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.md
  },
  pickerContainer: {
    marginBottom: 0
  },
  label: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    overflow: 'hidden'
  },
  picker: {
    height: 45
  },
  filterChips: {
    flexDirection: 'row',
    gap: SPACING.sm
  },
  filterChip: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center'
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  filterText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    fontWeight: '600'
  },
  filterTextActive: {
    color: COLORS.white
  },
  list: {
    flex: 1
  },
  listContent: {
    padding: SPACING.md
  },
  studentCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  studentCardShortage: {
    borderLeftColor: COLORS.danger,
    backgroundColor: '#FFEBEE'
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md
  },
  studentName: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4
  },
  studentRoll: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12
  },
  badgeGreen: {
    backgroundColor: COLORS.accent
  },
  badgeRed: {
    backgroundColor: COLORS.danger
  },
  badgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: 'bold',
    color: COLORS.white
  },
  attendanceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm
  },
  attendanceBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    overflow: 'hidden'
  },
  attendanceBarFill: {
    height: '100%',
    borderRadius: 4
  },
  attendanceText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: 'bold',
    color: COLORS.text,
    minWidth: 45
  },
  subjectAttendance: {
    flexDirection: 'row',
    gap: SPACING.xs
  },
  subjectItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    padding: SPACING.xs,
    borderRadius: 6
  },
  subjectLabel: {
    fontSize: 10,
    color: COLORS.darkGray,
    marginBottom: 2
  },
  subjectValue: {
    fontSize: FONTS.sizes.xs,
    fontWeight: 'bold',
    color: COLORS.text
  }
});

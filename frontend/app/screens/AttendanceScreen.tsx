import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONTS } from '../utils/theme';
import { studentAPI, attendanceAPI } from '../utils/api';
import { format } from 'date-fns';
import { Picker } from '@react-native-picker/picker';

export default function AttendanceScreen() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('Class A');
  const [subject, setSubject] = useState('Math');
  const [period, setPeriod] = useState('1');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attendance, setAttendance] = useState<{ [key: string]: string }>({});

  const classes = ['Class A', 'Class B', 'Class C', 'Class D'];
  const subjects = ['Math', 'DBMS', 'OS', 'CN', 'SE'];
  const periods = ['1', '2', '3', '4', '5', '6'];

  useEffect(() => {
    fetchStudents();
  }, [selectedClass]);

  const fetchStudents = async () => {
    try {
      const data = await studentAPI.getAll();
      const classStudents = data.students.filter((s: any) => s.className === selectedClass);
      setStudents(classStudents);
      // Initialize all as Absent (as per requirement)
      const initialAttendance: any = {};
      classStudents.forEach((s: any) => {
        initialAttendance[s.rollNo] = 'Absent';
      });
      setAttendance(initialAttendance);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = (rollNo: string) => {
    setAttendance(prev => ({
      ...prev,
      [rollNo]: prev[rollNo] === 'Present' ? 'Absent' : 'Present'
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const attendanceList = students.map(s => ({
        rollNo: s.rollNo,
        name: s.name,
        status: attendance[s.rollNo] || 'Absent'
      }));

      await attendanceAPI.submit({
        date,
        className: selectedClass,
        subject,
        period,
        markedBy: 'teacher',
        attendance: attendanceList
      });

      Alert.alert('Success', 'Attendance submitted successfully!', [
        {
          text: 'OK',
          onPress: () => {
            fetchStudents();
          }
        }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit attendance');
    } finally {
      setSubmitting(false);
    }
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mark Attendance</Text>
        <Text style={styles.headerSubtitle}>Date: {format(new Date(date), 'dd MMM yyyy')}</Text>
      </View>

      <View style={styles.controls}>
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

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Subject</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={subject}
              onValueChange={setSubject}
              style={styles.picker}
            >
              {subjects.map(sub => (
                <Picker.Item key={sub} label={sub} value={sub} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Period</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={period}
              onValueChange={setPeriod}
              style={styles.picker}
            >
              {periods.map(p => (
                <Picker.Item key={p} label={`Period ${p}`} value={p} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      <ScrollView style={styles.studentList}>
        {students.map(student => {
          const isPresent = attendance[student.rollNo] === 'Present';
          return (
            <TouchableOpacity
              key={student.rollNo}
              style={[
                styles.studentCard,
                isPresent && styles.studentCardPresent
              ]}
              onPress={() => toggleAttendance(student.rollNo)}
            >
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentRoll}>{student.rollNo}</Text>
              </View>
              <View style={styles.statusContainer}>
                <Text
                  style={[
                    styles.statusText,
                    isPresent && styles.statusTextPresent
                  ]}
                >
                  {attendance[student.rollNo]}
                </Text>
                <Ionicons
                  name={isPresent ? 'checkmark-circle' : 'close-circle'}
                  size={32}
                  color={isPresent ? COLORS.accent : COLORS.danger}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.submitButtonText}>Submit Attendance</Text>
        )}
      </TouchableOpacity>
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
  controls: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm
  },
  pickerContainer: {
    marginBottom: SPACING.xs
  },
  label: {
    fontSize: FONTS.sizes.md,
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
    height: 50
  },
  studentList: {
    flex: 1,
    padding: SPACING.md
  },
  studentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  studentCardPresent: {
    backgroundColor: COLORS.white,
    borderLeftColor: COLORS.accent
  },
  studentInfo: {
    flex: 1
  },
  studentName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs
  },
  studentRoll: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm
  },
  statusText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.danger
  },
  statusTextPresent: {
    color: COLORS.accent
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    margin: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  submitButtonText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.white
  }
});

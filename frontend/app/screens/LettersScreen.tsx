import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONTS } from '../utils/theme';
import { letterAPI } from '../utils/api';

const documentTypes = [
  'Bonafide Certificate',
  'Study Certificate',
  'Loan Estimation Letter',
  'Internship Permission Letter'
];

export default function LettersScreen() {
  const [rollNo, setRollNo] = useState('');
  const [documentType, setDocumentType] = useState('Bonafide Certificate');
  const [loading, setLoading] = useState(false);
  const [letterData, setLetterData] = useState<any>(null);

  const generateLetter = async () => {
    if (!rollNo) {
      Alert.alert('Error', 'Please enter Roll Number');
      return;
    }

    setLoading(true);
    try {
      const data = await letterAPI.generate(rollNo, documentType);
      setLetterData(data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Student not found');
      setLetterData(null);
    } finally {
      setLoading(false);
    }
  };

  const getLetterContent = () => {
    if (!letterData) return '';

    const student = letterData.student;
    const date = letterData.date;

    let content = '';
    switch (documentType) {
      case 'Bonafide Certificate':
        content = `This is to certify that ${student.name}, bearing regd. No. ${student.rollNo} is a bonafide student of B.Tech CSE in the Dept. of Computer Science & Systems Engineering, A.U. College of Engineering (A), Andhra University, Visakhapatnam during the academic year 2025-26.<br><br>This certificate is issued at the request of the student.`;
        break;
      case 'Study Certificate':
        content = `This is to certify that ${student.name}, Roll No. ${student.rollNo}, has been studying ${student.course} in the Department of Computer Science & Systems Engineering, Andhra University College of Engineering (A), Visakhapatnam.<br><br>The student's conduct and character are good.`;
        break;
      case 'Loan Estimation Letter':
        content = `This is to certify that ${student.name}, Roll No. ${student.rollNo}, is a student of ${student.course} in our institution.<br><br>The estimated annual tuition fee is ₹1,50,000 (Rupees One Lakh Fifty Thousand Only).<br><br>This letter is issued for educational loan purposes.`;
        break;
      case 'Internship Permission Letter':
        content = `This is to certify that ${student.name}, Roll No. ${student.rollNo}, is a student of ${student.course} in the Department of Computer Science & Systems Engineering.<br><br>We have no objection to the student undertaking an internship program during the vacation period. This internship is part of the curriculum requirements.`;
        break;
    }

    return `
      <html>
        <head>
          <style>
            body { 
              font-family: 'Times New Roman', serif; 
              padding: 40px; 
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              margin-bottom: 40px;
              border-bottom: 2px solid #B31217;
              padding-bottom: 20px;
            }
            .dept { 
              font-weight: bold; 
              font-size: 18px; 
              color: #B31217; 
              margin-bottom: 5px;
            }
            .college { 
              font-size: 16px;
              font-weight: 600;
              margin-top: 5px; 
            }
            .location {
              font-size: 14px;
              color: #666;
              margin-top: 3px;
            }
            .date { 
              text-align: right; 
              margin: 30px 0 20px 0;
              font-size: 14px;
            }
            .title { 
              text-align: center; 
              font-weight: bold; 
              text-decoration: underline; 
              margin: 40px 0 30px 0; 
              font-size: 20px;
              color: #000;
            }
            .content { 
              text-align: justify; 
              line-height: 2; 
              font-size: 16px;
              margin: 30px 0;
            }
            .signature { 
              margin-top: 60px; 
              text-align: right;
              line-height: 1.8;
            }
            .sign-name { 
              font-weight: bold; 
              font-size: 15px;
            }
            .sign-title {
              font-size: 14px;
              margin-top: 2px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="dept">DEPARTMENT OF COMPUTER SCIENCE AND SYSTEMS ENGINEERING</div>
            <div class="college">A.U. COLLEGE OF ENGINEERING(A)</div>
            <div class="college">ANDHRA UNIVERSITY</div>
            <div class="location">VISAKHAPATNAM - 530003</div>
          </div>
          
          <div class="date">Date: ${date}</div>
          
          <div class="title">${documentType.toUpperCase()}</div>
          
          <div class="content">
            ${content}
          </div>
          
          <div class="signature">
            <p class="sign-name">(${letterData.issuer.name})</p>
            <p class="sign-title">${letterData.issuer.title}</p>
            <p class="sign-title">${letterData.issuer.department}</p>
            <p class="sign-title">ANDHRA UNIVERSITY</p>
          </div>
        </body>
      </html>
    `;
  };

  const downloadPDF = async () => {
    try {
      const html = getLetterContent();
      const { uri } = await Print.printToFileAsync({ html });
      
      Alert.alert(
        'Success',
        'PDF generated successfully!',
        [
          {
            text: 'Share',
            onPress: async () => {
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
              }
            }
          },
          { text: 'OK' }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  const printLetter = async () => {
    try {
      const html = getLetterContent();
      await Print.printAsync({ html });
    } catch (error) {
      Alert.alert('Error', 'Failed to print');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>Letter Generator</Text>
            <Text style={styles.headerSubtitle}>Generate instant documents and certificates</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Roll Number</Text>
              <TextInput
                style={styles.input}
                value={rollNo}
                onChangeText={setRollNo}
                placeholder="Enter Roll Number (e.g., R001)"
                placeholderTextColor={COLORS.darkGray}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Document Type</Text>
              {documentTypes.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.radioOption,
                    documentType === type && styles.radioOptionActive
                  ]}
                  onPress={() => setDocumentType(type)}
                >
                  <Ionicons
                    name={documentType === type ? 'radio-button-on' : 'radio-button-off'}
                    size={24}
                    color={documentType === type ? COLORS.primary : COLORS.gray}
                  />
                  <Text
                    style={[
                      styles.radioText,
                      documentType === type && styles.radioTextActive
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.generateButton}
              onPress={generateLetter}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="document-text" size={20} color={COLORS.white} />
                  <Text style={styles.generateButtonText}>Generate Document</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {letterData && (
            <View style={styles.previewSection}>
              <View style={styles.previewHeader}>
                <Ionicons name="eye-outline" size={24} color={COLORS.white} />
                <Text style={styles.previewTitle}>Document Preview</Text>
              </View>

              <View style={styles.previewContent}>
                <View style={styles.letterHeader}>
                  <Text style={styles.deptText}>DEPARTMENT OF COMPUTER SCIENCE AND SYSTEMS ENGINEERING</Text>
                  <Text style={styles.collegeText}>A.U. COLLEGE OF ENGINEERING(A)</Text>
                  <Text style={styles.collegeText}>ANDHRA UNIVERSITY</Text>
                  <Text style={styles.locationText}>VISAKHAPATNAM - 530003</Text>
                </View>

                <Text style={styles.dateText}>Date: {letterData.date}</Text>

                <Text style={styles.docTitle}>{documentType.toUpperCase()}</Text>

                <Text style={styles.studentInfo}>
                  Student: {letterData.student.name}
                  {'\n'}Roll No: {letterData.student.rollNo}
                  {'\n'}Class: {letterData.student.className}
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton} onPress={downloadPDF}>
                  <Ionicons name="download" size={20} color={COLORS.white} />
                  <Text style={styles.actionButtonText}>Download PDF</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonSecondary]}
                  onPress={printLetter}
                >
                  <Ionicons name="print" size={20} color={COLORS.primary} />
                  <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
                    Print
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  keyboardView: {
    flex: 1
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
  formCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
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
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: FONTS.sizes.md,
    backgroundColor: COLORS.white,
    color: COLORS.text,
    minHeight: 50
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    minHeight: 56
  },
  radioOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF5F5'
  },
  radioText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    marginLeft: SPACING.md,
    flex: 1
  },
  radioTextActive: {
    fontWeight: '600',
    color: COLORS.primary
  },
  generateButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    minHeight: 56,
    marginTop: SPACING.sm
  },
  generateButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.white
  },
  previewSection: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.xl
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.secondary,
    padding: SPACING.md,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16
  },
  previewTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.white
  },
  previewContent: {
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  letterHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary
  },
  deptText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 4
  },
  collegeText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 2
  },
  locationText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: 4
  },
  dateText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    textAlign: 'right',
    marginBottom: SPACING.md
  },
  docTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    textDecorationLine: 'underline'
  },
  studentInfo: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    lineHeight: 24,
    padding: SPACING.md,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    minHeight: 50
  },
  actionButtonSecondary: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary
  },
  actionButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.white
  },
  actionButtonTextSecondary: {
    color: COLORS.primary
  }
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Colors from '@/constants/colors';
import { BloodGroup, ALL_BLOOD_GROUPS } from '@/types/blood';
import { BloodService } from '@/services/api/bloodService';
import { useAuth } from '@/lib/AuthContext';
import Header from '@/components/common/Header';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function RequestBloodScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ orgId?: string; orgName?: string; bloodGroup?: BloodGroup; units?: string; isEmergency?: string; }>();
  const { user } = useAuth();

  const [patientName, setPatientName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>((params.bloodGroup as BloodGroup) || 'O+');
  const [units, setUnits] = useState(params.units ? parseInt(params.units, 10) : 2);
  const [hospitalLocation, setHospitalLocation] = useState(params.orgName || '');
  const [isEmergency, setIsEmergency] = useState(params.isEmergency === 'true' || false);
  const [contactPerson, setContactPerson] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) { Alert.alert('Error', 'Please login first.'); return; }
    if (!patientName.trim()) { Alert.alert('Error', 'Please enter patient name'); return; }
    if (!contactPerson.trim()) { Alert.alert('Error', 'Please enter contact person'); return; }
    if (!contactNumber.trim()) { Alert.alert('Error', 'Please enter contact number'); return; }
    setLoading(true);
    try {
      const created = await BloodService.createRequest({
        patientName,
        bloodGroup: selectedGroup,
        units,
        hospitalName: hospitalLocation,
        hospitalAddress: 'Nagpur, Maharashtra',
        isEmergency,
        contactPerson,
        contactPhone: contactNumber,
        additionalNote: note,
        organizationId: params.orgId,
      }, user.id);
      router.replace({ pathname: '/(user)/confirmation', params: { requestId: created.id, bloodGroup: created.bloodGroup, units: created.units.toString(), hospital: created.hospitalName, status: created.status } });
    } catch (e) { Alert.alert('Error', 'Failed to submit request. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <Header title="Request Blood" showBack={true} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {isEmergency && (
            <View style={styles.emergencyAlertBox}>
              <Ionicons name="warning" size={20} color="#DC2626" />
              <Text style={styles.emergencyAlertText}>Marked as Emergency: Will prioritize alert to all active verified centers.</Text>
            </View>
          )}
          <Text style={styles.sectionLabel}>Patient Details</Text>
          <Input label="Patient Name" value={patientName} onChangeText={setPatientName} placeholder="e.g. Amit Sharma" leftIcon={<Ionicons name="person-outline" size={20} color={Colors.text.muted} />} />
          <Text style={styles.sectionLabel}>Blood Group</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {ALL_BLOOD_GROUPS.map((bg) => (
              <TouchableOpacity key={bg} onPress={() => setSelectedGroup(bg)} style={[styles.chip, selectedGroup === bg && styles.chipActive]}>
                <Text style={[styles.chipText, selectedGroup === bg && styles.chipTextActive]}>{bg}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.sectionLabel}>Units Required</Text>
          <View style={styles.unitsStepper}>
            <TouchableOpacity onPress={() => setUnits(Math.max(1, units - 1))} style={styles.stepBtn}><Ionicons name="remove" size={20} color={Colors.primary.DEFAULT} /></TouchableOpacity>
            <Text style={styles.unitsValue}>{units}</Text>
            <TouchableOpacity onPress={() => setUnits(Math.min(10, units + 1))} style={styles.stepBtn}><Ionicons name="add" size={20} color={Colors.primary.DEFAULT} /></TouchableOpacity>
          </View>
          <Text style={styles.sectionLabel}>Hospital / Location</Text>
          <Input label="Hospital Name" value={hospitalLocation} onChangeText={setHospitalLocation} placeholder="e.g. Government Medical College" leftIcon={<Ionicons name="business-outline" size={20} color={Colors.text.muted} />} />
          <View style={styles.emergencyRow}>
            <View>
              <Text style={styles.emergencyLabel}>Mark as Emergency</Text>
              <Text style={styles.emergencySub}>Broadcasts to all centers immediately</Text>
            </View>
            <Switch value={isEmergency} onValueChange={setIsEmergency} trackColor={{ true: Colors.primary.DEFAULT, false: Colors.surface.border }} thumbColor="#FFFFFF" />
          </View>
          <Text style={styles.sectionLabel}>Contact Information</Text>
          <Input label="Contact Person" value={contactPerson} onChangeText={setContactPerson} placeholder="e.g. Rohit Sharma" leftIcon={<Ionicons name="person-outline" size={20} color={Colors.text.muted} />} />
          <Input label="Contact Number" value={contactNumber} onChangeText={setContactNumber} placeholder="e.g. +91 9876543210" keyboardType="phone-pad" leftIcon={<Ionicons name="call-outline" size={20} color={Colors.text.muted} />} />
          <Text style={styles.sectionLabel}>Additional Note (optional)</Text>
          <Input label="Note" value={note} onChangeText={setNote} placeholder="Any additional information..." multiline />
          <Button title="Submit Request" onPress={handleSubmit} loading={loading} size="lg" fullWidth style={styles.submitBtn} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  emergencyAlertBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', borderRadius: 12, padding: 12, gap: 10, marginBottom: 16, borderWidth: 1, borderColor: '#FECACA' },
  emergencyAlertText: { flex: 1, fontSize: 13, color: '#DC2626', fontWeight: '600' },
  sectionLabel: { fontSize: 14, fontWeight: '800', color: Colors.text.primary, marginBottom: 8, marginTop: 8 },
  chipsRow: { gap: 8, paddingVertical: 4, marginBottom: 16 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.surface.border, backgroundColor: '#FFFFFF' },
  chipActive: { backgroundColor: Colors.primary.DEFAULT, borderColor: Colors.primary.DEFAULT },
  chipText: { fontSize: 13, fontWeight: '700', color: Colors.text.primary },
  chipTextActive: { color: '#FFFFFF' },
  unitsStepper: { flexDirection: 'row', alignItems: 'center', gap: 20, justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.surface.border, marginBottom: 16 },
  stepBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary.light, alignItems: 'center', justifyContent: 'center' },
  unitsValue: { fontSize: 28, fontWeight: '900', color: Colors.text.primary, minWidth: 40, textAlign: 'center' },
  emergencyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.surface.border, marginBottom: 16 },
  emergencyLabel: { fontSize: 14, fontWeight: '700', color: Colors.text.primary },
  emergencySub: { fontSize: 12, color: Colors.text.secondary, marginTop: 2 },
  submitBtn: { marginTop: 16 },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Colors from '@/constants/colors';
import Config from '@/constants/config';
import { BloodGroup, ALL_BLOOD_GROUPS } from '@/types/blood';
import { BloodService } from '@/services/api/bloodService';
import Header from '@/components/common/Header';
import Button from '@/components/ui/Button';
import { useAuth } from '@/lib/AuthContext';

export default function EmergencyScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [units, setUnits] = useState(2);
  const [loading, setLoading] = useState(false);

  const handleCallHelpline = () => {
    Linking.openURL(`tel:${Config.emergencyHelpline}`);
  };

  const handleSendEmergency = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to broadcast an emergency request.');
      return;
    }

    setLoading(true);
    try {
      const created = await BloodService.createRequest({
        patientName: 'Emergency Patient',
        bloodGroup, units,
        hospitalName: 'Nearest Verified Hospital (GPS Broadcast)',
        hospitalAddress: `${profile?.city || 'Nagpur'}, ${profile?.state || 'Maharashtra'}`,
        isEmergency: true,
        contactPerson: profile?.name || user?.user_metadata?.full_name || 'Emergency Contact',
        contactPhone: profile?.phone || Config.emergencyHelplineFormatted,
        additionalNote: 'EMERGENCY SOS: Critical blood requirement broadcast',
      }, user.id);
      router.replace({ pathname: '/(user)/confirmation', params: { requestId: created.id, bloodGroup: created.bloodGroup, units: created.units.toString(), hospital: 'Nearest Verified Hospital (Broadcast)', status: 'Searching' } });
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to broadcast emergency request.');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <Header title="Emergency SOS" showBack={true} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Direct Emergency Call Button */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleCallHelpline}
          style={styles.callHelplineBtn}
        >
          <View style={styles.callHelplineLeft}>
            <View style={styles.callIconCircle}>
              <Ionicons name="call" size={22} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.callHelplineTitle}>Direct Emergency Helpline</Text>
              <Text style={styles.callHelplineNumber}>Call {Config.emergencyHelplineFormatted} (24/7)</Text>
            </View>
          </View>
          <View style={styles.callBadge}>
            <Text style={styles.callBadgeText}>Call Now</Text>
          </View>
        </TouchableOpacity>

        {/* Red alert banner */}
        <View style={styles.alertBanner}>
          <Ionicons name="warning" size={28} color="#DC2626" />
          <View style={styles.alertTextCol}>
            <Text style={styles.alertTitle}>Emergency Blood Request</Text>
            <Text style={styles.alertSub}>This will broadcast to ALL nearby verified blood centers immediately.</Text>
          </View>
        </View>
        {/* Blood Group chips */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Blood Group Required</Text>
          <View style={styles.groupGrid}>
            {ALL_BLOOD_GROUPS.map((bg) => (
              <TouchableOpacity key={bg} onPress={() => setBloodGroup(bg)}
                style={[styles.groupChip, bloodGroup === bg && styles.groupChipActive]}>
                <Text style={[styles.groupChipText, bloodGroup === bg && styles.groupChipTextActive]}>{bg}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* Units stepper */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Units Required</Text>
          <View style={styles.unitsStepper}>
            <TouchableOpacity onPress={() => setUnits(Math.max(1, units - 1))} style={styles.stepBtn}><Ionicons name="remove" size={20} color={Colors.primary.DEFAULT} /></TouchableOpacity>
            <Text style={styles.unitsValue}>{units}</Text>
            <TouchableOpacity onPress={() => setUnits(Math.min(10, units + 1))} style={styles.stepBtn}><Ionicons name="add" size={20} color={Colors.primary.DEFAULT} /></TouchableOpacity>
          </View>
        </View>
        {/* GPS notice */}
        <View style={styles.gpsNotice}>
          <Ionicons name="location" size={16} color={Colors.primary.DEFAULT} />
          <Text style={styles.gpsText}>Your location will be used to find the nearest blood centers.</Text>
        </View>
        <Button title="Send Emergency Request" onPress={handleSendEmergency} size="lg" loading={loading} fullWidth />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  alertBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', borderRadius: 14, padding: 16, gap: 12, marginBottom: 24, borderWidth: 1, borderColor: '#FECACA' },
  alertTextCol: { flex: 1 },
  alertTitle: { fontSize: 16, fontWeight: '800', color: '#DC2626', marginBottom: 4 },
  alertSub: { fontSize: 12, color: '#7F1D1D' },
  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 14, fontWeight: '800', color: Colors.text.primary, marginBottom: 12 },
  groupGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  groupChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, borderWidth: 1.5, borderColor: Colors.surface.border, backgroundColor: '#FFFFFF' },
  groupChipActive: { backgroundColor: Colors.primary.DEFAULT, borderColor: Colors.primary.DEFAULT },
  groupChipText: { fontSize: 14, fontWeight: '800', color: Colors.text.primary },
  groupChipTextActive: { color: '#FFFFFF' },
  unitsStepper: { flexDirection: 'row', alignItems: 'center', gap: 20, justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.surface.border },
  stepBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary.light, alignItems: 'center', justifyContent: 'center' },
  unitsValue: { fontSize: 32, fontWeight: '900', color: Colors.text.primary, minWidth: 50, textAlign: 'center' },
  gpsNotice: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primary.lighter, borderRadius: 10, padding: 12, marginBottom: 24, borderWidth: 1, borderColor: Colors.primary.border },
  gpsText: { fontSize: 12, color: Colors.primary.darker, flex: 1, fontWeight: '500' },
  callHelplineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#16A34A',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  callHelplineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  callIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callHelplineTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  callHelplineNumber: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
    fontWeight: '600',
  },
  callBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  callBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A',
  },
});

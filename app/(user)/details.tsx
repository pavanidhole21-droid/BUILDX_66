import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Colors from '@/constants/colors';
import Config from '@/constants/config';
import { ALL_BLOOD_GROUPS } from '@/types/blood';
import { Organization } from '@/types/organization';
import { OrganizationService } from '@/services/api/organizationService';
import Button from '@/components/ui/Button';
import { useSavedOrganizations } from '@/hooks/useSavedOrganizations';

export default function OrganizationDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      OrganizationService.getById(id).then(setOrg).finally(() => setLoading(false));
    } else { setLoading(false); }
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
      </View>
    );
  }

  if (!org) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.text.muted} />
        <Text style={{ fontSize: 16, color: Colors.text.muted, marginTop: 12 }}>Organization not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: Colors.primary.DEFAULT, fontWeight: '700' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { isSaved, toggleSave } = useSavedOrganizations();
  const saved = isSaved(org.id);

  const handleCall = () => {
    const phoneToCall = org.phone || Config.emergencyHelpline;
    Alert.alert('Confirm Availability', `Call ${org.name} at ${phoneToCall}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call Now', onPress: () => Linking.openURL(`tel:${phoneToCall.replace(/\s+/g, '')}`) },
    ]);
  };
  const handleNavigate = () => {
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(org.name + ', ' + org.address)}`);
  };
  const handleRequestBlood = () => {
    router.push({ pathname: '/(user)/request', params: { orgId: org.id, orgName: org.name } });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Organization Details</Text>
        <TouchableOpacity
          onPress={() => toggleSave(org.id)}
          style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={saved ? "heart" : "heart-outline"}
            size={24}
            color={saved ? Colors.primary.DEFAULT : Colors.text.primary}
          />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Ionicons name="business" size={40} color={Colors.primary.DEFAULT} />
          </View>
          <Text style={styles.bannerName}>{org.name}</Text>
          {org.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}><Ionicons name="business-outline" size={16} color={Colors.text.muted} /><Text style={styles.infoText}>{org.type}</Text></View>
          <View style={styles.infoRow}><Ionicons name="location-outline" size={16} color={Colors.text.muted} /><Text style={styles.infoText}>{org.address}</Text></View>
          <View style={styles.infoRow}><Ionicons name="call-outline" size={16} color={Colors.text.muted} /><Text style={styles.infoText}>{org.phone}</Text></View>
          <View style={styles.infoRow}><Ionicons name="time-outline" size={16} color={Colors.text.muted} /><Text style={styles.infoText}>{org.operatingHours}</Text></View>
          <View style={styles.infoRow}>
            <Ionicons name="refresh-outline" size={16} color={Colors.text.muted} />
            <Text style={styles.infoText}>
              {org.lastUpdatedMinutesAgo < 1 ? 'Just updated' : `Updated ${org.lastUpdatedMinutesAgo} min ago`}
            </Text>
          </View>
        </View>
        {/* Blood Availability */}
        <Text style={styles.sectionTitle}>Blood Availability</Text>
        <View style={styles.bloodGrid}>
          {ALL_BLOOD_GROUPS.map((bg) => {
            const units = org.inventory[bg] || 0;
            return (
              <View key={bg} style={[styles.bloodCell, units === 0 && styles.bloodCellEmpty]}>
                <Text style={styles.bloodGroupLabel}>{bg}</Text>
                <Text style={[styles.bloodUnits, units === 0 && styles.bloodUnitsEmpty]}>
                  {units > 0 ? `${units} units` : 'Unavail.'}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
      {/* Floating bottom bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={handleCall} style={styles.actionBtn}>
          <Ionicons name="call" size={18} color={Colors.primary.DEFAULT} />
          <Text style={styles.actionBtnText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNavigate} style={styles.actionBtn}>
          <Ionicons name="navigate" size={18} color={Colors.primary.DEFAULT} />
          <Text style={styles.actionBtnText}>Navigate</Text>
        </TouchableOpacity>
        <Button title="Request Blood" onPress={handleRequestBlood} size="md" style={styles.requestBtn} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.text.primary },
  scrollContent: { padding: 16, paddingBottom: 100 },
  banner: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  bannerIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primary.light, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  bannerName: { fontSize: 18, fontWeight: '900', color: Colors.text.primary, textAlign: 'center', marginBottom: 8 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  verifiedText: { fontSize: 12, fontWeight: '700', color: '#16A34A' },
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 16, gap: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  infoText: { fontSize: 13, color: Colors.text.secondary, flex: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.text.primary, marginBottom: 12 },
  bloodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  bloodCell: { width: '22%', backgroundColor: '#FFFFFF', borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  bloodCellEmpty: { backgroundColor: '#F8FAFC', borderColor: '#F1F5F9' },
  bloodGroupLabel: { fontSize: 14, fontWeight: '900', color: Colors.primary.DEFAULT, marginBottom: 4 },
  bloodUnits: { fontSize: 11, fontWeight: '600', color: Colors.text.secondary },
  bloodUnitsEmpty: { color: Colors.text.muted },
  bottomBar: { flexDirection: 'row', gap: 10, padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 48, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.primary.DEFAULT, backgroundColor: Colors.primary.lighter },
  actionBtnText: { fontSize: 14, fontWeight: '700', color: Colors.primary.DEFAULT },
  requestBtn: { flex: 2 },
});

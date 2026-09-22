import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Colors from '@/constants/colors';
import { BloodRequest, RequestStatus } from '@/types/blood';
import { BloodService } from '@/services/api/bloodService';
import Header from '@/components/common/Header';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/lib/AuthContext';

type TabFilter = 'All' | 'Pending' | 'Accepted' | 'Completed';

export default function MyRequestsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabFilter>('All');
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    BloodService.getRequests(user?.id).then(setRequests).finally(() => setLoading(false));
  }, [user?.id]);

  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Pending') return r.status === 'Pending' || r.status === 'Searching';
    if (activeTab === 'Accepted') return r.status === 'Accepted';
    if (activeTab === 'Completed') return r.status === 'Completed' || r.status === 'Cancelled';
    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <Header title="My Requests" showBack={true} onBackPress={() => router.replace('/(user)/home')} />
      {/* Tab filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabRow} contentContainerStyle={styles.tabContent}>
        {(['All', 'Pending', 'Accepted', 'Completed'] as TabFilter[]).map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary.DEFAULT} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {filteredRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color={Colors.text.muted} />
              <Text style={styles.emptyTitle}>No requests found</Text>
              <Text style={styles.emptySubtitle}>Your blood requests will appear here</Text>
            </View>
          ) : (
            filteredRequests.map((req) => (
              <TouchableOpacity key={req.id} activeOpacity={0.85} style={styles.card}
                onPress={() => router.push({ pathname: '/(user)/confirmation', params: { requestId: req.id, bloodGroup: req.bloodGroup, units: req.units.toString(), hospital: req.hospitalName, status: req.status } })}>
                <View style={styles.cardTop}>
                  <View style={styles.cardLeft}>
                    <View style={styles.bloodPill}><Text style={styles.bloodPillText}>{req.bloodGroup}</Text></View>
                    <View>
                      <Text style={styles.reqId}>{req.id}</Text>
                      <Text style={styles.reqUnits}>{req.units} units{req.isEmergency ? ' • 🚨 Emergency' : ''}</Text>
                    </View>
                  </View>
                  <Badge label={req.status} variant="status" status={req.status as RequestStatus} />
                </View>
                <Text style={styles.reqHospital}>{req.hospitalName}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.reqTime}>{req.createdAt}</Text>
                  <TouchableOpacity style={styles.detailsBtn}>
                    <Text style={styles.detailsBtnText}>Details</Text>
                    <Ionicons name="chevron-forward" size={14} color={Colors.primary.DEFAULT} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  tabRow: { maxHeight: 52, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tabContent: { paddingHorizontal: 16, alignItems: 'center', gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9' },
  tabActive: { backgroundColor: Colors.primary.DEFAULT },
  tabText: { fontSize: 13, fontWeight: '700', color: Colors.text.secondary },
  tabTextActive: { color: '#FFFFFF' },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 100 },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.text.primary },
  emptySubtitle: { fontSize: 13, color: Colors.text.secondary, textAlign: 'center' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bloodPill: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary.light, alignItems: 'center', justifyContent: 'center' },
  bloodPillText: { fontSize: 13, fontWeight: '900', color: Colors.primary.DEFAULT },
  reqId: { fontSize: 14, fontWeight: '800', color: Colors.text.primary },
  reqUnits: { fontSize: 12, color: Colors.text.secondary, marginTop: 2 },
  reqHospital: { fontSize: 12, color: Colors.text.muted, marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8 },
  reqTime: { fontSize: 12, color: Colors.text.muted },
  detailsBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  detailsBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary.DEFAULT },
});

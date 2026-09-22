import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Colors from '@/constants/colors';
import Badge from '@/components/ui/Badge';
import BottomTabBar from '@/components/common/BottomTabBar';
import { useAuth } from '@/lib/AuthContext';
import { BloodService } from '@/services/api/bloodService';

export default function HomeScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const [latestRequest, setLatestRequest] = useState<any>(null);
  const [isLoadingRequest, setIsLoadingRequest] = useState(true);

  useEffect(() => {
    async function loadLatestRequest() {
      if (!user?.id) return;
      try {
        setIsLoadingRequest(true);
        const requests = await BloodService.getRequests(user.id);
        if (requests && requests.length > 0) {
          setLatestRequest(requests[0]);
        }
      } catch (error) {
        console.error("Failed to load requests", error);
      } finally {
        setIsLoadingRequest(false);
      }
    }
    loadLatestRequest();
  }, [user?.id]);

  const handleFindBlood = () => { router.push('/(user)/search'); };
  const handleEmergencyRequest = () => { router.push('/(user)/emergency'); };
  const handleCategoryPress = (category: string) => { setSelectedCategory(category); router.push({ pathname: '/(user)/search', params: { category } }); };
  const handleOpenProfile = () => { router.push('/(user)/profile'); };
  const handleOpenRequests = () => { router.push('/(user)/requests'); };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.brandRow}>
              <View style={styles.miniLogo}>
                <Ionicons name="water" size={20} color={Colors.primary.DEFAULT} />
              </View>
              <Text style={styles.greetingTitle}>Hello, <Text style={styles.userName}>{profile?.name?.split(' ')[0] || 'there'} 👋</Text></Text>
            </View>
            <Text style={styles.taglineSmall}>Every Drop Saves Lives ❤️</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(user)/search')} style={styles.locationPill}>
              <Ionicons name="location" size={14} color={Colors.primary.DEFAULT} />
              <Text style={styles.locationText}>{profile?.city || 'Nagpur'}, {profile?.state || 'Maharashtra'}</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.text.muted} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity activeOpacity={0.7} style={styles.iconCircle} onPress={() => alert('2 notifications')}>
              <Ionicons name="notifications-outline" size={22} color={Colors.text.primary} />
              <View style={styles.notificationDot}><Text style={styles.notificationDotText}>2</Text></View>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} onPress={handleOpenProfile} style={styles.avatarCircle}>
              <Ionicons name="person" size={20} color={Colors.primary.DEFAULT} />
            </TouchableOpacity>
          </View>
        </View>
        {/* Primary Action: Find Blood */}
        <TouchableOpacity activeOpacity={0.88} onPress={handleFindBlood} style={styles.findBloodBtn}>
          <View style={styles.findBloodIconWrapper}><Ionicons name="search" size={22} color="#FFFFFF" /></View>
          <Text style={styles.findBloodText}>Find Blood</Text>
        </TouchableOpacity>
        {/* Emergency CTA */}
        <TouchableOpacity activeOpacity={0.88} onPress={handleEmergencyRequest} style={styles.emergencyBtn}>
          <View style={styles.emergencyLeft}>
            <View style={styles.sirenCircle}><Ionicons name="warning" size={20} color={Colors.primary.DEFAULT} /></View>
            <View>
              <Text style={styles.emergencyTitle}>Emergency Request</Text>
              <Text style={styles.emergencySub}>Instant broadcast to nearby verified centers</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.primary.DEFAULT} />
        </TouchableOpacity>
        {/* Category Row */}
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Quick Directory</Text></View>
        <View style={styles.categoryRow}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => handleCategoryPress('Hospitals')} style={styles.categoryCard}>
            <View style={[styles.categoryIconBg, { backgroundColor: '#E0F2FE' }]}><Ionicons name="business" size={26} color="#0284C7" /></View>
            <Text style={styles.categoryLabel}>Hospitals</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} onPress={() => handleCategoryPress('Blood Banks')} style={styles.categoryCard}>
            <View style={[styles.categoryIconBg, { backgroundColor: Colors.primary.light }]}><Ionicons name="water" size={26} color={Colors.primary.DEFAULT} /></View>
            <Text style={styles.categoryLabel}>Blood Banks</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} onPress={() => handleCategoryPress('NGOs')} style={styles.categoryCard}>
            <View style={[styles.categoryIconBg, { backgroundColor: '#DCFCE7' }]}><Ionicons name="heart" size={26} color="#16A34A" /></View>
            <Text style={styles.categoryLabel}>NGOs</Text>
          </TouchableOpacity>
        </View>
        {/* Donor Banner */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => alert('Donor Registration')} style={styles.donorBanner}>
          <View style={styles.donorTextCol}>
            <Text style={styles.donorTitle}>Be a Donor</Text>
            <Text style={styles.donorSubtitle}>Make a life-saving difference in Nagpur</Text>
            <View style={styles.donorLinkRow}>
              <Text style={styles.donorLinkText}>Update donor status</Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.primary.DEFAULT} />
            </View>
          </View>
          <View style={styles.donorGraphic}>
            <Ionicons name="water" size={44} color={Colors.primary.DEFAULT} />
            <View style={styles.donorHeartOverlay}><Ionicons name="heart" size={18} color="#FFFFFF" /></View>
          </View>
        </TouchableOpacity>
        {/* Recent Requests */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Requests</Text>
          <TouchableOpacity onPress={handleOpenRequests}><Text style={styles.viewAllText}>View All</Text></TouchableOpacity>
        </View>

        {isLoadingRequest ? (
          <ActivityIndicator size="small" color={Colors.primary.DEFAULT} style={{ marginVertical: 20 }} />
        ) : latestRequest ? (
          <TouchableOpacity activeOpacity={0.85} onPress={handleOpenRequests} style={styles.requestCard}>
            <View style={styles.requestCardTop}>
              <View>
                <Text style={styles.requestId}>#{latestRequest.id?.slice(0, 8).toUpperCase()}</Text>
                <Text style={styles.requestHospital}>{latestRequest.hospitalName}</Text>
              </View>
              <Badge label={latestRequest.status} variant="status" status={latestRequest.status} />
            </View>
            <View style={styles.requestCardBottom}>
              <View style={styles.requestDetailItem}>
                <Text style={styles.detailLabel}>Units & Group:</Text>
                <Text style={styles.detailValue}>{latestRequest.units} units • {latestRequest.bloodGroup}</Text>
              </View>
              <View style={styles.requestDetailItem}>
                <Text style={styles.detailLabel}>Time:</Text>
                <Text style={styles.detailValue}>{new Date(latestRequest.createdAt).toLocaleDateString()}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={[styles.requestCard, { alignItems: 'center', paddingVertical: 24 }]}>
            <Text style={{ color: Colors.text.secondary, marginBottom: 12 }}>No requests yet</Text>
            <TouchableOpacity onPress={handleEmergencyRequest} style={{ backgroundColor: Colors.primary.light, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
              <Text style={{ color: Colors.primary.DEFAULT, fontWeight: '700' }}>Create a Request</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      <BottomTabBar activeTab="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 8, marginBottom: 16 },
  headerLeft: { flex: 1 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  miniLogo: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary.light, alignItems: 'center', justifyContent: 'center' },
  greetingTitle: { fontSize: 20, fontWeight: '800', color: Colors.text.primary },
  userName: { color: Colors.primary.DEFAULT },
  taglineSmall: { fontSize: 12, fontWeight: '500', color: Colors.text.secondary, marginTop: 2, marginLeft: 34 },
  locationPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginTop: 8, alignSelf: 'flex-start', borderWidth: 1, borderColor: Colors.surface.border, gap: 4 },
  locationText: { fontSize: 12, fontWeight: '600', color: Colors.text.primary },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 4 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.surface.border, position: 'relative' },
  notificationDot: { position: 'absolute', top: 4, right: 4, backgroundColor: Colors.primary.DEFAULT, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  notificationDotText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary.light, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.primary.border },
  findBloodBtn: { backgroundColor: Colors.primary.DEFAULT, height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: Colors.primary.DEFAULT, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 4, marginBottom: 12, gap: 10 },
  findBloodIconWrapper: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  findBloodText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', letterSpacing: 0.3 },
  emergencyBtn: { backgroundColor: Colors.primary.lighter, borderWidth: 1.5, borderColor: Colors.primary.border, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  emergencyLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sirenCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary.light, alignItems: 'center', justifyContent: 'center' },
  emergencyTitle: { fontSize: 15, fontWeight: '800', color: Colors.primary.darker },
  emergencySub: { fontSize: 11, color: Colors.text.secondary, marginTop: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.text.primary },
  viewAllText: { fontSize: 13, fontWeight: '700', color: Colors.primary.DEFAULT },
  categoryRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  categoryCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.surface.border },
  categoryIconBg: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  categoryLabel: { fontSize: 12, fontWeight: '700', color: Colors.text.primary },
  donorBanner: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: Colors.surface.border, marginBottom: 20 },
  donorTextCol: { flex: 1 },
  donorTitle: { fontSize: 16, fontWeight: '800', color: Colors.text.primary },
  donorSubtitle: { fontSize: 12, color: Colors.text.secondary, marginTop: 2, marginBottom: 8 },
  donorLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  donorLinkText: { fontSize: 12, fontWeight: '700', color: Colors.primary.DEFAULT },
  donorGraphic: { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.primary.light, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  donorHeartOverlay: { position: 'absolute', bottom: '22%', alignItems: 'center', justifyContent: 'center' },
  requestCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.surface.border },
  requestCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: Colors.surface.borderLight, paddingBottom: 10, marginBottom: 10 },
  requestId: { fontSize: 14, fontWeight: '800', color: Colors.text.primary },
  requestHospital: { fontSize: 12, color: Colors.text.secondary, marginTop: 2 },
  requestCardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  requestDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailLabel: { fontSize: 12, color: Colors.text.muted },
  detailValue: { fontSize: 12, fontWeight: '700', color: Colors.text.primary },
});

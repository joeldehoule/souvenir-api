import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Plus, Calendar, Users, Camera, Search, QrCode, Link2 } from 'lucide-react-native';
import { EventCard } from '@/components/EventCard';

const MOCK_EVENTS = [
  {
    id: '1',
    name: 'Sarah & John Wedding',
    date: '2024-03-15',
    type: 'Wedding',
    memberCount: 24,
    color: '#2E447A',
  },
  {
    id: '2',
    name: 'Birthday Celebration',
    date: '2024-02-28',
    type: 'Birthday',
    memberCount: 12,
    color: '#EA1467',
  },
  {
    id: '3',
    name: 'Corporate Gala',
    date: '2024-04-10',
    type: 'Gala',
    memberCount: 156,
    color: '#0EA5E9',
  },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const filteredEvents = MOCK_EVENTS.filter(event =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJoinEvent = () => {
    if (joinCode.trim()) {
      // Simulate joining event
      router.push(`/event/${joinCode}`);
    }
  };

  return (
    <LinearGradient
      colors={['#F8FAFC', '#FFFFFF']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.subtitle}>Manage your events and memories</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <Search color="#9CA3AF" size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search events..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => router.push('/(tabs)/create')}
          >
            <Plus color="white" size={24} />
            <Text style={styles.primaryActionText}>Create Event</Text>
          </TouchableOpacity>

          <View style={styles.joinEventContainer}>
            <Text style={styles.joinEventTitle}>Join Event</Text>
            <View style={styles.joinEventForm}>
              <TextInput
                style={styles.joinEventInput}
                placeholder="Enter event code"
                value={joinCode}
                onChangeText={setJoinCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={styles.joinEventButton}
                onPress={handleJoinEvent}
              >
                <QrCode color="#2E447A" size={20} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.pasteLinkButton}>
              <Link2 color="#2E447A" size={16} />
              <Text style={styles.pasteLinkText}>Paste Link</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.eventsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Events</Text>
            <Text style={styles.eventCount}>{filteredEvents.length} events</Text>
          </View>

          <View style={styles.eventsList}>
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => router.push(`/event/${event.id}`)}
              />
            ))}
            
            {filteredEvents.length === 0 && (
              <View style={styles.emptyState}>
                <Calendar color="#9CA3AF" size={48} />
                <Text style={styles.emptyStateTitle}>No events found</Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery ? 'Try adjusting your search' : 'Create your first event to get started'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  quickActions: {
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 16,
  },
  primaryAction: {
    backgroundColor: '#2E447A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#2E447A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryActionText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  joinEventContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  joinEventTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  joinEventForm: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  joinEventInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  joinEventButton: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pasteLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  pasteLinkText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2E447A',
  },
  eventsSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  eventCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  eventsList: {
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});
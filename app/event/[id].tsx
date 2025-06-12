import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { ArrowLeft, Camera, Video, Heart, Users, Calendar, Share, Lock } from 'lucide-react-native';

const MOCK_EVENT_DATA = {
  name: 'Sarah & John Wedding',
  date: '2024-03-15',
  type: 'Wedding',
  memberCount: 24,
  color: '#2E447A',
  photos: [
    'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=300',
    'https://images.pexels.com/photos/1729931/pexels-photo-1729931.jpeg?auto=compress&cs=tinysrgb&w=300',
    'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=300',
    'https://images.pexels.com/photos/1024994/pexels-photo-1024994.jpeg?auto=compress&cs=tinysrgb&w=300',
    'https://images.pexels.com/photos/1729931/pexels-photo-1729931.jpeg?auto=compress&cs=tinysrgb&w=300',
    'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=300',
  ],
  videos: [
    'https://images.pexels.com/photos/1729931/pexels-photo-1729931.jpeg?auto=compress&cs=tinysrgb&w=300',
    'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=300',
  ],
};

type TabType = 'info' | 'photos' | 'videos' | 'guestbook';

export default function EventScreen() {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('info');

  // Check if guestbook should be available based on event type
  const showGuestbook = MOCK_EVENT_DATA.type === 'Wedding' || MOCK_EVENT_DATA.type === 'Birthday';

  const handleCameraPress = () => {
    router.push('/camera');
  };

  const handleGuestbookPress = () => {
    // Navigate to guestbook recording
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <View style={styles.infoContent}>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Event Details</Text>
              <View style={styles.infoRow}>
                <Calendar color="#6B7280" size={20} />
                <Text style={styles.infoText}>March 15, 2024</Text>
              </View>
              <View style={styles.infoRow}>
                <Users color="#6B7280" size={20} />
                <Text style={styles.infoText}>{MOCK_EVENT_DATA.memberCount} members</Text>
              </View>
              <View style={styles.infoRow}>
                <Heart color="#6B7280" size={20} />
                <Text style={styles.infoText}>{MOCK_EVENT_DATA.type} Event</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.shareButton}>
              <Share color="#2E447A" size={20} />
              <Text style={styles.shareButtonText}>Share Event Code</Text>
            </TouchableOpacity>
          </View>
        );
      
      case 'photos':
        return (
          <View style={styles.mediaGrid}>
            {MOCK_EVENT_DATA.photos.map((photo, index) => (
              <View key={index} style={styles.mediaItem}>
                <Image source={{ uri: photo }} style={styles.mediaImage} />
              </View>
            ))}
          </View>
        );
      
      case 'videos':
        return (
          <View style={styles.mediaGrid}>
            {MOCK_EVENT_DATA.videos.map((video, index) => (
              <View key={index} style={styles.mediaItem}>
                <Image source={{ uri: video }} style={styles.mediaImage} />
                <View style={styles.videoOverlay}>
                  <Video color="white" size={20} />
                </View>
              </View>
            ))}
          </View>
        );
      
      case 'guestbook':
        return (
          <View style={styles.guestbookContent}>
            <View style={styles.guestbookCard}>
              <Lock color="#2E447A" size={48} />
              <Text style={styles.guestbookTitle}>Guestbook Locked</Text>
              <Text style={styles.guestbookSubtitle}>
                Messages will be unlocked the day after the event
              </Text>
              <Text style={styles.guestbookDate}>Available on March 16, 2024</Text>
            </View>
            
            <TouchableOpacity style={styles.recordButton} onPress={handleGuestbookPress}>
              <Video color="white" size={20} />
              <Text style={styles.recordButtonText}>Record Message</Text>
            </TouchableOpacity>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <LinearGradient
      colors={['#F8FAFC', '#FFFFFF']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#6B7280" size={24} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.eventName} numberOfLines={1}>
            {MOCK_EVENT_DATA.name}
          </Text>
          <Text style={styles.eventType}>{MOCK_EVENT_DATA.type}</Text>
        </View>
        <TouchableOpacity style={styles.cameraButton} onPress={handleCameraPress}>
          <Camera color="white" size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'info' && styles.activeTab]}
          onPress={() => setActiveTab('info')}
        >
          <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>
            Info
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'photos' && styles.activeTab]}
          onPress={() => setActiveTab('photos')}
        >
          <Text style={[styles.tabText, activeTab === 'photos' && styles.activeTabText]}>
            Photos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'videos' && styles.activeTab]}
          onPress={() => setActiveTab('videos')}
        >
          <Text style={[styles.tabText, activeTab === 'videos' && styles.activeTabText]}>
            Videos
          </Text>
        </TouchableOpacity>
        {showGuestbook && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'guestbook' && styles.activeTab]}
            onPress={() => setActiveTab('guestbook')}
          >
            <Text style={[styles.tabText, activeTab === 'guestbook' && styles.activeTabText]}>
              Guestbook
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>

      {activeTab !== 'info' && (
        <View style={styles.floatingButton}>
          <TouchableOpacity style={styles.generateButton} onPress={() => router.push('/souvenir')}>
            <Heart color="white" size={20} />
            <Text style={styles.generateButtonText}>Generate Souvenir</Text>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  eventType: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  cameraButton: {
    backgroundColor: '#2E447A',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 24,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#2E447A',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  activeTabText: {
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  infoContent: {
    paddingBottom: 32,
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  shareButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2E447A',
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 100,
  },
  mediaItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 6,
    borderRadius: 4,
  },
  guestbookContent: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  guestbookCard: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  guestbookTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  guestbookSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  guestbookDate: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2E447A',
  },
  recordButton: {
    backgroundColor: '#2E447A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  recordButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  generateButton: {
    backgroundColor: '#EA1467',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#EA1467',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  generateButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});
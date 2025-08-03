// app/(tabs)/index.tsx

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useCallback, useEffect } from 'react';
import {
  Plus,
  Calendar,
  QrCode,
  CheckCircle,
  XCircle,
  Users,
  Camera,
  Video,
  Heart
} from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();

  const [joinCode, setJoinCode] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchEvents = async () => {
        try {
          const storedEvents = await AsyncStorage.getItem('memento_events');
          const parsedEvents = storedEvents ? JSON.parse(storedEvents) : [];

          setEvents(parsedEvents);

          const fakeRequests = [
            {
              eventId: '1',
              eventName: 'Anniversaire Clara',
              requester: {
                userId: 'user-001',
                identifiant: 'JohnDoe',
                phoneNumber: '0102030405',
                photo: null,
              },
            },
            {
              eventId: '2',
              eventName: 'Mariage Pierre & Amina',
              requester: {
                userId: 'user-002',
                identifiant: 'Marie78',
                phoneNumber: '0708091011',
                photo: null,
              },
            },
          ];

          setPendingRequests(fakeRequests);
        } catch (error) {
          console.error('Erreur chargement événements:', error);
        }
      };
      fetchEvents();
    }, [])
  );

  const handleJoinEvent = async () => {
    try {
      const storedEvents = await AsyncStorage.getItem('memento_events');
      const parsedEvents = storedEvents ? JSON.parse(storedEvents) : [];

      const matchingEvent = parsedEvents.find(
        (event: any) => event.eventCode === joinCode.toUpperCase()
      );

      if (matchingEvent) {
        const userId = 'user-id-temporaire';
        const userPhone = '0000000000';
        const userIdentifiant = 'Identifiant';

        const updatedEvents = parsedEvents.map((event: any) => {
          if (event.id === matchingEvent.id) {
            const alreadyRequested = (event.pendingRequests || []).some(
              (req: any) => req.userId === userId
            );

            if (!alreadyRequested) {
              event.pendingRequests = [
                ...(event.pendingRequests || []),
                {
                  userId,
                  identifiant: userIdentifiant,
                  phoneNumber: userPhone,
                  photo: null,
                },
              ];
            }
          }
          return event;
        });

        await AsyncStorage.setItem('memento_events', JSON.stringify(updatedEvents));
        setEvents(updatedEvents);
        setSuccessModalVisible(true);
        setTimeout(() => setSuccessModalVisible(false), 1500);
      } else {
        setErrorModalVisible(true);
        setTimeout(() => setErrorModalVisible(false), 1500);
      }
    } catch (error) {
      console.error("Erreur lors de la recherche de l'événement :", error);
    }
  };

  const handleValidateRequest = async () => {
    if (!selectedRequest) return;

    const updatedEvents = events.map((event: any) => {
      if (event.id === selectedRequest.eventId) {
        event.pendingRequests = (event.pendingRequests || []).filter(
          (req: any) => req.userId !== selectedRequest.requester.userId
        );

        event.approvedMembers = [
          ...(event.approvedMembers || []),
          selectedRequest.requester
        ];
      }
      return event;
    });

    await AsyncStorage.setItem('memento_events', JSON.stringify(updatedEvents));
    setEvents(updatedEvents);
    setRequestModalVisible(false);

    setSuccessModalVisible(true);
    setTimeout(() => setSuccessModalVisible(false), 1500);
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;

    const updatedEvents = events.map((event: any) => {
      if (event.id === selectedRequest.eventId) {
        event.pendingRequests = (event.pendingRequests || []).filter(
          (req: any) => req.userId !== selectedRequest.requester.userId
        );
      }
      return event;
    });

    await AsyncStorage.setItem('memento_events', JSON.stringify(updatedEvents));
    setEvents(updatedEvents);
    setRequestModalVisible(false);

    setErrorModalVisible(true);
    setTimeout(() => setErrorModalVisible(false), 1500);
  };

  return (
    <LinearGradient colors={['#F8FAFC', '#EDE9FE']} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Bienvenue</Text>
          <Text style={styles.subtitle}>Des souvenirs mémorables pour vos événements</Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => router.push('/(tabs)/create')}
          >
            <Plus color="white" size={24} />
            <Text style={styles.primaryActionText}>Créer un événement</Text>
          </TouchableOpacity>

          <View style={styles.joinEventContainer}>
            <Text style={styles.joinEventTitle}>Rejoindre un événement</Text>
            <View style={styles.joinEventForm}>
              <TextInput
                style={styles.joinEventInput}
                placeholder="Code événement"
                value={joinCode}
                onChangeText={setJoinCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity style={styles.joinEventButton} onPress={handleJoinEvent}>
                <Text style={styles.joinEventButtonText}>Valider</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.joinEventContainer}>
            <Text style={styles.sectionTitle}>Tableau de bord</Text>
            <View style={styles.statsSection}>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Calendar size={24} color="#8A2BE2" />
                  <Text style={styles.statNumber}>12</Text>
                  <Text style={styles.statLabel}>Events</Text>
                </View>
                <View style={styles.statCard}>
                  <Heart size={24} color="#8A2BE2" />
                  <Text style={styles.statNumber}>5</Text>
                  <Text style={styles.statLabel}>Souvenirs générés</Text>
                </View>
              </View>
            </View>

            <View style={styles.statsSection}>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Camera size={24} color="#8A2BE2" />
                  <Text style={styles.statNumber}>147</Text>
                  <Text style={styles.statLabel}>Photos</Text>
                </View>
                <View style={styles.statCard}>
                  <Video size={24} color="#8A2BE2" />
                  <Text style={styles.statNumber}>5</Text>
                  <Text style={styles.statLabel}>Vidéos</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.joinEventContainer2}>
            <Text style={styles.sectionTitle}>Demandes à valider</Text>
            <View style={styles.requestsSection}>
              {pendingRequests.length === 0 ? (
                <Text style={styles.noRequestsText}>Aucune demande en attente.</Text>
              ) : (
                pendingRequests.map((req, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.requestItem}
                    onPress={() => {
                      setSelectedRequest(req);
                      setRequestModalVisible(true);
                    }}
                  >
                    <View style={styles.requestAvatar} />
                    <View style={styles.requestInfo}>
                      <Text style={styles.requestName}>{req.requester.identifiant}</Text>
                      <Text style={styles.requestPhone}>{req.requester.phoneNumber}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal succès */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={successModalVisible}
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <CheckCircle color="#10B981" size={64} />
            <Text style={styles.modalText}>Demande validée !</Text>
          </View>
        </View>
      </Modal>

      {/* Modal erreur */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={errorModalVisible}
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <XCircle color="#EF4444" size={64} />
            <Text style={styles.modalText}>Demande rejetée !</Text>
          </View>
        </View>
      </Modal>

      {/* Modal détail demande */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={requestModalVisible}
        onRequestClose={() => setRequestModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedRequest && (
              <>
                <View style={styles.requestModalAvatar} />
                <Text style={styles.modalTitle}>{selectedRequest.requester.identifiant}</Text>
                <Text style={styles.modalSubtitle}>{selectedRequest.requester.phoneNumber}</Text>
                <Text style={styles.modalEventTitle}>Événement : {selectedRequest.eventName}</Text>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={handleValidateRequest}
                  >
                    <Text style={styles.acceptButtonText}>Valider</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={handleRejectRequest}
                  >
                    <Text style={styles.rejectButtonText}>Rejeter</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1, paddingTop: 60, paddingBottom: 100 },
  header: { paddingHorizontal: 24, marginBottom: 24 },
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
  searchContainer: { paddingHorizontal: 24, marginBottom: 24 },
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
  quickActions: { paddingHorizontal: 24, marginBottom: 32, gap: 16 },
  primaryAction: {
    backgroundColor: '#EA1467',
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
  joinEventContainer2: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 48,
  },
  joinEventTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  joinEventForm: { flexDirection: 'row', gap: 8, marginBottom: 12 },
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
  eventsList: { gap: 12 },
  deleteButton: {
    backgroundColor: 'red',
    borderRadius: 20,
    padding: 6,
  },
  editButton: {
    backgroundColor: '#2E447A',
    borderRadius: 20,
    padding: 6,
    marginRight: 8,
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
  actionButtonsContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginTop: 16,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  statsSection: {
    marginBottom: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6E6FA',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#4A4A4A',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#8A8A8A',
  },
  requestsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  noRequestsText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  requestAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D1D5DB',
    marginRight: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  requestPhone: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  requestModalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D1D5DB',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 12,
  },
  modalEventTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: 'white',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
});

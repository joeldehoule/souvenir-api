import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useCallback } from 'react';
import {
  Calendar,
  QrCode,
  Search,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
} from 'lucide-react-native';
import { EventCard } from '@/components/EventCard';

export default function HomeScreen() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchEvents = async () => {
        try {
          const storedEvents = await AsyncStorage.getItem('memento_events');
          if (storedEvents) {
            const parsed = JSON.parse(storedEvents);
            const validEvents = parsed.filter(
              (e: any) => e && typeof e.name === 'string' && e.id
            );
            setEvents(validEvents);
          } else {
            setEvents([]);
          }
        } catch (error) {
          console.error('Erreur chargement événements:', error);
        }
      };
      fetchEvents();
    }, [])
  );

  const filteredEvents = events.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditEvent = (id: string) => {
    router.push(`/event/edit/${id}`);
  };

  const handleDeleteEvent = (id: string) => {
    Alert.alert('Supprimer ?', 'Confirme la suppression.', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Oui',
        style: 'destructive',
        onPress: async () => {
          const updated = events.filter((e) => e.id !== id);
          setEvents(updated);
          await AsyncStorage.setItem('memento_events', JSON.stringify(updated));
        },
      },
    ]);
  };

  const handlePressEvent = (id: string) => {
    router.push(`/event/${id}`);
  };

  const handleJoinEvent = async () => {
    try {
      const storedEvents = await AsyncStorage.getItem('memento_events');
      const parsedEvents = storedEvents ? JSON.parse(storedEvents) : [];

      const code = joinCode.trim().toUpperCase();

      const matchingEvent = parsedEvents.find(
        (event: any) => event.eventCode === code
      );

      if (matchingEvent) {
        const userId = 'user-id-temporaire'; // TODO: remplacer par vrai ID utilisateur

        const updatedEvents = parsedEvents.map((event: any) => {
          if (event.id === matchingEvent.id) {
            const alreadyRequested = event.pendingRequests?.includes(userId);
            if (!alreadyRequested) {
              event.pendingRequests = [...(event.pendingRequests || []), userId];
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
      Alert.alert('Erreur', "Une erreur est survenue. Veuillez réessayer.");
    }
  };

  return (
    <LinearGradient colors={['#F8FAFC', '#EDE9FE']} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Events</Text>
          <Text style={styles.subtitle}>Gérez vos events</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <Search color="#9CA3AF" size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un événement..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.eventsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes Événements</Text>
            <Text style={styles.eventCount}>{filteredEvents.length} événement(s)</Text>
          </View>

          <View style={styles.eventsList}>
            {filteredEvents.map((event) => (
              <View key={event.id} style={{ position: 'relative' }}>
                <EventCard event={event} onPress={() => handlePressEvent(event.id)} />

                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditEvent(event.id)}
                  >
                    <Edit2 color="#fff" size={18} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteEvent(event.id)}
                  >
                    <Trash2 color="#fff" size={18} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {filteredEvents.length === 0 && (
              <View style={styles.emptyState}>
                <Calendar color="#9CA3AF" size={48} />
                <Text style={styles.emptyStateTitle}>Aucun événement</Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery
                    ? 'Aucun résultat pour cette recherche.'
                    : 'Créez votre 1er événement.'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modal de succès */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={successModalVisible}
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <CheckCircle color="#10B981" size={64} />
            <Text style={styles.modalText}>Demande envoyée !</Text>
          </View>
        </View>
      </Modal>

      {/* Modal d'erreur */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={errorModalVisible}
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <XCircle color="#EF4444" size={64} />
            <Text style={styles.modalText}>Code incorrect !</Text>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1, paddingTop: 60, paddingBottom: 150 },
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
    marginBottom: 54,
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
});

import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Camera,
  Video,
  Heart,
  Users,
  Calendar,
  Share,
  Play,
  Lock,
  QrCode
} from 'lucide-react-native';
import { getEventById, updateEvent } from '@/lib/storage';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { Trash } from 'lucide-react-native';
import { Modal } from 'react-native';
import { Video as ExpoVideo } from 'expo-av';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dimensions } from 'react-native';
import { Stack } from 'expo-router';

type TabType = 'info' | 'photos' | 'videos' | 'guestbook';

export const unstable_settings = { headerShown: false };

export default function EventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('info');

  const screenWidth = Dimensions.get('window').width;
  const itemSpacing = 3;
  const numColumns = 4;
  const itemSize = (screenWidth - itemSpacing * (numColumns + 1)) / numColumns;

  const fetchEvent = async () => {
    if (!id) return;
    try {
      const found = await getEventById(id);
      if (found) {
        setEvent({
          ...found,
          photos: found.photos || [],
          videos: found.videos || [],
          guestbookVideos: found.guestbookVideos || []
        });
      } else {
        Alert.alert('Introuvable', "L'événement demandé n'existe pas.");
      }
    } catch (error) {
      Alert.alert('Erreur', "Impossible de charger l'événement.");
      console.error(error);
    }
  };

  useEffect(() => {
    if (!id) {
      console.warn("Aucun ID d'événement fourni.");
      return;
    }

    const fetchEvent = async () => {
      try {
        const eventsData = await AsyncStorage.getItem("memento_events");
        const storedEvents = eventsData ? JSON.parse(eventsData) : [];
        const foundEvent = storedEvents.find((e: any) => e.id === id);
        setEvent(foundEvent);
        console.log("Données événement:", foundEvent);
      } catch (error) {
        console.error("Erreur lors du chargement de l'événement :", error);
      }
    };

    fetchEvent();
  }, [id]);

  useFocusEffect(
    React.useCallback(() => {
      fetchEvent();
    }, [id])
  );

  const refreshEvent = async () => {
    if (!id) return;
    const updated = await getEventById(id);
    if (updated) {
      setEvent({
        ...updated,
        photos: updated.photos || [],
        videos: updated.videos || [],
        guestbookVideos: updated.guestbookVideos || []
      });
    }
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Veuillez autoriser l’accès à la caméra.');
      return false;
    }
    return true;
  };

  const handleCaptureMedia = async (
  mediaType: 'image' | 'video',
  target: 'photos' | 'videos' | 'guestbookVideos'
) => {
  const granted = await requestCameraPermission();
  if (!granted) return;

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes:
      mediaType === 'image'
        ? ImagePicker.MediaTypeOptions.Images
        : ImagePicker.MediaTypeOptions.Videos,
    videoMaxDuration: 180,
    quality: 1
  });

  if (!result.canceled && result.assets?.length > 0) {
    const newItem =
      mediaType === 'image'
        ? { uri: result.assets[0].uri }
        : { uri: result.assets[0].uri, thumbnail: '' };

    // Construction du nouvel événement avec média ajouté
    const updatedEvent = {
      ...event,
      [target]: [...(event?.[target] || []), newItem]
    };

    // Mise à jour persistante dans le stockage
    await updateEvent(id!, updatedEvent);

    // Mise à jour de l'état local
    setEvent(updatedEvent);
  } else {
    Alert.alert('Capture annulée', 'Vous devez valider la capture pour qu’elle soit enregistrée.');
  }
};

const [modalVisible, setModalVisible] = useState(false);
const [selectedMediaUri, setSelectedMediaUri] = useState('');
const [selectedMediaType, setSelectedMediaType] = useState<'image' | 'video'>('image');

const MediaViewerModal = ({
  visible,
  onClose,
  uri,
  type
}: {
  visible: boolean;
  onClose: () => void;
  uri: string;
  type: 'image' | 'video';
}) => {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalBackground}>
        <TouchableOpacity style={styles.modalCloseArea} onPress={onClose} />
        <View style={styles.modalContent}>
          {type === 'image' ? (
            <Image source={{ uri }} style={styles.fullscreenImage} resizeMode="contain" />
          ) : (
            <ExpoVideo
              source={{ uri }}
              style={styles.fullscreenVideo}
              useNativeControls
              resizeMode="contain"
              shouldPlay
            />
          )}
        </View>
        <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
          <Text style={styles.modalCloseText}>Fermer</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const handleDeleteMedia = async (
  index: number,
  target: 'photos' | 'videos' | 'guestbookVideos'
) => {
  if (!event) return;

  Alert.alert(
    'Supprimer',
    'Voulez-vous vraiment supprimer ce média ?',
    [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          const updatedItems = [...event[target]];
          updatedItems.splice(index, 1); // Supprime l’élément à l’index donné

          const updatedEvent = {
            ...event,
            [target]: updatedItems
          };

          await updateEvent(id!, updatedEvent); // Mise à jour persistante
          setEvent(updatedEvent); // Mise à jour locale
        }
      }
    ]
  );
};

  const handleShareWhatsApp = () => {
    const message = `Voici le code de mon événement : ${event?.eventCode}`;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    router.push(url);
  };

  const GoBackHome = () => {
    router.push('/');
  };

  const GoToEvents = () => {
    router.push('/(tabs)/events');
  };

  const showGuestbook = event?.type === 'Mariage' || event?.type === 'Anniversaire';

  const tabs: TabType[] = ['info', 'photos', 'videos'];
  if (showGuestbook) tabs.push('guestbook');

  const renderTabContent = () => {
    if (!event) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E447A" />
          <Text>Chargement de l’événement...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'info':
        return (
          <View style={styles.infoContent}>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Détails de l'événement</Text>
              <View style={styles.infoRow}>
                <Calendar color="#6B7280" size={20} />
                <Text style={styles.infoText}>{new Date(event.date).toDateString()}</Text>
              </View>
              <View style={styles.infoRow}>
                <Users color="#6B7280" size={20} />
                <Text style={styles.infoText}>{event.joined?.length || 0} membre(s)</Text>
              </View>
              <View style={styles.infoRow}>
                <Heart color="#6B7280" size={20} />
                <Text style={styles.infoText}>{event.type}</Text>
              </View>
              <View style={styles.infoRow}>
                <QrCode color="#6B7280" size={20} />
                <Text style={styles.infoText}>Code de l'événement : {event.eventCode}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.shareButton} onPress={handleShareWhatsApp}>
              <Share color="white" size={20} />
              <Text style={styles.shareButtonText}>Partager le code de l'événement</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareButton2} onPress={GoToEvents}>
              <Text style={styles.shareButtonText}>Retour à mes événements</Text>
            </TouchableOpacity>
          </View>
        );

      case 'photos':
        return (
          <View style={styles.tabContent}>
            <TouchableOpacity style={styles.captureButton} onPress={() => handleCaptureMedia('image', 'photos')}>
              <Camera size={20} color="#FFFFFF" />
              <Text style={styles.captureButtonText}>Capturer une photo</Text>
            </TouchableOpacity>

            {event.photos.length > 0 ? (
              <View style={styles.mediaGrid}>
                {event.photos.map((photo: any, index: number) => (
                  <TouchableOpacity
                    key={index}

                    style={{
                      width: itemSize,
                      height: itemSize,
                      marginBottom: itemSpacing,
                      position: 'relative',
                      borderRadius: 8,
                      overflow: 'hidden',
                    }}

                    onPress={() => {
                      setSelectedMediaUri(photo.uri);
                      setSelectedMediaType('image');
                      setModalVisible(true);
                    }}
                  >
                    <Image source={{ uri: photo.uri }} style={{ width: '100%', height: '100%', borderRadius: 8 }} />
                    <TouchableOpacity
                      style={styles.deleteIcon}
                      onPress={() => handleDeleteMedia(index, 'photos')}
                    >
                      <Trash size={20} color="white" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>Aucune photo pour l’instant</Text>
            )}

          </View>
        );

      case 'videos':
        return (
          <View style={styles.tabContent}>
            <TouchableOpacity style={styles.captureButton} onPress={() => handleCaptureMedia('video', 'videos')}>
              <Video size={20} color="#FFFFFF" />
              <Text style={styles.captureButtonText}>Capturer une vidéo</Text>
            </TouchableOpacity>

            {event.videos.length > 0 ? (
              <View style={styles.mediaGrid}>
                {event.videos.map((video: any, index: number) => (
                  <TouchableOpacity
                    key={index}

                    style={{
                      width: itemSize,
                      height: itemSize,
                      marginBottom: itemSpacing,
                      position: 'relative',
                      borderRadius: 8,
                      overflow: 'hidden',
                    }}

                    onPress={() => {
                      setSelectedMediaUri(video.uri);
                      setSelectedMediaType('video');
                      setModalVisible(true);
                    }}
                  >
                    <Image source={{ uri: video.thumbnail || video.uri }} style={{ width: '100%', height: '100%', borderRadius: 8 }} />
                    <View style={styles.playOverlay}>
                      <Play size={24} color="#FFFFFF" />
                    </View>
                    <TouchableOpacity
                      style={styles.deleteIcon}
                      onPress={() => handleDeleteMedia(index, 'videos')}
                    >
                      <Trash size={20} color="white" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>Aucune vidéo pour l’instant</Text>
            )}
          </View>
        );

      case 'guestbook':
        return (
          <View style={styles.guestbookContent}>
            <View style={styles.guestbookCard}>
              <Lock color="#2E447A" size={48} />
              <Text style={styles.guestbookTitle}>Livre d'or verrouillé</Text>
              <Text style={styles.guestbookSubtitle}>
                Les messages seront déverrouillés le lendemain de l'événement
              </Text>
              <Text style={styles.guestbookDate}>
                Disponible à partir du {new Date(new Date(event.date).getTime() + 86400000).toDateString()}
              </Text>
            </View>

            <TouchableOpacity style={styles.captureButton} onPress={() => handleCaptureMedia('video', 'guestbookVideos')}>
              <Video size={20} color="#FFFFFF" />
              <Text style={styles.captureButtonText}>Enregistrer votre message</Text>
            </TouchableOpacity>

            {event.guestbookVideos.length > 0 ? (
              <View style={styles.mediaGrid}>
                {event.guestbookVideos.map((video: any, index: number) => (
                  <TouchableOpacity
                      key={index}

                      style={{
                        width: itemSize,
                        height: itemSize,
                        marginBottom: itemSpacing,
                        position: 'relative',
                        borderRadius: 8,
                        overflow: 'hidden',
                      }}

                      onPress={() => {
                        setSelectedMediaUri(video.uri);
                        setSelectedMediaType('video');
                        setModalVisible(true);
                      }}
                    >
                      <Image source={{ uri: video.thumbnail || video.uri }} style={{ width: '100%', height: '100%', borderRadius: 8 }} />
                      <View style={styles.playOverlay}>
                        <Play size={24} color="#FFFFFF" />
                      </View>
                      <TouchableOpacity
                        style={styles.deleteIcon}
                        onPress={() => handleDeleteMedia(index, 'guestbookVideos')}
                      >
                        <Trash size={20} color="white" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>Aucun message vidéo pour l’instant</Text>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <>
    <Stack.Screen options={{ headerShown: false }} />
    <LinearGradient colors={['#F8FAFC', '#FFFFFF']} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.eventName} numberOfLines={1}>
            {event?.name ?? 'Chargement...'}
          </Text>
          <Text style={styles.eventType}>{event?.type ?? ''}</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'info' ? 'Infos' : tab === 'guestbook' ? 'Livre d’or' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 150 }}
        showsVerticalScrollIndicator={false}
      >
        {renderTabContent()}
      </ScrollView>

      {activeTab !== 'info' && (
        <View style={styles.floatingButton}>
          <TouchableOpacity
            style={styles.generateButton} onPress={async () => {
              // 1. Récupérer les médias selon l'onglet actif
              let mediaToSend: { uri: string }[] = [];
              if (activeTab === 'photos') mediaToSend = event.photos || [];
              else if (activeTab === 'videos') mediaToSend = event.videos || [];
              else mediaToSend = event.guestbookVideos || [];

              if (mediaToSend.length === 0) {
                Alert.alert('Aucun média', 'Aucun média disponible pour cet événement.');
                return;
              }

              // 2. Stocker temporairement les médias dans AsyncStorage
              const tempKey = `souvenir_${event.id}`;
              await AsyncStorage.setItem(tempKey, JSON.stringify(mediaToSend));

              // 3. Naviguer vers la page souvenir avec eventId et mediaType
              router.push(`/souvenir?eventId=${event.id}&mediaType=${activeTab}`);
            }}
          >
            <Text>Générer votre souvenir</Text>
          </TouchableOpacity>


          <TouchableOpacity style={styles.shareButton2} onPress={GoToEvents}>
            <Text style={styles.shareButtonText}>Retour à mes événements</Text>
          </TouchableOpacity>
        </View>
      )}

      <MediaViewerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        uri={selectedMediaUri}
        type={selectedMediaType}
      />

    </LinearGradient>
    </>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
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

  headerInfo: { flex: 1 },
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
    backgroundColor: '#075e54',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    gap: 8,
  },

  shareButton2: {
    backgroundColor: '#2E447A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    gap: 8,
  },

  shareButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },

  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
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

  // Styles pour la section "Demandes"
  requestCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  requestText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    marginBottom: 8,
  },

  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },

  acceptButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  rejectButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  requestButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },

  captureButton: {
    marginTop: -10,
    marginBottom: 10,
    backgroundColor: '#EA1467',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  captureButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },

  tabContent: {
    padding: 16,
  },

  playOverlay: {
    position: 'absolute',
    top: '30%',
    left: '30%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },

  emptyText: {
    marginTop: 12,
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },

  deleteButton: {
  position: 'absolute',
  bottom: 5,
  right: 5,
  backgroundColor: 'rgba(0,0,0,0.6)',
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: 5
},

deleteButtonText: {
  color: '#fff',
  fontSize: 12
},

deleteIcon: {
  position: 'absolute',
  top: 5,
  right: 5,
  backgroundColor: 'rgba(0,0,0,0.6)',
  padding: 4,
  borderRadius: 20
},

modalBackground: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  justifyContent: 'center',
  alignItems: 'center'
},
modalContent: {
  width: '100%',
  height: '80%',
  justifyContent: 'center',
  alignItems: 'center'
},

fullscreenImage: {
  width: '100%',
  height: '100%'
},

fullscreenVideo: {
  width: '100%',
  height: '100%'
},

modalCloseButton: {
  position: 'absolute',
  bottom: 40,
  alignSelf: 'center',
  backgroundColor: '#ffffff22',
  paddingHorizontal: 20,
  paddingVertical: 10,
  borderRadius: 8
},

modalCloseText: {
  color: 'white',
  fontSize: 16
},

modalCloseArea: {
  ...StyleSheet.absoluteFillObject,
  zIndex: -1
}


});

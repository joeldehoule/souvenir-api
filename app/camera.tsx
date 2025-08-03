import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { updateEvent, getEventById } from '@/lib/storage';
import {
  ArrowLeft,
  RotateCw,
  Camera,
  Video,
  Image as ImageIcon
} from 'lucide-react-native';

export default function CameraScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // pour récupérer l'id de l'event
  const [facing, setFacing] = useState<CameraType>('back');
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>L'accès à votre caméra est requis</Text>
        <Text style={styles.permissionText}>
          Nous avons besoin de votre permission pour utiliser votre caméra
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Accorder la permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const handleCapture = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes:
          mode === 'photo' ? ImagePicker.MediaType.IMAGE : ImagePicker.MediaType.VIDEO,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const uri = asset.uri;

        const event = await getEventById(id!);
        if (!event) {
          Alert.alert("Erreur", "Impossible de trouver l'événement.");
          router.back();
          return;
        }

        if (mode === 'photo') {
          const updatedPhotos = [...(event.photos || []), uri];
          await updateEvent(id!, { ...event, photos: updatedPhotos });
        } else {
          const updatedVideos = [
            ...(event.videos || []),
            { uri, thumbnail: uri }, // tu pourras améliorer pour avoir un vrai thumbnail
          ];
          await updateEvent(id!, { ...event, videos: updatedVideos });
        }

        // Retour à la page event
        router.back();
      }
    } catch (error) {
      console.error("Erreur lors de la capture :", error);
      Alert.alert("Erreur", "Impossible de capturer.");
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Capturer un souvenir</Text>
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
            <RotateCw color="white" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'photo' && styles.activeModeButton]}
            onPress={() => setMode('photo')}
          >
            <ImageIcon color={mode === 'photo' ? '#2E447A' : 'white'} size={20} />
            <Text style={[styles.modeText, mode === 'photo' && styles.activeModeText]}>
              Photo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'video' && styles.activeModeButton]}
            onPress={() => setMode('video')}
          >
            <Video color={mode === 'video' ? '#2E447A' : 'white'} size={20} />
            <Text style={[styles.modeText, mode === 'video' && styles.activeModeText]}>
              Vidéo
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.controls}>
          <View style={styles.controlsInner}>
            <View style={styles.placeholder} />
            <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
              <View style={styles.captureButtonInner}>
                {mode === 'photo' ? (
                  <Camera color="#2E447A" size={32} />
                ) : (
                  <Video color="#2E447A" size={32} />
                )}
              </View>
            </TouchableOpacity>
            <View style={styles.placeholder} />
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  camera: { flex: 1 },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 24,
  },
  permissionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#2E447A',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  flipButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  activeModeButton: { backgroundColor: 'white' },
  modeText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  activeModeText: { color: '#2E447A' },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingTop: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  controlsInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 48,
  },
  placeholder: { width: 60 },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

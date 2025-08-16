import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { ArrowLeft, Play, Download, Share, Heart } from 'lucide-react-native';
import VideoPlayerModal from '@/components/video-player';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOUVENIR_STYLES = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Timeless style with gentle pacing',
    thumbnail: 'https://images.pexels.com/photos/1729931/pexels-photo-1729931.jpeg?auto=compress&cs=tinysrgb&w=300',
    color: '#2E447A',
  },
  {
    id: 'fun',
    name: 'Fun',
    description: 'Upbeat tempo with playful effects',
    thumbnail: 'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=300',
    color: '#0EA5E9',
  },
  {
    id: 'romantic',
    name: 'Romantic',
    description: 'Soft transitions with elegant music',
    thumbnail: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=300',
    color: '#EA1467',
  },
];

export default function SouvenirScreen() {
  const { eventId, mediaType } = useLocalSearchParams<{ eventId: string; mediaType: 'photos' | 'videos' | 'guestbook' }>();
  const [selectedMedia, setSelectedMedia] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [generatedVideo, setGeneratedVideo] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [showPlayer, setShowPlayer] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchEventMedia = async () => {
      try {
        if (!eventId) return;

        const tempKey = `souvenir_${eventId}`;
        const storedMedia = await AsyncStorage.getItem(tempKey);
        if (storedMedia) {
          setSelectedMedia(JSON.parse(storedMedia));
        } else {
          Alert.alert('Aucun média', 'Aucun média disponible pour cet événement.');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des médias :', error);
      }
    };
    fetchEventMedia();
  }, [eventId]);


  const handleGenerateVideo = async () => {
    if (!selectedStyle) {
      Alert.alert('Style non sélectionné', 'Veuillez choisir un style avant de générer la vidéo.');
      return;
    }
    if (selectedMedia.length === 0) {
      Alert.alert('Aucun média', 'Aucun média disponible pour générer la vidéo.');
      return;
    }

    setIsGenerating(true);
    setProgress(10);

    try {
      const allMedia = selectedMedia.map((m: any) => ({ url: m.uri }));
      setProgress(30);

      const response = await fetch('https://souvenir-api-iota.vercel.app/api/generate-souvenir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media: allMedia, style: selectedStyle }),
      });

      // Log la réponse brute
      const text = await response.text();
      console.log('Réponse brute de l’API :', text);

      // Ensuite seulement essaie de parser en JSON si c’est bien du JSON

      setProgress(60);
      const { videoUrl } = await response.json();

      if (!videoUrl) throw new Error('Erreur : pas de videoUrl retournée par l’API');
      setGeneratedVideo(videoUrl);
      setProgress(100);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Erreur', error?.message || 'Impossible de générer la vidéo.');
      setGeneratedVideo('');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedVideo) return;
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Impossible d’accéder à la galerie.');
        return;
      }

      setIsDownloading(true);
      const fileUri = FileSystem.documentDirectory + 'souvenir.mp4';
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        const download = FileSystem.createDownloadResumable(generatedVideo, fileUri);
        await download.downloadAsync();
      }

      Alert.alert('Succès', 'La vidéo a été téléchargée localement avec succès.');
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Le téléchargement a échoué.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!generatedVideo) return;
    try {
      setIsSharing(true);
      const fileUri = FileSystem.documentDirectory + 'souvenir.mp4';
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        const download = FileSystem.createDownloadResumable(generatedVideo, fileUri);
        await download.downloadAsync();
      }

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Non supporté', 'Le partage n’est pas disponible sur cet appareil.');
        return;
      }

      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Le partage a échoué.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      {generatedVideo ? (
        <LinearGradient colors={['#F8FAFC', '#FFFFFF']} style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft color="#6B7280" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Créer votre souvenir</Text>
          </View>

          <View style={styles.videoContainer}>
            <View style={styles.videoPlayer}>
              <Image
                source={{ uri: SOUVENIR_STYLES.find(s => s.id === selectedStyle)?.thumbnail }}
                style={styles.videoThumbnail}
              />
              <TouchableOpacity style={styles.playButton} onPress={() => setShowPlayer(true)}>
                <Play color="white" size={32} fill="white" />
              </TouchableOpacity>
            </View>

            <Text style={styles.videoTitle}>
              {SOUVENIR_STYLES.find(s => s.id === selectedStyle)?.name} Style
            </Text>
            <Text style={styles.videoDescription}>
              La vidéo de vos formidables souvenirs a été générée
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleDownload} disabled={isDownloading}>
              {isDownloading ? <ActivityIndicator size="small" color="#2E447A" /> :
                <>
                  <Download color="#2E447A" size={20} />
                  <Text style={styles.actionButtonText}>Télécharger</Text>
                </>
              }
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleShare} disabled={isSharing}>
              {isSharing ? <ActivityIndicator size="small" color="#2E447A" /> :
                <>
                  <Share color="#2E447A" size={20} />
                  <Text style={styles.actionButtonText}>Partager</Text>
                </>
              }
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.createAnotherButton}
            onPress={() => {
              setGeneratedVideo('');
              setSelectedStyle('');
              setProgress(0);
            }}
          >
            <Heart color="white" size={20} />
            <Text style={styles.createAnotherText}>Créer un autre souvenir</Text>
          </TouchableOpacity>

          <VideoPlayerModal visible={showPlayer} onClose={() => setShowPlayer(false)} videoUri={generatedVideo} />
        </LinearGradient>
      ) : (
        <LinearGradient colors={['#F8FAFC', '#FFFFFF']} style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft color="#6B7280" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Générer votre souvenir</Text>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.intro}>
              <Text style={styles.introTitle}>Créer une vidéo de vos souvenirs</Text>
              <Text style={styles.introSubtitle}>
                Choisissez le style de montage vidéo que vous souhaitez créer
              </Text>
            </View>

            {isGenerating ? (
              <View style={styles.generatingContainer}>
                <Text style={styles.progressTitle}>Création de votre souvenir...</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{progress}% Terminé</Text>
              </View>
            ) : (
              <View style={styles.stylesContainer}>
                <Text style={styles.stylesTitle}>Choisissez un style</Text>
                {SOUVENIR_STYLES.map((style) => (
                  <TouchableOpacity
                    key={style.id}
                    style={[styles.styleCard, selectedStyle === style.id && styles.selectedStyleCard]}
                    onPress={() => setSelectedStyle(style.id)}
                  >
                    <Image source={{ uri: style.thumbnail }} style={styles.styleThumbnail} />
                    <View style={styles.styleInfo}>
                      <Text style={styles.styleName}>{style.name}</Text>
                      <Text style={styles.styleDescription}>{style.description}</Text>
                    </View>
                    <View style={styles.styleActions}>
                      <TouchableOpacity style={styles.previewButton}>
                        <Play color={style.color} size={16} />
                      </TouchableOpacity>
                      {selectedStyle === style.id && (
                        <View style={[styles.selectedIndicator, { backgroundColor: style.color }]} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>

          {!isGenerating && selectedStyle && (
            <View style={styles.bottomAction}>
              <TouchableOpacity style={styles.generateButton} onPress={handleGenerateVideo}>
                <Heart color="white" size={20} />
                <Text style={styles.generateButtonText}>Générer mon souvenir</Text>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      )}
    </>
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
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  intro: {
    marginBottom: 32,
  },
  introTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  introSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 24,
  },
  generatingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  progressContainer: {
    alignItems: 'center',
    width: '100%',
  },
  progressTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 24,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E447A',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  stylesContainer: {
    paddingBottom: 120,
  },
  stylesTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  styleCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedStyleCard: {
    borderColor: '#2E447A',
  },
  styleThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  styleInfo: {
    flex: 1,
  },
  styleName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  styleDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  styleActions: {
    alignItems: 'center',
    gap: 8,
  },
  previewButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  bottomAction: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  generateButton: {
    backgroundColor: '#EA1467',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#2E447A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  generateButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  videoContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  videoPlayer: {
    width: 300,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 24,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  videoDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2E447A',
  },
  createAnotherButton: {
    backgroundColor: '#2E447A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 32,
  },
  createAnotherText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});
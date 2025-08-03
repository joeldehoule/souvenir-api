import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react-native';

const EVENT_TYPES = [
  { id: 'Mariage', label: 'Mariage', color: '#2E447A' },
  { id: 'Anniversaire', label: 'Anniversaire', color: '#EA1467' },
  { id: 'Gala', label: 'Gala', color: '#0EA5E9' },
  { id: 'Concert', label: 'Concert', color: '#EF4444' },
  { id: 'Graduation', label: 'Graduation', color: '#10B981' },
  { id: 'Autres', label: 'Autres', color: '#8B5CF6' },
];

export default function EditEventScreen() {
  const { id } = useLocalSearchParams();
  const [eventName, setEventName] = useState('');
  const [eventDateObj, setEventDateObj] = useState<Date | null>(null);
  const [selectedType, setSelectedType] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const data = await AsyncStorage.getItem('memento_events');
        const events = data ? JSON.parse(data) : [];
        const event = events.find((e: any) => e.id === id);
        if (event) {
          setEventName(event.name);
          setEventDateObj(new Date(event.date));
          setSelectedType(event.type);
        }
      } catch (err) {
        console.error('Erreur chargement:', err);
      }
    };
    loadEvent();
  }, [id]);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) setEventDateObj(selectedDate);
  };

  const selectedTypeObj = EVENT_TYPES.find(type => type.id === selectedType);

  const handleSaveEdit = async () => {
    if (!eventName || !eventDateObj || !selectedType) {
      return Alert.alert('Erreur', 'Tous les champs sont obligatoires.');
    }

    try {
      const data = await AsyncStorage.getItem('memento_events');
      const events = data ? JSON.parse(data) : [];

      const updatedEvents = events.map((e: any) =>
        e.id === id
          ? {
              ...e,
              name: eventName,
              date: eventDateObj.toISOString(),
              type: selectedType,
            }
          : e
      );

      await AsyncStorage.setItem('memento_events', JSON.stringify(updatedEvents));
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
    }
  };

  return (
    <LinearGradient colors={['#F8FAFC', '#FFFFFF']} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color="#6B7280" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Modifier l'événement</Text>
          <Text style={styles.subtitle}>Mettre à jour les infos de l’événement</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nom de l'événement</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Mariage de Joël & Désirée"
              value={eventName}
              onChangeText={setEventName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Date de l'événement</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
              <Calendar color="#9CA3AF" size={20} />
              <Text style={styles.dateInput}>
                {eventDateObj ? eventDateObj.toDateString() : 'Sélectionner la date'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={eventDateObj || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onChangeDate}
              />
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Type d'événement</Text>
            <TouchableOpacity
              style={[styles.input, styles.typeSelector]}
              onPress={() => setShowTypeModal(true)}
            >
              {selectedTypeObj && (
                <View style={[styles.typeIndicator, { backgroundColor: selectedTypeObj.color }]} />
              )}
              <Text style={[styles.typeSelectorText, !selectedTypeObj && styles.placeholder]}>
                {selectedTypeObj ? selectedTypeObj.label : 'Sélectionnez un type'}
              </Text>
              <ChevronDown color="#9CA3AF" size={20} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.createButton]}
            onPress={handleSaveEdit}
          >
            <Text style={styles.createButtonText}>Enregistrer les modifications</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de sélection du type */}
      <Modal visible={showTypeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélectionnez le type</Text>
            <ScrollView>
              {EVENT_TYPES.map(type => (
                <TouchableOpacity
                  key={type.id}
                  style={styles.typeOption}
                  onPress={() => {
                    setSelectedType(type.id);
                    setShowTypeModal(false);
                  }}
                >
                  <View style={[styles.typeIndicator, { backgroundColor: type.color }]} />
                  <Text style={styles.typeOptionText}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTypeModal(false)}
            >
              <Text style={styles.modalCloseText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de succès */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <CheckCircle2 size={64} color="#10B981" style={{ alignSelf: 'center', marginBottom: 10 }} />
            <Text style={styles.successTitle}>Modifications enregistrées !</Text>
            <TouchableOpacity
              style={[styles.createButtonNew, { marginTop: 20 }]}
              onPress={() => {
                setShowSuccessModal(false);
                router.push(`/event/${id}`);
              }}
            >
              <Text style={styles.createButtonText}>Voir l’événement</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  form: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  typeSelector: {
    justifyContent: 'space-between',
  },
  typeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  typeSelectorText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  placeholder: {
    color: '#9CA3AF',
  },
  createButton: {
    backgroundColor: '#EA1467',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#2E447A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonNew: {
    backgroundColor: '#EA1467',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    width: '100%',
    marginVertical: 8,
  },
  createButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  createButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 34,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  typeList: {
    maxHeight: 300,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 16,
  },
  typeOptionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2E447A',
  },
  successModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 34,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  eventCodeContainer: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  eventCode: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#2E447A',
    letterSpacing: 4,
    textAlign: 'center',
  },
  shareActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  shareButton: {
    backgroundColor: '#075e54',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  shareButton2: {
    backgroundColor: '#2E447A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  continueButton: {
    backgroundColor: '#EA1467',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 16,
  },
  eventCodeContainer: {
    backgroundColor: '#f2f2f2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  eventCode: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  fullWidthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#314877',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    width: '100%',
    marginVertical: 8,
  },
  fullWidthButton2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#075e54',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    width: '100%',
    marginVertical: 8,
  },
  fullWidthButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonIcon: {
    marginRight: 10,
  },
  continueButton: {
    backgroundColor: '#EA1467', // vert Apple
  },

});

import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { ArrowLeft, Calendar, ChevronDown, Copy, Share, MessageCircle } from 'lucide-react-native';

const EVENT_TYPES = [
  { id: 'wedding', label: 'Wedding', color: '#2E447A' },
  { id: 'birthday', label: 'Birthday', color: '#EA1467' },
  { id: 'concert', label: 'Concert', color: '#EF4444' },
  { id: 'gala', label: 'Gala', color: '#0EA5E9' },
  { id: 'graduation', label: 'Graduation', color: '#10B981' },
  { id: 'other', label: 'Other', color: '#8B5CF6' },
];

export default function CreateEventScreen() {
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [eventCode, setEventCode] = useState('');

  const handleCreateEvent = () => {
    if (eventName && eventDate && selectedType) {
      // Generate a random event code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setEventCode(code);
      setShowSuccessModal(true);
    }
  };

  const handleCopyCode = () => {
    // In a real app, this would copy to clipboard
    console.log('Copied code:', eventCode);
  };

  const handleShareWhatsApp = () => {
    // In a real app, this would open WhatsApp with the event code
    console.log('Share via WhatsApp:', eventCode);
  };

  const selectedTypeObj = EVENT_TYPES.find(type => type.id === selectedType);

  return (
    <LinearGradient
      colors={['#F8FAFC', '#FFFFFF']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft color="#6B7280" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Create Event</Text>
          <Text style={styles.subtitle}>Set up your private event space</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Event Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Sarah & John's Wedding"
              value={eventName}
              onChangeText={setEventName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Event Date</Text>
            <TouchableOpacity style={styles.input}>
              <Calendar color="#9CA3AF" size={20} />
              <TextInput
                style={styles.dateInput}
                placeholder="Select date"
                value={eventDate}
                onChangeText={setEventDate}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Event Type</Text>
            <TouchableOpacity
              style={[styles.input, styles.typeSelector]}
              onPress={() => setShowTypeModal(true)}
            >
              {selectedTypeObj && (
                <View style={[styles.typeIndicator, { backgroundColor: selectedTypeObj.color }]} />
              )}
              <Text style={[styles.typeSelectorText, !selectedTypeObj && styles.placeholder]}>
                {selectedTypeObj ? selectedTypeObj.label : 'Select event type'}
              </Text>
              <ChevronDown color="#9CA3AF" size={20} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.createButton, (!eventName || !eventDate || !selectedType) && styles.createButtonDisabled]}
            onPress={handleCreateEvent}
            disabled={!eventName || !eventDate || !selectedType}
          >
            <Text style={styles.createButtonText}>Create Event</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Event Type Modal */}
      <Modal
        visible={showTypeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Event Type</Text>
            <ScrollView style={styles.typeList}>
              {EVENT_TYPES.map((type) => (
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
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <Text style={styles.successTitle}>Event Created!</Text>
            <Text style={styles.successSubtitle}>Share this code with your guests</Text>
            
            <View style={styles.eventCodeContainer}>
              <Text style={styles.eventCode}>{eventCode}</Text>
            </View>

            <View style={styles.shareActions}>
              <TouchableOpacity style={styles.shareButton} onPress={handleCopyCode}>
                <Copy color="white" size={20} />
                <Text style={styles.shareButtonText}>Copy Code</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.shareButton} onPress={handleShareWhatsApp}>
                <MessageCircle color="white" size={20} />
                <Text style={styles.shareButtonText}>WhatsApp</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.shareButton}>
                <Share color="white" size={20} />
                <Text style={styles.shareButtonText}>More</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => {
                setShowSuccessModal(false);
                router.push(`/event/${eventCode}`);
              }}
            >
              <Text style={styles.continueButtonText}>Go to Event</Text>
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
    backgroundColor: '#2E447A',
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
    backgroundColor: '#1F2937',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});
import React from 'react';
import { View, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Video } from 'expo-av';
import { X } from 'lucide-react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  videoUri: string;
};

export default function VideoPlayerModal({ visible, onClose, videoUri }: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X color="white" size={28} />
        </TouchableOpacity>

        <Video
          source={{ uri: videoUri }}
          style={styles.video}
          resizeMode="contain"
          useNativeControls
          shouldPlay
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },
  video: {
    width: '100%',
    height: '100%',
  },
});

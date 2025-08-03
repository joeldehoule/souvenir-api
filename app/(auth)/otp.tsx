// app/(auth)/otp.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { CheckCircle, XCircle } from 'lucide-react-native';

const OTPPage = () => {
  const router = useRouter();
  const { phoneNumber, sessionInfo } = useLocalSearchParams();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Le code doit contenir 6 chiffres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiKey = 'AIzaSyCFFxaHoK4kePQdE9SigKN0N7zQ6ZKUUXQ';

      const res = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=${apiKey}`,
        {
          sessionInfo: sessionInfo,
          code: otp,
        }
      );

      console.log('User connected:', res.data);

      // Affiche le modal de succès
      setSuccessModalVisible(true);

      // Redirige vers index.tsx après 1.5s
      setTimeout(() => {
        setSuccessModalVisible(false);
        router.replace('/'); // ou '/home' si ta page index est /home
      }, 1500);

    } catch (err: any) {
      console.error(err.response?.data || err.message);
      setError('Le code est incorrect ou expiré');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vérification du numéro</Text>
      <Text style={styles.subtitle}>Code envoyé à : {phoneNumber}</Text>

      <TextInput
        style={styles.input}
        placeholder='Entrez le code OTP'
        keyboardType='numeric'
        value={otp}
        onChangeText={setOtp}
        maxLength={6}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={verifyOTP} disabled={loading}>
        {loading ? (
          <ActivityIndicator color='white' />
        ) : (
          <Text style={styles.buttonText}>Vérifier</Text>
        )}
      </TouchableOpacity>

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
            <Text style={styles.modalText}>Code validé !</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default OTPPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    padding: 16,
    fontSize: 18,
    marginBottom: 16,
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#E91E63', // rose
    paddingVertical: 16,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
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
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
});

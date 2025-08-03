// app/(auth)/signup.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';

const SignupPage = () => {
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState('+225');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendVerificationCode = async () => {
    if (phoneNumber.length < 8) {
      setError('Numéro de téléphone invalide');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiKey = 'AIzaSyCFFxaHoK4kePQdE9SigKN0N7zQ6ZKUUXQ';

      const res = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=${apiKey}`,
        {
          phoneNumber: phoneNumber,
          recaptchaToken: 'test', // En mode test, la valeur "test" fonctionne
        }
      );

      const sessionInfo = res.data.sessionInfo;
      console.log('Session Info:', sessionInfo);

      // Rediriger vers OTP en passant sessionInfo + phoneNumber
      router.push({
        pathname: '/otp',
        params: { phoneNumber, sessionInfo },
      });

    } catch (err: any) {
      console.error(err.response?.data || err.message);
      setError('Erreur lors de l\'envoi du code. Vérifiez le numéro ou réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inscription</Text>

      <TextInput
        style={styles.input}
        placeholder='Numéro de téléphone (+225XXXXXXXXXX)'
        keyboardType='phone-pad'
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={sendVerificationCode} disabled={loading}>
        {loading ? (
          <ActivityIndicator color='white' />
        ) : (
          <Text style={styles.buttonText}>Envoyer le code</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default SignupPage;

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
    marginBottom: 24,
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
});

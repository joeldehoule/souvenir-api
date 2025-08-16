// debugAsyncStorage.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DebugAsyncStorage() {
  const [data, setData] = useState<any>(null);

  const loadData = async () => {
    try {
      const eventsData = await AsyncStorage.getItem('memento_events');
      const parsed = eventsData ? JSON.parse(eventsData) : [];
      setData(parsed);
      console.log("Contenu de memento_events :", parsed);
    } catch (err) {
      console.error("Erreur de lecture AsyncStorage :", err);
    }
  };

  const clearData = async () => {
    try {
      await AsyncStorage.removeItem('memento_events');
      setData(null);
      console.log("memento_events supprimé !");
    } catch (err) {
      console.error("Erreur suppression :", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>
        Debug AsyncStorage (memento_events)
      </Text>
      <Button title="Recharger les données" onPress={loadData} />
      <Button title="Supprimer memento_events" color="red" onPress={clearData} />

      <Text style={{ marginTop: 20, fontSize: 16 }}>
        {data ? JSON.stringify(data, null, 2) : "Aucune donnée trouvée."}
      </Text>
    </ScrollView>
  );
}

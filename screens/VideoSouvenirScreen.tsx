import React, { useState } from "react";
import { View, Text, Button, ActivityIndicator, Linking } from "react-native";

// Remplace par l'URL de ton API Vercel
const API_BASE = "https://souvenir-api-iota.vercel.app/api/generate-souvenir";

export default function VideoSouvenirScreen() {
  const [status, setStatus] = useState(""); // queued, rendering, done
  const [renderId, setRenderId] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Exemple de médias (tu peux remplacer par les médias réels de ton événement)
  const media = [
    { url: "https://placehold.co/800x600/png" },
    { url: "https://placehold.co/600x800/png" },
  ];

  const generateVideo = async (style: string) => {
    setLoading(true);
    setStatus("queued");
    setVideoUrl("");
    setRenderId("");

    try {
      // POST pour générer le rendu
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ media, style }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setRenderId(data.renderId);
      setStatus("queued");

      // Suivi de progression
      const interval = setInterval(async () => {
        const check = await fetch(`${API_BASE}?id=${data.renderId}`);
        const checkData = await check.json();

        setStatus(checkData.response?.status || "");

        if (checkData.response?.status === "done") {
          clearInterval(interval);
          setVideoUrl(checkData.response?.url);
          setLoading(false);
        }
      }, 3000); // vérifie toutes les 3 secondes
    } catch (err: any) {
      console.error(err);
      alert("Erreur lors de la génération : " + err.message);
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Générer un souvenir vidéo</Text>

      <Button title="Romantic" onPress={() => generateVideo("romantic")} />
      <Button title="Fun" onPress={() => generateVideo("fun")} />
      <Button title="Classic" onPress={() => generateVideo("classic")} />

      {loading && (
        <View style={{ marginVertical: 20 }}>
          <ActivityIndicator size="large" />
          <Text>Status : {status}</Text>
        </View>
      )}

      {videoUrl ? (
        <View style={{ marginTop: 20 }}>
          <Text>Vidéo prête !</Text>
          <Button title="Ouvrir / Prévisualiser" onPress={() => Linking.openURL(videoUrl)} />
        </View>
      ) : null}
    </View>
  );
}

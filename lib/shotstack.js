// lib/shotstack.ts

const API_URL = 'https://souvenir-api-iota.vercel.app/api/generate-souvenir';

export async function generateSouvenirVideo(media: { uri: string }[], style: string) {
  try {
    // Transforme les objets media pour correspondre à ce que l'API attend
    const mediaPayload = media.map(m => ({ url: m.uri }));

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        media: mediaPayload,
        style,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Réponse brute API Shotstack :', text);
      throw new Error('Erreur lors de la génération de la vidéo');
    }

    const data = await response.json();
    return data; // Contient { renderId }
  } catch (error) {
    console.error('Erreur API Shotstack :', error);
    throw error;
  }
}

export async function getVideoStatus(renderId: string) {
  try {
    const response = await fetch(`https://api.shotstack.io/v1/render/${renderId}`, {
      method: 'GET',
      headers: {
        'x-api-key': process.env.SHOTSTACK_API_KEY, // Côté serveur uniquement
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Réponse brute status video :', text);
      throw new Error('Erreur lors de la vérification du statut');
    }

    const data = await response.json();
    return data; // Contient status, url, etc.
  } catch (error) {
    console.error('Erreur status video :', error);
    throw error;
  }
}

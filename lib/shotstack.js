// lib/shotstack.ts
export async function generateSouvenirVideo(mediaUris: string[], style: string) {
  try {
    const response = await fetch('https://souvenir-api-iota.vercel.app/api/generate-souvenir', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mediaUris,
        style,
      }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la génération');
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
        'x-api-key': 'ta-clé-shotstack-si-nécessaire-pour-le-status',
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la vérification du statut');
    }

    const data = await response.json();
    return data; // Contient status, url, etc.
  } catch (error) {
    console.error('Erreur status video :', error);
    throw error;
  }
}

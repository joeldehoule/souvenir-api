// api/generate-souvenir.js

const axios = require("axios");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { media, style } = req.body;

  if (!media || !Array.isArray(media) || media.length === 0) {
    return res.status(400).json({ error: "Liste de médias invalide ou vide." });
  }

  try {
    // Choisir musique et transitions selon le style
    const styleConfig = {
      romantic: {
        soundtrack: 'https://assets.shotstack.io/music/cinematic/piano-emotions.mp3',
        transition: 'fade',
      },
      fun: {
        soundtrack: 'https://assets.shotstack.io/music/upbeat/happy-times.mp3',
        transition: 'slideRight',
      },
      classic: {
        soundtrack: 'https://assets.shotstack.io/music/classical/spring-vivaldi.mp3',
        transition: 'revealUp',
      },
    };

    const selectedStyle = styleConfig[style] || styleConfig.classic;

    const clips = media.map((item, index) => ({
      asset: {
        type: item.url.endsWith(".mp4") ? "video" : "image",
        src: item.url,
      },
      start: index * 2,
      length: 2,
      transition: {
        in: selectedStyle.transition,
        out: selectedStyle.transition,
      },
    }));

    const response = await axios.post(
      "https://api.shotstack.io/v1/render",
      {
        timeline: {
          background: "#000000",
          soundtrack: {
            src: selectedStyle.soundtrack,
            effect: "fadeInFadeOut",
          },
          tracks: [
            {
              clips,
            },
          ],
        },
        output: {
          format: "mp4",
          resolution: "sd",
        },
      },
      {
        headers: {
          "x-api-key": process.env.SHOTSTACK_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json({
      renderId: response.data.response.id, // ID à utiliser pour getVideoStatus
    });
  } catch (error) {
    console.error("Erreur Shotstack:", error.response?.data || error.message);
    return res.status(500).json({ error: "Erreur lors de la génération" });
  }
};

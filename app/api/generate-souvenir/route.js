import axios from "axios";

/**
 * Configuration des styles disponibles
 */
const styleConfig = {
  romantic: {
    soundtrack: "https://assets.shotstack.io/music/cinematic/piano-emotions.mp3",
    transition: "fade",
  },
  fun: {
    soundtrack: "https://assets.shotstack.io/music/upbeat/happy-times.mp3",
    transition: "slideRight",
  },
  classic: {
    soundtrack: "https://assets.shotstack.io/music/classical/spring-vivaldi.mp3",
    transition: "revealUp",
  },
};

export async function POST(req) {
  try {
    const { media, style } = await req.json();

    if (!media || !Array.isArray(media) || media.length === 0) {
      return new Response(
        JSON.stringify({ error: "Liste de médias invalide ou vide." }),
        { status: 400 }
      );
    }

    const selectedStyle = styleConfig[style] || styleConfig.classic;

    // Création des clips
    const clips = media.map((item, index) => ({
      asset: {
        type: item.uri.endsWith(".mp4") ? "video" : "image",
        src: item.uri,
      },
      start: index * 2,
      length: 2,
      transition: {
        in: selectedStyle.transition,
        out: selectedStyle.transition,
      },
    }));

    // Appel à l'API Shotstack
    const response = await axios.post(
      "https://api.shotstack.io/v1/render",
      {
        timeline: {
          background: "#000000",
          soundtrack: {
            src: selectedStyle.soundtrack,
            effect: "fadeInFadeOut",
          },
          tracks: [{ clips }],
        },
        output: { format: "mp4", resolution: "sd" },
      },
      {
        headers: {
          "x-api-key": process.env.SHOTSTACK_API_KEY || "",
          "Content-Type": "application/json",
        },
      }
    );

    return new Response(
      JSON.stringify({ renderId: response.data.response.id }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur Shotstack POST:", error.response?.data || error.message);
    return new Response(JSON.stringify({ error: "Erreur lors de la génération" }), { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const renderId = searchParams.get("id");

    if (!renderId) {
      return new Response(JSON.stringify({ error: "ID de rendu manquant" }), { status: 400 });
    }

    const response = await axios.get(`https://api.shotstack.io/v1/render/${renderId}`, {
      headers: { "x-api-key": process.env.SHOTSTACK_API_KEY || "" },
    });

    return new Response(JSON.stringify(response.data), { status: 200 });
  } catch (error) {
    console.error("Erreur Shotstack GET:", error.response?.data || error.message);
    return new Response(JSON.stringify({ error: "Erreur lors du suivi du rendu" }), { status: 500 });
  }
}

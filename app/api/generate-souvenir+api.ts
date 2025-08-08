import axios from "axios";

// Configuration des styles
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { media, style } = body;

    if (!media || !Array.isArray(media) || media.length === 0) {
      return new Response(JSON.stringify({ error: "Liste de médias invalide ou vide." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const selectedStyle = styleConfig[style] || styleConfig.classic;

    const clips = media.map((item: any, index: number) => ({
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
          "x-api-key": process.env.SHOTSTACK_API_KEY || "",
          "Content-Type": "application/json",
        },
      }
    );

    return new Response(JSON.stringify({ renderId: response.data.response.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erreur Shotstack:", error.response?.data || error.message);
    return new Response(JSON.stringify({ error: "Erreur lors de la génération" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

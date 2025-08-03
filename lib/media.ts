import { getEventById } from './storage';

export async function getUserMedia(eventId: string) {
  const event = await getEventById(eventId);
  if (!event) throw new Error('Événement introuvable');

  return {
    photos: event.photos || [],
    videos: event.videos || [],
    guestbook: event.guestbookVideos || [],
  };
}

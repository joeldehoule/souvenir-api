import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'memento_events';

// Récupérer tous les événements
export const getAllEvents = async () => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Erreur lors du chargement des événements :', error);
    return [];
  }
};

// Récupérer un événement par son ID
export const getEventById = async (id: string) => {
  try {
    const events = await getAllEvents();
    return events.find((e: any) => e.id === id);
  } catch (error) {
    console.error('Erreur lors de la récupération de l’événement :', error);
    return null;
  }
};

// Enregistrer un nouvel événement
export const saveEvent = async (event: any) => {
  try {
    const events = await getAllEvents();

    // Initialiser les tableaux si pas définis
    const newEvent = {
      ...event,
      photos: event.photos || [],
      videos: event.videos || [],
      guestbookVideos: event.guestbookVideos || []
    };

    events.push(newEvent);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Erreur lors de l’enregistrement de l’événement :', error);
  }
};

// Supprimer un événement
export const deleteEvent = async (id: string) => {
  try {
    const events = await getAllEvents();
    const filtered = events.filter((e: any) => e.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Erreur lors de la suppression de l’événement :', error);
  }
};

// Mettre à jour un événement existant (fusionne avec l’existant)
export const updateEvent = async (updatedEvent: any) => {
  try {
    const events = await getAllEvents();

    const updatedList = events.map((e: any) => {
      if (e.id === updatedEvent.id) {
        return {
          ...e,                // état existant
          ...updatedEvent,     // nouvelles valeurs
          photos: updatedEvent.photos || e.photos || [],
          videos: updatedEvent.videos || e.videos || [],
          guestbookVideos: updatedEvent.guestbookVideos || e.guestbookVideos || []
        };
      } else {
        return e;
      }
    });

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l’événement :', error);
  }
};

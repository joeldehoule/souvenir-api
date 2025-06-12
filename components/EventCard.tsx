import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, Users, Camera } from 'lucide-react-native';

interface Event {
  id: string;
  name: string;
  date: string;
  type: string;
  memberCount: number;
  color: string;
}

interface EventCardProps {
  event: Event;
  onPress: () => void;
}

export function EventCard({ event, onPress }: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={[styles.typeIndicator, { backgroundColor: event.color }]} />
        <View style={styles.cardInfo}>
          <Text style={styles.eventName} numberOfLines={1}>
            {event.name}
          </Text>
          <Text style={styles.eventType}>{event.type}</Text>
        </View>
      </View>
      
      <View style={styles.cardDetails}>
        <View style={styles.detail}>
          <Calendar color="#6B7280" size={16} />
          <Text style={styles.detailText}>{formatDate(event.date)}</Text>
        </View>
        <View style={styles.detail}>
          <Users color="#6B7280" size={16} />
          <Text style={styles.detailText}>{event.memberCount} members</Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.cameraIcon}>
          <Camera color={event.color} size={16} />
        </View>
        <Text style={[styles.viewEvent, { color: event.color }]}>View Event</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeIndicator: {
    width: 4,
    height: 32,
    borderRadius: 2,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  eventType: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  cardDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cameraIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewEvent: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});
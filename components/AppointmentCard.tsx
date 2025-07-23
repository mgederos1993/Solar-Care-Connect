import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, Clock, MapPin, Phone } from 'lucide-react-native';

import Colors from '../constants/colors';
import { Appointment } from '../types';

type AppointmentCardProps = {
  appointment: Appointment;
  onPress: (appointment: Appointment) => void;
};

export default function AppointmentCard({ appointment, onPress }: AppointmentCardProps) {
  const getStatusColor = () => {
    switch (appointment.status) {
      case 'confirmed':
        return Colors.light.success;
      case 'pending':
        return Colors.light.warning;
      case 'cancelled':
        return Colors.light.error;
      default:
        return Colors.light.subtext;
    }
  };

  const getTypeColor = () => {
    switch (appointment.type) {
      case 'solar':
        return Colors.light.primary;
      case 'roofing':
        return Colors.light.secondary;
      case 'both':
        return '#9333EA'; // Purple
      default:
        return Colors.light.subtext;
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(appointment)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{appointment.customerName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </Text>
        </View>
      </View>
      
      <View style={styles.typeBadge}>
        <Text style={[styles.typeText, { color: getTypeColor() }]}>
          {appointment.type === 'both' 
            ? 'Solar + Roofing' 
            : appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}
        </Text>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Calendar size={16} color={Colors.light.subtext} />
          <Text style={styles.detailText}>
            {new Date(appointment.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Clock size={16} color={Colors.light.subtext} />
          <Text style={styles.detailText}>{appointment.time}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <MapPin size={16} color={Colors.light.subtext} />
          <Text style={styles.detailText} numberOfLines={1}>{appointment.address}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Phone size={16} color={Colors.light.subtext} />
          <Text style={styles.detailText}>{appointment.phone}</Text>
        </View>
      </View>
      
      {appointment.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText} numberOfLines={2}>{appointment.notes}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  typeBadge: {
    marginBottom: 12,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailsContainer: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  notesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: Colors.light.subtext,
  },
});
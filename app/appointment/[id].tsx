import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, Clock, MapPin, Phone, User, FileText, CheckCircle, XCircle } from 'lucide-react-native';

import Colors from '../../constants/colors';
import { mockAppointments } from '../../constants/mockAppointments';
import { Appointment } from '../../types';

export default function AppointmentDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (id) {
      const found = mockAppointments.find(a => a.id === id);
      if (found) {
        setAppointment(found);
      }
    }
  }, [id]);

  if (!appointment) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFoundText}>Appointment not found</Text>
      </View>
    );
  }

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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{appointment.customerName}</Text>
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
        
        <View style={styles.divider} />
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Calendar size={20} color={Colors.light.primary} />
            </View>
            <View>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailText}>
                {new Date(appointment.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Clock size={20} color={Colors.light.primary} />
            </View>
            <View>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailText}>{appointment.time}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <User size={20} color={Colors.light.primary} />
            </View>
            <View>
              <Text style={styles.detailLabel}>Customer</Text>
              <Text style={styles.detailText}>{appointment.customerName}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Phone size={20} color={Colors.light.primary} />
            </View>
            <View>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailText}>{appointment.phone}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <MapPin size={20} color={Colors.light.primary} />
            </View>
            <View>
              <Text style={styles.detailLabel}>Address</Text>
              <Text style={styles.detailText}>{appointment.address}</Text>
            </View>
          </View>
          
          {appointment.notes && (
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <FileText size={20} color={Colors.light.primary} />
              </View>
              <View>
                <Text style={styles.detailLabel}>Notes</Text>
                <Text style={styles.detailText}>{appointment.notes}</Text>
              </View>
            </View>
          )}
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.confirmButton]}>
            <CheckCircle size={20} color="white" />
            <Text style={styles.actionButtonText}>Confirm</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
            <XCircle size={20} color="white" />
            <Text style={styles.actionButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.aiInfoCard}>
        <Text style={styles.aiInfoTitle}>AI Generated Appointment</Text>
        <Text style={styles.aiInfoText}>
          This appointment was automatically generated by our AI system based on a phone conversation with the customer.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
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
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  typeBadge: {
    marginBottom: 16,
  },
  typeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 16,
  },
  detailsContainer: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  confirmButton: {
    backgroundColor: Colors.light.success,
  },
  cancelButton: {
    backgroundColor: Colors.light.error,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  aiInfoCard: {
    backgroundColor: '#EBF5FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    marginBottom: 20,
  },
  aiInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
    marginBottom: 8,
  },
  aiInfoText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  notFoundText: {
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
    marginTop: 40,
  },
});
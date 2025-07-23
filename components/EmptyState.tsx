import { StyleSheet, Text, View } from 'react-native';
import { Calendar, Info } from 'lucide-react-native';

import Colors from '../constants/colors';

type EmptyStateProps = {
  type: 'appointments' | 'demos' | 'generic';
  message?: string;
};

export default function EmptyState({ type, message }: EmptyStateProps) {
  const getIcon = () => {
    switch (type) {
      case 'appointments':
        return <Calendar size={48} color={Colors.light.primary} />;
      case 'demos':
        return <Info size={48} color={Colors.light.primary} />;
      default:
        return <Info size={48} color={Colors.light.primary} />;
    }
  };

  const getMessage = () => {
    switch (type) {
      case 'appointments':
        return message || "No appointments yet. Subscribe to start receiving AI-generated appointments.";
      case 'demos':
        return message || "No demo examples available at the moment.";
      default:
        return message || "No data available.";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {getIcon()}
      </View>
      <Text style={styles.message}>{getMessage()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 16,
    opacity: 0.8,
  },
  message: {
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
    maxWidth: 280,
  },
});
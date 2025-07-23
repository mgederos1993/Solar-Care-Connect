import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Settings } from 'lucide-react-native';

import Colors from '../constants/colors';
import { UserProfile } from '../types';

type ProfileHeaderProps = {
  user: UserProfile;
  onSettingsPress: () => void;
};

export default function ProfileHeader({ user, onSettingsPress }: ProfileHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.company}>{user.company}</Text>
          <View style={styles.appointmentsContainer}>
            <Text style={styles.appointmentsLabel}>Appointments remaining:</Text>
            <Text style={styles.appointmentsCount}>{user.appointmentsRemaining}</Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity style={styles.settingsButton} onPress={onSettingsPress}>
        <Settings size={24} color={Colors.light.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  company: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: 6,
  },
  appointmentsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentsLabel: {
    fontSize: 14,
    color: Colors.light.text,
    marginRight: 4,
  },
  appointmentsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  settingsButton: {
    padding: 8,
  },
});
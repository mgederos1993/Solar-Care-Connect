import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight, CreditCard, Bell, HelpCircle, LogOut, User, MapPin, MessageSquare, Mail } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { useUserStore } from '@/store/userStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import LocationPreferencesModal from '@/components/LocationPreferencesModal';
import NotificationPreferencesModal from '@/components/NotificationPreferencesModal';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useUserStore();
  const { 
    isSubscribed, 
    locationPreferences,
    notificationPreferences,
    setLocationPreferences,
    setNotificationPreferences,
    cancelSubscription 
  } = useSubscriptionStore();
  
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  
  const handleLogout = () => {
    logout();
    router.replace('/onboarding');
  };
  
  const handleCancelSubscription = () => {
    cancelSubscription();
  };
  
  const handleEditProfile = () => {
    router.push('/profile');
  };

  const handleLocationSave = (preferences: any) => {
    setLocationPreferences(preferences);
    setShowLocationModal(false);
  };

  const handleNotificationSave = (preferences: any) => {
    setNotificationPreferences(preferences);
    setShowNotificationModal(false);
  };

  if (!user) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#EBF5FF' }]}>
              <User size={20} color={Colors.light.primary} />
            </View>
            <Text style={styles.menuItemText}>Edit Profile</Text>
          </View>
          <ChevronRight size={20} color={Colors.light.subtext} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#ECFDF5' }]}>
              <CreditCard size={20} color={Colors.light.secondary} />
            </View>
            <Text style={styles.menuItemText}>Billing & Payments</Text>
          </View>
          <ChevronRight size={20} color={Colors.light.subtext} />
        </TouchableOpacity>
      </View>
      
      {isSubscribed && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription Preferences</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => setShowLocationModal(true)}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
                <MapPin size={20} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.menuItemText}>Location Preferences</Text>
                <Text style={styles.menuItemSubtext}>
                  {locationPreferences ? 'Configured' : 'Not set'}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.light.subtext} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => setShowNotificationModal(true)}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#EEE6FF' }]}>
                <MessageSquare size={20} color="#6366F1" />
              </View>
              <View>
                <Text style={styles.menuItemText}>Notification Settings</Text>
                <Text style={styles.menuItemSubtext}>
                  Email: {notificationPreferences.email ? 'On' : 'Off'}, SMS: {notificationPreferences.sms ? 'On' : 'Off'}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.light.subtext} />
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
              <Bell size={20} color="#F59E0B" />
            </View>
            <Text style={styles.menuItemText}>Push Notifications</Text>
          </View>
          <Switch
            trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
            thumbColor="white"
            value={true}
          />
        </View>
        
        <View style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
              <Bell size={20} color="#F59E0B" />
            </View>
            <Text style={styles.menuItemText}>Email Notifications</Text>
          </View>
          <Switch
            trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
            thumbColor="white"
            value={notificationPreferences.email}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#EEE6FF' }]}>
              <HelpCircle size={20} color="#6366F1" />
            </View>
            <Text style={styles.menuItemText}>Help & Support</Text>
          </View>
          <ChevronRight size={20} color={Colors.light.subtext} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#ECFDF5' }]}>
              <Mail size={20} color={Colors.light.secondary} />
            </View>
            <View>
              <Text style={styles.menuItemText}>Contact Support</Text>
              <Text style={styles.menuItemSubtext}>solarcareconnect@gmail.com</Text>
            </View>
          </View>
          <ChevronRight size={20} color={Colors.light.subtext} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#EEE6FF' }]}>
              <HelpCircle size={20} color="#6366F1" />
            </View>
            <Text style={styles.menuItemText}>Privacy Policy</Text>
          </View>
          <ChevronRight size={20} color={Colors.light.subtext} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#EEE6FF' }]}>
              <HelpCircle size={20} color="#6366F1" />
            </View>
            <Text style={styles.menuItemText}>Terms of Service</Text>
          </View>
          <ChevronRight size={20} color={Colors.light.subtext} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.contractInfo}>
        <Text style={styles.contractTitle}>Subscription Terms</Text>
        <Text style={styles.contractText}>
          • Not a contract - Cancel anytime\n
          • Minimum 30 days notice required for cancellation\n
          • No-show appointments replaced for free\n
          • Pricing may vary depending on state\n
          • Invoice will be emailed to your registered email address
        </Text>
      </View>
      
      {isSubscribed && (
        <TouchableOpacity 
          style={styles.dangerButton}
          onPress={handleCancelSubscription}
        >
          <Text style={styles.dangerButtonText}>Cancel Subscription</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <LogOut size={20} color={Colors.light.error} />
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
      
      <Text style={styles.versionText}>Version 1.0.0</Text>
      
      <LocationPreferencesModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSave={handleLocationSave}
        initialPreferences={locationPreferences || undefined}
      />
      
      <NotificationPreferencesModal
        visible={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        onSave={handleNotificationSave}
        initialPreferences={notificationPreferences}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  menuItemSubtext: {
    fontSize: 12,
    color: Colors.light.subtext,
    marginTop: 2,
  },
  contractInfo: {
    backgroundColor: '#F0F9FF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  contractTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  contractText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  dangerButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.error,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 24,
    paddingVertical: 12,
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.error,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: 40,
  },
});
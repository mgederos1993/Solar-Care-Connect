import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { X, Mail, MessageSquare } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { NotificationPreferences } from '@/store/subscriptionStore';

type NotificationPreferencesModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (preferences: NotificationPreferences) => void;
  initialPreferences?: NotificationPreferences;
};

export default function NotificationPreferencesModal({ 
  visible, 
  onClose, 
  onSave, 
  initialPreferences 
}: NotificationPreferencesModalProps) {
  const [email, setEmail] = useState(initialPreferences?.email ?? true);
  const [sms, setSms] = useState(initialPreferences?.sms ?? true);
  const [emailAddress, setEmailAddress] = useState(initialPreferences?.emailAddress || '');
  const [phoneNumber, setPhoneNumber] = useState(initialPreferences?.phoneNumber || '');

  const handleSave = () => {
    const preferences: NotificationPreferences = {
      email,
      sms,
      emailAddress: email ? emailAddress : undefined,
      phoneNumber: sms ? phoneNumber : undefined,
    };
    onSave(preferences);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Notification Preferences</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <Text style={styles.description}>
            Choose how you would like to receive notifications about new appointments and subscription updates.
          </Text>
          
          <View style={styles.section}>
            <View style={styles.notificationOption}>
              <View style={styles.optionLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#EBF5FF' }]}>
                  <Mail size={20} color={Colors.light.primary} />
                </View>
                <View>
                  <Text style={styles.optionTitle}>Email Notifications</Text>
                  <Text style={styles.optionDescription}>
                    Receive appointment updates via email
                  </Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
                thumbColor="white"
                value={email}
                onValueChange={setEmail}
              />
            </View>
            
            {email && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={emailAddress}
                  onChangeText={setEmailAddress}
                  placeholder="Enter your email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            )}
          </View>
          
          <View style={styles.section}>
            <View style={styles.notificationOption}>
              <View style={styles.optionLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#ECFDF5' }]}>
                  <MessageSquare size={20} color={Colors.light.secondary} />
                </View>
                <View>
                  <Text style={styles.optionTitle}>SMS Notifications</Text>
                  <Text style={styles.optionDescription}>
                    Receive appointment updates via text message
                  </Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
                thumbColor="white"
                value={sms}
                onValueChange={setSms}
              />
            </View>
            
            {sms && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                />
              </View>
            )}
          </View>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              You will receive notifications when:
              {"\n"}• New appointments are scheduled
              {"\n"}• Appointments are confirmed or cancelled
              {"\n"}• Subscription status changes
              {"\n"}• Important account updates
            </Text>
          </View>
        </ScrollView>
        
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Preferences</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  description: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: 24,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  notificationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.light.subtext,
  },
  inputContainer: {
    marginTop: 12,
    marginLeft: 52,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  infoBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
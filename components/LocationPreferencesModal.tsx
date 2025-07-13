import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { X, Plus, Trash2 } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { LocationPreferences } from '@/store/subscriptionStore';

type LocationPreferencesModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (preferences: LocationPreferences) => void;
  initialPreferences?: LocationPreferences;
};

export default function LocationPreferencesModal({ 
  visible, 
  onClose, 
  onSave, 
  initialPreferences 
}: LocationPreferencesModalProps) {
  const [cities, setCities] = useState<string[]>(initialPreferences?.cities || ['']);
  const [states, setStates] = useState<string[]>(initialPreferences?.states || ['']);
  const [zipCodes, setZipCodes] = useState<string[]>(initialPreferences?.zipCodes || ['']);
  const [counties, setCounties] = useState<string[]>(initialPreferences?.counties || ['']);

  const addField = (type: 'cities' | 'states' | 'zipCodes' | 'counties') => {
    switch (type) {
      case 'cities':
        setCities([...cities, '']);
        break;
      case 'states':
        setStates([...states, '']);
        break;
      case 'zipCodes':
        setZipCodes([...zipCodes, '']);
        break;
      case 'counties':
        setCounties([...counties, '']);
        break;
    }
  };

  const removeField = (type: 'cities' | 'states' | 'zipCodes' | 'counties', index: number) => {
    switch (type) {
      case 'cities':
        setCities(cities.filter((_, i) => i !== index));
        break;
      case 'states':
        setStates(states.filter((_, i) => i !== index));
        break;
      case 'zipCodes':
        setZipCodes(zipCodes.filter((_, i) => i !== index));
        break;
      case 'counties':
        setCounties(counties.filter((_, i) => i !== index));
        break;
    }
  };

  const updateField = (type: 'cities' | 'states' | 'zipCodes' | 'counties', index: number, value: string) => {
    switch (type) {
      case 'cities':
        const newCities = [...cities];
        newCities[index] = value;
        setCities(newCities);
        break;
      case 'states':
        const newStates = [...states];
        newStates[index] = value;
        setStates(newStates);
        break;
      case 'zipCodes':
        const newZipCodes = [...zipCodes];
        newZipCodes[index] = value;
        setZipCodes(newZipCodes);
        break;
      case 'counties':
        const newCounties = [...counties];
        newCounties[index] = value;
        setCounties(newCounties);
        break;
    }
  };

  const handleSave = () => {
    const preferences: LocationPreferences = {
      cities: cities.filter(city => city.trim() !== ''),
      states: states.filter(state => state.trim() !== ''),
      zipCodes: zipCodes.filter(zip => zip.trim() !== ''),
      counties: counties.filter(county => county.trim() !== ''),
    };
    onSave(preferences);
  };

  const renderFieldSection = (
    title: string,
    placeholder: string,
    values: string[],
    type: 'cities' | 'states' | 'zipCodes' | 'counties'
  ) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => addField(type)}
        >
          <Plus size={16} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>
      
      {values.map((value, index) => (
        <View key={index} style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={(text) => updateField(type, index, text)}
            placeholder={placeholder}
          />
          {values.length > 1 && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeField(type, index)}
            >
              <Trash2 size={16} color={Colors.light.error} />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Location Preferences</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <Text style={styles.description}>
            Specify the areas where you would like to receive appointments. You can add multiple locations for each category.
          </Text>
          
          {renderFieldSection('Cities', 'Enter city name', cities, 'cities')}
          {renderFieldSection('States', 'Enter state name', states, 'states')}
          {renderFieldSection('ZIP Codes', 'Enter ZIP code', zipCodes, 'zipCodes')}
          {renderFieldSection('Counties', 'Enter county name', counties, 'counties')}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  addButton: {
    padding: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
  },
  removeButton: {
    padding: 8,
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
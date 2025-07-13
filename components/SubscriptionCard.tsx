import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Check, Infinity } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { SubscriptionPlan } from '@/types';

type SubscriptionCardProps = {
  plan: SubscriptionPlan;
  isSelected: boolean;
  onSelect: () => void;
};

export default function SubscriptionCard({ plan, isSelected, onSelect }: SubscriptionCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && { borderColor: plan.color, borderWidth: 2 },
        plan.popular && styles.popularPlan,
      ]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      {plan.popular && (
        <View style={[styles.popularBadge, { backgroundColor: plan.color }]}>
          <Text style={styles.popularText}>Most Popular</Text>
        </View>
      )}
      
      <View style={styles.header}>
        <Text style={styles.name}>{plan.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.currency}>$</Text>
          <Text style={styles.price}>{plan.price.toLocaleString()}</Text>
          <Text style={styles.interval}>/{plan.interval}</Text>
        </View>
        {plan.description && (
          <Text style={styles.description}>{plan.description}</Text>
        )}
      </View>
      
      <View style={styles.appointmentsContainer}>
        <View style={styles.appointmentsRow}>
          {plan.appointmentsPerMonth === 999 ? (
            <Infinity size={20} color={plan.color} />
          ) : (
            <Text style={[styles.appointmentsNumber, { color: plan.color }]}>
              {plan.appointmentsPerMonth}
            </Text>
          )}
          <Text style={styles.appointmentsText}>
            {plan.appointmentsPerMonth === 999 ? 'Unlimited appointments' : 'appointments per month'}
          </Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.featuresContainer}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Check size={16} color={plan.color} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
      
      <TouchableOpacity 
        style={[styles.selectButton, { backgroundColor: plan.color }]}
        onPress={onSelect}
      >
        <Text style={styles.selectButtonText}>
          Fill Out Application
        </Text>
      </TouchableOpacity>
      
      <View style={styles.contractInfo}>
        <Text style={styles.contractText}>
          ✓ Not a contract - Cancel anytime
        </Text>
        <Text style={styles.contractText}>
          ✓ Minimum 30 days notice required
        </Text>
      </View>
      
      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerText}>
          * Pricing may vary depending on state
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  popularPlan: {
    transform: [{ scale: 1.02 }],
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  popularText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  header: {
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  currency: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.light.text,
  },
  interval: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.subtext,
    marginBottom: 4,
    marginLeft: 2,
  },
  description: {
    fontSize: 14,
    color: Colors.light.subtext,
    fontStyle: 'italic',
  },
  appointmentsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  appointmentsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appointmentsNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  appointmentsText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 16,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingRight: 8,
  },
  featureText: {
    marginLeft: 10,
    fontSize: 14,
    color: Colors.light.text,
    flex: 1,
    lineHeight: 20,
  },
  selectButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  selectButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  contractInfo: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  contractText: {
    fontSize: 12,
    color: Colors.light.text,
    marginBottom: 4,
    fontWeight: '500',
  },
  disclaimerContainer: {
    alignItems: 'center',
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.light.subtext,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
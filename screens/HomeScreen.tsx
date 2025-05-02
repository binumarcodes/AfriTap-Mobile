import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Animated,
  Easing,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WalletBalanceCard from './components/WalletBalanceCard';
import ReceiversPopup from './ReceiversPopup';
import { PaystackProvider, usePaystack } from 'react-native-paystack-webview';

// Define available currencies
const CURRENCIES = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
];


const TopUpButton = () => {
  const { popup } = usePaystack();
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
 
  const handleTopUp = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // Convert to smallest currency unit if needed
    // Paystack expects amounts in kobo (NGN), cents (USD), etc.
    const amountInSmallestUnit = parseFloat(amount) * 100;

    popup.newTransaction({
      amount: amountInSmallestUnit,
      email: "test@example.com", // Replace with actual user email
      currency: selectedCurrency.code,
      reference: `TEST_${Date.now()}`,
      onSuccess: (response) => {
        console.log("Payment successful:", response);
        setShowTopUpModal(false);
        setAmount('');
        // this is where you would update the wallet balance in your state/database
        alert(`Top-up of ${selectedCurrency.symbol}${amount} successful!`);
      },
      onCancel: () => {
        console.log("Payment cancelled");
      },
      onError: (error) => {
        console.log("Payment error:", error);
        alert("Payment failed. Please try again.");
      },
      onLoad: () => console.log("Webview Loaded"),
    });
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={() => setShowTopUpModal(true)}
      >
        <Ionicons name="add-circle-outline" size={24} color="#007aff" />
        <Text style={styles.actionLabel}>Top-Up</Text>
      </TouchableOpacity>

      {/* Top Up Modal */}
      <Modal
        visible={showTopUpModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTopUpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.topUpModalContent}>
            <Text style={styles.modalTitle}>Top Up Your Wallet</Text>
            
            {/* Amount Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Amount</Text>
              <View style={styles.amountInputWrapper}>
                <Text style={styles.currencySymbol}>{selectedCurrency.symbol}</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  keyboardType="numeric"
                  placeholderTextColor="#888"
                />
              </View>
            </View>
            
            {/* Currency Selection */}
            <Text style={styles.inputLabel}>Select Currency</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.currencyList}
            >
              {CURRENCIES.map((currency) => (
                <TouchableOpacity
                  key={currency.code}
                  style={[
                    styles.currencyItem,
                    selectedCurrency.code === currency.code && styles.selectedCurrency
                  ]}
                  onPress={() => setSelectedCurrency(currency)}
                >
                  <Text style={[
                    styles.currencyText,
                    selectedCurrency.code === currency.code && styles.selectedCurrencyText
                  ]}>
                    {currency.symbol} {currency.code}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowTopUpModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.proceedButton}
                onPress={handleTopUp}
              >
                <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

// Main content component that includes the UI
const HomeContent = () => {
  const [showModal, setShowModal] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [showPopup, setShowPopup] = useState(false);
  const [selectedReceiver, setSelectedReceiver] = useState(null);

  const walletBalance = 15000;

  const transactions = [
    { id: '1', title: 'Received from Sarah', amount: 5000, currency: 'NGN' },
    { id: '2', title: 'Top-Up via Card', amount: 10000, currency: 'NGN' },
    { id: '3', title: 'Sent to John', amount: -2000, currency: 'NGN' },
    { id: '4', title: 'Top-Up via PayPal', amount: 50, currency: 'USD' },
  ];

  useEffect(() => {
    // Show the popup after 10 seconds
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 15000); // 10 seconds delay

    return () => clearTimeout(timer); // Clean up the timer if the component unmounts
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Function to get currency symbol
  const getCurrencySymbol = (currencyCode) => {
    const currency = CURRENCIES.find(c => c.code === currencyCode);
    return currency ? currency.symbol : '₦'; // Default to Naira if not found
  };

  return (
    <View style={styles.container}>
      {/* Wallet Balance */}
      <WalletBalanceCard balance={15000} />

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setShowModal(true)}>
          <Ionicons name="download-outline" size={24} color="#007aff" />
          <Text style={styles.actionLabel}>Receive</Text>
        </TouchableOpacity>

        <TopUpButton />
      </View>

      {/* Transactions */}
      <Text style={styles.historyTitle}>Transaction History</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.transactionItem}>
            <View style={styles.transactionLeft}>
              <Ionicons
                name={item.amount > 0 ? 'arrow-up-outline' : 'arrow-down-outline'}
                size={20}
                color={item.amount > 0 ? 'green' : 'red'}
                style={{ marginRight: 10 }}
              />
              <Text style={styles.transactionTitle}>{item.title}</Text>
            </View>
            <Text style={[styles.transactionAmount, { color: item.amount > 0 ? 'green' : 'red' }]}>
              {item.amount > 0 ? '+' : '-'}
              {getCurrencySymbol(item.currency)}
              {Math.abs(item.amount).toLocaleString()}
            </Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      {/* Receive Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
              <Ionicons name="wifi" size={48} color="#007aff" />
            </Animated.View>
            <Text style={styles.awaitingText}>Awaiting sender...</Text>
            <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeButton}>
              <Text style={{ color: '#007aff', fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Receivers Popup will show after 10 seconds */}
      <ReceiversPopup
        visible={showPopup}
        onClose={() => setShowPopup(false)}
        onSelectReceiver={(receiver, { amount, description, password }) => {
          console.log('Send to:', receiver.name, amount, description, password);
          // handle transfer logic here
        }}
      />
    </View>
  );
};

// Main component that provides the PaystackProvider
const HomeScreen = () => {
  return (
    <PaystackProvider
      publicKey='pk_test_d09656f4089f34964d47df80fd493cd9073264d4'
      debug
      // Note: Default currency is set here, but can be overridden per transaction
      currency='NGN'
      defaultChannels={["bank_transfer", "bank", "ussd", "card"]}
    >
      <HomeContent />
    </PaystackProvider>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  balanceCard: {
    backgroundColor: '#2E7D32',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#fff',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
    backgroundColor: "#14C11D",
    padding: 20,
    borderRadius: 30
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 32,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5f0ff',
    width: 90,
    height: 90,
    borderRadius: 45,
    elevation: 2,
  },
  actionLabel: {
    marginTop: 6,
    color: '#007aff',
    fontWeight: '500',
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1e1e2f',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionTitle: {
    fontSize: 16,
    color: '#333',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  pulseCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e5f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  awaitingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e1e2f',
    marginBottom: 20,
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
  },
  // Top Up Modal Styles
  topUpModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 14,
    width: '95%',
    margin: 10,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e1e2f',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
    fontWeight: '500',
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  currencySymbol: {
    fontSize: 18,
    color: '#333',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    color: '#333',
    height: '100%',
  },
  currencyList: {
    flexDirection: 'row',
    marginBottom: 24,
    paddingBottom: 8,
  },
  currencyItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  selectedCurrency: {
    backgroundColor: '#2E7D32',
  },
  currencyText: {
    fontSize: 16,
    color: '#333',
  },
  selectedCurrencyText: {
    color: '#fff',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '45%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#555',
    fontSize: 13,
    fontWeight: '500',
  },
  proceedButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#14C11D',
    width: '50%',
    alignItems: 'center',
  },
  proceedButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
});
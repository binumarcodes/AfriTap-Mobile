import { View, TouchableOpacity, StyleSheet, } from "react-native";
import { usePaystack } from 'react-native-paystack-webview';
import { Ionicons } from '@expo/vector-icons';

const Payment = () => {

      const { popup } = usePaystack();
    
      const payNow = () => {
        popup.newTransaction({
          amount: 3000,
          email: "test@gmail.com",
          reference: `TEST_${Date.now()}`,
          onSuccess: async (res) => {
            console.log("Success")
          },
          onCancel: () => console.log("User Cancelled"),
          onLoad: (res) => console.log("Webview Loaded"),
          onError: (res) => console.log("Webview Error:", err),
        })
      }
  
};

export default Payment



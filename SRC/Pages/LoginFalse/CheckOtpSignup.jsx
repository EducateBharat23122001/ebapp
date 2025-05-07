import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from "react-native";
import { useToast } from "react-native-toast-notifications";
import { BACKEND_URL } from "@env";
import { COLOR, windowHeight } from "../../Constants";
import logo from '../../Assets/logo.png';

const CheckOtpSignup = ({ navigation, route }) => {
  const toast = useToast();
  const { email, password, name, age, phone } = route.params;
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [correctOtp, setCorrectOtp] = useState(null);
  const [timer, setTimer] = useState(60); // seconds

  useEffect(() => {
    sendOtp();
    const interval = setInterval(() => {
      setTimer(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const sendOtp = () => {
    fetch(BACKEND_URL + '/sendotp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    .then(response => response.json())
    .then(json => {
      Alert.alert("OTP SENT");
      setCorrectOtp(json.otp);
      setTimer(60); // reset timer on OTP send
    })
    .catch(error => {
      toast.show("Failed to send OTP", { type: "danger" });
    });
  };

  const handleVerify = () => {
    if (!email || !password || !name || !age || !phone) {
      toast.show("Something went wrong", { type: "danger" });
      navigation.navigate('SignupScreen');
      return;
    }

    if (otp.length < 4) {
      toast.show("Please enter 4-digit OTP", { type: "warning" });
      return;
    }

    if (otp !== correctOtp) {
      toast.show("Incorrect OTP", { type: "danger" });
      return;
    }

    setLoading(true);
    fetch(BACKEND_URL + '/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, age, phone })
    })
    .then(response => response.json())
    .then(json => {
      setLoading(false);
      if (json.error) {
        toast.show(json.error, { type: "danger" });
      } else {
        toast.show("Account created successfully!", { type: "success" });
        navigation.navigate('LoginScreen');
      }
    })
    .catch(error => {
      setLoading(false);
      toast.show("Something went wrong", { type: "danger" });
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.flex}
    >
      <ScrollView 
        contentContainerStyle={[styles.scrollContainer, { minHeight: windowHeight }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Header Section */}
          <View style={styles.header}>
            <Image source={logo} style={styles.logo} />
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>
              We've sent a verification code to {email}
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Enter 4-digit OTP</Text>
              <TextInput
                placeholder="Enter OTP"
                value={otp}
                onChangeText={setOtp}
                style={styles.inputField}
                placeholderTextColor={COLOR.col4}
                keyboardType="number-pad"
                maxLength={4}
                autoFocus
              />
            </View>

            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>
                {timer > 0 ? `Resend OTP in ${timer}s` : "Didn't receive code?"}
              </Text>
              {timer === 0 && (
                <TouchableOpacity onPress={sendOtp}>
                  <Text style={styles.resendLink}>Resend</Text>
                </TouchableOpacity>
              )}
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={COLOR.col2} />
            ) : (
              <TouchableOpacity 
                onPress={handleVerify}
                style={styles.verifyButton}
                disabled={loading || otp.length < 4}
              >
                <Text style={styles.verifyButtonText}>Verify & Create Account</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Footer Section */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigation.navigate("SignupScreen")}>
              <Text style={styles.backToSignup}>Back to Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLOR.col1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLOR.col1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
    resizeMode: 'contain',
    tintColor: COLOR.col2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLOR.col2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLOR.col4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: COLOR.col7,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputField: {
    backgroundColor: COLOR.col1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLOR.col7,
    borderWidth: 1,
    borderColor: COLOR.col4,
    textAlign: 'center',
    letterSpacing: 8,
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    color: COLOR.col4,
    marginRight: 5,
  },
  resendLink: {
    color: COLOR.col2,
    fontWeight: '600',
  },
  verifyButton: {
    backgroundColor: COLOR.col2,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLOR.col2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  verifyButtonText: {
    color: COLOR.col1,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  backToSignup: {
    color: COLOR.col2,
    fontWeight: '600',
  },
});

export default CheckOtpSignup;
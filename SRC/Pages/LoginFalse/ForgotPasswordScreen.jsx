import React, { useState } from "react";
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
  ScrollView
} from "react-native";
import { useToast } from "react-native-toast-notifications";

// Assets & Constants
import logo from '../../Assets/logo.png';
import { COLOR, windowHeight } from "../../Constants";

const ForgotPasswordScreen = ({ navigation }) => {
  const toast = useToast();
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const handleResetPassword = () => {
    if (phone === "" || newPassword === "" || confirmPassword === "") {
      toast.show("Please fill in all fields", { type: "warning" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.show("Passwords do not match", { type: "danger" });
      return;
    }
    setLoading(true);
    // Mock password reset request
    navigation.navigate('CheckOtpForgotPassword', { phone, password: newPassword });
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
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
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Enter your details to reset password</Text>
          </View>
          
          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                placeholder="Enter your phone number"
                value={phone}
                onChangeText={setPhone}
                style={styles.inputField}
                placeholderTextColor={COLOR.col4}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  style={styles.passwordInput}
                  placeholderTextColor={COLOR.col4}
                  secureTextEntry={!isPasswordVisible}
                />
                <TouchableOpacity 
                  onPress={togglePasswordVisibility}
                  style={styles.visibilityToggle}
                >
                  <Text style={styles.visibilityToggleText}>
                    {isPasswordVisible ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={styles.passwordInput}
                  placeholderTextColor={COLOR.col4}
                  secureTextEntry={!isConfirmPasswordVisible}
                />
                <TouchableOpacity 
                  onPress={toggleConfirmPasswordVisibility}
                  style={styles.visibilityToggle}
                >
                  <Text style={styles.visibilityToggleText}>
                    {isConfirmPasswordVisible ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {loading ? (
              <ActivityIndicator size="large" color={COLOR.col2} />
            ) : (
              <TouchableOpacity 
                onPress={handleResetPassword}
                style={styles.resetButton}
                disabled={loading}
              >
                <Text style={styles.resetButtonText}>Reset Password</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Footer Section */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
              <Text style={styles.backToLogin}>
                Remember your password? <Text style={styles.loginLink}>Sign In</Text>
              </Text>
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
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLOR.col1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.col4,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLOR.col7,
  },
  visibilityToggle: {
    paddingHorizontal: 16,
  },
  visibilityToggleText: {
    color: COLOR.col2,
    fontWeight: '500',
  },
  resetButton: {
    backgroundColor: COLOR.col2,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLOR.col2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 10,
  },
  resetButtonText: {
    color: COLOR.col1,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  backToLogin: {
    color: COLOR.col4,
    textAlign: 'center',
  },
  loginLink: {
    color: COLOR.col2,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;
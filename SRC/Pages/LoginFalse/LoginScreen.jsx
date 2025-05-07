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
import { useRecoilState } from "recoil";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Assets & Constants
import appLogo from '../../Assets/logo.png';
import { COLOR, windowHeight } from "../../Constants";
import { LoginState } from "../../RecoilState/LoginState";
import { BACKEND_URL } from "@env";

const LoginScreen = ({ navigation }) => {
  // Hooks
  const toast = useToast();
  const [isLoggedIn, setIsLoggedIn] = useRecoilState(LoginState);
  
  // State
  const [credentials, setCredentials] = useState({
    phoneNumber: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Handlers
  const handleInputChange = (field, value) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = async () => {
    console.log(BACKEND_URL)

    if (!credentials.phoneNumber || !credentials.password) {
      toast.show("Please fill in all fields", { type: "warning" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: credentials.phoneNumber,
          password: credentials.password
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        toast.show(data.error, { type: "danger" });
      } else {
        toast.show("Login successful!", { type: "success" });
        await AsyncStorage.setItem('token', data.token);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.show("Connection error. Please try again.", { type: "danger" });
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToForgotPassword = () => {
    navigation.navigate("ForgotPasswordScreen");
  };

  const navigateToSignUp = () => {
    navigation.navigate("SignupScreen");
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
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
            <Image source={appLogo} style={styles.logo} />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>
          
          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                placeholder="Enter your phone number"
                value={credentials.phoneNumber}
                onChangeText={(text) => handleInputChange('phoneNumber', text)}
                style={styles.inputField}
                placeholderTextColor={COLOR.col4}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChangeText={(text) => handleInputChange('password', text)}
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
            
            <TouchableOpacity 
              onPress={navigateToForgotPassword}
              style={styles.forgotPasswordButton}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
            
            {isLoading ? (
              <ActivityIndicator size="large" color={COLOR.col2} />
            ) : (
              <TouchableOpacity 
                onPress={handleLogin}
                style={styles.loginButton}
                disabled={isLoading}
              >
                <Text style={styles.loginButtonText}>Sign In</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Footer Section */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={navigateToSignUp}>
              <Text style={styles.signUpLink}> Sign Up</Text>
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
    tintColor: COLOR.col2, // Optional: if you want the logo to match your theme
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: COLOR.col2,
    fontSize: 14,
  },
  loginButton: {
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
  loginButtonText: {
    color: COLOR.col1,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: COLOR.col4,
  },
  signUpLink: {
    color: COLOR.col2,
    fontWeight: '600',
  },
});

export default LoginScreen;
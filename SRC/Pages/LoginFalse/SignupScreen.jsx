import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator
} from "react-native";
import { useToast } from "react-native-toast-notifications";
import { Dimensions } from 'react-native';
import { COLOR } from "../../Constants";

// Assets
import appLogo from '../../Assets/logo.png';
import { BACKEND_URL } from "@env";

const windowHeight = Dimensions.get('window').height;

const SignupScreen = ({ navigation }) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    phone: "",
    email: "",
    password: ""
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const navigateToLogin = () => {
    navigation.navigate("LoginScreen");
  };

  const handleSignup = async () => {
    const { email, password, name, age, phone } = formData;
    
    // Validation
    if (!email || !password || !name || !age || !phone) {
      toast.show("Please fill all fields", { type: "warning" });
      return;
    }

    if (isNaN(age) || age < 13 || age > 120) {
      toast.show("Please enter a valid age (13-120)", { type: "warning" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/checkuser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.message === "User does not exists with that email") {
        navigation.navigate('CheckOtpSignup', { 
          email, 
          password, 
          name, 
          age, 
          phone 
        });
      } else {
        toast.show("This user is already registered", { 
          type: "danger",
          placement: "bottom"
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.show("Connection error. Please try again.", { 
        type: "danger",
        placement: "bottom"
      });
    } finally {
      setIsLoading(false);
    }
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us to get started</Text>
          </View>
          
          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                style={styles.inputField}
                placeholderTextColor={COLOR.col4}
                autoCapitalize="words"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                placeholder="Enter your age"
                value={formData.age}
                onChangeText={(text) => handleInputChange('age', text)}
                style={styles.inputField}
                placeholderTextColor={COLOR.col4}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                placeholder="Enter your phone number"
                value={formData.phone}
                onChangeText={(text) => handleInputChange('phone', text)}
                style={styles.inputField}
                placeholderTextColor={COLOR.col4}
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                style={styles.inputField}
                placeholderTextColor={COLOR.col4}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  placeholder="Create a password"
                  value={formData.password}
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
            
            {isLoading ? (
              <ActivityIndicator size="large" color={COLOR.col2} />
            ) : (
              <TouchableOpacity 
                onPress={handleSignup}
                style={styles.signupButton}
                disabled={isLoading}
              >
                <Text style={styles.signupButtonText}>Create Account</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Footer Section */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}> Sign In</Text>
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
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
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
    marginBottom: 16,
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
  signupButton: {
    backgroundColor: COLOR.col2,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLOR.col2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  signupButtonText: {
    color: COLOR.col1,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: COLOR.col4,
  },
  loginLink: {
    color: COLOR.col2,
    fontWeight: '600',
  },
});

export default SignupScreen;
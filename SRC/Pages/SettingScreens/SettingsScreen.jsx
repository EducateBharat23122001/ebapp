import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLOR } from '../../Constants';
import { useRecoilState } from 'recoil';
import { LoginState } from '../../RecoilState/LoginState';
import LinearGradient from 'react-native-linear-gradient';

const SettingsScreen = ({ navigation }) => {
  const [islogin, setIsLogin] = useRecoilState(LoginState);

  const handleLogout = () => {
    AsyncStorage.removeItem('token');
    setIsLogin(false);
  };

  const SettingItem = ({ icon: Icon, iconName, text, onPress, isLast = false }) => (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.settingItemContainer, isLast && styles.lastItem]}>
        <View style={styles.iconContainer}>
          <Icon name={iconName} size={24} color={COLOR.col3} />
        </View>
        <Text style={styles.settingItemText}>{text}</Text>
        <MaterialIcons 
          name="keyboard-arrow-right" 
          size={24} 
          color={COLOR.col4} 
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header with Gradient Background */}
      <LinearGradient
        colors={[COLOR.col3, '#6a4c93']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Settings</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollContainer}>
        {/* My Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>My Account</Text>
          
          <SettingItem 
            icon={FontAwesome5} 
            iconName="book-open" 
            text="My Courses" 
            onPress={() => navigation.navigate('MyCoursesScreen')} 
          />
          <SettingItem 
            icon={FontAwesome5} 
            iconName="receipt" 
            text="My Orders" 
            onPress={() => navigation.navigate('AllOrdersScreen')} 
          />
          <SettingItem 
            icon={FontAwesome5} 
            iconName="chart-line" 
            text="My Test Scores" 
            onPress={() => navigation.navigate('AllTestScoresScreen')} 
            isLast
          />
        </View>

        {/* Support Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <SettingItem 
            icon={Entypo} 
            iconName="text-document" 
            text="Terms & Conditions" 
            onPress={() => navigation.navigate('TermsAndConditions')} 
          />
          <SettingItem 
            icon={MaterialIcons} 
            iconName="privacy-tip" 
            text="Privacy Policy" 
            onPress={() => navigation.navigate('PrivacyPolicy')} 
            isLast
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <MaterialCommunityIcons 
            name="logout-variant" 
            size={24} 
            color="#fff" 
          />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLOR.col3,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
  },
  settingItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLOR.col3,
    marginLeft: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLOR.col2,
    padding: 16,
    borderRadius: 12,
    marginVertical: 20,
    shadowColor: COLOR.col2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 10,
  },
});

export default SettingsScreen;
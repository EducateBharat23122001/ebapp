import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { COLOR } from '../../Constants';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const TermsAndConditionsScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLOR.col3, '#6a4c93']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.text}>
          Welcome to our application. These terms and conditions outline the rules and regulations for the use of our app.
        </Text>

        <Text style={styles.sectionTitle}>2. Intellectual Property</Text>
        <Text style={styles.text}>
          Unless otherwise stated, we own the intellectual property rights for all material in this app. All intellectual property rights are reserved.
        </Text>

        <Text style={styles.sectionTitle}>3. Restrictions</Text>
        <Text style={styles.text}>
          You are specifically restricted from: publishing any app material in any media without permission; selling, sublicensing or commercializing any app material; publicly performing or showing any app material; using this app in any way that is damaging to the app.
        </Text>

        <Text style={styles.sectionTitle}>4. Your Content</Text>
        <Text style={styles.text}>
          In these terms and conditions, "Your Content" shall mean any content you submit to this app. By submitting Your Content, you grant us a non-exclusive, worldwide, irrevocable license to use, reproduce, adapt, publish, translate and distribute it.
        </Text>

        <Text style={styles.sectionTitle}>5. Changes to Terms</Text>
        <Text style={styles.text}>
          We may revise these terms at any time without notice. By using this app you are agreeing to be bound by the current version of these terms and conditions.
        </Text>

        <Text style={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString()}</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLOR.col3,
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    color: COLOR.col3,
    lineHeight: 22,
    marginBottom: 10,
  },
  lastUpdated: {
    fontSize: 12,
    color: COLOR.col4,
    marginTop: 30,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default TermsAndConditionsScreen;
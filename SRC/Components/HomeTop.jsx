import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COLOR } from '../Constants';
import { useNavigation } from '@react-navigation/native';

const HomeTop = () => {
  const navigation = useNavigation();

  const toggleDrawer = () => {
    navigation.toggleDrawer();
  };

  const navigateToCart = () => {
    navigation.navigate("CartScreen");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={toggleDrawer}
        style={styles.iconButton}
        activeOpacity={0.7}
      >
        <Feather name="menu" size={24} color={COLOR.col3} />
      </TouchableOpacity>
      
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>Educate Bharat</Text>
      </View>
      
      <TouchableOpacity 
        onPress={navigateToCart}
        style={styles.iconButton}
        activeOpacity={0.7}
      >
        <View style={styles.cartBadge}>
          <Text style={styles.badgeText}>3</Text>
        </View>
        <Feather name="shopping-cart" size={24} color={COLOR.col3} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 60,
    backgroundColor: COLOR.col1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.col4,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLOR.col3,
  },
  cartBadge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: COLOR.col2,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeText: {
    color: COLOR.col1,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default HomeTop;
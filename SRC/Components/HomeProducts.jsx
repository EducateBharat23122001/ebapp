import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { BACKEND_URL } from '@env';
import { Toast } from 'react-native-toast-notifications';
import { COLOR } from '../Constants';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const HomeProducts = () => {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getThreeProducts = () => {
    fetch(`${BACKEND_URL}/getSomeProducts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ limit: 3 }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          Toast.show(data.error, { type: 'danger' });
        } else {
          setProducts(data.products);
        }
      })
      .catch(() => {
        Toast.show('Something went wrong', { type: 'danger' });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getThreeProducts();
  }, []);

  const handlePressItem = (item) => {
    navigation.navigate('ProductScreen', { product: item });
  };

  return (
    <View style={styles.containerOut}>
      <View style={styles.row}>
        <Text style={styles.head}>✨ Our Store</Text>
        <Text
          style={styles.more}
          onPress={() => navigation.navigate('StoreScreen')}
        >
          View all →
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLOR.col6} />
      ) : (
        <FlatList
          data={products}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item._id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handlePressItem(item)} style={styles.card}>
              <Image
                source={{ uri: item?.productImages?.[0] || 'https://via.placeholder.com/150' }}
                style={styles.image}
              />
              <View style={styles.overlay}>
                <Text numberOfLines={1} style={styles.title}>
                  {item.productName}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{ padding: 10 }}>No Products Found.</Text>}
        />
      )}
    </View>
  );
};

export default HomeProducts;

const styles = StyleSheet.create({
  containerOut: {
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  head: {
    fontSize: 20,
    fontWeight: '700',
    color: COLOR.col2,
  },
  more: {
    fontSize: 14,
    color: COLOR.col6,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  card: {
    width: width * 0.4,
    marginHorizontal: 10,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

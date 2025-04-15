import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Dimensions,
  RefreshControl
} from 'react-native';
import { BACKEND_URL } from '@env';
import { COLOR } from '../../Constants';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

const StoreScreen = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const getProducts = () => {
    setLoading(true);
    fetch(`${BACKEND_URL}/getAllProducts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then((res) => res.json())
      .then((data) => {
        const sortedProducts = data.products?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || [];
        setProducts(sortedProducts);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    getProducts();
  };

  const handleSearch = () => {
    if (searchQuery.length > 0) {
      setLoading(true);
      fetch(`${BACKEND_URL}/searchStoreProducts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      })
        .then((res) => res.json())
        .then((data) => {
          const sortedProducts = data.products?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || [];
          setProducts(sortedProducts);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      getProducts();
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const renderProductItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => handleProductClick(item)}
      activeOpacity={0.9}
    >
      {item.productImages?.length > 0 ? (
        <FastImage
          source={{ uri: item.productImages[0] }}
          style={styles.productImage}
          resizeMode={FastImage.resizeMode.cover}
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>Product Image</Text>
        </View>
      )}
      
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']}
        style={styles.imageOverlay}
      />
      
      <View style={styles.productContent}>
        <View style={styles.priceTag}>
          <Text style={styles.productPrice}>₹{item.productPrice}</Text>
          {item.productStock === 'OUTOFSTOCK' && (
            <View style={styles.stockTag}>
              <Text style={styles.stockText}>OUT OF STOCK</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.productTitle} numberOfLines={2}>
          {item.productName}
        </Text>
        
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.productDescription}
        </Text>
        
        <View style={styles.cartContainer}>
          <Feather 
            name="shopping-cart" 
            size={20} 
            color={COLOR.col1} 
            style={styles.cartIcon}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleProductClick = (item) => {
    navigation.navigate("ProductScreen", { product: item });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Store</Text>
          <Text style={styles.headerSubtitle}>Find amazing products</Text>
        </View>
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => navigation.navigate("CartScreen")}
        >
          <Feather name="shopping-cart" size={24} color={COLOR.col1} />
        </TouchableOpacity>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={COLOR.col4}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={handleSearch}
        >
          <AntDesign name="search1" size={20} color={COLOR.col1} />
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLOR.col2} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id.toString()}
          renderItem={renderProductItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLOR.col2}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <AntDesign name="frowno" size={40} color={COLOR.col4} />
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR.col1,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLOR.col3,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLOR.col4,
  },
  cartButton: {
    backgroundColor: COLOR.col2,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: COLOR.col1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: COLOR.col3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: COLOR.col3,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: COLOR.col2,
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 24,
  },
  productCard: {
    width: CARD_WIDTH,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLOR.col4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: COLOR.col1,
    fontSize: 14,
  },
  imageOverlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  productContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  priceTag: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: {
    backgroundColor: COLOR.col1,
    color: COLOR.col3,
    fontWeight: '700',
    fontSize: 14,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  stockTag: {
    backgroundColor: COLOR.col2,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stockText: {
    color: COLOR.col1,
    fontWeight: '700',
    fontSize: 12,
  },
  productTitle: {
    color: COLOR.col1,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  productDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 12,
  },
  cartContainer: {
    alignSelf: 'flex-end',
    backgroundColor: COLOR.col2,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartIcon: {
    marginLeft: 1, // slight visual adjustment
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: COLOR.col4,
    fontSize: 16,
    marginTop: 16,
  },
});

export default StoreScreen;
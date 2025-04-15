import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { COLOR, windowWidth } from '../../Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Toast, useToast } from 'react-native-toast-notifications';
import { useNavigation } from '@react-navigation/native';
import { BACKEND_URL } from "@env";

const ProductScreen = ({ route }) => {
    const navigation = useNavigation();
    const { product } = route.params;
    const toast = useToast();
    const [quantity, setQuantity] = useState(1);
    const [total, setTotal] = useState(product.productPrice);

    useEffect(() => {
        setTotal(product.productPrice * quantity);
    }, [quantity]);
    const BuyNow = async () => {
        await clearCart();
    }
    const AddToCart = async () => {
        const token = await AsyncStorage.getItem("token");
        
        fetch(BACKEND_URL + "/addToCart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                fullproduct: product,
                quantity: quantity,
                price: product.productPrice
            })
        })
            .then(res => res.json())
            .then(data => {
                data.error ? Toast.show(data.error, { type: "danger" }) : Toast.show(data.message);
                navigation.navigate('CartScreen');

            })
            .catch(err => {
                Toast.show("Something went wrong", { type: "danger" });
                console.log(err);
            });
    };


    const clearCart = async () => {
        let token = await AsyncStorage.getItem('token')
        fetch(BACKEND_URL + "/clearCart", {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
            .then(res => res.json())
            .then(async data => {
                console.log(data);
                await AddToCart();

            })
            .catch(err => {
                setLoading(false)
                console.log(err)
            })
    };

    return (
        <View style={styles.fullpage}>
            <View style={styles.topbar}>
                <Ionicons name="return-up-back-outline" size={30} style={styles.backbtn} onPress={() => navigation.goBack()} />
            </View>
            <ScrollView>
                <Image source={{ uri: product.productImages[0] }} style={styles.productImage} />
                <View style={styles.row}>
                    <Text style={styles.productName}>{product.productName}</Text>
                    <Text style={styles.price}>₹{total}</Text>
                    <Text style={styles.discountedPrice}>₹{parseInt(total + total * 0.1)}</Text>
                </View>
                <Text style={styles.description} numberOfLines={10}>{product.productDescription}</Text>
                <View style={styles.stars}>
                    {[...Array(4)].map((_, i) => (
                        <FontAwesome key={i} name="star" size={30} color={COLOR.col2} style={styles.star} />
                    ))}
                    <FontAwesome name="star-half-full" size={30} color={COLOR.col2} style={styles.star} />
                    <Text style={styles.rating}>4.5</Text>
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>


            {product.productStock !== 'OUTOFSTOCK' ?
                <View style={styles.pricebar}>
                    <View style={styles.quantityControls}>
                        <TouchableOpacity onPress={() => quantity > 1 && setQuantity(quantity - 1)}>
                            <AntDesign name="minuscircleo" size={30} color={COLOR.col3} />
                        </TouchableOpacity>
                        <Text style={styles.quantity}>{quantity}</Text>
                        <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
                            <AntDesign name="pluscircleo" size={30} color={COLOR.col3} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.addToCartButton} onPress={() => AddToCart()}>Add To Cart</Text>
                    <Text style={styles.addToCartButton} onPress={() => BuyNow()}>Buy Now</Text>

                </View>
                :
                <View style={styles.pricebar}>
                    <Text style={styles.outofstock}>This Product is out of stock</Text>
                </View>
            }
        </View>
    );
};

export default ProductScreen;

const styles = {
    fullpage: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    topbar: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        width: windowWidth,
        backgroundColor: '#fff',
        shadowColor: COLOR.col3,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 10,
    },
    backbtn: {
        color: COLOR.col3,
        fontSize: 24,
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 20,
    },
    productImageContainer: {
        position: 'relative',
        backgroundColor: '#fff',
        paddingVertical: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        marginBottom: 10,
    },
    productImage: {
        width: windowWidth,
        height: 300,
        resizeMode: "contain",
        transform: [{ scale: 0.9 }],
        transition: 'transform 0.3s ease',
    },
    row: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginHorizontal: 10,
        marginVertical: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    productName: {
        fontSize: 20,
        fontWeight: '800',
        color: COLOR.col3,
        width: '60%',
        fontFamily: 'System', // Consider using a custom font
        letterSpacing: 0.5,
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    price: {
        fontSize: 22,
        fontWeight: '800',
        color: COLOR.col1,
    },
    discountedPrice: {
        fontSize: 16,
        color: '#a0a0a0',
        textDecorationLine: 'line-through',
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        color: '#555',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 12,
        margin: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    stars: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: '#fff',
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginLeft: 15,
        marginTop: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    star: {
        marginRight: 3,
        color: '#FFD700', // Gold color for stars
        fontSize: 18,
    },
    rating: {
        fontSize: 16,
        marginLeft: 8,
        color: COLOR.col3,
        fontWeight: '600',
    },
    pricebar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: COLOR.col3,
        borderRadius: 15,
        margin: 10,
        shadowColor: COLOR.col3,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
        gap:10
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    controlButton: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        paddingHorizontal: 10,
    },
    quantity: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingHorizontal: 12,
        color: '#fff',
    },
    addToCartButton: {
        backgroundColor: COLOR.col1,
        color: COLOR.col2,
        fontWeight: '800',
        flex: 1,
        borderRadius: 10,
        overflow: 'hidden',
        padding: 12,
        textAlign: 'center',
        fontSize: 16,
        letterSpacing: 0.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        transform: [{ scale: 1 }],
        transition: 'transform 0.2s ease',
    },
    addToCartButtonPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
    },
    outofstock: {
        textAlign: 'center',
        width: '100%',
        color: COLOR.col1,
        backgroundColor: 'rgba(255,59,48,0.1)',
        padding: 12,
        borderRadius: 8,
        fontWeight: '600',
        marginTop: 10,
    },
    badge: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: COLOR.col1,
        color: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 'bold',
        zIndex: 2,
    },
    // Add these hover/pressed effects in your component logic
    buttonHover: {
        shadowColor: COLOR.col3,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    }
};
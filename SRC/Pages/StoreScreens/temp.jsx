import { StyleSheet, Text, View, ActivityIndicator, Image, Modal, TouchableOpacity, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BACKEND_URL } from '@env'
import { COLOR } from '../../Constants'
import { ScrollView } from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { Toast, useToast } from 'react-native-toast-notifications'
import Feather from 'react-native-vector-icons/Feather'
import Ionicons from 'react-native-vector-icons/Ionicons'
import RazorpayCheckout from 'react-native-razorpay';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '@env'
import { color } from 'react-native-elements/dist/helpers'
import { useNavigation } from '@react-navigation/native'


const CartScreen = () => {
    const navigation = useNavigation();
    const [cartData, setCartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [shipping, setShipping] = useState(2);
    const [totalAmount, setTotalAmount] = useState(0);
    const [tax, setTax] = useState(12);
    const [address, setAddress] = useState({
        AddressLine1: "",
        City: "",
        State: "",
        Pincode: ""
    });

    const getCardData = async () => {
        let token = await AsyncStorage.getItem('token')
        setLoading(true);

        fetch(BACKEND_URL + "/getCart", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                setCartData(data.userCart);
                const total = data.userCart.reduce((acc, item) => acc + (parseInt(item.fullproduct.productPrice) * item.quantity), 0)
                setTotalAmount(total)
                setShipping(3)
                setTax(12)
            })
            .catch(err => {
                console.log(err)
            })
            .finally(() => {
                setLoading(false)
            })
    }

    useEffect(() => {
        // Fetch data here (fetchCartData, fetchAddress)
        getCardData();
        getUserAddress();
    }, []);

    const deleteCartItem = async (cartItemId) => {
        let token = await AsyncStorage.getItem('token')
        console.log("cartitemId", cartItemId)
        fetch(BACKEND_URL + "/deleteCart", {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                cartitemId: cartItemId
            })
        })
            .then(res => res.json())
            .then(data => {
                console.log("data", data)
                Toast.show("Item Deleted")
                setCartData(data.userCart)
            })
            .catch(err => {
                setLoading(false)
                console.log(err)
            })
    };

    const clearCart = () => {
        setCartData([]);
        Toast.show("Cart Cleared");
    };

    const buyNow = async () => {
        // Handle purchase logic here
    };


    // ADDRESS
    const getUserAddress = async () => {
        const token = await AsyncStorage.getItem('token')
        fetch(BACKEND_URL + "/getUserAddress", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
            .then(res => res.json())
            .then(data => {
                console.log("get address -> ", data.address)
                setAddress(data.address)
            })
            .catch(err => {
                setLoading(false)
                console.log(err)
            })
    }

    const renderCartItem = (item, index) => (
        <View key={index} style={styles.cartItem}>
            <Image source={{ uri: item.fullproduct.productImages[0] }} style={styles.image} />
            <View style={styles.info}>
                <Text style={styles.name}>{item.fullproduct.productName}</Text>
                <Text style={styles.quantity}>Qty: {item.quantity}</Text>
                <Text style={styles.price}>Rs. {parseInt(item.price) * parseInt(item.quantity)}</Text>
            </View>
            <AntDesign name="delete" size={30} color={COLOR.col1} onPress={() => deleteCartItem(item.cartitemId)} />
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <Ionicons
                    name="return-up-back-outline"
                    size={30}
                    color={COLOR.col1}
                    onPress={() => console.log('hii')}
                />
                <Text style={styles.title}>Your Cart</Text>
                <Text style={styles.clearCart} onPress={clearCart}>Clear Cart</Text>
            </View>

            {/* Main Cart Section */}
            {loading ? (
                <ActivityIndicator size="large" color="#000" />
            ) : cartData.length > 0 ? (
                <ScrollView style={styles.cartContainer}>
                    {cartData.map(renderCartItem)}
                    <View style={styles.summaryTable}>
                        <View style={styles.row}>
                            <Text style={styles.cellLeft}>Cart Total:</Text>
                            <Text style={styles.cellRight}>Rs. {totalAmount}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.cellLeft}>Shipping:</Text>
                            <Text style={styles.cellRight}>Rs. {totalAmount * shipping / 100}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.cellLeft}>Tax:</Text>
                            <Text style={styles.cellRight}>Rs. {totalAmount * tax / 100}</Text>
                        </View>
                        <View style={styles.rowTotal}>
                            <Text style={styles.cellLeftTotal}>Grand Total:</Text>
                            <Text style={styles.cellRightTotal}>Rs. {totalAmount + (totalAmount * shipping / 100) + (totalAmount * tax / 100)}</Text>
                        </View>
                    </View>

                    {
                        address.AddressLine1.length > 0 ?
                            <View>
                                <Text style={styles.addressHeading}>Delivery Address:</Text>
                                <Text style={styles.addressText}>
                                    {address.AddressLine1 && address.AddressLine1 + ','} {address.City && address.City + ','} {address.State && address.State + ','}  {address.Pincode}
                                </Text>
                                <TouchableOpacity onPress={() => {/* Trigger address modal */ }}>
                                    <Text style={styles.editAddress}>Edit Address</Text>
                                </TouchableOpacity>
                            </View>
                            :
                            <View style={styles.noAddress}>
                                <Text style={styles.noAddressText}>Please provide an address</Text>
                                <Text style={styles.noAddressButton}>Select</Text>
                            </View>
                    }
                </ScrollView>
            ) : (
                <View style={styles.emptyCart}>
                    <Feather name="shopping-cart" size={80} color={COLOR.col1} />
                    <Text style={styles.emptyCartText}>Your cart is empty</Text>
                </View>
            )}

            {/* Buy Now Button */}
            {cartData.length > 0 && (
                <TouchableOpacity style={styles.buyNowButton} onPress={buyNow}>
                    <Text style={styles.buyNowText}>Buy Now</Text>
                </TouchableOpacity>
            )}

            {/* Address Modal */}
            <Modal animationType="slide" transparent>
                {/* Modal Content */}
            </Modal>
        </View>
    );
};
export default CartScreen;

const styles = StyleSheet.create({
    topBar: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#fff', elevation: 3 },
    title: { flex: 1, fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: COLOR.col3 },
    clearCart: { color: COLOR.col1, fontWeight: '600', fontSize: 10, borderColor: COLOR.col1, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
    cartContainer: { padding: 10, backgroundColor: '#fff' },
    cartItem: { flexDirection: 'row', backgroundColor: '#fff', marginBottom: 10, padding: 10, borderRadius: 5, elevation: 1 },
    image: { width: 60, height: 60, borderRadius: 5 },
    info: { flex: 1, paddingLeft: 10 },
    name: { fontWeight: '600', fontSize: 16 },
    quantity: { color: 'grey', marginTop: 5 },
    price: { marginTop: 5, fontWeight: '600' },

    addressHeading: { fontSize: 16, marginTop: 20, fontWeight: '600' },
    addressText: { fontSize: 14, color: 'grey', marginTop: 5 },
    editAddress: { color: 'blue', fontSize: 14, marginTop: 5 },
    buyNowButton: { backgroundColor: COLOR.col3, padding: 15, borderRadius: 10, alignItems: 'center', margin: 10 },
    buyNowText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    emptyCart: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' },
    emptyCartText: { fontSize: 18, color: COLOR.col1, marginTop: 10 },


    // summarytable
    summaryTable: {
        width: '100%',
        marginVertical: 20,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 5,
        alignSelf: 'center'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    rowTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
    },
    cellLeft: {
        fontSize: 14,
        fontWeight: '400',
        color: COLOR.col2,
    },
    cellRight: {
        fontSize: 14,
        fontWeight: '500',
        color: COLOR.col3,
    },
    cellLeftTotal: {
        fontSize: 16,
        fontWeight: '400',
        color: COLOR.col3,
    },
    cellRightTotal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLOR.col3,
    },
    noAddress: {
        backgroundColor: '#f9f9f9', // Light gray background
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
        elevation: 2, // Subtle shadow effect
        borderWidth: 1,
        borderColor: '#e0e0e0', // Border to make it stand out
    },
    noAddressText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333', // Neutral color for text
        marginBottom: 10,
        textAlign: 'center',
    },
    noAddressButton: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: '#007BFF', // Blue button
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 5,
        textAlign: 'center',
    },
});


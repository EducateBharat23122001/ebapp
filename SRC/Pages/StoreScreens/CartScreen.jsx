import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather'
import AntDesign from 'react-native-vector-icons/AntDesign'

import { COLOR } from '../../Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL, RAZORPAY_KEY_ID } from '@env'
import { Toast } from 'react-native-toast-notifications';
import RazorpayCheckout from 'react-native-razorpay';

const CartScreen = () => {
    let razorpayKeyId = RAZORPAY_KEY_ID

    const navigation = useNavigation();
    const [cartData, setCartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);
    const [address, setAddress] = useState({
        AddressLine1: "",
        AddressLine2: "",
        City: "",
        State: "",
        Pincode: ""
    });
    const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
    const [addressLoading, setAddressLoading] = useState(false);

    const [extras, setExtras] = useState({
        allCoursesDiscount: 0,
        allProductsDiscount: 0,
        deliveryCharges: 0
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
            .then(async data => {
                setCartData(data.userCart);

                await getExtras();
                const total = data.userCart.reduce((acc, item) => acc + getProductTotal(item), 0);
                setTotalAmount(total)

            })
            .catch(err => {
                console.log(err)
            })
            .finally(() => {
                setLoading(false)
            })
    }
    const getExtras = async () => {


        const response = await fetch(`${BACKEND_URL}/getExtras`);
        const data = await response.json();
        if (data.error) {
            Alert.alert(data.error);
        } else {
            console.log(data)
            setExtras(data.extras);
        }

    };

    useEffect(() => {


        getCardData();
        getUserAddress();

        return () => {
            console.log("Cleaning up...");
            setCartData(null);
            setTotalAmount(0);
            setAddress({
                AddressLine1: "",
                AddressLine2: "",
                City: "",
                State: "",
                Pincode: ""
            })
            setExtras({
                allCoursesDiscount: 0,
                allProductsDiscount: 0,
                deliveryCharges: 0
            })
        };
    }, []);

    useEffect(() => {
        // Recalculate total whenever cartData changes
        if (cartData?.length > 0 && extras) {
            const total = cartData.reduce((acc, item) => acc + getProductTotal(item), 0);
            setTotalAmount(total);
        }
    }, [cartData, extras]);

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


    const buyNow = async () => {
        let token = await AsyncStorage.getItem('token')

        if (address.AddressLine1 == "" || address.City == "" || address.Pincode == "") {
            Toast.show("Please add an address")
            return
        }
        var options = {
            description: 'Buy Products',
            image: '',
            currency: 'INR',
            key: razorpayKeyId,
            amount: (totalAmount + extras.deliveryCharges) * 100, //paise
        }

        console.log(options);

        RazorpayCheckout.open(options).then((data) => {
            fetch(BACKEND_URL + "/buyProducts", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    cartdata: cartData,
                    cartTotal: totalAmount,
                    paymentMethod: "ONLINE",
                    shipping: extras.deliveryCharges,
                    tax: 0,
                    address: address,
                    paymentId: data.razorpay_payment_id,
                })
            })
                .then(res => res.json())
                .then(data => {
                    console.log("data", data)
                    if (data.error) {
                        Toast.show(data.error)
                        return
                    }
                    Toast.show("Order Placed")
                    setCartData(data.userCart)
                    navigation.navigate("BottomNavigator", {
                        screen: "SettingsNavigator",
                        params: {
                            screen: "AllOrdersScreen"
                        }
                    });
                })
                .catch(err => {
                    Toast.show("Something went wrong")
                    setLoading(false)
                    console.log(err)
                })
        }).catch((error) => {
            // handle failure
            Toast.show("Something went wrong")
            console.log(error)
        })




    }

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
    const addNewAddress = async () => {
        if (address.AddressLine1.length > 0 && address.City.length > 0 && address.Pincode.length > 0) {
            // 
            setAddressLoading(true)
            const token = await AsyncStorage.getItem('token')
            fetch(BACKEND_URL + "/addUserAddress", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    address: address
                })
            })
                .then(res => res.json())
                .then(data => {
                    setAddressLoading(false)
                    console.log("data", data)
                    setAddress(data.address)
                    Toast.show("Address Updated")
                })
                .catch(err => {
                    Toast.show("Something went wrong")
                    setAddressLoading(false)
                    console.log(err)
                })
            setIsAddressModalVisible(false)

        }
        else {
            Toast.show("Please provide all important fields!!")

        }
    }
    const openAddressModal = () => setIsAddressModalVisible(true);
    const closeAddressModal = () => setIsAddressModalVisible(false);

    const getProductTotal = (item) => {
        // Total = (price - discount%ofPrice) * quantity
      
        if (extras.allProductsDiscount > 0) {
            return parseInt((parseInt(item.price) - 0) * parseInt(item.quantity) * parseInt(extras.allProductsDiscount) / 100)
        }
        return parseInt((parseInt(item.price) - (parseInt(item.price) * parseInt(item.fullproduct.productDiscount) / 100)) * parseInt(item.quantity))
    }

    const handleProductClick = (item) => {
        // console.log(item)
        navigation.navigate("ProductScreen", { product: item })

    }
    const renderCartItem = (item, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.cartItemContainer}
          onPress={() => handleProductClick(item.fullproduct)}
        >
          <View style={styles.cartItemContent}>
            {/* Product Image */}
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: item.fullproduct.productImages[0] }} 
                style={styles.image} 
              />
            </View>
            
            {/* Product Info */}
            <View style={styles.productInfo}>
              <Text style={styles.name} numberOfLines={1}>{item.fullproduct.productName}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>₹{getProductTotal(item)}</Text>
                {extras.allProductsDiscount == 0 && item.fullproduct.productDiscount > 0 && (
                  <View style={styles.discount}>
                    <Text style={styles.discountText}>{item.fullproduct.productDiscount}% off</Text>
                  </View>
                )}
              </View>
            </View>
            
            {/* Quantity */}
            <View style={styles.quantityContainer}>
              <Text style={styles.quantity}>x{item.quantity}</Text>
            </View>
            
            {/* Delete Button */}
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => deleteCartItem(item.cartitemId)}
            >
              <AntDesign name="delete" size={20} color={COLOR.col2} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );


    if (!cartData) {
        return (
            <View style={styles.fullPage}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        )
    }
    return (
        <View style={styles.fullPage}>
            <View style={styles.topBar}>
                <Ionicons
                    name="return-up-back-outline"
                    size={30}
                    color={COLOR.col2}
                    onPress={() => navigation.goBack()}
                />
                <Text style={styles.title}>Your Cart</Text>
                <Text style={styles.myOrders} 
                onPress={() => navigation.navigate('SettingsNavigator', { 
                    screen: 'AllOrdersScreen' 
                  })}
                >My Orders</Text>
            </View>
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
                            <Text style={styles.cellLeft}>Shipping/Delivery:</Text>
                            <Text style={styles.cellRight}>Rs. {extras.deliveryCharges}</Text>
                        </View>

                        <View style={styles.rowTotal}>
                            <Text style={styles.cellLeftTotal}>Grand Total:</Text>
                            <Text style={styles.cellRightTotal}>Rs. {totalAmount + extras.deliveryCharges}</Text>
                        </View>
                    </View>

                    {
                        address.AddressLine1.length > 0 && address.City.length > 0 && address.Pincode.length > 0 ?
                            <TouchableOpacity onPress={() => openAddressModal()}>
                                <Text style={styles.addressHeading}>Delivery Address:</Text>
                                <Text style={styles.addressText}>
                                    {address.AddressLine1 && address.AddressLine1 + ','} {address.City && address.City + ','} {address.State && address.State + ','}  {address.Pincode}
                                    {'  '}
                                    <Text style={styles.editAddress}>Edit Address</Text>


                                </Text>


                            </TouchableOpacity>
                            :
                            <TouchableOpacity style={styles.noAddress} onPress={() => openAddressModal()}>
                                <Text style={styles.noAddressText}>Please provide an address</Text>
                                <Text style={styles.noAddressButton}>Select</Text>
                            </TouchableOpacity>
                    }

                    {cartData.length > 0 && address.AddressLine1.length > 0 && address.City.length > 0 && address.Pincode.length > 0 && (
                        <TouchableOpacity style={styles.buyNowButton} onPress={buyNow}>
                            <Text style={styles.buyNowText}>Buy Now</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            ) : (
                <View style={styles.emptyCart}>
                    <Feather name="shopping-cart" size={80} color={COLOR.col2} />
                    <Text style={styles.emptyCartText}>Your cart is empty</Text>
                </View>
            )}

            <Modal
                visible={isAddressModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={closeAddressModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView>
                            <Text style={styles.modalTitle}>Edit Address</Text>

                            <Text style={styles.label}>Address Line 1<Text style={{ color: 'red' }}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter Address Line 1"
                                placeholderTextColor={COLOR.col3}
                                value={address.AddressLine1}
                                onChangeText={(text) => setAddress({ ...address, AddressLine1: text })}
                            />
                            <Text style={styles.label}>Address Line 2</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter Address Line 2"
                                placeholderTextColor={COLOR.col3}

                                value={address.AddressLine2}
                                onChangeText={(text) => setAddress({ ...address, AddressLine2: text })}
                            />
                            <Text style={styles.label}>City<Text style={{ color: 'red' }}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholderTextColor={COLOR.col3}

                                placeholder="Enter City"
                                value={address.City}
                                onChangeText={(text) => setAddress({ ...address, City: text })}
                            />

                            <Text style={styles.label}>State</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter State"
                                value={address.State}
                                placeholderTextColor={COLOR.col3}

                                onChangeText={(text) => setAddress({ ...address, State: text })}
                            />

                            <Text style={styles.label}>Pincode<Text style={{ color: 'red' }}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter Pincode"
                                keyboardType="numeric"
                                value={address.Pincode}
                                placeholderTextColor={COLOR.col3}

                                onChangeText={(text) => setAddress({ ...address, Pincode: text })}
                            />

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.cancelButton} onPress={closeAddressModal}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveButton} onPress={addNewAddress}>
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default CartScreen

const styles = StyleSheet.create({
    fullPage: {
        backgroundColor: '#f8f9fa', // Lighter background for better contrast
        flex: 1,
    },
    topBar: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 15,
        backgroundColor: '#fff',
        shadowColor: COLOR.col3,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        zIndex: 10,
    },
    title: { 
        flex: 1, 
        fontSize: 16, 
        fontWeight: '800', 
        textAlign: 'center', 
        color: COLOR.col3,
        letterSpacing: 0.5,
    },
    myOrders: { 
        color: COLOR.col2, 
        fontWeight: '700', 
        fontSize: 12, 
        borderColor: COLOR.col3, 
        borderWidth: 1.5, 
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: 'rgba(92, 70, 156, 0.1)',
    },

    // Cart Section
    cartContainer: {
        flex: 1,
        paddingHorizontal: 15,
        paddingTop: 10,
    },
    emptyCart: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    emptyCartText: {
        color: COLOR.col3,
        fontSize: 16,
        marginTop: 20,
        textAlign: 'center',
        lineHeight: 24,
    },
   
    // Summary Table
    summaryTable: {
        width: '94%',
        marginVertical: 15,
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: COLOR.col3,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
        alignSelf: 'center'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    rowTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 15,
        marginTop: 5,
    },
    cellLeft: {
        fontSize: 14,
        fontWeight: '500',
        color: COLOR.col3,
    },
    cellRight: {
        fontSize: 14,
        fontWeight: '500',
        color: COLOR.col3,
    },
    cellLeftTotal: {
        fontSize: 16,
        fontWeight: '600',
        color: COLOR.col3,
    },
    cellRightTotal: {
        fontSize: 18,
        fontWeight: '700',
        color: COLOR.col5,
    },

    // Address Section
    addressHeading: { 
        fontSize: 16, 
        marginTop: 20, 
        marginBottom: 10,
        marginHorizontal: 15,
        fontWeight: '700',
        color: COLOR.col3,
    },
    addressText: { 
        fontSize: 14, 
        color: '#555', 
        lineHeight: 20,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    editAddress: { 
        color: COLOR.col3, 
        fontSize: 12, 
        marginTop: 8,
        textDecorationLine: 'underline',
        fontWeight: '600',
        alignSelf: 'flex-end',
        marginRight: 15,
    },

    // No Address
    noAddress: {
        backgroundColor: 'rgba(92, 70, 156, 0.05)',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 15,
        marginVertical: 10,
        borderWidth: 1.5,
        flexDirection: 'row',
        borderColor: COLOR.col4,
        borderStyle: 'dashed'
    },
    noAddressText: {
        fontSize: 12,
        fontWeight: '500',
        color: COLOR.col3,
        flex: 1,
    },
    noAddressButton: {
        fontSize: 12,
        fontWeight: '700',
        color: COLOR.col1,
        backgroundColor: COLOR.col3,
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        overflow: 'hidden',
    },

    // Bottom Button
    buyNowButton: { 
        backgroundColor: COLOR.col3, 
        padding: 16, 
        borderRadius: 12, 
        alignItems: 'center', 
        margin: 15,
        marginTop: 20,
        shadowColor: COLOR.col3,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    buyNowText: { 
        color: '#fff', 
        fontSize: 16, 
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 20,
        color: COLOR.col3,
        textAlign: 'center',
    },
    label: {
        fontSize: 12,
        fontWeight: '500',
        color: COLOR.col3,
        marginBottom: 8,
    },
    input: {
        fontSize: 14,
        borderWidth: 1.5,
        borderColor: '#e0e0e0',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 15,
        backgroundColor: '#fff',
        color: COLOR.col3,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 10,
    },
    cancelButton: {
        padding: 12,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        flex: 1,
    },
    saveButton: {
        padding: 12,
        backgroundColor: COLOR.col3,
        borderRadius: 10,
        flex: 1,
    },
    cancelButtonText: {
        color: COLOR.col3,
        textAlign: 'center',
        fontWeight: '600',
    },
    saveButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '600',
    },


    cartItemContainer: {
        backgroundColor: '#fff',
        marginBottom: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden',
      },
      cartItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
      },
      imageContainer: {
        width: 60,
        height: 60,
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: 12,
      },
      image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
      },
      productInfo: {
        flex: 1,
        justifyContent: 'center',
        marginRight: 12,
      },
      name: {
        fontSize: 14,
        fontWeight: '600',
        color: COLOR.col3,
        marginBottom: 4,
      },
      priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      price: {
        fontSize: 14,
        fontWeight: '700',
        color: COLOR.col3,
        marginRight: 8,
      },
      discount: {
        backgroundColor: COLOR.col4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
      },
      discountText: {
        fontSize: 10,
        fontWeight: '600',
        color: COLOR.col3,
      },
      quantityContainer: {
        width: 40,
        alignItems: 'center',
      },
      quantity: {
        fontSize: 14,
        fontWeight: '600',
        color: COLOR.col3,
      },
      deleteButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
      },
});
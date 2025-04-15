import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '@env';
import { COLOR } from '../../Constants';
import { Toast, useToast } from 'react-native-toast-notifications';
import AntDesign from 'react-native-vector-icons/AntDesign';

const OrderScreen = ({ navigation, route }) => {
    const toast = useToast();
    const { orderId } = route.params;
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const getOrderByOrderId = async () => {
        const token = await AsyncStorage.getItem('token');
        setLoading(true);

        fetch(BACKEND_URL + '/getOrderById', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ orderId }),
        })
            .then(res => res.json())
            .then(data => {
                setLoading(false);
                if (data.error) {
                    Toast.show(data.error, { type: 'danger' });
                    return;
                }
                setOrder(data.order);
            })
            .catch(() => {
                setLoading(false);
                Toast.show('Something went wrong', { type: 'danger' });
            });
    };

    React.useEffect(() => {
        getOrderByOrderId();

        return ()=>{
            setOrder(null);
        }
    }, []);

    const cancelOrder = async () => {
        const token = await AsyncStorage.getItem('token');

        fetch(BACKEND_URL + '/cancelOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ orderId }),
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                if (data.error) {
                    Toast.show(data.error, { type: 'danger' });
                    return;
                }
                Toast.show(data.message, { type: 'success' });
                setOrder(data.order);
            });
    };

    return (
        <View style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <AntDesign name="arrowleft" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.topBarText}>Order Details</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLOR.col3} />
                </View>
            ) : (
                order && (
                    <ScrollView contentContainerStyle={styles.contentContainer}>
                        {/* Order Information */}
                        <View style={styles.infoBlock}>
                            <Text style={styles.infoTitle}>Order ID:</Text>
                            <Text style={styles.infoText}>{order._id}</Text>
                        </View>
                        <View style={styles.infoBlock}>
                            <Text style={styles.infoTitle}>Order Date:</Text>
                            <Text style={styles.infoText}>{order.createdAt}</Text>
                        </View>
                        <View style={styles.infoBlock}>
                            <Text style={styles.infoTitle}>Order Status:</Text>
                            <Text style={styles.infoText}>
                                {order.isCancelled
                                    ? 'Cancelled'
                                    : order.isDelivered == "Not Delivered"
                                        ? 'Processing'
                                        : 'Delivered'}
                            </Text>
                        </View>
                        <View style={styles.infoBlock}>
                            <Text style={styles.infoTitle}>Order Cart Total:</Text>
                            <Text style={styles.infoText}>Rs. {order.carttotal}</Text>
                        </View>


                        {/* Delivery Partner */}
                        <Text style={styles.sectionTitle}>Delivery Partner</Text>
                        <View style={styles.infoBlock}>
                            <Text style={styles.infoTitle}>Delivery Partner Name:</Text>
                            <Text style={styles.infoText}>
                                {order.deliveryBoy.name || 'NOT ASSIGNED'}
                            </Text>
                        </View>
                        <View style={styles.infoBlock}>
                            <Text style={styles.infoTitle}>Delivery Partner Phone:</Text>
                            <Text style={styles.infoText}>
                                {order.deliveryBoy.phone || 'NOT ASSIGNED'}
                            </Text>
                        </View>

                        {/* Shipping Details */}
                        <Text style={styles.sectionTitle}>Shipping Details</Text>
                        <View style={styles.infoBlock}>
                            <Text style={styles.infoTitle}>Address:</Text>
                            <Text style={styles.infoText}>
                                {`${order.shippingAddress.AddressLine1}, ${order.shippingAddress.AddressLine2}, ${order.shippingAddress.City}, ${order.shippingAddress.Pincode}, ${order.shippingAddress.State}`}
                            </Text>
                        </View>
                        <View style={styles.infoBlock}>
                            <Text style={styles.infoTitle}>Shipping Cost:</Text>
                            <Text style={styles.infoText}>Rs. {order.shippingCost}</Text>
                        </View>

                        {/* Payment Details */}
                        <Text style={styles.sectionTitle}>Payment Details</Text>
                        <View style={styles.infoBlock}>
                            <Text style={styles.infoTitle}>Payment Method:</Text>
                            <Text style={styles.infoText}>{order.paymentMethod}</Text>
                        </View>
                        <View style={styles.infoBlock}>
                            <Text style={styles.infoTitle}>Payment Status:</Text>
                            <Text style={styles.infoText}>
                                {order.isPaid ? 'Paid' : 'Not Paid'}
                            </Text>
                        </View>
                        <View style={styles.infoBlock}>
                            <Text style={styles.infoTitle}>Final Amount Paid:</Text>
                            <Text style={styles.infoText}>Rs.  {parseInt(order.carttotal) +parseInt(order.shippingCost)}</Text>
                        </View>

                        {/* Order Items */}
                        <Text style={styles.sectionTitle}>Order Items</Text>
                        {order.orderItems.map((item, index) => (
                            <View key={index} style={styles.cartItem}>
                                <Image source={{ uri: item.fullproduct.productImages[0] }} style={styles.image} />

                                <Text style={styles.quantity}>{item.quantity}</Text>
                                <Text style={styles.name}>{item.fullproduct.productName}</Text>
                                <Text style={styles.price}>Rs. {parseInt(item.price) * parseInt(item.quantity)}</Text>
                            </View>
                        ))}

                        {/* Cancel Button */}
                        {order.isCancelled ? (
                            <Text style={styles.cancelledText}>Order Cancelled</Text>
                        ) : (
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={cancelOrder}
                            >
                                <Text style={styles.cancelButtonText}>Cancel Order</Text>
                            </TouchableOpacity>
                        )}
                        <View style={{ height: 100 }}></View>

                    </ScrollView>
                )
            )}
        </View>
    );
};

export default OrderScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    topBar: {

        backgroundColor: COLOR.col3,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        elevation: 3,
        paddingVertical: 10
    },
    topBarText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        padding: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLOR.col3,
        marginVertical: 8,
    },
    infoBlock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#333',
    },
    infoText: {
        fontSize: 14,
        color: '#666',
    },
    cartItem: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fff', marginBottom: 10 },
    image: { width: 30, height: 30, borderRadius: 5 },
    info: { flex: 1, paddingLeft: 10 },
    name: { fontWeight: '600', fontSize: 14, flex: 1 },
    quantity: { color: COLOR.col3 },
    price: { marginTop: 5, fontWeight: '600' },
    cancelButton: {
        backgroundColor: COLOR.col3,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    cancelButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelledText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#ff5252',
        marginTop: 16,
    },
});

import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '@env';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLOR } from '../../Constants';

const AllOrdersScreen = ({ navigation }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const getOrders = async () => {
        setLoading(true);
        let token = await AsyncStorage.getItem('token');
        fetch(`${BACKEND_URL}/getOrders`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setLoading(false);
                setOrders(data.orders);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
            });
    };

    React.useEffect(() => {
        getOrders();
    }, []);

    const convertDate = (date) => {
        let d = new Date(date);
        return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
    };

    return (
        <View style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.topBarTitle}>Your Orders</Text>
            </View>

            {/* Content */}
            {loading === false && orders.length === 0 && (
                <View style={styles.noOrdersContainer}>
                    <AntDesign name="heart" size={100} color="#FF6F61" />
                    <Text style={styles.noOrdersText}>No Orders Yet</Text>
                </View>
            )}

            {loading === true && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6F61" />
                </View>
            )}

            {loading === false && orders.length > 0 && (
                <ScrollView style={styles.scrollView}>
                    {orders
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .map((order, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => navigation.navigate('OrderScreen', { orderId: order.orderid })}
                            >
                                <View style={styles.orderCard}>
                                    <Text style={styles.orderDate}>{convertDate(order.createdAt)}</Text>
                                    <Text style={styles.orderId}>{order.orderid}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                </ScrollView>
            )}
        </View>
    );
};

export default AllOrdersScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    topBar: {
        paddingVertical:10,
        backgroundColor: COLOR.col3,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    topBarTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: 'bold',
        color: COLOR.col1,
    },
    noOrdersContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noOrdersText: {
        fontSize: 18,
        fontWeight: '400',
        color: '#555',
        marginTop: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        padding: 10,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderDate: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        backgroundColor: COLOR.col1,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        textAlign: 'center',
    },
    orderId: {
        fontSize: 14,
        fontWeight: '400',
        color: '#555',
    },
});

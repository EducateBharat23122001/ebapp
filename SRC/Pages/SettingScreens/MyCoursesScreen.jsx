import { Dimensions, StyleSheet, Text, View, ActivityIndicator, Image, FlatList, RefreshControl } from 'react-native';
import React, { useState, useEffect } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { BACKEND_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLOR } from '../../Constants';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';

const { width } = Dimensions.get('window');

const MyCoursesScreen = ({ navigation }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const getMyCourses = async () => {
        const token = await AsyncStorage.getItem('token');
        setLoading(true);
        fetch(`${BACKEND_URL}/getMyCourses`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setCourses(data.courses || []);
                setLoading(false);
                setRefreshing(false);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
                setRefreshing(false);
            });
    };

    const handleRefresh = () => {
        setRefreshing(true);
        getMyCourses();
    };

    useEffect(() => {
        getMyCourses();
    }, []);

    const renderCourseItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.courseCard} 
            onPress={() => handleCourseClick(item)}
            activeOpacity={0.9}
        >
            {item.courseImage ? (
                <FastImage
                    source={{ uri: item.courseImage }}
                    style={styles.courseImage}
                    resizeMode={FastImage.resizeMode.cover}
                />
            ) : (
                <View style={styles.imagePlaceholder}>
                    <Text style={styles.placeholderText}>Course Image</Text>
                </View>
            )}
            
            <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']}
                style={styles.imageOverlay}
            />
            
            <View style={styles.cardContent}>
                <View style={styles.priceTag}>
                    {parseInt(item.coursePrice, 10) > 0 ? (
                        <Text style={styles.premiumPrice}>₹{item.coursePrice}</Text>
                    ) : (
                        <View style={styles.freeTag}>
                            <Text style={styles.freeText}>FREE</Text>
                        </View>
                    )}
                </View>
                
                <Text style={styles.courseTitle} numberOfLines={2}>
                    {item.courseName}
                </Text>
                
                <Text style={styles.courseDescription} numberOfLines={2}>
                    {item.courseDescription}
                </Text>
                
                <View style={styles.arrowContainer}>
                    <MaterialIcons name="arrow-forward" size={20} color={COLOR.col1} />
                </View>
            </View>
        </TouchableOpacity>
    );

    const handleCourseClick = (item) => {
        navigation.navigate('CourseMainScreen', { course: item })
    }

    return (
        <View style={styles.container}>
            {/* Header with Gradient Background */}
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
                <Text style={styles.headerTitle}>Your Courses</Text>
            </LinearGradient>

            {/* Content */}
            {loading && !refreshing ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={COLOR.col3} />
                </View>
            ) : courses.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MaterialIcons name="book" size={50} color={COLOR.col4} />
                    <Text style={styles.emptyText}>No courses yet</Text>
                    <Text style={styles.emptySubtext}>Explore our courses to get started</Text>
                </View>
            ) : (
                <FlatList
                    data={courses}
                    keyExtractor={(item) => item._id.toString()}
                    renderItem={renderCourseItem}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={COLOR.col3}
                        />
                    }
                />
            )}
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
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: COLOR.col3,
        marginTop: 15,
    },
    emptySubtext: {
        fontSize: 14,
        color: COLOR.col4,
        marginTop: 5,
        textAlign: 'center',
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 30,
    },
    courseCard: {
        width: '100%',
        height: 180,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
        position: 'relative',
    },
    courseImage: {
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
    cardContent: {
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
        backgroundColor: COLOR.col1,
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    premiumPrice: {
        color: COLOR.col3,
        fontWeight: '700',
        fontSize: 14,
    },
    freeTag: {
        backgroundColor: COLOR.col2,
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    freeText: {
        color: COLOR.col1,
        fontWeight: '700',
        fontSize: 14,
    },
    courseTitle: {
        color: COLOR.col1,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    courseDescription: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginBottom: 12,
    },
    arrowContainer: {
        alignSelf: 'flex-end',
        backgroundColor: COLOR.col2,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MyCoursesScreen;
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from 'react-native-fast-image';
import  LinearGradient  from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

const AllCoursesScreen = () => {
    const navigation = useNavigation();
    const [courses, setCourses] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchCourses = async (query = '') => {
        try {
            const token = await AsyncStorage.getItem('token');
            const endpoint = query ? '/searchCourses' : '/allCourses';
            const body = query ? { query } : { isUser: true };

            const response = await fetch(`${BACKEND_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            const sortedCourses = data.courses?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || [];
            setCourses(sortedCourses);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchCourses();
    };

    useEffect(() => {
        setLoading(true);
        fetchCourses();
    }, []);

    const handleSearch = () => {
        setLoading(true);
        fetchCourses(searchQuery);
    };

    const renderCourseItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.courseCard}
            onPress={() => navigation.navigate('CourseMainScreen', { course: item })}
            activeOpacity={0.9}
        >
            {item.courseImage !== 'noimage' ? (
                <Image
                    source={{ uri: item.courseImage }}
                    style={styles.courseImage}
                    resizeMode={"cover"}
                />
            ) : (
                <View style={styles.imagePlaceholder}>
                    <Text style={styles.placeholderText}>Course Preview</Text>
                </View>
            )}
            
            <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']}
                style={styles.imageOverlay}
            />
            
            <View style={styles.courseContent}>
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
                    <AntDesign name="arrowright" size={20} color={COLOR.col1} />
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Discover Courses</Text>
                <Text style={styles.headerSubtitle}>Expand your knowledge</Text>
            </View>
            
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search courses..."
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
                    data={courses}
                    keyExtractor={(item) => item._id.toString()}
                    renderItem={renderCourseItem}
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
                            <Text style={styles.emptyText}>No courses found</Text>
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
    courseCard: {
        width: CARD_WIDTH,
        height: 200,
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
    courseContent: {
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
        fontSize: 20,
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

export default AllCoursesScreen;
import React, { useState, useEffect } from 'react';
import { 
  Dimensions, 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  ActivityIndicator, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  SafeAreaView
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLOR } from '../../Constants';
import { useNavigation } from '@react-navigation/native';
import { BACKEND_URL, RAZORPAY_KEY_ID } from '@env';
import Video from 'react-native-video';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RazorpayCheckout from 'react-native-razorpay';
import { Toast } from 'react-native-toast-notifications';
import { SelectList } from 'react-native-dropdown-select-list';
import FastImage from 'react-native-fast-image';
import  LinearGradient  from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const CourseMainScreen = ({ route }) => {
    const { course: shortCourseData } = route.params || {};
    const navigation = useNavigation();
    const [courseData, setCourseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [videoModalVisible, setVideoModalVisible] = useState(false);
    const [purchased, setPurchased] = useState(false);
    const [isFree, setIsFree] = useState(false);
    const [user, setUser] = useState({});
    const [accessYears, setAccessYears] = useState('1');
    const [priceBeforeDiscount, setPriceBeforeDiscount] = useState(0);
    const [priceAfterDiscount, setPriceAfterDiscount] = useState(0);
    const [extras, setExtras] = useState({
        allCoursesDiscount: 0,
        allProductsDiscount: 0,
        deliveryCharges: 0
    });

    const accessOptions = [
        { key: '1', value: '1 Year' },
        { key: '2', value: '2 Years (20% off)' },
        { key: '3', value: '3 Years (30% off)' },
        { key: '4', value: '4 Years (40% off)' }
    ];

    useEffect(() => {
        fetchCourseData();
        getUserFromToken();
        getExtras();
    }, [shortCourseData?._id]);

    useEffect(() => {
        if (courseData && Object.keys(extras).length > 0) {
            calculatePrices();
        }
    }, [accessYears, courseData, extras]);

    const fetchCourseData = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/courseintrobycourseid`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId: shortCourseData._id }),
            });
            const data = await response.json();
            if (response.ok) {
                setCourseData(data.course);
                setIsFree(data.course.courseCategory === 'FREE');
                checkCourseOwnership(data.course);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getUserFromToken = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const response = await fetch(`${BACKEND_URL}/getuserdatafromtoken`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (!data.error) {
                setUser(data.userdata);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    const checkCourseOwnership = async (course) => {
        try {
            const token = await AsyncStorage.getItem("token");
            const response = await fetch(`${BACKEND_URL}/checkCourseOwnership`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ courseId: course._id })
            });
            
            if (response.ok || parseInt(course.coursePrice, 10) === 0) {
                setPurchased(true);
            } else {
                setPurchased(false);
            }
        } catch (err) {
            console.error("Error checking course ownership:", err);
            setPurchased(false);
        }
    };

    const getExtras = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/getExtras`);
            const data = await response.json();
            if (!data.error) {
                setExtras(data.extras);
            }
        } catch (error) {
            console.error("Error fetching extras:", error);
        }
    };

    const calculatePrices = () => {
        let basePrice = parseInt(courseData.coursePrice, 10);
        let years = parseInt(accessYears, 10);
        let calculatedPrice = basePrice * years;
        let discountedPrice = calculatedPrice;

        // Apply multi-year discount
        if (years === 2) discountedPrice *= 0.8;
        if (years === 3) discountedPrice *= 0.7;
        if (years === 4) discountedPrice *= 0.6;

        // Apply additional discounts
        if (extras.allCoursesDiscount > 0) {
            discountedPrice *= (1 - extras.allCoursesDiscount / 100);
        } else if (courseData.courseDiscount > 0) {
            discountedPrice *= (1 - courseData.courseDiscount / 100);
        }

        setPriceBeforeDiscount(Math.round(calculatedPrice));
        setPriceAfterDiscount(Math.round(discountedPrice));
    };

    const handleVideoPlay = () => setVideoModalVisible(true);
    const handleVideoClose = () => setVideoModalVisible(false);

    const openCourse = () => {
        navigation.navigate("CourseSubjectsScreen", { course: courseData });
    };

    const buyCourse = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("token");
            const options = {
                description: `Purchase: ${courseData.courseName}`,
                image: courseData.courseImage,
                currency: 'INR',
                key: RAZORPAY_KEY_ID,
                amount: priceAfterDiscount * 100,
                name: courseData.courseName,
                prefill: {
                    email: user.email,
                    contact: user.phone,
                    name: user.name
                },
                theme: { color: COLOR.col1 }
            };

            const paymentData = await RazorpayCheckout.open(options);
            
            const response = await fetch(`${BACKEND_URL}/buyCourse`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    courseId: courseData._id,
                    amount: priceAfterDiscount,
                    currency: courseData.coursePriceCurrency,
                    razorpay_payment_id: paymentData.razorpay_payment_id,
                    accessYears: accessYears
                })
            });

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }

            Toast.show("Course purchased successfully!", { type: "success" });
            setPurchased(true);
        } catch (error) {
            console.error("Payment error:", error);
            Toast.show(error.message || "Payment failed", { type: "danger" });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLOR.col2} />
            </View>
        );
    }

    if (!courseData) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load course details</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={COLOR.col3} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Course Details</Text>
                <View style={{ width: 28 }} ></View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Course Image with Play Button */}
                {courseData.courseImage !== 'noimage' && (
                    <TouchableOpacity 
                        onPress={handleVideoPlay} 
                        activeOpacity={0.9}
                        style={styles.imageContainer}
                    >
                        <FastImage
                            source={{ uri: courseData.courseImage }}
                            style={styles.courseImage}
                            resizeMode={FastImage.resizeMode.cover}
                        />
                        {courseData.introVideo && (
                            <>
                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.6)']}
                                    style={styles.imageOverlay}
                                />
                                <View style={styles.playButtonContainer}>
                                    <Ionicons name="play-circle" size={60} color="white" />
                                    <Text style={styles.playButtonText}>Watch Intro</Text>
                                </View>
                            </>
                        )}
                    </TouchableOpacity>
                )}

                {/* Course Details */}
                <View style={styles.detailsContainer}>
                    <Text style={styles.courseTitle}>{courseData.courseName}</Text>
                    
                    {courseData.courseDescription && (
                        <Text style={styles.courseDescription}>{courseData.courseDescription}</Text>
                    )}

                    {/* Features List */}
                    <View style={styles.featuresContainer}>
                        <View style={styles.featureItem}>
                            <Ionicons name="time-outline" size={20} color={COLOR.col2} />
                            <Text style={styles.featureText}>Lifetime Access</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="document-text-outline" size={20} color={COLOR.col2} />
                            <Text style={styles.featureText}>100+ Lectures</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="phone-portrait-outline" size={20} color={COLOR.col2} />
                            <Text style={styles.featureText}>Mobile Friendly</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Purchase Section */}
            {!purchased && !isFree && (
                <View style={styles.purchaseContainer}>
                    <Text style={styles.purchaseTitle}>Get Full Access</Text>
                    
                    <SelectList
                        setSelected={setAccessYears}
                        data={accessOptions}
                        save="key"
                        placeholder="Select Access Duration"
                        search={false}
                        boxStyles={styles.selectBox}
                        inputStyles={styles.selectInput}
                        dropdownStyles={styles.selectDropdown}
                        dropdownTextStyles={styles.selectDropdownText}
                    />

                    <View style={styles.priceContainer}>
                        <Text style={styles.finalPrice}>
                            {courseData.coursePriceCurrency === "INR" ? "₹" : "$"} {priceAfterDiscount}
                        </Text>
                        {priceBeforeDiscount > priceAfterDiscount && (
                            <Text style={styles.originalPrice}>
                                {courseData.coursePriceCurrency === "INR" ? "₹" : "$"} {priceBeforeDiscount}
                            </Text>
                        )}
                    </View>

                    <TouchableOpacity 
                        style={styles.buyButton}
                        onPress={buyCourse}
                        disabled={loading}
                    >
                        <Text style={styles.buyButtonText}>
                            {loading ? 'Processing...' : 'Enroll Now'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Access Button for Purchased/Free Courses */}
            {(purchased || isFree) && (
                <TouchableOpacity 
                    style={styles.accessButton}
                    onPress={openCourse}
                >
                    <Text style={styles.accessButtonText}>
                        {isFree ? 'Start Learning' : 'Continue Learning'}
                    </Text>
                </TouchableOpacity>
            )}

            {/* Video Modal */}
            {courseData?.introVideo && (
                <Modal
                    visible={videoModalVisible}
                    transparent={false}
                    animationType="slide"
                    onRequestClose={handleVideoClose}
                >
                    <View style={styles.videoModal}>
                        <Video
                            source={{ uri: courseData.introVideo }}
                            style={styles.videoPlayer}
                            controls={true}
                            resizeMode="contain"
                        />
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={handleVideoClose}
                        >
                            <Ionicons name="close" size={30} color="white" />
                        </TouchableOpacity>
                    </View>
                </Modal>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLOR.col1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: COLOR.col3,
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: COLOR.col1,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: COLOR.col3,
    },
    scrollContent: {
        paddingBottom: 120,
    },
    imageContainer: {
        height: 220,
        borderRadius: 12,
        margin: 16,
        overflow: 'hidden',
        elevation: 4,
    },
    courseImage: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '40%',
    },
    playButtonContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButtonText: {
        color: 'white',
        marginTop: 8,
        fontWeight: '500',
    },
    detailsContainer: {
        paddingHorizontal: 16,
    },
    courseTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: COLOR.col3,
        marginBottom: 12,
    },
    courseDescription: {
        fontSize: 16,
        color: COLOR.col7,
        lineHeight: 24,
        marginBottom: 20,
    },
    featuresContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 16,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLOR.col4 + '20',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    featureText: {
        fontSize: 14,
        color: COLOR.col3,
        marginLeft: 6,
    },
    purchaseContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: 16,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    purchaseTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLOR.col3,
        marginBottom: 12,
    },
    selectBox: {
        borderWidth: 1,
        borderColor: COLOR.col4,
        borderRadius: 10,
        marginBottom: 16,
    },
    selectInput: {
        color: COLOR.col3,
    },
    selectDropdown: {
        borderColor: COLOR.col4,
        marginTop: 4,
    },
    selectDropdownText: {
        color: COLOR.col3,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    finalPrice: {
        fontSize: 24,
        fontWeight: '700',
        color: COLOR.col2,
        marginRight: 12,
    },
    originalPrice: {
        fontSize: 18,
        color: COLOR.col4,
        textDecorationLine: 'line-through',
    },
    buyButton: {
        backgroundColor: COLOR.col2,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buyButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    accessButton: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        backgroundColor: COLOR.col2,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    accessButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    videoModal: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
    },
    videoPlayer: {
        width: '100%',
        height: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 8,
    },
});

export default CourseMainScreen;
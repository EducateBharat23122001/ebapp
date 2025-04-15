import { StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { LoginState } from '../../RecoilState/LoginState';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '@env';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLOR } from '../../Constants';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { ActivityIndicator } from 'react-native';

const AllTestScoresScreen = ({ navigation }) => {
    const [islogin, setIsLogin] = useRecoilState(LoginState);
    const [quizzes, setQuizzes] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date()); // Default to today's date
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [loading, setLoading] = useState(false)
    const getQuizesDatafromToken = async (date) => {
        let token = await AsyncStorage.getItem("token");
        setLoading(true); // Start loader
        try {
            const response = await fetch(`${BACKEND_URL}/getuserquizzes?date=${date.toISOString().split('T')[0]}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setQuizzes(data.quizzes);
            } else {
                console.error("Failed to fetch quizzes:", data.message);
            }
        } catch (error) {
            console.error("Error fetching quizzes:", error);
        } finally {
            setLoading(false); // Stop loader
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            getQuizesDatafromToken(selectedDate); // Fetch quizzes for selected date when page is focused
        });

        return unsubscribe; // Cleanup the listener on unmount
    }, [navigation, selectedDate]);

    const handleConfirm = (date) => {
        setSelectedDate(date);
        setDatePickerVisibility(false);
        getQuizesDatafromToken(date); // Fetch quizzes for the newly selected date
    };

    const renderQuizItem = ({ item }) => {
        const { quizName, score, total, createdAt } = item;

        return (
            <TouchableOpacity style={styles.settingitem}
                onPress={() => {
                    // console.log(item);
                    navigation.navigate('TestScoresScreen', { quiz: item })
                }}

            >
                {/* Quiz Name */}
                <Text style={styles.quizTitle}>{quizName}</Text>

                {/* Quiz Score */}
                <Text style={styles.quizDetails}>
                    Score: {score !== null ? `${score}/${total}` : "Not Attempted"}
                </Text>

                {/* Quiz Date */}
                <Text style={styles.quizDetails}>
                    Date: {new Date(createdAt).toLocaleDateString()}
                </Text>

                {/* Navigation Icon */}
                <MaterialIcons
                    name="keyboard-arrow-right"
                    size={24}
                    color="black"
                    style={styles.settingitemicon}
                />
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.topBarTitle}>Your Test Scores</Text>
            </View>

            {/* Date Picker */}

            <TouchableOpacity onPress={() => setDatePickerVisibility(true)}>
                <View style={styles.dateSelector}>
                    <Text style={styles.dateText}>
                        {selectedDate.toLocaleDateString()}
                    </Text>
                    <MaterialIcons name="calendar-today" size={24} color={COLOR.col1} />
                </View>

            </TouchableOpacity>
            {
                loading && (
                    <ActivityIndicator size={30} color={COLOR.col2} style={{ marginTop: 20 }} />
                )
            }


            {/* FlatList for quizzes */}
            {
                !loading && quizzes.length > 0 && (
                    <FlatList
                        data={quizzes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderQuizItem}
                        contentContainerStyle={{
                            paddingHorizontal: 10,
                            paddingVertical: 20,
                            paddingBottom: 100,
                        }}
                        ListEmptyComponent={
                            <Text style={{ textAlign: 'center', color: COLOR.col3, marginTop: 20 }}>
                                No test scores available.
                            </Text>
                        }
                    />
                )
            }
            {
                !loading && quizzes.length == 0 &&
                <Text style={{
                    textAlign: 'center',
                    marginTop: 20,
                    color: COLOR.col2
                }}>0 quizzes found</Text>
            }


            {/* Date Picker Modal */}
            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                date={selectedDate}
                onConfirm={handleConfirm}
                onCancel={() => setDatePickerVisibility(false)}
            />


        </View>
    );
};

export default AllTestScoresScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    topBar: {
        paddingVertical: 10,
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
    dateSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        backgroundColor: COLOR.col6,
    },
    dateText: {
        color: '#fff',
        fontSize: 16,
        marginRight: 10,
    },
    settingitem: {
        padding: 15,
        margin: 10,
        borderRadius: 10,
        backgroundColor: 'white',
        elevation: 10,
    },
    quizTitle: {
        fontSize: 16,
        fontWeight: '400',
        color: COLOR.col3,
        marginBottom: 5,
    },
    quizDetails: {
        fontSize: 14,
        color: COLOR.col2,
        marginBottom: 5,
    },
    settingitemicon: {
        position: 'absolute',
        right: 10,
        top: 15,
    },
});

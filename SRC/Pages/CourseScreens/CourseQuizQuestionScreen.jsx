import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert, TextInput, CheckBox, Dimensions, ScrollView } from 'react-native';
import { BACKEND_URL } from '@env';
import Pdf from 'react-native-pdf';
import { COLOR } from '../../Constants';
import AntDesign from 'react-native-vector-icons/AntDesign'
import { color } from 'react-native-elements/dist/helpers';
import { Toast } from 'react-native-toast-notifications';

const CourseQuizQuestionScreen = ({ route }) => {
    const { quizData, course, subject, chapter, quizType } = route.params; // Extract quiz data from route props
    const navigation = useNavigation();
    const { height } = Dimensions.get('window');
    const [timeRemaining, setTimeRemaining] = useState({
        hr: Math.floor(quizData.timeLimit / 3600000), // Convert milliseconds to hours
        min: Math.floor((quizData.timeLimit % 3600000) / 60000), // Convert remaining ms to minutes
        sec: Math.floor((quizData.timeLimit % 60000) / 1000), // Convert remaining ms to seconds
    });

    const [quizDataFull, setQuizDataFull] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState(0)

    // GET QUIZ QUESTIONS
    const getQuizQuestionsByQuizId = async () => {
        try {
            let token = await AsyncStorage.getItem("token");
            const response = await fetch(`${BACKEND_URL}/getQuizQuestionsData`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    quizId: quizData._id,
                    quizType: quizType,
                }),
            });

            const data = await response.json();
            // console.log(data);
            if (data.error) {
                console.error("Error fetching quiz data:", data.error);
            }
            else if (data.quizQuestions[`${quizType}QuizQNA`].length == 0) {
                Toast.show('0 Questions available')
                navigation.goBack();
            }
            else {
                setQuizDataFull({
                    ...quizData,
                    quizQuestions: data.quizQuestions[`${quizType}QuizQNA`],
                });


            }
        } catch (error) {
            console.error("Error fetching quiz data:", error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        getQuizQuestionsByQuizId();
    }, [quizData])
    useEffect(() => {

        if (quizDataFull) {
            const timerInterval = setInterval(() => {
                setTimeRemaining((prevTime) => {
                    if (prevTime.hr === 0 && prevTime.min === 0 && prevTime.sec === 0) {
                        clearInterval(timerInterval);
                        if (quizDataFull) {
                            saveSubmission();
                        }

                        return { hr: 0, min: 0, sec: 0 }; // Time is up
                    }
                    let sec = prevTime.sec - 1;
                    let min = prevTime.min;
                    let hr = prevTime.hr;

                    if (sec < 0) {
                        sec = 59;
                        min -= 1;
                    }
                    if (min < 0) {
                        min = 59;
                        hr -= 1;
                    }
                    return { hr, min, sec };
                });
            }, 1000);


            return () => clearInterval(timerInterval);
        }
    }, [quizDataFull]);
    useEffect(() => {
        // console.log('USER ANSWERS ', userAnswers)
        let tempscore = 0;

        // Calculate the score based on user answers
        quizDataFull?.quizQuestions?.forEach(async (question) => {
            const userAnswer = userAnswers[question._id];

            if (userAnswer !== undefined && question.questionAnswer?.length > 0) {
                // console.log('calculating score question ', question.questionAnswer)
                // console.log('calculating score userAnswer ', userAnswers[question._id])

                const checkAnswer = await compareAnswers(userAnswer, question.questionAnswer);
                // console.log("checkAnswer ", checkAnswer)
                if (checkAnswer == true) {
                    tempscore += question.questionMarks
                }
                else if (checkAnswer == false) {
                    tempscore -= question.questionNegativeMarks;
                }


            }
            // console.log('tempscore ', tempscore)
            setScore(tempscore)
        });

    }, [userAnswers])
    const showConfirmation = (message, onConfirm) => {
        Alert.alert(
            "Confirmation",
            message,
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Yes",
                    onPress: onConfirm,
                },
            ],
            { cancelable: true }
        );
    };

    const handleExitQuiz = () => {
        showConfirmation("Are you sure you want to exit the quiz?", () => {
            navigation.goBack();
        });
    };

    const handleSubmitQuiz = () => {

        showConfirmation("Are you sure you want to submit the quiz?", () => {
            saveSubmission();
        });
    };

    const saveSubmission = async () => {
        try {

            const total = await getMaxMarks();


            console.log('Score:', score);
            console.log('Total:', total);

            // Retrieve the token from AsyncStorage
            let token = await AsyncStorage.getItem("token");

            // Log the quiz ID for debugging
            // console.log('Submit Quiz ID:', quizData._id);

            // Make the API request
            const response = await fetch(`${BACKEND_URL}/submitQuiz`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    quizId: quizData._id,
                    quizType: quizType,
                    score: score,
                    total: total,
                    createdAt: new Date(),
                    userAnswers: userAnswers
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // If submission is successful, navigate to the next screen
                console.log('Submission Successful:', data);
                navigation.navigate("CourseQuizSubmitScreen", {
                    score: score,
                    total: total,
                    chapter: chapter,
                    subject: subject,
                    course: course,
                    pdf: quizData.afterSubmissionPdf,
                    quizType: quizType
                });
            } else {
                // Handle API errors
                console.error('Error in response:', data.error);
                Toast.show(data.error, {
                    type: "danger",
                });
            }
        } catch (err) {
            // Catch and log any errors
            console.error("Error in saving submission:", err);
        }
    };



    const handleAnswerChange = (questionId, answer) => {
        setUserAnswers((prev) => ({
            ...prev,
            [questionId]: [answer],
        }));
        console.log(userAnswers)
    };

    const handleAnswerChangeMoreThanOne = async (questionId, answer) => {
        // Get the current state of userAnswers
        const prevAnswers = { ...userAnswers };

        // Get the existing answers for the question or initialize an empty array
        const existingAnswers = prevAnswers[questionId] || [];

        // If the answer is not already in the array, add it
        if (!existingAnswers.includes(answer)) {
            const updatedAnswers = [...existingAnswers, answer].sort(); // Sort after adding

            // Update the state with the modified answers
            setUserAnswers({
                ...prevAnswers,
                [questionId]: updatedAnswers,
            });
        }
    };

    const getMaxMarks = async () => {
        let totalMarks = 0;
        quizDataFull?.quizQuestions?.forEach((question) => {
            totalMarks += question.questionMarks; // Add the marks for each question
        });
        return totalMarks;
    };
    const compareAnswers = async (userAnswer, questionAnswer) => {
        if (userAnswer.length !== questionAnswer.length) {
            return false; // Lengths are not the same, cannot match
        }

        return userAnswer.every(answer => questionAnswer.includes(answer));
    }

    const calculateScore = async () => {
        let score = 0;

        // Calculate the score based on user answers
        quizDataFull?.quizQuestions?.forEach(async (question) => {
            const userAnswer = userAnswers[question._id];
            console.log('calculating score ', question)
            console.log('calculating score userAnswer', userAnswers)

            if (userAnswer !== undefined && question.questionAnswer?.length > 0) {

                const checkAnswer = await compareAnswers(userAnswer, question.questionAnswer);
                checkAnswer
                    ? score += question.questionMarks // Add positive marks for correct answers
                    : score -= question.questionNegativeMarks; // Subtract negative marks for incorrect answers
            }
        });

        return score;
    };

    const handleNext = () => {
        setCurrentQuestionIndex((prevIndex) => Math.min(prevIndex + 1, quizDataFull.quizQuestions.length - 1));
    };

    const handlePrevious = () => {
        setCurrentQuestionIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    };

    if (loading || !quizDataFull) {
        return <Text>Loading...</Text>;
    }

    const currentQuestion = quizDataFull?.quizQuestions.length > 0 ? quizDataFull?.quizQuestions[currentQuestionIndex] : {};
    // console.log(currentQuestion)


    // return (<View></View>)


    return (
        <View style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.exitQuiz} onPress={handleExitQuiz}>
                    <Text style={styles.topBtnText}>Exit</Text>
                </TouchableOpacity>
                <Text style={styles.timer}>
                    {`${timeRemaining.hr.toString().padStart(2, '0')}:${timeRemaining.min
                        .toString()
                        .padStart(2, '0')}:${timeRemaining.sec
                            .toString()
                            .padStart(2, '0')}`}
                </Text>
                <TouchableOpacity style={styles.submitQuiz} onPress={handleSubmitQuiz}>
                    <Text style={styles.topBtnText}>Submit</Text>
                </TouchableOpacity>
            </View>

            {/* Question Display */}
            <ScrollView style={styles.questionContainer}>
                <View style={styles.navButtons}>
                    <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
                        <AntDesign name='leftsquare' size={30} color={COLOR.col3} />
                    </TouchableOpacity>
                    <Text style={styles.questionText}>
                        {currentQuestionIndex + 1}/{quizDataFull.quizQuestions.length}
                    </Text>
                    <TouchableOpacity style={styles.navButton} onPress={handleNext}>
                        <AntDesign name='rightsquare' size={30} color={COLOR.col3} />

                    </TouchableOpacity>
                </View>

                {currentQuestion.questionPdf ? (
                    <View style={[styles.pdfContainer, { height: height * 0.3 }]}>
                        <Pdf
                            source={{ uri: currentQuestion.questionPdf, cache: true }}
                            onLoadComplete={(numberOfPages, filePath) => console.log('PDF loaded')}
                            onError={(error) => {
                                console.error('PDF Error:', error);
                                Toast.show('Error loading PDF', { type: 'danger' });
                            }}
                            style={{ flex: 1 }}
                            trustAllCerts={false}
                        />
                    </View>
                ) : null}

                {currentQuestion.questiionPdf ? (
                    <View style={[styles.pdfContainer, { height: height * 0.3 }]}>
                        <Pdf
                            source={{ uri: currentQuestion.questiionPdf, cache: true }}
                            onLoadComplete={(numberOfPages, filePath) => console.log('PDF loaded')}
                            onError={(error) => {
                                console.error('PDF Error:', error);
                                Toast.show('Error loading PDF', { type: 'danger' });
                            }}
                            style={{ flex: 1 }}
                        />
                    </View>
                ) : null}

                {currentQuestion.questionType === 'MCQ' && currentQuestion.questionOptions.length > 0 && (
                    <View style={styles.optionsContainer}>
                        {currentQuestion.questionOptions.map((option, index) => {
                            const isSelected = userAnswers[currentQuestion._id]?.includes(option);
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.option,
                                        isSelected && styles.selectedOption, // Highlight the selected option
                                    ]}
                                    onPress={() => handleAnswerChange(currentQuestion._id, option)}
                                >
                                    <Text
                                        style={styles.optionText}
                                    >
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
                {currentQuestion.questionType === 'MoreThanOne' && currentQuestion.questionOptions.length > 0 && (
                    <View style={styles.optionsContainer}>
                        {currentQuestion.questionOptions.map((option, index) => {
                            const isSelected = userAnswers[currentQuestion._id]?.includes(option);
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.option,
                                        isSelected && styles.selectedOption, // Highlight the selected option
                                    ]}
                                    onPress={async () => await handleAnswerChangeMoreThanOne(currentQuestion._id, option)}
                                >
                                    <Text
                                        style={styles.optionText}
                                    >
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}


                {currentQuestion.questionType === 'Short Answer' && (
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your answer"
                        placeholderTextColor={'grey'}
                        value={userAnswers[currentQuestion._id] || ''}
                        onChangeText={(text) => handleAnswerChange(currentQuestion._id, text)}
                    />
                )}
            </ScrollView>

            {/* Navigation Buttons */}


        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFF', // Soft blueish background
    },
    // Gradient Header with Shadow
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        shadowColor: '#3D5AFE',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    // Modern Timer with Pulse Animation
    timer: {
        fontSize: 18,
        fontWeight: '800',
        color: COLOR.col3,
        backgroundColor: 'rgba(61, 90, 254, 0.1)',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        overflow: 'hidden',
    },
    // Premium Buttons with Gradient
    submitQuiz: {
        backgroundColor: COLOR.col2,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        shadowColor: COLOR.col2,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    exitQuiz: {
        backgroundColor: '#FF4D4D',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        shadowColor: '#FF4D4D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    topBtnText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    // Question Container with Neumorphism Effect
    questionContainer: {
        padding: 25,
        margin: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        shadowColor: '#3D5AFE',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
    },
    // Modern Typography
    questionText: {
        fontSize: 20,
        fontWeight: '700',
        color: COLOR.col3,
        lineHeight: 28,
        marginBottom: 5,
        letterSpacing: 0.2,
    },
    // PDF Container with Border
    pdfContainer: {
        marginTop: 15,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(61, 90, 254, 0.1)',
        overflow: 'hidden',
    },
    // Options with Interactive States
    optionsContainer: {
        marginTop: 20,
    },
    option: {
        backgroundColor: '#FFFFFF',
        padding: 18,
        marginVertical: 8,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: 'rgba(61, 90, 254, 0.2)',
        shadowColor: '#3D5AFE',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    selectedOption: {
        backgroundColor: COLOR.col2,
        borderColor: COLOR.col2,
        shadowColor: COLOR.col2,
        shadowOpacity: 0.2,
    },
    optionText: {
        fontSize: 16,
        color: COLOR.col4,
        fontWeight: '500',
    },
    // Input Field with Modern Styling
    input: {
        backgroundColor: '#FFFFFF',
        borderColor: 'rgba(61, 90, 254, 0.2)',
        borderWidth: 1.5,
        padding: 15,
        marginTop: 15,
        borderRadius: 12,
        color: COLOR.col3,
        fontSize: 16,
        shadowColor: '#3D5AFE',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 1,
    },
    // Navigation Buttons with Floating Effect
    navButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
    },
    // Score Display with Badge Style
    scoreContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        alignSelf: 'center',
        shadowColor: '#3D5AFE',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    scoreText: {
        fontSize: 18,
        fontWeight: '800',
        color: COLOR.col3,
        textAlign: 'center',
    },
    // Additional Premium Elements
    progressBar: {
        height: 6,
        backgroundColor: 'rgba(61, 90, 254, 0.1)',
        borderRadius: 3,
        marginHorizontal: 20,
        marginTop: 10,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLOR.col2,
        borderRadius: 3,
    },
    questionCounter: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(61, 90, 254, 0.6)',
        textAlign: 'center',
        marginTop: 5,
    },
    // For selected option text
    selectedOptionText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});

export default CourseQuizQuestionScreen;

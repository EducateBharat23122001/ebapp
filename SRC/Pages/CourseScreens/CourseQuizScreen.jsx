import { 
    StyleSheet, 
    Text, 
    View, 
    ActivityIndicator, 
    TouchableOpacity, 
    ScrollView,
    ImageBackground,
    Dimensions 
  } from 'react-native';
  import React, { useEffect, useState } from 'react';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { useNavigation } from '@react-navigation/native';
  import Ionicons from 'react-native-vector-icons/Ionicons';
  import { COLOR } from '../../Constants';
  import { BACKEND_URL } from '@env';
  import LinearGradient from 'react-native-linear-gradient';
  
  const { width } = Dimensions.get('window');
  
  const CourseQuizScreen = ({ route }) => {
    const { course, subject, quiz, chapter, quizType } = route.params;
    const [loading, setLoading] = useState(true);
    const [quizData, setQuizData] = useState(null);
    const [quizTaken, setQuizTaken] = useState(false);
    const navigation = useNavigation();
  
    useEffect(() => {
      const fetchQuizData = async () => {
        try {
          let token = await AsyncStorage.getItem("token");
          const response = await fetch(`${BACKEND_URL}/getQuizStartData`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
              quizId: quiz._id,
              quizType: quizType,
            }),
          });
  
          const data = await response.json();
          if (data.error) {
            console.error("Error fetching quiz data:", data.error);
          } else {
            setQuizData(data.quiz);
          }
        } catch (error) {
          console.error("Error fetching quiz data:", error);
        } finally {
          setLoading(false);
        }
      };
  
      const checkQuizStatus = async () => {
        try {
          let token = await AsyncStorage.getItem("token");
          const response = await fetch(`${BACKEND_URL}/checkquizstatus?quizId=${quiz._id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          });
  
          const data = await response.json();
          setQuizTaken(data.message === "Quiz has been taken");
        } catch (error) {
          console.error("Error checking quiz status:", error);
        }
      };
  
      fetchQuizData();
      checkQuizStatus();
    }, [quiz._id, quizType]);
  
    const handleStartQuiz = () => {
      navigation.navigate('CourseQuizQuestionScreen', { 
        quizData, 
        course, 
        subject, 
        chapter, 
        quizType 
      });
    };
  
    const formatTime = (milliseconds) => {
      const hours = Math.floor(milliseconds / 3600000);
      const minutes = Math.floor((milliseconds % 3600000) / 60000);
      const seconds = Math.floor((milliseconds % 60000) / 1000);
      
      return `${hours > 0 ? `${hours} hr${hours !== 1 ? 's' : ''} ` : ''}${minutes > 0 ? `${minutes} min${minutes !== 1 ? 's' : ''} ` : ''}${seconds} sec${seconds !== 1 ? 's' : ''}`;
    };
  
    if (loading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLOR.col3} />
        </View>
      );
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
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Quiz Details</Text>
        </LinearGradient>
  
        {/* Quiz Card */}
        <View style={styles.quizCard}>
          <LinearGradient
            colors={[COLOR.col3, '#6a4c93']}
            style={styles.quizHeader}
          >
            <Text style={styles.quizName}>{quizData[`${quizType}QuizName`]}</Text>
          </LinearGradient>
  
          {/* Quiz Details */}
          <ScrollView 
            style={styles.detailsContainer}
            contentContainerStyle={styles.detailsContent}
          >
            <View style={styles.detailItem}>
              <Ionicons name="document-text-outline" size={20} color={COLOR.col3} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Quiz Type</Text>
                <Text style={styles.detailValue}>{quizType}</Text>
              </View>
            </View>
  
            {chapter && (
              <View style={styles.detailItem}>
                <Ionicons name="book-outline" size={20} color={COLOR.col3} />
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Chapter</Text>
                  <Text style={styles.detailValue}>{chapter.chapterName}</Text>
                </View>
              </View>
            )}
  
            {subject && (
              <View style={styles.detailItem}>
                <Ionicons name="library-outline" size={20} color={COLOR.col3} />
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Subject</Text>
                  <Text style={styles.detailValue}>{subject.subjectName}</Text>
                </View>
              </View>
            )}
  
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={20} color={COLOR.col3} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Time Limit</Text>
                <Text style={styles.detailValue}>{formatTime(quizData.timeLimit)}</Text>
              </View>
            </View>
  
            {quizTaken && (
              <View style={styles.attemptedNotice}>
                <Ionicons name="information-circle-outline" size={24} color={COLOR.col2} />
                <Text style={styles.attemptedText}>
                  You've already attempted this quiz once, but you can take it again.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
  
        {/* Start Quiz Button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartQuiz}
        >
          <Text style={styles.startButtonText}>Start Quiz</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
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
    quizCard: {
      marginHorizontal: 20,
      marginTop: 20,
      borderRadius: 12,
      backgroundColor: '#fff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      overflow: 'hidden',
      flex: 1,
    },
    quizHeader: {
      padding: 16,
    },
    quizName: {
      fontSize: 20,
      fontWeight: '700',
      color: '#fff',
      textAlign: 'center',
    },
    detailsContainer: {
      flex: 1,
      padding: 16,
    },
    detailsContent: {
      paddingBottom: 20,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    detailTextContainer: {
      marginLeft: 16,
      flex: 1,
    },
    detailLabel: {
      fontSize: 14,
      color: COLOR.col4,
      marginBottom: 4,
    },
    detailValue: {
      fontSize: 16,
      fontWeight: '500',
      color: COLOR.col3,
    },
    attemptedNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFF9E6',
      padding: 16,
      borderRadius: 8,
      marginTop: 20,
    },
    attemptedText: {
      fontSize: 14,
      color: COLOR.col2,
      marginLeft: 12,
      flex: 1,
    },
    startButton: {
      backgroundColor: COLOR.col3,
      borderRadius: 12,
      paddingVertical: 16,
      marginHorizontal: 20,
      marginBottom: 20,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: COLOR.col3,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 3,
      marginTop:10

    },
    startButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      marginRight: 10,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f8f9fa',
    },
  });
  
  export default CourseQuizScreen;
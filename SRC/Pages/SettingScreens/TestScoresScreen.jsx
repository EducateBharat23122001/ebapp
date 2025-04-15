import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Linking, FlatList, ScrollView, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { COLOR } from '../../Constants';
import { BACKEND_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Pdf from 'react-native-pdf';
import Entypo from 'react-native-vector-icons/Entypo'
import AntDesign from 'react-native-vector-icons/AntDesign'
const TestScoresScreen = ({ route }) => {
  const { quiz } = route.params; // Get quizId from route params
  const [quizData, setQuizData] = useState(null); // State to store quiz data
  const [loading, setLoading] = useState(true); // State to handle loading indicator
  const [error, setError] = useState(null); // State to handle errors
  const { height } = Dimensions.get('window');

  const navigation = useNavigation();

  useEffect(() => {
    // Function to fetch quiz data using the quizId
    const fetchQuizData = async () => {
      setError(null);
      const token = await AsyncStorage.getItem('token');
      setLoading(true);
      fetch(`${BACKEND_URL}/getquizbyid?quizId=${quiz.quizId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          const updatedQuizQuestions = data.quizData.quizQuestions.map(question => {
            // console.log('question ', data.userAnswers)
            const userAnswer = data.userAnswers[question._id] || null; // Match user's answer by question ID
            return {
              ...question,
              userAnswer // Add userAnswer to each question object
            };
          });

          // Update quizData with the modified quizQuestions
          const updatedQuizData = {
            ...data.quizData,
            quizQuestions: updatedQuizQuestions
          };

          // Optional: Remove userAnswers if no longer needed
          delete updatedQuizData.userAnswers;

          // Set the modified quizData to state
          setQuizData({ ...data, quizData: updatedQuizData });
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setError('Failed to load quiz data');
          setLoading(false);
        });
    };

    fetchQuizData(); // Call the fetch function on component mount
  }, [quiz]); // Dependency array ensures this effect runs when quizId changes



  const renderQuestion = ({ item, index }) => (
    <View style={styles.questionCard}>
      {item.questionAnswer.length > 0 &&
        <>
          {
            JSON.stringify(item.userAnswer) === JSON.stringify(item.questionAnswer) ? (
              <AntDesign
                name="checkcircle"
                size={30}
                color={"green"}
                style={styles.correct}
              />
            ) : (
              <Entypo
                name="circle-with-cross"
                size={30}
                color={"red"}
                style={styles.incorrect}
              />
            )
          }
        </>
      }
      <Text style={styles.questionTitle}>
        {index + 1}. {item.questionName} ({item.questionType})
      </Text>
      <View style={styles.table}>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>Correct Answer:</Text>
          <Text style={styles.cellValue}>{item.questionAnswer?.length>0 ? item.questionAnswer : 'NA'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>Your Answer:</Text>
          <Text style={styles.cellValue}>{item.userAnswer?.length>0? item.userAnswer : 'NA'}</Text>
        </View>

      </View>
      <View style={styles.table}>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>Subject:</Text>
          <Text style={styles.cellValue}>{item.questionSubject}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>Marks:</Text>
          <Text style={styles.cellValue}>{item.questionMarks}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cellLabel}>Negative Marks:</Text>
          <Text style={styles.cellValue}>{item.questionNegativeMarks}</Text>
        </View>
      </View>
      {item.questionPdf && (

        <TouchableOpacity style={styles.questionPdfrow}
          onPress={() => {
            navigation.navigate('PdfViewerScreen', { pdfUrl: item.questionPdf });
          }}
        >
          <Text style={styles.questionPdfText}>Show question{' '}</Text>
          <Entypo name="eye" size={30} color={COLOR.col1}
          />
        </TouchableOpacity>
      )}
      {item.questiionPdf && (

        <TouchableOpacity style={styles.questionPdfrow}
          onPress={() => {
            navigation.navigate('PdfViewerScreen', { pdfUrl: item.questiionPdf });
          }}
        >
          <Text style={styles.questionPdfText}>Show question{' '}</Text>
          <Entypo name="eye" size={30} color={COLOR.col1}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Quiz Details</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLOR.col3} style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text> // Display error message if fetch fails
      ) : (
        <FlatList
          contentContainerStyle={styles.quizContainer}
          ListHeaderComponent={
            <View style={styles.quizInfo}>
              <View style={styles.table}>
                <View style={styles.row}>
                  <Text style={styles.cellLabel}>Quiz Name:</Text>
                  <Text style={styles.cellValue}>{quizData.quizData.quizName}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.cellLabel}>Quiz Type:</Text>
                  <Text style={styles.cellValue}>{quizData.quizType}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.cellLabel}>Access:</Text>
                  <Text style={styles.cellValue}>{quizData.quizData.access}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.cellLabel}>Time Limit:</Text>
                  <Text style={styles.cellValue}>
                    {Math.floor(quizData.quizData.timeLimit / 60000)} min
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.cellLabel}>Score:</Text>
                  <Text style={styles.cellValue}>
                    {quizData.score !== null ? `${quizData.score}/${quizData.total}` : "Not Attempted"}
                  </Text>
                </View>
                {quizData.quizData.afterSubmissionPdf ? (<TouchableOpacity style={styles.row}
                  onPress={() => {
                    navigation.navigate('PdfViewerScreen', { pdfUrl: quizData.quizData.afterSubmissionPdf });
                  }}
                >
                  <Text style={styles.cellLabel}>Quiz Pdf:</Text>


                  <View style={styles.cellValue}>
                    <Entypo name="eye" size={30} color={COLOR.col2}

                    />
                  </View>


                </TouchableOpacity>
                ) :
                  <View style={styles.row}>
                    <Text style={styles.cellLabel}>Quiz Pdf:</Text>
                    <Text style={styles.cellValue}>Not Provided</Text>
                  </View>
                }

              </View>


            </View>
          }
          data={quizData.quizData.quizQuestions}
          renderItem={renderQuestion}
          keyExtractor={(item) => item._id}
          ListFooterComponent={
            <View style={styles.footer}></View> // Just to ensure the padding is correctly applied
          }
          style={{ paddingBottom: 100 }} // Padding at the bottom
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  loader: {
    marginTop: 20,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    marginTop: 20,
  },
  quizContainer: {
    padding: 16,
  },
  quizInfo: {
    marginBottom: 20,
  },

  table: {
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#f9f9f9',
  },
  cellLabel: {
    flex: 1,
    fontWeight: 'bold',
    color: '#333',
  },
  cellValue: {
    flex: 2,
    color: '#555',
  },

  pdfButton: {
    backgroundColor: COLOR.col3,
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  pdfButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  questionCard: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: COLOR.col3,
    borderRadius: 8,
    backgroundColor: 'white',
    position: 'relative'

  },
  correct: {
    position: 'absolute',
    right: 5,
    top: 5
  },
  incorrect: {
    position: 'absolute',

    right: 5,
    top: 5
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLOR.col3,
    marginBottom: 8,
  },
  questionSubject: {
    fontSize: 14,
    color: COLOR.col2,
    marginBottom: 4,
  },
  questionMarks: {
    fontSize: 14,
    color: COLOR.col2,
    marginBottom: 8,
  },
  footer: {
    paddingBottom: 100, // Additional padding for the footer
  },
  questionPdfrow: {
    backgroundColor: COLOR.col3,
    justifyContent: 'space-between',
    padding: 5,
    paddingHorizontal: 10,
    flexDirection: 'row',
    borderRadius: 5
  },
  questionPdfText: {
    color: 'white'
  }
});

export default TestScoresScreen;

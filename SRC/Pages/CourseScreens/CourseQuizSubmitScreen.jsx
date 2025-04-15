import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import React from 'react';
import { COLOR } from '../../Constants';
import PdfBox from '../../Components/PdfBox';

const CourseQuizSubmitScreen = ({ route, navigation }) => {
    const { score, total, chapter, course, pdf, subject, quizType } = route.params;

    const percent = (score / total) * 100;


    console.log(score, total);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.scoreContainer}>
                <Text style={styles.percentText}>{percent.toFixed(1)}%</Text>
                <Text style={styles.resultText}>
                    {percent >= 50 ? 'Congratulations!' : 'Better Luck Next Time!'}
                </Text>
                <Text style={styles.scoreText}>
                    You Scored: {score} / {total}
                </Text>
            </View>

            {pdf && (
                <View style={styles.pdfContainer}>
                    <PdfBox pdfUrl={pdf} />
                </View>
            )}

            <TouchableOpacity
                style={styles.exitButton}
                onPress={() => {
                    if (quizType == 'chapter') {
                        navigation.navigate('CourseChapterScreen', { chapter: chapter, course: course, subject: subject })
                    }
                    else if (quizType == 'subject') {
                        navigation.navigate('CourseInsideSubjectScreen', {
                            course: {
                                courseId: course._id,
                                courseName: course.courseName,
                                selectedSubject: subject,
                            },
                        })
                    }
                    else {
                        navigation.navigate("CourseSubjectsScreen", { course: course })

                    }
                }
                }
            >
                <Text style={styles.exitButtonText}>Exit</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default CourseQuizSubmitScreen;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLOR.col1,
    },
    scoreContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
        paddingVertical: 20,
        borderRadius: 10,
        backgroundColor: COLOR.col3,
        elevation: 5,
    },
    percentText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: COLOR.col6,
    },
    resultText: {
        fontSize: 20,
        fontWeight: '600',
        color: COLOR.col4,
        marginVertical: 10,
    },
    scoreText: {
        fontSize: 18,
        fontWeight: '500',
        color: COLOR.col1,
    },
    pdfContainer: {
        width: '100%',
        height: Dimensions.get('window').height * 0.4,
        marginVertical: 20,
    },
    exitButton: {
        width: '80%',
        paddingVertical: 12,
        backgroundColor: COLOR.col3,
        borderRadius: 8,
        alignItems: 'center',
        elevation: 4,
    },
    exitButtonText: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
    },
});

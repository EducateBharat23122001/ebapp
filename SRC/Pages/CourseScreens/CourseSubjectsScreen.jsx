import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, ScrollView, Dimensions, ImageBackground } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Image } from 'react-native-elements';
import { COLOR } from '../../Constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { BACKEND_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Toast } from 'react-native-toast-notifications';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const CourseSubjectsScreen = ({ route }) => {
  const navigation = useNavigation();
  const [isDemo, setIsDemo] = useState(null);

  const { course } = route.params;

  const [thiscourse, setThisCourse] = useState({
    ...course,
  });

  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Subjects'); // Tab toggle state

  const fetchCourseQnaData = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/courseqnabycourseid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course._id }),
      });
      const data = await response.json();
      if (response.ok) {
        setThisCourse({
          ...thiscourse,
          ...data.course,
        });
      } else {
        console.error('Failed to fetch course data:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const [user, setUser] = React.useState({})

  React.useEffect(() => {
    getUserFromToken()
    checkCourseOwnership()
  }, [])

  const getUserFromToken = async () => {
    let token = await AsyncStorage.getItem("token")
    fetch(BACKEND_URL + "/getuserdatafromtoken", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }

    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          Toast.show(data.error, {
            type: "danger",
          });

        }
        else {
          setUser(data.userdata)

        
        }
      })
  }

  const checkCourseOwnership = async () => {
    try {
      // Retrieve token from storage
      let token = await AsyncStorage.getItem("token");

      // Make the API call
      const response = await fetch(BACKEND_URL + "/checkCourseOwnership", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ courseId:course._id }) // Include courseId in the request body
      });

      // Parse the response
      const data = await response.json();

      // Handle the response based on the status
      if (response.ok) {
        setIsDemo(false);
        // Add any additional logic for course ownership confirmation
      }
      else if (parseInt(course.coursePrice, 10) == 0) {
        setIsDemo(false);
      }
      else {
        setIsDemo(true);
        // not purchased
      }
    } catch (err) {
      // Handle any unexpected errors
      console.error("Error in checkCourseOwnership:", err.message);
    }
  };

  useEffect(() => {
    fetchCourseQnaData();
  }, [course._id]);



  const openQuiz = (quiz) => {
    const courseData = { courseId: thiscourse._id, courseName: thiscourse.courseName };



    if (quiz.access != 'PAID' || isDemo == false) {
      navigation.navigate('CourseQuizScreen', {
        course: courseData, quiz, quizType: 'course'
      });
    }
    else {
      Toast.show('Please purchase this course to unlock the quiz')
    }
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
        
        <Text style={styles.headerTitle}>Course Content</Text>
      </LinearGradient>

      {/* Course Card */}
      <View style={styles.courseCard}>
        {course.courseImage ? (
          <ImageBackground 
            source={{ uri: course.courseImage }} 
            style={styles.courseImage}
            imageStyle={styles.courseImageStyle}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)']}
              style={styles.imageOverlay}
            />
            <Text style={styles.courseName}>{course.courseName}</Text>
          </ImageBackground>
        ) : (
          <View style={[styles.courseImage, styles.courseImagePlaceholder]}>
            <Text style={styles.courseName}>{course.courseName}</Text>
          </View>
        )}
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab, 
            selectedTab === 'Subjects' && styles.activeTab,
            selectedTab === 'Subjects' && styles.activeTabLeft
          ]}
          onPress={() => setSelectedTab('Subjects')}
        >
          <Text style={[styles.tabText, selectedTab === 'Subjects' && styles.activeTabText]}>
            Subjects
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab, 
            selectedTab === 'Quizzes' && styles.activeTab,
            selectedTab === 'Quizzes' && styles.activeTabRight
          ]}
          onPress={() => setSelectedTab('Quizzes')}
        >
          <Text style={[styles.tabText, selectedTab === 'Quizzes' && styles.activeTabText]}>
            Quizzes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {loading ? (
          <ActivityIndicator size="large" color={COLOR.col3} style={styles.loader} />
        ) : selectedTab === 'Subjects' ? (
          thiscourse?.courseSubjects?.length > 0 ? (
            <View style={styles.listContainer}>
              {thiscourse.courseSubjects.map((subject, index) => (
                <TouchableOpacity
                  key={subject._id}
                  style={[
                    styles.itemCard,
                    index === 0 && styles.firstItem,
                    index === thiscourse.courseSubjects.length - 1 && styles.lastItem
                  ]}
                  onPress={() =>
                    navigation.navigate('CourseInsideSubjectScreen', {
                      course: {
                        courseId: course._id,
                        courseName: course.courseName,
                        selectedSubject: subject,
                      },
                    })
                  }
                >
                  <View style={styles.itemContent}>
                    <View style={styles.itemTextContainer}>
                      <Text style={styles.itemTitle} numberOfLines={1}>
                        {subject.subjectName}
                      </Text>
                    </View>
                    <AntDesign 
                      name="right" 
                      size={18} 
                      color={COLOR.col4} 
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={50} color={COLOR.col4} />
              <Text style={styles.emptyText}>No Subjects Available</Text>
            </View>
          )
        ) : thiscourse?.courseQuizzes?.length > 0 ? (
          <View style={styles.listContainer}>
            {thiscourse.courseQuizzes.map((quiz, index) => (
              <TouchableOpacity
                key={quiz._id}
                style={[
                  styles.itemCard,
                  index === 0 && styles.firstItem,
                  index === thiscourse.courseQuizzes.length - 1 && styles.lastItem
                ]}
                onPress={() => openQuiz(quiz)}
              >
                <View style={styles.itemContent}>
                  <View style={styles.itemTextContainer}>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {quiz.courseQuizName}
                    </Text>
                    {isDemo && quiz.access === "PAID" && (
                      <View style={styles.premiumBadge}>
                        <Text style={styles.premiumText}>Premium</Text>
                      </View>
                    )}
                  </View>
                  {isDemo && quiz.access === "PAID" ? (
                    <View style={styles.lockedIcon}>
                      <Ionicons name="lock-closed" size={20} color={COLOR.col3} />
                    </View>
                  ) : (
                    <View style={styles.unlockedIcon}>
                       <AntDesign 
                      name="right" 
                      size={18} 
                      color={COLOR.col1} 
                    />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="help-circle-outline" size={50} color={COLOR.col4} />
            <Text style={styles.emptyText}>No Quizzes Available</Text>
          </View>
        )}
      </ScrollView>
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
  courseCard: {
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
    zIndex: 2,
  },
  courseImage: {
    height: 120,
    justifyContent: 'flex-end',
    padding: 16,
  },
  courseImageStyle: {
    borderRadius: 12,
  },
  courseImagePlaceholder: {
    backgroundColor: COLOR.col3,
    justifyContent: 'flex-end',
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '70%',
  },
  courseName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLOR.col3,
  },
  activeTabLeft: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  activeTabRight: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLOR.col4,
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    marginTop: 15,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  loader: {
    marginTop: 40,
  },
  listContainer: {
    marginHorizontal: 20,
  },
  itemCard: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  firstItem: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  lastItem: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomWidth: 0,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLOR.col3,
    marginRight: 10,
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8B7500',
  },
  lockedIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockedIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLOR.col3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLOR.col4,
    marginTop: 15,
  },
});

export default CourseSubjectsScreen;
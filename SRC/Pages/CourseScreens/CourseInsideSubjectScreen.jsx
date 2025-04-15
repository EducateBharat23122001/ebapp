import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { COLOR } from '../../Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from "@env";
import { Toast } from 'react-native-toast-notifications';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const CourseInsideSubjectScreen = ({ route }) => {
  const navigation = useNavigation();

  const { courseName, selectedSubject, courseId, coursePrice } = route.params?.course || {};

  const [isDemo, setIsDemo] = useState(null);
  const [selectedTab, setSelectedTab] = useState('Chapters'); // Tab toggle state
  const [chapters, setChapters] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  const [loading, setLoading] = useState(false);


  const [user, setUser] = React.useState({})

  React.useEffect(() => {
    checkCourseOwnership()
    getUserFromToken()
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
        body: JSON.stringify({ courseId }) // Include courseId in the request body
      });

      // Parse the response
      const data = await response.json();

      // Handle the response based on the status
      if (response.ok) {
        setIsDemo(false);
        // Add any additional logic for course ownership confirmation
      }
      else if (parseInt(coursePrice, 10) == 0) {
        setIsDemo(false);
      }
      else {
        setIsDemo(true);
        // not purchased
      }
    } catch (err) {
      setIsDemo(true);

      // Handle any unexpected errors
      console.error("Error in checkCourseOwnership:", err.message);
    }
  };
  const getChaptersAndQuizzesOfSubject = async () => {

    try {
      setLoading(true);
      let token = await AsyncStorage.getItem("token");
      const response = await fetch(BACKEND_URL + "/getChaptersAndQuizesBySubjectId", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          subjectId: selectedSubject._id
        })
      });

      const data = await response.json();
      if (data.error) {
        Toast.show(data.error, { type: "danger" });
      } else {
        setChapters(data.subject.subjectChapters);
        setQuizzes(data.subject.subjectQuizzes);
      }
    } catch (error) {
      Toast.show("Failed to load data", { type: "danger" });
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    getChaptersAndQuizzesOfSubject();
  }, [selectedSubject._id]);


  const openChapter = (chapter) => {
    const course = { courseId, courseName };
    const subject = selectedSubject;

    navigation.navigate('CourseChapterScreen', { course, subject, chapter });
  }

  const openQuiz = (quiz) => {
    const course = { courseId, courseName };
    const subject = selectedSubject;


    if (quiz.access != 'PAID' || isDemo == false) {
      navigation.navigate('CourseQuizScreen', {
        course, subject, quiz, quizType: 'subject'
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
        
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {selectedSubject.subjectName}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {courseName}
          </Text>
        </View>
      </LinearGradient>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab, 
            selectedTab === 'Chapters' && styles.activeTab,
            selectedTab === 'Chapters' && styles.activeTabLeft
          ]}
          onPress={() => setSelectedTab('Chapters')}
        >
          <Text style={[styles.tabText, selectedTab === 'Chapters' && styles.activeTabText]}>
            Chapters
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
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLOR.col3} />
        </View>
      ) : (
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          {selectedTab === 'Chapters' ? (
            chapters.length > 0 ? (
              <View style={styles.listContainer}>
                {chapters.map((chapter, index) => (
                  <TouchableOpacity
                    key={chapter._id}
                    style={[
                      styles.itemCard,
                      index === 0 && styles.firstItem,
                      index === chapters.length - 1 && styles.lastItem
                    ]}
                    onPress={() => openChapter(chapter)}
                  >
                    <View style={styles.itemContent}>
                      <View style={styles.itemTextContainer}>
                        <Text style={styles.itemTitle} numberOfLines={1}>
                          {chapter.chapterName.trim()}
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
                <Text style={styles.emptyText}>No Chapters Available</Text>
              </View>
            )
          ) : quizzes.length > 0 ? (
            <View style={styles.listContainer}>
              {quizzes.map((quiz, index) => (
                <TouchableOpacity
                  key={quiz._id}
                  style={[
                    styles.itemCard,
                    index === 0 && styles.firstItem,
                    index === quizzes.length - 1 && styles.lastItem
                  ]}
                  onPress={() => openQuiz(quiz)}
                >
                  <View style={styles.itemContent}>
                    <View style={styles.itemTextContainer}>
                      <Text style={styles.itemTitle} numberOfLines={1}>
                        {quiz.subjectQuizName}
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
                        <Ionicons name="eye" size={20} color={COLOR.col1} />
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
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

export default CourseInsideSubjectScreen;
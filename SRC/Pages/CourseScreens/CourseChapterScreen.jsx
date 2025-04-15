import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, ImageBackground, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Entypo from 'react-native-vector-icons/Entypo';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { COLOR } from '../../Constants';
import { Toast } from 'react-native-toast-notifications';
import { BACKEND_URL } from "@env";
import { ScrollView } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const CourseChapterScreen = ({ route }) => {
  const { course, subject, chapter } = route.params;
  const [isDemo, setIsDemo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const [thisChapter, setThisChapter] = useState(null);


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
        body: JSON.stringify({ courseId: course.courseId }) // Include courseId in the request body
      });

      // Parse the response
      const data = await response.json();
      // console.log(course)
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

  const getChapterData = async (chapter) => {
    const token = await AsyncStorage.getItem('token');
    fetch(BACKEND_URL + '/getChapterById', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify({ chapterId: chapter?._id })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          Toast.show(data.error, {
            type: 'danger',
            duration: 1000
          });
        } else {
          setThisChapter(data.chapter);
        }
      });
  };

  useEffect(() => {
    getChapterData(chapter);
  }, [chapter]);


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
            {chapter.chapterName}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {course.courseName} • {subject.subjectName}
          </Text>
        </View>
      </LinearGradient>

      {thisChapter ? (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Videos Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Entypo name="video" size={24} color={COLOR.col3} />
              <Text style={styles.sectionHeaderText}>Lectures</Text>
            </View>

            {thisChapter.chapterVideos.length > 0 ? (
              thisChapter.chapterVideos.map((video, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.itemCard,
                    index === 0 && styles.firstItem,
                    index === thisChapter.chapterVideos.length - 1 && styles.lastItem
                  ]}
                  onPress={() => {
                    (isDemo == false || video.access == 'FREE') &&
                      navigation.navigate('VideoPlayerScreen', { videoUrl: video.videoUrl });
                  }}
                >
                  <View style={styles.itemContent}>
                    <View style={styles.itemTextContainer}>
                      <Text style={styles.itemTitle} numberOfLines={1}>
                        {video.videoName}
                      </Text>
                      {isDemo && video.access == 'PAID' && (
                        <View style={styles.premiumBadge}>
                          <Text style={styles.premiumText}>Premium</Text>
                        </View>
                      )}
                    </View>
                    {isDemo && video.access == 'PAID' ? (
                      <View style={styles.lockedIcon}>
                        <Ionicons name="lock-closed" size={20} color={COLOR.col3} />
                      </View>
                    ) : (
                      <View style={styles.unlockedIcon}>
                        <Entypo name="controller-play" size={20} color={COLOR.col1} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptySection}>
                <Text style={styles.emptyText}>No lectures available</Text>
              </View>
            )}
          </View>

          {/* Notes Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <SimpleLineIcons name="notebook" size={24} color={COLOR.col3} />
              <Text style={styles.sectionHeaderText}>Notes</Text>
            </View>

            {thisChapter.chapterNotes.length > 0 ? (
              thisChapter.chapterNotes.map((note, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.itemCard,
                    index === 0 && styles.firstItem,
                    index === thisChapter.chapterNotes.length - 1 && styles.lastItem
                  ]}
                  onPress={() => {
                    (isDemo == false || note.access == 'FREE') &&
                      navigation.navigate('PdfViewerScreen', { pdfUrl: note.notesUrl });
                  }}
                >
                  <View style={styles.itemContent}>
                    <View style={styles.itemTextContainer}>
                      <Text style={styles.itemTitle} numberOfLines={1}>
                        {note.notesName}
                      </Text>
                      {isDemo && note.access == 'PAID' && (
                        <View style={styles.premiumBadge}>
                          <Text style={styles.premiumText}>Premium</Text>
                        </View>
                      )}
                    </View>
                    {isDemo && note.access == 'PAID' ? (
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
              ))
            ) : (
              <View style={styles.emptySection}>
                <Text style={styles.emptyText}>No notes available</Text>
              </View>
            )}
          </View>

          {/* Quizzes Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AntDesign name="rocket1" size={24} color={COLOR.col3} />
              <Text style={styles.sectionHeaderText}>Quizzes</Text>
            </View>

            {thisChapter.chapterQuizzes.length > 0 ? (
              thisChapter.chapterQuizzes.map((quiz, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.itemCard,
                    index === 0 && styles.firstItem,
                    index === thisChapter.chapterQuizzes.length - 1 && styles.lastItem
                  ]}
                  onPress={() => {
                    (isDemo == false || quiz.access == 'FREE') &&
                      navigation.navigate('CourseQuizScreen', {
                        subject: subject,
                        chapter: chapter,
                        course: course,
                        quiz: quiz,
                        quizType: 'chapter'
                      });
                  }}
                >
                  <View style={styles.itemContent}>
                    <View style={styles.itemTextContainer}>
                      <Text style={styles.itemTitle} numberOfLines={1}>
                        {quiz.chapterQuizName}
                      </Text>
                      {isDemo && quiz.access == 'PAID' && (
                        <View style={styles.premiumBadge}>
                          <Text style={styles.premiumText}>Premium</Text>
                        </View>
                      )}
                    </View>
                    {isDemo && quiz.access == 'PAID' ? (
                      <View style={styles.lockedIcon}>
                        <Ionicons name="lock-closed" size={20} color={COLOR.col3} />
                      </View>
                    ) : (
                      <View style={styles.unlockedIcon}>
                        <AntDesign name="rocket1" size={20} color={COLOR.col1} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptySection}>
                <Text style={styles.emptyText}>No quizzes available</Text>
              </View>
            )}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLOR.col3} />
          <Text style={styles.loadingText}>Loading chapter details...</Text>
        </View>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  section: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLOR.col3,
    marginLeft: 10,
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
  emptySection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLOR.col4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLOR.col3,
    marginTop: 15,
  },
});

export default CourseChapterScreen;
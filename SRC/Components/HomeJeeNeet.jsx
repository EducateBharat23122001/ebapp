import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLOR } from '../Constants';
import { BACKEND_URL } from '@env';

const { width } = Dimensions.get('window');

const HomeJeeNeet = () => {
  const navigation = useNavigation();
  const [courseList, setCourseList] = useState([]);

  const fetchLimitedCourses = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/getSomeCourses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ limit: 3 }),
      });
      const result = await response.json();
      setCourseList(result.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  useEffect(() => {
    fetchLimitedCourses();
  }, []);

  const navigateToCourse = (selectedCourse) => {
    navigation.navigate('CourseMainScreen', { course: selectedCourse });
  };

  const renderCourseCard = ({ item }) => {
    const scaleAnim = new Animated.Value(1);

    const onPressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
      }).start();
    };

    const onPressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={() => navigateToCourse(item)}
          style={styles.courseCard}
          activeOpacity={0.9}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          {item.courseImage !== 'noimage' ? (
            <Image source={{ uri: item.courseImage }} style={styles.courseImage} />
          ) : (
            <View style={[styles.courseImage, styles.noImage]} />
          )}
          <View style={styles.courseContent}>
            <Text style={styles.courseTitle} numberOfLines={2}>
              {item.courseName}
            </Text>
            {parseInt(item.coursePrice, 10) === 0 && (
              <Text style={styles.freeTag}>FREE</Text>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>✨ Top JEE & NEET Courses</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CourseScreen')}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={courseList}
        renderItem={renderCourseCard}
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={styles.cardList}
      />
    </View>
  );
};

export default HomeJeeNeet;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: COLOR.col1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLOR.col2,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
    color: COLOR.col6,
    textDecorationLine: 'underline',
  },
  cardList: {
    paddingVertical: 8,
  },
  courseCard: {
    width: width * 0.65,
    backgroundColor: '#fff',
    borderRadius: 18,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
    overflow: 'hidden',
  },
  courseImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  noImage: {
    backgroundColor: COLOR.col4,
  },
  courseContent: {
    padding: 14,
    backgroundColor: '#fff',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLOR.col7,
    marginBottom: 6,
  },
  freeTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#4CAF50',
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
});

import React, { useRef, useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');

const CarouselComponent = ({ data, onPressItem }) => {
  const scrollViewRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % data.length);
      scrollViewRef.current.scrollTo({ x: width * currentIndex, animated: true });
    }, 4000);

    return () => clearInterval(interval);
  }, [currentIndex, data.length]);

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={(event) => {
        setCurrentIndex(Math.floor(event.nativeEvent.contentOffset.x / width));
      }}
    >
      {data.map((item, index) => (
        <TouchableOpacity key={index} onPress={() => onPressItem(item)}>
          <Image source={{ uri: item.imgUrl }} style={styles.image} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default CarouselComponent;

const styles = StyleSheet.create({
  image: {
    width: width,
    height: 200,
    resizeMode: 'cover',
  },
});

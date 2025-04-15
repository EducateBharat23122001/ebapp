import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLOR } from '../../Constants';
import { BACKEND_URL } from "@env"
import VideoPlayer from 'react-native-video-player';
const VideoPlayerScreen = ({ navigation, route }) => {
  const { videoUrl } = route.params
  // http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
  console.log(videoUrl)
  return (
    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'black' }}>
      <View style={styles.topbar}>
        <Ionicons name="return-up-back-outline" size={30} style={styles.backbtn}
          onPress={() => navigation.goBack()}

        />
      </View>
      <VideoPlayer
        source={{ uri: videoUrl }}
        autoplay    
      />
    </View>
    // <View
    //   style={{
    //     flex: 1,
    //     backgroundColor: 'black',

    //   }}
    // >
    //   <View style={styles.topbar}>
    //     <Ionicons name="return-up-back-outline" size={30} style={styles.backbtn}
    //       onPress={() => navigation.goBack()}

    //     />
    //   </View>
    //   <Video
    //     source={{ uri: videoUrl }}
    //     style={{
    //       flex: 1,
    //     }}
    //     controls={true}
    //     resizeMode="contain"
    //     paused={false}
    //     onBuffer={this.onBuffer}
    //     fullscreen={true}

    //   />
    // </View>
  )
}

export default VideoPlayerScreen

const styles = StyleSheet.create({
  topbar: {

    height: 50,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    zIndex: 1,
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: COLOR.col3,
    borderRadius: 20
  },
  backbtn: {
    color: COLOR.col1,
    margin: 10,

  },
})
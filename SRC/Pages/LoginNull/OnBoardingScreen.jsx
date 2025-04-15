import { StyleSheet, Text, View ,ActivityIndicator} from 'react-native'
import React, { useState } from 'react'
// import LottieView from "lottie-react-native"
import onboardimg from '../../Assets/OnBoarding/onboardimage.jpeg'
import { Image } from 'react-native-elements';
import { COLOR } from '../../Constants';
const OnBoardingScreen = ({ navigation, route }) => {
    const [loading, setLoading] = useState(true);

    //  go to login after 5 seconds
    // setTimeout(() => {
    //     navigation.navigate("loginscreen")
    // }, 2000);

    return (

        <View style={{ width: '100%', height: '100%' }}>
            <Image source={onboardimg} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
            <ActivityIndicator size={100} color={COLOR.col1} style={{ position: 'absolute', alignSelf: 'center', bottom: '10%' }} animating={loading} />
        </View>

    )
}

export default OnBoardingScreen

const styles = StyleSheet.create({})
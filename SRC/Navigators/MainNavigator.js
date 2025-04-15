import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { LoginState } from '../RecoilState/LoginState'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import OnBoardingScreen from '../Pages/LoginNull/OnBoardingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from '../Pages/LoginFalse/LoginScreen';
import SignupScreen from '../Pages/LoginFalse/SignupScreen';
import CheckOtpSignup from '../Pages/LoginFalse/CheckOtpSignup';
import ForgotPasswordScreen from '../Pages/LoginFalse/ForgotPasswordScreen';
import CheckOtpForgotPassword from '../Pages/LoginFalse/CheckOtpForgotPassword';
import BottomNavigator from './BottomNavigator';
import CourseMainScreen from '../Pages/CourseScreens/CourseMainScreen';
import CourseSubjectsScreen from '../Pages/CourseScreens/CourseSubjectsScreen';
import CourseInsideSubjectScreen from '../Pages/CourseScreens/CourseInsideSubjectScreen';
import CourseChapterScreen from '../Pages/CourseScreens/CourseChapterScreen';
import CourseQuizScreen from '../Pages/CourseScreens/CourseQuizScreen';
import VideoPlayerScreen from '../Pages/CourseScreens/VideoPlayerScreen';
import PdfViewerScreen from '../Pages/CourseScreens/PdfViewerScreen';
import ProductScreen from '../Pages/StoreScreens/ProductScreen';
import CartScreen from '../Pages/StoreScreens/CartScreen';
import CourseQuizQuestionScreen from '../Pages/CourseScreens/CourseQuizQuestionScreen';
import CourseQuizSubmitScreen from '../Pages/CourseScreens/CourseQuizSubmitScreen';

const MainNavigator = () => {

  const [islogin, setIsLogin] = useRecoilState(LoginState)
  const Stack = createNativeStackNavigator()


  const checkLogin = async () => {
    let loginToken = await AsyncStorage.getItem('token')
    // console.log(loginToken)
    if (loginToken != null) {
      // Alert("Login")
      setIsLogin(true)
    }
    else {
      setIsLogin(false)
    }
  }
  useEffect(() => {
    checkLogin()
  }, [])

  return (
    <NavigationContainer>
      {
        islogin == null &&
        <Stack.Navigator screenOptions={{
          headerShown: false
        }}>
          <Stack.Screen name="OnBoardingScreen" component={OnBoardingScreen} />
        </Stack.Navigator>

      }



      {
        islogin == false &&
        <Stack.Navigator screenOptions={{
          headerShown: false
        }}>

          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="SignupScreen" component={SignupScreen} />
          <Stack.Screen name="CheckOtpSignup" component={CheckOtpSignup} />


          <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
          <Stack.Screen name="CheckOtpForgotPassword" component={CheckOtpForgotPassword} />


        </Stack.Navigator>

      }


      {
        islogin == true &&
        <Stack.Navigator screenOptions={{
          headerShown: false
        }}>
          <Stack.Screen name="BottomNavigator" component={BottomNavigator} />
          <Stack.Screen name="CourseMainScreen" component={CourseMainScreen} />
          <Stack.Screen name="CourseSubjectsScreen" component={CourseSubjectsScreen} />
          <Stack.Screen name="CourseInsideSubjectScreen" component={CourseInsideSubjectScreen} />
          <Stack.Screen name="CourseChapterScreen" component={CourseChapterScreen} />
          <Stack.Screen name="VideoPlayerScreen" component={VideoPlayerScreen} />
          <Stack.Screen name="PdfViewerScreen" component={PdfViewerScreen} />


          {/* QUIZ */}
          <Stack.Screen name="CourseQuizScreen" component={CourseQuizScreen} />
          <Stack.Screen name="CourseQuizQuestionScreen" component={CourseQuizQuestionScreen} />
          <Stack.Screen name="CourseQuizSubmitScreen" component={CourseQuizSubmitScreen} />

          {/* PRODUCT */}
          <Stack.Screen name="ProductScreen" component={ProductScreen} />
          <Stack.Screen name="CartScreen" component={CartScreen} />

        </Stack.Navigator>
      }
    </NavigationContainer>
  )
}

export default MainNavigator

const styles = StyleSheet.create({})
import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import MainNavigator from './SRC/Navigators/MainNavigator'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { RecoilRoot } from 'recoil'
import { ToastProvider } from 'react-native-toast-notifications'


const App = () => {


  return (
    <RecoilRoot>
      <ToastProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <MainNavigator />
        </GestureHandlerRootView>
      </ToastProvider>
    </RecoilRoot>

  )
}

export default App

const styles = StyleSheet.create({})
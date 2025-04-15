import { StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import React from 'react'
import { COLOR } from '../Constants'
import { Dimensions } from 'react-native';

const FullScreenLoader = () => {
  let SCEEN_HEIGHT = Dimensions.get('window').height;
  let SCEEN_WIDTH = Dimensions.get('window').width;
  return (
    <View
      style={{
        width: SCEEN_WIDTH,
        height: 200,
        backgroundColor:'black',
        justifyContent:'center',
        alignItems:'center'
      }}
    >
      <ActivityIndicator size="large" color={COLOR.col3} />
    </View>
  )
}

export default FullScreenLoader

const styles = StyleSheet.create({})
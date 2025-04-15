import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Pdf from 'react-native-pdf';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLOR } from '../../Constants';
import {BACKEND_URL1} from "@env"

const PdfViewerScreen = ({ navigation , route}) => {
  const {pdfUrl} = route.params
  // https://www.africau.edu/images/default/sample.pdf

  const pdfuri = pdfUrl
  // console.log(pdfuri)
  return (

    <View style={{ flex: 1 }}>

      <View style={styles.topbar}>
        <Ionicons name="return-up-back-outline" size={30} style={styles.backbtn}
          onPress={() => navigation.goBack()}
        />
      </View>

      <View style={{height: 50}}></View>
      <Pdf

        trustAllCerts={false}
        source={{
          uri: pdfuri,
          cache: true,
        }}
        // onLoadComplete={(numberOfPages, filePath) => {
        //   console.log(`Number of pages: ${numberOfPages}`);
        // }}
        // onPageChanged={(page, numberOfPages) => {
        //   console.log(`Current page: ${page}`);
        // }}
        // onError={error => {
        //   console.log(error);
        // }}
        // onPressLink={uri => {
        //   console.log(`Link pressed: ${uri}`);
        // }}
        style={styles.pdf}
      />
    </View>
  )
}

export default PdfViewerScreen

const styles = StyleSheet.create({
  pdf: {
    flex: 1,
  },
  topbar: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    zIndex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    elevation: 10
  },
  backbtn: {
    color: COLOR.col3,
    margin: 10
  },
})
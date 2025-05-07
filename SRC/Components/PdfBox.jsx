import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Pdf from 'react-native-pdf';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLOR } from '../Constants';
import {BACKEND_URL1} from "@env"

const PdfBox = ({pdfUrl}) => {
 
  const pdfuri = pdfUrl
  console.log(pdfuri)
  return (
      <Pdf

        trustAllCerts={false}
        source={{
          uri: pdfuri,
          cache: true,
        }}
        onLoadComplete={(numberOfPages, filePath) => {
          console.log(`Number of pages: ${numberOfPages}`);
        }}
        onPageChanged={(page, numberOfPages) => {
          console.log(`Current page: ${page}`);
        }}
        onError={error => {
          console.log(error);
        }}
        onPressLink={uri => {
          console.log(`Link pressed: ${uri}`);
        }}
        style={styles.pdf}
      />
  )
}

export default PdfBox

const styles = StyleSheet.create({
  pdf: {
    flex: 1,
  },


})

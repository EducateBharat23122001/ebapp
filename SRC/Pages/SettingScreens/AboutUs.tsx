import { Linking, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { COLOR } from '../../Constants'
import ownerPic from '../../Assets/AMIT_MAURYA.jpeg'
import { Image } from 'react-native-elements'
import { Dimensions } from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'
const { width, height } = Dimensions.get('window')
import { SocialIcon, Icon } from 'react-native-elements'

const AboutUs = ({ navigation }) => {
  return (
    <View style={styles.full}>
      <View style={styles.header}>
        <AntDesign name="back" size={30} color={COLOR.col1} style={{ marginTop: 0, marginLeft: 0 }}
          onPress={() => navigation.goBack()}
        />
        <Text style={{
          fontSize: 20, fontWeight: '400', color: COLOR.col1,
          marginTop: 0, marginBottom: 0, paddingHorizontal: 10, borderRadius: 20
        }}>About Us</Text>


      </View>

      <View style={styles.s1}>
        <Image source={ownerPic} style={{ width: 100, height: 100, borderRadius: 150 }} />
        <Text style={{
          fontSize: 20, fontWeight: '400', color: COLOR.col1,
        }}>Amit Maurya </Text>
        <Text style={{
          fontSize: 16, fontWeight: '400', color: COLOR.col4,
        }}>( CEO - Educate Bharat )</Text>
      </View>

      <View style={styles.s2}>
        <Text style={{
          fontSize: 20, fontWeight: '400', color: COLOR.col2,
          textAlign: 'center',
          marginBottom: 10,
        }}>Our Goal</Text>
        <Text style={{
          fontSize: 14, fontWeight: '400', color: '#AF9FC9',
        }}>
          To provide best quality content in the form of video lectures, notes, pdfs, etc.
          We have a team of highly qualified teachers who are working hard to provide you the best content in an affordable price. We also have a store where you can buy books, notes, etc. at a very low price.
        </Text>
      </View>
      <View style={{
        width: width - 100,
        height: 1,
        backgroundColor: COLOR.col1,
        margin: 10,
      }}></View>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <SocialIcon
          type='instagram'
          light
          onPress={() => {
            Linking.openURL('https://www.instagram.com/ebappiitneet/')
          }}
        />
        <SocialIcon
          raised={false}
          type='youtube'
          size={30}
          onPress={() => {
            Linking.openURL('https://www.youtube.com/@ebappAmit')
          }}
        />

        <SocialIcon
          raised={false}
          type='whatsapp'
          onPress={() => {
            Linking.openURL('https://wa.me/917897708104?text=Hi%20I%20am%20interested%20in%20your%20courses')
          }}
        />

        <SocialIcon
          raised={false}
          type='linkedin'
          onPress={() => {
            Linking.openURL('https://www.linkedin.com/in/amit-maurya-8b0b4b221/')
          }}
        />
        <Icon
          raised
          name='phone'
          type='font-awesome'
          color='#f50'
          onPress={() => {
            let phoneNumber = '+917897708104';
            Linking.openURL(`tel:${phoneNumber}`);
          }} />
      </View>

    </View>
  )
}

export default AboutUs

const styles = StyleSheet.create({
  full: {
    flex: 1,
    alignItems: "center",
    backgroundColor: COLOR.col2,
  },
  header: {
    width: width,
    backgroundColor: COLOR.col2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  s1: {
    width: width,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLOR.col2,
  },

  title1: {
    fontSize: 30,
    fontWeight: "bold",
    color: COLOR.col1,
  },
  s2: {
    backgroundColor: COLOR.col1,
    margin: 20,
    padding: 20,
    borderRadius: 20,
  },
})
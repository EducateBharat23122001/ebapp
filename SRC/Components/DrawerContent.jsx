
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  Image,
  Text,
  Linking,
} from 'react-native';

import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { SocialIcon, Icon } from 'react-native-elements'

import avatar from '../Assets/avatar.jpg'
import { COLOR } from '../Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRecoilState } from 'recoil';
import { LoginState } from '../RecoilState/LoginState';
import { BACKEND_URL } from '@env';
import { useNavigation } from '@react-navigation/native';


const DrawerContent = (props) => {
  const navigation = useNavigation()
  const [userpic, setUserpic] = useState('')
  const BASE_PATH =
    'https://raw.githubusercontent.com/AboutReact/sampleresource/master/';
  const proileImage = 'react_logo.png';
  const [islogin, setIsLogin] = useRecoilState(LoginState)
  const [user, setUser] = useState({})
  const getUserDatafromToken = async () => {
    let token = await AsyncStorage.getItem("token")
    console.log(BACKEND_URL)
    fetch(BACKEND_URL + "/getuserdatafromtoken", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setUser(data.userdata)
        console.log(data)
        if (data.userdata.proilePic !== null || data.userdata.proilePic !== undefined || data.userdata.proilePic !== '' || data.userdata.proilePic !== 'noimage'
        ) {
          setUserpic(data.userdata.proileImage)
        }
      })
  }

  useEffect(() => {
    getUserDatafromToken()
  }, [islogin])


  const handleLogout = () => {
    AsyncStorage.removeItem("token")
    setIsLogin(false)
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/*Top Large Image */}
      <Image
        source={
          userpic ? { uri: userpic } : avatar
        }
        style={styles.sideMenuProfileIcon}
      />
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <View
        style={
          {
            height: 200
          }
        }
      >
        <DrawerContentScrollView {...props}

        >
          <DrawerItemList {...props} />
          <DrawerItem
            label="My Account"
            onPress={() => {
              navigation.navigate("SettingsNavigator")
            }}
            style={{
              padding: 0
            }}
          />
          <DrawerItem
            label="My Courses"
            onPress={() => navigation.navigate('CourseScreen')}
          />
          <DrawerItem
            label="About Us"
            onPress={() => {
              navigation.navigate("AboutUsScreen")
            }}
          />
        </DrawerContentScrollView>
      </View>
      <Text></Text>
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

      <Text
        style={{
          ...styles.customItem,
          fontSize: 16,
          fontWeight: 'bold',
          backgroundColor: COLOR.col1,
          color: COLOR.col3,
          borderRadius: 5,
          padding: 10,
          margin: 10,
          textAlign: "center"

        }}

        onPress={handleLogout}
      >
        Logout
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sideMenuProfileIcon: {
    resizeMode: 'center',
    width: 100,
    height: 100,
    borderRadius: 100 / 2,
    alignSelf: 'center',
    marginVertical: 10
  },
  iconStyle: {
    width: 15,
    height: 15,
    marginHorizontal: 5,
  },
  customItem: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    width: '90%',
    textAlign: "center",
    color: COLOR.col1,
    fontSize: 14,
    alignSelf: 'center',
    marginBottom: 2
  },
  email: {
    width: '90%',
    textAlign: "center",
    color: 'lightgrey',
    fontSize: 14,
    alignSelf: 'center',
    marginBottom: 5
  }
});

export default DrawerContent

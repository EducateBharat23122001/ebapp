import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeNavigator from './HomeNavigator';
import Octicons from 'react-native-vector-icons/Octicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

import { COLOR } from '../Constants';
import SettingsScreen from '../Pages/SettingScreens/SettingsScreen';
import StoreScreen from '../Pages/StoreScreens/StoreScreen';
import AllCoursesScreen from '../Pages/CourseScreens/AllCoursesScreen';
import SettingsNavigator from './SettingsNavigator';
const Tab = createBottomTabNavigator();

const BottomNavigator = () => {
    return (
        <Tab.Navigator
            initialRouteName="HomeNavigator"
            screenOptions={{
                tabBarStyle: {
                    position: 'absolute',
                    height: 50,
                    borderColor: 'white'
                },
                tabBarShowLabel: false,
                headerShown: false,
            }}>
            <Tab.Screen name="HomeNavigator" component={HomeNavigator}
                options={{
                    tabBarIcon: ({ focused, color, size }) =>
                    (
                        <View style={focused ? styles.iconContainerF : styles.iconContainer}>
                            <Octicons name="home" size={30} color={focused ? 'white' : COLOR.col4} />
                        </View>
                    )
                }}
            />
            <Tab.Screen name="CourseScreen" component={AllCoursesScreen}
                options={{
                    tabBarIcon: ({ focused, color, size }) =>
                    (

                        <View style={focused ? styles.iconContainerF : styles.iconContainer}>
                            <MaterialCommunityIcons name="table-of-contents" size={25} color={focused ? 'white' : COLOR.col4} />
                        </View>

                    )
                }}
            />

            <Tab.Screen name="StoreScreen" component={StoreScreen}
                options={{
                    tabBarIcon: ({ focused, color, size }) =>
                    (

                        <View style={focused ? styles.iconContainerF : styles.iconContainer}>
                            <AntDesign name="book" size={25} color={focused ? 'white' : COLOR.col4} />
                        </View>

                    )
                }}
            />

            <Tab.Screen name="SettingsNavigator" component={SettingsNavigator}
                options={{
                    tabBarIcon: ({ focused, color, size }) =>
                    (

                        <View style={focused ? styles.iconContainerF : styles.iconContainer}>
                            {/* three dot */}
                            <Feather name="user" size={25} color={focused ? 'white' : COLOR.col4} />
                        </View>

                    )
                }}
            />
        </Tab.Navigator>
    )
}

export default BottomNavigator

const styles = StyleSheet.create({
    iconContainerF: {
        backgroundColor: COLOR.col6,
        padding: 10,
        borderRadius: 50,
        aspectRatio: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }
})
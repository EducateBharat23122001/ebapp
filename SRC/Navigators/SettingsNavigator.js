import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer';
import { COLOR } from '../Constants';
import DrawerContent from '../Components/DrawerContent';
import AllOrdersScreen from '../Pages/SettingScreens/AllOrdersScreen';
import SettingsScreen from '../Pages/SettingScreens/SettingsScreen';
import OrderScreen from '../Pages/SettingScreens/OrderScreen';
import MyCoursesScreen from '../Pages/SettingScreens/MyCoursesScreen';
import AllTestScoresScreen from '../Pages/SettingScreens/AllTestScoresScreen';
import TestScoresScreen from '../Pages/SettingScreens/TestScoresScreen';
import AboutUs from '../Pages/SettingScreens/AboutUs';
import TermsAndConditionsScreen from '../Pages/SettingScreens/TermsAndConditionsScreen';
import PrivacyPolicyScreen from '../Pages/SettingScreens/PrivacyPolicyScreen';


const SettingsNavigator = () => {

    const Drawer = createDrawerNavigator();

    return (
        <Drawer.Navigator initialRouteName="Home"
            drawerContent={
                (props) => <DrawerContent {...props} />
            }
            screenOptions={
                {
                    headerShown: false,
                    drawerStyle: {
                        backgroundColor: 'white',
                        width: 240,

                    },
                    drawerActiveBackgroundColor: COLOR.col2,
                    drawerActiveTintColor: COLOR.col3,

                }
            }>
            <Drawer.Screen name="Settings" component={SettingsScreen} />
            <Drawer.Screen name="AllOrdersScreen" component={AllOrdersScreen} />
            <Drawer.Screen name="OrderScreen" component={OrderScreen} />
            <Drawer.Screen name="MyCoursesScreen" component={MyCoursesScreen} />
            <Drawer.Screen name="AllTestScoresScreen" component={AllTestScoresScreen} />
            <Drawer.Screen name="TestScoresScreen" component={TestScoresScreen} />

            <Drawer.Screen name="AboutUsScreen" component={AboutUs} />
            <Drawer.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
            <Drawer.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />

        </Drawer.Navigator>

    )
}

export default SettingsNavigator

const styles = StyleSheet.create({})
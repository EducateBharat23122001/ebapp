import { StyleSheet, Text, View, ScrollView } from 'react-native'
import React from 'react'
import { Button } from 'react-native';
import HomeTop from '../../Components/HomeTop';
import HomeCarousel from '../../Components/HomeCarousel';
import HomeJeeNeet from '../../Components/HomeJeeNeet';
import HomeProducts from '../../Components/HomeProducts';


// import HomeCarousel from '../../Components/HomeCarousel';
// import HomeJeeNeet from '../../Components/Home/HomeJeeNeet';
// import HomeProducts from '../../Components/Home/HomeProducts';


const HomePage = ({ navigation }) => {

    return (
        <ScrollView style={styles.container}>
            <HomeTop navigation={navigation} />
            <HomeCarousel style={styles.carousel} />

            <HomeJeeNeet />
            <HomeProducts />
            {/* 
   
      
     */}

            <View style={{
                height:100
            }}></View>
        </ScrollView>
    )
}

export default HomePage

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // alignItems: "center",
        // justifyContent: "center",
        backgroundColor: 'white'
    },
    carousel: {

        alignItems: 'center'
    }
})
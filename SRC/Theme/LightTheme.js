

import {Dimensions} from 'react-native';
import { COLOR } from '../Constants';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

module.exports = {
    fullscreen:{
        backgroundColor : COLOR.col1
    },
    inputcomponent : {
        backgroundColor : "blue"
    },
    title: {
        fontSize: 24,
        fontWeight: "light",
        marginTop: 10,
        color: COLOR.col2
      },
      input: {
        width: windowWidth - 50,
        borderColor: COLOR.col2,
        color: COLOR.col2,
        borderWidth: 2,
        borderRadius: 25,
        padding: 10,
        marginVertical: 5,
        paddingHorizontal: 20,
        fontSize: 15
      },
      button: {
        width : 200,
        textAlignVertical: "center",
        textAlign: "center",
        backgroundColor : COLOR.col2,
        color: COLOR.col1,
        fontSize : 20,
    padding: 10,
    borderRadius: 20,
    marginVertical: 10
    },
}
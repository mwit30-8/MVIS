import React, {Component} from "react";
import { StyleSheet, Text, View, TouchableOpacity} from 'react-native';

const buttonwithbackground = props =>{
    const content ={
        <View style={[style.button,{backgroundcolor: props.color}]}>
        <Text style={style.text}>(props.text)</Text>
        
        </View>
    }

}
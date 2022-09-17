import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React,{Component} from 'react';
import { View } from 'react-native';
import { IRouteParam } from '../App';
import Authenticate from '../components/Authenticate';
import styles from '../styles';



const App: React.FC<NativeStackScreenProps<IRouteParam, 'Login'>> = () => {
    return (
        <View style={styles.container}>
            <Authenticate />
        </View>
    );
};

export default App;
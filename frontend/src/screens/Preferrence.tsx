import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import { IRouteParamHome } from '../App';
import Authenticate from '../components/Authenticate';
import styles from '../styles';

const App: React.FC<NativeStackScreenProps<IRouteParamHome, 'Preferrence'>> = () => {
    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            <Authenticate/>
        </View>
    );
};

export default App;
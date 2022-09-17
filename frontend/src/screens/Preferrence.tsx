import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Text, View } from 'react-native';
import { IRouteParam } from '../App';
import Authenticate from '../components/Authenticate';
import styles from '../styles';

const App: React.FC<NativeStackScreenProps<IRouteParam, 'Preferrence'>> = () => {
    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            <Authenticate/>
        </View>
    );
};

export default App;
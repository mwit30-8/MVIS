import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import { IRouteParamMain } from '../App';
import Authenticate from '../components/Authenticate';
import styles from '../styles';

const App: React.FC<BottomTabScreenProps<IRouteParamMain, 'Preferrence'>> = () => {
    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            <Authenticate />
        </View>
    );
};

export default App;
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { View } from 'react-native';
import { IRouteParamRoot } from '../App';
import Authenticate from '../components/Authenticate';
import styles from '../styles';

const App: React.FC<NativeStackScreenProps<IRouteParamRoot, 'Login'>> = () => {
    return (
        <View style={styles.container}>
            <Authenticate />
        </View>
    );
};

export default App;
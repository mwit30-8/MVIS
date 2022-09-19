import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Text, View } from 'react-native';
import type { IRouteParam } from '../App';
import styles from '../styles';

const App: React.FC<NativeStackScreenProps<IRouteParam, 'Home'>> = () => {
    return (
        <View style={styles.Banner}>
            <Text style={{
                color: '#EDE300',
                fontWeight: "bold",
                fontSize: 25
            }}>
                MVIS
            </Text>

        </View>

    );
}
export default App;


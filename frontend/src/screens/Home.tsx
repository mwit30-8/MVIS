import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import React from 'react';
import { Text, View } from 'react-native';
import type { IRouteParamMain } from '../App';
import styles from '../styles';

const App: React.FC<BottomTabScreenProps<IRouteParamMain, 'Home'>> = () => {
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


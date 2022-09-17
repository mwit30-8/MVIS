import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { AuthContext } from '../components/Authenticate/context';
import styles from '../styles';
import TimedSlideshow from 'react-native-timed-slideshow';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { IRouteParam } from '../App';

const App: React.FC<NativeStackScreenProps<IRouteParam, 'Login'>> = ({ navigation }) => {
    const { state } = React.useContext(AuthContext);
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


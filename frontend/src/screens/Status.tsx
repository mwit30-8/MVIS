import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { AuthContext } from '../components/Authenticate/context';
import styles from '../styles';
import TimedSlideshow from 'react-native-timed-slideshow';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { IRouteParamHome } from '../App';
import * as graphql from '../../generated/graphql';
import * as Progress from "react-native-progress";

const LocationStatus: React.FC<{location: string}> = (props) => {
    const { loading, error, data } = graphql.useLocationQuery({variables: {location: props.location}})
    if(loading) return <Text>...loading...</Text>;
    if(error) return <Text> Error :( </Text>;
    return <>{(
        data?.getPlace ?
        <>
            <Text>
                Gym: {data.getPlace.participantsAggregate?.count?.toString()}
            </Text>
      <Progress.Bar progress={(1+(data.getPlace.participantsAggregate?.count ?? 0)) / (1+(data.getPlace.capacity ?? 0))} width={200} />
            </>
            :
            <Text> Failed to fetch. </Text>
    )}</>;
}
const App: React.FC<NativeStackScreenProps<IRouteParamHome, 'Status'>> = () => {
    return (
      <>
        <View style={styles.Banner}>
          <Text
            style={{
              color: "#EDE300",
              fontWeight: "bold",
              fontSize: 25,
            }}
          >
            MVIS
          </Text>
        </View>
        <View style={styles.container}>
          <LocationStatus location='Gym' />
        </View>
      </>
    );
}
export default App;


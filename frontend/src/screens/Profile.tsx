import { ApolloProvider } from '@apollo/client';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React, { FC } from 'react';
import { Text, View } from 'react-native';
import * as graphql from '../../generated/graphql';
import type { IRouteParam } from '../App';
import Authenticate from '../components/Authenticate';
import { AuthContext } from '../components/Authenticate/context';
import styles from '../styles';
import { createBackendClient } from '../utils';

const DisplayBackendVersion: FC = () => {
    const { loading, error, data } = graphql.useVersionQuery();
    if (loading) return <Text>Loading...</Text>;
    if (error) {
        console.error(error);
        return <Text>Error :(</Text>;
    }

    return (
        <Text>
            Backend version: {data!.version}
        </Text>
    );
};

const DisplayAuthUsername: FC = () => {
    const { loading, error, data } = graphql.useUserQuery();
    if (loading) return <Text>Loading...</Text>;
    if (error) {
        console.error(error);
        return <Text>Error :(</Text>;
    }

    return (
        <>
            {
                data!.queryUser?.[0]?.idToken ?
                    (
                        data!.queryUser[0].idToken.name ?
                            <Text>
                                You are logged in, {data!.queryUser[0].idToken.name}.
                            </Text >
                            :
                            <Text>
                                You are logged in.
                            </Text >
                    )
                    :
                    <Text>
                        You are not logged in.
                    </Text >
            }
        </>
    );
};

const App: React.FC<NativeStackScreenProps<IRouteParam, 'Login'>> = ({ navigation }) => {
    const { state } = React.useContext(AuthContext);
    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            <Text>Open up App.tsx to start working on your app!</Text>
            <ApolloProvider client={createBackendClient(state.idToken!)}>
                <DisplayAuthUsername />
                <DisplayBackendVersion />
            </ApolloProvider>
            <Authenticate />
        </View>
    );
};

export default App;
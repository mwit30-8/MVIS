import { FC, StrictMode } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { createBackendClient } from './util';
import { ApolloProvider, gql, useQuery } from '@apollo/client';

const DisplayBackendVersion: FC = () => {
  const { loading, error, data } = useQuery(gql`query Version{version}`);
  if (loading) return <Text>Loading...</Text>;
  if (error) {
    console.error(error);
    return <Text>Error :(</Text>;
  }

  return (
    <Text>
      Backend version: {data.version}
    </Text>
  );
}

const App: FC = () => {
  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      {/* <Text>{process.env.BACKEND_URL ?? 'NULL'}</Text> */}
      <ApolloProvider client={createBackendClient()}>
        <StrictMode>
          <DisplayBackendVersion />
        </StrictMode>
      </ApolloProvider>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
import { ApolloProvider } from '@apollo/client';
import * as AuthSession from 'expo-auth-session';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import React, { FC, StrictMode, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Platform, StyleSheet, Text, View } from 'react-native';
import * as graphql from '../generated/graphql';
import { createBackendClient, verifyJwt } from './util';
import * as config from './util/config';

WebBrowser.maybeCompleteAuthSession();

const useProxy = Platform.select({ web: false, default: true });
const redirectUri = AuthSession.makeRedirectUri({ useProxy, path: config.SERVED_PATH });

console.log(`Redirect URL: ${redirectUri}`);

interface IAuthProp {
  setJwt: React.Dispatch<React.SetStateAction<string | null>>;
}

const Auth: FC<IAuthProp> = (props) => {
  const [isLogin, setLogin] = useState(false);

  const [request, result, promptAsync] = AuthSession.useAuthRequest(
    {
      redirectUri,
      clientId: config.AUTH0_CLIENT_ID,
      responseType: "id_token",
      scopes: ["openid", "profile", "email"],
      extraParams: {
        nonce: "nonce",
      },
    },
    {
      authorizationEndpoint: `https://${config.AUTH0_DOMAIN}/authorize`,
    }
  );

  useEffect(() => {
    if (result === null) {
      return;
    } else if (result.type === "success") {
      // Retrieve the JWT token and decode it
      const idToken = result.params.id_token;
      verifyJwt(idToken).then((isVerified) => {
        if (isVerified) {
          props.setJwt(idToken);
          setLogin(true);
        } else {
          const alertTitle = "Authentication error";
          const alertText = "invalid token";
          if (Platform.OS === 'web') {
            alert(alertText)
          } else {
            Alert.alert(alertTitle, alertText);
          }
        }
      });
    } else {
      const alertTitle = "Authentication error";
      const alertText = (result.type === "error" ? result.params?.error_description : null) ?? "something went wrong";
      if (Platform.OS === 'web') {
        alert(alertText)
      } else {
        Alert.alert(alertTitle, alertText);
      }
    }
  }, [result]);

  return (
    <>
      {isLogin ? (
        <>
          <Button title="Log out" onPress={() => { props.setJwt(null); setLogin(false); }} />
        </>
      ) : (
        <Button
          disabled={!request}
          title="Log in with Auth0"
          onPress={() => promptAsync({ useProxy })}
        />
      )}
    </>
  );
};

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
  const { loading, error, data } = graphql.useNameQuery();
  if (loading) return <Text>Loading...</Text>;
  if (error) {
    console.error(error);
    return <Text>Error :(</Text>;
  }

  return (
    <>
      {
        data!.getAuthState?.idToken ?
          (
            data!.getAuthState.idToken.name ?
              <Text>
                You are logged in, {data!.getAuthState.idToken.name}.
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

const App: FC = () => {
  const [jwt, setJwt] = useState<string | null>(null);
  const apolloClient = useMemo(() => { return jwt ? createBackendClient(jwt) : createBackendClient() }, [jwt]);
  return (
    <StrictMode>
      <View style={styles.container}>
        <Text>Open up App.tsx to start working on your app!</Text>
        <ApolloProvider client={apolloClient}>
          <DisplayAuthUsername />
          <DisplayBackendVersion />
        </ApolloProvider>
        <StatusBar style="auto" />
        <Auth setJwt={setJwt} />
      </View>
    </StrictMode>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
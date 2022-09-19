import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import React, { FC, useEffect } from 'react';
import { Alert, Button, Platform } from 'react-native';
import * as config from '../../utils/config';
import { AuthContext } from './context';

WebBrowser.maybeCompleteAuthSession();

const useProxy = Platform.select({ web: false, default: true });
const redirectUri = AuthSession.makeRedirectUri({ useProxy, path: config.SERVED_PATH });

console.log(`Redirect URL: ${redirectUri}`);

interface IAuthProp {
  onSignIn?: (jwt: string) => void;
  onSignOut?: () => void;
}

// Todo: Add UI for testing purpose: self-generating jwt
const Authenticate: FC<IAuthProp> = (props) => {
  const { signIn, signOut, state } = React.useContext(AuthContext);

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
    if (Platform.OS !== "web") WebBrowser.warmUpAsync();

    return () => {
      if (Platform.OS !== "web") WebBrowser.coolDownAsync();
    };
  }, []);
  useEffect(() => {
    if (result === null) {
      return;
    }
    if (result.type === "success") {
      // Retrieve the JWT token and decode it
      const idToken = result.params.id_token;
      signIn(idToken).then((isVerified) => {
        if (isVerified) {
          props.onSignIn?.(idToken)
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
      return;
    }
    const alertTitle = "Authentication error";
    const alertText = (result.type === "error" ? result.params?.error_description : null) ?? "something went wrong";
    if (Platform.OS === 'web') {
      alert(alertText)
    } else {
      Alert.alert(alertTitle, alertText);
    }
  }, [result]);

  return (
    <>
      {state.isSignout ? (
        <Button
          disabled={!request}
          title="Log in"
          onPress={() => promptAsync({ useProxy })}
        />
      ) : (
        <Button title="Log out" onPress={() => {
          signOut();
          props.onSignOut?.();
        }} />
      )}
    </>
  );
};

export default Authenticate;
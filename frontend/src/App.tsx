import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import AuthContextProvider, {
  AuthContext,
} from "./components/Authenticate/context";
import { InitialProps } from "expo/build/launch/withExpoRoot.types";
import { ApolloProvider } from "@apollo/client";
import { createBackendClient } from "./utils";

export type IRouteParamRoot = {
  Login: undefined;
  Main: undefined;
};
const RootNavigator = createNativeStackNavigator<IRouteParamRoot>();
export type IRouteParamMain = {
  Profile: undefined;
  QrCode: undefined;
  Status: undefined;
  Home: undefined;
  Preferrence: undefined;
};
const MainNavigator = createBottomTabNavigator<IRouteParamMain>();

const Main: React.FC<NativeStackScreenProps<IRouteParamRoot, "Main">> = () => {
  return (
    <MainNavigator.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={"Home"}
    >
      <MainNavigator.Group>
        <MainNavigator.Screen
          name="Profile"
          getComponent={() => require("./screens/Profile").default}
        />
        <MainNavigator.Screen
          name="QrCode"
          getComponent={() => require("./screens/QrCodescan").default}
        />
        <MainNavigator.Screen
          name="Status"
          getComponent={() => require("./screens/Status").default}
        />
        <MainNavigator.Screen
          name="Home"
          getComponent={() => require("./screens/Home").default}
        />
        <MainNavigator.Screen
          name="Preferrence"
          getComponent={() => require("./screens/Preferrence").default}
        />
      </MainNavigator.Group>
    </MainNavigator.Navigator>
  );
};
const App_: React.FC = () => {
  const { state } = React.useContext(AuthContext);
  return (
    <ApolloProvider client={createBackendClient(state.idToken)}>
      <NavigationContainer>
        <RootNavigator.Navigator
          initialRouteName={state.isSignout ? "Login" : "Main"}
          screenOptions={{
            headerShown: false,
          }}
        >
          {state.isSignout ? (
            <RootNavigator.Group>
              <RootNavigator.Screen
                name="Login"
                getComponent={() => require("./screens/Login").default}
              />
            </RootNavigator.Group>
          ) : (
            <RootNavigator.Group>
              <RootNavigator.Screen name="Main" component={Main} />
            </RootNavigator.Group>
          )}
        </RootNavigator.Navigator>
      </NavigationContainer>
    </ApolloProvider>
  );
};

const App: React.FC<InitialProps> = () => {
  return (
    <React.StrictMode>
      <AuthContextProvider>
        <App_ />
      </AuthContextProvider>
    </React.StrictMode>
  );
};

export default App;

serviceWorkerRegistration.register();

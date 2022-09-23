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
import { ApolloProvider } from "@apollo/client";
import { createBackendClient } from "./utils";
import Constant from "expo-constants";

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
const PreLogin: React.FC = () => {
  const { state } = React.useContext(AuthContext);
  return (
    <ApolloProvider client={createBackendClient(state.idToken)}>
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
    </ApolloProvider>
  );
};
const _App: React.FC = () => {
  return (
    <AuthContextProvider>
      <PreLogin />
    </AuthContextProvider>
  );
};

const withStorybook =
  (App: React.FC): React.FC =>
  () => {
    const Navigator = createBottomTabNavigator();
    return (
      <Navigator.Navigator
        initialRouteName="Storybook"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Navigator.Screen name="App" component={App} />
        <Navigator.Screen
          name="Storybook"
          getComponent={() =>
            (require("../storybook") as typeof import("../storybook")).default
          }
        />
      </Navigator.Navigator>
    );
  };

const App: React.FC = () => {
  const Content = Constant.manifest?.extra?.LOAD_STORYBOOK
    ? withStorybook(_App)
    : _App;
  return (
    <React.StrictMode>
      <NavigationContainer>
        <Content />
      </NavigationContainer>
    </React.StrictMode>
  );
};

export default App;

serviceWorkerRegistration.register();

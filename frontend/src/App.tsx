import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import AuthContextProvider, {
  AuthContext,
} from "./components/Authenticate/context";
import { InitialProps } from "expo/build/launch/withExpoRoot.types";
import { ApolloProvider } from "@apollo/client";
import { createBackendClient } from "./utils";

export type IRouteParam = {
  Login: undefined;
  Home: undefined;
};
const Navigator = createNativeStackNavigator<IRouteParam>();
export type IRouteParamHome = {
  Profile: undefined;
  QrCode: undefined;
  Status: undefined;
  Home: undefined;
  Preferrence: undefined;
};
const HomeNavigator = createBottomTabNavigator<IRouteParamHome>();

const Home: React.FC = () => {
  return (
    <HomeNavigator.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={"Home"}
    >
      <HomeNavigator.Group>
        <HomeNavigator.Screen
          name="Profile"
          getComponent={() => require("./screens/Profile").default}
        />
        <HomeNavigator.Screen
          name="QrCode"
          getComponent={() => require("./screens/QrCodescan").default}
        />
        <HomeNavigator.Screen
          name="Status"
          getComponent={() => require("./screens/Status").default}
        />
        <HomeNavigator.Screen
          name="Home"
          getComponent={() => require("./screens/Home").default}
        />
        <HomeNavigator.Screen
          name="Preferrence"
          getComponent={() => require("./screens/Preferrence").default}
        />
      </HomeNavigator.Group>
    </HomeNavigator.Navigator>
  );
};
const _App: React.FC = () => {
  const { state } = React.useContext(AuthContext);
  return (
    <ApolloProvider client={createBackendClient(state.idToken)}>
      <NavigationContainer>
        <Navigator.Navigator
          initialRouteName={state.isSignout ? "Login" : "Home"}
          screenOptions={{
            headerShown: false,
          }}
        >
          {state.isSignout ? (
            <Navigator.Group>
              <Navigator.Screen
                name="Login"
                getComponent={() => require("./screens/Login").default}
              />
            </Navigator.Group>
          ) : (
            <Navigator.Group>
              <Navigator.Screen name="Home" component={Home} />
            </Navigator.Group>
          )}
        </Navigator.Navigator>
      </NavigationContainer>
    </ApolloProvider>
  );
};

const App: React.FC<InitialProps> = () => {
  return (
    <React.StrictMode>
      <AuthContextProvider>
        <_App />
      </AuthContextProvider>
    </React.StrictMode>
  );
};

export default App;

serviceWorkerRegistration.register();

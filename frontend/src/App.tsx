import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import AuthContextProvider, { AuthContext } from './components/Authenticate/context';
import { InitialProps } from 'expo/build/launch/withExpoRoot.types';


export type IRouteParam = {
  Login: undefined;
  Preferrence: undefined;
  Profile: undefined;
};
const Tab = createBottomTabNavigator<IRouteParam>();

const _App: React.FC = () => {
  const { state } = React.useContext(AuthContext)
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName={state.isSignout ? 'Login' : 'Profile'}
      >
        {
          state.isSignout ?
            <>
              <Tab.Screen name='Login' getComponent={() => require('./screens/Login').default} />
            </>
            : <>
              <Tab.Screen name='Profile' getComponent={() => require('./screens/Profile').default} />
            </>
        }
        <Tab.Group>
          <Tab.Screen name='Preferrence' getComponent={() => require('./screens/Preferrence').default} />
        </Tab.Group>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
const App: React.FC<InitialProps> = () => {
  return (
    <React.StrictMode>
      <AuthContextProvider>
        <_App />
      </AuthContextProvider>
    </React.StrictMode>
  );
}

export default App;

serviceWorkerRegistration.register();
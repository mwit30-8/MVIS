import * as React from "react";
import { verifyJwt } from "../../utils";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// An enum with all the types of actions to use in our reducer
enum AuthActionEnum {
  RESTORE_TOKEN = "RESTORE_TOKEN",
  SIGN_IN = "SIGN_IN",
  SIGN_OUT = "SIGN_OUT",
}

// An interface for our actions
type AuthAction =
  | {
      type: AuthActionEnum.RESTORE_TOKEN;
      token?: string;
    }
  | {
      type: AuthActionEnum.SIGN_IN;
      token: string;
    }
  | {
      type: AuthActionEnum.SIGN_OUT;
    };

// An interface for our state
interface AuthState {
  isLoading: boolean;
  isSignout: boolean;
  idToken?: string;
}

interface IAuthContext {
  signIn: (idToken: string) => Promise<boolean>;
  signOut: () => Promise<boolean>;
  state: AuthState;
}

export const AuthContext = React.createContext<IAuthContext>({
  signIn: async () => false,
  signOut: async () => false,
  state: {
    isLoading: true,
    isSignout: true,
  },
});

const Provider: React.FC<React.PropsWithChildren> = (props) => {
  const [state, dispatch] = React.useReducer<
    React.Reducer<AuthState, AuthAction>
  >(
    (prevState, action) => {
      switch (action.type) {
        case AuthActionEnum.RESTORE_TOKEN:
          return {
            idToken: action.token,
            isSignout: action.token === undefined,
            isLoading: false,
          };
        case AuthActionEnum.SIGN_IN:
          if (Platform.OS !== "web")
            SecureStore.setItemAsync("idToken", action.token);
          return {
            ...prevState,
            isSignout: false,
            idToken: action.token,
          };
        case AuthActionEnum.SIGN_OUT:
          if (Platform.OS !== "web") SecureStore.deleteItemAsync("idToken");
          return {
            ...prevState,
            isSignout: true,
            idToken: undefined,
          };
      }
    },
    {
      isLoading: true,
      isSignout: true,
    }
  );

  React.useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
      if (Platform.OS === "web") return;
      try {
        const idToken: string | null = await SecureStore.getItemAsync(
          "idToken"
        );
        if (!idToken) {
          dispatch({ type: AuthActionEnum.RESTORE_TOKEN });
          return;
        }
        verifyJwt(idToken).then((isVerified) => {
          if (isVerified) {
            dispatch({ type: AuthActionEnum.RESTORE_TOKEN, token: idToken });
          }
        });
      } catch (e) {
        // Restoring token failed
      }
    };

    bootstrapAsync();
  }, []);

  const authContext = React.useMemo<IAuthContext>(
    () => ({
      signIn: async (idToken) => {
        // In a production app, we need to send some data (usually username, password) to server and get a token
        // We will also need to handle errors if sign in failed
        // After getting token, we need to persist the token using `SecureStore`
        // In the example, we'll use a dummy token
        const isVerified = await verifyJwt(idToken);

        if (isVerified) {
          dispatch({ type: AuthActionEnum.SIGN_IN, token: idToken });
        }

        return isVerified;
      },
      signOut: async () => {
        dispatch({ type: AuthActionEnum.SIGN_OUT });
        return true;
      },
      state: state,
    }),
    [state]
  );

  return (
    <AuthContext.Provider value={authContext}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default Provider;

import { registerRootComponent } from "expo";
import Constant from "expo-constants";
import { InitialProps } from "expo/build/launch/withExpoRoot.types";

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(
  (Constant.manifest?.extra?.RUN_STORYBOOK
    ? (require("./storybook") as typeof import("./storybook")).default
    : (require("./src/App") as typeof import("./src/App"))
        .default) as React.FC<InitialProps>
);

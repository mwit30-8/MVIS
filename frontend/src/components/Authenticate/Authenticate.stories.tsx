import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react-native";
import React from "react";
import Authenticate from ".";
import AuthContextProvider from "./context";
import CenterView from "../CenterView";

storiesOf("Authenticate", module)
  .addDecorator((getStory) => (
    <CenterView>
      <AuthContextProvider>{getStory()}</AuthContextProvider>
    </CenterView>
  ))
  .add("Default", () => (
    <Authenticate
      onSignIn={action("signed-in")}
      onSignOut={action("signed-out")}
    />
  ));

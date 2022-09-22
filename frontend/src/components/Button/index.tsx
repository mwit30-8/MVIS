import React from "react";
import { GestureResponderEvent, TouchableHighlight } from "react-native";

export default function Button({
  onPress,
  children,
}: React.PropsWithChildren<{
  onPress?: (event: GestureResponderEvent) => void;
}>) {
  return <TouchableHighlight onPress={onPress}>{children}</TouchableHighlight>;
}

Button.defaultProps = {
  children: null,
  onPress: () => {},
};

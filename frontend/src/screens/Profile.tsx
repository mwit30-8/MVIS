import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { Image, Text, View } from "react-native";
import * as Progress from "react-native-progress";
import * as graphql from "../../generated/graphql";
import type { IRouteParamHome } from "../App";
import styles from "../styles";

const UserProfile: React.FC = () => {
  const { loading, error, data } = graphql.useUserQuery();
  if (loading) return <Text>...loading...</Text>;
  if (error) return <Text> Error :( </Text>;
  return (
    <>
      {data?.queryUser?.[0]?.idToken ? (
        <>
          {
            <Image
              source={{
                uri:
                  data.queryUser[0].idToken.picture ??
                  "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg",
              }}
              style={{
                width: 50,
                height: 50,
              }}
            />
          }
          <Text>Welcome, {data.queryUser[0].idToken.name}</Text>
        </>
      ) : (
        <Text> Failed to fetch. </Text>
      )}
    </>
  );
};
const UserStatus: React.FC = () => {
    const activities = [
        {
            'name': 'book',
            'completed': 132,
            'total': 300,
        }
    ]
  return (
    <>
    {
        activities.map((activity, i) => <React.Fragment key={i}>
            <Text>{activity.name}: {activity.completed}/{activity.total}</Text>
            <Progress.Bar progress={(1+activity.completed)/(1+activity.total)} width={200} />
            </React.Fragment>
            )
    }
      <Text>
        Todo: Fetch real extracirricular activity progress from external source.
        {"\n"}
        (Not implemented to keep other students' privacy.)
      </Text>
    </>
  );
};
const App: React.FC<
  NativeStackScreenProps<IRouteParamHome, "Profile">
> = () => {
  return (
    <>
      <View style={styles.Banner}>
        <Text
          style={{
            color: "#EDE300",
            fontWeight: "bold",
            fontSize: 25,
          }}
        >
          MVIS
        </Text>
      </View>
      <View style={styles.container}>
        <UserProfile />
        <UserStatus />
      </View>
    </>
  );
};
export default App;

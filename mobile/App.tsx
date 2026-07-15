import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import HomeScreen from "./src/screens/HomeScreen";
import SymptomScreen from "./src/screens/SymptomScreen";
import TherapistsScreen from "./src/screens/TherapistsScreen";

export type RootStackParamList = {
  Home: undefined;
  Symptom: undefined;
  Therapists: { specialty?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#B4232A" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "700" },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "🐒 หนุมาน" }} />
        <Stack.Screen name="Symptom" component={SymptomScreen} options={{ title: "บอกอาการ" }} />
        <Stack.Screen name="Therapists" component={TherapistsScreen} options={{ title: "หมอนวดใกล้คุณ" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

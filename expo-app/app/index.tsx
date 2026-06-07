// Root route — redirect into the tab group so the user lands on Capital.
import { Redirect } from "expo-router";
export default function Index() {
  return <Redirect href="/(tabs)/capital" />;
}

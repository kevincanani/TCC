import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image } from 'react-native';
import Home from './Screens/Home';
import Test from './Screens/Test'

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Shop from './Screens/Shop';
import Profile from './Screens/Profile';
import Test from './Screens/Test'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';


function BottomTabs() {
  const Tab = createBottomTabNavigator();
  return(
    <Tab.Navigator>
      <Tab.Screen name='Home' component={Home}/>
      <Tab.Screen name='Shop' component={Shop}/>
      <Tab.Screen name='Profile' component={Profile}/>
    </Tab.Navigator>
  )
}

export default function App() {
  const Stack = createStackNavigator();

  return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen options={{headerShown:false}} name='Home' component={BottomTabs}/>
        </Stack.Navigator>
      </NavigationContainer>
  );
}
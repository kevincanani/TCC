import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image } from 'react-native';
import Home from './Screens/Home';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Shop from './Screens/Shop';
import Profile from './Screens/Profile';
import Test from './Screens/Test'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';


function BottomTabs() {
  const Tab = createBottomTabNavigator();
  return(
    <Tab.Navigator screenOptions={{
      // headerRight: (props)  => <Image style={{width: 50, height:50}} source={require('./assets/logo_petshop.png')}/>,
      headerStyle:{backgroundColor: '#4CAF50'},
      headerTintColor: 'white',
      tabBarActiveBackgroundColor: '#4CAF50', 
      tabBarInactiveBackgroundColor: '#4CAF50',
      tabBarActiveTintColor: 'black'
    }}>
      <Tab.Screen name='Home' component={Home}
      options={{
        tabBarIcon: () => <FontAwesome5 name="home" size={24} color="black" />
      }}/>
      <Tab.Screen name='Shop' component={Shop}
      options={{
        tabBarIcon: () => <FontAwesome5 name="shopping-bag" size={24} color="black" />
      }}/>
      <Tab.Screen name='Profile' component={Profile}/>
      <Tab.Screen name='Test' component={Test}/>
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
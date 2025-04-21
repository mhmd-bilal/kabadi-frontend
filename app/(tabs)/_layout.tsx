import { Tabs } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#f7f2f1',
          borderTopWidth: 0,
          position: 'absolute',
          bottom: 10,
          left: 0,
          right: 0,
          padding: 8,
          paddingVertical: 10,
        },
        tabBarActiveTintColor: '#16aa3e',
        tabBarInactiveTintColor: 'black',
        tabBarLabelStyle: {
          fontFamily: 'Montserrat-Medium',
          fontSize: 10,
          marginTop: 5,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="myspace"
        options={{
          title: 'My Space',
          tabBarIcon: ({ color, size }) => (
            <Feather name="zap" size={24} color={color} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="teams"
        options={{
          title: 'Teams',
          tabBarIcon: ({ color, size }) => (
            <Feather name="users" size={24} color={color} />
          ),
        }}
      /> */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

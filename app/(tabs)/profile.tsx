import { Stack } from 'expo-router';
import { View, Text } from 'react-native';

export default function ProfilePage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="mt-12 flex-1 bg-black p-4">
        <Text className="text-xl font-bold text-white">Profile</Text>
      </View>
    </>
  );
} 
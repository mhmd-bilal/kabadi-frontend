import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import storageHelper from '../storageHelper';

export default function JoinTeamScreen() {
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinTeam = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }

    setIsLoading(true);
    try {
      const team = await storageHelper.joinTeamByCode(inviteCode, 'current-user');
      
      if (!team) {
        Alert.alert('Error', 'Invalid invite code or you are already a member of this team');
        return;
      }
      
      Alert.alert(
        'Success',
        `You have joined team ${team.name}!`,
        [
          {
            text: 'View Team',
            onPress: () => {
              router.push({
                pathname: '/team/[id]',
                params: { id: team.id }
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error joining team:', error);
      Alert.alert('Error', 'Failed to join team. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Join Team',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              className="bg-black/20 rounded-full p-1 mr-2"
            >
              <Ionicons name="arrow-back" size={24} color="white" className='' />
            </TouchableOpacity>
          ),
        }}
      />
      
      <View className="flex-1 bg-[#f7f2f1] p-4">
        <View className="mb-6">
          <Text className="text-2xl font-semibold mb-4">Join a Team</Text>
          <Text className="text-gray-600 mb-4">
            Enter the team invite code to join an existing team.
          </Text>
        </View>

        <View className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <Text className="text-sm font-medium mb-1">Invite Code*</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-3 mb-2"
            value={inviteCode}
            onChangeText={setInviteCode}
            placeholder="Enter team invite code"
            autoCapitalize="characters"
          />
          <Text className="text-xs text-gray-500 mb-4">
            This is the code shared by the team creator
          </Text>
        </View>

        <TouchableOpacity
          className={`bg-[#16aa3e] py-3 rounded-lg ${isLoading ? 'opacity-70' : ''}`}
          onPress={handleJoinTeam}
          disabled={isLoading}
        >
          <Text className="text-white text-center font-semibold">
            {isLoading ? 'Joining...' : 'Join Team'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="mt-4" 
          onPress={() => router.push('/team/create')}
        >
          <Text className="text-center text-[#16aa3e]">
            Don't have a code? Create your own team
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
} 
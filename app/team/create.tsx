import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import storageHelper from '../storageHelper';

export default function CreateTeamScreen() {
  const [teamName, setTeamName] = useState('');
  const [teamCity, setTeamCity] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateTeam = async () => {
    if (!teamName.trim() || !teamCity.trim()) {
      Alert.alert('Error', 'Team name and city are required');
      return;
    }

    setIsLoading(true);
    try {
      const inviteCode = storageHelper.generateInviteCode(teamName);
      
      const newTeam = {
        id: Date.now().toString(),
        name: teamName,
        city: teamCity,
        description: teamDescription,
        players: [],
        inviteCode: inviteCode,
        createdBy: 'current-user', // In a real app, this would be the current user's ID
      };

      await storageHelper.saveTeam(newTeam);
      
      Alert.alert(
        'Success',
        `Team created successfully! Your invite code is: ${inviteCode}`,
        [
          {
            text: 'OK',
            onPress: () => {
              router.push({
                pathname: '/team/[id]',
                params: { id: newTeam.id }
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error creating team:', error);
      Alert.alert('Error', 'Failed to create team. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Create Team',
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
      
      <ScrollView className="flex-1 bg-[#f7f2f1] p-4">
        <View className="mb-6">
          <Text className="text-2xl font-semibold mb-4">Create Your Team</Text>
          <Text className="text-gray-600 mb-4">
            Create a team and invite players to join using your team code.
          </Text>
        </View>

        <View className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <Text className="text-sm font-medium mb-1">Team Name*</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-3 mb-4"
            value={teamName}
            onChangeText={setTeamName}
            placeholder="Enter team name"
          />
          
          <Text className="text-sm font-medium mb-1">City*</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-3 mb-4"
            value={teamCity}
            onChangeText={setTeamCity}
            placeholder="Enter city"
          />
          
          <Text className="text-sm font-medium mb-1">Description</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-3 mb-4"
            value={teamDescription}
            onChangeText={setTeamDescription}
            placeholder="Enter team description"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          className={`bg-[#16aa3e] py-3 rounded-lg ${isLoading ? 'opacity-70' : ''}`}
          onPress={handleCreateTeam}
          disabled={isLoading}
        >
          <Text className="text-white text-center font-semibold">
            {isLoading ? 'Creating...' : 'Create Team'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
} 
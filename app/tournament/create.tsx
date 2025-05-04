import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import storageHelper, { Tournament } from '../storageHelper';

export default function CreateTournamentScreen() {
  const [tournamentName, setTournamentName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [prize, setPrize] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // Default to 1 week from now
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateTournament = async () => {
    if (!tournamentName.trim() || !location.trim()) {
      Alert.alert('Error', 'Tournament name and location are required');
      return;
    }

    if (endDate <= startDate) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }

    setIsLoading(true);
    try {
      const inviteCode = storageHelper.generateInviteCode(tournamentName);
      
      const newTournament: Tournament = {
        id: Date.now().toString(),
        name: tournamentName,
        location: location,
        description: description,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: 'upcoming',
        teams: [],
        matches: [],
        inviteCode: inviteCode,
        prize: prize,
        createdBy: 'current-user', // In a real app, this would be the current user's ID
      };

      await storageHelper.saveTournament(newTournament);
      
      Alert.alert(
        'Success',
        `Tournament created successfully! Your invite code is: ${inviteCode}`,
        [
          {
            text: 'OK',
            onPress: () => {
              router.push({
                pathname: '/tournament/[id]',
                params: { id: newTournament.id }
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error creating tournament:', error);
      Alert.alert('Error', 'Failed to create tournament. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Create Tournament',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="ml-2">
              <Feather name="arrow-left" size={24} color="#333" />
            </TouchableOpacity>
          )
        }}
      />
      
      <ScrollView className="flex-1 bg-[#f7f2f1] p-4">
        <View className="mb-6">
          <Text className="text-2xl font-semibold mb-4">Create Tournament</Text>
          <Text className="text-gray-600 mb-4">
            Create a tournament and invite teams to participate using your tournament code.
          </Text>
        </View>

        <View className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <Text className="text-sm font-medium mb-1">Tournament Name*</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-3 mb-4"
            value={tournamentName}
            onChangeText={setTournamentName}
            placeholder="Enter tournament name"
          />
          
          <Text className="text-sm font-medium mb-1">Location*</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-3 mb-4"
            value={location}
            onChangeText={setLocation}
            placeholder="Enter location"
          />
          
          <Text className="text-sm font-medium mb-1">Description</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-3 mb-4"
            value={description}
            onChangeText={setDescription}
            placeholder="Enter tournament description"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          
          <Text className="text-sm font-medium mb-1">Prize</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-3 mb-4"
            value={prize}
            onChangeText={setPrize}
            placeholder="Enter prize details"
          />
          
          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              <Text className="text-sm font-medium mb-1">Start Date*</Text>
              <TouchableOpacity
                className="border border-gray-300 rounded-md p-3"
                onPress={() => setShowStartPicker(true)}
              >
                <Text>{startDate.toLocaleDateString()}</Text>
              </TouchableOpacity>
              {showStartPicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowStartPicker(false);
                    if (selectedDate) {
                      setStartDate(selectedDate);
                    }
                  }}
                />
              )}
            </View>
            
            <View className="flex-1">
              <Text className="text-sm font-medium mb-1">End Date*</Text>
              <TouchableOpacity
                className="border border-gray-300 rounded-md p-3"
                onPress={() => setShowEndPicker(true)}
              >
                <Text>{endDate.toLocaleDateString()}</Text>
              </TouchableOpacity>
              {showEndPicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="default"
                  minimumDate={startDate}
                  onChange={(event, selectedDate) => {
                    setShowEndPicker(false);
                    if (selectedDate) {
                      setEndDate(selectedDate);
                    }
                  }}
                />
              )}
            </View>
          </View>
        </View>

        <TouchableOpacity
          className={`bg-[#16aa3e] py-3 rounded-lg ${isLoading ? 'opacity-70' : ''}`}
          onPress={handleCreateTournament}
          disabled={isLoading}
        >
          <Text className="text-white text-center font-semibold">
            {isLoading ? 'Creating...' : 'Create Tournament'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
} 
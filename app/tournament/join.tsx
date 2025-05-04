import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Stack, router } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import storageHelper, { Team } from '../storageHelper';

export default function JoinTournamentScreen() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const loadedTeams = await storageHelper.getTeams();
      setTeams(loadedTeams);
      if (loadedTeams.length > 0) {
        setSelectedTeamId(loadedTeams[0].id);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
      Alert.alert('Error', 'Failed to load teams. Please try again.');
    }
  };

  const handleJoinTournament = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }

    if (!selectedTeamId) {
      Alert.alert('Error', 'Please select a team to join with');
      return;
    }

    setIsLoading(true);
    try {
      const tournament = await storageHelper.joinTournamentByCode(inviteCode, selectedTeamId);

      if (!tournament) {
        Alert.alert('Error', 'Invalid invite code or your team is already participating');
        return;
      }

      Alert.alert('Success', `Your team has joined the tournament: ${tournament.name}!`, [
        {
          text: 'View Tournament',
          onPress: () => {
            router.push({
              pathname: '/tournament/[id]',
              params: { id: tournament.id },
            });
          },
        },
      ]);
    } catch (error) {
      console.error('Error joining tournament:', error);
      Alert.alert('Error', 'Failed to join tournament. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Join Tournament',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-2 rounded-full bg-black/20 p-1">
              <Ionicons name="arrow-back" size={24} color="white" className="" />
            </TouchableOpacity>
          ),
        }}
      />

      <View className="flex-1 bg-[#f7f2f1] p-4">
        <View className="mb-6">
          <Text className="mb-4 font-semibold text-2xl">Join a Tournament</Text>
          <Text className="mb-4 text-gray-600">
            Enter the tournament invite code to join with one of your teams.
          </Text>
        </View>

        <View className="mb-4 rounded-lg bg-white p-4 shadow-sm">
          <Text className="mb-1 font-medium text-sm">Invite Code*</Text>
          <TextInput
            className="mb-2 rounded-md border border-gray-300 p-3"
            value={inviteCode}
            onChangeText={setInviteCode}
            placeholder="Enter tournament invite code"
            autoCapitalize="characters"
          />
          <Text className="mb-4 text-xs text-gray-500">
            This is the code shared by the tournament organizer
          </Text>
        </View>

        <View className="mb-4 rounded-lg bg-white p-4 shadow-sm">
          <Text className="mb-3 font-medium text-sm">Select Team to Join With*</Text>

          {teams.length === 0 ? (
            <View className="items-center py-4">
              <Text className="mb-2 text-gray-500">You don't have any teams yet</Text>
              <TouchableOpacity className="mt-2" onPress={() => router.push('/team/create')}>
                <Text className="text-[#16aa3e]">Create a team first</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={teams}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`mb-2 flex-row items-center rounded-md border p-3 ${
                    selectedTeamId === item.id
                      ? 'border-[#16aa3e] bg-[#16aa3e]/10'
                      : 'border-gray-200'
                  }`}
                  onPress={() => setSelectedTeamId(item.id)}>
                  <View
                    className={`mr-3 h-5 w-5 rounded-full border ${
                      selectedTeamId === item.id
                        ? 'border-[#16aa3e] bg-[#16aa3e]'
                        : 'border-gray-400'
                    }`}>
                    {selectedTeamId === item.id && (
                      <View className="flex-1 items-center justify-center">
                        <Feather name="check" size={12} color="white" />
                      </View>
                    )}
                  </View>
                  <View>
                    <Text className="font-medium">{item.name}</Text>
                    <Text className="text-xs text-gray-500">
                      {item.city} • {item.players.length} players
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        <TouchableOpacity
          className={`rounded-lg bg-[#16aa3e] py-3 ${
            isLoading || teams.length === 0 ? 'opacity-70' : ''
          }`}
          onPress={handleJoinTournament}
          disabled={isLoading || teams.length === 0}>
          <Text className="text-center font-semibold text-white">
            {isLoading ? 'Joining...' : 'Join Tournament'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="mt-4" onPress={() => router.push('/tournament/create')}>
          <Text className="text-center text-[#16aa3e]">
            Don't have a code? Create your own tournament
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

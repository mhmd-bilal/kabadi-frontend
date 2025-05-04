import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Share, ActivityIndicator } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import storageHelper, { Team, Player } from '../storageHelper';

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeam();
  }, [id]);

  const loadTeam = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const loadedTeam = await storageHelper.getTeamById(id as string);
      if (loadedTeam) {
        setTeam(loadedTeam);
      } else {
        Alert.alert('Error', 'Team not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading team:', error);
      Alert.alert('Error', 'Failed to load team details');
    } finally {
      setLoading(false);
    }
  };

  const shareTeamCode = async () => {
    if (!team?.inviteCode) return;
    
    try {
      await Share.share({
        message: `Join my Kabaddi team "${team.name}" with code: ${team.inviteCode}`
      });
    } catch (error) {
      console.error('Error sharing team code:', error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#f7f2f1]">
        <ActivityIndicator size="large" color="#16aa3e" />
      </View>
    );
  }

  if (!team) {
    return (
      <View className="flex-1 justify-center items-center bg-[#f7f2f1]">
        <Text>Team not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: team.name,
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
      
      <View className="flex-1 bg-[#f7f2f1]">
        {/* Team Header */}
        <View className="bg-white p-4 shadow-sm">
          <Text className="text-2xl font-semibold">{team.name}</Text>
          <Text className="text-gray-600 mb-2">{team.city}</Text>
          {team.description && (
            <Text className="text-gray-800 mb-2">{team.description}</Text>
          )}
          
          {team.inviteCode && (
            <View className="flex-row items-center justify-between bg-gray-100 p-3 rounded-lg mt-2">
              <View>
                <Text className="text-xs text-gray-500">TEAM CODE</Text>
                <Text className="font-medium">{team.inviteCode}</Text>
              </View>
              <TouchableOpacity 
                className="bg-[#16aa3e]/20 p-2 rounded-full"
                onPress={shareTeamCode}
              >
                <Feather name="share-2" size={20} color="#16aa3e" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Team Stats */}
        <View className="flex-row bg-white mt-2 p-4 shadow-sm">
          <View className="flex-1 items-center">
            <Text className="text-gray-500 text-xs">PLAYERS</Text>
            <Text className="text-xl font-semibold">{team.players.length}</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-gray-500 text-xs">MATCHES</Text>
            <Text className="text-xl font-semibold">-</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-gray-500 text-xs">TOURNAMENTS</Text>
            <Text className="text-xl font-semibold">-</Text>
          </View>
        </View>
        
        {/* Players List */}
        <View className="flex-1 mt-2 bg-white">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <Text className="font-semibold text-lg">Players</Text>
            <TouchableOpacity className="bg-[#16aa3e]/20 px-3 py-1 rounded-full">
              <Text className="text-[#16aa3e]">+ Add Player</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={team.players}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <View className="p-4 items-center">
                <Text className="text-gray-500">No players added yet</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View className="flex-row items-center p-4 border-b border-gray-100">
                <View className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center mr-3">
                  <Text className="font-semibold">{item.number}</Text>
                </View>
                <Text className="flex-1">{item.name}</Text>
              </View>
            )}
          />
        </View>
      </View>
    </>
  );
} 
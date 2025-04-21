import { Stack } from 'expo-router';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import storageHelper, { Team, Player } from './storageHelper'; // Import from storageHelper

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTeamModalVisible, setTeamModalVisible] = useState(false);
  const [isPlayerModalVisible, setPlayerModalVisible] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamCity, setNewTeamCity] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerNumber, setNewPlayerNumber] = useState('');

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    setLoading(true);
    const loadedTeams = await storageHelper.getTeams();
    setTeams(loadedTeams);
    setLoading(false);
  };

  const addTeam = async () => {
    if (!newTeamName.trim() || !newTeamCity.trim()) return;

    const newTeam: Team = {
      id: Date.now().toString(),
      name: newTeamName,
      city: newTeamCity,
      players: []
    };

    await storageHelper.saveTeam(newTeam);
    setTeams([...teams, newTeam]);
    setNewTeamName('');
    setNewTeamCity('');
    setTeamModalVisible(false);
  };

  const updateTeam = async () => {
    if (!currentTeam || !newTeamName.trim() || !newTeamCity.trim()) return;

    const updatedTeam = {
      ...currentTeam,
      name: newTeamName,
      city: newTeamCity
    };

    await storageHelper.saveTeam(updatedTeam);
    setTeams(teams.map(team => team.id === updatedTeam.id ? updatedTeam : team));
    setNewTeamName('');
    setNewTeamCity('');
    setCurrentTeam(null);
    setTeamModalVisible(false);
  };

  const deleteTeam = async (teamId: string) => {
    await storageHelper.deleteTeam(teamId);
    setTeams(teams.filter(team => team.id !== teamId));
  };

  const editTeam = (team: Team) => {
    setCurrentTeam(team);
    setNewTeamName(team.name);
    setNewTeamCity(team.city);
    setTeamModalVisible(true);
  };

  const addPlayer = async () => {
    if (!currentTeam || !newPlayerName.trim() || !newPlayerNumber.trim()) return;
    
    if (currentTeam.players.length >= 12) {
      alert('Maximum 12 players allowed per team');
      return;
    }

    const newPlayer: Player = {
      id: Date.now().toString(),
      name: newPlayerName,
      number: newPlayerNumber
    };

    const updatedTeam = {
      ...currentTeam,
      players: [...currentTeam.players, newPlayer]
    };

    await storageHelper.saveTeam(updatedTeam);
    setTeams(teams.map(team => team.id === updatedTeam.id ? updatedTeam : team));
    setNewPlayerName('');
    setNewPlayerNumber('');
    setPlayerModalVisible(false);
  };

  const updatePlayer = async () => {
    if (!currentTeam || !currentPlayer || !newPlayerName.trim() || !newPlayerNumber.trim()) return;

    const updatedPlayer = {
      ...currentPlayer,
      name: newPlayerName,
      number: newPlayerNumber
    };

    const updatedTeam = {
      ...currentTeam,
      players: currentTeam.players.map(player => 
        player.id === currentPlayer.id ? updatedPlayer : player
      )
    };

    await storageHelper.saveTeam(updatedTeam);
    setTeams(teams.map(team => team.id === updatedTeam.id ? updatedTeam : team));
    setNewPlayerName('');
    setNewPlayerNumber('');
    setCurrentPlayer(null);
    setPlayerModalVisible(false);
  };

  const deletePlayer = async (teamId: string, playerId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    const updatedTeam = {
      ...team,
      players: team.players.filter(player => player.id !== playerId)
    };

    await storageHelper.saveTeam(updatedTeam);
    setTeams(teams.map(t => t.id === teamId ? updatedTeam : t));
  };

  const showAddPlayerModal = (team: Team) => {
    setCurrentTeam(team);
    setCurrentPlayer(null);
    setNewPlayerName('');
    setNewPlayerNumber('');
    setPlayerModalVisible(true);
  };

  const editPlayer = (team: Team, player: Player) => {
    setCurrentTeam(team);
    setCurrentPlayer(player);
    setNewPlayerName(player.name);
    setNewPlayerNumber(player.number);
    setPlayerModalVisible(true);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="mt-12 flex-1 bg-black p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-regular text-2xl font-bold text-white">Teams</Text>
          <TouchableOpacity 
            className="bg-blue-500 px-4 py-2 rounded-lg"
            onPress={() => {
              setCurrentTeam(null);
              setNewTeamName('');
              setNewTeamCity('');
              setTeamModalVisible(true);
            }}
          >
            <Text className="font-regular text-white font-bold">Add Team</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <Text className="font-regular text-white text-center mt-4">Loading teams...</Text>
        ) : teams.length === 0 ? (
          <Text className="font-regular text-white text-center mt-4">No teams found. Create your first team!</Text>
        ) : (
          <FlatList
            data={teams}
            keyExtractor={(item) => item.id}
            renderItem={({ item: team }) => (
              <View className="bg-gray-800 rounded-lg mb-4 p-4">
                <View className="flex-row justify-between items-center mb-2">
                  <View>
                    <Text className="font-regular text-xl font-bold text-white">{team.name}</Text>
                    <Text className="font-regular text-gray-300">{team.city}</Text>
                  </View>
                  <View className="flex-row">
                    <TouchableOpacity 
                      className="bg-yellow-500 px-3 py-1 rounded-lg mr-2"
                      onPress={() => editTeam(team)}
                    >
                      <Text className="font-regular text-white">Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      className="bg-red-500 px-3 py-1 rounded-lg"
                      onPress={() => deleteTeam(team.id)}
                    >
                      <Text className="font-regular text-white">Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text className="font-regular text-white font-bold mt-2 mb-1">
                  Players ({team.players.length}/12):
                </Text>
                
                {team.players.length === 0 ? (
                  <Text className="font-regular text-gray-400 italic">No players added yet</Text>
                ) : (
                  <View className="mt-1">
                    {team.players.map(player => (
                      <View key={player.id} className="flex-row justify-between items-center py-2 border-t border-gray-700">
                        <View className="flex-row items-center">
                          <View className="bg-gray-600 w-8 h-8 rounded-full items-center justify-center mr-2">
                            <Text className="font-regular text-white font-bold">{player.number}</Text>
                          </View>
                          <Text className="font-regular text-white">{player.name}</Text>
                        </View>
                        <View className="flex-row">
                          <TouchableOpacity 
                            className="bg-blue-500 px-2 py-1 rounded-lg mr-2"
                            onPress={() => editPlayer(team, player)}
                          >
                            <Text className="font-regular text-white text-xs">Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            className="bg-red-500 px-2 py-1 rounded-lg"
                            onPress={() => deletePlayer(team.id, player.id)}
                          >
                            <Text className="font-regular text-white text-xs">Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                <TouchableOpacity 
                  className="bg-green-500 px-3 py-2 rounded-lg mt-3 items-center"
                  onPress={() => showAddPlayerModal(team)}
                  disabled={team.players.length >= 12}
                  style={{ opacity: team.players.length >= 12 ? 0.5 : 1 }}
                >
                  <Text className="font-regular text-white font-bold">
                    {team.players.length >= 12 ? "Max Players Reached" : "Add Player"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}

        {/* Team Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isTeamModalVisible}
          onRequestClose={() => setTeamModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View className="bg-gray-800 p-6 rounded-xl w-5/6">
              <Text className="font-regular text-white text-xl font-bold mb-4">
                {currentTeam ? 'Edit Team' : 'Add Team'}
              </Text>
              
              <Text className="font-regular text-white mb-1">Team Name</Text>
              <TextInput
                className="bg-gray-700 text-white p-2 rounded-lg mb-4"
                placeholder="Enter team name"
                placeholderTextColor="#999"
                value={newTeamName}
                onChangeText={setNewTeamName}
              />
              
              <Text className="font-regular text-white mb-1">City</Text>
              <TextInput
                className="bg-gray-700 text-white p-2 rounded-lg mb-4"
                placeholder="Enter city"
                placeholderTextColor="#999"
                value={newTeamCity}
                onChangeText={setNewTeamCity}
              />
              
              <View className="flex-row justify-end">
                <TouchableOpacity 
                  className="bg-gray-600 px-4 py-2 rounded-lg mr-2"
                  onPress={() => setTeamModalVisible(false)}
                >
                  <Text className="font-regular text-white">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="bg-blue-500 px-4 py-2 rounded-lg"
                  onPress={currentTeam ? updateTeam : addTeam}
                >
                  <Text className="font-regular text-white font-bold">{currentTeam ? 'Update' : 'Create'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Player Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isPlayerModalVisible}
          onRequestClose={() => setPlayerModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View className="bg-gray-800 p-6 rounded-xl w-5/6">
              <Text className="font-regular text-white text-xl font-bold mb-4">
                {currentPlayer ? 'Edit Player' : 'Add Player'}
              </Text>
              
              <Text className="font-regular text-white mb-1">Jersey Number</Text>
              <TextInput
                className="bg-gray-700 text-white p-2 rounded-lg mb-4"
                placeholder="Enter jersey number"
                placeholderTextColor="#999"
                value={newPlayerNumber}
                onChangeText={setNewPlayerNumber}
                keyboardType="numeric"
              />
              
              <Text className="font-regular text-white mb-1">Player Name</Text>
              <TextInput
                className="bg-gray-700 text-white p-2 rounded-lg mb-4"
                placeholder="Enter player name"
                placeholderTextColor="#999"
                value={newPlayerName}
                onChangeText={setNewPlayerName}
              />
              
              <View className="flex-row justify-end">
                <TouchableOpacity 
                  className="bg-gray-600 px-4 py-2 rounded-lg mr-2"
                  onPress={() => setPlayerModalVisible(false)}
                >
                  <Text className="font-regular text-white">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="bg-blue-500 px-4 py-2 rounded-lg"
                  onPress={currentPlayer ? updatePlayer : addPlayer}
                >
                  <Text className="font-regular text-white font-bold">{currentPlayer ? 'Update' : 'Add'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
} 
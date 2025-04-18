import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';

import storageHelper, { Match, Team } from '../storageHelper'; // Import from storageHelper
import { Feather } from '@expo/vector-icons';

// Helper function to format date and time
const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMatchModalVisible, setMatchModalVisible] = useState(false);
  const [isResultModalVisible, setResultModalVisible] = useState(false);

  // Form state for new/edit match
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [homeTeamId, setHomeTeamId] = useState<string>('');
  const [awayTeamId, setAwayTeamId] = useState<string>('');
  const [location, setLocation] = useState('');
  const [groundName, setGroundName] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form state for results
  const [homeScore, setHomeScore] = useState('0');
  const [awayScore, setAwayScore] = useState('0');
  const [bestRaider, setBestRaider] = useState('');
  const [bestDefender, setBestDefender] = useState('');

  // Filter state
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'scheduled' | 'in-progress' | 'completed'
  >('all');

  // Load matches and teams on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    // Load teams first to populate dropdowns
    const loadedTeams = await storageHelper.getTeams();
    setTeams(loadedTeams);

    // Then load matches
    const loadedMatches = await storageHelper.getMatches();
    setMatches(loadedMatches);
    setLoading(false);
  };

  const getTeamById = (id: string): Team | undefined => {
    return teams.find((team) => team.id === id);
  };

  const resetForm = () => {
    setHomeTeamId('');
    setAwayTeamId('');
    setLocation('');
    setGroundName('');
    setStartTime(new Date());
    setHomeScore('0');
    setAwayScore('0');
    setBestRaider('');
    setBestDefender('');
  };

  const addMatch = async () => {
    if (!homeTeamId || !awayTeamId || !location || !groundName) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    if (homeTeamId === awayTeamId) {
      Alert.alert('Validation Error', 'Home and Away teams must be different');
      return;
    }

    const newMatch: Match = {
      id: Date.now().toString(),
      homeTeamId,
      awayTeamId,
      location,
      groundName,
      startTime: startTime.toISOString(),
      status: 'scheduled',
      result: null,
    };

    await storageHelper.saveMatch(newMatch);
    setMatches([...matches, newMatch]);
    resetForm();
    setMatchModalVisible(false);
  };

  const updateMatch = async () => {
    if (!currentMatch || !homeTeamId || !awayTeamId || !location || !groundName) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    if (homeTeamId === awayTeamId) {
      Alert.alert('Validation Error', 'Home and Away teams must be different');
      return;
    }

    const updatedMatch: Match = {
      ...currentMatch,
      homeTeamId,
      awayTeamId,
      location,
      groundName,
      startTime: startTime.toISOString(),
    };

    await storageHelper.saveMatch(updatedMatch);
    setMatches(matches.map((match) => (match.id === updatedMatch.id ? updatedMatch : match)));
    resetForm();
    setCurrentMatch(null);
    setMatchModalVisible(false);
  };

  const deleteMatch = async (matchId: string) => {
    Alert.alert('Delete Match', 'Are you sure you want to delete this match?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await storageHelper.deleteMatch(matchId);
          setMatches(matches.filter((match) => match.id !== matchId));
        },
      },
    ]);
  };

  const editMatch = (match: Match) => {
    setCurrentMatch(match);
    setHomeTeamId(match.homeTeamId);
    setAwayTeamId(match.awayTeamId);
    setLocation(match.location);
    setGroundName(match.groundName);
    setStartTime(new Date(match.startTime));
    setMatchModalVisible(true);
  };

  const updateMatchStatus = async (match: Match, newStatus: Match['status']) => {
    const updatedMatch: Match = {
      ...match,
      status: newStatus,
    };

    await storageHelper.saveMatch(updatedMatch);
    setMatches(matches.map((m) => (m.id === updatedMatch.id ? updatedMatch : m)));
  };

  const showResultsModal = (match: Match) => {
    setCurrentMatch(match);
    if (match.result) {
      setHomeScore(match.result.homeScore.toString());
      setAwayScore(match.result.awayScore.toString());
      setBestRaider(match.result.bestRaider || '');
      setBestDefender(match.result.bestDefender || '');
    } else {
      setHomeScore('0');
      setAwayScore('0');
      setBestRaider('');
      setBestDefender('');
    }
    setResultModalVisible(true);
  };

  const saveMatchResult = async () => {
    if (!currentMatch) return;

    const homeScoreNum = parseInt(homeScore);
    const awayScoreNum = parseInt(awayScore);

    if (isNaN(homeScoreNum) || isNaN(awayScoreNum)) {
      Alert.alert('Invalid Score', 'Please enter valid numbers for scores');
      return;
    }

    // Determine winner based on scores
    let winnerTeamId: string | null = null;
    if (homeScoreNum > awayScoreNum) {
      winnerTeamId = currentMatch.homeTeamId;
    } else if (awayScoreNum > homeScoreNum) {
      winnerTeamId = currentMatch.awayTeamId;
    } else {
      // It's a tie, no winner
      winnerTeamId = null;
    }

    const updatedMatch: Match = {
      ...currentMatch,
      status: 'completed',
      result: {
        homeScore: homeScoreNum,
        awayScore: awayScoreNum,
        winnerTeamId,
        bestRaider: bestRaider.trim() || undefined,
        bestDefender: bestDefender.trim() || undefined,
      },
    };

    await storageHelper.saveMatch(updatedMatch);
    setMatches(matches.map((m) => (m.id === updatedMatch.id ? updatedMatch : m)));
    setResultModalVisible(false);
    resetForm();
  };

  const getFilteredMatches = (): Match[] => {
    if (statusFilter === 'all') return matches;
    return matches.filter((match) => match.status === statusFilter);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="mt-12 flex-1 bg-[#f7f2f1] p-4">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="font-semibold text-2xl text-black">Matches</Text>
          <TouchableOpacity
            className="rounded-md bg-white px-3 py-2 shadow-sm"
            onPress={() => {
              if (teams.length < 2) {
                Alert.alert(
                  'Need Teams',
                  'You need at least 2 teams to create a match. Add teams first.'
                );
                return;
              }
              setCurrentMatch(null);
              resetForm();
              setHomeTeamId(teams[0]?.id || '');
              setAwayTeamId(teams[1]?.id || '');
              setMatchModalVisible(true);
            }}>
            <Text className="font-regular text-black">+ Start Match</Text>
          </TouchableOpacity>
        </View>

        {/* Filter controls */}
        <View className="sticky mb-4 mt-4 flex-row justify-around bg-transparent">
          {['all', 'scheduled', 'in-progress', 'completed'].map((status) => (
            <TouchableOpacity
              key={status}
              className={`border-b-2 px-3 pb-2 ${
                statusFilter === status ? 'border-[#16aa3e]' : 'border-transparent'
              }`}
              onPress={() => setStatusFilter(status)}>
              <Text
                className={`font-regular text-sm ${
                  statusFilter === status ? 'text-[#16aa3e]' : 'text-gray-400'
                }`}>
                {status === 'in-progress'
                  ? 'In Progress'
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <Text className="mt-4 text-center font-regular text-[#f7f2f1]">Loading matches...</Text>
        ) : getFilteredMatches().length === 0 ? (
          <Text className="mt-4 text-center font-regular text-[#f7f2f1]">
            {teams.length < 2
              ? 'Please add at least 2 teams before creating matches.'
              : 'No matches found. Create your first match!'}
          </Text>
        ) : (
          <FlatList
            data={getFilteredMatches()}
            className="overflow-visible"
            removeClippedSubviews={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item: match }) => {
              const homeTeam = getTeamById(match.homeTeamId);
              const awayTeam = getTeamById(match.awayTeamId);

              // Skip rendering if we can't find the teams
              if (!homeTeam || !awayTeam) {
                return null;
              }

              return (
                <View className={`mb-4 rounded-md border border-gray-200 bg-white p-4 shadow-lg `}>
                  <View className="mb-2 flex-row items-center justify-between">
                    <View>
                      <Text className="mb-1 font-regular text-sm text-black">
                        {formatDateTime(match.startTime)}
                      </Text>
                      <Text className="font-regular text-sm text-black">
                        {match.location} - {match.groundName}
                      </Text>
                    </View>
                    <View>
                      <Text
                        className={`rounded-full px-4 py-2 text-center font-regular text-xs ${
                          match.status === 'scheduled'
                            ? 'bg-[#aa1d16] text-white'
                            : match.status === 'in-progress'
                              ? 'bg-[#aaa516] text-white'
                              : 'bg-[#16aa3e] text-white'
                        }`}>
                        {match.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View className="my-2 flex-row items-center justify-between rounded-md bg-white p-3">
                    <View className="flex-1 items-center">
                      <Text className="font-regular font-semibold text-lg text-black">
                        {match?.result?.winnerTeamId
                          ? getTeamById(match.result.winnerTeamId)?.name === homeTeam.name
                            ? homeTeam.name + ' 👑'
                            : 'Match Tied'
                          : homeTeam.name}
                      </Text>

                      <Text className="font-regular text-xs text-gray-800">{homeTeam.city}</Text>
                    </View>

                    <View className="items-center px-4">
                      {match.result ? (
                        <View className="flex-row items-center">
                          <Text className="font-regular text-xl text-black">
                            {match.result.homeScore}
                          </Text>
                          <Text className="mx-1 font-regular text-gray-800">-</Text>
                          <Text className="font-regular text-xl text-black">
                            {match.result.awayScore}
                          </Text>
                        </View>
                      ) : (
                        <Text className="font-regular text-black">VS</Text>
                      )}
                    </View>

                    <View className="flex-1 items-center">
                      <Text className="font-regular font-semibold text-lg text-black">
                        {match?.result?.winnerTeamId
                          ? getTeamById(match.result.winnerTeamId)?.name === awayTeam.name
                            ? awayTeam.name + ' 👑'
                            : 'Match Tied'
                          : awayTeam.name}
                      </Text>
                      <Text className="font-regular text-xs text-gray-800">{awayTeam.city}</Text>
                    </View>
                  </View>

                  {/* {match.result && (
                    <View className="mb-3 rounded-md bg-gray-700 p-3">
                      <Text className="mb-1 font-regular font-semibold text-[#f7f2f1]">
                        {match.result.winnerTeamId
                          ? `Winner: ${getTeamById(match.result.winnerTeamId)?.name}`
                          : 'Match Tied'}
                      </Text>
                      {match.result.bestRaider && (
                        <Text className="font-regular text-xs text-gray-300">
                          Best Raider: {match.result.bestRaider}
                        </Text>
                      )}
                      {match.result.bestDefender && (
                        <Text className="font-regular text-xs text-gray-300">
                          Best Defender: {match.result.bestDefender}
                        </Text>
                      )}
                    </View>
                  )} */}

                  <View className="mt-2 flex-row justify-between">
                    <View className="flex-row">
                      <TouchableOpacity
                        className="mr-1 flex flex-row items-center justify-center gap-2 rounded-md px-3 py-1"
                        onPress={() => editMatch(match)}>
                        <Feather name="edit" size={12} color="#aa9416" />
                        <Text className="font-regular text-[#aa9416]">Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="flex flex-row items-center justify-center gap-2 rounded-md px-3 py-1"
                        onPress={() => deleteMatch(match.id)}>
                        <Feather name="trash" size={12} color="#aa1d16" />

                        <Text className="font-regular text-[#aa1d16]">Delete</Text>
                      </TouchableOpacity>
                    </View>

                    <View className="flex-row items-center justify-end">
                      {match.status === 'scheduled' && (
                        <TouchableOpacity
                          className="mr-2 py-1"
                          onPress={() => updateMatchStatus(match, 'in-progress')}>
                          <Text className="text-right font-regular text-[#16aa3e]">
                            Start Match
                          </Text>
                        </TouchableOpacity>
                      )}

                      {match.status === 'in-progress' && (
                        <TouchableOpacity
                          className="mr-2 py-1"
                          onPress={() => showResultsModal(match)}>
                          <Text className="text-right font-regular text-[#aa1d16]">
                            End & Add Results
                          </Text>
                        </TouchableOpacity>
                      )}

                      {match.status === 'completed' && (
                        <TouchableOpacity
                          className="py-1"
                          onPress={() => showResultsModal(match)}>
                          <Text className="text-right font-regular text-[#aa9416]">
                            Update Results
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            }}
          />
        )}

        {/* Match Create/Edit Modal */}
        <Modal
          animationType="slide"
          transparent
          visible={isMatchModalVisible}
          onRequestClose={() => setMatchModalVisible(false)}>
          <View
            className="flex-1 items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View className="max-h-5/6 w-11/12 rounded-xl bg-gray-800 p-6">
              <ScrollView>
                <Text className="mb-4 font-regular font-semibold text-xl text-[#f7f2f1]">
                  {currentMatch ? 'Edit Match' : 'Create New Match'}
                </Text>

                <Text className="mb-1 font-regular text-[#f7f2f1]">Home Team</Text>
                <View className="mb-4 rounded-md bg-gray-700">
                  <Picker
                    selectedValue={homeTeamId}
                    style={{ color: '[#f7f2f1]' }}
                    dropdownIconColor="[#f7f2f1]"
                    onValueChange={(itemValue) => setHomeTeamId(itemValue)}>
                    <Picker.Item label="Select Home Team" value="" />
                    {teams.map((team) => (
                      <Picker.Item
                        key={team.id}
                        label={`${team.name} (${team.city})`}
                        value={team.id}
                      />
                    ))}
                  </Picker>
                </View>

                <Text className="mb-1 font-regular text-[#f7f2f1]">Away Team</Text>
                <View className="mb-4 rounded-md bg-gray-700">
                  <Picker
                    selectedValue={awayTeamId}
                    style={{ color: '[#f7f2f1]' }}
                    dropdownIconColor="[#f7f2f1]"
                    onValueChange={(itemValue) => setAwayTeamId(itemValue)}>
                    <Picker.Item label="Select Away Team" value="" />
                    {teams.map((team) => (
                      <Picker.Item
                        key={team.id}
                        label={`${team.name} (${team.city})`}
                        value={team.id}
                      />
                    ))}
                  </Picker>
                </View>

                <Text className="mb-1 font-regular text-[#f7f2f1]">Location</Text>
                <TextInput
                  className="mb-4 rounded-md bg-gray-700 p-2 text-[#f7f2f1]"
                  placeholder="Enter location (e.g., City)"
                  placeholderTextColor="#999"
                  value={location}
                  onChangeText={setLocation}
                />

                <Text className="mb-1 font-regular text-[#f7f2f1]">Ground Name</Text>
                <TextInput
                  className="mb-4 rounded-md bg-gray-700 p-2 text-[#f7f2f1]"
                  placeholder="Enter ground name"
                  placeholderTextColor="#999"
                  value={groundName}
                  onChangeText={setGroundName}
                />

                <Text className="mb-1 font-regular text-[#f7f2f1]">Start Date & Time</Text>
                <TouchableOpacity
                  className="mb-4 rounded-md bg-gray-700 p-2"
                  onPress={() => setShowDatePicker(true)}>
                  <Text className="font-regular text-[#f7f2f1]">{startTime.toLocaleString()}</Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={startTime}
                    mode="datetime"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setStartTime(selectedDate);
                      }
                    }}
                  />
                )}

                <View className="flex-row justify-end">
                  <TouchableOpacity
                    className="mr-2 rounded-md bg-gray-600 px-4 py-2"
                    onPress={() => {
                      resetForm();
                      setMatchModalVisible(false);
                    }}>
                    <Text className="font-regular text-[#f7f2f1]">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="rounded-md bg-blue-500 px-4 py-2"
                    onPress={currentMatch ? updateMatch : addMatch}>
                    <Text className="font-regular font-semibold text-[#f7f2f1]">
                      {currentMatch ? 'Update' : 'Create'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Match Results Modal */}
        <Modal
          animationType="slide"
          transparent
          visible={isResultModalVisible}
          onRequestClose={() => setResultModalVisible(false)}>
          <View
            className="flex-1 items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View className="w-5/6 rounded-xl bg-gray-800 p-6">
              <Text className="mb-4 font-regular font-semibold text-xl text-[#f7f2f1]">
                Match Results
              </Text>

              {currentMatch && (
                <View className="mb-4 rounded-md bg-gray-700 p-3">
                  <Text className="text-center font-regular text-[#f7f2f1]">
                    {getTeamById(currentMatch.homeTeamId)?.name} vs{' '}
                    {getTeamById(currentMatch.awayTeamId)?.name}
                  </Text>
                </View>
              )}

              <View className="mb-4 flex-row justify-between">
                <View className="mr-2 flex-1">
                  <Text className="mb-1 font-regular text-[#f7f2f1]">Home Team Score</Text>
                  <TextInput
                    className="rounded-md bg-gray-700 p-2 text-[#f7f2f1]"
                    placeholder="0"
                    placeholderTextColor="#999"
                    value={homeScore}
                    onChangeText={setHomeScore}
                    keyboardType="numeric"
                  />
                </View>

                <View className="ml-2 flex-1">
                  <Text className="mb-1 font-regular text-[#f7f2f1]">Away Team Score</Text>
                  <TextInput
                    className="rounded-md bg-gray-700 p-2 text-[#f7f2f1]"
                    placeholder="0"
                    placeholderTextColor="#999"
                    value={awayScore}
                    onChangeText={setAwayScore}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text className="mb-1 font-regular text-[#f7f2f1]">Best Raider (optional)</Text>
              <TextInput
                className="mb-4 rounded-md bg-gray-700 p-2 text-[#f7f2f1]"
                placeholder="Enter best raider name"
                placeholderTextColor="#999"
                value={bestRaider}
                onChangeText={setBestRaider}
              />

              <Text className="mb-1 font-regular text-[#f7f2f1]">Best Defender (optional)</Text>
              <TextInput
                className="mb-4 rounded-md bg-gray-700 p-2 text-[#f7f2f1]"
                placeholder="Enter best defender name"
                placeholderTextColor="#999"
                value={bestDefender}
                onChangeText={setBestDefender}
              />

              <View className="flex-row justify-end">
                <TouchableOpacity
                  className="mr-2 rounded-md bg-gray-600 px-4 py-2"
                  onPress={() => setResultModalVisible(false)}>
                  <Text className="font-regular text-[#f7f2f1]">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="rounded-md bg-blue-500 px-4 py-2"
                  onPress={saveMatchResult}>
                  <Text className="font-regular font-semibold text-[#f7f2f1]">Save Results</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

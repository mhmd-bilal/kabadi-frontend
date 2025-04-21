import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Stack, router } from 'expo-router';
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
import DropDownPicker from 'react-native-dropdown-picker';
import StatusDropdown from '~/components/StatusFilter';
import TeamDropdown from '~/components/TeamFilter';
import TournamentDropdown from '~/components/TournamentFilter';

interface StatusDropdownProps {
  statusFilter: 'all' | 'scheduled' | 'in-progress' | 'completed';
  setStatusFilter: React.Dispatch<
    React.SetStateAction<'all' | 'scheduled' | 'in-progress' | 'completed'>
  >;
}

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
  const [spaceFilter, setSpaceFilter] = useState<'matches' | 'teams' | 'tournaments'>('matches');

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

  const [teamFilter, setTeamFilter] = useState<'all' | 'joined' | 'invitations' | 'left'>('all');

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    setLoading(true);
    const loadedTeams = await storageHelper.getTeams();
    setTeams(loadedTeams);
    setLoading(false);
  };

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
      <View className="mt-6 flex-1 bg-[#f7f2f1] p-4 pt-6">
        <View className="mb-4 flex-row items-center justify-start gap-2">
          {/* <Feather name="zap" size={16} color="black" /> */}

          <Text className="font-semibold text-2xl text-black">My Space</Text>
          {/* <TouchableOpacity
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
          </TouchableOpacity> */}
        </View>

        <View className="sticky mb-4 mt-0 flex-row justify-start bg-transparent">
          {['matches', 'teams', 'tournaments'].map((status) => {
            const isActive = spaceFilter === status;
            return (
              <TouchableOpacity
                key={status}
                onPress={() => setSpaceFilter(status as any)}
                className="mr-4">
                <View className="relative pb-2">
                  <Text
                    className={`text-left font-regular text-sm transition-all duration-200 ${
                      isActive ? 'text-[#16aa3e]' : 'text-gray-400'
                    }`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>

                  <View
                    className={`z-1 absolute bottom-0 left-0 h-[2px] w-full transition-all duration-300 ${
                      isActive ? 'bg-[#16aa3e]' : 'bg-transparent'
                    }`}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
          <View
            className={`bg-[#505050]/10} absolute bottom-0 left-0 z-0 h-[2px] w-full transition-all duration-300`}
          />
        </View>

        {spaceFilter === 'matches' && (
          <>
            {/* Filter controls */}
            <View className="w-full flex-row items-end justify-between gap-4">
              <Text className="mb-4 font-regular text-sm text-black/80">
                Filter
              </Text>
              <View className="max-w-[160px] flex-1">
                <StatusDropdown
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter as any}
                />
              </View>
            </View>

            {/* <View className="mb-4 flex-row justify-between bg-black/5 rounded-full p-2 gap-2">
                            {['all', 'scheduled', 'in-progress', 'completed'].map((status) => {
                                const isActive = statusFilter === status;
                                return (
                                    <TouchableOpacity
                                        key={status}
                                        onPress={() => setStatusFilter(status as any)}
                                        className={`px-3 py-1 rounded-full border transition-all duration-200 ${isActive
                                            ? 'bg-[#16aa3e]/20 border-[#16aa3e]'
                                            : 'bg-gray-100 border-transparent'
                                            }`}
                                    >
                                        <Text
                                            className={`font-regular text-sm transition-all duration-200 ${isActive ? 'text-[#16aa3e]' : 'text-gray-500'
                                                }`}
                                        >
                                            {status === 'in-progress'
                                                ? 'In Progress'
                                                : status.charAt(0).toUpperCase() + status.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View> */}

            {loading ? (
              <Text className="mt-4 text-center font-regular text-[#f7f2f1]">
                Loading matches...
              </Text>
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

                  if (!homeTeam || !awayTeam) {
                    return null;
                  }

                  return (
                    <TouchableOpacity 
                      activeOpacity={0.7}
                      onPress={() => router.push({pathname: '/match/[id]', params: {id: match.id}})}>
                      <View
                        className={`mb-4 rounded-md border border-gray-200 bg-white p-4 shadow-lg `}>
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
                                  ? 'bg-[#aa1d16]/20 text-[#aa1d16]'
                                  : match.status === 'in-progress'
                                    ? 'bg-[#aaa516]/20 text-[#aaa516]'
                                    : 'bg-[#16aa3e]/20 text-[#16aa3e]'
                              }`}>
                              {match.status.toUpperCase()}
                            </Text>
                          </View>
                        </View>

                        <View className="my-1 flex-row items-center justify-between rounded-md bg-white p-3">
                          <View className="flex-1 items-center">
                            <Text
                              className="font-regular font-semibold text-lg text-black"
                              numberOfLines={1}>
                              {match?.result?.winnerTeamId
                                ? getTeamById(match.result.winnerTeamId)?.name === homeTeam.name
                                  ? homeTeam.name + ' 👑'
                                  : homeTeam.name
                                : homeTeam.name}
                            </Text>

                            <Text className="font-regular text-xs text-gray-800">
                              {homeTeam.city}
                            </Text>
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
                            <Text
                              className="font-regular font-semibold text-lg text-black"
                              numberOfLines={1}>
                              {match?.result?.winnerTeamId
                                ? getTeamById(match.result.winnerTeamId)?.name === awayTeam.name
                                  ? awayTeam.name + ' 👑'
                                  : awayTeam.name
                                : awayTeam.name}
                            </Text>
                            <Text className="font-regular text-xs text-gray-800">
                              {awayTeam.city}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </>
        )}

        {spaceFilter === 'teams' && (
          <>
            <View className="w-full flex-row items-end justify-between gap-4">
              <Text className="mb-4 font-regular text-sm text-black/80">
                Filter teams based on status
              </Text>
              <View className="max-w-[160px] flex-1">
                <TeamDropdown statusFilter={teamFilter} setStatusFilter={setTeamFilter} />
              </View>
            </View>

            {loading ? (
              <Text className="mt-4 text-center font-regular text-[#f7f2f1]">
                Loading matches...
              </Text>
            ) : teams.length === 0 ? (
              <Text className="mt-4 text-center font-regular text-[#f7f2f1]">No teams found.</Text>
            ) : (
              <FlatList
                data={teams}
                keyExtractor={(item) => item.id}
                renderItem={({ item: team }) => (
                  <View className="mb-4 flex flex-row items-center justify-between rounded-md bg-white p-4 shadow-md">
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="font-regular text-xl  text-black">{team.name}</Text>
                        <Text className="font-regular text-black/70">{team.city}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      className="border-1 items-center rounded-lg border-[#16aa3e] bg-[#16aa3e]/10 px-3 py-2"
                      disabled={team.players.length >= 12}
                      style={{ opacity: team.players.length >= 12 ? 0.5 : 1 }}>
                      <Text className="font-regular text-black/90 ">Join Team</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </>
        )}

        {spaceFilter === 'tournaments' && (
          <>
            <View className="w-full flex-row items-end justify-between gap-4">
              <Text className="mb-4 font-regular text-sm text-black/80">
                Filter tournaments based on status
              </Text>
              <View className="max-w-[160px] flex-1">
                <TournamentDropdown statusFilter={teamFilter} setStatusFilter={setTeamFilter} />
              </View>
            </View>

            {loading ? (
              <Text className="mt-4 text-center font-regular text-[#f7f2f1]">
                Loading tournaments...
              </Text>
            ) : teams.length === 0 ? (
              <Text className="mt-4 text-center font-regular text-[#f7f2f1]">
                No tournaments found.
              </Text>
            ) : (
              <FlatList
                data={teams}
                keyExtractor={(item) => item.id}
                renderItem={({ item: team }) => (
                  <View className="mb-4 flex flex-row items-center justify-between rounded-md bg-white p-4 shadow-md">
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="font-regular text-xl  text-black">{team.name}</Text>
                        <Text className="font-regular text-black/70">{team.city}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      className="border-1 items-center rounded-lg border-[#16aa3e] bg-[#16aa3e]/10 px-3 py-2"
                      disabled={team.players.length >= 12}
                      style={{ opacity: team.players.length >= 12 ? 0.5 : 1 }}>
                      <Text className="font-regular text-black/90 ">View Detail</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </>
        )}
      </View>
    </>
  );
}

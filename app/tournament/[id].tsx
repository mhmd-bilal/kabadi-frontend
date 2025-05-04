import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import storageHelper, { Tournament, Team, Match } from '../storageHelper';

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'matches'>('overview');

  useEffect(() => {
    loadTournament();
  }, [id]);

  const loadTournament = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const loadedTournament = await storageHelper.getTournamentById(id as string);
      if (loadedTournament) {
        setTournament(loadedTournament);

        // Load all teams participating in the tournament
        const tournamentTeams: Team[] = [];
        for (const teamId of loadedTournament.teams) {
          const team = await storageHelper.getTeamById(teamId);
          if (team) tournamentTeams.push(team);
        }
        setTeams(tournamentTeams);

        // Load all matches in the tournament
        const tournamentMatches: Match[] = [];
        for (const matchId of loadedTournament.matches) {
          const match = await storageHelper.getMatchById(matchId);
          if (match) tournamentMatches.push(match);
        }
        setMatches(tournamentMatches);
      } else {
        Alert.alert('Error', 'Tournament not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading tournament:', error);
      Alert.alert('Error', 'Failed to load tournament details');
    } finally {
      setLoading(false);
    }
  };

  const shareTournamentCode = async () => {
    if (!tournament?.inviteCode) return;

    try {
      await Share.share({
        message: `Join my Kabaddi tournament "${tournament.name}" with code: ${tournament.inviteCode}`,
      });
    } catch (error) {
      console.error('Error sharing tournament code:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f7f2f1]">
        <ActivityIndicator size="large" color="#16aa3e" />
      </View>
    );
  }

  if (!tournament) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f7f2f1]">
        <Text>Tournament not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: tournament.name,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-2 rounded-full bg-black/20 p-1">
              <Ionicons name="arrow-back" size={24} color="white" className="" />
            </TouchableOpacity>
          ),
        }}
      />

      <View className="flex-1 bg-[#f7f2f1]">
        {/* Tournament Header */}
        <View className="bg-white p-4 shadow-sm">
          <Text className="font-semibold text-2xl">{tournament.name}</Text>
          <Text className="mb-1 text-gray-600">{tournament.location}</Text>
          <Text className="mb-2 text-sm text-gray-500">
            {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
          </Text>

          {tournament.description && (
            <Text className="mb-2 text-gray-800">{tournament.description}</Text>
          )}

          {tournament.prize && (
            <View className="mb-2 rounded-md bg-[#16aa3e]/10 p-2">
              <Text className="font-medium text-[#16aa3e]">Prize: {tournament.prize}</Text>
            </View>
          )}

          {tournament.inviteCode && (
            <View className="mt-2 flex-row items-center justify-between rounded-lg bg-gray-100 p-3">
              <View>
                <Text className="text-xs text-gray-500">TOURNAMENT CODE</Text>
                <Text className="font-medium">{tournament.inviteCode}</Text>
              </View>
              <TouchableOpacity
                className="rounded-full bg-[#16aa3e]/20 p-2"
                onPress={shareTournamentCode}>
                <Feather name="share-2" size={20} color="#16aa3e" />
              </TouchableOpacity>
            </View>
          )}

          <View className="mt-3 flex-row items-center">
            <View className="rounded-full bg-[#16aa3e]/10 px-3 py-1">
              <Text className="font-medium text-xs text-[#16aa3e]">
                {tournament.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Tournament Stats */}
        <View className="mt-2 flex-row bg-white p-4 shadow-sm">
          <View className="flex-1 items-center">
            <Text className="text-xs text-gray-500">TEAMS</Text>
            <Text className="font-semibold text-xl">{teams.length}</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-xs text-gray-500">MATCHES</Text>
            <Text className="font-semibold text-xl">{matches.length}</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-xs text-gray-500">DAYS</Text>
            <Text className="font-semibold text-xl">
              {Math.round(
                (new Date(tournament.endDate).getTime() -
                  new Date(tournament.startDate).getTime()) /
                  (1000 * 60 * 60 * 24)
              )}
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="mt-2 flex-row border-b border-gray-200 bg-white">
          {(['overview', 'teams', 'matches'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`flex-1 py-3 ${activeTab === tab ? 'border-b-2 border-[#16aa3e]' : ''}`}
              onPress={() => setActiveTab(tab)}>
              <Text
                className={`text-center font-medium ${
                  activeTab === tab ? 'text-[#16aa3e]' : 'text-gray-500'
                }`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View className="flex-1 bg-white">
          {activeTab === 'overview' && (
            <View className="p-4">
              <Text className="mb-2 font-semibold text-lg">Tournament Rules</Text>
              {tournament.rules && tournament.rules.length > 0 ? (
                <FlatList
                  data={tournament.rules}
                  keyExtractor={(item, index) => `rule-${index}`}
                  renderItem={({ item, index }) => (
                    <View className="mb-2 flex-row">
                      <Text className="mr-2">•</Text>
                      <Text className="flex-1">{item}</Text>
                    </View>
                  )}
                />
              ) : (
                <Text className="text-gray-500">No rules specified</Text>
              )}
            </View>
          )}

          {activeTab === 'teams' && (
            <FlatList
              data={teams}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <View className="items-center justify-center p-4">
                  <Text className="text-gray-500">No teams have joined yet</Text>
                  <TouchableOpacity
                    className="mt-2 rounded-full bg-[#16aa3e]/10 px-3 py-1"
                    onPress={shareTournamentCode}>
                    <Text className="text-[#16aa3e]">Share Invite Code</Text>
                  </TouchableOpacity>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="border-b border-gray-100 p-4"
                  onPress={() =>
                    router.push({
                      pathname: '/team/[id]',
                      params: { id: item.id },
                    })
                  }>
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="font-medium text-lg">{item.name}</Text>
                      <Text className="text-gray-500">{item.city}</Text>
                      <Text className="text-xs text-gray-400">{item.players.length} players</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="#999" />
                  </View>
                </TouchableOpacity>
              )}
            />
          )}

          {activeTab === 'matches' && (
            <FlatList
              data={matches}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <View className="items-center justify-center p-4">
                  <Text className="text-gray-500">No matches scheduled yet</Text>
                </View>
              }
              renderItem={({ item }) => {
                const homeTeam = teams.find((team) => team.id === item.homeTeamId);
                const awayTeam = teams.find((team) => team.id === item.awayTeamId);

                if (!homeTeam || !awayTeam) return null;

                return (
                  <TouchableOpacity
                    className="border-b border-gray-100 p-4"
                    onPress={() =>
                      router.push({
                        pathname: '/match/[id]',
                        params: { id: item.id },
                      })
                    }>
                    <View className="mb-1">
                      <Text className="text-xs text-gray-500">
                        {new Date(item.startTime).toLocaleString()}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {item.location} • {item.groundName}
                      </Text>
                    </View>

                    <View className="mt-2 flex-row items-center justify-between">
                      <View className="flex-1 items-center">
                        <Text className="font-medium" numberOfLines={1}>
                          {homeTeam.name}
                        </Text>
                      </View>

                      <View className="px-3">
                        {item.result ? (
                          <Text className="font-semibold">
                            {item.result.homeScore} - {item.result.awayScore}
                          </Text>
                        ) : (
                          <Text className="text-gray-500">VS</Text>
                        )}
                      </View>

                      <View className="flex-1 items-center">
                        <Text className="font-medium" numberOfLines={1}>
                          {awayTeam.name}
                        </Text>
                      </View>
                    </View>

                    <View className="mt-2 items-center">
                      <View
                        className={`rounded-full px-2 py-0.5 ${
                          item.status === 'scheduled'
                            ? 'bg-yellow-100'
                            : item.status === 'in-progress'
                              ? 'bg-blue-100'
                              : 'bg-green-100'
                        }`}>
                        <Text
                          className={`text-xs ${
                            item.status === 'scheduled'
                              ? 'text-yellow-700'
                              : item.status === 'in-progress'
                                ? 'text-blue-700'
                                : 'text-green-700'
                          }`}>
                          {item.status.toUpperCase().replace('-', ' ')}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </View>
    </>
  );
}

import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import storageHelper, { Match, Team, Player } from '../storageHelper';

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

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams();
  const [match, setMatch] = useState<Match | null>(null);
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatchData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const matchData = await storageHelper.getMatchById(id as string);
        if (matchData) {
          setMatch(matchData);

          // Load team data
          const home = await storageHelper.getTeamById(matchData.homeTeamId);
          const away = await storageHelper.getTeamById(matchData.awayTeamId);

          if (home) setHomeTeam(home);
          if (away) setAwayTeam(away);
        }
      } catch (error) {
        console.error('Error loading match:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMatchData();
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#16aa3e" />
      </View>
    );
  }

  if (!match || !homeTeam || !awayTeam) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text className="text-center font-semibold text-lg">Match not found</Text>
        <TouchableOpacity
          className="mt-4 rounded-full bg-[#16aa3e] px-4 py-2"
          onPress={() => router.back()}>
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `${homeTeam.name} vs ${awayTeam.name}`,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color="white" className="mr-2" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView className="flex-1 bg-[#f7f2f1] p-4">
        {/* Match Header with Status */}
        <View className="mb-4 rounded-md bg-white p-4 shadow-sm ">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="font-semibold text-lg">Match Details</Text>
            <View
              className={`rounded-full px-3 py-1 ${
                match.status === 'scheduled'
                  ? 'bg-[#aa1d16]/20'
                  : match.status === 'in-progress'
                    ? 'bg-[#aaa516]/20'
                    : 'bg-[#16aa3e]/20'
              }`}>
              <Text
                className={`font-medium text-xs ${
                  match.status === 'scheduled'
                    ? 'text-[#aa1d16]'
                    : match.status === 'in-progress'
                      ? 'text-[#aaa516]'
                      : 'text-[#16aa3e]'
                }`}>
                {match.status === 'in-progress' ? 'LIVE' : match.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <View className="mb-2 flex-row items-center">
            <Feather name="calendar" size={16} color="#666" />
            <Text className="ml-2 text-gray-700">{formatDateTime(match.startTime)}</Text>
          </View>

          <View className="flex-row items-center">
            <Feather name="map-pin" size={16} color="#666" />
            <Text className="ml-2 text-gray-700">
              {match.location} - {match.groundName}
            </Text>
          </View>
        </View>

        {/* Teams and Score */}
        <View className="mb-4 rounded-md bg-white p-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 items-center">
              <Text className="font-bold text-lg" numberOfLines={1}>
                {homeTeam.name}
              </Text>
              <Text className="text-xs text-gray-600">{homeTeam.city}</Text>
            </View>

            {match.status === 'scheduled' ? (
              <View className="px-4">
                <Text className="font-semibold text-lg">VS</Text>
              </View>
            ) : (
              <View className="rounded-md bg-gray-100 px-5 py-2">
                <Text className="font-bold text-xl">
                  {match.status === 'in-progress' ? '32' : match.result?.homeScore} -{' '}
                  {match.status === 'in-progress' ? '28' : match.result?.awayScore}
                </Text>
                {match.status === 'in-progress' && (
                  <View className="mt-1 flex-row items-center justify-center">
                    <View className="mr-1 h-2 w-2 rounded-full bg-red-500" />
                    <Text className="font-medium text-xs text-red-500">LIVE</Text>
                  </View>
                )}
              </View>
            )}

            <View className="flex-1 items-center">
              <Text className="font-bold text-lg" numberOfLines={1}>
                {awayTeam.name}
              </Text>
              <Text className="text-xs text-gray-600">{awayTeam.city}</Text>
            </View>
          </View>

          {match.status === 'completed' && match.result && (
            <View className="mt-4 border-t border-gray-200 pt-4">
              <Text className="mb-2 text-center font-semibold">
                {match.result.winnerTeamId
                  ? `${match.result.winnerTeamId === homeTeam.id ? homeTeam.name : awayTeam.name} won the match`
                  : 'Match Tied'}
              </Text>
              {(match.result.bestRaider || match.result.bestDefender) && (
                <View className="mt-2 flex-row justify-around">
                  {match.result.bestRaider && (
                    <View className="items-center">
                      <MaterialCommunityIcons name="run-fast" size={20} color="#aa9416" />
                      <Text className="mt-1 text-xs text-gray-700">Best Raider</Text>
                      <Text className="font-medium">{match.result.bestRaider}</Text>
                    </View>
                  )}
                  {match.result.bestDefender && (
                    <View className="items-center">
                      <MaterialCommunityIcons name="shield" size={20} color="#16aa3e" />
                      <Text className="mt-1 text-xs text-gray-700">Best Defender</Text>
                      <Text className="font-medium">{match.result.bestDefender}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Live Match Status (Only shown when match is live) */}
        {match.status === 'in-progress' && (
          <View className="mb-4 rounded-md bg-white p-4 shadow-sm">
            <Text className="mb-3 font-semibold text-lg">Live Updates</Text>

            <View className="mb-4">
              <Text className="mb-2 font-medium">Current Raid</Text>
              <View className="rounded-md bg-gray-100 p-3">
                <View className="flex-row items-center justify-between">
                  <Text className="font-medium">{homeTeam.name}</Text>
                  <Text className="font-bold">Raiding</Text>
                </View>
                <View className="mt-2 flex-row items-center">
                  <View className="mr-1 h-2 w-2 rounded-full bg-green-500" />
                  <Text className="text-xs text-gray-600">Arjun Singh is raiding</Text>
                </View>
                <View className="mt-2 border-t border-gray-200 pt-2">
                  <Text className="text-center text-xs">Raid Timer: 28s</Text>
                </View>
              </View>
            </View>

            <View className="mb-2 flex-row justify-between">
              <Text className="font-medium">Recent Points</Text>
              <TouchableOpacity>
                <Text className="text-sm text-[#16aa3e]">View All</Text>
              </TouchableOpacity>
            </View>

            <View className="space-y-2">
              {[
                {
                  team: homeTeam.name,
                  action: 'Successful Raid',
                  player: 'Arjun Singh',
                  time: '2m ago',
                },
                {
                  team: awayTeam.name,
                  action: 'Successful Tackle',
                  player: 'Vikram Rathore',
                  time: '4m ago',
                },
                { team: homeTeam.name, action: 'All Out', player: '', time: '6m ago' },
              ].map((update, index) => (
                <View key={index} className="flex-row justify-between rounded-md bg-gray-50 p-2">
                  <View className="flex-row items-center">
                    <View
                      className={`mr-2 h-2 w-2 rounded-full ${update.team === homeTeam.name ? 'bg-blue-500' : 'bg-red-500'}`}
                    />
                    <Text className="font-medium text-sm">{update.action}</Text>
                    {update.player && (
                      <Text className="ml-1 text-xs text-gray-600">({update.player})</Text>
                    )}
                  </View>
                  <Text className="text-xs text-gray-500">{update.time}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Team Lineups */}
        <View className="mb-4 rounded-md bg-white p-4 shadow-sm">
          <Text className="mb-3 font-semibold text-lg">Team Lineups</Text>

          <View className="mb-4">
            <Text className="mb-2 font-medium text-[#16aa3e]">{homeTeam.name}</Text>
            {homeTeam.players.map((player) => (
              <View
                key={player.id}
                className="mb-2 flex-row items-center rounded-md bg-gray-50 p-2">
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <Text className="font-bold text-blue-500">{player.number}</Text>
                </View>
                <Text>{player.name}</Text>
                {match.status === 'in-progress' && Math.random() > 0.5 && (
                  <View className="ml-auto rounded bg-green-100 px-2 py-1">
                    <Text className="text-xs text-green-700">On Court</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          <View>
            <Text className="mb-2 font-medium text-[#aa1d16]">{awayTeam.name}</Text>
            {awayTeam.players.map((player) => (
              <View
                key={player.id}
                className="mb-2 flex-row items-center rounded-md bg-gray-50 p-2">
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-red-100">
                  <Text className="font-bold text-red-500">{player.number}</Text>
                </View>
                <Text>{player.name}</Text>
                {match.status === 'in-progress' && Math.random() > 0.5 && (
                  <View className="ml-auto rounded bg-green-100 px-2 py-1">
                    <Text className="text-xs text-green-700">On Court</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Match Statistics (Only shown when match is completed) */}
        {match.status === 'completed' && (
          <View className="mb-12 rounded-md bg-white p-4 shadow-sm">
            <Text className="mb-3 font-semibold text-lg">Match Statistics</Text>

            <View className="space-y-3">
              <StatisticRow
                label="Successful Raids"
                homeValue={12}
                awayValue={9}
                homeTeamColor="#1e40af"
                awayTeamColor="#b91c1c"
              />
              <StatisticRow
                label="Successful Tackles"
                homeValue={8}
                awayValue={11}
                homeTeamColor="#1e40af"
                awayTeamColor="#b91c1c"
              />
              <StatisticRow
                label="All Outs"
                homeValue={2}
                awayValue={1}
                homeTeamColor="#1e40af"
                awayTeamColor="#b91c1c"
              />
              <StatisticRow
                label="Bonus Points"
                homeValue={3}
                awayValue={2}
                homeTeamColor="#1e40af"
                awayTeamColor="#b91c1c"
              />
              <StatisticRow
                label="Super Tackles"
                homeValue={1}
                awayValue={2}
                homeTeamColor="#1e40af"
                awayTeamColor="#b91c1c"
              />
            </View>
          </View>
        )}
      </ScrollView>
    </>
  );
}

// Component for rendering match statistics rows
type StatisticRowProps = {
  label: string;
  homeValue: number;
  awayValue: number;
  homeTeamColor: string;
  awayTeamColor: string;
};

const StatisticRow = ({
  label,
  homeValue,
  awayValue,
  homeTeamColor,
  awayTeamColor,
}: StatisticRowProps) => {
  const total = homeValue + awayValue;
  const homePercentage = total > 0 ? (homeValue / total) * 100 : 50;
  const awayPercentage = total > 0 ? (awayValue / total) * 100 : 50;

  return (
    <View className="mb-2">
      <View className="mb-1 flex-row justify-between">
        <Text className="font-medium text-sm">{label}</Text>
        <View className="flex-row">
          <Text className="mr-1 font-bold text-sm">{homeValue}</Text>
          <Text className="font-bold text-sm text-gray-400">-</Text>
          <Text className="ml-1 font-bold text-sm">{awayValue}</Text>
        </View>
      </View>
      <View className="h-2 flex-row overflow-hidden rounded-full bg-gray-200">
        <View
          style={{
            width: `${homePercentage}%`,
            backgroundColor: homeTeamColor,
            height: '100%',
          }}
        />
        <View
          style={{
            width: `${awayPercentage}%`,
            backgroundColor: awayTeamColor,
            height: '100%',
          }}
        />
      </View>
    </View>
  );
};

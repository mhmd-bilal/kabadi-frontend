import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import storageHelper, { Team, Match } from '../storageHelper'; // Import from storageHelper

export default function HomePage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const dummyGrounds = [
    {
      id: 'ground1',
      name: 'Sunrise Arena',
      location: 'Bangalore, India',
      status: 'open',
      image: 'https://steelrays.in/assets-new/images/floorings/Kabbadi-02.jpg', // Replace with your own if needed
    },
    {
      id: 'ground2',
      name: 'Twilight Turf',
      location: 'Mumbai, India',
      status: 'closed',
      image: 'https://rtescollege.co.in/wp-content/uploads/2023/03/KABADDI-COURT.jpeg',
    },
  ];

  const loadData = async () => {
    setLoading(true);
    const loadedTeams = await storageHelper.getTeams();
    const loadedMatches = await storageHelper.getMatches();
    setTeams(loadedTeams);
    setMatches(loadedMatches);
    setLoading(false);
  };
  return (
    <View className="h-full w-full bg-[#f7f2f1]">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="mb-4 mt-0 h-60 flex-row items-center justify-start bg-[#f7f2f1]">
        <ImageBackground
          source={require('../../assets/highlight.jpg')}
          className="h-full w-full"
          resizeMode="cover">
          <LinearGradient
            colors={['black', 'rgba(0,0,0,01)']}
            className="absolute bottom-0 left-0 right-0 top-0 opacity-90"
          />
          <View className="absolute bottom-10 left-6 w-64">
            <Text className="font-regular text-4xl text-[#f7f2f1]">Ka-Baddie</Text>
          </View>
        </ImageBackground>
      </View>

      <View className="mt-12 flex-1 bg-[#f7f2f1] p-6">
        {/* Search Bar */}
        <View className="-mt-28 mb-4 flex-row items-center rounded-full bg-white p-2 pl-4">
          <Feather name="search" size={18} color="black" />
          <TextInput
            placeholder="What are you looking for?"
            placeholderTextColor="black"
            className="ml-2 flex-1 font-regular text-black"
          />
        </View>
        <View>
          <Text className="mb-2 font-semibold text-xl text-black">Recent Matches</Text>
          {/* Live Matches */}
          <ScrollView
            className="flex flex-row gap-8 overflow-visible bg-transparent"
            horizontal
            removeClippedSubviews={false}
            showsHorizontalScrollIndicator={false}>
            {matches.map((match) => {
              const homeTeam = teams.find((team) => team.id === match.homeTeamId);
              const awayTeam = teams.find((team) => team.id === match.awayTeamId);

              return (
                <View
                  key={match.id}
                  className="relative mb-4 mr-2 min-w-64 rounded-md border border-gray-200 bg-white p-4 pb-10 shadow-md">
                  {/* Teams and Scores */}
                  <View className="flex-row items-center justify-between">
                    {/* Home Team */}
                    <View className="items-start">
                      <Text className="font-regular text-base text-black">
                        {homeTeam ? homeTeam.name : match.homeTeamId}
                      </Text>
                      <Text className="font-regular text-3xl text-black">
                        {match.result ? match.result.homeScore : ''}
                      </Text>
                    </View>

                    {/* VS divider */}
                    <Text className="font-regular text-lg text-gray-500">vs</Text>

                    {/* Away Team */}
                    <View className="items-end">
                      <Text className="font-regular text-base text-black">
                        {awayTeam ? awayTeam.name : match.awayTeamId}
                      </Text>
                      <Text className="font-regular text-3xl text-black">
                        {match.result ? match.result.awayScore : ''}
                      </Text>
                    </View>
                  </View>
                  {/* Status pill */}
                  <View className="absolute bottom-2 right-2 flex-row items-center">
                    {/* Line */}
                    <View
                      className={`h-0.5 w-10 rounded-full ${
                        match.status === 'in-progress' ? 'bg-[#aa1d16]' : 'bg-[#16aa3e]'
                      }`}
                    />

                    {/* Spacer */}
                    <View className="w-2" />

                    {/* Status Text */}
                    <Text
                      className={`font-semibold text-xs ${
                        match.status === 'in-progress' ? 'text-[#aa1d16]' : 'text-[#16aa3e]'
                      }`}>
                      {match.status === 'in-progress' ? 'LIVE' : match.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
        <View>
          <Text className="mb-2 font-semibold text-xl text-black">Nearby Grounds</Text>
          {/* Live Matches */}
          <ScrollView
            className="flex flex-row gap-4 overflow-visible bg-transparent"
            horizontal
            showsHorizontalScrollIndicator={false}>
            {dummyGrounds.map((ground) => (
              <View
                key={ground.id}
                className="relative mb-4 mr-2 w-64 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
                {/* Ground Image */}
                <Image source={{ uri: ground.image }} className="h-32 w-full" resizeMode="cover" />

                {/* Status Badge */}
                <View
                  className={`absolute right-2 top-2 rounded-full px-3 py-1 ${
                    ground.status === 'open' ? 'bg-[#16aa3e]' : 'bg-[#aa1d16]'
                  }`}>
                  <Text className="font-regular text-xs uppercase text-white">{ground.status}</Text>
                </View>

                {/* Info Section */}
                <View className="p-3">
                  <Text className="font-semibold text-lg text-black">{ground.name}</Text>
                  <Text className="font-regular text-sm text-gray-500">{ground.location}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

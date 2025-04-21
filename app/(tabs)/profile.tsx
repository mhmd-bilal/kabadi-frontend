import { Stack } from 'expo-router';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function ProfilePage() {
  const playerStats: { label: string; value: number; icon: 'calendar' | 'award' | 'zap' | 'shield' }[] = [
    { label: 'Matches Played', value: 42, icon: 'calendar' },
    { label: 'Matches Won', value: 27, icon: 'award' },
    { label: 'Raid Points', value: 135, icon: 'zap' },
    { label: 'Tackle Points', value: 64, icon: 'shield' },
  ];

  const personalInfo = {
    name: 'Bilal',
    age: 21,
    location: 'Bangalore, India',
    team: 'Sunrise Warriors',
    bloodGroup: 'A1+',
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView className="mt-6 pt-6 flex-1 bg-[#f7f2f1] px-4 py-2">
        <Text className="font-semibold text-2xl mb-4 text-black">My Profile</Text>

        {/* Stats Card */}
        <View className="mb-6 rounded-xl bg-white p-4 shadow-md">
          <Text className="mb-4 text-lg font-semibold text-black">Player Stats</Text>
          <View className="flex-row flex-wrap justify-between gap-y-4">
            {playerStats.map((stat, index) => (
              <Stat key={index} label={stat.label} value={stat.value} icon={stat.icon} />
            ))}
          </View>
        </View>

        {/* Personal Info */}
        <View className="rounded-xl bg-white p-4 shadow-md">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-black">Personal Info</Text>
            <TouchableOpacity onPress={() => console.log('Edit profile')}>
              <Feather name="edit-3" size={20} color="black" />
            </TouchableOpacity>
          </View>
          <Info label="Name" value={personalInfo.name} />
          <Info label="Age" value={personalInfo.age.toString()} />
          <Info label="Location" value={personalInfo.location} />
          <Info label="Team" value={personalInfo.team} />
          <Info label="Blood Group" value={personalInfo.bloodGroup} />
        </View>
      </ScrollView>
    </>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: keyof typeof Feather.glyphMap;
}) {
  return (
    <View className="w-[48%] rounded-lg bg-[#f0f0f0] px-4 py-6 shadow- flex gap-4">
      <View className="mb-2 flex-row items-center gap-2">
        <Feather name={icon} size={18} color="black" />
        <Text className="text-sm font-medium text-black/90">{label}</Text>
      </View>
      <Text className="text-5xl font-regular text-black">{value}</Text>
    </View>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View className="mb-">
      <Text className="text-sm text-gray-600">{label}</Text>
      <Text className="text-base font-medium text-black">{value}</Text>
    </View>
  );
}
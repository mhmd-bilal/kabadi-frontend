import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  FlatList,
  Linking,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons, FontAwesome, MaterialIcons, Feather } from '@expo/vector-icons';
import storageHelper, { Ground, Match } from '../storageHelper';

const { width } = Dimensions.get('window');

// Rating stars component
const RatingStars = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <View className="flex-row">
      {[...Array(fullStars)].map((_, i) => (
        <FontAwesome key={`full-${i}`} name="star" size={16} color="#FFD700" />
      ))}
      {halfStar && <FontAwesome name="star-half-empty" size={16} color="#FFD700" />}
      {[...Array(emptyStars)].map((_, i) => (
        <FontAwesome key={`empty-${i}`} name="star-o" size={16} color="#FFD700" />
      ))}
      <Text className="ml-1 text-sm">{rating}</Text>
    </View>
  );
};

// Amenity icon component
const AmenityIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'restaurant':
      return <MaterialIcons name="restaurant" size={20} color="#16aa3e" />;
    case 'transport':
      return <MaterialIcons name="directions-bus" size={20} color="#1d7aaa" />;
    case 'hospital':
      return <FontAwesome name="hospital-o" size={20} color="#aa1d16" />;
    case 'hotel':
      return <FontAwesome name="hotel" size={20} color="#aa9416" />;
    case 'parking':
      return <MaterialIcons name="local-parking" size={20} color="#666" />;
    default:
      return <FontAwesome name="building-o" size={20} color="#666" />;
  }
};

export default function GroundDetailScreen() {
  const { id } = useLocalSearchParams();
  const [ground, setGround] = useState<Ground | null>(null);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    const loadGroundData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const groundData = await storageHelper.getGroundById(id as string);
        if (groundData) {
          setGround(groundData);
          
          // Load upcoming matches
          if (groundData.upcomingMatches.length > 0) {
            const allMatches = await storageHelper.getMatches();
            const groundMatches = allMatches.filter(match => 
              groundData.upcomingMatches.includes(match.id)
            );
            setUpcomingMatches(groundMatches);
          }
        }
      } catch (error) {
        console.error('Error loading ground:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGroundData();
  }, [id]);

  const openMap = (mapUrl: string) => {
    Linking.openURL(mapUrl).catch(err => console.error("Couldn't load map:", err));
  };

  const callVenue = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(err => console.error("Couldn't call venue:", err));
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#16aa3e" />
      </View>
    );
  }

  if (!ground) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text className="text-center font-semibold text-lg">Ground not found</Text>
        <TouchableOpacity
          className="mt-4 bg-[#16aa3e] px-4 py-2 rounded-full"
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
          title: ground.name,
          headerTransparent: true,
          headerTintColor: 'white',
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

      <ScrollView className="flex-1 bg-[#f7f2f1]">
        {/* Photo Gallery */}
        <View className="relative h-64 w-full">
          <FlatList
            data={ground.photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={e => {
              const newIndex = Math.floor(e.nativeEvent.contentOffset.x / width);
              setPhotoIndex(newIndex);
            }}
            renderItem={({ item }) => (
              <Image 
                source={{ uri: item }} 
                style={{ width, height: 250 }}
                className="h-64 w-full"
              />
            )}
            keyExtractor={(_, index) => `photo-${index}`}
          />
          
          {/* Photo Indicator */}
          <View className="absolute bottom-3 left-0 right-0 flex-row justify-center">
            {ground.photos.map((_, index) => (
              <View 
                key={`indicator-${index}`}
                className={`h-2 w-2 mx-1 rounded-full ${
                  photoIndex === index ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </View>
          
          {/* Status Badge */}
          <View className={`absolute right-4 top-4 rounded-full px-3 py-1 ${
            ground.status === 'open' ? 'bg-[#16aa3e]' : 
            ground.status === 'closed' ? 'bg-[#aa1d16]' : 
            'bg-[#aa9416]'
          }`}>
            <Text className="font-medium text-xs uppercase text-white">{ground.status}</Text>
          </View>
        </View>
        
        {/* Main Content */}
        <View className="-mt-6 bg-white rounded-t-3xl px-4 pt-6 pb-20">
          {/* Header */}
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1">
              <Text className="font-bold text-2xl">{ground.name}</Text>
              <Text className="text-gray-600">{ground.location}</Text>
              <RatingStars rating={ground.rating} />
            </View>
            
            <TouchableOpacity 
              className="bg-[#16aa3e] p-3 rounded-full"
              onPress={() => openMap(ground.mapUrl)}
            >
              <Feather name="map-pin" size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          {/* Capacity and Booking Fee */}
          <View className="flex-row mb-6">
            <View className="flex-1 mr-2 bg-gray-100 p-3 rounded-lg">
              <Text className="text-xs text-gray-500">Capacity</Text>
              <Text className="font-semibold text-lg">{ground.capacity} people</Text>
            </View>
            <View className="flex-1 ml-2 bg-gray-100 p-3 rounded-lg">
              <Text className="text-xs text-gray-500">Booking Fee</Text>
              <Text className="font-semibold text-lg">₹{ground.bookingFee}/day</Text>
            </View>
          </View>
          
          {/* Description */}
          <View className="mb-6">
            <Text className="font-semibold text-lg mb-2">About</Text>
            <Text className="text-gray-700 leading-5">{ground.description}</Text>
          </View>
          
          {/* Address and Contact */}
          <View className="mb-6 bg-gray-100 rounded-lg p-4">
            <View className="flex-row items-center mb-3">
              <FontAwesome name="map-marker" size={20} color="#666" />
              <View className="ml-3 flex-1">
                <Text className="text-xs text-gray-500">ADDRESS</Text>
                <Text className="text-gray-700">{ground.address}</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              onPress={() => callVenue(ground.contactNumber)}
              className="flex-row items-center"
            >
              <FontAwesome name="phone" size={20} color="#16aa3e" />
              <View className="ml-3 flex-1">
                <Text className="text-xs text-gray-500">CONTACT</Text>
                <Text className="text-[#16aa3e]">{ground.contactNumber}</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          {/* Facilities */}
          <View className="mb-6">
            <Text className="font-semibold text-lg mb-3">Facilities</Text>
            <View className="flex-row flex-wrap">
              {ground.facilities.map((facility, index) => (
                <View key={index} className="bg-gray-100 mr-2 mb-2 px-3 py-1 rounded-full">
                  <Text className="text-sm">{facility}</Text>
                </View>
              ))}
            </View>
          </View>
          
          {/* Upcoming Matches */}
          {upcomingMatches.length > 0 && (
            <View className="mb-6">
              <Text className="font-semibold text-lg mb-3">Upcoming Matches</Text>
              {upcomingMatches.map(match => (
                <TouchableOpacity 
                  key={match.id}
                  onPress={() => router.push({pathname: '/match/[id]', params: {id: match.id}})}
                  className="bg-gray-100 p-3 rounded-lg mb-2"
                >
                  <View className="flex-row justify-between items-center">
                    <Text className="font-medium">
                      {new Date(match.startTime).toLocaleDateString()}
                    </Text>
                    <View className={`px-2 py-1 rounded-full ${
                      match.status === 'scheduled' ? 'bg-[#aa1d16]/20' : 
                      match.status === 'in-progress' ? 'bg-[#aaa516]/20' : 'bg-[#16aa3e]/20'
                    }`}>
                      <Text className={`text-xs ${
                        match.status === 'scheduled' ? 'text-[#aa1d16]' : 
                        match.status === 'in-progress' ? 'text-[#aaa516]' : 'text-[#16aa3e]'
                      }`}>{match.status.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text className="font-medium text-lg mt-1">
                    Team vs Team
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {/* Nearby Amenities */}
          <View>
            <Text className="font-semibold text-lg mb-3">Nearby Amenities</Text>
            {ground.nearbyAmenities.map((amenity, index) => (
              <View key={index} className="flex-row items-center mb-3">
                <View className="bg-gray-200 p-2 rounded-full mr-3">
                  <AmenityIcon type={amenity.type} />
                </View>
                <View>
                  <Text className="font-medium">{amenity.name}</Text>
                  <Text className="text-xs text-gray-500">{amenity.distance} away</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Floating Action Button */}
      <View className="absolute bottom-8 left-0 right-0 flex-row justify-center">
        <TouchableOpacity className="bg-[#16aa3e] py-3 px-6 rounded-full">
          <Text className="text-white font-bold">Book Ground</Text>
        </TouchableOpacity>
      </View>
    </>
  );
} 
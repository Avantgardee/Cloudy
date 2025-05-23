import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { t } from 'i18next';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchLocation } from '../store/actions/fetchLocation';
import { clearSearchResults } from '../store/slices/locationSlice';
import {setLocation, setCurrentCity, setCurrentCountry, setCurrentIsoCountryCode, setCurrentAdmin1} from '../store/slices/weatherSlice';
import { Ionicons } from '@expo/vector-icons';
import {LocationResult, TemperatureUnit} from "../store/types/types";
import { fetchWeather } from "../store/actions/fetchWeather";
import { fetchMoonPhase } from "../store/actions/fetchMoonPhase";
import { fetchAirQuality } from "../store/actions/fetchAirQuality";
import { useNavigation } from '@react-navigation/native';
import BackgroundImage from "../components/BackgroundImage";
import {getLocalDateByOffsetSeconds} from "../store/utils/convertUtils";
import { Keyboard } from 'react-native';
import {RunningLine} from "../components/RunningLine";

interface SearchResultCardProps {
    item: LocationResult;
    onPress: () => void;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({ item, onPress} : SearchResultCardProps) => {
    const localDate = item.weatherInfo.utc_offset_seconds !== null
        ? getLocalDateByOffsetSeconds(item.weatherInfo.utc_offset_seconds)
        : null;
    const temperatureText = item.weatherInfo.temperature_current !== null
        ? `${~~item.weatherInfo.temperature_current}${item.weatherInfo.temperatureUnit}`
        : '-';

    const formatLocation = () => {
        const parts : string[] = [];
        if (item.country) parts.push(item.country);
        if (item.admin1?.trim()) parts.push(item.admin1);

        return parts.join(' • ');
    };

    return (
        <TouchableOpacity
            className="bg-white/10 rounded-3xl px-4 py-2 mb-3 h-40 flex-col relative"
            onPress={onPress}
        >
            <BackgroundImage
                blurRadius={1}
                overlayColor="rgba(25, 50, 75, 0.5)"
                hourOverride={localDate?.getUTCHours()}
                containerStyle={[{ borderRadius: 20 }, { overflow: 'hidden' }]}
                isPage={false}
                weatherCodeOverride={item.weatherInfo.weather_code ?? undefined}
            />

            <View className="flex-row w-full justify-between h-[70%] items-start">
                <View className="flex-col ">
                    <RunningLine
                        title={item.name}
                        maxWidth={220}
                        scrollThreshold={15}
                        textClassName="text-2xl font-extrabold text-white"
                    />
                    <RunningLine
                        title={formatLocation()}
                        maxWidth={200}
                        scrollThreshold={20}
                        textClassName="text-white/40 font-poppins-regular text-[12px] h-5 leading-4"
                    />
                    <Text className="text-white font-poppins-regular text-[13px] text-left leading-[35px]">
                        {`${localDate?.getUTCHours().toString().padStart(2, '0')}:${localDate?.getUTCMinutes().toString().padStart(2, '0')}`}
                    </Text>
                </View>
                <View className="flex-row items-center">
                    <Text className="text-white font-manrope-regular text-[50px] leading-[65px] mr-2">
                        {temperatureText}
                    </Text>
                </View>
            </View>
            <View className="flex-row w-full justify-between items-start">
                    <RunningLine
                        title= {t("clock.weather_code_descriptions." + item.weatherInfo.weather_code)}
                        maxWidth={150}
                        scrollThreshold={20}
                        textClassName="text-white font-manrope-medium text-[13px] max-w-60 text-left"
                    />
                <Text className="text-white/80 font-manrope-bold text-[13px]">
                    {`${t("search.maxLabel")} : ${~~item.weatherInfo.temperature_max!}${item.weatherInfo.temperatureUnit}, ${t("search.minLabel")} : ${~~item.weatherInfo.temperature_min!}${item.weatherInfo.temperatureUnit}`}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const SearchScreen = () => {
    const dispatch = useAppDispatch();
    const navigation = useNavigation();
    const { searchResults, loading } = useAppSelector(state => state.location);
    const { favorites } = useAppSelector(state => state.favorites);
    const { language } = useAppSelector(state => state.appSettings);
    const [searchQuery, setSearchQuery] = useState('');
    const temperatureUnit = useAppSelector(state => state.weather.temperatureUnit);

    useEffect(() => {

        return () => {
            setSearchQuery('');
            dispatch(clearSearchResults());
        };
    }, []);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (searchQuery.length > 2) {
                dispatch(fetchLocation({ query: searchQuery, language, temperatureUnit }));
            }
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery, language]);

    const handleSelectLocation = async (location: LocationResult) => {
        Keyboard.dismiss();

        dispatch(setLocation({
            latitude: location.latitude,
            longitude: location.longitude
        }));

        dispatch(setCurrentCity(location.name ?? ""));
        dispatch(setCurrentCountry(location.country ?? ""));
        dispatch(setCurrentIsoCountryCode(location.country_code ?? ""));
        dispatch(setCurrentAdmin1(location.admin1 ?? ""));

        await Promise.all([
            dispatch(fetchWeather()),
            dispatch(fetchMoonPhase()),
            dispatch(fetchAirQuality())
        ]);

        navigation.goBack();
    };

    const displayedResults = searchQuery.length > 0 ? searchResults : favorites;

    return (
        <View className="flex-1 p-4 pt-14">
            <BackgroundImage
                blurRadius={5}
                overlayColor="rgba(25, 50, 75, 0.2)"
                isPage={true}
            />
            <View className="flex-row items-center justify-between mb-4">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white font-manrope-bold text-xl">{t('search.title')}</Text>
                <View style={{ width: 24 }} />
            </View>

            <View className="bg-white/10 rounded-xl p-1 mb-4 flex-row items-center">
                <Ionicons name="search" size={20} color="white" style={{ marginRight: 8 }} />
                <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={t('search.placeholder')}
                    placeholderTextColor="#ffffff80"
                    className="flex-1 text-white font-manrope-medium text-base"
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="white" />
            ) : (
                <FlatList
                    keyboardShouldPersistTaps="handled"
                    data={displayedResults}
                    keyExtractor={(item) => item.id.toString()}
                    removeClippedSubviews={false}
                    renderItem={({ item }) => (
                        <SearchResultCard
                            item={item}
                            onPress={async () => await handleSelectLocation(item)}
                        />
                    )}
                    ListEmptyComponent={() => (
                        <View className="flex-1 items-center justify-center mt-12">
                            <Ionicons
                                nam
                                name={searchQuery.length > 0 ? "sad-outline" : "heart-outline"}
                                size={40}
                                color="rgba(255,255,255,0.3)"
                                className="mb-3"
                            />
                            <Text className="text-white/50 text-center text-base">
                                {searchQuery.length > 0 ? t('search.noResults') : t('search.noFavorites')}
                            </Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
};

export default SearchScreen;
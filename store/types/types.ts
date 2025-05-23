﻿export type Status = "idle" | "loading" | "succeeded" | "failed";

export type WindSpeedUnit = "km/h" | "m/s" | "mph";

export type TemperatureUnit = "°C" | "°F";

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface WeatherError {
    message: string;
}

export interface CurrentWeather {
    time: string;
    interval: number;
    wind_speed_10m: number;
    weather_code: number;
    apparent_temperature: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    is_day: number; // 0 for night, 1 for day
}

export interface HourlyUnits {
    time: string;
    temperature_2m: string;
    wind_speed_10m: string;
    weather_code: string;
    wind_direction_10m: string;
}

export interface HourlyData {
    time: string[];
    temperature_2m: number[];
    wind_speed_10m: number[];
    weather_code: number[];
    wind_direction_10m: number[];
    precipitation_probability: number[];
    is_day: number[];
    uv_index: number[];
}

export interface DailyUnits {
    time: string;
    weather_code: string;
    temperature_2m_mean: string;
    wind_speed_10m_mean: string;
    precipitation_probability_mean: string;
    relative_humidity_2m_mean: string;
    temperature_2m_max: string;
    temperature_2m_min: string;
    sunrise: string;
    sunset: string;
    uv_index_max: string;
}

export interface DailyData {
    time: string[];
    weather_code: number[];
    temperature_2m_mean: number[];
    wind_speed_10m_mean: number[];
    precipitation_probability_mean: number[];
    relative_humidity_2m_mean: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
}

export interface WeatherData {
    latitude: number;
    longitude: number;
    generationtime_ms: number;
    utc_offset_seconds: number;
    timezone: string;
    timezone_abbreviation: string;
    elevation: number;
    current_units: Record<string, string>;
    current: CurrentWeather;
    hourly_units: HourlyUnits;
    hourly: HourlyData;
    daily_units: DailyUnits;
    daily: DailyData;
}

export interface LocationResult {
    id: number,
    name: string | null;
    latitude: number;
    longitude: number;
    country: string | null;
    country_code: string | null;
    admin1: string | null;
    weatherInfo: LocationWeatherInfo
}

export interface LocationWeatherInfo {
    utc_offset_seconds: number | null;
    temperature_current: number | null;
    weather_code: number | null;
    is_day: boolean | null;
    temperature_max: number | null;
    temperature_min: number | null;
    temperatureUnit: TemperatureUnit;
}


// Weather map types
export enum MapLayerType {
    TEMPERATURE = 'temp_new',
    PRECIPITATION = 'precipitation_new',
    CLOUDS = 'clouds_new',
    PRESSURE = 'pressure_new',
    WIND = 'wind_new',
    SNOW = 'snow_new',
    NONE = 'none'
}

// Map layer data
export interface MapLayerData {
    layerType: MapLayerType;
    opacity: number;
    visible: boolean;
}

// Weather map data for display
export interface WeatherMapData {
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    isoCountryCode: string;
    admin1: string;
    windSpeedUnit: WindSpeedUnit;
    temperatureUnit: TemperatureUnit;
    current: {
        temperature_2m: number;
        weather_code: number;
        wind_speed_10m: number;
        relative_humidity_2m: number;
        is_day: number;
        pressure_msl?: number;
        precipitation?: number;
        cloudcover?: number;
    };
    daily: {
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        weather_code: number[];
        precipitation_sum?: number[];
        precipitation_probability_max?: number[];
    };
}

export interface AirQuality {
    time: string[],
    us_aqi: number[],
    us_aqi_pm2_5: number[],
    us_aqi_pm10: number[],
    us_aqi_nitrogen_dioxide: number[],
    us_aqi_carbon_monoxide: number[],
    us_aqi_ozone: number[],
    us_aqi_sulphur_dioxide: number[],
}

export interface LocationData extends Coordinates {
    city: string;
    country: string;
    countryCode: string;
}

export interface AppSettingsState {
    language: 'ru' | 'en';
}

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AirQuality, Coordinates, Status, TemperatureUnit, WeatherData, WindSpeedUnit} from "../types/types";
import {fetchWeather} from "../actions/fetchWeather";
import {fetchMoonPhase} from "../actions/fetchMoonPhase";
import {fetchAirQuality} from "../actions/fetchAirQuality";
import {convertTemperature, convertWindSpeed} from "../utils/convertUtils";
import {fetchLocationByIP} from "../actions/fetchLocationByIp";

export interface WeatherState {
    data: WeatherData | null;
    loading: boolean;
    error: string | null;
    status: Status;
    location: Coordinates | null;
    temperatureUnit: TemperatureUnit;
    windSpeedUnit: WindSpeedUnit;
    currentCity: string | null;
    currentCountry: string | null;
    currentAdmin1: string | null;
    currentIsoCountryCode: string | null;
    moonPhase: number | null;
    airQuality: AirQuality | null;
}

const initialState: WeatherState = {
    data: null,
    loading: false,
    error: null,
    status: 'idle',
    location: null,
    temperatureUnit: '°C',
    windSpeedUnit: 'km/h',
    currentCity: null,
    currentAdmin1: null,
    currentCountry: null,
    currentIsoCountryCode: null,
    moonPhase: null,
    airQuality: null,
};

const weatherSlice = createSlice({
    name: 'weather',
    initialState,
    reducers: {
        setTemperatureUnit(state, action: PayloadAction<TemperatureUnit>) {
            const newUnit = action.payload;

            if (state.data) {
                state.data.current.temperature_2m =
                    convertTemperature(state.data.current.temperature_2m, state.temperatureUnit, newUnit);
                state.data.current.apparent_temperature =
                    convertTemperature(state.data.current.apparent_temperature, state.temperatureUnit, newUnit);

                state.data.daily.temperature_2m_mean = state.data.daily.temperature_2m_mean.map(temp =>
                    convertTemperature(temp, state.temperatureUnit, newUnit)
                );
                state.data.daily.temperature_2m_max = state.data.daily.temperature_2m_max.map(temp =>
                    convertTemperature(temp, state.temperatureUnit, newUnit)
                );
                state.data.daily.temperature_2m_min = state.data.daily.temperature_2m_min.map(temp =>
                    convertTemperature(temp, state.temperatureUnit, newUnit)
                );
                state.data.hourly.temperature_2m = state.data.hourly.temperature_2m.map(temp =>
                    convertTemperature(temp, state.temperatureUnit, newUnit)
                );
            }

            state.temperatureUnit = newUnit;
        },
        setWindSpeedUnit(state, action: PayloadAction<WindSpeedUnit>) {
            const newUnit = action.payload;

            if (state.data) {
                state.data.current.wind_speed_10m = convertWindSpeed(state.data.current.wind_speed_10m, state.windSpeedUnit, newUnit);

                state.data.hourly.wind_speed_10m = state.data.hourly.wind_speed_10m.map(speed =>
                    convertWindSpeed(speed, state.windSpeedUnit, newUnit)
                );

                state.data.daily.wind_speed_10m_mean = state.data.daily.wind_speed_10m_mean.map(speed =>
                    convertWindSpeed(speed, state.windSpeedUnit, newUnit)
                );
            }

            state.windSpeedUnit = newUnit;
        },
        setLocation(state, action: PayloadAction<Coordinates>) {
            state.location = action.payload;
        },
        setCurrentCity(state, action: PayloadAction<string | null>) {
            state.currentCity = action.payload;
        },
        setCurrentCountry(state, action: PayloadAction<string | null>) {
            state.currentCountry = action.payload;
        },
        setCurrentIsoCountryCode(state, action: PayloadAction<string | null>) {
            state.currentIsoCountryCode = action.payload;
        },
        setCurrentAdmin1(state, action: PayloadAction<string | null>) {
            state.currentAdmin1 = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWeather.pending, (state) => {
                state.status = 'loading';
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWeather.fulfilled, (state, action: PayloadAction<WeatherData>) => {
                state.status = 'succeeded';
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchWeather.rejected, (state, action) => {
                state.status = 'failed';
                state.loading = false;
                state.error = action.payload ? action.payload.message : 'Ошибка запроса';
            })
            .addCase(fetchMoonPhase.pending, (state) => {
                state.status = 'loading';
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMoonPhase.fulfilled, (state, action: PayloadAction<number>) => {
                state.status = 'succeeded';
                state.loading = false;
                state.moonPhase = action.payload;
            })
            .addCase(fetchMoonPhase.rejected, (state, action) => {
                state.status = 'failed';
                state.loading = false;
                state.error = action.payload ? action.payload.message : 'Ошибка запроса фазы луны';
            })
            .addCase(fetchAirQuality.pending, (state) => {
                state.status = 'loading';
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAirQuality.fulfilled, (state, action: PayloadAction<AirQuality>) => {
                state.status = 'succeeded';
                state.loading = false;
                state.airQuality = action.payload;
            })
            .addCase(fetchAirQuality.rejected, (state, action) => {
                state.status = 'failed';
                state.loading = false;
                state.error = action.payload ? action.payload.message : 'Ошибка запроса качества воздуха';
            })
            .addCase(fetchLocationByIP.pending, (state) => {
                state.status = 'loading';
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLocationByIP.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.loading = false;
                state.location = action.payload;
                state.currentCity = action.payload.city;
                state.currentCountry = action.payload.country;
                state.currentIsoCountryCode = action.payload.countryCode;
                state.currentAdmin1 = "";
            })
            .addCase(fetchLocationByIP.rejected, (state, action) => {
                state.status = 'failed';
                state.loading = false;
                state.error = action.payload ? action.payload.message : 'Ошибка запроса получения координат';
                state.location = DEFAULT_COORDINATES;
                state.currentCity = DEFAULT_COORDINATES.city;
            });
    },
});

const DEFAULT_COORDINATES = { latitude: 53.9, longitude: 27.56667, city: "Минск" };

export const { setTemperatureUnit, setWindSpeedUnit, setLocation, setCurrentCity, setCurrentCountry, setCurrentIsoCountryCode, setCurrentAdmin1 } = weatherSlice.actions;
export const weatherReducer = weatherSlice.reducer;
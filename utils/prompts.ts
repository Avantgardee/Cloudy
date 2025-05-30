import {WeatherState} from "../store/slices/weatherSlice";

export const getWeatherConditionText = (code: number): string => {
  const weatherCodes: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };
  
  return weatherCodes[code] || 'Unknown';
};

export const BASE_SYSTEM_PROMPT = `You are a friendly weather assistant in a mobile app.
You provide helpful, concise, and friendly responses to weather-related questions.
Keep your answers relatively short (2-3 paragraphs maximum) and conversational.
Be enthusiastic but not overly verbose.
You can be creative and personable.
If asked about specific weather conditions, you'll respond based on the current conditions shown in the app.`;

export const generateWeatherContext = (weatherState: WeatherState): string => {
  if (!weatherState.data) {
    return "Current weather data is not available.";
  }
  
  try {
    const current = weatherState.data.current;
    const daily = weatherState.data.daily;
    
    const tempUnit: string = weatherState.temperatureUnit;
    const windUnit: string = weatherState.windSpeedUnit;
    const humidityUnit: string = weatherState.data.current_units?.relative_humidity_2m || "%";
    
    const currentCondition = getWeatherConditionText(current.weather_code);
    const isDay = current.is_day === 1;
    const timeOfDay = isDay ? "day" : "night";
    
    const todayMaxTemp = daily.temperature_2m_max[1];
    const todayMinTemp = daily.temperature_2m_min[1];
    
    const precipProbability = daily.precipitation_probability_mean[1];
    
    const windSpeed = current.wind_speed_10m;
    
    const humidity = current.relative_humidity_2m;
    
    const uvIndex = weatherState.data.hourly.uv_index[0];
    
    const sunrise = daily.sunrise[1].split('T')[1].substring(0, 5);
    const sunset = daily.sunset[1].split('T')[1].substring(0, 5);

    return `Current weather: ${currentCondition}, ${current.temperature_2m}${tempUnit} (feels like ${current.apparent_temperature}${tempUnit})
    Time of day: ${timeOfDay}
    Today's temperature range: ${todayMinTemp}${tempUnit} to ${todayMaxTemp}${tempUnit}
    Precipitation probability: ${precipProbability}%
    Wind speed: ${windSpeed} ${windUnit}
    Humidity: ${humidity}${humidityUnit}
    UV Index: ${uvIndex}
    Sunrise: ${sunrise}, Sunset: ${sunset}`;
  } catch (error) {
    console.error("Error generating weather context:", error);
    return "Error processing weather data.";
  }
};

export const WHAT_TO_WEAR_PROMPT = `${BASE_SYSTEM_PROMPT}
When suggesting clothing options, consider the following weather conditions:

WEATHER_CONTEXT

Suggest specific outfit components (like layers, accessories, footwear) appropriate for these weather conditions.
Consider both practicality and comfort for the current conditions, including UV index for sun protection needs.
Keep your suggestions fitting for the time of day and appropriate for the current temperature range.`;

export const SUGGEST_MUSIC_PROMPT = `${BASE_SYSTEM_PROMPT}
When suggesting music for the current weather:

WEATHER_CONTEXT

Suggest 2-3 music genres and a few specific artists or songs that would complement the current weather conditions.
Be creative with your suggestions and explain briefly why they match the weather mood.
Consider the time of day (day/night) and overall weather condition in your music recommendations.`;

export const INTERESTING_FACT_PROMPT = `${BASE_SYSTEM_PROMPT}
Share an interesting and educational weather fact.

Current weather conditions:
WEATHER_CONTEXT

You can relate it to the current weather conditions or share a general fascinating weather phenomenon.
Make it engaging and informative, something that would surprise most people.
If the current conditions include any notable elements (high UV, precipitation, temperature extremes), consider 
prioritizing facts related to those conditions.`;

export const OUTDOOR_ACTIVITIES_PROMPT = `${BASE_SYSTEM_PROMPT}
Suggest outdoor activities appropriate for:

WEATHER_CONTEXT

Recommend 3-4 activities that would be enjoyable and practical in these conditions.
Include a brief explanation of why each activity would be good for this weather.
Consider time of day, UV index, precipitation probability, and temperature when making recommendations.
If the conditions aren't ideal for outdoor activities, suggest suitable alternatives.`;

export const getPromptForQuestion = (
  questionType: string,
  weatherData: WeatherState
): string => {
  const weatherContext = generateWeatherContext(weatherData);
  
  const replacePlaceholders = (prompt: string) => {
    return prompt.replace('WEATHER_CONTEXT', weatherContext);
  };

  switch (questionType) {
    case 'whatToWear':
      return replacePlaceholders(WHAT_TO_WEAR_PROMPT);
    case 'suggestMusic':
      return replacePlaceholders(SUGGEST_MUSIC_PROMPT);
    case 'interestingFact':
      return replacePlaceholders(INTERESTING_FACT_PROMPT);
    case 'outdoorActivities':
      return replacePlaceholders(OUTDOOR_ACTIVITIES_PROMPT);
    default:
      return BASE_SYSTEM_PROMPT + "\n\n" + weatherContext;
  }
};
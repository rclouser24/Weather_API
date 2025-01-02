import dayjs from 'dayjs';
import dotenv from 'dotenv';
dotenv.config();
interface Coordinates {
  lat: number;
  lon: number;
}
class Weather {
  city: string;
  tempF: number;
  windSpeed: number;
  humidity: number;
  date: string; // Changed to string to store formatted date
  icon: string;
  constructor(city: string, date: string, tempF: number, windSpeed: number, humidity: number, icon: string) {
    this.city = city;
    this.date = date;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
    this.icon = icon;
  }
}
class WeatherService {
  private baseURL: string;
  private apiKey: string;
  private cityName = '';
  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.API_KEY || '';
  }
  private async fetchLocationData(query: string) {
    try {
      if (!this.baseURL || !this.apiKey) {
        throw new Error("API key or base URL not found");
      }
      const response = await fetch(query);
      if (!response.ok) {
        throw new Error(`Failed to fetch location data: ${response.statusText}`);
      }
      const locationData = await response.json();
      if (!locationData.length) {
        throw new Error("Location not found");
      }
      return locationData[0]; // Assuming the API returns an array
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  private buildGeocodeQuery(): string {
    return `${this.baseURL}/geo/1.0/direct?q=${this.cityName}&appid=${this.apiKey}`;
  }
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&units=imperial&appid=${this.apiKey}`;
  }
  private async fetchAndDestructureLocationData() {
    return await this.fetchLocationData(this.buildGeocodeQuery()).then((data) =>
      data
    );
  }
  private async fetchWeatherData(coordinates: Coordinates) {
    try {
      const response = await fetch(this.buildWeatherQuery(coordinates)).then(
        (res) => res.json()
      );
      if (!response) {
        throw new Error(`Failed to fetch weather data`);
      }
      const currentWeather: Weather = this.parseCurrentWeather(
        response.list[0]
      );
      const forecast: Weather[] = this.buildForecastArray(
        currentWeather,
        response.list
      );
      return forecast;
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  }
  private parseCurrentWeather(response: any) {
    const parsedDate = dayjs.unix(response.dt).format('M/D/YYYY'); // Format date using dayjs
    return new Weather(
      this.cityName,
      parsedDate,
      response.main.temp,
      response.wind.speed,
      response.main.humidity,
      response.weather[0].icon
    );
  }
  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    const weatherForecast: Weather[] = [currentWeather];
    const filteredWeatherData = weatherData.filter((data:any) => {
      return data.dt_txt.includes('12:00:00'); // Filter for 12:00 PM forecasts
    })
    for (const data of filteredWeatherData) {
      weatherForecast.push(
        new Weather(
          this.cityName,
          dayjs.unix(data.dt).format('M/D/YYYY'), // Format date using dayjs
          data.main.temp,
          data.wind.speed,
          data.main.humidity,
          data.weather[0].icon
        )
      );
    }
    return weatherForecast;
}
  async getWeatherForCity(city: string) {
    try {
      this.cityName = city;
      const coordinates = await this.fetchAndDestructureLocationData();
      if (coordinates){
        // Fetch weather data
        const weatherData = await this.fetchWeatherData(coordinates);
        return weatherData
      }
      throw new Error(`City "${city}" not found.`);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
export default new WeatherService();
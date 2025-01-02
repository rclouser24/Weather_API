import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
// Define a City class with name and id properties
class City {
  name: string;
  id: string;
  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
  }
}
// Complete the HistoryService class
class HistoryService {
  private filePath = './searchHistory.json';
  // Method to read from the searchHistory.json file
  private async read(): Promise<string> {
    try {
      return await fs.readFile(this.filePath, {
        flag: 'a+', // Open the file for reading and appending
        encoding: 'utf8',
      });
    } catch (error) {
      throw new Error('Error reading the searchHistory.json file.');
    }
  }
  // Method to write the updated cities array to the searchHistory.json file
  private async write(cities: City[]): Promise<void> {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(cities, null, '\t'), 'utf8');
    } catch (error) {
      throw new Error('Error writing to the searchHistory.json file.');
    }
  }
  // Method to get cities from the searchHistory.json file and return them as an array of City objects
  async getCities(): Promise<City[]> {
    const data = await this.read();
    if (!data) {
      // If the file is empty, return an empty array
      return [];
    }
    try {
      const parsedCities: City[] = JSON.parse(data);
      return parsedCities;
    } catch (error) {
      // If there's an error in parsing, return an empty array
      return [];
    }
  }
  // Method to add a city to the searchHistory.json file
  async addCity(city: string): Promise<City | City[]> {
    if (!city) {
      throw new Error('City cannot be blank');
    }
    const newCity: City = new City(city, uuidv4());
    // Get the current list of cities
    const cities = await this.getCities();
    // Check if the city already exists
    if (cities.find((existingCity) => existingCity.name === city)) {
      // Return the list without changes if the city is already there
      return cities;
    }
    // Add the new city to the list
    const updatedCities = [...cities, newCity];
    // Write the updated list to the file
    await this.write(updatedCities);
    // Return the newly added city
    return newCity;
  }
  // BONUS: Method to remove a city from the searchHistory.json file by id
  async removeCity(id: string): Promise<void> {
    const cities = await this.getCities();
    // Filter out the city with the specified id
    const updatedCities = cities.filter((city) => city.id !== id);
    // Write the updated list to the file
    await this.write(updatedCities);
  }
}
export default new HistoryService();
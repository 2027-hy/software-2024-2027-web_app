// pages/api/getRainProbability.js

import axios from 'axios';

const cities = {
  kawaguchi: 'Kawaguchi,JP',
  funabashi: 'Funabashi,JP'
};

const getWeatherForecast = async (city) => {
  const baseUrl = 'https://api.openweathermap.org/data/2.5/forecast';
  const apiUrl = `${baseUrl}?q=${city}&appid=${process.env.OPENWEATHERMAP_API_KEY}&units=metric`;

  try {
    const response = await axios.get(apiUrl);
    const data = response.data;

    const forecastList = data.list;
    let totalRainProbability = 0;
    let count = 0;

    const today = new Date().getDate();

    forecastList.forEach((forecast) => {
      const forecastDate = new Date(forecast.dt * 1000).getDate();
      if (forecastDate === today) {
        if (forecast.pop !== undefined) {
          totalRainProbability += forecast.pop * 100;
          count += 1;
        }
      }
    });

    const averageRainProbability = count > 0 ? totalRainProbability / count : 0;
    return averageRainProbability;
  } catch (error) {
    console.error('Error fetching weather forecast:', error.message);
    return null;
  }
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const rainProbabilityKawaguchi = await getWeatherForecast(cities.kawaguchi);
    const rainProbabilityFunabashi = await getWeatherForecast(cities.funabashi);

    if (rainProbabilityKawaguchi !== null && rainProbabilityFunabashi !== null) {
      res.status(200).json({
        kawaguchiRain: rainProbabilityKawaguchi,
        funabashiRain: rainProbabilityFunabashi,
      });
    } else {
      res.status(500).json({ message: '天気予報の取得に失敗しました。' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

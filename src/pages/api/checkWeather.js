// pages/api/checkWeather.js

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

const sendSlackNotification = async (message) => {
  const payload = { text: message };

  try {
    const response = await axios.post(process.env.SLACK_WEBHOOK_URL, payload);
    if (response.status !== 200) {
      throw new Error(`Request to Slack returned an error ${response.status}, the response is:\n${response.data}`);
    }
    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Error sending Slack notification:', error.message);
  }
};

const checkWeatherAndNotify = async () => {
  const rainProbabilityKawaguchi = await getWeatherForecast(cities.kawaguchi);
  const rainProbabilityFunabashi = await getWeatherForecast(cities.funabashi);

  if (rainProbabilityKawaguchi !== null && rainProbabilityFunabashi !== null) {
    if (rainProbabilityKawaguchi >= 50 && rainProbabilityFunabashi >= 50) {
      await sendSlackNotification(`川口市、船橋市の両方とも降水確率は50%以上です。傘を持ちましょう。\n川口市:${rainProbabilityKawaguchi.toFixed(2)}%、船橋市:${rainProbabilityFunabashi.toFixed(2)}%`);
    } else if (rainProbabilityKawaguchi >= 50) {
      await sendSlackNotification(`川口市は降水確率は${rainProbabilityKawaguchi.toFixed(2)}%です。傘を持ちましょう。`);
    } else if (rainProbabilityFunabashi >= 50) {
      await sendSlackNotification(`船橋市は降水確率は${rainProbabilityFunabashi.toFixed(2)}%です。傘を持ちましょう。`);
    } else {
      await sendSlackNotification('今日の降水確率は50%未満です。傘は必要ありません。');
    }
  } else {
    await sendSlackNotification('天気予報の取得に失敗しました。');
  }
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await checkWeatherAndNotify();
    res.status(200).json({ message: '通知が送信されました。' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

// pages/api/checkWeather.js

import axios from 'axios';

// OpenWeatherMapのAPIキー
const API_KEY = '60dd153fbc822ea273b6f93c53e024b8';

// SlackのWebhook URL
const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';

// 都市の情報
const cities = {
  kawaguchi: 'Kawaguchi,JP',
  funabashi: 'Funabashi,JP'
};

// 天気予報を取得する関数
const getWeatherForecast = async (city) => {
  const baseUrl = 'https://api.openweathermap.org/data/2.5/forecast';
  const apiUrl = `${baseUrl}?q=${city}&appid=${API_KEY}&units=metric`;

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
    console.error('Error fetching weather forecast:', error);
    return null;
  }
};

// Slackに通知を送信する関数
const sendSlackNotification = async (message) => {
  const payload = { text: message };

  try {
    const response = await axios.post(SLACK_WEBHOOK_URL, payload);
    if (response.status !== 200) {
      throw new Error(`Request to Slack returned an error ${response.status}, the response is:\n${response.data}`);
    }
  } catch (error) {
    console.error('Error sending Slack notification:', error);
  }
};

// 天気予報をチェックしてSlackに通知を送信する関数
const checkWeatherAndNotify = async () => {
  const rainProbabilityKawaguchi = await getWeatherForecast(cities.kawaguchi);
  const rainProbabilityFunabashi = await getWeatherForecast(cities.funabashi);

  if (rainProbabilityKawaguchi !== null && rainProbabilityFunabashi !== null) {
    if (rainProbabilityKawaguchi >= 50 && rainProbabilityFunabashi >= 50) {
      await sendSlackNotification(`川口市、船橋市の両方とも降水確率は${Math.max(rainProbabilityKawaguchi, rainProbabilityFunabashi).toFixed(2)}%です。傘を持ちましょう。`);
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

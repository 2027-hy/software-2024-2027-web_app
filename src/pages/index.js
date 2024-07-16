import styles from "../styles/Home.module.css";
import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [kawaguchiRain, setKawaguchiRain] = useState(null);
  const [funabashiRain, setFunabashiRain] = useState(null);

  const sendNotification = async () => {
    setLoading(true);
    setMessage('');

    try {
      // 通知を送信
      const response = await fetch('/api/checkWeather', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to send notification');
      }
      const data = await response.json();
      setMessage(data.message);

      // 降水確率を取得して表示
      const rainResponse = await fetch('/api/getRainProbability', {
        method: 'GET',
      });
      if (!rainResponse.ok) {
        throw new Error('Failed to fetch rain probability');
      }
      const rainData = await rainResponse.json();
      setKawaguchiRain(rainData.kawaguchiRain);
      setFunabashiRain(rainData.funabashiRain);
    } catch (error) {
      setMessage('通知の送信中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div>
        <h1>天気通知システム</h1>
        <button onClick={sendNotification} disabled={loading}>
          {loading ? '送信中...' : '通知を作成'}
        </button>
        {message && <p>{message}</p>}
      </div>
      <div>
        <p>川口市の降水確率: {kawaguchiRain !== null ? `${kawaguchiRain.toFixed(2)}%` : '---'}</p>
        <p>船橋市の降水確率: {funabashiRain !== null ? `${funabashiRain.toFixed(2)}%` : '---'}</p>
      </div>
    </main>
  );
}

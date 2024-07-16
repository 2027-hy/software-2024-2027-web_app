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
      const response = await fetch('/api/checkWeather', {
        method: 'POST',
      });
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage('通知の送信中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  const getRainProbability = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/getRainProbability', {
        method: 'GET',
      });
      const data = await response.json();
      setKawaguchiRain(data.kawaguchiRain);
      setFunabashiRain(data.funabashiRain);
    } catch (error) {
      setMessage('降水確率の取得中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div>
        <h1>天気通知システム</h1>
        <button onClick={sendNotification} disabled={loading}>
          {loading ? '送信中...' : '通知を送信'}
        </button>
        {message && <p>{message}</p>}
      </div>
      <div>
        <button onClick={getRainProbability} disabled={loading}>
          {loading ? '取得中...' : '降水確率を表示'}
        </button>
        {kawaguchiRain !== null && (
          <p>川口市の降水確率: {kawaguchiRain.toFixed(2)}%</p>
        )}
        {funabashiRain !== null && (
          <p>船橋市の降水確率: {funabashiRain.toFixed(2)}%</p>
        )}
      </div>
    </main>
  );
}

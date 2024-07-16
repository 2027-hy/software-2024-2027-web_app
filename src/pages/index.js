// pages/index.js
import styles from "../styles/Home.module.css";
import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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

  return (
    <div className ={styles.main}>
      <h1>天気通知システム</h1>
      <button onClick={sendNotification} disabled={loading}>
        {loading ? '送信中...' : '通知を送信'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}

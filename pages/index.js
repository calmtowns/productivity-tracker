import { useState, useEffect } from 'react';

export default function Home() {
  const [entries, setEntries] = useState([]);
  const [planned, setPlanned] = useState('');
  const [completed, setCompleted] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('productivity-data');
    if (stored) setEntries(JSON.parse(stored));
  }, []);

  const save = () => {
    if (!planned || !completed) return alert('Заполни оба поля');
    const perc = Math.round((completed / planned) * 100);
    const newEntries = [...entries, { date: new Date().toLocaleDateString('ru-RU'), planned, completed, perc }];
    setEntries(newEntries);
    localStorage.setItem('productivity-data', JSON.stringify(newEntries));
    setPlanned('');
    setCompleted('');
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: '1rem', fontFamily: 'Arial' }}>
      <h1>Трекер продуктивности</h1>
      <input type="number" placeholder="Задач на день" value={planned} onChange={(e) => setPlanned(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
      <input type="number" placeholder="Выполнено" value={completed} onChange={(e) => setCompleted(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
      <button onClick={save} style={{ width: '100%', padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Добавить</button>
      <div style={{ marginTop: '2rem' }}>
        {entries.map((e, i) => <div key={i} style={{ padding: '10px', background: '#f0f0f0', marginBottom: '10px', borderRadius: '5px' }}>{e.date}: {e.completed}/{e.planned} ({e.perc}%)</div>)}
      </div>
    </div>
  );
}

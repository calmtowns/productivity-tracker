import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../styles/globals.css';

export default function Home() {
  const [entries, setEntries] = useState([]);
  const [today, setToday] = useState(new Date().toISOString().split('T')[0]);
  const [plannedInput, setPlannedInput] = useState('');
  const [completedInput, setCompletedInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const stored = localStorage.getItem('productivity-tracker');
    if (stored) {
      try {
        setEntries(JSON.parse(stored));
      } catch (e) {
        console.log('Error loading data');
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('productivity-tracker', JSON.stringify(entries));
    }
  }, [entries, loading]);

  const getTodayEntry = () => {
    return entries.find(e => e.date === today);
  };

  const addOrUpdateEntry = () => {
    if (!plannedInput || !completedInput) {
      alert('Заполни оба поля');
      return;
    }

    const planned = parseInt(plannedInput);
    const completed = parseInt(completedInput);
    
    if (planned <= 0 || completed < 0 || completed > planned) {
      alert('Проверь числа');
      return;
    }

    const percentage = Math.round((completed / planned) * 100);

    const newEntries = entries.filter(e => e.date !== today);
    newEntries.push({
      date: today,
      planned,
      completed,
      percentage
    });
    newEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    setEntries(newEntries);
    setPlannedInput('');
    setCompletedInput('');
  };

  const getLast7Days = () => {
    return [...entries].slice(-7).map(e => ({
      date: new Date(e.date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }),
      completion: e.percentage
    }));
  };

  const getThreeDayReport = () => {
    if (entries.length < 1) return null;

    const lastThree = [...entries].slice(-3);
    const avgCompletion = Math.round(
      lastThree.reduce((sum, e) => sum + e.percentage, 0) / lastThree.length
    );
    const trend = lastThree.length > 1 
      ? lastThree[lastThree.length - 1].percentage - lastThree[0].percentage
      : 0;

    return {
      days: lastThree,
      avgCompletion,
      trend,
      totalTasks: lastThree.reduce((sum, e) => sum + e.completed, 0),
      totalPlanned: lastThree.reduce((sum, e) => sum + e.planned, 0)
    };
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Загружаю...</div>;
  }

  const todayEntry = getTodayEntry();
  const chartData = getLast7Days();
  const report = getThreeDayReport();
  const shouldShowReport = entries.length >= 3 && (entries.length % 3 === 0);

  return (
    <div className="container">
      <div className="header">
        <h1>Трекер продуктивности</h1>
        <p className="date">
          {new Date(today).toLocaleDateString('ru-RU', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="card">
        <h2>План на сегодня</h2>
        
        <div className="input-group">
          <div className="input-field">
            <label>Задач на день</label>
            <input
              type="number"
              value={plannedInput}
              onChange={(e) => setPlannedInput(e.target.value)}
              placeholder="10"
              min="1"
            />
          </div>
          <div className="input-field">
            <label>Выполнено</label>
            <input
              type="number"
              value={completedInput}
              onChange={(e) => setCompletedInput(e.target.value)}
              placeholder="8"
              min="0"
            />
          </div>
        </div>

        <button className="button-primary" onClick={addOrUpdateEntry}>
          {todayEntry ? 'Обновить' : 'Добавить'}
        </button>

        {todayEntry && (
          <div className="today-stats">
            <div>
              <p className="label">Выполнено</p>
              <p className="value">{todayEntry.completed}/{todayEntry.planned}</p>
            </div>
            <div>
              <p className="label">Процент</p>
              <p className="value percentage">{todayEntry.percentage}%</p>
            </div>
          </div>
        )}
      </div>

      {chartData.length > 0 && (
        <div className="card">
          <h2>График за неделю</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#999" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#999" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5' }}
                formatter={(value) => `${value}%`}
              />
              <Line 
                type="monotone" 
                dataKey="completion" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {shouldShowReport && report && (
        <div className="card report">
          <h2>Отчёт за 3 дня</h2>
          
          <div className="report-grid">
            <div className="report-item">
              <p className="label">Среднее выполнение</p>
              <p className="value">{report.avgCompletion}%</p>
            </div>

            <div className="report-item">
              <p className="label">Тренд</p>
              <p className={`value ${report.trend > 0 ? 'positive' : report.trend < 0 ? 'negative' : 'neutral'}`}>
                {report.trend > 0 ? '+' : ''}{report.trend}%
              </p>
            </div>

            <div className="report-item">
              <p className="label">Задач выполнено</p>
              <p className="value">{report.totalTasks}/{report.totalPlanned}</p>
            </div>
          </div>
        </div>
      )}

      {entries.length > 0 && (
        <div className="card">
          <h2>История</h2>
          <div className="history">
            {[...entries].reverse().map((entry) => (
              <div key={entry.date} className="history-item">
                <span className="history-date">
                  {new Date(entry.date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })}
                </span>
                <span className="history-value">
                  {entry.completed}/{entry.planned} ({entry.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ height: '2rem' }}></div>
    </div>
  );
}

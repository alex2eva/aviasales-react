import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <h1 className="home-title">✈️ Aviasales</h1>
      <p className="home-subtitle">Система управления авиарейсами</p>

      <div className="home-cards">
        <div className="home-card">
          <h3>🌍 Справочники</h3>
          <p>Управление справочными данными</p>
          <div className="home-links">
            <Link to="/countries">Страны</Link>
            <Link to="/cities">Города</Link>
            <Link to="/airports">Аэропорты</Link>
            <Link to="/aircrafts">Самолеты</Link>
            <Link to="/seats-classes">Класс места</Link>
            <Link to="/airlines">Авиакомпании</Link>
          </div>
        </div>

        <div className="home-card">
          <h3>🔍 Поиск рейсов</h3>
          <p>Поиск рейсов по различным критериям</p>
          <Link to="/flights" className="home-btn">Найти рейс</Link>
        </div>

        <div className="home-card">
          <h3>ℹ️ Информация</h3>
          <p>База данных: PostgreSQL<br />Порт: 5434<br />База: aviasales</p>
        </div>
      </div>
    </div>
  );
}

export default Home;


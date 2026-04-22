import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Countries from './components/Countries';
import Cities from './components/Cities';
import Airports from './components/Airports';
import Aircrafts from './components/Aircrafts';
import SeatsClasses from './components/SeatsClasses';
import Airlines from './components/Airlines';
import Flights from './components/Flights';
import Home from './components/Home';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-brand">
              ✈️ Aviasales
            </Link>
            <div className="nav-links">
              <Link to="/countries">Страны</Link>
              <Link to="/cities">Города</Link>
              <Link to="/airports">Аэропорты</Link>
              <Link to="/aircrafts">Самолеты</Link>
              <Link to="/seats-classes">Класс места</Link>
              <Link to="/airlines">Авиакомпании</Link>
              <Link to="/flights">Поиск рейсов</Link>
            </div>
          </div>
        </nav>

        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/countries" element={<Countries />} />
            <Route path="/cities" element={<Cities />} />
            <Route path="/airports" element={<Airports />} />
            <Route path="/aircrafts" element={<Aircrafts />} />
            <Route path="/seats-classes" element={<SeatsClasses />} />
            <Route path="/airlines" element={<Airlines />} />
            <Route path="/flights" element={<Flights />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;


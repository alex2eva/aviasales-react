import React, { useState, useEffect } from 'react';
import { getAirports, createAirport, deleteAirport, getCities } from '../services/api';
import './Reference.css';

function Airports() {
  const [airports, setAirports] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({ code: '', city_id: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [airportsRes, citiesRes] = await Promise.all([
        getAirports(),
        getCities()
      ]);
      setAirports(airportsRes.data);
      setCities(citiesRes.data);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке данных: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAirport(formData);
      setSuccess('Аэропорт успешно добавлен');
      setFormData({ code: '', city_id: '' });
      loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Ошибка при добавлении: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот аэропорт?')) {
      return;
    }
    try {
      await deleteAirport(id);
      setSuccess('Аэропорт успешно удален');
      loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Ошибка при удалении: ' + err.message);
    }
  };

  return (
    <div>
      <h1 className="page-title">✈️ Справочник: Аэропорты</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-card">
        <h3>Добавить аэропорт</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Код (IATA)</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                maxLength="3"
                required
              />
            </div>
            <div className="form-group">
              <label>Город</label>
              <select
                value={formData.city_id}
                onChange={(e) => setFormData({ ...formData, city_id: e.target.value })}
                required
              >
                <option value="">Выберите город</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name} ({city.country_name})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className="btn btn-primary">
                Добавить
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="table-container">
        {loading ? (
          <p>Загрузка...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Код</th>
                <th>Город</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {airports.map((airport) => (
                <tr key={airport.id}>
                  <td>{airport.id}</td>
                  <td>{airport.code || '-'}</td>
                  <td>{airport.city_name}, {airport.country_name}</td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(airport.id)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Airports;


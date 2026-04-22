import React, { useState, useEffect } from 'react';
import { getCities, createCity, deleteCity, getCountries } from '../services/api';
import './Reference.css';

function Cities() {
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({ name: '', country_id: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [citiesRes, countriesRes] = await Promise.all([
        getCities(),
        getCountries()
      ]);
      setCities(citiesRes.data);
      setCountries(countriesRes.data);
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
      await createCity(formData);
      setSuccess('Город успешно добавлен');
      setFormData({ name: '', country_id: '' });
      loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Ошибка при добавлении: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот город?')) {
      return;
    }
    try {
      await deleteCity(id);
      setSuccess('Город успешно удален');
      loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Ошибка при удалении: ' + err.message);
    }
  };

  return (
    <div>
      <h1 className="page-title">🏙️ Справочник: Города</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-card">
        <h3>Добавить город</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Название города</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Страна</label>
              <select
                value={formData.country_id}
                onChange={(e) => setFormData({ ...formData, country_id: e.target.value })}
                required
              >
                <option value="">Выберите страну</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
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
                <th>Название</th>
                <th>Страна</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {cities.map((city) => (
                <tr key={city.id}>
                  <td>{city.id}</td>
                  <td>{city.name}</td>
                  <td>{city.country_name}</td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(city.id)}
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

export default Cities;


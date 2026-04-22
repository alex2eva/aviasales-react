import React, { useState, useEffect } from 'react';
import { getCountries, createCountry, deleteCountry } from '../services/api';
import './Reference.css';

function Countries() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      setLoading(true);
      const response = await getCountries();
      setCountries(response.data);
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
      await createCountry(formData);
      setSuccess('Страна успешно добавлена');
      setFormData({ name: '' });
      loadCountries();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Ошибка при добавлении: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту страну?')) {
      return;
    }
    try {
      await deleteCountry(id);
      setSuccess('Страна успешно удалена');
      loadCountries();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Ошибка при удалении: ' + err.message);
    }
  };

  return (
    <div>
      <h1 className="page-title">🌍 Справочник: Страны</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-card">
        <h3>Добавить страну</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Название страны</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
                required
              />
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
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {countries.map((country) => (
                <tr key={country.id}>
                  <td>{country.id}</td>
                  <td>{country.name}</td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(country.id)}
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

export default Countries;


import React, { useState, useEffect } from 'react';
import { getAirlines, createAirline, deleteAirline } from '../services/api';
import './Reference.css';

function Airlines() {
  const [airlines, setAirlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({ name: '', iata_code: '' });

  useEffect(() => {
    loadAirlines();
  }, []);

  const loadAirlines = async () => {
    try {
      setLoading(true);
      const response = await getAirlines();
      setAirlines(response.data);
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
      await createAirline(formData);
      setSuccess('Авиакомпания успешно добавлена');
      setFormData({ name: '', iata_code: '' });
      loadAirlines();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Ошибка при добавлении: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту авиакомпанию?')) {
      return;
    }
    try {
      await deleteAirline(id);
      setSuccess('Авиакомпания успешно удалена');
      loadAirlines();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Ошибка при удалении: ' + err.message);
    }
  };

  return (
    <div>
      <h1 className="page-title">🏢 Справочник: Авиакомпании</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-card">
        <h3>Добавить авиакомпанию</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Название</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>IATA код</label>
              <input
                type="text"
                value={formData.iata_code}
                onChange={(e) => setFormData({ ...formData, iata_code: e.target.value })}
                maxLength="2"
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
                <th>IATA код</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {airlines.map((airline) => (
                <tr key={airline.id}>
                  <td>{airline.id}</td>
                  <td>{airline.name}</td>
                  <td>{airline.iata_code || '-'}</td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(airline.id)}
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

export default Airlines;


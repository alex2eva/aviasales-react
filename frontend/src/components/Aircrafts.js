import React, { useState, useEffect } from 'react';
import { getAircrafts, createAircraft, deleteAircraft } from '../services/api';
import './Reference.css';

function Aircrafts() {
  const [aircrafts, setAircrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({ model: '', seats_count: '' });

  useEffect(() => {
    loadAircrafts();
  }, []);

  const loadAircrafts = async () => {
    try {
      setLoading(true);
      const response = await getAircrafts();
      setAircrafts(response.data);
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
      await createAircraft({
        ...formData,
        seats_count: formData.seats_count ? parseInt(formData.seats_count) : null
      });
      setSuccess('Самолет успешно добавлен');
      setFormData({ model: '', seats_count: '' });
      loadAircrafts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Ошибка при добавлении: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот самолет?')) {
      return;
    }
    try {
      await deleteAircraft(id);
      setSuccess('Самолет успешно удален');
      loadAircrafts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Ошибка при удалении: ' + err.message);
    }
  };

  return (
    <div>
      <h1 className="page-title">🛫 Справочник: Самолеты</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-card">
        <h3>Добавить самолет</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Модель</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Количество мест</label>
              <input
                type="number"
                value={formData.seats_count}
                onChange={(e) => setFormData({ ...formData, seats_count: e.target.value })}
                min="0"
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
                <th>Модель</th>
                <th>Количество мест</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {aircrafts.map((aircraft) => (
                <tr key={aircraft.id}>
                  <td>{aircraft.id}</td>
                  <td>{aircraft.model}</td>
                  <td>{aircraft.seats_count || '-'}</td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(aircraft.id)}
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

export default Aircrafts;


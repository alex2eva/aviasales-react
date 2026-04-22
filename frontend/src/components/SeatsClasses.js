import React, { useState, useEffect } from 'react';
import { getSeatsClasses, createSeatsClass, deleteSeatsClass } from '../services/api';
import './Reference.css';

function SeatsClasses() {
  const [seatsClasses, setSeatsClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    loadSeatsClasses();
  }, []);

  const loadSeatsClasses = async () => {
    try {
      setLoading(true);
      const response = await getSeatsClasses();
      setSeatsClasses(response.data);
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
      await createSeatsClass(formData);
      setSuccess('Класс места успешно добавлен');
      setFormData({ name: '' });
      loadSeatsClasses();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Ошибка при добавлении: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот класс места?')) {
      return;
    }
    try {
      await deleteSeatsClass(id);
      setSuccess('Класс места успешно удален');
      loadSeatsClasses();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Ошибка при удалении: ' + err.message);
    }
  };

  return (
    <div>
      <h1 className="page-title">💺 Справочник: Класс места</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-card">
        <h3>Добавить класс места</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Название класса</label>
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
              {seatsClasses.map((seatsClass) => (
                <tr key={seatsClass.id}>
                  <td>{seatsClass.id}</td>
                  <td>{seatsClass.name}</td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(seatsClass.id)}
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

export default SeatsClasses;


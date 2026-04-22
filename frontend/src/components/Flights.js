import React, { useState, useEffect } from 'react';
import { searchFlights, getCities, getAirports, getSeatsClasses, sellTicket, getPrice } from '../services/api';
import './Flights.css';

function Flights() {
  const [flights, setFlights] = useState([]);
  const [cities, setCities] = useState([]);
  const [airports, setAirports] = useState([]);
  const [seatsClasses, setSeatsClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [price, setPrice] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({
    last_name: '',
    first_name: '',
    middle_name: '',
    birth_date: '',
    passport: '',
    seats_class_id: ''
  });
  const [searchParams, setSearchParams] = useState({
    departure_city_id: '',
    departure_airport_id: '',
    arrival_city_id: '',
    arrival_airport_id: '',
    departure_date: ''
  });

  useEffect(() => {
    loadReferenceData();
  }, []);

  const loadReferenceData = async () => {
    try {
      const [citiesRes, airportsRes, seatsClassesRes] = await Promise.all([
        getCities(),
        getAirports(),
        getSeatsClasses()
      ]);
      setCities(citiesRes.data);
      setAirports(airportsRes.data);
      setSeatsClasses(seatsClassesRes.data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Ошибка при загрузке данных';
      setError(errorMessage);
      console.error('Error loading reference data:', err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const params = {};
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key]) {
          params[key] = searchParams[key];
        }
      });
      const response = await searchFlights(params);
      setFlights(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Ошибка при поиске рейсов';
      setError(errorMessage);
      console.error('Error searching flights:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchParams({
      departure_city_id: '',
      departure_airport_id: '',
      arrival_city_id: '',
      arrival_airport_id: '',
      departure_date: ''
    });
    setFlights([]);
  };

  const formatDateTime = (date, time) => {
    if (!date) return '-';
    const dateStr = date;
    const timeStr = time || '';
    if (timeStr) {
      return `${dateStr} ${timeStr}`;
    }
    return dateStr;
  };

  const handlePurchaseClick = () => {
    if (!selectedFlight) {
      setError('Пожалуйста, выберите рейс из таблицы');
      return;
    }
    setShowPurchaseForm(true);
    setError(null);
    setPrice(null);
  };

  const handleSeatsClassChange = async (e) => {
    const seatsClassId = e.target.value;
    setPurchaseForm({ ...purchaseForm, seats_class_id: seatsClassId });
    
    if (selectedFlight && seatsClassId) {
      try {
        setPriceLoading(true);
        const response = await getPrice(selectedFlight.id, seatsClassId);
        setPrice(response.data.price);
        setError(null);
      } catch (err) {
        const errorMessage = err.response?.data?.error || err.message || 'Не удалось загрузить цену';
        setPrice(null);
        // Не показываем ошибку как критическую, просто не отображаем цену
        console.error('Error loading price:', errorMessage);
      } finally {
        setPriceLoading(false);
      }
    } else {
      setPrice(null);
    }
  };

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await sellTicket({
        flight_id: selectedFlight.id,
        ...purchaseForm
      });
      setSuccess('Билет успешно куплен!');
      setShowPurchaseForm(false);
      setSelectedFlight(null);
      setPurchaseForm({
        last_name: '',
        first_name: '',
        middle_name: '',
        birth_date: '',
        passport: '',
        seats_class_id: ''
      });
      setPrice(null);
      // Reload flights to update available seats
      const params = {};
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key]) {
          params[key] = searchParams[key];
        }
      });
      const response = await searchFlights(params);
      setFlights(response.data);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      // Improved error handling
      let errorMessage = 'Ошибка при покупке билета';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.detail) {
        errorMessage = `Ошибка: ${err.response.data.detail}`;
      } else if (err.message) {
        errorMessage = `Ошибка: ${err.message}`;
      }
      
      if (err.response?.data?.code) {
        console.error('Database error code:', err.response.data.code);
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">🔍 Поиск рейсов</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-card">
        <h3>Критерии поиска</h3>
        <form onSubmit={handleSearch}>
          <div className="form-row">
            <div className="form-group">
              <label>Город вылета</label>
              <select
                value={searchParams.departure_city_id}
                onChange={(e) => setSearchParams({ ...searchParams, departure_city_id: e.target.value })}
              >
                <option value="">Все города</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name} ({city.country_name})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Аэропорт вылета</label>
              <select
                value={searchParams.departure_airport_id}
                onChange={(e) => setSearchParams({ ...searchParams, departure_airport_id: e.target.value })}
              >
                <option value="">Все аэропорты</option>
                {airports.map((airport) => (
                  <option key={airport.id} value={airport.id}>
                    {airport.code ? `${airport.code}` : `ID: ${airport.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Город прилета</label>
              <select
                value={searchParams.arrival_city_id}
                onChange={(e) => setSearchParams({ ...searchParams, arrival_city_id: e.target.value })}
              >
                <option value="">Все города</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name} ({city.country_name})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Аэропорт прилета</label>
              <select
                value={searchParams.arrival_airport_id}
                onChange={(e) => setSearchParams({ ...searchParams, arrival_airport_id: e.target.value })}
              >
                <option value="">Все аэропорты</option>
                {airports.map((airport) => (
                  <option key={airport.id} value={airport.id}>
                    {airport.code ? `${airport.code}` : `ID: ${airport.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Дата вылета</label>
              <input
                type="date"
                value={searchParams.departure_date}
                onChange={(e) => setSearchParams({ ...searchParams, departure_date: e.target.value })}
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Поиск...' : 'Найти'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              Сбросить
            </button>
          </div>
        </form>
      </div>

      {flights.length > 0 && (
        <div className="table-container">
          <h3>Найдено рейсов: {flights.length}</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>ID</th>
                  <th>Номер рейса</th>
                  <th>Самолет</th>
                  <th>Аэропорт вылета</th>
                  <th>Город вылета</th>
                  <th>Аэропорт прилета</th>
                  <th>Город прилета</th>
                  <th>Вылет</th>
                  <th>Прилет</th>
                  <th>Авиакомпания</th>
                </tr>
              </thead>
              <tbody>
                {flights.map((flight) => (
                  <tr 
                    key={flight.id}
                    className={selectedFlight?.id === flight.id ? 'selected' : ''}
                    onClick={() => setSelectedFlight(flight)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <input
                        type="radio"
                        name="flight"
                        checked={selectedFlight?.id === flight.id}
                        onChange={() => setSelectedFlight(flight)}
                      />
                    </td>
                    <td>{flight.id}</td>
                    <td>{flight.flight_num || '-'}</td>
                    <td>{flight.aircraft_model || '-'}</td>
                    <td>
                      {flight.departure_airport_code || '-'}
                    </td>
                    <td>{flight.departure_city_name}, {flight.departure_country_name}</td>
                    <td>
                      {flight.arrival_airport_code || '-'}
                    </td>
                    <td>{flight.arrival_city_name}, {flight.arrival_country_name}</td>
                    <td>{formatDateTime(flight.departure_date, flight.departure_time)}</td>
                    <td>{formatDateTime(flight.arrival_date, flight.arrival_time)}</td>
                    <td>{flight.airline_name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button 
              className="btn btn-primary" 
              onClick={handlePurchaseClick}
              disabled={!selectedFlight || loading}
            >
              Купить
            </button>
          </div>
        </div>
      )}

      {flights.length === 0 && !loading && (
        <div className="alert alert-info">
          Рейсы не найдены. Попробуйте изменить критерии поиска.
        </div>
      )}

      {showPurchaseForm && (
        <div className="modal-overlay" onClick={() => setShowPurchaseForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="form-card">
              <h3>Покупка билета</h3>
              <form onSubmit={handlePurchaseSubmit}>
                <div className="form-group">
                  <label>Фамилия *</label>
                  <input
                    type="text"
                    value={purchaseForm.last_name}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, last_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Имя *</label>
                  <input
                    type="text"
                    value={purchaseForm.first_name}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Отчество</label>
                  <input
                    type="text"
                    value={purchaseForm.middle_name}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, middle_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Дата рождения *</label>
                  <input
                    type="date"
                    value={purchaseForm.birth_date}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, birth_date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Паспорт *</label>
                  <input
                    type="text"
                    value={purchaseForm.passport}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, passport: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Класс места *</label>
                  <select
                    value={purchaseForm.seats_class_id}
                    onChange={handleSeatsClassChange}
                    required
                  >
                    <option value="">Выберите класс</option>
                    {seatsClasses.map((seatClass) => (
                      <option key={seatClass.id} value={seatClass.id}>
                        {seatClass.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Цена</label>
                  <input
                    type="text"
                    value={priceLoading ? 'Загрузка...' : (price !== null ? `${price.toLocaleString('ru-RU')} ₽` : '-')}
                    readOnly
                    disabled
                    style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Покупка...' : 'Купить'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setShowPurchaseForm(false);
                      setPurchaseForm({
                        last_name: '',
                        first_name: '',
                        middle_name: '',
                        birth_date: '',
                        passport: '',
                        seats_class_id: ''
                      });
                      setPrice(null);
                    }}
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Flights;


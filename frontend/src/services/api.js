import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhance error object with database error details
    if (error.response?.data) {
      error.message = error.response.data.error || error.message;
      error.detail = error.response.data.detail;
      error.code = error.response.data.code;
    }
    return Promise.reject(error);
  }
);

// Countries
export const getCountries = () => api.get('/countries');
export const createCountry = (data) => api.post('/countries', data);
export const deleteCountry = (id) => api.delete(`/countries/${id}`);

// Cities
export const getCities = () => api.get('/cities');
export const createCity = (data) => api.post('/cities', data);
export const deleteCity = (id) => api.delete(`/cities/${id}`);

// Airports
export const getAirports = () => api.get('/airports');
export const createAirport = (data) => api.post('/airports', data);
export const deleteAirport = (id) => api.delete(`/airports/${id}`);

// Aircrafts
export const getAircrafts = () => api.get('/aircrafts');
export const createAircraft = (data) => api.post('/aircrafts', data);
export const deleteAircraft = (id) => api.delete(`/aircrafts/${id}`);

// Seats Classes
export const getSeatsClasses = () => api.get('/seats-classes');
export const createSeatsClass = (data) => api.post('/seats-classes', data);
export const deleteSeatsClass = (id) => api.delete(`/seats-classes/${id}`);

// Airlines
export const getAirlines = () => api.get('/airlines');
export const createAirline = (data) => api.post('/airlines', data);
export const deleteAirline = (id) => api.delete(`/airlines/${id}`);

// Flights
export const searchFlights = (params) => api.get('/flights', { params });

// Prices
export const getPrice = (flight_id, seats_class_id) => 
  api.get('/prices', { params: { flight_id, seats_class_id } });

// Tickets
export const sellTicket = (data) => api.post('/tickets/sell', data);

export default api;


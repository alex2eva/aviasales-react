const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5434,
  database: process.env.DB_NAME || 'aviasales',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// ==================== COUNTRIES ====================
app.get('/api/countries', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, "Name" as name FROM country ORDER BY "Name" ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching countries:', error);
    const errorMessage = error.detail || error.message || 'Ошибка при получении списка стран';
    res.status(500).json({ error: errorMessage, code: error.code, detail: error.detail });
  }
});

app.post('/api/countries', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Название страны обязательно' });
    }
    const result = await pool.query(
      'INSERT INTO country ("Name") VALUES ($1) RETURNING id, "Name" as name',
      [name.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating country:', error);
    let errorMessage = error.message;
    if (error.code === '23505') {
      errorMessage = 'Страна с таким названием уже существует';
    } else if (error.detail) {
      errorMessage = error.detail;
    }
    res.status(500).json({ error: errorMessage, code: error.code, detail: error.detail });
  }
});

app.delete('/api/countries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM country WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Страна с указанным ID не найдена' });
    }
    res.json({ message: 'Страна успешно удалена' });
  } catch (error) {
    console.error('Error deleting country:', error);
    let errorMessage = error.message;
    if (error.code === '23503') {
      errorMessage = 'Невозможно удалить страну: существуют связанные записи (города)';
    } else if (error.detail) {
      errorMessage = error.detail;
    }
    res.status(500).json({ error: errorMessage, code: error.code, detail: error.detail });
  }
});

// ==================== CITIES ====================
app.get('/api/cities', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c."Name" as name, c.country_fk as country_id, co."Name" as country_name 
      FROM city c 
      LEFT JOIN country co ON c.country_fk = co.id 
      ORDER BY c."Name" ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cities', async (req, res) => {
  try {
    const { name, country_id } = req.body;
    const result = await pool.query(
      'INSERT INTO city ("Name", country_fk) VALUES ($1, $2) RETURNING id, "Name" as name, country_fk as country_id',
      [name, country_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating city:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/cities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM city WHERE id = $1', [id]);
    res.json({ message: 'City deleted successfully' });
  } catch (error) {
    console.error('Error deleting city:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== AIRPORTS ====================
app.get('/api/airports', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.id, a.code, a.airport_city_fk as city_id, c."Name" as city_name, co."Name" as country_name
      FROM airport a
      LEFT JOIN city c ON a.airport_city_fk = c.id
      LEFT JOIN country co ON c.country_fk = co.id
      ORDER BY a.code ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching airports:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/airports', async (req, res) => {
  try {
    const { code, city_id } = req.body;
    if (!code || !city_id) {
      return res.status(400).json({ error: 'Code and city_id are required' });
    }
    const result = await pool.query(
      'INSERT INTO airport (code, airport_city_fk) VALUES ($1, $2) RETURNING id, code, airport_city_fk as city_id',
      [code, city_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating airport:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/airports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM airport WHERE id = $1', [id]);
    res.json({ message: 'Airport deleted successfully' });
  } catch (error) {
    console.error('Error deleting airport:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== AIRCRAFTS ====================
app.get('/api/aircrafts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM aircraft ORDER BY model ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching aircrafts:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/aircrafts', async (req, res) => {
  try {
    const { model } = req.body;
    const result = await pool.query(
      'INSERT INTO aircraft (model) VALUES ($1) RETURNING *',
      [model]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating aircraft:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/aircrafts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM aircraft WHERE id = $1', [id]);
    res.json({ message: 'Aircraft deleted successfully' });
  } catch (error) {
    console.error('Error deleting aircraft:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== SEATS CLASSES ====================
app.get('/api/seats-classes', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, "Class" as name FROM seats_class ORDER BY "Class" ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching seats classes:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/seats-classes', async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query(
      'INSERT INTO seats_class ("Class") VALUES ($1) RETURNING id, "Class" as name',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating seats class:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/seats-classes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM seats_class WHERE id = $1', [id]);
    res.json({ message: 'Seats class deleted successfully' });
  } catch (error) {
    console.error('Error deleting seats class:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== AIRLINES ====================
app.get('/api/airlines', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM airline ORDER BY name ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching airlines:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/airlines', async (req, res) => {
  try {
    const { name, iata_code } = req.body;
    const result = await pool.query(
      'INSERT INTO airline (name, iata_code) VALUES ($1, $2) RETURNING *',
      [name, iata_code || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating airline:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/airlines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM airline WHERE id = $1', [id]);
    res.json({ message: 'Airline deleted successfully' });
  } catch (error) {
    console.error('Error deleting airline:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== FLIGHTS ====================
app.get('/api/flights', async (req, res) => {
  try {
    const {
      departure_city_id,
      departure_airport_id,
      arrival_city_id,
      arrival_airport_id,
      departure_date
    } = req.query;

    let query = `
      SELECT 
        f.id,
        f.depature_time as departure_time,
        f.depature_date as departure_date,
        f.arrival_time,
        f.arrival_date,
        f.flight_num,
        f.departure_airport_fk as departure_airport_id,
        f.arrival_airport_fk as arrival_airport_id,
        f.flight_aircraft_fk as aircraft_id,
        f.flight_airline_fk as airline_id,
        a.model as aircraft_model,
        da.code as departure_airport_code,
        dc."Name" as departure_city_name,
        dco."Name" as departure_country_name,
        aa.code as arrival_airport_code,
        ac."Name" as arrival_city_name,
        aco."Name" as arrival_country_name,
        al.name as airline_name
      FROM flight f
      LEFT JOIN aircraft a ON f.flight_aircraft_fk = a.id
      LEFT JOIN airport da ON f.departure_airport_fk = da.id
      LEFT JOIN city dc ON da.airport_city_fk = dc.id
      LEFT JOIN country dco ON dc.country_fk = dco.id
      LEFT JOIN airport aa ON f.arrival_airport_fk = aa.id
      LEFT JOIN city ac ON aa.airport_city_fk = ac.id
      LEFT JOIN country aco ON ac.country_fk = aco.id
      LEFT JOIN airline al ON f.flight_airline_fk = al.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (departure_city_id) {
      query += ` AND dc.id = $${paramCount++}`;
      params.push(departure_city_id);
    }

    if (departure_airport_id) {
      query += ` AND da.id = $${paramCount++}`;
      params.push(departure_airport_id);
    }

    if (arrival_city_id) {
      query += ` AND ac.id = $${paramCount++}`;
      params.push(arrival_city_id);
    }

    if (arrival_airport_id) {
      query += ` AND aa.id = $${paramCount++}`;
      params.push(arrival_airport_id);
    }

    if (departure_date) {
      query += ` AND f.depature_date = $${paramCount++}`;
      params.push(departure_date);
    }

    query += ' ORDER BY f.depature_date ASC, f.depature_time ASC';

    const result = await pool.query(query, params);
    
    // Filter flights with available seats using seats_quantity function
    const flightsWithSeats = [];
    for (const flight of result.rows) {
      try {
        const seatsResult = await pool.query('SELECT seats_quantity($1, NULL) as quantity', [flight.id]);
        const quantity = parseInt(seatsResult.rows[0].quantity);
        if (quantity > 0) {
          flightsWithSeats.push(flight);
        }
      } catch (err) {
        console.error(`Error checking seats for flight ${flight.id}:`, err);
        // If function doesn't exist or error, include flight anyway
        flightsWithSeats.push(flight);
      }
    }
    
    res.json(flightsWithSeats);
  } catch (error) {
    console.error('Error fetching flights:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== PRICES ====================
app.get('/api/prices', async (req, res) => {
  try {
    const { flight_id, seats_class_id } = req.query;
    
    if (!flight_id || !seats_class_id) {
      return res.status(400).json({ error: 'Отсутствуют обязательные параметры: flight_id и seats_class_id' });
    }

    const result = await pool.query(
      'SELECT price FROM price WHERE price_flight_fk = $1 AND price_seats_class_fk = $2',
      [parseInt(flight_id), parseInt(seats_class_id)]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Цена для данного рейса и класса места не найдена' });
    }
    
    res.json({ price: parseFloat(result.rows[0].price) });
  } catch (error) {
    console.error('Error fetching price:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== TICKETS ====================
app.post('/api/tickets/sell', async (req, res) => {
  try {
    const { flight_id, last_name, first_name, middle_name, birth_date, passport, seats_class_id } = req.body;
    
    console.log('Received ticket purchase request:', {
      flight_id,
      last_name,
      first_name,
      middle_name,
      birth_date,
      passport,
      seats_class_id
    });
    
    if (!flight_id || !last_name || !first_name || !birth_date || !passport || !seats_class_id) {
      return res.status(400).json({ error: 'Отсутствуют обязательные поля' });
    }

    // Validate data types
    const flightIdInt = parseInt(flight_id);
    const seatsClassIdInt = parseInt(seats_class_id);
    
    if (isNaN(flightIdInt) || isNaN(seatsClassIdInt)) {
      return res.status(400).json({ error: 'Некорректные данные: ID рейса и класса места должны быть числами' });
    }

    // Call sell_ticket function
    // Function signature: sell_ticket(p_last_name, p_first_name, p_middle_name, p_birthdate, p_passport, p_flight, p_class)
    const result = await pool.query(
      'SELECT sell_ticket($1, $2, $3, $4, $5, $6, $7) as ticket_id',
      [
        last_name.trim(), 
        first_name.trim(), 
        middle_name ? middle_name.trim() : null, 
        birth_date, 
        passport.trim(), 
        flightIdInt, 
        seatsClassIdInt
      ]
    );
    
    res.json({ 
      success: true, 
      ticket_id: result.rows[0].ticket_id,
      message: 'Билет успешно куплен' 
    });
  } catch (error) {
    console.error('Error selling ticket:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint,
      hint: error.hint
    });
    
    // Handle specific database errors with detailed messages
    let errorMessage = error.message;
    
    if (error.code === '23505') {
      // Unique constraint violation
      if (error.constraint === 'ticket_unique') {
        errorMessage = 'Ошибка: билет с таким номером уже существует. Попробуйте еще раз.';
      } else if (error.constraint === 'passanger_passport_key') {
        errorMessage = 'Ошибка: пассажир с таким номером паспорта уже существует.';
      } else {
        errorMessage = `Ошибка: нарушение уникальности данных (${error.constraint || 'неизвестное ограничение'}). ${error.detail || ''}`;
      }
    } else if (error.code === '23503') {
      // Foreign key constraint violation
      errorMessage = `Ошибка: некорректные данные. ${error.detail || 'Рейс, класс места или связанные данные не найдены в базе данных.'}`;
    } else if (error.code === '23514') {
      // Check constraint violation
      errorMessage = `Ошибка: нарушены ограничения данных. ${error.detail || ''}`;
    } else if (error.code === '23502') {
      // Not null constraint violation
      errorMessage = `Ошибка: обязательное поле не заполнено. ${error.detail || ''}`;
    } else if (error.code === 'P0001') {
      // PL/pgSQL exception
      errorMessage = `Ошибка выполнения: ${error.message}`;
    } else if (error.detail) {
      errorMessage = `Ошибка базы данных: ${error.detail}`;
      if (error.hint) {
        errorMessage += ` Подсказка: ${error.hint}`;
      }
    } else if (error.message) {
      errorMessage = `Ошибка: ${error.message}`;
    } else {
      errorMessage = 'Произошла неизвестная ошибка при обработке запроса';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      code: error.code,
      detail: error.detail 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


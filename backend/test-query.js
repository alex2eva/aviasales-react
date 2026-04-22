const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function testQuery() {
  try {
    console.log('Тестирую запрос к таблице country...');
    const result = await pool.query('SELECT * FROM country ORDER BY name ASC');
    console.log('Успешно! Найдено записей:', result.rows.length);
    if (result.rows.length > 0) {
      console.log('Первая запись:', result.rows[0]);
    }
  } catch (error) {
    console.error('Ошибка при выполнении запроса:');
    console.error('Сообщение:', error.message);
    console.error('Код:', error.code);
    console.error('Детали:', error.detail);
  } finally {
    await pool.end();
  }
}

testQuery();


const pool = require('../utils/pool');

module.exports = class Car {
  id;
  name;
  model;

  constructor(row) {
    this.id = row.id;
    this.name = row.name;
    this.model = row.model;
  }

  static async insert({ name, model }) {
    const { rows } = await pool.query(
      'INSERT INTO cars(name, model) VALUES ($1, $2) RETURNING *;',
      [name, model]
    );
    return new Car(rows[0]);
  }

  static async findAll() {
    const { rows } = await pool.query('SELECT * FROM cars');
    return rows.map((row) => new Car(row));
  }

  static async findCarById(id) {
    const { rows } = await pool.query('SELECT * FROM cars WHERE id=$1', [id]);
    if (!rows[0]) return null;
    return new Car(rows[0]);
  }

  static async updateCarById(id, attributes) {
    const currentCar = await Car.findCarById(id);
    const updateAtts = { ...currentCar, ...attributes };
    const { name, model } = updateAtts;
    const { rows } = await pool.query(
      'UPDATE cars SET name=$2, model=$3 WHERE id=$1 RETURNING *',
      [id, name, model]
    );
    return new Car(rows[0]);
  }

  static async deleteCarById(id) {
    const { rows } = await pool.query(
      'DELETE FROM cars WHERE id=$1 RETURNING *;',
      [id]
    );

    if (!rows[0]) return null;
    return new Car(rows[0]);
  }
};
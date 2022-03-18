const pool = require('../utils/pool');

module.exports = class Keyboard {
  id;
  brand;
  name;
  mech;

  constructor(row) {
    this.id = row.id;
    this.brand = row.brand;
    this.name = row.name;
    this.mech = row.mech;
  }

  static async insert({ brand, name, mech }) {
    const { rows } = await pool.query(
      'INSERT INTO keyboards(brand, name, mech) VALUES ($1, $2, $3) RETURNING *;',
      [brand, name, mech]
    );
    return new Keyboard(rows[0]);
  }
};
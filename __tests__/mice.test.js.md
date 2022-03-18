const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const Mice = require('../lib/models/Mice');

async function createMouse({ brand, name, price }) {
  const { rows } = await pool.query(
    'INSERT INTO mice(brand, name, price) VALUES ($1, $2, $3) RETURNING *;',
    [brand, name, price]
  );
  return new Mice(rows[0]);
}

async function getMouseById(id) {
  const { rows } = await pool.query('SELECT * FROM mice WHERE id=$1', [id]);
  if (!rows[0]) return null;
  return new Mice(rows[0]);
}

describe('hands-of-resources routes', () => {
  beforeEach(() => {
    return setup(pool);
  });

  afterAll(() => {
    pool.end();
  });

  it('should be create a mouse', async () => {
    const resp = await request(app)
      .post('/api/v1/mice')
      .send({ brand: 'Logitech', name: 'MX Master 3', price: 80 });

    expect(resp.body).toEqual({
      id: expect.any(String),
      brand: 'Logitech',
      name: 'MX Master 3',
      price: 80,
    });
  });

  it('List all mics', async () => {
    await createMouse({ brand: 'Logitech', name: 'MX Master 3', price: 80 });
    const resp = await request(app).get('/api/v1/mice');

    expect(resp.body).toEqual([
      {
        id: expect.any(String),
        brand: 'Logitech',
        name: 'MX Master 3',
        price: 80,
      },
    ]);
  });

  it('should find mouse by id', async () => {
    const mouse = await createMouse({
      brand: 'Logitech',
      name: 'MX Master 3',
      price: 80,
    });
    const resp = await request(app).get(`/api/v1/mice/${mouse.id}`);

    expect(resp.body).toEqual(mouse);
  });

  it('should update a mouse', async () => {
    const mouse = await createMouse({
      brand: 'Logitech',
      name: 'MX Master 3',
      price: 80,
    });
    const resp = await request(app)
      .patch(`/api/v1/mice/${mouse.id}`)
      .send({ name: 'MX Master' });
    const expected = {
      id: expect.any(String),
      brand: 'Logitech',
      name: 'MX Master',
      price: 80,
    };
    expect(resp.body).toEqual(expected);
    expect(await getMouseById(mouse.id)).toEqual(expected);
  });

  it('Deletes a mouse from the db by id', async () => {
    const mouse = await createMouse({
      brand: 'Logitech',
      name: 'MX Master',
      price: 80,
    });
    const resp = await request(app).delete(`/api/v1/mice/${mouse.id}`);

    expect(resp.body).toEqual(mouse);
    expect(await getMouseById(mouse.id)).toBeNull();
  });
});
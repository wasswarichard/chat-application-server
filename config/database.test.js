const pool = require("./database");

test('test database connect', ()=> {
    pool.query(`SELECT user_name, user_room FROM users where user_room='showroom'`, (error, results) => {
        expect(results.rows).toEqual([{user_name: expect.anything(), user_room: 'showroom'}])
        pool.end();
    });
});
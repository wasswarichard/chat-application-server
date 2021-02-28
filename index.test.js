process.env.NODE_ENV = 'test';
const app = require('./index');
const supertest = require('supertest');
const request = supertest(app);

describe('chat application', () => {
    it('gets the login endpoint', async done => {
        const response = await  request
            .post('/login')
            .send({name : 'richard', room: 'showroom'})
        expect(response.statusCode).toBe(200);
        done();
    });

    it('gets the create endpoint', async done => {
        const response = await  request
            .post('/create')
            .send({name : 'richard', room: 'showroom'})
        expect(response.statusCode).toBe(200);
        done();
    });

})
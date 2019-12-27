const knex = require('knex');
const fixtures = require('./zebralogs-fixtures');
const app = require('../src/app');

describe('Zebralogs Endpoints', () => {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('cleanup', () => db('zebralogs').truncate())

    afterEach('cleanup', () => db('zebralogs').truncate())

    describe('GET /api/zebralogs', () => {
        context(`Given no zebralogs`, () => {
          it(`responds with 200 and an empty list`, () => {
            return supertest(app)
              .get('/api/zebralogs')
              .expect(200, [])
          })
        })
    
        context('Given there are zebralogs in the database', () => {
          const testZebralogs = fixtures.makeZebralogsArray();
    
          beforeEach('insert zebralogs', () => {
            return db
              .into('zebralogs')
              .insert(testZebralogs)
          })
    
          it('gets the zebralogs from the store', () => {
            return supertest(app)
              .get('/api/zebralogs')
              .expect(200, testZebralogs)
          })
        })
    })

    describe('GET /api/zebralogs/:id', () => {
        context(`Given no zebralogs`, () => {
          it(`responds 404 when zebralog doesn't exist`, () => {
            return supertest(app)
              .get(`/api/zebralogs/123`)
              .expect(404, {
                error: { message: `Zebralog Not Found` }
              })
          })
        })
    
        context('Given there are zebralogs in the database', () => {
          const testZebralogs = fixtures.makeZebralogsArray()
    
          beforeEach('insert zebralogs', () => {
            return db
              .into('zebralogs')
              .insert(testZebralogs)
          })
    
          it('responds with 200 and the specified zebralog', () => {
            const zebralogId = 2
            const expectedZebralog = testZebralogs[zebralogId - 1]
            return supertest(app)
              .get(`/api/zebralogs/${zebralogId}`)
              .expect(200, expectedZebralog)
          })
        })
    })

    describe('DELETE /api/zebralogs/:id', () => {
        context(`Given no zebralogs`, () => {
          it(`responds 404 when zebralog doesn't exist`, () => {
            return supertest(app)
              .delete(`/api/zebralogs/123`)
              .expect(404, {
                error: { message: `Zebralog Not Found` }
              })
          })
        })
    
        context('Given there are zebralogs in the database', () => {
          const testZebralogs = fixtures.makeZebralogsArray()
    
          beforeEach('insert zebralogs', () => {
            return db
              .into('zebralogs')
              .insert(testZebralogs)
          })
    
          it('removes the zebralog by ID from the store', () => {
            const idToRemove = 2
            const expectedZebralogs = testZebralogs.filter(zl => zl.id !== idToRemove)
            return supertest(app)
              .delete(`/api/zebralogs/${idToRemove}`)
              .expect(204)
              .then(() =>
                supertest(app)
                  .get(`/api/zebralogs`)
                  .expect(expectedZebralogs)
              )
          })
        })
    })

    describe('POST /api/zebralogs', () => {
        it('adds a new zebralog to the store', () => {
          const newZebralog = {
            game_date: '2019-06-01',
            site: 'Framingham High School',
            distance: '15',
            paid: 'Yes',
            type: 'Youth',
            amount: '75',
            notes: 'None',
          }
          return supertest(app)
            .post(`/api/zebralogs`)
            .send(newZebralog)
            .expect(201)
            .expect(res => {
              expect(res.body.game_date).to.eql(newZebralog.game_date)
              expect(res.body.site).to.eql(newZebralog.site)
              expect(res.body.distance).to.eql(newZebralog.distance)
              expect(res.body.paid).to.eql(newZebralog.paid)
              expect(res.body.type).to.eql(newZebralog.type)
              expect(res.body.amount).to.eql(newZebralog.amount)
              expect(res.body.notes).to.eql(newZebralog.notes)
              expect(res.body).to.have.property('id')
              expect(res.headers.location).to.eql(`/api/zebralogs/${res.body.id}`)
            })
            .then(res =>
              supertest(app)
                .get(`/api/zebralogs/${res.body.id}`)
                .expect(res.body)
            )
        })
    })

    describe(`PATCH /api/zebralogs/:zebralog_id`, () => {
        context('Given there are zebralogs in the database', () => {
          const testZebralogs = fixtures.makeZebralogsArray()
    
          beforeEach('insert zebralogs', () => {
            return db
              .into('zebralogs')
              .insert(testZebralogs)
          })
    
          it('responds with 204 and updates the zebralog', () => {
            const idToUpdate = 2
            const updateZebralog = {
              game_date: '2019-07-01',
              site: 'Natick High School',
              distance: '20',
              paid: 'Yes',
              type: 'Other',
              amount: '40',
              notes: 'None',
            }
            const expectedArticle = {
              ...testZebralogs[idToUpdate - 1],
              ...updateZebralog
            }
            return supertest(app)
              .patch(`/api/zebralogs/${idToUpdate}`)
              .send(updateZebralog)
              .expect(204)
              .then(res =>
                supertest(app)
                  .get(`/api/zebralogs/${idToUpdate}`)
                  .expect(expectedArticle)
              )
          })
    
          it(`responds with 204 when updating only a subset of fields`, () => {
            const idToUpdate = 2
            const updateZebralog = {
              game_date: '2019-09-01',
            }
            const expectedZebralog = {
              ...testZebralogs[idToUpdate - 1],
              ...updateZebralog
            }
    
            return supertest(app)
              .patch(`/api/zebralogs/${idToUpdate}`)
              .send({
                ...updateZebralog,
                fieldToIgnore: 'should not be in GET response'
              })
              .expect(204)
              .then(res =>
                supertest(app)
                  .get(`/api/zebralogs/${idToUpdate}`)
                  .expect(expectedZebralog)
              )
          })
        })
    })
})
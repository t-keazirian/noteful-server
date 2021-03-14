const {expect} = require('chai');
const supertest = require('supertest');
const app = require('../src/app');
const knex = require('knex');
const { makeFoldersArray } = require('./folders.fixtures');
const { makeNotesArray } = require('./notes.fixtures');

describe('Folders endpoint', () => {
  let db;
  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    })
    app.set('db', db);
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'))

  afterEach('cleanup', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'))

  describe('GET /api/folders', () => {
    context('Given no folders', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200, [])
      })
    })

    context('Given there are folders in the db', () => {
      const testFolders = makeFoldersArray();
      const testNotes = makeNotesArray();

      beforeEach('insert folders', () => {
        return db
          .into('folders')
          .insert(testFolders)
          .then(() => {
            return db
              .into('notes')
              .insert(testNotes)
          })
      })

      it('responds with 200 and all the folders', () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200, testFolders)
      })
    })
  })

  describe('POST /api/folders', () => {
    it('creates a folder, responding with 201 and the new folder', () => {
      const newFolder = {
        folder_name: 'Test Folder Name'
      }

      return supertest(app)
        .post('/api/folders')
        .send(newFolder)
        .expect(201)
        .expect(res=> {
          expect(res.body.folder_name).to.eql(newFolder.folder_name)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/api/folders/${res.body.id}`)
        })
        .then(postRes => {
          supertest(app)
          .get(`/api/folders/${postRes.body.id}`)
          .expect(postRes.body)
        })
    })

    it(`responds with 400 and an error message when 'folder_name' is missing`, () => {
      const newFolder = {
        folder_name: ''
      }
      return supertest(app)
        .post('/api/folders')
        .send(newFolder)
        .expect(400, {
          error: {message: `Missing 'folder name' in request body`}
        })
    } )
  })

  describe('DELETE /api/folders/:folder_id', () => {
    context('Given no folders', () => {
      it('responds with 404', () => {
        const folder_id = 123456;
        return supertest(app)
          .delete(`/api/folders/${folder_id}`)
          .expect(404, {error: {message: `Folder doesn't exist`}})
      })
    })

    context('Given there are folders in the db', () => {
      const testFolders = makeFoldersArray();
      const testNotes = makeNotesArray();

      beforeEach('insert folders', () => {
        return db
          .into('folders')
          .insert(testFolders)
          .then(() => {
            return db
              .into('notes')
              .insert(testNotes)
          })
      })

      it('responds with 204 and removes the folder', () => {
        const idToRemove = 2;
        const expectedFolders = testFolders.filter(folder => folder.id !== idToRemove)

        return supertest(app)
          .delete(`/api/folders/${idToRemove}`)
          .expect(204)
          .then(res => {
            supertest(app)
            .get('/api/folders')
            .expect(expectedFolders)
          })
      })
    })

  })

  describe('GET /api/folders/:folder_id', () => {

    context('Given no folders', () => {
      it('responds with 404', () => {
        const folder_id = 123456;
        return supertest(app)
          .get(`/api/folders/${folder_id}`)
          .expect(404, {error: {message: `Folder doesn't exist`}})
      })
    })

    context('Given there are folders in the db', () => {

      const testFolders = makeFoldersArray();
      const testNotes = makeNotesArray();

      beforeEach('insert folders', () => {
        return db
          .into('folders')
          .insert(testFolders)
          .then(() => {
            return db
              .into('notes')
              .insert(testNotes)
          })
      })

      it('GET /api/folders/:folder_id responds with 200 and the specified folder', () => {
        const folder_id = 2;
        const expectedFolder = testFolders[folder_id - 1];
        return supertest(app)
          .get(`/api/folders/${folder_id}`)
          .expect(200, expectedFolder)
      })
    })
  })

  describe('PATCH /api/folders/:folder_id', () => {
    context('Given no folders', () => {
      it('responds with 404', () => {
        const folder_id = 123456;
        return supertest(app)
          .patch(`/api/folders/${folder_id}`)
          .expect(404, {error: {message: `Folder doesn't exist`}})
      })
    })

    context('Given there are folders in the db', () => {
      const testFolders = makeFoldersArray();
      const testNotes = makeNotesArray();

      beforeEach('insert folders', () => {
        return db
          .into('folders')
          .insert(testFolders)
          .then(() => {
            return db
              .into('notes')
              .insert(testNotes)
          })
      })

      it('responds with 204 and the updated folder', () => {
        const idToUpdate = 2;
        const updatedFolder = {
          folder_name: 'Updated Folder Name'
        }
        const expectedFolder = {
          ...testFolders[idToUpdate - 1],
          ...updatedFolder
        }
        
        return supertest(app)
          .patch(`/api/folders/${idToUpdate}`)
          .send(updatedFolder)
          .expect(204)
          .then(res => {
            supertest(app)
              .get(`/api/folders/${idToUpdate}`)
              .expect(expectedFolder)
          })
      })

    })
  })

})
const { expect } = require('chai');
const supertest = require('supertest');
const app = require('../src/app');
const knex = require('knex');
const { makeNotesArray } = require('./notes.fixtures');
const { makeFoldersArray } = require('./folders.fixtures');

describe('Notes endpoint', () => {
	let db;
	before('make knex instance', () => {
		db = knex({
			client: 'pg',
			connection: process.env.TEST_DATABASE_URL,
		});
		app.set('db', db);
	});

	after('disconnect from db', () => db.destroy());

	before('clean the table', () =>
		db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE')
	);

	afterEach('cleanup', () =>
		db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE')
	);

	describe('GET /api/notes', () => {
		context('Given no notes', () => {
			it('responds with 200 and an empty list', () => {
				return supertest(app).get('/api/notes').expect(200, []);
			});
		});

		context('Given there are notes in the database', () => {
			const testFolders = makeFoldersArray();
			const testNotes = makeNotesArray();

			beforeEach('insert folders', () => {
				return db
					.into('folders')
					.insert(testFolders)
					.then(() => {
						return db.into('notes').insert(testNotes);
					});
			});

			it('responds with 200 and all the notes', () => {
				return supertest(app).get('/api/notes').expect(200, testNotes);
			});
		});
	});

	describe('POST /api/notes', () => {
		it('creates a note, responding with 201 and the new note', () => {
			const newNote = {
				note_name: 'New Note',
				content: 'New note content',
				folder_id: 1,
			};

			return supertest(app)
				.post('/api/notes')
				.send(newNote)
				.expect(201)
				.expect(res => {
					expect(res.body.note_name).to.eql(newNote.note_name);
					expect(res.body.content).to.eql(newNote.content);
					expect(res.body.folder_id).to.eql(newNote.folder_id);
					expect(res.body).to.have.property('id');
					expect(res.headers.location).to.eql(`/api/notes/${res.body.id}`);
				})
				.then(postRes => {
					supertest(app)
						.get(`/api/notes/${postRes.body.id}`)
						.expect(postRes.body);
				});
		});
	});

	describe('DELETE /api/notes/:note_id', () => {
		context('Given no notes', () => {
			it('responds with 404', () => {
				const note_id = 123456;
				return supertest(app)
					.delete(`/api/notes/${note_id}`)
					.expect(404, { error: { message: `Note doesn't exist` } });
			});
		});

		context('Given there are notes in the db', () => {
			const testFolders = makeFoldersArray();
			const testNotes = makeNotesArray();

			beforeEach('insert folders', () => {
				return db
					.into('folders')
					.insert(testFolders)
					.then(() => {
						return db.into('notes').insert(testNotes);
					});
			});

			it('responds with 204 and removes the note', () => {
				const idToRemove = 2;
				const expectedNotes = testNotes.filter(note => note.id !== idToRemove);

				return supertest(app)
					.delete(`/api/notes/${idToRemove}`)
					.expect(204)
					.then(res => {
						supertest(app).get('/api/notes').expect(expectedNotes);
					});
			});
		});
	});

	describe('GET /api/notes/:note_id', () => {
		context('Given no notes', () => {
			it('responds with 404', () => {
				const note_id = 123456;
				return supertest(app)
					.get(`/api/notes/${note_id}`)
					.expect(404, { error: { message: `Note doesn't exist` } });
			});
		});

		context('Given there are notes in the db', () => {
			const testFolders = makeFoldersArray();
			const testNotes = makeNotesArray();

			beforeEach('insert folders', () => {
				return db
					.into('folders')
					.insert(testFolders)
					.then(() => {
						return db.into('notes').insert(testNotes);
					});
			});

			it('GET /api/notes/:note_id responds with 200 and the specified note', () => {
				const note_id = 2;
				const expectedNote = testNotes[note_id - 1];
				return supertest(app)
					.get(`/api/notes/${note_id}`)
					.expect(200, expectedNote);
			});
		});
	});

	describe('PATCH /api/notes/:note_id', () => {
		context('Given no notes', () => {
			it('responds with 404', () => {
				const note_id = 123456;
				return supertest(app)
					.patch(`/api/notes/${note_id}`)
					.expect(404, { error: { message: `Note doesn't exist` } });
			});
		});

		context('Given there are notes in the db', () => {
			const testFolders = makeFoldersArray();
			const testNotes = makeNotesArray();

			beforeEach('insert folders', () => {
				return db
					.into('folders')
					.insert(testFolders)
					.then(() => {
						return db.into('notes').insert(testNotes);
					});
			});

			it('responds with 204 and the updated folder', () => {
				const idToUpdate = 1;
				const updatedNote = {
					note_name: 'Updated Note Name',
					content: 'Updated note content',
				};
				const expectedNote = {
					...testNotes[idToUpdate - 1],
					...updatedNote,
				};

				return supertest(app)
					.patch(`/api/notes/${idToUpdate}`)
					.send(updatedNote)
					.expect(204)
					.then(res => {
						supertest(app).get(`/api/notes/${idToUpdate}`).expect(expectedNote);
					});
			});
		});
	});
});

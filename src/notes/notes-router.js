const express = require('express');
const xss = require('xss');
const path = require('path');
const NotesService = require('./notes-service');

const notesRouter = express.Router();
const jsonParser = express.json();

notesRouter
  .route('/')
  .get((req, res, next) => {
    NotesService.getAllNotes(req.app.get('db'))
      .then(notes => {
        res.json(notes)
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const {note_name, content, folder_id} = req.body;
    const newNote = {note_name, content, folder_id};

    for (const [key, value] of Object.entries(newNote)) {
      if (value == null) {
        return res.status(400).json({
          error: {message: `Missing ${key} in request body`}
        })
      }
    }

    newNote.modified = modified;

    NotesService.insertNote(req.app.get('db'), newNote)
      .then(note => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${note.id}`))
          .json(note)
      })
      .catch(next)
  })

  notesRouter
    .route('/:note_id')
    .all((req, res, next) => {
      NotesService.getNoteById(req.app.get('db'), req.params.note_id)
        .then(note => {
          if (!note) {
            return res.status(404).json({
              error: {message: `Note doesn't exist`}
            })
          }
          res.note = note;
          next()
        })
        .catch(next)
    })
  .get((req, res, next) => {
    res.json({
      id: res.note.id,
      note_name: xss(res.note.note_name),
      content: xss(res.note.content),
      modified: res.note.modified,
      folder_id: res.note.folder_id
    })
  })
  .delete((req, res, next) => {
    NotesService.deleteNote(req.app.get('db'), req.params.note_id)
      .then(() => {
        res.status(404).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const {note_name, content, folder_id} = req.body;
    const noteToUpdate = {note_name, content, folder_id};

    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length;

    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'note_name', 'content', or 'folder_id'`
        }
      })
    }

    NotesService.updateNote(req.app.get('db'), req.params.note_id, noteToUpdate)
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })


module.exports = notesRouter;
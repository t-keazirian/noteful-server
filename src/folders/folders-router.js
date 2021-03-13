const express = require('express');
const xss = require('xss');
const path = require('path');
const FoldersService = require('./folders-service');
const NotesService = require('../notes/notes-service');

const foldersRouter = express.Router();
const jsonParser = express.json();

foldersRouter
  .route('/')
  .get((req, res, next) => {
    FoldersService.getAllFolders(req.app.get('db'))
      .then(folders => {
        res.json(folders)
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const {folder_name} = req.body;
    const newFolder = {folder_name};

    if (!folder_name) {
      return res.status(400).json({
        error: {message: `Missing 'folder name' in request body`}
      })
    }

    FoldersService.insertFolder(req.app.get('db'), newFolder)
      .then(folder => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${folder.id}`))
          .json(folder)
      })
      .catch(next)
  })

  foldersRouter
    .route('/:folder_id/notes')
    .all((req, res, next) => {
      FoldersService.getFolderById(req.app.get('db'), req.params.folder_id)
        .then(folder => {
          if (!folder) {
            return res.status(404).json({
              error: {message: `Folder doesn't exist`}
            })
          }
          res.folder = folder;
          next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
      NotesService.getNotesByFolderId(req.app.get('db'), res.folder.id)
      .then(notes => {
        res.json({ notes })
      })
      .catch(next)
    })

  foldersRouter
    .route('/:folder_id')
    .all((req, res, next) => {
      FoldersService.getFolderById(req.app.get('db'), req.params.folder_id)
        .then(folder => {
          if (!folder) {
            return res.status(404).json({
              error: {message: `Folder doesn't exist`}
            })
          }
          res.folder = folder;
          next()
        })
        .catch(next)
    })
  .get((req, res, next) => {
    res.json({
      id: res.folder.id,
      folder_name: res.folder.folder_name
    })
  })
  .delete((req, res, next) => {
    FoldersService.deleteFolder(req.app.get('db'), req.params.folder_id)
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const {folder_name} = req.body;
    const folderToUpdate = {folder_name};

    if (!folderToUpdate) {
      return res.status(400).json({
        error: {
          message: `Request body must contain 'Folder Name'`
        }
      })
    }

    FoldersService.updateFolder(req.app.get('db'), req.params.folder_id, folderToUpdate)
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = foldersRouter;


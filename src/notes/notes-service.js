const NotesService = {

  getAllNotes(knex) {
    return knex
      .select('*')
      .from('notes')
  },

  insertNote(knex, newNote) {
    return knex
      .insert(newNote)
      .into('notes')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },

  getNoteById(knex, id) {
    return knex
      .from('notes')
      .select('*')
      .where('id', id)
      .first()
  },

  getNotesByFolderId(knex, folder_id) {
    return knex
      .from('notes')
      .select('*')
      .where('folder_id', folder_id)
  },

  deleteNote(knex, id) {
    return knex
      .from('notes')
      .where({id})
      .delete()
  },

  updateNote(knex, id, newNoteFields) {
    return knex
      .from('notes')
      .where({id})
      .update(newNoteFields)
  }

}

module.exports = NotesService;
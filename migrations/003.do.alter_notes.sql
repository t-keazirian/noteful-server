ALTER TABLE notes 
  ADD COLUMN
  folder_id INTEGER REFERENCES folders(id)
  ON DELETE RESTRICT NOT NULL;

  -- RESTRICT
  -- CASCADE
  -- SET NULL
  -- SET DEFAULT
  -- one to many - one folder can have many notes

  
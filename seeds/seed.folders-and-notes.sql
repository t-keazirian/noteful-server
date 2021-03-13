TRUNCATE folders, notes RESTART IDENTITY CASCADE;

INSERT INTO folders (folder_name)
VALUES
('Folder 1'),
('Folder 2'),
('Folder 3'),
('Folder 4'),
('Folder 5');

INSERT INTO notes (note_name, content, modified, folder_id)
VALUES
('Note 1', 'Content 1', now() - '29 days'::INTERVAL, 1),
('Note 2', 'Content 2', now() - '27 days'::INTERVAL, 2),
('Note 3', 'Content 3', now() - '20 days'::INTERVAL, 3),
('Note 4', 'Content 4', now() - '18 days'::INTERVAL, 2),
('Note 5', 'Content 5', now() - '10 days'::INTERVAL, 4);

function makeNotesArray() {
	return [
		{
			id: 1,
			note_name: 'Note 1',
			content: 'Note 1 Content',
			modified: '2029-01-22T16:28:32.615Z',
			folder_id: 1
		},
		{
			id: 2,
			note_name: 'Note 2',
			content: 'Note 2 Content',
			modified: '2100-05-22T16:28:32.615Z',
			folder_id: 2
		},
		{
			id: 3,
			note_name: 'Note 3',
			content: 'Note 3 Content',
			modified: '1919-12-22T16:28:32.615Z',
			folder_id: 3
		},
		{
			id: 4,
			note_name: 'Note 4',
			content: 'Note 4 Content',
			modified: '1919-12-22T16:28:32.615Z',
			folder_id: 4
		},
	];
}

module.exports = {
	makeNotesArray,
};

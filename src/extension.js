'use strict';

const vscode = require('vscode');
const sqlFormatter = require('snowsql-formatter');

const getSetting = (group, key, def) => {
	const settings = vscode.workspace.getConfiguration(group, null);
	const editor = vscode.window.activeTextEditor;
	const language = editor && editor.document && editor.document.languageId;
	const languageSettings =
		language && vscode.workspace.getConfiguration(null, null).get(`[${language}]`);
	let value = languageSettings && languageSettings[`${group}.${key}`];
	if (value == null) value = settings.get(key, def);
	return value == null ? def : value;
};

const getConfig = ({ insertSpaces, tabSize }) => ({
	indent: insertSpaces ? ' '.repeat(tabSize) : '\t',
	language: getSetting('sql-formatter', 'dialect', 'sql'),
	uppercase: getSetting('sql-formatter', 'uppercase', false),
	linesBetweenQueries: getSetting('sql-formatter', 'linesBetweenQueries', 2)
});

const format = (text, config) => sqlFormatter.format(text, config);

// Function to create a formatter provider
const createFormattingProvider = () => ({
	provideDocumentRangeFormattingEdits: (document, range, options) => [
		vscode.TextEdit.replace(range, format(document.getText(range), getConfig(options)))
	]
});

module.exports.activate = () => {
	// Register for SQL
	vscode.languages.registerDocumentRangeFormattingEditProvider('sql', createFormattingProvider());

	// Register for Snowflake SQL
	vscode.languages.registerDocumentRangeFormattingEditProvider(
		'snowflake-sql',
		createFormattingProvider()
	);
};

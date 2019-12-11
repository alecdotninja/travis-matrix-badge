const fetch = require('node-fetch');

exports.handler = async function(event, context) {
	return {
		statusCode: 200,
		body: "Hi, mom!",
	};
};

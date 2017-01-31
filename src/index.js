const Connection = require( "./connection" );

let connections = {};

module.exports = {
	connections,
	getConnection( url ) {
		return connections[ url ];
	},
	async connect( url ) {
		if ( connections[ url ] ) {
			throw new Error( `A connection is already open to ${ url }` );
		}
		const connection = new Connection();
		connections[ url ] = connection;
		return connection;
	},
	reset: () => {
		connections = {};
	}
};

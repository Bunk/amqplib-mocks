const sinon = require( "sinon" );
const Connection = require( "./connection" );

class ConnectionManager {
	constructor() {
		this.connections = {};

		this.connect = sinon.stub().callsFake( url => {
			if ( this.connections[ url ] ) {
				const err = new Error( `A connection is already open to ${ url }` );
				return Promise.reject( err );
			}

			const connection = new Connection( () => {
				delete this.connections[ url ];
			} );
			this.connections[ url ] = connection;
			return Promise.resolve( connection );
		} );
	}

	getConnection( url ) {
		return this.connections[ url ];
	}

	reset() {
		this.connect.resetHistory();
		this.connections = {};
	}
}

const instance = new ConnectionManager();

module.exports = instance;
module.exports.ConnectionManager = ConnectionManager;

/* eslint-disable max-lines, no-magic-numbers */
/* eslint-env mocha */
const { assert } = testHelpers;
const amqplib = require( "./index" );

describe( "connections", () => {
	let connectionString, connection;

	context( "given a connection can be established", () => {
		beforeEach( async () => {
			connectionString = "amqp://localhost";
			connection = await amqplib.connect( connectionString );
		} );

		it( "should resolve a mocked connection", () => {
			assert.isObject( connection );
		} );

		it( "should register the connection to the rabbit uri", () => {
			const conn = amqplib.getConnection( connectionString );
			assert.strictEqual( conn, connection );
		} );
	} );

	context( "given a connection has already been registered", () => {
		beforeEach( async () => {
			connectionString = "amqp://localhost";
			connection = await amqplib.connect( connectionString );
		} );

		it( "should reject the connection", () => {
			return assert.isRejected( amqplib.connect( connectionString ) );
		} );
	} );

	afterEach( () => {
		amqplib.reset();
	} );
} );

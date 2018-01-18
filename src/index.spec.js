/* eslint-disable max-lines, no-magic-numbers */
/* eslint-env mocha */
const { assert } = testHelpers;
const amqplib = require( "./index" );
const ConnectionManager = amqplib.ConnectionManager;

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

		it( "should register the API call", () => {
			assert.calledOnce( amqplib.connect );
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

	context( "overriding the connection behavior", () => {
		let manager;
		beforeEach( () => {
			manager = new ConnectionManager();
			manager.connect
				.onFirstCall().rejects( new Error( "Oops 1" ) )
				.onSecondCall().rejects( new Error( "Oops 2" ) );
		} );

		it( "should handle the behavior changes correctly", async () => {
			// Reject first time
			await assert.isRejected( manager.connect( connectionString ), /Oops 1/ );
			// Reject second time
			await assert.isRejected( manager.connect( connectionString ), /Oops 2/ );
			// Default behavior the rest of the time
			await assert.isFulfilled( manager.connect( connectionString ) );
			await assert.isRejected( manager.connect( connectionString ), /A connection is already open/i );
		} );
	} );

	afterEach( () => {
		amqplib.reset();
	} );
} );

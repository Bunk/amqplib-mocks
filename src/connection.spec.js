/* eslint-disable max-lines, no-magic-numbers */
/* eslint-env mocha */
const { assert } = testHelpers;
const amqplib = require( "./index" );

describe( "channels", () => {
	let connection, channel;

	beforeEach( async () => {
		connection = await amqplib.connect( "amqp://localhost" );
	} );

	context( "given a channel is created", () => {
		beforeEach( async () => {
			channel = await connection.createChannel();
		} );

		it( "should create the channel", () => {
			assert.isObject( channel );
		} );

		it( "can get published messages", () => {
			const messages = connection.getPublished();
			assert.deepEqual( messages, [] );
		} );

		it( "can close connection and reset channels", async () => {
			assert.isObject( connection.currentChannel );
			await connection.close();
			assert.notExists( connection.currentChannel );
			assert.isEmpty( connection.exchanges );
			assert.isEmpty( connection.queues );
		} );
	} );

	context( "given a confirm channel is created", () => {
		beforeEach( async () => {
			channel = await connection.createConfirmChannel();
		} );

		it( "should create the channel", () => {
			assert.isObject( channel );
		} );
	} );

	afterEach( () => {
		amqplib.reset();
	} );
} );

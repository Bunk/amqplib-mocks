const _ = require( "lodash" );
const sinon = require( "sinon" );
const Channel = require( "./channel" );

class Connection {
	constructor( onClose ) {
		this.queues = {};
		this.exchanges = {};
		this.on = sinon.stub();

		this.createChannel = sinon.stub().callsFake( () => {
			return ( this.channel = new Channel( this ) );
		} );

		this.createConfirmChannel = sinon.stub().callsFake( () => {
			return ( this.channel = new Channel( this ) );
		} );

		this.close = sinon.stub().callsFake( () => {
			onClose();
			this.on.withArgs( "close" ).yield();
		} );
	}

	// Test Helpers

	get currentChannel() {
		return this.channel;
	}

	get trackedMessages() {
		return this.channel.trackedMessages;
	}

	async sendUntracked( queueName, content, properties ) {
		const channel = new Channel( this );
		await channel.sendToQueue( queueName, content, properties );
	}

	async publishUntracked( exchange, routingKey, content, properties ) {
		const channel = new Channel( this );
		await channel.publish( exchange, routingKey, content, properties );
	}

	getPublished( { filter = _.stubTrue, bodyTransform = _.identity } ) {
		return this.channel.trackedMessages
			.filter( msg => filter( msg ) )
			.map( msg => Object.assign( msg, { body: bodyTransform( msg.content ) } ) );
	}
}

module.exports = Connection;

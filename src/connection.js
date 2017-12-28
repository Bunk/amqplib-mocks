const _ = require( "lodash" );
const sinon = require( "sinon" );
const Channel = require( "./channel" );

class Connection {
	constructor() {
		this.queues = {};
		this.exchanges = {};
		this.on = sinon.stub();
	}

	get currentChannel() {
		return this.channel;
	}

	get trackedMessages() {
		return this.channel.trackedMessages;
	}

	createChannel() {
		return ( this.channel = new Channel( this ) );
	}

	createConfirmChannel() {
		return ( this.channel = new Channel( this ) );
	}

	async sendUntracked( queueName, content, properties ) {
		const channel = new Channel( this );
		await channel.sendToQueue( queueName, content, properties );
	}

	async publishUntracked( exchange, routingKey, content, properties ) {
		const channel = new Channel( this );
		await channel.publish( exchange, routingKey, content, properties );
	}

	close() {
		return Promise.resolve();
	}

	getPublished( { filter = _.stubTrue, bodyTransform = _.identity } = {} ) {
		return this.channel.trackedMessages
			.filter( msg => filter( msg ) )
			.map( msg => Object.assign( msg, { body: bodyTransform( msg.content ) } ) );
	}
}

module.exports = Connection;

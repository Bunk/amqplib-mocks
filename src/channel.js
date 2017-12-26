/* eslint-disable max-lines */
const _ = require( "lodash" );
const shortid = require( "shortid" );
const sinon = require( "sinon" );

function setIfUndefined( object, prop, value ) {
	if ( !object[ prop ] ) {
		object[ prop ] = value;
	}
}

function findHandlers( connection, exchange, routingKey ) {
	if ( !exchange ) {
		return {};
	}

	const filtered = _.filter( exchange.bindings, binding => binding.regex.test( routingKey ) );
	return _.transform( filtered, ( result, binding ) => {
		if ( binding.queueName ) {
			const queue = connection.queues[ binding.queueName ];
			return Object.assign( result, queue.consumers || {} );
		}
		if ( binding.exchangeName ) {
			const boundExchange = connection.exchanges[ binding.exchangeName ];
			const consumers = findHandlers( connection, boundExchange, routingKey );
			return Object.assign( result, consumers || {} );
		}
		return false;
	}, {} );
}

async function routeMessages( consumers, message ) {
	await Promise.all( _.map( consumers, async handler => {
		return handler( message );
	} ) );
	return true;
}

function generateBindingRegex( pattern ) {
	pattern = ( pattern || "#" )
		.replace( ".", "\\." )
		.replace( "#", "(\\w|\\.)+" )
		.replace( "*", "\\w+" );
	return new RegExp( `^${ pattern }$` );
}

class Channel {
	constructor( connection ) {
		this.connection = connection;

		this.ack = sinon.stub();
		this.nack = sinon.stub();
		this.reject = sinon.stub();
		this.prefetch = sinon.stub();
		this.on = sinon.stub();
		this.once = sinon.stub();

		this.trackedMessages = [];
	}

	async assertQueue( queue, opt ) {
		if ( !queue ) { // http://www.squaremobius.net/amqp.node/channel_api.html#channel_assertQueue
			queue = shortid.generate();
		}
		setIfUndefined( this.connection.queues, queue, { messages: [], consumers: {}, options: opt } );
		return { queue, messageCount: 0, consumerCount: 0 };
	}

	async assertExchange( exchange, opt ) {
		setIfUndefined( this.connection.exchanges, exchange, { bindings: [], options: opt } );
		return { exchange };
	}

	async bindExchange( destination, source, pattern, args ) {
		if ( !this.connection.exchanges[ source ] ) {
			throw new Error( `Bind to non-existing exchange: ${ source }` );
		}
		const regex = generateBindingRegex( pattern );
		this.connection.exchanges[ source ].bindings.push( { regex, exchangeName: destination } );
		return {};
	}

	async bindQueue( queue, exchange, pattern, args ) {
		if ( !this.connection.exchanges[ exchange ] ) {
			throw new Error( `Bind to non-existing exchange: ${ exchange }` );
		}
		const regex = generateBindingRegex( pattern );
		this.connection.exchanges[ exchange ].bindings.push( { regex, queueName: queue } );
		return {};
	}

	async consume( queueName, handler ) {
		const queue = this.connection.queues[ queueName ];
		if ( !queue ) {
			throw new Error( `Consuming from non-existing queue: ${ queueName }` );
		}
		const consumerTag = shortid.generate();
		queue.consumers[ consumerTag ] = handler;
		return { consumerTag };
	}

	async publish( exchangeName, routingKey, content, properties ) {
		const exchange = this.connection.exchanges[ exchangeName ];
		if ( !exchange ) {
			throw new Error( `Publish to non-existing exchange: ${ exchangeName }` );
		}
		const consumers = findHandlers( this.connection, exchange, routingKey );
		const message = { fields: { routingKey, exchange: exchangeName }, content, properties };
		this.trackedMessages.push( message );
		return routeMessages( consumers, message );
	}

	async sendToQueue( queueName, content, properties ) {
		const queue = this.connection.queues[ queueName ];
		if ( !queue ) {
			return true;
		}
		const message = { fields: { routingKey: queueName }, content, properties };
		this.trackedMessages.push( message );
		return routeMessages( queue.consumers, message );
	}

	// amqplib sends a null message when it receives a close event from Rabbit
	async closeConsumer( queueName ) {
		const queue = this.connection.queues[ queueName ];
		if ( !queue ) {
			return true;
		}
		return routeMessages( queue.consumers, null );
	}
}

module.exports = Channel;

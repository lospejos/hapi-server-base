const User = require('./user_model');
const Boom = require('boom');

const HandlerBase = require('../handler_base');
const Mapper = require('jsonapi-mapper');

const UserHandlers =
	{
		userFindAll: function (request, reply) {
			let mapper = new Mapper.Bookshelf(request.server.info.uri);

			let uri = request.server.info.uri;
			console.log('URI: ' + uri);

			let query = HandlerBase.queryParse(request.query, 'user');

			let paginationOptions = {
				page: parseInt(query.pagination.page) || 1,
				pageSize: parseInt(query.pagination.pageSize) || 10,
				withRelated: query.pagination.withRelated || [],
			};

			if (query.extra.count) {
				User
					.query(function (qb) {
						Object.keys(query.filters).map((e) => {
							let signal = '=';
							if (typeof query.filters[e] === 'object') {
								signal = 'in';
								qb.whereIn(e, query.filters[e]);
							} else if (typeof query.filters[e] === 'string') {
								signal = 'LIKE';
							}
							qb.where(e, signal, query.filters[e]);
						})
					})
					.count('id')
					.then(function (count) {
						if (!count) {
							return reply(Boom.badRequest('Impossible to count'));
						}
						return reply({count: count});
					})
					.catch(function (error) {
						let errorMsg = error.message || 'An error occurred';
						return reply(Boom.gatewayTimeout(errorMsg));
					});
			} else {
				// Calculating records total number
				let totalCount = 'Da fare!';
				let filteredCount = 'Da fare!';

				User
					.query(function (qb) {
						Object.keys(query.filters).map((e) => {
							let signal = '=';
							if (typeof query.filters[e] === 'object') {
								signal = 'in';
								qb.whereIn(e, query.filters[e]);
							} else if (typeof query.filters[e] === 'string') {
								signal = 'LIKE';
							}
							qb.where(e, signal, query.filters[e]);
						})
					})
					.fetchPage(paginationOptions)
					.then(function (collection) {
						if (!collection) {
							return reply(Boom.badRequest('Nessun Utente!'));
						}

						console.log(collection.pagination);
						const mapperOptions = {
							meta: {
								totalCount: totalCount,
								filteredCount: filteredCount,
							}
						};
						let collMap = mapper.map(collection, 'user', mapperOptions);
						return reply(collMap);
					})
					.catch(function (error) {
						let errorMsg = error.message || 'An error occurred';
						return reply(Boom.gatewayTimeout(errorMsg));
					})

			}
		}
	};

module.exports = UserHandlers;
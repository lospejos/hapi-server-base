const _ = require('lodash');

// Only ONE element follows
const Operator = ['{=}', '{<}', '{<=}', '{>}', '{>=}', '{<>}', '{like}'];

// Array follows
const InOperator = '{in}';
// Array follows ONLY TWO elements
const BtwOperator = '{btw}';
// End condition
const NullOperator = '{null}';
// Change Where => whereNot, orWhere, orWhereNot, orWhereNotLike
const OrOperator = '{or}';
const NotOperator = '{not}';


function call(q){
	Object.keys(withFilter[rel]).forEach(function(key) {
		Object.keys(withFilter[rel][key]).map((op) => {
			if (_.includes(Operator, op)) {
				let signal = _.replace(_.replace(op, '}', ''), '{', '');
				withFilter[rel][key][op].forEach(function(value){
					q.where(key, signal, value);
				});
			}
			if (_.includes(InOperator, op)) {
				withFilter[rel][key][op].forEach(function(value){
					q.whereIn(key, value);
				});
			}
			if (_.includes(BtwOperator, op)) {
				withFilter[rel][key][op].forEach(function(value){
					q.whereBetween(key, value[0], value[1]);
				});
			}
			if (_.includes(NullOperator, op)) {
				q.whereNull(key);
			}
			if (_.includes(OrOperator, op)) {
				let orKeys = withFilter[rel][key][op];
				Object.keys(orKeys).map((orOp) => {
					if (_.includes(Operator, orOp)) {
						let signal = _.replace(_.replace(orOp, '}', ''), '{', '');
						orKeys[orOp].forEach(function(value){
							q.orWhere(key, signal, value);
						});
					}
					if (_.includes(InOperator, orOp)) {
						orKeys[orOp].forEach(function(value){
							q.orWhereIn(key, value);
						});
					}
					if (_.includes(BtwOperator, orOp)) {
						orKeys[op][orOp].forEach(function(value){
							q.orWhereBetween(key, value[0], value[1]);
						});
					}
					if (_.includes(NullOperator, orOp)) {
						q.orWhereNull(key);
					}
					if (_.includes(NotOperator, orOp)){
						let orNotKeys = withFilter[rel][key][op][orOp];
						Object.keys(orNotKeys).map((orNotOp) => {
							if (_.includes(Operator, orNotOp)) {
								let signal = _.replace(_.replace(orNotOp, '}', ''), '{', '');
								orNotKeys[orNotOp].forEach(function(value){
									q.orWhereNot(key, signal, value);
								});
							}
							if (_.includes(InOperator, orNotOp)) {
								orNotKeys[orNotOp].forEach(function(value){
									q.orWhereNotIn(key, value);
								});
							}
							if (_.includes(BtwOperator, orNotOp)) {
								orNotKeys[orNotOp].forEach(function(value){
									q.orWhereNotBetween(key, value[0], value[1]);
								});
							}
							if (_.includes(NullOperator, orNotOp)) {
								q.orWhereNotNull(key);
							}
						});
					}
				});
			}
			if (_.includes(NotOperator, op)){
				let notKeys = withFilter[rel][key][op];
				Object.keys(notKeys).map((notOp) => {
					if (_.includes(Operator, notOp)) {
						let signal = _.replace(_.replace(notOp, '}', ''), '{', '');
						notKeys[notOp].forEach(function(value){
							q.whereNot(key, signal, value);
						});
					}
					if (_.includes(InOperator, notOp)) {
						notKeys[notOp].forEach(function(value){
							q.whereNotIn(key, value);
						});
					}
					if (_.includes(BtwOperator, notOp)) {
						notKeys[notOp].forEach(function(value){
							q.whereNotBetween(key, value[0], value[1]);
						});
					}
					if (_.includes(NullOperator, notOp)) {
						q.whereNotNull(key);
					}
				});
			}
		})
	});
}


const RelatedQR = {

	with2Query: (model, queryData) => {
		let withCount = queryData.withCount;
		let withFilter = queryData.withFilter;
		let withFields = queryData.withFields;
		let withRelated = queryData.withRelated;
		if (withCount.length) {
			model.withCount(withCount)
		} else if (Object.keys(withFilter).length && Object.keys(withFields).length) {
			Object.keys(withFields).map((rel) => {
				if (_.has(withFilter, rel)) {
					model.withSelect(rel, withFields[rel], call);
				} else {
					model.withSelect(rel, withFields[rel]);
				}
			});
			Object.keys(withFilter).map((rel) => {
				if (!_.has(withFields, rel)) {
					model.with(rel, call);
				}
			});

		} else if (Object.keys(withFilter).length) {
			Object.keys(withFilter).map((rel) => {
				model.with(rel, call);
			});

		} else if (Object.keys(withFields).length) {
			Object.keys(withFields).map((rel) => {
				model.withSelect(rel, withFields[rel])
			});
		} else if (Object.keys(withRelated).length) {
				model.with(withRelated);
		}

		return model;
	}

};



module.exports = RelatedQR;


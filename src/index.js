/**
 * @author Gilles Coomans
 * @licence MIT
 * @copyright 2016 Gilles Coomans
 */

const babelute = require('babelute');

const arightLexicon = babelute.createLexicon('aright');

arightLexicon
	.addAtoms([
		'is',
		'has',
		'strict',
		'not',
		'switch',
		'required',
		'minLength',
		'maxLength',
		'minimum',
		'maximum',
		'format',
		'enum',
		'item',
		'equal',
		'instanceOf',
		'type',
		'array',
		'isArray',
		'null'
	])
	.addCompounds(() => {
		return {
			between(min, max) {
				return this.minimum(min).maximum(max);
			},
			isNull() {
				return this.equal(null);
			},
			or() {
				return this._append('aright', 'or', [].slice.call(arguments));
			},
			required(yes) {
				this._aright_required = !!yes;
				return this;
			},
			email() {
				return this.isString().format('email').minLength(6);
			}
		};
	})
	.addCompounds(() => {
		const methods = {};
		['object', 'string', 'func', 'bool', 'number', 'boolean']
		.forEach((type) => {
			methods['is' + type[0].toUpperCase() + type.substring(1)] = function() {
				return this.is(type);
			};
			methods[type] = function(name, babelute) {
				return this.has(name, type, babelute);
			};
		});
		return methods;
	});



export default arightLexicon;

//______________________________________________________


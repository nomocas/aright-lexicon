# aright-lexicon

[![Travis branch](https://img.shields.io/travis/nomocas/aright-lexicon/master.svg)](https://travis-ci.org/nomocas/aright-lexicon)
[![bitHound Overall Score](https://www.bithound.io/github/nomocas/aright-lexicon/badges/score.svg)](https://www.bithound.io/github/nomocas/aright-lexicon)
[![npm](https://img.shields.io/npm/v/aright-lexicon.svg)](https://www.npmjs.com/package/aright-lexicon)
[![npm-downloads](https://img.shields.io/npm/dm/aright-lexicon.svg)](https://npm-stat.com/charts.html?package=aright-lexicon)
[![licence](https://img.shields.io/npm/l/aright-lexicon.svg)](https://spdx.org/licenses/MIT)
[![dependecies](https://david-dm.org/nomocas/aright-lexicon.svg)](https://david-dm.org/)
[![dev-dependencies](https://img.shields.io/david/dev/nomocas/aright-lexicon.svg)](https://david-dm.org/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

([babelute](https://github.com/nomocas/babelute)) DSL for describing validation rules with expressive compact chained API.

Think about it as a Super JSON-Schema DSL. 

- Easy errors i18n. 
- Easy dialecting. 
- Really fast because it doesn't need schema parsing and interpretation. 
- Could be used to define active schema (which perform transformation on validation).
- Could be translated/transformed to many output kinds (html, assertions, function signature with meta-programming, ...)


## Usage
```
> npm i babelute aright-lexicon
```

## Examples

```javascript
const v = aright.v;

const rule = v
	.isObject()
	.string('email', v.format('email'))
	.number('index', v.equal(24))
  	.boolean('flag')
	.array('collection', v.item(v.isString()))
	.object('child',
		v.string('title')
	)
	.boolean('test');

rule.$validate({
	email: 'aaa@bbb.com',
	index: 24,
	flag: true,
	collection: ['hello'],
	child: {
		title: 'hello'
	},
	test: true
});
// => return true
```


```javascript
v.isString().format(/abc/).minLength(6).$validate('abcdef');   // return true
v.isString().enumerable(['bloupi', 'foo']).$validate('bloup'); // return error report
```

## Full API

### is* Family

.isString(), isNumber(), .isBoolean(), .isObject(), .isArray(), .isFunction(), .isNull()

```javascript
v.isNull().$validate(null); //return true
```

### .type('string', 'object', ...)

Sugar for .or(v.isString(), v.isObject(), ...)

### .instanceOf(Class)

```javascript
const rule = v.instanceOf(Date),
  result = rule.$validate(new Date()); // return true
```

### properties validation

- .boolean(propName, rule)
- .number(propName, rule)
- .string(propName, rule)
- .function(propName, rule)
- .null(propName, rule)
- .object(propName, rule)
- .array(propName, rule)

```javascript
v.string('title')
.boolean('published', v.equal(false))
.number('count')
.$validate({
  title:'hello world',
  published:false,
  count:12
}); //return true
```

### value constraints

.minLength(5), .maxLength(3), .minimum(7), .maximum(9), .enum(['foo', 12]), .equal('my value')

Any value is required by default. Only undefined will be seen as missing.

```javascript
v.$validate(undefined); // return true

v.equal(12).$validate(1); // return error report

//...
```

####  value format 
Validate value against regExp

```javascript
v.format(/abc/gi).$validate('abc'); // return true
```

To define custom format : 
```javascript
aright.formats.myFormat = /abc/gi;
v.format('myFormat').$validate('abc'); // return true
```

As predefined format there is only email for the moment...
```javascript
v.format('email').$validate('john@doe.com'); // return true
```

### array and items
Both work together :

```javascript 
const o =  {
  collection:['foo', 'bar', 'zoo']
};

v.isObject()
.array('collection',
  v.item(
    v.isString()
  )
)
.$validate(o); // return true
```

### .not and .or

```javascript
const rule = v.or(v.isString(), v.isNumber()),
    result = rule.$validate('john@doe.com') && rule.$validate(1); // return true
```

```javascript
const rule = v.not(v.isString(), v.isNumber()),
    result = rule.$validate([]) && rule.$validate(true); // return true
```

### validation

Any value could be validated by calling .$validate( valueToTest ) on any aright rule.

It returns true if rule is satisfied or an error report as follow if something fails : 

```javascript
const rule = v
  .isObject()
  .string('email', v.format('email'))
  .number('index', v.equal(24))
  .boolean('flag')
  .array('collection',
    v.item(
      v.isString()
    )
  )
  .object('child',
    v.string('title')
  )
  .boolean('test');

const result = rule.$validate({
  email: 'aaa@bbb',
  index: 1,
  flag: 'hello',
  collection: [1],
  child: null,
  test: 3
});

/* result == {
  "valid": false,
  "map": {
    "email": {
      "value": "aaa@bbb",
      "errors": [
        "format failed"
      ]
    },
    "index": {
      "value": 1,
      "errors": [
        "equality failed (should be : 24)"
      ]
    },
    "flag": {
      "value": "hello",
      "errors": [
        "should be a boolean"
      ]
    },
    "collection.0": {
      "value": 1,
      "errors": [
        "should be a string"
      ]
    },
    "child.title": {
      "value": null,
      "errors": [
        "missing property"
      ]
    },
    "test": {
      "value": 3,
      "errors": [
        "should be a boolean"
      ]
    }
  },
  "value": {
    "email": "aaa@bbb",
    "index": 1,
    "flag": "hello",
    "collection": [
      1
    ],
    "child": null,
    "test": 3
  }
}*/
```

### custom format (RegExp)


### .onValidation(handler)

Cutom validation handling.


```javascript
const rule = v.isObject(v.string('title', v.minLength(2).onValidation((input, path, errors) => {
	if(input !== ...)
		aright.pushError(errors, rule = null, input, key = null, path, shouldBe = null);
})));
```

### creating dialects

```javascript
// handler that act on choosen property
aright.Validator.prototype.myOtherRule = function(propertyName){
  return this.enqueue(propertyName, function(input, path){
  // input is the value to test, and path is its path from root object
    if(input[propertyName] ...){
      //...
      return true;
    }
    else
      return aright.error(this, 'myOtherRule', input, propertyName, path, 'string' /* what it should be */)
  });
};

v.myRule().$validate(...);
```

## i18n

Take a look to `aright/i18n/fr.js` to have an idea on how customise
```javascript
aright.i18n.data.fr = require('aright/i18n/fr');
aright.i18n.currentLanguage = 'fr';
// aright errors messages will now be in french
```


## Licence

The [MIT](http://opensource.org/licenses/MIT) License

Copyright 2016-2017 (c) Gilles Coomans

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

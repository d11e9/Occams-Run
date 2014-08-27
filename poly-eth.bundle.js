!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.polyeth=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var bigInt = require( './lib/BigInteger' );
var EthString = require( './lib/ethstring' );


var polyeth = function(eth) {

  var checkClient = function(eth) {
    var UA = window.navigator.userAgent;
    if (UA.match( 'Aleth' )) return 'aleth';
    if (UA.match( 'Ethereal')) return 'ethereal';
    if (UA.match( 'Ethos')) return 'ethos';
  }

  var accounts = {
    'NAMEREG': '0xasdoa3y4oeidhasd',
    'SELF': '0xoasidyhasod',
    '8815f6289f656e5148b7d4dee93d5d96ee7ece8f': '8815f6289f656e5148b7d4dee93d5d96ee7ece8f'
  }

  var watching = {}

  var cpp_eth = require( './lib/eth.js')

  var mocketh = {
    eth: cpp_eth,
    client: 'mocketh',

    // Proxy to cpp-ethereum eth/rpc object

    getProcedures: cpp_eth.getProcedures,
    getCoinbase: cpp_eth.getCoinbase,
    getIsListening: cpp_eth.getIsListening,
    getIsMining: cpp_eth.getIsMining,
    getGasPrice: cpp_eth.getGasPrice,
    getKey: cpp_eth.getKey,
    getKeys: cpp_eth.getKeys,
    getPeerCount: cpp_eth.getPeerCount,
    getBalanceAt: cpp_eth.getBalanceAt,
    balanceAt: cpp_eth.balanceAt,
    getStorageAt: cpp_eth.getStorageAt,
    storageAt: cpp_eth.storageAt,
    getTxCountAt: cpp_eth.getTxCountAt,
    txCountAt: cpp_eth.txCountAt, 
    getIsContractAt: cpp_eth.getIsContractAt,
    isContractAt: cpp_eth.isContractAt,
    create: cpp_eth.create,
    transact: cpp_eth.transact,
    getSecretToAddress: cpp_eth.getSecretToAddress,
    secretToAddress: cpp_eth.secretToAddress,
    getLll: cpp_eth.getLll,
    lll: cpp_eth.lll,
    check: cpp_eth.check,
    watch: cpp_eth.watch,
    unwatch: cpp_eth.unwatch,
    newBlock: cpp_eth.newBlock,

    getKeys: function(cb){ cb(['MockKey213dsf3454as'])},
    secretToAddress: function(privateKey){
      return accounts[privateKey] || accounts['SELF'];
    },
    watch: function(addr, cb) {
      console.log( 'Attach change handlers for: ', addr );
      if (watching[addr]) {
        watching[addr].push( cb )
      } else {
        watching[addr] = [cb];
      }
    },
    ready: function(cb){
      window.onload = cb;
    }
  }

  var clients = {

    ethos: checkClient( eth ) == 'aleth' && mocketh,

    aleth: checkClient( eth ) == 'aleth' && {
      eth: eth,
      client: 'aleth',
      getKeys: function(cb){ return cb(eth.keys); },
      gasPrice: eth.gasPrice,
      watch: eth.watch,
      secretToAddress: eth.secretToAddress,
      key: eth.key,
      balanceAt: eth.balanceAt,
      storageAt: eth.storageAt,
      transact: eth.transact,
      create: eth.create,
      ready: function(cb) {
        if (typeof jQuery !== 'undefined') {
          jQuery( document ).ready( cb )
        } else {
          window.onload = cb;
        }
      }

    },

    ethereal: checkClient( eth ) == 'ethereal' && {
      eth: eth,
      client: 'ethereal',
      getKeys: function(cb){ 
        // ethereal client has ony a single key and corresponding getter
        return eth.getKey(function(key){
          // wrapping in array for consistency
          return [key];
        }); 
      }
    }
  }

  if (!eth) return mocketh;
  else return clients[checkClient(eth)]
};


if ( typeof module !== 'undefined' ) {
  module.exports = polyeth;
}

},{"./lib/BigInteger":2,"./lib/eth.js":3,"./lib/ethstring":4}],2:[function(require,module,exports){
var bigInt = (function () {
    var base = 10000000, logBase = 7;
    var sign = {
        positive: false,
        negative: true
    };

    var normalize = function (first, second) {
        var a = first.value, b = second.value;
        var length = a.length > b.length ? a.length : b.length;
        for (var i = 0; i < length; i++) {
            a[i] = a[i] || 0;
            b[i] = b[i] || 0;
        }
        for (var i = length - 1; i >= 0; i--) {
            if (a[i] === 0 && b[i] === 0) {
                a.pop();
                b.pop();
            } else break;
        }
        if (!a.length) a = [0], b = [0];
        first.value = a;
        second.value = b;
    };

    var parse = function (text, first) {
        if (typeof text === "object") return text;
        text += "";
        var s = sign.positive, value = [];
        if (text[0] === "-") {
            s = sign.negative;
            text = text.slice(1);
        }
        var base = 10;
        
        if (text.slice(0, 2) == "0x") {
            base = 16;
            text = text.slice(2);
        } else {
            var texts = text.split("e");
            if (texts.length > 2) throw new Error("Invalid integer");
            if (texts[1]) {
                var exp = texts[1];
                if (exp[0] === "+") exp = exp.slice(1);
                exp = parse(exp);
                if (exp.lesser(0)) throw new Error("Cannot include negative exponent part for integers");
                while (exp.notEquals(0)) {
                    texts[0] += "0";
                    exp = exp.prev();
                }
            }
            text = texts[0];
        }
        
        if (text === "-0") text = "0";
        text = text.toUpperCase();
        var isValid = (base == 16 ? /^[0-9A-F]*$/ : /^[0-9]+$/).test(text);
        if (!isValid) throw new Error("Invalid integer");
        if (base == 16) {
            var val = bigInt(0);
            while (text.length) {
                v = text.charCodeAt(0) - 48;
                if (v > 9)
                v -= 7;
                text = text.slice(1);
                val = val.times(16).plus(v);
            }
            return val;
        } else {
            while (text.length) {
                var divider = text.length > logBase ? text.length - logBase : 0;
                value.push(+text.slice(divider));
                text = text.slice(0, divider);
            }
            var val = bigInt(value, s);
            if (first) normalize(first, val);
                     return val;
        }
    };

    var goesInto = function (a, b) {
        var a = bigInt(a, sign.positive), b = bigInt(b, sign.positive);
        if (a.equals(0)) throw new Error("Cannot divide by 0");
        var n = 0;
        do {
            var inc = 1;
            var c = bigInt(a.value, sign.positive), t = c.times(10);
            while (t.lesser(b)) {
                c = t;
                inc *= 10;
                t = t.times(10);
            }
            while (c.lesserOrEquals(b)) {
                b = b.minus(c);
                n += inc;
            }
        } while (a.lesserOrEquals(b));

        return {
            remainder: b.value,
            result: n
        };
    };

    var bigInt = function (value, s) {
        var self = {
            value: value,
            sign: s
        };
        var o = {
            value: value,
            sign: s,
            negate: function (m) {
                var first = m || self;
                return bigInt(first.value, !first.sign);
            },
            abs: function (m) {
                var first = m || self;
                return bigInt(first.value, sign.positive);
            },
            add: function (n, m) {
                var s, first = self, second;
                if (m) (first = parse(n)) && (second = parse(m));
                else second = parse(n, first);
                s = first.sign;
                if (first.sign !== second.sign) {
                    first = bigInt(first.value, sign.positive);
                    second = bigInt(second.value, sign.positive);
                    return s === sign.positive ? o.subtract(first, second) : o.subtract(second, first);
                }
                normalize(first, second);
                var a = first.value, b = second.value;
                var result = [],
                carry = 0;
                for (var i = 0; i < a.length || carry > 0; i++) {
                    var sum = (a[i] || 0) + (b[i] || 0) + carry;
                    carry = sum >= base ? 1 : 0;
                    sum -= carry * base;
                    result.push(sum);
                }
                return bigInt(result, s);
            },
            plus: function (n, m) {
                return o.add(n, m);
            },
            subtract: function (n, m) {
                var first = self, second;
                if (m) (first = parse(n)) && (second = parse(m));
                else second = parse(n, first);
                if (first.sign !== second.sign) return o.add(first, o.negate(second));
                if (first.sign === sign.negative) return o.subtract(o.negate(second), o.negate(first));
                if (o.compare(first, second) === -1) return o.negate(o.subtract(second, first));
                var a = first.value, b = second.value;
                var result = [],
                borrow = 0;
                for (var i = 0; i < a.length; i++) {
                    var tmp = a[i] - borrow;
                    borrow = tmp < b[i] ? 1 : 0;
                    var minuend = (borrow * base) + tmp - b[i];
                    result.push(minuend);
                }
                return bigInt(result, sign.positive);
            },
            minus: function (n, m) {
                return o.subtract(n, m);
            },
            multiply: function (n, m) {
                var s, first = self, second;
                if (m) (first = parse(n)) && (second = parse(m));
                else second = parse(n, first);
                s = first.sign !== second.sign;
                var a = first.value, b = second.value;
                var resultSum = [];
                for (var i = 0; i < a.length; i++) {
                    resultSum[i] = [];
                    var j = i;
                    while (j--) {
                        resultSum[i].push(0);
                    }
                }
                var carry = 0;
                for (var i = 0; i < a.length; i++) {
                    var x = a[i];
                    for (var j = 0; j < b.length || carry > 0; j++) {
                        var y = b[j];
                        var product = y ? (x * y) + carry : carry;
                        carry = product > base ? Math.floor(product / base) : 0;
                        product -= carry * base;
                        resultSum[i].push(product);
                    }
                }
                var max = -1;
                for (var i = 0; i < resultSum.length; i++) {
                    var len = resultSum[i].length;
                    if (len > max) max = len;
                }
                var result = [], carry = 0;
                for (var i = 0; i < max || carry > 0; i++) {
                    var sum = carry;
                    for (var j = 0; j < resultSum.length; j++) {
                        sum += resultSum[j][i] || 0;
                    }
                    carry = sum > base ? Math.floor(sum / base) : 0;
                    sum -= carry * base;
                    result.push(sum);
                }
                return bigInt(result, s);
            },
            times: function (n, m) {
                return o.multiply(n, m);
            },
            divmod: function (n, m) {
                var s, first = self, second;
                if (m) (first = parse(n)) && (second = parse(m));
                else second = parse(n, first);
                s = first.sign !== second.sign;
                if (bigInt(first.value, first.sign).equals(0)) return {
                    quotient: bigInt([0], sign.positive),
                    remainder: bigInt([0], sign.positive)
                };
                if (second.equals(0)) throw new Error("Cannot divide by zero");
                var a = first.value, b = second.value;
                var result = [], remainder = [];
                for (var i = a.length - 1; i >= 0; i--) {
                    var n = [a[i]].concat(remainder);
                    var quotient = goesInto(b, n);
                    result.push(quotient.result);
                    remainder = quotient.remainder;
                }
                result.reverse();
                return {
                    quotient: bigInt(result, s),
                    remainder: bigInt(remainder, first.sign)
                };
            },
            divide: function (n, m) {
                return o.divmod(n, m).quotient;
            },
            over: function (n, m) {
                return o.divide(n, m);
            },
            mod: function (n, m) {
                return o.divmod(n, m).remainder;
            },
            pow: function (n, m) {
                var first = self, second;
                if (m) (first = parse(n)) && (second = parse(m));
                else second = parse(n, first);
                var a = first, b = second;
                if (b.lesser(0)) return ZERO;
                if (b.equals(0)) return ONE;
                var result = bigInt(a.value, a.sign);

                if (b.mod(2).equals(0)) {
                    var c = result.pow(b.over(2));
                    return c.times(c);
                } else {
                    return result.times(result.pow(b.minus(1)));
                }
            },
            next: function (m) {
                var first = m || self;
                return o.add(first, 1);
            },
            prev: function (m) {
                var first = m || self;
                return o.subtract(first, 1);
            },
            compare: function (n, m) {
                var first = self, second;
                if (m) (first = parse(n)) && (second = parse(m, first));
                else second = parse(n, first);
                normalize(first, second);
                if (first.value.length === 1 && second.value.length === 1 && first.value[0] === 0 && second.value[0] === 0) return 0;
                if (second.sign !== first.sign) return first.sign === sign.positive ? 1 : -1;
                var multiplier = first.sign === sign.positive ? 1 : -1;
                var a = first.value, b = second.value;
                for (var i = a.length - 1; i >= 0; i--) {
                    if (a[i] > b[i]) return 1 * multiplier;
                    if (b[i] > a[i]) return -1 * multiplier;
                }
                return 0;
            },
            compareAbs: function (n, m) {
                var first = self, second;
                if (m) (first = parse(n)) && (second = parse(m, first));
                else second = parse(n, first);
                first.sign = second.sign = sign.positive;
                return o.compare(first, second);
            },
            equals: function (n, m) {
                return o.compare(n, m) === 0;
            },
            notEquals: function (n, m) {
                return !o.equals(n, m);
            },
            lesser: function (n, m) {
                return o.compare(n, m) < 0;
            },
            greater: function (n, m) {
                return o.compare(n, m) > 0;
            },
            greaterOrEquals: function (n, m) {
                return o.compare(n, m) >= 0;
            },
            lesserOrEquals: function (n, m) {
                return o.compare(n, m) <= 0;
            },
            isPositive: function (m) {
                var first = m || self;
                return first.sign === sign.positive;
            },
            isNegative: function (m) {
                var first = m || self;
                return first.sign === sign.negative;
            },
            isEven: function (m) {
                var first = m || self;
                return first.value[0] % 2 === 0;
            },
            isOdd: function (m) {
                var first = m || self;
                return first.value[0] % 2 === 1;
            },
            toString: function (m) {
                var first = m || self;
                var str = "", len = first.value.length;
                while (len--) {
                    if (first.value[len].toString().length === 8) str += first.value[len];
                    else str += (base.toString() + first.value[len]).slice(-logBase);
                }
                while (str[0] === "0") {
                    str = str.slice(1);
                }
                if (!str.length) str = "0";
                var s = (first.sign === sign.positive || str == "0") ? "" : "-";
                return s + str;
            },
            toHex: function (m) {
                var first = m || self;
                var str = "";
                var l = this.abs();
                while (l > 0) {
                    var qr = l.divmod(256);
                    var b = qr.remainder.toJSNumber();
                    str = (b >> 4).toString(16) + (b & 15).toString(16) + str;
                    l = qr.quotient;
                }
                return (this.isNegative() ? "-" : "") + "0x" + str;
            },
            toJSNumber: function (m) {
                return +o.toString(m);
            },
            valueOf: function (m) {
                return o.toJSNumber(m);
            }
        };
        return o;
    };

    var ZERO = bigInt([0], sign.positive);
    var ONE = bigInt([1], sign.positive);
    var MINUS_ONE = bigInt([1], sign.negative);

    var fnReturn = function (a) {
        if (typeof a === "undefined") return ZERO;
        return parse(a);
    };
    fnReturn.zero = ZERO;
    fnReturn.one = ONE;
    fnReturn.minusOne = MINUS_ONE;
    return fnReturn;
})();

if (typeof module !== "undefined") {
    module.exports = bigInt;
}

},{}],3:[function(require,module,exports){
if (typeof(window.eth) === "undefined") {
	require( './ethstring');
	
	var spec = [
        { "method": "procedures", "params": null, "order": [], "returns": [] },
        { "method": "coinbase", "params": null, "order": [], "returns" : "" },
        { "method": "isListening", "params": null, "order": [], "returns" : false },
        { "method": "isMining", "params": null, "order": [], "returns" : false },
        { "method": "gasPrice", "params": null, "order": [], "returns" : "" },
        { "method": "key", "params": null, "order": [], "returns" : "" },
        { "method": "keys", "params": null, "order": [], "returns" : [] },
        { "method": "peerCount", "params": null, "order": [], "returns" : 0 },
        { "method": "balanceAt", "params": { "a": "" }, "order": ["a"], "returns" : "" },
        { "method": "storageAt", "params": { "a": "", "x": "" }, "order": ["a", "x"], "returns" : "" },
        { "method": "txCountAt", "params": { "a": "" },"order": ["a"], "returns" : "" },
        { "method": "isContractAt", "params": { "a": "" }, "order": ["a"], "returns" : false },
        { "method": "create", "params": { "sec": "", "xEndowment": "", "bCode": "", "xGas": "", "xGasPrice": "" }, "order": ["sec", "xEndowment", "bCode", "xGas", "xGasPrice"] , "returns": "" },
        { "method": "transact", "params": { "sec": "", "xValue": "", "aDest": "", "bData": "", "xGas": "", "xGasPrice": "" }, "order": ["sec", "xValue", "aDest", "bData", "xGas", "xGasPrice"], "returns": {} },
        { "method": "secretToAddress", "params": { "a": "" }, "order": ["a"], "returns" : "" },
        { "method": "lll", "params": { "s": "" }, "order": ["s"], "returns" : "" }
	];
	
	module.exports = (function ethScope() {
	    	var m_reqId = 0
	    	var ret = {}
	    	function reformat(m, d) { return m == "lll" ? d.bin() : d; }
	    	function reqSync(m, p) {
	        	var req = { "jsonrpc": "2.0", "method": m, "params": p, "id": m_reqId }
	        	m_reqId++
	        	var request = new XMLHttpRequest();	
		        request.open("POST", "http://localhost:8080", false)
	        	// console.log("Sending " + JSON.stringify(req))
		        request.send(JSON.stringify(req))
		        return reformat(m, JSON.parse(request.responseText).result)
	    	}
	    	function reqAsync(m, p, f) {
	        	var req = { "jsonrpc": "2.0", "method": m, "params": p, "id": m_reqId }
	        	m_reqId++
	        	var request = new XMLHttpRequest();	
		        request.open("POST", "http://localhost:8080", true)
		        request.send(JSON.stringify(req))
	        	request.onreadystatechange = function() {
	        	if (request.readyState === 4)
	                f(reformat(m, JSON.parse(request.responseText).result))
	        	};
	    	}
	    	function isEmpty(obj) {
	        	for (var prop in obj) {
	        	    if (obj.hasOwnProperty(prop)) {
	        	        return false;
	        	    }
	        	}
	        	return true
	    	}
	    	
	    	var m_watching = {};
	    	
	    	for (si in spec) (function(s) {
	        	var m = s.method;
	        	var am = "get" + m.slice(0, 1).toUpperCase() + m.slice(1);
	        	var getParams = function(a) {
	            	var p = s.params ? {} : null
	            	for (j in s.order)
	            	p[s.order[j]] = (s.order[j][0] === "b") ? a[j].unbin() : a[j]
	            	return p
	        	};
		        if (m == "create" || m == "transact") {
		            ret[m] = function() { return reqAsync(m, getParams(arguments), arguments[s.order.length]) }
	        	} else {
	            	ret[am] = function() { return reqAsync(m, getParams(arguments), arguments[s.order.length]) }
	            	if (s.params) {
	            	    ret[m] = function() { 
	            	        return reqSync(m, getParams(arguments))
	            	    }
	            	} else {
	            	    Object.defineProperty(ret, m, {
	            	        get: function() { return reqSync(m, {}); },
	            	        set: function(v) {}
	            	    })
		            }
	    	    } // TODO: Fixing indentation hihjlighted that this brace was missing, so added...
	    	})(spec[si]);
	    	
	    	ret.check = function(force) {
	        	if (!force && isEmpty(m_watching)) {
	        	return;
	        	}
	        	var watching = [];
	        	for (var w in m_watching) {
	        	    watching.push(w)
	        	}
	        	var changed = reqSync("check", { "a": watching } );
	        	// console.log("Got " + JSON.stringify(changed));
	        	for (var c in changed) {
	        	    m_watching[changed[c]]()
	        	}
	        	var that = this;
	        	setTimeout(function() { that.check() }, 5000)
	    	}
	    	
	    	ret.watch = function(a, fx, f) {
	        	var old = isEmpty(m_watching)
	        	if (f) {
	        	    m_watching[a + fx] = f
	        	} else {
	        	    m_watching[a] = fx
	        	}
	        	(f ? f : fx)()
	        	if (isEmpty(m_watching) != old) {
	        	    this.check()
	        	}
	    	}
	    	
	    	ret.unwatch = function(f, fx) {
	    	    delete m_watching[fx ? f + fx : f];
	    	}
	    	ret.newBlock = function(f) {
	        	var old = isEmpty(m_watching)
	        	m_watching[""] = f
	        	f()
	        	if (isEmpty(m_watching) != old) {
	        	    this.check()
	        	}
	    	}
	    	return ret;
	}());
}

},{"./ethstring":4}],4:[function(require,module,exports){
if (typeof bitInt === 'undefined') {
    var bigInt = require('./BigInteger');
}

function EthString () {}

EthString.prototype = String.prototype;

EthString.prototype.pad = function(l, r) {
    if (r === null) {
        r = l;
        if (!(this.substr(0, 2) == "0x" || /^\d+$/.test(this))) {
            l = 0;
        }
    }
    var ret = this.bin();
    while (ret.length < l) {
        ret = "\0" + ret;
    }
    while (ret.length < r) {
        ret = ret + "\0";
    }
    return ret;
}

EthString.prototype.unpad = function() {
    var i = this.length;
    while (i && this[i - 1] == "\0") {
        --i;
    }
    return this.substr(0, i);
}

EthString.prototype.bin = function() {
    if (this.substr(0, 2) == "0x") {
        bytes = [];
        var i = 2;
        // Check if it's odd - pad with a zero if so.
        if (this.length % 2) {
            bytes.push(parseInt(this.substr(i++, 1), 16));
        }
        for (; i < this.length - 1; i += 2) {
            bytes.push(parseInt(this.substr(i, 2), 16));
        }
        return String.fromCharCode.apply(String, bytes);
    } else if (/^\d+$/.test(this)) {
        return bigInt(this.substr(0)).toHex().bin();
    }
    // Otherwise we'll return the "String" object instead of an actual string
    return this.substr(0, this.length);
}

EthString.prototype.unbin = function() {
    var i, l, o = '';
    for(i = 0, l = this.length; i < l; i++) {
        var n = this.charCodeAt(i).toString(16);
        o += n.length < 2 ? '0' + n : n;
    }

    return "0x" + o;
}

EthString.prototype.dec = function() {
    return bigInt(this.substr(0)).toString();
}

EthString.prototype.hex = function() {
    return bigInt(this.substr(0)).toHex();
}



if (typeof module !== 'undefined') {
    module.exports = EthString;
}

},{"./BigInteger":2}]},{},[1])(1)
});
var MOCKACCOUNTS = {
}


function Account( address, value, onUpdateHandler, handleReceiveAction, self ) {
	console.log( 'Creating account ' + address + ' with ' + value + ' value. is contract:', typeof handleReceiveAction !== 'undefined' )
	this.type = 'account';

	this.init = function (address, value, onUpdateHandler, handleReceiveAction, self) {

		address = this.address || address;
		console.log( 'INIT: ', address, this )
		if (typeof address !== 'string') throw new Error('Address provided to init() was not a string')
		this.__self = self;
		this.address = address;
		this.value = value;
		this.onUpdateHandler = onUpdateHandler;
		this.handleReceiveAction = handleReceiveAction;
	}

	this.state = function() {
		return {
			__self: this.__self,
			address: this.address,
			value: this.value,
			onUpdateHandler: this.onUpdateHandler,
			handleReceiveAction: this.handleReceiveAction
		};
	}

	this.init( address, value, onUpdateHandler, handleReceiveAction, self )
}



Account.prototype.register = function(){

	// console.log( 'Registering: ', this.address )
	// console.log( MOCKACCOUNTS )

	if (MOCKACCOUNTS[this.address]) {
		var inst = MOCKACCOUNTS[this.address];
		this.init( inst.address, inst.value, inst.onUpdateHandler, inst.handleReceiveAction, inst.__self )
	} else {
		MOCKACCOUNTS[this.address] = {};
		MOCKACCOUNTS[this.address].__self = this.state().__self;
		MOCKACCOUNTS[this.address].address = this.state().address;
		MOCKACCOUNTS[this.address].value = this.state().value;
		MOCKACCOUNTS[this.address].onUpdateHandler = this.state().onUpdateHandler;
		MOCKACCOUNTS[this.address].handleReceiveAction = this.state().handleReceiveAction;
	}
}

Account.prototype.sendValue = function( toAccount, valueSent, action ) {
	this.register()
	if (valueSent > this.value) {
		console.log('Not enough Funds ('+this.value+') to send', valueSent)
		return false;
	}

	if (typeof this.address !== 'string') {
		console.log( "ERROR: this: ", this )
		throw new Error('this.address was not a string')
	}
	console.log( this.address + ' sent ', valueSent, ' to ', toAccount.address )
	this.value -= valueSent;
	// console.log( MOCKACCOUNTS[this.address], this.address, this )
	MOCKACCOUNTS[this.address].value -= valueSent;
	if (typeof this.onUpdateHandler === 'function') this.onUpdateHandler({address: this.address, value: this.value })
	toAccount.receiveTx( this, valueSent, action );
}

Account.prototype.receiveTx = function( fromAccount, valueReceived, action) {
	this.register()
	console.log( this.address + '(' + this.value + ') recieved ', valueReceived, ' from ', fromAccount.address, ' with action: ', action, 'is contract: ', typeof this.__self !== 'undefined' )
	this.value += valueReceived;
	MOCKACCOUNTS[this.address].value += valueReceived;
	if ( this.handleReceiveAction ) {
		if (typeof this.onUpdateHandler !== 'function') {
			console.log( '>>>>>> no update handler!!', this);
			throw new Error( 'Account did not have an update handler')
		}
		this.handleReceiveAction( fromAccount, valueReceived, action, this.onUpdateHandler, this.__self )
	} else {
		if (typeof this.onUpdateHandler === 'function') this.onUpdateHandler( {address: this.address, value: this.value } );
		else {
			console.log( '>>>>>> no update handler!!', this);
			throw new Error( 'Account did not have an update handler')
		}
	}
}


function Contract ( address, value, CONTRACT, onUpdateHandler ) {
	this.type = 'contract';

	this.getCoinToss = function(){
		return Math.floor(Math.random() * 2);
	}

	this.state = function(){
		return {
			__self: this.__self,
			address: this.address,
			value: this.value,
			storage: this.storage,
			acccount: this.account,
			onUpdateHandler: this.onUpdateHandler,
			handleReceiveAction: this.handleReceiveAction
		};
	}

	this.init = function ( address, value, handleReceiveAction, onUpdateHandler, storage ) {

		console.log( 'INIT c:', address, this  )
		this.handleReceiveAction = handleReceiveAction;
		this.onUpdateHandler = onUpdateHandler;
		this.account = new Account( address, value, handleReceiveAction, this.onUpdateHandler, this );
		this.storage = storage;
	}

	this.init( address, value, CONTRACT, onUpdateHandler, {} )
}

Contract.prototype.register = function(){

	if (MOCKACCOUNTS[this.account.address]) {

		console.log( "GOING TO INIT", this.account.address, MOCKACCOUNTS[this.account.address])
		var inst = MOCKACCOUNTS[this.account.address];
		console.log( 'FOUND INST: ', inst)
		this.init( inst.account.address, inst.account.value, inst.handleReceiveAction, inst.onUpdateHandler, inst.storage )
	} else {
		MOCKACCOUNTS[this.account.address] = {}
		MOCKACCOUNTS[this.account.address].account = this.account
		MOCKACCOUNTS[this.account.address].address = this.account.address
		MOCKACCOUNTS[this.account.address].value = this.account.value
		
		MOCKACCOUNTS[this.account.address].onUpdateHandler = this.state().onUpdateHandler;
		MOCKACCOUNTS[this.account.address].handleReceiveAction = this.state().handleReceiveAction;
		MOCKACCOUNTS[this.account.address].storage = this.state().storage;
	}
}




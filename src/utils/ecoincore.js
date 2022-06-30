// CDN TODO: AsyncStorage has been extracted from react-native core and will be removed in a 
// future release. It can now be installed and imported from '@react-native-community/async-storage' 
// instead of 'react-native'. 
// See https://github.com/react-native-community/async-storage

// We grab a websocket to listen for new exchange rates and available electrum servers
// https://www.npmjs.com/package/react-ddp
import DDP from "react-ddp";

import * as actions from "../actions"
import { store } from "../../Root.js";

const ECC_HOST = 'api.ecoincore.com'
const DEBUG = false;

process.nextTick = setImmediate; //react-native polyfill

// let ECC_HOST = 'ecoincore.com'
let eCoinCore = new DDP({
	SocketConstructor: WebSocket,
	endpoint:`wss://${ECC_HOST}/websocket`,
	debug:false,
	// debug:true, // Uncomment this if you want the ddp traffic messages barfed into the console log
	autoConnect: true,
	autoReconnect: true,
	reconnectInterval: 10000,
	appId: "cdn-moonshine-beta-1",
});

let documentKeys = [];

eCoinCore.on('added', function(data){
	if (data.collection == "ExchangeRates") {
		documentKeys[data.id] = data.fields.call;
		store.dispatch({type: actions.EXCHANGE_RATES_UPDATED, payload: {... data.fields}})
	}
});

eCoinCore.on('changed', function(data){
	if (data.collection == "ExchangeRates" && documentKeys[data.id]) store.dispatch({type: actions.EXCHANGE_RATES_UPDATED, payload: { call: documentKeys[data.id], ...data.fields}})
});

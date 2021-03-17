var pidgc;
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@stomp/stompjs/esm6/augment-websocket.js":
/*!***************************************************************!*\
  !*** ./node_modules/@stomp/stompjs/esm6/augment-websocket.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "augmentWebsocket": () => (/* binding */ augmentWebsocket)
/* harmony export */ });
/**
 * @internal
 */
function augmentWebsocket(webSocket, debug) {
    webSocket.terminate = function () {
        const noOp = () => { };
        // set all callbacks to no op
        this.onerror = noOp;
        this.onmessage = noOp;
        this.onopen = noOp;
        const ts = new Date();
        const origOnClose = this.onclose;
        // Track delay in actual closure of the socket
        this.onclose = closeEvent => {
            const delay = new Date().getTime() - ts.getTime();
            debug(`Discarded socket closed after ${delay}ms, with code/reason: ${closeEvent.code}/${closeEvent.reason}`);
        };
        this.close();
        origOnClose.call(this, {
            code: 4001,
            reason: 'Heartbeat failure, discarding the socket',
            wasClean: false,
        });
    };
}
//# sourceMappingURL=augment-websocket.js.map

/***/ }),

/***/ "./node_modules/@stomp/stompjs/esm6/byte.js":
/*!**************************************************!*\
  !*** ./node_modules/@stomp/stompjs/esm6/byte.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BYTE": () => (/* binding */ BYTE)
/* harmony export */ });
/**
 * Some byte values, used as per STOMP specifications.
 *
 * Part of `@stomp/stompjs`.
 *
 * @internal
 */
const BYTE = {
    // LINEFEED byte (octet 10)
    LF: '\x0A',
    // NULL byte (octet 0)
    NULL: '\x00',
};
//# sourceMappingURL=byte.js.map

/***/ }),

/***/ "./node_modules/@stomp/stompjs/esm6/client.js":
/*!****************************************************!*\
  !*** ./node_modules/@stomp/stompjs/esm6/client.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Client": () => (/* binding */ Client)
/* harmony export */ });
/* harmony import */ var _stomp_handler__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./stomp-handler */ "./node_modules/@stomp/stompjs/esm6/stomp-handler.js");
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./types */ "./node_modules/@stomp/stompjs/esm6/types.js");
/* harmony import */ var _versions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./versions */ "./node_modules/@stomp/stompjs/esm6/versions.js");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



/**
 * STOMP Client Class.
 *
 * Part of `@stomp/stompjs`.
 */
class Client {
    /**
     * Create an instance.
     */
    constructor(conf = {}) {
        /**
         * STOMP versions to attempt during STOMP handshake. By default versions `1.0`, `1.1`, and `1.2` are attempted.
         *
         * Example:
         * ```javascript
         *        // Try only versions 1.0 and 1.1
         *        client.stompVersions = new Versions(['1.0', '1.1'])
         * ```
         */
        this.stompVersions = _versions__WEBPACK_IMPORTED_MODULE_0__.Versions.default;
        /**
         * Will retry if Stomp connection is not established in specified milliseconds.
         * Default 0, which implies wait for ever.
         */
        this.connectionTimeout = 0;
        /**
         *  automatically reconnect with delay in milliseconds, set to 0 to disable.
         */
        this.reconnectDelay = 5000;
        /**
         * Incoming heartbeat interval in milliseconds. Set to 0 to disable.
         */
        this.heartbeatIncoming = 10000;
        /**
         * Outgoing heartbeat interval in milliseconds. Set to 0 to disable.
         */
        this.heartbeatOutgoing = 10000;
        /**
         * This switches on a non standard behavior while sending WebSocket packets.
         * It splits larger (text) packets into chunks of [maxWebSocketChunkSize]{@link Client#maxWebSocketChunkSize}.
         * Only Java Spring brokers seems to use this mode.
         *
         * WebSockets, by itself, split large (text) packets,
         * so it is not needed with a truly compliant STOMP/WebSocket broker.
         * Actually setting it for such broker will cause large messages to fail.
         *
         * `false` by default.
         *
         * Binary frames are never split.
         */
        this.splitLargeFrames = false;
        /**
         * See [splitLargeFrames]{@link Client#splitLargeFrames}.
         * This has no effect if [splitLargeFrames]{@link Client#splitLargeFrames} is `false`.
         */
        this.maxWebSocketChunkSize = 8 * 1024;
        /**
         * Usually the
         * [type of WebSocket frame]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send#Parameters}
         * is automatically decided by type of the payload.
         * Default is `false`, which should work with all compliant brokers.
         *
         * Set this flag to force binary frames.
         */
        this.forceBinaryWSFrames = false;
        /**
         * A bug in ReactNative chops a string on occurrence of a NULL.
         * See issue [https://github.com/stomp-js/stompjs/issues/89]{@link https://github.com/stomp-js/stompjs/issues/89}.
         * This makes incoming WebSocket messages invalid STOMP packets.
         * Setting this flag attempts to reverse the damage by appending a NULL.
         * If the broker splits a large message into multiple WebSocket messages,
         * this flag will cause data loss and abnormal termination of connection.
         *
         * This is not an ideal solution, but a stop gap until the underlying issue is fixed at ReactNative library.
         */
        this.appendMissingNULLonIncoming = false;
        /**
         * Activation state.
         *
         * It will usually be ACTIVE or INACTIVE.
         * When deactivating it may go from ACTIVE to INACTIVE without entering DEACTIVATING.
         */
        this.state = _types__WEBPACK_IMPORTED_MODULE_1__.ActivationState.INACTIVE;
        // Dummy callbacks
        const noOp = () => { };
        this.debug = noOp;
        this.beforeConnect = noOp;
        this.onConnect = noOp;
        this.onDisconnect = noOp;
        this.onUnhandledMessage = noOp;
        this.onUnhandledReceipt = noOp;
        this.onUnhandledFrame = noOp;
        this.onStompError = noOp;
        this.onWebSocketClose = noOp;
        this.onWebSocketError = noOp;
        this.logRawCommunication = false;
        this.onChangeState = noOp;
        // These parameters would typically get proper values before connect is called
        this.connectHeaders = {};
        this._disconnectHeaders = {};
        // Apply configuration
        this.configure(conf);
    }
    /**
     * Underlying WebSocket instance, READONLY.
     */
    get webSocket() {
        return this._stompHandler ? this._stompHandler._webSocket : undefined;
    }
    /**
     * Disconnection headers.
     */
    get disconnectHeaders() {
        return this._disconnectHeaders;
    }
    set disconnectHeaders(value) {
        this._disconnectHeaders = value;
        if (this._stompHandler) {
            this._stompHandler.disconnectHeaders = this._disconnectHeaders;
        }
    }
    /**
     * `true` if there is a active connection with STOMP Broker
     */
    get connected() {
        return !!this._stompHandler && this._stompHandler.connected;
    }
    /**
     * version of STOMP protocol negotiated with the server, READONLY
     */
    get connectedVersion() {
        return this._stompHandler ? this._stompHandler.connectedVersion : undefined;
    }
    /**
     * if the client is active (connected or going to reconnect)
     */
    get active() {
        return this.state === _types__WEBPACK_IMPORTED_MODULE_1__.ActivationState.ACTIVE;
    }
    _changeState(state) {
        this.state = state;
        this.onChangeState(state);
    }
    /**
     * Update configuration.
     */
    configure(conf) {
        // bulk assign all properties to this
        Object.assign(this, conf);
    }
    /**
     * Initiate the connection with the broker.
     * If the connection breaks, as per [Client#reconnectDelay]{@link Client#reconnectDelay},
     * it will keep trying to reconnect.
     *
     * Call [Client#deactivate]{@link Client#deactivate} to disconnect and stop reconnection attempts.
     */
    activate() {
        if (this.state === _types__WEBPACK_IMPORTED_MODULE_1__.ActivationState.DEACTIVATING) {
            this.debug('Still DEACTIVATING, please await call to deactivate before trying to re-activate');
            throw new Error('Still DEACTIVATING, can not activate now');
        }
        if (this.active) {
            this.debug('Already ACTIVE, ignoring request to activate');
            return;
        }
        this._changeState(_types__WEBPACK_IMPORTED_MODULE_1__.ActivationState.ACTIVE);
        this._connect();
    }
    _connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.connected) {
                this.debug('STOMP: already connected, nothing to do');
                return;
            }
            yield this.beforeConnect();
            if (!this.active) {
                this.debug('Client has been marked inactive, will not attempt to connect');
                return;
            }
            // setup connection watcher
            if (this.connectionTimeout > 0) {
                this._connectionWatcher = setTimeout(() => {
                    // Connection not established, close the underlying socket
                    // a reconnection will be attempted
                    this.debug(`Connection not established in ${this.connectionTimeout}ms, closing socket`);
                    this.forceDisconnect();
                }, this.connectionTimeout);
            }
            this.debug('Opening Web Socket...');
            // Get the actual WebSocket (or a similar object)
            const webSocket = this._createWebSocket();
            this._stompHandler = new _stomp_handler__WEBPACK_IMPORTED_MODULE_2__.StompHandler(this, webSocket, {
                debug: this.debug,
                stompVersions: this.stompVersions,
                connectHeaders: this.connectHeaders,
                disconnectHeaders: this._disconnectHeaders,
                heartbeatIncoming: this.heartbeatIncoming,
                heartbeatOutgoing: this.heartbeatOutgoing,
                splitLargeFrames: this.splitLargeFrames,
                maxWebSocketChunkSize: this.maxWebSocketChunkSize,
                forceBinaryWSFrames: this.forceBinaryWSFrames,
                logRawCommunication: this.logRawCommunication,
                appendMissingNULLonIncoming: this.appendMissingNULLonIncoming,
                discardWebsocketOnCommFailure: this.discardWebsocketOnCommFailure,
                onConnect: frame => {
                    // Successfully connected, stop the connection watcher
                    if (this._connectionWatcher) {
                        clearTimeout(this._connectionWatcher);
                        this._connectionWatcher = undefined;
                    }
                    if (!this.active) {
                        this.debug('STOMP got connected while deactivate was issued, will disconnect now');
                        this._disposeStompHandler();
                        return;
                    }
                    this.onConnect(frame);
                },
                onDisconnect: frame => {
                    this.onDisconnect(frame);
                },
                onStompError: frame => {
                    this.onStompError(frame);
                },
                onWebSocketClose: evt => {
                    this._stompHandler = undefined; // a new one will be created in case of a reconnect
                    if (this.state === _types__WEBPACK_IMPORTED_MODULE_1__.ActivationState.DEACTIVATING) {
                        // Mark deactivation complete
                        this._resolveSocketClose();
                        this._resolveSocketClose = undefined;
                        this._changeState(_types__WEBPACK_IMPORTED_MODULE_1__.ActivationState.INACTIVE);
                    }
                    this.onWebSocketClose(evt);
                    // The callback is called before attempting to reconnect, this would allow the client
                    // to be `deactivated` in the callback.
                    if (this.active) {
                        this._schedule_reconnect();
                    }
                },
                onWebSocketError: evt => {
                    this.onWebSocketError(evt);
                },
                onUnhandledMessage: message => {
                    this.onUnhandledMessage(message);
                },
                onUnhandledReceipt: frame => {
                    this.onUnhandledReceipt(frame);
                },
                onUnhandledFrame: frame => {
                    this.onUnhandledFrame(frame);
                },
            });
            this._stompHandler.start();
        });
    }
    _createWebSocket() {
        let webSocket;
        if (this.webSocketFactory) {
            webSocket = this.webSocketFactory();
        }
        else {
            webSocket = new WebSocket(this.brokerURL, this.stompVersions.protocolVersions());
        }
        webSocket.binaryType = 'arraybuffer';
        return webSocket;
    }
    _schedule_reconnect() {
        if (this.reconnectDelay > 0) {
            this.debug(`STOMP: scheduling reconnection in ${this.reconnectDelay}ms`);
            this._reconnector = setTimeout(() => {
                this._connect();
            }, this.reconnectDelay);
        }
    }
    /**
     * Disconnect if connected and stop auto reconnect loop.
     * Appropriate callbacks will be invoked if underlying STOMP connection was connected.
     *
     * This call is async, it will resolve immediately if there is no underlying active websocket,
     * otherwise, it will resolve after underlying websocket is properly disposed.
     *
     * To reactivate you can call [Client#activate]{@link Client#activate}.
     */
    deactivate() {
        return __awaiter(this, void 0, void 0, function* () {
            let retPromise;
            if (this.state !== _types__WEBPACK_IMPORTED_MODULE_1__.ActivationState.ACTIVE) {
                this.debug(`Already ${_types__WEBPACK_IMPORTED_MODULE_1__.ActivationState[this.state]}, ignoring call to deactivate`);
                return Promise.resolve();
            }
            this._changeState(_types__WEBPACK_IMPORTED_MODULE_1__.ActivationState.DEACTIVATING);
            // Clear if a reconnection was scheduled
            if (this._reconnector) {
                clearTimeout(this._reconnector);
            }
            if (this._stompHandler &&
                this.webSocket.readyState !== _types__WEBPACK_IMPORTED_MODULE_1__.StompSocketState.CLOSED) {
                // we need to wait for underlying websocket to close
                retPromise = new Promise((resolve, reject) => {
                    this._resolveSocketClose = resolve;
                });
            }
            else {
                // indicate that auto reconnect loop should terminate
                this._changeState(_types__WEBPACK_IMPORTED_MODULE_1__.ActivationState.INACTIVE);
                return Promise.resolve();
            }
            this._disposeStompHandler();
            return retPromise;
        });
    }
    /**
     * Force disconnect if there is an active connection by directly closing the underlying WebSocket.
     * This is different than a normal disconnect where a DISCONNECT sequence is carried out with the broker.
     * After forcing disconnect, automatic reconnect will be attempted.
     * To stop further reconnects call [Client#deactivate]{@link Client#deactivate} as well.
     */
    forceDisconnect() {
        if (this._stompHandler) {
            this._stompHandler.forceDisconnect();
        }
    }
    _disposeStompHandler() {
        // Dispose STOMP Handler
        if (this._stompHandler) {
            this._stompHandler.dispose();
            this._stompHandler = null;
        }
    }
    /**
     * Send a message to a named destination. Refer to your STOMP broker documentation for types
     * and naming of destinations.
     *
     * STOMP protocol specifies and suggests some headers and also allows broker specific headers.
     *
     * `body` must be String.
     * You will need to covert the payload to string in case it is not string (e.g. JSON).
     *
     * To send a binary message body use binaryBody parameter. It should be a
     * [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array).
     * Sometimes brokers may not support binary frames out of the box.
     * Please check your broker documentation.
     *
     * `content-length` header is automatically added to the STOMP Frame sent to the broker.
     * Set `skipContentLengthHeader` to indicate that `content-length` header should not be added.
     * For binary messages `content-length` header is always added.
     *
     * Caution: The broker will, most likely, report an error and disconnect if message body has NULL octet(s)
     * and `content-length` header is missing.
     *
     * ```javascript
     *        client.publish({destination: "/queue/test", headers: {priority: 9}, body: "Hello, STOMP"});
     *
     *        // Only destination is mandatory parameter
     *        client.publish({destination: "/queue/test", body: "Hello, STOMP"});
     *
     *        // Skip content-length header in the frame to the broker
     *        client.publish({"/queue/test", body: "Hello, STOMP", skipContentLengthHeader: true});
     *
     *        var binaryData = generateBinaryData(); // This need to be of type Uint8Array
     *        // setting content-type header is not mandatory, however a good practice
     *        client.publish({destination: '/topic/special', binaryBody: binaryData,
     *                         headers: {'content-type': 'application/octet-stream'}});
     * ```
     */
    publish(params) {
        this._stompHandler.publish(params);
    }
    /**
     * STOMP brokers may carry out operation asynchronously and allow requesting for acknowledgement.
     * To request an acknowledgement, a `receipt` header needs to be sent with the actual request.
     * The value (say receipt-id) for this header needs to be unique for each use. Typically a sequence, a UUID, a
     * random number or a combination may be used.
     *
     * A complaint broker will send a RECEIPT frame when an operation has actually been completed.
     * The operation needs to be matched based in the value of the receipt-id.
     *
     * This method allow watching for a receipt and invoke the callback
     * when corresponding receipt has been received.
     *
     * The actual {@link FrameImpl} will be passed as parameter to the callback.
     *
     * Example:
     * ```javascript
     *        // Subscribing with acknowledgement
     *        let receiptId = randomText();
     *
     *        client.watchForReceipt(receiptId, function() {
     *          // Will be called after server acknowledges
     *        });
     *
     *        client.subscribe(TEST.destination, onMessage, {receipt: receiptId});
     *
     *
     *        // Publishing with acknowledgement
     *        receiptId = randomText();
     *
     *        client.watchForReceipt(receiptId, function() {
     *          // Will be called after server acknowledges
     *        });
     *        client.publish({destination: TEST.destination, headers: {receipt: receiptId}, body: msg});
     * ```
     */
    watchForReceipt(receiptId, callback) {
        this._stompHandler.watchForReceipt(receiptId, callback);
    }
    /**
     * Subscribe to a STOMP Broker location. The callback will be invoked for each received message with
     * the {@link IMessage} as argument.
     *
     * Note: The library will generate an unique ID if there is none provided in the headers.
     *       To use your own ID, pass it using the headers argument.
     *
     * ```javascript
     *        callback = function(message) {
     *        // called when the client receives a STOMP message from the server
     *          if (message.body) {
     *            alert("got message with body " + message.body)
     *          } else {
     *            alert("got empty message");
     *          }
     *        });
     *
     *        var subscription = client.subscribe("/queue/test", callback);
     *
     *        // Explicit subscription id
     *        var mySubId = 'my-subscription-id-001';
     *        var subscription = client.subscribe(destination, callback, { id: mySubId });
     * ```
     */
    subscribe(destination, callback, headers = {}) {
        return this._stompHandler.subscribe(destination, callback, headers);
    }
    /**
     * It is preferable to unsubscribe from a subscription by calling
     * `unsubscribe()` directly on {@link StompSubscription} returned by `client.subscribe()`:
     *
     * ```javascript
     *        var subscription = client.subscribe(destination, onmessage);
     *        // ...
     *        subscription.unsubscribe();
     * ```
     *
     * See: http://stomp.github.com/stomp-specification-1.2.html#UNSUBSCRIBE UNSUBSCRIBE Frame
     */
    unsubscribe(id, headers = {}) {
        this._stompHandler.unsubscribe(id, headers);
    }
    /**
     * Start a transaction, the returned {@link ITransaction} has methods - [commit]{@link ITransaction#commit}
     * and [abort]{@link ITransaction#abort}.
     *
     * `transactionId` is optional, if not passed the library will generate it internally.
     */
    begin(transactionId) {
        return this._stompHandler.begin(transactionId);
    }
    /**
     * Commit a transaction.
     *
     * It is preferable to commit a transaction by calling [commit]{@link ITransaction#commit} directly on
     * {@link ITransaction} returned by [client.begin]{@link Client#begin}.
     *
     * ```javascript
     *        var tx = client.begin(txId);
     *        //...
     *        tx.commit();
     * ```
     */
    commit(transactionId) {
        this._stompHandler.commit(transactionId);
    }
    /**
     * Abort a transaction.
     * It is preferable to abort a transaction by calling [abort]{@link ITransaction#abort} directly on
     * {@link ITransaction} returned by [client.begin]{@link Client#begin}.
     *
     * ```javascript
     *        var tx = client.begin(txId);
     *        //...
     *        tx.abort();
     * ```
     */
    abort(transactionId) {
        this._stompHandler.abort(transactionId);
    }
    /**
     * ACK a message. It is preferable to acknowledge a message by calling [ack]{@link IMessage#ack} directly
     * on the {@link IMessage} handled by a subscription callback:
     *
     * ```javascript
     *        var callback = function (message) {
     *          // process the message
     *          // acknowledge it
     *          message.ack();
     *        };
     *        client.subscribe(destination, callback, {'ack': 'client'});
     * ```
     */
    ack(messageId, subscriptionId, headers = {}) {
        this._stompHandler.ack(messageId, subscriptionId, headers);
    }
    /**
     * NACK a message. It is preferable to acknowledge a message by calling [nack]{@link IMessage#nack} directly
     * on the {@link IMessage} handled by a subscription callback:
     *
     * ```javascript
     *        var callback = function (message) {
     *          // process the message
     *          // an error occurs, nack it
     *          message.nack();
     *        };
     *        client.subscribe(destination, callback, {'ack': 'client'});
     * ```
     */
    nack(messageId, subscriptionId, headers = {}) {
        this._stompHandler.nack(messageId, subscriptionId, headers);
    }
}
//# sourceMappingURL=client.js.map

/***/ }),

/***/ "./node_modules/@stomp/stompjs/esm6/compatibility/compat-client.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@stomp/stompjs/esm6/compatibility/compat-client.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CompatClient": () => (/* binding */ CompatClient)
/* harmony export */ });
/* harmony import */ var _client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../client */ "./node_modules/@stomp/stompjs/esm6/client.js");
/* harmony import */ var _heartbeat_info__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./heartbeat-info */ "./node_modules/@stomp/stompjs/esm6/compatibility/heartbeat-info.js");


/**
 * Available for backward compatibility, please shift to using {@link Client}.
 *
 * **Deprecated**
 *
 * Part of `@stomp/stompjs`.
 *
 * To upgrade, please follow the [Upgrade Guide](../additional-documentation/upgrading.html)
 */
class CompatClient extends _client__WEBPACK_IMPORTED_MODULE_0__.Client {
    /**
     * Available for backward compatibility, please shift to using {@link Client}
     * and [Client#webSocketFactory]{@link Client#webSocketFactory}.
     *
     * **Deprecated**
     *
     * @internal
     */
    constructor(webSocketFactory) {
        super();
        /**
         * It is no op now. No longer needed. Large packets work out of the box.
         */
        this.maxWebSocketFrameSize = 16 * 1024;
        this._heartbeatInfo = new _heartbeat_info__WEBPACK_IMPORTED_MODULE_1__.HeartbeatInfo(this);
        this.reconnect_delay = 0;
        this.webSocketFactory = webSocketFactory;
        // Default from previous version
        this.debug = (...message) => {
            console.log(...message);
        };
    }
    _parseConnect(...args) {
        let closeEventCallback;
        let connectCallback;
        let errorCallback;
        let headers = {};
        if (args.length < 2) {
            throw new Error('Connect requires at least 2 arguments');
        }
        if (typeof args[1] === 'function') {
            [headers, connectCallback, errorCallback, closeEventCallback] = args;
        }
        else {
            switch (args.length) {
                case 6:
                    [
                        headers.login,
                        headers.passcode,
                        connectCallback,
                        errorCallback,
                        closeEventCallback,
                        headers.host,
                    ] = args;
                    break;
                default:
                    [
                        headers.login,
                        headers.passcode,
                        connectCallback,
                        errorCallback,
                        closeEventCallback,
                    ] = args;
            }
        }
        return [headers, connectCallback, errorCallback, closeEventCallback];
    }
    /**
     * Available for backward compatibility, please shift to using [Client#activate]{@link Client#activate}.
     *
     * **Deprecated**
     *
     * The `connect` method accepts different number of arguments and types. See the Overloads list. Use the
     * version with headers to pass your broker specific options.
     *
     * overloads:
     * - connect(headers, connectCallback)
     * - connect(headers, connectCallback, errorCallback)
     * - connect(login, passcode, connectCallback)
     * - connect(login, passcode, connectCallback, errorCallback)
     * - connect(login, passcode, connectCallback, errorCallback, closeEventCallback)
     * - connect(login, passcode, connectCallback, errorCallback, closeEventCallback, host)
     *
     * params:
     * - headers, see [Client#connectHeaders]{@link Client#connectHeaders}
     * - connectCallback, see [Client#onConnect]{@link Client#onConnect}
     * - errorCallback, see [Client#onStompError]{@link Client#onStompError}
     * - closeEventCallback, see [Client#onWebSocketClose]{@link Client#onWebSocketClose}
     * - login [String], see [Client#connectHeaders](../classes/Client.html#connectHeaders)
     * - passcode [String], [Client#connectHeaders](../classes/Client.html#connectHeaders)
     * - host [String], see [Client#connectHeaders](../classes/Client.html#connectHeaders)
     *
     * To upgrade, please follow the [Upgrade Guide](../additional-documentation/upgrading.html)
     */
    connect(...args) {
        const out = this._parseConnect(...args);
        if (out[0]) {
            this.connectHeaders = out[0];
        }
        if (out[1]) {
            this.onConnect = out[1];
        }
        if (out[2]) {
            this.onStompError = out[2];
        }
        if (out[3]) {
            this.onWebSocketClose = out[3];
        }
        super.activate();
    }
    /**
     * Available for backward compatibility, please shift to using [Client#deactivate]{@link Client#deactivate}.
     *
     * **Deprecated**
     *
     * See:
     * [Client#onDisconnect]{@link Client#onDisconnect}, and
     * [Client#disconnectHeaders]{@link Client#disconnectHeaders}
     *
     * To upgrade, please follow the [Upgrade Guide](../additional-documentation/upgrading.html)
     */
    disconnect(disconnectCallback, headers = {}) {
        if (disconnectCallback) {
            this.onDisconnect = disconnectCallback;
        }
        this.disconnectHeaders = headers;
        super.deactivate();
    }
    /**
     * Available for backward compatibility, use [Client#publish]{@link Client#publish}.
     *
     * Send a message to a named destination. Refer to your STOMP broker documentation for types
     * and naming of destinations. The headers will, typically, be available to the subscriber.
     * However, there may be special purpose headers corresponding to your STOMP broker.
     *
     *  **Deprecated**, use [Client#publish]{@link Client#publish}
     *
     * Note: Body must be String. You will need to covert the payload to string in case it is not string (e.g. JSON)
     *
     * ```javascript
     *        client.send("/queue/test", {priority: 9}, "Hello, STOMP");
     *
     *        // If you want to send a message with a body, you must also pass the headers argument.
     *        client.send("/queue/test", {}, "Hello, STOMP");
     * ```
     *
     * To upgrade, please follow the [Upgrade Guide](../additional-documentation/upgrading.html)
     */
    send(destination, headers = {}, body = '') {
        headers = Object.assign({}, headers);
        const skipContentLengthHeader = headers['content-length'] === false;
        if (skipContentLengthHeader) {
            delete headers['content-length'];
        }
        this.publish({
            destination,
            headers: headers,
            body,
            skipContentLengthHeader,
        });
    }
    /**
     * Available for backward compatibility, renamed to [Client#reconnectDelay]{@link Client#reconnectDelay}.
     *
     * **Deprecated**
     */
    set reconnect_delay(value) {
        this.reconnectDelay = value;
    }
    /**
     * Available for backward compatibility, renamed to [Client#webSocket]{@link Client#webSocket}.
     *
     * **Deprecated**
     */
    get ws() {
        return this.webSocket;
    }
    /**
     * Available for backward compatibility, renamed to [Client#connectedVersion]{@link Client#connectedVersion}.
     *
     * **Deprecated**
     */
    get version() {
        return this.connectedVersion;
    }
    /**
     * Available for backward compatibility, renamed to [Client#onUnhandledMessage]{@link Client#onUnhandledMessage}.
     *
     * **Deprecated**
     */
    get onreceive() {
        return this.onUnhandledMessage;
    }
    /**
     * Available for backward compatibility, renamed to [Client#onUnhandledMessage]{@link Client#onUnhandledMessage}.
     *
     * **Deprecated**
     */
    set onreceive(value) {
        this.onUnhandledMessage = value;
    }
    /**
     * Available for backward compatibility, renamed to [Client#onUnhandledReceipt]{@link Client#onUnhandledReceipt}.
     * Prefer using [Client#watchForReceipt]{@link Client#watchForReceipt}.
     *
     * **Deprecated**
     */
    get onreceipt() {
        return this.onUnhandledReceipt;
    }
    /**
     * Available for backward compatibility, renamed to [Client#onUnhandledReceipt]{@link Client#onUnhandledReceipt}.
     *
     * **Deprecated**
     */
    set onreceipt(value) {
        this.onUnhandledReceipt = value;
    }
    /**
     * Available for backward compatibility, renamed to [Client#heartbeatIncoming]{@link Client#heartbeatIncoming}
     * [Client#heartbeatOutgoing]{@link Client#heartbeatOutgoing}.
     *
     * **Deprecated**
     */
    get heartbeat() {
        return this._heartbeatInfo;
    }
    /**
     * Available for backward compatibility, renamed to [Client#heartbeatIncoming]{@link Client#heartbeatIncoming}
     * [Client#heartbeatOutgoing]{@link Client#heartbeatOutgoing}.
     *
     * **Deprecated**
     */
    set heartbeat(value) {
        this.heartbeatIncoming = value.incoming;
        this.heartbeatOutgoing = value.outgoing;
    }
}
//# sourceMappingURL=compat-client.js.map

/***/ }),

/***/ "./node_modules/@stomp/stompjs/esm6/compatibility/heartbeat-info.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@stomp/stompjs/esm6/compatibility/heartbeat-info.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "HeartbeatInfo": () => (/* binding */ HeartbeatInfo)
/* harmony export */ });
/**
 * Part of `@stomp/stompjs`.
 *
 * @internal
 */
class HeartbeatInfo {
    constructor(client) {
        this.client = client;
    }
    get outgoing() {
        return this.client.heartbeatOutgoing;
    }
    set outgoing(value) {
        this.client.heartbeatOutgoing = value;
    }
    get incoming() {
        return this.client.heartbeatIncoming;
    }
    set incoming(value) {
        this.client.heartbeatIncoming = value;
    }
}
//# sourceMappingURL=heartbeat-info.js.map

/***/ }),

/***/ "./node_modules/@stomp/stompjs/esm6/compatibility/stomp.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@stomp/stompjs/esm6/compatibility/stomp.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Stomp": () => (/* binding */ Stomp)
/* harmony export */ });
/* harmony import */ var _versions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../versions */ "./node_modules/@stomp/stompjs/esm6/versions.js");
/* harmony import */ var _compat_client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./compat-client */ "./node_modules/@stomp/stompjs/esm6/compatibility/compat-client.js");


/**
 * STOMP Class, acts like a factory to create {@link Client}.
 *
 * Part of `@stomp/stompjs`.
 *
 * **Deprecated**
 *
 * It will be removed in next major version. Please switch to {@link Client}.
 */
class Stomp {
    /**
     * This method creates a WebSocket client that is connected to
     * the STOMP server located at the url.
     *
     * ```javascript
     *        var url = "ws://localhost:61614/stomp";
     *        var client = Stomp.client(url);
     * ```
     *
     * **Deprecated**
     *
     * It will be removed in next major version. Please switch to {@link Client}
     * using [Client#brokerURL]{@link Client#brokerURL}.
     */
    static client(url, protocols) {
        // This is a hack to allow another implementation than the standard
        // HTML5 WebSocket class.
        //
        // It is possible to use another class by calling
        //
        //     Stomp.WebSocketClass = MozWebSocket
        //
        // *prior* to call `Stomp.client()`.
        //
        // This hack is deprecated and `Stomp.over()` method should be used
        // instead.
        // See remarks on the function Stomp.over
        if (protocols == null) {
            protocols = _versions__WEBPACK_IMPORTED_MODULE_0__.Versions.default.protocolVersions();
        }
        const wsFn = () => {
            const klass = Stomp.WebSocketClass || WebSocket;
            return new klass(url, protocols);
        };
        return new _compat_client__WEBPACK_IMPORTED_MODULE_1__.CompatClient(wsFn);
    }
    /**
     * This method is an alternative to [Stomp#client]{@link Stomp#client} to let the user
     * specify the WebSocket to use (either a standard HTML5 WebSocket or
     * a similar object).
     *
     * In order to support reconnection, the function Client._connect should be callable more than once.
     * While reconnecting
     * a new instance of underlying transport (TCP Socket, WebSocket or SockJS) will be needed. So, this function
     * alternatively allows passing a function that should return a new instance of the underlying socket.
     *
     * ```javascript
     *        var client = Stomp.over(function(){
     *          return new WebSocket('ws://localhost:15674/ws')
     *        });
     * ```
     *
     * **Deprecated**
     *
     * It will be removed in next major version. Please switch to {@link Client}
     * using [Client#webSocketFactory]{@link Client#webSocketFactory}.
     */
    static over(ws) {
        let wsFn;
        if (typeof ws === 'function') {
            wsFn = ws;
        }
        else {
            console.warn('Stomp.over did not receive a factory, auto reconnect will not work. ' +
                'Please see https://stomp-js.github.io/api-docs/latest/classes/Stomp.html#over');
            wsFn = () => ws;
        }
        return new _compat_client__WEBPACK_IMPORTED_MODULE_1__.CompatClient(wsFn);
    }
}
/**
 * In case you need to use a non standard class for WebSocket.
 *
 * For example when using within NodeJS environment:
 *
 * ```javascript
 *        StompJs = require('../../esm5/');
 *        Stomp = StompJs.Stomp;
 *        Stomp.WebSocketClass = require('websocket').w3cwebsocket;
 * ```
 *
 * **Deprecated**
 *
 *
 * It will be removed in next major version. Please switch to {@link Client}
 * using [Client#webSocketFactory]{@link Client#webSocketFactory}.
 */
// tslint:disable-next-line:variable-name
Stomp.WebSocketClass = null;
//# sourceMappingURL=stomp.js.map

/***/ }),

/***/ "./node_modules/@stomp/stompjs/esm6/frame-impl.js":
/*!********************************************************!*\
  !*** ./node_modules/@stomp/stompjs/esm6/frame-impl.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FrameImpl": () => (/* binding */ FrameImpl)
/* harmony export */ });
/* harmony import */ var _byte__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./byte */ "./node_modules/@stomp/stompjs/esm6/byte.js");

/**
 * Frame class represents a STOMP frame.
 *
 * @internal
 */
class FrameImpl {
    /**
     * Frame constructor. `command`, `headers` and `body` are available as properties.
     *
     * @internal
     */
    constructor(params) {
        const { command, headers, body, binaryBody, escapeHeaderValues, skipContentLengthHeader, } = params;
        this.command = command;
        this.headers = Object.assign({}, headers || {});
        if (binaryBody) {
            this._binaryBody = binaryBody;
            this.isBinaryBody = true;
        }
        else {
            this._body = body || '';
            this.isBinaryBody = false;
        }
        this.escapeHeaderValues = escapeHeaderValues || false;
        this.skipContentLengthHeader = skipContentLengthHeader || false;
    }
    /**
     * body of the frame
     */
    get body() {
        if (!this._body && this.isBinaryBody) {
            this._body = new TextDecoder().decode(this._binaryBody);
        }
        return this._body;
    }
    /**
     * body as Uint8Array
     */
    get binaryBody() {
        if (!this._binaryBody && !this.isBinaryBody) {
            this._binaryBody = new TextEncoder().encode(this._body);
        }
        return this._binaryBody;
    }
    /**
     * deserialize a STOMP Frame from raw data.
     *
     * @internal
     */
    static fromRawFrame(rawFrame, escapeHeaderValues) {
        const headers = {};
        const trim = (str) => str.replace(/^\s+|\s+$/g, '');
        // In case of repeated headers, as per standards, first value need to be used
        for (const header of rawFrame.headers.reverse()) {
            const idx = header.indexOf(':');
            const key = trim(header[0]);
            let value = trim(header[1]);
            if (escapeHeaderValues &&
                rawFrame.command !== 'CONNECT' &&
                rawFrame.command !== 'CONNECTED') {
                value = FrameImpl.hdrValueUnEscape(value);
            }
            headers[key] = value;
        }
        return new FrameImpl({
            command: rawFrame.command,
            headers,
            binaryBody: rawFrame.binaryBody,
            escapeHeaderValues,
        });
    }
    /**
     * @internal
     */
    toString() {
        return this.serializeCmdAndHeaders();
    }
    /**
     * serialize this Frame in a format suitable to be passed to WebSocket.
     * If the body is string the output will be string.
     * If the body is binary (i.e. of type Unit8Array) it will be serialized to ArrayBuffer.
     *
     * @internal
     */
    serialize() {
        const cmdAndHeaders = this.serializeCmdAndHeaders();
        if (this.isBinaryBody) {
            return FrameImpl.toUnit8Array(cmdAndHeaders, this._binaryBody).buffer;
        }
        else {
            return cmdAndHeaders + this._body + _byte__WEBPACK_IMPORTED_MODULE_0__.BYTE.NULL;
        }
    }
    serializeCmdAndHeaders() {
        const lines = [this.command];
        if (this.skipContentLengthHeader) {
            delete this.headers['content-length'];
        }
        for (const name of Object.keys(this.headers || {})) {
            const value = this.headers[name];
            if (this.escapeHeaderValues &&
                this.command !== 'CONNECT' &&
                this.command !== 'CONNECTED') {
                lines.push(`${name}:${FrameImpl.hdrValueEscape(`${value}`)}`);
            }
            else {
                lines.push(`${name}:${value}`);
            }
        }
        if (this.isBinaryBody ||
            (!this.isBodyEmpty() && !this.skipContentLengthHeader)) {
            lines.push(`content-length:${this.bodyLength()}`);
        }
        return lines.join(_byte__WEBPACK_IMPORTED_MODULE_0__.BYTE.LF) + _byte__WEBPACK_IMPORTED_MODULE_0__.BYTE.LF + _byte__WEBPACK_IMPORTED_MODULE_0__.BYTE.LF;
    }
    isBodyEmpty() {
        return this.bodyLength() === 0;
    }
    bodyLength() {
        const binaryBody = this.binaryBody;
        return binaryBody ? binaryBody.length : 0;
    }
    /**
     * Compute the size of a UTF-8 string by counting its number of bytes
     * (and not the number of characters composing the string)
     */
    static sizeOfUTF8(s) {
        return s ? new TextEncoder().encode(s).length : 0;
    }
    static toUnit8Array(cmdAndHeaders, binaryBody) {
        const uint8CmdAndHeaders = new TextEncoder().encode(cmdAndHeaders);
        const nullTerminator = new Uint8Array([0]);
        const uint8Frame = new Uint8Array(uint8CmdAndHeaders.length + binaryBody.length + nullTerminator.length);
        uint8Frame.set(uint8CmdAndHeaders);
        uint8Frame.set(binaryBody, uint8CmdAndHeaders.length);
        uint8Frame.set(nullTerminator, uint8CmdAndHeaders.length + binaryBody.length);
        return uint8Frame;
    }
    /**
     * Serialize a STOMP frame as per STOMP standards, suitable to be sent to the STOMP broker.
     *
     * @internal
     */
    static marshall(params) {
        const frame = new FrameImpl(params);
        return frame.serialize();
    }
    /**
     *  Escape header values
     */
    static hdrValueEscape(str) {
        return str
            .replace(/\\/g, '\\\\')
            .replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n')
            .replace(/:/g, '\\c');
    }
    /**
     * UnEscape header values
     */
    static hdrValueUnEscape(str) {
        return str
            .replace(/\\r/g, '\r')
            .replace(/\\n/g, '\n')
            .replace(/\\c/g, ':')
            .replace(/\\\\/g, '\\');
    }
}
//# sourceMappingURL=frame-impl.js.map

/***/ }),

/***/ "./node_modules/@stomp/stompjs/esm6/parser.js":
/*!****************************************************!*\
  !*** ./node_modules/@stomp/stompjs/esm6/parser.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Parser": () => (/* binding */ Parser)
/* harmony export */ });
/**
 * @internal
 */
const NULL = 0;
/**
 * @internal
 */
const LF = 10;
/**
 * @internal
 */
const CR = 13;
/**
 * @internal
 */
const COLON = 58;
/**
 * This is an evented, rec descent parser.
 * A stream of Octets can be passed and whenever it recognizes
 * a complete Frame or an incoming ping it will invoke the registered callbacks.
 *
 * All incoming Octets are fed into _onByte function.
 * Depending on current state the _onByte function keeps changing.
 * Depending on the state it keeps accumulating into _token and _results.
 * State is indicated by current value of _onByte, all states are named as _collect.
 *
 * STOMP standards https://stomp.github.io/stomp-specification-1.2.html
 * imply that all lengths are considered in bytes (instead of string lengths).
 * So, before actual parsing, if the incoming data is String it is converted to Octets.
 * This allows faithful implementation of the protocol and allows NULL Octets to be present in the body.
 *
 * There is no peek function on the incoming data.
 * When a state change occurs based on an Octet without consuming the Octet,
 * the Octet, after state change, is fed again (_reinjectByte).
 * This became possible as the state change can be determined by inspecting just one Octet.
 *
 * There are two modes to collect the body, if content-length header is there then it by counting Octets
 * otherwise it is determined by NULL terminator.
 *
 * Following the standards, the command and headers are converted to Strings
 * and the body is returned as Octets.
 * Headers are returned as an array and not as Hash - to allow multiple occurrence of an header.
 *
 * This parser does not use Regular Expressions as that can only operate on Strings.
 *
 * It handles if multiple STOMP frames are given as one chunk, a frame is split into multiple chunks, or
 * any combination there of. The parser remembers its state (any partial frame) and continues when a new chunk
 * is pushed.
 *
 * Typically the higher level function will convert headers to Hash, handle unescaping of header values
 * (which is protocol version specific), and convert body to text.
 *
 * Check the parser.spec.js to understand cases that this parser is supposed to handle.
 *
 * Part of `@stomp/stompjs`.
 *
 * @internal
 */
class Parser {
    constructor(onFrame, onIncomingPing) {
        this.onFrame = onFrame;
        this.onIncomingPing = onIncomingPing;
        this._encoder = new TextEncoder();
        this._decoder = new TextDecoder();
        this._token = [];
        this._initState();
    }
    parseChunk(segment, appendMissingNULLonIncoming = false) {
        let chunk;
        if (segment instanceof ArrayBuffer) {
            chunk = new Uint8Array(segment);
        }
        else {
            chunk = this._encoder.encode(segment);
        }
        // See https://github.com/stomp-js/stompjs/issues/89
        // Remove when underlying issue is fixed.
        //
        // Send a NULL byte, if the last byte of a Text frame was not NULL.F
        if (appendMissingNULLonIncoming && chunk[chunk.length - 1] !== 0) {
            const chunkWithNull = new Uint8Array(chunk.length + 1);
            chunkWithNull.set(chunk, 0);
            chunkWithNull[chunk.length] = 0;
            chunk = chunkWithNull;
        }
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < chunk.length; i++) {
            const byte = chunk[i];
            this._onByte(byte);
        }
    }
    // The following implements a simple Rec Descent Parser.
    // The grammar is simple and just one byte tells what should be the next state
    _collectFrame(byte) {
        if (byte === NULL) {
            // Ignore
            return;
        }
        if (byte === CR) {
            // Ignore CR
            return;
        }
        if (byte === LF) {
            // Incoming Ping
            this.onIncomingPing();
            return;
        }
        this._onByte = this._collectCommand;
        this._reinjectByte(byte);
    }
    _collectCommand(byte) {
        if (byte === CR) {
            // Ignore CR
            return;
        }
        if (byte === LF) {
            this._results.command = this._consumeTokenAsUTF8();
            this._onByte = this._collectHeaders;
            return;
        }
        this._consumeByte(byte);
    }
    _collectHeaders(byte) {
        if (byte === CR) {
            // Ignore CR
            return;
        }
        if (byte === LF) {
            this._setupCollectBody();
            return;
        }
        this._onByte = this._collectHeaderKey;
        this._reinjectByte(byte);
    }
    _reinjectByte(byte) {
        this._onByte(byte);
    }
    _collectHeaderKey(byte) {
        if (byte === COLON) {
            this._headerKey = this._consumeTokenAsUTF8();
            this._onByte = this._collectHeaderValue;
            return;
        }
        this._consumeByte(byte);
    }
    _collectHeaderValue(byte) {
        if (byte === CR) {
            // Ignore CR
            return;
        }
        if (byte === LF) {
            this._results.headers.push([this._headerKey, this._consumeTokenAsUTF8()]);
            this._headerKey = undefined;
            this._onByte = this._collectHeaders;
            return;
        }
        this._consumeByte(byte);
    }
    _setupCollectBody() {
        const contentLengthHeader = this._results.headers.filter((header) => {
            return header[0] === 'content-length';
        })[0];
        if (contentLengthHeader) {
            this._bodyBytesRemaining = parseInt(contentLengthHeader[1], 10);
            this._onByte = this._collectBodyFixedSize;
        }
        else {
            this._onByte = this._collectBodyNullTerminated;
        }
    }
    _collectBodyNullTerminated(byte) {
        if (byte === NULL) {
            this._retrievedBody();
            return;
        }
        this._consumeByte(byte);
    }
    _collectBodyFixedSize(byte) {
        // It is post decrement, so that we discard the trailing NULL octet
        if (this._bodyBytesRemaining-- === 0) {
            this._retrievedBody();
            return;
        }
        this._consumeByte(byte);
    }
    _retrievedBody() {
        this._results.binaryBody = this._consumeTokenAsRaw();
        this.onFrame(this._results);
        this._initState();
    }
    // Rec Descent Parser helpers
    _consumeByte(byte) {
        this._token.push(byte);
    }
    _consumeTokenAsUTF8() {
        return this._decoder.decode(this._consumeTokenAsRaw());
    }
    _consumeTokenAsRaw() {
        const rawResult = new Uint8Array(this._token);
        this._token = [];
        return rawResult;
    }
    _initState() {
        this._results = {
            command: undefined,
            headers: [],
            binaryBody: undefined,
        };
        this._token = [];
        this._headerKey = undefined;
        this._onByte = this._collectFrame;
    }
}
//# sourceMappingURL=parser.js.map

/***/ }),

/***/ "./node_modules/@stomp/stompjs/esm6/stomp-handler.js":
/*!***********************************************************!*\
  !*** ./node_modules/@stomp/stompjs/esm6/stomp-handler.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "StompHandler": () => (/* binding */ StompHandler)
/* harmony export */ });
/* harmony import */ var _byte__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./byte */ "./node_modules/@stomp/stompjs/esm6/byte.js");
/* harmony import */ var _frame_impl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./frame-impl */ "./node_modules/@stomp/stompjs/esm6/frame-impl.js");
/* harmony import */ var _parser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./parser */ "./node_modules/@stomp/stompjs/esm6/parser.js");
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./types */ "./node_modules/@stomp/stompjs/esm6/types.js");
/* harmony import */ var _versions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./versions */ "./node_modules/@stomp/stompjs/esm6/versions.js");
/* harmony import */ var _augment_websocket__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./augment-websocket */ "./node_modules/@stomp/stompjs/esm6/augment-websocket.js");






/**
 * The STOMP protocol handler
 *
 * Part of `@stomp/stompjs`.
 *
 * @internal
 */
class StompHandler {
    constructor(_client, _webSocket, config = {}) {
        this._client = _client;
        this._webSocket = _webSocket;
        this._serverFrameHandlers = {
            // [CONNECTED Frame](http://stomp.github.com/stomp-specification-1.2.html#CONNECTED_Frame)
            CONNECTED: frame => {
                this.debug(`connected to server ${frame.headers.server}`);
                this._connected = true;
                this._connectedVersion = frame.headers.version;
                // STOMP version 1.2 needs header values to be escaped
                if (this._connectedVersion === _versions__WEBPACK_IMPORTED_MODULE_0__.Versions.V1_2) {
                    this._escapeHeaderValues = true;
                }
                this._setupHeartbeat(frame.headers);
                this.onConnect(frame);
            },
            // [MESSAGE Frame](http://stomp.github.com/stomp-specification-1.2.html#MESSAGE)
            MESSAGE: frame => {
                // the callback is registered when the client calls
                // `subscribe()`.
                // If there is no registered subscription for the received message,
                // the default `onUnhandledMessage` callback is used that the client can set.
                // This is useful for subscriptions that are automatically created
                // on the browser side (e.g. [RabbitMQ's temporary
                // queues](http://www.rabbitmq.com/stomp.html)).
                const subscription = frame.headers.subscription;
                const onReceive = this._subscriptions[subscription] || this.onUnhandledMessage;
                // bless the frame to be a Message
                const message = frame;
                const client = this;
                const messageId = this._connectedVersion === _versions__WEBPACK_IMPORTED_MODULE_0__.Versions.V1_2
                    ? message.headers.ack
                    : message.headers['message-id'];
                // add `ack()` and `nack()` methods directly to the returned frame
                // so that a simple call to `message.ack()` can acknowledge the message.
                message.ack = (headers = {}) => {
                    return client.ack(messageId, subscription, headers);
                };
                message.nack = (headers = {}) => {
                    return client.nack(messageId, subscription, headers);
                };
                onReceive(message);
            },
            // [RECEIPT Frame](http://stomp.github.com/stomp-specification-1.2.html#RECEIPT)
            RECEIPT: frame => {
                const callback = this._receiptWatchers[frame.headers['receipt-id']];
                if (callback) {
                    callback(frame);
                    // Server will acknowledge only once, remove the callback
                    delete this._receiptWatchers[frame.headers['receipt-id']];
                }
                else {
                    this.onUnhandledReceipt(frame);
                }
            },
            // [ERROR Frame](http://stomp.github.com/stomp-specification-1.2.html#ERROR)
            ERROR: frame => {
                this.onStompError(frame);
            },
        };
        // used to index subscribers
        this._counter = 0;
        // subscription callbacks indexed by subscriber's ID
        this._subscriptions = {};
        // receipt-watchers indexed by receipts-ids
        this._receiptWatchers = {};
        this._partialData = '';
        this._escapeHeaderValues = false;
        this._lastServerActivityTS = Date.now();
        this.configure(config);
    }
    get connectedVersion() {
        return this._connectedVersion;
    }
    get connected() {
        return this._connected;
    }
    configure(conf) {
        // bulk assign all properties to this
        Object.assign(this, conf);
    }
    start() {
        const parser = new _parser__WEBPACK_IMPORTED_MODULE_1__.Parser(
        // On Frame
        rawFrame => {
            const frame = _frame_impl__WEBPACK_IMPORTED_MODULE_2__.FrameImpl.fromRawFrame(rawFrame, this._escapeHeaderValues);
            // if this.logRawCommunication is set, the rawChunk is logged at this._webSocket.onmessage
            if (!this.logRawCommunication) {
                this.debug(`<<< ${frame}`);
            }
            const serverFrameHandler = this._serverFrameHandlers[frame.command] || this.onUnhandledFrame;
            serverFrameHandler(frame);
        }, 
        // On Incoming Ping
        () => {
            this.debug('<<< PONG');
        });
        this._webSocket.onmessage = (evt) => {
            this.debug('Received data');
            this._lastServerActivityTS = Date.now();
            if (this.logRawCommunication) {
                const rawChunkAsString = evt.data instanceof ArrayBuffer
                    ? new TextDecoder().decode(evt.data)
                    : evt.data;
                this.debug(`<<< ${rawChunkAsString}`);
            }
            parser.parseChunk(evt.data, this.appendMissingNULLonIncoming);
        };
        this._onclose = (closeEvent) => {
            this.debug(`Connection closed to ${this._client.brokerURL}`);
            this._cleanUp();
            this.onWebSocketClose(closeEvent);
        };
        this._webSocket.onclose = this._onclose;
        this._webSocket.onerror = (errorEvent) => {
            this.onWebSocketError(errorEvent);
        };
        this._webSocket.onopen = () => {
            // Clone before updating
            const connectHeaders = Object.assign({}, this.connectHeaders);
            this.debug('Web Socket Opened...');
            connectHeaders['accept-version'] = this.stompVersions.supportedVersions();
            connectHeaders['heart-beat'] = [
                this.heartbeatOutgoing,
                this.heartbeatIncoming,
            ].join(',');
            this._transmit({ command: 'CONNECT', headers: connectHeaders });
        };
    }
    _setupHeartbeat(headers) {
        if (headers.version !== _versions__WEBPACK_IMPORTED_MODULE_0__.Versions.V1_1 &&
            headers.version !== _versions__WEBPACK_IMPORTED_MODULE_0__.Versions.V1_2) {
            return;
        }
        // It is valid for the server to not send this header
        // https://stomp.github.io/stomp-specification-1.2.html#Heart-beating
        if (!headers['heart-beat']) {
            return;
        }
        // heart-beat header received from the server looks like:
        //
        //     heart-beat: sx, sy
        const [serverOutgoing, serverIncoming] = headers['heart-beat']
            .split(',')
            .map((v) => parseInt(v, 10));
        if (this.heartbeatOutgoing !== 0 && serverIncoming !== 0) {
            const ttl = Math.max(this.heartbeatOutgoing, serverIncoming);
            this.debug(`send PING every ${ttl}ms`);
            this._pinger = setInterval(() => {
                if (this._webSocket.readyState === _types__WEBPACK_IMPORTED_MODULE_3__.StompSocketState.OPEN) {
                    this._webSocket.send(_byte__WEBPACK_IMPORTED_MODULE_4__.BYTE.LF);
                    this.debug('>>> PING');
                }
            }, ttl);
        }
        if (this.heartbeatIncoming !== 0 && serverOutgoing !== 0) {
            const ttl = Math.max(this.heartbeatIncoming, serverOutgoing);
            this.debug(`check PONG every ${ttl}ms`);
            this._ponger = setInterval(() => {
                const delta = Date.now() - this._lastServerActivityTS;
                // We wait twice the TTL to be flexible on window's setInterval calls
                if (delta > ttl * 2) {
                    this.debug(`did not receive server activity for the last ${delta}ms`);
                    this._closeOrDiscardWebsocket();
                }
            }, ttl);
        }
    }
    _closeOrDiscardWebsocket() {
        if (this.discardWebsocketOnCommFailure) {
            this.debug("Discarding websocket, the underlying socket may linger for a while");
            this._discardWebsocket();
        }
        else {
            this.debug("Issuing close on the websocket");
            this._closeWebsocket();
        }
    }
    forceDisconnect() {
        if (this._webSocket) {
            if (this._webSocket.readyState === _types__WEBPACK_IMPORTED_MODULE_3__.StompSocketState.CONNECTING ||
                this._webSocket.readyState === _types__WEBPACK_IMPORTED_MODULE_3__.StompSocketState.OPEN) {
                this._closeOrDiscardWebsocket();
            }
        }
    }
    _closeWebsocket() {
        this._webSocket.onmessage = () => { }; // ignore messages
        this._webSocket.close();
    }
    _discardWebsocket() {
        if (!this._webSocket.terminate) {
            (0,_augment_websocket__WEBPACK_IMPORTED_MODULE_5__.augmentWebsocket)(this._webSocket, (msg) => this.debug(msg));
        }
        this._webSocket.terminate();
    }
    _transmit(params) {
        const { command, headers, body, binaryBody, skipContentLengthHeader, } = params;
        const frame = new _frame_impl__WEBPACK_IMPORTED_MODULE_2__.FrameImpl({
            command,
            headers,
            body,
            binaryBody,
            escapeHeaderValues: this._escapeHeaderValues,
            skipContentLengthHeader,
        });
        let rawChunk = frame.serialize();
        if (this.logRawCommunication) {
            this.debug(`>>> ${rawChunk}`);
        }
        else {
            this.debug(`>>> ${frame}`);
        }
        if (this.forceBinaryWSFrames && typeof rawChunk === 'string') {
            rawChunk = new TextEncoder().encode(rawChunk);
        }
        if (typeof rawChunk !== 'string' || !this.splitLargeFrames) {
            this._webSocket.send(rawChunk);
        }
        else {
            let out = rawChunk;
            while (out.length > 0) {
                const chunk = out.substring(0, this.maxWebSocketChunkSize);
                out = out.substring(this.maxWebSocketChunkSize);
                this._webSocket.send(chunk);
                this.debug(`chunk sent = ${chunk.length}, remaining = ${out.length}`);
            }
        }
    }
    dispose() {
        if (this.connected) {
            try {
                // clone before updating
                const disconnectHeaders = Object.assign({}, this.disconnectHeaders);
                if (!disconnectHeaders.receipt) {
                    disconnectHeaders.receipt = `close-${this._counter++}`;
                }
                this.watchForReceipt(disconnectHeaders.receipt, frame => {
                    this._closeWebsocket();
                    this._cleanUp();
                    this.onDisconnect(frame);
                });
                this._transmit({ command: 'DISCONNECT', headers: disconnectHeaders });
            }
            catch (error) {
                this.debug(`Ignoring error during disconnect ${error}`);
            }
        }
        else {
            if (this._webSocket.readyState === _types__WEBPACK_IMPORTED_MODULE_3__.StompSocketState.CONNECTING ||
                this._webSocket.readyState === _types__WEBPACK_IMPORTED_MODULE_3__.StompSocketState.OPEN) {
                this._closeWebsocket();
            }
        }
    }
    _cleanUp() {
        this._connected = false;
        if (this._pinger) {
            clearInterval(this._pinger);
        }
        if (this._ponger) {
            clearInterval(this._ponger);
        }
    }
    publish(params) {
        const { destination, headers, body, binaryBody, skipContentLengthHeader, } = params;
        const hdrs = Object.assign({ destination }, headers);
        this._transmit({
            command: 'SEND',
            headers: hdrs,
            body,
            binaryBody,
            skipContentLengthHeader,
        });
    }
    watchForReceipt(receiptId, callback) {
        this._receiptWatchers[receiptId] = callback;
    }
    subscribe(destination, callback, headers = {}) {
        headers = Object.assign({}, headers);
        if (!headers.id) {
            headers.id = `sub-${this._counter++}`;
        }
        headers.destination = destination;
        this._subscriptions[headers.id] = callback;
        this._transmit({ command: 'SUBSCRIBE', headers });
        const client = this;
        return {
            id: headers.id,
            unsubscribe(hdrs) {
                return client.unsubscribe(headers.id, hdrs);
            },
        };
    }
    unsubscribe(id, headers = {}) {
        headers = Object.assign({}, headers);
        delete this._subscriptions[id];
        headers.id = id;
        this._transmit({ command: 'UNSUBSCRIBE', headers });
    }
    begin(transactionId) {
        const txId = transactionId || `tx-${this._counter++}`;
        this._transmit({
            command: 'BEGIN',
            headers: {
                transaction: txId,
            },
        });
        const client = this;
        return {
            id: txId,
            commit() {
                client.commit(txId);
            },
            abort() {
                client.abort(txId);
            },
        };
    }
    commit(transactionId) {
        this._transmit({
            command: 'COMMIT',
            headers: {
                transaction: transactionId,
            },
        });
    }
    abort(transactionId) {
        this._transmit({
            command: 'ABORT',
            headers: {
                transaction: transactionId,
            },
        });
    }
    ack(messageId, subscriptionId, headers = {}) {
        headers = Object.assign({}, headers);
        if (this._connectedVersion === _versions__WEBPACK_IMPORTED_MODULE_0__.Versions.V1_2) {
            headers.id = messageId;
        }
        else {
            headers['message-id'] = messageId;
        }
        headers.subscription = subscriptionId;
        this._transmit({ command: 'ACK', headers });
    }
    nack(messageId, subscriptionId, headers = {}) {
        headers = Object.assign({}, headers);
        if (this._connectedVersion === _versions__WEBPACK_IMPORTED_MODULE_0__.Versions.V1_2) {
            headers.id = messageId;
        }
        else {
            headers['message-id'] = messageId;
        }
        headers.subscription = subscriptionId;
        return this._transmit({ command: 'NACK', headers });
    }
}
//# sourceMappingURL=stomp-handler.js.map

/***/ }),

/***/ "./node_modules/@stomp/stompjs/esm6/types.js":
/*!***************************************************!*\
  !*** ./node_modules/@stomp/stompjs/esm6/types.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "StompSocketState": () => (/* binding */ StompSocketState),
/* harmony export */   "ActivationState": () => (/* binding */ ActivationState)
/* harmony export */ });
/**
 * Possible states for the IStompSocket
 */
var StompSocketState;
(function (StompSocketState) {
    StompSocketState[StompSocketState["CONNECTING"] = 0] = "CONNECTING";
    StompSocketState[StompSocketState["OPEN"] = 1] = "OPEN";
    StompSocketState[StompSocketState["CLOSING"] = 2] = "CLOSING";
    StompSocketState[StompSocketState["CLOSED"] = 3] = "CLOSED";
})(StompSocketState || (StompSocketState = {}));
/**
 * Possible activation state
 */
var ActivationState;
(function (ActivationState) {
    ActivationState[ActivationState["ACTIVE"] = 0] = "ACTIVE";
    ActivationState[ActivationState["DEACTIVATING"] = 1] = "DEACTIVATING";
    ActivationState[ActivationState["INACTIVE"] = 2] = "INACTIVE";
})(ActivationState || (ActivationState = {}));
//# sourceMappingURL=types.js.map

/***/ }),

/***/ "./node_modules/@stomp/stompjs/esm6/versions.js":
/*!******************************************************!*\
  !*** ./node_modules/@stomp/stompjs/esm6/versions.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Versions": () => (/* binding */ Versions)
/* harmony export */ });
/**
 * Supported STOMP versions
 *
 * Part of `@stomp/stompjs`.
 */
class Versions {
    /**
     * Takes an array of string of versions, typical elements '1.0', '1.1', or '1.2'
     *
     * You will an instance if this class if you want to override supported versions to be declared during
     * STOMP handshake.
     */
    constructor(versions) {
        this.versions = versions;
    }
    /**
     * Used as part of CONNECT STOMP Frame
     */
    supportedVersions() {
        return this.versions.join(',');
    }
    /**
     * Used while creating a WebSocket
     */
    protocolVersions() {
        return this.versions.map(x => `v${x.replace('.', '')}.stomp`);
    }
}
/**
 * Indicates protocol version 1.0
 */
Versions.V1_0 = '1.0';
/**
 * Indicates protocol version 1.1
 */
Versions.V1_1 = '1.1';
/**
 * Indicates protocol version 1.2
 */
Versions.V1_2 = '1.2';
/**
 * @internal
 */
Versions.default = new Versions([
    Versions.V1_0,
    Versions.V1_1,
    Versions.V1_2,
]);
//# sourceMappingURL=versions.js.map

/***/ }),

/***/ "./node_modules/debug/src/browser.js":
/*!*******************************************!*\
  !*** ./node_modules/debug/src/browser.js ***!
  \*******************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();
/**
 * Colors.
 */

exports.colors = ['#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC', '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF', '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC', '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF', '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC', '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033', '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366', '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933', '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC', '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF', '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'];
/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */
// eslint-disable-next-line complexity

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
    return true;
  } // Internet Explorer and Edge do not support colors.


  if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
    return false;
  } // Is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632


  return typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
  typeof window !== 'undefined' && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
  // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
  typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
  typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
}
/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */


function formatArgs(args) {
  args[0] = (this.useColors ? '%c' : '') + this.namespace + (this.useColors ? ' %c' : ' ') + args[0] + (this.useColors ? '%c ' : ' ') + '+' + module.exports.humanize(this.diff);

  if (!this.useColors) {
    return;
  }

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit'); // The final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into

  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function (match) {
    if (match === '%%') {
      return;
    }

    index++;

    if (match === '%c') {
      // We only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });
  args.splice(lastC, 0, c);
}
/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */


function log() {
  var _console;

  // This hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return (typeof console === "undefined" ? "undefined" : _typeof(console)) === 'object' && console.log && (_console = console).log.apply(_console, arguments);
}
/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */


function save(namespaces) {
  try {
    if (namespaces) {
      exports.storage.setItem('debug', namespaces);
    } else {
      exports.storage.removeItem('debug');
    }
  } catch (error) {// Swallow
    // XXX (@Qix-) should we be logging these?
  }
}
/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */


function load() {
  var r;

  try {
    r = exports.storage.getItem('debug');
  } catch (error) {} // Swallow
  // XXX (@Qix-) should we be logging these?
  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG


  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}
/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */


function localstorage() {
  try {
    // TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
    // The Browser also has localStorage in the global context.
    return localStorage;
  } catch (error) {// Swallow
    // XXX (@Qix-) should we be logging these?
  }
}

module.exports = __webpack_require__(/*! ./common */ "./node_modules/debug/src/common.js")(exports);
var formatters = module.exports.formatters;
/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
  try {
    return JSON.stringify(v);
  } catch (error) {
    return '[UnexpectedJSONParseError]: ' + error.message;
  }
};



/***/ }),

/***/ "./node_modules/debug/src/common.js":
/*!******************************************!*\
  !*** ./node_modules/debug/src/common.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */
function setup(env) {
  createDebug.debug = createDebug;
  createDebug.default = createDebug;
  createDebug.coerce = coerce;
  createDebug.disable = disable;
  createDebug.enable = enable;
  createDebug.enabled = enabled;
  createDebug.humanize = __webpack_require__(/*! ms */ "./node_modules/ms/index.js");
  Object.keys(env).forEach(function (key) {
    createDebug[key] = env[key];
  });
  /**
  * Active `debug` instances.
  */

  createDebug.instances = [];
  /**
  * The currently active debug mode names, and names to skip.
  */

  createDebug.names = [];
  createDebug.skips = [];
  /**
  * Map of special "%n" handling functions, for the debug "format" argument.
  *
  * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
  */

  createDebug.formatters = {};
  /**
  * Selects a color for a debug namespace
  * @param {String} namespace The namespace string for the for the debug instance to be colored
  * @return {Number|String} An ANSI color code for the given namespace
  * @api private
  */

  function selectColor(namespace) {
    var hash = 0;

    for (var i = 0; i < namespace.length; i++) {
      hash = (hash << 5) - hash + namespace.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }

    return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
  }

  createDebug.selectColor = selectColor;
  /**
  * Create a debugger with the given `namespace`.
  *
  * @param {String} namespace
  * @return {Function}
  * @api public
  */

  function createDebug(namespace) {
    var prevTime;

    function debug() {
      // Disabled?
      if (!debug.enabled) {
        return;
      }

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var self = debug; // Set `diff` timestamp

      var curr = Number(new Date());
      var ms = curr - (prevTime || curr);
      self.diff = ms;
      self.prev = prevTime;
      self.curr = curr;
      prevTime = curr;
      args[0] = createDebug.coerce(args[0]);

      if (typeof args[0] !== 'string') {
        // Anything else let's inspect with %O
        args.unshift('%O');
      } // Apply any `formatters` transformations


      var index = 0;
      args[0] = args[0].replace(/%([a-zA-Z%])/g, function (match, format) {
        // If we encounter an escaped % then don't increase the array index
        if (match === '%%') {
          return match;
        }

        index++;
        var formatter = createDebug.formatters[format];

        if (typeof formatter === 'function') {
          var val = args[index];
          match = formatter.call(self, val); // Now we need to remove `args[index]` since it's inlined in the `format`

          args.splice(index, 1);
          index--;
        }

        return match;
      }); // Apply env-specific formatting (colors, etc.)

      createDebug.formatArgs.call(self, args);
      var logFn = self.log || createDebug.log;
      logFn.apply(self, args);
    }

    debug.namespace = namespace;
    debug.enabled = createDebug.enabled(namespace);
    debug.useColors = createDebug.useColors();
    debug.color = selectColor(namespace);
    debug.destroy = destroy;
    debug.extend = extend; // Debug.formatArgs = formatArgs;
    // debug.rawLog = rawLog;
    // env-specific initialization logic for debug instances

    if (typeof createDebug.init === 'function') {
      createDebug.init(debug);
    }

    createDebug.instances.push(debug);
    return debug;
  }

  function destroy() {
    var index = createDebug.instances.indexOf(this);

    if (index !== -1) {
      createDebug.instances.splice(index, 1);
      return true;
    }

    return false;
  }

  function extend(namespace, delimiter) {
    return createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
  }
  /**
  * Enables a debug mode by namespaces. This can include modes
  * separated by a colon and wildcards.
  *
  * @param {String} namespaces
  * @api public
  */


  function enable(namespaces) {
    createDebug.save(namespaces);
    createDebug.names = [];
    createDebug.skips = [];
    var i;
    var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
    var len = split.length;

    for (i = 0; i < len; i++) {
      if (!split[i]) {
        // ignore empty strings
        continue;
      }

      namespaces = split[i].replace(/\*/g, '.*?');

      if (namespaces[0] === '-') {
        createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
      } else {
        createDebug.names.push(new RegExp('^' + namespaces + '$'));
      }
    }

    for (i = 0; i < createDebug.instances.length; i++) {
      var instance = createDebug.instances[i];
      instance.enabled = createDebug.enabled(instance.namespace);
    }
  }
  /**
  * Disable debug output.
  *
  * @api public
  */


  function disable() {
    createDebug.enable('');
  }
  /**
  * Returns true if the given mode name is enabled, false otherwise.
  *
  * @param {String} name
  * @return {Boolean}
  * @api public
  */


  function enabled(name) {
    if (name[name.length - 1] === '*') {
      return true;
    }

    var i;
    var len;

    for (i = 0, len = createDebug.skips.length; i < len; i++) {
      if (createDebug.skips[i].test(name)) {
        return false;
      }
    }

    for (i = 0, len = createDebug.names.length; i < len; i++) {
      if (createDebug.names[i].test(name)) {
        return true;
      }
    }

    return false;
  }
  /**
  * Coerce `val`.
  *
  * @param {Mixed} val
  * @return {Mixed}
  * @api private
  */


  function coerce(val) {
    if (val instanceof Error) {
      return val.stack || val.message;
    }

    return val;
  }

  createDebug.enable(createDebug.load());
  return createDebug;
}

module.exports = setup;



/***/ }),

/***/ "./node_modules/inherits/inherits_browser.js":
/*!***************************************************!*\
  !*** ./node_modules/inherits/inherits_browser.js ***!
  \***************************************************/
/***/ ((module) => {

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}


/***/ }),

/***/ "./node_modules/json3/lib/json3.js":
/*!*****************************************!*\
  !*** ./node_modules/json3/lib/json3.js ***!
  \*****************************************/
/***/ (function(module, exports, __webpack_require__) {

/* module decorator */ module = __webpack_require__.nmd(module);
var __WEBPACK_AMD_DEFINE_RESULT__;/*! JSON v3.3.2 | https://bestiejs.github.io/json3 | Copyright 2012-2015, Kit Cambridge, Benjamin Tan | http://kit.mit-license.org */
;(function () {
  // Detect the `define` function exposed by asynchronous module loaders. The
  // strict `define` check is necessary for compatibility with `r.js`.
  var isLoader =  true && __webpack_require__.amdO;

  // A set of types used to distinguish objects from primitives.
  var objectTypes = {
    "function": true,
    "object": true
  };

  // Detect the `exports` object exposed by CommonJS implementations.
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  // Use the `global` object exposed by Node (including Browserify via
  // `insert-module-globals`), Narwhal, and Ringo as the default context,
  // and the `window` object in browsers. Rhino exports a `global` function
  // instead.
  var root = objectTypes[typeof window] && window || this,
      freeGlobal = freeExports && objectTypes["object"] && module && !module.nodeType && typeof __webpack_require__.g == "object" && __webpack_require__.g;

  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
    root = freeGlobal;
  }

  // Public: Initializes JSON 3 using the given `context` object, attaching the
  // `stringify` and `parse` functions to the specified `exports` object.
  function runInContext(context, exports) {
    context || (context = root.Object());
    exports || (exports = root.Object());

    // Native constructor aliases.
    var Number = context.Number || root.Number,
        String = context.String || root.String,
        Object = context.Object || root.Object,
        Date = context.Date || root.Date,
        SyntaxError = context.SyntaxError || root.SyntaxError,
        TypeError = context.TypeError || root.TypeError,
        Math = context.Math || root.Math,
        nativeJSON = context.JSON || root.JSON;

    // Delegate to the native `stringify` and `parse` implementations.
    if (typeof nativeJSON == "object" && nativeJSON) {
      exports.stringify = nativeJSON.stringify;
      exports.parse = nativeJSON.parse;
    }

    // Convenience aliases.
    var objectProto = Object.prototype,
        getClass = objectProto.toString,
        isProperty = objectProto.hasOwnProperty,
        undefined;

    // Internal: Contains `try...catch` logic used by other functions.
    // This prevents other functions from being deoptimized.
    function attempt(func, errorFunc) {
      try {
        func();
      } catch (exception) {
        if (errorFunc) {
          errorFunc();
        }
      }
    }

    // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
    var isExtended = new Date(-3509827334573292);
    attempt(function () {
      // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
      // results for certain dates in Opera >= 10.53.
      isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
        isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
    });

    // Internal: Determines whether the native `JSON.stringify` and `parse`
    // implementations are spec-compliant. Based on work by Ken Snyder.
    function has(name) {
      if (has[name] != null) {
        // Return cached feature test result.
        return has[name];
      }
      var isSupported;
      if (name == "bug-string-char-index") {
        // IE <= 7 doesn't support accessing string characters using square
        // bracket notation. IE 8 only supports this for primitives.
        isSupported = "a"[0] != "a";
      } else if (name == "json") {
        // Indicates whether both `JSON.stringify` and `JSON.parse` are
        // supported.
        isSupported = has("json-stringify") && has("date-serialization") && has("json-parse");
      } else if (name == "date-serialization") {
        // Indicates whether `Date`s can be serialized accurately by `JSON.stringify`.
        isSupported = has("json-stringify") && isExtended;
        if (isSupported) {
          var stringify = exports.stringify;
          attempt(function () {
            isSupported =
              // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
              // serialize extended years.
              stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
              // The milliseconds are optional in ES 5, but required in 5.1.
              stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
              // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
              // four-digit years instead of six-digit years. Credits: @Yaffle.
              stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
              // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
              // values less than 1000. Credits: @Yaffle.
              stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
          });
        }
      } else {
        var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
        // Test `JSON.stringify`.
        if (name == "json-stringify") {
          var stringify = exports.stringify, stringifySupported = typeof stringify == "function";
          if (stringifySupported) {
            // A test function object with a custom `toJSON` method.
            (value = function () {
              return 1;
            }).toJSON = value;
            attempt(function () {
              stringifySupported =
                // Firefox 3.1b1 and b2 serialize string, number, and boolean
                // primitives as object literals.
                stringify(0) === "0" &&
                // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
                // literals.
                stringify(new Number()) === "0" &&
                stringify(new String()) == '""' &&
                // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
                // does not define a canonical JSON representation (this applies to
                // objects with `toJSON` properties as well, *unless* they are nested
                // within an object or array).
                stringify(getClass) === undefined &&
                // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
                // FF 3.1b3 pass this test.
                stringify(undefined) === undefined &&
                // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
                // respectively, if the value is omitted entirely.
                stringify() === undefined &&
                // FF 3.1b1, 2 throw an error if the given value is not a number,
                // string, array, object, Boolean, or `null` literal. This applies to
                // objects with custom `toJSON` methods as well, unless they are nested
                // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
                // methods entirely.
                stringify(value) === "1" &&
                stringify([value]) == "[1]" &&
                // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
                // `"[null]"`.
                stringify([undefined]) == "[null]" &&
                // YUI 3.0.0b1 fails to serialize `null` literals.
                stringify(null) == "null" &&
                // FF 3.1b1, 2 halts serialization if an array contains a function:
                // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
                // elides non-JSON values from objects and arrays, unless they
                // define custom `toJSON` methods.
                stringify([undefined, getClass, null]) == "[null,null,null]" &&
                // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
                // where character escape codes are expected (e.g., `\b` => `\u0008`).
                stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
                // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
                stringify(null, value) === "1" &&
                stringify([1, 2], null, 1) == "[\n 1,\n 2\n]";
            }, function () {
              stringifySupported = false;
            });
          }
          isSupported = stringifySupported;
        }
        // Test `JSON.parse`.
        if (name == "json-parse") {
          var parse = exports.parse, parseSupported;
          if (typeof parse == "function") {
            attempt(function () {
              // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
              // Conforming implementations should also coerce the initial argument to
              // a string prior to parsing.
              if (parse("0") === 0 && !parse(false)) {
                // Simple parsing test.
                value = parse(serialized);
                parseSupported = value["a"].length == 5 && value["a"][0] === 1;
                if (parseSupported) {
                  attempt(function () {
                    // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
                    parseSupported = !parse('"\t"');
                  });
                  if (parseSupported) {
                    attempt(function () {
                      // FF 4.0 and 4.0.1 allow leading `+` signs and leading
                      // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
                      // certain octal literals.
                      parseSupported = parse("01") !== 1;
                    });
                  }
                  if (parseSupported) {
                    attempt(function () {
                      // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
                      // points. These environments, along with FF 3.1b1 and 2,
                      // also allow trailing commas in JSON objects and arrays.
                      parseSupported = parse("1.") !== 1;
                    });
                  }
                }
              }
            }, function () {
              parseSupported = false;
            });
          }
          isSupported = parseSupported;
        }
      }
      return has[name] = !!isSupported;
    }
    has["bug-string-char-index"] = has["date-serialization"] = has["json"] = has["json-stringify"] = has["json-parse"] = null;

    if (!has("json")) {
      // Common `[[Class]]` name aliases.
      var functionClass = "[object Function]",
          dateClass = "[object Date]",
          numberClass = "[object Number]",
          stringClass = "[object String]",
          arrayClass = "[object Array]",
          booleanClass = "[object Boolean]";

      // Detect incomplete support for accessing string characters by index.
      var charIndexBuggy = has("bug-string-char-index");

      // Internal: Normalizes the `for...in` iteration algorithm across
      // environments. Each enumerated key is yielded to a `callback` function.
      var forOwn = function (object, callback) {
        var size = 0, Properties, dontEnums, property;

        // Tests for bugs in the current environment's `for...in` algorithm. The
        // `valueOf` property inherits the non-enumerable flag from
        // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
        (Properties = function () {
          this.valueOf = 0;
        }).prototype.valueOf = 0;

        // Iterate over a new instance of the `Properties` class.
        dontEnums = new Properties();
        for (property in dontEnums) {
          // Ignore all properties inherited from `Object.prototype`.
          if (isProperty.call(dontEnums, property)) {
            size++;
          }
        }
        Properties = dontEnums = null;

        // Normalize the iteration algorithm.
        if (!size) {
          // A list of non-enumerable properties inherited from `Object.prototype`.
          dontEnums = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
          // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
          // properties.
          forOwn = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, length;
            var hasProperty = !isFunction && typeof object.constructor != "function" && objectTypes[typeof object.hasOwnProperty] && object.hasOwnProperty || isProperty;
            for (property in object) {
              // Gecko <= 1.0 enumerates the `prototype` property of functions under
              // certain conditions; IE does not.
              if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
                callback(property);
              }
            }
            // Manually invoke the callback for each non-enumerable property.
            for (length = dontEnums.length; property = dontEnums[--length];) {
              if (hasProperty.call(object, property)) {
                callback(property);
              }
            }
          };
        } else {
          // No bugs detected; use the standard `for...in` algorithm.
          forOwn = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, isConstructor;
            for (property in object) {
              if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
                callback(property);
              }
            }
            // Manually invoke the callback for the `constructor` property due to
            // cross-environment inconsistencies.
            if (isConstructor || isProperty.call(object, (property = "constructor"))) {
              callback(property);
            }
          };
        }
        return forOwn(object, callback);
      };

      // Public: Serializes a JavaScript `value` as a JSON string. The optional
      // `filter` argument may specify either a function that alters how object and
      // array members are serialized, or an array of strings and numbers that
      // indicates which properties should be serialized. The optional `width`
      // argument may be either a string or number that specifies the indentation
      // level of the output.
      if (!has("json-stringify") && !has("date-serialization")) {
        // Internal: A map of control characters and their escaped equivalents.
        var Escapes = {
          92: "\\\\",
          34: '\\"',
          8: "\\b",
          12: "\\f",
          10: "\\n",
          13: "\\r",
          9: "\\t"
        };

        // Internal: Converts `value` into a zero-padded string such that its
        // length is at least equal to `width`. The `width` must be <= 6.
        var leadingZeroes = "000000";
        var toPaddedString = function (width, value) {
          // The `|| 0` expression is necessary to work around a bug in
          // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
          return (leadingZeroes + (value || 0)).slice(-width);
        };

        // Internal: Serializes a date object.
        var serializeDate = function (value) {
          var getData, year, month, date, time, hours, minutes, seconds, milliseconds;
          // Define additional utility methods if the `Date` methods are buggy.
          if (!isExtended) {
            var floor = Math.floor;
            // A mapping between the months of the year and the number of days between
            // January 1st and the first of the respective month.
            var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
            // Internal: Calculates the number of days between the Unix epoch and the
            // first day of the given month.
            var getDay = function (year, month) {
              return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
            };
            getData = function (value) {
              // Manually compute the year, month, date, hours, minutes,
              // seconds, and milliseconds if the `getUTC*` methods are
              // buggy. Adapted from @Yaffle's `date-shim` project.
              date = floor(value / 864e5);
              for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
              for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
              date = 1 + date - getDay(year, month);
              // The `time` value specifies the time within the day (see ES
              // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
              // to compute `A modulo B`, as the `%` operator does not
              // correspond to the `modulo` operation for negative numbers.
              time = (value % 864e5 + 864e5) % 864e5;
              // The hours, minutes, seconds, and milliseconds are obtained by
              // decomposing the time within the day. See section 15.9.1.10.
              hours = floor(time / 36e5) % 24;
              minutes = floor(time / 6e4) % 60;
              seconds = floor(time / 1e3) % 60;
              milliseconds = time % 1e3;
            };
          } else {
            getData = function (value) {
              year = value.getUTCFullYear();
              month = value.getUTCMonth();
              date = value.getUTCDate();
              hours = value.getUTCHours();
              minutes = value.getUTCMinutes();
              seconds = value.getUTCSeconds();
              milliseconds = value.getUTCMilliseconds();
            };
          }
          serializeDate = function (value) {
            if (value > -1 / 0 && value < 1 / 0) {
              // Dates are serialized according to the `Date#toJSON` method
              // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
              // for the ISO 8601 date time string format.
              getData(value);
              // Serialize extended years correctly.
              value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
              "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
              // Months, dates, hours, minutes, and seconds should have two
              // digits; milliseconds should have three.
              "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
              // Milliseconds are optional in ES 5.0, but required in 5.1.
              "." + toPaddedString(3, milliseconds) + "Z";
              year = month = date = hours = minutes = seconds = milliseconds = null;
            } else {
              value = null;
            }
            return value;
          };
          return serializeDate(value);
        };

        // For environments with `JSON.stringify` but buggy date serialization,
        // we override the native `Date#toJSON` implementation with a
        // spec-compliant one.
        if (has("json-stringify") && !has("date-serialization")) {
          // Internal: the `Date#toJSON` implementation used to override the native one.
          function dateToJSON (key) {
            return serializeDate(this);
          }

          // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
          var nativeStringify = exports.stringify;
          exports.stringify = function (source, filter, width) {
            var nativeToJSON = Date.prototype.toJSON;
            Date.prototype.toJSON = dateToJSON;
            var result = nativeStringify(source, filter, width);
            Date.prototype.toJSON = nativeToJSON;
            return result;
          }
        } else {
          // Internal: Double-quotes a string `value`, replacing all ASCII control
          // characters (characters with code unit values between 0 and 31) with
          // their escaped equivalents. This is an implementation of the
          // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
          var unicodePrefix = "\\u00";
          var escapeChar = function (character) {
            var charCode = character.charCodeAt(0), escaped = Escapes[charCode];
            if (escaped) {
              return escaped;
            }
            return unicodePrefix + toPaddedString(2, charCode.toString(16));
          };
          var reEscape = /[\x00-\x1f\x22\x5c]/g;
          var quote = function (value) {
            reEscape.lastIndex = 0;
            return '"' +
              (
                reEscape.test(value)
                  ? value.replace(reEscape, escapeChar)
                  : value
              ) +
              '"';
          };

          // Internal: Recursively serializes an object. Implements the
          // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
          var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
            var value, type, className, results, element, index, length, prefix, result;
            attempt(function () {
              // Necessary for host object support.
              value = object[property];
            });
            if (typeof value == "object" && value) {
              if (value.getUTCFullYear && getClass.call(value) == dateClass && value.toJSON === Date.prototype.toJSON) {
                value = serializeDate(value);
              } else if (typeof value.toJSON == "function") {
                value = value.toJSON(property);
              }
            }
            if (callback) {
              // If a replacement function was provided, call it to obtain the value
              // for serialization.
              value = callback.call(object, property, value);
            }
            // Exit early if value is `undefined` or `null`.
            if (value == undefined) {
              return value === undefined ? value : "null";
            }
            type = typeof value;
            // Only call `getClass` if the value is an object.
            if (type == "object") {
              className = getClass.call(value);
            }
            switch (className || type) {
              case "boolean":
              case booleanClass:
                // Booleans are represented literally.
                return "" + value;
              case "number":
              case numberClass:
                // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
                // `"null"`.
                return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
              case "string":
              case stringClass:
                // Strings are double-quoted and escaped.
                return quote("" + value);
            }
            // Recursively serialize objects and arrays.
            if (typeof value == "object") {
              // Check for cyclic structures. This is a linear search; performance
              // is inversely proportional to the number of unique nested objects.
              for (length = stack.length; length--;) {
                if (stack[length] === value) {
                  // Cyclic structures cannot be serialized by `JSON.stringify`.
                  throw TypeError();
                }
              }
              // Add the object to the stack of traversed objects.
              stack.push(value);
              results = [];
              // Save the current indentation level and indent one additional level.
              prefix = indentation;
              indentation += whitespace;
              if (className == arrayClass) {
                // Recursively serialize array elements.
                for (index = 0, length = value.length; index < length; index++) {
                  element = serialize(index, value, callback, properties, whitespace, indentation, stack);
                  results.push(element === undefined ? "null" : element);
                }
                result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
              } else {
                // Recursively serialize object members. Members are selected from
                // either a user-specified list of property names, or the object
                // itself.
                forOwn(properties || value, function (property) {
                  var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
                  if (element !== undefined) {
                    // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                    // is not the empty string, let `member` {quote(property) + ":"}
                    // be the concatenation of `member` and the `space` character."
                    // The "`space` character" refers to the literal space
                    // character, not the `space` {width} argument provided to
                    // `JSON.stringify`.
                    results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
                  }
                });
                result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
              }
              // Remove the object from the traversed object stack.
              stack.pop();
              return result;
            }
          };

          // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
          exports.stringify = function (source, filter, width) {
            var whitespace, callback, properties, className;
            if (objectTypes[typeof filter] && filter) {
              className = getClass.call(filter);
              if (className == functionClass) {
                callback = filter;
              } else if (className == arrayClass) {
                // Convert the property names array into a makeshift set.
                properties = {};
                for (var index = 0, length = filter.length, value; index < length;) {
                  value = filter[index++];
                  className = getClass.call(value);
                  if (className == "[object String]" || className == "[object Number]") {
                    properties[value] = 1;
                  }
                }
              }
            }
            if (width) {
              className = getClass.call(width);
              if (className == numberClass) {
                // Convert the `width` to an integer and create a string containing
                // `width` number of space characters.
                if ((width -= width % 1) > 0) {
                  if (width > 10) {
                    width = 10;
                  }
                  for (whitespace = ""; whitespace.length < width;) {
                    whitespace += " ";
                  }
                }
              } else if (className == stringClass) {
                whitespace = width.length <= 10 ? width : width.slice(0, 10);
              }
            }
            // Opera <= 7.54u2 discards the values associated with empty string keys
            // (`""`) only if they are used directly within an object member list
            // (e.g., `!("" in { "": 1})`).
            return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
          };
        }
      }

      // Public: Parses a JSON source string.
      if (!has("json-parse")) {
        var fromCharCode = String.fromCharCode;

        // Internal: A map of escaped control characters and their unescaped
        // equivalents.
        var Unescapes = {
          92: "\\",
          34: '"',
          47: "/",
          98: "\b",
          116: "\t",
          110: "\n",
          102: "\f",
          114: "\r"
        };

        // Internal: Stores the parser state.
        var Index, Source;

        // Internal: Resets the parser state and throws a `SyntaxError`.
        var abort = function () {
          Index = Source = null;
          throw SyntaxError();
        };

        // Internal: Returns the next token, or `"$"` if the parser has reached
        // the end of the source string. A token may be a string, number, `null`
        // literal, or Boolean literal.
        var lex = function () {
          var source = Source, length = source.length, value, begin, position, isSigned, charCode;
          while (Index < length) {
            charCode = source.charCodeAt(Index);
            switch (charCode) {
              case 9: case 10: case 13: case 32:
                // Skip whitespace tokens, including tabs, carriage returns, line
                // feeds, and space characters.
                Index++;
                break;
              case 123: case 125: case 91: case 93: case 58: case 44:
                // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
                // the current position.
                value = charIndexBuggy ? source.charAt(Index) : source[Index];
                Index++;
                return value;
              case 34:
                // `"` delimits a JSON string; advance to the next character and
                // begin parsing the string. String tokens are prefixed with the
                // sentinel `@` character to distinguish them from punctuators and
                // end-of-string tokens.
                for (value = "@", Index++; Index < length;) {
                  charCode = source.charCodeAt(Index);
                  if (charCode < 32) {
                    // Unescaped ASCII control characters (those with a code unit
                    // less than the space character) are not permitted.
                    abort();
                  } else if (charCode == 92) {
                    // A reverse solidus (`\`) marks the beginning of an escaped
                    // control character (including `"`, `\`, and `/`) or Unicode
                    // escape sequence.
                    charCode = source.charCodeAt(++Index);
                    switch (charCode) {
                      case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
                        // Revive escaped control characters.
                        value += Unescapes[charCode];
                        Index++;
                        break;
                      case 117:
                        // `\u` marks the beginning of a Unicode escape sequence.
                        // Advance to the first character and validate the
                        // four-digit code point.
                        begin = ++Index;
                        for (position = Index + 4; Index < position; Index++) {
                          charCode = source.charCodeAt(Index);
                          // A valid sequence comprises four hexdigits (case-
                          // insensitive) that form a single hexadecimal value.
                          if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                            // Invalid Unicode escape sequence.
                            abort();
                          }
                        }
                        // Revive the escaped character.
                        value += fromCharCode("0x" + source.slice(begin, Index));
                        break;
                      default:
                        // Invalid escape sequence.
                        abort();
                    }
                  } else {
                    if (charCode == 34) {
                      // An unescaped double-quote character marks the end of the
                      // string.
                      break;
                    }
                    charCode = source.charCodeAt(Index);
                    begin = Index;
                    // Optimize for the common case where a string is valid.
                    while (charCode >= 32 && charCode != 92 && charCode != 34) {
                      charCode = source.charCodeAt(++Index);
                    }
                    // Append the string as-is.
                    value += source.slice(begin, Index);
                  }
                }
                if (source.charCodeAt(Index) == 34) {
                  // Advance to the next character and return the revived string.
                  Index++;
                  return value;
                }
                // Unterminated string.
                abort();
              default:
                // Parse numbers and literals.
                begin = Index;
                // Advance past the negative sign, if one is specified.
                if (charCode == 45) {
                  isSigned = true;
                  charCode = source.charCodeAt(++Index);
                }
                // Parse an integer or floating-point value.
                if (charCode >= 48 && charCode <= 57) {
                  // Leading zeroes are interpreted as octal literals.
                  if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
                    // Illegal octal literal.
                    abort();
                  }
                  isSigned = false;
                  // Parse the integer component.
                  for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
                  // Floats cannot contain a leading decimal point; however, this
                  // case is already accounted for by the parser.
                  if (source.charCodeAt(Index) == 46) {
                    position = ++Index;
                    // Parse the decimal component.
                    for (; position < length; position++) {
                      charCode = source.charCodeAt(position);
                      if (charCode < 48 || charCode > 57) {
                        break;
                      }
                    }
                    if (position == Index) {
                      // Illegal trailing decimal.
                      abort();
                    }
                    Index = position;
                  }
                  // Parse exponents. The `e` denoting the exponent is
                  // case-insensitive.
                  charCode = source.charCodeAt(Index);
                  if (charCode == 101 || charCode == 69) {
                    charCode = source.charCodeAt(++Index);
                    // Skip past the sign following the exponent, if one is
                    // specified.
                    if (charCode == 43 || charCode == 45) {
                      Index++;
                    }
                    // Parse the exponential component.
                    for (position = Index; position < length; position++) {
                      charCode = source.charCodeAt(position);
                      if (charCode < 48 || charCode > 57) {
                        break;
                      }
                    }
                    if (position == Index) {
                      // Illegal empty exponent.
                      abort();
                    }
                    Index = position;
                  }
                  // Coerce the parsed value to a JavaScript number.
                  return +source.slice(begin, Index);
                }
                // A negative sign may only precede numbers.
                if (isSigned) {
                  abort();
                }
                // `true`, `false`, and `null` literals.
                var temp = source.slice(Index, Index + 4);
                if (temp == "true") {
                  Index += 4;
                  return true;
                } else if (temp == "fals" && source.charCodeAt(Index + 4 ) == 101) {
                  Index += 5;
                  return false;
                } else if (temp == "null") {
                  Index += 4;
                  return null;
                }
                // Unrecognized token.
                abort();
            }
          }
          // Return the sentinel `$` character if the parser has reached the end
          // of the source string.
          return "$";
        };

        // Internal: Parses a JSON `value` token.
        var get = function (value) {
          var results, hasMembers;
          if (value == "$") {
            // Unexpected end of input.
            abort();
          }
          if (typeof value == "string") {
            if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
              // Remove the sentinel `@` character.
              return value.slice(1);
            }
            // Parse object and array literals.
            if (value == "[") {
              // Parses a JSON array, returning a new JavaScript array.
              results = [];
              for (;;) {
                value = lex();
                // A closing square bracket marks the end of the array literal.
                if (value == "]") {
                  break;
                }
                // If the array literal contains elements, the current token
                // should be a comma separating the previous element from the
                // next.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "]") {
                      // Unexpected trailing `,` in array literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each array element.
                    abort();
                  }
                } else {
                  hasMembers = true;
                }
                // Elisions and leading commas are not permitted.
                if (value == ",") {
                  abort();
                }
                results.push(get(value));
              }
              return results;
            } else if (value == "{") {
              // Parses a JSON object, returning a new JavaScript object.
              results = {};
              for (;;) {
                value = lex();
                // A closing curly brace marks the end of the object literal.
                if (value == "}") {
                  break;
                }
                // If the object literal contains members, the current token
                // should be a comma separator.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "}") {
                      // Unexpected trailing `,` in object literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each object member.
                    abort();
                  }
                } else {
                  hasMembers = true;
                }
                // Leading commas are not permitted, object property names must be
                // double-quoted strings, and a `:` must separate each property
                // name and value.
                if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
                  abort();
                }
                results[value.slice(1)] = get(lex());
              }
              return results;
            }
            // Unexpected token encountered.
            abort();
          }
          return value;
        };

        // Internal: Updates a traversed object member.
        var update = function (source, property, callback) {
          var element = walk(source, property, callback);
          if (element === undefined) {
            delete source[property];
          } else {
            source[property] = element;
          }
        };

        // Internal: Recursively traverses a parsed JSON object, invoking the
        // `callback` function for each value. This is an implementation of the
        // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
        var walk = function (source, property, callback) {
          var value = source[property], length;
          if (typeof value == "object" && value) {
            // `forOwn` can't be used to traverse an array in Opera <= 8.54
            // because its `Object#hasOwnProperty` implementation returns `false`
            // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
            if (getClass.call(value) == arrayClass) {
              for (length = value.length; length--;) {
                update(getClass, forOwn, value, length, callback);
              }
            } else {
              forOwn(value, function (property) {
                update(value, property, callback);
              });
            }
          }
          return callback.call(source, property, value);
        };

        // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
        exports.parse = function (source, callback) {
          var result, value;
          Index = 0;
          Source = "" + source;
          result = get(lex());
          // If a JSON string contains multiple tokens, it is invalid.
          if (lex() != "$") {
            abort();
          }
          // Reset the parser state.
          Index = Source = null;
          return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
        };
      }
    }

    exports.runInContext = runInContext;
    return exports;
  }

  if (freeExports && !isLoader) {
    // Export for CommonJS environments.
    runInContext(root, freeExports);
  } else {
    // Export for web browsers and JavaScript engines.
    var nativeJSON = root.JSON,
        previousJSON = root.JSON3,
        isRestored = false;

    var JSON3 = runInContext(root, (root.JSON3 = {
      // Public: Restores the original value of the global `JSON` object and
      // returns a reference to the `JSON3` object.
      "noConflict": function () {
        if (!isRestored) {
          isRestored = true;
          root.JSON = nativeJSON;
          root.JSON3 = previousJSON;
          nativeJSON = previousJSON = null;
        }
        return JSON3;
      }
    }));

    root.JSON = {
      "parse": JSON3.parse,
      "stringify": JSON3.stringify
    };
  }

  // Export for asynchronous module loaders.
  if (isLoader) {
    !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
      return JSON3;
    }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  }
}).call(this);


/***/ }),

/***/ "./node_modules/ms/index.js":
/*!**********************************!*\
  !*** ./node_modules/ms/index.js ***!
  \**********************************/
/***/ ((module) => {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function (val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}


/***/ }),

/***/ "./node_modules/querystringify/index.js":
/*!**********************************************!*\
  !*** ./node_modules/querystringify/index.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


var has = Object.prototype.hasOwnProperty
  , undef;

/**
 * Decode a URI encoded string.
 *
 * @param {String} input The URI encoded string.
 * @returns {String|Null} The decoded string.
 * @api private
 */
function decode(input) {
  try {
    return decodeURIComponent(input.replace(/\+/g, ' '));
  } catch (e) {
    return null;
  }
}

/**
 * Attempts to encode a given input.
 *
 * @param {String} input The string that needs to be encoded.
 * @returns {String|Null} The encoded string.
 * @api private
 */
function encode(input) {
  try {
    return encodeURIComponent(input);
  } catch (e) {
    return null;
  }
}

/**
 * Simple query string parser.
 *
 * @param {String} query The query string that needs to be parsed.
 * @returns {Object}
 * @api public
 */
function querystring(query) {
  var parser = /([^=?#&]+)=?([^&]*)/g
    , result = {}
    , part;

  while (part = parser.exec(query)) {
    var key = decode(part[1])
      , value = decode(part[2]);

    //
    // Prevent overriding of existing properties. This ensures that build-in
    // methods like `toString` or __proto__ are not overriden by malicious
    // querystrings.
    //
    // In the case if failed decoding, we want to omit the key/value pairs
    // from the result.
    //
    if (key === null || value === null || key in result) continue;
    result[key] = value;
  }

  return result;
}

/**
 * Transform a query string to an object.
 *
 * @param {Object} obj Object that should be transformed.
 * @param {String} prefix Optional prefix.
 * @returns {String}
 * @api public
 */
function querystringify(obj, prefix) {
  prefix = prefix || '';

  var pairs = []
    , value
    , key;

  //
  // Optionally prefix with a '?' if needed
  //
  if ('string' !== typeof prefix) prefix = '?';

  for (key in obj) {
    if (has.call(obj, key)) {
      value = obj[key];

      //
      // Edge cases where we actually want to encode the value to an empty
      // string instead of the stringified value.
      //
      if (!value && (value === null || value === undef || isNaN(value))) {
        value = '';
      }

      key = encode(key);
      value = encode(value);

      //
      // If we failed to encode the strings, we should bail out as we don't
      // want to add invalid strings to the query.
      //
      if (key === null || value === null) continue;
      pairs.push(key +'='+ value);
    }
  }

  return pairs.length ? prefix + pairs.join('&') : '';
}

//
// Expose the module.
//
exports.stringify = querystringify;
exports.parse = querystring;


/***/ }),

/***/ "./node_modules/requires-port/index.js":
/*!*********************************************!*\
  !*** ./node_modules/requires-port/index.js ***!
  \*********************************************/
/***/ ((module) => {

"use strict";


/**
 * Check if we're required to add a port number.
 *
 * @see https://url.spec.whatwg.org/#default-port
 * @param {Number|String} port Port number we need to check
 * @param {String} protocol Protocol we need to check against.
 * @returns {Boolean} Is it a default port for the given protocol
 * @api private
 */
module.exports = function required(port, protocol) {
  protocol = protocol.split(':')[0];
  port = +port;

  if (!port) return false;

  switch (protocol) {
    case 'http':
    case 'ws':
    return port !== 80;

    case 'https':
    case 'wss':
    return port !== 443;

    case 'ftp':
    return port !== 21;

    case 'gopher':
    return port !== 70;

    case 'file':
    return false;
  }

  return port !== 0;
};


/***/ }),

/***/ "./node_modules/sockjs-client/lib/entry.js":
/*!*************************************************!*\
  !*** ./node_modules/sockjs-client/lib/entry.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var transportList = __webpack_require__(/*! ./transport-list */ "./node_modules/sockjs-client/lib/transport-list.js");

module.exports = __webpack_require__(/*! ./main */ "./node_modules/sockjs-client/lib/main.js")(transportList);

// TODO can't get rid of this until all servers do
if ('_sockjs_onload' in __webpack_require__.g) {
  setTimeout(__webpack_require__.g._sockjs_onload, 1);
}


/***/ }),

/***/ "./node_modules/sockjs-client/lib/event/close.js":
/*!*******************************************************!*\
  !*** ./node_modules/sockjs-client/lib/event/close.js ***!
  \*******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
  , Event = __webpack_require__(/*! ./event */ "./node_modules/sockjs-client/lib/event/event.js")
  ;

function CloseEvent() {
  Event.call(this);
  this.initEvent('close', false, false);
  this.wasClean = false;
  this.code = 0;
  this.reason = '';
}

inherits(CloseEvent, Event);

module.exports = CloseEvent;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/event/emitter.js":
/*!*********************************************************!*\
  !*** ./node_modules/sockjs-client/lib/event/emitter.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
  , EventTarget = __webpack_require__(/*! ./eventtarget */ "./node_modules/sockjs-client/lib/event/eventtarget.js")
  ;

function EventEmitter() {
  EventTarget.call(this);
}

inherits(EventEmitter, EventTarget);

EventEmitter.prototype.removeAllListeners = function(type) {
  if (type) {
    delete this._listeners[type];
  } else {
    this._listeners = {};
  }
};

EventEmitter.prototype.once = function(type, listener) {
  var self = this
    , fired = false;

  function g() {
    self.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  this.on(type, g);
};

EventEmitter.prototype.emit = function() {
  var type = arguments[0];
  var listeners = this._listeners[type];
  if (!listeners) {
    return;
  }
  // equivalent of Array.prototype.slice.call(arguments, 1);
  var l = arguments.length;
  var args = new Array(l - 1);
  for (var ai = 1; ai < l; ai++) {
    args[ai - 1] = arguments[ai];
  }
  for (var i = 0; i < listeners.length; i++) {
    listeners[i].apply(this, args);
  }
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener = EventTarget.prototype.addEventListener;
EventEmitter.prototype.removeListener = EventTarget.prototype.removeEventListener;

module.exports.EventEmitter = EventEmitter;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/event/event.js":
/*!*******************************************************!*\
  !*** ./node_modules/sockjs-client/lib/event/event.js ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";


function Event(eventType) {
  this.type = eventType;
}

Event.prototype.initEvent = function(eventType, canBubble, cancelable) {
  this.type = eventType;
  this.bubbles = canBubble;
  this.cancelable = cancelable;
  this.timeStamp = +new Date();
  return this;
};

Event.prototype.stopPropagation = function() {};
Event.prototype.preventDefault = function() {};

Event.CAPTURING_PHASE = 1;
Event.AT_TARGET = 2;
Event.BUBBLING_PHASE = 3;

module.exports = Event;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/event/eventtarget.js":
/*!*************************************************************!*\
  !*** ./node_modules/sockjs-client/lib/event/eventtarget.js ***!
  \*************************************************************/
/***/ ((module) => {

"use strict";


/* Simplified implementation of DOM2 EventTarget.
 *   http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventTarget
 */

function EventTarget() {
  this._listeners = {};
}

EventTarget.prototype.addEventListener = function(eventType, listener) {
  if (!(eventType in this._listeners)) {
    this._listeners[eventType] = [];
  }
  var arr = this._listeners[eventType];
  // #4
  if (arr.indexOf(listener) === -1) {
    // Make a copy so as not to interfere with a current dispatchEvent.
    arr = arr.concat([listener]);
  }
  this._listeners[eventType] = arr;
};

EventTarget.prototype.removeEventListener = function(eventType, listener) {
  var arr = this._listeners[eventType];
  if (!arr) {
    return;
  }
  var idx = arr.indexOf(listener);
  if (idx !== -1) {
    if (arr.length > 1) {
      // Make a copy so as not to interfere with a current dispatchEvent.
      this._listeners[eventType] = arr.slice(0, idx).concat(arr.slice(idx + 1));
    } else {
      delete this._listeners[eventType];
    }
    return;
  }
};

EventTarget.prototype.dispatchEvent = function() {
  var event = arguments[0];
  var t = event.type;
  // equivalent of Array.prototype.slice.call(arguments, 0);
  var args = arguments.length === 1 ? [event] : Array.apply(null, arguments);
  // TODO: This doesn't match the real behavior; per spec, onfoo get
  // their place in line from the /first/ time they're set from
  // non-null. Although WebKit bumps it to the end every time it's
  // set.
  if (this['on' + t]) {
    this['on' + t].apply(this, args);
  }
  if (t in this._listeners) {
    // Grab a reference to the listeners list. removeEventListener may alter the list.
    var listeners = this._listeners[t];
    for (var i = 0; i < listeners.length; i++) {
      listeners[i].apply(this, args);
    }
  }
};

module.exports = EventTarget;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/event/trans-message.js":
/*!***************************************************************!*\
  !*** ./node_modules/sockjs-client/lib/event/trans-message.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
  , Event = __webpack_require__(/*! ./event */ "./node_modules/sockjs-client/lib/event/event.js")
  ;

function TransportMessageEvent(data) {
  Event.call(this);
  this.initEvent('message', false, false);
  this.data = data;
}

inherits(TransportMessageEvent, Event);

module.exports = TransportMessageEvent;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/facade.js":
/*!**************************************************!*\
  !*** ./node_modules/sockjs-client/lib/facade.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var JSON3 = __webpack_require__(/*! json3 */ "./node_modules/json3/lib/json3.js")
  , iframeUtils = __webpack_require__(/*! ./utils/iframe */ "./node_modules/sockjs-client/lib/utils/iframe.js")
  ;

function FacadeJS(transport) {
  this._transport = transport;
  transport.on('message', this._transportMessage.bind(this));
  transport.on('close', this._transportClose.bind(this));
}

FacadeJS.prototype._transportClose = function(code, reason) {
  iframeUtils.postMessage('c', JSON3.stringify([code, reason]));
};
FacadeJS.prototype._transportMessage = function(frame) {
  iframeUtils.postMessage('t', frame);
};
FacadeJS.prototype._send = function(data) {
  this._transport.send(data);
};
FacadeJS.prototype._close = function() {
  this._transport.close();
  this._transport.removeAllListeners();
};

module.exports = FacadeJS;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/iframe-bootstrap.js":
/*!************************************************************!*\
  !*** ./node_modules/sockjs-client/lib/iframe-bootstrap.js ***!
  \************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var urlUtils = __webpack_require__(/*! ./utils/url */ "./node_modules/sockjs-client/lib/utils/url.js")
  , eventUtils = __webpack_require__(/*! ./utils/event */ "./node_modules/sockjs-client/lib/utils/event.js")
  , JSON3 = __webpack_require__(/*! json3 */ "./node_modules/json3/lib/json3.js")
  , FacadeJS = __webpack_require__(/*! ./facade */ "./node_modules/sockjs-client/lib/facade.js")
  , InfoIframeReceiver = __webpack_require__(/*! ./info-iframe-receiver */ "./node_modules/sockjs-client/lib/info-iframe-receiver.js")
  , iframeUtils = __webpack_require__(/*! ./utils/iframe */ "./node_modules/sockjs-client/lib/utils/iframe.js")
  , loc = __webpack_require__(/*! ./location */ "./node_modules/sockjs-client/lib/location.js")
  ;

var debug = function() {};
if (true) {
  debug = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js")('sockjs-client:iframe-bootstrap');
}

module.exports = function(SockJS, availableTransports) {
  var transportMap = {};
  availableTransports.forEach(function(at) {
    if (at.facadeTransport) {
      transportMap[at.facadeTransport.transportName] = at.facadeTransport;
    }
  });

  // hard-coded for the info iframe
  // TODO see if we can make this more dynamic
  transportMap[InfoIframeReceiver.transportName] = InfoIframeReceiver;
  var parentOrigin;

  /* eslint-disable camelcase */
  SockJS.bootstrap_iframe = function() {
    /* eslint-enable camelcase */
    var facade;
    iframeUtils.currentWindowId = loc.hash.slice(1);
    var onMessage = function(e) {
      if (e.source !== parent) {
        return;
      }
      if (typeof parentOrigin === 'undefined') {
        parentOrigin = e.origin;
      }
      if (e.origin !== parentOrigin) {
        return;
      }

      var iframeMessage;
      try {
        iframeMessage = JSON3.parse(e.data);
      } catch (ignored) {
        debug('bad json', e.data);
        return;
      }

      if (iframeMessage.windowId !== iframeUtils.currentWindowId) {
        return;
      }
      switch (iframeMessage.type) {
      case 's':
        var p;
        try {
          p = JSON3.parse(iframeMessage.data);
        } catch (ignored) {
          debug('bad json', iframeMessage.data);
          break;
        }
        var version = p[0];
        var transport = p[1];
        var transUrl = p[2];
        var baseUrl = p[3];
        debug(version, transport, transUrl, baseUrl);
        // change this to semver logic
        if (version !== SockJS.version) {
          throw new Error('Incompatible SockJS! Main site uses:' +
                    ' "' + version + '", the iframe:' +
                    ' "' + SockJS.version + '".');
        }

        if (!urlUtils.isOriginEqual(transUrl, loc.href) ||
            !urlUtils.isOriginEqual(baseUrl, loc.href)) {
          throw new Error('Can\'t connect to different domain from within an ' +
                    'iframe. (' + loc.href + ', ' + transUrl + ', ' + baseUrl + ')');
        }
        facade = new FacadeJS(new transportMap[transport](transUrl, baseUrl));
        break;
      case 'm':
        facade._send(iframeMessage.data);
        break;
      case 'c':
        if (facade) {
          facade._close();
        }
        facade = null;
        break;
      }
    };

    eventUtils.attachEvent('message', onMessage);

    // Start
    iframeUtils.postMessage('s');
  };
};


/***/ }),

/***/ "./node_modules/sockjs-client/lib/info-ajax.js":
/*!*****************************************************!*\
  !*** ./node_modules/sockjs-client/lib/info-ajax.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var EventEmitter = __webpack_require__(/*! events */ "./node_modules/sockjs-client/lib/event/emitter.js").EventEmitter
  , inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
  , JSON3 = __webpack_require__(/*! json3 */ "./node_modules/json3/lib/json3.js")
  , objectUtils = __webpack_require__(/*! ./utils/object */ "./node_modules/sockjs-client/lib/utils/object.js")
  ;

var debug = function() {};
if (true) {
  debug = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js")('sockjs-client:info-ajax');
}

function InfoAjax(url, AjaxObject) {
  EventEmitter.call(this);

  var self = this;
  var t0 = +new Date();
  this.xo = new AjaxObject('GET', url);

  this.xo.once('finish', function(status, text) {
    var info, rtt;
    if (status === 200) {
      rtt = (+new Date()) - t0;
      if (text) {
        try {
          info = JSON3.parse(text);
        } catch (e) {
          debug('bad json', text);
        }
      }

      if (!objectUtils.isObject(info)) {
        info = {};
      }
    }
    self.emit('finish', info, rtt);
    self.removeAllListeners();
  });
}

inherits(InfoAjax, EventEmitter);

InfoAjax.prototype.close = function() {
  this.removeAllListeners();
  this.xo.close();
};

module.exports = InfoAjax;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/info-iframe-receiver.js":
/*!****************************************************************!*\
  !*** ./node_modules/sockjs-client/lib/info-iframe-receiver.js ***!
  \****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
  , EventEmitter = __webpack_require__(/*! events */ "./node_modules/sockjs-client/lib/event/emitter.js").EventEmitter
  , JSON3 = __webpack_require__(/*! json3 */ "./node_modules/json3/lib/json3.js")
  , XHRLocalObject = __webpack_require__(/*! ./transport/sender/xhr-local */ "./node_modules/sockjs-client/lib/transport/sender/xhr-local.js")
  , InfoAjax = __webpack_require__(/*! ./info-ajax */ "./node_modules/sockjs-client/lib/info-ajax.js")
  ;

function InfoReceiverIframe(transUrl) {
  var self = this;
  EventEmitter.call(this);

  this.ir = new InfoAjax(transUrl, XHRLocalObject);
  this.ir.once('finish', function(info, rtt) {
    self.ir = null;
    self.emit('message', JSON3.stringify([info, rtt]));
  });
}

inherits(InfoReceiverIframe, EventEmitter);

InfoReceiverIframe.transportName = 'iframe-info-receiver';

InfoReceiverIframe.prototype.close = function() {
  if (this.ir) {
    this.ir.close();
    this.ir = null;
  }
  this.removeAllListeners();
};

module.exports = InfoReceiverIframe;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/info-iframe.js":
/*!*******************************************************!*\
  !*** ./node_modules/sockjs-client/lib/info-iframe.js ***!
  \*******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var EventEmitter = __webpack_require__(/*! events */ "./node_modules/sockjs-client/lib/event/emitter.js").EventEmitter
  , inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
  , JSON3 = __webpack_require__(/*! json3 */ "./node_modules/json3/lib/json3.js")
  , utils = __webpack_require__(/*! ./utils/event */ "./node_modules/sockjs-client/lib/utils/event.js")
  , IframeTransport = __webpack_require__(/*! ./transport/iframe */ "./node_modules/sockjs-client/lib/transport/iframe.js")
  , InfoReceiverIframe = __webpack_require__(/*! ./info-iframe-receiver */ "./node_modules/sockjs-client/lib/info-iframe-receiver.js")
  ;

var debug = function() {};
if (true) {
  debug = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js")('sockjs-client:info-iframe');
}

function InfoIframe(baseUrl, url) {
  var self = this;
  EventEmitter.call(this);

  var go = function() {
    var ifr = self.ifr = new IframeTransport(InfoReceiverIframe.transportName, url, baseUrl);

    ifr.once('message', function(msg) {
      if (msg) {
        var d;
        try {
          d = JSON3.parse(msg);
        } catch (e) {
          debug('bad json', msg);
          self.emit('finish');
          self.close();
          return;
        }

        var info = d[0], rtt = d[1];
        self.emit('finish', info, rtt);
      }
      self.close();
    });

    ifr.once('close', function() {
      self.emit('finish');
      self.close();
    });
  };

  // TODO this seems the same as the 'needBody' from transports
  if (!__webpack_require__.g.document.body) {
    utils.attachEvent('load', go);
  } else {
    go();
  }
}

inherits(InfoIframe, EventEmitter);

InfoIframe.enabled = function() {
  return IframeTransport.enabled();
};

InfoIframe.prototype.close = function() {
  if (this.ifr) {
    this.ifr.close();
  }
  this.removeAllListeners();
  this.ifr = null;
};

module.exports = InfoIframe;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/info-receiver.js":
/*!*********************************************************!*\
  !*** ./node_modules/sockjs-client/lib/info-receiver.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var EventEmitter = __webpack_require__(/*! events */ "./node_modules/sockjs-client/lib/event/emitter.js").EventEmitter
  , inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
  , urlUtils = __webpack_require__(/*! ./utils/url */ "./node_modules/sockjs-client/lib/utils/url.js")
  , XDR = __webpack_require__(/*! ./transport/sender/xdr */ "./node_modules/sockjs-client/lib/transport/sender/xdr.js")
  , XHRCors = __webpack_require__(/*! ./transport/sender/xhr-cors */ "./node_modules/sockjs-client/lib/transport/sender/xhr-cors.js")
  , XHRLocal = __webpack_require__(/*! ./transport/sender/xhr-local */ "./node_modules/sockjs-client/lib/transport/sender/xhr-local.js")
  , XHRFake = __webpack_require__(/*! ./transport/sender/xhr-fake */ "./node_modules/sockjs-client/lib/transport/sender/xhr-fake.js")
  , InfoIframe = __webpack_require__(/*! ./info-iframe */ "./node_modules/sockjs-client/lib/info-iframe.js")
  , InfoAjax = __webpack_require__(/*! ./info-ajax */ "./node_modules/sockjs-client/lib/info-ajax.js")
  ;

var debug = function() {};
if (true) {
  debug = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js")('sockjs-client:info-receiver');
}

function InfoReceiver(baseUrl, urlInfo) {
  debug(baseUrl);
  var self = this;
  EventEmitter.call(this);

  setTimeout(function() {
    self.doXhr(baseUrl, urlInfo);
  }, 0);
}

inherits(InfoReceiver, EventEmitter);

// TODO this is currently ignoring the list of available transports and the whitelist

InfoReceiver._getReceiver = function(baseUrl, url, urlInfo) {
  // determine method of CORS support (if needed)
  if (urlInfo.sameOrigin) {
    return new InfoAjax(url, XHRLocal);
  }
  if (XHRCors.enabled) {
    return new InfoAjax(url, XHRCors);
  }
  if (XDR.enabled && urlInfo.sameScheme) {
    return new InfoAjax(url, XDR);
  }
  if (InfoIframe.enabled()) {
    return new InfoIframe(baseUrl, url);
  }
  return new InfoAjax(url, XHRFake);
};

InfoReceiver.prototype.doXhr = function(baseUrl, urlInfo) {
  var self = this
    , url = urlUtils.addPath(baseUrl, '/info')
    ;
  debug('doXhr', url);

  this.xo = InfoReceiver._getReceiver(baseUrl, url, urlInfo);

  this.timeoutRef = setTimeout(function() {
    debug('timeout');
    self._cleanup(false);
    self.emit('finish');
  }, InfoReceiver.timeout);

  this.xo.once('finish', function(info, rtt) {
    debug('finish', info, rtt);
    self._cleanup(true);
    self.emit('finish', info, rtt);
  });
};

InfoReceiver.prototype._cleanup = function(wasClean) {
  debug('_cleanup');
  clearTimeout(this.timeoutRef);
  this.timeoutRef = null;
  if (!wasClean && this.xo) {
    this.xo.close();
  }
  this.xo = null;
};

InfoReceiver.prototype.close = function() {
  debug('close');
  this.removeAllListeners();
  this._cleanup(false);
};

InfoReceiver.timeout = 8000;

module.exports = InfoReceiver;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/location.js":
/*!****************************************************!*\
  !*** ./node_modules/sockjs-client/lib/location.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


module.exports = __webpack_require__.g.location || {
  origin: 'http://localhost:80'
, protocol: 'http:'
, host: 'localhost'
, port: 80
, href: 'http://localhost/'
, hash: ''
};


/***/ }),

/***/ "./node_modules/sockjs-client/lib/main.js":
/*!************************************************!*\
  !*** ./node_modules/sockjs-client/lib/main.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


__webpack_require__(/*! ./shims */ "./node_modules/sockjs-client/lib/shims.js");

var URL = __webpack_require__(/*! url-parse */ "./node_modules/url-parse/index.js")
  , inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
  , JSON3 = __webpack_require__(/*! json3 */ "./node_modules/json3/lib/json3.js")
  , random = __webpack_require__(/*! ./utils/random */ "./node_modules/sockjs-client/lib/utils/random.js")
  , escape = __webpack_require__(/*! ./utils/escape */ "./node_modules/sockjs-client/lib/utils/escape.js")
  , urlUtils = __webpack_require__(/*! ./utils/url */ "./node_modules/sockjs-client/lib/utils/url.js")
  , eventUtils = __webpack_require__(/*! ./utils/event */ "./node_modules/sockjs-client/lib/utils/event.js")
  , transport = __webpack_require__(/*! ./utils/transport */ "./node_modules/sockjs-client/lib/utils/transport.js")
  , objectUtils = __webpack_require__(/*! ./utils/object */ "./node_modules/sockjs-client/lib/utils/object.js")
  , browser = __webpack_require__(/*! ./utils/browser */ "./node_modules/sockjs-client/lib/utils/browser.js")
  , log = __webpack_require__(/*! ./utils/log */ "./node_modules/sockjs-client/lib/utils/log.js")
  , Event = __webpack_require__(/*! ./event/event */ "./node_modules/sockjs-client/lib/event/event.js")
  , EventTarget = __webpack_require__(/*! ./event/eventtarget */ "./node_modules/sockjs-client/lib/event/eventtarget.js")
  , loc = __webpack_require__(/*! ./location */ "./node_modules/sockjs-client/lib/location.js")
  , CloseEvent = __webpack_require__(/*! ./event/close */ "./node_modules/sockjs-client/lib/event/close.js")
  , TransportMessageEvent = __webpack_require__(/*! ./event/trans-message */ "./node_modules/sockjs-client/lib/event/trans-message.js")
  , InfoReceiver = __webpack_require__(/*! ./info-receiver */ "./node_modules/sockjs-client/lib/info-receiver.js")
  ;

var debug = function() {};
if (true) {
  debug = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js")('sockjs-client:main');
}

var transports;

// follow constructor steps defined at http://dev.w3.org/html5/websockets/#the-websocket-interface
function SockJS(url, protocols, options) {
  if (!(this instanceof SockJS)) {
    return new SockJS(url, protocols, options);
  }
  if (arguments.length < 1) {
    throw new TypeError("Failed to construct 'SockJS: 1 argument required, but only 0 present");
  }
  EventTarget.call(this);

  this.readyState = SockJS.CONNECTING;
  this.extensions = '';
  this.protocol = '';

  // non-standard extension
  options = options || {};
  if (options.protocols_whitelist) {
    log.warn("'protocols_whitelist' is DEPRECATED. Use 'transports' instead.");
  }
  this._transportsWhitelist = options.transports;
  this._transportOptions = options.transportOptions || {};
  this._timeout = options.timeout || 0;

  var sessionId = options.sessionId || 8;
  if (typeof sessionId === 'function') {
    this._generateSessionId = sessionId;
  } else if (typeof sessionId === 'number') {
    this._generateSessionId = function() {
      return random.string(sessionId);
    };
  } else {
    throw new TypeError('If sessionId is used in the options, it needs to be a number or a function.');
  }

  this._server = options.server || random.numberString(1000);

  // Step 1 of WS spec - parse and validate the url. Issue #8
  var parsedUrl = new URL(url);
  if (!parsedUrl.host || !parsedUrl.protocol) {
    throw new SyntaxError("The URL '" + url + "' is invalid");
  } else if (parsedUrl.hash) {
    throw new SyntaxError('The URL must not contain a fragment');
  } else if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new SyntaxError("The URL's scheme must be either 'http:' or 'https:'. '" + parsedUrl.protocol + "' is not allowed.");
  }

  var secure = parsedUrl.protocol === 'https:';
  // Step 2 - don't allow secure origin with an insecure protocol
  if (loc.protocol === 'https:' && !secure) {
    // exception is 127.0.0.0/8 and ::1 urls
    if (!urlUtils.isLoopbackAddr(parsedUrl.hostname)) {
      throw new Error('SecurityError: An insecure SockJS connection may not be initiated from a page loaded over HTTPS');
    }
  }

  // Step 3 - check port access - no need here
  // Step 4 - parse protocols argument
  if (!protocols) {
    protocols = [];
  } else if (!Array.isArray(protocols)) {
    protocols = [protocols];
  }

  // Step 5 - check protocols argument
  var sortedProtocols = protocols.sort();
  sortedProtocols.forEach(function(proto, i) {
    if (!proto) {
      throw new SyntaxError("The protocols entry '" + proto + "' is invalid.");
    }
    if (i < (sortedProtocols.length - 1) && proto === sortedProtocols[i + 1]) {
      throw new SyntaxError("The protocols entry '" + proto + "' is duplicated.");
    }
  });

  // Step 6 - convert origin
  var o = urlUtils.getOrigin(loc.href);
  this._origin = o ? o.toLowerCase() : null;

  // remove the trailing slash
  parsedUrl.set('pathname', parsedUrl.pathname.replace(/\/+$/, ''));

  // store the sanitized url
  this.url = parsedUrl.href;
  debug('using url', this.url);

  // Step 7 - start connection in background
  // obtain server info
  // http://sockjs.github.io/sockjs-protocol/sockjs-protocol-0.3.3.html#section-26
  this._urlInfo = {
    nullOrigin: !browser.hasDomain()
  , sameOrigin: urlUtils.isOriginEqual(this.url, loc.href)
  , sameScheme: urlUtils.isSchemeEqual(this.url, loc.href)
  };

  this._ir = new InfoReceiver(this.url, this._urlInfo);
  this._ir.once('finish', this._receiveInfo.bind(this));
}

inherits(SockJS, EventTarget);

function userSetCode(code) {
  return code === 1000 || (code >= 3000 && code <= 4999);
}

SockJS.prototype.close = function(code, reason) {
  // Step 1
  if (code && !userSetCode(code)) {
    throw new Error('InvalidAccessError: Invalid code');
  }
  // Step 2.4 states the max is 123 bytes, but we are just checking length
  if (reason && reason.length > 123) {
    throw new SyntaxError('reason argument has an invalid length');
  }

  // Step 3.1
  if (this.readyState === SockJS.CLOSING || this.readyState === SockJS.CLOSED) {
    return;
  }

  // TODO look at docs to determine how to set this
  var wasClean = true;
  this._close(code || 1000, reason || 'Normal closure', wasClean);
};

SockJS.prototype.send = function(data) {
  // #13 - convert anything non-string to string
  // TODO this currently turns objects into [object Object]
  if (typeof data !== 'string') {
    data = '' + data;
  }
  if (this.readyState === SockJS.CONNECTING) {
    throw new Error('InvalidStateError: The connection has not been established yet');
  }
  if (this.readyState !== SockJS.OPEN) {
    return;
  }
  this._transport.send(escape.quote(data));
};

SockJS.version = __webpack_require__(/*! ./version */ "./node_modules/sockjs-client/lib/version.js");

SockJS.CONNECTING = 0;
SockJS.OPEN = 1;
SockJS.CLOSING = 2;
SockJS.CLOSED = 3;

SockJS.prototype._receiveInfo = function(info, rtt) {
  debug('_receiveInfo', rtt);
  this._ir = null;
  if (!info) {
    this._close(1002, 'Cannot connect to server');
    return;
  }

  // establish a round-trip timeout (RTO) based on the
  // round-trip time (RTT)
  this._rto = this.countRTO(rtt);
  // allow server to override url used for the actual transport
  this._transUrl = info.base_url ? info.base_url : this.url;
  info = objectUtils.extend(info, this._urlInfo);
  debug('info', info);
  // determine list of desired and supported transports
  var enabledTransports = transports.filterToEnabled(this._transportsWhitelist, info);
  this._transports = enabledTransports.main;
  debug(this._transports.length + ' enabled transports');

  this._connect();
};

SockJS.prototype._connect = function() {
  for (var Transport = this._transports.shift(); Transport; Transport = this._transports.shift()) {
    debug('attempt', Transport.transportName);
    if (Transport.needBody) {
      if (!__webpack_require__.g.document.body ||
          (typeof __webpack_require__.g.document.readyState !== 'undefined' &&
            __webpack_require__.g.document.readyState !== 'complete' &&
            __webpack_require__.g.document.readyState !== 'interactive')) {
        debug('waiting for body');
        this._transports.unshift(Transport);
        eventUtils.attachEvent('load', this._connect.bind(this));
        return;
      }
    }

    // calculate timeout based on RTO and round trips. Default to 5s
    var timeoutMs = Math.max(this._timeout, (this._rto * Transport.roundTrips) || 5000);
    this._transportTimeoutId = setTimeout(this._transportTimeout.bind(this), timeoutMs);
    debug('using timeout', timeoutMs);

    var transportUrl = urlUtils.addPath(this._transUrl, '/' + this._server + '/' + this._generateSessionId());
    var options = this._transportOptions[Transport.transportName];
    debug('transport url', transportUrl);
    var transportObj = new Transport(transportUrl, this._transUrl, options);
    transportObj.on('message', this._transportMessage.bind(this));
    transportObj.once('close', this._transportClose.bind(this));
    transportObj.transportName = Transport.transportName;
    this._transport = transportObj;

    return;
  }
  this._close(2000, 'All transports failed', false);
};

SockJS.prototype._transportTimeout = function() {
  debug('_transportTimeout');
  if (this.readyState === SockJS.CONNECTING) {
    if (this._transport) {
      this._transport.close();
    }

    this._transportClose(2007, 'Transport timed out');
  }
};

SockJS.prototype._transportMessage = function(msg) {
  debug('_transportMessage', msg);
  var self = this
    , type = msg.slice(0, 1)
    , content = msg.slice(1)
    , payload
    ;

  // first check for messages that don't need a payload
  switch (type) {
    case 'o':
      this._open();
      return;
    case 'h':
      this.dispatchEvent(new Event('heartbeat'));
      debug('heartbeat', this.transport);
      return;
  }

  if (content) {
    try {
      payload = JSON3.parse(content);
    } catch (e) {
      debug('bad json', content);
    }
  }

  if (typeof payload === 'undefined') {
    debug('empty payload', content);
    return;
  }

  switch (type) {
    case 'a':
      if (Array.isArray(payload)) {
        payload.forEach(function(p) {
          debug('message', self.transport, p);
          self.dispatchEvent(new TransportMessageEvent(p));
        });
      }
      break;
    case 'm':
      debug('message', this.transport, payload);
      this.dispatchEvent(new TransportMessageEvent(payload));
      break;
    case 'c':
      if (Array.isArray(payload) && payload.length === 2) {
        this._close(payload[0], payload[1], true);
      }
      break;
  }
};

SockJS.prototype._transportClose = function(code, reason) {
  debug('_transportClose', this.transport, code, reason);
  if (this._transport) {
    this._transport.removeAllListeners();
    this._transport = null;
    this.transport = null;
  }

  if (!userSetCode(code) && code !== 2000 && this.readyState === SockJS.CONNECTING) {
    this._connect();
    return;
  }

  this._close(code, reason);
};

SockJS.prototype._open = function() {
  debug('_open', this._transport && this._transport.transportName, this.readyState);
  if (this.readyState === SockJS.CONNECTING) {
    if (this._transportTimeoutId) {
      clearTimeout(this._transportTimeoutId);
      this._transportTimeoutId = null;
    }
    this.readyState = SockJS.OPEN;
    this.transport = this._transport.transportName;
    this.dispatchEvent(new Event('open'));
    debug('connected', this.transport);
  } else {
    // The server might have been restarted, and lost track of our
    // connection.
    this._close(1006, 'Server lost session');
  }
};

SockJS.prototype._close = function(code, reason, wasClean) {
  debug('_close', this.transport, code, reason, wasClean, this.readyState);
  var forceFail = false;

  if (this._ir) {
    forceFail = true;
    this._ir.close();
    this._ir = null;
  }
  if (this._transport) {
    this._transport.close();
    this._transport = null;
    this.transport = null;
  }

  if (this.readyState === SockJS.CLOSED) {
    throw new Error('InvalidStateError: SockJS has already been closed');
  }

  this.readyState = SockJS.CLOSING;
  setTimeout(function() {
    this.readyState = SockJS.CLOSED;

    if (forceFail) {
      this.dispatchEvent(new Event('error'));
    }

    var e = new CloseEvent('close');
    e.wasClean = wasClean || false;
    e.code = code || 1000;
    e.reason = reason;

    this.dispatchEvent(e);
    this.onmessage = this.onclose = this.onerror = null;
    debug('disconnected');
  }.bind(this), 0);
};

// See: http://www.erg.abdn.ac.uk/~gerrit/dccp/notes/ccid2/rto_estimator/
// and RFC 2988.
SockJS.prototype.countRTO = function(rtt) {
  // In a local environment, when using IE8/9 and the `jsonp-polling`
  // transport the time needed to establish a connection (the time that pass
  // from the opening of the transport to the call of `_dispatchOpen`) is
  // around 200msec (the lower bound used in the article above) and this
  // causes spurious timeouts. For this reason we calculate a value slightly
  // larger than that used in the article.
  if (rtt > 100) {
    return 4 * rtt; // rto > 400msec
  }
  return 300 + rtt; // 300msec < rto <= 400msec
};

module.exports = function(availableTransports) {
  transports = transport(availableTransports);
  __webpack_require__(/*! ./iframe-bootstrap */ "./node_modules/sockjs-client/lib/iframe-bootstrap.js")(SockJS, availableTransports);
  return SockJS;
};


/***/ }),

/***/ "./node_modules/sockjs-client/lib/shims.js":
/*!*************************************************!*\
  !*** ./node_modules/sockjs-client/lib/shims.js ***!
  \*************************************************/
/***/ (() => {

"use strict";
/* eslint-disable */
/* jscs: disable */


// pulled specific shims from https://github.com/es-shims/es5-shim

var ArrayPrototype = Array.prototype;
var ObjectPrototype = Object.prototype;
var FunctionPrototype = Function.prototype;
var StringPrototype = String.prototype;
var array_slice = ArrayPrototype.slice;

var _toString = ObjectPrototype.toString;
var isFunction = function (val) {
    return ObjectPrototype.toString.call(val) === '[object Function]';
};
var isArray = function isArray(obj) {
    return _toString.call(obj) === '[object Array]';
};
var isString = function isString(obj) {
    return _toString.call(obj) === '[object String]';
};

var supportsDescriptors = Object.defineProperty && (function () {
    try {
        Object.defineProperty({}, 'x', {});
        return true;
    } catch (e) { /* this is ES3 */
        return false;
    }
}());

// Define configurable, writable and non-enumerable props
// if they don't exist.
var defineProperty;
if (supportsDescriptors) {
    defineProperty = function (object, name, method, forceAssign) {
        if (!forceAssign && (name in object)) { return; }
        Object.defineProperty(object, name, {
            configurable: true,
            enumerable: false,
            writable: true,
            value: method
        });
    };
} else {
    defineProperty = function (object, name, method, forceAssign) {
        if (!forceAssign && (name in object)) { return; }
        object[name] = method;
    };
}
var defineProperties = function (object, map, forceAssign) {
    for (var name in map) {
        if (ObjectPrototype.hasOwnProperty.call(map, name)) {
          defineProperty(object, name, map[name], forceAssign);
        }
    }
};

var toObject = function (o) {
    if (o == null) { // this matches both null and undefined
        throw new TypeError("can't convert " + o + ' to object');
    }
    return Object(o);
};

//
// Util
// ======
//

// ES5 9.4
// http://es5.github.com/#x9.4
// http://jsperf.com/to-integer

function toInteger(num) {
    var n = +num;
    if (n !== n) { // isNaN
        n = 0;
    } else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
    }
    return n;
}

function ToUint32(x) {
    return x >>> 0;
}

//
// Function
// ========
//

// ES-5 15.3.4.5
// http://es5.github.com/#x15.3.4.5

function Empty() {}

defineProperties(FunctionPrototype, {
    bind: function bind(that) { // .length is 1
        // 1. Let Target be the this value.
        var target = this;
        // 2. If IsCallable(Target) is false, throw a TypeError exception.
        if (!isFunction(target)) {
            throw new TypeError('Function.prototype.bind called on incompatible ' + target);
        }
        // 3. Let A be a new (possibly empty) internal list of all of the
        //   argument values provided after thisArg (arg1, arg2 etc), in order.
        // XXX slicedArgs will stand in for "A" if used
        var args = array_slice.call(arguments, 1); // for normal call
        // 4. Let F be a new native ECMAScript object.
        // 11. Set the [[Prototype]] internal property of F to the standard
        //   built-in Function prototype object as specified in 15.3.3.1.
        // 12. Set the [[Call]] internal property of F as described in
        //   15.3.4.5.1.
        // 13. Set the [[Construct]] internal property of F as described in
        //   15.3.4.5.2.
        // 14. Set the [[HasInstance]] internal property of F as described in
        //   15.3.4.5.3.
        var binder = function () {

            if (this instanceof bound) {
                // 15.3.4.5.2 [[Construct]]
                // When the [[Construct]] internal method of a function object,
                // F that was created using the bind function is called with a
                // list of arguments ExtraArgs, the following steps are taken:
                // 1. Let target be the value of F's [[TargetFunction]]
                //   internal property.
                // 2. If target has no [[Construct]] internal method, a
                //   TypeError exception is thrown.
                // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.
                // 5. Return the result of calling the [[Construct]] internal
                //   method of target providing args as the arguments.

                var result = target.apply(
                    this,
                    args.concat(array_slice.call(arguments))
                );
                if (Object(result) === result) {
                    return result;
                }
                return this;

            } else {
                // 15.3.4.5.1 [[Call]]
                // When the [[Call]] internal method of a function object, F,
                // which was created using the bind function is called with a
                // this value and a list of arguments ExtraArgs, the following
                // steps are taken:
                // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 2. Let boundThis be the value of F's [[BoundThis]] internal
                //   property.
                // 3. Let target be the value of F's [[TargetFunction]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.
                // 5. Return the result of calling the [[Call]] internal method
                //   of target providing boundThis as the this value and
                //   providing args as the arguments.

                // equiv: target.call(this, ...boundArgs, ...args)
                return target.apply(
                    that,
                    args.concat(array_slice.call(arguments))
                );

            }

        };

        // 15. If the [[Class]] internal property of Target is "Function", then
        //     a. Let L be the length property of Target minus the length of A.
        //     b. Set the length own property of F to either 0 or L, whichever is
        //       larger.
        // 16. Else set the length own property of F to 0.

        var boundLength = Math.max(0, target.length - args.length);

        // 17. Set the attributes of the length own property of F to the values
        //   specified in 15.3.5.1.
        var boundArgs = [];
        for (var i = 0; i < boundLength; i++) {
            boundArgs.push('$' + i);
        }

        // XXX Build a dynamic function with desired amount of arguments is the only
        // way to set the length property of a function.
        // In environments where Content Security Policies enabled (Chrome extensions,
        // for ex.) all use of eval or Function costructor throws an exception.
        // However in all of these environments Function.prototype.bind exists
        // and so this code will never be executed.
        var bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this, arguments); }')(binder);

        if (target.prototype) {
            Empty.prototype = target.prototype;
            bound.prototype = new Empty();
            // Clean up dangling references.
            Empty.prototype = null;
        }

        // TODO
        // 18. Set the [[Extensible]] internal property of F to true.

        // TODO
        // 19. Let thrower be the [[ThrowTypeError]] function Object (13.2.3).
        // 20. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "caller", PropertyDescriptor {[[Get]]: thrower, [[Set]]:
        //   thrower, [[Enumerable]]: false, [[Configurable]]: false}, and
        //   false.
        // 21. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "arguments", PropertyDescriptor {[[Get]]: thrower,
        //   [[Set]]: thrower, [[Enumerable]]: false, [[Configurable]]: false},
        //   and false.

        // TODO
        // NOTE Function objects created using Function.prototype.bind do not
        // have a prototype property or the [[Code]], [[FormalParameters]], and
        // [[Scope]] internal properties.
        // XXX can't delete prototype in pure-js.

        // 22. Return F.
        return bound;
    }
});

//
// Array
// =====
//

// ES5 15.4.3.2
// http://es5.github.com/#x15.4.3.2
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
defineProperties(Array, { isArray: isArray });


var boxedString = Object('a');
var splitString = boxedString[0] !== 'a' || !(0 in boxedString);

var properlyBoxesContext = function properlyBoxed(method) {
    // Check node 0.6.21 bug where third parameter is not boxed
    var properlyBoxesNonStrict = true;
    var properlyBoxesStrict = true;
    if (method) {
        method.call('foo', function (_, __, context) {
            if (typeof context !== 'object') { properlyBoxesNonStrict = false; }
        });

        method.call([1], function () {
            'use strict';
            properlyBoxesStrict = typeof this === 'string';
        }, 'x');
    }
    return !!method && properlyBoxesNonStrict && properlyBoxesStrict;
};

defineProperties(ArrayPrototype, {
    forEach: function forEach(fun /*, thisp*/) {
        var object = toObject(this),
            self = splitString && isString(this) ? this.split('') : object,
            thisp = arguments[1],
            i = -1,
            length = self.length >>> 0;

        // If no callback function or if callback is not a callable function
        if (!isFunction(fun)) {
            throw new TypeError(); // TODO message
        }

        while (++i < length) {
            if (i in self) {
                // Invoke the callback function with call, passing arguments:
                // context, property value, property key, thisArg object
                // context
                fun.call(thisp, self[i], i, object);
            }
        }
    }
}, !properlyBoxesContext(ArrayPrototype.forEach));

// ES5 15.4.4.14
// http://es5.github.com/#x15.4.4.14
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
var hasFirefox2IndexOfBug = Array.prototype.indexOf && [0, 1].indexOf(1, 2) !== -1;
defineProperties(ArrayPrototype, {
    indexOf: function indexOf(sought /*, fromIndex */ ) {
        var self = splitString && isString(this) ? this.split('') : toObject(this),
            length = self.length >>> 0;

        if (!length) {
            return -1;
        }

        var i = 0;
        if (arguments.length > 1) {
            i = toInteger(arguments[1]);
        }

        // handle negative indices
        i = i >= 0 ? i : Math.max(0, length + i);
        for (; i < length; i++) {
            if (i in self && self[i] === sought) {
                return i;
            }
        }
        return -1;
    }
}, hasFirefox2IndexOfBug);

//
// String
// ======
//

// ES5 15.5.4.14
// http://es5.github.com/#x15.5.4.14

// [bugfix, IE lt 9, firefox 4, Konqueror, Opera, obscure browsers]
// Many browsers do not split properly with regular expressions or they
// do not perform the split correctly under obscure conditions.
// See http://blog.stevenlevithan.com/archives/cross-browser-split
// I've tested in many browsers and this seems to cover the deviant ones:
//    'ab'.split(/(?:ab)*/) should be ["", ""], not [""]
//    '.'.split(/(.?)(.?)/) should be ["", ".", "", ""], not ["", ""]
//    'tesst'.split(/(s)*/) should be ["t", undefined, "e", "s", "t"], not
//       [undefined, "t", undefined, "e", ...]
//    ''.split(/.?/) should be [], not [""]
//    '.'.split(/()()/) should be ["."], not ["", "", "."]

var string_split = StringPrototype.split;
if (
    'ab'.split(/(?:ab)*/).length !== 2 ||
    '.'.split(/(.?)(.?)/).length !== 4 ||
    'tesst'.split(/(s)*/)[1] === 't' ||
    'test'.split(/(?:)/, -1).length !== 4 ||
    ''.split(/.?/).length ||
    '.'.split(/()()/).length > 1
) {
    (function () {
        var compliantExecNpcg = /()??/.exec('')[1] === void 0; // NPCG: nonparticipating capturing group

        StringPrototype.split = function (separator, limit) {
            var string = this;
            if (separator === void 0 && limit === 0) {
                return [];
            }

            // If `separator` is not a regex, use native split
            if (_toString.call(separator) !== '[object RegExp]') {
                return string_split.call(this, separator, limit);
            }

            var output = [],
                flags = (separator.ignoreCase ? 'i' : '') +
                        (separator.multiline  ? 'm' : '') +
                        (separator.extended   ? 'x' : '') + // Proposed for ES6
                        (separator.sticky     ? 'y' : ''), // Firefox 3+
                lastLastIndex = 0,
                // Make `global` and avoid `lastIndex` issues by working with a copy
                separator2, match, lastIndex, lastLength;
            separator = new RegExp(separator.source, flags + 'g');
            string += ''; // Type-convert
            if (!compliantExecNpcg) {
                // Doesn't need flags gy, but they don't hurt
                separator2 = new RegExp('^' + separator.source + '$(?!\\s)', flags);
            }
            /* Values for `limit`, per the spec:
             * If undefined: 4294967295 // Math.pow(2, 32) - 1
             * If 0, Infinity, or NaN: 0
             * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
             * If negative number: 4294967296 - Math.floor(Math.abs(limit))
             * If other: Type-convert, then use the above rules
             */
            limit = limit === void 0 ?
                -1 >>> 0 : // Math.pow(2, 32) - 1
                ToUint32(limit);
            while (match = separator.exec(string)) {
                // `separator.lastIndex` is not reliable cross-browser
                lastIndex = match.index + match[0].length;
                if (lastIndex > lastLastIndex) {
                    output.push(string.slice(lastLastIndex, match.index));
                    // Fix browsers whose `exec` methods don't consistently return `undefined` for
                    // nonparticipating capturing groups
                    if (!compliantExecNpcg && match.length > 1) {
                        match[0].replace(separator2, function () {
                            for (var i = 1; i < arguments.length - 2; i++) {
                                if (arguments[i] === void 0) {
                                    match[i] = void 0;
                                }
                            }
                        });
                    }
                    if (match.length > 1 && match.index < string.length) {
                        ArrayPrototype.push.apply(output, match.slice(1));
                    }
                    lastLength = match[0].length;
                    lastLastIndex = lastIndex;
                    if (output.length >= limit) {
                        break;
                    }
                }
                if (separator.lastIndex === match.index) {
                    separator.lastIndex++; // Avoid an infinite loop
                }
            }
            if (lastLastIndex === string.length) {
                if (lastLength || !separator.test('')) {
                    output.push('');
                }
            } else {
                output.push(string.slice(lastLastIndex));
            }
            return output.length > limit ? output.slice(0, limit) : output;
        };
    }());

// [bugfix, chrome]
// If separator is undefined, then the result array contains just one String,
// which is the this value (converted to a String). If limit is not undefined,
// then the output array is truncated so that it contains no more than limit
// elements.
// "0".split(undefined, 0) -> []
} else if ('0'.split(void 0, 0).length) {
    StringPrototype.split = function split(separator, limit) {
        if (separator === void 0 && limit === 0) { return []; }
        return string_split.call(this, separator, limit);
    };
}

// ECMA-262, 3rd B.2.3
// Not an ECMAScript standard, although ECMAScript 3rd Edition has a
// non-normative section suggesting uniform semantics and it should be
// normalized across all browsers
// [bugfix, IE lt 9] IE < 9 substr() with negative value not working in IE
var string_substr = StringPrototype.substr;
var hasNegativeSubstrBug = ''.substr && '0b'.substr(-1) !== 'b';
defineProperties(StringPrototype, {
    substr: function substr(start, length) {
        return string_substr.call(
            this,
            start < 0 ? ((start = this.length + start) < 0 ? 0 : start) : start,
            length
        );
    }
}, hasNegativeSubstrBug);


/***/ }),

/***/ "./node_modules/sockjs-client/lib/transport-list.js":
/*!**********************************************************!*\
  !*** ./node_modules/sockjs-client/lib/transport-list.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


module.exports = [
  // streaming transports
  __webpack_require__(/*! ./transport/websocket */ "./node_modules/sockjs-client/lib/transport/websocket.js")
, __webpack_require__(/*! ./transport/xhr-streaming */ "./node_modules/sockjs-client/lib/transport/xhr-streaming.js")
, __webpack_require__(/*! ./transport/xdr-streaming */ "./node_modules/sockjs-client/lib/transport/xdr-streaming.js")
, __webpack_require__(/*! ./transport/eventsource */ "./node_modules/sockjs-client/lib/transport/eventsource.js")
, __webpack_require__(/*! ./transport/lib/iframe-wrap */ "./node_modules/sockjs-client/lib/transport/lib/iframe-wrap.js")(__webpack_require__(/*! ./transport/eventsource */ "./node_modules/sockjs-client/lib/transport/eventsource.js"))

  // polling transports
, __webpack_require__(/*! ./transport/htmlfile */ "./node_modules/sockjs-client/lib/transport/htmlfile.js")
, __webpack_require__(/*! ./transport/lib/iframe-wrap */ "./node_modules/sockjs-client/lib/transport/lib/iframe-wrap.js")(__webpack_require__(/*! ./transport/htmlfile */ "./node_modules/sockjs-client/lib/transport/htmlfile.js"))
, __webpack_require__(/*! ./transport/xhr-polling */ "./node_modules/sockjs-client/lib/transport/xhr-polling.js")
, __webpack_require__(/*! ./transport/xdr-polling */ "./node_modules/sockjs-client/lib/transport/xdr-polling.js")
, __webpack_require__(/*! ./transport/lib/iframe-wrap */ "./node_modules/sockjs-client/lib/transport/lib/iframe-wrap.js")(__webpack_require__(/*! ./transport/xhr-polling */ "./node_modules/sockjs-client/lib/transport/xhr-polling.js"))
, __webpack_require__(/*! ./transport/jsonp-polling */ "./node_modules/sockjs-client/lib/transport/jsonp-polling.js")
];


/***/ }),

/***/ "./node_modules/sockjs-client/lib/transport/browser/abstract-xhr.js":
/*!**************************************************************************!*\
  !*** ./node_modules/sockjs-client/lib/transport/browser/abstract-xhr.js ***!
  \**************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var EventEmitter = __webpack_require__(/*! events */ "./node_modules/sockjs-client/lib/event/emitter.js").EventEmitter
  , inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
  , utils = __webpack_require__(/*! ../../utils/event */ "./node_modules/sockjs-client/lib/utils/event.js")
  , urlUtils = __webpack_require__(/*! ../../utils/url */ "./node_modules/sockjs-client/lib/utils/url.js")
  , XHR = __webpack_require__.g.XMLHttpRequest
  ;

var debug = function() {};
if (true) {
  debug = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js")('sockjs-client:browser:xhr');
}

function AbstractXHRObject(method, url, payload, opts) {
  debug(method, url);
  var self = this;
  EventEmitter.call(this);

  setTimeout(function () {
    self._start(method, url, payload, opts);
  }, 0);
}

inherits(AbstractXHRObject, EventEmitter);

AbstractXHRObject.prototype._start = function(method, url, payload, opts) {
  var self = this;

  try {
    this.xhr = new XHR();
  } catch (x) {
    // intentionally empty
  }

  if (!this.xhr) {
    debug('no xhr');
    this.emit('finish', 0, 'no xhr support');
    this._cleanup();
    return;
  }

  // several browsers cache POSTs
  url = urlUtils.addQuery(url, 't=' + (+new Date()));

  // Explorer tends to keep connection open, even after the
  // tab gets closed: http://bugs.jquery.com/ticket/5280
  this.unloadRef = utils.unloadAdd(function() {
    debug('unload cleanup');
    self._cleanup(true);
  });
  try {
    this.xhr.open(method, url, true);
    if (this.timeout && 'timeout' in this.xhr) {
      this.xhr.timeout = this.timeout;
      this.xhr.ontimeout = function() {
        debug('xhr timeout');
        self.emit('finish', 0, '');
        self._cleanup(false);
      };
    }
  } catch (e) {
    debug('exception', e);
    // IE raises an exception on wrong port.
    this.emit('finish', 0, '');
    this._cleanup(false);
    return;
  }

  if ((!opts || !opts.noCredentials) && AbstractXHRObject.supportsCORS) {
    debug('withCredentials');
    // Mozilla docs says https://developer.mozilla.org/en/XMLHttpRequest :
    // "This never affects same-site requests."

    this.xhr.withCredentials = true;
  }
  if (opts && opts.headers) {
    for (var key in opts.headers) {
      this.xhr.setRequestHeader(key, opts.headers[key]);
    }
  }

  this.xhr.onreadystatechange = function() {
    if (self.xhr) {
      var x = self.xhr;
      var text, status;
      debug('readyState', x.readyState);
      switch (x.readyState) {
      case 3:
        // IE doesn't like peeking into responseText or status
        // on Microsoft.XMLHTTP and readystate=3
        try {
          status = x.status;
          text = x.responseText;
        } catch (e) {
          // intentionally empty
        }
        debug('status', status);
        // IE returns 1223 for 204: http://bugs.jquery.com/ticket/1450
        if (status === 1223) {
          status = 204;
        }

        // IE does return readystate == 3 for 404 answers.
        if (status === 200 && text && text.length > 0) {
          debug('chunk');
          self.emit('chunk', status, text);
        }
        break;
      case 4:
        status = x.status;
        debug('status', status);
        // IE returns 1223 for 204: http://bugs.jquery.com/ticket/1450
        if (status === 1223) {
          status = 204;
        }
        // IE returns this for a bad port
        // http://msdn.microsoft.com/en-us/library/windows/desktop/aa383770(v=vs.85).aspx
        if (status === 12005 || status === 12029) {
          status = 0;
        }

        debug('finish', status, x.responseText);
        self.emit('finish', status, x.responseText);
        self._cleanup(false);
        break;
      }
    }
  };

  try {
    self.xhr.send(payload);
  } catch (e) {
    self.emit('finish', 0, '');
    self._cleanup(false);
  }
};

AbstractXHRObject.prototype._cleanup = function(abort) {
  debug('cleanup');
  if (!this.xhr) {
    return;
  }
  this.removeAllListeners();
  utils.unloadDel(this.unloadRef);

  // IE needs this field to be a function
  this.xhr.onreadystatechange = function() {};
  if (this.xhr.ontimeout) {
    this.xhr.ontimeout = null;
  }

  if (abort) {
    try {
      this.xhr.abort();
    } catch (x) {
      // intentionally empty
    }
  }
  this.unloadRef = this.xhr = null;
};

AbstractXHRObject.prototype.close = function() {
  debug('close');
  this._cleanup(true);
};

AbstractXHRObject.enabled = !!XHR;
// override XMLHttpRequest for IE6/7
// obfuscate to avoid firewalls
var axo = ['Active'].concat('Object').join('X');
if (!AbstractXHRObject.enabled && (axo in __webpack_require__.g)) {
  debug('overriding xmlhttprequest');
  XHR = function() {
    try {
      return new __webpack_require__.g[axo]('Microsoft.XMLHTTP');
    } catch (e) {
      return null;
    }
  };
  AbstractXHRObject.enabled = !!new XHR();
}

var cors = false;
try {
  cors = 'withCredentials' in new XHR();
} catch (ignored) {
  // intentionally empty
}

AbstractXHRObject.supportsCORS = cors;

module.exports = AbstractXHRObject;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/transport/browser/eventsource.js":
/*!*************************************************************************!*\
  !*** ./node_modules/sockjs-client/lib/transport/browser/eventsource.js ***!
  \*************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.g.EventSource;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/transport/browser/websocket.js":
/*!***********************************************************************!*\
  !*** ./node_modules/sockjs-client/lib/transport/browser/websocket.js ***!
  \***********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Driver = __webpack_require__.g.WebSocket || __webpack_require__.g.MozWebSocket;
if (Driver) {
	module.exports = function WebSocketBrowserDriver(url) {
		return new Driver(url);
	};
} else {
	module.exports = undefined;
}


/***/ }),

/***/ "./node_modules/sockjs-client/lib/transport/eventsource.js":
/*!*****************************************************************!*\
  !*** ./node_modules/sockjs-client/lib/transport/eventsource.js ***!
  \*****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
  , AjaxBasedTransport = __webpack_require__(/*! ./lib/ajax-based */ "./node_modules/sockjs-client/lib/transport/lib/ajax-based.js")
  , EventSourceReceiver = __webpack_require__(/*! ./receiver/eventsource */ "./node_modules/sockjs-client/lib/transport/receiver/eventsource.js")
  , XHRCorsObject = __webpack_require__(/*! ./sender/xhr-cors */ "./node_modules/sockjs-client/lib/transport/sender/xhr-cors.js")
  , EventSourceDriver = __webpack_require__(/*! eventsource */ "./node_modules/sockjs-client/lib/transport/browser/eventsource.js")
  ;

function EventSourceTransport(transUrl) {
  if (!EventSourceTransport.enabled()) {
    throw new Error('Transport created when disabled');
  }

  AjaxBasedTransport.call(this, transUrl, '/eventsource', EventSourceReceiver, XHRCorsObject);
}

inherits(EventSourceTransport, AjaxBasedTransport);

EventSourceTransport.enabled = function() {
  return !!EventSourceDriver;
};

EventSourceTransport.transportName = 'eventsource';
EventSourceTransport.roundTrips = 2;

module.exports = EventSourceTransport;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/transport/htmlfile.js":
/*!**************************************************************!*\
  !*** ./node_modules/sockjs-client/lib/transport/htmlfile.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
  , HtmlfileReceiver = __webpack_require__(/*! ./receiver/htmlfile */ "./node_modules/sockjs-client/lib/transport/receiver/htmlfile.js")
  , XHRLocalObject = __webpack_require__(/*! ./sender/xhr-local */ "./node_modules/sockjs-client/lib/transport/sender/xhr-local.js")
  , AjaxBasedTransport = __webpack_require__(/*! ./lib/ajax-based */ "./node_modules/sockjs-client/lib/transport/lib/ajax-based.js")
  ;

function HtmlFileTransport(transUrl) {
  if (!HtmlfileReceiver.enabled) {
    throw new Error('Transport created when disabled');
  }
  AjaxBasedTransport.call(this, transUrl, '/htmlfile', HtmlfileReceiver, XHRLocalObject);
}

inherits(HtmlFileTransport, AjaxBasedTransport);

HtmlFileTransport.enabled = function(info) {
  return HtmlfileReceiver.enabled && info.sameOrigin;
};

HtmlFileTransport.transportName = 'htmlfile';
HtmlFileTransport.roundTrips = 2;

module.exports = HtmlFileTransport;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/transport/iframe.js":
/*!************************************************************!*\
  !*** ./node_modules/sockjs-client/lib/transport/iframe.js ***!
  \************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


// Few cool transports do work only for same-origin. In order to make
// them work cross-domain we shall use iframe, served from the
// remote domain. New browsers have capabilities to communicate with
// cross domain iframe using postMessage(). In IE it was implemented
// from IE 8+, but of course, IE got some details wrong:
//    http://msdn.microsoft.com/en-us/library/cc197015(v=VS.85).aspx
//    http://stevesouders.com/misc/test-postmessage.php

var inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
  , JSON3 = __webpack_require__(/*! json3 */ "./node_modules/json3/lib/json3.js")
  , EventEmitter = __webpack_require__(/*! events */ "./node_modules/sockjs-client/lib/event/emitter.js").EventEmitter
  , version = __webpack_require__(/*! ../version */ "./node_modules/sockjs-client/lib/version.js")
  , urlUtils = __webpack_require__(/*! ../utils/url */ "./node_modules/sockjs-client/lib/utils/url.js")
  , iframeUtils = __webpack_require__(/*! ../utils/iframe */ "./node_modules/sockjs-client/lib/utils/iframe.js")
  , eventUtils = __webpack_require__(/*! ../utils/event */ "./node_modules/sockjs-client/lib/utils/event.js")
  , random = __webpack_require__(/*! ../utils/random */ "./node_modules/sockjs-client/lib/utils/random.js")
  ;

var debug = function() {};
if (true) {
  debug = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js")('sockjs-client:transport:iframe');
}

function IframeTransport(transport, transUrl, baseUrl) {
  if (!IframeTransport.enabled()) {
    throw new Error('Transport created when disabled');
  }
  EventEmitter.call(this);

  var self = this;
  this.origin = urlUtils.getOrigin(baseUrl);
  this.baseUrl = baseUrl;
  this.transUrl = transUrl;
  this.transport = transport;
  this.windowId = random.string(8);

  var iframeUrl = urlUtils.addPath(baseUrl, '/iframe.html') + '#' + this.windowId;
  debug(transport, transUrl, iframeUrl);

  this.iframeObj = iframeUtils.createIframe(iframeUrl, function(r) {
    debug('err callback');
    self.emit('close', 1006, 'Unable to load an iframe (' + r + ')');
    self.close();
  });

  this.onmessageCallback = this._message.bind(this);
  eventUtils.attachEvent('message', this.onmessageCallback);
}

inherits(IframeTransport, EventEmitter);

IframeTransport.prototype.close = function() {
  debug('close');
  this.removeAllListeners();
  if (this.iframeObj) {
    eventUtils.detachEvent('message', this.onmessageCallback);
    try {
      // When the iframe is not loaded, IE raises an exception
      // on 'contentWindow'.
      this.postMessage('c');
    } catch (x) {
      // intentionally empty
    }
    this.iframeObj.cleanup();
    this.iframeObj = null;
    this.onmessageCallback = this.iframeObj = null;
  }
};

IframeTransport.prototype._message = function(e) {
  debug('message', e.data);
  if (!urlUtils.isOriginEqual(e.origin, this.origin)) {
    debug('not same origin', e.origin, this.origin);
    return;
  }

  var iframeMessage;
  try {
    iframeMessage = JSON3.parse(e.data);
  } catch (ignored) {
    debug('bad json', e.data);
    return;
  }

  if (iframeMessage.windowId !== this.windowId) {
    debug('mismatched window id', iframeMessage.windowId, this.windowId);
    return;
  }

  switch (iframeMessage.type) {
  case 's':
    this.iframeObj.loaded();
    // window global dependency
    this.postMessage('s', JSON3.stringify([
      version
    , this.transport
    , this.transUrl
    , this.baseUrl
    ]));
    break;
  case 't':
    this.emit('message', iframeMessage.data);
    break;
  case 'c':
    var cdata;
    try {
      cdata = JSON3.parse(iframeMessage.data);
    } catch (ignored) {
      debug('bad json', iframeMessage.data);
      return;
    }
    this.emit('close', cdata[0], cdata[1]);
    this.close();
    break;
  }
};

IframeTransport.prototype.postMessage = function(type, data) {
  debug('postMessage', type, data);
  this.iframeObj.post(JSON3.stringify({
    windowId: this.windowId
  , type: type
  , data: data || ''
  }), this.origin);
};

IframeTransport.prototype.send = function(message) {
  debug('send', message);
  this.postMessage('m', message);
};

IframeTransport.enabled = function() {
  return iframeUtils.iframeEnabled;
};

IframeTransport.transportName = 'iframe';
IframeTransport.roundTrips = 2;

module.exports = IframeTransport;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/transport/jsonp-polling.js":
/*!*******************************************************************!*\
  !*** ./node_modules/sockjs-client/lib/transport/jsonp-polling.js ***!
  \*******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


// The simplest and most robust transport, using the well-know cross
// domain hack - JSONP. This transport is quite inefficient - one
// message could use up to one http request. But at least it works almost
// everywhere.
// Known limitations:
//   o you will get a spinning cursor
//   o for Konqueror a dumb timer is needed to detect errors

var inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
  , SenderReceiver = __webpack_require__(/*! ./lib/sender-receiver */ "./node_modules/sockjs-client/lib/transport/lib/sender-receiver.js")
  , JsonpReceiver = __webpack_require__(/*! ./receiver/jsonp */ "./node_modules/sockjs-client/lib/transport/receiver/jsonp.js")
  , jsonpSender = __webpack_require__(/*! ./sender/jsonp */ "./node_modules/sockjs-client/lib/transport/sender/jsonp.js")
  ;

function JsonPTransport(transUrl) {
  if (!JsonPTransport.enabled()) {
    throw new Error('Transport created when disabled');
  }
  SenderReceiver.call(this, transUrl, '/jsonp', jsonpSender, JsonpReceiver);
}

inherits(JsonPTransport, SenderReceiver);

JsonPTransport.enabled = function() {
  return !!__webpack_require__.g.document;
};

JsonPTransport.transportName = 'jsonp-polling';
JsonPTransport.roundTrips = 1;
JsonPTransport.needBody = true;

module.exports = JsonPTransport;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/transport/lib/ajax-based.js":
/*!********************************************************************!*\
  !*** ./node_modules/sockjs-client/lib/transport/lib/ajax-based.js ***!
  \********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
  , urlUtils = __webpack_require__(/*! ../../utils/url */ "./node_modules/sockjs-client/lib/utils/url.js")
  , SenderReceiver = __webpack_require__(/*! ./sender-receiver */ "./node_modules/sockjs-client/lib/transport/lib/sender-receiver.js")
  ;

var debug = function() {};
if (true) {
  debug = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js")('sockjs-client:ajax-based');
}

function createAjaxSender(AjaxObject) {
  return function(url, payload, callback) {
    debug('create ajax sender', url, payload);
    var opt = {};
    if (typeof payload === 'string') {
      opt.headers = {'Content-type': 'text/plain'};
    }
    var ajaxUrl = urlUtils.addPath(url, '/xhr_send');
    var xo = new AjaxObject('POST', ajaxUrl, payload, opt);
    xo.once('finish', function(status) {
      debug('finish', status);
      xo = null;

      if (status !== 200 && status !== 204) {
        return callback(new Error('http status ' + status));
      }
      callback();
    });
    return function() {
      debug('abort');
      xo.close();
      xo = null;

      var err = new Error('Aborted');
      err.code = 1000;
      callback(err);
    };
  };
}

function AjaxBasedTransport(transUrl, urlSuffix, Receiver, AjaxObject) {
  SenderReceiver.call(this, transUrl, urlSuffix, createAjaxSender(AjaxObject), Receiver, AjaxObject);
}

inherits(AjaxBasedTransport, SenderReceiver);

module.exports = AjaxBasedTransport;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/transport/lib/buffered-sender.js":
/*!*************************************************************************!*\
  !*** ./node_modules/sockjs-client/lib/transport/lib/buffered-sender.js ***!
  \*************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
  , EventEmitter = __webpack_require__(/*! events */ "./node_modules/sockjs-client/lib/event/emitter.js").EventEmitter
  ;

var debug = function() {};
if (true) {
  debug = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js")('sockjs-client:buffered-sender');
}

function BufferedSender(url, sender) {
  debug(url);
  EventEmitter.call(this);
  this.sendBuffer = [];
  this.sender = sender;
  this.url = url;
}

inherits(BufferedSender, EventEmitter);

BufferedSender.prototype.send = function(message) {
  debug('send', message);
  this.sendBuffer.push(message);
  if (!this.sendStop) {
    this.sendSchedule();
  }
};

// For polling transports in a situation when in the message callback,
// new message is being send. If the sending connection was started
// before receiving one, it is possible to saturate the network and
// timeout due to the lack of receiving socket. To avoid that we delay
// sending messages by some small time, in order to let receiving
// connection be started beforehand. This is only a halfmeasure and
// does not fix the big problem, but it does make the tests go more
// stable on slow networks.
BufferedSender.prototype.sendScheduleWait = function() {
  debug('sendScheduleWait');
  var self = this;
  var tref;
  this.sendStop = function() {
    debug('sendStop');
    self.sendStop = null;
    clearTimeout(tref);
  };
  tref = setTimeout(function() {
    debug('timeout');
    self.sendStop = null;
    self.sendSchedule();
  }, 25);
};

BufferedSender.prototype.sendSchedule = function() {
  debug('sendSchedule', this.sendBuffer.length);
  var self = this;
  if (this.sendBuffer.length > 0) {
    var payload = '[' + this.sendBuffer.join(',') + ']';
    this.sendStop = this.sender(this.url, payload, function(err) {
      self.sendStop = null;
      if (err) {
        debug('error', err);
        self.emit('close', err.code || 1006, 'Sending error: ' + err);
        self.close();
      } else {
        self.sendScheduleWait();
      }
    });
    this.sendBuffer = [];
  }
};

BufferedSender.prototype._cleanup = function() {
  debug('_cleanup');
  this.removeAllListeners();
};

BufferedSender.prototype.close = function() {
  debug('close');
  this._cleanup();
  if (this.sendStop) {
    this.sendStop();
    this.sendStop = null;
  }
};

module.exports = BufferedSender;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/transport/lib/iframe-wrap.js":
/*!*********************************************************************!*\
  !*** ./node_modules/sockjs-client/lib/transport/lib/iframe-wrap.js ***!
  \*********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
  , IframeTransport = __webpack_require__(/*! ../iframe */ "./node_modules/sockjs-client/lib/transport/iframe.js")
  , objectUtils = __webpack_require__(/*! ../../utils/object */ "./node_modules/sockjs-client/lib/utils/object.js")
  ;

module.exports = function(transport) {

  function IframeWrapTransport(transUrl, baseUrl) {
    IframeTransport.call(this, transport.transportName, transUrl, baseUrl);
  }

  inherits(IframeWrapTransport, IframeTransport);

  IframeWrapTransport.enabled = function(url, info) {
    if (!__webpack_require__.g.document) {
      return false;
    }

    var iframeInfo = objectUtils.extend({}, info);
    iframeInfo.sameOrigin = true;
    return transport.enabled(iframeInfo) && IframeTransport.enabled();
  };

  IframeWrapTransport.transportName = 'iframe-' + transport.transportName;
  IframeWrapTransport.needBody = true;
  IframeWrapTransport.roundTrips = IframeTransport.roundTrips + transport.roundTrips - 1; // html, javascript (2) + transport - no CORS (1)

  IframeWrapTransport.facadeTransport = transport;

  return IframeWrapTransport;
};


/***/ }),

/***/ "./node_modules/sockjs-client/lib/transport/lib/polling.js":
/*!*****************************************************************!*\
  !*** ./node_modules/sockjs-client/lib/transport/lib/polling.js ***!
  \*****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
  , EventEmitter = __webpack_require__(/*! events */ "./node_modules/sockjs-client/lib/event/emitter.js").EventEmitter
  ;

var debug = function() {};
if (true) {
  debug = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js")('sockjs-client:polling');
}

function Polling(Receiver, receiveUrl, AjaxObject) {
  debug(receiveUrl);
  EventEmitter.call(this);
  this.Receiver = Receiver;
  this.receiveUrl = receiveUrl;
  this.AjaxObject = AjaxObject;
  this._scheduleReceiver();
}

inherits(Polling, EventEmitter);

Polling.prototype._scheduleReceiver = function() {
  debug('_scheduleReceiver');
  var self = this;
  var poll = this.poll = new this.Receiver(this.receiveUrl, this.AjaxObject);

  poll.on('message', function(msg) {
    debug('message', msg);
    self.emit('message', msg);
  });

  poll.once('close', function(code, reason) {
    debug('close', code, reason, self.pollIsClosing);
    self.poll = poll = null;

    if (!self.pollIsClosing) {
      if (reason === 'network') {
        self._scheduleReceiver();
      } else {
        self.emit('close', code || 1006, reason);
        self.removeAllListeners();
      }
    }
  });
};

Polling.prototype.abort = function() {
  debug('abort');
  this.removeAllListeners();
  this.pollIsClosing = true;
  if (this.poll) {
    this.poll.abort();
  }
};

module.exports = Polling;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/transport/lib/sender-receiver.js":
/*!*************************************************************************!*\
  !*** ./node_modules/sockjs-client/lib/transport/lib/sender-receiver.js ***!
  \*************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
  , urlUtils = __webpack_require__(/*! ../../utils/url */ "./node_modules/sockjs-client/lib/utils/url.js")
  , BufferedSender = __webpack_require__(/*! ./buffered-sender */ "./node_modules/sockjs-client/lib/transport/lib/buffered-sender.js")
  , Polling = __webpack_require__(/*! ./polling */ "./node_modules/sockjs-client/lib/transport/lib/polling.js")
  ;

var debug = function() {};
if (true) {
  debug = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js")('sockjs-client:sender-receiver');
}

function SenderReceiver(transUrl, urlSuffix, senderFunc, Receiver, AjaxObject) {
  var pollUrl = urlUtils.addPath(transUrl, urlSuffix);
  debug(pollUrl);
  var self = this;
  BufferedSender.call(this, transUrl, senderFunc);

  this.poll = new Polling(Receiver, pollUrl, AjaxObject);
  this.poll.on('message', function(msg) {
    debug('poll message', msg);
    self.emit('message', msg);
  });
  this.poll.once('close', function(code, reason) {
    debug('poll close', code, reason);
    self.poll = null;
    self.emit('close', code, reason);
    self.close();
  });
}

inherits(SenderReceiver, BufferedSender);

SenderReceiver.prototype.close = function() {
  BufferedSender.prototype.close.call(this);
  debug('close');
  this.removeAllListeners();
  if (this.poll) {
    this.poll.abort();
    this.poll = null;
  }
};

module.exports = SenderReceiver;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/transport/receiver/eventsource.js":
/*!**************************************************************************!*\
  !*** ./node_modules/sockjs-client/lib/transport/receiver/eventsource.js ***!
  \**************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
  , EventEmitter = __webpack_require__(/*! events */ "./node_modules/sockjs-client/lib/event/emitter.js").EventEmitter
  , EventSourceDriver = __webpack_require__(/*! eventsource */ "./node_modules/sockjs-client/lib/transport/browser/eventsource.js")
  ;

var debug = function() {};
if (true) {
  debug = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js")('sockjs-client:receiver:eventsource');
}

function EventSourceReceiver(url) {
  debug(url);
  EventEmitter.call(this);

  var self = this;
  var es = this.es = new EventSourceDriver(url);
  es.onmessage = function(e) {
    debug('message', e.data);
    self.emit('message', decodeURI(e.data));
  };
  es.onerror = function(e) {
    debug('error', es.readyState, e);
    // ES on reconnection has readyState = 0 or 1.
    // on network error it's CLOSED = 2
    var reason = (es.readyState !== 2 ? 'network' : 'permanent');
    self._cleanup();
    self._close(reason);
  };
}

inherits(EventSourceReceiver, EventEmitter);

EventSourceReceiver.prototype.abort = function() {
  debug('abort');
  this._cleanup();
  this._close('user');
};

EventSourceReceiver.prototype._cleanup = function() {
  debug('cleanup');
  var es = this.es;
  if (es) {
    es.onmessage = es.onerror = null;
    es.close();
    this.es = null;
  }
};

EventSourceReceiver.prototype._close = function(reason) {
  debug('close', reason);
  var self = this;
  // Safari and chrome < 15 crash if we close window before
  // waiting for ES cleanup. See:
  // https://code.google.com/p/chromium/issues/detail?id=89155
  setTimeout(function() {
    self.emit('close', null, reason);
    self.removeAllListeners();
  }, 200);
};

module.exports = EventSourceReceiver;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/transport/receiver/htmlfile.js":
/*!***********************************************************************!*\
  !*** ./node_modules/sockjs-client/lib/transport/receiver/htmlfile.js ***!
  \***********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
  , iframeUtils = __webpack_require__(/*! ../../utils/iframe */ "./node_modules/sockjs-client/lib/utils/iframe.js")
  , urlUtils = __webpack_require__(/*! ../../utils/url */ "./node_modules/sockjs-client/lib/utils/url.js")
  , EventEmitter = __webpack_require__(/*! events */ "./node_modules/sockjs-client/lib/event/emitter.js").EventEmitter
  , random = __webpack_require__(/*! ../../utils/random */ "./node_modules/sockjs-client/lib/utils/random.js")
  ;

var debug = function() {};
if (true) {
  debug = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js")('sockjs-client:receiver:htmlfile');
}

function HtmlfileReceiver(url) {
  debug(url);
  EventEmitter.call(this);
  var self = this;
  iframeUtils.polluteGlobalNamespace();

  this.id = 'a' + random.string(6);
  url = urlUtils.addQuery(url, 'c=' + decodeURIComponent(iframeUtils.WPrefix + '.' + this.id));

  debug('using htmlfile', HtmlfileReceiver.htmlfileEnabled);
  var constructFunc = HtmlfileReceiver.htmlfileEnabled ?
      iframeUtils.createHtmlfile : iframeUtils.createIframe;

  __webpack_require__.g[iframeUtils.WPrefix][this.id] = {
    start: function() {
      debug('start');
      self.iframeObj.loaded();
    }
  , message: function(data) {
      debug('message', data);
      self.emit('message', data);
    }
  , stop: function() {
      debug('stop');
      self._cleanup();
      self._close('network');
    }
  };
  this.iframeObj = constructFunc(url, function() {
    debug('callback');
    self._cleanup();
    self._close('permanent');
  });
}

inherits(HtmlfileReceiver, EventEmitter);

HtmlfileReceiver.prototype.abort = function() {
  debug('abort');
  this._cleanup();
  this._close('user');
};

HtmlfileReceiver.prototype._cleanup = function() {
  debug('_cleanup');
  if (this.iframeObj) {
    this.iframeObj.cleanup();
    this.iframeObj = null;
  }
  delete __webpack_require__.g[iframeUtils.WPrefix][this.id];
};

HtmlfileReceiver.prototype._close = function(reason) {
  debug('_close', reason);
  this.emit('close', null, reason);
  this.removeAllListeners();
};

HtmlfileReceiver.htmlfileEnabled = false;

// obfuscate to avoid firewalls
var axo = ['Active'].concat('Object').join('X');
if (axo in __webpack_require__.g) {
  try {
    HtmlfileReceiver.htmlfileEnabled = !!new __webpack_require__.g[axo]('htmlfile');
  } catch (x) {
    // intentionally empty
  }
}

HtmlfileReceiver.enabled = HtmlfileReceiver.htmlfileEnabled || iframeUtils.iframeEnabled;

module.exports = HtmlfileReceiver;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/transport/receiver/jsonp.js":
/*!********************************************************************!*\
  !*** ./node_modules/sockjs-client/lib/transport/receiver/jsonp.js ***!
  \********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../../utils/iframe */ "./node_modules/sockjs-client/lib/utils/iframe.js")
  , random = __webpack_require__(/*! ../../utils/random */ "./node_modules/sockjs-client/lib/utils/random.js")
  , browser = __webpack_require__(/*! ../../utils/browser */ "./node_modules/sockjs-client/lib/utils/browser.js")
  , urlUtils = __webpack_require__(/*! ../../utils/url */ "./node_modules/sockjs-client/lib/utils/url.js")
  , inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
  , EventEmitter = __webpack_require__(/*! events */ "./node_modules/sockjs-client/lib/event/emitter.js").EventEmitter
  ;

var debug = function() {};
if (true) {
  debug = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js")('sockjs-client:receiver:jsonp');
}

function JsonpReceiver(url) {
  debug(url);
  var self = this;
  EventEmitter.call(this);

  utils.polluteGlobalNamespace();

  this.id = 'a' + random.string(6);
  var urlWithId = urlUtils.addQuery(url, 'c=' + encodeURIComponent(utils.WPrefix + '.' + this.id));

  __webpack_require__.g[utils.WPrefix][this.id] = this._callback.bind(this);
  this._createScript(urlWithId);

  // Fallback mostly for Konqueror - stupid timer, 35 seconds shall be plenty.
  this.timeoutId = setTimeout(function() {
    debug('timeout');
    self._abort(new Error('JSONP script loaded abnormally (timeout)'));
  }, JsonpReceiver.timeout);
}

inherits(JsonpReceiver, EventEmitter);

JsonpReceiver.prototype.abort = function() {
  debug('abort');
  if (__webpack_require__.g[utils.WPrefix][this.id]) {
    var err = new Error('JSONP user aborted read');
    err.code = 1000;
    this._abort(err);
  }
};

JsonpReceiver.timeout = 35000;
JsonpReceiver.scriptErrorTimeout = 1000;

JsonpReceiver.prototype._callback = function(data) {
  debug('_callback', data);
  this._cleanup();

  if (this.aborting) {
    return;
  }

  if (data) {
    debug('message', data);
    this.emit('message', data);
  }
  this.emit('close', null, 'network');
  this.removeAllListeners();
};

JsonpReceiver.prototype._abort = function(err) {
  debug('_abort', err);
  this._cleanup();
  this.aborting = true;
  this.emit('close', err.code, err.message);
  this.removeAllListeners();
};

JsonpReceiver.prototype._cleanup = function() {
  debug('_cleanup');
  clearTimeout(this.timeoutId);
  if (this.script2) {
    this.script2.parentNode.removeChild(this.script2);
    this.script2 = null;
  }
  if (this.script) {
    var script = this.script;
    // Unfortunately, you can't really abort script loading of
    // the script.
    script.parentNode.removeChild(script);
    script.onreadystatechange = script.onerror =
        script.onload = script.onclick = null;
    this.script = null;
  }
  delete __webpack_require__.g[utils.WPrefix][this.id];
};

JsonpReceiver.prototype._scriptError = function() {
  debug('_scriptError');
  var self = this;
  if (this.errorTimer) {
    return;
  }

  this.errorTimer = setTimeout(function() {
    if (!self.loadedOkay) {
      self._abort(new Error('JSONP script loaded abnormally (onerror)'));
    }
  }, JsonpReceiver.scriptErrorTimeout);
};

JsonpReceiver.prototype._createScript = function(url) {
  debug('_createScript', url);
  var self = this;
  var script = this.script = __webpack_require__.g.document.createElement('script');
  var script2;  // Opera synchronous load trick.

  script.id = 'a' + random.string(8);
  script.src = url;
  script.type = 'text/javascript';
  script.charset = 'UTF-8';
  script.onerror = this._scriptError.bind(this);
  script.onload = function() {
    debug('onload');
    self._abort(new Error('JSONP script loaded abnormally (onload)'));
  };

  // IE9 fires 'error' event after onreadystatechange or before, in random order.
  // Use loadedOkay to determine if actually errored
  script.onreadystatechange = function() {
    debug('onreadystatechange', script.readyState);
    if (/loaded|closed/.test(script.readyState)) {
      if (script && script.htmlFor && script.onclick) {
        self.loadedOkay = true;
        try {
          // In IE, actually execute the script.
          script.onclick();
        } catch (x) {
          // intentionally empty
        }
      }
      if (script) {
        self._abort(new Error('JSONP script loaded abnormally (onreadystatechange)'));
      }
    }
  };
  // IE: event/htmlFor/onclick trick.
  // One can't rely on proper order for onreadystatechange. In order to
  // make sure, set a 'htmlFor' and 'event' properties, so that
  // script code will be installed as 'onclick' handler for the
  // script object. Later, onreadystatechange, manually execute this
  // code. FF and Chrome doesn't work with 'event' and 'htmlFor'
  // set. For reference see:
  //   http://jaubourg.net/2010/07/loading-script-as-onclick-handler-of.html
  // Also, read on that about script ordering:
  //   http://wiki.whatwg.org/wiki/Dynamic_Script_Execution_Order
  if (typeof script.async === 'undefined' && __webpack_require__.g.document.attachEvent) {
    // According to mozilla docs, in recent browsers script.async defaults
    // to 'true', so we may use it to detect a good browser:
    // https://developer.mozilla.org/en/HTML/Element/script
    if (!browser.isOpera()) {
      // Naively assume we're in IE
      try {
        script.htmlFor = script.id;
        script.event = 'onclick';
      } catch (x) {
        // intentionally empty
      }
      script.async = true;
    } else {
      // Opera, second sync script hack
      script2 = this.script2 = __webpack_require__.g.document.createElement('script');
      script2.text = "try{var a = document.getElementById('" + script.id + "'); if(a)a.onerror();}catch(x){};";
      script.async = script2.async = false;
    }
  }
  if (typeof script.async !== 'undefined') {
    script.async = true;
  }

  var head = __webpack_require__.g.document.getElementsByTagName('head')[0];
  head.insertBefore(script, head.firstChild);
  if (script2) {
    head.insertBefore(script2, head.firstChild);
  }
};

module.exports = JsonpReceiver;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/transport/receiver/xhr.js":
/*!******************************************************************!*\
  !*** ./node_modules/sockjs-client/lib/transport/receiver/xhr.js ***!
  \******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
  , EventEmitter = __webpack_require__(/*! events */ "./node_modules/sockjs-client/lib/event/emitter.js").EventEmitter
  ;

var debug = function() {};
if (true) {
  debug = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js")('sockjs-client:receiver:xhr');
}

function XhrReceiver(url, AjaxObject) {
  debug(url);
  EventEmitter.call(this);
  var self = this;

  this.bufferPosition = 0;

  this.xo = new AjaxObject('POST', url, null);
  this.xo.on('chunk', this._chunkHandler.bind(this));
  this.xo.once('finish', function(status, text) {
    debug('finish', status, text);
    self._chunkHandler(status, text);
    self.xo = null;
    var reason = status === 200 ? 'network' : 'permanent';
    debug('close', reason);
    self.emit('close', null, reason);
    self._cleanup();
  });
}

inherits(XhrReceiver, EventEmitter);

XhrReceiver.prototype._chunkHandler = function(status, text) {
  debug('_chunkHandler', status);
  if (status !== 200 || !text) {
    return;
  }

  for (var idx = -1; ; this.bufferPosition += idx + 1) {
    var buf = text.slice(this.bufferPosition);
    idx = buf.indexOf('\n');
    if (idx === -1) {
      break;
    }
    var msg = buf.slice(0, idx);
    if (msg) {
      debug('message', msg);
      this.emit('message', msg);
    }
  }
};

XhrReceiver.prototype._cleanup = function() {
  debug('_cleanup');
  this.removeAllListeners();
};

XhrReceiver.prototype.abort = function() {
  debug('abort');
  if (this.xo) {
    this.xo.close();
    debug('close');
    this.emit('close', null, 'user');
    this.xo = null;
  }
  this._cleanup();
};

module.exports = XhrReceiver;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/transport/sender/jsonp.js":
/*!******************************************************************!*\
  !*** ./node_modules/sockjs-client/lib/transport/sender/jsonp.js ***!
  \******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var random = __webpack_require__(/*! ../../utils/random */ "./node_modules/sockjs-client/lib/utils/random.js")
  , urlUtils = __webpack_require__(/*! ../../utils/url */ "./node_modules/sockjs-client/lib/utils/url.js")
  ;

var debug = function() {};
if (true) {
  debug = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js")('sockjs-client:sender:jsonp');
}

var form, area;

function createIframe(id) {
  debug('createIframe', id);
  try {
    // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
    return __webpack_require__.g.document.createElement('<iframe name="' + id + '">');
  } catch (x) {
    var iframe = __webpack_require__.g.document.createElement('iframe');
    iframe.name = id;
    return iframe;
  }
}

function createForm() {
  debug('createForm');
  form = __webpack_require__.g.document.createElement('form');
  form.style.display = 'none';
  form.style.position = 'absolute';
  form.method = 'POST';
  form.enctype = 'application/x-www-form-urlencoded';
  form.acceptCharset = 'UTF-8';

  area = __webpack_require__.g.document.createElement('textarea');
  area.name = 'd';
  form.appendChild(area);

  __webpack_require__.g.document.body.appendChild(form);
}

module.exports = function(url, payload, callback) {
  debug(url, payload);
  if (!form) {
    createForm();
  }
  var id = 'a' + random.string(8);
  form.target = id;
  form.action = urlUtils.addQuery(urlUtils.addPath(url, '/jsonp_send'), 'i=' + id);

  var iframe = createIframe(id);
  iframe.id = id;
  iframe.style.display = 'none';
  form.appendChild(iframe);

  try {
    area.value = payload;
  } catch (e) {
    // seriously broken browsers get here
  }
  form.submit();

  var completed = function(err) {
    debug('completed', id, err);
    if (!iframe.onerror) {
      return;
    }
    iframe.onreadystatechange = iframe.onerror = iframe.onload = null;
    // Opera mini doesn't like if we GC iframe
    // immediately, thus this timeout.
    setTimeout(function() {
      debug('cleaning up', id);
      iframe.parentNode.removeChild(iframe);
      iframe = null;
    }, 500);
    area.value = '';
    // It is not possible to detect if the iframe succeeded or
    // failed to submit our form.
    callback(err);
  };
  iframe.onerror = function() {
    debug('onerror', id);
    completed();
  };
  iframe.onload = function() {
    debug('onload', id);
    completed();
  };
  iframe.onreadystatechange = function(e) {
    debug('onreadystatechange', id, iframe.readyState, e);
    if (iframe.readyState === 'complete') {
      completed();
    }
  };
  return function() {
    debug('aborted', id);
    completed(new Error('Aborted'));
  };
};


/***/ }),

/***/ "./node_modules/sockjs-client/lib/transport/sender/xdr.js":
/*!****************************************************************!*\
  !*** ./node_modules/sockjs-client/lib/transport/sender/xdr.js ***!
  \****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var EventEmitter = __webpack_require__(/*! events */ "./node_modules/sockjs-client/lib/event/emitter.js").EventEmitter
  , inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
  , eventUtils = __webpack_require__(/*! ../../utils/event */ "./node_modules/sockjs-client/lib/utils/event.js")
  , browser = __webpack_require__(/*! ../../utils/browser */ "./node_modules/sockjs-client/lib/utils/browser.js")
  , urlUtils = __webpack_require__(/*! ../../utils/url */ "./node_modules/sockjs-client/lib/utils/url.js")
  ;

var debug = function() {};
if (true) {
  debug = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js")('sockjs-client:sender:xdr');
}

// References:
//   http://ajaxian.com/archives/100-line-ajax-wrapper
//   http://msdn.microsoft.com/en-us/library/cc288060(v=VS.85).aspx

function XDRObject(method, url, payload) {
  debug(method, url);
  var self = this;
  EventEmitter.call(this);

  setTimeout(function() {
    self._start(method, url, payload);
  }, 0);
}

inherits(XDRObject, EventEmitter);

XDRObject.prototype._start = function(method, url, payload) {
  debug('_start');
  var self = this;
  var xdr = new __webpack_require__.g.XDomainRequest();
  // IE caches even POSTs
  url = urlUtils.addQuery(url, 't=' + (+new Date()));

  xdr.onerror = function() {
    debug('onerror');
    self._error();
  };
  xdr.ontimeout = function() {
    debug('ontimeout');
    self._error();
  };
  xdr.onprogress = function() {
    debug('progress', xdr.responseText);
    self.emit('chunk', 200, xdr.responseText);
  };
  xdr.onload = function() {
    debug('load');
    self.emit('finish', 200, xdr.responseText);
    self._cleanup(false);
  };
  this.xdr = xdr;
  this.unloadRef = eventUtils.unloadAdd(function() {
    self._cleanup(true);
  });
  try {
    // Fails with AccessDenied if port number is bogus
    this.xdr.open(method, url);
    if (this.timeout) {
      this.xdr.timeout = this.timeout;
    }
    this.xdr.send(payload);
  } catch (x) {
    this._error();
  }
};

XDRObject.prototype._error = function() {
  this.emit('finish', 0, '');
  this._cleanup(false);
};

XDRObject.prototype._cleanup = function(abort) {
  debug('cleanup', abort);
  if (!this.xdr) {
    return;
  }
  this.removeAllListeners();
  eventUtils.unloadDel(this.unloadRef);

  this.xdr.ontimeout = this.xdr.onerror = this.xdr.onprogress = this.xdr.onload = null;
  if (abort) {
    try {
      this.xdr.abort();
    } catch (x) {
      // intentionally empty
    }
  }
  this.unloadRef = this.xdr = null;
};

XDRObject.prototype.close = function() {
  debug('close');
  this._cleanup(true);
};

// IE 8/9 if the request target uses the same scheme - #79
XDRObject.enabled = !!(__webpack_require__.g.XDomainRequest && browser.hasDomain());

module.exports = XDRObject;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/transport/sender/xhr-cors.js":
/*!*********************************************************************!*\
  !*** ./node_modules/sockjs-client/lib/transport/sender/xhr-cors.js ***!
  \*********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
  , XhrDriver = __webpack_require__(/*! ../driver/xhr */ "./node_modules/sockjs-client/lib/transport/browser/abstract-xhr.js")
  ;

function XHRCorsObject(method, url, payload, opts) {
  XhrDriver.call(this, method, url, payload, opts);
}

inherits(XHRCorsObject, XhrDriver);

XHRCorsObject.enabled = XhrDriver.enabled && XhrDriver.supportsCORS;

module.exports = XHRCorsObject;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/transport/sender/xhr-fake.js":
/*!*********************************************************************!*\
  !*** ./node_modules/sockjs-client/lib/transport/sender/xhr-fake.js ***!
  \*********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var EventEmitter = __webpack_require__(/*! events */ "./node_modules/sockjs-client/lib/event/emitter.js").EventEmitter
  , inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
  ;

function XHRFake(/* method, url, payload, opts */) {
  var self = this;
  EventEmitter.call(this);

  this.to = setTimeout(function() {
    self.emit('finish', 200, '{}');
  }, XHRFake.timeout);
}

inherits(XHRFake, EventEmitter);

XHRFake.prototype.close = function() {
  clearTimeout(this.to);
};

XHRFake.timeout = 2000;

module.exports = XHRFake;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/transport/sender/xhr-local.js":
/*!**********************************************************************!*\
  !*** ./node_modules/sockjs-client/lib/transport/sender/xhr-local.js ***!
  \**********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
  , XhrDriver = __webpack_require__(/*! ../driver/xhr */ "./node_modules/sockjs-client/lib/transport/browser/abstract-xhr.js")
  ;

function XHRLocalObject(method, url, payload /*, opts */) {
  XhrDriver.call(this, method, url, payload, {
    noCredentials: true
  });
}

inherits(XHRLocalObject, XhrDriver);

XHRLocalObject.enabled = XhrDriver.enabled;

module.exports = XHRLocalObject;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/transport/websocket.js":
/*!***************************************************************!*\
  !*** ./node_modules/sockjs-client/lib/transport/websocket.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils/event */ "./node_modules/sockjs-client/lib/utils/event.js")
  , urlUtils = __webpack_require__(/*! ../utils/url */ "./node_modules/sockjs-client/lib/utils/url.js")
  , inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
  , EventEmitter = __webpack_require__(/*! events */ "./node_modules/sockjs-client/lib/event/emitter.js").EventEmitter
  , WebsocketDriver = __webpack_require__(/*! ./driver/websocket */ "./node_modules/sockjs-client/lib/transport/browser/websocket.js")
  ;

var debug = function() {};
if (true) {
  debug = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js")('sockjs-client:websocket');
}

function WebSocketTransport(transUrl, ignore, options) {
  if (!WebSocketTransport.enabled()) {
    throw new Error('Transport created when disabled');
  }

  EventEmitter.call(this);
  debug('constructor', transUrl);

  var self = this;
  var url = urlUtils.addPath(transUrl, '/websocket');
  if (url.slice(0, 5) === 'https') {
    url = 'wss' + url.slice(5);
  } else {
    url = 'ws' + url.slice(4);
  }
  this.url = url;

  this.ws = new WebsocketDriver(this.url, [], options);
  this.ws.onmessage = function(e) {
    debug('message event', e.data);
    self.emit('message', e.data);
  };
  // Firefox has an interesting bug. If a websocket connection is
  // created after onunload, it stays alive even when user
  // navigates away from the page. In such situation let's lie -
  // let's not open the ws connection at all. See:
  // https://github.com/sockjs/sockjs-client/issues/28
  // https://bugzilla.mozilla.org/show_bug.cgi?id=696085
  this.unloadRef = utils.unloadAdd(function() {
    debug('unload');
    self.ws.close();
  });
  this.ws.onclose = function(e) {
    debug('close event', e.code, e.reason);
    self.emit('close', e.code, e.reason);
    self._cleanup();
  };
  this.ws.onerror = function(e) {
    debug('error event', e);
    self.emit('close', 1006, 'WebSocket connection broken');
    self._cleanup();
  };
}

inherits(WebSocketTransport, EventEmitter);

WebSocketTransport.prototype.send = function(data) {
  var msg = '[' + data + ']';
  debug('send', msg);
  this.ws.send(msg);
};

WebSocketTransport.prototype.close = function() {
  debug('close');
  var ws = this.ws;
  this._cleanup();
  if (ws) {
    ws.close();
  }
};

WebSocketTransport.prototype._cleanup = function() {
  debug('_cleanup');
  var ws = this.ws;
  if (ws) {
    ws.onmessage = ws.onclose = ws.onerror = null;
  }
  utils.unloadDel(this.unloadRef);
  this.unloadRef = this.ws = null;
  this.removeAllListeners();
};

WebSocketTransport.enabled = function() {
  debug('enabled');
  return !!WebsocketDriver;
};
WebSocketTransport.transportName = 'websocket';

// In theory, ws should require 1 round trip. But in chrome, this is
// not very stable over SSL. Most likely a ws connection requires a
// separate SSL connection, in which case 2 round trips are an
// absolute minumum.
WebSocketTransport.roundTrips = 2;

module.exports = WebSocketTransport;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/transport/xdr-polling.js":
/*!*****************************************************************!*\
  !*** ./node_modules/sockjs-client/lib/transport/xdr-polling.js ***!
  \*****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
  , AjaxBasedTransport = __webpack_require__(/*! ./lib/ajax-based */ "./node_modules/sockjs-client/lib/transport/lib/ajax-based.js")
  , XdrStreamingTransport = __webpack_require__(/*! ./xdr-streaming */ "./node_modules/sockjs-client/lib/transport/xdr-streaming.js")
  , XhrReceiver = __webpack_require__(/*! ./receiver/xhr */ "./node_modules/sockjs-client/lib/transport/receiver/xhr.js")
  , XDRObject = __webpack_require__(/*! ./sender/xdr */ "./node_modules/sockjs-client/lib/transport/sender/xdr.js")
  ;

function XdrPollingTransport(transUrl) {
  if (!XDRObject.enabled) {
    throw new Error('Transport created when disabled');
  }
  AjaxBasedTransport.call(this, transUrl, '/xhr', XhrReceiver, XDRObject);
}

inherits(XdrPollingTransport, AjaxBasedTransport);

XdrPollingTransport.enabled = XdrStreamingTransport.enabled;
XdrPollingTransport.transportName = 'xdr-polling';
XdrPollingTransport.roundTrips = 2; // preflight, ajax

module.exports = XdrPollingTransport;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/transport/xdr-streaming.js":
/*!*******************************************************************!*\
  !*** ./node_modules/sockjs-client/lib/transport/xdr-streaming.js ***!
  \*******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
  , AjaxBasedTransport = __webpack_require__(/*! ./lib/ajax-based */ "./node_modules/sockjs-client/lib/transport/lib/ajax-based.js")
  , XhrReceiver = __webpack_require__(/*! ./receiver/xhr */ "./node_modules/sockjs-client/lib/transport/receiver/xhr.js")
  , XDRObject = __webpack_require__(/*! ./sender/xdr */ "./node_modules/sockjs-client/lib/transport/sender/xdr.js")
  ;

// According to:
//   http://stackoverflow.com/questions/1641507/detect-browser-support-for-cross-domain-xmlhttprequests
//   http://hacks.mozilla.org/2009/07/cross-site-xmlhttprequest-with-cors/

function XdrStreamingTransport(transUrl) {
  if (!XDRObject.enabled) {
    throw new Error('Transport created when disabled');
  }
  AjaxBasedTransport.call(this, transUrl, '/xhr_streaming', XhrReceiver, XDRObject);
}

inherits(XdrStreamingTransport, AjaxBasedTransport);

XdrStreamingTransport.enabled = function(info) {
  if (info.cookie_needed || info.nullOrigin) {
    return false;
  }
  return XDRObject.enabled && info.sameScheme;
};

XdrStreamingTransport.transportName = 'xdr-streaming';
XdrStreamingTransport.roundTrips = 2; // preflight, ajax

module.exports = XdrStreamingTransport;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/transport/xhr-polling.js":
/*!*****************************************************************!*\
  !*** ./node_modules/sockjs-client/lib/transport/xhr-polling.js ***!
  \*****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
  , AjaxBasedTransport = __webpack_require__(/*! ./lib/ajax-based */ "./node_modules/sockjs-client/lib/transport/lib/ajax-based.js")
  , XhrReceiver = __webpack_require__(/*! ./receiver/xhr */ "./node_modules/sockjs-client/lib/transport/receiver/xhr.js")
  , XHRCorsObject = __webpack_require__(/*! ./sender/xhr-cors */ "./node_modules/sockjs-client/lib/transport/sender/xhr-cors.js")
  , XHRLocalObject = __webpack_require__(/*! ./sender/xhr-local */ "./node_modules/sockjs-client/lib/transport/sender/xhr-local.js")
  ;

function XhrPollingTransport(transUrl) {
  if (!XHRLocalObject.enabled && !XHRCorsObject.enabled) {
    throw new Error('Transport created when disabled');
  }
  AjaxBasedTransport.call(this, transUrl, '/xhr', XhrReceiver, XHRCorsObject);
}

inherits(XhrPollingTransport, AjaxBasedTransport);

XhrPollingTransport.enabled = function(info) {
  if (info.nullOrigin) {
    return false;
  }

  if (XHRLocalObject.enabled && info.sameOrigin) {
    return true;
  }
  return XHRCorsObject.enabled;
};

XhrPollingTransport.transportName = 'xhr-polling';
XhrPollingTransport.roundTrips = 2; // preflight, ajax

module.exports = XhrPollingTransport;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/transport/xhr-streaming.js":
/*!*******************************************************************!*\
  !*** ./node_modules/sockjs-client/lib/transport/xhr-streaming.js ***!
  \*******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
  , AjaxBasedTransport = __webpack_require__(/*! ./lib/ajax-based */ "./node_modules/sockjs-client/lib/transport/lib/ajax-based.js")
  , XhrReceiver = __webpack_require__(/*! ./receiver/xhr */ "./node_modules/sockjs-client/lib/transport/receiver/xhr.js")
  , XHRCorsObject = __webpack_require__(/*! ./sender/xhr-cors */ "./node_modules/sockjs-client/lib/transport/sender/xhr-cors.js")
  , XHRLocalObject = __webpack_require__(/*! ./sender/xhr-local */ "./node_modules/sockjs-client/lib/transport/sender/xhr-local.js")
  , browser = __webpack_require__(/*! ../utils/browser */ "./node_modules/sockjs-client/lib/utils/browser.js")
  ;

function XhrStreamingTransport(transUrl) {
  if (!XHRLocalObject.enabled && !XHRCorsObject.enabled) {
    throw new Error('Transport created when disabled');
  }
  AjaxBasedTransport.call(this, transUrl, '/xhr_streaming', XhrReceiver, XHRCorsObject);
}

inherits(XhrStreamingTransport, AjaxBasedTransport);

XhrStreamingTransport.enabled = function(info) {
  if (info.nullOrigin) {
    return false;
  }
  // Opera doesn't support xhr-streaming #60
  // But it might be able to #92
  if (browser.isOpera()) {
    return false;
  }

  return XHRCorsObject.enabled;
};

XhrStreamingTransport.transportName = 'xhr-streaming';
XhrStreamingTransport.roundTrips = 2; // preflight, ajax

// Safari gets confused when a streaming ajax request is started
// before onload. This causes the load indicator to spin indefinetely.
// Only require body when used in a browser
XhrStreamingTransport.needBody = !!__webpack_require__.g.document;

module.exports = XhrStreamingTransport;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/utils/browser-crypto.js":
/*!****************************************************************!*\
  !*** ./node_modules/sockjs-client/lib/utils/browser-crypto.js ***!
  \****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


if (__webpack_require__.g.crypto && __webpack_require__.g.crypto.getRandomValues) {
  module.exports.randomBytes = function(length) {
    var bytes = new Uint8Array(length);
    __webpack_require__.g.crypto.getRandomValues(bytes);
    return bytes;
  };
} else {
  module.exports.randomBytes = function(length) {
    var bytes = new Array(length);
    for (var i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return bytes;
  };
}


/***/ }),

/***/ "./node_modules/sockjs-client/lib/utils/browser.js":
/*!*********************************************************!*\
  !*** ./node_modules/sockjs-client/lib/utils/browser.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


module.exports = {
  isOpera: function() {
    return __webpack_require__.g.navigator &&
      /opera/i.test(__webpack_require__.g.navigator.userAgent);
  }

, isKonqueror: function() {
    return __webpack_require__.g.navigator &&
      /konqueror/i.test(__webpack_require__.g.navigator.userAgent);
  }

  // #187 wrap document.domain in try/catch because of WP8 from file:///
, hasDomain: function () {
    // non-browser client always has a domain
    if (!__webpack_require__.g.document) {
      return true;
    }

    try {
      return !!__webpack_require__.g.document.domain;
    } catch (e) {
      return false;
    }
  }
};


/***/ }),

/***/ "./node_modules/sockjs-client/lib/utils/escape.js":
/*!********************************************************!*\
  !*** ./node_modules/sockjs-client/lib/utils/escape.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var JSON3 = __webpack_require__(/*! json3 */ "./node_modules/json3/lib/json3.js");

// Some extra characters that Chrome gets wrong, and substitutes with
// something else on the wire.
// eslint-disable-next-line no-control-regex, no-misleading-character-class
var extraEscapable = /[\x00-\x1f\ud800-\udfff\ufffe\uffff\u0300-\u0333\u033d-\u0346\u034a-\u034c\u0350-\u0352\u0357-\u0358\u035c-\u0362\u0374\u037e\u0387\u0591-\u05af\u05c4\u0610-\u0617\u0653-\u0654\u0657-\u065b\u065d-\u065e\u06df-\u06e2\u06eb-\u06ec\u0730\u0732-\u0733\u0735-\u0736\u073a\u073d\u073f-\u0741\u0743\u0745\u0747\u07eb-\u07f1\u0951\u0958-\u095f\u09dc-\u09dd\u09df\u0a33\u0a36\u0a59-\u0a5b\u0a5e\u0b5c-\u0b5d\u0e38-\u0e39\u0f43\u0f4d\u0f52\u0f57\u0f5c\u0f69\u0f72-\u0f76\u0f78\u0f80-\u0f83\u0f93\u0f9d\u0fa2\u0fa7\u0fac\u0fb9\u1939-\u193a\u1a17\u1b6b\u1cda-\u1cdb\u1dc0-\u1dcf\u1dfc\u1dfe\u1f71\u1f73\u1f75\u1f77\u1f79\u1f7b\u1f7d\u1fbb\u1fbe\u1fc9\u1fcb\u1fd3\u1fdb\u1fe3\u1feb\u1fee-\u1fef\u1ff9\u1ffb\u1ffd\u2000-\u2001\u20d0-\u20d1\u20d4-\u20d7\u20e7-\u20e9\u2126\u212a-\u212b\u2329-\u232a\u2adc\u302b-\u302c\uaab2-\uaab3\uf900-\ufa0d\ufa10\ufa12\ufa15-\ufa1e\ufa20\ufa22\ufa25-\ufa26\ufa2a-\ufa2d\ufa30-\ufa6d\ufa70-\ufad9\ufb1d\ufb1f\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4e\ufff0-\uffff]/g
  , extraLookup;

// This may be quite slow, so let's delay until user actually uses bad
// characters.
var unrollLookup = function(escapable) {
  var i;
  var unrolled = {};
  var c = [];
  for (i = 0; i < 65536; i++) {
    c.push( String.fromCharCode(i) );
  }
  escapable.lastIndex = 0;
  c.join('').replace(escapable, function(a) {
    unrolled[ a ] = '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
    return '';
  });
  escapable.lastIndex = 0;
  return unrolled;
};

// Quote string, also taking care of unicode characters that browsers
// often break. Especially, take care of unicode surrogates:
// http://en.wikipedia.org/wiki/Mapping_of_Unicode_characters#Surrogates
module.exports = {
  quote: function(string) {
    var quoted = JSON3.stringify(string);

    // In most cases this should be very fast and good enough.
    extraEscapable.lastIndex = 0;
    if (!extraEscapable.test(quoted)) {
      return quoted;
    }

    if (!extraLookup) {
      extraLookup = unrollLookup(extraEscapable);
    }

    return quoted.replace(extraEscapable, function(a) {
      return extraLookup[a];
    });
  }
};


/***/ }),

/***/ "./node_modules/sockjs-client/lib/utils/event.js":
/*!*******************************************************!*\
  !*** ./node_modules/sockjs-client/lib/utils/event.js ***!
  \*******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var random = __webpack_require__(/*! ./random */ "./node_modules/sockjs-client/lib/utils/random.js");

var onUnload = {}
  , afterUnload = false
    // detect google chrome packaged apps because they don't allow the 'unload' event
  , isChromePackagedApp = __webpack_require__.g.chrome && __webpack_require__.g.chrome.app && __webpack_require__.g.chrome.app.runtime
  ;

module.exports = {
  attachEvent: function(event, listener) {
    if (typeof __webpack_require__.g.addEventListener !== 'undefined') {
      __webpack_require__.g.addEventListener(event, listener, false);
    } else if (__webpack_require__.g.document && __webpack_require__.g.attachEvent) {
      // IE quirks.
      // According to: http://stevesouders.com/misc/test-postmessage.php
      // the message gets delivered only to 'document', not 'window'.
      __webpack_require__.g.document.attachEvent('on' + event, listener);
      // I get 'window' for ie8.
      __webpack_require__.g.attachEvent('on' + event, listener);
    }
  }

, detachEvent: function(event, listener) {
    if (typeof __webpack_require__.g.addEventListener !== 'undefined') {
      __webpack_require__.g.removeEventListener(event, listener, false);
    } else if (__webpack_require__.g.document && __webpack_require__.g.detachEvent) {
      __webpack_require__.g.document.detachEvent('on' + event, listener);
      __webpack_require__.g.detachEvent('on' + event, listener);
    }
  }

, unloadAdd: function(listener) {
    if (isChromePackagedApp) {
      return null;
    }

    var ref = random.string(8);
    onUnload[ref] = listener;
    if (afterUnload) {
      setTimeout(this.triggerUnloadCallbacks, 0);
    }
    return ref;
  }

, unloadDel: function(ref) {
    if (ref in onUnload) {
      delete onUnload[ref];
    }
  }

, triggerUnloadCallbacks: function() {
    for (var ref in onUnload) {
      onUnload[ref]();
      delete onUnload[ref];
    }
  }
};

var unloadTriggered = function() {
  if (afterUnload) {
    return;
  }
  afterUnload = true;
  module.exports.triggerUnloadCallbacks();
};

// 'unload' alone is not reliable in opera within an iframe, but we
// can't use `beforeunload` as IE fires it on javascript: links.
if (!isChromePackagedApp) {
  module.exports.attachEvent('unload', unloadTriggered);
}


/***/ }),

/***/ "./node_modules/sockjs-client/lib/utils/iframe.js":
/*!********************************************************!*\
  !*** ./node_modules/sockjs-client/lib/utils/iframe.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var eventUtils = __webpack_require__(/*! ./event */ "./node_modules/sockjs-client/lib/utils/event.js")
  , JSON3 = __webpack_require__(/*! json3 */ "./node_modules/json3/lib/json3.js")
  , browser = __webpack_require__(/*! ./browser */ "./node_modules/sockjs-client/lib/utils/browser.js")
  ;

var debug = function() {};
if (true) {
  debug = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js")('sockjs-client:utils:iframe');
}

module.exports = {
  WPrefix: '_jp'
, currentWindowId: null

, polluteGlobalNamespace: function() {
    if (!(module.exports.WPrefix in __webpack_require__.g)) {
      __webpack_require__.g[module.exports.WPrefix] = {};
    }
  }

, postMessage: function(type, data) {
    if (__webpack_require__.g.parent !== __webpack_require__.g) {
      __webpack_require__.g.parent.postMessage(JSON3.stringify({
        windowId: module.exports.currentWindowId
      , type: type
      , data: data || ''
      }), '*');
    } else {
      debug('Cannot postMessage, no parent window.', type, data);
    }
  }

, createIframe: function(iframeUrl, errorCallback) {
    var iframe = __webpack_require__.g.document.createElement('iframe');
    var tref, unloadRef;
    var unattach = function() {
      debug('unattach');
      clearTimeout(tref);
      // Explorer had problems with that.
      try {
        iframe.onload = null;
      } catch (x) {
        // intentionally empty
      }
      iframe.onerror = null;
    };
    var cleanup = function() {
      debug('cleanup');
      if (iframe) {
        unattach();
        // This timeout makes chrome fire onbeforeunload event
        // within iframe. Without the timeout it goes straight to
        // onunload.
        setTimeout(function() {
          if (iframe) {
            iframe.parentNode.removeChild(iframe);
          }
          iframe = null;
        }, 0);
        eventUtils.unloadDel(unloadRef);
      }
    };
    var onerror = function(err) {
      debug('onerror', err);
      if (iframe) {
        cleanup();
        errorCallback(err);
      }
    };
    var post = function(msg, origin) {
      debug('post', msg, origin);
      setTimeout(function() {
        try {
          // When the iframe is not loaded, IE raises an exception
          // on 'contentWindow'.
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage(msg, origin);
          }
        } catch (x) {
          // intentionally empty
        }
      }, 0);
    };

    iframe.src = iframeUrl;
    iframe.style.display = 'none';
    iframe.style.position = 'absolute';
    iframe.onerror = function() {
      onerror('onerror');
    };
    iframe.onload = function() {
      debug('onload');
      // `onload` is triggered before scripts on the iframe are
      // executed. Give it few seconds to actually load stuff.
      clearTimeout(tref);
      tref = setTimeout(function() {
        onerror('onload timeout');
      }, 2000);
    };
    __webpack_require__.g.document.body.appendChild(iframe);
    tref = setTimeout(function() {
      onerror('timeout');
    }, 15000);
    unloadRef = eventUtils.unloadAdd(cleanup);
    return {
      post: post
    , cleanup: cleanup
    , loaded: unattach
    };
  }

/* eslint no-undef: "off", new-cap: "off" */
, createHtmlfile: function(iframeUrl, errorCallback) {
    var axo = ['Active'].concat('Object').join('X');
    var doc = new __webpack_require__.g[axo]('htmlfile');
    var tref, unloadRef;
    var iframe;
    var unattach = function() {
      clearTimeout(tref);
      iframe.onerror = null;
    };
    var cleanup = function() {
      if (doc) {
        unattach();
        eventUtils.unloadDel(unloadRef);
        iframe.parentNode.removeChild(iframe);
        iframe = doc = null;
        CollectGarbage();
      }
    };
    var onerror = function(r) {
      debug('onerror', r);
      if (doc) {
        cleanup();
        errorCallback(r);
      }
    };
    var post = function(msg, origin) {
      try {
        // When the iframe is not loaded, IE raises an exception
        // on 'contentWindow'.
        setTimeout(function() {
          if (iframe && iframe.contentWindow) {
              iframe.contentWindow.postMessage(msg, origin);
          }
        }, 0);
      } catch (x) {
        // intentionally empty
      }
    };

    doc.open();
    doc.write('<html><s' + 'cript>' +
              'document.domain="' + __webpack_require__.g.document.domain + '";' +
              '</s' + 'cript></html>');
    doc.close();
    doc.parentWindow[module.exports.WPrefix] = __webpack_require__.g[module.exports.WPrefix];
    var c = doc.createElement('div');
    doc.body.appendChild(c);
    iframe = doc.createElement('iframe');
    c.appendChild(iframe);
    iframe.src = iframeUrl;
    iframe.onerror = function() {
      onerror('onerror');
    };
    tref = setTimeout(function() {
      onerror('timeout');
    }, 15000);
    unloadRef = eventUtils.unloadAdd(cleanup);
    return {
      post: post
    , cleanup: cleanup
    , loaded: unattach
    };
  }
};

module.exports.iframeEnabled = false;
if (__webpack_require__.g.document) {
  // postMessage misbehaves in konqueror 4.6.5 - the messages are delivered with
  // huge delay, or not at all.
  module.exports.iframeEnabled = (typeof __webpack_require__.g.postMessage === 'function' ||
    typeof __webpack_require__.g.postMessage === 'object') && (!browser.isKonqueror());
}


/***/ }),

/***/ "./node_modules/sockjs-client/lib/utils/log.js":
/*!*****************************************************!*\
  !*** ./node_modules/sockjs-client/lib/utils/log.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var logObject = {};
['log', 'debug', 'warn'].forEach(function (level) {
  var levelExists;

  try {
    levelExists = __webpack_require__.g.console && __webpack_require__.g.console[level] && __webpack_require__.g.console[level].apply;
  } catch(e) {
    // do nothing
  }

  logObject[level] = levelExists ? function () {
    return __webpack_require__.g.console[level].apply(__webpack_require__.g.console, arguments);
  } : (level === 'log' ? function () {} : logObject.log);
});

module.exports = logObject;


/***/ }),

/***/ "./node_modules/sockjs-client/lib/utils/object.js":
/*!********************************************************!*\
  !*** ./node_modules/sockjs-client/lib/utils/object.js ***!
  \********************************************************/
/***/ ((module) => {

"use strict";


module.exports = {
  isObject: function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  }

, extend: function(obj) {
    if (!this.isObject(obj)) {
      return obj;
    }
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
      source = arguments[i];
      for (prop in source) {
        if (Object.prototype.hasOwnProperty.call(source, prop)) {
          obj[prop] = source[prop];
        }
      }
    }
    return obj;
  }
};


/***/ }),

/***/ "./node_modules/sockjs-client/lib/utils/random.js":
/*!********************************************************!*\
  !*** ./node_modules/sockjs-client/lib/utils/random.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var crypto = __webpack_require__(/*! crypto */ "./node_modules/sockjs-client/lib/utils/browser-crypto.js");

// This string has length 32, a power of 2, so the modulus doesn't introduce a
// bias.
var _randomStringChars = 'abcdefghijklmnopqrstuvwxyz012345';
module.exports = {
  string: function(length) {
    var max = _randomStringChars.length;
    var bytes = crypto.randomBytes(length);
    var ret = [];
    for (var i = 0; i < length; i++) {
      ret.push(_randomStringChars.substr(bytes[i] % max, 1));
    }
    return ret.join('');
  }

, number: function(max) {
    return Math.floor(Math.random() * max);
  }

, numberString: function(max) {
    var t = ('' + (max - 1)).length;
    var p = new Array(t + 1).join('0');
    return (p + this.number(max)).slice(-t);
  }
};


/***/ }),

/***/ "./node_modules/sockjs-client/lib/utils/transport.js":
/*!***********************************************************!*\
  !*** ./node_modules/sockjs-client/lib/utils/transport.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var debug = function() {};
if (true) {
  debug = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js")('sockjs-client:utils:transport');
}

module.exports = function(availableTransports) {
  return {
    filterToEnabled: function(transportsWhitelist, info) {
      var transports = {
        main: []
      , facade: []
      };
      if (!transportsWhitelist) {
        transportsWhitelist = [];
      } else if (typeof transportsWhitelist === 'string') {
        transportsWhitelist = [transportsWhitelist];
      }

      availableTransports.forEach(function(trans) {
        if (!trans) {
          return;
        }

        if (trans.transportName === 'websocket' && info.websocket === false) {
          debug('disabled from server', 'websocket');
          return;
        }

        if (transportsWhitelist.length &&
            transportsWhitelist.indexOf(trans.transportName) === -1) {
          debug('not in whitelist', trans.transportName);
          return;
        }

        if (trans.enabled(info)) {
          debug('enabled', trans.transportName);
          transports.main.push(trans);
          if (trans.facadeTransport) {
            transports.facade.push(trans.facadeTransport);
          }
        } else {
          debug('disabled', trans.transportName);
        }
      });
      return transports;
    }
  };
};


/***/ }),

/***/ "./node_modules/sockjs-client/lib/utils/url.js":
/*!*****************************************************!*\
  !*** ./node_modules/sockjs-client/lib/utils/url.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var URL = __webpack_require__(/*! url-parse */ "./node_modules/url-parse/index.js");

var debug = function() {};
if (true) {
  debug = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js")('sockjs-client:utils:url');
}

module.exports = {
  getOrigin: function(url) {
    if (!url) {
      return null;
    }

    var p = new URL(url);
    if (p.protocol === 'file:') {
      return null;
    }

    var port = p.port;
    if (!port) {
      port = (p.protocol === 'https:') ? '443' : '80';
    }

    return p.protocol + '//' + p.hostname + ':' + port;
  }

, isOriginEqual: function(a, b) {
    var res = this.getOrigin(a) === this.getOrigin(b);
    debug('same', a, b, res);
    return res;
  }

, isSchemeEqual: function(a, b) {
    return (a.split(':')[0] === b.split(':')[0]);
  }

, addPath: function (url, path) {
    var qs = url.split('?');
    return qs[0] + path + (qs[1] ? '?' + qs[1] : '');
  }

, addQuery: function (url, q) {
    return url + (url.indexOf('?') === -1 ? ('?' + q) : ('&' + q));
  }

, isLoopbackAddr: function (addr) {
    return /^127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) || /^\[::1\]$/.test(addr);
  }
};


/***/ }),

/***/ "./node_modules/sockjs-client/lib/version.js":
/*!***************************************************!*\
  !*** ./node_modules/sockjs-client/lib/version.js ***!
  \***************************************************/
/***/ ((module) => {

module.exports = '1.5.0';


/***/ }),

/***/ "./node_modules/url-parse/index.js":
/*!*****************************************!*\
  !*** ./node_modules/url-parse/index.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var required = __webpack_require__(/*! requires-port */ "./node_modules/requires-port/index.js")
  , qs = __webpack_require__(/*! querystringify */ "./node_modules/querystringify/index.js")
  , slashes = /^[A-Za-z][A-Za-z0-9+-.]*:[\\/]+/
  , protocolre = /^([a-z][a-z0-9.+-]*:)?([\\/]{1,})?([\S\s]*)/i
  , whitespace = '[\\x09\\x0A\\x0B\\x0C\\x0D\\x20\\xA0\\u1680\\u180E\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200A\\u202F\\u205F\\u3000\\u2028\\u2029\\uFEFF]'
  , left = new RegExp('^'+ whitespace +'+');

/**
 * Trim a given string.
 *
 * @param {String} str String to trim.
 * @public
 */
function trimLeft(str) {
  return (str ? str : '').toString().replace(left, '');
}

/**
 * These are the parse rules for the URL parser, it informs the parser
 * about:
 *
 * 0. The char it Needs to parse, if it's a string it should be done using
 *    indexOf, RegExp using exec and NaN means set as current value.
 * 1. The property we should set when parsing this value.
 * 2. Indication if it's backwards or forward parsing, when set as number it's
 *    the value of extra chars that should be split off.
 * 3. Inherit from location if non existing in the parser.
 * 4. `toLowerCase` the resulting value.
 */
var rules = [
  ['#', 'hash'],                        // Extract from the back.
  ['?', 'query'],                       // Extract from the back.
  function sanitize(address) {          // Sanitize what is left of the address
    return address.replace('\\', '/');
  },
  ['/', 'pathname'],                    // Extract from the back.
  ['@', 'auth', 1],                     // Extract from the front.
  [NaN, 'host', undefined, 1, 1],       // Set left over value.
  [/:(\d+)$/, 'port', undefined, 1],    // RegExp the back.
  [NaN, 'hostname', undefined, 1, 1]    // Set left over.
];

/**
 * These properties should not be copied or inherited from. This is only needed
 * for all non blob URL's as a blob URL does not include a hash, only the
 * origin.
 *
 * @type {Object}
 * @private
 */
var ignore = { hash: 1, query: 1 };

/**
 * The location object differs when your code is loaded through a normal page,
 * Worker or through a worker using a blob. And with the blobble begins the
 * trouble as the location object will contain the URL of the blob, not the
 * location of the page where our code is loaded in. The actual origin is
 * encoded in the `pathname` so we can thankfully generate a good "default"
 * location from it so we can generate proper relative URL's again.
 *
 * @param {Object|String} loc Optional default location object.
 * @returns {Object} lolcation object.
 * @public
 */
function lolcation(loc) {
  var globalVar;

  if (typeof window !== 'undefined') globalVar = window;
  else if (typeof __webpack_require__.g !== 'undefined') globalVar = __webpack_require__.g;
  else if (typeof self !== 'undefined') globalVar = self;
  else globalVar = {};

  var location = globalVar.location || {};
  loc = loc || location;

  var finaldestination = {}
    , type = typeof loc
    , key;

  if ('blob:' === loc.protocol) {
    finaldestination = new Url(unescape(loc.pathname), {});
  } else if ('string' === type) {
    finaldestination = new Url(loc, {});
    for (key in ignore) delete finaldestination[key];
  } else if ('object' === type) {
    for (key in loc) {
      if (key in ignore) continue;
      finaldestination[key] = loc[key];
    }

    if (finaldestination.slashes === undefined) {
      finaldestination.slashes = slashes.test(loc.href);
    }
  }

  return finaldestination;
}

/**
 * @typedef ProtocolExtract
 * @type Object
 * @property {String} protocol Protocol matched in the URL, in lowercase.
 * @property {Boolean} slashes `true` if protocol is followed by "//", else `false`.
 * @property {String} rest Rest of the URL that is not part of the protocol.
 */

/**
 * Extract protocol information from a URL with/without double slash ("//").
 *
 * @param {String} address URL we want to extract from.
 * @return {ProtocolExtract} Extracted information.
 * @private
 */
function extractProtocol(address) {
  address = trimLeft(address);

  var match = protocolre.exec(address)
    , protocol = match[1] ? match[1].toLowerCase() : ''
    , slashes = !!(match[2] && match[2].length >= 2)
    , rest =  match[2] && match[2].length === 1 ? '/' + match[3] : match[3];

  return {
    protocol: protocol,
    slashes: slashes,
    rest: rest
  };
}

/**
 * Resolve a relative URL pathname against a base URL pathname.
 *
 * @param {String} relative Pathname of the relative URL.
 * @param {String} base Pathname of the base URL.
 * @return {String} Resolved pathname.
 * @private
 */
function resolve(relative, base) {
  if (relative === '') return base;

  var path = (base || '/').split('/').slice(0, -1).concat(relative.split('/'))
    , i = path.length
    , last = path[i - 1]
    , unshift = false
    , up = 0;

  while (i--) {
    if (path[i] === '.') {
      path.splice(i, 1);
    } else if (path[i] === '..') {
      path.splice(i, 1);
      up++;
    } else if (up) {
      if (i === 0) unshift = true;
      path.splice(i, 1);
      up--;
    }
  }

  if (unshift) path.unshift('');
  if (last === '.' || last === '..') path.push('');

  return path.join('/');
}

/**
 * The actual URL instance. Instead of returning an object we've opted-in to
 * create an actual constructor as it's much more memory efficient and
 * faster and it pleases my OCD.
 *
 * It is worth noting that we should not use `URL` as class name to prevent
 * clashes with the global URL instance that got introduced in browsers.
 *
 * @constructor
 * @param {String} address URL we want to parse.
 * @param {Object|String} [location] Location defaults for relative paths.
 * @param {Boolean|Function} [parser] Parser for the query string.
 * @private
 */
function Url(address, location, parser) {
  address = trimLeft(address);

  if (!(this instanceof Url)) {
    return new Url(address, location, parser);
  }

  var relative, extracted, parse, instruction, index, key
    , instructions = rules.slice()
    , type = typeof location
    , url = this
    , i = 0;

  //
  // The following if statements allows this module two have compatibility with
  // 2 different API:
  //
  // 1. Node.js's `url.parse` api which accepts a URL, boolean as arguments
  //    where the boolean indicates that the query string should also be parsed.
  //
  // 2. The `URL` interface of the browser which accepts a URL, object as
  //    arguments. The supplied object will be used as default values / fall-back
  //    for relative paths.
  //
  if ('object' !== type && 'string' !== type) {
    parser = location;
    location = null;
  }

  if (parser && 'function' !== typeof parser) parser = qs.parse;

  location = lolcation(location);

  //
  // Extract protocol information before running the instructions.
  //
  extracted = extractProtocol(address || '');
  relative = !extracted.protocol && !extracted.slashes;
  url.slashes = extracted.slashes || relative && location.slashes;
  url.protocol = extracted.protocol || location.protocol || '';
  address = extracted.rest;

  //
  // When the authority component is absent the URL starts with a path
  // component.
  //
  if (!extracted.slashes) instructions[3] = [/(.*)/, 'pathname'];

  for (; i < instructions.length; i++) {
    instruction = instructions[i];

    if (typeof instruction === 'function') {
      address = instruction(address);
      continue;
    }

    parse = instruction[0];
    key = instruction[1];

    if (parse !== parse) {
      url[key] = address;
    } else if ('string' === typeof parse) {
      if (~(index = address.indexOf(parse))) {
        if ('number' === typeof instruction[2]) {
          url[key] = address.slice(0, index);
          address = address.slice(index + instruction[2]);
        } else {
          url[key] = address.slice(index);
          address = address.slice(0, index);
        }
      }
    } else if ((index = parse.exec(address))) {
      url[key] = index[1];
      address = address.slice(0, index.index);
    }

    url[key] = url[key] || (
      relative && instruction[3] ? location[key] || '' : ''
    );

    //
    // Hostname, host and protocol should be lowercased so they can be used to
    // create a proper `origin`.
    //
    if (instruction[4]) url[key] = url[key].toLowerCase();
  }

  //
  // Also parse the supplied query string in to an object. If we're supplied
  // with a custom parser as function use that instead of the default build-in
  // parser.
  //
  if (parser) url.query = parser(url.query);

  //
  // If the URL is relative, resolve the pathname against the base URL.
  //
  if (
      relative
    && location.slashes
    && url.pathname.charAt(0) !== '/'
    && (url.pathname !== '' || location.pathname !== '')
  ) {
    url.pathname = resolve(url.pathname, location.pathname);
  }

  //
  // Default to a / for pathname if none exists. This normalizes the URL
  // to always have a /
  //
  if (url.pathname.charAt(0) !== '/' && url.hostname) {
    url.pathname = '/' + url.pathname;
  }

  //
  // We should not add port numbers if they are already the default port number
  // for a given protocol. As the host also contains the port number we're going
  // override it with the hostname which contains no port number.
  //
  if (!required(url.port, url.protocol)) {
    url.host = url.hostname;
    url.port = '';
  }

  //
  // Parse down the `auth` for the username and password.
  //
  url.username = url.password = '';
  if (url.auth) {
    instruction = url.auth.split(':');
    url.username = instruction[0] || '';
    url.password = instruction[1] || '';
  }

  url.origin = url.protocol && url.host && url.protocol !== 'file:'
    ? url.protocol +'//'+ url.host
    : 'null';

  //
  // The href is just the compiled result.
  //
  url.href = url.toString();
}

/**
 * This is convenience method for changing properties in the URL instance to
 * insure that they all propagate correctly.
 *
 * @param {String} part          Property we need to adjust.
 * @param {Mixed} value          The newly assigned value.
 * @param {Boolean|Function} fn  When setting the query, it will be the function
 *                               used to parse the query.
 *                               When setting the protocol, double slash will be
 *                               removed from the final url if it is true.
 * @returns {URL} URL instance for chaining.
 * @public
 */
function set(part, value, fn) {
  var url = this;

  switch (part) {
    case 'query':
      if ('string' === typeof value && value.length) {
        value = (fn || qs.parse)(value);
      }

      url[part] = value;
      break;

    case 'port':
      url[part] = value;

      if (!required(value, url.protocol)) {
        url.host = url.hostname;
        url[part] = '';
      } else if (value) {
        url.host = url.hostname +':'+ value;
      }

      break;

    case 'hostname':
      url[part] = value;

      if (url.port) value += ':'+ url.port;
      url.host = value;
      break;

    case 'host':
      url[part] = value;

      if (/:\d+$/.test(value)) {
        value = value.split(':');
        url.port = value.pop();
        url.hostname = value.join(':');
      } else {
        url.hostname = value;
        url.port = '';
      }

      break;

    case 'protocol':
      url.protocol = value.toLowerCase();
      url.slashes = !fn;
      break;

    case 'pathname':
    case 'hash':
      if (value) {
        var char = part === 'pathname' ? '/' : '#';
        url[part] = value.charAt(0) !== char ? char + value : value;
      } else {
        url[part] = value;
      }
      break;

    default:
      url[part] = value;
  }

  for (var i = 0; i < rules.length; i++) {
    var ins = rules[i];

    if (ins[4]) url[ins[1]] = url[ins[1]].toLowerCase();
  }

  url.origin = url.protocol && url.host && url.protocol !== 'file:'
    ? url.protocol +'//'+ url.host
    : 'null';

  url.href = url.toString();

  return url;
}

/**
 * Transform the properties back in to a valid and full URL string.
 *
 * @param {Function} stringify Optional query stringify function.
 * @returns {String} Compiled version of the URL.
 * @public
 */
function toString(stringify) {
  if (!stringify || 'function' !== typeof stringify) stringify = qs.stringify;

  var query
    , url = this
    , protocol = url.protocol;

  if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';

  var result = protocol + (url.slashes ? '//' : '');

  if (url.username) {
    result += url.username;
    if (url.password) result += ':'+ url.password;
    result += '@';
  }

  result += url.host + url.pathname;

  query = 'object' === typeof url.query ? stringify(url.query) : url.query;
  if (query) result += '?' !== query.charAt(0) ? '?'+ query : query;

  if (url.hash) result += url.hash;

  return result;
}

Url.prototype = { set: set, toString: toString };

//
// Expose the URL parser and some additional properties that might be useful for
// others or testing.
//
Url.extractProtocol = extractProtocol;
Url.location = lolcation;
Url.trimLeft = trimLeft;
Url.qs = qs;

module.exports = Url;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/amd options */
/******/ 	(() => {
/******/ 		__webpack_require__.amdO = {};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!*************************************************!*\
  !*** ./src/main/resources/static/lib/status.ts ***!
  \*************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "zeroPulseCounter": () => (/* binding */ zeroPulseCounter),
/* harmony export */   "saveVssPpm": () => (/* binding */ saveVssPpm)
/* harmony export */ });
/* harmony import */ var sockjs_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! sockjs-client */ "./node_modules/sockjs-client/lib/entry.js");
/* harmony import */ var sockjs_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(sockjs_client__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _stomp_stompjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @stomp/stompjs */ "./node_modules/@stomp/stompjs/esm6/compatibility/stomp.js");


// STOMP client
var stompClient;
// XHTTP
var xhttp = new XMLHttpRequest();
// Tracking variables
var vehicle = {
    rpm: 0,
    mph: 0,
    coolant: 170,
    fuel: 0,
    boost: 0,
    voltage: 0,
    odometer: 0,
    tripOdometer: 0,
    boostLaggingMax: 0,
    reverse: false,
    temperature: 32,
    oilPressure: 0,
};
// Maintains connection to web socket
function connectWebSocket() {
    var _this = this;
    var socket = new (sockjs_client__WEBPACK_IMPORTED_MODULE_0___default())('/gs-guide-websocket');
    stompClient = _stomp_stompjs__WEBPACK_IMPORTED_MODULE_1__.Stomp.over(socket);
    stompClient.debug = function () { };
    stompClient.connect({}, function (frame) {
        console.log('Connected to: ' + frame);
        stompClient.subscribe('/topic/status', function (message) {
            var statusMsg = JSON.parse(message.body + "");
            document.getElementById("rpm").value = statusMsg.rpm;
            document.getElementById("mph").value = statusMsg.mph;
            document.getElementById("coolant").value = statusMsg.coolant;
            document.getElementById("fuel").value = statusMsg.fuel;
            document.getElementById("boost").value = statusMsg.boost;
            document.getElementById("voltage").value = statusMsg.voltage;
            document.getElementById("odometer").value = statusMsg.odometer;
            document.getElementById("trip-odometer").value = statusMsg.tripOdometer;
            document.getElementById("reverse").value = statusMsg.reverse;
            document.getElementById("temperature").value = statusMsg.temperature;
            document.getElementById("oilPressure").value = statusMsg.oilPressure;
            document.getElementById("low").value = statusMsg.lowBeam;
            document.getElementById("high").value = statusMsg.highBeam;
            document.getElementById("left").value = statusMsg.left;
            document.getElementById("right").value = statusMsg.right;
            document.getElementById("pulseCounter").value = statusMsg.totalPulses;
        });
        stompClient.subscribe('/topic/logs', function (message) {
            var logMessages = message.body;
            if (logMessages.length !== 0) {
                var logArea = document.getElementById("logs");
                //logArea.value += logArea.textContent;
            }
        });
    }, function () {
        // Attempt to reconnect on lost connection
        window.setTimeout(function () {
            this.connectWebSocket();
        }.bind(_this), 2500);
    });
}
function zeroPulseCounter() {
    xhttp.open("GET", "/interaction/zeroPulseCounter", true);
    xhttp.send();
}
function saveVssPpm() {
    var pulseCounter = document.getElementById("pulseCounter").value;
    xhttp.open("GET", "/interaction/saveVssPpm?ppm=" + pulseCounter, true);
    xhttp.send();
}
// Start polling for status
connectWebSocket();

})();

pidgc = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9waWRnYy8uL25vZGVfbW9kdWxlcy9Ac3RvbXAvc3RvbXBqcy9lc202L2F1Z21lbnQtd2Vic29ja2V0LmpzIiwid2VicGFjazovL3BpZGdjLy4vbm9kZV9tb2R1bGVzL0BzdG9tcC9zdG9tcGpzL2VzbTYvYnl0ZS5qcyIsIndlYnBhY2s6Ly9waWRnYy8uL25vZGVfbW9kdWxlcy9Ac3RvbXAvc3RvbXBqcy9lc202L2NsaWVudC5qcyIsIndlYnBhY2s6Ly9waWRnYy8uL25vZGVfbW9kdWxlcy9Ac3RvbXAvc3RvbXBqcy9lc202L2NvbXBhdGliaWxpdHkvY29tcGF0LWNsaWVudC5qcyIsIndlYnBhY2s6Ly9waWRnYy8uL25vZGVfbW9kdWxlcy9Ac3RvbXAvc3RvbXBqcy9lc202L2NvbXBhdGliaWxpdHkvaGVhcnRiZWF0LWluZm8uanMiLCJ3ZWJwYWNrOi8vcGlkZ2MvLi9ub2RlX21vZHVsZXMvQHN0b21wL3N0b21wanMvZXNtNi9jb21wYXRpYmlsaXR5L3N0b21wLmpzIiwid2VicGFjazovL3BpZGdjLy4vbm9kZV9tb2R1bGVzL0BzdG9tcC9zdG9tcGpzL2VzbTYvZnJhbWUtaW1wbC5qcyIsIndlYnBhY2s6Ly9waWRnYy8uL25vZGVfbW9kdWxlcy9Ac3RvbXAvc3RvbXBqcy9lc202L3BhcnNlci5qcyIsIndlYnBhY2s6Ly9waWRnYy8uL25vZGVfbW9kdWxlcy9Ac3RvbXAvc3RvbXBqcy9lc202L3N0b21wLWhhbmRsZXIuanMiLCJ3ZWJwYWNrOi8vcGlkZ2MvLi9ub2RlX21vZHVsZXMvQHN0b21wL3N0b21wanMvZXNtNi90eXBlcy5qcyIsIndlYnBhY2s6Ly9waWRnYy8uL25vZGVfbW9kdWxlcy9Ac3RvbXAvc3RvbXBqcy9lc202L3ZlcnNpb25zLmpzIiwid2VicGFjazovL3BpZGdjLy4vbm9kZV9tb2R1bGVzL2RlYnVnL3NyYy9icm93c2VyLmpzIiwid2VicGFjazovL3BpZGdjLy4vbm9kZV9tb2R1bGVzL2RlYnVnL3NyYy9jb21tb24uanMiLCJ3ZWJwYWNrOi8vcGlkZ2MvLi9ub2RlX21vZHVsZXMvaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIndlYnBhY2s6Ly9waWRnYy8uL25vZGVfbW9kdWxlcy9qc29uMy9saWIvanNvbjMuanMiLCJ3ZWJwYWNrOi8vcGlkZ2MvLi9ub2RlX21vZHVsZXMvbXMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vcGlkZ2MvLi9ub2RlX21vZHVsZXMvcXVlcnlzdHJpbmdpZnkvaW5kZXguanMiLCJ3ZWJwYWNrOi8vcGlkZ2MvLi9ub2RlX21vZHVsZXMvcmVxdWlyZXMtcG9ydC9pbmRleC5qcyIsIndlYnBhY2s6Ly9waWRnYy8uL25vZGVfbW9kdWxlcy9zb2NranMtY2xpZW50L2xpYi9lbnRyeS5qcyIsIndlYnBhY2s6Ly9waWRnYy8uL25vZGVfbW9kdWxlcy9zb2NranMtY2xpZW50L2xpYi9ldmVudC9jbG9zZS5qcyIsIndlYnBhY2s6Ly9waWRnYy8uL25vZGVfbW9kdWxlcy9zb2NranMtY2xpZW50L2xpYi9ldmVudC9lbWl0dGVyLmpzIiwid2VicGFjazovL3BpZGdjLy4vbm9kZV9tb2R1bGVzL3NvY2tqcy1jbGllbnQvbGliL2V2ZW50L2V2ZW50LmpzIiwid2VicGFjazovL3BpZGdjLy4vbm9kZV9tb2R1bGVzL3NvY2tqcy1jbGllbnQvbGliL2V2ZW50L2V2ZW50dGFyZ2V0LmpzIiwid2VicGFjazovL3BpZGdjLy4vbm9kZV9tb2R1bGVzL3NvY2tqcy1jbGllbnQvbGliL2V2ZW50L3RyYW5zLW1lc3NhZ2UuanMiLCJ3ZWJwYWNrOi8vcGlkZ2MvLi9ub2RlX21vZHVsZXMvc29ja2pzLWNsaWVudC9saWIvZmFjYWRlLmpzIiwid2VicGFjazovL3BpZGdjLy4vbm9kZV9tb2R1bGVzL3NvY2tqcy1jbGllbnQvbGliL2lmcmFtZS1ib290c3RyYXAuanMiLCJ3ZWJwYWNrOi8vcGlkZ2MvLi9ub2RlX21vZHVsZXMvc29ja2pzLWNsaWVudC9saWIvaW5mby1hamF4LmpzIiwid2VicGFjazovL3BpZGdjLy4vbm9kZV9tb2R1bGVzL3NvY2tqcy1jbGllbnQvbGliL2luZm8taWZyYW1lLXJlY2VpdmVyLmpzIiwid2VicGFjazovL3BpZGdjLy4vbm9kZV9tb2R1bGVzL3NvY2tqcy1jbGllbnQvbGliL2luZm8taWZyYW1lLmpzIiwid2VicGFjazovL3BpZGdjLy4vbm9kZV9tb2R1bGVzL3NvY2tqcy1jbGllbnQvbGliL2luZm8tcmVjZWl2ZXIuanMiLCJ3ZWJwYWNrOi8vcGlkZ2MvLi9ub2RlX21vZHVsZXMvc29ja2pzLWNsaWVudC9saWIvbG9jYXRpb24uanMiLCJ3ZWJwYWNrOi8vcGlkZ2MvLi9ub2RlX21vZHVsZXMvc29ja2pzLWNsaWVudC9saWIvbWFpbi5qcyIsIndlYnBhY2s6Ly9waWRnYy8uL25vZGVfbW9kdWxlcy9zb2NranMtY2xpZW50L2xpYi9zaGltcy5qcyIsIndlYnBhY2s6Ly9waWRnYy8uL25vZGVfbW9kdWxlcy9zb2NranMtY2xpZW50L2xpYi90cmFuc3BvcnQtbGlzdC5qcyIsIndlYnBhY2s6Ly9waWRnYy8uL25vZGVfbW9kdWxlcy9zb2NranMtY2xpZW50L2xpYi90cmFuc3BvcnQvYnJvd3Nlci9hYnN0cmFjdC14aHIuanMiLCJ3ZWJwYWNrOi8vcGlkZ2MvLi9ub2RlX21vZHVsZXMvc29ja2pzLWNsaWVudC9saWIvdHJhbnNwb3J0L2Jyb3dzZXIvZXZlbnRzb3VyY2UuanMiLCJ3ZWJwYWNrOi8vcGlkZ2MvLi9ub2RlX21vZHVsZXMvc29ja2pzLWNsaWVudC9saWIvdHJhbnNwb3J0L2Jyb3dzZXIvd2Vic29ja2V0LmpzIiwid2VicGFjazovL3BpZGdjLy4vbm9kZV9tb2R1bGVzL3NvY2tqcy1jbGllbnQvbGliL3RyYW5zcG9ydC9ldmVudHNvdXJjZS5qcyIsIndlYnBhY2s6Ly9waWRnYy8uL25vZGVfbW9kdWxlcy9zb2NranMtY2xpZW50L2xpYi90cmFuc3BvcnQvaHRtbGZpbGUuanMiLCJ3ZWJwYWNrOi8vcGlkZ2MvLi9ub2RlX21vZHVsZXMvc29ja2pzLWNsaWVudC9saWIvdHJhbnNwb3J0L2lmcmFtZS5qcyIsIndlYnBhY2s6Ly9waWRnYy8uL25vZGVfbW9kdWxlcy9zb2NranMtY2xpZW50L2xpYi90cmFuc3BvcnQvanNvbnAtcG9sbGluZy5qcyIsIndlYnBhY2s6Ly9waWRnYy8uL25vZGVfbW9kdWxlcy9zb2NranMtY2xpZW50L2xpYi90cmFuc3BvcnQvbGliL2FqYXgtYmFzZWQuanMiLCJ3ZWJwYWNrOi8vcGlkZ2MvLi9ub2RlX21vZHVsZXMvc29ja2pzLWNsaWVudC9saWIvdHJhbnNwb3J0L2xpYi9idWZmZXJlZC1zZW5kZXIuanMiLCJ3ZWJwYWNrOi8vcGlkZ2MvLi9ub2RlX21vZHVsZXMvc29ja2pzLWNsaWVudC9saWIvdHJhbnNwb3J0L2xpYi9pZnJhbWUtd3JhcC5qcyIsIndlYnBhY2s6Ly9waWRnYy8uL25vZGVfbW9kdWxlcy9zb2NranMtY2xpZW50L2xpYi90cmFuc3BvcnQvbGliL3BvbGxpbmcuanMiLCJ3ZWJwYWNrOi8vcGlkZ2MvLi9ub2RlX21vZHVsZXMvc29ja2pzLWNsaWVudC9saWIvdHJhbnNwb3J0L2xpYi9zZW5kZXItcmVjZWl2ZXIuanMiLCJ3ZWJwYWNrOi8vcGlkZ2MvLi9ub2RlX21vZHVsZXMvc29ja2pzLWNsaWVudC9saWIvdHJhbnNwb3J0L3JlY2VpdmVyL2V2ZW50c291cmNlLmpzIiwid2VicGFjazovL3BpZGdjLy4vbm9kZV9tb2R1bGVzL3NvY2tqcy1jbGllbnQvbGliL3RyYW5zcG9ydC9yZWNlaXZlci9odG1sZmlsZS5qcyIsIndlYnBhY2s6Ly9waWRnYy8uL25vZGVfbW9kdWxlcy9zb2NranMtY2xpZW50L2xpYi90cmFuc3BvcnQvcmVjZWl2ZXIvanNvbnAuanMiLCJ3ZWJwYWNrOi8vcGlkZ2MvLi9ub2RlX21vZHVsZXMvc29ja2pzLWNsaWVudC9saWIvdHJhbnNwb3J0L3JlY2VpdmVyL3hoci5qcyIsIndlYnBhY2s6Ly9waWRnYy8uL25vZGVfbW9kdWxlcy9zb2NranMtY2xpZW50L2xpYi90cmFuc3BvcnQvc2VuZGVyL2pzb25wLmpzIiwid2VicGFjazovL3BpZGdjLy4vbm9kZV9tb2R1bGVzL3NvY2tqcy1jbGllbnQvbGliL3RyYW5zcG9ydC9zZW5kZXIveGRyLmpzIiwid2VicGFjazovL3BpZGdjLy4vbm9kZV9tb2R1bGVzL3NvY2tqcy1jbGllbnQvbGliL3RyYW5zcG9ydC9zZW5kZXIveGhyLWNvcnMuanMiLCJ3ZWJwYWNrOi8vcGlkZ2MvLi9ub2RlX21vZHVsZXMvc29ja2pzLWNsaWVudC9saWIvdHJhbnNwb3J0L3NlbmRlci94aHItZmFrZS5qcyIsIndlYnBhY2s6Ly9waWRnYy8uL25vZGVfbW9kdWxlcy9zb2NranMtY2xpZW50L2xpYi90cmFuc3BvcnQvc2VuZGVyL3hoci1sb2NhbC5qcyIsIndlYnBhY2s6Ly9waWRnYy8uL25vZGVfbW9kdWxlcy9zb2NranMtY2xpZW50L2xpYi90cmFuc3BvcnQvd2Vic29ja2V0LmpzIiwid2VicGFjazovL3BpZGdjLy4vbm9kZV9tb2R1bGVzL3NvY2tqcy1jbGllbnQvbGliL3RyYW5zcG9ydC94ZHItcG9sbGluZy5qcyIsIndlYnBhY2s6Ly9waWRnYy8uL25vZGVfbW9kdWxlcy9zb2NranMtY2xpZW50L2xpYi90cmFuc3BvcnQveGRyLXN0cmVhbWluZy5qcyIsIndlYnBhY2s6Ly9waWRnYy8uL25vZGVfbW9kdWxlcy9zb2NranMtY2xpZW50L2xpYi90cmFuc3BvcnQveGhyLXBvbGxpbmcuanMiLCJ3ZWJwYWNrOi8vcGlkZ2MvLi9ub2RlX21vZHVsZXMvc29ja2pzLWNsaWVudC9saWIvdHJhbnNwb3J0L3hoci1zdHJlYW1pbmcuanMiLCJ3ZWJwYWNrOi8vcGlkZ2MvLi9ub2RlX21vZHVsZXMvc29ja2pzLWNsaWVudC9saWIvdXRpbHMvYnJvd3Nlci1jcnlwdG8uanMiLCJ3ZWJwYWNrOi8vcGlkZ2MvLi9ub2RlX21vZHVsZXMvc29ja2pzLWNsaWVudC9saWIvdXRpbHMvYnJvd3Nlci5qcyIsIndlYnBhY2s6Ly9waWRnYy8uL25vZGVfbW9kdWxlcy9zb2NranMtY2xpZW50L2xpYi91dGlscy9lc2NhcGUuanMiLCJ3ZWJwYWNrOi8vcGlkZ2MvLi9ub2RlX21vZHVsZXMvc29ja2pzLWNsaWVudC9saWIvdXRpbHMvZXZlbnQuanMiLCJ3ZWJwYWNrOi8vcGlkZ2MvLi9ub2RlX21vZHVsZXMvc29ja2pzLWNsaWVudC9saWIvdXRpbHMvaWZyYW1lLmpzIiwid2VicGFjazovL3BpZGdjLy4vbm9kZV9tb2R1bGVzL3NvY2tqcy1jbGllbnQvbGliL3V0aWxzL2xvZy5qcyIsIndlYnBhY2s6Ly9waWRnYy8uL25vZGVfbW9kdWxlcy9zb2NranMtY2xpZW50L2xpYi91dGlscy9vYmplY3QuanMiLCJ3ZWJwYWNrOi8vcGlkZ2MvLi9ub2RlX21vZHVsZXMvc29ja2pzLWNsaWVudC9saWIvdXRpbHMvcmFuZG9tLmpzIiwid2VicGFjazovL3BpZGdjLy4vbm9kZV9tb2R1bGVzL3NvY2tqcy1jbGllbnQvbGliL3V0aWxzL3RyYW5zcG9ydC5qcyIsIndlYnBhY2s6Ly9waWRnYy8uL25vZGVfbW9kdWxlcy9zb2NranMtY2xpZW50L2xpYi91dGlscy91cmwuanMiLCJ3ZWJwYWNrOi8vcGlkZ2MvLi9ub2RlX21vZHVsZXMvc29ja2pzLWNsaWVudC9saWIvdmVyc2lvbi5qcyIsIndlYnBhY2s6Ly9waWRnYy8uL25vZGVfbW9kdWxlcy91cmwtcGFyc2UvaW5kZXguanMiLCJ3ZWJwYWNrOi8vcGlkZ2Mvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vcGlkZ2Mvd2VicGFjay9ydW50aW1lL2FtZCBvcHRpb25zIiwid2VicGFjazovL3BpZGdjL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL3BpZGdjL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9waWRnYy93ZWJwYWNrL3J1bnRpbWUvZ2xvYmFsIiwid2VicGFjazovL3BpZGdjL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vcGlkZ2Mvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9waWRnYy93ZWJwYWNrL3J1bnRpbWUvbm9kZSBtb2R1bGUgZGVjb3JhdG9yIiwid2VicGFjazovL3BpZGdjLy4vc3JjL21haW4vcmVzb3VyY2VzL3N0YXRpYy9saWIvc3RhdHVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQSw0QkFBNEI7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbURBQW1ELE1BQU0sd0JBQXdCLGdCQUFnQixHQUFHLGtCQUFrQjtBQUN0SDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLDZDOzs7Ozs7Ozs7Ozs7Ozs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDYkEsaUJBQWlCLFNBQUksSUFBSSxTQUFJO0FBQzdCLDJCQUEyQiwrREFBK0QsZ0JBQWdCLEVBQUUsRUFBRTtBQUM5RztBQUNBLG1DQUFtQyxNQUFNLDZCQUE2QixFQUFFLFlBQVksV0FBVyxFQUFFO0FBQ2pHLGtDQUFrQyxNQUFNLGlDQUFpQyxFQUFFLFlBQVksV0FBVyxFQUFFO0FBQ3BHLCtCQUErQixxRkFBcUY7QUFDcEg7QUFDQSxLQUFLO0FBQ0w7QUFDK0M7QUFDYztBQUN2QjtBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLHVEQUFnQjtBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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O1lBQ3JELElBQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7WUFFakMsSUFBSSxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDMUIsSUFBSSxPQUFPLEdBQXdCLFFBQVEsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUF3QixDQUFDO2dCQUMxRix1Q0FBdUM7YUFDMUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsRUFBRTtRQUNDLDBDQUEwQztRQUMxQyxNQUFNLENBQUMsVUFBVSxDQUFDO1lBQ2QsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDNUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN4QixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFTSxTQUFTLGdCQUFnQjtJQUM1QixLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSwrQkFBK0IsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN6RCxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDakIsQ0FBQztBQUVNLFNBQVMsVUFBVTtJQUN0QixJQUFJLFlBQVksR0FBc0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUUsQ0FBQyxLQUFLO0lBQ3BGLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLDhCQUE4QixHQUFHLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN2RSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDakIsQ0FBQztBQUVELDJCQUEyQjtBQUMzQixnQkFBZ0IsRUFBRSxDQUFDIiwiZmlsZSI6InN0YXR1cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGludGVybmFsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhdWdtZW50V2Vic29ja2V0KHdlYlNvY2tldCwgZGVidWcpIHtcbiAgICB3ZWJTb2NrZXQudGVybWluYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCBub09wID0gKCkgPT4geyB9O1xuICAgICAgICAvLyBzZXQgYWxsIGNhbGxiYWNrcyB0byBubyBvcFxuICAgICAgICB0aGlzLm9uZXJyb3IgPSBub09wO1xuICAgICAgICB0aGlzLm9ubWVzc2FnZSA9IG5vT3A7XG4gICAgICAgIHRoaXMub25vcGVuID0gbm9PcDtcbiAgICAgICAgY29uc3QgdHMgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBjb25zdCBvcmlnT25DbG9zZSA9IHRoaXMub25jbG9zZTtcbiAgICAgICAgLy8gVHJhY2sgZGVsYXkgaW4gYWN0dWFsIGNsb3N1cmUgb2YgdGhlIHNvY2tldFxuICAgICAgICB0aGlzLm9uY2xvc2UgPSBjbG9zZUV2ZW50ID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRlbGF5ID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0cy5nZXRUaW1lKCk7XG4gICAgICAgICAgICBkZWJ1ZyhgRGlzY2FyZGVkIHNvY2tldCBjbG9zZWQgYWZ0ZXIgJHtkZWxheX1tcywgd2l0aCBjb2RlL3JlYXNvbjogJHtjbG9zZUV2ZW50LmNvZGV9LyR7Y2xvc2VFdmVudC5yZWFzb259YCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgb3JpZ09uQ2xvc2UuY2FsbCh0aGlzLCB7XG4gICAgICAgICAgICBjb2RlOiA0MDAxLFxuICAgICAgICAgICAgcmVhc29uOiAnSGVhcnRiZWF0IGZhaWx1cmUsIGRpc2NhcmRpbmcgdGhlIHNvY2tldCcsXG4gICAgICAgICAgICB3YXNDbGVhbjogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgIH07XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hdWdtZW50LXdlYnNvY2tldC5qcy5tYXAiLCIvKipcbiAqIFNvbWUgYnl0ZSB2YWx1ZXMsIHVzZWQgYXMgcGVyIFNUT01QIHNwZWNpZmljYXRpb25zLlxuICpcbiAqIFBhcnQgb2YgYEBzdG9tcC9zdG9tcGpzYC5cbiAqXG4gKiBAaW50ZXJuYWxcbiAqL1xuZXhwb3J0IGNvbnN0IEJZVEUgPSB7XG4gICAgLy8gTElORUZFRUQgYnl0ZSAob2N0ZXQgMTApXG4gICAgTEY6ICdcXHgwQScsXG4gICAgLy8gTlVMTCBieXRlIChvY3RldCAwKVxuICAgIE5VTEw6ICdcXHgwMCcsXG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Ynl0ZS5qcy5tYXAiLCJ2YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbmltcG9ydCB7IFN0b21wSGFuZGxlciB9IGZyb20gJy4vc3RvbXAtaGFuZGxlcic7XG5pbXBvcnQgeyBBY3RpdmF0aW9uU3RhdGUsIFN0b21wU29ja2V0U3RhdGUsIH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBWZXJzaW9ucyB9IGZyb20gJy4vdmVyc2lvbnMnO1xuLyoqXG4gKiBTVE9NUCBDbGllbnQgQ2xhc3MuXG4gKlxuICogUGFydCBvZiBgQHN0b21wL3N0b21wanNgLlxuICovXG5leHBvcnQgY2xhc3MgQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYW4gaW5zdGFuY2UuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoY29uZiA9IHt9KSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTVE9NUCB2ZXJzaW9ucyB0byBhdHRlbXB0IGR1cmluZyBTVE9NUCBoYW5kc2hha2UuIEJ5IGRlZmF1bHQgdmVyc2lvbnMgYDEuMGAsIGAxLjFgLCBhbmQgYDEuMmAgYXJlIGF0dGVtcHRlZC5cbiAgICAgICAgICpcbiAgICAgICAgICogRXhhbXBsZTpcbiAgICAgICAgICogYGBgamF2YXNjcmlwdFxuICAgICAgICAgKiAgICAgICAgLy8gVHJ5IG9ubHkgdmVyc2lvbnMgMS4wIGFuZCAxLjFcbiAgICAgICAgICogICAgICAgIGNsaWVudC5zdG9tcFZlcnNpb25zID0gbmV3IFZlcnNpb25zKFsnMS4wJywgJzEuMSddKVxuICAgICAgICAgKiBgYGBcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc3RvbXBWZXJzaW9ucyA9IFZlcnNpb25zLmRlZmF1bHQ7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXaWxsIHJldHJ5IGlmIFN0b21wIGNvbm5lY3Rpb24gaXMgbm90IGVzdGFibGlzaGVkIGluIHNwZWNpZmllZCBtaWxsaXNlY29uZHMuXG4gICAgICAgICAqIERlZmF1bHQgMCwgd2hpY2ggaW1wbGllcyB3YWl0IGZvciBldmVyLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jb25uZWN0aW9uVGltZW91dCA9IDA7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiAgYXV0b21hdGljYWxseSByZWNvbm5lY3Qgd2l0aCBkZWxheSBpbiBtaWxsaXNlY29uZHMsIHNldCB0byAwIHRvIGRpc2FibGUuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnJlY29ubmVjdERlbGF5ID0gNTAwMDtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEluY29taW5nIGhlYXJ0YmVhdCBpbnRlcnZhbCBpbiBtaWxsaXNlY29uZHMuIFNldCB0byAwIHRvIGRpc2FibGUuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmhlYXJ0YmVhdEluY29taW5nID0gMTAwMDA7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBPdXRnb2luZyBoZWFydGJlYXQgaW50ZXJ2YWwgaW4gbWlsbGlzZWNvbmRzLiBTZXQgdG8gMCB0byBkaXNhYmxlLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5oZWFydGJlYXRPdXRnb2luZyA9IDEwMDAwO1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhpcyBzd2l0Y2hlcyBvbiBhIG5vbiBzdGFuZGFyZCBiZWhhdmlvciB3aGlsZSBzZW5kaW5nIFdlYlNvY2tldCBwYWNrZXRzLlxuICAgICAgICAgKiBJdCBzcGxpdHMgbGFyZ2VyICh0ZXh0KSBwYWNrZXRzIGludG8gY2h1bmtzIG9mIFttYXhXZWJTb2NrZXRDaHVua1NpemVde0BsaW5rIENsaWVudCNtYXhXZWJTb2NrZXRDaHVua1NpemV9LlxuICAgICAgICAgKiBPbmx5IEphdmEgU3ByaW5nIGJyb2tlcnMgc2VlbXMgdG8gdXNlIHRoaXMgbW9kZS5cbiAgICAgICAgICpcbiAgICAgICAgICogV2ViU29ja2V0cywgYnkgaXRzZWxmLCBzcGxpdCBsYXJnZSAodGV4dCkgcGFja2V0cyxcbiAgICAgICAgICogc28gaXQgaXMgbm90IG5lZWRlZCB3aXRoIGEgdHJ1bHkgY29tcGxpYW50IFNUT01QL1dlYlNvY2tldCBicm9rZXIuXG4gICAgICAgICAqIEFjdHVhbGx5IHNldHRpbmcgaXQgZm9yIHN1Y2ggYnJva2VyIHdpbGwgY2F1c2UgbGFyZ2UgbWVzc2FnZXMgdG8gZmFpbC5cbiAgICAgICAgICpcbiAgICAgICAgICogYGZhbHNlYCBieSBkZWZhdWx0LlxuICAgICAgICAgKlxuICAgICAgICAgKiBCaW5hcnkgZnJhbWVzIGFyZSBuZXZlciBzcGxpdC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc3BsaXRMYXJnZUZyYW1lcyA9IGZhbHNlO1xuICAgICAgICAvKipcbiAgICAgICAgICogU2VlIFtzcGxpdExhcmdlRnJhbWVzXXtAbGluayBDbGllbnQjc3BsaXRMYXJnZUZyYW1lc30uXG4gICAgICAgICAqIFRoaXMgaGFzIG5vIGVmZmVjdCBpZiBbc3BsaXRMYXJnZUZyYW1lc117QGxpbmsgQ2xpZW50I3NwbGl0TGFyZ2VGcmFtZXN9IGlzIGBmYWxzZWAuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm1heFdlYlNvY2tldENodW5rU2l6ZSA9IDggKiAxMDI0O1xuICAgICAgICAvKipcbiAgICAgICAgICogVXN1YWxseSB0aGVcbiAgICAgICAgICogW3R5cGUgb2YgV2ViU29ja2V0IGZyYW1lXXtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvV2ViU29ja2V0L3NlbmQjUGFyYW1ldGVyc31cbiAgICAgICAgICogaXMgYXV0b21hdGljYWxseSBkZWNpZGVkIGJ5IHR5cGUgb2YgdGhlIHBheWxvYWQuXG4gICAgICAgICAqIERlZmF1bHQgaXMgYGZhbHNlYCwgd2hpY2ggc2hvdWxkIHdvcmsgd2l0aCBhbGwgY29tcGxpYW50IGJyb2tlcnMuXG4gICAgICAgICAqXG4gICAgICAgICAqIFNldCB0aGlzIGZsYWcgdG8gZm9yY2UgYmluYXJ5IGZyYW1lcy5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZm9yY2VCaW5hcnlXU0ZyYW1lcyA9IGZhbHNlO1xuICAgICAgICAvKipcbiAgICAgICAgICogQSBidWcgaW4gUmVhY3ROYXRpdmUgY2hvcHMgYSBzdHJpbmcgb24gb2NjdXJyZW5jZSBvZiBhIE5VTEwuXG4gICAgICAgICAqIFNlZSBpc3N1ZSBbaHR0cHM6Ly9naXRodWIuY29tL3N0b21wLWpzL3N0b21wanMvaXNzdWVzLzg5XXtAbGluayBodHRwczovL2dpdGh1Yi5jb20vc3RvbXAtanMvc3RvbXBqcy9pc3N1ZXMvODl9LlxuICAgICAgICAgKiBUaGlzIG1ha2VzIGluY29taW5nIFdlYlNvY2tldCBtZXNzYWdlcyBpbnZhbGlkIFNUT01QIHBhY2tldHMuXG4gICAgICAgICAqIFNldHRpbmcgdGhpcyBmbGFnIGF0dGVtcHRzIHRvIHJldmVyc2UgdGhlIGRhbWFnZSBieSBhcHBlbmRpbmcgYSBOVUxMLlxuICAgICAgICAgKiBJZiB0aGUgYnJva2VyIHNwbGl0cyBhIGxhcmdlIG1lc3NhZ2UgaW50byBtdWx0aXBsZSBXZWJTb2NrZXQgbWVzc2FnZXMsXG4gICAgICAgICAqIHRoaXMgZmxhZyB3aWxsIGNhdXNlIGRhdGEgbG9zcyBhbmQgYWJub3JtYWwgdGVybWluYXRpb24gb2YgY29ubmVjdGlvbi5cbiAgICAgICAgICpcbiAgICAgICAgICogVGhpcyBpcyBub3QgYW4gaWRlYWwgc29sdXRpb24sIGJ1dCBhIHN0b3AgZ2FwIHVudGlsIHRoZSB1bmRlcmx5aW5nIGlzc3VlIGlzIGZpeGVkIGF0IFJlYWN0TmF0aXZlIGxpYnJhcnkuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmFwcGVuZE1pc3NpbmdOVUxMb25JbmNvbWluZyA9IGZhbHNlO1xuICAgICAgICAvKipcbiAgICAgICAgICogQWN0aXZhdGlvbiBzdGF0ZS5cbiAgICAgICAgICpcbiAgICAgICAgICogSXQgd2lsbCB1c3VhbGx5IGJlIEFDVElWRSBvciBJTkFDVElWRS5cbiAgICAgICAgICogV2hlbiBkZWFjdGl2YXRpbmcgaXQgbWF5IGdvIGZyb20gQUNUSVZFIHRvIElOQUNUSVZFIHdpdGhvdXQgZW50ZXJpbmcgREVBQ1RJVkFUSU5HLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zdGF0ZSA9IEFjdGl2YXRpb25TdGF0ZS5JTkFDVElWRTtcbiAgICAgICAgLy8gRHVtbXkgY2FsbGJhY2tzXG4gICAgICAgIGNvbnN0IG5vT3AgPSAoKSA9PiB7IH07XG4gICAgICAgIHRoaXMuZGVidWcgPSBub09wO1xuICAgICAgICB0aGlzLmJlZm9yZUNvbm5lY3QgPSBub09wO1xuICAgICAgICB0aGlzLm9uQ29ubmVjdCA9IG5vT3A7XG4gICAgICAgIHRoaXMub25EaXNjb25uZWN0ID0gbm9PcDtcbiAgICAgICAgdGhpcy5vblVuaGFuZGxlZE1lc3NhZ2UgPSBub09wO1xuICAgICAgICB0aGlzLm9uVW5oYW5kbGVkUmVjZWlwdCA9IG5vT3A7XG4gICAgICAgIHRoaXMub25VbmhhbmRsZWRGcmFtZSA9IG5vT3A7XG4gICAgICAgIHRoaXMub25TdG9tcEVycm9yID0gbm9PcDtcbiAgICAgICAgdGhpcy5vbldlYlNvY2tldENsb3NlID0gbm9PcDtcbiAgICAgICAgdGhpcy5vbldlYlNvY2tldEVycm9yID0gbm9PcDtcbiAgICAgICAgdGhpcy5sb2dSYXdDb21tdW5pY2F0aW9uID0gZmFsc2U7XG4gICAgICAgIHRoaXMub25DaGFuZ2VTdGF0ZSA9IG5vT3A7XG4gICAgICAgIC8vIFRoZXNlIHBhcmFtZXRlcnMgd291bGQgdHlwaWNhbGx5IGdldCBwcm9wZXIgdmFsdWVzIGJlZm9yZSBjb25uZWN0IGlzIGNhbGxlZFxuICAgICAgICB0aGlzLmNvbm5lY3RIZWFkZXJzID0ge307XG4gICAgICAgIHRoaXMuX2Rpc2Nvbm5lY3RIZWFkZXJzID0ge307XG4gICAgICAgIC8vIEFwcGx5IGNvbmZpZ3VyYXRpb25cbiAgICAgICAgdGhpcy5jb25maWd1cmUoY29uZik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVuZGVybHlpbmcgV2ViU29ja2V0IGluc3RhbmNlLCBSRUFET05MWS5cbiAgICAgKi9cbiAgICBnZXQgd2ViU29ja2V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc3RvbXBIYW5kbGVyID8gdGhpcy5fc3RvbXBIYW5kbGVyLl93ZWJTb2NrZXQgOiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERpc2Nvbm5lY3Rpb24gaGVhZGVycy5cbiAgICAgKi9cbiAgICBnZXQgZGlzY29ubmVjdEhlYWRlcnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kaXNjb25uZWN0SGVhZGVycztcbiAgICB9XG4gICAgc2V0IGRpc2Nvbm5lY3RIZWFkZXJzKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX2Rpc2Nvbm5lY3RIZWFkZXJzID0gdmFsdWU7XG4gICAgICAgIGlmICh0aGlzLl9zdG9tcEhhbmRsZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX3N0b21wSGFuZGxlci5kaXNjb25uZWN0SGVhZGVycyA9IHRoaXMuX2Rpc2Nvbm5lY3RIZWFkZXJzO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIGB0cnVlYCBpZiB0aGVyZSBpcyBhIGFjdGl2ZSBjb25uZWN0aW9uIHdpdGggU1RPTVAgQnJva2VyXG4gICAgICovXG4gICAgZ2V0IGNvbm5lY3RlZCgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fc3RvbXBIYW5kbGVyICYmIHRoaXMuX3N0b21wSGFuZGxlci5jb25uZWN0ZWQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIHZlcnNpb24gb2YgU1RPTVAgcHJvdG9jb2wgbmVnb3RpYXRlZCB3aXRoIHRoZSBzZXJ2ZXIsIFJFQURPTkxZXG4gICAgICovXG4gICAgZ2V0IGNvbm5lY3RlZFZlcnNpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zdG9tcEhhbmRsZXIgPyB0aGlzLl9zdG9tcEhhbmRsZXIuY29ubmVjdGVkVmVyc2lvbiA6IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogaWYgdGhlIGNsaWVudCBpcyBhY3RpdmUgKGNvbm5lY3RlZCBvciBnb2luZyB0byByZWNvbm5lY3QpXG4gICAgICovXG4gICAgZ2V0IGFjdGl2ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUgPT09IEFjdGl2YXRpb25TdGF0ZS5BQ1RJVkU7XG4gICAgfVxuICAgIF9jaGFuZ2VTdGF0ZShzdGF0ZSkge1xuICAgICAgICB0aGlzLnN0YXRlID0gc3RhdGU7XG4gICAgICAgIHRoaXMub25DaGFuZ2VTdGF0ZShzdGF0ZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBjb25maWd1cmF0aW9uLlxuICAgICAqL1xuICAgIGNvbmZpZ3VyZShjb25mKSB7XG4gICAgICAgIC8vIGJ1bGsgYXNzaWduIGFsbCBwcm9wZXJ0aWVzIHRvIHRoaXNcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCBjb25mKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSW5pdGlhdGUgdGhlIGNvbm5lY3Rpb24gd2l0aCB0aGUgYnJva2VyLlxuICAgICAqIElmIHRoZSBjb25uZWN0aW9uIGJyZWFrcywgYXMgcGVyIFtDbGllbnQjcmVjb25uZWN0RGVsYXlde0BsaW5rIENsaWVudCNyZWNvbm5lY3REZWxheX0sXG4gICAgICogaXQgd2lsbCBrZWVwIHRyeWluZyB0byByZWNvbm5lY3QuXG4gICAgICpcbiAgICAgKiBDYWxsIFtDbGllbnQjZGVhY3RpdmF0ZV17QGxpbmsgQ2xpZW50I2RlYWN0aXZhdGV9IHRvIGRpc2Nvbm5lY3QgYW5kIHN0b3AgcmVjb25uZWN0aW9uIGF0dGVtcHRzLlxuICAgICAqL1xuICAgIGFjdGl2YXRlKCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZSA9PT0gQWN0aXZhdGlvblN0YXRlLkRFQUNUSVZBVElORykge1xuICAgICAgICAgICAgdGhpcy5kZWJ1ZygnU3RpbGwgREVBQ1RJVkFUSU5HLCBwbGVhc2UgYXdhaXQgY2FsbCB0byBkZWFjdGl2YXRlIGJlZm9yZSB0cnlpbmcgdG8gcmUtYWN0aXZhdGUnKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU3RpbGwgREVBQ1RJVkFUSU5HLCBjYW4gbm90IGFjdGl2YXRlIG5vdycpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZSkge1xuICAgICAgICAgICAgdGhpcy5kZWJ1ZygnQWxyZWFkeSBBQ1RJVkUsIGlnbm9yaW5nIHJlcXVlc3QgdG8gYWN0aXZhdGUnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9jaGFuZ2VTdGF0ZShBY3RpdmF0aW9uU3RhdGUuQUNUSVZFKTtcbiAgICAgICAgdGhpcy5fY29ubmVjdCgpO1xuICAgIH1cbiAgICBfY29ubmVjdCgpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbm5lY3RlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVidWcoJ1NUT01QOiBhbHJlYWR5IGNvbm5lY3RlZCwgbm90aGluZyB0byBkbycpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHlpZWxkIHRoaXMuYmVmb3JlQ29ubmVjdCgpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmFjdGl2ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVidWcoJ0NsaWVudCBoYXMgYmVlbiBtYXJrZWQgaW5hY3RpdmUsIHdpbGwgbm90IGF0dGVtcHQgdG8gY29ubmVjdCcpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHNldHVwIGNvbm5lY3Rpb24gd2F0Y2hlclxuICAgICAgICAgICAgaWYgKHRoaXMuY29ubmVjdGlvblRpbWVvdXQgPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY29ubmVjdGlvbldhdGNoZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ29ubmVjdGlvbiBub3QgZXN0YWJsaXNoZWQsIGNsb3NlIHRoZSB1bmRlcmx5aW5nIHNvY2tldFxuICAgICAgICAgICAgICAgICAgICAvLyBhIHJlY29ubmVjdGlvbiB3aWxsIGJlIGF0dGVtcHRlZFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlYnVnKGBDb25uZWN0aW9uIG5vdCBlc3RhYmxpc2hlZCBpbiAke3RoaXMuY29ubmVjdGlvblRpbWVvdXR9bXMsIGNsb3Npbmcgc29ja2V0YCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZm9yY2VEaXNjb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgfSwgdGhpcy5jb25uZWN0aW9uVGltZW91dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmRlYnVnKCdPcGVuaW5nIFdlYiBTb2NrZXQuLi4nKTtcbiAgICAgICAgICAgIC8vIEdldCB0aGUgYWN0dWFsIFdlYlNvY2tldCAob3IgYSBzaW1pbGFyIG9iamVjdClcbiAgICAgICAgICAgIGNvbnN0IHdlYlNvY2tldCA9IHRoaXMuX2NyZWF0ZVdlYlNvY2tldCgpO1xuICAgICAgICAgICAgdGhpcy5fc3RvbXBIYW5kbGVyID0gbmV3IFN0b21wSGFuZGxlcih0aGlzLCB3ZWJTb2NrZXQsIHtcbiAgICAgICAgICAgICAgICBkZWJ1ZzogdGhpcy5kZWJ1ZyxcbiAgICAgICAgICAgICAgICBzdG9tcFZlcnNpb25zOiB0aGlzLnN0b21wVmVyc2lvbnMsXG4gICAgICAgICAgICAgICAgY29ubmVjdEhlYWRlcnM6IHRoaXMuY29ubmVjdEhlYWRlcnMsXG4gICAgICAgICAgICAgICAgZGlzY29ubmVjdEhlYWRlcnM6IHRoaXMuX2Rpc2Nvbm5lY3RIZWFkZXJzLFxuICAgICAgICAgICAgICAgIGhlYXJ0YmVhdEluY29taW5nOiB0aGlzLmhlYXJ0YmVhdEluY29taW5nLFxuICAgICAgICAgICAgICAgIGhlYXJ0YmVhdE91dGdvaW5nOiB0aGlzLmhlYXJ0YmVhdE91dGdvaW5nLFxuICAgICAgICAgICAgICAgIHNwbGl0TGFyZ2VGcmFtZXM6IHRoaXMuc3BsaXRMYXJnZUZyYW1lcyxcbiAgICAgICAgICAgICAgICBtYXhXZWJTb2NrZXRDaHVua1NpemU6IHRoaXMubWF4V2ViU29ja2V0Q2h1bmtTaXplLFxuICAgICAgICAgICAgICAgIGZvcmNlQmluYXJ5V1NGcmFtZXM6IHRoaXMuZm9yY2VCaW5hcnlXU0ZyYW1lcyxcbiAgICAgICAgICAgICAgICBsb2dSYXdDb21tdW5pY2F0aW9uOiB0aGlzLmxvZ1Jhd0NvbW11bmljYXRpb24sXG4gICAgICAgICAgICAgICAgYXBwZW5kTWlzc2luZ05VTExvbkluY29taW5nOiB0aGlzLmFwcGVuZE1pc3NpbmdOVUxMb25JbmNvbWluZyxcbiAgICAgICAgICAgICAgICBkaXNjYXJkV2Vic29ja2V0T25Db21tRmFpbHVyZTogdGhpcy5kaXNjYXJkV2Vic29ja2V0T25Db21tRmFpbHVyZSxcbiAgICAgICAgICAgICAgICBvbkNvbm5lY3Q6IGZyYW1lID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU3VjY2Vzc2Z1bGx5IGNvbm5lY3RlZCwgc3RvcCB0aGUgY29ubmVjdGlvbiB3YXRjaGVyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9jb25uZWN0aW9uV2F0Y2hlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2Nvbm5lY3Rpb25XYXRjaGVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3Rpb25XYXRjaGVyID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5hY3RpdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVidWcoJ1NUT01QIGdvdCBjb25uZWN0ZWQgd2hpbGUgZGVhY3RpdmF0ZSB3YXMgaXNzdWVkLCB3aWxsIGRpc2Nvbm5lY3Qgbm93Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kaXNwb3NlU3RvbXBIYW5kbGVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkNvbm5lY3QoZnJhbWUpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25EaXNjb25uZWN0OiBmcmFtZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25EaXNjb25uZWN0KGZyYW1lKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uU3RvbXBFcnJvcjogZnJhbWUgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uU3RvbXBFcnJvcihmcmFtZSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvbldlYlNvY2tldENsb3NlOiBldnQgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zdG9tcEhhbmRsZXIgPSB1bmRlZmluZWQ7IC8vIGEgbmV3IG9uZSB3aWxsIGJlIGNyZWF0ZWQgaW4gY2FzZSBvZiBhIHJlY29ubmVjdFxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZSA9PT0gQWN0aXZhdGlvblN0YXRlLkRFQUNUSVZBVElORykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWFyayBkZWFjdGl2YXRpb24gY29tcGxldGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Jlc29sdmVTb2NrZXRDbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVzb2x2ZVNvY2tldENsb3NlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2hhbmdlU3RhdGUoQWN0aXZhdGlvblN0YXRlLklOQUNUSVZFKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uV2ViU29ja2V0Q2xvc2UoZXZ0KTtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGNhbGxiYWNrIGlzIGNhbGxlZCBiZWZvcmUgYXR0ZW1wdGluZyB0byByZWNvbm5lY3QsIHRoaXMgd291bGQgYWxsb3cgdGhlIGNsaWVudFxuICAgICAgICAgICAgICAgICAgICAvLyB0byBiZSBgZGVhY3RpdmF0ZWRgIGluIHRoZSBjYWxsYmFjay5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuYWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zY2hlZHVsZV9yZWNvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25XZWJTb2NrZXRFcnJvcjogZXZ0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbldlYlNvY2tldEVycm9yKGV2dCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvblVuaGFuZGxlZE1lc3NhZ2U6IG1lc3NhZ2UgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uVW5oYW5kbGVkTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uVW5oYW5kbGVkUmVjZWlwdDogZnJhbWUgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uVW5oYW5kbGVkUmVjZWlwdChmcmFtZSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvblVuaGFuZGxlZEZyYW1lOiBmcmFtZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25VbmhhbmRsZWRGcmFtZShmcmFtZSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5fc3RvbXBIYW5kbGVyLnN0YXJ0KCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBfY3JlYXRlV2ViU29ja2V0KCkge1xuICAgICAgICBsZXQgd2ViU29ja2V0O1xuICAgICAgICBpZiAodGhpcy53ZWJTb2NrZXRGYWN0b3J5KSB7XG4gICAgICAgICAgICB3ZWJTb2NrZXQgPSB0aGlzLndlYlNvY2tldEZhY3RvcnkoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHdlYlNvY2tldCA9IG5ldyBXZWJTb2NrZXQodGhpcy5icm9rZXJVUkwsIHRoaXMuc3RvbXBWZXJzaW9ucy5wcm90b2NvbFZlcnNpb25zKCkpO1xuICAgICAgICB9XG4gICAgICAgIHdlYlNvY2tldC5iaW5hcnlUeXBlID0gJ2FycmF5YnVmZmVyJztcbiAgICAgICAgcmV0dXJuIHdlYlNvY2tldDtcbiAgICB9XG4gICAgX3NjaGVkdWxlX3JlY29ubmVjdCgpIHtcbiAgICAgICAgaWYgKHRoaXMucmVjb25uZWN0RGVsYXkgPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmRlYnVnKGBTVE9NUDogc2NoZWR1bGluZyByZWNvbm5lY3Rpb24gaW4gJHt0aGlzLnJlY29ubmVjdERlbGF5fW1zYCk7XG4gICAgICAgICAgICB0aGlzLl9yZWNvbm5lY3RvciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3QoKTtcbiAgICAgICAgICAgIH0sIHRoaXMucmVjb25uZWN0RGVsYXkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERpc2Nvbm5lY3QgaWYgY29ubmVjdGVkIGFuZCBzdG9wIGF1dG8gcmVjb25uZWN0IGxvb3AuXG4gICAgICogQXBwcm9wcmlhdGUgY2FsbGJhY2tzIHdpbGwgYmUgaW52b2tlZCBpZiB1bmRlcmx5aW5nIFNUT01QIGNvbm5lY3Rpb24gd2FzIGNvbm5lY3RlZC5cbiAgICAgKlxuICAgICAqIFRoaXMgY2FsbCBpcyBhc3luYywgaXQgd2lsbCByZXNvbHZlIGltbWVkaWF0ZWx5IGlmIHRoZXJlIGlzIG5vIHVuZGVybHlpbmcgYWN0aXZlIHdlYnNvY2tldCxcbiAgICAgKiBvdGhlcndpc2UsIGl0IHdpbGwgcmVzb2x2ZSBhZnRlciB1bmRlcmx5aW5nIHdlYnNvY2tldCBpcyBwcm9wZXJseSBkaXNwb3NlZC5cbiAgICAgKlxuICAgICAqIFRvIHJlYWN0aXZhdGUgeW91IGNhbiBjYWxsIFtDbGllbnQjYWN0aXZhdGVde0BsaW5rIENsaWVudCNhY3RpdmF0ZX0uXG4gICAgICovXG4gICAgZGVhY3RpdmF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIGxldCByZXRQcm9taXNlO1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUgIT09IEFjdGl2YXRpb25TdGF0ZS5BQ1RJVkUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlYnVnKGBBbHJlYWR5ICR7QWN0aXZhdGlvblN0YXRlW3RoaXMuc3RhdGVdfSwgaWdub3JpbmcgY2FsbCB0byBkZWFjdGl2YXRlYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fY2hhbmdlU3RhdGUoQWN0aXZhdGlvblN0YXRlLkRFQUNUSVZBVElORyk7XG4gICAgICAgICAgICAvLyBDbGVhciBpZiBhIHJlY29ubmVjdGlvbiB3YXMgc2NoZWR1bGVkXG4gICAgICAgICAgICBpZiAodGhpcy5fcmVjb25uZWN0b3IpIHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fcmVjb25uZWN0b3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuX3N0b21wSGFuZGxlciAmJlxuICAgICAgICAgICAgICAgIHRoaXMud2ViU29ja2V0LnJlYWR5U3RhdGUgIT09IFN0b21wU29ja2V0U3RhdGUuQ0xPU0VEKSB7XG4gICAgICAgICAgICAgICAgLy8gd2UgbmVlZCB0byB3YWl0IGZvciB1bmRlcmx5aW5nIHdlYnNvY2tldCB0byBjbG9zZVxuICAgICAgICAgICAgICAgIHJldFByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Jlc29sdmVTb2NrZXRDbG9zZSA9IHJlc29sdmU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBpbmRpY2F0ZSB0aGF0IGF1dG8gcmVjb25uZWN0IGxvb3Agc2hvdWxkIHRlcm1pbmF0ZVxuICAgICAgICAgICAgICAgIHRoaXMuX2NoYW5nZVN0YXRlKEFjdGl2YXRpb25TdGF0ZS5JTkFDVElWRSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fZGlzcG9zZVN0b21wSGFuZGxlcigpO1xuICAgICAgICAgICAgcmV0dXJuIHJldFByb21pc2U7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBGb3JjZSBkaXNjb25uZWN0IGlmIHRoZXJlIGlzIGFuIGFjdGl2ZSBjb25uZWN0aW9uIGJ5IGRpcmVjdGx5IGNsb3NpbmcgdGhlIHVuZGVybHlpbmcgV2ViU29ja2V0LlxuICAgICAqIFRoaXMgaXMgZGlmZmVyZW50IHRoYW4gYSBub3JtYWwgZGlzY29ubmVjdCB3aGVyZSBhIERJU0NPTk5FQ1Qgc2VxdWVuY2UgaXMgY2FycmllZCBvdXQgd2l0aCB0aGUgYnJva2VyLlxuICAgICAqIEFmdGVyIGZvcmNpbmcgZGlzY29ubmVjdCwgYXV0b21hdGljIHJlY29ubmVjdCB3aWxsIGJlIGF0dGVtcHRlZC5cbiAgICAgKiBUbyBzdG9wIGZ1cnRoZXIgcmVjb25uZWN0cyBjYWxsIFtDbGllbnQjZGVhY3RpdmF0ZV17QGxpbmsgQ2xpZW50I2RlYWN0aXZhdGV9IGFzIHdlbGwuXG4gICAgICovXG4gICAgZm9yY2VEaXNjb25uZWN0KCkge1xuICAgICAgICBpZiAodGhpcy5fc3RvbXBIYW5kbGVyKSB7XG4gICAgICAgICAgICB0aGlzLl9zdG9tcEhhbmRsZXIuZm9yY2VEaXNjb25uZWN0KCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgX2Rpc3Bvc2VTdG9tcEhhbmRsZXIoKSB7XG4gICAgICAgIC8vIERpc3Bvc2UgU1RPTVAgSGFuZGxlclxuICAgICAgICBpZiAodGhpcy5fc3RvbXBIYW5kbGVyKSB7XG4gICAgICAgICAgICB0aGlzLl9zdG9tcEhhbmRsZXIuZGlzcG9zZSgpO1xuICAgICAgICAgICAgdGhpcy5fc3RvbXBIYW5kbGVyID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZW5kIGEgbWVzc2FnZSB0byBhIG5hbWVkIGRlc3RpbmF0aW9uLiBSZWZlciB0byB5b3VyIFNUT01QIGJyb2tlciBkb2N1bWVudGF0aW9uIGZvciB0eXBlc1xuICAgICAqIGFuZCBuYW1pbmcgb2YgZGVzdGluYXRpb25zLlxuICAgICAqXG4gICAgICogU1RPTVAgcHJvdG9jb2wgc3BlY2lmaWVzIGFuZCBzdWdnZXN0cyBzb21lIGhlYWRlcnMgYW5kIGFsc28gYWxsb3dzIGJyb2tlciBzcGVjaWZpYyBoZWFkZXJzLlxuICAgICAqXG4gICAgICogYGJvZHlgIG11c3QgYmUgU3RyaW5nLlxuICAgICAqIFlvdSB3aWxsIG5lZWQgdG8gY292ZXJ0IHRoZSBwYXlsb2FkIHRvIHN0cmluZyBpbiBjYXNlIGl0IGlzIG5vdCBzdHJpbmcgKGUuZy4gSlNPTikuXG4gICAgICpcbiAgICAgKiBUbyBzZW5kIGEgYmluYXJ5IG1lc3NhZ2UgYm9keSB1c2UgYmluYXJ5Qm9keSBwYXJhbWV0ZXIuIEl0IHNob3VsZCBiZSBhXG4gICAgICogW1VpbnQ4QXJyYXldKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL1VpbnQ4QXJyYXkpLlxuICAgICAqIFNvbWV0aW1lcyBicm9rZXJzIG1heSBub3Qgc3VwcG9ydCBiaW5hcnkgZnJhbWVzIG91dCBvZiB0aGUgYm94LlxuICAgICAqIFBsZWFzZSBjaGVjayB5b3VyIGJyb2tlciBkb2N1bWVudGF0aW9uLlxuICAgICAqXG4gICAgICogYGNvbnRlbnQtbGVuZ3RoYCBoZWFkZXIgaXMgYXV0b21hdGljYWxseSBhZGRlZCB0byB0aGUgU1RPTVAgRnJhbWUgc2VudCB0byB0aGUgYnJva2VyLlxuICAgICAqIFNldCBgc2tpcENvbnRlbnRMZW5ndGhIZWFkZXJgIHRvIGluZGljYXRlIHRoYXQgYGNvbnRlbnQtbGVuZ3RoYCBoZWFkZXIgc2hvdWxkIG5vdCBiZSBhZGRlZC5cbiAgICAgKiBGb3IgYmluYXJ5IG1lc3NhZ2VzIGBjb250ZW50LWxlbmd0aGAgaGVhZGVyIGlzIGFsd2F5cyBhZGRlZC5cbiAgICAgKlxuICAgICAqIENhdXRpb246IFRoZSBicm9rZXIgd2lsbCwgbW9zdCBsaWtlbHksIHJlcG9ydCBhbiBlcnJvciBhbmQgZGlzY29ubmVjdCBpZiBtZXNzYWdlIGJvZHkgaGFzIE5VTEwgb2N0ZXQocylcbiAgICAgKiBhbmQgYGNvbnRlbnQtbGVuZ3RoYCBoZWFkZXIgaXMgbWlzc2luZy5cbiAgICAgKlxuICAgICAqIGBgYGphdmFzY3JpcHRcbiAgICAgKiAgICAgICAgY2xpZW50LnB1Ymxpc2goe2Rlc3RpbmF0aW9uOiBcIi9xdWV1ZS90ZXN0XCIsIGhlYWRlcnM6IHtwcmlvcml0eTogOX0sIGJvZHk6IFwiSGVsbG8sIFNUT01QXCJ9KTtcbiAgICAgKlxuICAgICAqICAgICAgICAvLyBPbmx5IGRlc3RpbmF0aW9uIGlzIG1hbmRhdG9yeSBwYXJhbWV0ZXJcbiAgICAgKiAgICAgICAgY2xpZW50LnB1Ymxpc2goe2Rlc3RpbmF0aW9uOiBcIi9xdWV1ZS90ZXN0XCIsIGJvZHk6IFwiSGVsbG8sIFNUT01QXCJ9KTtcbiAgICAgKlxuICAgICAqICAgICAgICAvLyBTa2lwIGNvbnRlbnQtbGVuZ3RoIGhlYWRlciBpbiB0aGUgZnJhbWUgdG8gdGhlIGJyb2tlclxuICAgICAqICAgICAgICBjbGllbnQucHVibGlzaCh7XCIvcXVldWUvdGVzdFwiLCBib2R5OiBcIkhlbGxvLCBTVE9NUFwiLCBza2lwQ29udGVudExlbmd0aEhlYWRlcjogdHJ1ZX0pO1xuICAgICAqXG4gICAgICogICAgICAgIHZhciBiaW5hcnlEYXRhID0gZ2VuZXJhdGVCaW5hcnlEYXRhKCk7IC8vIFRoaXMgbmVlZCB0byBiZSBvZiB0eXBlIFVpbnQ4QXJyYXlcbiAgICAgKiAgICAgICAgLy8gc2V0dGluZyBjb250ZW50LXR5cGUgaGVhZGVyIGlzIG5vdCBtYW5kYXRvcnksIGhvd2V2ZXIgYSBnb29kIHByYWN0aWNlXG4gICAgICogICAgICAgIGNsaWVudC5wdWJsaXNoKHtkZXN0aW5hdGlvbjogJy90b3BpYy9zcGVjaWFsJywgYmluYXJ5Qm9keTogYmluYXJ5RGF0YSxcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7J2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nfX0pO1xuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHB1Ymxpc2gocGFyYW1zKSB7XG4gICAgICAgIHRoaXMuX3N0b21wSGFuZGxlci5wdWJsaXNoKHBhcmFtcyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNUT01QIGJyb2tlcnMgbWF5IGNhcnJ5IG91dCBvcGVyYXRpb24gYXN5bmNocm9ub3VzbHkgYW5kIGFsbG93IHJlcXVlc3RpbmcgZm9yIGFja25vd2xlZGdlbWVudC5cbiAgICAgKiBUbyByZXF1ZXN0IGFuIGFja25vd2xlZGdlbWVudCwgYSBgcmVjZWlwdGAgaGVhZGVyIG5lZWRzIHRvIGJlIHNlbnQgd2l0aCB0aGUgYWN0dWFsIHJlcXVlc3QuXG4gICAgICogVGhlIHZhbHVlIChzYXkgcmVjZWlwdC1pZCkgZm9yIHRoaXMgaGVhZGVyIG5lZWRzIHRvIGJlIHVuaXF1ZSBmb3IgZWFjaCB1c2UuIFR5cGljYWxseSBhIHNlcXVlbmNlLCBhIFVVSUQsIGFcbiAgICAgKiByYW5kb20gbnVtYmVyIG9yIGEgY29tYmluYXRpb24gbWF5IGJlIHVzZWQuXG4gICAgICpcbiAgICAgKiBBIGNvbXBsYWludCBicm9rZXIgd2lsbCBzZW5kIGEgUkVDRUlQVCBmcmFtZSB3aGVuIGFuIG9wZXJhdGlvbiBoYXMgYWN0dWFsbHkgYmVlbiBjb21wbGV0ZWQuXG4gICAgICogVGhlIG9wZXJhdGlvbiBuZWVkcyB0byBiZSBtYXRjaGVkIGJhc2VkIGluIHRoZSB2YWx1ZSBvZiB0aGUgcmVjZWlwdC1pZC5cbiAgICAgKlxuICAgICAqIFRoaXMgbWV0aG9kIGFsbG93IHdhdGNoaW5nIGZvciBhIHJlY2VpcHQgYW5kIGludm9rZSB0aGUgY2FsbGJhY2tcbiAgICAgKiB3aGVuIGNvcnJlc3BvbmRpbmcgcmVjZWlwdCBoYXMgYmVlbiByZWNlaXZlZC5cbiAgICAgKlxuICAgICAqIFRoZSBhY3R1YWwge0BsaW5rIEZyYW1lSW1wbH0gd2lsbCBiZSBwYXNzZWQgYXMgcGFyYW1ldGVyIHRvIHRoZSBjYWxsYmFjay5cbiAgICAgKlxuICAgICAqIEV4YW1wbGU6XG4gICAgICogYGBgamF2YXNjcmlwdFxuICAgICAqICAgICAgICAvLyBTdWJzY3JpYmluZyB3aXRoIGFja25vd2xlZGdlbWVudFxuICAgICAqICAgICAgICBsZXQgcmVjZWlwdElkID0gcmFuZG9tVGV4dCgpO1xuICAgICAqXG4gICAgICogICAgICAgIGNsaWVudC53YXRjaEZvclJlY2VpcHQocmVjZWlwdElkLCBmdW5jdGlvbigpIHtcbiAgICAgKiAgICAgICAgICAvLyBXaWxsIGJlIGNhbGxlZCBhZnRlciBzZXJ2ZXIgYWNrbm93bGVkZ2VzXG4gICAgICogICAgICAgIH0pO1xuICAgICAqXG4gICAgICogICAgICAgIGNsaWVudC5zdWJzY3JpYmUoVEVTVC5kZXN0aW5hdGlvbiwgb25NZXNzYWdlLCB7cmVjZWlwdDogcmVjZWlwdElkfSk7XG4gICAgICpcbiAgICAgKlxuICAgICAqICAgICAgICAvLyBQdWJsaXNoaW5nIHdpdGggYWNrbm93bGVkZ2VtZW50XG4gICAgICogICAgICAgIHJlY2VpcHRJZCA9IHJhbmRvbVRleHQoKTtcbiAgICAgKlxuICAgICAqICAgICAgICBjbGllbnQud2F0Y2hGb3JSZWNlaXB0KHJlY2VpcHRJZCwgZnVuY3Rpb24oKSB7XG4gICAgICogICAgICAgICAgLy8gV2lsbCBiZSBjYWxsZWQgYWZ0ZXIgc2VydmVyIGFja25vd2xlZGdlc1xuICAgICAqICAgICAgICB9KTtcbiAgICAgKiAgICAgICAgY2xpZW50LnB1Ymxpc2goe2Rlc3RpbmF0aW9uOiBURVNULmRlc3RpbmF0aW9uLCBoZWFkZXJzOiB7cmVjZWlwdDogcmVjZWlwdElkfSwgYm9keTogbXNnfSk7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgd2F0Y2hGb3JSZWNlaXB0KHJlY2VpcHRJZCwgY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5fc3RvbXBIYW5kbGVyLndhdGNoRm9yUmVjZWlwdChyZWNlaXB0SWQsIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU3Vic2NyaWJlIHRvIGEgU1RPTVAgQnJva2VyIGxvY2F0aW9uLiBUaGUgY2FsbGJhY2sgd2lsbCBiZSBpbnZva2VkIGZvciBlYWNoIHJlY2VpdmVkIG1lc3NhZ2Ugd2l0aFxuICAgICAqIHRoZSB7QGxpbmsgSU1lc3NhZ2V9IGFzIGFyZ3VtZW50LlxuICAgICAqXG4gICAgICogTm90ZTogVGhlIGxpYnJhcnkgd2lsbCBnZW5lcmF0ZSBhbiB1bmlxdWUgSUQgaWYgdGhlcmUgaXMgbm9uZSBwcm92aWRlZCBpbiB0aGUgaGVhZGVycy5cbiAgICAgKiAgICAgICBUbyB1c2UgeW91ciBvd24gSUQsIHBhc3MgaXQgdXNpbmcgdGhlIGhlYWRlcnMgYXJndW1lbnQuXG4gICAgICpcbiAgICAgKiBgYGBqYXZhc2NyaXB0XG4gICAgICogICAgICAgIGNhbGxiYWNrID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICAqICAgICAgICAvLyBjYWxsZWQgd2hlbiB0aGUgY2xpZW50IHJlY2VpdmVzIGEgU1RPTVAgbWVzc2FnZSBmcm9tIHRoZSBzZXJ2ZXJcbiAgICAgKiAgICAgICAgICBpZiAobWVzc2FnZS5ib2R5KSB7XG4gICAgICogICAgICAgICAgICBhbGVydChcImdvdCBtZXNzYWdlIHdpdGggYm9keSBcIiArIG1lc3NhZ2UuYm9keSlcbiAgICAgKiAgICAgICAgICB9IGVsc2Uge1xuICAgICAqICAgICAgICAgICAgYWxlcnQoXCJnb3QgZW1wdHkgbWVzc2FnZVwiKTtcbiAgICAgKiAgICAgICAgICB9XG4gICAgICogICAgICAgIH0pO1xuICAgICAqXG4gICAgICogICAgICAgIHZhciBzdWJzY3JpcHRpb24gPSBjbGllbnQuc3Vic2NyaWJlKFwiL3F1ZXVlL3Rlc3RcIiwgY2FsbGJhY2spO1xuICAgICAqXG4gICAgICogICAgICAgIC8vIEV4cGxpY2l0IHN1YnNjcmlwdGlvbiBpZFxuICAgICAqICAgICAgICB2YXIgbXlTdWJJZCA9ICdteS1zdWJzY3JpcHRpb24taWQtMDAxJztcbiAgICAgKiAgICAgICAgdmFyIHN1YnNjcmlwdGlvbiA9IGNsaWVudC5zdWJzY3JpYmUoZGVzdGluYXRpb24sIGNhbGxiYWNrLCB7IGlkOiBteVN1YklkIH0pO1xuICAgICAqIGBgYFxuICAgICAqL1xuICAgIHN1YnNjcmliZShkZXN0aW5hdGlvbiwgY2FsbGJhY2ssIGhlYWRlcnMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc3RvbXBIYW5kbGVyLnN1YnNjcmliZShkZXN0aW5hdGlvbiwgY2FsbGJhY2ssIGhlYWRlcnMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJdCBpcyBwcmVmZXJhYmxlIHRvIHVuc3Vic2NyaWJlIGZyb20gYSBzdWJzY3JpcHRpb24gYnkgY2FsbGluZ1xuICAgICAqIGB1bnN1YnNjcmliZSgpYCBkaXJlY3RseSBvbiB7QGxpbmsgU3RvbXBTdWJzY3JpcHRpb259IHJldHVybmVkIGJ5IGBjbGllbnQuc3Vic2NyaWJlKClgOlxuICAgICAqXG4gICAgICogYGBgamF2YXNjcmlwdFxuICAgICAqICAgICAgICB2YXIgc3Vic2NyaXB0aW9uID0gY2xpZW50LnN1YnNjcmliZShkZXN0aW5hdGlvbiwgb25tZXNzYWdlKTtcbiAgICAgKiAgICAgICAgLy8gLi4uXG4gICAgICogICAgICAgIHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogU2VlOiBodHRwOi8vc3RvbXAuZ2l0aHViLmNvbS9zdG9tcC1zcGVjaWZpY2F0aW9uLTEuMi5odG1sI1VOU1VCU0NSSUJFIFVOU1VCU0NSSUJFIEZyYW1lXG4gICAgICovXG4gICAgdW5zdWJzY3JpYmUoaWQsIGhlYWRlcnMgPSB7fSkge1xuICAgICAgICB0aGlzLl9zdG9tcEhhbmRsZXIudW5zdWJzY3JpYmUoaWQsIGhlYWRlcnMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTdGFydCBhIHRyYW5zYWN0aW9uLCB0aGUgcmV0dXJuZWQge0BsaW5rIElUcmFuc2FjdGlvbn0gaGFzIG1ldGhvZHMgLSBbY29tbWl0XXtAbGluayBJVHJhbnNhY3Rpb24jY29tbWl0fVxuICAgICAqIGFuZCBbYWJvcnRde0BsaW5rIElUcmFuc2FjdGlvbiNhYm9ydH0uXG4gICAgICpcbiAgICAgKiBgdHJhbnNhY3Rpb25JZGAgaXMgb3B0aW9uYWwsIGlmIG5vdCBwYXNzZWQgdGhlIGxpYnJhcnkgd2lsbCBnZW5lcmF0ZSBpdCBpbnRlcm5hbGx5LlxuICAgICAqL1xuICAgIGJlZ2luKHRyYW5zYWN0aW9uSWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0b21wSGFuZGxlci5iZWdpbih0cmFuc2FjdGlvbklkKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ29tbWl0IGEgdHJhbnNhY3Rpb24uXG4gICAgICpcbiAgICAgKiBJdCBpcyBwcmVmZXJhYmxlIHRvIGNvbW1pdCBhIHRyYW5zYWN0aW9uIGJ5IGNhbGxpbmcgW2NvbW1pdF17QGxpbmsgSVRyYW5zYWN0aW9uI2NvbW1pdH0gZGlyZWN0bHkgb25cbiAgICAgKiB7QGxpbmsgSVRyYW5zYWN0aW9ufSByZXR1cm5lZCBieSBbY2xpZW50LmJlZ2luXXtAbGluayBDbGllbnQjYmVnaW59LlxuICAgICAqXG4gICAgICogYGBgamF2YXNjcmlwdFxuICAgICAqICAgICAgICB2YXIgdHggPSBjbGllbnQuYmVnaW4odHhJZCk7XG4gICAgICogICAgICAgIC8vLi4uXG4gICAgICogICAgICAgIHR4LmNvbW1pdCgpO1xuICAgICAqIGBgYFxuICAgICAqL1xuICAgIGNvbW1pdCh0cmFuc2FjdGlvbklkKSB7XG4gICAgICAgIHRoaXMuX3N0b21wSGFuZGxlci5jb21taXQodHJhbnNhY3Rpb25JZCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFib3J0IGEgdHJhbnNhY3Rpb24uXG4gICAgICogSXQgaXMgcHJlZmVyYWJsZSB0byBhYm9ydCBhIHRyYW5zYWN0aW9uIGJ5IGNhbGxpbmcgW2Fib3J0XXtAbGluayBJVHJhbnNhY3Rpb24jYWJvcnR9IGRpcmVjdGx5IG9uXG4gICAgICoge0BsaW5rIElUcmFuc2FjdGlvbn0gcmV0dXJuZWQgYnkgW2NsaWVudC5iZWdpbl17QGxpbmsgQ2xpZW50I2JlZ2lufS5cbiAgICAgKlxuICAgICAqIGBgYGphdmFzY3JpcHRcbiAgICAgKiAgICAgICAgdmFyIHR4ID0gY2xpZW50LmJlZ2luKHR4SWQpO1xuICAgICAqICAgICAgICAvLy4uLlxuICAgICAqICAgICAgICB0eC5hYm9ydCgpO1xuICAgICAqIGBgYFxuICAgICAqL1xuICAgIGFib3J0KHRyYW5zYWN0aW9uSWQpIHtcbiAgICAgICAgdGhpcy5fc3RvbXBIYW5kbGVyLmFib3J0KHRyYW5zYWN0aW9uSWQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBQ0sgYSBtZXNzYWdlLiBJdCBpcyBwcmVmZXJhYmxlIHRvIGFja25vd2xlZGdlIGEgbWVzc2FnZSBieSBjYWxsaW5nIFthY2tde0BsaW5rIElNZXNzYWdlI2Fja30gZGlyZWN0bHlcbiAgICAgKiBvbiB0aGUge0BsaW5rIElNZXNzYWdlfSBoYW5kbGVkIGJ5IGEgc3Vic2NyaXB0aW9uIGNhbGxiYWNrOlxuICAgICAqXG4gICAgICogYGBgamF2YXNjcmlwdFxuICAgICAqICAgICAgICB2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgICAqICAgICAgICAgIC8vIHByb2Nlc3MgdGhlIG1lc3NhZ2VcbiAgICAgKiAgICAgICAgICAvLyBhY2tub3dsZWRnZSBpdFxuICAgICAqICAgICAgICAgIG1lc3NhZ2UuYWNrKCk7XG4gICAgICogICAgICAgIH07XG4gICAgICogICAgICAgIGNsaWVudC5zdWJzY3JpYmUoZGVzdGluYXRpb24sIGNhbGxiYWNrLCB7J2Fjayc6ICdjbGllbnQnfSk7XG4gICAgICogYGBgXG4gICAgICovXG4gICAgYWNrKG1lc3NhZ2VJZCwgc3Vic2NyaXB0aW9uSWQsIGhlYWRlcnMgPSB7fSkge1xuICAgICAgICB0aGlzLl9zdG9tcEhhbmRsZXIuYWNrKG1lc3NhZ2VJZCwgc3Vic2NyaXB0aW9uSWQsIGhlYWRlcnMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBOQUNLIGEgbWVzc2FnZS4gSXQgaXMgcHJlZmVyYWJsZSB0byBhY2tub3dsZWRnZSBhIG1lc3NhZ2UgYnkgY2FsbGluZyBbbmFja117QGxpbmsgSU1lc3NhZ2UjbmFja30gZGlyZWN0bHlcbiAgICAgKiBvbiB0aGUge0BsaW5rIElNZXNzYWdlfSBoYW5kbGVkIGJ5IGEgc3Vic2NyaXB0aW9uIGNhbGxiYWNrOlxuICAgICAqXG4gICAgICogYGBgamF2YXNjcmlwdFxuICAgICAqICAgICAgICB2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgICAqICAgICAgICAgIC8vIHByb2Nlc3MgdGhlIG1lc3NhZ2VcbiAgICAgKiAgICAgICAgICAvLyBhbiBlcnJvciBvY2N1cnMsIG5hY2sgaXRcbiAgICAgKiAgICAgICAgICBtZXNzYWdlLm5hY2soKTtcbiAgICAgKiAgICAgICAgfTtcbiAgICAgKiAgICAgICAgY2xpZW50LnN1YnNjcmliZShkZXN0aW5hdGlvbiwgY2FsbGJhY2ssIHsnYWNrJzogJ2NsaWVudCd9KTtcbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBuYWNrKG1lc3NhZ2VJZCwgc3Vic2NyaXB0aW9uSWQsIGhlYWRlcnMgPSB7fSkge1xuICAgICAgICB0aGlzLl9zdG9tcEhhbmRsZXIubmFjayhtZXNzYWdlSWQsIHN1YnNjcmlwdGlvbklkLCBoZWFkZXJzKTtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jbGllbnQuanMubWFwIiwiaW1wb3J0IHsgQ2xpZW50IH0gZnJvbSAnLi4vY2xpZW50JztcbmltcG9ydCB7IEhlYXJ0YmVhdEluZm8gfSBmcm9tICcuL2hlYXJ0YmVhdC1pbmZvJztcbi8qKlxuICogQXZhaWxhYmxlIGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5LCBwbGVhc2Ugc2hpZnQgdG8gdXNpbmcge0BsaW5rIENsaWVudH0uXG4gKlxuICogKipEZXByZWNhdGVkKipcbiAqXG4gKiBQYXJ0IG9mIGBAc3RvbXAvc3RvbXBqc2AuXG4gKlxuICogVG8gdXBncmFkZSwgcGxlYXNlIGZvbGxvdyB0aGUgW1VwZ3JhZGUgR3VpZGVdKC4uL2FkZGl0aW9uYWwtZG9jdW1lbnRhdGlvbi91cGdyYWRpbmcuaHRtbClcbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBhdENsaWVudCBleHRlbmRzIENsaWVudCB7XG4gICAgLyoqXG4gICAgICogQXZhaWxhYmxlIGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5LCBwbGVhc2Ugc2hpZnQgdG8gdXNpbmcge0BsaW5rIENsaWVudH1cbiAgICAgKiBhbmQgW0NsaWVudCN3ZWJTb2NrZXRGYWN0b3J5XXtAbGluayBDbGllbnQjd2ViU29ja2V0RmFjdG9yeX0uXG4gICAgICpcbiAgICAgKiAqKkRlcHJlY2F0ZWQqKlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICovXG4gICAgY29uc3RydWN0b3Iod2ViU29ja2V0RmFjdG9yeSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICAvKipcbiAgICAgICAgICogSXQgaXMgbm8gb3Agbm93LiBObyBsb25nZXIgbmVlZGVkLiBMYXJnZSBwYWNrZXRzIHdvcmsgb3V0IG9mIHRoZSBib3guXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm1heFdlYlNvY2tldEZyYW1lU2l6ZSA9IDE2ICogMTAyNDtcbiAgICAgICAgdGhpcy5faGVhcnRiZWF0SW5mbyA9IG5ldyBIZWFydGJlYXRJbmZvKHRoaXMpO1xuICAgICAgICB0aGlzLnJlY29ubmVjdF9kZWxheSA9IDA7XG4gICAgICAgIHRoaXMud2ViU29ja2V0RmFjdG9yeSA9IHdlYlNvY2tldEZhY3Rvcnk7XG4gICAgICAgIC8vIERlZmF1bHQgZnJvbSBwcmV2aW91cyB2ZXJzaW9uXG4gICAgICAgIHRoaXMuZGVidWcgPSAoLi4ubWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coLi4ubWVzc2FnZSk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIF9wYXJzZUNvbm5lY3QoLi4uYXJncykge1xuICAgICAgICBsZXQgY2xvc2VFdmVudENhbGxiYWNrO1xuICAgICAgICBsZXQgY29ubmVjdENhbGxiYWNrO1xuICAgICAgICBsZXQgZXJyb3JDYWxsYmFjaztcbiAgICAgICAgbGV0IGhlYWRlcnMgPSB7fTtcbiAgICAgICAgaWYgKGFyZ3MubGVuZ3RoIDwgMikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb25uZWN0IHJlcXVpcmVzIGF0IGxlYXN0IDIgYXJndW1lbnRzJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBhcmdzWzFdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBbaGVhZGVycywgY29ubmVjdENhbGxiYWNrLCBlcnJvckNhbGxiYWNrLCBjbG9zZUV2ZW50Q2FsbGJhY2tdID0gYXJncztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnMubG9naW4sXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJzLnBhc3Njb2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29ubmVjdENhbGxiYWNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JDYWxsYmFjayxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlRXZlbnRDYWxsYmFjayxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnMuaG9zdCxcbiAgICAgICAgICAgICAgICAgICAgXSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnMubG9naW4sXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJzLnBhc3Njb2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29ubmVjdENhbGxiYWNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JDYWxsYmFjayxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlRXZlbnRDYWxsYmFjayxcbiAgICAgICAgICAgICAgICAgICAgXSA9IGFyZ3M7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtoZWFkZXJzLCBjb25uZWN0Q2FsbGJhY2ssIGVycm9yQ2FsbGJhY2ssIGNsb3NlRXZlbnRDYWxsYmFja107XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEF2YWlsYWJsZSBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eSwgcGxlYXNlIHNoaWZ0IHRvIHVzaW5nIFtDbGllbnQjYWN0aXZhdGVde0BsaW5rIENsaWVudCNhY3RpdmF0ZX0uXG4gICAgICpcbiAgICAgKiAqKkRlcHJlY2F0ZWQqKlxuICAgICAqXG4gICAgICogVGhlIGBjb25uZWN0YCBtZXRob2QgYWNjZXB0cyBkaWZmZXJlbnQgbnVtYmVyIG9mIGFyZ3VtZW50cyBhbmQgdHlwZXMuIFNlZSB0aGUgT3ZlcmxvYWRzIGxpc3QuIFVzZSB0aGVcbiAgICAgKiB2ZXJzaW9uIHdpdGggaGVhZGVycyB0byBwYXNzIHlvdXIgYnJva2VyIHNwZWNpZmljIG9wdGlvbnMuXG4gICAgICpcbiAgICAgKiBvdmVybG9hZHM6XG4gICAgICogLSBjb25uZWN0KGhlYWRlcnMsIGNvbm5lY3RDYWxsYmFjaylcbiAgICAgKiAtIGNvbm5lY3QoaGVhZGVycywgY29ubmVjdENhbGxiYWNrLCBlcnJvckNhbGxiYWNrKVxuICAgICAqIC0gY29ubmVjdChsb2dpbiwgcGFzc2NvZGUsIGNvbm5lY3RDYWxsYmFjaylcbiAgICAgKiAtIGNvbm5lY3QobG9naW4sIHBhc3Njb2RlLCBjb25uZWN0Q2FsbGJhY2ssIGVycm9yQ2FsbGJhY2spXG4gICAgICogLSBjb25uZWN0KGxvZ2luLCBwYXNzY29kZSwgY29ubmVjdENhbGxiYWNrLCBlcnJvckNhbGxiYWNrLCBjbG9zZUV2ZW50Q2FsbGJhY2spXG4gICAgICogLSBjb25uZWN0KGxvZ2luLCBwYXNzY29kZSwgY29ubmVjdENhbGxiYWNrLCBlcnJvckNhbGxiYWNrLCBjbG9zZUV2ZW50Q2FsbGJhY2ssIGhvc3QpXG4gICAgICpcbiAgICAgKiBwYXJhbXM6XG4gICAgICogLSBoZWFkZXJzLCBzZWUgW0NsaWVudCNjb25uZWN0SGVhZGVyc117QGxpbmsgQ2xpZW50I2Nvbm5lY3RIZWFkZXJzfVxuICAgICAqIC0gY29ubmVjdENhbGxiYWNrLCBzZWUgW0NsaWVudCNvbkNvbm5lY3Rde0BsaW5rIENsaWVudCNvbkNvbm5lY3R9XG4gICAgICogLSBlcnJvckNhbGxiYWNrLCBzZWUgW0NsaWVudCNvblN0b21wRXJyb3Jde0BsaW5rIENsaWVudCNvblN0b21wRXJyb3J9XG4gICAgICogLSBjbG9zZUV2ZW50Q2FsbGJhY2ssIHNlZSBbQ2xpZW50I29uV2ViU29ja2V0Q2xvc2Vde0BsaW5rIENsaWVudCNvbldlYlNvY2tldENsb3NlfVxuICAgICAqIC0gbG9naW4gW1N0cmluZ10sIHNlZSBbQ2xpZW50I2Nvbm5lY3RIZWFkZXJzXSguLi9jbGFzc2VzL0NsaWVudC5odG1sI2Nvbm5lY3RIZWFkZXJzKVxuICAgICAqIC0gcGFzc2NvZGUgW1N0cmluZ10sIFtDbGllbnQjY29ubmVjdEhlYWRlcnNdKC4uL2NsYXNzZXMvQ2xpZW50Lmh0bWwjY29ubmVjdEhlYWRlcnMpXG4gICAgICogLSBob3N0IFtTdHJpbmddLCBzZWUgW0NsaWVudCNjb25uZWN0SGVhZGVyc10oLi4vY2xhc3Nlcy9DbGllbnQuaHRtbCNjb25uZWN0SGVhZGVycylcbiAgICAgKlxuICAgICAqIFRvIHVwZ3JhZGUsIHBsZWFzZSBmb2xsb3cgdGhlIFtVcGdyYWRlIEd1aWRlXSguLi9hZGRpdGlvbmFsLWRvY3VtZW50YXRpb24vdXBncmFkaW5nLmh0bWwpXG4gICAgICovXG4gICAgY29ubmVjdCguLi5hcmdzKSB7XG4gICAgICAgIGNvbnN0IG91dCA9IHRoaXMuX3BhcnNlQ29ubmVjdCguLi5hcmdzKTtcbiAgICAgICAgaWYgKG91dFswXSkge1xuICAgICAgICAgICAgdGhpcy5jb25uZWN0SGVhZGVycyA9IG91dFswXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3V0WzFdKSB7XG4gICAgICAgICAgICB0aGlzLm9uQ29ubmVjdCA9IG91dFsxXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3V0WzJdKSB7XG4gICAgICAgICAgICB0aGlzLm9uU3RvbXBFcnJvciA9IG91dFsyXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3V0WzNdKSB7XG4gICAgICAgICAgICB0aGlzLm9uV2ViU29ja2V0Q2xvc2UgPSBvdXRbM107XG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIuYWN0aXZhdGUoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQXZhaWxhYmxlIGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5LCBwbGVhc2Ugc2hpZnQgdG8gdXNpbmcgW0NsaWVudCNkZWFjdGl2YXRlXXtAbGluayBDbGllbnQjZGVhY3RpdmF0ZX0uXG4gICAgICpcbiAgICAgKiAqKkRlcHJlY2F0ZWQqKlxuICAgICAqXG4gICAgICogU2VlOlxuICAgICAqIFtDbGllbnQjb25EaXNjb25uZWN0XXtAbGluayBDbGllbnQjb25EaXNjb25uZWN0fSwgYW5kXG4gICAgICogW0NsaWVudCNkaXNjb25uZWN0SGVhZGVyc117QGxpbmsgQ2xpZW50I2Rpc2Nvbm5lY3RIZWFkZXJzfVxuICAgICAqXG4gICAgICogVG8gdXBncmFkZSwgcGxlYXNlIGZvbGxvdyB0aGUgW1VwZ3JhZGUgR3VpZGVdKC4uL2FkZGl0aW9uYWwtZG9jdW1lbnRhdGlvbi91cGdyYWRpbmcuaHRtbClcbiAgICAgKi9cbiAgICBkaXNjb25uZWN0KGRpc2Nvbm5lY3RDYWxsYmFjaywgaGVhZGVycyA9IHt9KSB7XG4gICAgICAgIGlmIChkaXNjb25uZWN0Q2FsbGJhY2spIHtcbiAgICAgICAgICAgIHRoaXMub25EaXNjb25uZWN0ID0gZGlzY29ubmVjdENhbGxiYWNrO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGlzY29ubmVjdEhlYWRlcnMgPSBoZWFkZXJzO1xuICAgICAgICBzdXBlci5kZWFjdGl2YXRlKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEF2YWlsYWJsZSBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eSwgdXNlIFtDbGllbnQjcHVibGlzaF17QGxpbmsgQ2xpZW50I3B1Ymxpc2h9LlxuICAgICAqXG4gICAgICogU2VuZCBhIG1lc3NhZ2UgdG8gYSBuYW1lZCBkZXN0aW5hdGlvbi4gUmVmZXIgdG8geW91ciBTVE9NUCBicm9rZXIgZG9jdW1lbnRhdGlvbiBmb3IgdHlwZXNcbiAgICAgKiBhbmQgbmFtaW5nIG9mIGRlc3RpbmF0aW9ucy4gVGhlIGhlYWRlcnMgd2lsbCwgdHlwaWNhbGx5LCBiZSBhdmFpbGFibGUgdG8gdGhlIHN1YnNjcmliZXIuXG4gICAgICogSG93ZXZlciwgdGhlcmUgbWF5IGJlIHNwZWNpYWwgcHVycG9zZSBoZWFkZXJzIGNvcnJlc3BvbmRpbmcgdG8geW91ciBTVE9NUCBicm9rZXIuXG4gICAgICpcbiAgICAgKiAgKipEZXByZWNhdGVkKiosIHVzZSBbQ2xpZW50I3B1Ymxpc2hde0BsaW5rIENsaWVudCNwdWJsaXNofVxuICAgICAqXG4gICAgICogTm90ZTogQm9keSBtdXN0IGJlIFN0cmluZy4gWW91IHdpbGwgbmVlZCB0byBjb3ZlcnQgdGhlIHBheWxvYWQgdG8gc3RyaW5nIGluIGNhc2UgaXQgaXMgbm90IHN0cmluZyAoZS5nLiBKU09OKVxuICAgICAqXG4gICAgICogYGBgamF2YXNjcmlwdFxuICAgICAqICAgICAgICBjbGllbnQuc2VuZChcIi9xdWV1ZS90ZXN0XCIsIHtwcmlvcml0eTogOX0sIFwiSGVsbG8sIFNUT01QXCIpO1xuICAgICAqXG4gICAgICogICAgICAgIC8vIElmIHlvdSB3YW50IHRvIHNlbmQgYSBtZXNzYWdlIHdpdGggYSBib2R5LCB5b3UgbXVzdCBhbHNvIHBhc3MgdGhlIGhlYWRlcnMgYXJndW1lbnQuXG4gICAgICogICAgICAgIGNsaWVudC5zZW5kKFwiL3F1ZXVlL3Rlc3RcIiwge30sIFwiSGVsbG8sIFNUT01QXCIpO1xuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogVG8gdXBncmFkZSwgcGxlYXNlIGZvbGxvdyB0aGUgW1VwZ3JhZGUgR3VpZGVdKC4uL2FkZGl0aW9uYWwtZG9jdW1lbnRhdGlvbi91cGdyYWRpbmcuaHRtbClcbiAgICAgKi9cbiAgICBzZW5kKGRlc3RpbmF0aW9uLCBoZWFkZXJzID0ge30sIGJvZHkgPSAnJykge1xuICAgICAgICBoZWFkZXJzID0gT2JqZWN0LmFzc2lnbih7fSwgaGVhZGVycyk7XG4gICAgICAgIGNvbnN0IHNraXBDb250ZW50TGVuZ3RoSGVhZGVyID0gaGVhZGVyc1snY29udGVudC1sZW5ndGgnXSA9PT0gZmFsc2U7XG4gICAgICAgIGlmIChza2lwQ29udGVudExlbmd0aEhlYWRlcikge1xuICAgICAgICAgICAgZGVsZXRlIGhlYWRlcnNbJ2NvbnRlbnQtbGVuZ3RoJ107XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wdWJsaXNoKHtcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uLFxuICAgICAgICAgICAgaGVhZGVyczogaGVhZGVycyxcbiAgICAgICAgICAgIGJvZHksXG4gICAgICAgICAgICBza2lwQ29udGVudExlbmd0aEhlYWRlcixcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEF2YWlsYWJsZSBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eSwgcmVuYW1lZCB0byBbQ2xpZW50I3JlY29ubmVjdERlbGF5XXtAbGluayBDbGllbnQjcmVjb25uZWN0RGVsYXl9LlxuICAgICAqXG4gICAgICogKipEZXByZWNhdGVkKipcbiAgICAgKi9cbiAgICBzZXQgcmVjb25uZWN0X2RlbGF5KHZhbHVlKSB7XG4gICAgICAgIHRoaXMucmVjb25uZWN0RGVsYXkgPSB2YWx1ZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQXZhaWxhYmxlIGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5LCByZW5hbWVkIHRvIFtDbGllbnQjd2ViU29ja2V0XXtAbGluayBDbGllbnQjd2ViU29ja2V0fS5cbiAgICAgKlxuICAgICAqICoqRGVwcmVjYXRlZCoqXG4gICAgICovXG4gICAgZ2V0IHdzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy53ZWJTb2NrZXQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEF2YWlsYWJsZSBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eSwgcmVuYW1lZCB0byBbQ2xpZW50I2Nvbm5lY3RlZFZlcnNpb25de0BsaW5rIENsaWVudCNjb25uZWN0ZWRWZXJzaW9ufS5cbiAgICAgKlxuICAgICAqICoqRGVwcmVjYXRlZCoqXG4gICAgICovXG4gICAgZ2V0IHZlcnNpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbm5lY3RlZFZlcnNpb247XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEF2YWlsYWJsZSBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eSwgcmVuYW1lZCB0byBbQ2xpZW50I29uVW5oYW5kbGVkTWVzc2FnZV17QGxpbmsgQ2xpZW50I29uVW5oYW5kbGVkTWVzc2FnZX0uXG4gICAgICpcbiAgICAgKiAqKkRlcHJlY2F0ZWQqKlxuICAgICAqL1xuICAgIGdldCBvbnJlY2VpdmUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9uVW5oYW5kbGVkTWVzc2FnZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQXZhaWxhYmxlIGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5LCByZW5hbWVkIHRvIFtDbGllbnQjb25VbmhhbmRsZWRNZXNzYWdlXXtAbGluayBDbGllbnQjb25VbmhhbmRsZWRNZXNzYWdlfS5cbiAgICAgKlxuICAgICAqICoqRGVwcmVjYXRlZCoqXG4gICAgICovXG4gICAgc2V0IG9ucmVjZWl2ZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLm9uVW5oYW5kbGVkTWVzc2FnZSA9IHZhbHVlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBdmFpbGFibGUgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHksIHJlbmFtZWQgdG8gW0NsaWVudCNvblVuaGFuZGxlZFJlY2VpcHRde0BsaW5rIENsaWVudCNvblVuaGFuZGxlZFJlY2VpcHR9LlxuICAgICAqIFByZWZlciB1c2luZyBbQ2xpZW50I3dhdGNoRm9yUmVjZWlwdF17QGxpbmsgQ2xpZW50I3dhdGNoRm9yUmVjZWlwdH0uXG4gICAgICpcbiAgICAgKiAqKkRlcHJlY2F0ZWQqKlxuICAgICAqL1xuICAgIGdldCBvbnJlY2VpcHQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9uVW5oYW5kbGVkUmVjZWlwdDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQXZhaWxhYmxlIGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5LCByZW5hbWVkIHRvIFtDbGllbnQjb25VbmhhbmRsZWRSZWNlaXB0XXtAbGluayBDbGllbnQjb25VbmhhbmRsZWRSZWNlaXB0fS5cbiAgICAgKlxuICAgICAqICoqRGVwcmVjYXRlZCoqXG4gICAgICovXG4gICAgc2V0IG9ucmVjZWlwdCh2YWx1ZSkge1xuICAgICAgICB0aGlzLm9uVW5oYW5kbGVkUmVjZWlwdCA9IHZhbHVlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBdmFpbGFibGUgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHksIHJlbmFtZWQgdG8gW0NsaWVudCNoZWFydGJlYXRJbmNvbWluZ117QGxpbmsgQ2xpZW50I2hlYXJ0YmVhdEluY29taW5nfVxuICAgICAqIFtDbGllbnQjaGVhcnRiZWF0T3V0Z29pbmdde0BsaW5rIENsaWVudCNoZWFydGJlYXRPdXRnb2luZ30uXG4gICAgICpcbiAgICAgKiAqKkRlcHJlY2F0ZWQqKlxuICAgICAqL1xuICAgIGdldCBoZWFydGJlYXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9oZWFydGJlYXRJbmZvO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBdmFpbGFibGUgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHksIHJlbmFtZWQgdG8gW0NsaWVudCNoZWFydGJlYXRJbmNvbWluZ117QGxpbmsgQ2xpZW50I2hlYXJ0YmVhdEluY29taW5nfVxuICAgICAqIFtDbGllbnQjaGVhcnRiZWF0T3V0Z29pbmdde0BsaW5rIENsaWVudCNoZWFydGJlYXRPdXRnb2luZ30uXG4gICAgICpcbiAgICAgKiAqKkRlcHJlY2F0ZWQqKlxuICAgICAqL1xuICAgIHNldCBoZWFydGJlYXQodmFsdWUpIHtcbiAgICAgICAgdGhpcy5oZWFydGJlYXRJbmNvbWluZyA9IHZhbHVlLmluY29taW5nO1xuICAgICAgICB0aGlzLmhlYXJ0YmVhdE91dGdvaW5nID0gdmFsdWUub3V0Z29pbmc7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29tcGF0LWNsaWVudC5qcy5tYXAiLCIvKipcbiAqIFBhcnQgb2YgYEBzdG9tcC9zdG9tcGpzYC5cbiAqXG4gKiBAaW50ZXJuYWxcbiAqL1xuZXhwb3J0IGNsYXNzIEhlYXJ0YmVhdEluZm8ge1xuICAgIGNvbnN0cnVjdG9yKGNsaWVudCkge1xuICAgICAgICB0aGlzLmNsaWVudCA9IGNsaWVudDtcbiAgICB9XG4gICAgZ2V0IG91dGdvaW5nKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jbGllbnQuaGVhcnRiZWF0T3V0Z29pbmc7XG4gICAgfVxuICAgIHNldCBvdXRnb2luZyh2YWx1ZSkge1xuICAgICAgICB0aGlzLmNsaWVudC5oZWFydGJlYXRPdXRnb2luZyA9IHZhbHVlO1xuICAgIH1cbiAgICBnZXQgaW5jb21pbmcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNsaWVudC5oZWFydGJlYXRJbmNvbWluZztcbiAgICB9XG4gICAgc2V0IGluY29taW5nKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuY2xpZW50LmhlYXJ0YmVhdEluY29taW5nID0gdmFsdWU7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aGVhcnRiZWF0LWluZm8uanMubWFwIiwiaW1wb3J0IHsgVmVyc2lvbnMgfSBmcm9tICcuLi92ZXJzaW9ucyc7XG5pbXBvcnQgeyBDb21wYXRDbGllbnQgfSBmcm9tICcuL2NvbXBhdC1jbGllbnQnO1xuLyoqXG4gKiBTVE9NUCBDbGFzcywgYWN0cyBsaWtlIGEgZmFjdG9yeSB0byBjcmVhdGUge0BsaW5rIENsaWVudH0uXG4gKlxuICogUGFydCBvZiBgQHN0b21wL3N0b21wanNgLlxuICpcbiAqICoqRGVwcmVjYXRlZCoqXG4gKlxuICogSXQgd2lsbCBiZSByZW1vdmVkIGluIG5leHQgbWFqb3IgdmVyc2lvbi4gUGxlYXNlIHN3aXRjaCB0byB7QGxpbmsgQ2xpZW50fS5cbiAqL1xuZXhwb3J0IGNsYXNzIFN0b21wIHtcbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBjcmVhdGVzIGEgV2ViU29ja2V0IGNsaWVudCB0aGF0IGlzIGNvbm5lY3RlZCB0b1xuICAgICAqIHRoZSBTVE9NUCBzZXJ2ZXIgbG9jYXRlZCBhdCB0aGUgdXJsLlxuICAgICAqXG4gICAgICogYGBgamF2YXNjcmlwdFxuICAgICAqICAgICAgICB2YXIgdXJsID0gXCJ3czovL2xvY2FsaG9zdDo2MTYxNC9zdG9tcFwiO1xuICAgICAqICAgICAgICB2YXIgY2xpZW50ID0gU3RvbXAuY2xpZW50KHVybCk7XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiAqKkRlcHJlY2F0ZWQqKlxuICAgICAqXG4gICAgICogSXQgd2lsbCBiZSByZW1vdmVkIGluIG5leHQgbWFqb3IgdmVyc2lvbi4gUGxlYXNlIHN3aXRjaCB0byB7QGxpbmsgQ2xpZW50fVxuICAgICAqIHVzaW5nIFtDbGllbnQjYnJva2VyVVJMXXtAbGluayBDbGllbnQjYnJva2VyVVJMfS5cbiAgICAgKi9cbiAgICBzdGF0aWMgY2xpZW50KHVybCwgcHJvdG9jb2xzKSB7XG4gICAgICAgIC8vIFRoaXMgaXMgYSBoYWNrIHRvIGFsbG93IGFub3RoZXIgaW1wbGVtZW50YXRpb24gdGhhbiB0aGUgc3RhbmRhcmRcbiAgICAgICAgLy8gSFRNTDUgV2ViU29ja2V0IGNsYXNzLlxuICAgICAgICAvL1xuICAgICAgICAvLyBJdCBpcyBwb3NzaWJsZSB0byB1c2UgYW5vdGhlciBjbGFzcyBieSBjYWxsaW5nXG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgICBTdG9tcC5XZWJTb2NrZXRDbGFzcyA9IE1veldlYlNvY2tldFxuICAgICAgICAvL1xuICAgICAgICAvLyAqcHJpb3IqIHRvIGNhbGwgYFN0b21wLmNsaWVudCgpYC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gVGhpcyBoYWNrIGlzIGRlcHJlY2F0ZWQgYW5kIGBTdG9tcC5vdmVyKClgIG1ldGhvZCBzaG91bGQgYmUgdXNlZFxuICAgICAgICAvLyBpbnN0ZWFkLlxuICAgICAgICAvLyBTZWUgcmVtYXJrcyBvbiB0aGUgZnVuY3Rpb24gU3RvbXAub3ZlclxuICAgICAgICBpZiAocHJvdG9jb2xzID09IG51bGwpIHtcbiAgICAgICAgICAgIHByb3RvY29scyA9IFZlcnNpb25zLmRlZmF1bHQucHJvdG9jb2xWZXJzaW9ucygpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHdzRm4gPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBrbGFzcyA9IFN0b21wLldlYlNvY2tldENsYXNzIHx8IFdlYlNvY2tldDtcbiAgICAgICAgICAgIHJldHVybiBuZXcga2xhc3ModXJsLCBwcm90b2NvbHMpO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gbmV3IENvbXBhdENsaWVudCh3c0ZuKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaXMgYW4gYWx0ZXJuYXRpdmUgdG8gW1N0b21wI2NsaWVudF17QGxpbmsgU3RvbXAjY2xpZW50fSB0byBsZXQgdGhlIHVzZXJcbiAgICAgKiBzcGVjaWZ5IHRoZSBXZWJTb2NrZXQgdG8gdXNlIChlaXRoZXIgYSBzdGFuZGFyZCBIVE1MNSBXZWJTb2NrZXQgb3JcbiAgICAgKiBhIHNpbWlsYXIgb2JqZWN0KS5cbiAgICAgKlxuICAgICAqIEluIG9yZGVyIHRvIHN1cHBvcnQgcmVjb25uZWN0aW9uLCB0aGUgZnVuY3Rpb24gQ2xpZW50Ll9jb25uZWN0IHNob3VsZCBiZSBjYWxsYWJsZSBtb3JlIHRoYW4gb25jZS5cbiAgICAgKiBXaGlsZSByZWNvbm5lY3RpbmdcbiAgICAgKiBhIG5ldyBpbnN0YW5jZSBvZiB1bmRlcmx5aW5nIHRyYW5zcG9ydCAoVENQIFNvY2tldCwgV2ViU29ja2V0IG9yIFNvY2tKUykgd2lsbCBiZSBuZWVkZWQuIFNvLCB0aGlzIGZ1bmN0aW9uXG4gICAgICogYWx0ZXJuYXRpdmVseSBhbGxvd3MgcGFzc2luZyBhIGZ1bmN0aW9uIHRoYXQgc2hvdWxkIHJldHVybiBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgdW5kZXJseWluZyBzb2NrZXQuXG4gICAgICpcbiAgICAgKiBgYGBqYXZhc2NyaXB0XG4gICAgICogICAgICAgIHZhciBjbGllbnQgPSBTdG9tcC5vdmVyKGZ1bmN0aW9uKCl7XG4gICAgICogICAgICAgICAgcmV0dXJuIG5ldyBXZWJTb2NrZXQoJ3dzOi8vbG9jYWxob3N0OjE1Njc0L3dzJylcbiAgICAgKiAgICAgICAgfSk7XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiAqKkRlcHJlY2F0ZWQqKlxuICAgICAqXG4gICAgICogSXQgd2lsbCBiZSByZW1vdmVkIGluIG5leHQgbWFqb3IgdmVyc2lvbi4gUGxlYXNlIHN3aXRjaCB0byB7QGxpbmsgQ2xpZW50fVxuICAgICAqIHVzaW5nIFtDbGllbnQjd2ViU29ja2V0RmFjdG9yeV17QGxpbmsgQ2xpZW50I3dlYlNvY2tldEZhY3Rvcnl9LlxuICAgICAqL1xuICAgIHN0YXRpYyBvdmVyKHdzKSB7XG4gICAgICAgIGxldCB3c0ZuO1xuICAgICAgICBpZiAodHlwZW9mIHdzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB3c0ZuID0gd3M7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1N0b21wLm92ZXIgZGlkIG5vdCByZWNlaXZlIGEgZmFjdG9yeSwgYXV0byByZWNvbm5lY3Qgd2lsbCBub3Qgd29yay4gJyArXG4gICAgICAgICAgICAgICAgJ1BsZWFzZSBzZWUgaHR0cHM6Ly9zdG9tcC1qcy5naXRodWIuaW8vYXBpLWRvY3MvbGF0ZXN0L2NsYXNzZXMvU3RvbXAuaHRtbCNvdmVyJyk7XG4gICAgICAgICAgICB3c0ZuID0gKCkgPT4gd3M7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBDb21wYXRDbGllbnQod3NGbik7XG4gICAgfVxufVxuLyoqXG4gKiBJbiBjYXNlIHlvdSBuZWVkIHRvIHVzZSBhIG5vbiBzdGFuZGFyZCBjbGFzcyBmb3IgV2ViU29ja2V0LlxuICpcbiAqIEZvciBleGFtcGxlIHdoZW4gdXNpbmcgd2l0aGluIE5vZGVKUyBlbnZpcm9ubWVudDpcbiAqXG4gKiBgYGBqYXZhc2NyaXB0XG4gKiAgICAgICAgU3RvbXBKcyA9IHJlcXVpcmUoJy4uLy4uL2VzbTUvJyk7XG4gKiAgICAgICAgU3RvbXAgPSBTdG9tcEpzLlN0b21wO1xuICogICAgICAgIFN0b21wLldlYlNvY2tldENsYXNzID0gcmVxdWlyZSgnd2Vic29ja2V0JykudzNjd2Vic29ja2V0O1xuICogYGBgXG4gKlxuICogKipEZXByZWNhdGVkKipcbiAqXG4gKlxuICogSXQgd2lsbCBiZSByZW1vdmVkIGluIG5leHQgbWFqb3IgdmVyc2lvbi4gUGxlYXNlIHN3aXRjaCB0byB7QGxpbmsgQ2xpZW50fVxuICogdXNpbmcgW0NsaWVudCN3ZWJTb2NrZXRGYWN0b3J5XXtAbGluayBDbGllbnQjd2ViU29ja2V0RmFjdG9yeX0uXG4gKi9cbi8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTp2YXJpYWJsZS1uYW1lXG5TdG9tcC5XZWJTb2NrZXRDbGFzcyA9IG51bGw7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zdG9tcC5qcy5tYXAiLCJpbXBvcnQgeyBCWVRFIH0gZnJvbSAnLi9ieXRlJztcbi8qKlxuICogRnJhbWUgY2xhc3MgcmVwcmVzZW50cyBhIFNUT01QIGZyYW1lLlxuICpcbiAqIEBpbnRlcm5hbFxuICovXG5leHBvcnQgY2xhc3MgRnJhbWVJbXBsIHtcbiAgICAvKipcbiAgICAgKiBGcmFtZSBjb25zdHJ1Y3Rvci4gYGNvbW1hbmRgLCBgaGVhZGVyc2AgYW5kIGBib2R5YCBhcmUgYXZhaWxhYmxlIGFzIHByb3BlcnRpZXMuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMpIHtcbiAgICAgICAgY29uc3QgeyBjb21tYW5kLCBoZWFkZXJzLCBib2R5LCBiaW5hcnlCb2R5LCBlc2NhcGVIZWFkZXJWYWx1ZXMsIHNraXBDb250ZW50TGVuZ3RoSGVhZGVyLCB9ID0gcGFyYW1zO1xuICAgICAgICB0aGlzLmNvbW1hbmQgPSBjb21tYW5kO1xuICAgICAgICB0aGlzLmhlYWRlcnMgPSBPYmplY3QuYXNzaWduKHt9LCBoZWFkZXJzIHx8IHt9KTtcbiAgICAgICAgaWYgKGJpbmFyeUJvZHkpIHtcbiAgICAgICAgICAgIHRoaXMuX2JpbmFyeUJvZHkgPSBiaW5hcnlCb2R5O1xuICAgICAgICAgICAgdGhpcy5pc0JpbmFyeUJvZHkgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fYm9keSA9IGJvZHkgfHwgJyc7XG4gICAgICAgICAgICB0aGlzLmlzQmluYXJ5Qm9keSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZXNjYXBlSGVhZGVyVmFsdWVzID0gZXNjYXBlSGVhZGVyVmFsdWVzIHx8IGZhbHNlO1xuICAgICAgICB0aGlzLnNraXBDb250ZW50TGVuZ3RoSGVhZGVyID0gc2tpcENvbnRlbnRMZW5ndGhIZWFkZXIgfHwgZmFsc2U7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIGJvZHkgb2YgdGhlIGZyYW1lXG4gICAgICovXG4gICAgZ2V0IGJvZHkoKSB7XG4gICAgICAgIGlmICghdGhpcy5fYm9keSAmJiB0aGlzLmlzQmluYXJ5Qm9keSkge1xuICAgICAgICAgICAgdGhpcy5fYm9keSA9IG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZSh0aGlzLl9iaW5hcnlCb2R5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fYm9keTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogYm9keSBhcyBVaW50OEFycmF5XG4gICAgICovXG4gICAgZ2V0IGJpbmFyeUJvZHkoKSB7XG4gICAgICAgIGlmICghdGhpcy5fYmluYXJ5Qm9keSAmJiAhdGhpcy5pc0JpbmFyeUJvZHkpIHtcbiAgICAgICAgICAgIHRoaXMuX2JpbmFyeUJvZHkgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUodGhpcy5fYm9keSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX2JpbmFyeUJvZHk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIGRlc2VyaWFsaXplIGEgU1RPTVAgRnJhbWUgZnJvbSByYXcgZGF0YS5cbiAgICAgKlxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqL1xuICAgIHN0YXRpYyBmcm9tUmF3RnJhbWUocmF3RnJhbWUsIGVzY2FwZUhlYWRlclZhbHVlcykge1xuICAgICAgICBjb25zdCBoZWFkZXJzID0ge307XG4gICAgICAgIGNvbnN0IHRyaW0gPSAoc3RyKSA9PiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuICAgICAgICAvLyBJbiBjYXNlIG9mIHJlcGVhdGVkIGhlYWRlcnMsIGFzIHBlciBzdGFuZGFyZHMsIGZpcnN0IHZhbHVlIG5lZWQgdG8gYmUgdXNlZFxuICAgICAgICBmb3IgKGNvbnN0IGhlYWRlciBvZiByYXdGcmFtZS5oZWFkZXJzLnJldmVyc2UoKSkge1xuICAgICAgICAgICAgY29uc3QgaWR4ID0gaGVhZGVyLmluZGV4T2YoJzonKTtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IHRyaW0oaGVhZGVyWzBdKTtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHRyaW0oaGVhZGVyWzFdKTtcbiAgICAgICAgICAgIGlmIChlc2NhcGVIZWFkZXJWYWx1ZXMgJiZcbiAgICAgICAgICAgICAgICByYXdGcmFtZS5jb21tYW5kICE9PSAnQ09OTkVDVCcgJiZcbiAgICAgICAgICAgICAgICByYXdGcmFtZS5jb21tYW5kICE9PSAnQ09OTkVDVEVEJykge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gRnJhbWVJbXBsLmhkclZhbHVlVW5Fc2NhcGUodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaGVhZGVyc1trZXldID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBGcmFtZUltcGwoe1xuICAgICAgICAgICAgY29tbWFuZDogcmF3RnJhbWUuY29tbWFuZCxcbiAgICAgICAgICAgIGhlYWRlcnMsXG4gICAgICAgICAgICBiaW5hcnlCb2R5OiByYXdGcmFtZS5iaW5hcnlCb2R5LFxuICAgICAgICAgICAgZXNjYXBlSGVhZGVyVmFsdWVzLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQGludGVybmFsXG4gICAgICovXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNlcmlhbGl6ZUNtZEFuZEhlYWRlcnMoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogc2VyaWFsaXplIHRoaXMgRnJhbWUgaW4gYSBmb3JtYXQgc3VpdGFibGUgdG8gYmUgcGFzc2VkIHRvIFdlYlNvY2tldC5cbiAgICAgKiBJZiB0aGUgYm9keSBpcyBzdHJpbmcgdGhlIG91dHB1dCB3aWxsIGJlIHN0cmluZy5cbiAgICAgKiBJZiB0aGUgYm9keSBpcyBiaW5hcnkgKGkuZS4gb2YgdHlwZSBVbml0OEFycmF5KSBpdCB3aWxsIGJlIHNlcmlhbGl6ZWQgdG8gQXJyYXlCdWZmZXIuXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBzZXJpYWxpemUoKSB7XG4gICAgICAgIGNvbnN0IGNtZEFuZEhlYWRlcnMgPSB0aGlzLnNlcmlhbGl6ZUNtZEFuZEhlYWRlcnMoKTtcbiAgICAgICAgaWYgKHRoaXMuaXNCaW5hcnlCb2R5KSB7XG4gICAgICAgICAgICByZXR1cm4gRnJhbWVJbXBsLnRvVW5pdDhBcnJheShjbWRBbmRIZWFkZXJzLCB0aGlzLl9iaW5hcnlCb2R5KS5idWZmZXI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gY21kQW5kSGVhZGVycyArIHRoaXMuX2JvZHkgKyBCWVRFLk5VTEw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc2VyaWFsaXplQ21kQW5kSGVhZGVycygpIHtcbiAgICAgICAgY29uc3QgbGluZXMgPSBbdGhpcy5jb21tYW5kXTtcbiAgICAgICAgaWYgKHRoaXMuc2tpcENvbnRlbnRMZW5ndGhIZWFkZXIpIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmhlYWRlcnNbJ2NvbnRlbnQtbGVuZ3RoJ107XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBuYW1lIG9mIE9iamVjdC5rZXlzKHRoaXMuaGVhZGVycyB8fCB7fSkpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5oZWFkZXJzW25hbWVdO1xuICAgICAgICAgICAgaWYgKHRoaXMuZXNjYXBlSGVhZGVyVmFsdWVzICYmXG4gICAgICAgICAgICAgICAgdGhpcy5jb21tYW5kICE9PSAnQ09OTkVDVCcgJiZcbiAgICAgICAgICAgICAgICB0aGlzLmNvbW1hbmQgIT09ICdDT05ORUNURUQnKSB7XG4gICAgICAgICAgICAgICAgbGluZXMucHVzaChgJHtuYW1lfToke0ZyYW1lSW1wbC5oZHJWYWx1ZUVzY2FwZShgJHt2YWx1ZX1gKX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goYCR7bmFtZX06JHt2YWx1ZX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5pc0JpbmFyeUJvZHkgfHxcbiAgICAgICAgICAgICghdGhpcy5pc0JvZHlFbXB0eSgpICYmICF0aGlzLnNraXBDb250ZW50TGVuZ3RoSGVhZGVyKSkge1xuICAgICAgICAgICAgbGluZXMucHVzaChgY29udGVudC1sZW5ndGg6JHt0aGlzLmJvZHlMZW5ndGgoKX1gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGluZXMuam9pbihCWVRFLkxGKSArIEJZVEUuTEYgKyBCWVRFLkxGO1xuICAgIH1cbiAgICBpc0JvZHlFbXB0eSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYm9keUxlbmd0aCgpID09PSAwO1xuICAgIH1cbiAgICBib2R5TGVuZ3RoKCkge1xuICAgICAgICBjb25zdCBiaW5hcnlCb2R5ID0gdGhpcy5iaW5hcnlCb2R5O1xuICAgICAgICByZXR1cm4gYmluYXJ5Qm9keSA/IGJpbmFyeUJvZHkubGVuZ3RoIDogMDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ29tcHV0ZSB0aGUgc2l6ZSBvZiBhIFVURi04IHN0cmluZyBieSBjb3VudGluZyBpdHMgbnVtYmVyIG9mIGJ5dGVzXG4gICAgICogKGFuZCBub3QgdGhlIG51bWJlciBvZiBjaGFyYWN0ZXJzIGNvbXBvc2luZyB0aGUgc3RyaW5nKVxuICAgICAqL1xuICAgIHN0YXRpYyBzaXplT2ZVVEY4KHMpIHtcbiAgICAgICAgcmV0dXJuIHMgPyBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUocykubGVuZ3RoIDogMDtcbiAgICB9XG4gICAgc3RhdGljIHRvVW5pdDhBcnJheShjbWRBbmRIZWFkZXJzLCBiaW5hcnlCb2R5KSB7XG4gICAgICAgIGNvbnN0IHVpbnQ4Q21kQW5kSGVhZGVycyA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShjbWRBbmRIZWFkZXJzKTtcbiAgICAgICAgY29uc3QgbnVsbFRlcm1pbmF0b3IgPSBuZXcgVWludDhBcnJheShbMF0pO1xuICAgICAgICBjb25zdCB1aW50OEZyYW1lID0gbmV3IFVpbnQ4QXJyYXkodWludDhDbWRBbmRIZWFkZXJzLmxlbmd0aCArIGJpbmFyeUJvZHkubGVuZ3RoICsgbnVsbFRlcm1pbmF0b3IubGVuZ3RoKTtcbiAgICAgICAgdWludDhGcmFtZS5zZXQodWludDhDbWRBbmRIZWFkZXJzKTtcbiAgICAgICAgdWludDhGcmFtZS5zZXQoYmluYXJ5Qm9keSwgdWludDhDbWRBbmRIZWFkZXJzLmxlbmd0aCk7XG4gICAgICAgIHVpbnQ4RnJhbWUuc2V0KG51bGxUZXJtaW5hdG9yLCB1aW50OENtZEFuZEhlYWRlcnMubGVuZ3RoICsgYmluYXJ5Qm9keS5sZW5ndGgpO1xuICAgICAgICByZXR1cm4gdWludDhGcmFtZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2VyaWFsaXplIGEgU1RPTVAgZnJhbWUgYXMgcGVyIFNUT01QIHN0YW5kYXJkcywgc3VpdGFibGUgdG8gYmUgc2VudCB0byB0aGUgU1RPTVAgYnJva2VyLlxuICAgICAqXG4gICAgICogQGludGVybmFsXG4gICAgICovXG4gICAgc3RhdGljIG1hcnNoYWxsKHBhcmFtcykge1xuICAgICAgICBjb25zdCBmcmFtZSA9IG5ldyBGcmFtZUltcGwocGFyYW1zKTtcbiAgICAgICAgcmV0dXJuIGZyYW1lLnNlcmlhbGl6ZSgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiAgRXNjYXBlIGhlYWRlciB2YWx1ZXNcbiAgICAgKi9cbiAgICBzdGF0aWMgaGRyVmFsdWVFc2NhcGUoc3RyKSB7XG4gICAgICAgIHJldHVybiBzdHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcL2csICdcXFxcXFxcXCcpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxyL2csICdcXFxccicpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxuL2csICdcXFxcbicpXG4gICAgICAgICAgICAucmVwbGFjZSgvOi9nLCAnXFxcXGMnKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVW5Fc2NhcGUgaGVhZGVyIHZhbHVlc1xuICAgICAqL1xuICAgIHN0YXRpYyBoZHJWYWx1ZVVuRXNjYXBlKHN0cikge1xuICAgICAgICByZXR1cm4gc3RyXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxcXHIvZywgJ1xccicpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxcXG4vZywgJ1xcbicpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxcXGMvZywgJzonKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcXFxcL2csICdcXFxcJyk7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZnJhbWUtaW1wbC5qcy5tYXAiLCIvKipcbiAqIEBpbnRlcm5hbFxuICovXG5jb25zdCBOVUxMID0gMDtcbi8qKlxuICogQGludGVybmFsXG4gKi9cbmNvbnN0IExGID0gMTA7XG4vKipcbiAqIEBpbnRlcm5hbFxuICovXG5jb25zdCBDUiA9IDEzO1xuLyoqXG4gKiBAaW50ZXJuYWxcbiAqL1xuY29uc3QgQ09MT04gPSA1ODtcbi8qKlxuICogVGhpcyBpcyBhbiBldmVudGVkLCByZWMgZGVzY2VudCBwYXJzZXIuXG4gKiBBIHN0cmVhbSBvZiBPY3RldHMgY2FuIGJlIHBhc3NlZCBhbmQgd2hlbmV2ZXIgaXQgcmVjb2duaXplc1xuICogYSBjb21wbGV0ZSBGcmFtZSBvciBhbiBpbmNvbWluZyBwaW5nIGl0IHdpbGwgaW52b2tlIHRoZSByZWdpc3RlcmVkIGNhbGxiYWNrcy5cbiAqXG4gKiBBbGwgaW5jb21pbmcgT2N0ZXRzIGFyZSBmZWQgaW50byBfb25CeXRlIGZ1bmN0aW9uLlxuICogRGVwZW5kaW5nIG9uIGN1cnJlbnQgc3RhdGUgdGhlIF9vbkJ5dGUgZnVuY3Rpb24ga2VlcHMgY2hhbmdpbmcuXG4gKiBEZXBlbmRpbmcgb24gdGhlIHN0YXRlIGl0IGtlZXBzIGFjY3VtdWxhdGluZyBpbnRvIF90b2tlbiBhbmQgX3Jlc3VsdHMuXG4gKiBTdGF0ZSBpcyBpbmRpY2F0ZWQgYnkgY3VycmVudCB2YWx1ZSBvZiBfb25CeXRlLCBhbGwgc3RhdGVzIGFyZSBuYW1lZCBhcyBfY29sbGVjdC5cbiAqXG4gKiBTVE9NUCBzdGFuZGFyZHMgaHR0cHM6Ly9zdG9tcC5naXRodWIuaW8vc3RvbXAtc3BlY2lmaWNhdGlvbi0xLjIuaHRtbFxuICogaW1wbHkgdGhhdCBhbGwgbGVuZ3RocyBhcmUgY29uc2lkZXJlZCBpbiBieXRlcyAoaW5zdGVhZCBvZiBzdHJpbmcgbGVuZ3RocykuXG4gKiBTbywgYmVmb3JlIGFjdHVhbCBwYXJzaW5nLCBpZiB0aGUgaW5jb21pbmcgZGF0YSBpcyBTdHJpbmcgaXQgaXMgY29udmVydGVkIHRvIE9jdGV0cy5cbiAqIFRoaXMgYWxsb3dzIGZhaXRoZnVsIGltcGxlbWVudGF0aW9uIG9mIHRoZSBwcm90b2NvbCBhbmQgYWxsb3dzIE5VTEwgT2N0ZXRzIHRvIGJlIHByZXNlbnQgaW4gdGhlIGJvZHkuXG4gKlxuICogVGhlcmUgaXMgbm8gcGVlayBmdW5jdGlvbiBvbiB0aGUgaW5jb21pbmcgZGF0YS5cbiAqIFdoZW4gYSBzdGF0ZSBjaGFuZ2Ugb2NjdXJzIGJhc2VkIG9uIGFuIE9jdGV0IHdpdGhvdXQgY29uc3VtaW5nIHRoZSBPY3RldCxcbiAqIHRoZSBPY3RldCwgYWZ0ZXIgc3RhdGUgY2hhbmdlLCBpcyBmZWQgYWdhaW4gKF9yZWluamVjdEJ5dGUpLlxuICogVGhpcyBiZWNhbWUgcG9zc2libGUgYXMgdGhlIHN0YXRlIGNoYW5nZSBjYW4gYmUgZGV0ZXJtaW5lZCBieSBpbnNwZWN0aW5nIGp1c3Qgb25lIE9jdGV0LlxuICpcbiAqIFRoZXJlIGFyZSB0d28gbW9kZXMgdG8gY29sbGVjdCB0aGUgYm9keSwgaWYgY29udGVudC1sZW5ndGggaGVhZGVyIGlzIHRoZXJlIHRoZW4gaXQgYnkgY291bnRpbmcgT2N0ZXRzXG4gKiBvdGhlcndpc2UgaXQgaXMgZGV0ZXJtaW5lZCBieSBOVUxMIHRlcm1pbmF0b3IuXG4gKlxuICogRm9sbG93aW5nIHRoZSBzdGFuZGFyZHMsIHRoZSBjb21tYW5kIGFuZCBoZWFkZXJzIGFyZSBjb252ZXJ0ZWQgdG8gU3RyaW5nc1xuICogYW5kIHRoZSBib2R5IGlzIHJldHVybmVkIGFzIE9jdGV0cy5cbiAqIEhlYWRlcnMgYXJlIHJldHVybmVkIGFzIGFuIGFycmF5IGFuZCBub3QgYXMgSGFzaCAtIHRvIGFsbG93IG11bHRpcGxlIG9jY3VycmVuY2Ugb2YgYW4gaGVhZGVyLlxuICpcbiAqIFRoaXMgcGFyc2VyIGRvZXMgbm90IHVzZSBSZWd1bGFyIEV4cHJlc3Npb25zIGFzIHRoYXQgY2FuIG9ubHkgb3BlcmF0ZSBvbiBTdHJpbmdzLlxuICpcbiAqIEl0IGhhbmRsZXMgaWYgbXVsdGlwbGUgU1RPTVAgZnJhbWVzIGFyZSBnaXZlbiBhcyBvbmUgY2h1bmssIGEgZnJhbWUgaXMgc3BsaXQgaW50byBtdWx0aXBsZSBjaHVua3MsIG9yXG4gKiBhbnkgY29tYmluYXRpb24gdGhlcmUgb2YuIFRoZSBwYXJzZXIgcmVtZW1iZXJzIGl0cyBzdGF0ZSAoYW55IHBhcnRpYWwgZnJhbWUpIGFuZCBjb250aW51ZXMgd2hlbiBhIG5ldyBjaHVua1xuICogaXMgcHVzaGVkLlxuICpcbiAqIFR5cGljYWxseSB0aGUgaGlnaGVyIGxldmVsIGZ1bmN0aW9uIHdpbGwgY29udmVydCBoZWFkZXJzIHRvIEhhc2gsIGhhbmRsZSB1bmVzY2FwaW5nIG9mIGhlYWRlciB2YWx1ZXNcbiAqICh3aGljaCBpcyBwcm90b2NvbCB2ZXJzaW9uIHNwZWNpZmljKSwgYW5kIGNvbnZlcnQgYm9keSB0byB0ZXh0LlxuICpcbiAqIENoZWNrIHRoZSBwYXJzZXIuc3BlYy5qcyB0byB1bmRlcnN0YW5kIGNhc2VzIHRoYXQgdGhpcyBwYXJzZXIgaXMgc3VwcG9zZWQgdG8gaGFuZGxlLlxuICpcbiAqIFBhcnQgb2YgYEBzdG9tcC9zdG9tcGpzYC5cbiAqXG4gKiBAaW50ZXJuYWxcbiAqL1xuZXhwb3J0IGNsYXNzIFBhcnNlciB7XG4gICAgY29uc3RydWN0b3Iob25GcmFtZSwgb25JbmNvbWluZ1BpbmcpIHtcbiAgICAgICAgdGhpcy5vbkZyYW1lID0gb25GcmFtZTtcbiAgICAgICAgdGhpcy5vbkluY29taW5nUGluZyA9IG9uSW5jb21pbmdQaW5nO1xuICAgICAgICB0aGlzLl9lbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgICAgIHRoaXMuX2RlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcbiAgICAgICAgdGhpcy5fdG9rZW4gPSBbXTtcbiAgICAgICAgdGhpcy5faW5pdFN0YXRlKCk7XG4gICAgfVxuICAgIHBhcnNlQ2h1bmsoc2VnbWVudCwgYXBwZW5kTWlzc2luZ05VTExvbkluY29taW5nID0gZmFsc2UpIHtcbiAgICAgICAgbGV0IGNodW5rO1xuICAgICAgICBpZiAoc2VnbWVudCBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgICAgICAgICBjaHVuayA9IG5ldyBVaW50OEFycmF5KHNlZ21lbnQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY2h1bmsgPSB0aGlzLl9lbmNvZGVyLmVuY29kZShzZWdtZW50KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3N0b21wLWpzL3N0b21wanMvaXNzdWVzLzg5XG4gICAgICAgIC8vIFJlbW92ZSB3aGVuIHVuZGVybHlpbmcgaXNzdWUgaXMgZml4ZWQuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFNlbmQgYSBOVUxMIGJ5dGUsIGlmIHRoZSBsYXN0IGJ5dGUgb2YgYSBUZXh0IGZyYW1lIHdhcyBub3QgTlVMTC5GXG4gICAgICAgIGlmIChhcHBlbmRNaXNzaW5nTlVMTG9uSW5jb21pbmcgJiYgY2h1bmtbY2h1bmsubGVuZ3RoIC0gMV0gIT09IDApIHtcbiAgICAgICAgICAgIGNvbnN0IGNodW5rV2l0aE51bGwgPSBuZXcgVWludDhBcnJheShjaHVuay5sZW5ndGggKyAxKTtcbiAgICAgICAgICAgIGNodW5rV2l0aE51bGwuc2V0KGNodW5rLCAwKTtcbiAgICAgICAgICAgIGNodW5rV2l0aE51bGxbY2h1bmsubGVuZ3RoXSA9IDA7XG4gICAgICAgICAgICBjaHVuayA9IGNodW5rV2l0aE51bGw7XG4gICAgICAgIH1cbiAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnByZWZlci1mb3Itb2ZcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaHVuay5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgYnl0ZSA9IGNodW5rW2ldO1xuICAgICAgICAgICAgdGhpcy5fb25CeXRlKGJ5dGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIFRoZSBmb2xsb3dpbmcgaW1wbGVtZW50cyBhIHNpbXBsZSBSZWMgRGVzY2VudCBQYXJzZXIuXG4gICAgLy8gVGhlIGdyYW1tYXIgaXMgc2ltcGxlIGFuZCBqdXN0IG9uZSBieXRlIHRlbGxzIHdoYXQgc2hvdWxkIGJlIHRoZSBuZXh0IHN0YXRlXG4gICAgX2NvbGxlY3RGcmFtZShieXRlKSB7XG4gICAgICAgIGlmIChieXRlID09PSBOVUxMKSB7XG4gICAgICAgICAgICAvLyBJZ25vcmVcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYnl0ZSA9PT0gQ1IpIHtcbiAgICAgICAgICAgIC8vIElnbm9yZSBDUlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChieXRlID09PSBMRikge1xuICAgICAgICAgICAgLy8gSW5jb21pbmcgUGluZ1xuICAgICAgICAgICAgdGhpcy5vbkluY29taW5nUGluZygpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX29uQnl0ZSA9IHRoaXMuX2NvbGxlY3RDb21tYW5kO1xuICAgICAgICB0aGlzLl9yZWluamVjdEJ5dGUoYnl0ZSk7XG4gICAgfVxuICAgIF9jb2xsZWN0Q29tbWFuZChieXRlKSB7XG4gICAgICAgIGlmIChieXRlID09PSBDUikge1xuICAgICAgICAgICAgLy8gSWdub3JlIENSXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJ5dGUgPT09IExGKSB7XG4gICAgICAgICAgICB0aGlzLl9yZXN1bHRzLmNvbW1hbmQgPSB0aGlzLl9jb25zdW1lVG9rZW5Bc1VURjgoKTtcbiAgICAgICAgICAgIHRoaXMuX29uQnl0ZSA9IHRoaXMuX2NvbGxlY3RIZWFkZXJzO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2NvbnN1bWVCeXRlKGJ5dGUpO1xuICAgIH1cbiAgICBfY29sbGVjdEhlYWRlcnMoYnl0ZSkge1xuICAgICAgICBpZiAoYnl0ZSA9PT0gQ1IpIHtcbiAgICAgICAgICAgIC8vIElnbm9yZSBDUlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChieXRlID09PSBMRikge1xuICAgICAgICAgICAgdGhpcy5fc2V0dXBDb2xsZWN0Qm9keSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX29uQnl0ZSA9IHRoaXMuX2NvbGxlY3RIZWFkZXJLZXk7XG4gICAgICAgIHRoaXMuX3JlaW5qZWN0Qnl0ZShieXRlKTtcbiAgICB9XG4gICAgX3JlaW5qZWN0Qnl0ZShieXRlKSB7XG4gICAgICAgIHRoaXMuX29uQnl0ZShieXRlKTtcbiAgICB9XG4gICAgX2NvbGxlY3RIZWFkZXJLZXkoYnl0ZSkge1xuICAgICAgICBpZiAoYnl0ZSA9PT0gQ09MT04pIHtcbiAgICAgICAgICAgIHRoaXMuX2hlYWRlcktleSA9IHRoaXMuX2NvbnN1bWVUb2tlbkFzVVRGOCgpO1xuICAgICAgICAgICAgdGhpcy5fb25CeXRlID0gdGhpcy5fY29sbGVjdEhlYWRlclZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2NvbnN1bWVCeXRlKGJ5dGUpO1xuICAgIH1cbiAgICBfY29sbGVjdEhlYWRlclZhbHVlKGJ5dGUpIHtcbiAgICAgICAgaWYgKGJ5dGUgPT09IENSKSB7XG4gICAgICAgICAgICAvLyBJZ25vcmUgQ1JcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYnl0ZSA9PT0gTEYpIHtcbiAgICAgICAgICAgIHRoaXMuX3Jlc3VsdHMuaGVhZGVycy5wdXNoKFt0aGlzLl9oZWFkZXJLZXksIHRoaXMuX2NvbnN1bWVUb2tlbkFzVVRGOCgpXSk7XG4gICAgICAgICAgICB0aGlzLl9oZWFkZXJLZXkgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB0aGlzLl9vbkJ5dGUgPSB0aGlzLl9jb2xsZWN0SGVhZGVycztcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9jb25zdW1lQnl0ZShieXRlKTtcbiAgICB9XG4gICAgX3NldHVwQ29sbGVjdEJvZHkoKSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnRMZW5ndGhIZWFkZXIgPSB0aGlzLl9yZXN1bHRzLmhlYWRlcnMuZmlsdGVyKChoZWFkZXIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBoZWFkZXJbMF0gPT09ICdjb250ZW50LWxlbmd0aCc7XG4gICAgICAgIH0pWzBdO1xuICAgICAgICBpZiAoY29udGVudExlbmd0aEhlYWRlcikge1xuICAgICAgICAgICAgdGhpcy5fYm9keUJ5dGVzUmVtYWluaW5nID0gcGFyc2VJbnQoY29udGVudExlbmd0aEhlYWRlclsxXSwgMTApO1xuICAgICAgICAgICAgdGhpcy5fb25CeXRlID0gdGhpcy5fY29sbGVjdEJvZHlGaXhlZFNpemU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9vbkJ5dGUgPSB0aGlzLl9jb2xsZWN0Qm9keU51bGxUZXJtaW5hdGVkO1xuICAgICAgICB9XG4gICAgfVxuICAgIF9jb2xsZWN0Qm9keU51bGxUZXJtaW5hdGVkKGJ5dGUpIHtcbiAgICAgICAgaWYgKGJ5dGUgPT09IE5VTEwpIHtcbiAgICAgICAgICAgIHRoaXMuX3JldHJpZXZlZEJvZHkoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9jb25zdW1lQnl0ZShieXRlKTtcbiAgICB9XG4gICAgX2NvbGxlY3RCb2R5Rml4ZWRTaXplKGJ5dGUpIHtcbiAgICAgICAgLy8gSXQgaXMgcG9zdCBkZWNyZW1lbnQsIHNvIHRoYXQgd2UgZGlzY2FyZCB0aGUgdHJhaWxpbmcgTlVMTCBvY3RldFxuICAgICAgICBpZiAodGhpcy5fYm9keUJ5dGVzUmVtYWluaW5nLS0gPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuX3JldHJpZXZlZEJvZHkoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9jb25zdW1lQnl0ZShieXRlKTtcbiAgICB9XG4gICAgX3JldHJpZXZlZEJvZHkoKSB7XG4gICAgICAgIHRoaXMuX3Jlc3VsdHMuYmluYXJ5Qm9keSA9IHRoaXMuX2NvbnN1bWVUb2tlbkFzUmF3KCk7XG4gICAgICAgIHRoaXMub25GcmFtZSh0aGlzLl9yZXN1bHRzKTtcbiAgICAgICAgdGhpcy5faW5pdFN0YXRlKCk7XG4gICAgfVxuICAgIC8vIFJlYyBEZXNjZW50IFBhcnNlciBoZWxwZXJzXG4gICAgX2NvbnN1bWVCeXRlKGJ5dGUpIHtcbiAgICAgICAgdGhpcy5fdG9rZW4ucHVzaChieXRlKTtcbiAgICB9XG4gICAgX2NvbnN1bWVUb2tlbkFzVVRGOCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlY29kZXIuZGVjb2RlKHRoaXMuX2NvbnN1bWVUb2tlbkFzUmF3KCkpO1xuICAgIH1cbiAgICBfY29uc3VtZVRva2VuQXNSYXcoKSB7XG4gICAgICAgIGNvbnN0IHJhd1Jlc3VsdCA9IG5ldyBVaW50OEFycmF5KHRoaXMuX3Rva2VuKTtcbiAgICAgICAgdGhpcy5fdG9rZW4gPSBbXTtcbiAgICAgICAgcmV0dXJuIHJhd1Jlc3VsdDtcbiAgICB9XG4gICAgX2luaXRTdGF0ZSgpIHtcbiAgICAgICAgdGhpcy5fcmVzdWx0cyA9IHtcbiAgICAgICAgICAgIGNvbW1hbmQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGhlYWRlcnM6IFtdLFxuICAgICAgICAgICAgYmluYXJ5Qm9keTogdW5kZWZpbmVkLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLl90b2tlbiA9IFtdO1xuICAgICAgICB0aGlzLl9oZWFkZXJLZXkgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuX29uQnl0ZSA9IHRoaXMuX2NvbGxlY3RGcmFtZTtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wYXJzZXIuanMubWFwIiwiaW1wb3J0IHsgQllURSB9IGZyb20gJy4vYnl0ZSc7XG5pbXBvcnQgeyBGcmFtZUltcGwgfSBmcm9tICcuL2ZyYW1lLWltcGwnO1xuaW1wb3J0IHsgUGFyc2VyIH0gZnJvbSAnLi9wYXJzZXInO1xuaW1wb3J0IHsgU3RvbXBTb2NrZXRTdGF0ZSwgfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IFZlcnNpb25zIH0gZnJvbSAnLi92ZXJzaW9ucyc7XG5pbXBvcnQgeyBhdWdtZW50V2Vic29ja2V0IH0gZnJvbSAnLi9hdWdtZW50LXdlYnNvY2tldCc7XG4vKipcbiAqIFRoZSBTVE9NUCBwcm90b2NvbCBoYW5kbGVyXG4gKlxuICogUGFydCBvZiBgQHN0b21wL3N0b21wanNgLlxuICpcbiAqIEBpbnRlcm5hbFxuICovXG5leHBvcnQgY2xhc3MgU3RvbXBIYW5kbGVyIHtcbiAgICBjb25zdHJ1Y3RvcihfY2xpZW50LCBfd2ViU29ja2V0LCBjb25maWcgPSB7fSkge1xuICAgICAgICB0aGlzLl9jbGllbnQgPSBfY2xpZW50O1xuICAgICAgICB0aGlzLl93ZWJTb2NrZXQgPSBfd2ViU29ja2V0O1xuICAgICAgICB0aGlzLl9zZXJ2ZXJGcmFtZUhhbmRsZXJzID0ge1xuICAgICAgICAgICAgLy8gW0NPTk5FQ1RFRCBGcmFtZV0oaHR0cDovL3N0b21wLmdpdGh1Yi5jb20vc3RvbXAtc3BlY2lmaWNhdGlvbi0xLjIuaHRtbCNDT05ORUNURURfRnJhbWUpXG4gICAgICAgICAgICBDT05ORUNURUQ6IGZyYW1lID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlYnVnKGBjb25uZWN0ZWQgdG8gc2VydmVyICR7ZnJhbWUuaGVhZGVycy5zZXJ2ZXJ9YCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fY29ubmVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jb25uZWN0ZWRWZXJzaW9uID0gZnJhbWUuaGVhZGVycy52ZXJzaW9uO1xuICAgICAgICAgICAgICAgIC8vIFNUT01QIHZlcnNpb24gMS4yIG5lZWRzIGhlYWRlciB2YWx1ZXMgdG8gYmUgZXNjYXBlZFxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9jb25uZWN0ZWRWZXJzaW9uID09PSBWZXJzaW9ucy5WMV8yKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2VzY2FwZUhlYWRlclZhbHVlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuX3NldHVwSGVhcnRiZWF0KGZyYW1lLmhlYWRlcnMpO1xuICAgICAgICAgICAgICAgIHRoaXMub25Db25uZWN0KGZyYW1lKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyBbTUVTU0FHRSBGcmFtZV0oaHR0cDovL3N0b21wLmdpdGh1Yi5jb20vc3RvbXAtc3BlY2lmaWNhdGlvbi0xLjIuaHRtbCNNRVNTQUdFKVxuICAgICAgICAgICAgTUVTU0FHRTogZnJhbWUgPT4ge1xuICAgICAgICAgICAgICAgIC8vIHRoZSBjYWxsYmFjayBpcyByZWdpc3RlcmVkIHdoZW4gdGhlIGNsaWVudCBjYWxsc1xuICAgICAgICAgICAgICAgIC8vIGBzdWJzY3JpYmUoKWAuXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gcmVnaXN0ZXJlZCBzdWJzY3JpcHRpb24gZm9yIHRoZSByZWNlaXZlZCBtZXNzYWdlLFxuICAgICAgICAgICAgICAgIC8vIHRoZSBkZWZhdWx0IGBvblVuaGFuZGxlZE1lc3NhZ2VgIGNhbGxiYWNrIGlzIHVzZWQgdGhhdCB0aGUgY2xpZW50IGNhbiBzZXQuXG4gICAgICAgICAgICAgICAgLy8gVGhpcyBpcyB1c2VmdWwgZm9yIHN1YnNjcmlwdGlvbnMgdGhhdCBhcmUgYXV0b21hdGljYWxseSBjcmVhdGVkXG4gICAgICAgICAgICAgICAgLy8gb24gdGhlIGJyb3dzZXIgc2lkZSAoZS5nLiBbUmFiYml0TVEncyB0ZW1wb3JhcnlcbiAgICAgICAgICAgICAgICAvLyBxdWV1ZXNdKGh0dHA6Ly93d3cucmFiYml0bXEuY29tL3N0b21wLmh0bWwpKS5cbiAgICAgICAgICAgICAgICBjb25zdCBzdWJzY3JpcHRpb24gPSBmcmFtZS5oZWFkZXJzLnN1YnNjcmlwdGlvbjtcbiAgICAgICAgICAgICAgICBjb25zdCBvblJlY2VpdmUgPSB0aGlzLl9zdWJzY3JpcHRpb25zW3N1YnNjcmlwdGlvbl0gfHwgdGhpcy5vblVuaGFuZGxlZE1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgLy8gYmxlc3MgdGhlIGZyYW1lIHRvIGJlIGEgTWVzc2FnZVxuICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBmcmFtZTtcbiAgICAgICAgICAgICAgICBjb25zdCBjbGllbnQgPSB0aGlzO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2VJZCA9IHRoaXMuX2Nvbm5lY3RlZFZlcnNpb24gPT09IFZlcnNpb25zLlYxXzJcbiAgICAgICAgICAgICAgICAgICAgPyBtZXNzYWdlLmhlYWRlcnMuYWNrXG4gICAgICAgICAgICAgICAgICAgIDogbWVzc2FnZS5oZWFkZXJzWydtZXNzYWdlLWlkJ107XG4gICAgICAgICAgICAgICAgLy8gYWRkIGBhY2soKWAgYW5kIGBuYWNrKClgIG1ldGhvZHMgZGlyZWN0bHkgdG8gdGhlIHJldHVybmVkIGZyYW1lXG4gICAgICAgICAgICAgICAgLy8gc28gdGhhdCBhIHNpbXBsZSBjYWxsIHRvIGBtZXNzYWdlLmFjaygpYCBjYW4gYWNrbm93bGVkZ2UgdGhlIG1lc3NhZ2UuXG4gICAgICAgICAgICAgICAgbWVzc2FnZS5hY2sgPSAoaGVhZGVycyA9IHt9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjbGllbnQuYWNrKG1lc3NhZ2VJZCwgc3Vic2NyaXB0aW9uLCBoZWFkZXJzKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UubmFjayA9IChoZWFkZXJzID0ge30pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNsaWVudC5uYWNrKG1lc3NhZ2VJZCwgc3Vic2NyaXB0aW9uLCBoZWFkZXJzKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIG9uUmVjZWl2ZShtZXNzYWdlKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyBbUkVDRUlQVCBGcmFtZV0oaHR0cDovL3N0b21wLmdpdGh1Yi5jb20vc3RvbXAtc3BlY2lmaWNhdGlvbi0xLjIuaHRtbCNSRUNFSVBUKVxuICAgICAgICAgICAgUkVDRUlQVDogZnJhbWUgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNhbGxiYWNrID0gdGhpcy5fcmVjZWlwdFdhdGNoZXJzW2ZyYW1lLmhlYWRlcnNbJ3JlY2VpcHQtaWQnXV07XG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGZyYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gU2VydmVyIHdpbGwgYWNrbm93bGVkZ2Ugb25seSBvbmNlLCByZW1vdmUgdGhlIGNhbGxiYWNrXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9yZWNlaXB0V2F0Y2hlcnNbZnJhbWUuaGVhZGVyc1sncmVjZWlwdC1pZCddXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25VbmhhbmRsZWRSZWNlaXB0KGZyYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLy8gW0VSUk9SIEZyYW1lXShodHRwOi8vc3RvbXAuZ2l0aHViLmNvbS9zdG9tcC1zcGVjaWZpY2F0aW9uLTEuMi5odG1sI0VSUk9SKVxuICAgICAgICAgICAgRVJST1I6IGZyYW1lID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uU3RvbXBFcnJvcihmcmFtZSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgICAvLyB1c2VkIHRvIGluZGV4IHN1YnNjcmliZXJzXG4gICAgICAgIHRoaXMuX2NvdW50ZXIgPSAwO1xuICAgICAgICAvLyBzdWJzY3JpcHRpb24gY2FsbGJhY2tzIGluZGV4ZWQgYnkgc3Vic2NyaWJlcidzIElEXG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSB7fTtcbiAgICAgICAgLy8gcmVjZWlwdC13YXRjaGVycyBpbmRleGVkIGJ5IHJlY2VpcHRzLWlkc1xuICAgICAgICB0aGlzLl9yZWNlaXB0V2F0Y2hlcnMgPSB7fTtcbiAgICAgICAgdGhpcy5fcGFydGlhbERhdGEgPSAnJztcbiAgICAgICAgdGhpcy5fZXNjYXBlSGVhZGVyVmFsdWVzID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2xhc3RTZXJ2ZXJBY3Rpdml0eVRTID0gRGF0ZS5ub3coKTtcbiAgICAgICAgdGhpcy5jb25maWd1cmUoY29uZmlnKTtcbiAgICB9XG4gICAgZ2V0IGNvbm5lY3RlZFZlcnNpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jb25uZWN0ZWRWZXJzaW9uO1xuICAgIH1cbiAgICBnZXQgY29ubmVjdGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29ubmVjdGVkO1xuICAgIH1cbiAgICBjb25maWd1cmUoY29uZikge1xuICAgICAgICAvLyBidWxrIGFzc2lnbiBhbGwgcHJvcGVydGllcyB0byB0aGlzXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgY29uZik7XG4gICAgfVxuICAgIHN0YXJ0KCkge1xuICAgICAgICBjb25zdCBwYXJzZXIgPSBuZXcgUGFyc2VyKFxuICAgICAgICAvLyBPbiBGcmFtZVxuICAgICAgICByYXdGcmFtZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBmcmFtZSA9IEZyYW1lSW1wbC5mcm9tUmF3RnJhbWUocmF3RnJhbWUsIHRoaXMuX2VzY2FwZUhlYWRlclZhbHVlcyk7XG4gICAgICAgICAgICAvLyBpZiB0aGlzLmxvZ1Jhd0NvbW11bmljYXRpb24gaXMgc2V0LCB0aGUgcmF3Q2h1bmsgaXMgbG9nZ2VkIGF0IHRoaXMuX3dlYlNvY2tldC5vbm1lc3NhZ2VcbiAgICAgICAgICAgIGlmICghdGhpcy5sb2dSYXdDb21tdW5pY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZWJ1ZyhgPDw8ICR7ZnJhbWV9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBzZXJ2ZXJGcmFtZUhhbmRsZXIgPSB0aGlzLl9zZXJ2ZXJGcmFtZUhhbmRsZXJzW2ZyYW1lLmNvbW1hbmRdIHx8IHRoaXMub25VbmhhbmRsZWRGcmFtZTtcbiAgICAgICAgICAgIHNlcnZlckZyYW1lSGFuZGxlcihmcmFtZSk7XG4gICAgICAgIH0sIFxuICAgICAgICAvLyBPbiBJbmNvbWluZyBQaW5nXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZGVidWcoJzw8PCBQT05HJyk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl93ZWJTb2NrZXQub25tZXNzYWdlID0gKGV2dCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5kZWJ1ZygnUmVjZWl2ZWQgZGF0YScpO1xuICAgICAgICAgICAgdGhpcy5fbGFzdFNlcnZlckFjdGl2aXR5VFMgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgaWYgKHRoaXMubG9nUmF3Q29tbXVuaWNhdGlvbikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJhd0NodW5rQXNTdHJpbmcgPSBldnQuZGF0YSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyXG4gICAgICAgICAgICAgICAgICAgID8gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKGV2dC5kYXRhKVxuICAgICAgICAgICAgICAgICAgICA6IGV2dC5kYXRhO1xuICAgICAgICAgICAgICAgIHRoaXMuZGVidWcoYDw8PCAke3Jhd0NodW5rQXNTdHJpbmd9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJzZXIucGFyc2VDaHVuayhldnQuZGF0YSwgdGhpcy5hcHBlbmRNaXNzaW5nTlVMTG9uSW5jb21pbmcpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLl9vbmNsb3NlID0gKGNsb3NlRXZlbnQpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZGVidWcoYENvbm5lY3Rpb24gY2xvc2VkIHRvICR7dGhpcy5fY2xpZW50LmJyb2tlclVSTH1gKTtcbiAgICAgICAgICAgIHRoaXMuX2NsZWFuVXAoKTtcbiAgICAgICAgICAgIHRoaXMub25XZWJTb2NrZXRDbG9zZShjbG9zZUV2ZW50KTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5fd2ViU29ja2V0Lm9uY2xvc2UgPSB0aGlzLl9vbmNsb3NlO1xuICAgICAgICB0aGlzLl93ZWJTb2NrZXQub25lcnJvciA9IChlcnJvckV2ZW50KSA9PiB7XG4gICAgICAgICAgICB0aGlzLm9uV2ViU29ja2V0RXJyb3IoZXJyb3JFdmVudCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX3dlYlNvY2tldC5vbm9wZW4gPSAoKSA9PiB7XG4gICAgICAgICAgICAvLyBDbG9uZSBiZWZvcmUgdXBkYXRpbmdcbiAgICAgICAgICAgIGNvbnN0IGNvbm5lY3RIZWFkZXJzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5jb25uZWN0SGVhZGVycyk7XG4gICAgICAgICAgICB0aGlzLmRlYnVnKCdXZWIgU29ja2V0IE9wZW5lZC4uLicpO1xuICAgICAgICAgICAgY29ubmVjdEhlYWRlcnNbJ2FjY2VwdC12ZXJzaW9uJ10gPSB0aGlzLnN0b21wVmVyc2lvbnMuc3VwcG9ydGVkVmVyc2lvbnMoKTtcbiAgICAgICAgICAgIGNvbm5lY3RIZWFkZXJzWydoZWFydC1iZWF0J10gPSBbXG4gICAgICAgICAgICAgICAgdGhpcy5oZWFydGJlYXRPdXRnb2luZyxcbiAgICAgICAgICAgICAgICB0aGlzLmhlYXJ0YmVhdEluY29taW5nLFxuICAgICAgICAgICAgXS5qb2luKCcsJyk7XG4gICAgICAgICAgICB0aGlzLl90cmFuc21pdCh7IGNvbW1hbmQ6ICdDT05ORUNUJywgaGVhZGVyczogY29ubmVjdEhlYWRlcnMgfSk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIF9zZXR1cEhlYXJ0YmVhdChoZWFkZXJzKSB7XG4gICAgICAgIGlmIChoZWFkZXJzLnZlcnNpb24gIT09IFZlcnNpb25zLlYxXzEgJiZcbiAgICAgICAgICAgIGhlYWRlcnMudmVyc2lvbiAhPT0gVmVyc2lvbnMuVjFfMikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIEl0IGlzIHZhbGlkIGZvciB0aGUgc2VydmVyIHRvIG5vdCBzZW5kIHRoaXMgaGVhZGVyXG4gICAgICAgIC8vIGh0dHBzOi8vc3RvbXAuZ2l0aHViLmlvL3N0b21wLXNwZWNpZmljYXRpb24tMS4yLmh0bWwjSGVhcnQtYmVhdGluZ1xuICAgICAgICBpZiAoIWhlYWRlcnNbJ2hlYXJ0LWJlYXQnXSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIGhlYXJ0LWJlYXQgaGVhZGVyIHJlY2VpdmVkIGZyb20gdGhlIHNlcnZlciBsb29rcyBsaWtlOlxuICAgICAgICAvL1xuICAgICAgICAvLyAgICAgaGVhcnQtYmVhdDogc3gsIHN5XG4gICAgICAgIGNvbnN0IFtzZXJ2ZXJPdXRnb2luZywgc2VydmVySW5jb21pbmddID0gaGVhZGVyc1snaGVhcnQtYmVhdCddXG4gICAgICAgICAgICAuc3BsaXQoJywnKVxuICAgICAgICAgICAgLm1hcCgodikgPT4gcGFyc2VJbnQodiwgMTApKTtcbiAgICAgICAgaWYgKHRoaXMuaGVhcnRiZWF0T3V0Z29pbmcgIT09IDAgJiYgc2VydmVySW5jb21pbmcgIT09IDApIHtcbiAgICAgICAgICAgIGNvbnN0IHR0bCA9IE1hdGgubWF4KHRoaXMuaGVhcnRiZWF0T3V0Z29pbmcsIHNlcnZlckluY29taW5nKTtcbiAgICAgICAgICAgIHRoaXMuZGVidWcoYHNlbmQgUElORyBldmVyeSAke3R0bH1tc2ApO1xuICAgICAgICAgICAgdGhpcy5fcGluZ2VyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl93ZWJTb2NrZXQucmVhZHlTdGF0ZSA9PT0gU3RvbXBTb2NrZXRTdGF0ZS5PUEVOKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3dlYlNvY2tldC5zZW5kKEJZVEUuTEYpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlYnVnKCc+Pj4gUElORycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHR0bCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaGVhcnRiZWF0SW5jb21pbmcgIT09IDAgJiYgc2VydmVyT3V0Z29pbmcgIT09IDApIHtcbiAgICAgICAgICAgIGNvbnN0IHR0bCA9IE1hdGgubWF4KHRoaXMuaGVhcnRiZWF0SW5jb21pbmcsIHNlcnZlck91dGdvaW5nKTtcbiAgICAgICAgICAgIHRoaXMuZGVidWcoYGNoZWNrIFBPTkcgZXZlcnkgJHt0dGx9bXNgKTtcbiAgICAgICAgICAgIHRoaXMuX3BvbmdlciA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBkZWx0YSA9IERhdGUubm93KCkgLSB0aGlzLl9sYXN0U2VydmVyQWN0aXZpdHlUUztcbiAgICAgICAgICAgICAgICAvLyBXZSB3YWl0IHR3aWNlIHRoZSBUVEwgdG8gYmUgZmxleGlibGUgb24gd2luZG93J3Mgc2V0SW50ZXJ2YWwgY2FsbHNcbiAgICAgICAgICAgICAgICBpZiAoZGVsdGEgPiB0dGwgKiAyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVidWcoYGRpZCBub3QgcmVjZWl2ZSBzZXJ2ZXIgYWN0aXZpdHkgZm9yIHRoZSBsYXN0ICR7ZGVsdGF9bXNgKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2xvc2VPckRpc2NhcmRXZWJzb2NrZXQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0dGwpO1xuICAgICAgICB9XG4gICAgfVxuICAgIF9jbG9zZU9yRGlzY2FyZFdlYnNvY2tldCgpIHtcbiAgICAgICAgaWYgKHRoaXMuZGlzY2FyZFdlYnNvY2tldE9uQ29tbUZhaWx1cmUpIHtcbiAgICAgICAgICAgIHRoaXMuZGVidWcoXCJEaXNjYXJkaW5nIHdlYnNvY2tldCwgdGhlIHVuZGVybHlpbmcgc29ja2V0IG1heSBsaW5nZXIgZm9yIGEgd2hpbGVcIik7XG4gICAgICAgICAgICB0aGlzLl9kaXNjYXJkV2Vic29ja2V0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRlYnVnKFwiSXNzdWluZyBjbG9zZSBvbiB0aGUgd2Vic29ja2V0XCIpO1xuICAgICAgICAgICAgdGhpcy5fY2xvc2VXZWJzb2NrZXQoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3JjZURpc2Nvbm5lY3QoKSB7XG4gICAgICAgIGlmICh0aGlzLl93ZWJTb2NrZXQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl93ZWJTb2NrZXQucmVhZHlTdGF0ZSA9PT0gU3RvbXBTb2NrZXRTdGF0ZS5DT05ORUNUSU5HIHx8XG4gICAgICAgICAgICAgICAgdGhpcy5fd2ViU29ja2V0LnJlYWR5U3RhdGUgPT09IFN0b21wU29ja2V0U3RhdGUuT1BFTikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2Nsb3NlT3JEaXNjYXJkV2Vic29ja2V0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgX2Nsb3NlV2Vic29ja2V0KCkge1xuICAgICAgICB0aGlzLl93ZWJTb2NrZXQub25tZXNzYWdlID0gKCkgPT4geyB9OyAvLyBpZ25vcmUgbWVzc2FnZXNcbiAgICAgICAgdGhpcy5fd2ViU29ja2V0LmNsb3NlKCk7XG4gICAgfVxuICAgIF9kaXNjYXJkV2Vic29ja2V0KCkge1xuICAgICAgICBpZiAoIXRoaXMuX3dlYlNvY2tldC50ZXJtaW5hdGUpIHtcbiAgICAgICAgICAgIGF1Z21lbnRXZWJzb2NrZXQodGhpcy5fd2ViU29ja2V0LCAobXNnKSA9PiB0aGlzLmRlYnVnKG1zZykpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3dlYlNvY2tldC50ZXJtaW5hdGUoKTtcbiAgICB9XG4gICAgX3RyYW5zbWl0KHBhcmFtcykge1xuICAgICAgICBjb25zdCB7IGNvbW1hbmQsIGhlYWRlcnMsIGJvZHksIGJpbmFyeUJvZHksIHNraXBDb250ZW50TGVuZ3RoSGVhZGVyLCB9ID0gcGFyYW1zO1xuICAgICAgICBjb25zdCBmcmFtZSA9IG5ldyBGcmFtZUltcGwoe1xuICAgICAgICAgICAgY29tbWFuZCxcbiAgICAgICAgICAgIGhlYWRlcnMsXG4gICAgICAgICAgICBib2R5LFxuICAgICAgICAgICAgYmluYXJ5Qm9keSxcbiAgICAgICAgICAgIGVzY2FwZUhlYWRlclZhbHVlczogdGhpcy5fZXNjYXBlSGVhZGVyVmFsdWVzLFxuICAgICAgICAgICAgc2tpcENvbnRlbnRMZW5ndGhIZWFkZXIsXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgcmF3Q2h1bmsgPSBmcmFtZS5zZXJpYWxpemUoKTtcbiAgICAgICAgaWYgKHRoaXMubG9nUmF3Q29tbXVuaWNhdGlvbikge1xuICAgICAgICAgICAgdGhpcy5kZWJ1ZyhgPj4+ICR7cmF3Q2h1bmt9YCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRlYnVnKGA+Pj4gJHtmcmFtZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5mb3JjZUJpbmFyeVdTRnJhbWVzICYmIHR5cGVvZiByYXdDaHVuayA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHJhd0NodW5rID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHJhd0NodW5rKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHJhd0NodW5rICE9PSAnc3RyaW5nJyB8fCAhdGhpcy5zcGxpdExhcmdlRnJhbWVzKSB7XG4gICAgICAgICAgICB0aGlzLl93ZWJTb2NrZXQuc2VuZChyYXdDaHVuayk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXQgb3V0ID0gcmF3Q2h1bms7XG4gICAgICAgICAgICB3aGlsZSAob3V0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaHVuayA9IG91dC5zdWJzdHJpbmcoMCwgdGhpcy5tYXhXZWJTb2NrZXRDaHVua1NpemUpO1xuICAgICAgICAgICAgICAgIG91dCA9IG91dC5zdWJzdHJpbmcodGhpcy5tYXhXZWJTb2NrZXRDaHVua1NpemUpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3dlYlNvY2tldC5zZW5kKGNodW5rKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRlYnVnKGBjaHVuayBzZW50ID0gJHtjaHVuay5sZW5ndGh9LCByZW1haW5pbmcgPSAke291dC5sZW5ndGh9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZGlzcG9zZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuY29ubmVjdGVkKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIGNsb25lIGJlZm9yZSB1cGRhdGluZ1xuICAgICAgICAgICAgICAgIGNvbnN0IGRpc2Nvbm5lY3RIZWFkZXJzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5kaXNjb25uZWN0SGVhZGVycyk7XG4gICAgICAgICAgICAgICAgaWYgKCFkaXNjb25uZWN0SGVhZGVycy5yZWNlaXB0KSB7XG4gICAgICAgICAgICAgICAgICAgIGRpc2Nvbm5lY3RIZWFkZXJzLnJlY2VpcHQgPSBgY2xvc2UtJHt0aGlzLl9jb3VudGVyKyt9YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy53YXRjaEZvclJlY2VpcHQoZGlzY29ubmVjdEhlYWRlcnMucmVjZWlwdCwgZnJhbWUgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jbG9zZVdlYnNvY2tldCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jbGVhblVwKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25EaXNjb25uZWN0KGZyYW1lKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLl90cmFuc21pdCh7IGNvbW1hbmQ6ICdESVNDT05ORUNUJywgaGVhZGVyczogZGlzY29ubmVjdEhlYWRlcnMgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlYnVnKGBJZ25vcmluZyBlcnJvciBkdXJpbmcgZGlzY29ubmVjdCAke2Vycm9yfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3dlYlNvY2tldC5yZWFkeVN0YXRlID09PSBTdG9tcFNvY2tldFN0YXRlLkNPTk5FQ1RJTkcgfHxcbiAgICAgICAgICAgICAgICB0aGlzLl93ZWJTb2NrZXQucmVhZHlTdGF0ZSA9PT0gU3RvbXBTb2NrZXRTdGF0ZS5PUEVOKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2xvc2VXZWJzb2NrZXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBfY2xlYW5VcCgpIHtcbiAgICAgICAgdGhpcy5fY29ubmVjdGVkID0gZmFsc2U7XG4gICAgICAgIGlmICh0aGlzLl9waW5nZXIpIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5fcGluZ2VyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fcG9uZ2VyKSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoaXMuX3Bvbmdlcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGlzaChwYXJhbXMpIHtcbiAgICAgICAgY29uc3QgeyBkZXN0aW5hdGlvbiwgaGVhZGVycywgYm9keSwgYmluYXJ5Qm9keSwgc2tpcENvbnRlbnRMZW5ndGhIZWFkZXIsIH0gPSBwYXJhbXM7XG4gICAgICAgIGNvbnN0IGhkcnMgPSBPYmplY3QuYXNzaWduKHsgZGVzdGluYXRpb24gfSwgaGVhZGVycyk7XG4gICAgICAgIHRoaXMuX3RyYW5zbWl0KHtcbiAgICAgICAgICAgIGNvbW1hbmQ6ICdTRU5EJyxcbiAgICAgICAgICAgIGhlYWRlcnM6IGhkcnMsXG4gICAgICAgICAgICBib2R5LFxuICAgICAgICAgICAgYmluYXJ5Qm9keSxcbiAgICAgICAgICAgIHNraXBDb250ZW50TGVuZ3RoSGVhZGVyLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgd2F0Y2hGb3JSZWNlaXB0KHJlY2VpcHRJZCwgY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5fcmVjZWlwdFdhdGNoZXJzW3JlY2VpcHRJZF0gPSBjYWxsYmFjaztcbiAgICB9XG4gICAgc3Vic2NyaWJlKGRlc3RpbmF0aW9uLCBjYWxsYmFjaywgaGVhZGVycyA9IHt9KSB7XG4gICAgICAgIGhlYWRlcnMgPSBPYmplY3QuYXNzaWduKHt9LCBoZWFkZXJzKTtcbiAgICAgICAgaWYgKCFoZWFkZXJzLmlkKSB7XG4gICAgICAgICAgICBoZWFkZXJzLmlkID0gYHN1Yi0ke3RoaXMuX2NvdW50ZXIrK31gO1xuICAgICAgICB9XG4gICAgICAgIGhlYWRlcnMuZGVzdGluYXRpb24gPSBkZXN0aW5hdGlvbjtcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9uc1toZWFkZXJzLmlkXSA9IGNhbGxiYWNrO1xuICAgICAgICB0aGlzLl90cmFuc21pdCh7IGNvbW1hbmQ6ICdTVUJTQ1JJQkUnLCBoZWFkZXJzIH0pO1xuICAgICAgICBjb25zdCBjbGllbnQgPSB0aGlzO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaWQ6IGhlYWRlcnMuaWQsXG4gICAgICAgICAgICB1bnN1YnNjcmliZShoZHJzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsaWVudC51bnN1YnNjcmliZShoZWFkZXJzLmlkLCBoZHJzKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfVxuICAgIHVuc3Vic2NyaWJlKGlkLCBoZWFkZXJzID0ge30pIHtcbiAgICAgICAgaGVhZGVycyA9IE9iamVjdC5hc3NpZ24oe30sIGhlYWRlcnMpO1xuICAgICAgICBkZWxldGUgdGhpcy5fc3Vic2NyaXB0aW9uc1tpZF07XG4gICAgICAgIGhlYWRlcnMuaWQgPSBpZDtcbiAgICAgICAgdGhpcy5fdHJhbnNtaXQoeyBjb21tYW5kOiAnVU5TVUJTQ1JJQkUnLCBoZWFkZXJzIH0pO1xuICAgIH1cbiAgICBiZWdpbih0cmFuc2FjdGlvbklkKSB7XG4gICAgICAgIGNvbnN0IHR4SWQgPSB0cmFuc2FjdGlvbklkIHx8IGB0eC0ke3RoaXMuX2NvdW50ZXIrK31gO1xuICAgICAgICB0aGlzLl90cmFuc21pdCh7XG4gICAgICAgICAgICBjb21tYW5kOiAnQkVHSU4nLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uOiB0eElkLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IHRoaXM7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpZDogdHhJZCxcbiAgICAgICAgICAgIGNvbW1pdCgpIHtcbiAgICAgICAgICAgICAgICBjbGllbnQuY29tbWl0KHR4SWQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFib3J0KCkge1xuICAgICAgICAgICAgICAgIGNsaWVudC5hYm9ydCh0eElkKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfVxuICAgIGNvbW1pdCh0cmFuc2FjdGlvbklkKSB7XG4gICAgICAgIHRoaXMuX3RyYW5zbWl0KHtcbiAgICAgICAgICAgIGNvbW1hbmQ6ICdDT01NSVQnLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uOiB0cmFuc2FjdGlvbklkLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFib3J0KHRyYW5zYWN0aW9uSWQpIHtcbiAgICAgICAgdGhpcy5fdHJhbnNtaXQoe1xuICAgICAgICAgICAgY29tbWFuZDogJ0FCT1JUJyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbjogdHJhbnNhY3Rpb25JZCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBhY2sobWVzc2FnZUlkLCBzdWJzY3JpcHRpb25JZCwgaGVhZGVycyA9IHt9KSB7XG4gICAgICAgIGhlYWRlcnMgPSBPYmplY3QuYXNzaWduKHt9LCBoZWFkZXJzKTtcbiAgICAgICAgaWYgKHRoaXMuX2Nvbm5lY3RlZFZlcnNpb24gPT09IFZlcnNpb25zLlYxXzIpIHtcbiAgICAgICAgICAgIGhlYWRlcnMuaWQgPSBtZXNzYWdlSWQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBoZWFkZXJzWydtZXNzYWdlLWlkJ10gPSBtZXNzYWdlSWQ7XG4gICAgICAgIH1cbiAgICAgICAgaGVhZGVycy5zdWJzY3JpcHRpb24gPSBzdWJzY3JpcHRpb25JZDtcbiAgICAgICAgdGhpcy5fdHJhbnNtaXQoeyBjb21tYW5kOiAnQUNLJywgaGVhZGVycyB9KTtcbiAgICB9XG4gICAgbmFjayhtZXNzYWdlSWQsIHN1YnNjcmlwdGlvbklkLCBoZWFkZXJzID0ge30pIHtcbiAgICAgICAgaGVhZGVycyA9IE9iamVjdC5hc3NpZ24oe30sIGhlYWRlcnMpO1xuICAgICAgICBpZiAodGhpcy5fY29ubmVjdGVkVmVyc2lvbiA9PT0gVmVyc2lvbnMuVjFfMikge1xuICAgICAgICAgICAgaGVhZGVycy5pZCA9IG1lc3NhZ2VJZDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGhlYWRlcnNbJ21lc3NhZ2UtaWQnXSA9IG1lc3NhZ2VJZDtcbiAgICAgICAgfVxuICAgICAgICBoZWFkZXJzLnN1YnNjcmlwdGlvbiA9IHN1YnNjcmlwdGlvbklkO1xuICAgICAgICByZXR1cm4gdGhpcy5fdHJhbnNtaXQoeyBjb21tYW5kOiAnTkFDSycsIGhlYWRlcnMgfSk7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c3RvbXAtaGFuZGxlci5qcy5tYXAiLCIvKipcbiAqIFBvc3NpYmxlIHN0YXRlcyBmb3IgdGhlIElTdG9tcFNvY2tldFxuICovXG5leHBvcnQgdmFyIFN0b21wU29ja2V0U3RhdGU7XG4oZnVuY3Rpb24gKFN0b21wU29ja2V0U3RhdGUpIHtcbiAgICBTdG9tcFNvY2tldFN0YXRlW1N0b21wU29ja2V0U3RhdGVbXCJDT05ORUNUSU5HXCJdID0gMF0gPSBcIkNPTk5FQ1RJTkdcIjtcbiAgICBTdG9tcFNvY2tldFN0YXRlW1N0b21wU29ja2V0U3RhdGVbXCJPUEVOXCJdID0gMV0gPSBcIk9QRU5cIjtcbiAgICBTdG9tcFNvY2tldFN0YXRlW1N0b21wU29ja2V0U3RhdGVbXCJDTE9TSU5HXCJdID0gMl0gPSBcIkNMT1NJTkdcIjtcbiAgICBTdG9tcFNvY2tldFN0YXRlW1N0b21wU29ja2V0U3RhdGVbXCJDTE9TRURcIl0gPSAzXSA9IFwiQ0xPU0VEXCI7XG59KShTdG9tcFNvY2tldFN0YXRlIHx8IChTdG9tcFNvY2tldFN0YXRlID0ge30pKTtcbi8qKlxuICogUG9zc2libGUgYWN0aXZhdGlvbiBzdGF0ZVxuICovXG5leHBvcnQgdmFyIEFjdGl2YXRpb25TdGF0ZTtcbihmdW5jdGlvbiAoQWN0aXZhdGlvblN0YXRlKSB7XG4gICAgQWN0aXZhdGlvblN0YXRlW0FjdGl2YXRpb25TdGF0ZVtcIkFDVElWRVwiXSA9IDBdID0gXCJBQ1RJVkVcIjtcbiAgICBBY3RpdmF0aW9uU3RhdGVbQWN0aXZhdGlvblN0YXRlW1wiREVBQ1RJVkFUSU5HXCJdID0gMV0gPSBcIkRFQUNUSVZBVElOR1wiO1xuICAgIEFjdGl2YXRpb25TdGF0ZVtBY3RpdmF0aW9uU3RhdGVbXCJJTkFDVElWRVwiXSA9IDJdID0gXCJJTkFDVElWRVwiO1xufSkoQWN0aXZhdGlvblN0YXRlIHx8IChBY3RpdmF0aW9uU3RhdGUgPSB7fSkpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dHlwZXMuanMubWFwIiwiLyoqXG4gKiBTdXBwb3J0ZWQgU1RPTVAgdmVyc2lvbnNcbiAqXG4gKiBQYXJ0IG9mIGBAc3RvbXAvc3RvbXBqc2AuXG4gKi9cbmV4cG9ydCBjbGFzcyBWZXJzaW9ucyB7XG4gICAgLyoqXG4gICAgICogVGFrZXMgYW4gYXJyYXkgb2Ygc3RyaW5nIG9mIHZlcnNpb25zLCB0eXBpY2FsIGVsZW1lbnRzICcxLjAnLCAnMS4xJywgb3IgJzEuMidcbiAgICAgKlxuICAgICAqIFlvdSB3aWxsIGFuIGluc3RhbmNlIGlmIHRoaXMgY2xhc3MgaWYgeW91IHdhbnQgdG8gb3ZlcnJpZGUgc3VwcG9ydGVkIHZlcnNpb25zIHRvIGJlIGRlY2xhcmVkIGR1cmluZ1xuICAgICAqIFNUT01QIGhhbmRzaGFrZS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcih2ZXJzaW9ucykge1xuICAgICAgICB0aGlzLnZlcnNpb25zID0gdmVyc2lvbnM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVzZWQgYXMgcGFydCBvZiBDT05ORUNUIFNUT01QIEZyYW1lXG4gICAgICovXG4gICAgc3VwcG9ydGVkVmVyc2lvbnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnZlcnNpb25zLmpvaW4oJywnKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVXNlZCB3aGlsZSBjcmVhdGluZyBhIFdlYlNvY2tldFxuICAgICAqL1xuICAgIHByb3RvY29sVmVyc2lvbnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnZlcnNpb25zLm1hcCh4ID0+IGB2JHt4LnJlcGxhY2UoJy4nLCAnJyl9LnN0b21wYCk7XG4gICAgfVxufVxuLyoqXG4gKiBJbmRpY2F0ZXMgcHJvdG9jb2wgdmVyc2lvbiAxLjBcbiAqL1xuVmVyc2lvbnMuVjFfMCA9ICcxLjAnO1xuLyoqXG4gKiBJbmRpY2F0ZXMgcHJvdG9jb2wgdmVyc2lvbiAxLjFcbiAqL1xuVmVyc2lvbnMuVjFfMSA9ICcxLjEnO1xuLyoqXG4gKiBJbmRpY2F0ZXMgcHJvdG9jb2wgdmVyc2lvbiAxLjJcbiAqL1xuVmVyc2lvbnMuVjFfMiA9ICcxLjInO1xuLyoqXG4gKiBAaW50ZXJuYWxcbiAqL1xuVmVyc2lvbnMuZGVmYXVsdCA9IG5ldyBWZXJzaW9ucyhbXG4gICAgVmVyc2lvbnMuVjFfMCxcbiAgICBWZXJzaW9ucy5WMV8xLFxuICAgIFZlcnNpb25zLlYxXzIsXG5dKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXZlcnNpb25zLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBfdHlwZW9mKG9iaikgeyBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIpIHsgX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9OyB9IGVsc2UgeyBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07IH0gcmV0dXJuIF90eXBlb2Yob2JqKTsgfVxuXG4vKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cblxuLyoqXG4gKiBUaGlzIGlzIHRoZSB3ZWIgYnJvd3NlciBpbXBsZW1lbnRhdGlvbiBvZiBgZGVidWcoKWAuXG4gKi9cbmV4cG9ydHMubG9nID0gbG9nO1xuZXhwb3J0cy5mb3JtYXRBcmdzID0gZm9ybWF0QXJncztcbmV4cG9ydHMuc2F2ZSA9IHNhdmU7XG5leHBvcnRzLmxvYWQgPSBsb2FkO1xuZXhwb3J0cy51c2VDb2xvcnMgPSB1c2VDb2xvcnM7XG5leHBvcnRzLnN0b3JhZ2UgPSBsb2NhbHN0b3JhZ2UoKTtcbi8qKlxuICogQ29sb3JzLlxuICovXG5cbmV4cG9ydHMuY29sb3JzID0gWycjMDAwMENDJywgJyMwMDAwRkYnLCAnIzAwMzNDQycsICcjMDAzM0ZGJywgJyMwMDY2Q0MnLCAnIzAwNjZGRicsICcjMDA5OUNDJywgJyMwMDk5RkYnLCAnIzAwQ0MwMCcsICcjMDBDQzMzJywgJyMwMENDNjYnLCAnIzAwQ0M5OScsICcjMDBDQ0NDJywgJyMwMENDRkYnLCAnIzMzMDBDQycsICcjMzMwMEZGJywgJyMzMzMzQ0MnLCAnIzMzMzNGRicsICcjMzM2NkNDJywgJyMzMzY2RkYnLCAnIzMzOTlDQycsICcjMzM5OUZGJywgJyMzM0NDMDAnLCAnIzMzQ0MzMycsICcjMzNDQzY2JywgJyMzM0NDOTknLCAnIzMzQ0NDQycsICcjMzNDQ0ZGJywgJyM2NjAwQ0MnLCAnIzY2MDBGRicsICcjNjYzM0NDJywgJyM2NjMzRkYnLCAnIzY2Q0MwMCcsICcjNjZDQzMzJywgJyM5OTAwQ0MnLCAnIzk5MDBGRicsICcjOTkzM0NDJywgJyM5OTMzRkYnLCAnIzk5Q0MwMCcsICcjOTlDQzMzJywgJyNDQzAwMDAnLCAnI0NDMDAzMycsICcjQ0MwMDY2JywgJyNDQzAwOTknLCAnI0NDMDBDQycsICcjQ0MwMEZGJywgJyNDQzMzMDAnLCAnI0NDMzMzMycsICcjQ0MzMzY2JywgJyNDQzMzOTknLCAnI0NDMzNDQycsICcjQ0MzM0ZGJywgJyNDQzY2MDAnLCAnI0NDNjYzMycsICcjQ0M5OTAwJywgJyNDQzk5MzMnLCAnI0NDQ0MwMCcsICcjQ0NDQzMzJywgJyNGRjAwMDAnLCAnI0ZGMDAzMycsICcjRkYwMDY2JywgJyNGRjAwOTknLCAnI0ZGMDBDQycsICcjRkYwMEZGJywgJyNGRjMzMDAnLCAnI0ZGMzMzMycsICcjRkYzMzY2JywgJyNGRjMzOTknLCAnI0ZGMzNDQycsICcjRkYzM0ZGJywgJyNGRjY2MDAnLCAnI0ZGNjYzMycsICcjRkY5OTAwJywgJyNGRjk5MzMnLCAnI0ZGQ0MwMCcsICcjRkZDQzMzJ107XG4vKipcbiAqIEN1cnJlbnRseSBvbmx5IFdlYktpdC1iYXNlZCBXZWIgSW5zcGVjdG9ycywgRmlyZWZveCA+PSB2MzEsXG4gKiBhbmQgdGhlIEZpcmVidWcgZXh0ZW5zaW9uIChhbnkgRmlyZWZveCB2ZXJzaW9uKSBhcmUga25vd25cbiAqIHRvIHN1cHBvcnQgXCIlY1wiIENTUyBjdXN0b21pemF0aW9ucy5cbiAqXG4gKiBUT0RPOiBhZGQgYSBgbG9jYWxTdG9yYWdlYCB2YXJpYWJsZSB0byBleHBsaWNpdGx5IGVuYWJsZS9kaXNhYmxlIGNvbG9yc1xuICovXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29tcGxleGl0eVxuXG5mdW5jdGlvbiB1c2VDb2xvcnMoKSB7XG4gIC8vIE5COiBJbiBhbiBFbGVjdHJvbiBwcmVsb2FkIHNjcmlwdCwgZG9jdW1lbnQgd2lsbCBiZSBkZWZpbmVkIGJ1dCBub3QgZnVsbHlcbiAgLy8gaW5pdGlhbGl6ZWQuIFNpbmNlIHdlIGtub3cgd2UncmUgaW4gQ2hyb21lLCB3ZSdsbCBqdXN0IGRldGVjdCB0aGlzIGNhc2VcbiAgLy8gZXhwbGljaXRseVxuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LnByb2Nlc3MgJiYgKHdpbmRvdy5wcm9jZXNzLnR5cGUgPT09ICdyZW5kZXJlcicgfHwgd2luZG93LnByb2Nlc3MuX19ud2pzKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IC8vIEludGVybmV0IEV4cGxvcmVyIGFuZCBFZGdlIGRvIG5vdCBzdXBwb3J0IGNvbG9ycy5cblxuXG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IudXNlckFnZW50ICYmIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5tYXRjaCgvKGVkZ2V8dHJpZGVudClcXC8oXFxkKykvKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSAvLyBJcyB3ZWJraXQ/IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzE2NDU5NjA2LzM3Njc3M1xuICAvLyBkb2N1bWVudCBpcyB1bmRlZmluZWQgaW4gcmVhY3QtbmF0aXZlOiBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svcmVhY3QtbmF0aXZlL3B1bGwvMTYzMlxuXG5cbiAgcmV0dXJuIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZSAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuV2Via2l0QXBwZWFyYW5jZSB8fCAvLyBJcyBmaXJlYnVnPyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8zOTgxMjAvMzc2NzczXG4gIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5jb25zb2xlICYmICh3aW5kb3cuY29uc29sZS5maXJlYnVnIHx8IHdpbmRvdy5jb25zb2xlLmV4Y2VwdGlvbiAmJiB3aW5kb3cuY29uc29sZS50YWJsZSkgfHwgLy8gSXMgZmlyZWZveCA+PSB2MzE/XG4gIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvVG9vbHMvV2ViX0NvbnNvbGUjU3R5bGluZ19tZXNzYWdlc1xuICB0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IudXNlckFnZW50ICYmIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5tYXRjaCgvZmlyZWZveFxcLyhcXGQrKS8pICYmIHBhcnNlSW50KFJlZ0V4cC4kMSwgMTApID49IDMxIHx8IC8vIERvdWJsZSBjaGVjayB3ZWJraXQgaW4gdXNlckFnZW50IGp1c3QgaW4gY2FzZSB3ZSBhcmUgaW4gYSB3b3JrZXJcbiAgdHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudCAmJiBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkubWF0Y2goL2FwcGxld2Via2l0XFwvKFxcZCspLyk7XG59XG4vKipcbiAqIENvbG9yaXplIGxvZyBhcmd1bWVudHMgaWYgZW5hYmxlZC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblxuZnVuY3Rpb24gZm9ybWF0QXJncyhhcmdzKSB7XG4gIGFyZ3NbMF0gPSAodGhpcy51c2VDb2xvcnMgPyAnJWMnIDogJycpICsgdGhpcy5uYW1lc3BhY2UgKyAodGhpcy51c2VDb2xvcnMgPyAnICVjJyA6ICcgJykgKyBhcmdzWzBdICsgKHRoaXMudXNlQ29sb3JzID8gJyVjICcgOiAnICcpICsgJysnICsgbW9kdWxlLmV4cG9ydHMuaHVtYW5pemUodGhpcy5kaWZmKTtcblxuICBpZiAoIXRoaXMudXNlQ29sb3JzKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGMgPSAnY29sb3I6ICcgKyB0aGlzLmNvbG9yO1xuICBhcmdzLnNwbGljZSgxLCAwLCBjLCAnY29sb3I6IGluaGVyaXQnKTsgLy8gVGhlIGZpbmFsIFwiJWNcIiBpcyBzb21ld2hhdCB0cmlja3ksIGJlY2F1c2UgdGhlcmUgY291bGQgYmUgb3RoZXJcbiAgLy8gYXJndW1lbnRzIHBhc3NlZCBlaXRoZXIgYmVmb3JlIG9yIGFmdGVyIHRoZSAlYywgc28gd2UgbmVlZCB0b1xuICAvLyBmaWd1cmUgb3V0IHRoZSBjb3JyZWN0IGluZGV4IHRvIGluc2VydCB0aGUgQ1NTIGludG9cblxuICB2YXIgaW5kZXggPSAwO1xuICB2YXIgbGFzdEMgPSAwO1xuICBhcmdzWzBdLnJlcGxhY2UoLyVbYS16QS1aJV0vZywgZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgaWYgKG1hdGNoID09PSAnJSUnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaW5kZXgrKztcblxuICAgIGlmIChtYXRjaCA9PT0gJyVjJykge1xuICAgICAgLy8gV2Ugb25seSBhcmUgaW50ZXJlc3RlZCBpbiB0aGUgKmxhc3QqICVjXG4gICAgICAvLyAodGhlIHVzZXIgbWF5IGhhdmUgcHJvdmlkZWQgdGhlaXIgb3duKVxuICAgICAgbGFzdEMgPSBpbmRleDtcbiAgICB9XG4gIH0pO1xuICBhcmdzLnNwbGljZShsYXN0QywgMCwgYyk7XG59XG4vKipcbiAqIEludm9rZXMgYGNvbnNvbGUubG9nKClgIHdoZW4gYXZhaWxhYmxlLlxuICogTm8tb3Agd2hlbiBgY29uc29sZS5sb2dgIGlzIG5vdCBhIFwiZnVuY3Rpb25cIi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblxuZnVuY3Rpb24gbG9nKCkge1xuICB2YXIgX2NvbnNvbGU7XG5cbiAgLy8gVGhpcyBoYWNrZXJ5IGlzIHJlcXVpcmVkIGZvciBJRTgvOSwgd2hlcmVcbiAgLy8gdGhlIGBjb25zb2xlLmxvZ2AgZnVuY3Rpb24gZG9lc24ndCBoYXZlICdhcHBseSdcbiAgcmV0dXJuICh0eXBlb2YgY29uc29sZSA9PT0gXCJ1bmRlZmluZWRcIiA/IFwidW5kZWZpbmVkXCIgOiBfdHlwZW9mKGNvbnNvbGUpKSA9PT0gJ29iamVjdCcgJiYgY29uc29sZS5sb2cgJiYgKF9jb25zb2xlID0gY29uc29sZSkubG9nLmFwcGx5KF9jb25zb2xlLCBhcmd1bWVudHMpO1xufVxuLyoqXG4gKiBTYXZlIGBuYW1lc3BhY2VzYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuXG5mdW5jdGlvbiBzYXZlKG5hbWVzcGFjZXMpIHtcbiAgdHJ5IHtcbiAgICBpZiAobmFtZXNwYWNlcykge1xuICAgICAgZXhwb3J0cy5zdG9yYWdlLnNldEl0ZW0oJ2RlYnVnJywgbmFtZXNwYWNlcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV4cG9ydHMuc3RvcmFnZS5yZW1vdmVJdGVtKCdkZWJ1ZycpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHsvLyBTd2FsbG93XG4gICAgLy8gWFhYIChAUWl4LSkgc2hvdWxkIHdlIGJlIGxvZ2dpbmcgdGhlc2U/XG4gIH1cbn1cbi8qKlxuICogTG9hZCBgbmFtZXNwYWNlc2AuXG4gKlxuICogQHJldHVybiB7U3RyaW5nfSByZXR1cm5zIHRoZSBwcmV2aW91c2x5IHBlcnNpc3RlZCBkZWJ1ZyBtb2Rlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuXG5mdW5jdGlvbiBsb2FkKCkge1xuICB2YXIgcjtcblxuICB0cnkge1xuICAgIHIgPSBleHBvcnRzLnN0b3JhZ2UuZ2V0SXRlbSgnZGVidWcnKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHt9IC8vIFN3YWxsb3dcbiAgLy8gWFhYIChAUWl4LSkgc2hvdWxkIHdlIGJlIGxvZ2dpbmcgdGhlc2U/XG4gIC8vIElmIGRlYnVnIGlzbid0IHNldCBpbiBMUywgYW5kIHdlJ3JlIGluIEVsZWN0cm9uLCB0cnkgdG8gbG9hZCAkREVCVUdcblxuXG4gIGlmICghciAmJiB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgJ2VudicgaW4gcHJvY2Vzcykge1xuICAgIHIgPSBwcm9jZXNzLmVudi5ERUJVRztcbiAgfVxuXG4gIHJldHVybiByO1xufVxuLyoqXG4gKiBMb2NhbHN0b3JhZ2UgYXR0ZW1wdHMgdG8gcmV0dXJuIHRoZSBsb2NhbHN0b3JhZ2UuXG4gKlxuICogVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSBzYWZhcmkgdGhyb3dzXG4gKiB3aGVuIGEgdXNlciBkaXNhYmxlcyBjb29raWVzL2xvY2Fsc3RvcmFnZVxuICogYW5kIHlvdSBhdHRlbXB0IHRvIGFjY2VzcyBpdC5cbiAqXG4gKiBAcmV0dXJuIHtMb2NhbFN0b3JhZ2V9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5cbmZ1bmN0aW9uIGxvY2Fsc3RvcmFnZSgpIHtcbiAgdHJ5IHtcbiAgICAvLyBUVk1MS2l0IChBcHBsZSBUViBKUyBSdW50aW1lKSBkb2VzIG5vdCBoYXZlIGEgd2luZG93IG9iamVjdCwganVzdCBsb2NhbFN0b3JhZ2UgaW4gdGhlIGdsb2JhbCBjb250ZXh0XG4gICAgLy8gVGhlIEJyb3dzZXIgYWxzbyBoYXMgbG9jYWxTdG9yYWdlIGluIHRoZSBnbG9iYWwgY29udGV4dC5cbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlO1xuICB9IGNhdGNoIChlcnJvcikgey8vIFN3YWxsb3dcbiAgICAvLyBYWFggKEBRaXgtKSBzaG91bGQgd2UgYmUgbG9nZ2luZyB0aGVzZT9cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vY29tbW9uJykoZXhwb3J0cyk7XG52YXIgZm9ybWF0dGVycyA9IG1vZHVsZS5leHBvcnRzLmZvcm1hdHRlcnM7XG4vKipcbiAqIE1hcCAlaiB0byBgSlNPTi5zdHJpbmdpZnkoKWAsIHNpbmNlIG5vIFdlYiBJbnNwZWN0b3JzIGRvIHRoYXQgYnkgZGVmYXVsdC5cbiAqL1xuXG5mb3JtYXR0ZXJzLmogPSBmdW5jdGlvbiAodikge1xuICB0cnkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gJ1tVbmV4cGVjdGVkSlNPTlBhcnNlRXJyb3JdOiAnICsgZXJyb3IubWVzc2FnZTtcbiAgfVxufTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogVGhpcyBpcyB0aGUgY29tbW9uIGxvZ2ljIGZvciBib3RoIHRoZSBOb2RlLmpzIGFuZCB3ZWIgYnJvd3NlclxuICogaW1wbGVtZW50YXRpb25zIG9mIGBkZWJ1ZygpYC5cbiAqL1xuZnVuY3Rpb24gc2V0dXAoZW52KSB7XG4gIGNyZWF0ZURlYnVnLmRlYnVnID0gY3JlYXRlRGVidWc7XG4gIGNyZWF0ZURlYnVnLmRlZmF1bHQgPSBjcmVhdGVEZWJ1ZztcbiAgY3JlYXRlRGVidWcuY29lcmNlID0gY29lcmNlO1xuICBjcmVhdGVEZWJ1Zy5kaXNhYmxlID0gZGlzYWJsZTtcbiAgY3JlYXRlRGVidWcuZW5hYmxlID0gZW5hYmxlO1xuICBjcmVhdGVEZWJ1Zy5lbmFibGVkID0gZW5hYmxlZDtcbiAgY3JlYXRlRGVidWcuaHVtYW5pemUgPSByZXF1aXJlKCdtcycpO1xuICBPYmplY3Qua2V5cyhlbnYpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIGNyZWF0ZURlYnVnW2tleV0gPSBlbnZba2V5XTtcbiAgfSk7XG4gIC8qKlxuICAqIEFjdGl2ZSBgZGVidWdgIGluc3RhbmNlcy5cbiAgKi9cblxuICBjcmVhdGVEZWJ1Zy5pbnN0YW5jZXMgPSBbXTtcbiAgLyoqXG4gICogVGhlIGN1cnJlbnRseSBhY3RpdmUgZGVidWcgbW9kZSBuYW1lcywgYW5kIG5hbWVzIHRvIHNraXAuXG4gICovXG5cbiAgY3JlYXRlRGVidWcubmFtZXMgPSBbXTtcbiAgY3JlYXRlRGVidWcuc2tpcHMgPSBbXTtcbiAgLyoqXG4gICogTWFwIG9mIHNwZWNpYWwgXCIlblwiIGhhbmRsaW5nIGZ1bmN0aW9ucywgZm9yIHRoZSBkZWJ1ZyBcImZvcm1hdFwiIGFyZ3VtZW50LlxuICAqXG4gICogVmFsaWQga2V5IG5hbWVzIGFyZSBhIHNpbmdsZSwgbG93ZXIgb3IgdXBwZXItY2FzZSBsZXR0ZXIsIGkuZS4gXCJuXCIgYW5kIFwiTlwiLlxuICAqL1xuXG4gIGNyZWF0ZURlYnVnLmZvcm1hdHRlcnMgPSB7fTtcbiAgLyoqXG4gICogU2VsZWN0cyBhIGNvbG9yIGZvciBhIGRlYnVnIG5hbWVzcGFjZVxuICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2UgVGhlIG5hbWVzcGFjZSBzdHJpbmcgZm9yIHRoZSBmb3IgdGhlIGRlYnVnIGluc3RhbmNlIHRvIGJlIGNvbG9yZWRcbiAgKiBAcmV0dXJuIHtOdW1iZXJ8U3RyaW5nfSBBbiBBTlNJIGNvbG9yIGNvZGUgZm9yIHRoZSBnaXZlbiBuYW1lc3BhY2VcbiAgKiBAYXBpIHByaXZhdGVcbiAgKi9cblxuICBmdW5jdGlvbiBzZWxlY3RDb2xvcihuYW1lc3BhY2UpIHtcbiAgICB2YXIgaGFzaCA9IDA7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5hbWVzcGFjZS5sZW5ndGg7IGkrKykge1xuICAgICAgaGFzaCA9IChoYXNoIDw8IDUpIC0gaGFzaCArIG5hbWVzcGFjZS5jaGFyQ29kZUF0KGkpO1xuICAgICAgaGFzaCB8PSAwOyAvLyBDb252ZXJ0IHRvIDMyYml0IGludGVnZXJcbiAgICB9XG5cbiAgICByZXR1cm4gY3JlYXRlRGVidWcuY29sb3JzW01hdGguYWJzKGhhc2gpICUgY3JlYXRlRGVidWcuY29sb3JzLmxlbmd0aF07XG4gIH1cblxuICBjcmVhdGVEZWJ1Zy5zZWxlY3RDb2xvciA9IHNlbGVjdENvbG9yO1xuICAvKipcbiAgKiBDcmVhdGUgYSBkZWJ1Z2dlciB3aXRoIHRoZSBnaXZlbiBgbmFtZXNwYWNlYC5cbiAgKlxuICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2VcbiAgKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAgKiBAYXBpIHB1YmxpY1xuICAqL1xuXG4gIGZ1bmN0aW9uIGNyZWF0ZURlYnVnKG5hbWVzcGFjZSkge1xuICAgIHZhciBwcmV2VGltZTtcblxuICAgIGZ1bmN0aW9uIGRlYnVnKCkge1xuICAgICAgLy8gRGlzYWJsZWQ/XG4gICAgICBpZiAoIWRlYnVnLmVuYWJsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IG5ldyBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICAgIH1cblxuICAgICAgdmFyIHNlbGYgPSBkZWJ1ZzsgLy8gU2V0IGBkaWZmYCB0aW1lc3RhbXBcblxuICAgICAgdmFyIGN1cnIgPSBOdW1iZXIobmV3IERhdGUoKSk7XG4gICAgICB2YXIgbXMgPSBjdXJyIC0gKHByZXZUaW1lIHx8IGN1cnIpO1xuICAgICAgc2VsZi5kaWZmID0gbXM7XG4gICAgICBzZWxmLnByZXYgPSBwcmV2VGltZTtcbiAgICAgIHNlbGYuY3VyciA9IGN1cnI7XG4gICAgICBwcmV2VGltZSA9IGN1cnI7XG4gICAgICBhcmdzWzBdID0gY3JlYXRlRGVidWcuY29lcmNlKGFyZ3NbMF0pO1xuXG4gICAgICBpZiAodHlwZW9mIGFyZ3NbMF0gIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIC8vIEFueXRoaW5nIGVsc2UgbGV0J3MgaW5zcGVjdCB3aXRoICVPXG4gICAgICAgIGFyZ3MudW5zaGlmdCgnJU8nKTtcbiAgICAgIH0gLy8gQXBwbHkgYW55IGBmb3JtYXR0ZXJzYCB0cmFuc2Zvcm1hdGlvbnNcblxuXG4gICAgICB2YXIgaW5kZXggPSAwO1xuICAgICAgYXJnc1swXSA9IGFyZ3NbMF0ucmVwbGFjZSgvJShbYS16QS1aJV0pL2csIGZ1bmN0aW9uIChtYXRjaCwgZm9ybWF0KSB7XG4gICAgICAgIC8vIElmIHdlIGVuY291bnRlciBhbiBlc2NhcGVkICUgdGhlbiBkb24ndCBpbmNyZWFzZSB0aGUgYXJyYXkgaW5kZXhcbiAgICAgICAgaWYgKG1hdGNoID09PSAnJSUnKSB7XG4gICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICB9XG5cbiAgICAgICAgaW5kZXgrKztcbiAgICAgICAgdmFyIGZvcm1hdHRlciA9IGNyZWF0ZURlYnVnLmZvcm1hdHRlcnNbZm9ybWF0XTtcblxuICAgICAgICBpZiAodHlwZW9mIGZvcm1hdHRlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHZhciB2YWwgPSBhcmdzW2luZGV4XTtcbiAgICAgICAgICBtYXRjaCA9IGZvcm1hdHRlci5jYWxsKHNlbGYsIHZhbCk7IC8vIE5vdyB3ZSBuZWVkIHRvIHJlbW92ZSBgYXJnc1tpbmRleF1gIHNpbmNlIGl0J3MgaW5saW5lZCBpbiB0aGUgYGZvcm1hdGBcblxuICAgICAgICAgIGFyZ3Muc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICBpbmRleC0tO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgfSk7IC8vIEFwcGx5IGVudi1zcGVjaWZpYyBmb3JtYXR0aW5nIChjb2xvcnMsIGV0Yy4pXG5cbiAgICAgIGNyZWF0ZURlYnVnLmZvcm1hdEFyZ3MuY2FsbChzZWxmLCBhcmdzKTtcbiAgICAgIHZhciBsb2dGbiA9IHNlbGYubG9nIHx8IGNyZWF0ZURlYnVnLmxvZztcbiAgICAgIGxvZ0ZuLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgIH1cblxuICAgIGRlYnVnLm5hbWVzcGFjZSA9IG5hbWVzcGFjZTtcbiAgICBkZWJ1Zy5lbmFibGVkID0gY3JlYXRlRGVidWcuZW5hYmxlZChuYW1lc3BhY2UpO1xuICAgIGRlYnVnLnVzZUNvbG9ycyA9IGNyZWF0ZURlYnVnLnVzZUNvbG9ycygpO1xuICAgIGRlYnVnLmNvbG9yID0gc2VsZWN0Q29sb3IobmFtZXNwYWNlKTtcbiAgICBkZWJ1Zy5kZXN0cm95ID0gZGVzdHJveTtcbiAgICBkZWJ1Zy5leHRlbmQgPSBleHRlbmQ7IC8vIERlYnVnLmZvcm1hdEFyZ3MgPSBmb3JtYXRBcmdzO1xuICAgIC8vIGRlYnVnLnJhd0xvZyA9IHJhd0xvZztcbiAgICAvLyBlbnYtc3BlY2lmaWMgaW5pdGlhbGl6YXRpb24gbG9naWMgZm9yIGRlYnVnIGluc3RhbmNlc1xuXG4gICAgaWYgKHR5cGVvZiBjcmVhdGVEZWJ1Zy5pbml0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjcmVhdGVEZWJ1Zy5pbml0KGRlYnVnKTtcbiAgICB9XG5cbiAgICBjcmVhdGVEZWJ1Zy5pbnN0YW5jZXMucHVzaChkZWJ1Zyk7XG4gICAgcmV0dXJuIGRlYnVnO1xuICB9XG5cbiAgZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICB2YXIgaW5kZXggPSBjcmVhdGVEZWJ1Zy5pbnN0YW5jZXMuaW5kZXhPZih0aGlzKTtcblxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIGNyZWF0ZURlYnVnLmluc3RhbmNlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gZXh0ZW5kKG5hbWVzcGFjZSwgZGVsaW1pdGVyKSB7XG4gICAgcmV0dXJuIGNyZWF0ZURlYnVnKHRoaXMubmFtZXNwYWNlICsgKHR5cGVvZiBkZWxpbWl0ZXIgPT09ICd1bmRlZmluZWQnID8gJzonIDogZGVsaW1pdGVyKSArIG5hbWVzcGFjZSk7XG4gIH1cbiAgLyoqXG4gICogRW5hYmxlcyBhIGRlYnVnIG1vZGUgYnkgbmFtZXNwYWNlcy4gVGhpcyBjYW4gaW5jbHVkZSBtb2Rlc1xuICAqIHNlcGFyYXRlZCBieSBhIGNvbG9uIGFuZCB3aWxkY2FyZHMuXG4gICpcbiAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlc1xuICAqIEBhcGkgcHVibGljXG4gICovXG5cblxuICBmdW5jdGlvbiBlbmFibGUobmFtZXNwYWNlcykge1xuICAgIGNyZWF0ZURlYnVnLnNhdmUobmFtZXNwYWNlcyk7XG4gICAgY3JlYXRlRGVidWcubmFtZXMgPSBbXTtcbiAgICBjcmVhdGVEZWJ1Zy5za2lwcyA9IFtdO1xuICAgIHZhciBpO1xuICAgIHZhciBzcGxpdCA9ICh0eXBlb2YgbmFtZXNwYWNlcyA9PT0gJ3N0cmluZycgPyBuYW1lc3BhY2VzIDogJycpLnNwbGl0KC9bXFxzLF0rLyk7XG4gICAgdmFyIGxlbiA9IHNwbGl0Lmxlbmd0aDtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgaWYgKCFzcGxpdFtpXSkge1xuICAgICAgICAvLyBpZ25vcmUgZW1wdHkgc3RyaW5nc1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgbmFtZXNwYWNlcyA9IHNwbGl0W2ldLnJlcGxhY2UoL1xcKi9nLCAnLio/Jyk7XG5cbiAgICAgIGlmIChuYW1lc3BhY2VzWzBdID09PSAnLScpIHtcbiAgICAgICAgY3JlYXRlRGVidWcuc2tpcHMucHVzaChuZXcgUmVnRXhwKCdeJyArIG5hbWVzcGFjZXMuc3Vic3RyKDEpICsgJyQnKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjcmVhdGVEZWJ1Zy5uYW1lcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZXNwYWNlcyArICckJykpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoaSA9IDA7IGkgPCBjcmVhdGVEZWJ1Zy5pbnN0YW5jZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpbnN0YW5jZSA9IGNyZWF0ZURlYnVnLmluc3RhbmNlc1tpXTtcbiAgICAgIGluc3RhbmNlLmVuYWJsZWQgPSBjcmVhdGVEZWJ1Zy5lbmFibGVkKGluc3RhbmNlLm5hbWVzcGFjZSk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAqIERpc2FibGUgZGVidWcgb3V0cHV0LlxuICAqXG4gICogQGFwaSBwdWJsaWNcbiAgKi9cblxuXG4gIGZ1bmN0aW9uIGRpc2FibGUoKSB7XG4gICAgY3JlYXRlRGVidWcuZW5hYmxlKCcnKTtcbiAgfVxuICAvKipcbiAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIG1vZGUgbmFtZSBpcyBlbmFibGVkLCBmYWxzZSBvdGhlcndpc2UuXG4gICpcbiAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICogQGFwaSBwdWJsaWNcbiAgKi9cblxuXG4gIGZ1bmN0aW9uIGVuYWJsZWQobmFtZSkge1xuICAgIGlmIChuYW1lW25hbWUubGVuZ3RoIC0gMV0gPT09ICcqJykge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgdmFyIGk7XG4gICAgdmFyIGxlbjtcblxuICAgIGZvciAoaSA9IDAsIGxlbiA9IGNyZWF0ZURlYnVnLnNraXBzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpZiAoY3JlYXRlRGVidWcuc2tpcHNbaV0udGVzdChuYW1lKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChpID0gMCwgbGVuID0gY3JlYXRlRGVidWcubmFtZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGlmIChjcmVhdGVEZWJ1Zy5uYW1lc1tpXS50ZXN0KG5hbWUpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvKipcbiAgKiBDb2VyY2UgYHZhbGAuXG4gICpcbiAgKiBAcGFyYW0ge01peGVkfSB2YWxcbiAgKiBAcmV0dXJuIHtNaXhlZH1cbiAgKiBAYXBpIHByaXZhdGVcbiAgKi9cblxuXG4gIGZ1bmN0aW9uIGNvZXJjZSh2YWwpIHtcbiAgICBpZiAodmFsIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIHJldHVybiB2YWwuc3RhY2sgfHwgdmFsLm1lc3NhZ2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbDtcbiAgfVxuXG4gIGNyZWF0ZURlYnVnLmVuYWJsZShjcmVhdGVEZWJ1Zy5sb2FkKCkpO1xuICByZXR1cm4gY3JlYXRlRGVidWc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2V0dXA7XG5cbiIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGlmIChzdXBlckN0b3IpIHtcbiAgICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgaWYgKHN1cGVyQ3Rvcikge1xuICAgICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgICBUZW1wQ3Rvci5wcm90b3R5cGUgPSBzdXBlckN0b3IucHJvdG90eXBlXG4gICAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgICB9XG4gIH1cbn1cbiIsIi8qISBKU09OIHYzLjMuMiB8IGh0dHBzOi8vYmVzdGllanMuZ2l0aHViLmlvL2pzb24zIHwgQ29weXJpZ2h0IDIwMTItMjAxNSwgS2l0IENhbWJyaWRnZSwgQmVuamFtaW4gVGFuIHwgaHR0cDovL2tpdC5taXQtbGljZW5zZS5vcmcgKi9cbjsoZnVuY3Rpb24gKCkge1xuICAvLyBEZXRlY3QgdGhlIGBkZWZpbmVgIGZ1bmN0aW9uIGV4cG9zZWQgYnkgYXN5bmNocm9ub3VzIG1vZHVsZSBsb2FkZXJzLiBUaGVcbiAgLy8gc3RyaWN0IGBkZWZpbmVgIGNoZWNrIGlzIG5lY2Vzc2FyeSBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIGByLmpzYC5cbiAgdmFyIGlzTG9hZGVyID0gdHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQ7XG5cbiAgLy8gQSBzZXQgb2YgdHlwZXMgdXNlZCB0byBkaXN0aW5ndWlzaCBvYmplY3RzIGZyb20gcHJpbWl0aXZlcy5cbiAgdmFyIG9iamVjdFR5cGVzID0ge1xuICAgIFwiZnVuY3Rpb25cIjogdHJ1ZSxcbiAgICBcIm9iamVjdFwiOiB0cnVlXG4gIH07XG5cbiAgLy8gRGV0ZWN0IHRoZSBgZXhwb3J0c2Agb2JqZWN0IGV4cG9zZWQgYnkgQ29tbW9uSlMgaW1wbGVtZW50YXRpb25zLlxuICB2YXIgZnJlZUV4cG9ydHMgPSBvYmplY3RUeXBlc1t0eXBlb2YgZXhwb3J0c10gJiYgZXhwb3J0cyAmJiAhZXhwb3J0cy5ub2RlVHlwZSAmJiBleHBvcnRzO1xuXG4gIC8vIFVzZSB0aGUgYGdsb2JhbGAgb2JqZWN0IGV4cG9zZWQgYnkgTm9kZSAoaW5jbHVkaW5nIEJyb3dzZXJpZnkgdmlhXG4gIC8vIGBpbnNlcnQtbW9kdWxlLWdsb2JhbHNgKSwgTmFyd2hhbCwgYW5kIFJpbmdvIGFzIHRoZSBkZWZhdWx0IGNvbnRleHQsXG4gIC8vIGFuZCB0aGUgYHdpbmRvd2Agb2JqZWN0IGluIGJyb3dzZXJzLiBSaGlubyBleHBvcnRzIGEgYGdsb2JhbGAgZnVuY3Rpb25cbiAgLy8gaW5zdGVhZC5cbiAgdmFyIHJvb3QgPSBvYmplY3RUeXBlc1t0eXBlb2Ygd2luZG93XSAmJiB3aW5kb3cgfHwgdGhpcyxcbiAgICAgIGZyZWVHbG9iYWwgPSBmcmVlRXhwb3J0cyAmJiBvYmplY3RUeXBlc1t0eXBlb2YgbW9kdWxlXSAmJiBtb2R1bGUgJiYgIW1vZHVsZS5ub2RlVHlwZSAmJiB0eXBlb2YgZ2xvYmFsID09IFwib2JqZWN0XCIgJiYgZ2xvYmFsO1xuXG4gIGlmIChmcmVlR2xvYmFsICYmIChmcmVlR2xvYmFsLmdsb2JhbCA9PT0gZnJlZUdsb2JhbCB8fCBmcmVlR2xvYmFsLndpbmRvdyA9PT0gZnJlZUdsb2JhbCB8fCBmcmVlR2xvYmFsLnNlbGYgPT09IGZyZWVHbG9iYWwpKSB7XG4gICAgcm9vdCA9IGZyZWVHbG9iYWw7XG4gIH1cblxuICAvLyBQdWJsaWM6IEluaXRpYWxpemVzIEpTT04gMyB1c2luZyB0aGUgZ2l2ZW4gYGNvbnRleHRgIG9iamVjdCwgYXR0YWNoaW5nIHRoZVxuICAvLyBgc3RyaW5naWZ5YCBhbmQgYHBhcnNlYCBmdW5jdGlvbnMgdG8gdGhlIHNwZWNpZmllZCBgZXhwb3J0c2Agb2JqZWN0LlxuICBmdW5jdGlvbiBydW5JbkNvbnRleHQoY29udGV4dCwgZXhwb3J0cykge1xuICAgIGNvbnRleHQgfHwgKGNvbnRleHQgPSByb290Lk9iamVjdCgpKTtcbiAgICBleHBvcnRzIHx8IChleHBvcnRzID0gcm9vdC5PYmplY3QoKSk7XG5cbiAgICAvLyBOYXRpdmUgY29uc3RydWN0b3IgYWxpYXNlcy5cbiAgICB2YXIgTnVtYmVyID0gY29udGV4dC5OdW1iZXIgfHwgcm9vdC5OdW1iZXIsXG4gICAgICAgIFN0cmluZyA9IGNvbnRleHQuU3RyaW5nIHx8IHJvb3QuU3RyaW5nLFxuICAgICAgICBPYmplY3QgPSBjb250ZXh0Lk9iamVjdCB8fCByb290Lk9iamVjdCxcbiAgICAgICAgRGF0ZSA9IGNvbnRleHQuRGF0ZSB8fCByb290LkRhdGUsXG4gICAgICAgIFN5bnRheEVycm9yID0gY29udGV4dC5TeW50YXhFcnJvciB8fCByb290LlN5bnRheEVycm9yLFxuICAgICAgICBUeXBlRXJyb3IgPSBjb250ZXh0LlR5cGVFcnJvciB8fCByb290LlR5cGVFcnJvcixcbiAgICAgICAgTWF0aCA9IGNvbnRleHQuTWF0aCB8fCByb290Lk1hdGgsXG4gICAgICAgIG5hdGl2ZUpTT04gPSBjb250ZXh0LkpTT04gfHwgcm9vdC5KU09OO1xuXG4gICAgLy8gRGVsZWdhdGUgdG8gdGhlIG5hdGl2ZSBgc3RyaW5naWZ5YCBhbmQgYHBhcnNlYCBpbXBsZW1lbnRhdGlvbnMuXG4gICAgaWYgKHR5cGVvZiBuYXRpdmVKU09OID09IFwib2JqZWN0XCIgJiYgbmF0aXZlSlNPTikge1xuICAgICAgZXhwb3J0cy5zdHJpbmdpZnkgPSBuYXRpdmVKU09OLnN0cmluZ2lmeTtcbiAgICAgIGV4cG9ydHMucGFyc2UgPSBuYXRpdmVKU09OLnBhcnNlO1xuICAgIH1cblxuICAgIC8vIENvbnZlbmllbmNlIGFsaWFzZXMuXG4gICAgdmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZSxcbiAgICAgICAgZ2V0Q2xhc3MgPSBvYmplY3RQcm90by50b1N0cmluZyxcbiAgICAgICAgaXNQcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5LFxuICAgICAgICB1bmRlZmluZWQ7XG5cbiAgICAvLyBJbnRlcm5hbDogQ29udGFpbnMgYHRyeS4uLmNhdGNoYCBsb2dpYyB1c2VkIGJ5IG90aGVyIGZ1bmN0aW9ucy5cbiAgICAvLyBUaGlzIHByZXZlbnRzIG90aGVyIGZ1bmN0aW9ucyBmcm9tIGJlaW5nIGRlb3B0aW1pemVkLlxuICAgIGZ1bmN0aW9uIGF0dGVtcHQoZnVuYywgZXJyb3JGdW5jKSB7XG4gICAgICB0cnkge1xuICAgICAgICBmdW5jKCk7XG4gICAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICAgICAgaWYgKGVycm9yRnVuYykge1xuICAgICAgICAgIGVycm9yRnVuYygpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVGVzdCB0aGUgYERhdGUjZ2V0VVRDKmAgbWV0aG9kcy4gQmFzZWQgb24gd29yayBieSBAWWFmZmxlLlxuICAgIHZhciBpc0V4dGVuZGVkID0gbmV3IERhdGUoLTM1MDk4MjczMzQ1NzMyOTIpO1xuICAgIGF0dGVtcHQoZnVuY3Rpb24gKCkge1xuICAgICAgLy8gVGhlIGBnZXRVVENGdWxsWWVhcmAsIGBNb250aGAsIGFuZCBgRGF0ZWAgbWV0aG9kcyByZXR1cm4gbm9uc2Vuc2ljYWxcbiAgICAgIC8vIHJlc3VsdHMgZm9yIGNlcnRhaW4gZGF0ZXMgaW4gT3BlcmEgPj0gMTAuNTMuXG4gICAgICBpc0V4dGVuZGVkID0gaXNFeHRlbmRlZC5nZXRVVENGdWxsWWVhcigpID09IC0xMDkyNTIgJiYgaXNFeHRlbmRlZC5nZXRVVENNb250aCgpID09PSAwICYmIGlzRXh0ZW5kZWQuZ2V0VVRDRGF0ZSgpID09PSAxICYmXG4gICAgICAgIGlzRXh0ZW5kZWQuZ2V0VVRDSG91cnMoKSA9PSAxMCAmJiBpc0V4dGVuZGVkLmdldFVUQ01pbnV0ZXMoKSA9PSAzNyAmJiBpc0V4dGVuZGVkLmdldFVUQ1NlY29uZHMoKSA9PSA2ICYmIGlzRXh0ZW5kZWQuZ2V0VVRDTWlsbGlzZWNvbmRzKCkgPT0gNzA4O1xuICAgIH0pO1xuXG4gICAgLy8gSW50ZXJuYWw6IERldGVybWluZXMgd2hldGhlciB0aGUgbmF0aXZlIGBKU09OLnN0cmluZ2lmeWAgYW5kIGBwYXJzZWBcbiAgICAvLyBpbXBsZW1lbnRhdGlvbnMgYXJlIHNwZWMtY29tcGxpYW50LiBCYXNlZCBvbiB3b3JrIGJ5IEtlbiBTbnlkZXIuXG4gICAgZnVuY3Rpb24gaGFzKG5hbWUpIHtcbiAgICAgIGlmIChoYXNbbmFtZV0gIT0gbnVsbCkge1xuICAgICAgICAvLyBSZXR1cm4gY2FjaGVkIGZlYXR1cmUgdGVzdCByZXN1bHQuXG4gICAgICAgIHJldHVybiBoYXNbbmFtZV07XG4gICAgICB9XG4gICAgICB2YXIgaXNTdXBwb3J0ZWQ7XG4gICAgICBpZiAobmFtZSA9PSBcImJ1Zy1zdHJpbmctY2hhci1pbmRleFwiKSB7XG4gICAgICAgIC8vIElFIDw9IDcgZG9lc24ndCBzdXBwb3J0IGFjY2Vzc2luZyBzdHJpbmcgY2hhcmFjdGVycyB1c2luZyBzcXVhcmVcbiAgICAgICAgLy8gYnJhY2tldCBub3RhdGlvbi4gSUUgOCBvbmx5IHN1cHBvcnRzIHRoaXMgZm9yIHByaW1pdGl2ZXMuXG4gICAgICAgIGlzU3VwcG9ydGVkID0gXCJhXCJbMF0gIT0gXCJhXCI7XG4gICAgICB9IGVsc2UgaWYgKG5hbWUgPT0gXCJqc29uXCIpIHtcbiAgICAgICAgLy8gSW5kaWNhdGVzIHdoZXRoZXIgYm90aCBgSlNPTi5zdHJpbmdpZnlgIGFuZCBgSlNPTi5wYXJzZWAgYXJlXG4gICAgICAgIC8vIHN1cHBvcnRlZC5cbiAgICAgICAgaXNTdXBwb3J0ZWQgPSBoYXMoXCJqc29uLXN0cmluZ2lmeVwiKSAmJiBoYXMoXCJkYXRlLXNlcmlhbGl6YXRpb25cIikgJiYgaGFzKFwianNvbi1wYXJzZVwiKTtcbiAgICAgIH0gZWxzZSBpZiAobmFtZSA9PSBcImRhdGUtc2VyaWFsaXphdGlvblwiKSB7XG4gICAgICAgIC8vIEluZGljYXRlcyB3aGV0aGVyIGBEYXRlYHMgY2FuIGJlIHNlcmlhbGl6ZWQgYWNjdXJhdGVseSBieSBgSlNPTi5zdHJpbmdpZnlgLlxuICAgICAgICBpc1N1cHBvcnRlZCA9IGhhcyhcImpzb24tc3RyaW5naWZ5XCIpICYmIGlzRXh0ZW5kZWQ7XG4gICAgICAgIGlmIChpc1N1cHBvcnRlZCkge1xuICAgICAgICAgIHZhciBzdHJpbmdpZnkgPSBleHBvcnRzLnN0cmluZ2lmeTtcbiAgICAgICAgICBhdHRlbXB0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlzU3VwcG9ydGVkID1cbiAgICAgICAgICAgICAgLy8gSlNPTiAyLCBQcm90b3R5cGUgPD0gMS43LCBhbmQgb2xkZXIgV2ViS2l0IGJ1aWxkcyBpbmNvcnJlY3RseVxuICAgICAgICAgICAgICAvLyBzZXJpYWxpemUgZXh0ZW5kZWQgeWVhcnMuXG4gICAgICAgICAgICAgIHN0cmluZ2lmeShuZXcgRGF0ZSgtOC42NGUxNSkpID09ICdcIi0yNzE4MjEtMDQtMjBUMDA6MDA6MDAuMDAwWlwiJyAmJlxuICAgICAgICAgICAgICAvLyBUaGUgbWlsbGlzZWNvbmRzIGFyZSBvcHRpb25hbCBpbiBFUyA1LCBidXQgcmVxdWlyZWQgaW4gNS4xLlxuICAgICAgICAgICAgICBzdHJpbmdpZnkobmV3IERhdGUoOC42NGUxNSkpID09ICdcIisyNzU3NjAtMDktMTNUMDA6MDA6MDAuMDAwWlwiJyAmJlxuICAgICAgICAgICAgICAvLyBGaXJlZm94IDw9IDExLjAgaW5jb3JyZWN0bHkgc2VyaWFsaXplcyB5ZWFycyBwcmlvciB0byAwIGFzIG5lZ2F0aXZlXG4gICAgICAgICAgICAgIC8vIGZvdXItZGlnaXQgeWVhcnMgaW5zdGVhZCBvZiBzaXgtZGlnaXQgeWVhcnMuIENyZWRpdHM6IEBZYWZmbGUuXG4gICAgICAgICAgICAgIHN0cmluZ2lmeShuZXcgRGF0ZSgtNjIxOTg3NTUyZTUpKSA9PSAnXCItMDAwMDAxLTAxLTAxVDAwOjAwOjAwLjAwMFpcIicgJiZcbiAgICAgICAgICAgICAgLy8gU2FmYXJpIDw9IDUuMS41IGFuZCBPcGVyYSA+PSAxMC41MyBpbmNvcnJlY3RseSBzZXJpYWxpemUgbWlsbGlzZWNvbmRcbiAgICAgICAgICAgICAgLy8gdmFsdWVzIGxlc3MgdGhhbiAxMDAwLiBDcmVkaXRzOiBAWWFmZmxlLlxuICAgICAgICAgICAgICBzdHJpbmdpZnkobmV3IERhdGUoLTEpKSA9PSAnXCIxOTY5LTEyLTMxVDIzOjU5OjU5Ljk5OVpcIic7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciB2YWx1ZSwgc2VyaWFsaXplZCA9ICd7XCJhXCI6WzEsdHJ1ZSxmYWxzZSxudWxsLFwiXFxcXHUwMDAwXFxcXGJcXFxcblxcXFxmXFxcXHJcXFxcdFwiXX0nO1xuICAgICAgICAvLyBUZXN0IGBKU09OLnN0cmluZ2lmeWAuXG4gICAgICAgIGlmIChuYW1lID09IFwianNvbi1zdHJpbmdpZnlcIikge1xuICAgICAgICAgIHZhciBzdHJpbmdpZnkgPSBleHBvcnRzLnN0cmluZ2lmeSwgc3RyaW5naWZ5U3VwcG9ydGVkID0gdHlwZW9mIHN0cmluZ2lmeSA9PSBcImZ1bmN0aW9uXCI7XG4gICAgICAgICAgaWYgKHN0cmluZ2lmeVN1cHBvcnRlZCkge1xuICAgICAgICAgICAgLy8gQSB0ZXN0IGZ1bmN0aW9uIG9iamVjdCB3aXRoIGEgY3VzdG9tIGB0b0pTT05gIG1ldGhvZC5cbiAgICAgICAgICAgICh2YWx1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9KS50b0pTT04gPSB2YWx1ZTtcbiAgICAgICAgICAgIGF0dGVtcHQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICBzdHJpbmdpZnlTdXBwb3J0ZWQgPVxuICAgICAgICAgICAgICAgIC8vIEZpcmVmb3ggMy4xYjEgYW5kIGIyIHNlcmlhbGl6ZSBzdHJpbmcsIG51bWJlciwgYW5kIGJvb2xlYW5cbiAgICAgICAgICAgICAgICAvLyBwcmltaXRpdmVzIGFzIG9iamVjdCBsaXRlcmFscy5cbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkoMCkgPT09IFwiMFwiICYmXG4gICAgICAgICAgICAgICAgLy8gRkYgMy4xYjEsIGIyLCBhbmQgSlNPTiAyIHNlcmlhbGl6ZSB3cmFwcGVkIHByaW1pdGl2ZXMgYXMgb2JqZWN0XG4gICAgICAgICAgICAgICAgLy8gbGl0ZXJhbHMuXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KG5ldyBOdW1iZXIoKSkgPT09IFwiMFwiICYmXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KG5ldyBTdHJpbmcoKSkgPT0gJ1wiXCInICYmXG4gICAgICAgICAgICAgICAgLy8gRkYgMy4xYjEsIDIgdGhyb3cgYW4gZXJyb3IgaWYgdGhlIHZhbHVlIGlzIGBudWxsYCwgYHVuZGVmaW5lZGAsIG9yXG4gICAgICAgICAgICAgICAgLy8gZG9lcyBub3QgZGVmaW5lIGEgY2Fub25pY2FsIEpTT04gcmVwcmVzZW50YXRpb24gKHRoaXMgYXBwbGllcyB0b1xuICAgICAgICAgICAgICAgIC8vIG9iamVjdHMgd2l0aCBgdG9KU09OYCBwcm9wZXJ0aWVzIGFzIHdlbGwsICp1bmxlc3MqIHRoZXkgYXJlIG5lc3RlZFxuICAgICAgICAgICAgICAgIC8vIHdpdGhpbiBhbiBvYmplY3Qgb3IgYXJyYXkpLlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeShnZXRDbGFzcykgPT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgIC8vIElFIDggc2VyaWFsaXplcyBgdW5kZWZpbmVkYCBhcyBgXCJ1bmRlZmluZWRcImAuIFNhZmFyaSA8PSA1LjEuNyBhbmRcbiAgICAgICAgICAgICAgICAvLyBGRiAzLjFiMyBwYXNzIHRoaXMgdGVzdC5cbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkodW5kZWZpbmVkKSA9PT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgLy8gU2FmYXJpIDw9IDUuMS43IGFuZCBGRiAzLjFiMyB0aHJvdyBgRXJyb3JgcyBhbmQgYFR5cGVFcnJvcmBzLFxuICAgICAgICAgICAgICAgIC8vIHJlc3BlY3RpdmVseSwgaWYgdGhlIHZhbHVlIGlzIG9taXR0ZWQgZW50aXJlbHkuXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KCkgPT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgIC8vIEZGIDMuMWIxLCAyIHRocm93IGFuIGVycm9yIGlmIHRoZSBnaXZlbiB2YWx1ZSBpcyBub3QgYSBudW1iZXIsXG4gICAgICAgICAgICAgICAgLy8gc3RyaW5nLCBhcnJheSwgb2JqZWN0LCBCb29sZWFuLCBvciBgbnVsbGAgbGl0ZXJhbC4gVGhpcyBhcHBsaWVzIHRvXG4gICAgICAgICAgICAgICAgLy8gb2JqZWN0cyB3aXRoIGN1c3RvbSBgdG9KU09OYCBtZXRob2RzIGFzIHdlbGwsIHVubGVzcyB0aGV5IGFyZSBuZXN0ZWRcbiAgICAgICAgICAgICAgICAvLyBpbnNpZGUgb2JqZWN0IG9yIGFycmF5IGxpdGVyYWxzLiBZVUkgMy4wLjBiMSBpZ25vcmVzIGN1c3RvbSBgdG9KU09OYFxuICAgICAgICAgICAgICAgIC8vIG1ldGhvZHMgZW50aXJlbHkuXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KHZhbHVlKSA9PT0gXCIxXCIgJiZcbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkoW3ZhbHVlXSkgPT0gXCJbMV1cIiAmJlxuICAgICAgICAgICAgICAgIC8vIFByb3RvdHlwZSA8PSAxLjYuMSBzZXJpYWxpemVzIGBbdW5kZWZpbmVkXWAgYXMgYFwiW11cImAgaW5zdGVhZCBvZlxuICAgICAgICAgICAgICAgIC8vIGBcIltudWxsXVwiYC5cbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkoW3VuZGVmaW5lZF0pID09IFwiW251bGxdXCIgJiZcbiAgICAgICAgICAgICAgICAvLyBZVUkgMy4wLjBiMSBmYWlscyB0byBzZXJpYWxpemUgYG51bGxgIGxpdGVyYWxzLlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeShudWxsKSA9PSBcIm51bGxcIiAmJlxuICAgICAgICAgICAgICAgIC8vIEZGIDMuMWIxLCAyIGhhbHRzIHNlcmlhbGl6YXRpb24gaWYgYW4gYXJyYXkgY29udGFpbnMgYSBmdW5jdGlvbjpcbiAgICAgICAgICAgICAgICAvLyBgWzEsIHRydWUsIGdldENsYXNzLCAxXWAgc2VyaWFsaXplcyBhcyBcIlsxLHRydWUsXSxcIi4gRkYgMy4xYjNcbiAgICAgICAgICAgICAgICAvLyBlbGlkZXMgbm9uLUpTT04gdmFsdWVzIGZyb20gb2JqZWN0cyBhbmQgYXJyYXlzLCB1bmxlc3MgdGhleVxuICAgICAgICAgICAgICAgIC8vIGRlZmluZSBjdXN0b20gYHRvSlNPTmAgbWV0aG9kcy5cbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkoW3VuZGVmaW5lZCwgZ2V0Q2xhc3MsIG51bGxdKSA9PSBcIltudWxsLG51bGwsbnVsbF1cIiAmJlxuICAgICAgICAgICAgICAgIC8vIFNpbXBsZSBzZXJpYWxpemF0aW9uIHRlc3QuIEZGIDMuMWIxIHVzZXMgVW5pY29kZSBlc2NhcGUgc2VxdWVuY2VzXG4gICAgICAgICAgICAgICAgLy8gd2hlcmUgY2hhcmFjdGVyIGVzY2FwZSBjb2RlcyBhcmUgZXhwZWN0ZWQgKGUuZy4sIGBcXGJgID0+IGBcXHUwMDA4YCkuXG4gICAgICAgICAgICAgICAgc3RyaW5naWZ5KHsgXCJhXCI6IFt2YWx1ZSwgdHJ1ZSwgZmFsc2UsIG51bGwsIFwiXFx4MDBcXGJcXG5cXGZcXHJcXHRcIl0gfSkgPT0gc2VyaWFsaXplZCAmJlxuICAgICAgICAgICAgICAgIC8vIEZGIDMuMWIxIGFuZCBiMiBpZ25vcmUgdGhlIGBmaWx0ZXJgIGFuZCBgd2lkdGhgIGFyZ3VtZW50cy5cbiAgICAgICAgICAgICAgICBzdHJpbmdpZnkobnVsbCwgdmFsdWUpID09PSBcIjFcIiAmJlxuICAgICAgICAgICAgICAgIHN0cmluZ2lmeShbMSwgMl0sIG51bGwsIDEpID09IFwiW1xcbiAxLFxcbiAyXFxuXVwiO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICBzdHJpbmdpZnlTdXBwb3J0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpc1N1cHBvcnRlZCA9IHN0cmluZ2lmeVN1cHBvcnRlZDtcbiAgICAgICAgfVxuICAgICAgICAvLyBUZXN0IGBKU09OLnBhcnNlYC5cbiAgICAgICAgaWYgKG5hbWUgPT0gXCJqc29uLXBhcnNlXCIpIHtcbiAgICAgICAgICB2YXIgcGFyc2UgPSBleHBvcnRzLnBhcnNlLCBwYXJzZVN1cHBvcnRlZDtcbiAgICAgICAgICBpZiAodHlwZW9mIHBhcnNlID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgYXR0ZW1wdChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIC8vIEZGIDMuMWIxLCBiMiB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBhIGJhcmUgbGl0ZXJhbCBpcyBwcm92aWRlZC5cbiAgICAgICAgICAgICAgLy8gQ29uZm9ybWluZyBpbXBsZW1lbnRhdGlvbnMgc2hvdWxkIGFsc28gY29lcmNlIHRoZSBpbml0aWFsIGFyZ3VtZW50IHRvXG4gICAgICAgICAgICAgIC8vIGEgc3RyaW5nIHByaW9yIHRvIHBhcnNpbmcuXG4gICAgICAgICAgICAgIGlmIChwYXJzZShcIjBcIikgPT09IDAgJiYgIXBhcnNlKGZhbHNlKSkge1xuICAgICAgICAgICAgICAgIC8vIFNpbXBsZSBwYXJzaW5nIHRlc3QuXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBwYXJzZShzZXJpYWxpemVkKTtcbiAgICAgICAgICAgICAgICBwYXJzZVN1cHBvcnRlZCA9IHZhbHVlW1wiYVwiXS5sZW5ndGggPT0gNSAmJiB2YWx1ZVtcImFcIl1bMF0gPT09IDE7XG4gICAgICAgICAgICAgICAgaWYgKHBhcnNlU3VwcG9ydGVkKSB7XG4gICAgICAgICAgICAgICAgICBhdHRlbXB0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU2FmYXJpIDw9IDUuMS4yIGFuZCBGRiAzLjFiMSBhbGxvdyB1bmVzY2FwZWQgdGFicyBpbiBzdHJpbmdzLlxuICAgICAgICAgICAgICAgICAgICBwYXJzZVN1cHBvcnRlZCA9ICFwYXJzZSgnXCJcXHRcIicpO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICBpZiAocGFyc2VTdXBwb3J0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0ZW1wdChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gRkYgNC4wIGFuZCA0LjAuMSBhbGxvdyBsZWFkaW5nIGArYCBzaWducyBhbmQgbGVhZGluZ1xuICAgICAgICAgICAgICAgICAgICAgIC8vIGRlY2ltYWwgcG9pbnRzLiBGRiA0LjAsIDQuMC4xLCBhbmQgSUUgOS0xMCBhbHNvIGFsbG93XG4gICAgICAgICAgICAgICAgICAgICAgLy8gY2VydGFpbiBvY3RhbCBsaXRlcmFscy5cbiAgICAgICAgICAgICAgICAgICAgICBwYXJzZVN1cHBvcnRlZCA9IHBhcnNlKFwiMDFcIikgIT09IDE7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgaWYgKHBhcnNlU3VwcG9ydGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGF0dGVtcHQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIEZGIDQuMCwgNC4wLjEsIGFuZCBSaGlubyAxLjdSMy1SNCBhbGxvdyB0cmFpbGluZyBkZWNpbWFsXG4gICAgICAgICAgICAgICAgICAgICAgLy8gcG9pbnRzLiBUaGVzZSBlbnZpcm9ubWVudHMsIGFsb25nIHdpdGggRkYgMy4xYjEgYW5kIDIsXG4gICAgICAgICAgICAgICAgICAgICAgLy8gYWxzbyBhbGxvdyB0cmFpbGluZyBjb21tYXMgaW4gSlNPTiBvYmplY3RzIGFuZCBhcnJheXMuXG4gICAgICAgICAgICAgICAgICAgICAgcGFyc2VTdXBwb3J0ZWQgPSBwYXJzZShcIjEuXCIpICE9PSAxO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgcGFyc2VTdXBwb3J0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpc1N1cHBvcnRlZCA9IHBhcnNlU3VwcG9ydGVkO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gaGFzW25hbWVdID0gISFpc1N1cHBvcnRlZDtcbiAgICB9XG4gICAgaGFzW1wiYnVnLXN0cmluZy1jaGFyLWluZGV4XCJdID0gaGFzW1wiZGF0ZS1zZXJpYWxpemF0aW9uXCJdID0gaGFzW1wianNvblwiXSA9IGhhc1tcImpzb24tc3RyaW5naWZ5XCJdID0gaGFzW1wianNvbi1wYXJzZVwiXSA9IG51bGw7XG5cbiAgICBpZiAoIWhhcyhcImpzb25cIikpIHtcbiAgICAgIC8vIENvbW1vbiBgW1tDbGFzc11dYCBuYW1lIGFsaWFzZXMuXG4gICAgICB2YXIgZnVuY3Rpb25DbGFzcyA9IFwiW29iamVjdCBGdW5jdGlvbl1cIixcbiAgICAgICAgICBkYXRlQ2xhc3MgPSBcIltvYmplY3QgRGF0ZV1cIixcbiAgICAgICAgICBudW1iZXJDbGFzcyA9IFwiW29iamVjdCBOdW1iZXJdXCIsXG4gICAgICAgICAgc3RyaW5nQ2xhc3MgPSBcIltvYmplY3QgU3RyaW5nXVwiLFxuICAgICAgICAgIGFycmF5Q2xhc3MgPSBcIltvYmplY3QgQXJyYXldXCIsXG4gICAgICAgICAgYm9vbGVhbkNsYXNzID0gXCJbb2JqZWN0IEJvb2xlYW5dXCI7XG5cbiAgICAgIC8vIERldGVjdCBpbmNvbXBsZXRlIHN1cHBvcnQgZm9yIGFjY2Vzc2luZyBzdHJpbmcgY2hhcmFjdGVycyBieSBpbmRleC5cbiAgICAgIHZhciBjaGFySW5kZXhCdWdneSA9IGhhcyhcImJ1Zy1zdHJpbmctY2hhci1pbmRleFwiKTtcblxuICAgICAgLy8gSW50ZXJuYWw6IE5vcm1hbGl6ZXMgdGhlIGBmb3IuLi5pbmAgaXRlcmF0aW9uIGFsZ29yaXRobSBhY3Jvc3NcbiAgICAgIC8vIGVudmlyb25tZW50cy4gRWFjaCBlbnVtZXJhdGVkIGtleSBpcyB5aWVsZGVkIHRvIGEgYGNhbGxiYWNrYCBmdW5jdGlvbi5cbiAgICAgIHZhciBmb3JPd24gPSBmdW5jdGlvbiAob2JqZWN0LCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2l6ZSA9IDAsIFByb3BlcnRpZXMsIGRvbnRFbnVtcywgcHJvcGVydHk7XG5cbiAgICAgICAgLy8gVGVzdHMgZm9yIGJ1Z3MgaW4gdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQncyBgZm9yLi4uaW5gIGFsZ29yaXRobS4gVGhlXG4gICAgICAgIC8vIGB2YWx1ZU9mYCBwcm9wZXJ0eSBpbmhlcml0cyB0aGUgbm9uLWVudW1lcmFibGUgZmxhZyBmcm9tXG4gICAgICAgIC8vIGBPYmplY3QucHJvdG90eXBlYCBpbiBvbGRlciB2ZXJzaW9ucyBvZiBJRSwgTmV0c2NhcGUsIGFuZCBNb3ppbGxhLlxuICAgICAgICAoUHJvcGVydGllcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0aGlzLnZhbHVlT2YgPSAwO1xuICAgICAgICB9KS5wcm90b3R5cGUudmFsdWVPZiA9IDA7XG5cbiAgICAgICAgLy8gSXRlcmF0ZSBvdmVyIGEgbmV3IGluc3RhbmNlIG9mIHRoZSBgUHJvcGVydGllc2AgY2xhc3MuXG4gICAgICAgIGRvbnRFbnVtcyA9IG5ldyBQcm9wZXJ0aWVzKCk7XG4gICAgICAgIGZvciAocHJvcGVydHkgaW4gZG9udEVudW1zKSB7XG4gICAgICAgICAgLy8gSWdub3JlIGFsbCBwcm9wZXJ0aWVzIGluaGVyaXRlZCBmcm9tIGBPYmplY3QucHJvdG90eXBlYC5cbiAgICAgICAgICBpZiAoaXNQcm9wZXJ0eS5jYWxsKGRvbnRFbnVtcywgcHJvcGVydHkpKSB7XG4gICAgICAgICAgICBzaXplKys7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFByb3BlcnRpZXMgPSBkb250RW51bXMgPSBudWxsO1xuXG4gICAgICAgIC8vIE5vcm1hbGl6ZSB0aGUgaXRlcmF0aW9uIGFsZ29yaXRobS5cbiAgICAgICAgaWYgKCFzaXplKSB7XG4gICAgICAgICAgLy8gQSBsaXN0IG9mIG5vbi1lbnVtZXJhYmxlIHByb3BlcnRpZXMgaW5oZXJpdGVkIGZyb20gYE9iamVjdC5wcm90b3R5cGVgLlxuICAgICAgICAgIGRvbnRFbnVtcyA9IFtcInZhbHVlT2ZcIiwgXCJ0b1N0cmluZ1wiLCBcInRvTG9jYWxlU3RyaW5nXCIsIFwicHJvcGVydHlJc0VudW1lcmFibGVcIiwgXCJpc1Byb3RvdHlwZU9mXCIsIFwiaGFzT3duUHJvcGVydHlcIiwgXCJjb25zdHJ1Y3RvclwiXTtcbiAgICAgICAgICAvLyBJRSA8PSA4LCBNb3ppbGxhIDEuMCwgYW5kIE5ldHNjYXBlIDYuMiBpZ25vcmUgc2hhZG93ZWQgbm9uLWVudW1lcmFibGVcbiAgICAgICAgICAvLyBwcm9wZXJ0aWVzLlxuICAgICAgICAgIGZvck93biA9IGZ1bmN0aW9uIChvYmplY3QsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB2YXIgaXNGdW5jdGlvbiA9IGdldENsYXNzLmNhbGwob2JqZWN0KSA9PSBmdW5jdGlvbkNsYXNzLCBwcm9wZXJ0eSwgbGVuZ3RoO1xuICAgICAgICAgICAgdmFyIGhhc1Byb3BlcnR5ID0gIWlzRnVuY3Rpb24gJiYgdHlwZW9mIG9iamVjdC5jb25zdHJ1Y3RvciAhPSBcImZ1bmN0aW9uXCIgJiYgb2JqZWN0VHlwZXNbdHlwZW9mIG9iamVjdC5oYXNPd25Qcm9wZXJ0eV0gJiYgb2JqZWN0Lmhhc093blByb3BlcnR5IHx8IGlzUHJvcGVydHk7XG4gICAgICAgICAgICBmb3IgKHByb3BlcnR5IGluIG9iamVjdCkge1xuICAgICAgICAgICAgICAvLyBHZWNrbyA8PSAxLjAgZW51bWVyYXRlcyB0aGUgYHByb3RvdHlwZWAgcHJvcGVydHkgb2YgZnVuY3Rpb25zIHVuZGVyXG4gICAgICAgICAgICAgIC8vIGNlcnRhaW4gY29uZGl0aW9uczsgSUUgZG9lcyBub3QuXG4gICAgICAgICAgICAgIGlmICghKGlzRnVuY3Rpb24gJiYgcHJvcGVydHkgPT0gXCJwcm90b3R5cGVcIikgJiYgaGFzUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KSkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKHByb3BlcnR5KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gTWFudWFsbHkgaW52b2tlIHRoZSBjYWxsYmFjayBmb3IgZWFjaCBub24tZW51bWVyYWJsZSBwcm9wZXJ0eS5cbiAgICAgICAgICAgIGZvciAobGVuZ3RoID0gZG9udEVudW1zLmxlbmd0aDsgcHJvcGVydHkgPSBkb250RW51bXNbLS1sZW5ndGhdOykge1xuICAgICAgICAgICAgICBpZiAoaGFzUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KSkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKHByb3BlcnR5KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gTm8gYnVncyBkZXRlY3RlZDsgdXNlIHRoZSBzdGFuZGFyZCBgZm9yLi4uaW5gIGFsZ29yaXRobS5cbiAgICAgICAgICBmb3JPd24gPSBmdW5jdGlvbiAob2JqZWN0LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIGlzRnVuY3Rpb24gPSBnZXRDbGFzcy5jYWxsKG9iamVjdCkgPT0gZnVuY3Rpb25DbGFzcywgcHJvcGVydHksIGlzQ29uc3RydWN0b3I7XG4gICAgICAgICAgICBmb3IgKHByb3BlcnR5IGluIG9iamVjdCkge1xuICAgICAgICAgICAgICBpZiAoIShpc0Z1bmN0aW9uICYmIHByb3BlcnR5ID09IFwicHJvdG90eXBlXCIpICYmIGlzUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KSAmJiAhKGlzQ29uc3RydWN0b3IgPSBwcm9wZXJ0eSA9PT0gXCJjb25zdHJ1Y3RvclwiKSkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKHByb3BlcnR5KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gTWFudWFsbHkgaW52b2tlIHRoZSBjYWxsYmFjayBmb3IgdGhlIGBjb25zdHJ1Y3RvcmAgcHJvcGVydHkgZHVlIHRvXG4gICAgICAgICAgICAvLyBjcm9zcy1lbnZpcm9ubWVudCBpbmNvbnNpc3RlbmNpZXMuXG4gICAgICAgICAgICBpZiAoaXNDb25zdHJ1Y3RvciB8fCBpc1Byb3BlcnR5LmNhbGwob2JqZWN0LCAocHJvcGVydHkgPSBcImNvbnN0cnVjdG9yXCIpKSkge1xuICAgICAgICAgICAgICBjYWxsYmFjayhwcm9wZXJ0eSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZm9yT3duKG9iamVjdCwgY2FsbGJhY2spO1xuICAgICAgfTtcblxuICAgICAgLy8gUHVibGljOiBTZXJpYWxpemVzIGEgSmF2YVNjcmlwdCBgdmFsdWVgIGFzIGEgSlNPTiBzdHJpbmcuIFRoZSBvcHRpb25hbFxuICAgICAgLy8gYGZpbHRlcmAgYXJndW1lbnQgbWF5IHNwZWNpZnkgZWl0aGVyIGEgZnVuY3Rpb24gdGhhdCBhbHRlcnMgaG93IG9iamVjdCBhbmRcbiAgICAgIC8vIGFycmF5IG1lbWJlcnMgYXJlIHNlcmlhbGl6ZWQsIG9yIGFuIGFycmF5IG9mIHN0cmluZ3MgYW5kIG51bWJlcnMgdGhhdFxuICAgICAgLy8gaW5kaWNhdGVzIHdoaWNoIHByb3BlcnRpZXMgc2hvdWxkIGJlIHNlcmlhbGl6ZWQuIFRoZSBvcHRpb25hbCBgd2lkdGhgXG4gICAgICAvLyBhcmd1bWVudCBtYXkgYmUgZWl0aGVyIGEgc3RyaW5nIG9yIG51bWJlciB0aGF0IHNwZWNpZmllcyB0aGUgaW5kZW50YXRpb25cbiAgICAgIC8vIGxldmVsIG9mIHRoZSBvdXRwdXQuXG4gICAgICBpZiAoIWhhcyhcImpzb24tc3RyaW5naWZ5XCIpICYmICFoYXMoXCJkYXRlLXNlcmlhbGl6YXRpb25cIikpIHtcbiAgICAgICAgLy8gSW50ZXJuYWw6IEEgbWFwIG9mIGNvbnRyb2wgY2hhcmFjdGVycyBhbmQgdGhlaXIgZXNjYXBlZCBlcXVpdmFsZW50cy5cbiAgICAgICAgdmFyIEVzY2FwZXMgPSB7XG4gICAgICAgICAgOTI6IFwiXFxcXFxcXFxcIixcbiAgICAgICAgICAzNDogJ1xcXFxcIicsXG4gICAgICAgICAgODogXCJcXFxcYlwiLFxuICAgICAgICAgIDEyOiBcIlxcXFxmXCIsXG4gICAgICAgICAgMTA6IFwiXFxcXG5cIixcbiAgICAgICAgICAxMzogXCJcXFxcclwiLFxuICAgICAgICAgIDk6IFwiXFxcXHRcIlxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEludGVybmFsOiBDb252ZXJ0cyBgdmFsdWVgIGludG8gYSB6ZXJvLXBhZGRlZCBzdHJpbmcgc3VjaCB0aGF0IGl0c1xuICAgICAgICAvLyBsZW5ndGggaXMgYXQgbGVhc3QgZXF1YWwgdG8gYHdpZHRoYC4gVGhlIGB3aWR0aGAgbXVzdCBiZSA8PSA2LlxuICAgICAgICB2YXIgbGVhZGluZ1plcm9lcyA9IFwiMDAwMDAwXCI7XG4gICAgICAgIHZhciB0b1BhZGRlZFN0cmluZyA9IGZ1bmN0aW9uICh3aWR0aCwgdmFsdWUpIHtcbiAgICAgICAgICAvLyBUaGUgYHx8IDBgIGV4cHJlc3Npb24gaXMgbmVjZXNzYXJ5IHRvIHdvcmsgYXJvdW5kIGEgYnVnIGluXG4gICAgICAgICAgLy8gT3BlcmEgPD0gNy41NHUyIHdoZXJlIGAwID09IC0wYCwgYnV0IGBTdHJpbmcoLTApICE9PSBcIjBcImAuXG4gICAgICAgICAgcmV0dXJuIChsZWFkaW5nWmVyb2VzICsgKHZhbHVlIHx8IDApKS5zbGljZSgtd2lkdGgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEludGVybmFsOiBTZXJpYWxpemVzIGEgZGF0ZSBvYmplY3QuXG4gICAgICAgIHZhciBzZXJpYWxpemVEYXRlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgdmFyIGdldERhdGEsIHllYXIsIG1vbnRoLCBkYXRlLCB0aW1lLCBob3VycywgbWludXRlcywgc2Vjb25kcywgbWlsbGlzZWNvbmRzO1xuICAgICAgICAgIC8vIERlZmluZSBhZGRpdGlvbmFsIHV0aWxpdHkgbWV0aG9kcyBpZiB0aGUgYERhdGVgIG1ldGhvZHMgYXJlIGJ1Z2d5LlxuICAgICAgICAgIGlmICghaXNFeHRlbmRlZCkge1xuICAgICAgICAgICAgdmFyIGZsb29yID0gTWF0aC5mbG9vcjtcbiAgICAgICAgICAgIC8vIEEgbWFwcGluZyBiZXR3ZWVuIHRoZSBtb250aHMgb2YgdGhlIHllYXIgYW5kIHRoZSBudW1iZXIgb2YgZGF5cyBiZXR3ZWVuXG4gICAgICAgICAgICAvLyBKYW51YXJ5IDFzdCBhbmQgdGhlIGZpcnN0IG9mIHRoZSByZXNwZWN0aXZlIG1vbnRoLlxuICAgICAgICAgICAgdmFyIE1vbnRocyA9IFswLCAzMSwgNTksIDkwLCAxMjAsIDE1MSwgMTgxLCAyMTIsIDI0MywgMjczLCAzMDQsIDMzNF07XG4gICAgICAgICAgICAvLyBJbnRlcm5hbDogQ2FsY3VsYXRlcyB0aGUgbnVtYmVyIG9mIGRheXMgYmV0d2VlbiB0aGUgVW5peCBlcG9jaCBhbmQgdGhlXG4gICAgICAgICAgICAvLyBmaXJzdCBkYXkgb2YgdGhlIGdpdmVuIG1vbnRoLlxuICAgICAgICAgICAgdmFyIGdldERheSA9IGZ1bmN0aW9uICh5ZWFyLCBtb250aCkge1xuICAgICAgICAgICAgICByZXR1cm4gTW9udGhzW21vbnRoXSArIDM2NSAqICh5ZWFyIC0gMTk3MCkgKyBmbG9vcigoeWVhciAtIDE5NjkgKyAobW9udGggPSArKG1vbnRoID4gMSkpKSAvIDQpIC0gZmxvb3IoKHllYXIgLSAxOTAxICsgbW9udGgpIC8gMTAwKSArIGZsb29yKCh5ZWFyIC0gMTYwMSArIG1vbnRoKSAvIDQwMCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZ2V0RGF0YSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAvLyBNYW51YWxseSBjb21wdXRlIHRoZSB5ZWFyLCBtb250aCwgZGF0ZSwgaG91cnMsIG1pbnV0ZXMsXG4gICAgICAgICAgICAgIC8vIHNlY29uZHMsIGFuZCBtaWxsaXNlY29uZHMgaWYgdGhlIGBnZXRVVEMqYCBtZXRob2RzIGFyZVxuICAgICAgICAgICAgICAvLyBidWdneS4gQWRhcHRlZCBmcm9tIEBZYWZmbGUncyBgZGF0ZS1zaGltYCBwcm9qZWN0LlxuICAgICAgICAgICAgICBkYXRlID0gZmxvb3IodmFsdWUgLyA4NjRlNSk7XG4gICAgICAgICAgICAgIGZvciAoeWVhciA9IGZsb29yKGRhdGUgLyAzNjUuMjQyNSkgKyAxOTcwIC0gMTsgZ2V0RGF5KHllYXIgKyAxLCAwKSA8PSBkYXRlOyB5ZWFyKyspO1xuICAgICAgICAgICAgICBmb3IgKG1vbnRoID0gZmxvb3IoKGRhdGUgLSBnZXREYXkoeWVhciwgMCkpIC8gMzAuNDIpOyBnZXREYXkoeWVhciwgbW9udGggKyAxKSA8PSBkYXRlOyBtb250aCsrKTtcbiAgICAgICAgICAgICAgZGF0ZSA9IDEgKyBkYXRlIC0gZ2V0RGF5KHllYXIsIG1vbnRoKTtcbiAgICAgICAgICAgICAgLy8gVGhlIGB0aW1lYCB2YWx1ZSBzcGVjaWZpZXMgdGhlIHRpbWUgd2l0aGluIHRoZSBkYXkgKHNlZSBFU1xuICAgICAgICAgICAgICAvLyA1LjEgc2VjdGlvbiAxNS45LjEuMikuIFRoZSBmb3JtdWxhIGAoQSAlIEIgKyBCKSAlIEJgIGlzIHVzZWRcbiAgICAgICAgICAgICAgLy8gdG8gY29tcHV0ZSBgQSBtb2R1bG8gQmAsIGFzIHRoZSBgJWAgb3BlcmF0b3IgZG9lcyBub3RcbiAgICAgICAgICAgICAgLy8gY29ycmVzcG9uZCB0byB0aGUgYG1vZHVsb2Agb3BlcmF0aW9uIGZvciBuZWdhdGl2ZSBudW1iZXJzLlxuICAgICAgICAgICAgICB0aW1lID0gKHZhbHVlICUgODY0ZTUgKyA4NjRlNSkgJSA4NjRlNTtcbiAgICAgICAgICAgICAgLy8gVGhlIGhvdXJzLCBtaW51dGVzLCBzZWNvbmRzLCBhbmQgbWlsbGlzZWNvbmRzIGFyZSBvYnRhaW5lZCBieVxuICAgICAgICAgICAgICAvLyBkZWNvbXBvc2luZyB0aGUgdGltZSB3aXRoaW4gdGhlIGRheS4gU2VlIHNlY3Rpb24gMTUuOS4xLjEwLlxuICAgICAgICAgICAgICBob3VycyA9IGZsb29yKHRpbWUgLyAzNmU1KSAlIDI0O1xuICAgICAgICAgICAgICBtaW51dGVzID0gZmxvb3IodGltZSAvIDZlNCkgJSA2MDtcbiAgICAgICAgICAgICAgc2Vjb25kcyA9IGZsb29yKHRpbWUgLyAxZTMpICUgNjA7XG4gICAgICAgICAgICAgIG1pbGxpc2Vjb25kcyA9IHRpbWUgJSAxZTM7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBnZXREYXRhID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgIHllYXIgPSB2YWx1ZS5nZXRVVENGdWxsWWVhcigpO1xuICAgICAgICAgICAgICBtb250aCA9IHZhbHVlLmdldFVUQ01vbnRoKCk7XG4gICAgICAgICAgICAgIGRhdGUgPSB2YWx1ZS5nZXRVVENEYXRlKCk7XG4gICAgICAgICAgICAgIGhvdXJzID0gdmFsdWUuZ2V0VVRDSG91cnMoKTtcbiAgICAgICAgICAgICAgbWludXRlcyA9IHZhbHVlLmdldFVUQ01pbnV0ZXMoKTtcbiAgICAgICAgICAgICAgc2Vjb25kcyA9IHZhbHVlLmdldFVUQ1NlY29uZHMoKTtcbiAgICAgICAgICAgICAgbWlsbGlzZWNvbmRzID0gdmFsdWUuZ2V0VVRDTWlsbGlzZWNvbmRzKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgICBzZXJpYWxpemVEYXRlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPiAtMSAvIDAgJiYgdmFsdWUgPCAxIC8gMCkge1xuICAgICAgICAgICAgICAvLyBEYXRlcyBhcmUgc2VyaWFsaXplZCBhY2NvcmRpbmcgdG8gdGhlIGBEYXRlI3RvSlNPTmAgbWV0aG9kXG4gICAgICAgICAgICAgIC8vIHNwZWNpZmllZCBpbiBFUyA1LjEgc2VjdGlvbiAxNS45LjUuNDQuIFNlZSBzZWN0aW9uIDE1LjkuMS4xNVxuICAgICAgICAgICAgICAvLyBmb3IgdGhlIElTTyA4NjAxIGRhdGUgdGltZSBzdHJpbmcgZm9ybWF0LlxuICAgICAgICAgICAgICBnZXREYXRhKHZhbHVlKTtcbiAgICAgICAgICAgICAgLy8gU2VyaWFsaXplIGV4dGVuZGVkIHllYXJzIGNvcnJlY3RseS5cbiAgICAgICAgICAgICAgdmFsdWUgPSAoeWVhciA8PSAwIHx8IHllYXIgPj0gMWU0ID8gKHllYXIgPCAwID8gXCItXCIgOiBcIitcIikgKyB0b1BhZGRlZFN0cmluZyg2LCB5ZWFyIDwgMCA/IC15ZWFyIDogeWVhcikgOiB0b1BhZGRlZFN0cmluZyg0LCB5ZWFyKSkgK1xuICAgICAgICAgICAgICBcIi1cIiArIHRvUGFkZGVkU3RyaW5nKDIsIG1vbnRoICsgMSkgKyBcIi1cIiArIHRvUGFkZGVkU3RyaW5nKDIsIGRhdGUpICtcbiAgICAgICAgICAgICAgLy8gTW9udGhzLCBkYXRlcywgaG91cnMsIG1pbnV0ZXMsIGFuZCBzZWNvbmRzIHNob3VsZCBoYXZlIHR3b1xuICAgICAgICAgICAgICAvLyBkaWdpdHM7IG1pbGxpc2Vjb25kcyBzaG91bGQgaGF2ZSB0aHJlZS5cbiAgICAgICAgICAgICAgXCJUXCIgKyB0b1BhZGRlZFN0cmluZygyLCBob3VycykgKyBcIjpcIiArIHRvUGFkZGVkU3RyaW5nKDIsIG1pbnV0ZXMpICsgXCI6XCIgKyB0b1BhZGRlZFN0cmluZygyLCBzZWNvbmRzKSArXG4gICAgICAgICAgICAgIC8vIE1pbGxpc2Vjb25kcyBhcmUgb3B0aW9uYWwgaW4gRVMgNS4wLCBidXQgcmVxdWlyZWQgaW4gNS4xLlxuICAgICAgICAgICAgICBcIi5cIiArIHRvUGFkZGVkU3RyaW5nKDMsIG1pbGxpc2Vjb25kcykgKyBcIlpcIjtcbiAgICAgICAgICAgICAgeWVhciA9IG1vbnRoID0gZGF0ZSA9IGhvdXJzID0gbWludXRlcyA9IHNlY29uZHMgPSBtaWxsaXNlY29uZHMgPSBudWxsO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgIH07XG4gICAgICAgICAgcmV0dXJuIHNlcmlhbGl6ZURhdGUodmFsdWUpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEZvciBlbnZpcm9ubWVudHMgd2l0aCBgSlNPTi5zdHJpbmdpZnlgIGJ1dCBidWdneSBkYXRlIHNlcmlhbGl6YXRpb24sXG4gICAgICAgIC8vIHdlIG92ZXJyaWRlIHRoZSBuYXRpdmUgYERhdGUjdG9KU09OYCBpbXBsZW1lbnRhdGlvbiB3aXRoIGFcbiAgICAgICAgLy8gc3BlYy1jb21wbGlhbnQgb25lLlxuICAgICAgICBpZiAoaGFzKFwianNvbi1zdHJpbmdpZnlcIikgJiYgIWhhcyhcImRhdGUtc2VyaWFsaXphdGlvblwiKSkge1xuICAgICAgICAgIC8vIEludGVybmFsOiB0aGUgYERhdGUjdG9KU09OYCBpbXBsZW1lbnRhdGlvbiB1c2VkIHRvIG92ZXJyaWRlIHRoZSBuYXRpdmUgb25lLlxuICAgICAgICAgIGZ1bmN0aW9uIGRhdGVUb0pTT04gKGtleSkge1xuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbGl6ZURhdGUodGhpcyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gUHVibGljOiBgSlNPTi5zdHJpbmdpZnlgLiBTZWUgRVMgNS4xIHNlY3Rpb24gMTUuMTIuMy5cbiAgICAgICAgICB2YXIgbmF0aXZlU3RyaW5naWZ5ID0gZXhwb3J0cy5zdHJpbmdpZnk7XG4gICAgICAgICAgZXhwb3J0cy5zdHJpbmdpZnkgPSBmdW5jdGlvbiAoc291cmNlLCBmaWx0ZXIsIHdpZHRoKSB7XG4gICAgICAgICAgICB2YXIgbmF0aXZlVG9KU09OID0gRGF0ZS5wcm90b3R5cGUudG9KU09OO1xuICAgICAgICAgICAgRGF0ZS5wcm90b3R5cGUudG9KU09OID0gZGF0ZVRvSlNPTjtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBuYXRpdmVTdHJpbmdpZnkoc291cmNlLCBmaWx0ZXIsIHdpZHRoKTtcbiAgICAgICAgICAgIERhdGUucHJvdG90eXBlLnRvSlNPTiA9IG5hdGl2ZVRvSlNPTjtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEludGVybmFsOiBEb3VibGUtcXVvdGVzIGEgc3RyaW5nIGB2YWx1ZWAsIHJlcGxhY2luZyBhbGwgQVNDSUkgY29udHJvbFxuICAgICAgICAgIC8vIGNoYXJhY3RlcnMgKGNoYXJhY3RlcnMgd2l0aCBjb2RlIHVuaXQgdmFsdWVzIGJldHdlZW4gMCBhbmQgMzEpIHdpdGhcbiAgICAgICAgICAvLyB0aGVpciBlc2NhcGVkIGVxdWl2YWxlbnRzLiBUaGlzIGlzIGFuIGltcGxlbWVudGF0aW9uIG9mIHRoZVxuICAgICAgICAgIC8vIGBRdW90ZSh2YWx1ZSlgIG9wZXJhdGlvbiBkZWZpbmVkIGluIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjMuXG4gICAgICAgICAgdmFyIHVuaWNvZGVQcmVmaXggPSBcIlxcXFx1MDBcIjtcbiAgICAgICAgICB2YXIgZXNjYXBlQ2hhciA9IGZ1bmN0aW9uIChjaGFyYWN0ZXIpIHtcbiAgICAgICAgICAgIHZhciBjaGFyQ29kZSA9IGNoYXJhY3Rlci5jaGFyQ29kZUF0KDApLCBlc2NhcGVkID0gRXNjYXBlc1tjaGFyQ29kZV07XG4gICAgICAgICAgICBpZiAoZXNjYXBlZCkge1xuICAgICAgICAgICAgICByZXR1cm4gZXNjYXBlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB1bmljb2RlUHJlZml4ICsgdG9QYWRkZWRTdHJpbmcoMiwgY2hhckNvZGUudG9TdHJpbmcoMTYpKTtcbiAgICAgICAgICB9O1xuICAgICAgICAgIHZhciByZUVzY2FwZSA9IC9bXFx4MDAtXFx4MWZcXHgyMlxceDVjXS9nO1xuICAgICAgICAgIHZhciBxdW90ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgcmVFc2NhcGUubGFzdEluZGV4ID0gMDtcbiAgICAgICAgICAgIHJldHVybiAnXCInICtcbiAgICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgIHJlRXNjYXBlLnRlc3QodmFsdWUpXG4gICAgICAgICAgICAgICAgICA/IHZhbHVlLnJlcGxhY2UocmVFc2NhcGUsIGVzY2FwZUNoYXIpXG4gICAgICAgICAgICAgICAgICA6IHZhbHVlXG4gICAgICAgICAgICAgICkgK1xuICAgICAgICAgICAgICAnXCInO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICAvLyBJbnRlcm5hbDogUmVjdXJzaXZlbHkgc2VyaWFsaXplcyBhbiBvYmplY3QuIEltcGxlbWVudHMgdGhlXG4gICAgICAgICAgLy8gYFN0cihrZXksIGhvbGRlcilgLCBgSk8odmFsdWUpYCwgYW5kIGBKQSh2YWx1ZSlgIG9wZXJhdGlvbnMuXG4gICAgICAgICAgdmFyIHNlcmlhbGl6ZSA9IGZ1bmN0aW9uIChwcm9wZXJ0eSwgb2JqZWN0LCBjYWxsYmFjaywgcHJvcGVydGllcywgd2hpdGVzcGFjZSwgaW5kZW50YXRpb24sIHN0YWNrKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWUsIHR5cGUsIGNsYXNzTmFtZSwgcmVzdWx0cywgZWxlbWVudCwgaW5kZXgsIGxlbmd0aCwgcHJlZml4LCByZXN1bHQ7XG4gICAgICAgICAgICBhdHRlbXB0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgLy8gTmVjZXNzYXJ5IGZvciBob3N0IG9iamVjdCBzdXBwb3J0LlxuICAgICAgICAgICAgICB2YWx1ZSA9IG9iamVjdFtwcm9wZXJ0eV07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT0gXCJvYmplY3RcIiAmJiB2YWx1ZSkge1xuICAgICAgICAgICAgICBpZiAodmFsdWUuZ2V0VVRDRnVsbFllYXIgJiYgZ2V0Q2xhc3MuY2FsbCh2YWx1ZSkgPT0gZGF0ZUNsYXNzICYmIHZhbHVlLnRvSlNPTiA9PT0gRGF0ZS5wcm90b3R5cGUudG9KU09OKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBzZXJpYWxpemVEYXRlKHZhbHVlKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUudG9KU09OID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUudG9KU09OKHByb3BlcnR5KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgIC8vIElmIGEgcmVwbGFjZW1lbnQgZnVuY3Rpb24gd2FzIHByb3ZpZGVkLCBjYWxsIGl0IHRvIG9idGFpbiB0aGUgdmFsdWVcbiAgICAgICAgICAgICAgLy8gZm9yIHNlcmlhbGl6YXRpb24uXG4gICAgICAgICAgICAgIHZhbHVlID0gY2FsbGJhY2suY2FsbChvYmplY3QsIHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBFeGl0IGVhcmx5IGlmIHZhbHVlIGlzIGB1bmRlZmluZWRgIG9yIGBudWxsYC5cbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQgPyB2YWx1ZSA6IFwibnVsbFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgICAgICAgICAgIC8vIE9ubHkgY2FsbCBgZ2V0Q2xhc3NgIGlmIHRoZSB2YWx1ZSBpcyBhbiBvYmplY3QuXG4gICAgICAgICAgICBpZiAodHlwZSA9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgIGNsYXNzTmFtZSA9IGdldENsYXNzLmNhbGwodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3dpdGNoIChjbGFzc05hbWUgfHwgdHlwZSkge1xuICAgICAgICAgICAgICBjYXNlIFwiYm9vbGVhblwiOlxuICAgICAgICAgICAgICBjYXNlIGJvb2xlYW5DbGFzczpcbiAgICAgICAgICAgICAgICAvLyBCb29sZWFucyBhcmUgcmVwcmVzZW50ZWQgbGl0ZXJhbGx5LlxuICAgICAgICAgICAgICAgIHJldHVybiBcIlwiICsgdmFsdWU7XG4gICAgICAgICAgICAgIGNhc2UgXCJudW1iZXJcIjpcbiAgICAgICAgICAgICAgY2FzZSBudW1iZXJDbGFzczpcbiAgICAgICAgICAgICAgICAvLyBKU09OIG51bWJlcnMgbXVzdCBiZSBmaW5pdGUuIGBJbmZpbml0eWAgYW5kIGBOYU5gIGFyZSBzZXJpYWxpemVkIGFzXG4gICAgICAgICAgICAgICAgLy8gYFwibnVsbFwiYC5cbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgPiAtMSAvIDAgJiYgdmFsdWUgPCAxIC8gMCA/IFwiXCIgKyB2YWx1ZSA6IFwibnVsbFwiO1xuICAgICAgICAgICAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgICAgICAgICAgIGNhc2Ugc3RyaW5nQ2xhc3M6XG4gICAgICAgICAgICAgICAgLy8gU3RyaW5ncyBhcmUgZG91YmxlLXF1b3RlZCBhbmQgZXNjYXBlZC5cbiAgICAgICAgICAgICAgICByZXR1cm4gcXVvdGUoXCJcIiArIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFJlY3Vyc2l2ZWx5IHNlcmlhbGl6ZSBvYmplY3RzIGFuZCBhcnJheXMuXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGN5Y2xpYyBzdHJ1Y3R1cmVzLiBUaGlzIGlzIGEgbGluZWFyIHNlYXJjaDsgcGVyZm9ybWFuY2VcbiAgICAgICAgICAgICAgLy8gaXMgaW52ZXJzZWx5IHByb3BvcnRpb25hbCB0byB0aGUgbnVtYmVyIG9mIHVuaXF1ZSBuZXN0ZWQgb2JqZWN0cy5cbiAgICAgICAgICAgICAgZm9yIChsZW5ndGggPSBzdGFjay5sZW5ndGg7IGxlbmd0aC0tOykge1xuICAgICAgICAgICAgICAgIGlmIChzdGFja1tsZW5ndGhdID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgLy8gQ3ljbGljIHN0cnVjdHVyZXMgY2Fubm90IGJlIHNlcmlhbGl6ZWQgYnkgYEpTT04uc3RyaW5naWZ5YC5cbiAgICAgICAgICAgICAgICAgIHRocm93IFR5cGVFcnJvcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvLyBBZGQgdGhlIG9iamVjdCB0byB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgICAgICAgICAgIHN0YWNrLnB1c2godmFsdWUpO1xuICAgICAgICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgICAgICAgIC8vIFNhdmUgdGhlIGN1cnJlbnQgaW5kZW50YXRpb24gbGV2ZWwgYW5kIGluZGVudCBvbmUgYWRkaXRpb25hbCBsZXZlbC5cbiAgICAgICAgICAgICAgcHJlZml4ID0gaW5kZW50YXRpb247XG4gICAgICAgICAgICAgIGluZGVudGF0aW9uICs9IHdoaXRlc3BhY2U7XG4gICAgICAgICAgICAgIGlmIChjbGFzc05hbWUgPT0gYXJyYXlDbGFzcykge1xuICAgICAgICAgICAgICAgIC8vIFJlY3Vyc2l2ZWx5IHNlcmlhbGl6ZSBhcnJheSBlbGVtZW50cy5cbiAgICAgICAgICAgICAgICBmb3IgKGluZGV4ID0gMCwgbGVuZ3RoID0gdmFsdWUubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgICAgICAgZWxlbWVudCA9IHNlcmlhbGl6ZShpbmRleCwgdmFsdWUsIGNhbGxiYWNrLCBwcm9wZXJ0aWVzLCB3aGl0ZXNwYWNlLCBpbmRlbnRhdGlvbiwgc3RhY2spO1xuICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGVsZW1lbnQgPT09IHVuZGVmaW5lZCA/IFwibnVsbFwiIDogZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdHMubGVuZ3RoID8gKHdoaXRlc3BhY2UgPyBcIltcXG5cIiArIGluZGVudGF0aW9uICsgcmVzdWx0cy5qb2luKFwiLFxcblwiICsgaW5kZW50YXRpb24pICsgXCJcXG5cIiArIHByZWZpeCArIFwiXVwiIDogKFwiW1wiICsgcmVzdWx0cy5qb2luKFwiLFwiKSArIFwiXVwiKSkgOiBcIltdXCI7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gUmVjdXJzaXZlbHkgc2VyaWFsaXplIG9iamVjdCBtZW1iZXJzLiBNZW1iZXJzIGFyZSBzZWxlY3RlZCBmcm9tXG4gICAgICAgICAgICAgICAgLy8gZWl0aGVyIGEgdXNlci1zcGVjaWZpZWQgbGlzdCBvZiBwcm9wZXJ0eSBuYW1lcywgb3IgdGhlIG9iamVjdFxuICAgICAgICAgICAgICAgIC8vIGl0c2VsZi5cbiAgICAgICAgICAgICAgICBmb3JPd24ocHJvcGVydGllcyB8fCB2YWx1ZSwgZnVuY3Rpb24gKHByb3BlcnR5KSB7XG4gICAgICAgICAgICAgICAgICB2YXIgZWxlbWVudCA9IHNlcmlhbGl6ZShwcm9wZXJ0eSwgdmFsdWUsIGNhbGxiYWNrLCBwcm9wZXJ0aWVzLCB3aGl0ZXNwYWNlLCBpbmRlbnRhdGlvbiwgc3RhY2spO1xuICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBBY2NvcmRpbmcgdG8gRVMgNS4xIHNlY3Rpb24gMTUuMTIuMzogXCJJZiBgZ2FwYCB7d2hpdGVzcGFjZX1cbiAgICAgICAgICAgICAgICAgICAgLy8gaXMgbm90IHRoZSBlbXB0eSBzdHJpbmcsIGxldCBgbWVtYmVyYCB7cXVvdGUocHJvcGVydHkpICsgXCI6XCJ9XG4gICAgICAgICAgICAgICAgICAgIC8vIGJlIHRoZSBjb25jYXRlbmF0aW9uIG9mIGBtZW1iZXJgIGFuZCB0aGUgYHNwYWNlYCBjaGFyYWN0ZXIuXCJcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIFwiYHNwYWNlYCBjaGFyYWN0ZXJcIiByZWZlcnMgdG8gdGhlIGxpdGVyYWwgc3BhY2VcbiAgICAgICAgICAgICAgICAgICAgLy8gY2hhcmFjdGVyLCBub3QgdGhlIGBzcGFjZWAge3dpZHRofSBhcmd1bWVudCBwcm92aWRlZCB0b1xuICAgICAgICAgICAgICAgICAgICAvLyBgSlNPTi5zdHJpbmdpZnlgLlxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2gocXVvdGUocHJvcGVydHkpICsgXCI6XCIgKyAod2hpdGVzcGFjZSA/IFwiIFwiIDogXCJcIikgKyBlbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHRzLmxlbmd0aCA/ICh3aGl0ZXNwYWNlID8gXCJ7XFxuXCIgKyBpbmRlbnRhdGlvbiArIHJlc3VsdHMuam9pbihcIixcXG5cIiArIGluZGVudGF0aW9uKSArIFwiXFxuXCIgKyBwcmVmaXggKyBcIn1cIiA6IChcIntcIiArIHJlc3VsdHMuam9pbihcIixcIikgKyBcIn1cIikpIDogXCJ7fVwiO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vIFJlbW92ZSB0aGUgb2JqZWN0IGZyb20gdGhlIHRyYXZlcnNlZCBvYmplY3Qgc3RhY2suXG4gICAgICAgICAgICAgIHN0YWNrLnBvcCgpO1xuICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICAvLyBQdWJsaWM6IGBKU09OLnN0cmluZ2lmeWAuIFNlZSBFUyA1LjEgc2VjdGlvbiAxNS4xMi4zLlxuICAgICAgICAgIGV4cG9ydHMuc3RyaW5naWZ5ID0gZnVuY3Rpb24gKHNvdXJjZSwgZmlsdGVyLCB3aWR0aCkge1xuICAgICAgICAgICAgdmFyIHdoaXRlc3BhY2UsIGNhbGxiYWNrLCBwcm9wZXJ0aWVzLCBjbGFzc05hbWU7XG4gICAgICAgICAgICBpZiAob2JqZWN0VHlwZXNbdHlwZW9mIGZpbHRlcl0gJiYgZmlsdGVyKSB7XG4gICAgICAgICAgICAgIGNsYXNzTmFtZSA9IGdldENsYXNzLmNhbGwoZmlsdGVyKTtcbiAgICAgICAgICAgICAgaWYgKGNsYXNzTmFtZSA9PSBmdW5jdGlvbkNsYXNzKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sgPSBmaWx0ZXI7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2xhc3NOYW1lID09IGFycmF5Q2xhc3MpIHtcbiAgICAgICAgICAgICAgICAvLyBDb252ZXJ0IHRoZSBwcm9wZXJ0eSBuYW1lcyBhcnJheSBpbnRvIGEgbWFrZXNoaWZ0IHNldC5cbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzID0ge307XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaW5kZXggPSAwLCBsZW5ndGggPSBmaWx0ZXIubGVuZ3RoLCB2YWx1ZTsgaW5kZXggPCBsZW5ndGg7KSB7XG4gICAgICAgICAgICAgICAgICB2YWx1ZSA9IGZpbHRlcltpbmRleCsrXTtcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IGdldENsYXNzLmNhbGwodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgaWYgKGNsYXNzTmFtZSA9PSBcIltvYmplY3QgU3RyaW5nXVwiIHx8IGNsYXNzTmFtZSA9PSBcIltvYmplY3QgTnVtYmVyXVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXNbdmFsdWVdID0gMTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh3aWR0aCkge1xuICAgICAgICAgICAgICBjbGFzc05hbWUgPSBnZXRDbGFzcy5jYWxsKHdpZHRoKTtcbiAgICAgICAgICAgICAgaWYgKGNsYXNzTmFtZSA9PSBudW1iZXJDbGFzcykge1xuICAgICAgICAgICAgICAgIC8vIENvbnZlcnQgdGhlIGB3aWR0aGAgdG8gYW4gaW50ZWdlciBhbmQgY3JlYXRlIGEgc3RyaW5nIGNvbnRhaW5pbmdcbiAgICAgICAgICAgICAgICAvLyBgd2lkdGhgIG51bWJlciBvZiBzcGFjZSBjaGFyYWN0ZXJzLlxuICAgICAgICAgICAgICAgIGlmICgod2lkdGggLT0gd2lkdGggJSAxKSA+IDApIHtcbiAgICAgICAgICAgICAgICAgIGlmICh3aWR0aCA+IDEwKSB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gMTA7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBmb3IgKHdoaXRlc3BhY2UgPSBcIlwiOyB3aGl0ZXNwYWNlLmxlbmd0aCA8IHdpZHRoOykge1xuICAgICAgICAgICAgICAgICAgICB3aGl0ZXNwYWNlICs9IFwiIFwiO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChjbGFzc05hbWUgPT0gc3RyaW5nQ2xhc3MpIHtcbiAgICAgICAgICAgICAgICB3aGl0ZXNwYWNlID0gd2lkdGgubGVuZ3RoIDw9IDEwID8gd2lkdGggOiB3aWR0aC5zbGljZSgwLCAxMCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIE9wZXJhIDw9IDcuNTR1MiBkaXNjYXJkcyB0aGUgdmFsdWVzIGFzc29jaWF0ZWQgd2l0aCBlbXB0eSBzdHJpbmcga2V5c1xuICAgICAgICAgICAgLy8gKGBcIlwiYCkgb25seSBpZiB0aGV5IGFyZSB1c2VkIGRpcmVjdGx5IHdpdGhpbiBhbiBvYmplY3QgbWVtYmVyIGxpc3RcbiAgICAgICAgICAgIC8vIChlLmcuLCBgIShcIlwiIGluIHsgXCJcIjogMX0pYCkuXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsaXplKFwiXCIsICh2YWx1ZSA9IHt9LCB2YWx1ZVtcIlwiXSA9IHNvdXJjZSwgdmFsdWUpLCBjYWxsYmFjaywgcHJvcGVydGllcywgd2hpdGVzcGFjZSwgXCJcIiwgW10pO1xuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gUHVibGljOiBQYXJzZXMgYSBKU09OIHNvdXJjZSBzdHJpbmcuXG4gICAgICBpZiAoIWhhcyhcImpzb24tcGFyc2VcIikpIHtcbiAgICAgICAgdmFyIGZyb21DaGFyQ29kZSA9IFN0cmluZy5mcm9tQ2hhckNvZGU7XG5cbiAgICAgICAgLy8gSW50ZXJuYWw6IEEgbWFwIG9mIGVzY2FwZWQgY29udHJvbCBjaGFyYWN0ZXJzIGFuZCB0aGVpciB1bmVzY2FwZWRcbiAgICAgICAgLy8gZXF1aXZhbGVudHMuXG4gICAgICAgIHZhciBVbmVzY2FwZXMgPSB7XG4gICAgICAgICAgOTI6IFwiXFxcXFwiLFxuICAgICAgICAgIDM0OiAnXCInLFxuICAgICAgICAgIDQ3OiBcIi9cIixcbiAgICAgICAgICA5ODogXCJcXGJcIixcbiAgICAgICAgICAxMTY6IFwiXFx0XCIsXG4gICAgICAgICAgMTEwOiBcIlxcblwiLFxuICAgICAgICAgIDEwMjogXCJcXGZcIixcbiAgICAgICAgICAxMTQ6IFwiXFxyXCJcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBJbnRlcm5hbDogU3RvcmVzIHRoZSBwYXJzZXIgc3RhdGUuXG4gICAgICAgIHZhciBJbmRleCwgU291cmNlO1xuXG4gICAgICAgIC8vIEludGVybmFsOiBSZXNldHMgdGhlIHBhcnNlciBzdGF0ZSBhbmQgdGhyb3dzIGEgYFN5bnRheEVycm9yYC5cbiAgICAgICAgdmFyIGFib3J0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIEluZGV4ID0gU291cmNlID0gbnVsbDtcbiAgICAgICAgICB0aHJvdyBTeW50YXhFcnJvcigpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEludGVybmFsOiBSZXR1cm5zIHRoZSBuZXh0IHRva2VuLCBvciBgXCIkXCJgIGlmIHRoZSBwYXJzZXIgaGFzIHJlYWNoZWRcbiAgICAgICAgLy8gdGhlIGVuZCBvZiB0aGUgc291cmNlIHN0cmluZy4gQSB0b2tlbiBtYXkgYmUgYSBzdHJpbmcsIG51bWJlciwgYG51bGxgXG4gICAgICAgIC8vIGxpdGVyYWwsIG9yIEJvb2xlYW4gbGl0ZXJhbC5cbiAgICAgICAgdmFyIGxleCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgc291cmNlID0gU291cmNlLCBsZW5ndGggPSBzb3VyY2UubGVuZ3RoLCB2YWx1ZSwgYmVnaW4sIHBvc2l0aW9uLCBpc1NpZ25lZCwgY2hhckNvZGU7XG4gICAgICAgICAgd2hpbGUgKEluZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgICBjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4KTtcbiAgICAgICAgICAgIHN3aXRjaCAoY2hhckNvZGUpIHtcbiAgICAgICAgICAgICAgY2FzZSA5OiBjYXNlIDEwOiBjYXNlIDEzOiBjYXNlIDMyOlxuICAgICAgICAgICAgICAgIC8vIFNraXAgd2hpdGVzcGFjZSB0b2tlbnMsIGluY2x1ZGluZyB0YWJzLCBjYXJyaWFnZSByZXR1cm5zLCBsaW5lXG4gICAgICAgICAgICAgICAgLy8gZmVlZHMsIGFuZCBzcGFjZSBjaGFyYWN0ZXJzLlxuICAgICAgICAgICAgICAgIEluZGV4Kys7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgMTIzOiBjYXNlIDEyNTogY2FzZSA5MTogY2FzZSA5MzogY2FzZSA1ODogY2FzZSA0NDpcbiAgICAgICAgICAgICAgICAvLyBQYXJzZSBhIHB1bmN0dWF0b3IgdG9rZW4gKGB7YCwgYH1gLCBgW2AsIGBdYCwgYDpgLCBvciBgLGApIGF0XG4gICAgICAgICAgICAgICAgLy8gdGhlIGN1cnJlbnQgcG9zaXRpb24uXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBjaGFySW5kZXhCdWdneSA/IHNvdXJjZS5jaGFyQXQoSW5kZXgpIDogc291cmNlW0luZGV4XTtcbiAgICAgICAgICAgICAgICBJbmRleCsrO1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgICAgY2FzZSAzNDpcbiAgICAgICAgICAgICAgICAvLyBgXCJgIGRlbGltaXRzIGEgSlNPTiBzdHJpbmc7IGFkdmFuY2UgdG8gdGhlIG5leHQgY2hhcmFjdGVyIGFuZFxuICAgICAgICAgICAgICAgIC8vIGJlZ2luIHBhcnNpbmcgdGhlIHN0cmluZy4gU3RyaW5nIHRva2VucyBhcmUgcHJlZml4ZWQgd2l0aCB0aGVcbiAgICAgICAgICAgICAgICAvLyBzZW50aW5lbCBgQGAgY2hhcmFjdGVyIHRvIGRpc3Rpbmd1aXNoIHRoZW0gZnJvbSBwdW5jdHVhdG9ycyBhbmRcbiAgICAgICAgICAgICAgICAvLyBlbmQtb2Ytc3RyaW5nIHRva2Vucy5cbiAgICAgICAgICAgICAgICBmb3IgKHZhbHVlID0gXCJAXCIsIEluZGV4Kys7IEluZGV4IDwgbGVuZ3RoOykge1xuICAgICAgICAgICAgICAgICAgY2hhckNvZGUgPSBzb3VyY2UuY2hhckNvZGVBdChJbmRleCk7XG4gICAgICAgICAgICAgICAgICBpZiAoY2hhckNvZGUgPCAzMikge1xuICAgICAgICAgICAgICAgICAgICAvLyBVbmVzY2FwZWQgQVNDSUkgY29udHJvbCBjaGFyYWN0ZXJzICh0aG9zZSB3aXRoIGEgY29kZSB1bml0XG4gICAgICAgICAgICAgICAgICAgIC8vIGxlc3MgdGhhbiB0aGUgc3BhY2UgY2hhcmFjdGVyKSBhcmUgbm90IHBlcm1pdHRlZC5cbiAgICAgICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hhckNvZGUgPT0gOTIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQSByZXZlcnNlIHNvbGlkdXMgKGBcXGApIG1hcmtzIHRoZSBiZWdpbm5pbmcgb2YgYW4gZXNjYXBlZFxuICAgICAgICAgICAgICAgICAgICAvLyBjb250cm9sIGNoYXJhY3RlciAoaW5jbHVkaW5nIGBcImAsIGBcXGAsIGFuZCBgL2ApIG9yIFVuaWNvZGVcbiAgICAgICAgICAgICAgICAgICAgLy8gZXNjYXBlIHNlcXVlbmNlLlxuICAgICAgICAgICAgICAgICAgICBjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KCsrSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGNoYXJDb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY2FzZSA5MjogY2FzZSAzNDogY2FzZSA0NzogY2FzZSA5ODogY2FzZSAxMTY6IGNhc2UgMTEwOiBjYXNlIDEwMjogY2FzZSAxMTQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBSZXZpdmUgZXNjYXBlZCBjb250cm9sIGNoYXJhY3RlcnMuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSArPSBVbmVzY2FwZXNbY2hhckNvZGVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgSW5kZXgrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTE3OlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYFxcdWAgbWFya3MgdGhlIGJlZ2lubmluZyBvZiBhIFVuaWNvZGUgZXNjYXBlIHNlcXVlbmNlLlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWR2YW5jZSB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIGFuZCB2YWxpZGF0ZSB0aGVcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZvdXItZGlnaXQgY29kZSBwb2ludC5cbiAgICAgICAgICAgICAgICAgICAgICAgIGJlZ2luID0gKytJbmRleDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAocG9zaXRpb24gPSBJbmRleCArIDQ7IEluZGV4IDwgcG9zaXRpb247IEluZGV4KyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhckNvZGUgPSBzb3VyY2UuY2hhckNvZGVBdChJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEEgdmFsaWQgc2VxdWVuY2UgY29tcHJpc2VzIGZvdXIgaGV4ZGlnaXRzIChjYXNlLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpbnNlbnNpdGl2ZSkgdGhhdCBmb3JtIGEgc2luZ2xlIGhleGFkZWNpbWFsIHZhbHVlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIShjaGFyQ29kZSA+PSA0OCAmJiBjaGFyQ29kZSA8PSA1NyB8fCBjaGFyQ29kZSA+PSA5NyAmJiBjaGFyQ29kZSA8PSAxMDIgfHwgY2hhckNvZGUgPj0gNjUgJiYgY2hhckNvZGUgPD0gNzApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW52YWxpZCBVbmljb2RlIGVzY2FwZSBzZXF1ZW5jZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBSZXZpdmUgdGhlIGVzY2FwZWQgY2hhcmFjdGVyLlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgKz0gZnJvbUNoYXJDb2RlKFwiMHhcIiArIHNvdXJjZS5zbGljZShiZWdpbiwgSW5kZXgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJbnZhbGlkIGVzY2FwZSBzZXF1ZW5jZS5cbiAgICAgICAgICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGFyQ29kZSA9PSAzNCkge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIEFuIHVuZXNjYXBlZCBkb3VibGUtcXVvdGUgY2hhcmFjdGVyIG1hcmtzIHRoZSBlbmQgb2YgdGhlXG4gICAgICAgICAgICAgICAgICAgICAgLy8gc3RyaW5nLlxuICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQoSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICBiZWdpbiA9IEluZGV4O1xuICAgICAgICAgICAgICAgICAgICAvLyBPcHRpbWl6ZSBmb3IgdGhlIGNvbW1vbiBjYXNlIHdoZXJlIGEgc3RyaW5nIGlzIHZhbGlkLlxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoY2hhckNvZGUgPj0gMzIgJiYgY2hhckNvZGUgIT0gOTIgJiYgY2hhckNvZGUgIT0gMzQpIHtcbiAgICAgICAgICAgICAgICAgICAgICBjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KCsrSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIEFwcGVuZCB0aGUgc3RyaW5nIGFzLWlzLlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSArPSBzb3VyY2Uuc2xpY2UoYmVnaW4sIEluZGV4KTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4KSA9PSAzNCkge1xuICAgICAgICAgICAgICAgICAgLy8gQWR2YW5jZSB0byB0aGUgbmV4dCBjaGFyYWN0ZXIgYW5kIHJldHVybiB0aGUgcmV2aXZlZCBzdHJpbmcuXG4gICAgICAgICAgICAgICAgICBJbmRleCsrO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBVbnRlcm1pbmF0ZWQgc3RyaW5nLlxuICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgLy8gUGFyc2UgbnVtYmVycyBhbmQgbGl0ZXJhbHMuXG4gICAgICAgICAgICAgICAgYmVnaW4gPSBJbmRleDtcbiAgICAgICAgICAgICAgICAvLyBBZHZhbmNlIHBhc3QgdGhlIG5lZ2F0aXZlIHNpZ24sIGlmIG9uZSBpcyBzcGVjaWZpZWQuXG4gICAgICAgICAgICAgICAgaWYgKGNoYXJDb2RlID09IDQ1KSB7XG4gICAgICAgICAgICAgICAgICBpc1NpZ25lZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICBjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KCsrSW5kZXgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBQYXJzZSBhbiBpbnRlZ2VyIG9yIGZsb2F0aW5nLXBvaW50IHZhbHVlLlxuICAgICAgICAgICAgICAgIGlmIChjaGFyQ29kZSA+PSA0OCAmJiBjaGFyQ29kZSA8PSA1Nykge1xuICAgICAgICAgICAgICAgICAgLy8gTGVhZGluZyB6ZXJvZXMgYXJlIGludGVycHJldGVkIGFzIG9jdGFsIGxpdGVyYWxzLlxuICAgICAgICAgICAgICAgICAgaWYgKGNoYXJDb2RlID09IDQ4ICYmICgoY2hhckNvZGUgPSBzb3VyY2UuY2hhckNvZGVBdChJbmRleCArIDEpKSwgY2hhckNvZGUgPj0gNDggJiYgY2hhckNvZGUgPD0gNTcpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElsbGVnYWwgb2N0YWwgbGl0ZXJhbC5cbiAgICAgICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGlzU2lnbmVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAvLyBQYXJzZSB0aGUgaW50ZWdlciBjb21wb25lbnQuXG4gICAgICAgICAgICAgICAgICBmb3IgKDsgSW5kZXggPCBsZW5ndGggJiYgKChjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4KSksIGNoYXJDb2RlID49IDQ4ICYmIGNoYXJDb2RlIDw9IDU3KTsgSW5kZXgrKyk7XG4gICAgICAgICAgICAgICAgICAvLyBGbG9hdHMgY2Fubm90IGNvbnRhaW4gYSBsZWFkaW5nIGRlY2ltYWwgcG9pbnQ7IGhvd2V2ZXIsIHRoaXNcbiAgICAgICAgICAgICAgICAgIC8vIGNhc2UgaXMgYWxyZWFkeSBhY2NvdW50ZWQgZm9yIGJ5IHRoZSBwYXJzZXIuXG4gICAgICAgICAgICAgICAgICBpZiAoc291cmNlLmNoYXJDb2RlQXQoSW5kZXgpID09IDQ2KSB7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gKytJbmRleDtcbiAgICAgICAgICAgICAgICAgICAgLy8gUGFyc2UgdGhlIGRlY2ltYWwgY29tcG9uZW50LlxuICAgICAgICAgICAgICAgICAgICBmb3IgKDsgcG9zaXRpb24gPCBsZW5ndGg7IHBvc2l0aW9uKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICBjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KHBvc2l0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hhckNvZGUgPCA0OCB8fCBjaGFyQ29kZSA+IDU3KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHBvc2l0aW9uID09IEluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gSWxsZWdhbCB0cmFpbGluZyBkZWNpbWFsLlxuICAgICAgICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgSW5kZXggPSBwb3NpdGlvbjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIC8vIFBhcnNlIGV4cG9uZW50cy4gVGhlIGBlYCBkZW5vdGluZyB0aGUgZXhwb25lbnQgaXNcbiAgICAgICAgICAgICAgICAgIC8vIGNhc2UtaW5zZW5zaXRpdmUuXG4gICAgICAgICAgICAgICAgICBjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4KTtcbiAgICAgICAgICAgICAgICAgIGlmIChjaGFyQ29kZSA9PSAxMDEgfHwgY2hhckNvZGUgPT0gNjkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2hhckNvZGUgPSBzb3VyY2UuY2hhckNvZGVBdCgrK0luZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgLy8gU2tpcCBwYXN0IHRoZSBzaWduIGZvbGxvd2luZyB0aGUgZXhwb25lbnQsIGlmIG9uZSBpc1xuICAgICAgICAgICAgICAgICAgICAvLyBzcGVjaWZpZWQuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGFyQ29kZSA9PSA0MyB8fCBjaGFyQ29kZSA9PSA0NSkge1xuICAgICAgICAgICAgICAgICAgICAgIEluZGV4Kys7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gUGFyc2UgdGhlIGV4cG9uZW50aWFsIGNvbXBvbmVudC5cbiAgICAgICAgICAgICAgICAgICAgZm9yIChwb3NpdGlvbiA9IEluZGV4OyBwb3NpdGlvbiA8IGxlbmd0aDsgcG9zaXRpb24rKykge1xuICAgICAgICAgICAgICAgICAgICAgIGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQocG9zaXRpb24pO1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGFyQ29kZSA8IDQ4IHx8IGNoYXJDb2RlID4gNTcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAocG9zaXRpb24gPT0gSW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBJbGxlZ2FsIGVtcHR5IGV4cG9uZW50LlxuICAgICAgICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgSW5kZXggPSBwb3NpdGlvbjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIC8vIENvZXJjZSB0aGUgcGFyc2VkIHZhbHVlIHRvIGEgSmF2YVNjcmlwdCBudW1iZXIuXG4gICAgICAgICAgICAgICAgICByZXR1cm4gK3NvdXJjZS5zbGljZShiZWdpbiwgSW5kZXgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBBIG5lZ2F0aXZlIHNpZ24gbWF5IG9ubHkgcHJlY2VkZSBudW1iZXJzLlxuICAgICAgICAgICAgICAgIGlmIChpc1NpZ25lZCkge1xuICAgICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gYHRydWVgLCBgZmFsc2VgLCBhbmQgYG51bGxgIGxpdGVyYWxzLlxuICAgICAgICAgICAgICAgIHZhciB0ZW1wID0gc291cmNlLnNsaWNlKEluZGV4LCBJbmRleCArIDQpO1xuICAgICAgICAgICAgICAgIGlmICh0ZW1wID09IFwidHJ1ZVwiKSB7XG4gICAgICAgICAgICAgICAgICBJbmRleCArPSA0O1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0ZW1wID09IFwiZmFsc1wiICYmIHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4ICsgNCApID09IDEwMSkge1xuICAgICAgICAgICAgICAgICAgSW5kZXggKz0gNTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRlbXAgPT0gXCJudWxsXCIpIHtcbiAgICAgICAgICAgICAgICAgIEluZGV4ICs9IDQ7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gVW5yZWNvZ25pemVkIHRva2VuLlxuICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIFJldHVybiB0aGUgc2VudGluZWwgYCRgIGNoYXJhY3RlciBpZiB0aGUgcGFyc2VyIGhhcyByZWFjaGVkIHRoZSBlbmRcbiAgICAgICAgICAvLyBvZiB0aGUgc291cmNlIHN0cmluZy5cbiAgICAgICAgICByZXR1cm4gXCIkXCI7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gSW50ZXJuYWw6IFBhcnNlcyBhIEpTT04gYHZhbHVlYCB0b2tlbi5cbiAgICAgICAgdmFyIGdldCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgIHZhciByZXN1bHRzLCBoYXNNZW1iZXJzO1xuICAgICAgICAgIGlmICh2YWx1ZSA9PSBcIiRcIikge1xuICAgICAgICAgICAgLy8gVW5leHBlY3RlZCBlbmQgb2YgaW5wdXQuXG4gICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIGlmICgoY2hhckluZGV4QnVnZ3kgPyB2YWx1ZS5jaGFyQXQoMCkgOiB2YWx1ZVswXSkgPT0gXCJAXCIpIHtcbiAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRoZSBzZW50aW5lbCBgQGAgY2hhcmFjdGVyLlxuICAgICAgICAgICAgICByZXR1cm4gdmFsdWUuc2xpY2UoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBQYXJzZSBvYmplY3QgYW5kIGFycmF5IGxpdGVyYWxzLlxuICAgICAgICAgICAgaWYgKHZhbHVlID09IFwiW1wiKSB7XG4gICAgICAgICAgICAgIC8vIFBhcnNlcyBhIEpTT04gYXJyYXksIHJldHVybmluZyBhIG5ldyBKYXZhU2NyaXB0IGFycmF5LlxuICAgICAgICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgICAgICAgIGZvciAoOzspIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGxleCgpO1xuICAgICAgICAgICAgICAgIC8vIEEgY2xvc2luZyBzcXVhcmUgYnJhY2tldCBtYXJrcyB0aGUgZW5kIG9mIHRoZSBhcnJheSBsaXRlcmFsLlxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PSBcIl1cIikge1xuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBhcnJheSBsaXRlcmFsIGNvbnRhaW5zIGVsZW1lbnRzLCB0aGUgY3VycmVudCB0b2tlblxuICAgICAgICAgICAgICAgIC8vIHNob3VsZCBiZSBhIGNvbW1hIHNlcGFyYXRpbmcgdGhlIHByZXZpb3VzIGVsZW1lbnQgZnJvbSB0aGVcbiAgICAgICAgICAgICAgICAvLyBuZXh0LlxuICAgICAgICAgICAgICAgIGlmIChoYXNNZW1iZXJzKSB7XG4gICAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gXCIsXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBsZXgoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlID09IFwiXVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gVW5leHBlY3RlZCB0cmFpbGluZyBgLGAgaW4gYXJyYXkgbGl0ZXJhbC5cbiAgICAgICAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBBIGAsYCBtdXN0IHNlcGFyYXRlIGVhY2ggYXJyYXkgZWxlbWVudC5cbiAgICAgICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgaGFzTWVtYmVycyA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIEVsaXNpb25zIGFuZCBsZWFkaW5nIGNvbW1hcyBhcmUgbm90IHBlcm1pdHRlZC5cbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gXCIsXCIpIHtcbiAgICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChnZXQodmFsdWUpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWUgPT0gXCJ7XCIpIHtcbiAgICAgICAgICAgICAgLy8gUGFyc2VzIGEgSlNPTiBvYmplY3QsIHJldHVybmluZyBhIG5ldyBKYXZhU2NyaXB0IG9iamVjdC5cbiAgICAgICAgICAgICAgcmVzdWx0cyA9IHt9O1xuICAgICAgICAgICAgICBmb3IgKDs7KSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBsZXgoKTtcbiAgICAgICAgICAgICAgICAvLyBBIGNsb3NpbmcgY3VybHkgYnJhY2UgbWFya3MgdGhlIGVuZCBvZiB0aGUgb2JqZWN0IGxpdGVyYWwuXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID09IFwifVwiKSB7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIG9iamVjdCBsaXRlcmFsIGNvbnRhaW5zIG1lbWJlcnMsIHRoZSBjdXJyZW50IHRva2VuXG4gICAgICAgICAgICAgICAgLy8gc2hvdWxkIGJlIGEgY29tbWEgc2VwYXJhdG9yLlxuICAgICAgICAgICAgICAgIGlmIChoYXNNZW1iZXJzKSB7XG4gICAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gXCIsXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBsZXgoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlID09IFwifVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gVW5leHBlY3RlZCB0cmFpbGluZyBgLGAgaW4gb2JqZWN0IGxpdGVyYWwuXG4gICAgICAgICAgICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQSBgLGAgbXVzdCBzZXBhcmF0ZSBlYWNoIG9iamVjdCBtZW1iZXIuXG4gICAgICAgICAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGhhc01lbWJlcnMgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBMZWFkaW5nIGNvbW1hcyBhcmUgbm90IHBlcm1pdHRlZCwgb2JqZWN0IHByb3BlcnR5IG5hbWVzIG11c3QgYmVcbiAgICAgICAgICAgICAgICAvLyBkb3VibGUtcXVvdGVkIHN0cmluZ3MsIGFuZCBhIGA6YCBtdXN0IHNlcGFyYXRlIGVhY2ggcHJvcGVydHlcbiAgICAgICAgICAgICAgICAvLyBuYW1lIGFuZCB2YWx1ZS5cbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gXCIsXCIgfHwgdHlwZW9mIHZhbHVlICE9IFwic3RyaW5nXCIgfHwgKGNoYXJJbmRleEJ1Z2d5ID8gdmFsdWUuY2hhckF0KDApIDogdmFsdWVbMF0pICE9IFwiQFwiIHx8IGxleCgpICE9IFwiOlwiKSB7XG4gICAgICAgICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXN1bHRzW3ZhbHVlLnNsaWNlKDEpXSA9IGdldChsZXgoKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBVbmV4cGVjdGVkIHRva2VuIGVuY291bnRlcmVkLlxuICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEludGVybmFsOiBVcGRhdGVzIGEgdHJhdmVyc2VkIG9iamVjdCBtZW1iZXIuXG4gICAgICAgIHZhciB1cGRhdGUgPSBmdW5jdGlvbiAoc291cmNlLCBwcm9wZXJ0eSwgY2FsbGJhY2spIHtcbiAgICAgICAgICB2YXIgZWxlbWVudCA9IHdhbGsoc291cmNlLCBwcm9wZXJ0eSwgY2FsbGJhY2spO1xuICAgICAgICAgIGlmIChlbGVtZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBzb3VyY2VbcHJvcGVydHldO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzb3VyY2VbcHJvcGVydHldID0gZWxlbWVudDtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gSW50ZXJuYWw6IFJlY3Vyc2l2ZWx5IHRyYXZlcnNlcyBhIHBhcnNlZCBKU09OIG9iamVjdCwgaW52b2tpbmcgdGhlXG4gICAgICAgIC8vIGBjYWxsYmFja2AgZnVuY3Rpb24gZm9yIGVhY2ggdmFsdWUuIFRoaXMgaXMgYW4gaW1wbGVtZW50YXRpb24gb2YgdGhlXG4gICAgICAgIC8vIGBXYWxrKGhvbGRlciwgbmFtZSlgIG9wZXJhdGlvbiBkZWZpbmVkIGluIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjIuXG4gICAgICAgIHZhciB3YWxrID0gZnVuY3Rpb24gKHNvdXJjZSwgcHJvcGVydHksIGNhbGxiYWNrKSB7XG4gICAgICAgICAgdmFyIHZhbHVlID0gc291cmNlW3Byb3BlcnR5XSwgbGVuZ3RoO1xuICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT0gXCJvYmplY3RcIiAmJiB2YWx1ZSkge1xuICAgICAgICAgICAgLy8gYGZvck93bmAgY2FuJ3QgYmUgdXNlZCB0byB0cmF2ZXJzZSBhbiBhcnJheSBpbiBPcGVyYSA8PSA4LjU0XG4gICAgICAgICAgICAvLyBiZWNhdXNlIGl0cyBgT2JqZWN0I2hhc093blByb3BlcnR5YCBpbXBsZW1lbnRhdGlvbiByZXR1cm5zIGBmYWxzZWBcbiAgICAgICAgICAgIC8vIGZvciBhcnJheSBpbmRpY2VzIChlLmcuLCBgIVsxLCAyLCAzXS5oYXNPd25Qcm9wZXJ0eShcIjBcIilgKS5cbiAgICAgICAgICAgIGlmIChnZXRDbGFzcy5jYWxsKHZhbHVlKSA9PSBhcnJheUNsYXNzKSB7XG4gICAgICAgICAgICAgIGZvciAobGVuZ3RoID0gdmFsdWUubGVuZ3RoOyBsZW5ndGgtLTspIHtcbiAgICAgICAgICAgICAgICB1cGRhdGUoZ2V0Q2xhc3MsIGZvck93biwgdmFsdWUsIGxlbmd0aCwgY2FsbGJhY2spO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBmb3JPd24odmFsdWUsIGZ1bmN0aW9uIChwcm9wZXJ0eSkge1xuICAgICAgICAgICAgICAgIHVwZGF0ZSh2YWx1ZSwgcHJvcGVydHksIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBjYWxsYmFjay5jYWxsKHNvdXJjZSwgcHJvcGVydHksIHZhbHVlKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBQdWJsaWM6IGBKU09OLnBhcnNlYC4gU2VlIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjIuXG4gICAgICAgIGV4cG9ydHMucGFyc2UgPSBmdW5jdGlvbiAoc291cmNlLCBjYWxsYmFjaykge1xuICAgICAgICAgIHZhciByZXN1bHQsIHZhbHVlO1xuICAgICAgICAgIEluZGV4ID0gMDtcbiAgICAgICAgICBTb3VyY2UgPSBcIlwiICsgc291cmNlO1xuICAgICAgICAgIHJlc3VsdCA9IGdldChsZXgoKSk7XG4gICAgICAgICAgLy8gSWYgYSBKU09OIHN0cmluZyBjb250YWlucyBtdWx0aXBsZSB0b2tlbnMsIGl0IGlzIGludmFsaWQuXG4gICAgICAgICAgaWYgKGxleCgpICE9IFwiJFwiKSB7XG4gICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBSZXNldCB0aGUgcGFyc2VyIHN0YXRlLlxuICAgICAgICAgIEluZGV4ID0gU291cmNlID0gbnVsbDtcbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2sgJiYgZ2V0Q2xhc3MuY2FsbChjYWxsYmFjaykgPT0gZnVuY3Rpb25DbGFzcyA/IHdhbGsoKHZhbHVlID0ge30sIHZhbHVlW1wiXCJdID0gcmVzdWx0LCB2YWx1ZSksIFwiXCIsIGNhbGxiYWNrKSA6IHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnRzLnJ1bkluQ29udGV4dCA9IHJ1bkluQ29udGV4dDtcbiAgICByZXR1cm4gZXhwb3J0cztcbiAgfVxuXG4gIGlmIChmcmVlRXhwb3J0cyAmJiAhaXNMb2FkZXIpIHtcbiAgICAvLyBFeHBvcnQgZm9yIENvbW1vbkpTIGVudmlyb25tZW50cy5cbiAgICBydW5JbkNvbnRleHQocm9vdCwgZnJlZUV4cG9ydHMpO1xuICB9IGVsc2Uge1xuICAgIC8vIEV4cG9ydCBmb3Igd2ViIGJyb3dzZXJzIGFuZCBKYXZhU2NyaXB0IGVuZ2luZXMuXG4gICAgdmFyIG5hdGl2ZUpTT04gPSByb290LkpTT04sXG4gICAgICAgIHByZXZpb3VzSlNPTiA9IHJvb3QuSlNPTjMsXG4gICAgICAgIGlzUmVzdG9yZWQgPSBmYWxzZTtcblxuICAgIHZhciBKU09OMyA9IHJ1bkluQ29udGV4dChyb290LCAocm9vdC5KU09OMyA9IHtcbiAgICAgIC8vIFB1YmxpYzogUmVzdG9yZXMgdGhlIG9yaWdpbmFsIHZhbHVlIG9mIHRoZSBnbG9iYWwgYEpTT05gIG9iamVjdCBhbmRcbiAgICAgIC8vIHJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIGBKU09OM2Agb2JqZWN0LlxuICAgICAgXCJub0NvbmZsaWN0XCI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCFpc1Jlc3RvcmVkKSB7XG4gICAgICAgICAgaXNSZXN0b3JlZCA9IHRydWU7XG4gICAgICAgICAgcm9vdC5KU09OID0gbmF0aXZlSlNPTjtcbiAgICAgICAgICByb290LkpTT04zID0gcHJldmlvdXNKU09OO1xuICAgICAgICAgIG5hdGl2ZUpTT04gPSBwcmV2aW91c0pTT04gPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBKU09OMztcbiAgICAgIH1cbiAgICB9KSk7XG5cbiAgICByb290LkpTT04gPSB7XG4gICAgICBcInBhcnNlXCI6IEpTT04zLnBhcnNlLFxuICAgICAgXCJzdHJpbmdpZnlcIjogSlNPTjMuc3RyaW5naWZ5XG4gICAgfTtcbiAgfVxuXG4gIC8vIEV4cG9ydCBmb3IgYXN5bmNocm9ub3VzIG1vZHVsZSBsb2FkZXJzLlxuICBpZiAoaXNMb2FkZXIpIHtcbiAgICBkZWZpbmUoZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIEpTT04zO1xuICAgIH0pO1xuICB9XG59KS5jYWxsKHRoaXMpO1xuIiwiLyoqXG4gKiBIZWxwZXJzLlxuICovXG5cbnZhciBzID0gMTAwMDtcbnZhciBtID0gcyAqIDYwO1xudmFyIGggPSBtICogNjA7XG52YXIgZCA9IGggKiAyNDtcbnZhciB3ID0gZCAqIDc7XG52YXIgeSA9IGQgKiAzNjUuMjU7XG5cbi8qKlxuICogUGFyc2Ugb3IgZm9ybWF0IHRoZSBnaXZlbiBgdmFsYC5cbiAqXG4gKiBPcHRpb25zOlxuICpcbiAqICAtIGBsb25nYCB2ZXJib3NlIGZvcm1hdHRpbmcgW2ZhbHNlXVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE51bWJlcn0gdmFsXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiBAdGhyb3dzIHtFcnJvcn0gdGhyb3cgYW4gZXJyb3IgaWYgdmFsIGlzIG5vdCBhIG5vbi1lbXB0eSBzdHJpbmcgb3IgYSBudW1iZXJcbiAqIEByZXR1cm4ge1N0cmluZ3xOdW1iZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHZhbCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsO1xuICBpZiAodHlwZSA9PT0gJ3N0cmluZycgJiYgdmFsLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gcGFyc2UodmFsKTtcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSh2YWwpKSB7XG4gICAgcmV0dXJuIG9wdGlvbnMubG9uZyA/IGZtdExvbmcodmFsKSA6IGZtdFNob3J0KHZhbCk7XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKFxuICAgICd2YWwgaXMgbm90IGEgbm9uLWVtcHR5IHN0cmluZyBvciBhIHZhbGlkIG51bWJlci4gdmFsPScgK1xuICAgICAgSlNPTi5zdHJpbmdpZnkodmFsKVxuICApO1xufTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYHN0cmAgYW5kIHJldHVybiBtaWxsaXNlY29uZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7TnVtYmVyfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyc2Uoc3RyKSB7XG4gIHN0ciA9IFN0cmluZyhzdHIpO1xuICBpZiAoc3RyLmxlbmd0aCA+IDEwMCkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbWF0Y2ggPSAvXigtPyg/OlxcZCspP1xcLj9cXGQrKSAqKG1pbGxpc2Vjb25kcz98bXNlY3M/fG1zfHNlY29uZHM/fHNlY3M/fHN8bWludXRlcz98bWlucz98bXxob3Vycz98aHJzP3xofGRheXM/fGR8d2Vla3M/fHd8eWVhcnM/fHlycz98eSk/JC9pLmV4ZWMoXG4gICAgc3RyXG4gICk7XG4gIGlmICghbWF0Y2gpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIG4gPSBwYXJzZUZsb2F0KG1hdGNoWzFdKTtcbiAgdmFyIHR5cGUgPSAobWF0Y2hbMl0gfHwgJ21zJykudG9Mb3dlckNhc2UoKTtcbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSAneWVhcnMnOlxuICAgIGNhc2UgJ3llYXInOlxuICAgIGNhc2UgJ3lycyc6XG4gICAgY2FzZSAneXInOlxuICAgIGNhc2UgJ3knOlxuICAgICAgcmV0dXJuIG4gKiB5O1xuICAgIGNhc2UgJ3dlZWtzJzpcbiAgICBjYXNlICd3ZWVrJzpcbiAgICBjYXNlICd3JzpcbiAgICAgIHJldHVybiBuICogdztcbiAgICBjYXNlICdkYXlzJzpcbiAgICBjYXNlICdkYXknOlxuICAgIGNhc2UgJ2QnOlxuICAgICAgcmV0dXJuIG4gKiBkO1xuICAgIGNhc2UgJ2hvdXJzJzpcbiAgICBjYXNlICdob3VyJzpcbiAgICBjYXNlICdocnMnOlxuICAgIGNhc2UgJ2hyJzpcbiAgICBjYXNlICdoJzpcbiAgICAgIHJldHVybiBuICogaDtcbiAgICBjYXNlICdtaW51dGVzJzpcbiAgICBjYXNlICdtaW51dGUnOlxuICAgIGNhc2UgJ21pbnMnOlxuICAgIGNhc2UgJ21pbic6XG4gICAgY2FzZSAnbSc6XG4gICAgICByZXR1cm4gbiAqIG07XG4gICAgY2FzZSAnc2Vjb25kcyc6XG4gICAgY2FzZSAnc2Vjb25kJzpcbiAgICBjYXNlICdzZWNzJzpcbiAgICBjYXNlICdzZWMnOlxuICAgIGNhc2UgJ3MnOlxuICAgICAgcmV0dXJuIG4gKiBzO1xuICAgIGNhc2UgJ21pbGxpc2Vjb25kcyc6XG4gICAgY2FzZSAnbWlsbGlzZWNvbmQnOlxuICAgIGNhc2UgJ21zZWNzJzpcbiAgICBjYXNlICdtc2VjJzpcbiAgICBjYXNlICdtcyc6XG4gICAgICByZXR1cm4gbjtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxufVxuXG4vKipcbiAqIFNob3J0IGZvcm1hdCBmb3IgYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbXNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGZtdFNob3J0KG1zKSB7XG4gIHZhciBtc0FicyA9IE1hdGguYWJzKG1zKTtcbiAgaWYgKG1zQWJzID49IGQpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIGQpICsgJ2QnO1xuICB9XG4gIGlmIChtc0FicyA+PSBoKSB7XG4gICAgcmV0dXJuIE1hdGgucm91bmQobXMgLyBoKSArICdoJztcbiAgfVxuICBpZiAobXNBYnMgPj0gbSkge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gbSkgKyAnbSc7XG4gIH1cbiAgaWYgKG1zQWJzID49IHMpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIHMpICsgJ3MnO1xuICB9XG4gIHJldHVybiBtcyArICdtcyc7XG59XG5cbi8qKlxuICogTG9uZyBmb3JtYXQgZm9yIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBmbXRMb25nKG1zKSB7XG4gIHZhciBtc0FicyA9IE1hdGguYWJzKG1zKTtcbiAgaWYgKG1zQWJzID49IGQpIHtcbiAgICByZXR1cm4gcGx1cmFsKG1zLCBtc0FicywgZCwgJ2RheScpO1xuICB9XG4gIGlmIChtc0FicyA+PSBoKSB7XG4gICAgcmV0dXJuIHBsdXJhbChtcywgbXNBYnMsIGgsICdob3VyJyk7XG4gIH1cbiAgaWYgKG1zQWJzID49IG0pIHtcbiAgICByZXR1cm4gcGx1cmFsKG1zLCBtc0FicywgbSwgJ21pbnV0ZScpO1xuICB9XG4gIGlmIChtc0FicyA+PSBzKSB7XG4gICAgcmV0dXJuIHBsdXJhbChtcywgbXNBYnMsIHMsICdzZWNvbmQnKTtcbiAgfVxuICByZXR1cm4gbXMgKyAnIG1zJztcbn1cblxuLyoqXG4gKiBQbHVyYWxpemF0aW9uIGhlbHBlci5cbiAqL1xuXG5mdW5jdGlvbiBwbHVyYWwobXMsIG1zQWJzLCBuLCBuYW1lKSB7XG4gIHZhciBpc1BsdXJhbCA9IG1zQWJzID49IG4gKiAxLjU7XG4gIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gbikgKyAnICcgKyBuYW1lICsgKGlzUGx1cmFsID8gJ3MnIDogJycpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eVxuICAsIHVuZGVmO1xuXG4vKipcbiAqIERlY29kZSBhIFVSSSBlbmNvZGVkIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIFVSSSBlbmNvZGVkIHN0cmluZy5cbiAqIEByZXR1cm5zIHtTdHJpbmd8TnVsbH0gVGhlIGRlY29kZWQgc3RyaW5nLlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGRlY29kZShpbnB1dCkge1xuICB0cnkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoaW5wdXQucmVwbGFjZSgvXFwrL2csICcgJykpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBBdHRlbXB0cyB0byBlbmNvZGUgYSBnaXZlbiBpbnB1dC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIHN0cmluZyB0aGF0IG5lZWRzIHRvIGJlIGVuY29kZWQuXG4gKiBAcmV0dXJucyB7U3RyaW5nfE51bGx9IFRoZSBlbmNvZGVkIHN0cmluZy5cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBlbmNvZGUoaW5wdXQpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KGlucHV0KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8qKlxuICogU2ltcGxlIHF1ZXJ5IHN0cmluZyBwYXJzZXIuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHF1ZXJ5IFRoZSBxdWVyeSBzdHJpbmcgdGhhdCBuZWVkcyB0byBiZSBwYXJzZWQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuZnVuY3Rpb24gcXVlcnlzdHJpbmcocXVlcnkpIHtcbiAgdmFyIHBhcnNlciA9IC8oW149PyMmXSspPT8oW14mXSopL2dcbiAgICAsIHJlc3VsdCA9IHt9XG4gICAgLCBwYXJ0O1xuXG4gIHdoaWxlIChwYXJ0ID0gcGFyc2VyLmV4ZWMocXVlcnkpKSB7XG4gICAgdmFyIGtleSA9IGRlY29kZShwYXJ0WzFdKVxuICAgICAgLCB2YWx1ZSA9IGRlY29kZShwYXJ0WzJdKTtcblxuICAgIC8vXG4gICAgLy8gUHJldmVudCBvdmVycmlkaW5nIG9mIGV4aXN0aW5nIHByb3BlcnRpZXMuIFRoaXMgZW5zdXJlcyB0aGF0IGJ1aWxkLWluXG4gICAgLy8gbWV0aG9kcyBsaWtlIGB0b1N0cmluZ2Agb3IgX19wcm90b19fIGFyZSBub3Qgb3ZlcnJpZGVuIGJ5IG1hbGljaW91c1xuICAgIC8vIHF1ZXJ5c3RyaW5ncy5cbiAgICAvL1xuICAgIC8vIEluIHRoZSBjYXNlIGlmIGZhaWxlZCBkZWNvZGluZywgd2Ugd2FudCB0byBvbWl0IHRoZSBrZXkvdmFsdWUgcGFpcnNcbiAgICAvLyBmcm9tIHRoZSByZXN1bHQuXG4gICAgLy9cbiAgICBpZiAoa2V5ID09PSBudWxsIHx8IHZhbHVlID09PSBudWxsIHx8IGtleSBpbiByZXN1bHQpIGNvbnRpbnVlO1xuICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybSBhIHF1ZXJ5IHN0cmluZyB0byBhbiBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBPYmplY3QgdGhhdCBzaG91bGQgYmUgdHJhbnNmb3JtZWQuXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJlZml4IE9wdGlvbmFsIHByZWZpeC5cbiAqIEByZXR1cm5zIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5mdW5jdGlvbiBxdWVyeXN0cmluZ2lmeShvYmosIHByZWZpeCkge1xuICBwcmVmaXggPSBwcmVmaXggfHwgJyc7XG5cbiAgdmFyIHBhaXJzID0gW11cbiAgICAsIHZhbHVlXG4gICAgLCBrZXk7XG5cbiAgLy9cbiAgLy8gT3B0aW9uYWxseSBwcmVmaXggd2l0aCBhICc/JyBpZiBuZWVkZWRcbiAgLy9cbiAgaWYgKCdzdHJpbmcnICE9PSB0eXBlb2YgcHJlZml4KSBwcmVmaXggPSAnPyc7XG5cbiAgZm9yIChrZXkgaW4gb2JqKSB7XG4gICAgaWYgKGhhcy5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgdmFsdWUgPSBvYmpba2V5XTtcblxuICAgICAgLy9cbiAgICAgIC8vIEVkZ2UgY2FzZXMgd2hlcmUgd2UgYWN0dWFsbHkgd2FudCB0byBlbmNvZGUgdGhlIHZhbHVlIHRvIGFuIGVtcHR5XG4gICAgICAvLyBzdHJpbmcgaW5zdGVhZCBvZiB0aGUgc3RyaW5naWZpZWQgdmFsdWUuXG4gICAgICAvL1xuICAgICAgaWYgKCF2YWx1ZSAmJiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmIHx8IGlzTmFOKHZhbHVlKSkpIHtcbiAgICAgICAgdmFsdWUgPSAnJztcbiAgICAgIH1cblxuICAgICAga2V5ID0gZW5jb2RlKGtleSk7XG4gICAgICB2YWx1ZSA9IGVuY29kZSh2YWx1ZSk7XG5cbiAgICAgIC8vXG4gICAgICAvLyBJZiB3ZSBmYWlsZWQgdG8gZW5jb2RlIHRoZSBzdHJpbmdzLCB3ZSBzaG91bGQgYmFpbCBvdXQgYXMgd2UgZG9uJ3RcbiAgICAgIC8vIHdhbnQgdG8gYWRkIGludmFsaWQgc3RyaW5ncyB0byB0aGUgcXVlcnkuXG4gICAgICAvL1xuICAgICAgaWYgKGtleSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gbnVsbCkgY29udGludWU7XG4gICAgICBwYWlycy5wdXNoKGtleSArJz0nKyB2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBhaXJzLmxlbmd0aCA/IHByZWZpeCArIHBhaXJzLmpvaW4oJyYnKSA6ICcnO1xufVxuXG4vL1xuLy8gRXhwb3NlIHRoZSBtb2R1bGUuXG4vL1xuZXhwb3J0cy5zdHJpbmdpZnkgPSBxdWVyeXN0cmluZ2lmeTtcbmV4cG9ydHMucGFyc2UgPSBxdWVyeXN0cmluZztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDaGVjayBpZiB3ZSdyZSByZXF1aXJlZCB0byBhZGQgYSBwb3J0IG51bWJlci5cbiAqXG4gKiBAc2VlIGh0dHBzOi8vdXJsLnNwZWMud2hhdHdnLm9yZy8jZGVmYXVsdC1wb3J0XG4gKiBAcGFyYW0ge051bWJlcnxTdHJpbmd9IHBvcnQgUG9ydCBudW1iZXIgd2UgbmVlZCB0byBjaGVja1xuICogQHBhcmFtIHtTdHJpbmd9IHByb3RvY29sIFByb3RvY29sIHdlIG5lZWQgdG8gY2hlY2sgYWdhaW5zdC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBJcyBpdCBhIGRlZmF1bHQgcG9ydCBmb3IgdGhlIGdpdmVuIHByb3RvY29sXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiByZXF1aXJlZChwb3J0LCBwcm90b2NvbCkge1xuICBwcm90b2NvbCA9IHByb3RvY29sLnNwbGl0KCc6JylbMF07XG4gIHBvcnQgPSArcG9ydDtcblxuICBpZiAoIXBvcnQpIHJldHVybiBmYWxzZTtcblxuICBzd2l0Y2ggKHByb3RvY29sKSB7XG4gICAgY2FzZSAnaHR0cCc6XG4gICAgY2FzZSAnd3MnOlxuICAgIHJldHVybiBwb3J0ICE9PSA4MDtcblxuICAgIGNhc2UgJ2h0dHBzJzpcbiAgICBjYXNlICd3c3MnOlxuICAgIHJldHVybiBwb3J0ICE9PSA0NDM7XG5cbiAgICBjYXNlICdmdHAnOlxuICAgIHJldHVybiBwb3J0ICE9PSAyMTtcblxuICAgIGNhc2UgJ2dvcGhlcic6XG4gICAgcmV0dXJuIHBvcnQgIT09IDcwO1xuXG4gICAgY2FzZSAnZmlsZSc6XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHBvcnQgIT09IDA7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdHJhbnNwb3J0TGlzdCA9IHJlcXVpcmUoJy4vdHJhbnNwb3J0LWxpc3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL21haW4nKSh0cmFuc3BvcnRMaXN0KTtcblxuLy8gVE9ETyBjYW4ndCBnZXQgcmlkIG9mIHRoaXMgdW50aWwgYWxsIHNlcnZlcnMgZG9cbmlmICgnX3NvY2tqc19vbmxvYWQnIGluIGdsb2JhbCkge1xuICBzZXRUaW1lb3V0KGdsb2JhbC5fc29ja2pzX29ubG9hZCwgMSk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJylcbiAgLCBFdmVudCA9IHJlcXVpcmUoJy4vZXZlbnQnKVxuICA7XG5cbmZ1bmN0aW9uIENsb3NlRXZlbnQoKSB7XG4gIEV2ZW50LmNhbGwodGhpcyk7XG4gIHRoaXMuaW5pdEV2ZW50KCdjbG9zZScsIGZhbHNlLCBmYWxzZSk7XG4gIHRoaXMud2FzQ2xlYW4gPSBmYWxzZTtcbiAgdGhpcy5jb2RlID0gMDtcbiAgdGhpcy5yZWFzb24gPSAnJztcbn1cblxuaW5oZXJpdHMoQ2xvc2VFdmVudCwgRXZlbnQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENsb3NlRXZlbnQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJylcbiAgLCBFdmVudFRhcmdldCA9IHJlcXVpcmUoJy4vZXZlbnR0YXJnZXQnKVxuICA7XG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgRXZlbnRUYXJnZXQuY2FsbCh0aGlzKTtcbn1cblxuaW5oZXJpdHMoRXZlbnRFbWl0dGVyLCBFdmVudFRhcmdldCk7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICBpZiAodHlwZSkge1xuICAgIGRlbGV0ZSB0aGlzLl9saXN0ZW5lcnNbdHlwZV07XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzID0ge307XG4gIH1cbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBzZWxmID0gdGhpc1xuICAgICwgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHNlbGYucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIHRoaXMub24odHlwZSwgZyk7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHR5cGUgPSBhcmd1bWVudHNbMF07XG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnNbdHlwZV07XG4gIGlmICghbGlzdGVuZXJzKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIGVxdWl2YWxlbnQgb2YgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgdmFyIGwgPSBhcmd1bWVudHMubGVuZ3RoO1xuICB2YXIgYXJncyA9IG5ldyBBcnJheShsIC0gMSk7XG4gIGZvciAodmFyIGFpID0gMTsgYWkgPCBsOyBhaSsrKSB7XG4gICAgYXJnc1thaSAtIDFdID0gYXJndW1lbnRzW2FpXTtcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3RlbmVycy5sZW5ndGg7IGkrKykge1xuICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBFdmVudFRhcmdldC5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lcjtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBFdmVudFRhcmdldC5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lcjtcblxubW9kdWxlLmV4cG9ydHMuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBFdmVudChldmVudFR5cGUpIHtcbiAgdGhpcy50eXBlID0gZXZlbnRUeXBlO1xufVxuXG5FdmVudC5wcm90b3R5cGUuaW5pdEV2ZW50ID0gZnVuY3Rpb24oZXZlbnRUeXBlLCBjYW5CdWJibGUsIGNhbmNlbGFibGUpIHtcbiAgdGhpcy50eXBlID0gZXZlbnRUeXBlO1xuICB0aGlzLmJ1YmJsZXMgPSBjYW5CdWJibGU7XG4gIHRoaXMuY2FuY2VsYWJsZSA9IGNhbmNlbGFibGU7XG4gIHRoaXMudGltZVN0YW1wID0gK25ldyBEYXRlKCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnQucHJvdG90eXBlLnN0b3BQcm9wYWdhdGlvbiA9IGZ1bmN0aW9uKCkge307XG5FdmVudC5wcm90b3R5cGUucHJldmVudERlZmF1bHQgPSBmdW5jdGlvbigpIHt9O1xuXG5FdmVudC5DQVBUVVJJTkdfUEhBU0UgPSAxO1xuRXZlbnQuQVRfVEFSR0VUID0gMjtcbkV2ZW50LkJVQkJMSU5HX1BIQVNFID0gMztcblxubW9kdWxlLmV4cG9ydHMgPSBFdmVudDtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyogU2ltcGxpZmllZCBpbXBsZW1lbnRhdGlvbiBvZiBET00yIEV2ZW50VGFyZ2V0LlxuICogICBodHRwOi8vd3d3LnczLm9yZy9UUi9ET00tTGV2ZWwtMi1FdmVudHMvZXZlbnRzLmh0bWwjRXZlbnRzLUV2ZW50VGFyZ2V0XG4gKi9cblxuZnVuY3Rpb24gRXZlbnRUYXJnZXQoKSB7XG4gIHRoaXMuX2xpc3RlbmVycyA9IHt9O1xufVxuXG5FdmVudFRhcmdldC5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50VHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCEoZXZlbnRUeXBlIGluIHRoaXMuX2xpc3RlbmVycykpIHtcbiAgICB0aGlzLl9saXN0ZW5lcnNbZXZlbnRUeXBlXSA9IFtdO1xuICB9XG4gIHZhciBhcnIgPSB0aGlzLl9saXN0ZW5lcnNbZXZlbnRUeXBlXTtcbiAgLy8gIzRcbiAgaWYgKGFyci5pbmRleE9mKGxpc3RlbmVyKSA9PT0gLTEpIHtcbiAgICAvLyBNYWtlIGEgY29weSBzbyBhcyBub3QgdG8gaW50ZXJmZXJlIHdpdGggYSBjdXJyZW50IGRpc3BhdGNoRXZlbnQuXG4gICAgYXJyID0gYXJyLmNvbmNhdChbbGlzdGVuZXJdKTtcbiAgfVxuICB0aGlzLl9saXN0ZW5lcnNbZXZlbnRUeXBlXSA9IGFycjtcbn07XG5cbkV2ZW50VGFyZ2V0LnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnRUeXBlLCBsaXN0ZW5lcikge1xuICB2YXIgYXJyID0gdGhpcy5fbGlzdGVuZXJzW2V2ZW50VHlwZV07XG4gIGlmICghYXJyKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBpZHggPSBhcnIuaW5kZXhPZihsaXN0ZW5lcik7XG4gIGlmIChpZHggIT09IC0xKSB7XG4gICAgaWYgKGFyci5sZW5ndGggPiAxKSB7XG4gICAgICAvLyBNYWtlIGEgY29weSBzbyBhcyBub3QgdG8gaW50ZXJmZXJlIHdpdGggYSBjdXJyZW50IGRpc3BhdGNoRXZlbnQuXG4gICAgICB0aGlzLl9saXN0ZW5lcnNbZXZlbnRUeXBlXSA9IGFyci5zbGljZSgwLCBpZHgpLmNvbmNhdChhcnIuc2xpY2UoaWR4ICsgMSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgdGhpcy5fbGlzdGVuZXJzW2V2ZW50VHlwZV07XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxufTtcblxuRXZlbnRUYXJnZXQucHJvdG90eXBlLmRpc3BhdGNoRXZlbnQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGV2ZW50ID0gYXJndW1lbnRzWzBdO1xuICB2YXIgdCA9IGV2ZW50LnR5cGU7XG4gIC8vIGVxdWl2YWxlbnQgb2YgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHMubGVuZ3RoID09PSAxID8gW2V2ZW50XSA6IEFycmF5LmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gIC8vIFRPRE86IFRoaXMgZG9lc24ndCBtYXRjaCB0aGUgcmVhbCBiZWhhdmlvcjsgcGVyIHNwZWMsIG9uZm9vIGdldFxuICAvLyB0aGVpciBwbGFjZSBpbiBsaW5lIGZyb20gdGhlIC9maXJzdC8gdGltZSB0aGV5J3JlIHNldCBmcm9tXG4gIC8vIG5vbi1udWxsLiBBbHRob3VnaCBXZWJLaXQgYnVtcHMgaXQgdG8gdGhlIGVuZCBldmVyeSB0aW1lIGl0J3NcbiAgLy8gc2V0LlxuICBpZiAodGhpc1snb24nICsgdF0pIHtcbiAgICB0aGlzWydvbicgKyB0XS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuICBpZiAodCBpbiB0aGlzLl9saXN0ZW5lcnMpIHtcbiAgICAvLyBHcmFiIGEgcmVmZXJlbmNlIHRvIHRoZSBsaXN0ZW5lcnMgbGlzdC4gcmVtb3ZlRXZlbnRMaXN0ZW5lciBtYXkgYWx0ZXIgdGhlIGxpc3QuXG4gICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVyc1t0XTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3RlbmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBFdmVudFRhcmdldDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKVxuICAsIEV2ZW50ID0gcmVxdWlyZSgnLi9ldmVudCcpXG4gIDtcblxuZnVuY3Rpb24gVHJhbnNwb3J0TWVzc2FnZUV2ZW50KGRhdGEpIHtcbiAgRXZlbnQuY2FsbCh0aGlzKTtcbiAgdGhpcy5pbml0RXZlbnQoJ21lc3NhZ2UnLCBmYWxzZSwgZmFsc2UpO1xuICB0aGlzLmRhdGEgPSBkYXRhO1xufVxuXG5pbmhlcml0cyhUcmFuc3BvcnRNZXNzYWdlRXZlbnQsIEV2ZW50KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUcmFuc3BvcnRNZXNzYWdlRXZlbnQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBKU09OMyA9IHJlcXVpcmUoJ2pzb24zJylcbiAgLCBpZnJhbWVVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMvaWZyYW1lJylcbiAgO1xuXG5mdW5jdGlvbiBGYWNhZGVKUyh0cmFuc3BvcnQpIHtcbiAgdGhpcy5fdHJhbnNwb3J0ID0gdHJhbnNwb3J0O1xuICB0cmFuc3BvcnQub24oJ21lc3NhZ2UnLCB0aGlzLl90cmFuc3BvcnRNZXNzYWdlLmJpbmQodGhpcykpO1xuICB0cmFuc3BvcnQub24oJ2Nsb3NlJywgdGhpcy5fdHJhbnNwb3J0Q2xvc2UuYmluZCh0aGlzKSk7XG59XG5cbkZhY2FkZUpTLnByb3RvdHlwZS5fdHJhbnNwb3J0Q2xvc2UgPSBmdW5jdGlvbihjb2RlLCByZWFzb24pIHtcbiAgaWZyYW1lVXRpbHMucG9zdE1lc3NhZ2UoJ2MnLCBKU09OMy5zdHJpbmdpZnkoW2NvZGUsIHJlYXNvbl0pKTtcbn07XG5GYWNhZGVKUy5wcm90b3R5cGUuX3RyYW5zcG9ydE1lc3NhZ2UgPSBmdW5jdGlvbihmcmFtZSkge1xuICBpZnJhbWVVdGlscy5wb3N0TWVzc2FnZSgndCcsIGZyYW1lKTtcbn07XG5GYWNhZGVKUy5wcm90b3R5cGUuX3NlbmQgPSBmdW5jdGlvbihkYXRhKSB7XG4gIHRoaXMuX3RyYW5zcG9ydC5zZW5kKGRhdGEpO1xufTtcbkZhY2FkZUpTLnByb3RvdHlwZS5fY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fdHJhbnNwb3J0LmNsb3NlKCk7XG4gIHRoaXMuX3RyYW5zcG9ydC5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRmFjYWRlSlM7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1cmxVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMvdXJsJylcbiAgLCBldmVudFV0aWxzID0gcmVxdWlyZSgnLi91dGlscy9ldmVudCcpXG4gICwgSlNPTjMgPSByZXF1aXJlKCdqc29uMycpXG4gICwgRmFjYWRlSlMgPSByZXF1aXJlKCcuL2ZhY2FkZScpXG4gICwgSW5mb0lmcmFtZVJlY2VpdmVyID0gcmVxdWlyZSgnLi9pbmZvLWlmcmFtZS1yZWNlaXZlcicpXG4gICwgaWZyYW1lVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzL2lmcmFtZScpXG4gICwgbG9jID0gcmVxdWlyZSgnLi9sb2NhdGlvbicpXG4gIDtcblxudmFyIGRlYnVnID0gZnVuY3Rpb24oKSB7fTtcbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnc29ja2pzLWNsaWVudDppZnJhbWUtYm9vdHN0cmFwJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oU29ja0pTLCBhdmFpbGFibGVUcmFuc3BvcnRzKSB7XG4gIHZhciB0cmFuc3BvcnRNYXAgPSB7fTtcbiAgYXZhaWxhYmxlVHJhbnNwb3J0cy5mb3JFYWNoKGZ1bmN0aW9uKGF0KSB7XG4gICAgaWYgKGF0LmZhY2FkZVRyYW5zcG9ydCkge1xuICAgICAgdHJhbnNwb3J0TWFwW2F0LmZhY2FkZVRyYW5zcG9ydC50cmFuc3BvcnROYW1lXSA9IGF0LmZhY2FkZVRyYW5zcG9ydDtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIGhhcmQtY29kZWQgZm9yIHRoZSBpbmZvIGlmcmFtZVxuICAvLyBUT0RPIHNlZSBpZiB3ZSBjYW4gbWFrZSB0aGlzIG1vcmUgZHluYW1pY1xuICB0cmFuc3BvcnRNYXBbSW5mb0lmcmFtZVJlY2VpdmVyLnRyYW5zcG9ydE5hbWVdID0gSW5mb0lmcmFtZVJlY2VpdmVyO1xuICB2YXIgcGFyZW50T3JpZ2luO1xuXG4gIC8qIGVzbGludC1kaXNhYmxlIGNhbWVsY2FzZSAqL1xuICBTb2NrSlMuYm9vdHN0cmFwX2lmcmFtZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8qIGVzbGludC1lbmFibGUgY2FtZWxjYXNlICovXG4gICAgdmFyIGZhY2FkZTtcbiAgICBpZnJhbWVVdGlscy5jdXJyZW50V2luZG93SWQgPSBsb2MuaGFzaC5zbGljZSgxKTtcbiAgICB2YXIgb25NZXNzYWdlID0gZnVuY3Rpb24oZSkge1xuICAgICAgaWYgKGUuc291cmNlICE9PSBwYXJlbnQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBwYXJlbnRPcmlnaW4gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHBhcmVudE9yaWdpbiA9IGUub3JpZ2luO1xuICAgICAgfVxuICAgICAgaWYgKGUub3JpZ2luICE9PSBwYXJlbnRPcmlnaW4pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgaWZyYW1lTWVzc2FnZTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmcmFtZU1lc3NhZ2UgPSBKU09OMy5wYXJzZShlLmRhdGEpO1xuICAgICAgfSBjYXRjaCAoaWdub3JlZCkge1xuICAgICAgICBkZWJ1ZygnYmFkIGpzb24nLCBlLmRhdGEpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChpZnJhbWVNZXNzYWdlLndpbmRvd0lkICE9PSBpZnJhbWVVdGlscy5jdXJyZW50V2luZG93SWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgc3dpdGNoIChpZnJhbWVNZXNzYWdlLnR5cGUpIHtcbiAgICAgIGNhc2UgJ3MnOlxuICAgICAgICB2YXIgcDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBwID0gSlNPTjMucGFyc2UoaWZyYW1lTWVzc2FnZS5kYXRhKTtcbiAgICAgICAgfSBjYXRjaCAoaWdub3JlZCkge1xuICAgICAgICAgIGRlYnVnKCdiYWQganNvbicsIGlmcmFtZU1lc3NhZ2UuZGF0YSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHZlcnNpb24gPSBwWzBdO1xuICAgICAgICB2YXIgdHJhbnNwb3J0ID0gcFsxXTtcbiAgICAgICAgdmFyIHRyYW5zVXJsID0gcFsyXTtcbiAgICAgICAgdmFyIGJhc2VVcmwgPSBwWzNdO1xuICAgICAgICBkZWJ1Zyh2ZXJzaW9uLCB0cmFuc3BvcnQsIHRyYW5zVXJsLCBiYXNlVXJsKTtcbiAgICAgICAgLy8gY2hhbmdlIHRoaXMgdG8gc2VtdmVyIGxvZ2ljXG4gICAgICAgIGlmICh2ZXJzaW9uICE9PSBTb2NrSlMudmVyc2lvbikge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW5jb21wYXRpYmxlIFNvY2tKUyEgTWFpbiBzaXRlIHVzZXM6JyArXG4gICAgICAgICAgICAgICAgICAgICcgXCInICsgdmVyc2lvbiArICdcIiwgdGhlIGlmcmFtZTonICtcbiAgICAgICAgICAgICAgICAgICAgJyBcIicgKyBTb2NrSlMudmVyc2lvbiArICdcIi4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdXJsVXRpbHMuaXNPcmlnaW5FcXVhbCh0cmFuc1VybCwgbG9jLmhyZWYpIHx8XG4gICAgICAgICAgICAhdXJsVXRpbHMuaXNPcmlnaW5FcXVhbChiYXNlVXJsLCBsb2MuaHJlZikpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhblxcJ3QgY29ubmVjdCB0byBkaWZmZXJlbnQgZG9tYWluIGZyb20gd2l0aGluIGFuICcgK1xuICAgICAgICAgICAgICAgICAgICAnaWZyYW1lLiAoJyArIGxvYy5ocmVmICsgJywgJyArIHRyYW5zVXJsICsgJywgJyArIGJhc2VVcmwgKyAnKScpO1xuICAgICAgICB9XG4gICAgICAgIGZhY2FkZSA9IG5ldyBGYWNhZGVKUyhuZXcgdHJhbnNwb3J0TWFwW3RyYW5zcG9ydF0odHJhbnNVcmwsIGJhc2VVcmwpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdtJzpcbiAgICAgICAgZmFjYWRlLl9zZW5kKGlmcmFtZU1lc3NhZ2UuZGF0YSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnYyc6XG4gICAgICAgIGlmIChmYWNhZGUpIHtcbiAgICAgICAgICBmYWNhZGUuX2Nsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgICAgZmFjYWRlID0gbnVsbDtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGV2ZW50VXRpbHMuYXR0YWNoRXZlbnQoJ21lc3NhZ2UnLCBvbk1lc3NhZ2UpO1xuXG4gICAgLy8gU3RhcnRcbiAgICBpZnJhbWVVdGlscy5wb3N0TWVzc2FnZSgncycpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlclxuICAsIGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKVxuICAsIEpTT04zID0gcmVxdWlyZSgnanNvbjMnKVxuICAsIG9iamVjdFV0aWxzID0gcmVxdWlyZSgnLi91dGlscy9vYmplY3QnKVxuICA7XG5cbnZhciBkZWJ1ZyA9IGZ1bmN0aW9uKCkge307XG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ3NvY2tqcy1jbGllbnQ6aW5mby1hamF4Jyk7XG59XG5cbmZ1bmN0aW9uIEluZm9BamF4KHVybCwgQWpheE9iamVjdCkge1xuICBFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHZhciB0MCA9ICtuZXcgRGF0ZSgpO1xuICB0aGlzLnhvID0gbmV3IEFqYXhPYmplY3QoJ0dFVCcsIHVybCk7XG5cbiAgdGhpcy54by5vbmNlKCdmaW5pc2gnLCBmdW5jdGlvbihzdGF0dXMsIHRleHQpIHtcbiAgICB2YXIgaW5mbywgcnR0O1xuICAgIGlmIChzdGF0dXMgPT09IDIwMCkge1xuICAgICAgcnR0ID0gKCtuZXcgRGF0ZSgpKSAtIHQwO1xuICAgICAgaWYgKHRleHQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpbmZvID0gSlNPTjMucGFyc2UodGV4dCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBkZWJ1ZygnYmFkIGpzb24nLCB0ZXh0KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIW9iamVjdFV0aWxzLmlzT2JqZWN0KGluZm8pKSB7XG4gICAgICAgIGluZm8gPSB7fTtcbiAgICAgIH1cbiAgICB9XG4gICAgc2VsZi5lbWl0KCdmaW5pc2gnLCBpbmZvLCBydHQpO1xuICAgIHNlbGYucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG4gIH0pO1xufVxuXG5pbmhlcml0cyhJbmZvQWpheCwgRXZlbnRFbWl0dGVyKTtcblxuSW5mb0FqYXgucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG4gIHRoaXMueG8uY2xvc2UoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW5mb0FqYXg7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJylcbiAgLCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXJcbiAgLCBKU09OMyA9IHJlcXVpcmUoJ2pzb24zJylcbiAgLCBYSFJMb2NhbE9iamVjdCA9IHJlcXVpcmUoJy4vdHJhbnNwb3J0L3NlbmRlci94aHItbG9jYWwnKVxuICAsIEluZm9BamF4ID0gcmVxdWlyZSgnLi9pbmZvLWFqYXgnKVxuICA7XG5cbmZ1bmN0aW9uIEluZm9SZWNlaXZlcklmcmFtZSh0cmFuc1VybCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXG4gIHRoaXMuaXIgPSBuZXcgSW5mb0FqYXgodHJhbnNVcmwsIFhIUkxvY2FsT2JqZWN0KTtcbiAgdGhpcy5pci5vbmNlKCdmaW5pc2gnLCBmdW5jdGlvbihpbmZvLCBydHQpIHtcbiAgICBzZWxmLmlyID0gbnVsbDtcbiAgICBzZWxmLmVtaXQoJ21lc3NhZ2UnLCBKU09OMy5zdHJpbmdpZnkoW2luZm8sIHJ0dF0pKTtcbiAgfSk7XG59XG5cbmluaGVyaXRzKEluZm9SZWNlaXZlcklmcmFtZSwgRXZlbnRFbWl0dGVyKTtcblxuSW5mb1JlY2VpdmVySWZyYW1lLnRyYW5zcG9ydE5hbWUgPSAnaWZyYW1lLWluZm8tcmVjZWl2ZXInO1xuXG5JbmZvUmVjZWl2ZXJJZnJhbWUucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLmlyKSB7XG4gICAgdGhpcy5pci5jbG9zZSgpO1xuICAgIHRoaXMuaXIgPSBudWxsO1xuICB9XG4gIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEluZm9SZWNlaXZlcklmcmFtZTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlclxuICAsIGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKVxuICAsIEpTT04zID0gcmVxdWlyZSgnanNvbjMnKVxuICAsIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscy9ldmVudCcpXG4gICwgSWZyYW1lVHJhbnNwb3J0ID0gcmVxdWlyZSgnLi90cmFuc3BvcnQvaWZyYW1lJylcbiAgLCBJbmZvUmVjZWl2ZXJJZnJhbWUgPSByZXF1aXJlKCcuL2luZm8taWZyYW1lLXJlY2VpdmVyJylcbiAgO1xuXG52YXIgZGVidWcgPSBmdW5jdGlvbigpIHt9O1xuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCdzb2NranMtY2xpZW50OmluZm8taWZyYW1lJyk7XG59XG5cbmZ1bmN0aW9uIEluZm9JZnJhbWUoYmFzZVVybCwgdXJsKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgRXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG5cbiAgdmFyIGdvID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGlmciA9IHNlbGYuaWZyID0gbmV3IElmcmFtZVRyYW5zcG9ydChJbmZvUmVjZWl2ZXJJZnJhbWUudHJhbnNwb3J0TmFtZSwgdXJsLCBiYXNlVXJsKTtcblxuICAgIGlmci5vbmNlKCdtZXNzYWdlJywgZnVuY3Rpb24obXNnKSB7XG4gICAgICBpZiAobXNnKSB7XG4gICAgICAgIHZhciBkO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGQgPSBKU09OMy5wYXJzZShtc2cpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgZGVidWcoJ2JhZCBqc29uJywgbXNnKTtcbiAgICAgICAgICBzZWxmLmVtaXQoJ2ZpbmlzaCcpO1xuICAgICAgICAgIHNlbGYuY2xvc2UoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaW5mbyA9IGRbMF0sIHJ0dCA9IGRbMV07XG4gICAgICAgIHNlbGYuZW1pdCgnZmluaXNoJywgaW5mbywgcnR0KTtcbiAgICAgIH1cbiAgICAgIHNlbGYuY2xvc2UoKTtcbiAgICB9KTtcblxuICAgIGlmci5vbmNlKCdjbG9zZScsIGZ1bmN0aW9uKCkge1xuICAgICAgc2VsZi5lbWl0KCdmaW5pc2gnKTtcbiAgICAgIHNlbGYuY2xvc2UoKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBUT0RPIHRoaXMgc2VlbXMgdGhlIHNhbWUgYXMgdGhlICduZWVkQm9keScgZnJvbSB0cmFuc3BvcnRzXG4gIGlmICghZ2xvYmFsLmRvY3VtZW50LmJvZHkpIHtcbiAgICB1dGlscy5hdHRhY2hFdmVudCgnbG9hZCcsIGdvKTtcbiAgfSBlbHNlIHtcbiAgICBnbygpO1xuICB9XG59XG5cbmluaGVyaXRzKEluZm9JZnJhbWUsIEV2ZW50RW1pdHRlcik7XG5cbkluZm9JZnJhbWUuZW5hYmxlZCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gSWZyYW1lVHJhbnNwb3J0LmVuYWJsZWQoKTtcbn07XG5cbkluZm9JZnJhbWUucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLmlmcikge1xuICAgIHRoaXMuaWZyLmNsb3NlKCk7XG4gIH1cbiAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbiAgdGhpcy5pZnIgPSBudWxsO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbmZvSWZyYW1lO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyXG4gICwgaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpXG4gICwgdXJsVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzL3VybCcpXG4gICwgWERSID0gcmVxdWlyZSgnLi90cmFuc3BvcnQvc2VuZGVyL3hkcicpXG4gICwgWEhSQ29ycyA9IHJlcXVpcmUoJy4vdHJhbnNwb3J0L3NlbmRlci94aHItY29ycycpXG4gICwgWEhSTG9jYWwgPSByZXF1aXJlKCcuL3RyYW5zcG9ydC9zZW5kZXIveGhyLWxvY2FsJylcbiAgLCBYSFJGYWtlID0gcmVxdWlyZSgnLi90cmFuc3BvcnQvc2VuZGVyL3hoci1mYWtlJylcbiAgLCBJbmZvSWZyYW1lID0gcmVxdWlyZSgnLi9pbmZvLWlmcmFtZScpXG4gICwgSW5mb0FqYXggPSByZXF1aXJlKCcuL2luZm8tYWpheCcpXG4gIDtcblxudmFyIGRlYnVnID0gZnVuY3Rpb24oKSB7fTtcbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnc29ja2pzLWNsaWVudDppbmZvLXJlY2VpdmVyJyk7XG59XG5cbmZ1bmN0aW9uIEluZm9SZWNlaXZlcihiYXNlVXJsLCB1cmxJbmZvKSB7XG4gIGRlYnVnKGJhc2VVcmwpO1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgc2VsZi5kb1hocihiYXNlVXJsLCB1cmxJbmZvKTtcbiAgfSwgMCk7XG59XG5cbmluaGVyaXRzKEluZm9SZWNlaXZlciwgRXZlbnRFbWl0dGVyKTtcblxuLy8gVE9ETyB0aGlzIGlzIGN1cnJlbnRseSBpZ25vcmluZyB0aGUgbGlzdCBvZiBhdmFpbGFibGUgdHJhbnNwb3J0cyBhbmQgdGhlIHdoaXRlbGlzdFxuXG5JbmZvUmVjZWl2ZXIuX2dldFJlY2VpdmVyID0gZnVuY3Rpb24oYmFzZVVybCwgdXJsLCB1cmxJbmZvKSB7XG4gIC8vIGRldGVybWluZSBtZXRob2Qgb2YgQ09SUyBzdXBwb3J0IChpZiBuZWVkZWQpXG4gIGlmICh1cmxJbmZvLnNhbWVPcmlnaW4pIHtcbiAgICByZXR1cm4gbmV3IEluZm9BamF4KHVybCwgWEhSTG9jYWwpO1xuICB9XG4gIGlmIChYSFJDb3JzLmVuYWJsZWQpIHtcbiAgICByZXR1cm4gbmV3IEluZm9BamF4KHVybCwgWEhSQ29ycyk7XG4gIH1cbiAgaWYgKFhEUi5lbmFibGVkICYmIHVybEluZm8uc2FtZVNjaGVtZSkge1xuICAgIHJldHVybiBuZXcgSW5mb0FqYXgodXJsLCBYRFIpO1xuICB9XG4gIGlmIChJbmZvSWZyYW1lLmVuYWJsZWQoKSkge1xuICAgIHJldHVybiBuZXcgSW5mb0lmcmFtZShiYXNlVXJsLCB1cmwpO1xuICB9XG4gIHJldHVybiBuZXcgSW5mb0FqYXgodXJsLCBYSFJGYWtlKTtcbn07XG5cbkluZm9SZWNlaXZlci5wcm90b3R5cGUuZG9YaHIgPSBmdW5jdGlvbihiYXNlVXJsLCB1cmxJbmZvKSB7XG4gIHZhciBzZWxmID0gdGhpc1xuICAgICwgdXJsID0gdXJsVXRpbHMuYWRkUGF0aChiYXNlVXJsLCAnL2luZm8nKVxuICAgIDtcbiAgZGVidWcoJ2RvWGhyJywgdXJsKTtcblxuICB0aGlzLnhvID0gSW5mb1JlY2VpdmVyLl9nZXRSZWNlaXZlcihiYXNlVXJsLCB1cmwsIHVybEluZm8pO1xuXG4gIHRoaXMudGltZW91dFJlZiA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgZGVidWcoJ3RpbWVvdXQnKTtcbiAgICBzZWxmLl9jbGVhbnVwKGZhbHNlKTtcbiAgICBzZWxmLmVtaXQoJ2ZpbmlzaCcpO1xuICB9LCBJbmZvUmVjZWl2ZXIudGltZW91dCk7XG5cbiAgdGhpcy54by5vbmNlKCdmaW5pc2gnLCBmdW5jdGlvbihpbmZvLCBydHQpIHtcbiAgICBkZWJ1ZygnZmluaXNoJywgaW5mbywgcnR0KTtcbiAgICBzZWxmLl9jbGVhbnVwKHRydWUpO1xuICAgIHNlbGYuZW1pdCgnZmluaXNoJywgaW5mbywgcnR0KTtcbiAgfSk7XG59O1xuXG5JbmZvUmVjZWl2ZXIucHJvdG90eXBlLl9jbGVhbnVwID0gZnVuY3Rpb24od2FzQ2xlYW4pIHtcbiAgZGVidWcoJ19jbGVhbnVwJyk7XG4gIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXRSZWYpO1xuICB0aGlzLnRpbWVvdXRSZWYgPSBudWxsO1xuICBpZiAoIXdhc0NsZWFuICYmIHRoaXMueG8pIHtcbiAgICB0aGlzLnhvLmNsb3NlKCk7XG4gIH1cbiAgdGhpcy54byA9IG51bGw7XG59O1xuXG5JbmZvUmVjZWl2ZXIucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gIGRlYnVnKCdjbG9zZScpO1xuICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICB0aGlzLl9jbGVhbnVwKGZhbHNlKTtcbn07XG5cbkluZm9SZWNlaXZlci50aW1lb3V0ID0gODAwMDtcblxubW9kdWxlLmV4cG9ydHMgPSBJbmZvUmVjZWl2ZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZ2xvYmFsLmxvY2F0aW9uIHx8IHtcbiAgb3JpZ2luOiAnaHR0cDovL2xvY2FsaG9zdDo4MCdcbiwgcHJvdG9jb2w6ICdodHRwOidcbiwgaG9zdDogJ2xvY2FsaG9zdCdcbiwgcG9ydDogODBcbiwgaHJlZjogJ2h0dHA6Ly9sb2NhbGhvc3QvJ1xuLCBoYXNoOiAnJ1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxucmVxdWlyZSgnLi9zaGltcycpO1xuXG52YXIgVVJMID0gcmVxdWlyZSgndXJsLXBhcnNlJylcbiAgLCBpbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJylcbiAgLCBKU09OMyA9IHJlcXVpcmUoJ2pzb24zJylcbiAgLCByYW5kb20gPSByZXF1aXJlKCcuL3V0aWxzL3JhbmRvbScpXG4gICwgZXNjYXBlID0gcmVxdWlyZSgnLi91dGlscy9lc2NhcGUnKVxuICAsIHVybFV0aWxzID0gcmVxdWlyZSgnLi91dGlscy91cmwnKVxuICAsIGV2ZW50VXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzL2V2ZW50JylcbiAgLCB0cmFuc3BvcnQgPSByZXF1aXJlKCcuL3V0aWxzL3RyYW5zcG9ydCcpXG4gICwgb2JqZWN0VXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzL29iamVjdCcpXG4gICwgYnJvd3NlciA9IHJlcXVpcmUoJy4vdXRpbHMvYnJvd3NlcicpXG4gICwgbG9nID0gcmVxdWlyZSgnLi91dGlscy9sb2cnKVxuICAsIEV2ZW50ID0gcmVxdWlyZSgnLi9ldmVudC9ldmVudCcpXG4gICwgRXZlbnRUYXJnZXQgPSByZXF1aXJlKCcuL2V2ZW50L2V2ZW50dGFyZ2V0JylcbiAgLCBsb2MgPSByZXF1aXJlKCcuL2xvY2F0aW9uJylcbiAgLCBDbG9zZUV2ZW50ID0gcmVxdWlyZSgnLi9ldmVudC9jbG9zZScpXG4gICwgVHJhbnNwb3J0TWVzc2FnZUV2ZW50ID0gcmVxdWlyZSgnLi9ldmVudC90cmFucy1tZXNzYWdlJylcbiAgLCBJbmZvUmVjZWl2ZXIgPSByZXF1aXJlKCcuL2luZm8tcmVjZWl2ZXInKVxuICA7XG5cbnZhciBkZWJ1ZyA9IGZ1bmN0aW9uKCkge307XG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ3NvY2tqcy1jbGllbnQ6bWFpbicpO1xufVxuXG52YXIgdHJhbnNwb3J0cztcblxuLy8gZm9sbG93IGNvbnN0cnVjdG9yIHN0ZXBzIGRlZmluZWQgYXQgaHR0cDovL2Rldi53My5vcmcvaHRtbDUvd2Vic29ja2V0cy8jdGhlLXdlYnNvY2tldC1pbnRlcmZhY2VcbmZ1bmN0aW9uIFNvY2tKUyh1cmwsIHByb3RvY29scywgb3B0aW9ucykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgU29ja0pTKSkge1xuICAgIHJldHVybiBuZXcgU29ja0pTKHVybCwgcHJvdG9jb2xzLCBvcHRpb25zKTtcbiAgfVxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDEpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRmFpbGVkIHRvIGNvbnN0cnVjdCAnU29ja0pTOiAxIGFyZ3VtZW50IHJlcXVpcmVkLCBidXQgb25seSAwIHByZXNlbnRcIik7XG4gIH1cbiAgRXZlbnRUYXJnZXQuY2FsbCh0aGlzKTtcblxuICB0aGlzLnJlYWR5U3RhdGUgPSBTb2NrSlMuQ09OTkVDVElORztcbiAgdGhpcy5leHRlbnNpb25zID0gJyc7XG4gIHRoaXMucHJvdG9jb2wgPSAnJztcblxuICAvLyBub24tc3RhbmRhcmQgZXh0ZW5zaW9uXG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBpZiAob3B0aW9ucy5wcm90b2NvbHNfd2hpdGVsaXN0KSB7XG4gICAgbG9nLndhcm4oXCIncHJvdG9jb2xzX3doaXRlbGlzdCcgaXMgREVQUkVDQVRFRC4gVXNlICd0cmFuc3BvcnRzJyBpbnN0ZWFkLlwiKTtcbiAgfVxuICB0aGlzLl90cmFuc3BvcnRzV2hpdGVsaXN0ID0gb3B0aW9ucy50cmFuc3BvcnRzO1xuICB0aGlzLl90cmFuc3BvcnRPcHRpb25zID0gb3B0aW9ucy50cmFuc3BvcnRPcHRpb25zIHx8IHt9O1xuICB0aGlzLl90aW1lb3V0ID0gb3B0aW9ucy50aW1lb3V0IHx8IDA7XG5cbiAgdmFyIHNlc3Npb25JZCA9IG9wdGlvbnMuc2Vzc2lvbklkIHx8IDg7XG4gIGlmICh0eXBlb2Ygc2Vzc2lvbklkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhpcy5fZ2VuZXJhdGVTZXNzaW9uSWQgPSBzZXNzaW9uSWQ7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHNlc3Npb25JZCA9PT0gJ251bWJlcicpIHtcbiAgICB0aGlzLl9nZW5lcmF0ZVNlc3Npb25JZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHJhbmRvbS5zdHJpbmcoc2Vzc2lvbklkKTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0lmIHNlc3Npb25JZCBpcyB1c2VkIGluIHRoZSBvcHRpb25zLCBpdCBuZWVkcyB0byBiZSBhIG51bWJlciBvciBhIGZ1bmN0aW9uLicpO1xuICB9XG5cbiAgdGhpcy5fc2VydmVyID0gb3B0aW9ucy5zZXJ2ZXIgfHwgcmFuZG9tLm51bWJlclN0cmluZygxMDAwKTtcblxuICAvLyBTdGVwIDEgb2YgV1Mgc3BlYyAtIHBhcnNlIGFuZCB2YWxpZGF0ZSB0aGUgdXJsLiBJc3N1ZSAjOFxuICB2YXIgcGFyc2VkVXJsID0gbmV3IFVSTCh1cmwpO1xuICBpZiAoIXBhcnNlZFVybC5ob3N0IHx8ICFwYXJzZWRVcmwucHJvdG9jb2wpIHtcbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJUaGUgVVJMICdcIiArIHVybCArIFwiJyBpcyBpbnZhbGlkXCIpO1xuICB9IGVsc2UgaWYgKHBhcnNlZFVybC5oYXNoKSB7XG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKCdUaGUgVVJMIG11c3Qgbm90IGNvbnRhaW4gYSBmcmFnbWVudCcpO1xuICB9IGVsc2UgaWYgKHBhcnNlZFVybC5wcm90b2NvbCAhPT0gJ2h0dHA6JyAmJiBwYXJzZWRVcmwucHJvdG9jb2wgIT09ICdodHRwczonKSB7XG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiVGhlIFVSTCdzIHNjaGVtZSBtdXN0IGJlIGVpdGhlciAnaHR0cDonIG9yICdodHRwczonLiAnXCIgKyBwYXJzZWRVcmwucHJvdG9jb2wgKyBcIicgaXMgbm90IGFsbG93ZWQuXCIpO1xuICB9XG5cbiAgdmFyIHNlY3VyZSA9IHBhcnNlZFVybC5wcm90b2NvbCA9PT0gJ2h0dHBzOic7XG4gIC8vIFN0ZXAgMiAtIGRvbid0IGFsbG93IHNlY3VyZSBvcmlnaW4gd2l0aCBhbiBpbnNlY3VyZSBwcm90b2NvbFxuICBpZiAobG9jLnByb3RvY29sID09PSAnaHR0cHM6JyAmJiAhc2VjdXJlKSB7XG4gICAgLy8gZXhjZXB0aW9uIGlzIDEyNy4wLjAuMC84IGFuZCA6OjEgdXJsc1xuICAgIGlmICghdXJsVXRpbHMuaXNMb29wYmFja0FkZHIocGFyc2VkVXJsLmhvc3RuYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZWN1cml0eUVycm9yOiBBbiBpbnNlY3VyZSBTb2NrSlMgY29ubmVjdGlvbiBtYXkgbm90IGJlIGluaXRpYXRlZCBmcm9tIGEgcGFnZSBsb2FkZWQgb3ZlciBIVFRQUycpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFN0ZXAgMyAtIGNoZWNrIHBvcnQgYWNjZXNzIC0gbm8gbmVlZCBoZXJlXG4gIC8vIFN0ZXAgNCAtIHBhcnNlIHByb3RvY29scyBhcmd1bWVudFxuICBpZiAoIXByb3RvY29scykge1xuICAgIHByb3RvY29scyA9IFtdO1xuICB9IGVsc2UgaWYgKCFBcnJheS5pc0FycmF5KHByb3RvY29scykpIHtcbiAgICBwcm90b2NvbHMgPSBbcHJvdG9jb2xzXTtcbiAgfVxuXG4gIC8vIFN0ZXAgNSAtIGNoZWNrIHByb3RvY29scyBhcmd1bWVudFxuICB2YXIgc29ydGVkUHJvdG9jb2xzID0gcHJvdG9jb2xzLnNvcnQoKTtcbiAgc29ydGVkUHJvdG9jb2xzLmZvckVhY2goZnVuY3Rpb24ocHJvdG8sIGkpIHtcbiAgICBpZiAoIXByb3RvKSB7XG4gICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJUaGUgcHJvdG9jb2xzIGVudHJ5ICdcIiArIHByb3RvICsgXCInIGlzIGludmFsaWQuXCIpO1xuICAgIH1cbiAgICBpZiAoaSA8IChzb3J0ZWRQcm90b2NvbHMubGVuZ3RoIC0gMSkgJiYgcHJvdG8gPT09IHNvcnRlZFByb3RvY29sc1tpICsgMV0pIHtcbiAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcIlRoZSBwcm90b2NvbHMgZW50cnkgJ1wiICsgcHJvdG8gKyBcIicgaXMgZHVwbGljYXRlZC5cIik7XG4gICAgfVxuICB9KTtcblxuICAvLyBTdGVwIDYgLSBjb252ZXJ0IG9yaWdpblxuICB2YXIgbyA9IHVybFV0aWxzLmdldE9yaWdpbihsb2MuaHJlZik7XG4gIHRoaXMuX29yaWdpbiA9IG8gPyBvLnRvTG93ZXJDYXNlKCkgOiBudWxsO1xuXG4gIC8vIHJlbW92ZSB0aGUgdHJhaWxpbmcgc2xhc2hcbiAgcGFyc2VkVXJsLnNldCgncGF0aG5hbWUnLCBwYXJzZWRVcmwucGF0aG5hbWUucmVwbGFjZSgvXFwvKyQvLCAnJykpO1xuXG4gIC8vIHN0b3JlIHRoZSBzYW5pdGl6ZWQgdXJsXG4gIHRoaXMudXJsID0gcGFyc2VkVXJsLmhyZWY7XG4gIGRlYnVnKCd1c2luZyB1cmwnLCB0aGlzLnVybCk7XG5cbiAgLy8gU3RlcCA3IC0gc3RhcnQgY29ubmVjdGlvbiBpbiBiYWNrZ3JvdW5kXG4gIC8vIG9idGFpbiBzZXJ2ZXIgaW5mb1xuICAvLyBodHRwOi8vc29ja2pzLmdpdGh1Yi5pby9zb2NranMtcHJvdG9jb2wvc29ja2pzLXByb3RvY29sLTAuMy4zLmh0bWwjc2VjdGlvbi0yNlxuICB0aGlzLl91cmxJbmZvID0ge1xuICAgIG51bGxPcmlnaW46ICFicm93c2VyLmhhc0RvbWFpbigpXG4gICwgc2FtZU9yaWdpbjogdXJsVXRpbHMuaXNPcmlnaW5FcXVhbCh0aGlzLnVybCwgbG9jLmhyZWYpXG4gICwgc2FtZVNjaGVtZTogdXJsVXRpbHMuaXNTY2hlbWVFcXVhbCh0aGlzLnVybCwgbG9jLmhyZWYpXG4gIH07XG5cbiAgdGhpcy5faXIgPSBuZXcgSW5mb1JlY2VpdmVyKHRoaXMudXJsLCB0aGlzLl91cmxJbmZvKTtcbiAgdGhpcy5faXIub25jZSgnZmluaXNoJywgdGhpcy5fcmVjZWl2ZUluZm8uYmluZCh0aGlzKSk7XG59XG5cbmluaGVyaXRzKFNvY2tKUywgRXZlbnRUYXJnZXQpO1xuXG5mdW5jdGlvbiB1c2VyU2V0Q29kZShjb2RlKSB7XG4gIHJldHVybiBjb2RlID09PSAxMDAwIHx8IChjb2RlID49IDMwMDAgJiYgY29kZSA8PSA0OTk5KTtcbn1cblxuU29ja0pTLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKGNvZGUsIHJlYXNvbikge1xuICAvLyBTdGVwIDFcbiAgaWYgKGNvZGUgJiYgIXVzZXJTZXRDb2RlKGNvZGUpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkQWNjZXNzRXJyb3I6IEludmFsaWQgY29kZScpO1xuICB9XG4gIC8vIFN0ZXAgMi40IHN0YXRlcyB0aGUgbWF4IGlzIDEyMyBieXRlcywgYnV0IHdlIGFyZSBqdXN0IGNoZWNraW5nIGxlbmd0aFxuICBpZiAocmVhc29uICYmIHJlYXNvbi5sZW5ndGggPiAxMjMpIHtcbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoJ3JlYXNvbiBhcmd1bWVudCBoYXMgYW4gaW52YWxpZCBsZW5ndGgnKTtcbiAgfVxuXG4gIC8vIFN0ZXAgMy4xXG4gIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IFNvY2tKUy5DTE9TSU5HIHx8IHRoaXMucmVhZHlTdGF0ZSA9PT0gU29ja0pTLkNMT1NFRCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIFRPRE8gbG9vayBhdCBkb2NzIHRvIGRldGVybWluZSBob3cgdG8gc2V0IHRoaXNcbiAgdmFyIHdhc0NsZWFuID0gdHJ1ZTtcbiAgdGhpcy5fY2xvc2UoY29kZSB8fCAxMDAwLCByZWFzb24gfHwgJ05vcm1hbCBjbG9zdXJlJywgd2FzQ2xlYW4pO1xufTtcblxuU29ja0pTLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24oZGF0YSkge1xuICAvLyAjMTMgLSBjb252ZXJ0IGFueXRoaW5nIG5vbi1zdHJpbmcgdG8gc3RyaW5nXG4gIC8vIFRPRE8gdGhpcyBjdXJyZW50bHkgdHVybnMgb2JqZWN0cyBpbnRvIFtvYmplY3QgT2JqZWN0XVxuICBpZiAodHlwZW9mIGRhdGEgIT09ICdzdHJpbmcnKSB7XG4gICAgZGF0YSA9ICcnICsgZGF0YTtcbiAgfVxuICBpZiAodGhpcy5yZWFkeVN0YXRlID09PSBTb2NrSlMuQ09OTkVDVElORykge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZFN0YXRlRXJyb3I6IFRoZSBjb25uZWN0aW9uIGhhcyBub3QgYmVlbiBlc3RhYmxpc2hlZCB5ZXQnKTtcbiAgfVxuICBpZiAodGhpcy5yZWFkeVN0YXRlICE9PSBTb2NrSlMuT1BFTikge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLl90cmFuc3BvcnQuc2VuZChlc2NhcGUucXVvdGUoZGF0YSkpO1xufTtcblxuU29ja0pTLnZlcnNpb24gPSByZXF1aXJlKCcuL3ZlcnNpb24nKTtcblxuU29ja0pTLkNPTk5FQ1RJTkcgPSAwO1xuU29ja0pTLk9QRU4gPSAxO1xuU29ja0pTLkNMT1NJTkcgPSAyO1xuU29ja0pTLkNMT1NFRCA9IDM7XG5cblNvY2tKUy5wcm90b3R5cGUuX3JlY2VpdmVJbmZvID0gZnVuY3Rpb24oaW5mbywgcnR0KSB7XG4gIGRlYnVnKCdfcmVjZWl2ZUluZm8nLCBydHQpO1xuICB0aGlzLl9pciA9IG51bGw7XG4gIGlmICghaW5mbykge1xuICAgIHRoaXMuX2Nsb3NlKDEwMDIsICdDYW5ub3QgY29ubmVjdCB0byBzZXJ2ZXInKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBlc3RhYmxpc2ggYSByb3VuZC10cmlwIHRpbWVvdXQgKFJUTykgYmFzZWQgb24gdGhlXG4gIC8vIHJvdW5kLXRyaXAgdGltZSAoUlRUKVxuICB0aGlzLl9ydG8gPSB0aGlzLmNvdW50UlRPKHJ0dCk7XG4gIC8vIGFsbG93IHNlcnZlciB0byBvdmVycmlkZSB1cmwgdXNlZCBmb3IgdGhlIGFjdHVhbCB0cmFuc3BvcnRcbiAgdGhpcy5fdHJhbnNVcmwgPSBpbmZvLmJhc2VfdXJsID8gaW5mby5iYXNlX3VybCA6IHRoaXMudXJsO1xuICBpbmZvID0gb2JqZWN0VXRpbHMuZXh0ZW5kKGluZm8sIHRoaXMuX3VybEluZm8pO1xuICBkZWJ1ZygnaW5mbycsIGluZm8pO1xuICAvLyBkZXRlcm1pbmUgbGlzdCBvZiBkZXNpcmVkIGFuZCBzdXBwb3J0ZWQgdHJhbnNwb3J0c1xuICB2YXIgZW5hYmxlZFRyYW5zcG9ydHMgPSB0cmFuc3BvcnRzLmZpbHRlclRvRW5hYmxlZCh0aGlzLl90cmFuc3BvcnRzV2hpdGVsaXN0LCBpbmZvKTtcbiAgdGhpcy5fdHJhbnNwb3J0cyA9IGVuYWJsZWRUcmFuc3BvcnRzLm1haW47XG4gIGRlYnVnKHRoaXMuX3RyYW5zcG9ydHMubGVuZ3RoICsgJyBlbmFibGVkIHRyYW5zcG9ydHMnKTtcblxuICB0aGlzLl9jb25uZWN0KCk7XG59O1xuXG5Tb2NrSlMucHJvdG90eXBlLl9jb25uZWN0ID0gZnVuY3Rpb24oKSB7XG4gIGZvciAodmFyIFRyYW5zcG9ydCA9IHRoaXMuX3RyYW5zcG9ydHMuc2hpZnQoKTsgVHJhbnNwb3J0OyBUcmFuc3BvcnQgPSB0aGlzLl90cmFuc3BvcnRzLnNoaWZ0KCkpIHtcbiAgICBkZWJ1ZygnYXR0ZW1wdCcsIFRyYW5zcG9ydC50cmFuc3BvcnROYW1lKTtcbiAgICBpZiAoVHJhbnNwb3J0Lm5lZWRCb2R5KSB7XG4gICAgICBpZiAoIWdsb2JhbC5kb2N1bWVudC5ib2R5IHx8XG4gICAgICAgICAgKHR5cGVvZiBnbG9iYWwuZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgICAgIGdsb2JhbC5kb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnY29tcGxldGUnICYmXG4gICAgICAgICAgICBnbG9iYWwuZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2ludGVyYWN0aXZlJykpIHtcbiAgICAgICAgZGVidWcoJ3dhaXRpbmcgZm9yIGJvZHknKTtcbiAgICAgICAgdGhpcy5fdHJhbnNwb3J0cy51bnNoaWZ0KFRyYW5zcG9ydCk7XG4gICAgICAgIGV2ZW50VXRpbHMuYXR0YWNoRXZlbnQoJ2xvYWQnLCB0aGlzLl9jb25uZWN0LmJpbmQodGhpcykpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gY2FsY3VsYXRlIHRpbWVvdXQgYmFzZWQgb24gUlRPIGFuZCByb3VuZCB0cmlwcy4gRGVmYXVsdCB0byA1c1xuICAgIHZhciB0aW1lb3V0TXMgPSBNYXRoLm1heCh0aGlzLl90aW1lb3V0LCAodGhpcy5fcnRvICogVHJhbnNwb3J0LnJvdW5kVHJpcHMpIHx8IDUwMDApO1xuICAgIHRoaXMuX3RyYW5zcG9ydFRpbWVvdXRJZCA9IHNldFRpbWVvdXQodGhpcy5fdHJhbnNwb3J0VGltZW91dC5iaW5kKHRoaXMpLCB0aW1lb3V0TXMpO1xuICAgIGRlYnVnKCd1c2luZyB0aW1lb3V0JywgdGltZW91dE1zKTtcblxuICAgIHZhciB0cmFuc3BvcnRVcmwgPSB1cmxVdGlscy5hZGRQYXRoKHRoaXMuX3RyYW5zVXJsLCAnLycgKyB0aGlzLl9zZXJ2ZXIgKyAnLycgKyB0aGlzLl9nZW5lcmF0ZVNlc3Npb25JZCgpKTtcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMuX3RyYW5zcG9ydE9wdGlvbnNbVHJhbnNwb3J0LnRyYW5zcG9ydE5hbWVdO1xuICAgIGRlYnVnKCd0cmFuc3BvcnQgdXJsJywgdHJhbnNwb3J0VXJsKTtcbiAgICB2YXIgdHJhbnNwb3J0T2JqID0gbmV3IFRyYW5zcG9ydCh0cmFuc3BvcnRVcmwsIHRoaXMuX3RyYW5zVXJsLCBvcHRpb25zKTtcbiAgICB0cmFuc3BvcnRPYmoub24oJ21lc3NhZ2UnLCB0aGlzLl90cmFuc3BvcnRNZXNzYWdlLmJpbmQodGhpcykpO1xuICAgIHRyYW5zcG9ydE9iai5vbmNlKCdjbG9zZScsIHRoaXMuX3RyYW5zcG9ydENsb3NlLmJpbmQodGhpcykpO1xuICAgIHRyYW5zcG9ydE9iai50cmFuc3BvcnROYW1lID0gVHJhbnNwb3J0LnRyYW5zcG9ydE5hbWU7XG4gICAgdGhpcy5fdHJhbnNwb3J0ID0gdHJhbnNwb3J0T2JqO1xuXG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMuX2Nsb3NlKDIwMDAsICdBbGwgdHJhbnNwb3J0cyBmYWlsZWQnLCBmYWxzZSk7XG59O1xuXG5Tb2NrSlMucHJvdG90eXBlLl90cmFuc3BvcnRUaW1lb3V0ID0gZnVuY3Rpb24oKSB7XG4gIGRlYnVnKCdfdHJhbnNwb3J0VGltZW91dCcpO1xuICBpZiAodGhpcy5yZWFkeVN0YXRlID09PSBTb2NrSlMuQ09OTkVDVElORykge1xuICAgIGlmICh0aGlzLl90cmFuc3BvcnQpIHtcbiAgICAgIHRoaXMuX3RyYW5zcG9ydC5jbG9zZSgpO1xuICAgIH1cblxuICAgIHRoaXMuX3RyYW5zcG9ydENsb3NlKDIwMDcsICdUcmFuc3BvcnQgdGltZWQgb3V0Jyk7XG4gIH1cbn07XG5cblNvY2tKUy5wcm90b3R5cGUuX3RyYW5zcG9ydE1lc3NhZ2UgPSBmdW5jdGlvbihtc2cpIHtcbiAgZGVidWcoJ190cmFuc3BvcnRNZXNzYWdlJywgbXNnKTtcbiAgdmFyIHNlbGYgPSB0aGlzXG4gICAgLCB0eXBlID0gbXNnLnNsaWNlKDAsIDEpXG4gICAgLCBjb250ZW50ID0gbXNnLnNsaWNlKDEpXG4gICAgLCBwYXlsb2FkXG4gICAgO1xuXG4gIC8vIGZpcnN0IGNoZWNrIGZvciBtZXNzYWdlcyB0aGF0IGRvbid0IG5lZWQgYSBwYXlsb2FkXG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ28nOlxuICAgICAgdGhpcy5fb3BlbigpO1xuICAgICAgcmV0dXJuO1xuICAgIGNhc2UgJ2gnOlxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnaGVhcnRiZWF0JykpO1xuICAgICAgZGVidWcoJ2hlYXJ0YmVhdCcsIHRoaXMudHJhbnNwb3J0KTtcbiAgICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChjb250ZW50KSB7XG4gICAgdHJ5IHtcbiAgICAgIHBheWxvYWQgPSBKU09OMy5wYXJzZShjb250ZW50KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBkZWJ1ZygnYmFkIGpzb24nLCBjb250ZW50KTtcbiAgICB9XG4gIH1cblxuICBpZiAodHlwZW9mIHBheWxvYWQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgZGVidWcoJ2VtcHR5IHBheWxvYWQnLCBjb250ZW50KTtcbiAgICByZXR1cm47XG4gIH1cblxuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICdhJzpcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHBheWxvYWQpKSB7XG4gICAgICAgIHBheWxvYWQuZm9yRWFjaChmdW5jdGlvbihwKSB7XG4gICAgICAgICAgZGVidWcoJ21lc3NhZ2UnLCBzZWxmLnRyYW5zcG9ydCwgcCk7XG4gICAgICAgICAgc2VsZi5kaXNwYXRjaEV2ZW50KG5ldyBUcmFuc3BvcnRNZXNzYWdlRXZlbnQocCkpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ20nOlxuICAgICAgZGVidWcoJ21lc3NhZ2UnLCB0aGlzLnRyYW5zcG9ydCwgcGF5bG9hZCk7XG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IFRyYW5zcG9ydE1lc3NhZ2VFdmVudChwYXlsb2FkKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjJzpcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHBheWxvYWQpICYmIHBheWxvYWQubGVuZ3RoID09PSAyKSB7XG4gICAgICAgIHRoaXMuX2Nsb3NlKHBheWxvYWRbMF0sIHBheWxvYWRbMV0sIHRydWUpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gIH1cbn07XG5cblNvY2tKUy5wcm90b3R5cGUuX3RyYW5zcG9ydENsb3NlID0gZnVuY3Rpb24oY29kZSwgcmVhc29uKSB7XG4gIGRlYnVnKCdfdHJhbnNwb3J0Q2xvc2UnLCB0aGlzLnRyYW5zcG9ydCwgY29kZSwgcmVhc29uKTtcbiAgaWYgKHRoaXMuX3RyYW5zcG9ydCkge1xuICAgIHRoaXMuX3RyYW5zcG9ydC5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbiAgICB0aGlzLl90cmFuc3BvcnQgPSBudWxsO1xuICAgIHRoaXMudHJhbnNwb3J0ID0gbnVsbDtcbiAgfVxuXG4gIGlmICghdXNlclNldENvZGUoY29kZSkgJiYgY29kZSAhPT0gMjAwMCAmJiB0aGlzLnJlYWR5U3RhdGUgPT09IFNvY2tKUy5DT05ORUNUSU5HKSB7XG4gICAgdGhpcy5fY29ubmVjdCgpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMuX2Nsb3NlKGNvZGUsIHJlYXNvbik7XG59O1xuXG5Tb2NrSlMucHJvdG90eXBlLl9vcGVuID0gZnVuY3Rpb24oKSB7XG4gIGRlYnVnKCdfb3BlbicsIHRoaXMuX3RyYW5zcG9ydCAmJiB0aGlzLl90cmFuc3BvcnQudHJhbnNwb3J0TmFtZSwgdGhpcy5yZWFkeVN0YXRlKTtcbiAgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PT0gU29ja0pTLkNPTk5FQ1RJTkcpIHtcbiAgICBpZiAodGhpcy5fdHJhbnNwb3J0VGltZW91dElkKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fdHJhbnNwb3J0VGltZW91dElkKTtcbiAgICAgIHRoaXMuX3RyYW5zcG9ydFRpbWVvdXRJZCA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMucmVhZHlTdGF0ZSA9IFNvY2tKUy5PUEVOO1xuICAgIHRoaXMudHJhbnNwb3J0ID0gdGhpcy5fdHJhbnNwb3J0LnRyYW5zcG9ydE5hbWU7XG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnb3BlbicpKTtcbiAgICBkZWJ1ZygnY29ubmVjdGVkJywgdGhpcy50cmFuc3BvcnQpO1xuICB9IGVsc2Uge1xuICAgIC8vIFRoZSBzZXJ2ZXIgbWlnaHQgaGF2ZSBiZWVuIHJlc3RhcnRlZCwgYW5kIGxvc3QgdHJhY2sgb2Ygb3VyXG4gICAgLy8gY29ubmVjdGlvbi5cbiAgICB0aGlzLl9jbG9zZSgxMDA2LCAnU2VydmVyIGxvc3Qgc2Vzc2lvbicpO1xuICB9XG59O1xuXG5Tb2NrSlMucHJvdG90eXBlLl9jbG9zZSA9IGZ1bmN0aW9uKGNvZGUsIHJlYXNvbiwgd2FzQ2xlYW4pIHtcbiAgZGVidWcoJ19jbG9zZScsIHRoaXMudHJhbnNwb3J0LCBjb2RlLCByZWFzb24sIHdhc0NsZWFuLCB0aGlzLnJlYWR5U3RhdGUpO1xuICB2YXIgZm9yY2VGYWlsID0gZmFsc2U7XG5cbiAgaWYgKHRoaXMuX2lyKSB7XG4gICAgZm9yY2VGYWlsID0gdHJ1ZTtcbiAgICB0aGlzLl9pci5jbG9zZSgpO1xuICAgIHRoaXMuX2lyID0gbnVsbDtcbiAgfVxuICBpZiAodGhpcy5fdHJhbnNwb3J0KSB7XG4gICAgdGhpcy5fdHJhbnNwb3J0LmNsb3NlKCk7XG4gICAgdGhpcy5fdHJhbnNwb3J0ID0gbnVsbDtcbiAgICB0aGlzLnRyYW5zcG9ydCA9IG51bGw7XG4gIH1cblxuICBpZiAodGhpcy5yZWFkeVN0YXRlID09PSBTb2NrSlMuQ0xPU0VEKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkU3RhdGVFcnJvcjogU29ja0pTIGhhcyBhbHJlYWR5IGJlZW4gY2xvc2VkJyk7XG4gIH1cblxuICB0aGlzLnJlYWR5U3RhdGUgPSBTb2NrSlMuQ0xPU0lORztcbiAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlYWR5U3RhdGUgPSBTb2NrSlMuQ0xPU0VEO1xuXG4gICAgaWYgKGZvcmNlRmFpbCkge1xuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnZXJyb3InKSk7XG4gICAgfVxuXG4gICAgdmFyIGUgPSBuZXcgQ2xvc2VFdmVudCgnY2xvc2UnKTtcbiAgICBlLndhc0NsZWFuID0gd2FzQ2xlYW4gfHwgZmFsc2U7XG4gICAgZS5jb2RlID0gY29kZSB8fCAxMDAwO1xuICAgIGUucmVhc29uID0gcmVhc29uO1xuXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KGUpO1xuICAgIHRoaXMub25tZXNzYWdlID0gdGhpcy5vbmNsb3NlID0gdGhpcy5vbmVycm9yID0gbnVsbDtcbiAgICBkZWJ1ZygnZGlzY29ubmVjdGVkJyk7XG4gIH0uYmluZCh0aGlzKSwgMCk7XG59O1xuXG4vLyBTZWU6IGh0dHA6Ly93d3cuZXJnLmFiZG4uYWMudWsvfmdlcnJpdC9kY2NwL25vdGVzL2NjaWQyL3J0b19lc3RpbWF0b3IvXG4vLyBhbmQgUkZDIDI5ODguXG5Tb2NrSlMucHJvdG90eXBlLmNvdW50UlRPID0gZnVuY3Rpb24ocnR0KSB7XG4gIC8vIEluIGEgbG9jYWwgZW52aXJvbm1lbnQsIHdoZW4gdXNpbmcgSUU4LzkgYW5kIHRoZSBganNvbnAtcG9sbGluZ2BcbiAgLy8gdHJhbnNwb3J0IHRoZSB0aW1lIG5lZWRlZCB0byBlc3RhYmxpc2ggYSBjb25uZWN0aW9uICh0aGUgdGltZSB0aGF0IHBhc3NcbiAgLy8gZnJvbSB0aGUgb3BlbmluZyBvZiB0aGUgdHJhbnNwb3J0IHRvIHRoZSBjYWxsIG9mIGBfZGlzcGF0Y2hPcGVuYCkgaXNcbiAgLy8gYXJvdW5kIDIwMG1zZWMgKHRoZSBsb3dlciBib3VuZCB1c2VkIGluIHRoZSBhcnRpY2xlIGFib3ZlKSBhbmQgdGhpc1xuICAvLyBjYXVzZXMgc3B1cmlvdXMgdGltZW91dHMuIEZvciB0aGlzIHJlYXNvbiB3ZSBjYWxjdWxhdGUgYSB2YWx1ZSBzbGlnaHRseVxuICAvLyBsYXJnZXIgdGhhbiB0aGF0IHVzZWQgaW4gdGhlIGFydGljbGUuXG4gIGlmIChydHQgPiAxMDApIHtcbiAgICByZXR1cm4gNCAqIHJ0dDsgLy8gcnRvID4gNDAwbXNlY1xuICB9XG4gIHJldHVybiAzMDAgKyBydHQ7IC8vIDMwMG1zZWMgPCBydG8gPD0gNDAwbXNlY1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhdmFpbGFibGVUcmFuc3BvcnRzKSB7XG4gIHRyYW5zcG9ydHMgPSB0cmFuc3BvcnQoYXZhaWxhYmxlVHJhbnNwb3J0cyk7XG4gIHJlcXVpcmUoJy4vaWZyYW1lLWJvb3RzdHJhcCcpKFNvY2tKUywgYXZhaWxhYmxlVHJhbnNwb3J0cyk7XG4gIHJldHVybiBTb2NrSlM7XG59O1xuIiwiLyogZXNsaW50LWRpc2FibGUgKi9cbi8qIGpzY3M6IGRpc2FibGUgKi9cbid1c2Ugc3RyaWN0JztcblxuLy8gcHVsbGVkIHNwZWNpZmljIHNoaW1zIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2VzLXNoaW1zL2VzNS1zaGltXG5cbnZhciBBcnJheVByb3RvdHlwZSA9IEFycmF5LnByb3RvdHlwZTtcbnZhciBPYmplY3RQcm90b3R5cGUgPSBPYmplY3QucHJvdG90eXBlO1xudmFyIEZ1bmN0aW9uUHJvdG90eXBlID0gRnVuY3Rpb24ucHJvdG90eXBlO1xudmFyIFN0cmluZ1Byb3RvdHlwZSA9IFN0cmluZy5wcm90b3R5cGU7XG52YXIgYXJyYXlfc2xpY2UgPSBBcnJheVByb3RvdHlwZS5zbGljZTtcblxudmFyIF90b1N0cmluZyA9IE9iamVjdFByb3RvdHlwZS50b1N0cmluZztcbnZhciBpc0Z1bmN0aW9uID0gZnVuY3Rpb24gKHZhbCkge1xuICAgIHJldHVybiBPYmplY3RQcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xufTtcbnZhciBpc0FycmF5ID0gZnVuY3Rpb24gaXNBcnJheShvYmopIHtcbiAgICByZXR1cm4gX3RvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG52YXIgaXNTdHJpbmcgPSBmdW5jdGlvbiBpc1N0cmluZyhvYmopIHtcbiAgICByZXR1cm4gX3RvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgU3RyaW5nXSc7XG59O1xuXG52YXIgc3VwcG9ydHNEZXNjcmlwdG9ycyA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSAmJiAoZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ3gnLCB7fSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGUpIHsgLyogdGhpcyBpcyBFUzMgKi9cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn0oKSk7XG5cbi8vIERlZmluZSBjb25maWd1cmFibGUsIHdyaXRhYmxlIGFuZCBub24tZW51bWVyYWJsZSBwcm9wc1xuLy8gaWYgdGhleSBkb24ndCBleGlzdC5cbnZhciBkZWZpbmVQcm9wZXJ0eTtcbmlmIChzdXBwb3J0c0Rlc2NyaXB0b3JzKSB7XG4gICAgZGVmaW5lUHJvcGVydHkgPSBmdW5jdGlvbiAob2JqZWN0LCBuYW1lLCBtZXRob2QsIGZvcmNlQXNzaWduKSB7XG4gICAgICAgIGlmICghZm9yY2VBc3NpZ24gJiYgKG5hbWUgaW4gb2JqZWN0KSkgeyByZXR1cm47IH1cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iamVjdCwgbmFtZSwge1xuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiBtZXRob2RcbiAgICAgICAgfSk7XG4gICAgfTtcbn0gZWxzZSB7XG4gICAgZGVmaW5lUHJvcGVydHkgPSBmdW5jdGlvbiAob2JqZWN0LCBuYW1lLCBtZXRob2QsIGZvcmNlQXNzaWduKSB7XG4gICAgICAgIGlmICghZm9yY2VBc3NpZ24gJiYgKG5hbWUgaW4gb2JqZWN0KSkgeyByZXR1cm47IH1cbiAgICAgICAgb2JqZWN0W25hbWVdID0gbWV0aG9kO1xuICAgIH07XG59XG52YXIgZGVmaW5lUHJvcGVydGllcyA9IGZ1bmN0aW9uIChvYmplY3QsIG1hcCwgZm9yY2VBc3NpZ24pIHtcbiAgICBmb3IgKHZhciBuYW1lIGluIG1hcCkge1xuICAgICAgICBpZiAoT2JqZWN0UHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobWFwLCBuYW1lKSkge1xuICAgICAgICAgIGRlZmluZVByb3BlcnR5KG9iamVjdCwgbmFtZSwgbWFwW25hbWVdLCBmb3JjZUFzc2lnbik7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG52YXIgdG9PYmplY3QgPSBmdW5jdGlvbiAobykge1xuICAgIGlmIChvID09IG51bGwpIHsgLy8gdGhpcyBtYXRjaGVzIGJvdGggbnVsbCBhbmQgdW5kZWZpbmVkXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJjYW4ndCBjb252ZXJ0IFwiICsgbyArICcgdG8gb2JqZWN0Jyk7XG4gICAgfVxuICAgIHJldHVybiBPYmplY3Qobyk7XG59O1xuXG4vL1xuLy8gVXRpbFxuLy8gPT09PT09XG4vL1xuXG4vLyBFUzUgOS40XG4vLyBodHRwOi8vZXM1LmdpdGh1Yi5jb20vI3g5LjRcbi8vIGh0dHA6Ly9qc3BlcmYuY29tL3RvLWludGVnZXJcblxuZnVuY3Rpb24gdG9JbnRlZ2VyKG51bSkge1xuICAgIHZhciBuID0gK251bTtcbiAgICBpZiAobiAhPT0gbikgeyAvLyBpc05hTlxuICAgICAgICBuID0gMDtcbiAgICB9IGVsc2UgaWYgKG4gIT09IDAgJiYgbiAhPT0gKDEgLyAwKSAmJiBuICE9PSAtKDEgLyAwKSkge1xuICAgICAgICBuID0gKG4gPiAwIHx8IC0xKSAqIE1hdGguZmxvb3IoTWF0aC5hYnMobikpO1xuICAgIH1cbiAgICByZXR1cm4gbjtcbn1cblxuZnVuY3Rpb24gVG9VaW50MzIoeCkge1xuICAgIHJldHVybiB4ID4+PiAwO1xufVxuXG4vL1xuLy8gRnVuY3Rpb25cbi8vID09PT09PT09XG4vL1xuXG4vLyBFUy01IDE1LjMuNC41XG4vLyBodHRwOi8vZXM1LmdpdGh1Yi5jb20vI3gxNS4zLjQuNVxuXG5mdW5jdGlvbiBFbXB0eSgpIHt9XG5cbmRlZmluZVByb3BlcnRpZXMoRnVuY3Rpb25Qcm90b3R5cGUsIHtcbiAgICBiaW5kOiBmdW5jdGlvbiBiaW5kKHRoYXQpIHsgLy8gLmxlbmd0aCBpcyAxXG4gICAgICAgIC8vIDEuIExldCBUYXJnZXQgYmUgdGhlIHRoaXMgdmFsdWUuXG4gICAgICAgIHZhciB0YXJnZXQgPSB0aGlzO1xuICAgICAgICAvLyAyLiBJZiBJc0NhbGxhYmxlKFRhcmdldCkgaXMgZmFsc2UsIHRocm93IGEgVHlwZUVycm9yIGV4Y2VwdGlvbi5cbiAgICAgICAgaWYgKCFpc0Z1bmN0aW9uKHRhcmdldCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Z1bmN0aW9uLnByb3RvdHlwZS5iaW5kIGNhbGxlZCBvbiBpbmNvbXBhdGlibGUgJyArIHRhcmdldCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gMy4gTGV0IEEgYmUgYSBuZXcgKHBvc3NpYmx5IGVtcHR5KSBpbnRlcm5hbCBsaXN0IG9mIGFsbCBvZiB0aGVcbiAgICAgICAgLy8gICBhcmd1bWVudCB2YWx1ZXMgcHJvdmlkZWQgYWZ0ZXIgdGhpc0FyZyAoYXJnMSwgYXJnMiBldGMpLCBpbiBvcmRlci5cbiAgICAgICAgLy8gWFhYIHNsaWNlZEFyZ3Mgd2lsbCBzdGFuZCBpbiBmb3IgXCJBXCIgaWYgdXNlZFxuICAgICAgICB2YXIgYXJncyA9IGFycmF5X3NsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTsgLy8gZm9yIG5vcm1hbCBjYWxsXG4gICAgICAgIC8vIDQuIExldCBGIGJlIGEgbmV3IG5hdGl2ZSBFQ01BU2NyaXB0IG9iamVjdC5cbiAgICAgICAgLy8gMTEuIFNldCB0aGUgW1tQcm90b3R5cGVdXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZiBGIHRvIHRoZSBzdGFuZGFyZFxuICAgICAgICAvLyAgIGJ1aWx0LWluIEZ1bmN0aW9uIHByb3RvdHlwZSBvYmplY3QgYXMgc3BlY2lmaWVkIGluIDE1LjMuMy4xLlxuICAgICAgICAvLyAxMi4gU2V0IHRoZSBbW0NhbGxdXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZiBGIGFzIGRlc2NyaWJlZCBpblxuICAgICAgICAvLyAgIDE1LjMuNC41LjEuXG4gICAgICAgIC8vIDEzLiBTZXQgdGhlIFtbQ29uc3RydWN0XV0gaW50ZXJuYWwgcHJvcGVydHkgb2YgRiBhcyBkZXNjcmliZWQgaW5cbiAgICAgICAgLy8gICAxNS4zLjQuNS4yLlxuICAgICAgICAvLyAxNC4gU2V0IHRoZSBbW0hhc0luc3RhbmNlXV0gaW50ZXJuYWwgcHJvcGVydHkgb2YgRiBhcyBkZXNjcmliZWQgaW5cbiAgICAgICAgLy8gICAxNS4zLjQuNS4zLlxuICAgICAgICB2YXIgYmluZGVyID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICBpZiAodGhpcyBpbnN0YW5jZW9mIGJvdW5kKSB7XG4gICAgICAgICAgICAgICAgLy8gMTUuMy40LjUuMiBbW0NvbnN0cnVjdF1dXG4gICAgICAgICAgICAgICAgLy8gV2hlbiB0aGUgW1tDb25zdHJ1Y3RdXSBpbnRlcm5hbCBtZXRob2Qgb2YgYSBmdW5jdGlvbiBvYmplY3QsXG4gICAgICAgICAgICAgICAgLy8gRiB0aGF0IHdhcyBjcmVhdGVkIHVzaW5nIHRoZSBiaW5kIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aXRoIGFcbiAgICAgICAgICAgICAgICAvLyBsaXN0IG9mIGFyZ3VtZW50cyBFeHRyYUFyZ3MsIHRoZSBmb2xsb3dpbmcgc3RlcHMgYXJlIHRha2VuOlxuICAgICAgICAgICAgICAgIC8vIDEuIExldCB0YXJnZXQgYmUgdGhlIHZhbHVlIG9mIEYncyBbW1RhcmdldEZ1bmN0aW9uXV1cbiAgICAgICAgICAgICAgICAvLyAgIGludGVybmFsIHByb3BlcnR5LlxuICAgICAgICAgICAgICAgIC8vIDIuIElmIHRhcmdldCBoYXMgbm8gW1tDb25zdHJ1Y3RdXSBpbnRlcm5hbCBtZXRob2QsIGFcbiAgICAgICAgICAgICAgICAvLyAgIFR5cGVFcnJvciBleGNlcHRpb24gaXMgdGhyb3duLlxuICAgICAgICAgICAgICAgIC8vIDMuIExldCBib3VuZEFyZ3MgYmUgdGhlIHZhbHVlIG9mIEYncyBbW0JvdW5kQXJnc11dIGludGVybmFsXG4gICAgICAgICAgICAgICAgLy8gICBwcm9wZXJ0eS5cbiAgICAgICAgICAgICAgICAvLyA0LiBMZXQgYXJncyBiZSBhIG5ldyBsaXN0IGNvbnRhaW5pbmcgdGhlIHNhbWUgdmFsdWVzIGFzIHRoZVxuICAgICAgICAgICAgICAgIC8vICAgbGlzdCBib3VuZEFyZ3MgaW4gdGhlIHNhbWUgb3JkZXIgZm9sbG93ZWQgYnkgdGhlIHNhbWVcbiAgICAgICAgICAgICAgICAvLyAgIHZhbHVlcyBhcyB0aGUgbGlzdCBFeHRyYUFyZ3MgaW4gdGhlIHNhbWUgb3JkZXIuXG4gICAgICAgICAgICAgICAgLy8gNS4gUmV0dXJuIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tDb25zdHJ1Y3RdXSBpbnRlcm5hbFxuICAgICAgICAgICAgICAgIC8vICAgbWV0aG9kIG9mIHRhcmdldCBwcm92aWRpbmcgYXJncyBhcyB0aGUgYXJndW1lbnRzLlxuXG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHRhcmdldC5hcHBseShcbiAgICAgICAgICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgYXJncy5jb25jYXQoYXJyYXlfc2xpY2UuY2FsbChhcmd1bWVudHMpKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgaWYgKE9iamVjdChyZXN1bHQpID09PSByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gMTUuMy40LjUuMSBbW0NhbGxdXVxuICAgICAgICAgICAgICAgIC8vIFdoZW4gdGhlIFtbQ2FsbF1dIGludGVybmFsIG1ldGhvZCBvZiBhIGZ1bmN0aW9uIG9iamVjdCwgRixcbiAgICAgICAgICAgICAgICAvLyB3aGljaCB3YXMgY3JlYXRlZCB1c2luZyB0aGUgYmluZCBmdW5jdGlvbiBpcyBjYWxsZWQgd2l0aCBhXG4gICAgICAgICAgICAgICAgLy8gdGhpcyB2YWx1ZSBhbmQgYSBsaXN0IG9mIGFyZ3VtZW50cyBFeHRyYUFyZ3MsIHRoZSBmb2xsb3dpbmdcbiAgICAgICAgICAgICAgICAvLyBzdGVwcyBhcmUgdGFrZW46XG4gICAgICAgICAgICAgICAgLy8gMS4gTGV0IGJvdW5kQXJncyBiZSB0aGUgdmFsdWUgb2YgRidzIFtbQm91bmRBcmdzXV0gaW50ZXJuYWxcbiAgICAgICAgICAgICAgICAvLyAgIHByb3BlcnR5LlxuICAgICAgICAgICAgICAgIC8vIDIuIExldCBib3VuZFRoaXMgYmUgdGhlIHZhbHVlIG9mIEYncyBbW0JvdW5kVGhpc11dIGludGVybmFsXG4gICAgICAgICAgICAgICAgLy8gICBwcm9wZXJ0eS5cbiAgICAgICAgICAgICAgICAvLyAzLiBMZXQgdGFyZ2V0IGJlIHRoZSB2YWx1ZSBvZiBGJ3MgW1tUYXJnZXRGdW5jdGlvbl1dIGludGVybmFsXG4gICAgICAgICAgICAgICAgLy8gICBwcm9wZXJ0eS5cbiAgICAgICAgICAgICAgICAvLyA0LiBMZXQgYXJncyBiZSBhIG5ldyBsaXN0IGNvbnRhaW5pbmcgdGhlIHNhbWUgdmFsdWVzIGFzIHRoZVxuICAgICAgICAgICAgICAgIC8vICAgbGlzdCBib3VuZEFyZ3MgaW4gdGhlIHNhbWUgb3JkZXIgZm9sbG93ZWQgYnkgdGhlIHNhbWVcbiAgICAgICAgICAgICAgICAvLyAgIHZhbHVlcyBhcyB0aGUgbGlzdCBFeHRyYUFyZ3MgaW4gdGhlIHNhbWUgb3JkZXIuXG4gICAgICAgICAgICAgICAgLy8gNS4gUmV0dXJuIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tDYWxsXV0gaW50ZXJuYWwgbWV0aG9kXG4gICAgICAgICAgICAgICAgLy8gICBvZiB0YXJnZXQgcHJvdmlkaW5nIGJvdW5kVGhpcyBhcyB0aGUgdGhpcyB2YWx1ZSBhbmRcbiAgICAgICAgICAgICAgICAvLyAgIHByb3ZpZGluZyBhcmdzIGFzIHRoZSBhcmd1bWVudHMuXG5cbiAgICAgICAgICAgICAgICAvLyBlcXVpdjogdGFyZ2V0LmNhbGwodGhpcywgLi4uYm91bmRBcmdzLCAuLi5hcmdzKVxuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXQuYXBwbHkoXG4gICAgICAgICAgICAgICAgICAgIHRoYXQsXG4gICAgICAgICAgICAgICAgICAgIGFyZ3MuY29uY2F0KGFycmF5X3NsaWNlLmNhbGwoYXJndW1lbnRzKSlcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcblxuICAgICAgICAvLyAxNS4gSWYgdGhlIFtbQ2xhc3NdXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZiBUYXJnZXQgaXMgXCJGdW5jdGlvblwiLCB0aGVuXG4gICAgICAgIC8vICAgICBhLiBMZXQgTCBiZSB0aGUgbGVuZ3RoIHByb3BlcnR5IG9mIFRhcmdldCBtaW51cyB0aGUgbGVuZ3RoIG9mIEEuXG4gICAgICAgIC8vICAgICBiLiBTZXQgdGhlIGxlbmd0aCBvd24gcHJvcGVydHkgb2YgRiB0byBlaXRoZXIgMCBvciBMLCB3aGljaGV2ZXIgaXNcbiAgICAgICAgLy8gICAgICAgbGFyZ2VyLlxuICAgICAgICAvLyAxNi4gRWxzZSBzZXQgdGhlIGxlbmd0aCBvd24gcHJvcGVydHkgb2YgRiB0byAwLlxuXG4gICAgICAgIHZhciBib3VuZExlbmd0aCA9IE1hdGgubWF4KDAsIHRhcmdldC5sZW5ndGggLSBhcmdzLmxlbmd0aCk7XG5cbiAgICAgICAgLy8gMTcuIFNldCB0aGUgYXR0cmlidXRlcyBvZiB0aGUgbGVuZ3RoIG93biBwcm9wZXJ0eSBvZiBGIHRvIHRoZSB2YWx1ZXNcbiAgICAgICAgLy8gICBzcGVjaWZpZWQgaW4gMTUuMy41LjEuXG4gICAgICAgIHZhciBib3VuZEFyZ3MgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBib3VuZExlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBib3VuZEFyZ3MucHVzaCgnJCcgKyBpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFhYWCBCdWlsZCBhIGR5bmFtaWMgZnVuY3Rpb24gd2l0aCBkZXNpcmVkIGFtb3VudCBvZiBhcmd1bWVudHMgaXMgdGhlIG9ubHlcbiAgICAgICAgLy8gd2F5IHRvIHNldCB0aGUgbGVuZ3RoIHByb3BlcnR5IG9mIGEgZnVuY3Rpb24uXG4gICAgICAgIC8vIEluIGVudmlyb25tZW50cyB3aGVyZSBDb250ZW50IFNlY3VyaXR5IFBvbGljaWVzIGVuYWJsZWQgKENocm9tZSBleHRlbnNpb25zLFxuICAgICAgICAvLyBmb3IgZXguKSBhbGwgdXNlIG9mIGV2YWwgb3IgRnVuY3Rpb24gY29zdHJ1Y3RvciB0aHJvd3MgYW4gZXhjZXB0aW9uLlxuICAgICAgICAvLyBIb3dldmVyIGluIGFsbCBvZiB0aGVzZSBlbnZpcm9ubWVudHMgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgZXhpc3RzXG4gICAgICAgIC8vIGFuZCBzbyB0aGlzIGNvZGUgd2lsbCBuZXZlciBiZSBleGVjdXRlZC5cbiAgICAgICAgdmFyIGJvdW5kID0gRnVuY3Rpb24oJ2JpbmRlcicsICdyZXR1cm4gZnVuY3Rpb24gKCcgKyBib3VuZEFyZ3Muam9pbignLCcpICsgJyl7IHJldHVybiBiaW5kZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfScpKGJpbmRlcik7XG5cbiAgICAgICAgaWYgKHRhcmdldC5wcm90b3R5cGUpIHtcbiAgICAgICAgICAgIEVtcHR5LnByb3RvdHlwZSA9IHRhcmdldC5wcm90b3R5cGU7XG4gICAgICAgICAgICBib3VuZC5wcm90b3R5cGUgPSBuZXcgRW1wdHkoKTtcbiAgICAgICAgICAgIC8vIENsZWFuIHVwIGRhbmdsaW5nIHJlZmVyZW5jZXMuXG4gICAgICAgICAgICBFbXB0eS5wcm90b3R5cGUgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVE9ET1xuICAgICAgICAvLyAxOC4gU2V0IHRoZSBbW0V4dGVuc2libGVdXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZiBGIHRvIHRydWUuXG5cbiAgICAgICAgLy8gVE9ET1xuICAgICAgICAvLyAxOS4gTGV0IHRocm93ZXIgYmUgdGhlIFtbVGhyb3dUeXBlRXJyb3JdXSBmdW5jdGlvbiBPYmplY3QgKDEzLjIuMykuXG4gICAgICAgIC8vIDIwLiBDYWxsIHRoZSBbW0RlZmluZU93blByb3BlcnR5XV0gaW50ZXJuYWwgbWV0aG9kIG9mIEYgd2l0aFxuICAgICAgICAvLyAgIGFyZ3VtZW50cyBcImNhbGxlclwiLCBQcm9wZXJ0eURlc2NyaXB0b3Ige1tbR2V0XV06IHRocm93ZXIsIFtbU2V0XV06XG4gICAgICAgIC8vICAgdGhyb3dlciwgW1tFbnVtZXJhYmxlXV06IGZhbHNlLCBbW0NvbmZpZ3VyYWJsZV1dOiBmYWxzZX0sIGFuZFxuICAgICAgICAvLyAgIGZhbHNlLlxuICAgICAgICAvLyAyMS4gQ2FsbCB0aGUgW1tEZWZpbmVPd25Qcm9wZXJ0eV1dIGludGVybmFsIG1ldGhvZCBvZiBGIHdpdGhcbiAgICAgICAgLy8gICBhcmd1bWVudHMgXCJhcmd1bWVudHNcIiwgUHJvcGVydHlEZXNjcmlwdG9yIHtbW0dldF1dOiB0aHJvd2VyLFxuICAgICAgICAvLyAgIFtbU2V0XV06IHRocm93ZXIsIFtbRW51bWVyYWJsZV1dOiBmYWxzZSwgW1tDb25maWd1cmFibGVdXTogZmFsc2V9LFxuICAgICAgICAvLyAgIGFuZCBmYWxzZS5cblxuICAgICAgICAvLyBUT0RPXG4gICAgICAgIC8vIE5PVEUgRnVuY3Rpb24gb2JqZWN0cyBjcmVhdGVkIHVzaW5nIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kIGRvIG5vdFxuICAgICAgICAvLyBoYXZlIGEgcHJvdG90eXBlIHByb3BlcnR5IG9yIHRoZSBbW0NvZGVdXSwgW1tGb3JtYWxQYXJhbWV0ZXJzXV0sIGFuZFxuICAgICAgICAvLyBbW1Njb3BlXV0gaW50ZXJuYWwgcHJvcGVydGllcy5cbiAgICAgICAgLy8gWFhYIGNhbid0IGRlbGV0ZSBwcm90b3R5cGUgaW4gcHVyZS1qcy5cblxuICAgICAgICAvLyAyMi4gUmV0dXJuIEYuXG4gICAgICAgIHJldHVybiBib3VuZDtcbiAgICB9XG59KTtcblxuLy9cbi8vIEFycmF5XG4vLyA9PT09PVxuLy9cblxuLy8gRVM1IDE1LjQuMy4yXG4vLyBodHRwOi8vZXM1LmdpdGh1Yi5jb20vI3gxNS40LjMuMlxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4vSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvaXNBcnJheVxuZGVmaW5lUHJvcGVydGllcyhBcnJheSwgeyBpc0FycmF5OiBpc0FycmF5IH0pO1xuXG5cbnZhciBib3hlZFN0cmluZyA9IE9iamVjdCgnYScpO1xudmFyIHNwbGl0U3RyaW5nID0gYm94ZWRTdHJpbmdbMF0gIT09ICdhJyB8fCAhKDAgaW4gYm94ZWRTdHJpbmcpO1xuXG52YXIgcHJvcGVybHlCb3hlc0NvbnRleHQgPSBmdW5jdGlvbiBwcm9wZXJseUJveGVkKG1ldGhvZCkge1xuICAgIC8vIENoZWNrIG5vZGUgMC42LjIxIGJ1ZyB3aGVyZSB0aGlyZCBwYXJhbWV0ZXIgaXMgbm90IGJveGVkXG4gICAgdmFyIHByb3Blcmx5Qm94ZXNOb25TdHJpY3QgPSB0cnVlO1xuICAgIHZhciBwcm9wZXJseUJveGVzU3RyaWN0ID0gdHJ1ZTtcbiAgICBpZiAobWV0aG9kKSB7XG4gICAgICAgIG1ldGhvZC5jYWxsKCdmb28nLCBmdW5jdGlvbiAoXywgX18sIGNvbnRleHQpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY29udGV4dCAhPT0gJ29iamVjdCcpIHsgcHJvcGVybHlCb3hlc05vblN0cmljdCA9IGZhbHNlOyB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG1ldGhvZC5jYWxsKFsxXSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICAgICAgcHJvcGVybHlCb3hlc1N0cmljdCA9IHR5cGVvZiB0aGlzID09PSAnc3RyaW5nJztcbiAgICAgICAgfSwgJ3gnKTtcbiAgICB9XG4gICAgcmV0dXJuICEhbWV0aG9kICYmIHByb3Blcmx5Qm94ZXNOb25TdHJpY3QgJiYgcHJvcGVybHlCb3hlc1N0cmljdDtcbn07XG5cbmRlZmluZVByb3BlcnRpZXMoQXJyYXlQcm90b3R5cGUsIHtcbiAgICBmb3JFYWNoOiBmdW5jdGlvbiBmb3JFYWNoKGZ1biAvKiwgdGhpc3AqLykge1xuICAgICAgICB2YXIgb2JqZWN0ID0gdG9PYmplY3QodGhpcyksXG4gICAgICAgICAgICBzZWxmID0gc3BsaXRTdHJpbmcgJiYgaXNTdHJpbmcodGhpcykgPyB0aGlzLnNwbGl0KCcnKSA6IG9iamVjdCxcbiAgICAgICAgICAgIHRoaXNwID0gYXJndW1lbnRzWzFdLFxuICAgICAgICAgICAgaSA9IC0xLFxuICAgICAgICAgICAgbGVuZ3RoID0gc2VsZi5sZW5ndGggPj4+IDA7XG5cbiAgICAgICAgLy8gSWYgbm8gY2FsbGJhY2sgZnVuY3Rpb24gb3IgaWYgY2FsbGJhY2sgaXMgbm90IGEgY2FsbGFibGUgZnVuY3Rpb25cbiAgICAgICAgaWYgKCFpc0Z1bmN0aW9uKGZ1bikpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTsgLy8gVE9ETyBtZXNzYWdlXG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSAoKytpIDwgbGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoaSBpbiBzZWxmKSB7XG4gICAgICAgICAgICAgICAgLy8gSW52b2tlIHRoZSBjYWxsYmFjayBmdW5jdGlvbiB3aXRoIGNhbGwsIHBhc3NpbmcgYXJndW1lbnRzOlxuICAgICAgICAgICAgICAgIC8vIGNvbnRleHQsIHByb3BlcnR5IHZhbHVlLCBwcm9wZXJ0eSBrZXksIHRoaXNBcmcgb2JqZWN0XG4gICAgICAgICAgICAgICAgLy8gY29udGV4dFxuICAgICAgICAgICAgICAgIGZ1bi5jYWxsKHRoaXNwLCBzZWxmW2ldLCBpLCBvYmplY3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufSwgIXByb3Blcmx5Qm94ZXNDb250ZXh0KEFycmF5UHJvdG90eXBlLmZvckVhY2gpKTtcblxuLy8gRVM1IDE1LjQuNC4xNFxuLy8gaHR0cDovL2VzNS5naXRodWIuY29tLyN4MTUuNC40LjE0XG4vLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9pbmRleE9mXG52YXIgaGFzRmlyZWZveDJJbmRleE9mQnVnID0gQXJyYXkucHJvdG90eXBlLmluZGV4T2YgJiYgWzAsIDFdLmluZGV4T2YoMSwgMikgIT09IC0xO1xuZGVmaW5lUHJvcGVydGllcyhBcnJheVByb3RvdHlwZSwge1xuICAgIGluZGV4T2Y6IGZ1bmN0aW9uIGluZGV4T2Yoc291Z2h0IC8qLCBmcm9tSW5kZXggKi8gKSB7XG4gICAgICAgIHZhciBzZWxmID0gc3BsaXRTdHJpbmcgJiYgaXNTdHJpbmcodGhpcykgPyB0aGlzLnNwbGl0KCcnKSA6IHRvT2JqZWN0KHRoaXMpLFxuICAgICAgICAgICAgbGVuZ3RoID0gc2VsZi5sZW5ndGggPj4+IDA7XG5cbiAgICAgICAgaWYgKCFsZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBpID0gdG9JbnRlZ2VyKGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBoYW5kbGUgbmVnYXRpdmUgaW5kaWNlc1xuICAgICAgICBpID0gaSA+PSAwID8gaSA6IE1hdGgubWF4KDAsIGxlbmd0aCArIGkpO1xuICAgICAgICBmb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaSBpbiBzZWxmICYmIHNlbGZbaV0gPT09IHNvdWdodCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9XG59LCBoYXNGaXJlZm94MkluZGV4T2ZCdWcpO1xuXG4vL1xuLy8gU3RyaW5nXG4vLyA9PT09PT1cbi8vXG5cbi8vIEVTNSAxNS41LjQuMTRcbi8vIGh0dHA6Ly9lczUuZ2l0aHViLmNvbS8jeDE1LjUuNC4xNFxuXG4vLyBbYnVnZml4LCBJRSBsdCA5LCBmaXJlZm94IDQsIEtvbnF1ZXJvciwgT3BlcmEsIG9ic2N1cmUgYnJvd3NlcnNdXG4vLyBNYW55IGJyb3dzZXJzIGRvIG5vdCBzcGxpdCBwcm9wZXJseSB3aXRoIHJlZ3VsYXIgZXhwcmVzc2lvbnMgb3IgdGhleVxuLy8gZG8gbm90IHBlcmZvcm0gdGhlIHNwbGl0IGNvcnJlY3RseSB1bmRlciBvYnNjdXJlIGNvbmRpdGlvbnMuXG4vLyBTZWUgaHR0cDovL2Jsb2cuc3RldmVubGV2aXRoYW4uY29tL2FyY2hpdmVzL2Nyb3NzLWJyb3dzZXItc3BsaXRcbi8vIEkndmUgdGVzdGVkIGluIG1hbnkgYnJvd3NlcnMgYW5kIHRoaXMgc2VlbXMgdG8gY292ZXIgdGhlIGRldmlhbnQgb25lczpcbi8vICAgICdhYicuc3BsaXQoLyg/OmFiKSovKSBzaG91bGQgYmUgW1wiXCIsIFwiXCJdLCBub3QgW1wiXCJdXG4vLyAgICAnLicuc3BsaXQoLyguPykoLj8pLykgc2hvdWxkIGJlIFtcIlwiLCBcIi5cIiwgXCJcIiwgXCJcIl0sIG5vdCBbXCJcIiwgXCJcIl1cbi8vICAgICd0ZXNzdCcuc3BsaXQoLyhzKSovKSBzaG91bGQgYmUgW1widFwiLCB1bmRlZmluZWQsIFwiZVwiLCBcInNcIiwgXCJ0XCJdLCBub3Rcbi8vICAgICAgIFt1bmRlZmluZWQsIFwidFwiLCB1bmRlZmluZWQsIFwiZVwiLCAuLi5dXG4vLyAgICAnJy5zcGxpdCgvLj8vKSBzaG91bGQgYmUgW10sIG5vdCBbXCJcIl1cbi8vICAgICcuJy5zcGxpdCgvKCkoKS8pIHNob3VsZCBiZSBbXCIuXCJdLCBub3QgW1wiXCIsIFwiXCIsIFwiLlwiXVxuXG52YXIgc3RyaW5nX3NwbGl0ID0gU3RyaW5nUHJvdG90eXBlLnNwbGl0O1xuaWYgKFxuICAgICdhYicuc3BsaXQoLyg/OmFiKSovKS5sZW5ndGggIT09IDIgfHxcbiAgICAnLicuc3BsaXQoLyguPykoLj8pLykubGVuZ3RoICE9PSA0IHx8XG4gICAgJ3Rlc3N0Jy5zcGxpdCgvKHMpKi8pWzFdID09PSAndCcgfHxcbiAgICAndGVzdCcuc3BsaXQoLyg/OikvLCAtMSkubGVuZ3RoICE9PSA0IHx8XG4gICAgJycuc3BsaXQoLy4/LykubGVuZ3RoIHx8XG4gICAgJy4nLnNwbGl0KC8oKSgpLykubGVuZ3RoID4gMVxuKSB7XG4gICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNvbXBsaWFudEV4ZWNOcGNnID0gLygpPz8vLmV4ZWMoJycpWzFdID09PSB2b2lkIDA7IC8vIE5QQ0c6IG5vbnBhcnRpY2lwYXRpbmcgY2FwdHVyaW5nIGdyb3VwXG5cbiAgICAgICAgU3RyaW5nUHJvdG90eXBlLnNwbGl0ID0gZnVuY3Rpb24gKHNlcGFyYXRvciwgbGltaXQpIHtcbiAgICAgICAgICAgIHZhciBzdHJpbmcgPSB0aGlzO1xuICAgICAgICAgICAgaWYgKHNlcGFyYXRvciA9PT0gdm9pZCAwICYmIGxpbWl0ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJZiBgc2VwYXJhdG9yYCBpcyBub3QgYSByZWdleCwgdXNlIG5hdGl2ZSBzcGxpdFxuICAgICAgICAgICAgaWYgKF90b1N0cmluZy5jYWxsKHNlcGFyYXRvcikgIT09ICdbb2JqZWN0IFJlZ0V4cF0nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0cmluZ19zcGxpdC5jYWxsKHRoaXMsIHNlcGFyYXRvciwgbGltaXQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgb3V0cHV0ID0gW10sXG4gICAgICAgICAgICAgICAgZmxhZ3MgPSAoc2VwYXJhdG9yLmlnbm9yZUNhc2UgPyAnaScgOiAnJykgK1xuICAgICAgICAgICAgICAgICAgICAgICAgKHNlcGFyYXRvci5tdWx0aWxpbmUgID8gJ20nIDogJycpICtcbiAgICAgICAgICAgICAgICAgICAgICAgIChzZXBhcmF0b3IuZXh0ZW5kZWQgICA/ICd4JyA6ICcnKSArIC8vIFByb3Bvc2VkIGZvciBFUzZcbiAgICAgICAgICAgICAgICAgICAgICAgIChzZXBhcmF0b3Iuc3RpY2t5ICAgICA/ICd5JyA6ICcnKSwgLy8gRmlyZWZveCAzK1xuICAgICAgICAgICAgICAgIGxhc3RMYXN0SW5kZXggPSAwLFxuICAgICAgICAgICAgICAgIC8vIE1ha2UgYGdsb2JhbGAgYW5kIGF2b2lkIGBsYXN0SW5kZXhgIGlzc3VlcyBieSB3b3JraW5nIHdpdGggYSBjb3B5XG4gICAgICAgICAgICAgICAgc2VwYXJhdG9yMiwgbWF0Y2gsIGxhc3RJbmRleCwgbGFzdExlbmd0aDtcbiAgICAgICAgICAgIHNlcGFyYXRvciA9IG5ldyBSZWdFeHAoc2VwYXJhdG9yLnNvdXJjZSwgZmxhZ3MgKyAnZycpO1xuICAgICAgICAgICAgc3RyaW5nICs9ICcnOyAvLyBUeXBlLWNvbnZlcnRcbiAgICAgICAgICAgIGlmICghY29tcGxpYW50RXhlY05wY2cpIHtcbiAgICAgICAgICAgICAgICAvLyBEb2Vzbid0IG5lZWQgZmxhZ3MgZ3ksIGJ1dCB0aGV5IGRvbid0IGh1cnRcbiAgICAgICAgICAgICAgICBzZXBhcmF0b3IyID0gbmV3IFJlZ0V4cCgnXicgKyBzZXBhcmF0b3Iuc291cmNlICsgJyQoPyFcXFxccyknLCBmbGFncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiBWYWx1ZXMgZm9yIGBsaW1pdGAsIHBlciB0aGUgc3BlYzpcbiAgICAgICAgICAgICAqIElmIHVuZGVmaW5lZDogNDI5NDk2NzI5NSAvLyBNYXRoLnBvdygyLCAzMikgLSAxXG4gICAgICAgICAgICAgKiBJZiAwLCBJbmZpbml0eSwgb3IgTmFOOiAwXG4gICAgICAgICAgICAgKiBJZiBwb3NpdGl2ZSBudW1iZXI6IGxpbWl0ID0gTWF0aC5mbG9vcihsaW1pdCk7IGlmIChsaW1pdCA+IDQyOTQ5NjcyOTUpIGxpbWl0IC09IDQyOTQ5NjcyOTY7XG4gICAgICAgICAgICAgKiBJZiBuZWdhdGl2ZSBudW1iZXI6IDQyOTQ5NjcyOTYgLSBNYXRoLmZsb29yKE1hdGguYWJzKGxpbWl0KSlcbiAgICAgICAgICAgICAqIElmIG90aGVyOiBUeXBlLWNvbnZlcnQsIHRoZW4gdXNlIHRoZSBhYm92ZSBydWxlc1xuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBsaW1pdCA9IGxpbWl0ID09PSB2b2lkIDAgP1xuICAgICAgICAgICAgICAgIC0xID4+PiAwIDogLy8gTWF0aC5wb3coMiwgMzIpIC0gMVxuICAgICAgICAgICAgICAgIFRvVWludDMyKGxpbWl0KTtcbiAgICAgICAgICAgIHdoaWxlIChtYXRjaCA9IHNlcGFyYXRvci5leGVjKHN0cmluZykpIHtcbiAgICAgICAgICAgICAgICAvLyBgc2VwYXJhdG9yLmxhc3RJbmRleGAgaXMgbm90IHJlbGlhYmxlIGNyb3NzLWJyb3dzZXJcbiAgICAgICAgICAgICAgICBsYXN0SW5kZXggPSBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBpZiAobGFzdEluZGV4ID4gbGFzdExhc3RJbmRleCkge1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChzdHJpbmcuc2xpY2UobGFzdExhc3RJbmRleCwgbWF0Y2guaW5kZXgpKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gRml4IGJyb3dzZXJzIHdob3NlIGBleGVjYCBtZXRob2RzIGRvbid0IGNvbnNpc3RlbnRseSByZXR1cm4gYHVuZGVmaW5lZGAgZm9yXG4gICAgICAgICAgICAgICAgICAgIC8vIG5vbnBhcnRpY2lwYXRpbmcgY2FwdHVyaW5nIGdyb3Vwc1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbXBsaWFudEV4ZWNOcGNnICYmIG1hdGNoLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoWzBdLnJlcGxhY2Uoc2VwYXJhdG9yMiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aCAtIDI7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJndW1lbnRzW2ldID09PSB2b2lkIDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoW2ldID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hdGNoLmxlbmd0aCA+IDEgJiYgbWF0Y2guaW5kZXggPCBzdHJpbmcubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBBcnJheVByb3RvdHlwZS5wdXNoLmFwcGx5KG91dHB1dCwgbWF0Y2guc2xpY2UoMSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGxhc3RMZW5ndGggPSBtYXRjaFswXS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RMYXN0SW5kZXggPSBsYXN0SW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvdXRwdXQubGVuZ3RoID49IGxpbWl0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc2VwYXJhdG9yLmxhc3RJbmRleCA9PT0gbWF0Y2guaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VwYXJhdG9yLmxhc3RJbmRleCsrOyAvLyBBdm9pZCBhbiBpbmZpbml0ZSBsb29wXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxhc3RMYXN0SW5kZXggPT09IHN0cmluZy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBpZiAobGFzdExlbmd0aCB8fCAhc2VwYXJhdG9yLnRlc3QoJycpKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKCcnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKHN0cmluZy5zbGljZShsYXN0TGFzdEluZGV4KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gb3V0cHV0Lmxlbmd0aCA+IGxpbWl0ID8gb3V0cHV0LnNsaWNlKDAsIGxpbWl0KSA6IG91dHB1dDtcbiAgICAgICAgfTtcbiAgICB9KCkpO1xuXG4vLyBbYnVnZml4LCBjaHJvbWVdXG4vLyBJZiBzZXBhcmF0b3IgaXMgdW5kZWZpbmVkLCB0aGVuIHRoZSByZXN1bHQgYXJyYXkgY29udGFpbnMganVzdCBvbmUgU3RyaW5nLFxuLy8gd2hpY2ggaXMgdGhlIHRoaXMgdmFsdWUgKGNvbnZlcnRlZCB0byBhIFN0cmluZykuIElmIGxpbWl0IGlzIG5vdCB1bmRlZmluZWQsXG4vLyB0aGVuIHRoZSBvdXRwdXQgYXJyYXkgaXMgdHJ1bmNhdGVkIHNvIHRoYXQgaXQgY29udGFpbnMgbm8gbW9yZSB0aGFuIGxpbWl0XG4vLyBlbGVtZW50cy5cbi8vIFwiMFwiLnNwbGl0KHVuZGVmaW5lZCwgMCkgLT4gW11cbn0gZWxzZSBpZiAoJzAnLnNwbGl0KHZvaWQgMCwgMCkubGVuZ3RoKSB7XG4gICAgU3RyaW5nUHJvdG90eXBlLnNwbGl0ID0gZnVuY3Rpb24gc3BsaXQoc2VwYXJhdG9yLCBsaW1pdCkge1xuICAgICAgICBpZiAoc2VwYXJhdG9yID09PSB2b2lkIDAgJiYgbGltaXQgPT09IDApIHsgcmV0dXJuIFtdOyB9XG4gICAgICAgIHJldHVybiBzdHJpbmdfc3BsaXQuY2FsbCh0aGlzLCBzZXBhcmF0b3IsIGxpbWl0KTtcbiAgICB9O1xufVxuXG4vLyBFQ01BLTI2MiwgM3JkIEIuMi4zXG4vLyBOb3QgYW4gRUNNQVNjcmlwdCBzdGFuZGFyZCwgYWx0aG91Z2ggRUNNQVNjcmlwdCAzcmQgRWRpdGlvbiBoYXMgYVxuLy8gbm9uLW5vcm1hdGl2ZSBzZWN0aW9uIHN1Z2dlc3RpbmcgdW5pZm9ybSBzZW1hbnRpY3MgYW5kIGl0IHNob3VsZCBiZVxuLy8gbm9ybWFsaXplZCBhY3Jvc3MgYWxsIGJyb3dzZXJzXG4vLyBbYnVnZml4LCBJRSBsdCA5XSBJRSA8IDkgc3Vic3RyKCkgd2l0aCBuZWdhdGl2ZSB2YWx1ZSBub3Qgd29ya2luZyBpbiBJRVxudmFyIHN0cmluZ19zdWJzdHIgPSBTdHJpbmdQcm90b3R5cGUuc3Vic3RyO1xudmFyIGhhc05lZ2F0aXZlU3Vic3RyQnVnID0gJycuc3Vic3RyICYmICcwYicuc3Vic3RyKC0xKSAhPT0gJ2InO1xuZGVmaW5lUHJvcGVydGllcyhTdHJpbmdQcm90b3R5cGUsIHtcbiAgICBzdWJzdHI6IGZ1bmN0aW9uIHN1YnN0cihzdGFydCwgbGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmdfc3Vic3RyLmNhbGwoXG4gICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgc3RhcnQgPCAwID8gKChzdGFydCA9IHRoaXMubGVuZ3RoICsgc3RhcnQpIDwgMCA/IDAgOiBzdGFydCkgOiBzdGFydCxcbiAgICAgICAgICAgIGxlbmd0aFxuICAgICAgICApO1xuICAgIH1cbn0sIGhhc05lZ2F0aXZlU3Vic3RyQnVnKTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBbXG4gIC8vIHN0cmVhbWluZyB0cmFuc3BvcnRzXG4gIHJlcXVpcmUoJy4vdHJhbnNwb3J0L3dlYnNvY2tldCcpXG4sIHJlcXVpcmUoJy4vdHJhbnNwb3J0L3hoci1zdHJlYW1pbmcnKVxuLCByZXF1aXJlKCcuL3RyYW5zcG9ydC94ZHItc3RyZWFtaW5nJylcbiwgcmVxdWlyZSgnLi90cmFuc3BvcnQvZXZlbnRzb3VyY2UnKVxuLCByZXF1aXJlKCcuL3RyYW5zcG9ydC9saWIvaWZyYW1lLXdyYXAnKShyZXF1aXJlKCcuL3RyYW5zcG9ydC9ldmVudHNvdXJjZScpKVxuXG4gIC8vIHBvbGxpbmcgdHJhbnNwb3J0c1xuLCByZXF1aXJlKCcuL3RyYW5zcG9ydC9odG1sZmlsZScpXG4sIHJlcXVpcmUoJy4vdHJhbnNwb3J0L2xpYi9pZnJhbWUtd3JhcCcpKHJlcXVpcmUoJy4vdHJhbnNwb3J0L2h0bWxmaWxlJykpXG4sIHJlcXVpcmUoJy4vdHJhbnNwb3J0L3hoci1wb2xsaW5nJylcbiwgcmVxdWlyZSgnLi90cmFuc3BvcnQveGRyLXBvbGxpbmcnKVxuLCByZXF1aXJlKCcuL3RyYW5zcG9ydC9saWIvaWZyYW1lLXdyYXAnKShyZXF1aXJlKCcuL3RyYW5zcG9ydC94aHItcG9sbGluZycpKVxuLCByZXF1aXJlKCcuL3RyYW5zcG9ydC9qc29ucC1wb2xsaW5nJylcbl07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXJcbiAgLCBpbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJylcbiAgLCB1dGlscyA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL2V2ZW50JylcbiAgLCB1cmxVdGlscyA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3VybCcpXG4gICwgWEhSID0gZ2xvYmFsLlhNTEh0dHBSZXF1ZXN0XG4gIDtcblxudmFyIGRlYnVnID0gZnVuY3Rpb24oKSB7fTtcbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnc29ja2pzLWNsaWVudDpicm93c2VyOnhocicpO1xufVxuXG5mdW5jdGlvbiBBYnN0cmFjdFhIUk9iamVjdChtZXRob2QsIHVybCwgcGF5bG9hZCwgb3B0cykge1xuICBkZWJ1ZyhtZXRob2QsIHVybCk7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgRXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG5cbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgc2VsZi5fc3RhcnQobWV0aG9kLCB1cmwsIHBheWxvYWQsIG9wdHMpO1xuICB9LCAwKTtcbn1cblxuaW5oZXJpdHMoQWJzdHJhY3RYSFJPYmplY3QsIEV2ZW50RW1pdHRlcik7XG5cbkFic3RyYWN0WEhST2JqZWN0LnByb3RvdHlwZS5fc3RhcnQgPSBmdW5jdGlvbihtZXRob2QsIHVybCwgcGF5bG9hZCwgb3B0cykge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgdHJ5IHtcbiAgICB0aGlzLnhociA9IG5ldyBYSFIoKTtcbiAgfSBjYXRjaCAoeCkge1xuICAgIC8vIGludGVudGlvbmFsbHkgZW1wdHlcbiAgfVxuXG4gIGlmICghdGhpcy54aHIpIHtcbiAgICBkZWJ1Zygnbm8geGhyJyk7XG4gICAgdGhpcy5lbWl0KCdmaW5pc2gnLCAwLCAnbm8geGhyIHN1cHBvcnQnKTtcbiAgICB0aGlzLl9jbGVhbnVwKCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gc2V2ZXJhbCBicm93c2VycyBjYWNoZSBQT1NUc1xuICB1cmwgPSB1cmxVdGlscy5hZGRRdWVyeSh1cmwsICd0PScgKyAoK25ldyBEYXRlKCkpKTtcblxuICAvLyBFeHBsb3JlciB0ZW5kcyB0byBrZWVwIGNvbm5lY3Rpb24gb3BlbiwgZXZlbiBhZnRlciB0aGVcbiAgLy8gdGFiIGdldHMgY2xvc2VkOiBodHRwOi8vYnVncy5qcXVlcnkuY29tL3RpY2tldC81MjgwXG4gIHRoaXMudW5sb2FkUmVmID0gdXRpbHMudW5sb2FkQWRkKGZ1bmN0aW9uKCkge1xuICAgIGRlYnVnKCd1bmxvYWQgY2xlYW51cCcpO1xuICAgIHNlbGYuX2NsZWFudXAodHJ1ZSk7XG4gIH0pO1xuICB0cnkge1xuICAgIHRoaXMueGhyLm9wZW4obWV0aG9kLCB1cmwsIHRydWUpO1xuICAgIGlmICh0aGlzLnRpbWVvdXQgJiYgJ3RpbWVvdXQnIGluIHRoaXMueGhyKSB7XG4gICAgICB0aGlzLnhoci50aW1lb3V0ID0gdGhpcy50aW1lb3V0O1xuICAgICAgdGhpcy54aHIub250aW1lb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGRlYnVnKCd4aHIgdGltZW91dCcpO1xuICAgICAgICBzZWxmLmVtaXQoJ2ZpbmlzaCcsIDAsICcnKTtcbiAgICAgICAgc2VsZi5fY2xlYW51cChmYWxzZSk7XG4gICAgICB9O1xuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIGRlYnVnKCdleGNlcHRpb24nLCBlKTtcbiAgICAvLyBJRSByYWlzZXMgYW4gZXhjZXB0aW9uIG9uIHdyb25nIHBvcnQuXG4gICAgdGhpcy5lbWl0KCdmaW5pc2gnLCAwLCAnJyk7XG4gICAgdGhpcy5fY2xlYW51cChmYWxzZSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKCghb3B0cyB8fCAhb3B0cy5ub0NyZWRlbnRpYWxzKSAmJiBBYnN0cmFjdFhIUk9iamVjdC5zdXBwb3J0c0NPUlMpIHtcbiAgICBkZWJ1Zygnd2l0aENyZWRlbnRpYWxzJyk7XG4gICAgLy8gTW96aWxsYSBkb2NzIHNheXMgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4vWE1MSHR0cFJlcXVlc3QgOlxuICAgIC8vIFwiVGhpcyBuZXZlciBhZmZlY3RzIHNhbWUtc2l0ZSByZXF1ZXN0cy5cIlxuXG4gICAgdGhpcy54aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgfVxuICBpZiAob3B0cyAmJiBvcHRzLmhlYWRlcnMpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gb3B0cy5oZWFkZXJzKSB7XG4gICAgICB0aGlzLnhoci5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgb3B0cy5oZWFkZXJzW2tleV0pO1xuICAgIH1cbiAgfVxuXG4gIHRoaXMueGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChzZWxmLnhocikge1xuICAgICAgdmFyIHggPSBzZWxmLnhocjtcbiAgICAgIHZhciB0ZXh0LCBzdGF0dXM7XG4gICAgICBkZWJ1ZygncmVhZHlTdGF0ZScsIHgucmVhZHlTdGF0ZSk7XG4gICAgICBzd2l0Y2ggKHgucmVhZHlTdGF0ZSkge1xuICAgICAgY2FzZSAzOlxuICAgICAgICAvLyBJRSBkb2Vzbid0IGxpa2UgcGVla2luZyBpbnRvIHJlc3BvbnNlVGV4dCBvciBzdGF0dXNcbiAgICAgICAgLy8gb24gTWljcm9zb2Z0LlhNTEhUVFAgYW5kIHJlYWR5c3RhdGU9M1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHN0YXR1cyA9IHguc3RhdHVzO1xuICAgICAgICAgIHRleHQgPSB4LnJlc3BvbnNlVGV4dDtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIC8vIGludGVudGlvbmFsbHkgZW1wdHlcbiAgICAgICAgfVxuICAgICAgICBkZWJ1Zygnc3RhdHVzJywgc3RhdHVzKTtcbiAgICAgICAgLy8gSUUgcmV0dXJucyAxMjIzIGZvciAyMDQ6IGh0dHA6Ly9idWdzLmpxdWVyeS5jb20vdGlja2V0LzE0NTBcbiAgICAgICAgaWYgKHN0YXR1cyA9PT0gMTIyMykge1xuICAgICAgICAgIHN0YXR1cyA9IDIwNDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElFIGRvZXMgcmV0dXJuIHJlYWR5c3RhdGUgPT0gMyBmb3IgNDA0IGFuc3dlcnMuXG4gICAgICAgIGlmIChzdGF0dXMgPT09IDIwMCAmJiB0ZXh0ICYmIHRleHQubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGRlYnVnKCdjaHVuaycpO1xuICAgICAgICAgIHNlbGYuZW1pdCgnY2h1bmsnLCBzdGF0dXMsIHRleHQpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA0OlxuICAgICAgICBzdGF0dXMgPSB4LnN0YXR1cztcbiAgICAgICAgZGVidWcoJ3N0YXR1cycsIHN0YXR1cyk7XG4gICAgICAgIC8vIElFIHJldHVybnMgMTIyMyBmb3IgMjA0OiBodHRwOi8vYnVncy5qcXVlcnkuY29tL3RpY2tldC8xNDUwXG4gICAgICAgIGlmIChzdGF0dXMgPT09IDEyMjMpIHtcbiAgICAgICAgICBzdGF0dXMgPSAyMDQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gSUUgcmV0dXJucyB0aGlzIGZvciBhIGJhZCBwb3J0XG4gICAgICAgIC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS93aW5kb3dzL2Rlc2t0b3AvYWEzODM3NzAodj12cy44NSkuYXNweFxuICAgICAgICBpZiAoc3RhdHVzID09PSAxMjAwNSB8fCBzdGF0dXMgPT09IDEyMDI5KSB7XG4gICAgICAgICAgc3RhdHVzID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGRlYnVnKCdmaW5pc2gnLCBzdGF0dXMsIHgucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgc2VsZi5lbWl0KCdmaW5pc2gnLCBzdGF0dXMsIHgucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgc2VsZi5fY2xlYW51cChmYWxzZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICB0cnkge1xuICAgIHNlbGYueGhyLnNlbmQocGF5bG9hZCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBzZWxmLmVtaXQoJ2ZpbmlzaCcsIDAsICcnKTtcbiAgICBzZWxmLl9jbGVhbnVwKGZhbHNlKTtcbiAgfVxufTtcblxuQWJzdHJhY3RYSFJPYmplY3QucHJvdG90eXBlLl9jbGVhbnVwID0gZnVuY3Rpb24oYWJvcnQpIHtcbiAgZGVidWcoJ2NsZWFudXAnKTtcbiAgaWYgKCF0aGlzLnhocikge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICB1dGlscy51bmxvYWREZWwodGhpcy51bmxvYWRSZWYpO1xuXG4gIC8vIElFIG5lZWRzIHRoaXMgZmllbGQgdG8gYmUgYSBmdW5jdGlvblxuICB0aGlzLnhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHt9O1xuICBpZiAodGhpcy54aHIub250aW1lb3V0KSB7XG4gICAgdGhpcy54aHIub250aW1lb3V0ID0gbnVsbDtcbiAgfVxuXG4gIGlmIChhYm9ydCkge1xuICAgIHRyeSB7XG4gICAgICB0aGlzLnhoci5hYm9ydCgpO1xuICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgIC8vIGludGVudGlvbmFsbHkgZW1wdHlcbiAgICB9XG4gIH1cbiAgdGhpcy51bmxvYWRSZWYgPSB0aGlzLnhociA9IG51bGw7XG59O1xuXG5BYnN0cmFjdFhIUk9iamVjdC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgZGVidWcoJ2Nsb3NlJyk7XG4gIHRoaXMuX2NsZWFudXAodHJ1ZSk7XG59O1xuXG5BYnN0cmFjdFhIUk9iamVjdC5lbmFibGVkID0gISFYSFI7XG4vLyBvdmVycmlkZSBYTUxIdHRwUmVxdWVzdCBmb3IgSUU2Lzdcbi8vIG9iZnVzY2F0ZSB0byBhdm9pZCBmaXJld2FsbHNcbnZhciBheG8gPSBbJ0FjdGl2ZSddLmNvbmNhdCgnT2JqZWN0Jykuam9pbignWCcpO1xuaWYgKCFBYnN0cmFjdFhIUk9iamVjdC5lbmFibGVkICYmIChheG8gaW4gZ2xvYmFsKSkge1xuICBkZWJ1Zygnb3ZlcnJpZGluZyB4bWxodHRwcmVxdWVzdCcpO1xuICBYSFIgPSBmdW5jdGlvbigpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIG5ldyBnbG9iYWxbYXhvXSgnTWljcm9zb2Z0LlhNTEhUVFAnKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH07XG4gIEFic3RyYWN0WEhST2JqZWN0LmVuYWJsZWQgPSAhIW5ldyBYSFIoKTtcbn1cblxudmFyIGNvcnMgPSBmYWxzZTtcbnRyeSB7XG4gIGNvcnMgPSAnd2l0aENyZWRlbnRpYWxzJyBpbiBuZXcgWEhSKCk7XG59IGNhdGNoIChpZ25vcmVkKSB7XG4gIC8vIGludGVudGlvbmFsbHkgZW1wdHlcbn1cblxuQWJzdHJhY3RYSFJPYmplY3Quc3VwcG9ydHNDT1JTID0gY29ycztcblxubW9kdWxlLmV4cG9ydHMgPSBBYnN0cmFjdFhIUk9iamVjdDtcbiIsIm1vZHVsZS5leHBvcnRzID0gZ2xvYmFsLkV2ZW50U291cmNlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgRHJpdmVyID0gZ2xvYmFsLldlYlNvY2tldCB8fCBnbG9iYWwuTW96V2ViU29ja2V0O1xuaWYgKERyaXZlcikge1xuXHRtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFdlYlNvY2tldEJyb3dzZXJEcml2ZXIodXJsKSB7XG5cdFx0cmV0dXJuIG5ldyBEcml2ZXIodXJsKTtcblx0fTtcbn0gZWxzZSB7XG5cdG1vZHVsZS5leHBvcnRzID0gdW5kZWZpbmVkO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpXG4gICwgQWpheEJhc2VkVHJhbnNwb3J0ID0gcmVxdWlyZSgnLi9saWIvYWpheC1iYXNlZCcpXG4gICwgRXZlbnRTb3VyY2VSZWNlaXZlciA9IHJlcXVpcmUoJy4vcmVjZWl2ZXIvZXZlbnRzb3VyY2UnKVxuICAsIFhIUkNvcnNPYmplY3QgPSByZXF1aXJlKCcuL3NlbmRlci94aHItY29ycycpXG4gICwgRXZlbnRTb3VyY2VEcml2ZXIgPSByZXF1aXJlKCdldmVudHNvdXJjZScpXG4gIDtcblxuZnVuY3Rpb24gRXZlbnRTb3VyY2VUcmFuc3BvcnQodHJhbnNVcmwpIHtcbiAgaWYgKCFFdmVudFNvdXJjZVRyYW5zcG9ydC5lbmFibGVkKCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RyYW5zcG9ydCBjcmVhdGVkIHdoZW4gZGlzYWJsZWQnKTtcbiAgfVxuXG4gIEFqYXhCYXNlZFRyYW5zcG9ydC5jYWxsKHRoaXMsIHRyYW5zVXJsLCAnL2V2ZW50c291cmNlJywgRXZlbnRTb3VyY2VSZWNlaXZlciwgWEhSQ29yc09iamVjdCk7XG59XG5cbmluaGVyaXRzKEV2ZW50U291cmNlVHJhbnNwb3J0LCBBamF4QmFzZWRUcmFuc3BvcnQpO1xuXG5FdmVudFNvdXJjZVRyYW5zcG9ydC5lbmFibGVkID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAhIUV2ZW50U291cmNlRHJpdmVyO1xufTtcblxuRXZlbnRTb3VyY2VUcmFuc3BvcnQudHJhbnNwb3J0TmFtZSA9ICdldmVudHNvdXJjZSc7XG5FdmVudFNvdXJjZVRyYW5zcG9ydC5yb3VuZFRyaXBzID0gMjtcblxubW9kdWxlLmV4cG9ydHMgPSBFdmVudFNvdXJjZVRyYW5zcG9ydDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKVxuICAsIEh0bWxmaWxlUmVjZWl2ZXIgPSByZXF1aXJlKCcuL3JlY2VpdmVyL2h0bWxmaWxlJylcbiAgLCBYSFJMb2NhbE9iamVjdCA9IHJlcXVpcmUoJy4vc2VuZGVyL3hoci1sb2NhbCcpXG4gICwgQWpheEJhc2VkVHJhbnNwb3J0ID0gcmVxdWlyZSgnLi9saWIvYWpheC1iYXNlZCcpXG4gIDtcblxuZnVuY3Rpb24gSHRtbEZpbGVUcmFuc3BvcnQodHJhbnNVcmwpIHtcbiAgaWYgKCFIdG1sZmlsZVJlY2VpdmVyLmVuYWJsZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RyYW5zcG9ydCBjcmVhdGVkIHdoZW4gZGlzYWJsZWQnKTtcbiAgfVxuICBBamF4QmFzZWRUcmFuc3BvcnQuY2FsbCh0aGlzLCB0cmFuc1VybCwgJy9odG1sZmlsZScsIEh0bWxmaWxlUmVjZWl2ZXIsIFhIUkxvY2FsT2JqZWN0KTtcbn1cblxuaW5oZXJpdHMoSHRtbEZpbGVUcmFuc3BvcnQsIEFqYXhCYXNlZFRyYW5zcG9ydCk7XG5cbkh0bWxGaWxlVHJhbnNwb3J0LmVuYWJsZWQgPSBmdW5jdGlvbihpbmZvKSB7XG4gIHJldHVybiBIdG1sZmlsZVJlY2VpdmVyLmVuYWJsZWQgJiYgaW5mby5zYW1lT3JpZ2luO1xufTtcblxuSHRtbEZpbGVUcmFuc3BvcnQudHJhbnNwb3J0TmFtZSA9ICdodG1sZmlsZSc7XG5IdG1sRmlsZVRyYW5zcG9ydC5yb3VuZFRyaXBzID0gMjtcblxubW9kdWxlLmV4cG9ydHMgPSBIdG1sRmlsZVRyYW5zcG9ydDtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gRmV3IGNvb2wgdHJhbnNwb3J0cyBkbyB3b3JrIG9ubHkgZm9yIHNhbWUtb3JpZ2luLiBJbiBvcmRlciB0byBtYWtlXG4vLyB0aGVtIHdvcmsgY3Jvc3MtZG9tYWluIHdlIHNoYWxsIHVzZSBpZnJhbWUsIHNlcnZlZCBmcm9tIHRoZVxuLy8gcmVtb3RlIGRvbWFpbi4gTmV3IGJyb3dzZXJzIGhhdmUgY2FwYWJpbGl0aWVzIHRvIGNvbW11bmljYXRlIHdpdGhcbi8vIGNyb3NzIGRvbWFpbiBpZnJhbWUgdXNpbmcgcG9zdE1lc3NhZ2UoKS4gSW4gSUUgaXQgd2FzIGltcGxlbWVudGVkXG4vLyBmcm9tIElFIDgrLCBidXQgb2YgY291cnNlLCBJRSBnb3Qgc29tZSBkZXRhaWxzIHdyb25nOlxuLy8gICAgaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2NjMTk3MDE1KHY9VlMuODUpLmFzcHhcbi8vICAgIGh0dHA6Ly9zdGV2ZXNvdWRlcnMuY29tL21pc2MvdGVzdC1wb3N0bWVzc2FnZS5waHBcblxudmFyIGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKVxuICAsIEpTT04zID0gcmVxdWlyZSgnanNvbjMnKVxuICAsIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlclxuICAsIHZlcnNpb24gPSByZXF1aXJlKCcuLi92ZXJzaW9uJylcbiAgLCB1cmxVdGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzL3VybCcpXG4gICwgaWZyYW1lVXRpbHMgPSByZXF1aXJlKCcuLi91dGlscy9pZnJhbWUnKVxuICAsIGV2ZW50VXRpbHMgPSByZXF1aXJlKCcuLi91dGlscy9ldmVudCcpXG4gICwgcmFuZG9tID0gcmVxdWlyZSgnLi4vdXRpbHMvcmFuZG9tJylcbiAgO1xuXG52YXIgZGVidWcgPSBmdW5jdGlvbigpIHt9O1xuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCdzb2NranMtY2xpZW50OnRyYW5zcG9ydDppZnJhbWUnKTtcbn1cblxuZnVuY3Rpb24gSWZyYW1lVHJhbnNwb3J0KHRyYW5zcG9ydCwgdHJhbnNVcmwsIGJhc2VVcmwpIHtcbiAgaWYgKCFJZnJhbWVUcmFuc3BvcnQuZW5hYmxlZCgpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdUcmFuc3BvcnQgY3JlYXRlZCB3aGVuIGRpc2FibGVkJyk7XG4gIH1cbiAgRXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB0aGlzLm9yaWdpbiA9IHVybFV0aWxzLmdldE9yaWdpbihiYXNlVXJsKTtcbiAgdGhpcy5iYXNlVXJsID0gYmFzZVVybDtcbiAgdGhpcy50cmFuc1VybCA9IHRyYW5zVXJsO1xuICB0aGlzLnRyYW5zcG9ydCA9IHRyYW5zcG9ydDtcbiAgdGhpcy53aW5kb3dJZCA9IHJhbmRvbS5zdHJpbmcoOCk7XG5cbiAgdmFyIGlmcmFtZVVybCA9IHVybFV0aWxzLmFkZFBhdGgoYmFzZVVybCwgJy9pZnJhbWUuaHRtbCcpICsgJyMnICsgdGhpcy53aW5kb3dJZDtcbiAgZGVidWcodHJhbnNwb3J0LCB0cmFuc1VybCwgaWZyYW1lVXJsKTtcblxuICB0aGlzLmlmcmFtZU9iaiA9IGlmcmFtZVV0aWxzLmNyZWF0ZUlmcmFtZShpZnJhbWVVcmwsIGZ1bmN0aW9uKHIpIHtcbiAgICBkZWJ1ZygnZXJyIGNhbGxiYWNrJyk7XG4gICAgc2VsZi5lbWl0KCdjbG9zZScsIDEwMDYsICdVbmFibGUgdG8gbG9hZCBhbiBpZnJhbWUgKCcgKyByICsgJyknKTtcbiAgICBzZWxmLmNsb3NlKCk7XG4gIH0pO1xuXG4gIHRoaXMub25tZXNzYWdlQ2FsbGJhY2sgPSB0aGlzLl9tZXNzYWdlLmJpbmQodGhpcyk7XG4gIGV2ZW50VXRpbHMuYXR0YWNoRXZlbnQoJ21lc3NhZ2UnLCB0aGlzLm9ubWVzc2FnZUNhbGxiYWNrKTtcbn1cblxuaW5oZXJpdHMoSWZyYW1lVHJhbnNwb3J0LCBFdmVudEVtaXR0ZXIpO1xuXG5JZnJhbWVUcmFuc3BvcnQucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gIGRlYnVnKCdjbG9zZScpO1xuICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICBpZiAodGhpcy5pZnJhbWVPYmopIHtcbiAgICBldmVudFV0aWxzLmRldGFjaEV2ZW50KCdtZXNzYWdlJywgdGhpcy5vbm1lc3NhZ2VDYWxsYmFjayk7XG4gICAgdHJ5IHtcbiAgICAgIC8vIFdoZW4gdGhlIGlmcmFtZSBpcyBub3QgbG9hZGVkLCBJRSByYWlzZXMgYW4gZXhjZXB0aW9uXG4gICAgICAvLyBvbiAnY29udGVudFdpbmRvdycuXG4gICAgICB0aGlzLnBvc3RNZXNzYWdlKCdjJyk7XG4gICAgfSBjYXRjaCAoeCkge1xuICAgICAgLy8gaW50ZW50aW9uYWxseSBlbXB0eVxuICAgIH1cbiAgICB0aGlzLmlmcmFtZU9iai5jbGVhbnVwKCk7XG4gICAgdGhpcy5pZnJhbWVPYmogPSBudWxsO1xuICAgIHRoaXMub25tZXNzYWdlQ2FsbGJhY2sgPSB0aGlzLmlmcmFtZU9iaiA9IG51bGw7XG4gIH1cbn07XG5cbklmcmFtZVRyYW5zcG9ydC5wcm90b3R5cGUuX21lc3NhZ2UgPSBmdW5jdGlvbihlKSB7XG4gIGRlYnVnKCdtZXNzYWdlJywgZS5kYXRhKTtcbiAgaWYgKCF1cmxVdGlscy5pc09yaWdpbkVxdWFsKGUub3JpZ2luLCB0aGlzLm9yaWdpbikpIHtcbiAgICBkZWJ1Zygnbm90IHNhbWUgb3JpZ2luJywgZS5vcmlnaW4sIHRoaXMub3JpZ2luKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgaWZyYW1lTWVzc2FnZTtcbiAgdHJ5IHtcbiAgICBpZnJhbWVNZXNzYWdlID0gSlNPTjMucGFyc2UoZS5kYXRhKTtcbiAgfSBjYXRjaCAoaWdub3JlZCkge1xuICAgIGRlYnVnKCdiYWQganNvbicsIGUuZGF0YSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGlmcmFtZU1lc3NhZ2Uud2luZG93SWQgIT09IHRoaXMud2luZG93SWQpIHtcbiAgICBkZWJ1ZygnbWlzbWF0Y2hlZCB3aW5kb3cgaWQnLCBpZnJhbWVNZXNzYWdlLndpbmRvd0lkLCB0aGlzLndpbmRvd0lkKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBzd2l0Y2ggKGlmcmFtZU1lc3NhZ2UudHlwZSkge1xuICBjYXNlICdzJzpcbiAgICB0aGlzLmlmcmFtZU9iai5sb2FkZWQoKTtcbiAgICAvLyB3aW5kb3cgZ2xvYmFsIGRlcGVuZGVuY3lcbiAgICB0aGlzLnBvc3RNZXNzYWdlKCdzJywgSlNPTjMuc3RyaW5naWZ5KFtcbiAgICAgIHZlcnNpb25cbiAgICAsIHRoaXMudHJhbnNwb3J0XG4gICAgLCB0aGlzLnRyYW5zVXJsXG4gICAgLCB0aGlzLmJhc2VVcmxcbiAgICBdKSk7XG4gICAgYnJlYWs7XG4gIGNhc2UgJ3QnOlxuICAgIHRoaXMuZW1pdCgnbWVzc2FnZScsIGlmcmFtZU1lc3NhZ2UuZGF0YSk7XG4gICAgYnJlYWs7XG4gIGNhc2UgJ2MnOlxuICAgIHZhciBjZGF0YTtcbiAgICB0cnkge1xuICAgICAgY2RhdGEgPSBKU09OMy5wYXJzZShpZnJhbWVNZXNzYWdlLmRhdGEpO1xuICAgIH0gY2F0Y2ggKGlnbm9yZWQpIHtcbiAgICAgIGRlYnVnKCdiYWQganNvbicsIGlmcmFtZU1lc3NhZ2UuZGF0YSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZW1pdCgnY2xvc2UnLCBjZGF0YVswXSwgY2RhdGFbMV0pO1xuICAgIHRoaXMuY2xvc2UoKTtcbiAgICBicmVhaztcbiAgfVxufTtcblxuSWZyYW1lVHJhbnNwb3J0LnByb3RvdHlwZS5wb3N0TWVzc2FnZSA9IGZ1bmN0aW9uKHR5cGUsIGRhdGEpIHtcbiAgZGVidWcoJ3Bvc3RNZXNzYWdlJywgdHlwZSwgZGF0YSk7XG4gIHRoaXMuaWZyYW1lT2JqLnBvc3QoSlNPTjMuc3RyaW5naWZ5KHtcbiAgICB3aW5kb3dJZDogdGhpcy53aW5kb3dJZFxuICAsIHR5cGU6IHR5cGVcbiAgLCBkYXRhOiBkYXRhIHx8ICcnXG4gIH0pLCB0aGlzLm9yaWdpbik7XG59O1xuXG5JZnJhbWVUcmFuc3BvcnQucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG4gIGRlYnVnKCdzZW5kJywgbWVzc2FnZSk7XG4gIHRoaXMucG9zdE1lc3NhZ2UoJ20nLCBtZXNzYWdlKTtcbn07XG5cbklmcmFtZVRyYW5zcG9ydC5lbmFibGVkID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBpZnJhbWVVdGlscy5pZnJhbWVFbmFibGVkO1xufTtcblxuSWZyYW1lVHJhbnNwb3J0LnRyYW5zcG9ydE5hbWUgPSAnaWZyYW1lJztcbklmcmFtZVRyYW5zcG9ydC5yb3VuZFRyaXBzID0gMjtcblxubW9kdWxlLmV4cG9ydHMgPSBJZnJhbWVUcmFuc3BvcnQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIFRoZSBzaW1wbGVzdCBhbmQgbW9zdCByb2J1c3QgdHJhbnNwb3J0LCB1c2luZyB0aGUgd2VsbC1rbm93IGNyb3NzXG4vLyBkb21haW4gaGFjayAtIEpTT05QLiBUaGlzIHRyYW5zcG9ydCBpcyBxdWl0ZSBpbmVmZmljaWVudCAtIG9uZVxuLy8gbWVzc2FnZSBjb3VsZCB1c2UgdXAgdG8gb25lIGh0dHAgcmVxdWVzdC4gQnV0IGF0IGxlYXN0IGl0IHdvcmtzIGFsbW9zdFxuLy8gZXZlcnl3aGVyZS5cbi8vIEtub3duIGxpbWl0YXRpb25zOlxuLy8gICBvIHlvdSB3aWxsIGdldCBhIHNwaW5uaW5nIGN1cnNvclxuLy8gICBvIGZvciBLb25xdWVyb3IgYSBkdW1iIHRpbWVyIGlzIG5lZWRlZCB0byBkZXRlY3QgZXJyb3JzXG5cbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJylcbiAgLCBTZW5kZXJSZWNlaXZlciA9IHJlcXVpcmUoJy4vbGliL3NlbmRlci1yZWNlaXZlcicpXG4gICwgSnNvbnBSZWNlaXZlciA9IHJlcXVpcmUoJy4vcmVjZWl2ZXIvanNvbnAnKVxuICAsIGpzb25wU2VuZGVyID0gcmVxdWlyZSgnLi9zZW5kZXIvanNvbnAnKVxuICA7XG5cbmZ1bmN0aW9uIEpzb25QVHJhbnNwb3J0KHRyYW5zVXJsKSB7XG4gIGlmICghSnNvblBUcmFuc3BvcnQuZW5hYmxlZCgpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdUcmFuc3BvcnQgY3JlYXRlZCB3aGVuIGRpc2FibGVkJyk7XG4gIH1cbiAgU2VuZGVyUmVjZWl2ZXIuY2FsbCh0aGlzLCB0cmFuc1VybCwgJy9qc29ucCcsIGpzb25wU2VuZGVyLCBKc29ucFJlY2VpdmVyKTtcbn1cblxuaW5oZXJpdHMoSnNvblBUcmFuc3BvcnQsIFNlbmRlclJlY2VpdmVyKTtcblxuSnNvblBUcmFuc3BvcnQuZW5hYmxlZCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gISFnbG9iYWwuZG9jdW1lbnQ7XG59O1xuXG5Kc29uUFRyYW5zcG9ydC50cmFuc3BvcnROYW1lID0gJ2pzb25wLXBvbGxpbmcnO1xuSnNvblBUcmFuc3BvcnQucm91bmRUcmlwcyA9IDE7XG5Kc29uUFRyYW5zcG9ydC5uZWVkQm9keSA9IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gSnNvblBUcmFuc3BvcnQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJylcbiAgLCB1cmxVdGlscyA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3VybCcpXG4gICwgU2VuZGVyUmVjZWl2ZXIgPSByZXF1aXJlKCcuL3NlbmRlci1yZWNlaXZlcicpXG4gIDtcblxudmFyIGRlYnVnID0gZnVuY3Rpb24oKSB7fTtcbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnc29ja2pzLWNsaWVudDphamF4LWJhc2VkJyk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUFqYXhTZW5kZXIoQWpheE9iamVjdCkge1xuICByZXR1cm4gZnVuY3Rpb24odXJsLCBwYXlsb2FkLCBjYWxsYmFjaykge1xuICAgIGRlYnVnKCdjcmVhdGUgYWpheCBzZW5kZXInLCB1cmwsIHBheWxvYWQpO1xuICAgIHZhciBvcHQgPSB7fTtcbiAgICBpZiAodHlwZW9mIHBheWxvYWQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBvcHQuaGVhZGVycyA9IHsnQ29udGVudC10eXBlJzogJ3RleHQvcGxhaW4nfTtcbiAgICB9XG4gICAgdmFyIGFqYXhVcmwgPSB1cmxVdGlscy5hZGRQYXRoKHVybCwgJy94aHJfc2VuZCcpO1xuICAgIHZhciB4byA9IG5ldyBBamF4T2JqZWN0KCdQT1NUJywgYWpheFVybCwgcGF5bG9hZCwgb3B0KTtcbiAgICB4by5vbmNlKCdmaW5pc2gnLCBmdW5jdGlvbihzdGF0dXMpIHtcbiAgICAgIGRlYnVnKCdmaW5pc2gnLCBzdGF0dXMpO1xuICAgICAgeG8gPSBudWxsO1xuXG4gICAgICBpZiAoc3RhdHVzICE9PSAyMDAgJiYgc3RhdHVzICE9PSAyMDQpIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG5ldyBFcnJvcignaHR0cCBzdGF0dXMgJyArIHN0YXR1cykpO1xuICAgICAgfVxuICAgICAgY2FsbGJhY2soKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnYWJvcnQnKTtcbiAgICAgIHhvLmNsb3NlKCk7XG4gICAgICB4byA9IG51bGw7XG5cbiAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ0Fib3J0ZWQnKTtcbiAgICAgIGVyci5jb2RlID0gMTAwMDtcbiAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgfTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gQWpheEJhc2VkVHJhbnNwb3J0KHRyYW5zVXJsLCB1cmxTdWZmaXgsIFJlY2VpdmVyLCBBamF4T2JqZWN0KSB7XG4gIFNlbmRlclJlY2VpdmVyLmNhbGwodGhpcywgdHJhbnNVcmwsIHVybFN1ZmZpeCwgY3JlYXRlQWpheFNlbmRlcihBamF4T2JqZWN0KSwgUmVjZWl2ZXIsIEFqYXhPYmplY3QpO1xufVxuXG5pbmhlcml0cyhBamF4QmFzZWRUcmFuc3BvcnQsIFNlbmRlclJlY2VpdmVyKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBamF4QmFzZWRUcmFuc3BvcnQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJylcbiAgLCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXJcbiAgO1xuXG52YXIgZGVidWcgPSBmdW5jdGlvbigpIHt9O1xuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCdzb2NranMtY2xpZW50OmJ1ZmZlcmVkLXNlbmRlcicpO1xufVxuXG5mdW5jdGlvbiBCdWZmZXJlZFNlbmRlcih1cmwsIHNlbmRlcikge1xuICBkZWJ1Zyh1cmwpO1xuICBFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcbiAgdGhpcy5zZW5kQnVmZmVyID0gW107XG4gIHRoaXMuc2VuZGVyID0gc2VuZGVyO1xuICB0aGlzLnVybCA9IHVybDtcbn1cblxuaW5oZXJpdHMoQnVmZmVyZWRTZW5kZXIsIEV2ZW50RW1pdHRlcik7XG5cbkJ1ZmZlcmVkU2VuZGVyLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICBkZWJ1Zygnc2VuZCcsIG1lc3NhZ2UpO1xuICB0aGlzLnNlbmRCdWZmZXIucHVzaChtZXNzYWdlKTtcbiAgaWYgKCF0aGlzLnNlbmRTdG9wKSB7XG4gICAgdGhpcy5zZW5kU2NoZWR1bGUoKTtcbiAgfVxufTtcblxuLy8gRm9yIHBvbGxpbmcgdHJhbnNwb3J0cyBpbiBhIHNpdHVhdGlvbiB3aGVuIGluIHRoZSBtZXNzYWdlIGNhbGxiYWNrLFxuLy8gbmV3IG1lc3NhZ2UgaXMgYmVpbmcgc2VuZC4gSWYgdGhlIHNlbmRpbmcgY29ubmVjdGlvbiB3YXMgc3RhcnRlZFxuLy8gYmVmb3JlIHJlY2VpdmluZyBvbmUsIGl0IGlzIHBvc3NpYmxlIHRvIHNhdHVyYXRlIHRoZSBuZXR3b3JrIGFuZFxuLy8gdGltZW91dCBkdWUgdG8gdGhlIGxhY2sgb2YgcmVjZWl2aW5nIHNvY2tldC4gVG8gYXZvaWQgdGhhdCB3ZSBkZWxheVxuLy8gc2VuZGluZyBtZXNzYWdlcyBieSBzb21lIHNtYWxsIHRpbWUsIGluIG9yZGVyIHRvIGxldCByZWNlaXZpbmdcbi8vIGNvbm5lY3Rpb24gYmUgc3RhcnRlZCBiZWZvcmVoYW5kLiBUaGlzIGlzIG9ubHkgYSBoYWxmbWVhc3VyZSBhbmRcbi8vIGRvZXMgbm90IGZpeCB0aGUgYmlnIHByb2JsZW0sIGJ1dCBpdCBkb2VzIG1ha2UgdGhlIHRlc3RzIGdvIG1vcmVcbi8vIHN0YWJsZSBvbiBzbG93IG5ldHdvcmtzLlxuQnVmZmVyZWRTZW5kZXIucHJvdG90eXBlLnNlbmRTY2hlZHVsZVdhaXQgPSBmdW5jdGlvbigpIHtcbiAgZGVidWcoJ3NlbmRTY2hlZHVsZVdhaXQnKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgdHJlZjtcbiAgdGhpcy5zZW5kU3RvcCA9IGZ1bmN0aW9uKCkge1xuICAgIGRlYnVnKCdzZW5kU3RvcCcpO1xuICAgIHNlbGYuc2VuZFN0b3AgPSBudWxsO1xuICAgIGNsZWFyVGltZW91dCh0cmVmKTtcbiAgfTtcbiAgdHJlZiA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgZGVidWcoJ3RpbWVvdXQnKTtcbiAgICBzZWxmLnNlbmRTdG9wID0gbnVsbDtcbiAgICBzZWxmLnNlbmRTY2hlZHVsZSgpO1xuICB9LCAyNSk7XG59O1xuXG5CdWZmZXJlZFNlbmRlci5wcm90b3R5cGUuc2VuZFNjaGVkdWxlID0gZnVuY3Rpb24oKSB7XG4gIGRlYnVnKCdzZW5kU2NoZWR1bGUnLCB0aGlzLnNlbmRCdWZmZXIubGVuZ3RoKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBpZiAodGhpcy5zZW5kQnVmZmVyLmxlbmd0aCA+IDApIHtcbiAgICB2YXIgcGF5bG9hZCA9ICdbJyArIHRoaXMuc2VuZEJ1ZmZlci5qb2luKCcsJykgKyAnXSc7XG4gICAgdGhpcy5zZW5kU3RvcCA9IHRoaXMuc2VuZGVyKHRoaXMudXJsLCBwYXlsb2FkLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgIHNlbGYuc2VuZFN0b3AgPSBudWxsO1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBkZWJ1ZygnZXJyb3InLCBlcnIpO1xuICAgICAgICBzZWxmLmVtaXQoJ2Nsb3NlJywgZXJyLmNvZGUgfHwgMTAwNiwgJ1NlbmRpbmcgZXJyb3I6ICcgKyBlcnIpO1xuICAgICAgICBzZWxmLmNsb3NlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZWxmLnNlbmRTY2hlZHVsZVdhaXQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLnNlbmRCdWZmZXIgPSBbXTtcbiAgfVxufTtcblxuQnVmZmVyZWRTZW5kZXIucHJvdG90eXBlLl9jbGVhbnVwID0gZnVuY3Rpb24oKSB7XG4gIGRlYnVnKCdfY2xlYW51cCcpO1xuICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygpO1xufTtcblxuQnVmZmVyZWRTZW5kZXIucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gIGRlYnVnKCdjbG9zZScpO1xuICB0aGlzLl9jbGVhbnVwKCk7XG4gIGlmICh0aGlzLnNlbmRTdG9wKSB7XG4gICAgdGhpcy5zZW5kU3RvcCgpO1xuICAgIHRoaXMuc2VuZFN0b3AgPSBudWxsO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1ZmZlcmVkU2VuZGVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpXG4gICwgSWZyYW1lVHJhbnNwb3J0ID0gcmVxdWlyZSgnLi4vaWZyYW1lJylcbiAgLCBvYmplY3RVdGlscyA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL29iamVjdCcpXG4gIDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0cmFuc3BvcnQpIHtcblxuICBmdW5jdGlvbiBJZnJhbWVXcmFwVHJhbnNwb3J0KHRyYW5zVXJsLCBiYXNlVXJsKSB7XG4gICAgSWZyYW1lVHJhbnNwb3J0LmNhbGwodGhpcywgdHJhbnNwb3J0LnRyYW5zcG9ydE5hbWUsIHRyYW5zVXJsLCBiYXNlVXJsKTtcbiAgfVxuXG4gIGluaGVyaXRzKElmcmFtZVdyYXBUcmFuc3BvcnQsIElmcmFtZVRyYW5zcG9ydCk7XG5cbiAgSWZyYW1lV3JhcFRyYW5zcG9ydC5lbmFibGVkID0gZnVuY3Rpb24odXJsLCBpbmZvKSB7XG4gICAgaWYgKCFnbG9iYWwuZG9jdW1lbnQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgaWZyYW1lSW5mbyA9IG9iamVjdFV0aWxzLmV4dGVuZCh7fSwgaW5mbyk7XG4gICAgaWZyYW1lSW5mby5zYW1lT3JpZ2luID0gdHJ1ZTtcbiAgICByZXR1cm4gdHJhbnNwb3J0LmVuYWJsZWQoaWZyYW1lSW5mbykgJiYgSWZyYW1lVHJhbnNwb3J0LmVuYWJsZWQoKTtcbiAgfTtcblxuICBJZnJhbWVXcmFwVHJhbnNwb3J0LnRyYW5zcG9ydE5hbWUgPSAnaWZyYW1lLScgKyB0cmFuc3BvcnQudHJhbnNwb3J0TmFtZTtcbiAgSWZyYW1lV3JhcFRyYW5zcG9ydC5uZWVkQm9keSA9IHRydWU7XG4gIElmcmFtZVdyYXBUcmFuc3BvcnQucm91bmRUcmlwcyA9IElmcmFtZVRyYW5zcG9ydC5yb3VuZFRyaXBzICsgdHJhbnNwb3J0LnJvdW5kVHJpcHMgLSAxOyAvLyBodG1sLCBqYXZhc2NyaXB0ICgyKSArIHRyYW5zcG9ydCAtIG5vIENPUlMgKDEpXG5cbiAgSWZyYW1lV3JhcFRyYW5zcG9ydC5mYWNhZGVUcmFuc3BvcnQgPSB0cmFuc3BvcnQ7XG5cbiAgcmV0dXJuIElmcmFtZVdyYXBUcmFuc3BvcnQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpXG4gICwgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyXG4gIDtcblxudmFyIGRlYnVnID0gZnVuY3Rpb24oKSB7fTtcbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnc29ja2pzLWNsaWVudDpwb2xsaW5nJyk7XG59XG5cbmZ1bmN0aW9uIFBvbGxpbmcoUmVjZWl2ZXIsIHJlY2VpdmVVcmwsIEFqYXhPYmplY3QpIHtcbiAgZGVidWcocmVjZWl2ZVVybCk7XG4gIEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuICB0aGlzLlJlY2VpdmVyID0gUmVjZWl2ZXI7XG4gIHRoaXMucmVjZWl2ZVVybCA9IHJlY2VpdmVVcmw7XG4gIHRoaXMuQWpheE9iamVjdCA9IEFqYXhPYmplY3Q7XG4gIHRoaXMuX3NjaGVkdWxlUmVjZWl2ZXIoKTtcbn1cblxuaW5oZXJpdHMoUG9sbGluZywgRXZlbnRFbWl0dGVyKTtcblxuUG9sbGluZy5wcm90b3R5cGUuX3NjaGVkdWxlUmVjZWl2ZXIgPSBmdW5jdGlvbigpIHtcbiAgZGVidWcoJ19zY2hlZHVsZVJlY2VpdmVyJyk7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdmFyIHBvbGwgPSB0aGlzLnBvbGwgPSBuZXcgdGhpcy5SZWNlaXZlcih0aGlzLnJlY2VpdmVVcmwsIHRoaXMuQWpheE9iamVjdCk7XG5cbiAgcG9sbC5vbignbWVzc2FnZScsIGZ1bmN0aW9uKG1zZykge1xuICAgIGRlYnVnKCdtZXNzYWdlJywgbXNnKTtcbiAgICBzZWxmLmVtaXQoJ21lc3NhZ2UnLCBtc2cpO1xuICB9KTtcblxuICBwb2xsLm9uY2UoJ2Nsb3NlJywgZnVuY3Rpb24oY29kZSwgcmVhc29uKSB7XG4gICAgZGVidWcoJ2Nsb3NlJywgY29kZSwgcmVhc29uLCBzZWxmLnBvbGxJc0Nsb3NpbmcpO1xuICAgIHNlbGYucG9sbCA9IHBvbGwgPSBudWxsO1xuXG4gICAgaWYgKCFzZWxmLnBvbGxJc0Nsb3NpbmcpIHtcbiAgICAgIGlmIChyZWFzb24gPT09ICduZXR3b3JrJykge1xuICAgICAgICBzZWxmLl9zY2hlZHVsZVJlY2VpdmVyKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZWxmLmVtaXQoJ2Nsb3NlJywgY29kZSB8fCAxMDA2LCByZWFzb24pO1xuICAgICAgICBzZWxmLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59O1xuXG5Qb2xsaW5nLnByb3RvdHlwZS5hYm9ydCA9IGZ1bmN0aW9uKCkge1xuICBkZWJ1ZygnYWJvcnQnKTtcbiAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbiAgdGhpcy5wb2xsSXNDbG9zaW5nID0gdHJ1ZTtcbiAgaWYgKHRoaXMucG9sbCkge1xuICAgIHRoaXMucG9sbC5hYm9ydCgpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBvbGxpbmc7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJylcbiAgLCB1cmxVdGlscyA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3VybCcpXG4gICwgQnVmZmVyZWRTZW5kZXIgPSByZXF1aXJlKCcuL2J1ZmZlcmVkLXNlbmRlcicpXG4gICwgUG9sbGluZyA9IHJlcXVpcmUoJy4vcG9sbGluZycpXG4gIDtcblxudmFyIGRlYnVnID0gZnVuY3Rpb24oKSB7fTtcbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnc29ja2pzLWNsaWVudDpzZW5kZXItcmVjZWl2ZXInKTtcbn1cblxuZnVuY3Rpb24gU2VuZGVyUmVjZWl2ZXIodHJhbnNVcmwsIHVybFN1ZmZpeCwgc2VuZGVyRnVuYywgUmVjZWl2ZXIsIEFqYXhPYmplY3QpIHtcbiAgdmFyIHBvbGxVcmwgPSB1cmxVdGlscy5hZGRQYXRoKHRyYW5zVXJsLCB1cmxTdWZmaXgpO1xuICBkZWJ1Zyhwb2xsVXJsKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBCdWZmZXJlZFNlbmRlci5jYWxsKHRoaXMsIHRyYW5zVXJsLCBzZW5kZXJGdW5jKTtcblxuICB0aGlzLnBvbGwgPSBuZXcgUG9sbGluZyhSZWNlaXZlciwgcG9sbFVybCwgQWpheE9iamVjdCk7XG4gIHRoaXMucG9sbC5vbignbWVzc2FnZScsIGZ1bmN0aW9uKG1zZykge1xuICAgIGRlYnVnKCdwb2xsIG1lc3NhZ2UnLCBtc2cpO1xuICAgIHNlbGYuZW1pdCgnbWVzc2FnZScsIG1zZyk7XG4gIH0pO1xuICB0aGlzLnBvbGwub25jZSgnY2xvc2UnLCBmdW5jdGlvbihjb2RlLCByZWFzb24pIHtcbiAgICBkZWJ1ZygncG9sbCBjbG9zZScsIGNvZGUsIHJlYXNvbik7XG4gICAgc2VsZi5wb2xsID0gbnVsbDtcbiAgICBzZWxmLmVtaXQoJ2Nsb3NlJywgY29kZSwgcmVhc29uKTtcbiAgICBzZWxmLmNsb3NlKCk7XG4gIH0pO1xufVxuXG5pbmhlcml0cyhTZW5kZXJSZWNlaXZlciwgQnVmZmVyZWRTZW5kZXIpO1xuXG5TZW5kZXJSZWNlaXZlci5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgQnVmZmVyZWRTZW5kZXIucHJvdG90eXBlLmNsb3NlLmNhbGwodGhpcyk7XG4gIGRlYnVnKCdjbG9zZScpO1xuICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICBpZiAodGhpcy5wb2xsKSB7XG4gICAgdGhpcy5wb2xsLmFib3J0KCk7XG4gICAgdGhpcy5wb2xsID0gbnVsbDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTZW5kZXJSZWNlaXZlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKVxuICAsIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlclxuICAsIEV2ZW50U291cmNlRHJpdmVyID0gcmVxdWlyZSgnZXZlbnRzb3VyY2UnKVxuICA7XG5cbnZhciBkZWJ1ZyA9IGZ1bmN0aW9uKCkge307XG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ3NvY2tqcy1jbGllbnQ6cmVjZWl2ZXI6ZXZlbnRzb3VyY2UnKTtcbn1cblxuZnVuY3Rpb24gRXZlbnRTb3VyY2VSZWNlaXZlcih1cmwpIHtcbiAgZGVidWcodXJsKTtcbiAgRXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgZXMgPSB0aGlzLmVzID0gbmV3IEV2ZW50U291cmNlRHJpdmVyKHVybCk7XG4gIGVzLm9ubWVzc2FnZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICBkZWJ1ZygnbWVzc2FnZScsIGUuZGF0YSk7XG4gICAgc2VsZi5lbWl0KCdtZXNzYWdlJywgZGVjb2RlVVJJKGUuZGF0YSkpO1xuICB9O1xuICBlcy5vbmVycm9yID0gZnVuY3Rpb24oZSkge1xuICAgIGRlYnVnKCdlcnJvcicsIGVzLnJlYWR5U3RhdGUsIGUpO1xuICAgIC8vIEVTIG9uIHJlY29ubmVjdGlvbiBoYXMgcmVhZHlTdGF0ZSA9IDAgb3IgMS5cbiAgICAvLyBvbiBuZXR3b3JrIGVycm9yIGl0J3MgQ0xPU0VEID0gMlxuICAgIHZhciByZWFzb24gPSAoZXMucmVhZHlTdGF0ZSAhPT0gMiA/ICduZXR3b3JrJyA6ICdwZXJtYW5lbnQnKTtcbiAgICBzZWxmLl9jbGVhbnVwKCk7XG4gICAgc2VsZi5fY2xvc2UocmVhc29uKTtcbiAgfTtcbn1cblxuaW5oZXJpdHMoRXZlbnRTb3VyY2VSZWNlaXZlciwgRXZlbnRFbWl0dGVyKTtcblxuRXZlbnRTb3VyY2VSZWNlaXZlci5wcm90b3R5cGUuYWJvcnQgPSBmdW5jdGlvbigpIHtcbiAgZGVidWcoJ2Fib3J0Jyk7XG4gIHRoaXMuX2NsZWFudXAoKTtcbiAgdGhpcy5fY2xvc2UoJ3VzZXInKTtcbn07XG5cbkV2ZW50U291cmNlUmVjZWl2ZXIucHJvdG90eXBlLl9jbGVhbnVwID0gZnVuY3Rpb24oKSB7XG4gIGRlYnVnKCdjbGVhbnVwJyk7XG4gIHZhciBlcyA9IHRoaXMuZXM7XG4gIGlmIChlcykge1xuICAgIGVzLm9ubWVzc2FnZSA9IGVzLm9uZXJyb3IgPSBudWxsO1xuICAgIGVzLmNsb3NlKCk7XG4gICAgdGhpcy5lcyA9IG51bGw7XG4gIH1cbn07XG5cbkV2ZW50U291cmNlUmVjZWl2ZXIucHJvdG90eXBlLl9jbG9zZSA9IGZ1bmN0aW9uKHJlYXNvbikge1xuICBkZWJ1ZygnY2xvc2UnLCByZWFzb24pO1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIC8vIFNhZmFyaSBhbmQgY2hyb21lIDwgMTUgY3Jhc2ggaWYgd2UgY2xvc2Ugd2luZG93IGJlZm9yZVxuICAvLyB3YWl0aW5nIGZvciBFUyBjbGVhbnVwLiBTZWU6XG4gIC8vIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD04OTE1NVxuICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIHNlbGYuZW1pdCgnY2xvc2UnLCBudWxsLCByZWFzb24pO1xuICAgIHNlbGYucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG4gIH0sIDIwMCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50U291cmNlUmVjZWl2ZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJylcbiAgLCBpZnJhbWVVdGlscyA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL2lmcmFtZScpXG4gICwgdXJsVXRpbHMgPSByZXF1aXJlKCcuLi8uLi91dGlscy91cmwnKVxuICAsIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlclxuICAsIHJhbmRvbSA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3JhbmRvbScpXG4gIDtcblxudmFyIGRlYnVnID0gZnVuY3Rpb24oKSB7fTtcbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnc29ja2pzLWNsaWVudDpyZWNlaXZlcjpodG1sZmlsZScpO1xufVxuXG5mdW5jdGlvbiBIdG1sZmlsZVJlY2VpdmVyKHVybCkge1xuICBkZWJ1Zyh1cmwpO1xuICBFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBpZnJhbWVVdGlscy5wb2xsdXRlR2xvYmFsTmFtZXNwYWNlKCk7XG5cbiAgdGhpcy5pZCA9ICdhJyArIHJhbmRvbS5zdHJpbmcoNik7XG4gIHVybCA9IHVybFV0aWxzLmFkZFF1ZXJ5KHVybCwgJ2M9JyArIGRlY29kZVVSSUNvbXBvbmVudChpZnJhbWVVdGlscy5XUHJlZml4ICsgJy4nICsgdGhpcy5pZCkpO1xuXG4gIGRlYnVnKCd1c2luZyBodG1sZmlsZScsIEh0bWxmaWxlUmVjZWl2ZXIuaHRtbGZpbGVFbmFibGVkKTtcbiAgdmFyIGNvbnN0cnVjdEZ1bmMgPSBIdG1sZmlsZVJlY2VpdmVyLmh0bWxmaWxlRW5hYmxlZCA/XG4gICAgICBpZnJhbWVVdGlscy5jcmVhdGVIdG1sZmlsZSA6IGlmcmFtZVV0aWxzLmNyZWF0ZUlmcmFtZTtcblxuICBnbG9iYWxbaWZyYW1lVXRpbHMuV1ByZWZpeF1bdGhpcy5pZF0gPSB7XG4gICAgc3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ3N0YXJ0Jyk7XG4gICAgICBzZWxmLmlmcmFtZU9iai5sb2FkZWQoKTtcbiAgICB9XG4gICwgbWVzc2FnZTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgZGVidWcoJ21lc3NhZ2UnLCBkYXRhKTtcbiAgICAgIHNlbGYuZW1pdCgnbWVzc2FnZScsIGRhdGEpO1xuICAgIH1cbiAgLCBzdG9wOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdzdG9wJyk7XG4gICAgICBzZWxmLl9jbGVhbnVwKCk7XG4gICAgICBzZWxmLl9jbG9zZSgnbmV0d29yaycpO1xuICAgIH1cbiAgfTtcbiAgdGhpcy5pZnJhbWVPYmogPSBjb25zdHJ1Y3RGdW5jKHVybCwgZnVuY3Rpb24oKSB7XG4gICAgZGVidWcoJ2NhbGxiYWNrJyk7XG4gICAgc2VsZi5fY2xlYW51cCgpO1xuICAgIHNlbGYuX2Nsb3NlKCdwZXJtYW5lbnQnKTtcbiAgfSk7XG59XG5cbmluaGVyaXRzKEh0bWxmaWxlUmVjZWl2ZXIsIEV2ZW50RW1pdHRlcik7XG5cbkh0bWxmaWxlUmVjZWl2ZXIucHJvdG90eXBlLmFib3J0ID0gZnVuY3Rpb24oKSB7XG4gIGRlYnVnKCdhYm9ydCcpO1xuICB0aGlzLl9jbGVhbnVwKCk7XG4gIHRoaXMuX2Nsb3NlKCd1c2VyJyk7XG59O1xuXG5IdG1sZmlsZVJlY2VpdmVyLnByb3RvdHlwZS5fY2xlYW51cCA9IGZ1bmN0aW9uKCkge1xuICBkZWJ1ZygnX2NsZWFudXAnKTtcbiAgaWYgKHRoaXMuaWZyYW1lT2JqKSB7XG4gICAgdGhpcy5pZnJhbWVPYmouY2xlYW51cCgpO1xuICAgIHRoaXMuaWZyYW1lT2JqID0gbnVsbDtcbiAgfVxuICBkZWxldGUgZ2xvYmFsW2lmcmFtZVV0aWxzLldQcmVmaXhdW3RoaXMuaWRdO1xufTtcblxuSHRtbGZpbGVSZWNlaXZlci5wcm90b3R5cGUuX2Nsb3NlID0gZnVuY3Rpb24ocmVhc29uKSB7XG4gIGRlYnVnKCdfY2xvc2UnLCByZWFzb24pO1xuICB0aGlzLmVtaXQoJ2Nsb3NlJywgbnVsbCwgcmVhc29uKTtcbiAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbn07XG5cbkh0bWxmaWxlUmVjZWl2ZXIuaHRtbGZpbGVFbmFibGVkID0gZmFsc2U7XG5cbi8vIG9iZnVzY2F0ZSB0byBhdm9pZCBmaXJld2FsbHNcbnZhciBheG8gPSBbJ0FjdGl2ZSddLmNvbmNhdCgnT2JqZWN0Jykuam9pbignWCcpO1xuaWYgKGF4byBpbiBnbG9iYWwpIHtcbiAgdHJ5IHtcbiAgICBIdG1sZmlsZVJlY2VpdmVyLmh0bWxmaWxlRW5hYmxlZCA9ICEhbmV3IGdsb2JhbFtheG9dKCdodG1sZmlsZScpO1xuICB9IGNhdGNoICh4KSB7XG4gICAgLy8gaW50ZW50aW9uYWxseSBlbXB0eVxuICB9XG59XG5cbkh0bWxmaWxlUmVjZWl2ZXIuZW5hYmxlZCA9IEh0bWxmaWxlUmVjZWl2ZXIuaHRtbGZpbGVFbmFibGVkIHx8IGlmcmFtZVV0aWxzLmlmcmFtZUVuYWJsZWQ7XG5cbm1vZHVsZS5leHBvcnRzID0gSHRtbGZpbGVSZWNlaXZlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvaWZyYW1lJylcbiAgLCByYW5kb20gPSByZXF1aXJlKCcuLi8uLi91dGlscy9yYW5kb20nKVxuICAsIGJyb3dzZXIgPSByZXF1aXJlKCcuLi8uLi91dGlscy9icm93c2VyJylcbiAgLCB1cmxVdGlscyA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3VybCcpXG4gICwgaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpXG4gICwgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyXG4gIDtcblxudmFyIGRlYnVnID0gZnVuY3Rpb24oKSB7fTtcbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnc29ja2pzLWNsaWVudDpyZWNlaXZlcjpqc29ucCcpO1xufVxuXG5mdW5jdGlvbiBKc29ucFJlY2VpdmVyKHVybCkge1xuICBkZWJ1Zyh1cmwpO1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXG4gIHV0aWxzLnBvbGx1dGVHbG9iYWxOYW1lc3BhY2UoKTtcblxuICB0aGlzLmlkID0gJ2EnICsgcmFuZG9tLnN0cmluZyg2KTtcbiAgdmFyIHVybFdpdGhJZCA9IHVybFV0aWxzLmFkZFF1ZXJ5KHVybCwgJ2M9JyArIGVuY29kZVVSSUNvbXBvbmVudCh1dGlscy5XUHJlZml4ICsgJy4nICsgdGhpcy5pZCkpO1xuXG4gIGdsb2JhbFt1dGlscy5XUHJlZml4XVt0aGlzLmlkXSA9IHRoaXMuX2NhbGxiYWNrLmJpbmQodGhpcyk7XG4gIHRoaXMuX2NyZWF0ZVNjcmlwdCh1cmxXaXRoSWQpO1xuXG4gIC8vIEZhbGxiYWNrIG1vc3RseSBmb3IgS29ucXVlcm9yIC0gc3R1cGlkIHRpbWVyLCAzNSBzZWNvbmRzIHNoYWxsIGJlIHBsZW50eS5cbiAgdGhpcy50aW1lb3V0SWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIGRlYnVnKCd0aW1lb3V0Jyk7XG4gICAgc2VsZi5fYWJvcnQobmV3IEVycm9yKCdKU09OUCBzY3JpcHQgbG9hZGVkIGFibm9ybWFsbHkgKHRpbWVvdXQpJykpO1xuICB9LCBKc29ucFJlY2VpdmVyLnRpbWVvdXQpO1xufVxuXG5pbmhlcml0cyhKc29ucFJlY2VpdmVyLCBFdmVudEVtaXR0ZXIpO1xuXG5Kc29ucFJlY2VpdmVyLnByb3RvdHlwZS5hYm9ydCA9IGZ1bmN0aW9uKCkge1xuICBkZWJ1ZygnYWJvcnQnKTtcbiAgaWYgKGdsb2JhbFt1dGlscy5XUHJlZml4XVt0aGlzLmlkXSkge1xuICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ0pTT05QIHVzZXIgYWJvcnRlZCByZWFkJyk7XG4gICAgZXJyLmNvZGUgPSAxMDAwO1xuICAgIHRoaXMuX2Fib3J0KGVycik7XG4gIH1cbn07XG5cbkpzb25wUmVjZWl2ZXIudGltZW91dCA9IDM1MDAwO1xuSnNvbnBSZWNlaXZlci5zY3JpcHRFcnJvclRpbWVvdXQgPSAxMDAwO1xuXG5Kc29ucFJlY2VpdmVyLnByb3RvdHlwZS5fY2FsbGJhY2sgPSBmdW5jdGlvbihkYXRhKSB7XG4gIGRlYnVnKCdfY2FsbGJhY2snLCBkYXRhKTtcbiAgdGhpcy5fY2xlYW51cCgpO1xuXG4gIGlmICh0aGlzLmFib3J0aW5nKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGRhdGEpIHtcbiAgICBkZWJ1ZygnbWVzc2FnZScsIGRhdGEpO1xuICAgIHRoaXMuZW1pdCgnbWVzc2FnZScsIGRhdGEpO1xuICB9XG4gIHRoaXMuZW1pdCgnY2xvc2UnLCBudWxsLCAnbmV0d29yaycpO1xuICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygpO1xufTtcblxuSnNvbnBSZWNlaXZlci5wcm90b3R5cGUuX2Fib3J0ID0gZnVuY3Rpb24oZXJyKSB7XG4gIGRlYnVnKCdfYWJvcnQnLCBlcnIpO1xuICB0aGlzLl9jbGVhbnVwKCk7XG4gIHRoaXMuYWJvcnRpbmcgPSB0cnVlO1xuICB0aGlzLmVtaXQoJ2Nsb3NlJywgZXJyLmNvZGUsIGVyci5tZXNzYWdlKTtcbiAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbn07XG5cbkpzb25wUmVjZWl2ZXIucHJvdG90eXBlLl9jbGVhbnVwID0gZnVuY3Rpb24oKSB7XG4gIGRlYnVnKCdfY2xlYW51cCcpO1xuICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0SWQpO1xuICBpZiAodGhpcy5zY3JpcHQyKSB7XG4gICAgdGhpcy5zY3JpcHQyLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5zY3JpcHQyKTtcbiAgICB0aGlzLnNjcmlwdDIgPSBudWxsO1xuICB9XG4gIGlmICh0aGlzLnNjcmlwdCkge1xuICAgIHZhciBzY3JpcHQgPSB0aGlzLnNjcmlwdDtcbiAgICAvLyBVbmZvcnR1bmF0ZWx5LCB5b3UgY2FuJ3QgcmVhbGx5IGFib3J0IHNjcmlwdCBsb2FkaW5nIG9mXG4gICAgLy8gdGhlIHNjcmlwdC5cbiAgICBzY3JpcHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzY3JpcHQpO1xuICAgIHNjcmlwdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBzY3JpcHQub25lcnJvciA9XG4gICAgICAgIHNjcmlwdC5vbmxvYWQgPSBzY3JpcHQub25jbGljayA9IG51bGw7XG4gICAgdGhpcy5zY3JpcHQgPSBudWxsO1xuICB9XG4gIGRlbGV0ZSBnbG9iYWxbdXRpbHMuV1ByZWZpeF1bdGhpcy5pZF07XG59O1xuXG5Kc29ucFJlY2VpdmVyLnByb3RvdHlwZS5fc2NyaXB0RXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgZGVidWcoJ19zY3JpcHRFcnJvcicpO1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIGlmICh0aGlzLmVycm9yVGltZXIpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLmVycm9yVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIGlmICghc2VsZi5sb2FkZWRPa2F5KSB7XG4gICAgICBzZWxmLl9hYm9ydChuZXcgRXJyb3IoJ0pTT05QIHNjcmlwdCBsb2FkZWQgYWJub3JtYWxseSAob25lcnJvciknKSk7XG4gICAgfVxuICB9LCBKc29ucFJlY2VpdmVyLnNjcmlwdEVycm9yVGltZW91dCk7XG59O1xuXG5Kc29ucFJlY2VpdmVyLnByb3RvdHlwZS5fY3JlYXRlU2NyaXB0ID0gZnVuY3Rpb24odXJsKSB7XG4gIGRlYnVnKCdfY3JlYXRlU2NyaXB0JywgdXJsKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgc2NyaXB0ID0gdGhpcy5zY3JpcHQgPSBnbG9iYWwuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gIHZhciBzY3JpcHQyOyAgLy8gT3BlcmEgc3luY2hyb25vdXMgbG9hZCB0cmljay5cblxuICBzY3JpcHQuaWQgPSAnYScgKyByYW5kb20uc3RyaW5nKDgpO1xuICBzY3JpcHQuc3JjID0gdXJsO1xuICBzY3JpcHQudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xuICBzY3JpcHQuY2hhcnNldCA9ICdVVEYtOCc7XG4gIHNjcmlwdC5vbmVycm9yID0gdGhpcy5fc2NyaXB0RXJyb3IuYmluZCh0aGlzKTtcbiAgc2NyaXB0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIGRlYnVnKCdvbmxvYWQnKTtcbiAgICBzZWxmLl9hYm9ydChuZXcgRXJyb3IoJ0pTT05QIHNjcmlwdCBsb2FkZWQgYWJub3JtYWxseSAob25sb2FkKScpKTtcbiAgfTtcblxuICAvLyBJRTkgZmlyZXMgJ2Vycm9yJyBldmVudCBhZnRlciBvbnJlYWR5c3RhdGVjaGFuZ2Ugb3IgYmVmb3JlLCBpbiByYW5kb20gb3JkZXIuXG4gIC8vIFVzZSBsb2FkZWRPa2F5IHRvIGRldGVybWluZSBpZiBhY3R1YWxseSBlcnJvcmVkXG4gIHNjcmlwdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICBkZWJ1Zygnb25yZWFkeXN0YXRlY2hhbmdlJywgc2NyaXB0LnJlYWR5U3RhdGUpO1xuICAgIGlmICgvbG9hZGVkfGNsb3NlZC8udGVzdChzY3JpcHQucmVhZHlTdGF0ZSkpIHtcbiAgICAgIGlmIChzY3JpcHQgJiYgc2NyaXB0Lmh0bWxGb3IgJiYgc2NyaXB0Lm9uY2xpY2spIHtcbiAgICAgICAgc2VsZi5sb2FkZWRPa2F5ID0gdHJ1ZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyBJbiBJRSwgYWN0dWFsbHkgZXhlY3V0ZSB0aGUgc2NyaXB0LlxuICAgICAgICAgIHNjcmlwdC5vbmNsaWNrKCk7XG4gICAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgICAvLyBpbnRlbnRpb25hbGx5IGVtcHR5XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChzY3JpcHQpIHtcbiAgICAgICAgc2VsZi5fYWJvcnQobmV3IEVycm9yKCdKU09OUCBzY3JpcHQgbG9hZGVkIGFibm9ybWFsbHkgKG9ucmVhZHlzdGF0ZWNoYW5nZSknKSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICAvLyBJRTogZXZlbnQvaHRtbEZvci9vbmNsaWNrIHRyaWNrLlxuICAvLyBPbmUgY2FuJ3QgcmVseSBvbiBwcm9wZXIgb3JkZXIgZm9yIG9ucmVhZHlzdGF0ZWNoYW5nZS4gSW4gb3JkZXIgdG9cbiAgLy8gbWFrZSBzdXJlLCBzZXQgYSAnaHRtbEZvcicgYW5kICdldmVudCcgcHJvcGVydGllcywgc28gdGhhdFxuICAvLyBzY3JpcHQgY29kZSB3aWxsIGJlIGluc3RhbGxlZCBhcyAnb25jbGljaycgaGFuZGxlciBmb3IgdGhlXG4gIC8vIHNjcmlwdCBvYmplY3QuIExhdGVyLCBvbnJlYWR5c3RhdGVjaGFuZ2UsIG1hbnVhbGx5IGV4ZWN1dGUgdGhpc1xuICAvLyBjb2RlLiBGRiBhbmQgQ2hyb21lIGRvZXNuJ3Qgd29yayB3aXRoICdldmVudCcgYW5kICdodG1sRm9yJ1xuICAvLyBzZXQuIEZvciByZWZlcmVuY2Ugc2VlOlxuICAvLyAgIGh0dHA6Ly9qYXVib3VyZy5uZXQvMjAxMC8wNy9sb2FkaW5nLXNjcmlwdC1hcy1vbmNsaWNrLWhhbmRsZXItb2YuaHRtbFxuICAvLyBBbHNvLCByZWFkIG9uIHRoYXQgYWJvdXQgc2NyaXB0IG9yZGVyaW5nOlxuICAvLyAgIGh0dHA6Ly93aWtpLndoYXR3Zy5vcmcvd2lraS9EeW5hbWljX1NjcmlwdF9FeGVjdXRpb25fT3JkZXJcbiAgaWYgKHR5cGVvZiBzY3JpcHQuYXN5bmMgPT09ICd1bmRlZmluZWQnICYmIGdsb2JhbC5kb2N1bWVudC5hdHRhY2hFdmVudCkge1xuICAgIC8vIEFjY29yZGluZyB0byBtb3ppbGxhIGRvY3MsIGluIHJlY2VudCBicm93c2VycyBzY3JpcHQuYXN5bmMgZGVmYXVsdHNcbiAgICAvLyB0byAndHJ1ZScsIHNvIHdlIG1heSB1c2UgaXQgdG8gZGV0ZWN0IGEgZ29vZCBicm93c2VyOlxuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuL0hUTUwvRWxlbWVudC9zY3JpcHRcbiAgICBpZiAoIWJyb3dzZXIuaXNPcGVyYSgpKSB7XG4gICAgICAvLyBOYWl2ZWx5IGFzc3VtZSB3ZSdyZSBpbiBJRVxuICAgICAgdHJ5IHtcbiAgICAgICAgc2NyaXB0Lmh0bWxGb3IgPSBzY3JpcHQuaWQ7XG4gICAgICAgIHNjcmlwdC5ldmVudCA9ICdvbmNsaWNrJztcbiAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgLy8gaW50ZW50aW9uYWxseSBlbXB0eVxuICAgICAgfVxuICAgICAgc2NyaXB0LmFzeW5jID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gT3BlcmEsIHNlY29uZCBzeW5jIHNjcmlwdCBoYWNrXG4gICAgICBzY3JpcHQyID0gdGhpcy5zY3JpcHQyID0gZ2xvYmFsLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgc2NyaXB0Mi50ZXh0ID0gXCJ0cnl7dmFyIGEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnXCIgKyBzY3JpcHQuaWQgKyBcIicpOyBpZihhKWEub25lcnJvcigpO31jYXRjaCh4KXt9O1wiO1xuICAgICAgc2NyaXB0LmFzeW5jID0gc2NyaXB0Mi5hc3luYyA9IGZhbHNlO1xuICAgIH1cbiAgfVxuICBpZiAodHlwZW9mIHNjcmlwdC5hc3luYyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBzY3JpcHQuYXN5bmMgPSB0cnVlO1xuICB9XG5cbiAgdmFyIGhlYWQgPSBnbG9iYWwuZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXTtcbiAgaGVhZC5pbnNlcnRCZWZvcmUoc2NyaXB0LCBoZWFkLmZpcnN0Q2hpbGQpO1xuICBpZiAoc2NyaXB0Mikge1xuICAgIGhlYWQuaW5zZXJ0QmVmb3JlKHNjcmlwdDIsIGhlYWQuZmlyc3RDaGlsZCk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSnNvbnBSZWNlaXZlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKVxuICAsIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlclxuICA7XG5cbnZhciBkZWJ1ZyA9IGZ1bmN0aW9uKCkge307XG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ3NvY2tqcy1jbGllbnQ6cmVjZWl2ZXI6eGhyJyk7XG59XG5cbmZ1bmN0aW9uIFhoclJlY2VpdmVyKHVybCwgQWpheE9iamVjdCkge1xuICBkZWJ1Zyh1cmwpO1xuICBFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIHRoaXMuYnVmZmVyUG9zaXRpb24gPSAwO1xuXG4gIHRoaXMueG8gPSBuZXcgQWpheE9iamVjdCgnUE9TVCcsIHVybCwgbnVsbCk7XG4gIHRoaXMueG8ub24oJ2NodW5rJywgdGhpcy5fY2h1bmtIYW5kbGVyLmJpbmQodGhpcykpO1xuICB0aGlzLnhvLm9uY2UoJ2ZpbmlzaCcsIGZ1bmN0aW9uKHN0YXR1cywgdGV4dCkge1xuICAgIGRlYnVnKCdmaW5pc2gnLCBzdGF0dXMsIHRleHQpO1xuICAgIHNlbGYuX2NodW5rSGFuZGxlcihzdGF0dXMsIHRleHQpO1xuICAgIHNlbGYueG8gPSBudWxsO1xuICAgIHZhciByZWFzb24gPSBzdGF0dXMgPT09IDIwMCA/ICduZXR3b3JrJyA6ICdwZXJtYW5lbnQnO1xuICAgIGRlYnVnKCdjbG9zZScsIHJlYXNvbik7XG4gICAgc2VsZi5lbWl0KCdjbG9zZScsIG51bGwsIHJlYXNvbik7XG4gICAgc2VsZi5fY2xlYW51cCgpO1xuICB9KTtcbn1cblxuaW5oZXJpdHMoWGhyUmVjZWl2ZXIsIEV2ZW50RW1pdHRlcik7XG5cblhoclJlY2VpdmVyLnByb3RvdHlwZS5fY2h1bmtIYW5kbGVyID0gZnVuY3Rpb24oc3RhdHVzLCB0ZXh0KSB7XG4gIGRlYnVnKCdfY2h1bmtIYW5kbGVyJywgc3RhdHVzKTtcbiAgaWYgKHN0YXR1cyAhPT0gMjAwIHx8ICF0ZXh0KSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZm9yICh2YXIgaWR4ID0gLTE7IDsgdGhpcy5idWZmZXJQb3NpdGlvbiArPSBpZHggKyAxKSB7XG4gICAgdmFyIGJ1ZiA9IHRleHQuc2xpY2UodGhpcy5idWZmZXJQb3NpdGlvbik7XG4gICAgaWR4ID0gYnVmLmluZGV4T2YoJ1xcbicpO1xuICAgIGlmIChpZHggPT09IC0xKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgdmFyIG1zZyA9IGJ1Zi5zbGljZSgwLCBpZHgpO1xuICAgIGlmIChtc2cpIHtcbiAgICAgIGRlYnVnKCdtZXNzYWdlJywgbXNnKTtcbiAgICAgIHRoaXMuZW1pdCgnbWVzc2FnZScsIG1zZyk7XG4gICAgfVxuICB9XG59O1xuXG5YaHJSZWNlaXZlci5wcm90b3R5cGUuX2NsZWFudXAgPSBmdW5jdGlvbigpIHtcbiAgZGVidWcoJ19jbGVhbnVwJyk7XG4gIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG59O1xuXG5YaHJSZWNlaXZlci5wcm90b3R5cGUuYWJvcnQgPSBmdW5jdGlvbigpIHtcbiAgZGVidWcoJ2Fib3J0Jyk7XG4gIGlmICh0aGlzLnhvKSB7XG4gICAgdGhpcy54by5jbG9zZSgpO1xuICAgIGRlYnVnKCdjbG9zZScpO1xuICAgIHRoaXMuZW1pdCgnY2xvc2UnLCBudWxsLCAndXNlcicpO1xuICAgIHRoaXMueG8gPSBudWxsO1xuICB9XG4gIHRoaXMuX2NsZWFudXAoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gWGhyUmVjZWl2ZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciByYW5kb20gPSByZXF1aXJlKCcuLi8uLi91dGlscy9yYW5kb20nKVxuICAsIHVybFV0aWxzID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvdXJsJylcbiAgO1xuXG52YXIgZGVidWcgPSBmdW5jdGlvbigpIHt9O1xuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCdzb2NranMtY2xpZW50OnNlbmRlcjpqc29ucCcpO1xufVxuXG52YXIgZm9ybSwgYXJlYTtcblxuZnVuY3Rpb24gY3JlYXRlSWZyYW1lKGlkKSB7XG4gIGRlYnVnKCdjcmVhdGVJZnJhbWUnLCBpZCk7XG4gIHRyeSB7XG4gICAgLy8gaWU2IGR5bmFtaWMgaWZyYW1lcyB3aXRoIHRhcmdldD1cIlwiIHN1cHBvcnQgKHRoYW5rcyBDaHJpcyBMYW1iYWNoZXIpXG4gICAgcmV0dXJuIGdsb2JhbC5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCc8aWZyYW1lIG5hbWU9XCInICsgaWQgKyAnXCI+Jyk7XG4gIH0gY2F0Y2ggKHgpIHtcbiAgICB2YXIgaWZyYW1lID0gZ2xvYmFsLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICAgIGlmcmFtZS5uYW1lID0gaWQ7XG4gICAgcmV0dXJuIGlmcmFtZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVGb3JtKCkge1xuICBkZWJ1ZygnY3JlYXRlRm9ybScpO1xuICBmb3JtID0gZ2xvYmFsLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Zvcm0nKTtcbiAgZm9ybS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICBmb3JtLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgZm9ybS5tZXRob2QgPSAnUE9TVCc7XG4gIGZvcm0uZW5jdHlwZSA9ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnO1xuICBmb3JtLmFjY2VwdENoYXJzZXQgPSAnVVRGLTgnO1xuXG4gIGFyZWEgPSBnbG9iYWwuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKTtcbiAgYXJlYS5uYW1lID0gJ2QnO1xuICBmb3JtLmFwcGVuZENoaWxkKGFyZWEpO1xuXG4gIGdsb2JhbC5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGZvcm0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHVybCwgcGF5bG9hZCwgY2FsbGJhY2spIHtcbiAgZGVidWcodXJsLCBwYXlsb2FkKTtcbiAgaWYgKCFmb3JtKSB7XG4gICAgY3JlYXRlRm9ybSgpO1xuICB9XG4gIHZhciBpZCA9ICdhJyArIHJhbmRvbS5zdHJpbmcoOCk7XG4gIGZvcm0udGFyZ2V0ID0gaWQ7XG4gIGZvcm0uYWN0aW9uID0gdXJsVXRpbHMuYWRkUXVlcnkodXJsVXRpbHMuYWRkUGF0aCh1cmwsICcvanNvbnBfc2VuZCcpLCAnaT0nICsgaWQpO1xuXG4gIHZhciBpZnJhbWUgPSBjcmVhdGVJZnJhbWUoaWQpO1xuICBpZnJhbWUuaWQgPSBpZDtcbiAgaWZyYW1lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIGZvcm0uYXBwZW5kQ2hpbGQoaWZyYW1lKTtcblxuICB0cnkge1xuICAgIGFyZWEudmFsdWUgPSBwYXlsb2FkO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gc2VyaW91c2x5IGJyb2tlbiBicm93c2VycyBnZXQgaGVyZVxuICB9XG4gIGZvcm0uc3VibWl0KCk7XG5cbiAgdmFyIGNvbXBsZXRlZCA9IGZ1bmN0aW9uKGVycikge1xuICAgIGRlYnVnKCdjb21wbGV0ZWQnLCBpZCwgZXJyKTtcbiAgICBpZiAoIWlmcmFtZS5vbmVycm9yKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmcmFtZS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBpZnJhbWUub25lcnJvciA9IGlmcmFtZS5vbmxvYWQgPSBudWxsO1xuICAgIC8vIE9wZXJhIG1pbmkgZG9lc24ndCBsaWtlIGlmIHdlIEdDIGlmcmFtZVxuICAgIC8vIGltbWVkaWF0ZWx5LCB0aHVzIHRoaXMgdGltZW91dC5cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ2NsZWFuaW5nIHVwJywgaWQpO1xuICAgICAgaWZyYW1lLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoaWZyYW1lKTtcbiAgICAgIGlmcmFtZSA9IG51bGw7XG4gICAgfSwgNTAwKTtcbiAgICBhcmVhLnZhbHVlID0gJyc7XG4gICAgLy8gSXQgaXMgbm90IHBvc3NpYmxlIHRvIGRldGVjdCBpZiB0aGUgaWZyYW1lIHN1Y2NlZWRlZCBvclxuICAgIC8vIGZhaWxlZCB0byBzdWJtaXQgb3VyIGZvcm0uXG4gICAgY2FsbGJhY2soZXJyKTtcbiAgfTtcbiAgaWZyYW1lLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICBkZWJ1Zygnb25lcnJvcicsIGlkKTtcbiAgICBjb21wbGV0ZWQoKTtcbiAgfTtcbiAgaWZyYW1lLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIGRlYnVnKCdvbmxvYWQnLCBpZCk7XG4gICAgY29tcGxldGVkKCk7XG4gIH07XG4gIGlmcmFtZS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbihlKSB7XG4gICAgZGVidWcoJ29ucmVhZHlzdGF0ZWNoYW5nZScsIGlkLCBpZnJhbWUucmVhZHlTdGF0ZSwgZSk7XG4gICAgaWYgKGlmcmFtZS5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB7XG4gICAgICBjb21wbGV0ZWQoKTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBkZWJ1ZygnYWJvcnRlZCcsIGlkKTtcbiAgICBjb21wbGV0ZWQobmV3IEVycm9yKCdBYm9ydGVkJykpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlclxuICAsIGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKVxuICAsIGV2ZW50VXRpbHMgPSByZXF1aXJlKCcuLi8uLi91dGlscy9ldmVudCcpXG4gICwgYnJvd3NlciA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL2Jyb3dzZXInKVxuICAsIHVybFV0aWxzID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvdXJsJylcbiAgO1xuXG52YXIgZGVidWcgPSBmdW5jdGlvbigpIHt9O1xuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCdzb2NranMtY2xpZW50OnNlbmRlcjp4ZHInKTtcbn1cblxuLy8gUmVmZXJlbmNlczpcbi8vICAgaHR0cDovL2FqYXhpYW4uY29tL2FyY2hpdmVzLzEwMC1saW5lLWFqYXgtd3JhcHBlclxuLy8gICBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvY2MyODgwNjAodj1WUy44NSkuYXNweFxuXG5mdW5jdGlvbiBYRFJPYmplY3QobWV0aG9kLCB1cmwsIHBheWxvYWQpIHtcbiAgZGVidWcobWV0aG9kLCB1cmwpO1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgc2VsZi5fc3RhcnQobWV0aG9kLCB1cmwsIHBheWxvYWQpO1xuICB9LCAwKTtcbn1cblxuaW5oZXJpdHMoWERST2JqZWN0LCBFdmVudEVtaXR0ZXIpO1xuXG5YRFJPYmplY3QucHJvdG90eXBlLl9zdGFydCA9IGZ1bmN0aW9uKG1ldGhvZCwgdXJsLCBwYXlsb2FkKSB7XG4gIGRlYnVnKCdfc3RhcnQnKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgeGRyID0gbmV3IGdsb2JhbC5YRG9tYWluUmVxdWVzdCgpO1xuICAvLyBJRSBjYWNoZXMgZXZlbiBQT1NUc1xuICB1cmwgPSB1cmxVdGlscy5hZGRRdWVyeSh1cmwsICd0PScgKyAoK25ldyBEYXRlKCkpKTtcblxuICB4ZHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgIGRlYnVnKCdvbmVycm9yJyk7XG4gICAgc2VsZi5fZXJyb3IoKTtcbiAgfTtcbiAgeGRyLm9udGltZW91dCA9IGZ1bmN0aW9uKCkge1xuICAgIGRlYnVnKCdvbnRpbWVvdXQnKTtcbiAgICBzZWxmLl9lcnJvcigpO1xuICB9O1xuICB4ZHIub25wcm9ncmVzcyA9IGZ1bmN0aW9uKCkge1xuICAgIGRlYnVnKCdwcm9ncmVzcycsIHhkci5yZXNwb25zZVRleHQpO1xuICAgIHNlbGYuZW1pdCgnY2h1bmsnLCAyMDAsIHhkci5yZXNwb25zZVRleHQpO1xuICB9O1xuICB4ZHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgZGVidWcoJ2xvYWQnKTtcbiAgICBzZWxmLmVtaXQoJ2ZpbmlzaCcsIDIwMCwgeGRyLnJlc3BvbnNlVGV4dCk7XG4gICAgc2VsZi5fY2xlYW51cChmYWxzZSk7XG4gIH07XG4gIHRoaXMueGRyID0geGRyO1xuICB0aGlzLnVubG9hZFJlZiA9IGV2ZW50VXRpbHMudW5sb2FkQWRkKGZ1bmN0aW9uKCkge1xuICAgIHNlbGYuX2NsZWFudXAodHJ1ZSk7XG4gIH0pO1xuICB0cnkge1xuICAgIC8vIEZhaWxzIHdpdGggQWNjZXNzRGVuaWVkIGlmIHBvcnQgbnVtYmVyIGlzIGJvZ3VzXG4gICAgdGhpcy54ZHIub3BlbihtZXRob2QsIHVybCk7XG4gICAgaWYgKHRoaXMudGltZW91dCkge1xuICAgICAgdGhpcy54ZHIudGltZW91dCA9IHRoaXMudGltZW91dDtcbiAgICB9XG4gICAgdGhpcy54ZHIuc2VuZChwYXlsb2FkKTtcbiAgfSBjYXRjaCAoeCkge1xuICAgIHRoaXMuX2Vycm9yKCk7XG4gIH1cbn07XG5cblhEUk9iamVjdC5wcm90b3R5cGUuX2Vycm9yID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZW1pdCgnZmluaXNoJywgMCwgJycpO1xuICB0aGlzLl9jbGVhbnVwKGZhbHNlKTtcbn07XG5cblhEUk9iamVjdC5wcm90b3R5cGUuX2NsZWFudXAgPSBmdW5jdGlvbihhYm9ydCkge1xuICBkZWJ1ZygnY2xlYW51cCcsIGFib3J0KTtcbiAgaWYgKCF0aGlzLnhkcikge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICBldmVudFV0aWxzLnVubG9hZERlbCh0aGlzLnVubG9hZFJlZik7XG5cbiAgdGhpcy54ZHIub250aW1lb3V0ID0gdGhpcy54ZHIub25lcnJvciA9IHRoaXMueGRyLm9ucHJvZ3Jlc3MgPSB0aGlzLnhkci5vbmxvYWQgPSBudWxsO1xuICBpZiAoYWJvcnQpIHtcbiAgICB0cnkge1xuICAgICAgdGhpcy54ZHIuYWJvcnQoKTtcbiAgICB9IGNhdGNoICh4KSB7XG4gICAgICAvLyBpbnRlbnRpb25hbGx5IGVtcHR5XG4gICAgfVxuICB9XG4gIHRoaXMudW5sb2FkUmVmID0gdGhpcy54ZHIgPSBudWxsO1xufTtcblxuWERST2JqZWN0LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuICBkZWJ1ZygnY2xvc2UnKTtcbiAgdGhpcy5fY2xlYW51cCh0cnVlKTtcbn07XG5cbi8vIElFIDgvOSBpZiB0aGUgcmVxdWVzdCB0YXJnZXQgdXNlcyB0aGUgc2FtZSBzY2hlbWUgLSAjNzlcblhEUk9iamVjdC5lbmFibGVkID0gISEoZ2xvYmFsLlhEb21haW5SZXF1ZXN0ICYmIGJyb3dzZXIuaGFzRG9tYWluKCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFhEUk9iamVjdDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKVxuICAsIFhockRyaXZlciA9IHJlcXVpcmUoJy4uL2RyaXZlci94aHInKVxuICA7XG5cbmZ1bmN0aW9uIFhIUkNvcnNPYmplY3QobWV0aG9kLCB1cmwsIHBheWxvYWQsIG9wdHMpIHtcbiAgWGhyRHJpdmVyLmNhbGwodGhpcywgbWV0aG9kLCB1cmwsIHBheWxvYWQsIG9wdHMpO1xufVxuXG5pbmhlcml0cyhYSFJDb3JzT2JqZWN0LCBYaHJEcml2ZXIpO1xuXG5YSFJDb3JzT2JqZWN0LmVuYWJsZWQgPSBYaHJEcml2ZXIuZW5hYmxlZCAmJiBYaHJEcml2ZXIuc3VwcG9ydHNDT1JTO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFhIUkNvcnNPYmplY3Q7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXJcbiAgLCBpbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJylcbiAgO1xuXG5mdW5jdGlvbiBYSFJGYWtlKC8qIG1ldGhvZCwgdXJsLCBwYXlsb2FkLCBvcHRzICovKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgRXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG5cbiAgdGhpcy50byA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgc2VsZi5lbWl0KCdmaW5pc2gnLCAyMDAsICd7fScpO1xuICB9LCBYSFJGYWtlLnRpbWVvdXQpO1xufVxuXG5pbmhlcml0cyhYSFJGYWtlLCBFdmVudEVtaXR0ZXIpO1xuXG5YSFJGYWtlLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuICBjbGVhclRpbWVvdXQodGhpcy50byk7XG59O1xuXG5YSFJGYWtlLnRpbWVvdXQgPSAyMDAwO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFhIUkZha2U7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJylcbiAgLCBYaHJEcml2ZXIgPSByZXF1aXJlKCcuLi9kcml2ZXIveGhyJylcbiAgO1xuXG5mdW5jdGlvbiBYSFJMb2NhbE9iamVjdChtZXRob2QsIHVybCwgcGF5bG9hZCAvKiwgb3B0cyAqLykge1xuICBYaHJEcml2ZXIuY2FsbCh0aGlzLCBtZXRob2QsIHVybCwgcGF5bG9hZCwge1xuICAgIG5vQ3JlZGVudGlhbHM6IHRydWVcbiAgfSk7XG59XG5cbmluaGVyaXRzKFhIUkxvY2FsT2JqZWN0LCBYaHJEcml2ZXIpO1xuXG5YSFJMb2NhbE9iamVjdC5lbmFibGVkID0gWGhyRHJpdmVyLmVuYWJsZWQ7XG5cbm1vZHVsZS5leHBvcnRzID0gWEhSTG9jYWxPYmplY3Q7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzL2V2ZW50JylcbiAgLCB1cmxVdGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzL3VybCcpXG4gICwgaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpXG4gICwgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyXG4gICwgV2Vic29ja2V0RHJpdmVyID0gcmVxdWlyZSgnLi9kcml2ZXIvd2Vic29ja2V0JylcbiAgO1xuXG52YXIgZGVidWcgPSBmdW5jdGlvbigpIHt9O1xuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCdzb2NranMtY2xpZW50OndlYnNvY2tldCcpO1xufVxuXG5mdW5jdGlvbiBXZWJTb2NrZXRUcmFuc3BvcnQodHJhbnNVcmwsIGlnbm9yZSwgb3B0aW9ucykge1xuICBpZiAoIVdlYlNvY2tldFRyYW5zcG9ydC5lbmFibGVkKCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RyYW5zcG9ydCBjcmVhdGVkIHdoZW4gZGlzYWJsZWQnKTtcbiAgfVxuXG4gIEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuICBkZWJ1ZygnY29uc3RydWN0b3InLCB0cmFuc1VybCk7XG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgdXJsID0gdXJsVXRpbHMuYWRkUGF0aCh0cmFuc1VybCwgJy93ZWJzb2NrZXQnKTtcbiAgaWYgKHVybC5zbGljZSgwLCA1KSA9PT0gJ2h0dHBzJykge1xuICAgIHVybCA9ICd3c3MnICsgdXJsLnNsaWNlKDUpO1xuICB9IGVsc2Uge1xuICAgIHVybCA9ICd3cycgKyB1cmwuc2xpY2UoNCk7XG4gIH1cbiAgdGhpcy51cmwgPSB1cmw7XG5cbiAgdGhpcy53cyA9IG5ldyBXZWJzb2NrZXREcml2ZXIodGhpcy51cmwsIFtdLCBvcHRpb25zKTtcbiAgdGhpcy53cy5vbm1lc3NhZ2UgPSBmdW5jdGlvbihlKSB7XG4gICAgZGVidWcoJ21lc3NhZ2UgZXZlbnQnLCBlLmRhdGEpO1xuICAgIHNlbGYuZW1pdCgnbWVzc2FnZScsIGUuZGF0YSk7XG4gIH07XG4gIC8vIEZpcmVmb3ggaGFzIGFuIGludGVyZXN0aW5nIGJ1Zy4gSWYgYSB3ZWJzb2NrZXQgY29ubmVjdGlvbiBpc1xuICAvLyBjcmVhdGVkIGFmdGVyIG9udW5sb2FkLCBpdCBzdGF5cyBhbGl2ZSBldmVuIHdoZW4gdXNlclxuICAvLyBuYXZpZ2F0ZXMgYXdheSBmcm9tIHRoZSBwYWdlLiBJbiBzdWNoIHNpdHVhdGlvbiBsZXQncyBsaWUgLVxuICAvLyBsZXQncyBub3Qgb3BlbiB0aGUgd3MgY29ubmVjdGlvbiBhdCBhbGwuIFNlZTpcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3NvY2tqcy9zb2NranMtY2xpZW50L2lzc3Vlcy8yOFxuICAvLyBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTYwODVcbiAgdGhpcy51bmxvYWRSZWYgPSB1dGlscy51bmxvYWRBZGQoZnVuY3Rpb24oKSB7XG4gICAgZGVidWcoJ3VubG9hZCcpO1xuICAgIHNlbGYud3MuY2xvc2UoKTtcbiAgfSk7XG4gIHRoaXMud3Mub25jbG9zZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICBkZWJ1ZygnY2xvc2UgZXZlbnQnLCBlLmNvZGUsIGUucmVhc29uKTtcbiAgICBzZWxmLmVtaXQoJ2Nsb3NlJywgZS5jb2RlLCBlLnJlYXNvbik7XG4gICAgc2VsZi5fY2xlYW51cCgpO1xuICB9O1xuICB0aGlzLndzLm9uZXJyb3IgPSBmdW5jdGlvbihlKSB7XG4gICAgZGVidWcoJ2Vycm9yIGV2ZW50JywgZSk7XG4gICAgc2VsZi5lbWl0KCdjbG9zZScsIDEwMDYsICdXZWJTb2NrZXQgY29ubmVjdGlvbiBicm9rZW4nKTtcbiAgICBzZWxmLl9jbGVhbnVwKCk7XG4gIH07XG59XG5cbmluaGVyaXRzKFdlYlNvY2tldFRyYW5zcG9ydCwgRXZlbnRFbWl0dGVyKTtcblxuV2ViU29ja2V0VHJhbnNwb3J0LnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24oZGF0YSkge1xuICB2YXIgbXNnID0gJ1snICsgZGF0YSArICddJztcbiAgZGVidWcoJ3NlbmQnLCBtc2cpO1xuICB0aGlzLndzLnNlbmQobXNnKTtcbn07XG5cbldlYlNvY2tldFRyYW5zcG9ydC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgZGVidWcoJ2Nsb3NlJyk7XG4gIHZhciB3cyA9IHRoaXMud3M7XG4gIHRoaXMuX2NsZWFudXAoKTtcbiAgaWYgKHdzKSB7XG4gICAgd3MuY2xvc2UoKTtcbiAgfVxufTtcblxuV2ViU29ja2V0VHJhbnNwb3J0LnByb3RvdHlwZS5fY2xlYW51cCA9IGZ1bmN0aW9uKCkge1xuICBkZWJ1ZygnX2NsZWFudXAnKTtcbiAgdmFyIHdzID0gdGhpcy53cztcbiAgaWYgKHdzKSB7XG4gICAgd3Mub25tZXNzYWdlID0gd3Mub25jbG9zZSA9IHdzLm9uZXJyb3IgPSBudWxsO1xuICB9XG4gIHV0aWxzLnVubG9hZERlbCh0aGlzLnVubG9hZFJlZik7XG4gIHRoaXMudW5sb2FkUmVmID0gdGhpcy53cyA9IG51bGw7XG4gIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG59O1xuXG5XZWJTb2NrZXRUcmFuc3BvcnQuZW5hYmxlZCA9IGZ1bmN0aW9uKCkge1xuICBkZWJ1ZygnZW5hYmxlZCcpO1xuICByZXR1cm4gISFXZWJzb2NrZXREcml2ZXI7XG59O1xuV2ViU29ja2V0VHJhbnNwb3J0LnRyYW5zcG9ydE5hbWUgPSAnd2Vic29ja2V0JztcblxuLy8gSW4gdGhlb3J5LCB3cyBzaG91bGQgcmVxdWlyZSAxIHJvdW5kIHRyaXAuIEJ1dCBpbiBjaHJvbWUsIHRoaXMgaXNcbi8vIG5vdCB2ZXJ5IHN0YWJsZSBvdmVyIFNTTC4gTW9zdCBsaWtlbHkgYSB3cyBjb25uZWN0aW9uIHJlcXVpcmVzIGFcbi8vIHNlcGFyYXRlIFNTTCBjb25uZWN0aW9uLCBpbiB3aGljaCBjYXNlIDIgcm91bmQgdHJpcHMgYXJlIGFuXG4vLyBhYnNvbHV0ZSBtaW51bXVtLlxuV2ViU29ja2V0VHJhbnNwb3J0LnJvdW5kVHJpcHMgPSAyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFdlYlNvY2tldFRyYW5zcG9ydDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKVxuICAsIEFqYXhCYXNlZFRyYW5zcG9ydCA9IHJlcXVpcmUoJy4vbGliL2FqYXgtYmFzZWQnKVxuICAsIFhkclN0cmVhbWluZ1RyYW5zcG9ydCA9IHJlcXVpcmUoJy4veGRyLXN0cmVhbWluZycpXG4gICwgWGhyUmVjZWl2ZXIgPSByZXF1aXJlKCcuL3JlY2VpdmVyL3hocicpXG4gICwgWERST2JqZWN0ID0gcmVxdWlyZSgnLi9zZW5kZXIveGRyJylcbiAgO1xuXG5mdW5jdGlvbiBYZHJQb2xsaW5nVHJhbnNwb3J0KHRyYW5zVXJsKSB7XG4gIGlmICghWERST2JqZWN0LmVuYWJsZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RyYW5zcG9ydCBjcmVhdGVkIHdoZW4gZGlzYWJsZWQnKTtcbiAgfVxuICBBamF4QmFzZWRUcmFuc3BvcnQuY2FsbCh0aGlzLCB0cmFuc1VybCwgJy94aHInLCBYaHJSZWNlaXZlciwgWERST2JqZWN0KTtcbn1cblxuaW5oZXJpdHMoWGRyUG9sbGluZ1RyYW5zcG9ydCwgQWpheEJhc2VkVHJhbnNwb3J0KTtcblxuWGRyUG9sbGluZ1RyYW5zcG9ydC5lbmFibGVkID0gWGRyU3RyZWFtaW5nVHJhbnNwb3J0LmVuYWJsZWQ7XG5YZHJQb2xsaW5nVHJhbnNwb3J0LnRyYW5zcG9ydE5hbWUgPSAneGRyLXBvbGxpbmcnO1xuWGRyUG9sbGluZ1RyYW5zcG9ydC5yb3VuZFRyaXBzID0gMjsgLy8gcHJlZmxpZ2h0LCBhamF4XG5cbm1vZHVsZS5leHBvcnRzID0gWGRyUG9sbGluZ1RyYW5zcG9ydDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKVxuICAsIEFqYXhCYXNlZFRyYW5zcG9ydCA9IHJlcXVpcmUoJy4vbGliL2FqYXgtYmFzZWQnKVxuICAsIFhoclJlY2VpdmVyID0gcmVxdWlyZSgnLi9yZWNlaXZlci94aHInKVxuICAsIFhEUk9iamVjdCA9IHJlcXVpcmUoJy4vc2VuZGVyL3hkcicpXG4gIDtcblxuLy8gQWNjb3JkaW5nIHRvOlxuLy8gICBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE2NDE1MDcvZGV0ZWN0LWJyb3dzZXItc3VwcG9ydC1mb3ItY3Jvc3MtZG9tYWluLXhtbGh0dHByZXF1ZXN0c1xuLy8gICBodHRwOi8vaGFja3MubW96aWxsYS5vcmcvMjAwOS8wNy9jcm9zcy1zaXRlLXhtbGh0dHByZXF1ZXN0LXdpdGgtY29ycy9cblxuZnVuY3Rpb24gWGRyU3RyZWFtaW5nVHJhbnNwb3J0KHRyYW5zVXJsKSB7XG4gIGlmICghWERST2JqZWN0LmVuYWJsZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RyYW5zcG9ydCBjcmVhdGVkIHdoZW4gZGlzYWJsZWQnKTtcbiAgfVxuICBBamF4QmFzZWRUcmFuc3BvcnQuY2FsbCh0aGlzLCB0cmFuc1VybCwgJy94aHJfc3RyZWFtaW5nJywgWGhyUmVjZWl2ZXIsIFhEUk9iamVjdCk7XG59XG5cbmluaGVyaXRzKFhkclN0cmVhbWluZ1RyYW5zcG9ydCwgQWpheEJhc2VkVHJhbnNwb3J0KTtcblxuWGRyU3RyZWFtaW5nVHJhbnNwb3J0LmVuYWJsZWQgPSBmdW5jdGlvbihpbmZvKSB7XG4gIGlmIChpbmZvLmNvb2tpZV9uZWVkZWQgfHwgaW5mby5udWxsT3JpZ2luKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiBYRFJPYmplY3QuZW5hYmxlZCAmJiBpbmZvLnNhbWVTY2hlbWU7XG59O1xuXG5YZHJTdHJlYW1pbmdUcmFuc3BvcnQudHJhbnNwb3J0TmFtZSA9ICd4ZHItc3RyZWFtaW5nJztcblhkclN0cmVhbWluZ1RyYW5zcG9ydC5yb3VuZFRyaXBzID0gMjsgLy8gcHJlZmxpZ2h0LCBhamF4XG5cbm1vZHVsZS5leHBvcnRzID0gWGRyU3RyZWFtaW5nVHJhbnNwb3J0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpXG4gICwgQWpheEJhc2VkVHJhbnNwb3J0ID0gcmVxdWlyZSgnLi9saWIvYWpheC1iYXNlZCcpXG4gICwgWGhyUmVjZWl2ZXIgPSByZXF1aXJlKCcuL3JlY2VpdmVyL3hocicpXG4gICwgWEhSQ29yc09iamVjdCA9IHJlcXVpcmUoJy4vc2VuZGVyL3hoci1jb3JzJylcbiAgLCBYSFJMb2NhbE9iamVjdCA9IHJlcXVpcmUoJy4vc2VuZGVyL3hoci1sb2NhbCcpXG4gIDtcblxuZnVuY3Rpb24gWGhyUG9sbGluZ1RyYW5zcG9ydCh0cmFuc1VybCkge1xuICBpZiAoIVhIUkxvY2FsT2JqZWN0LmVuYWJsZWQgJiYgIVhIUkNvcnNPYmplY3QuZW5hYmxlZCkge1xuICAgIHRocm93IG5ldyBFcnJvcignVHJhbnNwb3J0IGNyZWF0ZWQgd2hlbiBkaXNhYmxlZCcpO1xuICB9XG4gIEFqYXhCYXNlZFRyYW5zcG9ydC5jYWxsKHRoaXMsIHRyYW5zVXJsLCAnL3hocicsIFhoclJlY2VpdmVyLCBYSFJDb3JzT2JqZWN0KTtcbn1cblxuaW5oZXJpdHMoWGhyUG9sbGluZ1RyYW5zcG9ydCwgQWpheEJhc2VkVHJhbnNwb3J0KTtcblxuWGhyUG9sbGluZ1RyYW5zcG9ydC5lbmFibGVkID0gZnVuY3Rpb24oaW5mbykge1xuICBpZiAoaW5mby5udWxsT3JpZ2luKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKFhIUkxvY2FsT2JqZWN0LmVuYWJsZWQgJiYgaW5mby5zYW1lT3JpZ2luKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIFhIUkNvcnNPYmplY3QuZW5hYmxlZDtcbn07XG5cblhoclBvbGxpbmdUcmFuc3BvcnQudHJhbnNwb3J0TmFtZSA9ICd4aHItcG9sbGluZyc7XG5YaHJQb2xsaW5nVHJhbnNwb3J0LnJvdW5kVHJpcHMgPSAyOyAvLyBwcmVmbGlnaHQsIGFqYXhcblxubW9kdWxlLmV4cG9ydHMgPSBYaHJQb2xsaW5nVHJhbnNwb3J0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpXG4gICwgQWpheEJhc2VkVHJhbnNwb3J0ID0gcmVxdWlyZSgnLi9saWIvYWpheC1iYXNlZCcpXG4gICwgWGhyUmVjZWl2ZXIgPSByZXF1aXJlKCcuL3JlY2VpdmVyL3hocicpXG4gICwgWEhSQ29yc09iamVjdCA9IHJlcXVpcmUoJy4vc2VuZGVyL3hoci1jb3JzJylcbiAgLCBYSFJMb2NhbE9iamVjdCA9IHJlcXVpcmUoJy4vc2VuZGVyL3hoci1sb2NhbCcpXG4gICwgYnJvd3NlciA9IHJlcXVpcmUoJy4uL3V0aWxzL2Jyb3dzZXInKVxuICA7XG5cbmZ1bmN0aW9uIFhoclN0cmVhbWluZ1RyYW5zcG9ydCh0cmFuc1VybCkge1xuICBpZiAoIVhIUkxvY2FsT2JqZWN0LmVuYWJsZWQgJiYgIVhIUkNvcnNPYmplY3QuZW5hYmxlZCkge1xuICAgIHRocm93IG5ldyBFcnJvcignVHJhbnNwb3J0IGNyZWF0ZWQgd2hlbiBkaXNhYmxlZCcpO1xuICB9XG4gIEFqYXhCYXNlZFRyYW5zcG9ydC5jYWxsKHRoaXMsIHRyYW5zVXJsLCAnL3hocl9zdHJlYW1pbmcnLCBYaHJSZWNlaXZlciwgWEhSQ29yc09iamVjdCk7XG59XG5cbmluaGVyaXRzKFhoclN0cmVhbWluZ1RyYW5zcG9ydCwgQWpheEJhc2VkVHJhbnNwb3J0KTtcblxuWGhyU3RyZWFtaW5nVHJhbnNwb3J0LmVuYWJsZWQgPSBmdW5jdGlvbihpbmZvKSB7XG4gIGlmIChpbmZvLm51bGxPcmlnaW4pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy8gT3BlcmEgZG9lc24ndCBzdXBwb3J0IHhoci1zdHJlYW1pbmcgIzYwXG4gIC8vIEJ1dCBpdCBtaWdodCBiZSBhYmxlIHRvICM5MlxuICBpZiAoYnJvd3Nlci5pc09wZXJhKCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gWEhSQ29yc09iamVjdC5lbmFibGVkO1xufTtcblxuWGhyU3RyZWFtaW5nVHJhbnNwb3J0LnRyYW5zcG9ydE5hbWUgPSAneGhyLXN0cmVhbWluZyc7XG5YaHJTdHJlYW1pbmdUcmFuc3BvcnQucm91bmRUcmlwcyA9IDI7IC8vIHByZWZsaWdodCwgYWpheFxuXG4vLyBTYWZhcmkgZ2V0cyBjb25mdXNlZCB3aGVuIGEgc3RyZWFtaW5nIGFqYXggcmVxdWVzdCBpcyBzdGFydGVkXG4vLyBiZWZvcmUgb25sb2FkLiBUaGlzIGNhdXNlcyB0aGUgbG9hZCBpbmRpY2F0b3IgdG8gc3BpbiBpbmRlZmluZXRlbHkuXG4vLyBPbmx5IHJlcXVpcmUgYm9keSB3aGVuIHVzZWQgaW4gYSBicm93c2VyXG5YaHJTdHJlYW1pbmdUcmFuc3BvcnQubmVlZEJvZHkgPSAhIWdsb2JhbC5kb2N1bWVudDtcblxubW9kdWxlLmV4cG9ydHMgPSBYaHJTdHJlYW1pbmdUcmFuc3BvcnQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbmlmIChnbG9iYWwuY3J5cHRvICYmIGdsb2JhbC5jcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKSB7XG4gIG1vZHVsZS5leHBvcnRzLnJhbmRvbUJ5dGVzID0gZnVuY3Rpb24obGVuZ3RoKSB7XG4gICAgdmFyIGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkobGVuZ3RoKTtcbiAgICBnbG9iYWwuY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhieXRlcyk7XG4gICAgcmV0dXJuIGJ5dGVzO1xuICB9O1xufSBlbHNlIHtcbiAgbW9kdWxlLmV4cG9ydHMucmFuZG9tQnl0ZXMgPSBmdW5jdGlvbihsZW5ndGgpIHtcbiAgICB2YXIgYnl0ZXMgPSBuZXcgQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBieXRlc1tpXSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDI1Nik7XG4gICAgfVxuICAgIHJldHVybiBieXRlcztcbiAgfTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzT3BlcmE6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBnbG9iYWwubmF2aWdhdG9yICYmXG4gICAgICAvb3BlcmEvaS50ZXN0KGdsb2JhbC5uYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgfVxuXG4sIGlzS29ucXVlcm9yOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZ2xvYmFsLm5hdmlnYXRvciAmJlxuICAgICAgL2tvbnF1ZXJvci9pLnRlc3QoZ2xvYmFsLm5hdmlnYXRvci51c2VyQWdlbnQpO1xuICB9XG5cbiAgLy8gIzE4NyB3cmFwIGRvY3VtZW50LmRvbWFpbiBpbiB0cnkvY2F0Y2ggYmVjYXVzZSBvZiBXUDggZnJvbSBmaWxlOi8vL1xuLCBoYXNEb21haW46IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBub24tYnJvd3NlciBjbGllbnQgYWx3YXlzIGhhcyBhIGRvbWFpblxuICAgIGlmICghZ2xvYmFsLmRvY3VtZW50KSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgcmV0dXJuICEhZ2xvYmFsLmRvY3VtZW50LmRvbWFpbjtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgSlNPTjMgPSByZXF1aXJlKCdqc29uMycpO1xuXG4vLyBTb21lIGV4dHJhIGNoYXJhY3RlcnMgdGhhdCBDaHJvbWUgZ2V0cyB3cm9uZywgYW5kIHN1YnN0aXR1dGVzIHdpdGhcbi8vIHNvbWV0aGluZyBlbHNlIG9uIHRoZSB3aXJlLlxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnRyb2wtcmVnZXgsIG5vLW1pc2xlYWRpbmctY2hhcmFjdGVyLWNsYXNzXG52YXIgZXh0cmFFc2NhcGFibGUgPSAvW1xceDAwLVxceDFmXFx1ZDgwMC1cXHVkZmZmXFx1ZmZmZVxcdWZmZmZcXHUwMzAwLVxcdTAzMzNcXHUwMzNkLVxcdTAzNDZcXHUwMzRhLVxcdTAzNGNcXHUwMzUwLVxcdTAzNTJcXHUwMzU3LVxcdTAzNThcXHUwMzVjLVxcdTAzNjJcXHUwMzc0XFx1MDM3ZVxcdTAzODdcXHUwNTkxLVxcdTA1YWZcXHUwNWM0XFx1MDYxMC1cXHUwNjE3XFx1MDY1My1cXHUwNjU0XFx1MDY1Ny1cXHUwNjViXFx1MDY1ZC1cXHUwNjVlXFx1MDZkZi1cXHUwNmUyXFx1MDZlYi1cXHUwNmVjXFx1MDczMFxcdTA3MzItXFx1MDczM1xcdTA3MzUtXFx1MDczNlxcdTA3M2FcXHUwNzNkXFx1MDczZi1cXHUwNzQxXFx1MDc0M1xcdTA3NDVcXHUwNzQ3XFx1MDdlYi1cXHUwN2YxXFx1MDk1MVxcdTA5NTgtXFx1MDk1ZlxcdTA5ZGMtXFx1MDlkZFxcdTA5ZGZcXHUwYTMzXFx1MGEzNlxcdTBhNTktXFx1MGE1YlxcdTBhNWVcXHUwYjVjLVxcdTBiNWRcXHUwZTM4LVxcdTBlMzlcXHUwZjQzXFx1MGY0ZFxcdTBmNTJcXHUwZjU3XFx1MGY1Y1xcdTBmNjlcXHUwZjcyLVxcdTBmNzZcXHUwZjc4XFx1MGY4MC1cXHUwZjgzXFx1MGY5M1xcdTBmOWRcXHUwZmEyXFx1MGZhN1xcdTBmYWNcXHUwZmI5XFx1MTkzOS1cXHUxOTNhXFx1MWExN1xcdTFiNmJcXHUxY2RhLVxcdTFjZGJcXHUxZGMwLVxcdTFkY2ZcXHUxZGZjXFx1MWRmZVxcdTFmNzFcXHUxZjczXFx1MWY3NVxcdTFmNzdcXHUxZjc5XFx1MWY3YlxcdTFmN2RcXHUxZmJiXFx1MWZiZVxcdTFmYzlcXHUxZmNiXFx1MWZkM1xcdTFmZGJcXHUxZmUzXFx1MWZlYlxcdTFmZWUtXFx1MWZlZlxcdTFmZjlcXHUxZmZiXFx1MWZmZFxcdTIwMDAtXFx1MjAwMVxcdTIwZDAtXFx1MjBkMVxcdTIwZDQtXFx1MjBkN1xcdTIwZTctXFx1MjBlOVxcdTIxMjZcXHUyMTJhLVxcdTIxMmJcXHUyMzI5LVxcdTIzMmFcXHUyYWRjXFx1MzAyYi1cXHUzMDJjXFx1YWFiMi1cXHVhYWIzXFx1ZjkwMC1cXHVmYTBkXFx1ZmExMFxcdWZhMTJcXHVmYTE1LVxcdWZhMWVcXHVmYTIwXFx1ZmEyMlxcdWZhMjUtXFx1ZmEyNlxcdWZhMmEtXFx1ZmEyZFxcdWZhMzAtXFx1ZmE2ZFxcdWZhNzAtXFx1ZmFkOVxcdWZiMWRcXHVmYjFmXFx1ZmIyYS1cXHVmYjM2XFx1ZmIzOC1cXHVmYjNjXFx1ZmIzZVxcdWZiNDAtXFx1ZmI0MVxcdWZiNDMtXFx1ZmI0NFxcdWZiNDYtXFx1ZmI0ZVxcdWZmZjAtXFx1ZmZmZl0vZ1xuICAsIGV4dHJhTG9va3VwO1xuXG4vLyBUaGlzIG1heSBiZSBxdWl0ZSBzbG93LCBzbyBsZXQncyBkZWxheSB1bnRpbCB1c2VyIGFjdHVhbGx5IHVzZXMgYmFkXG4vLyBjaGFyYWN0ZXJzLlxudmFyIHVucm9sbExvb2t1cCA9IGZ1bmN0aW9uKGVzY2FwYWJsZSkge1xuICB2YXIgaTtcbiAgdmFyIHVucm9sbGVkID0ge307XG4gIHZhciBjID0gW107XG4gIGZvciAoaSA9IDA7IGkgPCA2NTUzNjsgaSsrKSB7XG4gICAgYy5wdXNoKCBTdHJpbmcuZnJvbUNoYXJDb2RlKGkpICk7XG4gIH1cbiAgZXNjYXBhYmxlLmxhc3RJbmRleCA9IDA7XG4gIGMuam9pbignJykucmVwbGFjZShlc2NhcGFibGUsIGZ1bmN0aW9uKGEpIHtcbiAgICB1bnJvbGxlZFsgYSBdID0gJ1xcXFx1JyArICgnMDAwMCcgKyBhLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpKS5zbGljZSgtNCk7XG4gICAgcmV0dXJuICcnO1xuICB9KTtcbiAgZXNjYXBhYmxlLmxhc3RJbmRleCA9IDA7XG4gIHJldHVybiB1bnJvbGxlZDtcbn07XG5cbi8vIFF1b3RlIHN0cmluZywgYWxzbyB0YWtpbmcgY2FyZSBvZiB1bmljb2RlIGNoYXJhY3RlcnMgdGhhdCBicm93c2Vyc1xuLy8gb2Z0ZW4gYnJlYWsuIEVzcGVjaWFsbHksIHRha2UgY2FyZSBvZiB1bmljb2RlIHN1cnJvZ2F0ZXM6XG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01hcHBpbmdfb2ZfVW5pY29kZV9jaGFyYWN0ZXJzI1N1cnJvZ2F0ZXNcbm1vZHVsZS5leHBvcnRzID0ge1xuICBxdW90ZTogZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgdmFyIHF1b3RlZCA9IEpTT04zLnN0cmluZ2lmeShzdHJpbmcpO1xuXG4gICAgLy8gSW4gbW9zdCBjYXNlcyB0aGlzIHNob3VsZCBiZSB2ZXJ5IGZhc3QgYW5kIGdvb2QgZW5vdWdoLlxuICAgIGV4dHJhRXNjYXBhYmxlLmxhc3RJbmRleCA9IDA7XG4gICAgaWYgKCFleHRyYUVzY2FwYWJsZS50ZXN0KHF1b3RlZCkpIHtcbiAgICAgIHJldHVybiBxdW90ZWQ7XG4gICAgfVxuXG4gICAgaWYgKCFleHRyYUxvb2t1cCkge1xuICAgICAgZXh0cmFMb29rdXAgPSB1bnJvbGxMb29rdXAoZXh0cmFFc2NhcGFibGUpO1xuICAgIH1cblxuICAgIHJldHVybiBxdW90ZWQucmVwbGFjZShleHRyYUVzY2FwYWJsZSwgZnVuY3Rpb24oYSkge1xuICAgICAgcmV0dXJuIGV4dHJhTG9va3VwW2FdO1xuICAgIH0pO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcmFuZG9tID0gcmVxdWlyZSgnLi9yYW5kb20nKTtcblxudmFyIG9uVW5sb2FkID0ge31cbiAgLCBhZnRlclVubG9hZCA9IGZhbHNlXG4gICAgLy8gZGV0ZWN0IGdvb2dsZSBjaHJvbWUgcGFja2FnZWQgYXBwcyBiZWNhdXNlIHRoZXkgZG9uJ3QgYWxsb3cgdGhlICd1bmxvYWQnIGV2ZW50XG4gICwgaXNDaHJvbWVQYWNrYWdlZEFwcCA9IGdsb2JhbC5jaHJvbWUgJiYgZ2xvYmFsLmNocm9tZS5hcHAgJiYgZ2xvYmFsLmNocm9tZS5hcHAucnVudGltZVxuICA7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhdHRhY2hFdmVudDogZnVuY3Rpb24oZXZlbnQsIGxpc3RlbmVyKSB7XG4gICAgaWYgKHR5cGVvZiBnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGdsb2JhbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lciwgZmFsc2UpO1xuICAgIH0gZWxzZSBpZiAoZ2xvYmFsLmRvY3VtZW50ICYmIGdsb2JhbC5hdHRhY2hFdmVudCkge1xuICAgICAgLy8gSUUgcXVpcmtzLlxuICAgICAgLy8gQWNjb3JkaW5nIHRvOiBodHRwOi8vc3RldmVzb3VkZXJzLmNvbS9taXNjL3Rlc3QtcG9zdG1lc3NhZ2UucGhwXG4gICAgICAvLyB0aGUgbWVzc2FnZSBnZXRzIGRlbGl2ZXJlZCBvbmx5IHRvICdkb2N1bWVudCcsIG5vdCAnd2luZG93Jy5cbiAgICAgIGdsb2JhbC5kb2N1bWVudC5hdHRhY2hFdmVudCgnb24nICsgZXZlbnQsIGxpc3RlbmVyKTtcbiAgICAgIC8vIEkgZ2V0ICd3aW5kb3cnIGZvciBpZTguXG4gICAgICBnbG9iYWwuYXR0YWNoRXZlbnQoJ29uJyArIGV2ZW50LCBsaXN0ZW5lcik7XG4gICAgfVxuICB9XG5cbiwgZGV0YWNoRXZlbnQ6IGZ1bmN0aW9uKGV2ZW50LCBsaXN0ZW5lcikge1xuICAgIGlmICh0eXBlb2YgZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBnbG9iYWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgbGlzdGVuZXIsIGZhbHNlKTtcbiAgICB9IGVsc2UgaWYgKGdsb2JhbC5kb2N1bWVudCAmJiBnbG9iYWwuZGV0YWNoRXZlbnQpIHtcbiAgICAgIGdsb2JhbC5kb2N1bWVudC5kZXRhY2hFdmVudCgnb24nICsgZXZlbnQsIGxpc3RlbmVyKTtcbiAgICAgIGdsb2JhbC5kZXRhY2hFdmVudCgnb24nICsgZXZlbnQsIGxpc3RlbmVyKTtcbiAgICB9XG4gIH1cblxuLCB1bmxvYWRBZGQ6IGZ1bmN0aW9uKGxpc3RlbmVyKSB7XG4gICAgaWYgKGlzQ2hyb21lUGFja2FnZWRBcHApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciByZWYgPSByYW5kb20uc3RyaW5nKDgpO1xuICAgIG9uVW5sb2FkW3JlZl0gPSBsaXN0ZW5lcjtcbiAgICBpZiAoYWZ0ZXJVbmxvYWQpIHtcbiAgICAgIHNldFRpbWVvdXQodGhpcy50cmlnZ2VyVW5sb2FkQ2FsbGJhY2tzLCAwKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlZjtcbiAgfVxuXG4sIHVubG9hZERlbDogZnVuY3Rpb24ocmVmKSB7XG4gICAgaWYgKHJlZiBpbiBvblVubG9hZCkge1xuICAgICAgZGVsZXRlIG9uVW5sb2FkW3JlZl07XG4gICAgfVxuICB9XG5cbiwgdHJpZ2dlclVubG9hZENhbGxiYWNrczogZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgcmVmIGluIG9uVW5sb2FkKSB7XG4gICAgICBvblVubG9hZFtyZWZdKCk7XG4gICAgICBkZWxldGUgb25VbmxvYWRbcmVmXTtcbiAgICB9XG4gIH1cbn07XG5cbnZhciB1bmxvYWRUcmlnZ2VyZWQgPSBmdW5jdGlvbigpIHtcbiAgaWYgKGFmdGVyVW5sb2FkKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGFmdGVyVW5sb2FkID0gdHJ1ZTtcbiAgbW9kdWxlLmV4cG9ydHMudHJpZ2dlclVubG9hZENhbGxiYWNrcygpO1xufTtcblxuLy8gJ3VubG9hZCcgYWxvbmUgaXMgbm90IHJlbGlhYmxlIGluIG9wZXJhIHdpdGhpbiBhbiBpZnJhbWUsIGJ1dCB3ZVxuLy8gY2FuJ3QgdXNlIGBiZWZvcmV1bmxvYWRgIGFzIElFIGZpcmVzIGl0IG9uIGphdmFzY3JpcHQ6IGxpbmtzLlxuaWYgKCFpc0Nocm9tZVBhY2thZ2VkQXBwKSB7XG4gIG1vZHVsZS5leHBvcnRzLmF0dGFjaEV2ZW50KCd1bmxvYWQnLCB1bmxvYWRUcmlnZ2VyZWQpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZXZlbnRVdGlscyA9IHJlcXVpcmUoJy4vZXZlbnQnKVxuICAsIEpTT04zID0gcmVxdWlyZSgnanNvbjMnKVxuICAsIGJyb3dzZXIgPSByZXF1aXJlKCcuL2Jyb3dzZXInKVxuICA7XG5cbnZhciBkZWJ1ZyA9IGZ1bmN0aW9uKCkge307XG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ3NvY2tqcy1jbGllbnQ6dXRpbHM6aWZyYW1lJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBXUHJlZml4OiAnX2pwJ1xuLCBjdXJyZW50V2luZG93SWQ6IG51bGxcblxuLCBwb2xsdXRlR2xvYmFsTmFtZXNwYWNlOiBmdW5jdGlvbigpIHtcbiAgICBpZiAoIShtb2R1bGUuZXhwb3J0cy5XUHJlZml4IGluIGdsb2JhbCkpIHtcbiAgICAgIGdsb2JhbFttb2R1bGUuZXhwb3J0cy5XUHJlZml4XSA9IHt9O1xuICAgIH1cbiAgfVxuXG4sIHBvc3RNZXNzYWdlOiBmdW5jdGlvbih0eXBlLCBkYXRhKSB7XG4gICAgaWYgKGdsb2JhbC5wYXJlbnQgIT09IGdsb2JhbCkge1xuICAgICAgZ2xvYmFsLnBhcmVudC5wb3N0TWVzc2FnZShKU09OMy5zdHJpbmdpZnkoe1xuICAgICAgICB3aW5kb3dJZDogbW9kdWxlLmV4cG9ydHMuY3VycmVudFdpbmRvd0lkXG4gICAgICAsIHR5cGU6IHR5cGVcbiAgICAgICwgZGF0YTogZGF0YSB8fCAnJ1xuICAgICAgfSksICcqJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnKCdDYW5ub3QgcG9zdE1lc3NhZ2UsIG5vIHBhcmVudCB3aW5kb3cuJywgdHlwZSwgZGF0YSk7XG4gICAgfVxuICB9XG5cbiwgY3JlYXRlSWZyYW1lOiBmdW5jdGlvbihpZnJhbWVVcmwsIGVycm9yQ2FsbGJhY2spIHtcbiAgICB2YXIgaWZyYW1lID0gZ2xvYmFsLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICAgIHZhciB0cmVmLCB1bmxvYWRSZWY7XG4gICAgdmFyIHVuYXR0YWNoID0gZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygndW5hdHRhY2gnKTtcbiAgICAgIGNsZWFyVGltZW91dCh0cmVmKTtcbiAgICAgIC8vIEV4cGxvcmVyIGhhZCBwcm9ibGVtcyB3aXRoIHRoYXQuXG4gICAgICB0cnkge1xuICAgICAgICBpZnJhbWUub25sb2FkID0gbnVsbDtcbiAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgLy8gaW50ZW50aW9uYWxseSBlbXB0eVxuICAgICAgfVxuICAgICAgaWZyYW1lLm9uZXJyb3IgPSBudWxsO1xuICAgIH07XG4gICAgdmFyIGNsZWFudXAgPSBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdjbGVhbnVwJyk7XG4gICAgICBpZiAoaWZyYW1lKSB7XG4gICAgICAgIHVuYXR0YWNoKCk7XG4gICAgICAgIC8vIFRoaXMgdGltZW91dCBtYWtlcyBjaHJvbWUgZmlyZSBvbmJlZm9yZXVubG9hZCBldmVudFxuICAgICAgICAvLyB3aXRoaW4gaWZyYW1lLiBXaXRob3V0IHRoZSB0aW1lb3V0IGl0IGdvZXMgc3RyYWlnaHQgdG9cbiAgICAgICAgLy8gb251bmxvYWQuXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKGlmcmFtZSkge1xuICAgICAgICAgICAgaWZyYW1lLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoaWZyYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWZyYW1lID0gbnVsbDtcbiAgICAgICAgfSwgMCk7XG4gICAgICAgIGV2ZW50VXRpbHMudW5sb2FkRGVsKHVubG9hZFJlZik7XG4gICAgICB9XG4gICAgfTtcbiAgICB2YXIgb25lcnJvciA9IGZ1bmN0aW9uKGVycikge1xuICAgICAgZGVidWcoJ29uZXJyb3InLCBlcnIpO1xuICAgICAgaWYgKGlmcmFtZSkge1xuICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgIGVycm9yQ2FsbGJhY2soZXJyKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHZhciBwb3N0ID0gZnVuY3Rpb24obXNnLCBvcmlnaW4pIHtcbiAgICAgIGRlYnVnKCdwb3N0JywgbXNnLCBvcmlnaW4pO1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyBXaGVuIHRoZSBpZnJhbWUgaXMgbm90IGxvYWRlZCwgSUUgcmFpc2VzIGFuIGV4Y2VwdGlvblxuICAgICAgICAgIC8vIG9uICdjb250ZW50V2luZG93Jy5cbiAgICAgICAgICBpZiAoaWZyYW1lICYmIGlmcmFtZS5jb250ZW50V2luZG93KSB7XG4gICAgICAgICAgICBpZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZShtc2csIG9yaWdpbik7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoICh4KSB7XG4gICAgICAgICAgLy8gaW50ZW50aW9uYWxseSBlbXB0eVxuICAgICAgICB9XG4gICAgICB9LCAwKTtcbiAgICB9O1xuXG4gICAgaWZyYW1lLnNyYyA9IGlmcmFtZVVybDtcbiAgICBpZnJhbWUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICBpZnJhbWUuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgIGlmcmFtZS5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICBvbmVycm9yKCdvbmVycm9yJyk7XG4gICAgfTtcbiAgICBpZnJhbWUub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1Zygnb25sb2FkJyk7XG4gICAgICAvLyBgb25sb2FkYCBpcyB0cmlnZ2VyZWQgYmVmb3JlIHNjcmlwdHMgb24gdGhlIGlmcmFtZSBhcmVcbiAgICAgIC8vIGV4ZWN1dGVkLiBHaXZlIGl0IGZldyBzZWNvbmRzIHRvIGFjdHVhbGx5IGxvYWQgc3R1ZmYuXG4gICAgICBjbGVhclRpbWVvdXQodHJlZik7XG4gICAgICB0cmVmID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgb25lcnJvcignb25sb2FkIHRpbWVvdXQnKTtcbiAgICAgIH0sIDIwMDApO1xuICAgIH07XG4gICAgZ2xvYmFsLmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaWZyYW1lKTtcbiAgICB0cmVmID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIG9uZXJyb3IoJ3RpbWVvdXQnKTtcbiAgICB9LCAxNTAwMCk7XG4gICAgdW5sb2FkUmVmID0gZXZlbnRVdGlscy51bmxvYWRBZGQoY2xlYW51cCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBvc3Q6IHBvc3RcbiAgICAsIGNsZWFudXA6IGNsZWFudXBcbiAgICAsIGxvYWRlZDogdW5hdHRhY2hcbiAgICB9O1xuICB9XG5cbi8qIGVzbGludCBuby11bmRlZjogXCJvZmZcIiwgbmV3LWNhcDogXCJvZmZcIiAqL1xuLCBjcmVhdGVIdG1sZmlsZTogZnVuY3Rpb24oaWZyYW1lVXJsLCBlcnJvckNhbGxiYWNrKSB7XG4gICAgdmFyIGF4byA9IFsnQWN0aXZlJ10uY29uY2F0KCdPYmplY3QnKS5qb2luKCdYJyk7XG4gICAgdmFyIGRvYyA9IG5ldyBnbG9iYWxbYXhvXSgnaHRtbGZpbGUnKTtcbiAgICB2YXIgdHJlZiwgdW5sb2FkUmVmO1xuICAgIHZhciBpZnJhbWU7XG4gICAgdmFyIHVuYXR0YWNoID0gZnVuY3Rpb24oKSB7XG4gICAgICBjbGVhclRpbWVvdXQodHJlZik7XG4gICAgICBpZnJhbWUub25lcnJvciA9IG51bGw7XG4gICAgfTtcbiAgICB2YXIgY2xlYW51cCA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGRvYykge1xuICAgICAgICB1bmF0dGFjaCgpO1xuICAgICAgICBldmVudFV0aWxzLnVubG9hZERlbCh1bmxvYWRSZWYpO1xuICAgICAgICBpZnJhbWUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChpZnJhbWUpO1xuICAgICAgICBpZnJhbWUgPSBkb2MgPSBudWxsO1xuICAgICAgICBDb2xsZWN0R2FyYmFnZSgpO1xuICAgICAgfVxuICAgIH07XG4gICAgdmFyIG9uZXJyb3IgPSBmdW5jdGlvbihyKSB7XG4gICAgICBkZWJ1Zygnb25lcnJvcicsIHIpO1xuICAgICAgaWYgKGRvYykge1xuICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgIGVycm9yQ2FsbGJhY2socik7XG4gICAgICB9XG4gICAgfTtcbiAgICB2YXIgcG9zdCA9IGZ1bmN0aW9uKG1zZywgb3JpZ2luKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBXaGVuIHRoZSBpZnJhbWUgaXMgbm90IGxvYWRlZCwgSUUgcmFpc2VzIGFuIGV4Y2VwdGlvblxuICAgICAgICAvLyBvbiAnY29udGVudFdpbmRvdycuXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKGlmcmFtZSAmJiBpZnJhbWUuY29udGVudFdpbmRvdykge1xuICAgICAgICAgICAgICBpZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZShtc2csIG9yaWdpbik7XG4gICAgICAgICAgfVxuICAgICAgICB9LCAwKTtcbiAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgLy8gaW50ZW50aW9uYWxseSBlbXB0eVxuICAgICAgfVxuICAgIH07XG5cbiAgICBkb2Mub3BlbigpO1xuICAgIGRvYy53cml0ZSgnPGh0bWw+PHMnICsgJ2NyaXB0PicgK1xuICAgICAgICAgICAgICAnZG9jdW1lbnQuZG9tYWluPVwiJyArIGdsb2JhbC5kb2N1bWVudC5kb21haW4gKyAnXCI7JyArXG4gICAgICAgICAgICAgICc8L3MnICsgJ2NyaXB0PjwvaHRtbD4nKTtcbiAgICBkb2MuY2xvc2UoKTtcbiAgICBkb2MucGFyZW50V2luZG93W21vZHVsZS5leHBvcnRzLldQcmVmaXhdID0gZ2xvYmFsW21vZHVsZS5leHBvcnRzLldQcmVmaXhdO1xuICAgIHZhciBjID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRvYy5ib2R5LmFwcGVuZENoaWxkKGMpO1xuICAgIGlmcmFtZSA9IGRvYy5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcbiAgICBjLmFwcGVuZENoaWxkKGlmcmFtZSk7XG4gICAgaWZyYW1lLnNyYyA9IGlmcmFtZVVybDtcbiAgICBpZnJhbWUub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgb25lcnJvcignb25lcnJvcicpO1xuICAgIH07XG4gICAgdHJlZiA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBvbmVycm9yKCd0aW1lb3V0Jyk7XG4gICAgfSwgMTUwMDApO1xuICAgIHVubG9hZFJlZiA9IGV2ZW50VXRpbHMudW5sb2FkQWRkKGNsZWFudXApO1xuICAgIHJldHVybiB7XG4gICAgICBwb3N0OiBwb3N0XG4gICAgLCBjbGVhbnVwOiBjbGVhbnVwXG4gICAgLCBsb2FkZWQ6IHVuYXR0YWNoXG4gICAgfTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMuaWZyYW1lRW5hYmxlZCA9IGZhbHNlO1xuaWYgKGdsb2JhbC5kb2N1bWVudCkge1xuICAvLyBwb3N0TWVzc2FnZSBtaXNiZWhhdmVzIGluIGtvbnF1ZXJvciA0LjYuNSAtIHRoZSBtZXNzYWdlcyBhcmUgZGVsaXZlcmVkIHdpdGhcbiAgLy8gaHVnZSBkZWxheSwgb3Igbm90IGF0IGFsbC5cbiAgbW9kdWxlLmV4cG9ydHMuaWZyYW1lRW5hYmxlZCA9ICh0eXBlb2YgZ2xvYmFsLnBvc3RNZXNzYWdlID09PSAnZnVuY3Rpb24nIHx8XG4gICAgdHlwZW9mIGdsb2JhbC5wb3N0TWVzc2FnZSA9PT0gJ29iamVjdCcpICYmICghYnJvd3Nlci5pc0tvbnF1ZXJvcigpKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGxvZ09iamVjdCA9IHt9O1xuWydsb2cnLCAnZGVidWcnLCAnd2FybiddLmZvckVhY2goZnVuY3Rpb24gKGxldmVsKSB7XG4gIHZhciBsZXZlbEV4aXN0cztcblxuICB0cnkge1xuICAgIGxldmVsRXhpc3RzID0gZ2xvYmFsLmNvbnNvbGUgJiYgZ2xvYmFsLmNvbnNvbGVbbGV2ZWxdICYmIGdsb2JhbC5jb25zb2xlW2xldmVsXS5hcHBseTtcbiAgfSBjYXRjaChlKSB7XG4gICAgLy8gZG8gbm90aGluZ1xuICB9XG5cbiAgbG9nT2JqZWN0W2xldmVsXSA9IGxldmVsRXhpc3RzID8gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBnbG9iYWwuY29uc29sZVtsZXZlbF0uYXBwbHkoZ2xvYmFsLmNvbnNvbGUsIGFyZ3VtZW50cyk7XG4gIH0gOiAobGV2ZWwgPT09ICdsb2cnID8gZnVuY3Rpb24gKCkge30gOiBsb2dPYmplY3QubG9nKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGxvZ09iamVjdDtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzT2JqZWN0OiBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiBvYmo7XG4gICAgcmV0dXJuIHR5cGUgPT09ICdmdW5jdGlvbicgfHwgdHlwZSA9PT0gJ29iamVjdCcgJiYgISFvYmo7XG4gIH1cblxuLCBleHRlbmQ6IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghdGhpcy5pc09iamVjdChvYmopKSB7XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgICB2YXIgc291cmNlLCBwcm9wO1xuICAgIGZvciAodmFyIGkgPSAxLCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgIGZvciAocHJvcCBpbiBzb3VyY2UpIHtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIHByb3ApKSB7XG4gICAgICAgICAgb2JqW3Byb3BdID0gc291cmNlW3Byb3BdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjcnlwdG8gPSByZXF1aXJlKCdjcnlwdG8nKTtcblxuLy8gVGhpcyBzdHJpbmcgaGFzIGxlbmd0aCAzMiwgYSBwb3dlciBvZiAyLCBzbyB0aGUgbW9kdWx1cyBkb2Vzbid0IGludHJvZHVjZSBhXG4vLyBiaWFzLlxudmFyIF9yYW5kb21TdHJpbmdDaGFycyA9ICdhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NSc7XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc3RyaW5nOiBmdW5jdGlvbihsZW5ndGgpIHtcbiAgICB2YXIgbWF4ID0gX3JhbmRvbVN0cmluZ0NoYXJzLmxlbmd0aDtcbiAgICB2YXIgYnl0ZXMgPSBjcnlwdG8ucmFuZG9tQnl0ZXMobGVuZ3RoKTtcbiAgICB2YXIgcmV0ID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgcmV0LnB1c2goX3JhbmRvbVN0cmluZ0NoYXJzLnN1YnN0cihieXRlc1tpXSAlIG1heCwgMSkpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0LmpvaW4oJycpO1xuICB9XG5cbiwgbnVtYmVyOiBmdW5jdGlvbihtYXgpIHtcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbWF4KTtcbiAgfVxuXG4sIG51bWJlclN0cmluZzogZnVuY3Rpb24obWF4KSB7XG4gICAgdmFyIHQgPSAoJycgKyAobWF4IC0gMSkpLmxlbmd0aDtcbiAgICB2YXIgcCA9IG5ldyBBcnJheSh0ICsgMSkuam9pbignMCcpO1xuICAgIHJldHVybiAocCArIHRoaXMubnVtYmVyKG1heCkpLnNsaWNlKC10KTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGRlYnVnID0gZnVuY3Rpb24oKSB7fTtcbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnc29ja2pzLWNsaWVudDp1dGlsczp0cmFuc3BvcnQnKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhdmFpbGFibGVUcmFuc3BvcnRzKSB7XG4gIHJldHVybiB7XG4gICAgZmlsdGVyVG9FbmFibGVkOiBmdW5jdGlvbih0cmFuc3BvcnRzV2hpdGVsaXN0LCBpbmZvKSB7XG4gICAgICB2YXIgdHJhbnNwb3J0cyA9IHtcbiAgICAgICAgbWFpbjogW11cbiAgICAgICwgZmFjYWRlOiBbXVxuICAgICAgfTtcbiAgICAgIGlmICghdHJhbnNwb3J0c1doaXRlbGlzdCkge1xuICAgICAgICB0cmFuc3BvcnRzV2hpdGVsaXN0ID0gW107XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0cmFuc3BvcnRzV2hpdGVsaXN0ID09PSAnc3RyaW5nJykge1xuICAgICAgICB0cmFuc3BvcnRzV2hpdGVsaXN0ID0gW3RyYW5zcG9ydHNXaGl0ZWxpc3RdO1xuICAgICAgfVxuXG4gICAgICBhdmFpbGFibGVUcmFuc3BvcnRzLmZvckVhY2goZnVuY3Rpb24odHJhbnMpIHtcbiAgICAgICAgaWYgKCF0cmFucykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0cmFucy50cmFuc3BvcnROYW1lID09PSAnd2Vic29ja2V0JyAmJiBpbmZvLndlYnNvY2tldCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICBkZWJ1ZygnZGlzYWJsZWQgZnJvbSBzZXJ2ZXInLCAnd2Vic29ja2V0Jyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRyYW5zcG9ydHNXaGl0ZWxpc3QubGVuZ3RoICYmXG4gICAgICAgICAgICB0cmFuc3BvcnRzV2hpdGVsaXN0LmluZGV4T2YodHJhbnMudHJhbnNwb3J0TmFtZSkgPT09IC0xKSB7XG4gICAgICAgICAgZGVidWcoJ25vdCBpbiB3aGl0ZWxpc3QnLCB0cmFucy50cmFuc3BvcnROYW1lKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHJhbnMuZW5hYmxlZChpbmZvKSkge1xuICAgICAgICAgIGRlYnVnKCdlbmFibGVkJywgdHJhbnMudHJhbnNwb3J0TmFtZSk7XG4gICAgICAgICAgdHJhbnNwb3J0cy5tYWluLnB1c2godHJhbnMpO1xuICAgICAgICAgIGlmICh0cmFucy5mYWNhZGVUcmFuc3BvcnQpIHtcbiAgICAgICAgICAgIHRyYW5zcG9ydHMuZmFjYWRlLnB1c2godHJhbnMuZmFjYWRlVHJhbnNwb3J0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVidWcoJ2Rpc2FibGVkJywgdHJhbnMudHJhbnNwb3J0TmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRyYW5zcG9ydHM7XG4gICAgfVxuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFVSTCA9IHJlcXVpcmUoJ3VybC1wYXJzZScpO1xuXG52YXIgZGVidWcgPSBmdW5jdGlvbigpIHt9O1xuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCdzb2NranMtY2xpZW50OnV0aWxzOnVybCcpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0T3JpZ2luOiBmdW5jdGlvbih1cmwpIHtcbiAgICBpZiAoIXVybCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIHAgPSBuZXcgVVJMKHVybCk7XG4gICAgaWYgKHAucHJvdG9jb2wgPT09ICdmaWxlOicpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBwb3J0ID0gcC5wb3J0O1xuICAgIGlmICghcG9ydCkge1xuICAgICAgcG9ydCA9IChwLnByb3RvY29sID09PSAnaHR0cHM6JykgPyAnNDQzJyA6ICc4MCc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHAucHJvdG9jb2wgKyAnLy8nICsgcC5ob3N0bmFtZSArICc6JyArIHBvcnQ7XG4gIH1cblxuLCBpc09yaWdpbkVxdWFsOiBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIHJlcyA9IHRoaXMuZ2V0T3JpZ2luKGEpID09PSB0aGlzLmdldE9yaWdpbihiKTtcbiAgICBkZWJ1Zygnc2FtZScsIGEsIGIsIHJlcyk7XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4sIGlzU2NoZW1lRXF1YWw6IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gKGEuc3BsaXQoJzonKVswXSA9PT0gYi5zcGxpdCgnOicpWzBdKTtcbiAgfVxuXG4sIGFkZFBhdGg6IGZ1bmN0aW9uICh1cmwsIHBhdGgpIHtcbiAgICB2YXIgcXMgPSB1cmwuc3BsaXQoJz8nKTtcbiAgICByZXR1cm4gcXNbMF0gKyBwYXRoICsgKHFzWzFdID8gJz8nICsgcXNbMV0gOiAnJyk7XG4gIH1cblxuLCBhZGRRdWVyeTogZnVuY3Rpb24gKHVybCwgcSkge1xuICAgIHJldHVybiB1cmwgKyAodXJsLmluZGV4T2YoJz8nKSA9PT0gLTEgPyAoJz8nICsgcSkgOiAoJyYnICsgcSkpO1xuICB9XG5cbiwgaXNMb29wYmFja0FkZHI6IGZ1bmN0aW9uIChhZGRyKSB7XG4gICAgcmV0dXJuIC9eMTI3XFwuKFswLTldezEsM30pXFwuKFswLTldezEsM30pXFwuKFswLTldezEsM30pJC9pLnRlc3QoYWRkcikgfHwgL15cXFs6OjFcXF0kLy50ZXN0KGFkZHIpO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSAnMS41LjAnO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcmVxdWlyZWQgPSByZXF1aXJlKCdyZXF1aXJlcy1wb3J0JylcbiAgLCBxcyA9IHJlcXVpcmUoJ3F1ZXJ5c3RyaW5naWZ5JylcbiAgLCBzbGFzaGVzID0gL15bQS1aYS16XVtBLVphLXowLTkrLS5dKjpbXFxcXC9dKy9cbiAgLCBwcm90b2NvbHJlID0gL14oW2Etel1bYS16MC05ListXSo6KT8oW1xcXFwvXXsxLH0pPyhbXFxTXFxzXSopL2lcbiAgLCB3aGl0ZXNwYWNlID0gJ1tcXFxceDA5XFxcXHgwQVxcXFx4MEJcXFxceDBDXFxcXHgwRFxcXFx4MjBcXFxceEEwXFxcXHUxNjgwXFxcXHUxODBFXFxcXHUyMDAwXFxcXHUyMDAxXFxcXHUyMDAyXFxcXHUyMDAzXFxcXHUyMDA0XFxcXHUyMDA1XFxcXHUyMDA2XFxcXHUyMDA3XFxcXHUyMDA4XFxcXHUyMDA5XFxcXHUyMDBBXFxcXHUyMDJGXFxcXHUyMDVGXFxcXHUzMDAwXFxcXHUyMDI4XFxcXHUyMDI5XFxcXHVGRUZGXSdcbiAgLCBsZWZ0ID0gbmV3IFJlZ0V4cCgnXicrIHdoaXRlc3BhY2UgKycrJyk7XG5cbi8qKlxuICogVHJpbSBhIGdpdmVuIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIFN0cmluZyB0byB0cmltLlxuICogQHB1YmxpY1xuICovXG5mdW5jdGlvbiB0cmltTGVmdChzdHIpIHtcbiAgcmV0dXJuIChzdHIgPyBzdHIgOiAnJykudG9TdHJpbmcoKS5yZXBsYWNlKGxlZnQsICcnKTtcbn1cblxuLyoqXG4gKiBUaGVzZSBhcmUgdGhlIHBhcnNlIHJ1bGVzIGZvciB0aGUgVVJMIHBhcnNlciwgaXQgaW5mb3JtcyB0aGUgcGFyc2VyXG4gKiBhYm91dDpcbiAqXG4gKiAwLiBUaGUgY2hhciBpdCBOZWVkcyB0byBwYXJzZSwgaWYgaXQncyBhIHN0cmluZyBpdCBzaG91bGQgYmUgZG9uZSB1c2luZ1xuICogICAgaW5kZXhPZiwgUmVnRXhwIHVzaW5nIGV4ZWMgYW5kIE5hTiBtZWFucyBzZXQgYXMgY3VycmVudCB2YWx1ZS5cbiAqIDEuIFRoZSBwcm9wZXJ0eSB3ZSBzaG91bGQgc2V0IHdoZW4gcGFyc2luZyB0aGlzIHZhbHVlLlxuICogMi4gSW5kaWNhdGlvbiBpZiBpdCdzIGJhY2t3YXJkcyBvciBmb3J3YXJkIHBhcnNpbmcsIHdoZW4gc2V0IGFzIG51bWJlciBpdCdzXG4gKiAgICB0aGUgdmFsdWUgb2YgZXh0cmEgY2hhcnMgdGhhdCBzaG91bGQgYmUgc3BsaXQgb2ZmLlxuICogMy4gSW5oZXJpdCBmcm9tIGxvY2F0aW9uIGlmIG5vbiBleGlzdGluZyBpbiB0aGUgcGFyc2VyLlxuICogNC4gYHRvTG93ZXJDYXNlYCB0aGUgcmVzdWx0aW5nIHZhbHVlLlxuICovXG52YXIgcnVsZXMgPSBbXG4gIFsnIycsICdoYXNoJ10sICAgICAgICAgICAgICAgICAgICAgICAgLy8gRXh0cmFjdCBmcm9tIHRoZSBiYWNrLlxuICBbJz8nLCAncXVlcnknXSwgICAgICAgICAgICAgICAgICAgICAgIC8vIEV4dHJhY3QgZnJvbSB0aGUgYmFjay5cbiAgZnVuY3Rpb24gc2FuaXRpemUoYWRkcmVzcykgeyAgICAgICAgICAvLyBTYW5pdGl6ZSB3aGF0IGlzIGxlZnQgb2YgdGhlIGFkZHJlc3NcbiAgICByZXR1cm4gYWRkcmVzcy5yZXBsYWNlKCdcXFxcJywgJy8nKTtcbiAgfSxcbiAgWycvJywgJ3BhdGhuYW1lJ10sICAgICAgICAgICAgICAgICAgICAvLyBFeHRyYWN0IGZyb20gdGhlIGJhY2suXG4gIFsnQCcsICdhdXRoJywgMV0sICAgICAgICAgICAgICAgICAgICAgLy8gRXh0cmFjdCBmcm9tIHRoZSBmcm9udC5cbiAgW05hTiwgJ2hvc3QnLCB1bmRlZmluZWQsIDEsIDFdLCAgICAgICAvLyBTZXQgbGVmdCBvdmVyIHZhbHVlLlxuICBbLzooXFxkKykkLywgJ3BvcnQnLCB1bmRlZmluZWQsIDFdLCAgICAvLyBSZWdFeHAgdGhlIGJhY2suXG4gIFtOYU4sICdob3N0bmFtZScsIHVuZGVmaW5lZCwgMSwgMV0gICAgLy8gU2V0IGxlZnQgb3Zlci5cbl07XG5cbi8qKlxuICogVGhlc2UgcHJvcGVydGllcyBzaG91bGQgbm90IGJlIGNvcGllZCBvciBpbmhlcml0ZWQgZnJvbS4gVGhpcyBpcyBvbmx5IG5lZWRlZFxuICogZm9yIGFsbCBub24gYmxvYiBVUkwncyBhcyBhIGJsb2IgVVJMIGRvZXMgbm90IGluY2x1ZGUgYSBoYXNoLCBvbmx5IHRoZVxuICogb3JpZ2luLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKiBAcHJpdmF0ZVxuICovXG52YXIgaWdub3JlID0geyBoYXNoOiAxLCBxdWVyeTogMSB9O1xuXG4vKipcbiAqIFRoZSBsb2NhdGlvbiBvYmplY3QgZGlmZmVycyB3aGVuIHlvdXIgY29kZSBpcyBsb2FkZWQgdGhyb3VnaCBhIG5vcm1hbCBwYWdlLFxuICogV29ya2VyIG9yIHRocm91Z2ggYSB3b3JrZXIgdXNpbmcgYSBibG9iLiBBbmQgd2l0aCB0aGUgYmxvYmJsZSBiZWdpbnMgdGhlXG4gKiB0cm91YmxlIGFzIHRoZSBsb2NhdGlvbiBvYmplY3Qgd2lsbCBjb250YWluIHRoZSBVUkwgb2YgdGhlIGJsb2IsIG5vdCB0aGVcbiAqIGxvY2F0aW9uIG9mIHRoZSBwYWdlIHdoZXJlIG91ciBjb2RlIGlzIGxvYWRlZCBpbi4gVGhlIGFjdHVhbCBvcmlnaW4gaXNcbiAqIGVuY29kZWQgaW4gdGhlIGBwYXRobmFtZWAgc28gd2UgY2FuIHRoYW5rZnVsbHkgZ2VuZXJhdGUgYSBnb29kIFwiZGVmYXVsdFwiXG4gKiBsb2NhdGlvbiBmcm9tIGl0IHNvIHdlIGNhbiBnZW5lcmF0ZSBwcm9wZXIgcmVsYXRpdmUgVVJMJ3MgYWdhaW4uXG4gKlxuICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSBsb2MgT3B0aW9uYWwgZGVmYXVsdCBsb2NhdGlvbiBvYmplY3QuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBsb2xjYXRpb24gb2JqZWN0LlxuICogQHB1YmxpY1xuICovXG5mdW5jdGlvbiBsb2xjYXRpb24obG9jKSB7XG4gIHZhciBnbG9iYWxWYXI7XG5cbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSBnbG9iYWxWYXIgPSB3aW5kb3c7XG4gIGVsc2UgaWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnKSBnbG9iYWxWYXIgPSBnbG9iYWw7XG4gIGVsc2UgaWYgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJykgZ2xvYmFsVmFyID0gc2VsZjtcbiAgZWxzZSBnbG9iYWxWYXIgPSB7fTtcblxuICB2YXIgbG9jYXRpb24gPSBnbG9iYWxWYXIubG9jYXRpb24gfHwge307XG4gIGxvYyA9IGxvYyB8fCBsb2NhdGlvbjtcblxuICB2YXIgZmluYWxkZXN0aW5hdGlvbiA9IHt9XG4gICAgLCB0eXBlID0gdHlwZW9mIGxvY1xuICAgICwga2V5O1xuXG4gIGlmICgnYmxvYjonID09PSBsb2MucHJvdG9jb2wpIHtcbiAgICBmaW5hbGRlc3RpbmF0aW9uID0gbmV3IFVybCh1bmVzY2FwZShsb2MucGF0aG5hbWUpLCB7fSk7XG4gIH0gZWxzZSBpZiAoJ3N0cmluZycgPT09IHR5cGUpIHtcbiAgICBmaW5hbGRlc3RpbmF0aW9uID0gbmV3IFVybChsb2MsIHt9KTtcbiAgICBmb3IgKGtleSBpbiBpZ25vcmUpIGRlbGV0ZSBmaW5hbGRlc3RpbmF0aW9uW2tleV07XG4gIH0gZWxzZSBpZiAoJ29iamVjdCcgPT09IHR5cGUpIHtcbiAgICBmb3IgKGtleSBpbiBsb2MpIHtcbiAgICAgIGlmIChrZXkgaW4gaWdub3JlKSBjb250aW51ZTtcbiAgICAgIGZpbmFsZGVzdGluYXRpb25ba2V5XSA9IGxvY1trZXldO1xuICAgIH1cblxuICAgIGlmIChmaW5hbGRlc3RpbmF0aW9uLnNsYXNoZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZmluYWxkZXN0aW5hdGlvbi5zbGFzaGVzID0gc2xhc2hlcy50ZXN0KGxvYy5ocmVmKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmluYWxkZXN0aW5hdGlvbjtcbn1cblxuLyoqXG4gKiBAdHlwZWRlZiBQcm90b2NvbEV4dHJhY3RcbiAqIEB0eXBlIE9iamVjdFxuICogQHByb3BlcnR5IHtTdHJpbmd9IHByb3RvY29sIFByb3RvY29sIG1hdGNoZWQgaW4gdGhlIFVSTCwgaW4gbG93ZXJjYXNlLlxuICogQHByb3BlcnR5IHtCb29sZWFufSBzbGFzaGVzIGB0cnVlYCBpZiBwcm90b2NvbCBpcyBmb2xsb3dlZCBieSBcIi8vXCIsIGVsc2UgYGZhbHNlYC5cbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSByZXN0IFJlc3Qgb2YgdGhlIFVSTCB0aGF0IGlzIG5vdCBwYXJ0IG9mIHRoZSBwcm90b2NvbC5cbiAqL1xuXG4vKipcbiAqIEV4dHJhY3QgcHJvdG9jb2wgaW5mb3JtYXRpb24gZnJvbSBhIFVSTCB3aXRoL3dpdGhvdXQgZG91YmxlIHNsYXNoIChcIi8vXCIpLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBhZGRyZXNzIFVSTCB3ZSB3YW50IHRvIGV4dHJhY3QgZnJvbS5cbiAqIEByZXR1cm4ge1Byb3RvY29sRXh0cmFjdH0gRXh0cmFjdGVkIGluZm9ybWF0aW9uLlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gZXh0cmFjdFByb3RvY29sKGFkZHJlc3MpIHtcbiAgYWRkcmVzcyA9IHRyaW1MZWZ0KGFkZHJlc3MpO1xuXG4gIHZhciBtYXRjaCA9IHByb3RvY29scmUuZXhlYyhhZGRyZXNzKVxuICAgICwgcHJvdG9jb2wgPSBtYXRjaFsxXSA/IG1hdGNoWzFdLnRvTG93ZXJDYXNlKCkgOiAnJ1xuICAgICwgc2xhc2hlcyA9ICEhKG1hdGNoWzJdICYmIG1hdGNoWzJdLmxlbmd0aCA+PSAyKVxuICAgICwgcmVzdCA9ICBtYXRjaFsyXSAmJiBtYXRjaFsyXS5sZW5ndGggPT09IDEgPyAnLycgKyBtYXRjaFszXSA6IG1hdGNoWzNdO1xuXG4gIHJldHVybiB7XG4gICAgcHJvdG9jb2w6IHByb3RvY29sLFxuICAgIHNsYXNoZXM6IHNsYXNoZXMsXG4gICAgcmVzdDogcmVzdFxuICB9O1xufVxuXG4vKipcbiAqIFJlc29sdmUgYSByZWxhdGl2ZSBVUkwgcGF0aG5hbWUgYWdhaW5zdCBhIGJhc2UgVVJMIHBhdGhuYW1lLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSByZWxhdGl2ZSBQYXRobmFtZSBvZiB0aGUgcmVsYXRpdmUgVVJMLlxuICogQHBhcmFtIHtTdHJpbmd9IGJhc2UgUGF0aG5hbWUgb2YgdGhlIGJhc2UgVVJMLlxuICogQHJldHVybiB7U3RyaW5nfSBSZXNvbHZlZCBwYXRobmFtZS5cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIHJlc29sdmUocmVsYXRpdmUsIGJhc2UpIHtcbiAgaWYgKHJlbGF0aXZlID09PSAnJykgcmV0dXJuIGJhc2U7XG5cbiAgdmFyIHBhdGggPSAoYmFzZSB8fCAnLycpLnNwbGl0KCcvJykuc2xpY2UoMCwgLTEpLmNvbmNhdChyZWxhdGl2ZS5zcGxpdCgnLycpKVxuICAgICwgaSA9IHBhdGgubGVuZ3RoXG4gICAgLCBsYXN0ID0gcGF0aFtpIC0gMV1cbiAgICAsIHVuc2hpZnQgPSBmYWxzZVxuICAgICwgdXAgPSAwO1xuXG4gIHdoaWxlIChpLS0pIHtcbiAgICBpZiAocGF0aFtpXSA9PT0gJy4nKSB7XG4gICAgICBwYXRoLnNwbGljZShpLCAxKTtcbiAgICB9IGVsc2UgaWYgKHBhdGhbaV0gPT09ICcuLicpIHtcbiAgICAgIHBhdGguc3BsaWNlKGksIDEpO1xuICAgICAgdXArKztcbiAgICB9IGVsc2UgaWYgKHVwKSB7XG4gICAgICBpZiAoaSA9PT0gMCkgdW5zaGlmdCA9IHRydWU7XG4gICAgICBwYXRoLnNwbGljZShpLCAxKTtcbiAgICAgIHVwLS07XG4gICAgfVxuICB9XG5cbiAgaWYgKHVuc2hpZnQpIHBhdGgudW5zaGlmdCgnJyk7XG4gIGlmIChsYXN0ID09PSAnLicgfHwgbGFzdCA9PT0gJy4uJykgcGF0aC5wdXNoKCcnKTtcblxuICByZXR1cm4gcGF0aC5qb2luKCcvJyk7XG59XG5cbi8qKlxuICogVGhlIGFjdHVhbCBVUkwgaW5zdGFuY2UuIEluc3RlYWQgb2YgcmV0dXJuaW5nIGFuIG9iamVjdCB3ZSd2ZSBvcHRlZC1pbiB0b1xuICogY3JlYXRlIGFuIGFjdHVhbCBjb25zdHJ1Y3RvciBhcyBpdCdzIG11Y2ggbW9yZSBtZW1vcnkgZWZmaWNpZW50IGFuZFxuICogZmFzdGVyIGFuZCBpdCBwbGVhc2VzIG15IE9DRC5cbiAqXG4gKiBJdCBpcyB3b3J0aCBub3RpbmcgdGhhdCB3ZSBzaG91bGQgbm90IHVzZSBgVVJMYCBhcyBjbGFzcyBuYW1lIHRvIHByZXZlbnRcbiAqIGNsYXNoZXMgd2l0aCB0aGUgZ2xvYmFsIFVSTCBpbnN0YW5jZSB0aGF0IGdvdCBpbnRyb2R1Y2VkIGluIGJyb3dzZXJzLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtTdHJpbmd9IGFkZHJlc3MgVVJMIHdlIHdhbnQgdG8gcGFyc2UuXG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IFtsb2NhdGlvbl0gTG9jYXRpb24gZGVmYXVsdHMgZm9yIHJlbGF0aXZlIHBhdGhzLlxuICogQHBhcmFtIHtCb29sZWFufEZ1bmN0aW9ufSBbcGFyc2VyXSBQYXJzZXIgZm9yIHRoZSBxdWVyeSBzdHJpbmcuXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBVcmwoYWRkcmVzcywgbG9jYXRpb24sIHBhcnNlcikge1xuICBhZGRyZXNzID0gdHJpbUxlZnQoYWRkcmVzcyk7XG5cbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFVybCkpIHtcbiAgICByZXR1cm4gbmV3IFVybChhZGRyZXNzLCBsb2NhdGlvbiwgcGFyc2VyKTtcbiAgfVxuXG4gIHZhciByZWxhdGl2ZSwgZXh0cmFjdGVkLCBwYXJzZSwgaW5zdHJ1Y3Rpb24sIGluZGV4LCBrZXlcbiAgICAsIGluc3RydWN0aW9ucyA9IHJ1bGVzLnNsaWNlKClcbiAgICAsIHR5cGUgPSB0eXBlb2YgbG9jYXRpb25cbiAgICAsIHVybCA9IHRoaXNcbiAgICAsIGkgPSAwO1xuXG4gIC8vXG4gIC8vIFRoZSBmb2xsb3dpbmcgaWYgc3RhdGVtZW50cyBhbGxvd3MgdGhpcyBtb2R1bGUgdHdvIGhhdmUgY29tcGF0aWJpbGl0eSB3aXRoXG4gIC8vIDIgZGlmZmVyZW50IEFQSTpcbiAgLy9cbiAgLy8gMS4gTm9kZS5qcydzIGB1cmwucGFyc2VgIGFwaSB3aGljaCBhY2NlcHRzIGEgVVJMLCBib29sZWFuIGFzIGFyZ3VtZW50c1xuICAvLyAgICB3aGVyZSB0aGUgYm9vbGVhbiBpbmRpY2F0ZXMgdGhhdCB0aGUgcXVlcnkgc3RyaW5nIHNob3VsZCBhbHNvIGJlIHBhcnNlZC5cbiAgLy9cbiAgLy8gMi4gVGhlIGBVUkxgIGludGVyZmFjZSBvZiB0aGUgYnJvd3NlciB3aGljaCBhY2NlcHRzIGEgVVJMLCBvYmplY3QgYXNcbiAgLy8gICAgYXJndW1lbnRzLiBUaGUgc3VwcGxpZWQgb2JqZWN0IHdpbGwgYmUgdXNlZCBhcyBkZWZhdWx0IHZhbHVlcyAvIGZhbGwtYmFja1xuICAvLyAgICBmb3IgcmVsYXRpdmUgcGF0aHMuXG4gIC8vXG4gIGlmICgnb2JqZWN0JyAhPT0gdHlwZSAmJiAnc3RyaW5nJyAhPT0gdHlwZSkge1xuICAgIHBhcnNlciA9IGxvY2F0aW9uO1xuICAgIGxvY2F0aW9uID0gbnVsbDtcbiAgfVxuXG4gIGlmIChwYXJzZXIgJiYgJ2Z1bmN0aW9uJyAhPT0gdHlwZW9mIHBhcnNlcikgcGFyc2VyID0gcXMucGFyc2U7XG5cbiAgbG9jYXRpb24gPSBsb2xjYXRpb24obG9jYXRpb24pO1xuXG4gIC8vXG4gIC8vIEV4dHJhY3QgcHJvdG9jb2wgaW5mb3JtYXRpb24gYmVmb3JlIHJ1bm5pbmcgdGhlIGluc3RydWN0aW9ucy5cbiAgLy9cbiAgZXh0cmFjdGVkID0gZXh0cmFjdFByb3RvY29sKGFkZHJlc3MgfHwgJycpO1xuICByZWxhdGl2ZSA9ICFleHRyYWN0ZWQucHJvdG9jb2wgJiYgIWV4dHJhY3RlZC5zbGFzaGVzO1xuICB1cmwuc2xhc2hlcyA9IGV4dHJhY3RlZC5zbGFzaGVzIHx8IHJlbGF0aXZlICYmIGxvY2F0aW9uLnNsYXNoZXM7XG4gIHVybC5wcm90b2NvbCA9IGV4dHJhY3RlZC5wcm90b2NvbCB8fCBsb2NhdGlvbi5wcm90b2NvbCB8fCAnJztcbiAgYWRkcmVzcyA9IGV4dHJhY3RlZC5yZXN0O1xuXG4gIC8vXG4gIC8vIFdoZW4gdGhlIGF1dGhvcml0eSBjb21wb25lbnQgaXMgYWJzZW50IHRoZSBVUkwgc3RhcnRzIHdpdGggYSBwYXRoXG4gIC8vIGNvbXBvbmVudC5cbiAgLy9cbiAgaWYgKCFleHRyYWN0ZWQuc2xhc2hlcykgaW5zdHJ1Y3Rpb25zWzNdID0gWy8oLiopLywgJ3BhdGhuYW1lJ107XG5cbiAgZm9yICg7IGkgPCBpbnN0cnVjdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICBpbnN0cnVjdGlvbiA9IGluc3RydWN0aW9uc1tpXTtcblxuICAgIGlmICh0eXBlb2YgaW5zdHJ1Y3Rpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFkZHJlc3MgPSBpbnN0cnVjdGlvbihhZGRyZXNzKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHBhcnNlID0gaW5zdHJ1Y3Rpb25bMF07XG4gICAga2V5ID0gaW5zdHJ1Y3Rpb25bMV07XG5cbiAgICBpZiAocGFyc2UgIT09IHBhcnNlKSB7XG4gICAgICB1cmxba2V5XSA9IGFkZHJlc3M7XG4gICAgfSBlbHNlIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIHBhcnNlKSB7XG4gICAgICBpZiAofihpbmRleCA9IGFkZHJlc3MuaW5kZXhPZihwYXJzZSkpKSB7XG4gICAgICAgIGlmICgnbnVtYmVyJyA9PT0gdHlwZW9mIGluc3RydWN0aW9uWzJdKSB7XG4gICAgICAgICAgdXJsW2tleV0gPSBhZGRyZXNzLnNsaWNlKDAsIGluZGV4KTtcbiAgICAgICAgICBhZGRyZXNzID0gYWRkcmVzcy5zbGljZShpbmRleCArIGluc3RydWN0aW9uWzJdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB1cmxba2V5XSA9IGFkZHJlc3Muc2xpY2UoaW5kZXgpO1xuICAgICAgICAgIGFkZHJlc3MgPSBhZGRyZXNzLnNsaWNlKDAsIGluZGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoKGluZGV4ID0gcGFyc2UuZXhlYyhhZGRyZXNzKSkpIHtcbiAgICAgIHVybFtrZXldID0gaW5kZXhbMV07XG4gICAgICBhZGRyZXNzID0gYWRkcmVzcy5zbGljZSgwLCBpbmRleC5pbmRleCk7XG4gICAgfVxuXG4gICAgdXJsW2tleV0gPSB1cmxba2V5XSB8fCAoXG4gICAgICByZWxhdGl2ZSAmJiBpbnN0cnVjdGlvblszXSA/IGxvY2F0aW9uW2tleV0gfHwgJycgOiAnJ1xuICAgICk7XG5cbiAgICAvL1xuICAgIC8vIEhvc3RuYW1lLCBob3N0IGFuZCBwcm90b2NvbCBzaG91bGQgYmUgbG93ZXJjYXNlZCBzbyB0aGV5IGNhbiBiZSB1c2VkIHRvXG4gICAgLy8gY3JlYXRlIGEgcHJvcGVyIGBvcmlnaW5gLlxuICAgIC8vXG4gICAgaWYgKGluc3RydWN0aW9uWzRdKSB1cmxba2V5XSA9IHVybFtrZXldLnRvTG93ZXJDYXNlKCk7XG4gIH1cblxuICAvL1xuICAvLyBBbHNvIHBhcnNlIHRoZSBzdXBwbGllZCBxdWVyeSBzdHJpbmcgaW4gdG8gYW4gb2JqZWN0LiBJZiB3ZSdyZSBzdXBwbGllZFxuICAvLyB3aXRoIGEgY3VzdG9tIHBhcnNlciBhcyBmdW5jdGlvbiB1c2UgdGhhdCBpbnN0ZWFkIG9mIHRoZSBkZWZhdWx0IGJ1aWxkLWluXG4gIC8vIHBhcnNlci5cbiAgLy9cbiAgaWYgKHBhcnNlcikgdXJsLnF1ZXJ5ID0gcGFyc2VyKHVybC5xdWVyeSk7XG5cbiAgLy9cbiAgLy8gSWYgdGhlIFVSTCBpcyByZWxhdGl2ZSwgcmVzb2x2ZSB0aGUgcGF0aG5hbWUgYWdhaW5zdCB0aGUgYmFzZSBVUkwuXG4gIC8vXG4gIGlmIChcbiAgICAgIHJlbGF0aXZlXG4gICAgJiYgbG9jYXRpb24uc2xhc2hlc1xuICAgICYmIHVybC5wYXRobmFtZS5jaGFyQXQoMCkgIT09ICcvJ1xuICAgICYmICh1cmwucGF0aG5hbWUgIT09ICcnIHx8IGxvY2F0aW9uLnBhdGhuYW1lICE9PSAnJylcbiAgKSB7XG4gICAgdXJsLnBhdGhuYW1lID0gcmVzb2x2ZSh1cmwucGF0aG5hbWUsIGxvY2F0aW9uLnBhdGhuYW1lKTtcbiAgfVxuXG4gIC8vXG4gIC8vIERlZmF1bHQgdG8gYSAvIGZvciBwYXRobmFtZSBpZiBub25lIGV4aXN0cy4gVGhpcyBub3JtYWxpemVzIHRoZSBVUkxcbiAgLy8gdG8gYWx3YXlzIGhhdmUgYSAvXG4gIC8vXG4gIGlmICh1cmwucGF0aG5hbWUuY2hhckF0KDApICE9PSAnLycgJiYgdXJsLmhvc3RuYW1lKSB7XG4gICAgdXJsLnBhdGhuYW1lID0gJy8nICsgdXJsLnBhdGhuYW1lO1xuICB9XG5cbiAgLy9cbiAgLy8gV2Ugc2hvdWxkIG5vdCBhZGQgcG9ydCBudW1iZXJzIGlmIHRoZXkgYXJlIGFscmVhZHkgdGhlIGRlZmF1bHQgcG9ydCBudW1iZXJcbiAgLy8gZm9yIGEgZ2l2ZW4gcHJvdG9jb2wuIEFzIHRoZSBob3N0IGFsc28gY29udGFpbnMgdGhlIHBvcnQgbnVtYmVyIHdlJ3JlIGdvaW5nXG4gIC8vIG92ZXJyaWRlIGl0IHdpdGggdGhlIGhvc3RuYW1lIHdoaWNoIGNvbnRhaW5zIG5vIHBvcnQgbnVtYmVyLlxuICAvL1xuICBpZiAoIXJlcXVpcmVkKHVybC5wb3J0LCB1cmwucHJvdG9jb2wpKSB7XG4gICAgdXJsLmhvc3QgPSB1cmwuaG9zdG5hbWU7XG4gICAgdXJsLnBvcnQgPSAnJztcbiAgfVxuXG4gIC8vXG4gIC8vIFBhcnNlIGRvd24gdGhlIGBhdXRoYCBmb3IgdGhlIHVzZXJuYW1lIGFuZCBwYXNzd29yZC5cbiAgLy9cbiAgdXJsLnVzZXJuYW1lID0gdXJsLnBhc3N3b3JkID0gJyc7XG4gIGlmICh1cmwuYXV0aCkge1xuICAgIGluc3RydWN0aW9uID0gdXJsLmF1dGguc3BsaXQoJzonKTtcbiAgICB1cmwudXNlcm5hbWUgPSBpbnN0cnVjdGlvblswXSB8fCAnJztcbiAgICB1cmwucGFzc3dvcmQgPSBpbnN0cnVjdGlvblsxXSB8fCAnJztcbiAgfVxuXG4gIHVybC5vcmlnaW4gPSB1cmwucHJvdG9jb2wgJiYgdXJsLmhvc3QgJiYgdXJsLnByb3RvY29sICE9PSAnZmlsZTonXG4gICAgPyB1cmwucHJvdG9jb2wgKycvLycrIHVybC5ob3N0XG4gICAgOiAnbnVsbCc7XG5cbiAgLy9cbiAgLy8gVGhlIGhyZWYgaXMganVzdCB0aGUgY29tcGlsZWQgcmVzdWx0LlxuICAvL1xuICB1cmwuaHJlZiA9IHVybC50b1N0cmluZygpO1xufVxuXG4vKipcbiAqIFRoaXMgaXMgY29udmVuaWVuY2UgbWV0aG9kIGZvciBjaGFuZ2luZyBwcm9wZXJ0aWVzIGluIHRoZSBVUkwgaW5zdGFuY2UgdG9cbiAqIGluc3VyZSB0aGF0IHRoZXkgYWxsIHByb3BhZ2F0ZSBjb3JyZWN0bHkuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHBhcnQgICAgICAgICAgUHJvcGVydHkgd2UgbmVlZCB0byBhZGp1c3QuXG4gKiBAcGFyYW0ge01peGVkfSB2YWx1ZSAgICAgICAgICBUaGUgbmV3bHkgYXNzaWduZWQgdmFsdWUuXG4gKiBAcGFyYW0ge0Jvb2xlYW58RnVuY3Rpb259IGZuICBXaGVuIHNldHRpbmcgdGhlIHF1ZXJ5LCBpdCB3aWxsIGJlIHRoZSBmdW5jdGlvblxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlZCB0byBwYXJzZSB0aGUgcXVlcnkuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBXaGVuIHNldHRpbmcgdGhlIHByb3RvY29sLCBkb3VibGUgc2xhc2ggd2lsbCBiZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlZCBmcm9tIHRoZSBmaW5hbCB1cmwgaWYgaXQgaXMgdHJ1ZS5cbiAqIEByZXR1cm5zIHtVUkx9IFVSTCBpbnN0YW5jZSBmb3IgY2hhaW5pbmcuXG4gKiBAcHVibGljXG4gKi9cbmZ1bmN0aW9uIHNldChwYXJ0LCB2YWx1ZSwgZm4pIHtcbiAgdmFyIHVybCA9IHRoaXM7XG5cbiAgc3dpdGNoIChwYXJ0KSB7XG4gICAgY2FzZSAncXVlcnknOlxuICAgICAgaWYgKCdzdHJpbmcnID09PSB0eXBlb2YgdmFsdWUgJiYgdmFsdWUubGVuZ3RoKSB7XG4gICAgICAgIHZhbHVlID0gKGZuIHx8IHFzLnBhcnNlKSh2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIHVybFtwYXJ0XSA9IHZhbHVlO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdwb3J0JzpcbiAgICAgIHVybFtwYXJ0XSA9IHZhbHVlO1xuXG4gICAgICBpZiAoIXJlcXVpcmVkKHZhbHVlLCB1cmwucHJvdG9jb2wpKSB7XG4gICAgICAgIHVybC5ob3N0ID0gdXJsLmhvc3RuYW1lO1xuICAgICAgICB1cmxbcGFydF0gPSAnJztcbiAgICAgIH0gZWxzZSBpZiAodmFsdWUpIHtcbiAgICAgICAgdXJsLmhvc3QgPSB1cmwuaG9zdG5hbWUgKyc6JysgdmFsdWU7XG4gICAgICB9XG5cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnaG9zdG5hbWUnOlxuICAgICAgdXJsW3BhcnRdID0gdmFsdWU7XG5cbiAgICAgIGlmICh1cmwucG9ydCkgdmFsdWUgKz0gJzonKyB1cmwucG9ydDtcbiAgICAgIHVybC5ob3N0ID0gdmFsdWU7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2hvc3QnOlxuICAgICAgdXJsW3BhcnRdID0gdmFsdWU7XG5cbiAgICAgIGlmICgvOlxcZCskLy50ZXN0KHZhbHVlKSkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlLnNwbGl0KCc6Jyk7XG4gICAgICAgIHVybC5wb3J0ID0gdmFsdWUucG9wKCk7XG4gICAgICAgIHVybC5ob3N0bmFtZSA9IHZhbHVlLmpvaW4oJzonKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHVybC5ob3N0bmFtZSA9IHZhbHVlO1xuICAgICAgICB1cmwucG9ydCA9ICcnO1xuICAgICAgfVxuXG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ3Byb3RvY29sJzpcbiAgICAgIHVybC5wcm90b2NvbCA9IHZhbHVlLnRvTG93ZXJDYXNlKCk7XG4gICAgICB1cmwuc2xhc2hlcyA9ICFmbjtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAncGF0aG5hbWUnOlxuICAgIGNhc2UgJ2hhc2gnOlxuICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgIHZhciBjaGFyID0gcGFydCA9PT0gJ3BhdGhuYW1lJyA/ICcvJyA6ICcjJztcbiAgICAgICAgdXJsW3BhcnRdID0gdmFsdWUuY2hhckF0KDApICE9PSBjaGFyID8gY2hhciArIHZhbHVlIDogdmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB1cmxbcGFydF0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHVybFtwYXJ0XSA9IHZhbHVlO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBydWxlcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpbnMgPSBydWxlc1tpXTtcblxuICAgIGlmIChpbnNbNF0pIHVybFtpbnNbMV1dID0gdXJsW2luc1sxXV0udG9Mb3dlckNhc2UoKTtcbiAgfVxuXG4gIHVybC5vcmlnaW4gPSB1cmwucHJvdG9jb2wgJiYgdXJsLmhvc3QgJiYgdXJsLnByb3RvY29sICE9PSAnZmlsZTonXG4gICAgPyB1cmwucHJvdG9jb2wgKycvLycrIHVybC5ob3N0XG4gICAgOiAnbnVsbCc7XG5cbiAgdXJsLmhyZWYgPSB1cmwudG9TdHJpbmcoKTtcblxuICByZXR1cm4gdXJsO1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybSB0aGUgcHJvcGVydGllcyBiYWNrIGluIHRvIGEgdmFsaWQgYW5kIGZ1bGwgVVJMIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBzdHJpbmdpZnkgT3B0aW9uYWwgcXVlcnkgc3RyaW5naWZ5IGZ1bmN0aW9uLlxuICogQHJldHVybnMge1N0cmluZ30gQ29tcGlsZWQgdmVyc2lvbiBvZiB0aGUgVVJMLlxuICogQHB1YmxpY1xuICovXG5mdW5jdGlvbiB0b1N0cmluZyhzdHJpbmdpZnkpIHtcbiAgaWYgKCFzdHJpbmdpZnkgfHwgJ2Z1bmN0aW9uJyAhPT0gdHlwZW9mIHN0cmluZ2lmeSkgc3RyaW5naWZ5ID0gcXMuc3RyaW5naWZ5O1xuXG4gIHZhciBxdWVyeVxuICAgICwgdXJsID0gdGhpc1xuICAgICwgcHJvdG9jb2wgPSB1cmwucHJvdG9jb2w7XG5cbiAgaWYgKHByb3RvY29sICYmIHByb3RvY29sLmNoYXJBdChwcm90b2NvbC5sZW5ndGggLSAxKSAhPT0gJzonKSBwcm90b2NvbCArPSAnOic7XG5cbiAgdmFyIHJlc3VsdCA9IHByb3RvY29sICsgKHVybC5zbGFzaGVzID8gJy8vJyA6ICcnKTtcblxuICBpZiAodXJsLnVzZXJuYW1lKSB7XG4gICAgcmVzdWx0ICs9IHVybC51c2VybmFtZTtcbiAgICBpZiAodXJsLnBhc3N3b3JkKSByZXN1bHQgKz0gJzonKyB1cmwucGFzc3dvcmQ7XG4gICAgcmVzdWx0ICs9ICdAJztcbiAgfVxuXG4gIHJlc3VsdCArPSB1cmwuaG9zdCArIHVybC5wYXRobmFtZTtcblxuICBxdWVyeSA9ICdvYmplY3QnID09PSB0eXBlb2YgdXJsLnF1ZXJ5ID8gc3RyaW5naWZ5KHVybC5xdWVyeSkgOiB1cmwucXVlcnk7XG4gIGlmIChxdWVyeSkgcmVzdWx0ICs9ICc/JyAhPT0gcXVlcnkuY2hhckF0KDApID8gJz8nKyBxdWVyeSA6IHF1ZXJ5O1xuXG4gIGlmICh1cmwuaGFzaCkgcmVzdWx0ICs9IHVybC5oYXNoO1xuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cblVybC5wcm90b3R5cGUgPSB7IHNldDogc2V0LCB0b1N0cmluZzogdG9TdHJpbmcgfTtcblxuLy9cbi8vIEV4cG9zZSB0aGUgVVJMIHBhcnNlciBhbmQgc29tZSBhZGRpdGlvbmFsIHByb3BlcnRpZXMgdGhhdCBtaWdodCBiZSB1c2VmdWwgZm9yXG4vLyBvdGhlcnMgb3IgdGVzdGluZy5cbi8vXG5VcmwuZXh0cmFjdFByb3RvY29sID0gZXh0cmFjdFByb3RvY29sO1xuVXJsLmxvY2F0aW9uID0gbG9sY2F0aW9uO1xuVXJsLnRyaW1MZWZ0ID0gdHJpbUxlZnQ7XG5VcmwucXMgPSBxcztcblxubW9kdWxlLmV4cG9ydHMgPSBVcmw7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHRpZihfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdKSB7XG5cdFx0cmV0dXJuIF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0uZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHRpZDogbW9kdWxlSWQsXG5cdFx0bG9hZGVkOiBmYWxzZSxcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG5cdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiX193ZWJwYWNrX3JlcXVpcmVfXy5hbWRPID0ge307IiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmcgPSAoZnVuY3Rpb24oKSB7XG5cdGlmICh0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gJ29iamVjdCcpIHJldHVybiBnbG9iYWxUaGlzO1xuXHR0cnkge1xuXHRcdHJldHVybiB0aGlzIHx8IG5ldyBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSByZXR1cm4gd2luZG93O1xuXHR9XG59KSgpOyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm5tZCA9IChtb2R1bGUpID0+IHtcblx0bW9kdWxlLnBhdGhzID0gW107XG5cdGlmICghbW9kdWxlLmNoaWxkcmVuKSBtb2R1bGUuY2hpbGRyZW4gPSBbXTtcblx0cmV0dXJuIG1vZHVsZTtcbn07IiwiaW1wb3J0IFNvY2tKUyBmcm9tIFwic29ja2pzLWNsaWVudFwiO1xyXG5pbXBvcnQgeyBTdG9tcCB9IGZyb20gJ0BzdG9tcC9zdG9tcGpzJztcclxuaW1wb3J0IHtcclxuICAgIEdyYXBoaWNzQ29udGFpbmVyLFxyXG4gICAgSW5kaWNhdG9yQ29udGFpbmVyLFxyXG4gICAgTG9nTWVzc2FnZSxcclxuICAgIFNwcml0ZUNvbnRhaW5lcixcclxuICAgIFN0YXR1c01lc3NhZ2UsXHJcbiAgICBTdGF0dXNNZXNzYWdlQm9keSxcclxuICAgIFRleHRDb250YWluZXIsXHJcbiAgICBWZWhpY2xlUGFyYW1ldGVyc1xyXG59IGZyb20gXCIuL3R5cGVzXCI7XHJcblxyXG4vLyBTVE9NUCBjbGllbnRcclxubGV0IHN0b21wQ2xpZW50OiBhbnk7XHJcblxyXG4vLyBYSFRUUFxyXG5jb25zdCB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG5cclxuLy8gVHJhY2tpbmcgdmFyaWFibGVzXHJcbmxldCB2ZWhpY2xlOiBWZWhpY2xlUGFyYW1ldGVycyA9IHtcclxuICAgIHJwbTogMCxcclxuICAgIG1waDogMCxcclxuICAgIGNvb2xhbnQ6IDE3MCxcclxuICAgIGZ1ZWw6IDAsXHJcbiAgICBib29zdDogMCxcclxuICAgIHZvbHRhZ2U6IDAsXHJcbiAgICBvZG9tZXRlcjogMCxcclxuICAgIHRyaXBPZG9tZXRlcjogMCxcclxuICAgIGJvb3N0TGFnZ2luZ01heDogMCxcclxuICAgIHJldmVyc2U6IGZhbHNlLFxyXG4gICAgdGVtcGVyYXR1cmU6IDMyLFxyXG4gICAgb2lsUHJlc3N1cmU6IDAsXHJcbn07XHJcblxyXG4vLyBNYWludGFpbnMgY29ubmVjdGlvbiB0byB3ZWIgc29ja2V0XHJcbmZ1bmN0aW9uIGNvbm5lY3RXZWJTb2NrZXQodGhpczogYW55KSB7XHJcbiAgICBjb25zdCBzb2NrZXQgPSBuZXcgU29ja0pTKCcvZ3MtZ3VpZGUtd2Vic29ja2V0Jyk7XHJcblxyXG4gICAgc3RvbXBDbGllbnQgPSBTdG9tcC5vdmVyKHNvY2tldCk7XHJcbiAgICBzdG9tcENsaWVudC5kZWJ1ZyA9ICgpID0+IHt9O1xyXG5cclxuICAgIHN0b21wQ2xpZW50LmNvbm5lY3Qoe30sIChmcmFtZTogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ0Nvbm5lY3RlZCB0bzogJyArIGZyYW1lKTtcclxuXHJcbiAgICAgICAgc3RvbXBDbGllbnQuc3Vic2NyaWJlKCcvdG9waWMvc3RhdHVzJywgKG1lc3NhZ2U6IFN0YXR1c01lc3NhZ2UpID0+IHtcclxuICAgICAgICAgICAgY29uc3Qgc3RhdHVzTXNnID0gSlNPTi5wYXJzZShtZXNzYWdlLmJvZHkgKyBcIlwiKTtcclxuXHJcbiAgICAgICAgICAgICg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJwbVwiKSkudmFsdWUgPSBzdGF0dXNNc2cucnBtO1xyXG4gICAgICAgICAgICAoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtcGhcIikpLnZhbHVlID0gc3RhdHVzTXNnLm1waDtcclxuICAgICAgICAgICAgKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29vbGFudFwiKSkudmFsdWUgPSBzdGF0dXNNc2cuY29vbGFudDtcclxuICAgICAgICAgICAgKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZnVlbFwiKSkudmFsdWUgPSBzdGF0dXNNc2cuZnVlbDtcclxuICAgICAgICAgICAgKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm9vc3RcIikpLnZhbHVlID0gc3RhdHVzTXNnLmJvb3N0O1xyXG4gICAgICAgICAgICAoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ2b2x0YWdlXCIpKS52YWx1ZSA9IHN0YXR1c01zZy52b2x0YWdlO1xyXG4gICAgICAgICAgICAoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJvZG9tZXRlclwiKSkudmFsdWUgPSBzdGF0dXNNc2cub2RvbWV0ZXI7XHJcbiAgICAgICAgICAgICg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRyaXAtb2RvbWV0ZXJcIikpLnZhbHVlID0gc3RhdHVzTXNnLnRyaXBPZG9tZXRlcjtcclxuICAgICAgICAgICAgKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmV2ZXJzZVwiKSkudmFsdWUgPSBzdGF0dXNNc2cucmV2ZXJzZTtcclxuICAgICAgICAgICAgKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGVtcGVyYXR1cmVcIikpLnZhbHVlID0gc3RhdHVzTXNnLnRlbXBlcmF0dXJlO1xyXG4gICAgICAgICAgICAoPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJvaWxQcmVzc3VyZVwiKSkudmFsdWUgPSBzdGF0dXNNc2cub2lsUHJlc3N1cmU7XHJcbiAgICAgICAgICAgICg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvd1wiKSkudmFsdWUgPSBzdGF0dXNNc2cubG93QmVhbTtcclxuICAgICAgICAgICAgKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaGlnaFwiKSkudmFsdWUgPSBzdGF0dXNNc2cuaGlnaEJlYW07XHJcbiAgICAgICAgICAgICg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxlZnRcIikpLnZhbHVlID0gc3RhdHVzTXNnLmxlZnQ7XHJcbiAgICAgICAgICAgICg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJpZ2h0XCIpKS52YWx1ZSA9IHN0YXR1c01zZy5yaWdodDtcclxuICAgICAgICAgICAgKDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHVsc2VDb3VudGVyXCIpKS52YWx1ZSA9IHN0YXR1c01zZy50b3RhbFB1bHNlcztcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgc3RvbXBDbGllbnQuc3Vic2NyaWJlKCcvdG9waWMvbG9ncycsIChtZXNzYWdlOiBMb2dNZXNzYWdlKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxvZ01lc3NhZ2VzID0gbWVzc2FnZS5ib2R5O1xyXG5cclxuICAgICAgICAgICAgaWYgKGxvZ01lc3NhZ2VzLmxlbmd0aCAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGxvZ0FyZWE6IEhUTUxUZXh0QXJlYUVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvZ3NcIikgYXMgSFRNTFRleHRBcmVhRWxlbWVudDtcclxuICAgICAgICAgICAgICAgIC8vbG9nQXJlYS52YWx1ZSArPSBsb2dBcmVhLnRleHRDb250ZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgLy8gQXR0ZW1wdCB0byByZWNvbm5lY3Qgb24gbG9zdCBjb25uZWN0aW9uXHJcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24odGhpczogYW55KSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29ubmVjdFdlYlNvY2tldCgpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSwgMjUwMCk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHplcm9QdWxzZUNvdW50ZXIoKSB7XHJcbiAgICB4aHR0cC5vcGVuKFwiR0VUXCIsIFwiL2ludGVyYWN0aW9uL3plcm9QdWxzZUNvdW50ZXJcIiwgdHJ1ZSk7XHJcbiAgICB4aHR0cC5zZW5kKCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzYXZlVnNzUHBtKCkge1xyXG4gICAgbGV0IHB1bHNlQ291bnRlciA9ICg8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInB1bHNlQ291bnRlclwiKSkudmFsdWVcclxuICAgIHhodHRwLm9wZW4oXCJHRVRcIiwgXCIvaW50ZXJhY3Rpb24vc2F2ZVZzc1BwbT9wcG09XCIgKyBwdWxzZUNvdW50ZXIsIHRydWUpO1xyXG4gICAgeGh0dHAuc2VuZCgpO1xyXG59XHJcblxyXG4vLyBTdGFydCBwb2xsaW5nIGZvciBzdGF0dXNcclxuY29ubmVjdFdlYlNvY2tldCgpOyJdLCJzb3VyY2VSb290IjoiIn0=
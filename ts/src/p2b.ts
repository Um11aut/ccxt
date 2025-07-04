
// ---------------------------------------------------------------------------

import Exchange from './abstract/p2b.js';
import { InsufficientFunds, AuthenticationError, BadRequest, ExchangeNotAvailable, ArgumentsRequired } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Dict, Int, Num, OHLCV, Order, OrderSide, OrderType, Str, Strings, Ticker, Tickers, int, Market } from './base/types.js';
import { sha512 } from './static_dependencies/noble-hashes/sha512.js';

// ---------------------------------------------------------------------------

/**
 * @class p2b
 * @augments Exchange
 */
export default class p2b extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'p2b',
            'name': 'p2b',
            'countries': [ 'LT' ],
            'rateLimit': 100,
            'version': 'v2',
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createDepositAddress': false,
                'createMarketOrder': false,
                'createOrder': true,
                'createOrders': false,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistory': false,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchDeposit': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLedger': false,
                'fetchLedgerEntry': false,
                'fetchLeverageTiers': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchOrderTrades': true,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingLimits': false,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawAddresses': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1m',
                '1h': '1h',
                '1d': '1d',
            },
            'urls': {
                'extension': '.json',
                'referral': 'https://p2pb2b.com?referral=ee784c53',
                'logo': 'https://github.com/ccxt/ccxt/assets/43336371/8da13a80-1f0a-49be-bb90-ff8b25164755',
                'api': {
                    'public': 'https://api.p2pb2b.com/api/v2/public',
                    'private': 'https://api.p2pb2b.com/api/v2',
                },
                'www': 'https://p2pb2b.com/',
                'doc': 'https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md',
                'fees': 'https://p2pb2b.com/fee-schedule/',
            },
            'api': {
                'public': {
                    'get': {
                        'markets': 1,
                        'market': 1,
                        'tickers': 1,
                        'ticker': 1,
                        'book': 1,
                        'history': 1,
                        'depth/result': 1,
                        'market/kline': 1,
                    },
                },
                'private': {
                    'post': {
                        'account/balances': 1,
                        'account/balance': 1,
                        'order/new': 1,
                        'order/cancel': 1,
                        'orders': 1,
                        'account/market_order_history': 1,
                        'account/market_deal_history': 1,
                        'account/order': 1,
                        'account/order_history': 1,
                        'account/executed_history': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': [
                        [ this.parseNumber ('0'), this.parseNumber ('0.2') ],
                        [ this.parseNumber ('1'), this.parseNumber ('0.19') ],
                        [ this.parseNumber ('5'), this.parseNumber ('0.18') ],
                        [ this.parseNumber ('10'), this.parseNumber ('0.17') ],
                        [ this.parseNumber ('25'), this.parseNumber ('0.16') ],
                        [ this.parseNumber ('75'), this.parseNumber ('0.15') ],
                        [ this.parseNumber ('100'), this.parseNumber ('0.14') ],
                        [ this.parseNumber ('150'), this.parseNumber ('0.13') ],
                        [ this.parseNumber ('300'), this.parseNumber ('0.12') ],
                        [ this.parseNumber ('450'), this.parseNumber ('0.11') ],
                        [ this.parseNumber ('500'), this.parseNumber ('0.1') ],
                    ],
                    'maker': [
                        [ this.parseNumber ('0'), this.parseNumber ('0.2') ],
                        [ this.parseNumber ('1'), this.parseNumber ('0.18') ],
                        [ this.parseNumber ('5'), this.parseNumber ('0.16') ],
                        [ this.parseNumber ('10'), this.parseNumber ('0.14') ],
                        [ this.parseNumber ('25'), this.parseNumber ('0.12') ],
                        [ this.parseNumber ('75'), this.parseNumber ('0.1') ],
                        [ this.parseNumber ('100'), this.parseNumber ('0.08') ],
                        [ this.parseNumber ('150'), this.parseNumber ('0.06') ],
                        [ this.parseNumber ('300'), this.parseNumber ('0.04') ],
                        [ this.parseNumber ('450'), this.parseNumber ('0.02') ],
                        [ this.parseNumber ('500'), this.parseNumber ('0.01') ],
                    ],
                },
            },
            'features': {
                'spot': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': false,
                        'triggerDirection': false,
                        'triggerPriceType': undefined,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': false,
                        'leverage': false,
                        'marketBuyByCost': false,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': 100000, // todo
                        'untilDays': 1,
                        'symbolRequired': true,
                    },
                    'fetchOrder': undefined, // todo
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchOrders': undefined, // todo
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': 100000, // todo
                        'daysBackCanceled': 1 / 12, // todo
                        'untilDays': 1,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': 500,
                    },
                },
                'swap': {
                    'linear': undefined,
                    'inverse': undefined,
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
            'commonCurrencies': {
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                '1001': AuthenticationError,    // Key not provided. X-TXC-APIKEY header is missing in the request or empty.
                '1002': AuthenticationError,    // Payload not provided. X-TXC-PAYLOAD header is missing in the request or empty.
                '1003': AuthenticationError,    // Signature not provided. X-TXC-SIGNATURE header is missing in the request or empty.
                '1004': AuthenticationError,    // Nonce and url not provided. Request body is empty. Missing required parameters "request", "nonce".
                '1005': AuthenticationError,    // Invalid body data. Invalid request body
                '1006': AuthenticationError,    // Nonce not provided. Request body missing required parameter "nonce".
                '1007': AuthenticationError,    // Request not provided. Request body missing required parameter "request".
                '1008': AuthenticationError,    // Invalid request in body. The passed request parameter does not match the URL of this request.
                '1009': AuthenticationError,    // Invalid payload. The transmitted payload value (X-TXC-PAYLOAD header) does not match the request body.
                '1010': AuthenticationError,    // This action is unauthorized. - API key passed in the X-TXC-APIKEY header does not exist. - Access to API is not activated. Go to profile and activate access.
                '1011': AuthenticationError,    // This action is unauthorized. Please, enable two-factor authentication. Two-factor authentication is not activated for the user.
                '1012': AuthenticationError,    // Invalid nonce. Parameter "nonce" is not a number.
                '1013': AuthenticationError,    // Too many requests. - A request came with a repeated value of nonce. - Received more than the limited value of requests (10) within one second.
                '1014': AuthenticationError,    // Unauthorized request. Signature value passed (in the X-TXC-SIGNATURE header) does not match the request body.
                '1015': AuthenticationError,    // Temporary block. Temporary blocking. There is a cancellation of orders.
                '1016': AuthenticationError,    // Not unique nonce. The request was sent with a repeated parameter "nonce" within 10 seconds.
                '2010': BadRequest,             // Currency not found. Currency not found.
                '2020': BadRequest,             // Market is not available. Market is not available.
                '2021': BadRequest,             // Unknown market. Unknown market.
                '2030': BadRequest,             // Order not found. Order not found.
                '2040': InsufficientFunds,      // Balance not enough. Insufficient balance.
                '2050': BadRequest,             // Amount less than the permitted minimum. Amount less than the permitted minimum.
                '2051': BadRequest,             // Amount is greater than the maximum allowed. Amount exceeds the allowed maximum.
                '2052': BadRequest,             // Amount step size error. Amount step size error.
                '2060': BadRequest,             // Price less than the permitted minimum. Price is less than the permitted minimum.
                '2061': BadRequest,             // Price is greater than the maximum allowed. Price exceeds the allowed maximum.
                '2062': BadRequest,             // Price pick size error. Price pick size error.
                '2070': BadRequest,             // Total less than the permitted minimum. Total less than the permitted minimum.
                '3001': BadRequest,             // Validation exception. The given data was invalid.
                '3020': BadRequest,             // Invalid currency value. Incorrect parameter, check your request.
                '3030': BadRequest,             // Invalid market value. Incorrect "market" parameter, check your request.
                '3040': BadRequest,             // Invalid amount value. Incorrect "amount" parameter, check your request.
                '3050': BadRequest,             // Invalid price value. Incorrect "price" parameter, check your request.
                '3060': BadRequest,             // Invalid limit value. Incorrect "limit" parameter, check your request.
                '3070': BadRequest,             // Invalid offset value. Incorrect "offset" parameter, check your request.
                '3080': BadRequest,             // Invalid orderId value. Incorrect "orderId" parameter, check your request.
                '3090': BadRequest,             // Invalid lastId value. Incorrect "lastId" parameter, check your request.
                '3100': BadRequest,             // Invalid side value. Incorrect "side" parameter, check your request.
                '3110': BadRequest,             // Invalid interval value. Incorrect "interval" parameter, check your request.
                '4001': ExchangeNotAvailable,   // Service temporary unavailable. An unexpected system error has occurred. Try again after a while. If the error persists, please contact support.
                '6010': InsufficientFunds,      // Balance not enough. Insufficient balance.
            },
            'options': {
            },
        });
    }

    /**
     * @method
     * @name p2b#fetchMarkets
     * @description retrieves data on all markets for bigone
     * @see https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetMarkets (params);
        //
        //    {
        //        "success": true,
        //        "errorCode": "",
        //        "message": "",
        //        "result": [
        //            {
        //                "name": "ETH_BTC",
        //                "stock": "ETH",
        //                "money": "BTC",
        //                "precision": {
        //                    "money": "6",
        //                    "stock": "4",
        //                    "fee": "4"
        //                },
        //                "limits": {
        //                    "min_amount": "0.001",
        //                    "max_amount": "100000",
        //                    "step_size": "0.0001",
        //                    "min_price": "0.00001",
        //                    "max_price": "922327",
        //                    "tick_size": "0.00001",
        //                    "min_total": "0.0001"
        //                }
        //            },
        //            ...
        //        ]
        //    }
        //
        const markets = this.safeValue (response, 'result', []);
        return this.parseMarkets (markets);
    }

    parseMarket (market: Dict): Market {
        const marketId = this.safeString (market, 'name');
        const baseId = this.safeString (market, 'stock');
        const quoteId = this.safeString (market, 'money');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const limits = this.safeValue (market, 'limits');
        const maxAmount = this.safeString (limits, 'max_amount');
        const maxPrice = this.safeString (limits, 'max_price');
        return {
            'id': marketId,
            'symbol': base + '/' + quote,
            'base': base,
            'quote': quote,
            'settle': undefined,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': undefined,
            'type': 'spot',
            'spot': true,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'active': true,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.safeNumber (limits, 'step_size'),
                'price': this.safeNumber (limits, 'tick_size'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber (limits, 'min_amount'),
                    'max': this.parseNumber (this.omitZero (maxAmount)),
                },
                'price': {
                    'min': this.safeNumber (limits, 'min_price'),
                    'max': this.parseNumber (this.omitZero (maxPrice)),
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'created': undefined,
            'info': market,
        };
    }

    /**
     * @method
     * @name p2b#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://futures-docs.poloniex.com/#get-real-time-ticker-of-all-symbols
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        //
        //    {
        //        success: true,
        //        errorCode: '',
        //        message: '',
        //        result: {
        //            KNOLIX_BTC: {
        //                at: '1699252631',
        //                ticker: {
        //                    bid: '0.0000332',
        //                    ask: '0.0000333',
        //                    low: '0.0000301',
        //                    high: '0.0000338',
        //                    last: '0.0000333',
        //                    vol: '15.66',
        //                    deal: '0.000501828',
        //                    change: '10.63'
        //                }
        //            },
        //            ...
        //        },
        //        cache_time: '1699252631.103631',
        //        current_time: '1699252644.487566'
        //    }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseTickers (result, symbols);
    }

    /**
     * @method
     * @name p2b#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        //
        //    {
        //        success: true,
        //        errorCode: '',
        //        message: '',
        //        result: {
        //            bid: '0.342',
        //            ask: '0.3421',
        //            open: '0.3317',
        //            high: '0.3499',
        //            low: '0.3311',
        //            last: '0.3421',
        //            volume: '17855383.1',
        //            deal: '6107478.3423',
        //            change: '3.13'
        //        },
        //        cache_time: '1699252953.832795',
        //        current_time: '1699252958.859391'
        //    }
        //
        const result = this.safeValue (response, 'result', {});
        const timestamp = this.safeIntegerProduct (response, 'cache_time', 1000);
        return this.extend (
            { 'timestamp': timestamp, 'datetime': this.iso8601 (timestamp) },
            this.parseTicker (result, market)
        );
    }

    parseTicker (ticker, market: Market = undefined) {
        //
        // parseTickers
        //
        //    {
        //        at: '1699252631',
        //        ticker: {
        //            bid: '0.0000332',
        //            ask: '0.0000333',
        //            low: '0.0000301',
        //            high: '0.0000338',
        //            last: '0.0000333',
        //            vol: '15.66',
        //            deal: '0.000501828',
        //            change: '10.63'
        //        }
        //    }
        //
        // parseTicker
        //
        //    {
        //        bid: '0.342',
        //        ask: '0.3421',
        //        open: '0.3317',
        //        high: '0.3499',
        //        low: '0.3311',
        //        last: '0.3421',
        //        volume: '17855383.1',
        //        deal: '6107478.3423',
        //        change: '3.13'
        //    }
        //
        const timestamp = this.safeIntegerProduct (ticker, 'at', 1000);
        if ('ticker' in ticker) {
            ticker = this.safeValue (ticker, 'ticker');
        }
        const last = this.safeString (ticker, 'last');
        return this.safeTicker ({
            'symbol': this.safeString (market, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString (ticker, 'change'),
            'average': undefined,
            'baseVolume': this.safeString2 (ticker, 'vol', 'volume'),
            'quoteVolume': this.safeString (ticker, 'deal'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name p2b#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#depth-result
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {string} [params.interval] 0 (default), 0.00000001, 0.0000001, 0.000001, 0.00001, 0.0001, 0.001, 0.01, 0.1, 1
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetDepthResult (this.extend (request, params));
        //
        //    {
        //        "success": true,
        //        "errorCode": "",
        //        "message": "",
        //        "result": {
        //            "asks": [
        //                [
        //                    "4.53",     // Price
        //                    "523.95"    // Amount
        //                ],
        //                ...
        //            ],
        //            "bids": [
        //                [
        //                    "4.51",
        //                    "244.75"
        //                ],
        //                ...
        //            ]
        //        },
        //        "cache_time": 1698733470.469175,
        //        "current_time": 1698733470.469274
        //    }
        //
        const result = this.safeValue (response, 'result', {});
        const timestamp = this.safeIntegerProduct (response, 'current_time', 1000);
        return this.parseOrderBook (result, market['symbol'], timestamp, 'bids', 'asks', 0, 1);
    }

    /**
     * @method
     * @name p2b#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#history
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] 1-100, default=50
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} params.lastId order id
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const lastId = this.safeInteger (params, 'lastId');
        if (lastId === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTrades () requires an extra parameter params["lastId"]');
        }
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
            'lastId': lastId,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetHistory (this.extend (request, params));
        //
        //    {
        //        success: true,
        //        errorCode: '',
        //        message: '',
        //        result: [
        //            {
        //                id: '7495738622',
        //                type: 'sell',
        //                time: '1699255565.445418',
        //                amount: '252.6',
        //                price: '0.3422'
        //            },
        //            ...
        //        ],
        //        cache_time: '1699255571.413633',
        //        current_time: '1699255571.413828'
        //    }
        //
        const result = this.safeList (response, 'result', []);
        return this.parseTrades (result, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined) {
        //
        // fetchTrades
        //
        //    {
        //        id: '7495738622',
        //        type: 'sell',
        //        time: '1699255565.445418',
        //        amount: '252.6',
        //        price: '0.3422'
        //    }
        //
        // fetchMyTrades
        //
        //    {
        //        "deal_id": 7450617292,              // Deal id
        //        "deal_time": 1698506956.66224,      // Deal execution time
        //        "deal_order_id": 171955225751,      // Deal order id
        //        "opposite_order_id": 171955110512,  // Opposite order id
        //        "side": "sell",                     // Deal side
        //        "price": "0.05231",                 // Deal price
        //        "amount": "0.002",                  // Deal amount
        //        "deal": "0.00010462",               // Total (price * amount)
        //        "deal_fee": "0.000000188316",       // Deal fee
        //        "role": "taker",                    // Role. Taker or maker
        //        "isSelfTrade": false                // is self trade
        //    }
        //
        // fetchOrderTrades
        //
        //    {
        //        "id": 7429883128,             // Deal id
        //        "time": 1698237535.41196,     // Deal execution time
        //        "fee": "0.01755848704",       // Deal fee
        //        "price": "34293.92",          // Deal price
        //        "amount": "0.00032",          // Deal amount
        //        "dealOrderId": 171366551416,  // Deal order id
        //        "role": 1,                    // Deal role (1 - maker, 2 - taker)
        //        "deal": "10.9740544"          // Total (price * amount)
        //    }
        //
        const timestamp = this.safeIntegerProduct2 (trade, 'time', 'deal_time', 1000);
        let takerOrMaker = this.safeString (trade, 'role');
        if (takerOrMaker === '1') {
            takerOrMaker = 'maker';
        } else if (takerOrMaker === '2') {
            takerOrMaker = 'taker';
        }
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString2 (trade, 'id', 'deal_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeString (market, 'symbol'),
            'order': this.safeString2 (trade, 'dealOrderId', 'deal_order_id'),
            'type': undefined,
            'side': this.safeString2 (trade, 'type', 'side'),
            'takerOrMaker': takerOrMaker,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'amount'),
            'cost': this.safeString (trade, 'deal'),
            'fee': {
                'currency': market['quote'],
                'cost': this.safeString2 (trade, 'fee', 'deal_fee'),
            },
        }, market);
    }

    /**
     * @method
     * @name p2b#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#kline
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe 1m, 1h, or 1d
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] 1-500, default=50
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.offset] default=0, with this value the last candles are returned
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
            'interval': timeframe,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetMarketKline (this.extend (request, params));
        //
        //    {
        //        success: true,
        //        errorCode: '',
        //        message: '',
        //        result: [
        //            [
        //                1699253400,       // Kline open time
        //                '0.3429',         // Open price
        //                '0.3427',         // Close price
        //                '0.3429',         // Highest price
        //                '0.3427',         // Lowest price
        //                '1900.4',         // Volume for stock currency
        //                '651.46278',      // Volume for money currency
        //                'ADA_USDT'        // Market name
        //            ],
        //            ...
        //        ],
        //        cache_time: '1699256375.030292',
        //        current_time: '1699256375.030494'
        //    }
        //
        const result = this.safeList (response, 'result', []);
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined) : OHLCV {
        //
        //    [
        //        1699253400,       // Kline open time
        //        '0.3429',         // Open price
        //        '0.3427',         // Close price
        //        '0.3429',         // Highest price
        //        '0.3427',         // Lowest price
        //        '1900.4',         // Volume for stock currency
        //        '651.46278',      // Volume for money currency
        //        'ADA_USDT'        // Market name
        //    ],
        //
        return [
            this.safeIntegerProduct (ohlcv, 0, 1000),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 5),
        ];
    }

    /**
     * @method
     * @name p2b#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#all-balances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostAccountBalances (params);
        //
        //    {
        //        "success": true,
        //        "errorCode": "",
        //        "message": "",
        //        "result": {
        //            "USDT": {
        //              "available": "71.81328046",
        //              "freeze": "10.46103091"
        //            },
        //            "BTC": {
        //              "available": "0.00135674",
        //              "freeze": "0.00020003"
        //            }
        //        }
        //    }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseBalance (result);
    }

    parseBalance (response) {
        //
        //    {
        //        "USDT": {
        //            "available": "71.81328046",
        //            "freeze": "10.46103091"
        //        },
        //        "BTC": {
        //            "available": "0.00135674",
        //            "freeze": "0.00020003"
        //        }
        //    }
        //
        const result: Dict = {
            'info': response,
        };
        const keys = Object.keys (response);
        for (let i = 0; i < keys.length; i++) {
            const currencyId = keys[i];
            const balance = response[currencyId];
            const code = this.safeCurrencyCode (currencyId);
            const used = this.safeString (balance, 'freeze');
            const available = this.safeString (balance, 'available');
            const account: Dict = {
                'free': available,
                'used': used,
            };
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name p2b#createOrder
     * @description create a trade order
     * @see https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#create-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type must be 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} price the price at which the order is to be fulfilled, in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        if (type === 'market') {
            throw new BadRequest (this.id + ' createOrder () can only accept orders with type "limit"');
        }
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
            'side': side,
            'amount': this.amountToPrecision (symbol, amount),
            'price': this.priceToPrecision (symbol, price),
        };
        const response = await this.privatePostOrderNew (this.extend (request, params));
        //
        //    {
        //        "success": true,
        //        "errorCode": "",
        //        "message": "",
        //        "result": {
        //            "orderId": 171906478744,          // Order id
        //            "market": "ETH_BTC",              // Market name
        //            "price": "0.04348",               // Price
        //            "side": "buy",                    // Side
        //            "type": "limit",                  // Order type
        //            "timestamp": 1698484861.746517,   // Order creation time
        //            "dealMoney": "0",                 // Filled total
        //            "dealStock": "0",                 // Filled amount
        //            "amount": "0.0277",               // Original amount
        //            "takerFee": "0.002",              // taker fee
        //            "makerFee": "0.002",              // maker fee
        //            "left": "0.0277",                 // Unfilled amount
        //            "dealFee": "0"                    // Filled fee
        //        }
        //    }
        //
        const result = this.safeDict (response, 'result');
        return this.parseOrder (result, market);
    }

    /**
     * @method
     * @name p2b#cancelOrder
     * @description cancels an open order
     * @see https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#cancel-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
            'orderId': id,
        };
        const response = await this.privatePostOrderCancel (this.extend (request, params));
        //
        //    {
        //        "success": true,
        //        "errorCode": "",
        //        "message": "",
        //        "result": {
        //            "orderId": 171906478744,
        //            "market": "ETH_BTC",
        //            "price": "0.04348",
        //            "side": "buy",
        //            "type": "limit",
        //            "timestamp": 1698484861.746517,
        //            "dealMoney": "0",
        //            "dealStock": "0",
        //            "amount": "0.0277",
        //            "takerFee": "0.002",
        //            "makerFee": "0.002",
        //            "left": "0.0277",
        //            "dealFee": "0"
        //        }
        //    }
        //
        const result = this.safeDict (response, 'result');
        return this.parseOrder (result);
    }

    /**
     * @method
     * @name p2b#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#open-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {int} [params.offset] 0-10000, default=0
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders () requires the symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostOrders (this.extend (request, params));
        //
        //    {
        //        "success": true,
        //        "errorCode": "",
        //        "message": "",
        //        "result": [
        //            {
        //                "orderId": 171913325964,
        //                "market": "ETH_BTC",
        //                "price": "0.06534",
        //                "side": "sell",
        //                "type": "limit",
        //                "timestamp": 1698487986.836821,
        //                "dealMoney": "0",
        //                "dealStock": "0",
        //                "amount": "0.0018",
        //                "takerFee": "0.0018",
        //                "makerFee": "0.0016",
        //                "left": "0.0018",
        //                "dealFee": "0"
        //            },
        //            ...
        //        ]
        //    }
        //
        const result = this.safeList (response, 'result', []);
        return this.parseOrders (result, market, since, limit);
    }

    /**
     * @method
     * @name p2b#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#deals-by-order-id
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] 1-100, default=50
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {int} [params.offset] 0-10000, default=0
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchOrderTrades (id: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.safeMarket (symbol);
        const request: Dict = {
            'orderId': id,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostAccountOrder (this.extend (request, params));
        //
        //    {
        //        "success": true,
        //        "errorCode": "",
        //        "message": "",
        //        "result": {
        //            "offset": 0,
        //            "limit": 50,
        //            "records": [
        //                {
        //                    "id": 7429883128,             // Deal id
        //                    "time": 1698237535.41196,     // Deal execution time
        //                    "fee": "0.01755848704",       // Deal fee
        //                    "price": "34293.92",          // Deal price
        //                    "amount": "0.00032",          // Deal amount
        //                    "dealOrderId": 171366551416,  // Deal order id
        //                    "role": 1,                    // Deal role (1 - maker, 2 - taker)
        //                    "deal": "10.9740544"          // Total (price * amount)
        //                }
        //            ]
        //        }
        //    }
        //
        const result = this.safeValue (response, 'result', {});
        const records = this.safeList (result, 'records', []);
        return this.parseTrades (records, market, since, limit);
    }

    /**
     * @method
     * @name p2b#fetchMyTrades
     * @description fetch all trades made by the user, only the transaction records in the past 3 month can be queried, the time between since and params["until"] cannot be longer than 24 hours
     * @see https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#deals-history-by-market
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for, default = params["until"] - 86400000
     * @param {int} [limit] 1-100, default=50
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for, default = current timestamp or since + 86400000
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {int} [params.offset] 0-10000, default=0
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        let until = this.safeInteger (params, 'until');
        params = this.omit (params, 'until');
        if (until === undefined) {
            if (since === undefined) {
                until = this.milliseconds ();
            } else {
                until = since + 86400000;
            }
        }
        if (since === undefined) {
            since = until - 86400000;
        }
        if ((until - since) > 86400000) {
            throw new BadRequest (this.id + ' fetchMyTrades () the time between since and params["until"] cannot be greater than 24 hours');
        }
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
            'startTime': this.parseToInt (since / 1000),
            'endTime': this.parseToInt (until / 1000),
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostAccountMarketDealHistory (this.extend (request, params));
        //
        //    {
        //        "success": true,
        //        "errorCode": "",
        //        "message": "",
        //        "result": {
        //            "total": 2,                                 // Total records in the queried range
        //            "deals": [
        //                {
        //                    "deal_id": 7450617292,              // Deal id
        //                    "deal_time": 1698506956.66224,      // Deal execution time
        //                    "deal_order_id": 171955225751,      // Deal order id
        //                    "opposite_order_id": 171955110512,  // Opposite order id
        //                    "side": "sell",                     // Deal side
        //                    "price": "0.05231",                 // Deal price
        //                    "amount": "0.002",                  // Deal amount
        //                    "deal": "0.00010462",               // Total (price * amount)
        //                    "deal_fee": "0.000000188316",       // Deal fee
        //                    "role": "taker",                    // Role. Taker or maker
        //                    "isSelfTrade": false                // is self trade
        //                },
        //                ...
        //            ]
        //        }
        //    }
        //
        const result = this.safeValue (response, 'result', {});
        const deals = this.safeList (result, 'deals', []);
        return this.parseTrades (deals, market, since, limit);
    }

    /**
     * @method
     * @name p2b#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user, the time between since and params["untnil"] cannot be longer than 24 hours
     * @see https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#orders-history-by-market
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for, default = params["until"] - 86400000
     * @param {int} [limit] 1-100, default=50
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for, default = current timestamp or since + 86400000
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {int} [params.offset] 0-10000, default=0
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let until = this.safeInteger (params, 'until');
        params = this.omit (params, 'until');
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        if (until === undefined) {
            if (since === undefined) {
                until = this.milliseconds ();
            } else {
                until = since + 86400000;
            }
        }
        if (since === undefined) {
            since = until - 86400000;
        }
        if ((until - since) > 86400000) {
            throw new BadRequest (this.id + ' fetchClosedOrders () the time between since and params["until"] cannot be greater than 24 hours');
        }
        const request: Dict = {
            'startTime': this.parseToInt (since / 1000),
            'endTime': this.parseToInt (until / 1000),
        };
        if (market !== undefined) {
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostAccountOrderHistory (this.extend (request, params));
        //
        //    {
        //        "success": true,
        //        "errorCode": "",
        //        "message": "",
        //        "result": {
        //            "LTC_USDT": [
        //                {
        //                    "id": 173985944395,
        //                    "amount": "0.1",
        //                    "price": "73",
        //                    "type": "limit",
        //                    "side": "sell",
        //                    "ctime": 1699436194.390845,
        //                    "ftime": 1699436194.390847,
        //                    "market": "LTC_USDT",
        //                    "takerFee": "0.002",
        //                    "makerFee": "0.002",
        //                    "dealFee": "0.01474",
        //                    "dealStock": "0.1",
        //                    "dealMoney": "7.37"
        //                }
        //            ]
        //        }
        //    }
        //
        const result = this.safeValue (response, 'result');
        let orders = [];
        const keys = Object.keys (result);
        for (let i = 0; i < keys.length; i++) {
            const marketId = keys[i];
            const marketOrders = result[marketId];
            const parsedOrders = this.parseOrders (marketOrders, market, since, limit);
            orders = this.arrayConcat (orders, parsedOrders);
        }
        return orders;
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // cancelOrder, fetchOpenOrders, createOrder
        //
        //    {
        //        "orderId": 171906478744,
        //        "market": "ETH_BTC",
        //        "price": "0.04348",
        //        "side": "buy",
        //        "type": "limit",
        //        "timestamp": 1698484861.746517,
        //        "dealMoney": "0",
        //        "dealStock": "0",
        //        "amount": "0.0277",
        //        "takerFee": "0.002",
        //        "makerFee": "0.002",
        //        "left": "0.0277",
        //        "dealFee": "0"
        //    }
        //
        // fetchClosedOrders
        //
        //    {
        //        "id": 171366547790,           // Order id
        //        "amount": "0.00032",          // Original amount
        //        "price": "34293.92",          // Order price
        //        "type": "limit",              // Order type
        //        "side": "sell",               // Order side
        //        "ctime": 1698237533.497241,   // Order creation time
        //        "ftime": 1698237535.41196,    // Order fill time
        //        "market": "BTC_USDT",         // Market name
        //        "takerFee": "0.0018",         // Taker fee
        //        "makerFee": "0.0016",         // Market fee
        //        "dealFee": "0.01755848704",   // Deal fee
        //        "dealStock": "0.00032",       // Filled amount
        //        "dealMoney": "10.9740544"     // Filled total
        //    }
        //
        const timestamp = this.safeIntegerProduct2 (order, 'timestamp', 'ctime', 1000);
        const marketId = this.safeString (order, 'market');
        market = this.safeMarket (marketId, market);
        return this.safeOrder ({
            'info': order,
            'id': this.safeString2 (order, 'id', 'orderId'),
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': market['symbol'],
            'type': this.safeString (order, 'type'),
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': this.safeString (order, 'side'),
            'price': this.safeString (order, 'price'),
            'triggerPrice': undefined,
            'amount': this.safeString (order, 'amount'),
            'cost': undefined,
            'average': undefined,
            'filled': this.safeString (order, 'dealStock'),
            'remaining': this.safeString (order, 'left'),
            'status': undefined,
            'fee': {
                'currency': market['quote'],
                'cost': this.safeString (order, 'dealFee'),
            },
            'trades': undefined,
        }, market);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        params = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        if (api === 'private') {
            params['request'] = '/api/v2/' + path;
            params['nonce'] = this.nonce ().toString ();
            const payload = this.stringToBase64 (this.json (params));  // Body json encoded in base64
            headers = {
                'Content-Type': 'application/json',
                'X-TXC-APIKEY': this.apiKey,
                'X-TXC-PAYLOAD': payload,
                'X-TXC-SIGNATURE': this.hmac (this.encode (payload), this.encode (this.secret), sha512),
            };
            body = this.json (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        if (code === 400) {
            const error = this.safeValue (response, 'error');
            const errorCode = this.safeString (error, 'code');
            const feedback = this.id + ' ' + this.json (response);
            this.throwExactlyMatchedException (this.exceptions, errorCode, feedback);
            // fallback to default error handler
        }
        return undefined;
    }
}

'use strict';

import React, {Component} from 'react';
import InputText from "./style/InputText";
import {toastError} from "../libs/toast";
import "../styles/styles.scss";
import SelectAndSearch from "./style/SelectAndSearch/SelectAndSearch";
import {restrictDouble} from "../libs/utils";
import {UPDATE_PERIOD_300000} from "../libs/constants";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {

            sendAmount: 1
            , getAmount: ''
            , currenciesFrom: ''
            , currenciesTo: ''
            , optionsCurrencies: []

        };

        this._updateTimeout = null;
        this._updateRequired = true;

        this._getExchangeAmount = this._getExchangeAmount.bind(this);
    }

    componentDidMount() {
        this._getCurrencies();
    }

    componentWillUnmount() {
        this._stopUpdate();
    }

    componentDidUpdate(prevProps, prevState) {
        const {sendAmount, currenciesFrom, currenciesTo} = this.state;
        if (prevState.sendAmount !== sendAmount
            || prevState.currenciesFrom.value !== currenciesFrom.value
            || prevState.currenciesTo !== currenciesTo) {
            this._getExchangeAmount();
        }
    }

    render() {
        const {sendAmount, getAmount, currenciesFrom, currenciesTo, optionsCurrencies} = this.state;

        return (
            <div className="app">
                <header className="header">

                    <div className='flex-box'>

                        <div className="block-from">

                            <div className="input-text">
                                <div className="text-sent">
                                    You sent
                                </div>

                                <div className="input-sent">
                                    <InputText value={sendAmount}
                                               name='sendAmount'
                                               onBlur={(e) => {
                                                   if (isNaN(e)) {
                                                       this._addValueByState(e);
                                                   }
                                               }}
                                               onChange={this._handleChange}/>
                                </div>

                            </div>

                            <div className="select-from">
                                <SelectAndSearch name="currenciesFrom"
                                                 value={currenciesFrom}
                                                 onChange={this._handleChangeSelectFrom}
                                                 options={optionsCurrencies}/>
                            </div>
                        </div>


                        <div className="block-from">

                            <div className="input-text">
                                <div className="text-sent">
                                    You Get
                                </div>

                                <div className="input-sent">
                                    <InputText readOnly value={getAmount}/>
                                </div>

                            </div>

                            <div className="select-from">
                                <SelectAndSearch name="currenciesTo"
                                                 value={currenciesTo}
                                                 onChange={this._handleChangeSelectTo}
                                                 options={optionsCurrencies}/>
                            </div>
                        </div>


                    </div>
                </header>
            </div>
        );
    }

    _handleChangeSelectFrom = (currenciesFrom) => {
        this.setState({currenciesFrom: currenciesFrom.value});
    };

    _addValueByState = (e) => {
        const el = e.target;
        let {name, value} = el;
        if (String(value).length <= 0) {
            this.setState({[name]: 1});
        }
    };

    _handleChangeSelectTo = (currenciesTo) => {
        this.setState({currenciesTo: currenciesTo.value});
    };

    _handleChange = e => {
        const el = e.target;
        let {name, value} = el;
        this.setState({[name]: restrictDouble(value)});
    };

    _getCurrencies = () => {
        fetch(`https://changenow.io/api/v1/currencies`)
            .then((response) => {
                return response.json()
            })
            .then((responseJson) => {
                this._setUpdateTimeout(UPDATE_PERIOD_300000);
                this._processingResponse(responseJson);
            }).catch((er) => {
            console.log('====err Currencies', er);
            toastError(er, {autoClose: 5000}); //TODO
        });
    };

    _stopUpdate() {
        if (this._updateTimeout !== null) {
            clearTimeout(this._updateTimeout);
            this._updateTimeout = null;
        }
        this._updateRequired = false;
    }

    _setUpdateTimeout(delay) {
        if (this._updateRequired) {
            this._updateTimeout = setTimeout(this._getCurrencies, delay);
        }
    }

    _processingResponse = responseList => {
        const optionsCurrencies = [];
        responseList.forEach((v, i) => {
            optionsCurrencies.push({
                value: responseList[i].ticker
                , label: responseList[i].ticker
            });
        });
        this.setState({
            optionsCurrencies,
            currenciesTo: responseList[0].ticker,
            currenciesFrom: responseList[1].ticker
        });

    };

    _getExchangeAmount() {
        const {sendAmount, currenciesFrom, currenciesTo} = this.state;
        fetch(`https://changenow.io/api/v1/exchange-amount/${sendAmount}/${currenciesFrom}_${currenciesTo}`)
            .then((response) => {
                return response.json()
            })
            .then((responseJson) => {
                this.setState({getAmount: responseJson.estimatedAmount});
                return responseJson;
            }).catch(er => {
            console.log('====err Amount', er);

            toastError(er, {autoClose: 5000});//TODO
        });
    }

};

export default App;

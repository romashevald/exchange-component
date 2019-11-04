'use strict';

import React, {Component} from 'react';
import InputText from "./style/InputText";
import SelectAndSearch from "./style/SelectAndSearch/SelectAndSearch";
import {restrictDouble} from "../libs/utils";
import {UI, UPDATE_PERIOD_300000} from "../libs/constants";
import "../styles/styles.scss";

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

    //a comment
    //a comment 2xd\
    //a comment 3
    //a comment 4
    componentDidMount() {
        this._getCurrencies();
    }

    componentWillUnmount() {
        this._stopUpdate();
    }

    componentDidUpdate(prevProps, prevState) {
        const {sendAmount, currenciesFrom, currenciesTo} = this.state;
        if (prevState.sendAmount !== sendAmount
            || prevState.currenciesFrom !== currenciesFrom
            || prevState.currenciesTo !== currenciesTo) {
            this._getExchangeAmount();
        }
    }

    render() {
        const {sendAmount, getAmount, currenciesFrom, currenciesTo, optionsCurrencies} = this.state;
//govno 1
//govno 2
        return (
            <div className={UI.APP}>
                <header className={UI.HEADER}>

                    <div className={UI.FLEX_BOX}>

                        <div className={UI.BLOCK_FORM}>

                            <div className={UI.INPUT_WITH_HEADER}>
                                <div className={UI.TEXT_HEADER}>
                                    You Send
                                </div>

                                <div className={UI.NUM_INPUT}>
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

                            <div className={UI.SELECT_FORM}>
                                <SelectAndSearch name="currenciesFrom"
                                                 value={currenciesFrom}
                                                 onChange={this._handleChangeSelectFrom}
                                                 options={optionsCurrencies}/>
                            </div>
                        </div>


                        <div className={UI.BLOCK_FORM}>

                            <div className={UI.INPUT_WITH_HEADER}>
                                <div className={UI.TEXT_HEADER}>
                                    You Get
                                </div>

                                <div className={UI.NUM_INPUT}>
                                    <InputText readOnly value={getAmount}/>
                                </div>

                            </div>

                            <div className={UI.SELECT_FORM}>
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

    _handleChangeSelectTo = (currenciesTo) => {
        this.setState({currenciesTo: currenciesTo.value});
    };

    _addValueByState = (e) => {
        const el = e.target;
        let {name, value} = el;
        if (String(value).length === 0) {
            this.setState({[name]: 1});
        }
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
                , fullLabel: `${responseList[i].ticker}   ${responseList[i].name}`
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
        if (String(sendAmount).length > 0) {
            fetch(`https://changenow.io/api/v1/exchange-amount/${sendAmount}/${currenciesFrom}_${currenciesTo}`)
                .then((response) => {
                    return response.json();
                })
                .then((responseJson) => {
                    if (responseJson.estimatedAmount) {
                        this.setState({getAmount: responseJson.estimatedAmount});
                    } else {
                        this.setState({getAmount: responseJson.error});
                    }
                    return responseJson;
                }).catch(er => {
                console.log('====err Amount', er);
            });
        }
    }
}

export default App;

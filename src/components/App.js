'use strict';

import React, {Component} from 'react';
import InputText from "./style/InputText";
import Select from "./style/Select";
import {toastError} from "../libs/toast";
import "../styles/styles.scss";
import SelectAndSearch from "./style/SelectAndSearch/SelectAndSearch";

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
        this._toastId = null;

        this._getExchangeAmount = this._getExchangeAmount.bind(this);
    }

    componentDidMount() {
        this._getCurrencies();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.sendAmount !== this.state.sendAmount
            || prevState.currenciesFrom.value !== this.state.currenciesFrom.value
            || prevState.currenciesTo !== this.state.currenciesTo) {
            this._getExchangeAmount();
        }
    }

    render() {
        const {sendAmount, getAmount, currenciesFrom, currenciesTo, optionsCurrencies} = this.state;

        return (
            <div className="app">
                <header className="header">

                    <div>
                        <div>
                            You sent
                        </div>
                        <div>
                            <InputText value={sendAmount}
                                       name='sendAmount'
                                       onChange={this._handleChange}/>
                        </div>
                        <div>
                            <SelectAndSearch name="currenciesFrom"
                                             value={currenciesFrom}
                                             onChange={this._handleChangeSelectFrom}
                                             options={optionsCurrencies}/>
                        </div>

                        <div>
                            You Get
                        </div>
                        <div>
                            <InputText readOnly value={getAmount}/>
                        </div>
                        <div>
                            <SelectAndSearch name="currenciesTo"
                                             value={currenciesTo}
                                             onChange={this._handleChangeSelectTo}
                                             options={optionsCurrencies}/>

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

    _handleChange = e => {
        const el = e.target;
        let {name, value} = el;
        this.setState({[name]: value});
    };

    _getCurrencies = () => {
        fetch(`https://changenow.io/api/v1/currencies`)
            .then((response) => {
                return response.json()
            })
            .then((responseJson) => {
                this._processingResponse(responseJson);
                // throw 'err';
                // return responseJson.Answer;
            }).catch((er) => {
            console.log('====err Currencies', er);
            this._toastId = toastError(er, {autoClose: 5000}); //TODO
        });
    };

    _processingResponse = responseList => {
        const optionsCurrencies = [];
        responseList.forEach((v, i) => {
            optionsCurrencies.push({
                value: responseList[i].ticker
                , label: responseList[i].name
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

            this._toastId = toastError(er, {autoClose: 5000});//TODO
        });
    }

};

export default App;

'use strict';

import React, {Component} from 'react';
import {pNumberOrString, pObject, pString} from "../../libs/constants";

export default class InputText extends Component {
    static propTypes = {
        className: pString
        , type: pString
        , value: pNumberOrString
    };

    static contextTypes = {
        form: pObject
    };

    constructor(props, context) {
        super(props, context);
        this._input = null;
        this._makeRef = this._makeRef.bind(this);
    }

    get input() {
        return this._input;
    }

    set input(value) {
        this._input = value;
    }

    render() {
        const {
            className = ''
            , rules
            , type = 'text'
            , ...attrs
        } = this.props;


        return <input
            type={type}
            autoComplete="off"
            {...attrs}
            className={className}
            ref={this._makeRef}/>;
    }

    focus() {
        this.input.focus();
    }

    _makeRef(el) {
        this.input = el;
    }
}
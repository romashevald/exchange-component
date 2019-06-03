'use strict';

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

export default class Select extends PureComponent {
    static propTypes = {
        value: PropTypes.oneOfType([
            PropTypes.string, PropTypes.number
        ])

    };

    constructor(props, context) {
        super(props, context);
        this._select = null;
        this._makeRef = this._makeRef.bind(this);
    }

    get input() {
        return this._select;
    }

    render() {
        let {
            className
            , ...attrs
        } = this.props;


        return <select {...attrs} className={''} ref={this._makeRef}/>;
    }

    _makeRef(el) {
        this._select = el;
    }
}

Select.propTypes = {
    className: PropTypes.string
};



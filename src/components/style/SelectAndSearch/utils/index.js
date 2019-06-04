'use strict';

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Makes className from array of names
 * Filters not empty ones
 * @param {String[]|Object} names
 */
export const classnames = names => {
    if (Array.isArray(names)) {
        return names.filter(n => n && n.trim().length > 0).join(' ');
    } else if ('object' === typeof names) {
        const arr = [];
        for (let n in names) {
            if (n && names[n]) {
                arr.push(n);
            }
        }
        return classnames(arr);
    } else if ('string' === typeof names) {
        return names;
    }
};

export const clone = (obj) => {
    const copy = {};
    for (let attr in obj) {
        if (obj.hasOwnProperty(attr)) {
            copy[attr] = obj[attr];
        }
    }
    return copy;
};

export const isGroup = (option) => option && Array.isArray(option.options);

export const stringifyValue = value =>
    typeof value === 'string'
        ? value
        : (value !== null && JSON.stringify(value)) || '';

export const shouldShowValue = (state, props) => {
    const {inputValue, isPseudoFocused, isFocused} = state;
    const {onSelectResetsInput} = props;

    if (!inputValue) return true;

    if (!onSelectResetsInput) {
        return !(!isFocused && isPseudoFocused || isFocused && !isPseudoFocused);
    }

    return false;
};

export const shouldShowPlaceholder = (state, props, isOpen) => {
    // const {inputValue, isPseudoFocused, isFocused} = state;
    // const {onSelectResetsInput} = props;
    //
    // return !inputValue || !onSelectResetsInput && !isOpen && !isPseudoFocused && !isFocused;
};

export const pFunc = PropTypes.func;
export const pFuncRequired = PropTypes.func.isRequired;

export const pNumber = PropTypes.number;
export const pNumberRequired = PropTypes.number.isRequired;

export const pBool = PropTypes.bool;
export const pBoolRequired = PropTypes.bool.isRequired;

export const pArray = PropTypes.array;
export const pArrayRequired = PropTypes.array.isRequired;

export const pObject = PropTypes.object;
export const pObjectRequired = PropTypes.object.isRequired;

export const pString = PropTypes.string;
export const pStringRequired = PropTypes.string.isRequired;

export const pNumberOrString = PropTypes.oneOfType([PropTypes.string, PropTypes.number]);
export const pNumberOrStringRequired  = PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired;

export const stringOrNode = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
]);
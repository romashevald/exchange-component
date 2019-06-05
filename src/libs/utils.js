'use strict';

import React from 'react';

export const restrictDouble = v => {
    v = String(v);
    const pattern = /\D/g;
    const indexOfPoint = v.indexOf('.');
    if(indexOfPoint > -1) {// now point at start allowed
        const parts = [v.slice(0, indexOfPoint), v.slice(indexOfPoint + 1)];
        return parts.map(p => p.replace(pattern, '')).join('.');
    } else {
        return v.replace(pattern, '');
    }
};

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

'use strict';

import React from 'react';

import {ToastContainer as ToastifyContainer, toast as toastifyToast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const toast = (content, options = {}) => toastifyToast(content, {
    hideProgressBar: true
    , ...options
});

export const toastError = (content, options = {}) => toast(content, {
    type: toastifyToast.TYPE.ERROR
    , className: 'toast toast-error'
    , ...options
});

export const toastWarning = (content, options = {}) => toast(content, {
    type: toastifyToast.TYPE.WARNING
    , className: 'toast toast-warning'
    , ...options
});

export const toastSuccess = (content, options = {}) => toast(content, {
    type: toastifyToast.TYPE.SUCCESS
    , className: 'toast toast-success'
    , ...options
});

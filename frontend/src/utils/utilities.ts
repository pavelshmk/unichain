import { AxiosError } from "axios";
import { toast } from "react-toastify";
import numbro from "numbro";
import { BigNumber } from 'ethers';
import BN from 'bignumber.js';
import React from "react";

numbro.registerLanguage({
    ...numbro.languageData('en-US'),
    languageTag: 'cs',
    delimiters: {
        thousands: ' ',
        decimal: '.',
    },
    defaults: { thousandSeparated: true },
}, true)


export function processRequestError(e: AxiosError) {
    const data = e.response?.data;
    if (!data) {
        toast.error('An error has occurred while performing a request. Please check your internet connection and try later.')
        return;
    }

    if (data?.detail) {
        toast.error(data.detail);
    }

    if (data?.errors) {
        data.errors.forEach((err: { message: string }) => toast.error(err.message));
    } else if (data?.message) {
        toast.error(data.message);
    }

    if (data?.non_field_errors) {
        data.non_field_errors.forEach((err: string) => toast.error(err));
    }

    if (data.length) {
        data.forEach((err) => toast.error(err));
    } else if (typeof data === 'object')
        Object.keys(data).map(key => (data[key].length && data[key].map) && data[key].map((msg: string) => toast.error(msg)));
}

export function fsp(x, trimMantissa = true, mantissa = 2) {
    if (typeof x === 'undefined') return '...';
    x = parseFloat(x) || 0;
    return numbro(x).format({ trimMantissa, mantissa });
}

export function toBNJS(val: BigNumber | number | string) {
    return new BN(val.toString());
}

export function trimAddress(address: string) {
    const len = address.length;
    return address.slice(0, 6) + '*****' + address.slice(len - 4, len);
}

export function pd(e: React.SyntheticEvent, ...rest: any[]) {
    e.preventDefault();
}
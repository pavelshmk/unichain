import React from 'react';

interface IXFarmExchangeInputProps {
    value: string;
    onChange: (val: string) => any;
    max?: number;
    currency: string;
    give?: boolean;
}

interface IXFarmExchangeInputState {
}

export class XFarmExchangeInput extends React.Component<IXFarmExchangeInputProps, IXFarmExchangeInputState> {
    render() {
        const { value, onChange, max, currency, give } = this.props;

        return (
            <div className="input">
                <div>
                    <label>{give ? 'You give' : 'You get'}</label>
                    <input
                        type="number"
                        placeholder="0.00"
                        min={0}
                        max={max}
                        step={.01}
                        value={value}
                        onChange={e => onChange(e.target.value)}
                    />
                </div>
                <strong>{currency}</strong>
            </div>
        )
    }
}
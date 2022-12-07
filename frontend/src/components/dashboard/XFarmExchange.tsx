import React from 'react';
import { observer } from "mobx-react";
import { resolve } from "inversify-react";
import { AuthStore } from "../../stores";
import { toast } from "react-toastify";
import { processRequestError } from "../../utils/utilities";
import { XFarmExchangeInput } from "./XFarmExchangeInput";

interface IXFarmExchangeProps {
}

interface IXFarmExchangeState {
    xfarmAmount: string;
    usdtAmount: string;
    loading: boolean;
}

@observer
export class XFarmExchange extends React.Component<IXFarmExchangeProps, IXFarmExchangeState> {
    @resolve(AuthStore)
    declare private readonly authStore: AuthStore;

    state: IXFarmExchangeState = {
        xfarmAmount: '',
        usdtAmount: '',
        loading: false,
    }

    onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        this.setState({ loading: true });
        try {
            await this.authStore.xfarmExchange(this.state.xfarmAmount);
            toast.success('The exchange was completed successfully');
            this.setState({ xfarmAmount: '', usdtAmount: '' });
        } catch (e) {
            processRequestError(e);
        } finally {
            this.setState({ loading: false });
        }
    }

    render() {
        const { xfarmAmount, usdtAmount, loading } = this.state;

        const xfarmPrice = this.authStore.profile?.settings.xfarm_price;

        return (
            <div className="exchange">
                <div className="title-exchange">
                    <i className="icon-exchange"/>
                    <h4>Exchange</h4>
                </div>
                <p>Please change a few coins to invest and start earning</p>
                <span className="course">1 XFarming = ${xfarmPrice?.toFixed(3)}</span>
                <form onSubmit={this.onSubmit}>
                    <div className="inputs-content">
                        <div className="inputs">
                            <XFarmExchangeInput
                                value={xfarmAmount}
                                onChange={xfarmAmount => this.setState({
                                    xfarmAmount,
                                    usdtAmount: (parseFloat(xfarmAmount) * xfarmPrice).toFixed(2),
                                })}
                                // max={this.authStore.profile?.xfarm_balance}
                                currency='XFARM'
                                give
                            />
                            <XFarmExchangeInput
                                value={usdtAmount}
                                onChange={usdtAmount => this.setState({
                                    xfarmAmount: (parseFloat(usdtAmount) / xfarmPrice).toFixed(2),
                                    usdtAmount,
                                })}
                                currency='USDT'
                            />
                        </div>
                        <span className="change"><i className="icon-exchange2"/></span>
                    </div>
                    <button type='submit' disabled={loading || !parseFloat(xfarmAmount) || !parseFloat(usdtAmount)}><i className="icon-exchange"/><span>Exchange</span></button>
                </form>
            </div>
        )
    }
}
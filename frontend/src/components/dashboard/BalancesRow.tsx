import React from 'react';
import { pd } from "../../utils/utilities";
import { Modals, ModalStore } from "../../stores/ModalStore";
import { observer } from "mobx-react";
import { resolve } from "inversify-react";
import { AuthStore, WalletStore } from "../../stores";

interface IBalancesRowProps {
}

interface IBalancesRowState {
}

@observer
export class BalancesRow extends React.Component<IBalancesRowProps, IBalancesRowState> {
    @resolve(AuthStore)
    declare private readonly authStore: AuthStore;
    @resolve(ModalStore)
    declare private readonly modalStore: ModalStore;
    @resolve(WalletStore)
    declare private readonly walletStore: WalletStore;

    render() {
        const profile = this.authStore.profile;
        const settings = profile?.settings;

        return (
                <div className="wallets">
                    <div className="coin">
                        <div className="wallet-title">
                            <img src={require('../../images/coin-img.svg')} alt=""/>
                            <h3>Unichain coin</h3>
                        </div>
                        <div className="balance">
                            <span>Balance</span>
                            <h2>
                                {this.walletStore.unichainBalance?.toFixed(2)}
                                <i>1 UNCH = ${this.authStore.profile?.settings.unichain_price}</i>
                            </h2>
                            <strong>${this.walletStore.unichainBalance?.times(settings?.unichain_price).toFixed(2)}</strong>
                        </div>
                        <ul>
                            <li>
                                <a href="#" onClick={e => pd(e, this.modalStore.showModal(Modals.ExchangeDeposit))}>
                                    <i className="icon-plus"/>Refill
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="token">
                        <div className="wallet-title">
                            <img src={require('../../images/token-img.svg')} alt=""/>
                            <h3>XFarming token</h3>
                        </div>
                        <div className="balance">
                            <span>Balance</span>
                            <h2>
                                {profile?.xfarm_balance.toFixed(2)}
                            </h2>
                            <strong>${(profile?.xfarm_balance * settings?.xfarm_price).toFixed(2)}</strong>
                        </div>
                        <ul>
                            <li>1 XFARM = ${this.authStore.profile?.settings.xfarm_price.toFixed(3)}</li>
                        </ul>
                    </div>
                    <div className="usdt">
                        <div className="wallet-title">
                            <img src={require('../../images/usdt-img.svg')} alt=""/>
                            <h3>USDT</h3>
                        </div>
                        <div className="balance">
                            <span>Balance</span>
                            <h2>{profile?.usdt_balance.toFixed(2)}</h2>
                            <strong>${profile?.usdt_balance.toFixed(2)}</strong>
                        </div>
                        <ul>
                            <li>
                                <a href="#" onClick={e => pd(e, this.modalStore.showModal(Modals.USDTDeposit))}>
                                    <i className="icon-plus"/>Refill
                                </a>
                            </li>
                            <li>
                                <a href="#" onClick={e => pd(e, this.modalStore.showModal(Modals.USDTWithdraw))}>
                                    <i className="icon-top-arrow"/>Withdraw
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
        )
    }
}
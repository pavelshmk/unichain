import React from 'react';
import { Modal } from "../components/Modal";
import { Modals, ModalStore } from "../stores/ModalStore";
import { observer } from "mobx-react";
import { resolve } from "inversify-react";
import { AuthStore, WalletStore } from "../stores";
import { processRequestError } from "../utils/utilities";
import { toast } from "react-toastify";
import classNames from "classnames";

interface IUSDTWithdrawModalProps {
}

interface IUSDTWithdrawModalState {
    amount: string;
    address: string;
    erc20: boolean;
    loading: boolean;
}

@observer
export class USDTWithdrawModal extends React.Component<IUSDTWithdrawModalProps, IUSDTWithdrawModalState> {
    @resolve(AuthStore)
    declare private readonly authStore: AuthStore;
    @resolve(ModalStore)
    declare private readonly modalStore: ModalStore;
    @resolve(WalletStore)
    declare private readonly walletStore: WalletStore;

    state: IUSDTWithdrawModalState = {
        amount: '',
        address: '',
        erc20: true,
        loading: false,
    }

    onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        this.setState({ loading: true });
        try {
            await this.authStore.usdtWithdraw(this.state.amount, this.state.address, this.state.erc20);
            this.modalStore.hideModals();
            toast.success('The withdrawal request was created')
        } catch (e) {
            processRequestError(e);
        } finally {
            this.setState({ loading: false });
        }
    }

    render() {
        const { amount, address, erc20, loading } = this.state;

        const commission = this.authStore.profile?.settings[erc20 ? 'erc20_withdraw_commission' : 'trc20_withdraw_commission'] || 0;
        const willGet = Math.max(0, (parseFloat(amount) || 0) - commission);

        return (
            <Modal modalClassName='popup-withdraw' modalKey={Modals.USDTWithdraw}>
                <div className="title">
                    <h4><i className="icon-top-arrow"/>Withdrawal</h4>
                </div>
                <div className="min-sum"><i className="icon-info2"/> Minimum withdraw amount: ${erc20 ? 50 : 25}</div>
                <div className="withdraw-content">
                    <p>Enter the number of coins and specify the wallet address for withdrawal</p>
                    <div className="commission">
                        <p>Select withdraw commission <i className="icon-info"/></p>
                        <ul className="commission-link">
                            <li className={classNames({ active: erc20 })}>
                                <a href="#" onClick={() => this.setState({ erc20: true })}>ERC<strong>20</strong></a>
                            </li>
                            <li className={classNames({ active: !erc20 })}>
                                <a href="#" onClick={() => this.setState({ erc20: false })}>TRC<strong>20</strong></a>
                            </li>
                        </ul>
                    </div>
                    <form onSubmit={this.onSubmit}>
                        <div className="inputs">
                            <div className="input">
                                <div>
                                    <label>Amount of coins</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        min={0}
                                        max={this.authStore.profile?.usdt_balance}
                                        step={.01}
                                        value={amount}
                                        onChange={e => this.setState({ amount: e.target.value })}
                                    />
                                </div>
                                <strong>USDT</strong>
                            </div>
                            <p>Commission: <strong>{commission.toFixed(2)}</strong> USDT</p>
                            <p>Will get: <strong>{willGet.toFixed(2)}</strong> USDT</p>
                            <div className="input">
                                <div>
                                    <label>Wallet address</label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={e => this.setState({ address: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <button type='submit' disabled={!address || !parseFloat(amount) || loading}><i className="icon-top-arrow"/><span>Withdraw</span></button>
                    </form>
                </div>
            </Modal>
        )
    }
}
import React from 'react';
import { Modal } from "../components/Modal";
import { Modals, ModalStore } from "../stores/ModalStore";
import { observer } from "mobx-react";
import { resolve } from "inversify-react";
import { AuthStore, WalletStore } from "../stores";
import { processRequestError } from "../utils/utilities";
import { toast } from "react-toastify";

interface IStakeWithdrawModalProps {
}

interface IStakeWithdrawModalState {
    amount: string;
    address: string;
    loading: boolean;
}

@observer
export class StakeWithdrawModal extends React.Component<IStakeWithdrawModalProps, IStakeWithdrawModalState> {
    @resolve(AuthStore)
    declare private readonly authStore: AuthStore;
    @resolve(ModalStore)
    declare private readonly modalStore: ModalStore;
    @resolve(WalletStore)
    declare private readonly walletStore: WalletStore;

    state: IStakeWithdrawModalState = {
        amount: '',
        address: '',
        loading: false,
    }

    onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        this.setState({ loading: true });
        try {
            await this.authStore.stakeWithdraw(this.state.amount, this.state.address);
            this.modalStore.hideModals();
            toast.success('The withdrawal request was created')
        } catch (e) {
            processRequestError(e);
        } finally {
            this.setState({ loading: false });
        }
    }

    render() {
        const { amount, address, loading } = this.state;

        return (
            <Modal modalClassName='popup-withdraw' modalKey={Modals.StakeWithdraw}>
                <div className="title">
                    <h4><i className="icon-top-arrow"/>Withdrawal</h4>
                </div>
                <div className="withdraw-content">
                    <p>Enter the number of coins and specify the wallet address for withdrawal</p>
                    <p>Available for withdraw: {this.authStore.profile?.stake_bonus_balance.toFixed(6)}</p>
                    <form onSubmit={this.onSubmit}>
                        <div className="inputs">
                            <div className="input">
                                <div>
                                    <label>Amount of coins</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        min={0}
                                        max={this.authStore.profile?.stake_bonus_balance}
                                        step={.000001}
                                        value={amount}
                                        onChange={e => this.setState({ amount: e.target.value })}
                                    />
                                </div>
                                <strong>UNCH</strong>
                            </div>
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
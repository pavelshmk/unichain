import React from 'react';
import { pd, processRequestError, toBNJS } from "../../utils/utilities";
import { Modals, ModalStore } from "../../stores/ModalStore";
import { resolve } from "inversify-react";
import { AuthStore, WalletStore } from "../../stores";
import { observer } from "mobx-react";
import classNames from "classnames";
import { toast } from "react-toastify";

interface IStakingProps {
}

interface IStakingState {
    amount: string;
    length: string;
    loading: boolean;
}

@observer
export class Staking extends React.Component<IStakingProps, IStakingState> {
    @resolve(WalletStore)
    declare protected readonly walletStore: WalletStore;
    @resolve(ModalStore)
    declare private readonly modalStore: ModalStore;
    @resolve(AuthStore)
    declare private readonly authStore: AuthStore;

    state: IStakingState = {
        amount: '',
        length: '30',
        loading: false,
    }

    onStake = async (e: React.FormEvent) => {
        pd(e);
        this.setState({ loading: true });
        try {
            await this.authStore.prepareStake(parseInt(this.state.length));
            const unichainContract = this.walletStore.unichainContract;
            const tx = await unichainContract.transfer(
                this.authStore.profile?.settings.stake_deposit_address,
                toBNJS(this.state.amount).times(toBNJS(10).pow(await unichainContract.decimals())).integerValue().toString()
            );
            toast.success('Stake will be created once the transaction is confirmed');
            await tx.wait();
            toast.success('Staking transaction is confirmed, please wait a few seconds');
        } catch (e) {
            console.log(e);
            processRequestError(e);
        } finally {
            this.setState({ loading: false });
        }
    }

    render() {
        const { amount, length, loading } = this.state;

        const balance = this.walletStore.unichainBalance;

        return (
            <div className="staking">
                <div className="staking-title">
                    <i className="icon-staking"/>
                    <h4>Staking</h4>
                    <span className="info"><i className="icon-info"/></span>
                </div>
                <div className="staking-content">
                    <div className="balance">
                        <div className="balance-item">
                            <span>Balance</span>
                            <strong>{balance?.toFixed(6)} UNCH</strong>
                        </div>
                        <div className="balance-item">
                            <span>Lack of coins?</span>
                            <a href="#" onClick={e => pd(e, this.modalStore.showModal(Modals.ExchangeDeposit))}><i className="icon-top-arrow"/>Buy</a>
                        </div>
                    </div>
                    <form onSubmit={this.onStake}>
                        <div className="items">
                            <div className="item">
                                <label>Amount of coins</label>
                                <div className="input">
                                    <strong onClick={() => this.setState({ amount: balance?.toFixed(6)})}>Stake all</strong>
                                    <input
                                        type="number"
                                        step={.000001}
                                        min={0}
                                        max={balance?.toFixed(6)}
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={e => this.setState({ amount: e.target.value })}
                                        disabled={loading}
                                    />
                                    <span>UNCH</span>
                                </div>
                            </div>
                            <div className="item">
                                <label>Select or enter a staking period</label>
                                <div className="input">
                                    <input
                                        type="number"
                                        step={1}
                                        value={length}
                                        onChange={e => this.setState({ length: e.target.value })}
                                        disabled={loading}
                                    />
                                    <span>Days</span>
                                </div>
                                <ul className="days">
                                    {['30', '60', '90', '120', '150', '365', '730', '1095'].map(val => (
                                        <li key={val} className={classNames({ active: length === val })} onClick={() => !loading && this.setState({ length: val })}>{val}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <span className="profitability">
                            Profitability 80-150%{' '}
                            <span className="info">
                                <i className="icon-info"/>
                                <span className="info-window">
                                    <strong>Profitability</strong>
                                    When locking coins for 365 days in staking, you get an additional bonus of 50 to 90% in UNCH coins
                                </span>
                            </span>
                        </span>
                        <button type='submit' disabled={loading}><i className="icon-staking"/>Stake</button>
                    </form>
                </div>
            </div>
        )
    }
}
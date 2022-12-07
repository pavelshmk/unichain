import React from 'react';
import classNames from "classnames";
import { FarmingTransactionConfirmModal } from "../../modals/FarmingTransactionConfirmModal";
import { observer } from "mobx-react";
import { resolve } from "inversify-react";
import { AuthStore, ModalStore } from "../../stores";
import { Modals } from "../../stores/ModalStore";
import { pd, processRequestError } from "../../utils/utilities";
import { toast } from "react-toastify";

interface IFarmingTileProps {
    icon: string;
    title: string;
    coinId: 'usdt' | 'curve' | 'sushi' | 'farm';
    // symbol: string;
    prematureWithdrawTime: string;
    prematureWithdrawCommission: string;
    periods: { days: string, present?: { title: string, text: string } }[];
    riskLine: string;
    disabled?: boolean;
}

interface IFarmingTileState {
    amount: string;
    days: string;
    showConfirmModal: boolean;
    loading: boolean;
}

@observer
export class FarmingTile extends React.Component<IFarmingTileProps, IFarmingTileState> {
    @resolve(AuthStore)
    declare protected readonly authStore: AuthStore;
    @resolve(ModalStore)
    declare protected readonly modalStore: ModalStore;

    state: IFarmingTileState = {
        amount: '',
        days: '30',
        showConfirmModal: false,
        loading: false,
    }

    componentDidMount() {
        this.setState({ days: this.props.periods[0].days });
    }

    onConfirm = async () => {
        this.setState({ loading: true, showConfirmModal: false });
        try {
            await this.authStore.farmingDeposit(this.state.days, this.state.amount, this.props.coinId);
            toast.success('Farming deposit successful');
        } catch (e) {
            processRequestError(e);
        } finally {
            this.setState({ loading: false });
        }
    }

    render() {
        const { amount, days, showConfirmModal, loading } = this.state;
        const { icon, title, /*symbol,*/ prematureWithdrawTime, prematureWithdrawCommission, periods, riskLine, disabled } = this.props;

        return (
            <div className={`staking ${disabled && 'disabled'}`}>
                <div className="staking-title">
                    <img src={icon} alt="" />
                    <h4>{title}</h4>
                    <span className="info">
                        <i className="icon-info"/>
                        <span className="info-window">
                            <strong>Commission</strong>
                            Withdraw funds earlier {prematureWithdrawTime} months - commission {prematureWithdrawCommission}%
                        </span>
                    </span>
                </div>
                <div className="staking-content">
                    <div className="balance">
                        <div className="balance-item">
                            <span>Balance</span>
                            <strong>{this.authStore.profile?.usdt_balance} USDT</strong>
                        </div>
                        <div className="balance-item">
                            <span>Not enough coins?</span>
                            <a href='#' onClick={e => pd(e, this.modalStore.showModal(Modals.USDTDeposit))}><i className="icon-top-arrow"/>Buy</a>
                        </div>
                    </div>
                    <form>
                        <div className="items">
                            <div className="item">
                                <label>Quantity of coins</label>
                                <div className="input">
                                    <strong onClick={() => this.setState({ amount: this.authStore.profile?.usdt_balance.toString() })}>Farm all</strong>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        step={.01}
                                        value={amount}
                                        onChange={e => this.setState({ amount: e.target.value })}
                                    />
                                    <span>USDT</span>
                                </div>
                            </div>
                            <div className="item">
                                <label>Select or enter a farming period</label>
                                <div className="input">
                                    <input
                                        type="number"
                                        step={1}
                                        value={days}
                                        onChange={e => this.setState({ days: e.target.value })}
                                    />
                                    <span>Days</span>
                                </div>
                                <ul className="days">
                                    {periods.map(p => (
                                        <li className={classNames({ present: !!p.present, active: days === p.days })} onClick={() => this.setState({ days: p.days })}>
                                            {p.days}{' '}
                                            {p.present && (
                                                <>
                                                    <i className="icon-present"/>
                                                    <div className="present-info">
                                                        <strong>{p.present.title}</strong>
                                                        <p>{p.present.text}</p>
                                                    </div>
                                                </>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <span className="profitability">{riskLine}</span>
                        <button type='button' className="farm" disabled={loading} onClick={() => this.setState({ showConfirmModal: true })}><i className="icon-staking"/>Farm</button>
                    </form>
                </div>
                <FarmingTransactionConfirmModal show={showConfirmModal} onHide={() => this.setState({ showConfirmModal: false })} onConfirm={this.onConfirm} />
            </div>
        )
    }
}
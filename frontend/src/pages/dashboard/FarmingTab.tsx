import React from 'react';
import { FarmingTile } from "../../components/farming/FarmingTile";
import { observer } from "mobx-react";
import { resolve } from "inversify-react";
import { AuthStore } from "../../stores";
import { FarmingWithdrawConfirmModal } from "../../modals/FarmingWithdrawConfirmModal";
import { pd, processRequestError } from "../../utils/utilities";
import { toast } from "react-toastify";

interface IFarmingTabProps {
}

interface IFarmingTabState {
    withdrawId?: number;
    showWithdraw: boolean;
    loading: boolean;
}

const COINS = {
    usdt: <><img src={require('../../images/usdt-img.svg')} alt="" /> <i>USDT</i></>,
    curve: <><img src={require('../../images/curve-img.svg')} alt="" /> <i>СRV</i></>,
    sushi: <><img src={require('../../images/sushi-img.svg')} alt="" /> <i>SUSHI</i></>,
    farm: <><img src={require('../../images/HarvestFinance_32.webp')} alt="" /> <i>FARM</i></>,
}

@observer
export class FarmingTab extends React.Component<IFarmingTabProps, IFarmingTabState> {
    @resolve(AuthStore)
    declare protected readonly authStore: AuthStore;

    state: IFarmingTabState = {
        showWithdraw: false,
        loading: false,
    }

    onWithdraw = async () => {
        this.setState({ loading: true, showWithdraw: false });
        try {
            await this.authStore.farmingWithdraw(this.state.withdrawId);
            toast.success('Farming deposit was withdrawn');
        } catch (e) {
            processRequestError(e);
        } finally {
            this.setState({ loading: false });
        }
    }

    render() {
        const { showWithdraw, loading } = this.state;

        return (
            <div className="tabs-item farming active">
                <div className="finance">
                    <div className="finance-content">
                        <FarmingTile
                            icon={require('../../images/usdt-img2.svg')}
                            title='USDT'
                            coinId='usdt'
                            // symbol='USDT'
                            prematureWithdrawTime='2'
                            prematureWithdrawCommission='15'
                            periods={[
                                { days: '60' },
                                { days: '90' },
                                { days: '120' },
                                { days: '150', present: { title: 'Profit +10%', text: 'When farming for 150 days or more, the earnings will be 10% more' } },
                                { days: '250' },
                                { days: '300', present: { title: 'Profit 15% - 30% + Token X Bonus', text: 'When farming from 300 days or more, the earnings will be 15% - 30% more' } },
                                { days: '730' },
                                { days: '1095' },
                            ]}
                            riskLine='0.2-0.65% per day - Risk 0.001%'
                        />
                        <FarmingTile
                            icon={require('../../images/curve-img.svg')}
                            title='Curve DAO Token'
                            coinId='curve'
                            // symbol='CRV'
                            prematureWithdrawTime='2.5'
                            prematureWithdrawCommission='20'
                            periods={[
                                { days: '75' },
                                { days: '90' },
                                { days: '120' },
                                { days: '175' },
                                { days: '200', present: { title: 'Profit + 15%', text: 'When farming for 200 days or more, the earnings will be 15% more' } },
                                { days: '350', present: { title: 'Profit + 25% + Token X Bonus', text: 'When farming from 350 days or more, the earnings will be 25% more + Token X Bonus' } },
                                { days: '730' },
                                { days: '1095' },
                            ]}
                            riskLine='0.4-0.9% per day - Risk 10%'
                            disabled
                        />
                        <FarmingTile
                            icon={require('../../images/sushi-img.svg')}
                            title='SUSHI'
                            coinId='sushi'
                            // symbol='Sushi'
                            prematureWithdrawTime='2'
                            prematureWithdrawCommission='30'
                            periods={[
                                { days: '60' },
                                { days: '90' },
                                { days: '120' },
                                { days: '125', present: { title: 'Profit +25% profit + Token X Bonus', text: 'When farming from 125 days or more, the earnings will be 25% more + Token X Bonus' } },
                                { days: '200' },
                                { days: '250', present: { title: 'Profit +50% profit + Token X Bonus', text: 'When farming for 250 days or more, the earnings will be 50% more + Token X Bonus' } },
                                { days: '730' },
                                { days: '1095' },
                            ]}
                            riskLine='0.5-1% per day - Risk 30%'
                            disabled
                        />
                        <FarmingTile
                            icon={require('../../images/HarvestFinance_32.webp')}
                            title='FARM'
                            coinId='farm'
                            // symbol='Farm'
                            prematureWithdrawTime='2.5'
                            prematureWithdrawCommission='40'
                            periods={[
                                { days: '75' },
                                { days: '90' },
                                { days: '120', present: { title: 'Profit +40%', text: 'When farming from 120 days or more, the earnings will be 40% more' } },
                                { days: '170' },
                                { days: '200', present: { title: 'Profit + 50% + Token X Bonus', text: 'When farming for 200 days or more, the earnings will be 50% more + Token X Bonus' } },
                                { days: '350' },
                                { days: '730' },
                                { days: '1095' },
                            ]}
                            riskLine='0.5-1.3% per day - Risk 45%'
                            disabled
                        />
                    </div>
                    <div className="history-investing">
                        <div className="investing-title">
                            <i className="icon-deposits2"/>
                            <h4>Active Farm</h4>
                        </div>
                        <div className="history-content">
                            <div className="history-title">
                                <ul>
                                    <li>#</li>
                                    <li>Coin</li>
                                    <li>Total balance</li>
                                    <li>Period</li>
                                    <li>Per day</li>
                                    <li>Profit</li>
                                    <li/>
                                </ul>
                            </div>
                            <div className="history-items">
                                {this.authStore.profile?.farming_log.map((l, i) => (
                                    <div className="history-item" key={l.pk}>
                                        <div className="data">{i + 1}</div>
                                        <div className="coins">{COINS[l.coin]}</div>
                                        <div className="balance">{l.amount.toFixed(2)}</div>
                                        <div className="period">
                                            <strong>
                                                {l.days_passed}<span>\{l.length} days
                                                <i>{l.extra_percent && <>+{l.extra_percent * 100}%<br /></>}{l.extra_tokenx > 0 && '+Token X Bonus'}</i></span>
                                            </strong>
                                        </div>
                                        <div className="per-day">{(l.daily_percent * 100).toFixed(4)}%</div>
                                        <div className="profit">{(l.profit_percent * 100).toFixed(4)}%</div>
                                        <div className="withdraw">
                                            {l.is_destroyed && <span style={{ color: 'red', fontStyle: 'italic' }}>Destroyed</span>}
                                            {!l.is_destroyed && (
                                                <a href='#' className={loading && 'disabled'} onClick={e => pd(e, this.setState({ showWithdraw: true, withdrawId: l.pk }))}><i className="icon-top-arrow"/>Withdraw</a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <FarmingWithdrawConfirmModal show={showWithdraw} onHide={() => this.setState({ showWithdraw: false })} onConfirm={this.onWithdraw} />
            </div>
        )
    }
}
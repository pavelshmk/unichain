import React from 'react';
import _ from "lodash";
import { observer } from "mobx-react";
import { resolve } from "inversify-react";
import { AuthStore } from "../../stores";

interface IReferralProps {
}

interface IReferralState {
    openedLevels: number[];
}

const user = {
    name: 'valerchik228',
    address: 'sd2f****fg43',
    profit: 215.56459,
};

@observer
export class Referral extends React.Component<IReferralProps, IReferralState> {
    @resolve(AuthStore)
    declare private readonly authStore: AuthStore;

    state: IReferralState = {
        openedLevels: [],
    }

    toggleLevelOpened = (lvl: number) => {
        if (this.state.openedLevels.includes(lvl)) {
            this.setState({ openedLevels: this.state.openedLevels.filter(o => o !== lvl) });
        } else {
            this.setState({ openedLevels: [...this.state.openedLevels, lvl] });
        }
    }

    render() {
        const { openedLevels } = this.state;

        return (
            <div className="referral-program">
                <div className="referral-title">
                    <h4><i className="icon-referral"/>Referral program</h4>
                    {this.authStore.profile?.referrer && (
                        <div className="name">
                            <img src={require('../../images/referral-avatar.png')} alt=""/>
                            <div>
                                <span>I was invited by</span>
                                <p>{this.authStore.profile.referrer}</p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="referral-content">
                    <div className="program-title">
                        <ul>
                            <li>lvl</li>
                            <li>Participants</li>
                            <li>Profitability</li>
                            <li>Reward</li>
                        </ul>
                    </div>
                    <div className="program-content">
                        {this.authStore.profile?.referrals.map(lvl => (
                            <div className={`program-item ${openedLevels.includes(lvl.level) && 'active'}`} key={lvl.level}>
                                <div className="item" onClick={() => this.toggleLevelOpened(lvl.level)}>
                                    <div className="lvl">{lvl.level}</div>
                                    <div className="participants">{lvl.referrals.length}</div>
                                    <div className="profitability">{(parseFloat(lvl.profit) * 100).toPrecision(1)}%</div>
                                    <div className="reward">
                                        <span>Reward</span>
                                        {(() => {
                                            const sum = _.sum(lvl.referrals.map(r => r.total_bought)) * lvl.profit;
                                            // if (sum === 0)
                                            //     return '0';
                                            return (
                                                <>
                                                    <strong>{sum.toFixed(2)}</strong> <i>XFARM</i>
                                                </>
                                            )
                                        })()}
                                        {(() => {
                                            const sum = _.sum(lvl.referrals.map(r => r.total_farming)) * lvl.profit;
                                            // if (sum === 0)
                                            //     return '0';
                                            return (
                                                <>
                                                    <strong>{sum.toFixed(2)}</strong> <i>USDT</i>
                                                </>
                                            )
                                        })()}
                                    </div>
                                    <span className="open-drop"/>
                                </div>
                                <div className="drop">
                                    <div className="drop-content">
                                        <ul>
                                            <li>#</li>
                                            <li>Nickname</li>
                                            <li>Wallet</li>
                                            <li>Coins</li>
                                        </ul>
                                        {lvl.referrals.map((r, i) => (
                                            <div className="drop-items" key={i}>
                                                <div className="drop-item">
                                                    <i>#</i>
                                                    <span>{i + 1}</span>
                                                </div>
                                                <div className="drop-item">
                                                    <i>Nickname</i>
                                                    <strong>{r.name}</strong>
                                                </div>
                                                <div className="drop-item">
                                                    <i>Wallet</i>
                                                    {r.address}
                                                </div>
                                                <div className="drop-item">
                                                    <i>Coins</i>
                                                    <strong>{r.total_bought}</strong> UNCH
                                                    &nbsp;&nbsp;
                                                    <strong>{r.total_farming}</strong> USDT
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }
}
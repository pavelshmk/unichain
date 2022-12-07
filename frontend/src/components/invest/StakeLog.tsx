import React from 'react';
import { observer } from "mobx-react";
import { resolve } from "inversify-react";
import { AuthStore } from "../../stores";
import { DateTime } from "luxon";

interface IStakeLogProps {
}

interface IStakeLogState {
}

@observer
export class StakeLog extends React.Component<IStakeLogProps, IStakeLogState> {
    @resolve(AuthStore)
    declare private readonly authStore: AuthStore;

    render() {
        return (
            <div className="deposits">
                <div className="deposits-title">
                    <i className="icon-deposits"/>
                    <h4>My deposits</h4>
                </div>
                <div className="deposits-content">
                    <div className="deposits-cap">
                        <ul>
                            <li>Bet</li>
                            <li>Period</li>
                            <li>Left</li>
                            <li>Date</li>
                            <li>Earned</li>
                        </ul>
                    </div>
                    <div className="deposits-items">
                        {this.authStore.profile?.stakes.map(s => (
                            <div className="deposits-item">
                                <div className="rate">{s.amount.toFixed(6)}</div>
                                <div className="period">{s.length} days</div>
                                <div className="left">{Math.max(Math.round(s.started.plus({ days: s.length }).diffNow('days').days), 0)} days</div>
                                <div className="data">{s.started.toLocaleString(DateTime.DATE_SHORT)}</div>
                                <div className="profit">{(s.profit / s.amount * 100).toFixed(2)}%</div>
                                <div className="open"><i className="icon-additional"/></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }
}
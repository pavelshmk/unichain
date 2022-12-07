import React from 'react';
import { observer } from "mobx-react";
import { resolve } from "inversify-react";
import { AuthStore } from "../../stores";
import { DateTime } from "luxon";

interface IInvestHistoryProps {
}

interface IInvestHistoryState {
}

@observer
export class InvestHistory extends React.Component<IInvestHistoryProps, IInvestHistoryState> {
    @resolve(AuthStore)
    declare private readonly authStore: AuthStore;

    render() {
        return (
            <div className="history-investing">
                <div className="investing-title">
                    <i className="icon-history"/>
                    <h4>Reward History</h4>
                </div>
                <div className="history-content">
                    <div className="history-title">
                        <ul>
                            <li>Date</li>
                            <li>Amount of coins</li>
                            <li>Accruals per day</li>
                        </ul>
                    </div>
                    <div className="history-items">
                        {this.authStore.profile?.invest_log.map(l => (
                            <div className="history-item" key={l.date.toString()}>
                                <div className="data"><span>Date</span>{l.date.toLocaleString(DateTime.DATE_SHORT)}</div>
                                <div className="number"><strong>{l.paid.toFixed(6)}</strong> <i>UNCH</i></div>
                                <div className="accruals"><span>Per Day</span> {(l.paid / l.total_amount * 100).toFixed(2)}%</div>
                                <div className="number-mob"><span>Amount of coinт</span> <strong>{l.paid.toFixed(6)}</strong>
                                    <i>UNCH</i></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }
}
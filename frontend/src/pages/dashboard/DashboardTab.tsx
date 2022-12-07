import React from 'react';
import { observer } from "mobx-react";
import { resolve } from "inversify-react";
import { AuthStore, ModalStore, WalletStore } from "../../stores";
import { BalancesRow } from "../../components/dashboard/BalancesRow";
import { XFarmExchange } from "../../components/dashboard/XFarmExchange";
import { Referral } from "../../components/dashboard/Referral";

interface IDashboardTabProps {
}

interface IDashboardTabState {
}

@observer
export class DashboardTab extends React.Component<IDashboardTabProps, IDashboardTabState> {
    @resolve(AuthStore)
    declare private readonly authStore: AuthStore;
    @resolve(ModalStore)
    declare private readonly modalStore: ModalStore;
    @resolve(WalletStore)
    declare private readonly walletStore: WalletStore;

    state: IDashboardTabState = {
    }

    render() {
        return (
            <div className="tabs-item dashboard">
                <BalancesRow />
                <div className="referral-exchange">
                    <XFarmExchange />
                    <Referral />
                </div>
            </div>
        )
    }
}
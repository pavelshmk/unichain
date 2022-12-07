import React from 'react';
import { observer } from "mobx-react";
import { resolve } from "inversify-react";
import { AuthStore, ModalStore, WalletStore } from "../../stores";
import { Staking } from "../../components/invest/Staking";
import { StakeLog } from "../../components/invest/StakeLog";
import { StakingBalance } from "../../components/invest/StakingBalance";
import { InvestHistory } from "../../components/invest/InvestHistory";

interface IInvestTabProps {
}

interface IInvestTabState {
}

@observer
export class InvestTab extends React.Component<IInvestTabProps, IInvestTabState> {
    @resolve(WalletStore)
    declare protected readonly walletStore: WalletStore;
    @resolve(ModalStore)
    declare private readonly modalStore: ModalStore;
    @resolve(AuthStore)
    declare private readonly authStore: AuthStore;

    render() {
        return (
            <div className="tabs-item investment">
                <div className="finance">
                    <Staking />
                    <StakingBalance />
                    <StakeLog />
                </div>
                <InvestHistory />
            </div>
        )
    }
}
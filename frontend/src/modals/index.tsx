import React from 'react';
import { ExchangeDepositModal } from "./ExchangeDepositModal";
import { USDTWithdrawModal } from "./USDTWithdrawModal";
import { USDTDepositModal } from "./USDTDepositModal";
import { StakeWithdrawModal } from "./StakeWithdrawModal";
import { TrustWalletUnsupportedModal } from "./TrustWalletUnsupportedModal";

export class Modals extends React.Component {
    render() {
        return (
            <>
                <TrustWalletUnsupportedModal />
                <ExchangeDepositModal />
                <USDTDepositModal />
                <USDTWithdrawModal />
                <StakeWithdrawModal />
            </>
        )
    }
}

import React from 'react';
import { observer } from "mobx-react";
import { resolve } from "inversify-react";
import { AuthStore, ModalStore } from "../../stores";
import { pd } from "../../utils/utilities";
import { Modals } from "../../stores/ModalStore";

interface IStakingBalanceProps {
}

interface IStakingBalanceState {
}

@observer
export class StakingBalance extends React.Component<IStakingBalanceProps, IStakingBalanceState> {
    @resolve(ModalStore)
    declare private readonly modalStore: ModalStore;
    @resolve(AuthStore)
    declare private readonly authStore: AuthStore;

    render() {
        const profile = this.authStore.profile;
        return (
            <div className="my-balance">
                <svg viewBox="0 0 478 289" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M89.3948 183.795L6 283H472V6L417.92 59.6822L334.525 67.8419L301.167 134.837H237.484L158.638 212.14L89.3948 183.795Z"
                        fill="url(#paint0_linear)"/>
                    <g filter="url(#filter0_d)">
                        <path
                            d="M6 283L89.3948 183.795L158.638 212.14L237.484 134.837H301.167L334.525 67.8419L417.92 59.6822L472 6"
                            stroke="url(#paint1_linear)" strokeWidth="2"/>
                    </g>
                    <defs>
                        <filter id="filter0_d" x="0.234558" y="0.290283" width="477.47" height="288.353"
                                filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                            <feColorMatrix in="SourceAlpha" type="matrix"
                                           values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
                            <feOffset/>
                            <feGaussianBlur stdDeviation="2.5"/>
                            <feColorMatrix type="matrix"
                                           values="0 0 0 0 0.742667 0 0 0 0 0.195833 0 0 0 0 1 0 0 0 1 0"/>
                            <feBlend mode="normal" in2="BackgroundImageFix"
                                     result="effect1_dropShadow"/>
                            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow"
                                     result="shape"/>
                        </filter>
                        <linearGradient id="paint0_linear" x1="239" y1="6" x2="261.282" y2="281.196"
                                        gradientUnits="userSpaceOnUse">
                            <stop stopColor="#CD2576"/>
                            <stop offset="0.932292" stopColor="#800CE7" stopOpacity="0"/>
                        </linearGradient>
                        <linearGradient id="paint1_linear" x1="47.5018" y1="11.6188" x2="511.747" y2="94.4761"
                                        gradientUnits="userSpaceOnUse">
                            <stop stopColor="#800CE7"/>
                            <stop offset="1" stopColor="#CD2576"/>
                        </linearGradient>
                    </defs>
                </svg>
                <div className="today">
                    <p>Today</p>
                    <h5>+{profile?.today_stake_bonus.toFixed(6)} <span>UNCH</span></h5>
                    <i>+{profile?.today_stake_bonus / profile?.total_stakes * 100}%</i>
                </div>
                <div className="overall">
                    <p>Total balance</p>
                    <h3>{profile?.total_stake_balance.toFixed(6)}</h3>
                    <span>UNCH</span>
                    <div className="usd">
                        &asymp; {(profile?.total_stake_balance * profile?.settings.unichain_price).toFixed(2)} USD
                    </div>
                    <a href="#" onClick={e => pd(e, this.modalStore.showModal(Modals.StakeWithdraw))}><i className="icon-top-arrow"/>Withdraw</a>
                </div>
            </div>
        )
    }
}
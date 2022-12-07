import React from 'react';
import { Link, Redirect, Route, Switch } from 'react-router-dom';
import '../sass/platforma.scss';
import { resolve } from "inversify-react";
import { RouterStore } from "mobx-react-router";
import { AuthStore, WalletStore } from "../stores";
import { observer } from "mobx-react";
import { pd, trimAddress } from "../utils/utilities";
import { DashboardTab } from "./dashboard/DashboardTab";
import { InvestTab } from "./dashboard/InvestTab";
import { CabinetNavLink } from "../components/CabinetNavLink";
import copy from "copy-to-clipboard";
import { toast } from "react-toastify";
import { FarmingTab } from "./dashboard/FarmingTab";

interface ICabinetPageProps {
}

interface ICabinetPageState {
    navOpen: boolean;
}

@observer
export class CabinetPage extends React.Component<ICabinetPageProps, ICabinetPageState> {
    @resolve(RouterStore)
    declare private readonly routerStore: RouterStore;
    @resolve(WalletStore)
    declare private readonly walletStore: WalletStore;
    @resolve(AuthStore)
    declare private readonly authStore: AuthStore;

    state: ICabinetPageState = {
        navOpen: false,
    }

    async componentDidMount() {
        if (!this.walletStore.account) {
            if (!await this.walletStore.tryReconnect()) {
                this.authStore.logout();
            }
        }
    }

    render() {
        const { navOpen } = this.state;

        if (!this.authStore.token) {
            return <Redirect to='/' />;
        }

        if (!this.walletStore.account) {
            return null;
        }

        return (
            <div className="platforma">
                <div className={`platforma-nav-mobile-bg ${navOpen && 'active'}`} />
                <div className={`platforma-nav-mobile ${navOpen && 'active'}`}>
                    <div className='nav-mobile-content'>
                        <div className="content">
                            <div className="wallet-mobile">
                                <div className="wallet">
                                    <img src={require('../images/wallet-img.svg')} alt=""/>
                                    <div className="wallet-text">
                                        <span>{this.authStore.profile?.name}</span>
                                        <strong>{trimAddress(this.walletStore.account)}</strong>
                                        <a href="#" onClick={e => pd(e, this.authStore.logout())}><i className="icon-exit"/></a>
                                    </div>
                                </div>
                                <a href='#' className="close-nav" onClick={e => pd(e, this.setState({ navOpen: false }))}><i className="icon-close"/></a>
                            </div>
                            <nav className='nav'>
                                <ul>
                                    <CabinetNavLink to='/cabinet/dashboard'><i className="icon-dashboard"/>Dashboard</CabinetNavLink>
                                    <CabinetNavLink to='/cabinet/invest'><i className="icon-investment"/>Staking</CabinetNavLink>
                                    <CabinetNavLink to='/cabinet/farming'>
                                        <i className="icon-farming2"/>Farming
                                        <span>In development</span>
                                    </CabinetNavLink>
                                    <a href="#" className="on_active">
                                        <i className="icon-quests"/>Quests
                                        <span>In development</span>
                                    </a>
                                    <a href="#" className="on_active">
                                        <i className="icon-games"/>Games
                                        <span>In development</span>
                                    </a>
                                </ul>
                                <a href="#" className="help"><i className="icon-help"/>Help</a>
                            </nav>
                            {/*<a href="javascript:void(0)" className="languages"><img src={require('../images/languages-img.png')} alt="" /> 中文</a>*/}
                        </div>
                    </div>
                </div>
                <header className="header">
                    <Link to='/' className="logo"><img src={require('../images/logo.svg')} alt=""/></Link>
                    <div className="referral-link">
                        <span>Referral link</span>
                        <div className="link">
                            <p>{this.authStore.referralLink}</p>
                            <a
                                className="share"
                                href="#"
                                onClick={e => {
                                    pd(e);
                                    if (navigator.share)
                                        navigator.share({ url: this.authStore.referralLink })
                                    else
                                        toast.error('Your device does not support this feature')
                                }}
                            >
                                <i className="icon-share"/>
                            </a>
                            <a
                                className="copy"
                                href="#"
                                onClick={e => {
                                    pd(e);
                                    copy(this.authStore.referralLink);
                                    toast.success('The link was copied')
                                }}
                            >
                                <i className="icon-copy4"/>
                            </a>
                        </div>
                    </div>
                    <div className="wallet">
                        <img src={require('../images/wallet-img.svg')} alt=""/>
                        <div className="wallet-text">
                            <span>{this.authStore.profile?.name}</span>
                            <strong>{trimAddress(this.walletStore.account)}</strong>
                            <a href="#" onClick={e => pd(e, this.authStore.logout())}><i className="icon-exit"/></a>
                        </div>
                    </div>
                    <span className="open-nav" onClick={e => pd(e, this.setState({ navOpen: true }))}><i className="icon-menu"/></span>
                </header>
                <div className="platforma-content">
                    <div className="platforma-nav">
                        <nav className='nav'>
                            <ul>
                                <CabinetNavLink to='/cabinet/dashboard'><i className="icon-dashboard"/>Dashboard</CabinetNavLink>
                                <CabinetNavLink to='/cabinet/invest'><i className="icon-investment"/>Staking</CabinetNavLink>
                                <CabinetNavLink to='/cabinet/farming'><i className="icon-farming2"/>Farming</CabinetNavLink>
                                <a href="#" className="on_active">
                                    <i className="icon-quests"/>Quests
                                    <span>in development</span>
                                </a>
                                <a href='#' className="on_active">
                                    <i className="icon-games"/>Games
                                    <span>in development</span>
                                </a>
                            </ul>
                            <a href="javascript:void(0)" className="help"><i className="icon-help"/>Help</a>
                        </nav>
                        {/*<a href="javascript:void(0)" className="languages"><img src={require('../images/languages-img.png')} alt="" /> 中文</a>*/}
                    </div>
                    <div className="content-tabs">
                        {/*<div className="content-box">*/}
                            <Switch>
                                <Route exact path='/cabinet'><Redirect to='/cabinet/dashboard' /></Route>
                                <Route path='/cabinet/dashboard' component={DashboardTab} />
                                <Route path='/cabinet/invest' component={InvestTab} />
                                <Route path='/cabinet/farming' component={FarmingTab} />
                            </Switch>
                        {/*</div>*/}
                    </div>
                </div>
            </div>
        )
    }
}
import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import '../sass/nickname.scss';
import { observer } from "mobx-react";
import { resolve } from "inversify-react";
import { AuthStore, WalletStore } from "../stores";
import { RouterStore } from "mobx-react-router";
import { pd, processRequestError, trimAddress } from "../utils/utilities";
import { toast } from "react-toastify";
import store from 'store';

interface ISignupPageProps {
}

interface ISignupPageState {
    name: string;
    referrer: string;
    loading: boolean;
}

@observer
export class SignupPage extends React.Component<ISignupPageProps, ISignupPageState> {
    @resolve(RouterStore)
    declare private readonly routerStore: RouterStore;
    @resolve(WalletStore)
    declare private readonly walletStore: WalletStore;
    @resolve(AuthStore)
    declare private readonly authStore: AuthStore;

    state: ISignupPageState = {
        name: '',
        referrer: '',
        loading: false,
    }

    componentDidMount() {
        const savedReferrer = store.get('referrer');
        if (savedReferrer) {
            this.setState({ referrer: savedReferrer })
        }
    }

    logout = async () => {
        await this.walletStore.resetWallet();
        this.routerStore.push('/');
    }

    onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        this.setState({ loading: true });
        try {
            const signedMessage = await this.walletStore.signMessage('SignupRequest');
            await this.authStore.signUp(this.walletStore.account, this.state.name, this.state.referrer, signedMessage);
            toast.success('Registration completed successfully');
            this.routerStore.push('/cabinet');
        } catch (e) {
            processRequestError(e);
        } finally {
            this.setState({ loading: false });
        }
    }

    render() {
        const { name, referrer, loading } = this.state;

        if (!this.walletStore.account) {
            return <Redirect to='/' />;
        } else if (this.authStore.token) {
            return <Redirect to='/cabinet' />;
        }

        return (
            <div className='nickname-wrapper'>
                <Link to="/" className="logo"><img src={require('../images/logo.svg')} alt="" /></Link>
                <div className="nickname">
                    <div className="nickname-content">
                        <div className="wallet">
                            <h3><i className="icon-check"/> The wallet is successfully connected</h3>
                            <div className="number-wallet">
                                <img src={require('../images/wallet-img.svg')} alt="" />
                                    <strong>{trimAddress(this.walletStore.account)}</strong>
                                    <a href="#" onClick={e => pd(e, this.logout())}><i className="icon-exit"/></a>
                            </div>
                        </div>
                        <div className="identification">
                            <p>To identify you on the platform please come up with a nickname</p>
                            <form onSubmit={this.onSubmit}>
                                <div className="inputs">
                                    <div className="input">
                                        <label>Nickname</label>
                                        <input
                                            type="text"
                                            placeholder="For example: fender4567"
                                            value={name}
                                            onChange={e => this.setState({ name: e.target.value })}
                                        />
                                    </div>
                                    <div className="input">
                                        <label>Referral code <i className="icon-info"/></label>
                                        <input
                                            type="text"
                                            placeholder="AK3D2F"
                                            value={referrer}
                                            onChange={e => this.setState({ referrer: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <button type='submit' disabled={loading || !name.length}>Continue</button>
                            </form>
                        </div>
                    </div>
                </div>
                <a href="#" className="help"><i className="icon-help"/>Help</a>
            </div>
        )
    }
}
import React from 'react';
import { Link } from 'react-router-dom';
import '../sass/greeting.scss';
import { observer } from "mobx-react";
import { resolve } from "inversify-react";
import { AuthStore, ModalStore, WalletStore } from "../stores";
import { RouterStore } from "mobx-react-router";
import { toast } from "react-toastify";
import { pd, processRequestError } from "../utils/utilities";
import { BrowserView, MobileView } from 'react-device-detect';
import { Modals } from "../stores/ModalStore";

interface IIndexPageProps {
}

interface IIndexPageState {
    loading: boolean;
}

@observer
export class IndexPage extends React.Component<IIndexPageProps, IIndexPageState> {
    @resolve(RouterStore)
    declare private readonly routerStore: RouterStore;
    @resolve(WalletStore)
    declare private readonly walletStore: WalletStore;
    @resolve(AuthStore)
    declare private readonly authStore: AuthStore;
    @resolve(ModalStore)
    declare private readonly modalStore: ModalStore;

    state: IIndexPageState = {
        loading: false,
    }

    connect = async (provider: string) => {
        await this.walletStore.resetWallet();
        this.authStore.logout();
        const connected = await this.walletStore.connect(provider);
        if (connected) {
            const nonce = await this.authStore.getNonce(this.walletStore.account);
            if (!nonce) {
                this.routerStore.push('/signup');
            } else {
                this.setState({ loading: true });
                try {
                    const signedMessage = await this.walletStore.signMessage(`LoginRequest ${nonce}`);
                    await this.authStore.signIn(this.walletStore.account, signedMessage);
                    toast.success('The authorization is successful');
                    this.routerStore.push('/cabinet');
                } catch (e) {
                    processRequestError(e);
                } finally {
                    this.setState({ loading: false });
                }
            }
        }
    }

    render() {
        return (
            <div className='greeting-wrapper'>
                <Link to='/' className="logo"><img src={require('../images/logo.svg')} alt="" /></Link>
                <div className="greeting">
                    <div className="greeting-content">
                        <h1>Welcome 👋 to the <strong>Unichain</strong> - investment platform</h1>
                        <p>You need to to connect a wallet to start investing</p>
                        <span className="plug">Connect via:</span>
                        <BrowserView viewClassName='link'>
                        <div className="link">
                            <a className="metaMask" href='#' onClick={e => pd(e, this.connect('injected'))}>
                                MetaMask <img src={require('../images/MetaMask.svg')} alt="" />
                            </a>
                            <a className="trustWallet" href='#' onClick={e => pd(e, this.connect('walletconnect'))}>
                                Trust Wallet <i className="icon-trustwallet"/>
                            </a>
                        </div>
                        </BrowserView>
                        <MobileView viewClassName='link'>
                            {window.web3 || window.ethereum ? (
                                <a className="metaMask" href='#' onClick={e => pd(e, this.connect('injected'))}>
                                    MetaMask <img src={require('../images/MetaMask.svg')} alt="" />
                                </a>
                            ) : (
                                <a className="metaMask" href={`https://metamask.app.link/dapp/${window.location.host}`}>
                                    MetaMask <img src={require('../images/MetaMask.svg')} alt="" />
                                </a>
                            )}
                            <a className="trustWallet" href='#' onClick={e => pd(e, this.connect('walletconnect'))}>
                                Trust Wallet <i className="icon-trustwallet"/>
                            </a>
                        {/*    <a className="trustWallet" href='#' onClick={e => pd(e, this.modalStore.showModal(Modals.TrustWalletUnsupported))}>*/}
                        {/*        Trust Wallet <i className="icon-trustwallet"/>*/}
                        {/*    </a>*/}
                        </MobileView>
                    </div>
                </div>
                <a href="#" className="help"><i className="icon-help"/>Help</a>
            </div>
        )
    }
}
import React from 'react';
import { Modal } from "../components/Modal";
import { Modals } from "../stores/ModalStore";
import { observer } from "mobx-react";
import { resolve } from "inversify-react";
import { AuthStore } from "../stores";
import { pd } from "../utils/utilities";
import { toast } from "react-toastify";
import copy from "copy-to-clipboard";
import QRCode from 'react-qr-code';

interface IUSDTDepositModalProps {
}

interface IUSDTDepositModalState {
}

@observer
export class USDTDepositModal extends React.Component<IUSDTDepositModalProps, IUSDTDepositModalState> {
    @resolve(AuthStore)
    declare private readonly authStore: AuthStore;

    render() {
        return (
            <Modal modalClassName='popup-refill' modalKey={Modals.USDTDeposit}>
                <div className="title">
                    <h4><i className="icon-plus"/>Refill</h4>
                </div>
                <div className="qr">
                    <p>Scan the QR code</p>
                    {/*<img src="img/qr-codes.png" alt="" />*/}
                    <QRCode value={this.authStore.profile?.settings.usdt_deposit_address || ''} />
                    <p>Or copy the wallet address</p>
                    <p style={{ color: 'red' }}>The deposit will be taken into account only from the address of the current account. Transfers from other addresses will be lost!</p>
                </div>
                <div className="referral-link">
                    <span>Wallet address USDT</span>
                    <div className="link">
                        <a
                            className="share"
                            href="#"
                            onClick={e => {
                                pd(e);
                                if (navigator.share)
                                    navigator.share({ url: this.authStore.profile?.settings.usdt_deposit_address })
                                else
                                    toast.error('Your device does not support this feature')
                            }}
                        >
                            <i className="icon-share"/>
                        </a>
                        <p>{this.authStore.profile?.settings.usdt_deposit_address}</p>
                        <a
                            className="copy"
                            href="#"
                            onClick={e => {
                                pd(e);
                                copy(this.authStore.profile?.settings.usdt_deposit_address);
                                toast.success('The link was copied')
                            }}
                        >
                            <i className="icon-copy4"/>
                        </a>
                    </div>
                </div>
            </Modal>
        );
    }
}

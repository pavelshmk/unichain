import React from 'react';
import { Modal } from "../components/Modal";
import { Modals } from "../stores/ModalStore";

interface ITrustWalletUnsupportedModalProps {
}

interface ITrustWalletUnsupportedModalState {
}

export class TrustWalletUnsupportedModal extends React.Component<ITrustWalletUnsupportedModalProps, ITrustWalletUnsupportedModalState> {
    render() {
        return (
            <Modal modalClassName='trust-unsupported-modal' modalKey={Modals.TrustWalletUnsupported}>
                <img src={require('../images/Warning sign.svg')} alt='warning' />
                <p>Unfortunately, your device does not support Trust Wallet sign in.</p>
                <p>Import a wallet from Trust Wallet into MetaMask to work with our platform correctly.</p>
            </Modal>
        )
    }
}

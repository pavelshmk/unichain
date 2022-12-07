import React from 'react';
import { Modal } from "../components/Modal";
import { pd } from "../utils/utilities";

interface IFarmingTransactionConfirmModalProps {
    show: boolean;
    onHide: () => any;
    onConfirm: () => any;
}

interface IFarmingTransactionConfirmModalState {
}

export class FarmingTransactionConfirmModal extends React.Component<IFarmingTransactionConfirmModalProps, IFarmingTransactionConfirmModalState> {
    render() {
        const { show, onHide, onConfirm } = this.props;

        return (
            <Modal modalClassName='popup-transaction' show={show} onHide={onHide}>
                <div className="title">
                    <h4>Confirm transaction</h4>
                </div>
                <p>Are you sure you want to confirm the transaction?</p>
                <ul>
                    <li><a href='#' className="cancel-link" onClick={e => pd(e, onHide())}>Cancel</a></li>
                    <li><a href="#" className="confirm-link" onClick={e => pd(e, onConfirm())}>Confirm</a></li>
                </ul>
            </Modal>
        )
    }
}
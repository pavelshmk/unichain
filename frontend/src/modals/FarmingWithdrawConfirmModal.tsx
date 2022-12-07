import React from 'react';
import { Modal } from "../components/Modal";
import { pd } from "../utils/utilities";

interface IFarmingWithdrawConfirmModalProps {
    show: boolean;
    onHide: () => any;
    onConfirm: () => any;
}

interface IFarmingWithdrawConfirmModalState {
}

export class FarmingWithdrawConfirmModal extends React.Component<IFarmingWithdrawConfirmModalProps, IFarmingWithdrawConfirmModalState> {
    render() {
        const { show, onHide, onConfirm } = this.props;

        return (
            <Modal modalClassName='popup-transaction' show={show} onHide={onHide}>
                <div className="title">
                    <h4>Withdraw</h4>
                </div>
                <p>Are you sure you want to withdraw this farming deposit?</p>
                <ul>
                    <li><a href='#' className="cancel-link" onClick={e => pd(e, onHide())}>Cancel</a></li>
                    <li><a href="#" className="confirm-link" onClick={e => pd(e, onConfirm())}>Confirm</a></li>
                </ul>
            </Modal>
        )
    }
}
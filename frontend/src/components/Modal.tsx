import React from 'react';
import { inject, observer } from "mobx-react";
import { Modals, ModalStore } from "../stores/ModalStore";
import { resolve } from "inversify-react";
import { ScrollLock } from "./ScrollLock";

interface IModalProps {
    modalClassName?: string;
    children: React.ReactNode | React.ReactNodeArray;
    show?: boolean;
    onHide?: () => any;
    modalKey?: Modals;
}

interface IModalState {
}

@observer
export class Modal extends React.Component<IModalProps, IModalState> {
    @resolve(ModalStore)
    declare private readonly modalStore: ModalStore;

    hide = () => {
        this.props.onHide ? this.props.onHide() : this.modalStore.hideModals();
    }

    render() {
        let { modalClassName, children, show, modalKey } = this.props;

        if (!show && modalKey)
            show = this.modalStore.activeModal === modalKey;

        return (
            <>
                {show && <ScrollLock />}
                <div className={`modal ${show && 'active'} ${modalClassName}`}>
                    <span className="close" onClick={this.hide} />
                    <div className="popup-content">
                        <span className="close-popup" onClick={this.hide}><i className="icon-close"/></span>
                        {children}
                    </div>
                </div>
            </>
        )
    }
}

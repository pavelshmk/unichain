import { History } from "history";

export { RouterStore } from "mobx-react-router";
export { RootStore } from "./RootStore";
export { ModalStore } from './ModalStore';
export { WalletStore } from './WalletStore';
export { AuthStore } from './AuthStore';

// @ts-ignore
export class HistoryStore implements History {}

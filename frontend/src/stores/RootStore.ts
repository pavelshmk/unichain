import * as stores from './';
import { createBrowserHistory, History } from "history";
import { syncHistoryWithStore } from "mobx-react-router";
import { wrapHistory } from "oaf-react-router";
import { Container } from 'inversify';
import store from 'store';
import { Api } from "../utils/api";

export class RootStore {
    public historyStore: History;
    public routerStore: stores.RouterStore;
    public modalStore: stores.ModalStore;
    public walletStore: stores.WalletStore;
    public authStore: stores.AuthStore;

    public container: Container;

    public constructor() {
        const browserHistory = createBrowserHistory();
        wrapHistory(browserHistory, {
            smoothScroll: true,
            primaryFocusTarget: 'body',
        });

        this.routerStore = new stores.RouterStore();
        this.historyStore = syncHistoryWithStore(browserHistory, this.routerStore);

        this.authStore = new stores.AuthStore(this);
        this.modalStore = new stores.ModalStore(this);
        this.walletStore = new stores.WalletStore(this);

        this.container = new Container();
        this.container.bind(stores.RouterStore).toConstantValue(this.routerStore);
        this.container.bind(stores.HistoryStore).toConstantValue(this.historyStore);
        this.container.bind(stores.AuthStore).toConstantValue(this.authStore);
        this.container.bind(stores.ModalStore).toConstantValue(this.modalStore);
        this.container.bind(stores.WalletStore).toConstantValue(this.walletStore);
    }

    get api(): Api {
        const token = store.get('token');
        return new Api(token);
    }
}

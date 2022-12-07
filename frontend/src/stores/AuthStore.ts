import { RootStore } from "./";
import { action, computed, makeObservable, observable, runInAction } from "mobx";
import store from 'store';
import { injectable } from "inversify";
import { Profile } from "../utils/types";
import qs from "qs";

@injectable()
export class AuthStore {
    @observable initialized = false;
    @observable token?: string;
    @observable profile?: Profile;

    get api() {
        return this.rootStore.api;
    }

    public constructor(protected rootStore: RootStore) {
        makeObservable(this);
        this.initialize();
    }

    @action async initialize() {
        this.token = store.get('token');
        await this.loadUserInfo();
        this.initialized = true;
        setInterval(() => this.loadUserInfo(), 10000);

        const q = qs.parse(this.rootStore.routerStore.location.search, { ignoreQueryPrefix: true });
        if (q.r) {
            store.set('referrer', q.r);
        }
    }

    @action loadUserInfo = async () => {
        if (this.token) {
            try {
                const profile = await this.api.getProfile()
                runInAction(() => {
                    this.profile = profile;
                })
            } catch (e) {
                if (e?.response?.status === 401) {
                    this.logout();
                }
            }
        }
    }

    async getNonce(address: string): Promise<null | string> {
        return await this.api.getNonce(address);
    }

    async signUp(address: string, name: string, referrer: string, signature: string): Promise<void> {
        this.token = await this.api.signUp(address, name, referrer, signature);
        store.set('token', this.token);
        store.remove('referrer');
        await this.loadUserInfo();
    }

    async signIn(address: string, signature: string): Promise<void> {
        this.token = await this.api.signIn(address, signature);
        store.set('token', this.token);
        store.remove('referrer');
        await this.loadUserInfo();
    }

    async usdtWithdraw(amount: string, address: string, erc20: boolean): Promise<void> {
        await this.api.usdtWithdraw(amount, address, erc20);
        await this.loadUserInfo();
    }

    async xfarmExchange(give: string): Promise<void> {
        await this.api.xfarmExchange(give);
        await this.loadUserInfo();
    }

    async prepareStake(length: number): Promise<void> {
        await this.api.prepareStake(length);
    }

    async submitStake(txid: string, ticketId: string): Promise<void> {
        await this.api.submitStake(txid, ticketId);
        await this.loadUserInfo();
    }

    async stakeWithdraw(amount: string, address: string): Promise<void> {
        await this.api.stakeWithdraw(amount, address);
        await this.loadUserInfo();
    }

    async farmingDeposit(length: string, amount: string, coin: string): Promise<void> {
        await this.api.farmingDeposit(length, amount, coin);
        await this.loadUserInfo();
    }

    async farmingWithdraw(pk: number): Promise<void> {
        await this.api.farmingWithdraw(pk);
        await this.loadUserInfo();
    }

    @action logout() {
        this.token = this.profile = undefined;
        store.remove('token');
    }

    @computed get referralLink() {
        if (!this.profile) return null;
        const a = document.createElement('a');
        a.href = `/?r=${this.profile.referral_code}`;
        return a.href;
    }
}
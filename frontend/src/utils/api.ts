import axios, { AxiosInstance } from "axios";
import { Profile } from "./types";
import { deserialize } from "typescript-json-serializer";

export class Api {
    axios: AxiosInstance;

    constructor(token?: string) {
        this.axios = axios.create({
            baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://bennnnsss.cf:36584/api',
            headers: { authorization: token ? `Token ${token}` : null },
            xsrfCookieName: 'csrftoken',
            xsrfHeaderName: 'x-csrftoken',
        });
    }

    async getNonce(address: string): Promise<null | string> {
        const res = await this.axios.get('/nonce/', { params: { address } });
        return res.data.nonce;
    }

    async signUp(address: string, name: string, referrer: string, signature: string) {
        const res = await this.axios.post('/signup/', { address, name, referrer, signature });
        return res.data.token;
    }

    async signIn(address: string, signature: string) {
        const res = await this.axios.post('/signin/', { address, signature });
        return res.data.token;
    }

    async getProfile() {
        const res = await this.axios.get('/profile/');
        return deserialize(res.data, Profile);
    }

    async usdtWithdraw(amount: string, address: string, erc20: boolean) {
        await this.axios.post('/usdt_withdraw/', { amount, address, erc20 });
    }

    async xfarmExchange(give: string) {
        await this.axios.post('/xfarm_exchange/', { give });
    }

    async prepareStake(length: number): Promise<void> {
        await this.axios.post('/prepare_stake/', { length });
    }

    async submitStake(txid: string, ticket_id: string) {
        await this.axios.post('/submit_stake/', { txid, ticket_id });
    }

    async stakeWithdraw(amount: string, address: string) {
        await this.axios.post('/stake_withdraw/', { amount, address });
    }

    async farmingDeposit(length: string, amount: string, coin: string) {
        await this.axios.post('/farming_deposit/', { length, amount, coin });
    }

    async farmingWithdraw(pk: number) {
        await this.axios.post('/farming_withdraw/', { pk });
    }
}

export const api = new Api();
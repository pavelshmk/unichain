import { injectable } from "inversify";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from 'web3modal';
import { action, makeObservable, observable, runInAction } from "mobx";
import * as Ethers from 'ethers';
import { RootStore } from "./RootStore";
import { toast } from "react-toastify";
import ERC20_ABI from '../../../unichain/erc20.abi.json';
import BN from "bignumber.js";
import { toBNJS } from "../utils/utilities";

const INFURA_ID = '72bbc176d6374866b8dc7166e4459cbf'
const TEST_NETWORK = process.env.NODE_ENV !== 'production';

const UNICHAIN_ADDRESS = TEST_NETWORK ? '0x78a975aDF5b71bBc10a8990be5c9958614adb1Bf' : '0xBC723431f05228f3a52e89D1C2Edd79dF1a738Ac';

const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider, // required
        options: {
            infuraId: INFURA_ID // required
        }
    }
}

const web3Modal = new Web3Modal({
    network: TEST_NETWORK ? 'ropsten' : 'mainnet',
    cacheProvider: true,
    providerOptions,
})

if (window.ethereum)
    window.ethereum.autoRefreshOnNetworkChange = false;

@injectable()
export class WalletStore {
    private provider: Ethers.providers.Web3Provider;
    private infoInterval;
    private wc: WalletConnectProvider;

    @observable connected: boolean = false;
    @observable account?: string;
    @observable unichainBalance?: BN;

    public constructor(protected rootStore: RootStore) {
        makeObservable(this);
        this.infoInterval = setInterval(this.loadWalletInfo, 10000);
        this.loadWalletInfo();
    }

    @action loadWalletInfo = async () => {
        if (this.account) {
            let unichainBalance;
            try {
                unichainBalance = toBNJS(await this.unichainContract.balanceOf(this.account)).div(toBNJS(10).pow(await this.unichainContract.decimals()));
            } catch (e) {
                unichainBalance = toBNJS(0);
            }
            runInAction(() => { this.unichainBalance = unichainBalance });
        }
    }

    @action async resetWallet() {
        web3Modal.clearCachedProvider();
        localStorage.removeItem('walletconnect');
        this.connected = false;
    }

    @action async tryReconnect() {
        if (web3Modal.cachedProvider) {
            try {
                const provider = await web3Modal.connect();
                this.provider = new Ethers.providers.Web3Provider(provider);
                if (web3Modal.cachedProvider === 'walletconnect')
                    this.wc = provider;
                await this.initProvider();
                await this.loadWalletInfo();
                return true;
            } catch (e) {
                console.log(e);
            }
        }
        return false;
    }

    @action async connect(providerName: string) {
        if (this.connected)
            return true;

        await this.resetWallet();

        try {
            const provider = await web3Modal.connectTo(providerName);
            this.provider = new Ethers.providers.Web3Provider(provider);
            if (providerName === 'walletconnect')
                this.wc = provider;
        } catch (e) {
            console.log(e);
            return false;
        }

        await this.initProvider();
        await this.loadWalletInfo();

        return true;
    }

    @action async initProvider() {
        this.provider.on('accountsChange', () => this.resetWallet());
        this.provider.on('chainChanged', () => this.resetWallet());
        this.provider.on('disconnect', () => this.resetWallet());

        if ((await this.ethers.getNetwork()).chainId !== (TEST_NETWORK ? 3 : 1)) {  // 3 = ropsten, 1 = mainnet
            toast.error(`Please switch to ${TEST_NETWORK ? 'Ropsten' : 'Mainnet'} network`);
            this.provider = undefined;
            return false;
        }

        const account = (await this.ethers.listAccounts())[0];
        runInAction(() => { this.account = account });
        this.connected = true;
    }

    get ethers(): Ethers.providers.Web3Provider {
        return this.provider;
    }

    get unichainContract(): Ethers.Contract {
        return new Ethers.Contract(UNICHAIN_ADDRESS, ERC20_ABI, this.ethers.getSigner())
    }

    async signMessage(rawMessage: string) {
        if (this.wc) {
            const rawMessageLength = new Blob([rawMessage]).size;
            const bytesMessage = Ethers.utils.toUtf8Bytes(`\x19Ethereum Signed Message:\n${rawMessageLength}${rawMessage}`);
            const message = Ethers.utils.keccak256(bytesMessage);
            const params = [
                await this.ethers.getSigner().getAddress(),
                message,
            ];
            return await this.wc.connector.signMessage(params);
        } else {
            return await this.ethers.getSigner().signMessage(rawMessage);
        }
    }
}
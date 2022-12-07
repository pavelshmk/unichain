import { JsonProperty, Serializable } from "typescript-json-serializer";
import { DateTime } from "luxon";
import exp from "constants";

const DATETIME_PROPERTY = { onDeserialize: (val: string) => DateTime.fromISO(val) }
const DECIMAL_PROPERTY = { onDeserialize: (val: string) => parseFloat(val) }

@Serializable()
export class Settings {
    @JsonProperty() exchange_deposit_address: string;
    @JsonProperty(DECIMAL_PROPERTY) unichain_price: number;
    @JsonProperty(DECIMAL_PROPERTY) xfarm_price: number;
    @JsonProperty() usdt_deposit_address: string;
    @JsonProperty() stake_deposit_address: string;
    @JsonProperty(DECIMAL_PROPERTY) erc20_withdraw_commission: number;
    @JsonProperty(DECIMAL_PROPERTY) trc20_withdraw_commission: number;
}

@Serializable()
export class Stake {
    @JsonProperty() pk: number;
    @JsonProperty(DECIMAL_PROPERTY) amount: number;
    @JsonProperty() length: number;
    @JsonProperty(DATETIME_PROPERTY) started: DateTime;
    @JsonProperty(DATETIME_PROPERTY) finish: DateTime;
    @JsonProperty() is_finished: boolean;
    @JsonProperty(DECIMAL_PROPERTY) profit: number;
}

@Serializable()
export class StakePayment {
    @JsonProperty(DATETIME_PROPERTY) date: DateTime;
    @JsonProperty(DECIMAL_PROPERTY) total_amount: number;
    @JsonProperty(DECIMAL_PROPERTY) paid: number;
}

@Serializable()
export class Referral {
    @JsonProperty() name: string;
    @JsonProperty() address: string;
    @JsonProperty(DECIMAL_PROPERTY) total_bought: number;
    @JsonProperty(DECIMAL_PROPERTY) total_farming: number;
}

@Serializable()
export class ReferralLevel {
    @JsonProperty() level: number;
    @JsonProperty(DECIMAL_PROPERTY) profit;
    @JsonProperty({ type: Referral }) referrals: Referral[];
}

@Serializable()
export class FarmingDeposit {
    @JsonProperty() pk: number;
    @JsonProperty() coin: 'usdt' | 'curve' | 'sushi' | 'farm';
    @JsonProperty(DECIMAL_PROPERTY) amount: number;
    @JsonProperty() length: number;
    @JsonProperty(DECIMAL_PROPERTY) extra_tokenx: number;
    @JsonProperty(DECIMAL_PROPERTY) daily_percent?: number;
    @JsonProperty(DECIMAL_PROPERTY) extra_percent?: number;
    @JsonProperty(DECIMAL_PROPERTY) profit_percent?: number;
    @JsonProperty(DATETIME_PROPERTY) started: DateTime;
    @JsonProperty() days_passed: number;
    @JsonProperty() is_destroyed: boolean;
}

@Serializable()
export class Profile {
    @JsonProperty() pk: number;
    @JsonProperty() username: string;
    @JsonProperty() name: string;
    @JsonProperty() referrer?: string;
    @JsonProperty() referral_code: string;
    @JsonProperty(DECIMAL_PROPERTY) usdt_balance: number;
    @JsonProperty(DECIMAL_PROPERTY) xfarm_balance: number;
    @JsonProperty({ type: Settings }) settings: Settings;
    @JsonProperty({ type: ReferralLevel }) referrals: ReferralLevel[];
    @JsonProperty({ type: Stake }) stakes: Stake[];
    @JsonProperty({ type: StakePayment }) invest_log: StakePayment[];
    @JsonProperty(DECIMAL_PROPERTY) stake_bonus_balance: number;
    @JsonProperty(DECIMAL_PROPERTY) total_stake_balance: number;
    @JsonProperty(DECIMAL_PROPERTY) today_stake_bonus: number;
    @JsonProperty(DECIMAL_PROPERTY) total_stakes: number;
    @JsonProperty({ type: FarmingDeposit }) farming_log: FarmingDeposit[];
}

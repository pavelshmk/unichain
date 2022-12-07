from decimal import Decimal

from django.core.exceptions import ValidationError
from dynamic_preferences.preferences import Section
from dynamic_preferences.registries import global_preferences_registry
from dynamic_preferences.types import StringPreference, IntegerPreference, DecimalPreference
from eth_account import Account
from eth_keys.datatypes import PrivateKey

from unichain.utils import PreferenceMixin, global_preferences

settings = Section('settings')
farming = Section('farming')
addresses = Section('addresses')
internal = Section('internal')


@global_preferences_registry.register
class EthereumNodeURI(PreferenceMixin, StringPreference):
    section = settings
    name = 'ethereum_node_uri'
    default = 'http://127.0.0.1:8545'


@global_preferences_registry.register
class USDTTokenAddress(PreferenceMixin, StringPreference):
    section = settings
    name = 'usdt_contract'
    default = '0x716F3F8f04Ae7d1B6658f1021f2001A58853121d'

    def validate(self, value):
        from unichain.crypto import ethereum
        if not ethereum.web3.isChecksumAddress(value):
            raise ValidationError('A checksum address is required')


@global_preferences_registry.register
class UnichainTokenAddress(PreferenceMixin, StringPreference):
    section = settings
    name = 'unichain_contract'
    default = '0x78a975aDF5b71bBc10a8990be5c9958614adb1Bf'

    def validate(self, value):
        from unichain.crypto import ethereum
        if not ethereum.web3.isChecksumAddress(value):
            raise ValidationError('A checksum address is required')


@global_preferences_registry.register
class ExchangeDepositAddress(PreferenceMixin, StringPreference):
    section = addresses
    name = 'exchange_deposit_address'
    default = '0x174d7BbF81820Ec9CCFed8c775AfA816f2cCCBc8'

    def validate(self, value):
        from unichain.crypto import ethereum
        if not ethereum.web3.isChecksumAddress(value):
            raise ValidationError('A checksum address is required')


@global_preferences_registry.register
class USDTDepositAddress(PreferenceMixin, StringPreference):
    section = addresses
    name = 'usdt_deposit_address'
    default = '0x2E0c59429FDE3daecbD90c99a6D2bB13da7982d7'
    help_text = 'Multiple addresses separated by comma allowed'

    def validate(self, value):
        from unichain.crypto import ethereum
        if not ethereum.web3.isChecksumAddress(value):
            raise ValidationError('A checksum address is required')


@global_preferences_registry.register
class StakeDepositAddress(PreferenceMixin, StringPreference):
    section = addresses
    name = 'stake_deposit_address'
    default = '0xBc345B1867746F53e63d293Dc1360929c40501f7'

    def validate(self, value):
        from unichain.crypto import ethereum
        if not ethereum.web3.isChecksumAddress(value):
            raise ValidationError('A checksum address is required')


@global_preferences_registry.register
class UnichainPrice(PreferenceMixin, DecimalPreference):
    section = settings
    name = 'unichain_price'
    default = Decimal('.1')
    help_text = 'In USDT'


@global_preferences_registry.register
class XFarmPrice(PreferenceMixin, DecimalPreference):
    section = settings
    name = 'xfarm_price'
    default = Decimal('.09')
    help_text = 'In USDT'


@global_preferences_registry.register
class ERC20TransferGasPrice(PreferenceMixin, IntegerPreference):
    section = settings
    name = 'erc20_transfer_gas_price'
    help_text = 'In gwei'
    default = 160


@global_preferences_registry.register
class StakeProfit(PreferenceMixin, DecimalPreference):
    section = settings
    name = 'stake_profit'
    help_text = 'daily, 1 = 100%'
    default = Decimal('.1')


@global_preferences_registry.register
class UsdtBaseProfit(PreferenceMixin, DecimalPreference):
    section = farming
    name = 'usdt_base_profit'
    help_text = 'daily, 1 = 100%'
    default = Decimal('.002')


@global_preferences_registry.register
class CurveBaseProfit(PreferenceMixin, DecimalPreference):
    section = farming
    name = 'curve_base_profit'
    help_text = 'daily, 1 = 100%'
    default = Decimal('.004')


@global_preferences_registry.register
class SushiBaseProfit(PreferenceMixin, DecimalPreference):
    section = farming
    name = 'sushi_base_profit'
    help_text = 'daily, 1 = 100%'
    default = Decimal('.005')


@global_preferences_registry.register
class FarmBaseProfit(PreferenceMixin, DecimalPreference):
    section = farming
    name = 'farm_base_profit'
    help_text = 'daily, 1 = 100%'
    default = Decimal('.005')


@global_preferences_registry.register
class Usdt150Bonus(PreferenceMixin, DecimalPreference):
    section = farming
    name = 'usdt_150_bonus'
    help_text = '1 = 100%'
    default = Decimal('.1')


@global_preferences_registry.register
class Usdt300Bonus(PreferenceMixin, DecimalPreference):
    section = farming
    name = 'usdt_300_bonus'
    help_text = '1 = 100%'
    default = Decimal('.15')


@global_preferences_registry.register
class Usdt300TokenXBonus(PreferenceMixin, DecimalPreference):
    section = farming
    name = 'usdt_300_tokenx_bonus'
    default = Decimal('1')


@global_preferences_registry.register
class CurveBaseProfit(PreferenceMixin, DecimalPreference):
    section = farming
    name = 'curve_base_profit'
    help_text = 'daily, 1 = 100%'
    default = Decimal('.004')


@global_preferences_registry.register
class Curve200Bonus(PreferenceMixin, DecimalPreference):
    section = farming
    name = 'curve_200_bonus'
    help_text = '1 = 100%'
    default = Decimal('.15')


@global_preferences_registry.register
class Curve350Bonus(PreferenceMixin, DecimalPreference):
    section = farming
    name = 'curve_350_bonus'
    help_text = '1 = 100%'
    default = Decimal('.25')


@global_preferences_registry.register
class Curve350TokenXBonus(PreferenceMixin, DecimalPreference):
    section = farming
    name = 'curve_350_tokenx_bonus'
    default = Decimal('1')


@global_preferences_registry.register
class SushiBaseProfit(PreferenceMixin, DecimalPreference):
    section = farming
    name = 'sushi_base_profit'
    help_text = 'daily, 1 = 100%'
    default = Decimal('.005')


@global_preferences_registry.register
class Sushi125Bonus(PreferenceMixin, DecimalPreference):
    section = farming
    name = 'sushi_125_bonus'
    help_text = '1 = 100%'
    default = Decimal('.25')


@global_preferences_registry.register
class Sushi250Bonus(PreferenceMixin, DecimalPreference):
    section = farming
    name = 'sushi_250_bonus'
    help_text = '1 = 100%'
    default = Decimal('.5')


@global_preferences_registry.register
class Sushi250TokenXBonus(PreferenceMixin, DecimalPreference):
    section = farming
    name = 'sushi_250_tokenx_bonus'
    default = Decimal('1')


@global_preferences_registry.register
class FarmBaseProfit(PreferenceMixin, DecimalPreference):
    section = farming
    name = 'farm_base_profit'
    help_text = 'daily, 1 = 100%'
    default = Decimal('.005')


@global_preferences_registry.register
class Farm120Bonus(PreferenceMixin, DecimalPreference):
    section = farming
    name = 'farm_120_bonus'
    help_text = '1 = 100%'
    default = Decimal('.4')


@global_preferences_registry.register
class Farm200Bonus(PreferenceMixin, DecimalPreference):
    section = farming
    name = 'farm_200_bonus'
    help_text = '1 = 100%'
    default = Decimal('.5')


@global_preferences_registry.register
class Farm200TokenXBonus(PreferenceMixin, DecimalPreference):
    section = farming
    name = 'farm_200_tokenx_bonus'
    default = Decimal('1')


@global_preferences_registry.register
class WithdrawERC20Commission(PreferenceMixin, DecimalPreference):
    section = settings
    name = 'withdraw_erc20_commission'
    default = Decimal('.01')


@global_preferences_registry.register
class WithdrawTRC20Commission(PreferenceMixin, DecimalPreference):
    section = settings
    name = 'withdraw_trc20_commission'
    default = Decimal('.01')

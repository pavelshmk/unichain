import logging
import time
import traceback
from decimal import Decimal

from django.core.cache import cache
from django.core.management import BaseCommand

from app.dynamic_preferences_registry import USDTTokenAddress, ExchangeDepositAddress, UnichainTokenAddress, \
    UnichainPrice, ERC20TransferGasPrice
from app.models import internal_options, User, OperationLog
from unichain.crypto import ethereum
from unichain.utils import REFERRAL_BONUSES


class Command(BaseCommand):
    def handle(self, *args, **options):
        while True:
            ethereum.web3.parity.personal.unlock_account(ExchangeDepositAddress.value(), '')
            logging.warning('Checking UNCH purchaces')
            usdt_contract = ethereum.erc20_contract(USDTTokenAddress.value())
            unichain_contract = ethereum.erc20_contract(UnichainTokenAddress.value())
            usdt_dec = 10 ** usdt_contract.functions.decimals().call()
            unichain_dec = 10 ** unichain_contract.functions.decimals().call()
            try:
                latest_block = ethereum.web3.eth.blockNumber
                if not internal_options.exchange_usdt_last_block:
                    internal_options.exchange_usdt_last_block = latest_block

                logging.warning('  Last remembered block: {}, current last: {}'.format(internal_options.exchange_usdt_last_block, latest_block))
                if internal_options.exchange_usdt_last_block < latest_block:
                    if latest_block - internal_options.exchange_usdt_last_block > 100:
                        latest_block = internal_options.exchange_usdt_last_block + 100
                    logging.warning('  Checking blocks {} ~ {}'.format(internal_options.exchange_usdt_last_block + 1, latest_block))

                    events = usdt_contract.events.Transfer().getLogs(fromBlock=internal_options.exchange_usdt_last_block + 1, toBlock=latest_block)
                    for evt in events:
                        if evt.args.to == ExchangeDepositAddress.value():
                            logging.warning('    Found USDT transaction {} from {}'.format(evt.transactionHash.hex(), evt.args['from']))
                            value = Decimal(evt.args.value) / usdt_dec
                            if value == 0:
                                logging.warning('      Zero value, skipping')
                                continue
                            # if value < 100:
                            #     logging.warning('      Less than 100 USDT, skipping!')
                            #     continue
                            buy_amount = value / UnichainPrice.value()
                            txid = unichain_contract.functions.transfer(evt.args['from'], int(buy_amount * unichain_dec)).transact({
                                'from': ExchangeDepositAddress.value(),
                                'gasPrice': ethereum.web3.toWei(ERC20TransferGasPrice.value(), 'gwei'),
                            })
                            logging.warning('      Sent {:.18f} UNCH: {}'.format(buy_amount, txid.hex()))
                            try:
                                user = User.objects.get(username=evt.args['from'])
                                user.total_bought += buy_amount
                                user.save()
                                OperationLog.create(user, OperationLog.Type.UNICHAIN_PURCHASE, info='{} UNCH'.format(buy_amount))
                                referrer = user
                                for i, bonus in enumerate(REFERRAL_BONUSES):
                                    referrer = referrer.referrer
                                    if not referrer:
                                        break
                                    referrer.xfarm_balance += buy_amount * bonus
                                    referrer.save()
                                    OperationLog.create(referrer, OperationLog.Type.REFERRAL_BONUS, xfarm_change=buy_amount * bonus)
                            except User.DoesNotExist:
                                pass
                internal_options.exchange_usdt_last_block = latest_block
            except KeyboardInterrupt:
                return
            except:
                traceback.print_exc()

            try:
                time.sleep(10)
            except KeyboardInterrupt:
                return

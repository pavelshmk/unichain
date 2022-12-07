import logging
import time
import traceback
from decimal import Decimal

from django.core.management import BaseCommand

from app.dynamic_preferences_registry import USDTTokenAddress, USDTDepositAddress
from app.models import internal_options, User, OperationLog
from unichain.crypto import ethereum


class Command(BaseCommand):
    def handle(self, *args, **options):
        while True:
            logging.warning('Checking USDT deposits')
            usdt_contract = ethereum.erc20_contract(USDTTokenAddress.value())
            usdt_dec = 10 ** usdt_contract.functions.decimals().call()
            try:
                latest_block = ethereum.web3.eth.blockNumber
                if not internal_options.deposit_usdt_last_block:
                    internal_options.deposit_usdt_last_block = latest_block

                logging.warning('  Last remembered block: {}, current last: {}'.format(internal_options.deposit_usdt_last_block, latest_block))
                if internal_options.deposit_usdt_last_block < latest_block:
                    if latest_block - internal_options.deposit_usdt_last_block > 100:
                        latest_block = internal_options.deposit_usdt_last_block + 100
                    logging.warning('  Checking blocks {} ~ {}'.format(internal_options.deposit_usdt_last_block + 1, latest_block))

                    events = usdt_contract.events.Transfer().getLogs(fromBlock=internal_options.deposit_usdt_last_block + 1, toBlock=latest_block)
                    for evt in events:
                        if evt.args.to in USDTDepositAddress.value().split(','):
                            logging.warning('    Found USDT transaction {} from {}'.format(evt.transactionHash.hex(), evt.args['from']))
                            try:
                                user = User.objects.get(username=evt.args['from'])
                                delta = Decimal(evt.args.value) / usdt_dec
                                user.usdt_balance += delta
                                user.save()
                                logging.warning('      Deposited {} USDT'.format(delta))
                                OperationLog.create(user, OperationLog.Type.USDT_DEPOSIT, usdt_change=delta)
                            except User.DoesNotExist:
                                logging.warning('      User not found')
                internal_options.deposit_usdt_last_block = latest_block
            except KeyboardInterrupt:
                return
            except:
                traceback.print_exc()

            try:
                time.sleep(10)
            except KeyboardInterrupt:
                return

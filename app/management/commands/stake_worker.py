import logging
import time
import traceback
from datetime import timedelta
from decimal import Decimal
from random import uniform

from django.core.management import BaseCommand
from django.db import transaction
from django.db.models import F, Count
from django.utils import timezone
from requests import ReadTimeout
from web3.exceptions import TransactionNotFound

from app.dynamic_preferences_registry import UnichainTokenAddress, StakeDepositAddress, ERC20TransferGasPrice, \
    StakeProfit
from app.models import UserStakePayment, UserStake, PendingStake, internal_options
from unichain.crypto import ethereum


class Command(BaseCommand):
    def handle(self, *args, **options):
        while True:
            try:
                ethereum.web3.parity.personal.unlock_account(StakeDepositAddress.value(), '')
                unichain_contract = ethereum.erc20_contract(UnichainTokenAddress.value())
                unichain_dec = 10 ** unichain_contract.functions.decimals().call()

                PendingStake.objects.filter(timeout__lt=timezone.now()).delete()  # type: PendingStake

                logging.warning('Checking stake deposits')
                latest_block = ethereum.web3.eth.blockNumber
                if not internal_options.stake_last_block:
                    internal_options.stake_last_block = latest_block

                logging.warning('  Last remembered block: {}, current last: {}'.format(internal_options.stake_last_block, latest_block))
                if internal_options.stake_last_block < latest_block:
                    if latest_block - internal_options.stake_last_block > 100:
                        latest_block = internal_options.stake_last_block + 100
                    logging.warning('  Checking blocks {} ~ {}'.format(internal_options.stake_last_block + 1, latest_block))

                    events = unichain_contract.events.Transfer().getLogs(fromBlock=internal_options.stake_last_block + 1, toBlock=latest_block)
                    for evt in events:
                        if evt.args.to == StakeDepositAddress.value():
                            from_ = evt.args['from']
                            to = evt.args.to
                            value = Decimal(evt.args.value) / unichain_dec

                            logging.warning('    Found UNCH transaction {} from {}'.format(evt.transactionHash.hex(), from_))
                            ps = PendingStake.objects.filter(user__username__iexact=from_).last()
                            if not ps:
                                logging.warning('      Pending stake was not found, skipping!')
                                continue

                            stake = UserStake.objects.create(user=ps.user, amount=value, length=ps.length,
                                                             finish=timezone.now() + timedelta(ps.length))
                            stake_bonus = value * ps.length * (
                                ps.user.custom_stake_profit if ps.user.custom_stake_profit != -1 else StakeProfit.value())
                            parts = [Decimal(uniform(.5, 1)) for _ in range(ps.length)]
                            total_parts = sum(parts)
                            parts = [part / total_parts for part in parts]
                            dt = timezone.now()
                            for part in parts:
                                dt += timedelta(1)
                                UserStakePayment.objects.create(stake=stake, amount=stake_bonus * part, datetime=dt)
                            logging.warning('Stake of {:.6f} UNCH for {} found: {}'.format(value, ps.user, evt.transactionHash.hex()))

                            ps.delete()
                internal_options.stake_last_block = latest_block

                for payment in UserStakePayment.objects.filter(datetime__date=timezone.now().date(), paid=False):  # type: UserStakePayment
                    with transaction.atomic():
                        user = payment.stake.user
                        payment.paid = True
                        payment.save()
                        user.stake_bonus_balance += payment.amount
                        user.save()
                        logging.warning('Paid {:.6f} to {}'.format(payment.amount, user))

                for stake in UserStake.objects.filter(finish__lt=timezone.now(), is_finished=False):  # type: UserStake
                    with transaction.atomic():
                        stake.is_finished = True
                        stake.save()
                        txid = unichain_contract.functions.transfer(
                            stake.user.username,
                            int(stake.amount * unichain_dec)
                        ).transact({
                            'from': StakeDepositAddress.value(),
                            'gasPrice': ethereum.web3.toWei(ERC20TransferGasPrice.value(), 'gwei'),
                        })
                        logging.warning('Stake #{} finished, sent {:.6f} UNCH: {}'.format(stake.pk, stake.amount, txid.hex()))
            except KeyboardInterrupt:
                return
            except:
                traceback.print_exc()

            try:
                time.sleep(5)
            except KeyboardInterrupt:
                return

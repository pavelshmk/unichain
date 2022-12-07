import logging
import time
import traceback

from django.core.management import BaseCommand
from django.db import transaction
from django.utils import timezone

from app.models import UserFarmingPayment, FarmingDeposit, OperationLog
from unichain.utils import REFERRAL_BONUSES, FARMING_BONUSES


class Command(BaseCommand):
    def handle(self, *args, **options):
        while True:
            try:
                for payment in UserFarmingPayment.objects.filter(datetime__date__lte=timezone.now().date(), paid=False, deposit__is_finished=False, deposit__is_destroyed=False):  # type: UserFarmingPayment
                    with transaction.atomic():
                        deposit = payment.deposit
                        deposit.profit_percent += payment.percent
                        deposit.daily_percent = payment.percent
                        user = deposit.user
                        payment.paid = True
                        payment.save()
                        user.usdt_balance += payment.amount
                        if payment.extra_percent:
                            deposit.extra_percent += payment.extra_percent
                            user.usdt_balance += deposit.amount * payment.extra_percent
                            referrer = user
                            for i, bonus in enumerate(FARMING_BONUSES):
                                referrer = referrer.referrer
                                if not referrer:
                                    break
                                referrer.usdt_balance += payment.amount * bonus
                                referrer.save()
                                OperationLog.create(referrer, OperationLog.Type.REFERRAL_BONUS,
                                                    usdt_change=payment.amount * bonus)
                        if payment.tokenx_amount:
                            deposit.extra_tokenx += payment.tokenx_amount
                        deposit.save()
                        user.save()
                        logging.warning('Paid {:.6f} to {}'.format(payment.amount, user))

                for deposit in FarmingDeposit.objects.filter(finish__lt=timezone.now(), is_finished=False, is_destroyed=False):  # type: FarmingDeposit
                    with transaction.atomic():
                        user = deposit.user
                        deposit.is_finished = True
                        deposit.save()
                        user.usdt_balance += deposit.amount
                        user.save()
                        logging.warning('Deposit #{} finished, returned {:.6f} USDT'.format(deposit.pk, deposit.amount))
            except KeyboardInterrupt:
                return
            except:
                traceback.print_exc()

            try:
                time.sleep(5)
            except KeyboardInterrupt:
                return

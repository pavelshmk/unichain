from decimal import Decimal

from django.contrib.auth.base_user import BaseUserManager, AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.db.models import TextChoices, Sum, F, ExpressionWrapper
from django.utils import timezone
from django.utils.crypto import get_random_string
from django.utils.timezone import now

from app.options import InternalOptions

internal_options = InternalOptions()


class FarmingCoin(TextChoices):
    USDT = 'usdt'
    CURVE = 'curve'
    SUSHI = 'sushi'
    FARM = 'farm'


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, username, password, **extra_fields):
        if not username:
            raise ValueError('Users must have a username')
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, username=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        return self._create_user(username, password, **extra_fields)

    def create_superuser(self, username, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')

        return self._create_user(username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=128, unique=True)
    name = models.CharField(max_length=128)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateField(auto_now_add=True)
    referrer = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='referrals')
    nonce = models.CharField(max_length=10, default='_')
    usdt_balance = models.DecimalField(max_digits=32, decimal_places=6, default=0)
    xfarm_balance = models.DecimalField(max_digits=32, decimal_places=6, default=0)
    total_bought = models.DecimalField(max_digits=32, decimal_places=6, default=0)
    total_farming = models.DecimalField(max_digits=32, decimal_places=6, default=0)
    _referral_code = models.CharField(max_length=16, null=True, blank=True)
    stake_bonus_balance = models.DecimalField(max_digits=32, decimal_places=6, default=0)
    custom_stake_profit = models.DecimalField(max_digits=5, decimal_places=2, default=-1, help_text='daily, -1 for global setting')

    objects = UserManager()

    USERNAME_FIELD = 'username'

    @property
    def total_stake_balance(self):
        return self.stake_bonus_balance + self.total_stakes

    @property
    def total_stakes(self):
        return self.stakes.filter(is_finished=False).aggregate(sum=Sum('amount'))['sum'] or 0

    @property
    def today_stake_bonus(self):
        return UserStakePayment.objects.filter(stake__user=self, datetime__date=timezone.now().date()).aggregate(sum=Sum('amount'))['sum'] or 0

    @property
    def referral_code(self):
        if not self._referral_code:
            self._referral_code = get_random_string(length=6, allowed_chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')
            self.save(update_fields=('_referral_code',))
        return self._referral_code

    @property
    def is_superuser(self):
        return self.is_staff

    def __str__(self):
        return '{} [{}]'.format(self.name, self.username)


class USDTWithdrawRequest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='withdraw_requests')
    address = models.CharField(max_length=64)
    withdraw_amount = models.DecimalField(max_digits=32, decimal_places=6, default=0)
    amount = models.DecimalField(max_digits=32, decimal_places=6)
    status = models.BooleanField(null=True)
    datetime = models.DateTimeField(default=now)
    erc20 = models.BooleanField(default=True)


class OperationLog(models.Model):
    class Type(TextChoices):
        UNICHAIN_PURCHASE = 'unichain_purchase', 'Unichain purchase'
        USDT_DEPOSIT = 'usdt_deposit', 'USDT deposit'
        USDT_WITHDRAW = 'usdt_withdraw', 'USDT withdraw',
        USDT_WITHDRAW_REJECT = 'usdt_withdraw_reject', 'USDT withdraw reject',
        XFARM_EXCHANGE = 'xfarm_exchange', 'XFarm exchange'
        REFERRAL_BONUS = 'referral_bonus', 'Referral bonus'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='operation_log')
    type = models.CharField(max_length=32, choices=Type.choices)
    usdt_change = models.DecimalField(max_digits=32, decimal_places=6, default=0)
    xfarm_change = models.DecimalField(max_digits=32, decimal_places=6, default=0)
    new_usdt_balance = models.DecimalField(max_digits=32, decimal_places=6, default=0)
    new_xfarm_balance = models.DecimalField(max_digits=32, decimal_places=6, default=0)
    info = models.TextField(null=True, blank=True)
    datetime = models.DateTimeField(default=now)

    @classmethod
    def create(cls, user: User, type_: Type, usdt_change: Decimal = 0, xfarm_change: Decimal = 0, info: str = None):
        cls.objects.create(user=user, type=type_, usdt_change=usdt_change, xfarm_change=xfarm_change,
                           new_usdt_balance=user.usdt_balance, new_xfarm_balance=user.xfarm_balance,
                           info=info)


class UserStake(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='stakes')
    amount = models.DecimalField(max_digits=32, decimal_places=6)
    length = models.PositiveIntegerField()
    started = models.DateTimeField(auto_now_add=True)
    finish = models.DateTimeField(null=True)
    is_finished = models.BooleanField(default=False)

    @property
    def profit(self):
        return self.payments.filter(paid=True).aggregate(sum=Sum('amount'))['sum'] or 0

    class Meta:
        ordering = '-pk',


class UserStakePayment(models.Model):
    stake = models.ForeignKey(UserStake, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=32, decimal_places=6)
    datetime = models.DateTimeField()
    paid = models.BooleanField(default=False)


class PendingStake(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pending_stakes')
    length = models.PositiveIntegerField()
    timeout = models.DateTimeField()


class FarmingDeposit(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='farming_deposits')
    coin = models.CharField(max_length=8, choices=FarmingCoin.choices)
    started = models.DateTimeField(auto_now_add=True)
    finish = models.DateTimeField(db_index=True)
    amount = models.DecimalField(max_digits=32, decimal_places=6)
    length = models.PositiveIntegerField()
    daily_percent = models.DecimalField(max_digits=32, decimal_places=16, default=0)
    extra_percent = models.DecimalField(max_digits=32, decimal_places=16, default=0)
    extra_tokenx = models.DecimalField(max_digits=32, decimal_places=6, default=0)
    profit_percent = models.DecimalField(max_digits=32, decimal_places=16, default=0)
    is_finished = models.BooleanField(default=False, db_index=True)
    is_destroyed = models.BooleanField(default=False, db_index=True)

    @property
    def days_passed(self):
        return min(int((timezone.now() - self.started).days), self.length)

    class Meta:
        ordering = '-pk',


class UserFarmingPayment(models.Model):
    deposit = models.ForeignKey(FarmingDeposit, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=32, decimal_places=6)
    percent = models.DecimalField(max_digits=32, decimal_places=16, null=True, blank=True)
    extra_percent = models.DecimalField(max_digits=32, decimal_places=16, null=True, blank=True)
    tokenx_amount = models.DecimalField(max_digits=32, decimal_places=6)
    datetime = models.DateTimeField()
    paid = models.BooleanField(default=False)


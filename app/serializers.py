from django.db.models import Sum
from django.db.models.functions import TruncDay
from django.utils import timezone
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from app.dynamic_preferences_registry import ExchangeDepositAddress, UnichainPrice, USDTDepositAddress, XFarmPrice, \
    StakeDepositAddress, WithdrawERC20Commission, WithdrawTRC20Commission
from app.models import User, USDTWithdrawRequest, UserStake, UserStakePayment, FarmingDeposit
from unichain.utils import REFERRAL_BONUSES


class SignUpSerializer(serializers.Serializer):
    address = serializers.CharField()
    name = serializers.CharField()
    referrer = serializers.CharField(allow_blank=True)
    signature = serializers.CharField()


class SignInSerializer(serializers.Serializer):
    address = serializers.CharField()
    signature = serializers.CharField()


class StakeSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStake
        fields = 'pk', 'amount', 'length', 'started', 'finish', 'is_finished', 'profit',


class ProfileSerializer(serializers.ModelSerializer):
    referrer = serializers.CharField(source='referrer.name', allow_null=True)
    settings = serializers.SerializerMethodField()
    referrals = serializers.SerializerMethodField()
    stakes = serializers.SerializerMethodField()
    invest_log = serializers.SerializerMethodField()
    farming_log = serializers.SerializerMethodField()

    def get_settings(self, obj):
        usdt_addresses = USDTDepositAddress.value().split(',')
        return {
            'exchange_deposit_address': ExchangeDepositAddress.value(),
            'unichain_price': UnichainPrice.value(),
            'xfarm_price': XFarmPrice.value(),
            'usdt_deposit_address': usdt_addresses[obj.pk % len(usdt_addresses)],
            'stake_deposit_address': StakeDepositAddress.value(),
            'erc20_withdraw_commission': WithdrawERC20Commission.value(),
            'trc20_withdraw_commission': WithdrawTRC20Commission.value(),
        }

    def get_referrals(self, obj):
        result = []
        for i, bonus in enumerate(REFERRAL_BONUSES, 1):
            referrals = User.objects.filter(**{'__'.join(['referrer'] * i): obj})
            lvl_obj = {'level': i, 'profit': bonus, 'referrals': []}
            for referral in referrals:
                masked_address = referral.username[:6] + '*****' + referral.username[-4:]
                lvl_obj['referrals'].append({
                    'name': referral.name,
                    'address': masked_address,
                    'total_bought': referral.total_bought,
                    'total_farming': referral.total_farming,
                })
            result.append(lvl_obj)
        return result

    def get_stakes(self, obj):
        return [StakeSerializer(instance=s).data for s in obj.stakes.filter(user=obj).order_by('-started')]

    def get_invest_log(self, obj: User):
        qs = UserStakePayment.objects\
            .filter(stake__user=obj, paid=True)\
            .annotate(date=TruncDay('datetime'))\
            .values('date')\
            .annotate(total_amount=Sum('stake__amount'), paid=Sum('amount'))\
            .order_by('-date')
        result = []
        for day in qs:
            result.append({
                'date': day['date'],
                'paid': day['paid'],
                'total_amount': day['total_amount'],
            })
        return result

    def get_farming_log(self, obj: User):
        return [FarmingDepositSerializer(instance=fs).data for fs in obj.farming_deposits.filter(is_finished=False).order_by('-pk')]

    class Meta:
        model = User
        fields = 'pk', 'username', 'name', 'referrer', 'referral_code', 'settings', 'usdt_balance', 'xfarm_balance', \
                 'referrals', 'stakes', 'stake_bonus_balance', 'total_stake_balance', 'today_stake_bonus', \
                 'total_stakes', 'invest_log', 'farming_log',


class WithdrawSerializer(serializers.Serializer):
    address = serializers.CharField()
    amount = serializers.DecimalField(max_digits=32, decimal_places=6)
    erc20 = serializers.BooleanField()

    def validate_amount(self, val):
        if val <= 0:
            raise ValidationError('Invalid amount')
        return val

    def validate(self, attrs):
        if attrs['erc20']:
            from unichain.crypto import ethereum
            try:
                attrs['address'] = ethereum.web3.toChecksumAddress(attrs['address'])
            except:
                raise ValidationError('Invalid Ethereum address')
        else:
            from trx_utils.address import is_address
            try:
                if not is_address(attrs['address']):
                    raise ValueError()
            except ValueError:
                raise ValidationError('Invalid Tron address')
        return attrs


class StakeWithdrawSerializer(serializers.Serializer):
    address = serializers.CharField()
    amount = serializers.DecimalField(max_digits=32, decimal_places=6)

    def validate_amount(self, val):
        if val <= 0:
            raise ValidationError('Invalid amount')
        return val

    def validate(self, attrs):
        from unichain.crypto import ethereum
        try:
            attrs['address'] = ethereum.web3.toChecksumAddress(attrs['address'])
        except:
            raise ValidationError('Invalid Ethereum address')
        return attrs


class XFarmExchangeSerializer(serializers.Serializer):
    give = serializers.DecimalField(max_digits=32, decimal_places=6)


class PrepareStakeSerializer(serializers.Serializer):
    length = serializers.IntegerField()


class FarmingDepositCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FarmingDeposit
        fields = 'coin', 'amount', 'length',


class FarmingDepositSerializer(serializers.ModelSerializer):
    class Meta:
        model = FarmingDeposit
        fields = 'pk', 'coin', 'amount', 'length', 'extra_tokenx', 'extra_percent', 'profit_percent', \
                 'started', 'days_passed', 'daily_percent', 'is_destroyed',


class FarmingWithdrawSerializer(serializers.Serializer):
    pk = serializers.IntegerField()

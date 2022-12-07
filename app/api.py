import logging
from datetime import timedelta
from decimal import Decimal
from random import randint, uniform
from uuid import uuid4

from django.core.cache import cache
from django.db import transaction
from django.utils import timezone
from django.utils.crypto import get_random_string
from rest_framework import exceptions
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from app.dynamic_preferences_registry import XFarmPrice, UnichainTokenAddress, StakeDepositAddress, \
    ERC20TransferGasPrice, FarmBaseProfit, Usdt150Bonus, Usdt300Bonus, Usdt300TokenXBonus, UsdtBaseProfit, \
    CurveBaseProfit, Curve200Bonus, Curve350Bonus, Curve350TokenXBonus, SushiBaseProfit, Sushi250Bonus, \
    Sushi250TokenXBonus, Sushi125Bonus, Farm200Bonus, Farm200TokenXBonus, Farm120Bonus, WithdrawERC20Commission, \
    WithdrawTRC20Commission
from app.models import User, USDTWithdrawRequest, OperationLog, PendingStake, FarmingDeposit, UserFarmingPayment
from app.serializers import SignUpSerializer, SignInSerializer, ProfileSerializer, WithdrawSerializer, \
    XFarmExchangeSerializer, PrepareStakeSerializer, FarmingDepositCreateSerializer, FarmingWithdrawSerializer, \
    StakeWithdrawSerializer
from unichain.crypto import ethereum
from unichain.utils import Conflict, CsrfExemptSessionAuthentication, REFERRAL_BONUSES


class NonceAPIView(GenericAPIView):
    authentication_classes = ()
    permission_classes = AllowAny,

    def get(self, request: Request):
        address = request.query_params.get('address')
        try:
            user = User.objects.get(username=address)
            return Response({'nonce': user.nonce})
        except User.DoesNotExist:
            return Response({'nonce': None})


class SignUpAPIView(GenericAPIView):
    serializer_class = SignUpSerializer
    permission_classes = AllowAny,
    authentication_classes = CsrfExemptSessionAuthentication,

    def post(self, request: Request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        address = serializer.validated_data['address']
        name = serializer.validated_data['name']
        referrer = serializer.validated_data['referrer']
        signature = serializer.validated_data['signature']

        if address != ethereum.recover_message('SignupRequest', signature):
            raise exceptions.AuthenticationFailed('Invalid signature')

        if User.objects.filter(username=address).exists():
            raise Conflict('Address is already registered')

        if User.objects.filter(name__iexact=name).exists():
            raise Conflict('Nickname is already in use')

        if referrer:
            try:
                referrer = User.objects.get(_referral_code=referrer)
            except:
                raise NotFound('Referrer was not found')
        else:
            referrer = None

        user = User.objects.create(username=address, name=name, referrer=referrer, nonce=get_random_string(10))

        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key})


class SignInAPIView(GenericAPIView):
    serializer_class = SignInSerializer
    permission_classes = AllowAny,
    authentication_classes = CsrfExemptSessionAuthentication,

    def post(self, request: Request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        address = serializer.validated_data['address']
        signature = serializer.validated_data['signature']

        try:
            user = User.objects.get(username=address)

            if address != ethereum.recover_message('LoginRequest ' + user.nonce, signature):
                raise exceptions.AuthenticationFailed('Invalid signature')

            user.nonce = get_random_string(10)
            user.save()
        except User.DoesNotExist:
            raise NotFound('Not registered')

        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key})


class ProfileAPIView(GenericAPIView):
    serializer_class = ProfileSerializer
    permission_classes = IsAuthenticated,

    def get(self, request: Request):
        serializer = self.get_serializer(instance=request.user)
        return Response(serializer.data)


class USDTWithdrawAPIView(GenericAPIView):
    serializer_class = WithdrawSerializer
    permission_classes = IsAuthenticated,

    def post(self, request: Request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user

        amount = serializer.validated_data['amount']
        address = serializer.validated_data['address']
        erc20 = serializer.validated_data['erc20']

        min_amount = 50 if erc20 else 25

        if amount < min_amount:
            raise ValidationError('Minimal amount is {} USDT'.format(min_amount))
        if user.usdt_balance < amount:
            raise ValidationError('Insufficient funds')

        user.usdt_balance -= amount
        user.save()

        withdraw_amount = amount - WithdrawERC20Commission.value() if erc20 else WithdrawTRC20Commission.value()
        USDTWithdrawRequest.objects.create(user=user, address=address, amount=amount, withdraw_amount=withdraw_amount, erc20=erc20)
        OperationLog.create(user, OperationLog.Type.USDT_WITHDRAW, usdt_change=amount)

        return Response()


class XFarmExchangeAPIView(GenericAPIView):
    serializer_class = XFarmExchangeSerializer
    permission_classes = IsAuthenticated,

    def post(self, request: Request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        give = serializer.validated_data['give']

        if user.xfarm_balance < give:
            raise ValidationError('Insufficient funds')

        user.xfarm_balance -= give
        usdt_delta = give * XFarmPrice.value()
        user.usdt_balance += usdt_delta
        user.save()
        OperationLog.create(user, OperationLog.Type.XFARM_EXCHANGE, usdt_change=-usdt_delta, xfarm_change=give)

        return Response()


class PrepareStakeAPIView(GenericAPIView):
    serializer_class = PrepareStakeSerializer
    permission_classes = IsAuthenticated,

    def post(self, request: Request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        length = serializer.validated_data['length']

        if length < 30 or length > 1095:
            raise ValidationError('Length should be not less than 30 days and not more than 1095 days')

        PendingStake.objects.create(user=user, length=length, timeout=timezone.now() + timedelta(1))

        return Response()


class StakeWithdrawAPIView(GenericAPIView):
    serializer_class = StakeWithdrawSerializer
    permission_classes = IsAuthenticated,

    def post(self, request: Request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        amount = serializer.validated_data['amount']
        address = serializer.validated_data['address']

        if user.stake_bonus_balance < amount:
            raise ValidationError('Insufficient funds')

        with transaction.atomic():
            user.stake_bonus_balance -= amount
            user.save()

            unichain_contract = ethereum.erc20_contract(UnichainTokenAddress.value())
            unichain_dec = 10 ** unichain_contract.functions.decimals().call()

            print(StakeDepositAddress.value())
            unlock = ethereum.web3.parity.personal.unlock_account(StakeDepositAddress.value(), '')
            txid = unichain_contract.functions.transfer(
                address,
                int(amount * unichain_dec)
            ).transact({
                'from': StakeDepositAddress.value(),
                'gasPrice': ethereum.web3.toWei(ERC20TransferGasPrice.value(), 'gwei'),
            })
            logging.warning('{:.6} UNCH sent to {}: {}'.format(amount, address, txid.hex()))

            # OperationLog.create(user, OperationLog.Type.USDT_WITHDRAW, usdt_change=amount)

        return Response()


class FarmingDepositAPIView(GenericAPIView):
    serializer_class = FarmingDepositCreateSerializer
    permission_classes = IsAuthenticated,

    def post(self, request: Request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        coin = serializer.validated_data['coin']
        length = serializer.validated_data['length']
        amount = serializer.validated_data['amount']
        user = request.user

        if amount > user.usdt_balance:
            raise ValidationError('Insufficient funds')
        if amount < 100:
            raise ValidationError('Min amount is 100 USDT')
        if coin in ['usdt', 'sushi'] and length < 60 or coin in ['curve', 'farm'] and length < 75:
            raise ValidationError('Length is too small')

        user.usdt_balance -= amount
        user.total_farming += amount
        user.save()
        deposit = FarmingDeposit(user=user, coin=coin, length=length, amount=amount,
                                 finish=timezone.now() + timedelta(length))
        deposit.save()

        referrer = user
        for i, bonus in enumerate(REFERRAL_BONUSES):
            referrer = referrer.referrer
            if not referrer:
                break
            referrer.usdt_balance += amount * bonus
            referrer.save()
            OperationLog.create(referrer, OperationLog.Type.REFERRAL_BONUS,
                                usdt_change=amount * bonus)

        profit_percent = 0
        if coin == 'usdt':
            profit_percent = UsdtBaseProfit.value()
        elif coin == 'curve':
            profit_percent = CurveBaseProfit.value()
        elif coin == 'sushi':
            profit_percent = SushiBaseProfit.value()
        elif coin == 'farm':
            profit_percent = FarmBaseProfit.value()

        parts = [Decimal(uniform(.5, 1)) for _ in range(length)]
        total_parts = sum(parts)
        parts = [part / total_parts for part in parts]
        dt = timezone.now()
        for day, part in enumerate(parts, 1):
            dt += timedelta(1)
            extra_percent = 0
            tokenx_amount = 0
            if coin == 'usdt':
                if day == 150:
                    extra_percent = Usdt150Bonus.value()
                elif day == 300:
                    extra_percent = Usdt300Bonus.value()
                    tokenx_amount = Usdt300TokenXBonus.value()
            elif coin == 'curve':
                if day == 200:
                    extra_percent = Curve200Bonus.value()
                elif day == 350:
                    extra_percent = Curve350Bonus.value()
                    tokenx_amount = Curve350TokenXBonus.value()
            elif coin == 'sushi':
                if day == 125:
                    extra_percent = Sushi125Bonus.value()
                elif day == 250:
                    extra_percent = Sushi250Bonus.value()
                    tokenx_amount = Sushi250TokenXBonus.value()
            elif coin == 'farm':
                if day == 120:
                    extra_percent = Farm120Bonus.value()
                elif day == 200:
                    extra_percent = Farm200Bonus.value()
                    tokenx_amount = Farm200TokenXBonus.value()
            UserFarmingPayment.objects.create(deposit=deposit,
                                              amount=amount * length * profit_percent * part,
                                              extra_percent=extra_percent,
                                              tokenx_amount=tokenx_amount,
                                              percent=length * profit_percent * part,
                                              datetime=dt)

        return Response(status=201)


class FarmingWithdrawAPIView(GenericAPIView):
    serializer_class = FarmingWithdrawSerializer
    permission_classes = IsAuthenticated,

    def post(self, request: Request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        pk = serializer.validated_data['pk']

        try:
            deposit = FarmingDeposit.objects.get(pk=pk, user=user, is_finished=False, is_destroyed=False)
            deposit.is_finished = True
            deposit.save()
            days_passed = deposit.days_passed
            multiplier = Decimal(1)
            if deposit.coin == 'usdt' and days_passed < 60:
                multiplier = Decimal('.85')
            elif deposit.coin == 'curve' and days_passed < 75:
                multiplier = Decimal('.8')
            elif deposit.coin == 'sushi' and days_passed < 60:
                multiplier = Decimal('.7')
            elif deposit.coin == 'farm' and days_passed < 75:
                multiplier = Decimal('.6')
            user.usdt_balance += deposit.amount * multiplier
            user.save()
        except FarmingDeposit.DoesNotExist:
            raise NotFound('Deposit was not found')

        return Response()

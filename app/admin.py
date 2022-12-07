import traceback

from admin_actions.admin import ActionsModelAdmin
from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group
from django.http import HttpResponseRedirect
from django.shortcuts import redirect
from django.urls import reverse

from app.dynamic_preferences_registry import USDTTokenAddress, USDTDepositAddress, ERC20TransferGasPrice
from app.forms import UserChangeForm, UserCreationForm
from app.models import User, USDTWithdrawRequest, OperationLog, UserStake, UserStakePayment, FarmingDeposit, \
    UserFarmingPayment
from unichain.crypto import ethereum


@admin.register(User)
class UserAdmin(ActionsModelAdmin, BaseUserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm

    list_display = 'username', 'name', 'is_staff',
    fieldsets = (
        (None, {
            'fields': ('username', 'password', 'referrer', '_referral_code', 'usdt_balance', 'xfarm_balance', 'total_bought', 'custom_stake_profit', 'stake_bonus_balance')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff',)
        }),
        ('Important dates', {
            'fields': ('last_login', 'date_joined')
        })
    )
    add_fieldsets = (
        (None, {'fields': ('username', 'password1', 'password2', 'is_active')}),
    )
    search_fields = 'username', 'name',
    ordering = 'username',
    readonly_fields = 'last_login', 'date_joined',
    filter_horizontal = ()
    list_filter = ('is_staff',)
    actions_row = actions_detail = 'operation_log',
    autocomplete_fields = 'referrer',

    def operation_log(self, request, pk):
        user = User.objects.get(pk=pk)
        return HttpResponseRedirect(reverse('admin:app_operationlog_changelist') + '?q=' + user.username)
    operation_log.short_description = 'Operation log'


@admin.register(USDTWithdrawRequest)
class USDTWithdrawRequestAdmin(ActionsModelAdmin):
    list_display = 'user', 'amount', 'status', 'erc20',
    list_filter = 'status', 'erc20',

    actions_row = actions_detail = 'confirm_wr', 'reject_wr',

    def confirm_wr(self, request, pk):
        wr = USDTWithdrawRequest.objects.get(pk=pk)  # type: USDTWithdrawRequest
        if wr.status is not None:
            messages.error(request, 'This request is already processed')
            return redirect('admin:app_usdtwithdrawrequest_changelist')

        if not wr.erc20:
            messages.error(request, 'Could not automatically process TRC20 withdraws')
            return redirect('admin:app_usdtwithdrawrequest_changelist')

        try:
            ethereum.web3.parity.personal.unlock_account(USDTDepositAddress.value(), '')
            usdt_contract = ethereum.erc20_contract(USDTTokenAddress.value())
            usdt_dec = 10 ** usdt_contract.functions.decimals().call()
            txid = usdt_contract.functions.transfer(wr.address, int(wr.withdraw_amount * usdt_dec)).transact({
                'from': USDTDepositAddress.value().split(',')[0],
                'gasPrice': ethereum.web3.toWei(ERC20TransferGasPrice.value(), 'gwei'),
            })
            wr.status = True
            wr.save()
            messages.success(request, 'Transaction sent, txid: {}'.format(txid.hex()))
            return redirect('admin:app_usdtwithdrawrequest_changelist')
        except Exception as e:
            traceback.print_exc()
            messages.error(request, 'An error has occurred: {}. See logs for more info'.format(e))
            return redirect('admin:app_usdtwithdrawrequest_changelist')
    confirm_wr.short_description = 'Confirm'

    def reject_wr(self, request, pk):
        wr = USDTWithdrawRequest.objects.get(pk=pk)
        if wr.status is not None:
            messages.error(request, 'This request is already processed')
            return redirect('admin:app_usdtwithdrawrequest_changelist')

        wr.user.usdt_balance += wr.amount
        wr.user.save()
        wr.status = False
        wr.save()

        messages.success(request, 'Request was successfully rejected')
        return redirect('admin:app_usdtwithdrawrequest_changelist')
    reject_wr.short_description = 'Reject'


@admin.register(OperationLog)
class OperationLogAdmin(admin.ModelAdmin):
    list_display = 'user', 'type', 'usdt_change', 'xfarm_change', 'info', 'datetime',
    search_fields = 'user__username', 'user__name',


@admin.register(UserStake)
class UserStakeAdmin(admin.ModelAdmin):
    list_display = 'user', 'amount', 'started', 'length', 'is_finished',
    search_fields = 'user__username', 'user__name',


@admin.register(UserStakePayment)
class UserStakePaymentAdmin(admin.ModelAdmin):
    list_display = 'stake', 'amount', 'datetime', 'paid',
    search_fields = 'stake__user__username', 'stake__user__name',


@admin.register(FarmingDeposit)
class FarmingDepositAdmin(admin.ModelAdmin):
    list_display = 'user', 'amount', 'started', 'length', 'profit_percent', 'is_finished',
    search_fields = 'user__username', 'user__name',


@admin.register(UserFarmingPayment)
class UserFarmingPaymentAdmin(admin.ModelAdmin):
    list_display = 'deposit', 'amount', 'datetime', 'paid',
    search_fields = 'deposit__user__username', 'deposit__user__name',


admin.site.unregister(Group)

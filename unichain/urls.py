from django.contrib import admin
from django.urls import path, re_path

from app.api import NonceAPIView, SignUpAPIView, SignInAPIView, ProfileAPIView, USDTWithdrawAPIView, \
    XFarmExchangeAPIView, StakeWithdrawAPIView, PrepareStakeAPIView, FarmingDepositAPIView, FarmingWithdrawAPIView
from app.views import IndexView

urlpatterns = [
    re_path('^(|signup|cabinet(|/dashboard|/invest|/farming))$', IndexView.as_view()),
    path('api/nonce/', NonceAPIView.as_view()),
    path('api/signup/', SignUpAPIView.as_view()),
    path('api/signin/', SignInAPIView.as_view()),
    path('api/profile/', ProfileAPIView.as_view()),
    path('api/usdt_withdraw/', USDTWithdrawAPIView.as_view()),
    path('api/xfarm_exchange/', XFarmExchangeAPIView.as_view()),
    path('api/prepare_stake/', PrepareStakeAPIView.as_view()),
    path('api/stake_withdraw/', StakeWithdrawAPIView.as_view()),
    path('api/farming_deposit/', FarmingDepositAPIView.as_view()),
    path('api/farming_withdraw/', FarmingWithdrawAPIView.as_view()),
    path('admin_panel_unichain/', admin.site.urls),
]

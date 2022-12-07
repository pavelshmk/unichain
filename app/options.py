from dbsettings import Group, IntegerValue


class InternalOptions(Group):
    exchange_usdt_last_block = IntegerValue()
    deposit_usdt_last_block = IntegerValue()
    stake_last_block = IntegerValue()

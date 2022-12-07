import json

from django.core.cache import cache
from eth_account.messages import encode_defunct
from web3 import Web3, HTTPProvider

from app.dynamic_preferences_registry import EthereumNodeURI
from unichain.settings import BASE_DIR

with open(BASE_DIR / 'unichain' / 'erc20.abi.json') as f:
    erc20_abi = json.load(f)


class Ethereum:
    @property
    def web3(self):
        return Web3(HTTPProvider(EthereumNodeURI.value()))

    @property
    def web3_short_timeout(self):
        return Web3(HTTPProvider(EthereumNodeURI.value(), request_kwargs={'timeout': 1}))

    def create_address(self):
        return self.web3.geth.personal.new_account('')

    def validate_address(self, address):
        return self.web3.isAddress(address)

    def normalize_address(self, address):
        return self.web3.toChecksumAddress(address)

    def recover_message(self, message: str, signature: str):
        h = encode_defunct(text=message)
        return self.web3.eth.account.recover_message(h, signature=signature)

    def get_transaction_count(self, address: str):
        return self.web3.eth.getTransactionCount(address)

    def erc20_contract(self, address: str):
        return self.web3.eth.contract(address=address, abi=erc20_abi)

    def send_raw_transaction(self, raw_tx):
        return self.web3.eth.sendRawTransaction(raw_tx)


ethereum = Ethereum()

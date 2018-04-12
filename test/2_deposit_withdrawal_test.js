var tokenContract = artifacts.require("./Token.sol")
var exchangeContract = artifacts.require("./Exchange.sol")

contract("Exchange", function(accounts) {

    var tokenSymbol = "TKN"

    it ("is be able to add tokens", function() {
        var _tokenContractInstance
        var _exchangeContractInstance
        return tokenContract.deployed().then(function(tInstance) {
            _tokenContractInstance = tInstance
            return exchangeContract.deployed()
        }).then(function(eInstance) {
            _exchangeContractInstance = eInstance
            return _exchangeContractInstance.addToken(tokenSymbol, _tokenContractInstance.address)
        }).then(function(txResult) {
            assert.equal(txResult.logs[0].event, "TokenAddedToSystem", "Token added to system event should be emitted")
            return _exchangeContractInstance.hasToken.call(tokenSymbol)
        }).then(function(hasToken) {
            assert.equal(hasToken, true, "The token was not added")
            return _exchangeContractInstance.hasToken.call("Something")
        }).then(function(hasToken) {
            assert.equal(hasToken, false, "A token that was not added was found")
        })
    })

    it("is be able to deposit/withdraw ether", function() {
        var _exchangeContractInstance
        var _account = accounts[0]
        var _accountDepositedBalance
        var _amount = web3.toWei(1, 'ether')

        return exchangeContract.deployed().then(function(instance) {
            _exchangeContractInstance = instance

            return _exchangeContractInstance.depositEther({ from: _account, value: _amount })
        }).then(function(txResult) {
            assert.equal(txResult.logs[0].event, "DepositForEther", "Deposit ether transaction did not go through")
            return _exchangeContractInstance.getEthBalanceInWei.call({ from: _account })
        }).then(function(balance) {
            _accountDepositedBalance = balance
            assert.equal(_accountDepositedBalance, _amount, "Ether not deposited")

            return _exchangeContractInstance.withdrawEther(_accountDepositedBalance, { from: _account })
        }).then(function(txResult) {
            assert.equal(txResult.logs[0].event, "WithdrawalForEther", "Withdrawal ether transaction did not go through")
            return _exchangeContractInstance.getEthBalanceInWei.call({ from: _account })
        }).then(function(balance) {
            assert.equal(balance, 0, "Ether not withdrawn")
        })
    })

    it("is be able to deposit tokens", function() {
        var _exchangeContractInstance
        var _tokenContractInstance

        var _amount = 1000

        return tokenContract.deployed().then(function(iInstance) {
            _tokenContractInstance = iInstance
            return exchangeContract.deployed()
        }).then(function(eInstance) {
            _exchangeContractInstance = eInstance
            return _tokenContractInstance.approve(_exchangeContractInstance.address, _amount)
        }).then(function(txResult) {
            return _exchangeContractInstance.depositToken(tokenSymbol, _amount)
        }).then(function(txResult) {
            return _exchangeContractInstance.getBalance(tokenSymbol)
        }).then(function(balance) {
            assert.equal(balance, _amount, "Tokens not deposited")
        })
    })

    it("is be able to withdraw tokens", function() {
            var _exchangeContractInstance
            var _tokenContractInstance

            var _balanceInExchangeBeforeWithdrawal;
            var _balanceInAccountBeforeWithdrawal;
            var _balanceInExchangeAfterWithdrawal;
            var _balanceInAccountAfterWithdrawal;

            var _account = accounts[0]

            return tokenContract.deployed().then(function(iInstance) {
                _tokenContractInstance = iInstance
                return exchangeContract.deployed()
            }).then(function(eInstance) {
                _exchangeContractInstance = eInstance
                return _exchangeContractInstance.getBalance.call(tokenSymbol)
            }).then(function(balance) {
                _balanceInExchangeBeforeWithdrawal = balance.toNumber()
                return _tokenContractInstance.balanceOf.call(_account)
            }).then(function(balance) {
                _balanceInAccountBeforeWithdrawal = balance.toNumber()
                return _exchangeContractInstance.withdrawToken(tokenSymbol, _balanceInExchangeBeforeWithdrawal)
            }).then(function(txResult) {
                return _exchangeContractInstance.getBalance.call(tokenSymbol)
            }).then(function(balance) {
                _balanceInExchangeAfterWithdrawal = balance.toNumber()
                return _tokenContractInstance.balanceOf.call(_account)
            }).then(function(balance) {
                _balanceInAccountAfterWithdrawal = balance.toNumber()

                assert.equal(_balanceInExchangeAfterWithdrawal, 0, "There should be 0 tokens left in the exchange");
                assert.equal(_balanceInAccountAfterWithdrawal, _balanceInExchangeBeforeWithdrawal + _balanceInAccountBeforeWithdrawal, "There should be 0 tokens left in the exchange");
            })
        })
})
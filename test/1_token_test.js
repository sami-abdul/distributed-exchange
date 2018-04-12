var tokenContract = artifacts.require("./Token.sol")
var exchangeContract = artifacts.require("./Exchange.sol")

contract('Token', function(accounts) {
    it("is able to allocate the total supply to the owner's account", function() {
        var _totalSupply;
        var _tokenInstance;
        return tokenContract.deployed().then(function(instance) {
            _tokenInstance = instance;
            return _tokenInstance.totalSupply.call();
        }).then(function(totalSupply) {
            _totalSupply = totalSupply.toNumber()
            return _tokenInstance.balanceOf.call(accounts[0]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), _totalSupply,
                "Total _amount of tokens not owned by owner")
        })
    })

    it("is able to allocate no tokens to any other account", function() {
        var _tokenInstance;
        return tokenContract.deployed().then(function(instance) {
            _tokenInstance = instance;
            return _tokenInstance.balanceOf.call(accounts[1])
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 0,
                "No tokens owned by some other address")
        })
    })

    it("is able to transact tokens correctly", function() {
        var _tokenInstance;
        var _exchangeInstance;

        var _accountOne = accounts[0]; var _accountTwo = accounts[1];
        var _accountOneStartingBalance, _accountTwoStartingBalance;
        var _accountOneEndingBalance, _accountTwoEndingBalance;
        var _amount = 10

        return tokenContract.deployed().then(function(instance) {
            _tokenInstance = instance;
            return _tokenInstance.balanceOf.call(_accountOne)
        }).then(function(balance) {
            _accountOneStartingBalance = balance.toNumber()
            return _tokenInstance.balanceOf.call(_accountTwo)
        }).then(function(balance) {
            _accountTwoStartingBalance = balance.toNumber()
            return _tokenInstance.transfer(_accountTwo, _amount, { from: _accountOne })
        }).then(function() {
            return _tokenInstance.balanceOf.call(_accountOne)
        }).then(function(balance) {
            _accountOneEndingBalance = balance.toNumber()
            return _tokenInstance.balanceOf.call(_accountTwo)
        }).then(function(balance) {
            _accountTwoEndingBalance = balance.toNumber()

            assert.equal(_accountOneEndingBalance, _accountOneStartingBalance - _amount,
                "Amount wasn't correctly taken from the sender")
            assert.equal(_accountTwoEndingBalance, _accountTwoStartingBalance + _amount,
                "Amount wasn't correctly sent to the receiver")
        })
    })
})
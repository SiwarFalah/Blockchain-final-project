//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract CLC is ERC20 {
    constructor() ERC20('CryptoLionCoin', 'CLC') {
        _mint(address(this), 100000 * 10**decimals());
    }

    function buyCoin() public payable {
        require(balanceOf(address(this)) > msg.value, 'Not enough tokens');
        _transfer(address(this), msg.sender, msg.value);
    }
}

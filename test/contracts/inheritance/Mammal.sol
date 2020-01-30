pragma solidity ^0.5.6;

import "./Animal.sol";
import "./IMammal.sol";

contract Mammal is IMammal, Animal {
    constructor() public {
        //
    }
}

pragma solidity ^0.5.6;

import "./Mammal.sol";
import "./Quadruped.sol";
import "./WildLife.sol";

contract Lion is Mammal, Quadruped, WildLife {
    constructor() public {
        //
    }
}

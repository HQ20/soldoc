pragma solidity ^0.5.6;

/**
 * @title An ignore test
 */
contract Ignore {
    // soldoc-ignore
    function ignoredAlone(uint256 rings) external pure returns (uint256) {
        return rings + 1;
    }

    // solium-disable-next-line soldoc-ignore
    function ignoredCombined(uint256 rings) external pure returns (uint256) {
        return rings + 1;
    }
}

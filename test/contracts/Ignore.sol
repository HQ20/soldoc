pragma solidity ^0.5.6;

/**
 * @title An ignore test
 */
contract Ignore {
    // soldoc-ignore
    function ignoredAlone(uint256 rings) external pure returns (uint256) {
        return rings + 1;
    }

    // soldoc-ignore
    // solium-disable-next-line
    function ignoredCombined(uint256 rings) external pure returns (uint256) {
        return rings + 1;
    }
}

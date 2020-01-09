pragma solidity ^0.5.6;

/**
 * @title An ignore test
 */
contract Ignore {
    /// @dev soldoc-ignore
    function ignoredAlone(uint256 rings) external pure returns (uint256) {
        return rings + 1;
    }

    /// @dev soldoc-ignore
    // solium-disable-next-line
    function ignoredCombined(uint256 rings) external pure returns (uint256) {
        return rings + 1;
    }
}

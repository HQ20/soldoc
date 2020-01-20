pragma solidity ^0.5.6;


/**
 * @title A simulator for trees
 * @author Larry A. Gardner
 * @notice You can use this contract for only the most basic simulation
 * @dev All function calls are currently implemented without side effects
 */
contract Tree {
    /**
     * @author Mary A. Botanist
     * @notice Calculate tree age in years, rounded up, for live trees
     * @dev The Alexandr N. Tetearing algorithm could increase precision
     * @param rings The number of rings from dendrochronological sample
     * @return age in years, rounded up for partial years
     */
    function age(uint256 rings) external pure returns (uint256) {
        return rings + 1;
    }

    /// @dev The Alexandr N. Tetearing algorithm could increase precision
    function reverseAge(uint256 rings) external pure returns (uint256) {
        return rings - 1;
    }
}

pragma solidity ^0.5.8;

/**
 * @title The Plane contract :airplane:
 * @author Wilbur & Orville
 */
contract Plane {
    bytes32 private name;

    /**
     * @author Bernardo Vieira
     * @notice This is a plane event
     * @dev Emitted by land function
     * @param _time The time it lands
     */
    event Land(uint256 _time);

    /**
     * @author Bernardo Vieira
     * @notice This is a plane constructor
     * @dev May flight, or may not
     * @param _name The plane name
     */
    constructor(bytes32 _name) public {
        name = _name;
    }

    function land() external returns (uint256) {
        emit Land(5);
        return 5;
    }
}

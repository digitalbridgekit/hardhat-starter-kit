pragma solidity ^0.8.7;


interface KeeperCompatibleInterface {
    function checkUpkeep(bytes calldata checkData) external returns (bool upkeepNeeded, bytes memory performData);
    function performUpkeep(bytes calldata performData) external;
}

contract KeeperSimulation {
    /**
    * 
    */
    KeeperCompatibleInterface public counterInstance;
    bool private upkeepNeeded;
    bytes public performData;
    bytes public value = '0x00';

    
    constructor(address _counterContractAddress) {
        counterInstance = KeeperCompatibleInterface(_counterContractAddress);
      
    }


    function checkUpkeep() public {
        (upkeepNeeded, performData) = counterInstance.checkUpkeep(value);
        if (upkeepNeeded) {
            counterInstance.performUpkeep(value);
        }
    }
     
    function getUpkeepNeeded() public view returns (bool) {
        return upkeepNeeded;
    }

}
    

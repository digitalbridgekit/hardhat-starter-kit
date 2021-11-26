# Example code to understand Chainlink Keepers

 * To understand what are Chainlink Keepers please read the following docs
   *  [Introduction to Chainlink Keepers](https://docs.chain.link/docs/chainlink-keepers/introduction/)
   *  [Keepers Network Overview](https://docs.chain.link/docs/chainlink-keepers/overview/)
  
## Requirements

- [NPM](https://www.npmjs.com/) or [YARN](https://yarnpkg.com/)
- Chainlink Hardhat Box

## Installation

```bash
git clone https://github.com/digitalbridgekit/hardhat-starter-kit.git
cd hardhat-starter-kit
```
then

```bash
npm install
```

Or

```bash
yarn
```

## Example context
## The Counter contract 

The follow contract implements KeeperCompatibleInterface interface this interface able the contract to be called by a keeper.


```
pragma solidity ^0.8.7;


interface KeeperCompatibleInterface {
    function checkUpkeep(bytes calldata checkData) external returns (bool upkeepNeeded, bytes memory performData);
    function performUpkeep(bytes calldata performData) external;
}

contract Counter is KeeperCompatibleInterface {
    /**
    * Public counter variable
    */
    uint public counter;

    /**
    * Use an interval in seconds and a timestamp to slow execution of Upkeep
    */
    uint public immutable interval;
    uint public lastTimeStamp;
    
    constructor(uint updateInterval) public {
      interval = updateInterval;
      lastTimeStamp = block.timestamp;

      counter = 0;
    }

    function checkUpkeep(bytes calldata checkData) external override returns (bool upkeepNeeded, bytes memory performData) {
        upkeepNeeded = (block.timestamp - lastTimeStamp) > interval;

        // We don't use the checkData in this example
        // checkData was defined when the Upkeep was registered
        performData = checkData;
    }

    function performUpkeep(bytes calldata performData) external override {
        lastTimeStamp = block.timestamp;
        counter = counter + 1;

        // We don't use the performData in this example
    }
}
```
## The KeeperSimulation contract 

As the Counter contract is defined to be called by an external contract, it's necessary to deploy an auxiliary contract to call the Counter contract, simulating a Keeper call.

```
pragma solidity ^0.8.7;


interface KeeperCompatibleInterface {
    function checkUpkeep(bytes calldata checkData) external returns (bool upkeepNeeded, bytes memory performData);
    function performUpkeep(bytes calldata performData) external;
}

contract KeeperSimulation {
    
    KeeperCompatibleInterface public counterInstance;
    bool private upkeepNeeded;
    bytes public performData;
    bytes public value = '0x00';
    
    constructor(address _counterContractAddress) public {
        counterInstance = KeeperCompatibleInterface(_counterContractAddress);
      
    }

    function checkUpkeep() public {
        (upkeepNeeded, performData) = counterInstance.checkUpkeep(value);
        if (upkeepNeeded) {
            counterInstance.performUpkeep(value);
        }
    }

    function getUpkeepNeeded() public returns (bool) {
        return upkeepNeeded;
    }

}
```
## Steps to deploy and test the contract and understand how the Keepers works

### The first step is run hardhat as local node

```
user@host:~/keeper/hardhat-starter-kit$ npx hardhat node
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

### The second step is deploy the contracts

 * In a different terminal execute: npx hardhat deploy --network localhost --tags keepers

```
user@host:~/keeper/hardhat-starter-kit$ npx hardhat deploy --network localhost --tags keepers
deploying "Counter" (tx: 0xd4d0a5677a74f16d1f81f183ae1d1707bdadaf07f30eeb6b6dbaac36fd5aab17)...: deployed at 0x9E545E3C0baAB3E08CdfD552C960A1050f373042 with 318617 gas
Head to https://keepers.chain.link/ to register your contract for upkeeps. Then run the following command to track the counter updates
npx hardhat read-keepers-counter --contract 0x9E545E3C0baAB3E08CdfD552C960A1050f373042 --network localhost
----------------------------------------------------
deploying "KeeperSimulation" (tx: 0xcc12b04d1df754640b4d80ded5b0006074f8d8eb4d4629b2db0306dd78afd289)...: deployed at 0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9 with 598338 gas
Run Keeper simulation contract with following command:
npx hardhat keeper-test --contract 0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9 --network localhost
----------------------------------------------------
```

### Then to understand how it works

The Counter contract has:
 * 30 seconds as interval value
 * The counter it's initialized in 0
 * lastimestamp is initalized with the timestamp of the block when the contract is deployed.

* To read the current state excecute npx hardhat read-keepers-counter --contract 0x9E545E3C0baAB3E08CdfD552C960A1050f373042 --network localhost
```
user@host:~/keeper/hardhat-starter-kit$ npx hardhat read-keepers-counter --contract 0x9E545E3C0baAB3E08CdfD552C960A1050f373042 --network localhost
Reading counter from Keepers contract  0x9E545E3C0baAB3E08CdfD552C960A1050f373042  on network  localhost

Last timestamp is:  1637791019
Counter is:  0
```

The counter in 0 value implie that the keeper never executed the preformUpkeep function

* Now execute the contract that simulates the keeper: npx hardhat keeper-test --contract 0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9 --network localhost
```
user@host:~/keeper/hardhat-starter-kit$ npx hardhat keeper-test --contract 0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9 --network localhost
Calling Keeper simulator contract  0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9  on network  localhost
Contract  0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9  external data request successfully called. Transaction Hash:  0x47b244eb920c50dd3e06a79bb4555211f4c5bb0ab920dd361943b58db97f98e4

The status of this upkeep is currently:  true

```
As the checkUpkeep function responds true the performUpkeep function is executed in the same way that happends with the keeper.

Now you can read the status again to verify that the counter value was incremented in 1 more and the lasttimestamp changed to the current value too.

```
user@host:~/keeper/hardhat-starter-kit$ npx hardhat read-keepers-counter --contract 0x9E545E3C0baAB3E08CdfD552C960A1050f373042 --network localhost
Reading counter from Keepers contract  0x9E545E3C0baAB3E08CdfD552C960A1050f373042  on network  localhost

Last timestamp is:  1637791054
Counter is:  1
```

Now you need to wait more than 30 seconds and execute the contract that simulates the keeper again

```
user@host:~/keeper/hardhat-starter-kit$ npx hardhat keeper-test --contract 0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9 --network localhost
Calling Keeper simulator contract  0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9  on network  localhost
Contract  0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9  external data request successfully called. Transaction Hash:  0x1e359e39938217e1c344c436cb40b76bff350b348ffcf43581f63110172be7f5

The status of this upkeep is currently:  true
```

The result true indicates that the performUpkeep was executed again.
Reading the results.

```
user@host:~/keeper/hardhat-starter-kit$ npx hardhat read-keepers-counter --contract 0x9E545E3C0baAB3E08CdfD552C960A1050f373042 --network localhost
Reading counter from Keepers contract  0x9E545E3C0baAB3E08CdfD552C960A1050f373042  on network  localhost

Last timestamp is:  1637791086
Counter is:  2
```
The counter increment 1 more its value and the timestamp changed to the new value.

But if you execute the contract that simulates the keeper again before 30 seconds from the last execution.
The results of checkUpkep function is false.

```
user@host:~/keeper/hardhat-starter-kit$ npx hardhat keeper-test --contract 0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9 --network localhost
Calling Keeper simulator contract  0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9  on network  localhost
Contract  0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9  external data request successfully called. Transaction Hash:  0xac5309e6e0d8e83b71345bbb4930099fbd9683f65127855faa2109a04818b8a0
The status of this upkeep is currently:  false
```
So the state doesn't change.

```
user@host:~/keeper/hardhat-starter-kit$ npx hardhat read-keepers-counter --contract 0x9E545E3C0baAB3E08CdfD552C960A1050f373042 --network localhost
Reading counter from Keepers contract  0x9E545E3C0baAB3E08CdfD552C960A1050f373042  on network  localhost

Last timestamp is:  1637791086
Counter is:  2
```


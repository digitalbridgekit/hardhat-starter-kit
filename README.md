# Example to understand Chainlink Keepers, based on a web3 script

**The main idea of this example is to create an auxiliary task called "keeper-simulation" to manually try and adjust the Keeper prior to registration in the keeper network.**

 * To understand what are Chainlink Keepers please read the following docs
   *  [Introduction to Chainlink Keepers](https://docs.chain.link/docs/chainlink-keepers/introduction/)
   *  [Keepers Network Overview](https://docs.chain.link/docs/chainlink-keepers/overview/)
  
## Requirements

- [NPM](https://www.npmjs.com/) or [YARN](https://yarnpkg.com/)
- Chainlink Hardhat Box

## Installation

```bash
git clone -b keeper-simulation-w-web3script https://github.com/digitalbridgekit/hardhat-starter-kit.git
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
then execute the following
```bash
cp .env.example .env
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
## The keeper-simulation task

As the Counter contract is defined to be called in external mode, it's necessary a web3 script to call the Counter contract, simulating a Keeper call.

[keeper-simulation.js](https://github.com/digitalbridgekit/hardhat-starter-kit/blob/keeper-simulation-w-web3script/tasks/keeper-simulation/keeper-simulation.js)


## Steps to deploy and test the contract and understand how the Keepers works

### The first step is run hardhat as local node

```bash
user@host:~/keeper/hardhat-starter-kit$ npx hardhat node
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

### The second step is deploy the contracts

 * In a different terminal execute the following

```bash
user@host:~/keeper/hardhat-starter-kit$ npx hardhat deploy --network localhost --tags keepers
```
output
```bash
Compilation finished successfully
deploying "Counter" (tx: 0xe74fb4e378f4055540692272da229b22bbbafc07a8589f13118bfdd07d30e51e)...: deployed at 0x8A791620dd6260079BF849Dc5567aDC3F2FdC318 with 342119 gas
Run the following command to track the counter updates:
npx hardhat read-keepers-counter --contract 0x8A791620dd6260079BF849Dc5567aDC3F2FdC318 --network localhost
Run the following command to manually simulate a Keeper call:
npx hardhat keeper-simulation --contract 0x8A791620dd6260079BF849Dc5567aDC3F2FdC318 --network localhost
----------------------------------------------------
```

### Then to understand how it works

The Counter contract has:
 * 30 seconds as interval value
 * The counter it's initialized in 0
 * lastimestamp is initalized with the timestamp of the block when the contract is deployed.

To read the current state excecute the follow 
```bash
user@host:~/keeper/hardhat-starter-kit$ npx hardhat read-keepers-counter --contract 0x8A791620dd6260079BF849Dc5567aDC3F2FdC318 --network localhost
```
output
```bash
Reading counter from Keepers contract  0x8A791620dd6260079BF849Dc5567aDC3F2FdC318  on network  localhost
Last timestamp is:  1638220869
Counter is:  0
```

The counter in 0 value implie that the keeper never executed the preformUpkeep function

* Now after more than 30 seconds execute the follow 
```bash
user@host:~/keeper/hardhat-starter-kit$ npx hardhat keeper-simulation --contract 0x8A791620dd6260079BF849Dc5567aDC3F2FdC318 --network localhost
```
output
```bash
Calling Counter contract simulating a Keeper call  0x8A791620dd6260079BF849Dc5567aDC3F2FdC318  on network  localhost
Contract  0x8A791620dd6260079BF849Dc5567aDC3F2FdC318  checkUpkeep:  true
Contract  0x8A791620dd6260079BF849Dc5567aDC3F2FdC318  performUpkeep was called. Transaction Hash:  0x6011322d77c46b3181098e305b9ef7cefdb7345b09097d73e791859265613e40
```
As the interval is greater than 30 seconds the checkUpkeep function responds **true** so the performUpkeep function is executed in the same way as for the keeper.

Now you can read the status again.

```bash
user@host:~/keeper/hardhat-starter-kit$ npx hardhat read-keepers-counter --contract 0x8A791620dd6260079BF849Dc5567aDC3F2FdC318 --network localhost
```
output
```bash
Reading counter from Keepers contract  0x8A791620dd6260079BF849Dc5567aDC3F2FdC318  on network  localhost
Last timestamp is:  1638220921
Counter is:  1
```
You can verify that the counter value was incremented in 1 more and the lasttimestamp changed to the current value too.

Now you need to wait more than 30 seconds again and execute the contract that simulates the keeper again

```bash
user@host:~/keeper/hardhat-starter-kit$ npx hardhat keeper-simulation --contract 0x8A791620dd6260079BF849Dc5567aDC3F2FdC318 --network localhost
```
output
```bash
Calling Counter contract simulating a Keeper call  0x8A791620dd6260079BF849Dc5567aDC3F2FdC318  on network  localhost
Contract  0x8A791620dd6260079BF849Dc5567aDC3F2FdC318  checkUpkeep:  true
Contract  0x8A791620dd6260079BF849Dc5567aDC3F2FdC318  performUpkeep was called. Transaction Hash:  0x740019915422734e6926879560791818ad8ac61ea5dd020fbb866289f7084a37

```

The result **true** indicates that the performUpkeep was executed again.

Reading the current Counter values.

```bash
user@host:~/keeper/hardhat-starter-kit$ npx hardhat read-keepers-counter --contract 0x8A791620dd6260079BF849Dc5567aDC3F2FdC318 --network localhost
```
output
```bash
Reading counter from Keepers contract  0x8A791620dd6260079BF849Dc5567aDC3F2FdC318  on network  localhost
Last timestamp is:  1638220985
Counter is:  2
```
The counter increment 1 more its value and the timestamp changed to the new value.

But if you execute the contract that simulates the keeper again before 30 seconds from the last execution.

```bash
user@host:~/keeper/hardhat-starter-kit$ npx hardhat keeper-simulation --contract 0x8A791620dd6260079BF849Dc5567aDC3F2FdC318 --network localhost
```
output
```bash
Calling Counter contract simulating a Keeper call  0x8A791620dd6260079BF849Dc5567aDC3F2FdC318  on network  localhost
Contract  0x8A791620dd6260079BF849Dc5567aDC3F2FdC318  checkUpkeep:  false
```
The results of checkUpkeep function is **false** 
So if you read the Counter values.
```bash
user@host:~/keeper/hardhat-starter-kit$ npx hardhat read-keepers-counter --contract 0x8A791620dd6260079BF849Dc5567aDC3F2FdC318 --network localhost
```
output
```bash
Reading counter from Keepers contract  0x8A791620dd6260079BF849Dc5567aDC3F2FdC318  on network  localhost
Last timestamp is:  1638220985
Counter is:  2
```
The state didn't change.

When the contract reaches this testing phase and is adjusted, it can continue the process registering it at https://keepers.chain.link/


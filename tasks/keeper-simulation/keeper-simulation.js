let { networkConfig, getNetworkIdFromName } = require('../../helper-hardhat-config')

task("keeper-simulation", "Keeper simulator calls as external to Counter Contract to checkUpKeep")
    .addParam("contract", "The address of the Counter contract that you want to call")
    .setAction(async taskArgs => {
        
        const contractAddr = taskArgs.contract
        let networkId = await getNetworkIdFromName(network.name)
        console.log("Calling Counter contract simulating a Keeper call ", contractAddr, " on network ", network.name)
        const Counter = await ethers.getContractFactory("Counter")

        //Get signer information
        const accounts = await ethers.getSigners()
        const signer = accounts[0]

        //Create connection to Counter Contract and call the checkUpKeep function
        const counterContract = new ethers.Contract(contractAddr, Counter.interface, signer)
        const seconds = Math.floor(new Date().getTime() / 1000);
        const curretTimeStamp = ethers.utils.defaultAbiCoder.encode(['uint'], [seconds])
        let result
        result = await counterContract.checkUpkeep(curretTimeStamp)
        //console.log(result, seconds)
        const {0: boolValue, 1: bytesValue} = result;
        console.log('Contract ', contractAddr, ' checkUpkeep: ', boolValue)
        //console.log(boolValue, bytesValue)
        if (boolValue) {
           const resultPUpkeep = await counterContract.performUpkeep(0x00)
           console.log('Contract ', contractAddr, ' performUpkeep was called. Transaction Hash: ', resultPUpkeep.hash)
        }
    })
module.exports = {}

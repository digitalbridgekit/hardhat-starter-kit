let { networkConfig, getNetworkIdFromName } = require('../../helper-hardhat-config')

task("keeper-test", "Keeper simulator calls as external contract to Counter Contract to checkUpKeep")
    .addParam("contract", "The address of the Keeper simulator contract that you want to call")
    .setAction(async taskArgs => {

        const contractAddr = taskArgs.contract
        let networkId = await getNetworkIdFromName(network.name)
        console.log("Calling Keeper simulator contract ", contractAddr, " on network ", network.name)
        const KeeperSimulation = await ethers.getContractFactory("KeeperSimulation")

        //Get signer information
        const accounts = await ethers.getSigners()
        const signer = accounts[0]

        //Create connection to Counter Contract and call the checkUpKeep function
        const keeperSimulationContract = new ethers.Contract(contractAddr, KeeperSimulation.interface, signer)
        let result = await keeperSimulationContract.checkUpkeep()
        console.log('Contract ', contractAddr, ' external data request successfully called. Transaction Hash: ', result.hash)
        //await new Promise(resolve => setTimeout(resolve, 15000))
        console.log('The status of this upkeep is currently: ', await keeperSimulationContract.getUpkeepNeeded())
    })
module.exports = {}

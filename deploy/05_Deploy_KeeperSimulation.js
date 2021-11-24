let { networkConfig} = require('../helper-hardhat-config')

module.exports = async ({
  getNamedAccounts,
  deployments
}) => {
  const { deploy, log, get } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = await getChainId()
  let linkTokenAddress
  let oracle
  let additionalMessage = ""
  //set log level to ignore non errors
  ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR)
  
  const networkName = networkConfig[chainId]['name']
  const Counter = await deployments.get("Counter")
  
  const keeperSimulation = await deploy('KeeperSimulation', {
    from: deployer,
    args: [Counter.address],  
    log: true
  })

  log("Run Keeper simulation contract with following command:")
  log(`npx hardhat keeper-test --contract ${keeperSimulation.address} --network ${networkName}`)
  log("----------------------------------------------------")
}
module.exports.tags = ['all', 'keepers']

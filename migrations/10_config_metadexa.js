const GaslessForwarder = artifacts.require("GaslessForwarder");
const MetaSwapRouter = artifacts.require("MetaSwapRouter");

module.exports = async function(deployer,network,accounts) {

    const externalForwarderAddress = process.env.EXTERNAL_FORWARDER;

    const forwarder = await GaslessForwarder.deployed();
    const metaswap = await MetaSwapRouter.deployed();

    const targetGasPrice = await web3.eth.getGasPrice();

    await metaswap.toggleForwarder(forwarder.address, true, {gasPrice: targetGasPrice});
    await forwarder.toggleForwarder(externalForwarderAddress, true, {gasPrice: targetGasPrice});
}

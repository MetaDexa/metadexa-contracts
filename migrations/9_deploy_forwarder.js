const GaslessForwarder = artifacts.require("GaslessForwarder");

module.exports = async function(deployer,network,accounts) {
    await deployer.deploy(GaslessForwarder);

    const forwarder = await GaslessForwarder.deployed();
    const targetGasPrice = await web3.eth.getGasPrice();

    await forwarder.toggleValidator(accounts[0], true, {gasPrice: targetGasPrice});
}

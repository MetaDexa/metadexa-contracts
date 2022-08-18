const MetaSwapRouter = artifacts.require("MetaSwapRouter");
const SwapAggregatorAdapter = artifacts.require("SwapAggregatorAdapter");
const GaslessSwapAdapter = artifacts.require("GaslessSwapAdapter");
const GaslessForwarder = artifacts.require("GaslessForwarder");

module.exports = async(callback) => {

    try {

        const accounts = await web3.eth.getAccounts();
        const currentAccount = accounts[0];

        const metaSwap = await MetaSwapRouter.deployed();
        const aggregatorAdapter = await SwapAggregatorAdapter.deployed();
        const forwarder = await GaslessForwarder.deployed();

        const gaslessSwapAdapter = await GaslessSwapAdapter.deployed();

        await metaSwap.createFlashWallet();
        await metaSwap.addAdapter('SwapAggregator', aggregatorAdapter.address);
        await metaSwap.addAdapter('GaslessSwap', gaslessSwapAdapter.address);

        await metaSwap.toggleForwarder(forwarder.address);

        await forwarder.toggleValidator(currentAccount, true);

    } catch (error) {
        console.log(error);
    }
    callback();
}
const MetaSwapRouter = artifacts.require("MetaSwapRouter");
const GaslessForwarder = artifacts.require("GaslessForwarder");
const ERC20 = artifacts.require("ERC20");

module.exports = async(callback) => {

    try {

        const accounts = await web3.eth.getAccounts();
        const currentAccount = accounts[0];
        const signer = accounts[0];


        const metaSwap = await MetaSwapRouter.deployed();
        const forwarder = await GaslessForwarder.deployed();

        const tokenFrom = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"; //eth
        const tokenTo = "0x3af33bef05c2dcb3c7288b77fe1c8d2aeba4d789";

        const amountFrom = "10000000000000000";
        const paymentFees = "1000000000000000";

        const aggregatorAddress = "0x1111111254fb6c44bac0bed2854e76f90643097d"; // 1inch
        const aggregatorData = "0xe449022e000000000000000000000000000000000000000000000000001ff973cafa800000000000000000000000000000000000000000000000000b8b976c20582d5ea900000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000001c000000000000000000000006ae0cdc5d2b89a8dcb99ad6b3435b3e7f7290077cfee7c08";
        // at block 14813128

        let token0Instance = await ERC20.at(tokenTo);
        let balanceToken0Before = await token0Instance.balanceOf(currentAccount);
        console.log('balanceToken0Before:', web3.utils.fromWei(balanceToken0Before.toString()));

        let balanceETHBefore = await web3.eth.getBalance(currentAccount)
        console.log('ETH balance before:', web3.utils.fromWei(balanceETHBefore.toString()));

        const adapterId = 'GaslessSwap';
        const adapterData = web3.eth.abi.encodeParameter(
            'tuple(address,address,uint256,uint256,address,uint256,address,address,bytes)',
            [tokenFrom, tokenTo, amountFrom, 0, tokenFrom, paymentFees, signer, aggregatorAddress, aggregatorData]
        );

        console.log(adapterData);

        let functionSignature = web3.eth.abi.encodeFunctionCall({
            name: 'swap',
            type: 'function',
            "inputs": [
                {
                    "internalType": "contract IERC20",
                    "name": "tokenFrom",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                },
                {
                    "internalType": "address payable",
                    "name": "recipient",
                    "type": "address"
                },
                {
                    "components": [
                        {
                            "internalType": "string",
                            "name": "adapterId",
                            "type": "string"
                        },
                        {
                            "internalType": "bytes",
                            "name": "data",
                            "type": "bytes"
                        }
                    ],
                    "internalType": "struct MetaSwapRouter.AdapterInfo",
                    "name": "adapterInfo",
                    "type": "tuple"
                }
            ]
        }, [tokenFrom, amountFrom, '0x0000000000000000000000000000000000000001',
            [adapterId, adapterData]
        ]);

        const nonce = '7';
        const validTo = '0';
        const tokenGasPrice = '0';
        const hashKey = web3.utils.soliditySha3(
            {t: 'uint256', v: '1'},
            {t: 'address', v: currentAccount},
            {t: 'address', v: forwarder.address},
            {t: 'address', v: signer},
            {t: 'address', v: tokenFrom},
            {t: 'uint256', v: paymentFees},
            {t: 'uint256', v: tokenGasPrice},
            {t: 'uint256', v: validTo},
            {t: 'uint256', v: nonce},
            {t: 'address', v: metaSwap.address},
            {t: 'bytes', v: functionSignature}
        );

        let signature = await web3.eth.sign(hashKey, signer);

        const performedSwap = await forwarder.executeCall([
                signer,
                metaSwap.address,
                functionSignature,
                tokenFrom,
                paymentFees,
                tokenGasPrice,
                validTo,
                nonce
            ],
            signature
            ,{value: amountFrom, from: currentAccount});

        console.log('performedSwap:', performedSwap);

        const balanceToken0After = await token0Instance.balanceOf(currentAccount);
        console.log('balanceToken0 after:', web3.utils.fromWei(balanceToken0After.toString()));

        const balanceETHAfter = await web3.eth.getBalance(currentAccount)
        console.log('ETH balance after:', web3.utils.fromWei(balanceETHAfter.toString()));

        console.log("Token diff: " + web3.utils.fromWei((balanceToken0After - balanceToken0Before).toString()));
        console.log("ETH diff: " + web3.utils.fromWei((balanceETHAfter - balanceETHBefore).toString()));

    } catch (error) {
        console.log(error);
    }
    callback();
}
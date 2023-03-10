
import { ethers } from "ethers";
import { Biconomy } from "@biconomy/mexa";
import { useContext } from "react";
// import abi from "./contractAbi/trutsNFT.json";
import abi from "./contractAbi/trutsPlatformNFT.json";
import { Bounce, toast } from "react-toastify";
// import {useMoralis} from "react-moralis";

export const gaslessTxn = async (address, signature, idNumber) => {
    let rpc = "https://rpc.ankr.com/polygon_mumbai"
    // let contractAddress = "0xD5Ec0c586D952f2C12021655b85eD50d8A95b5F2"
    // apiKey: "2kT7WVan_.b1e7f905-3166-4175-80c3-316a4d3cd65e",

    let contractAddress = "0x73F9E1DD0Aa8A8dBC1BDA5B7B1204Ee80F2B745f"
    const { ethereum } = window;
    if (ethereum) {
        console.log("ok bro")
        // const signer = provider.getSigner();
        // const address = await signer.getAddress();
        const biconomy = new Biconomy(ethereum, {
            walletProvider: ethereum,
            apiKey: "VPy2_u9yn.20b0e126-46ad-4874-b9aa-38960b495562",
            debug: true,
            contractAddresses: [contractAddress], // list of contract address you want to enable gasless on
        });
        // await biconomy.;
        console.log(biconomy)
        console.log(biconomy.READY)
        biconomy.onEvent(biconomy.READY, async () => {
            console.log("intiated");
        });

        biconomy
            .onEvent(biconomy.READY, async () => {
                toast.loading("Your NFT is being minted, please wait...");
                let ethersProvider = new ethers.providers.Web3Provider(biconomy);

                const contractInstance = new ethers.Contract(
                    contractAddress,
                    abi,
                    biconomy.getSignerByAddress(address)
                );
                const { data } =
                    await contractInstance.populateTransaction.mintNewNFT(
                        signature,
                        "https://gateway.lighthouse.storage/ipfs/QmbXzzyLXFmjP4DpmcysVgg3bc8HFGYyhjgGFbcyBJF9aM/1.json",
                    );

                let txnn = {
                    data: data,
                    to: contractAddress,
                    from: address,
                    signatureType: "EIP712_SIGN",
                    gasPrice: ethers.utils.parseUnits('200', 'gwei'),
                    gasLimit: 2000000
                };
                let transactionHash;

                try {
                    let ethersProvider = biconomy.getEthersProvider();

                    let txhash = await ethersProvider.send("eth_sendTransaction", [
                        txnn,
                    ]);
                    // let txhash  =await ethersProvider.sen
                    let receipt = await ethersProvider.waitForTransaction(txhash);
                    toast.dismiss();
                    toast.success("NFT Minted");
                    console.log(receipt);
                    return txhash;
                } catch (error) {
                    if (error.returnedHash && error.expectedHash) {
                        console.log("Transaction hash : ", error.returnedHash);
                        transactionHash = error.returnedHash;
                    } else {
                        console.log(error);
                    }
                    toast.dismiss();
                    toast.error("NFT Minting Failed!");
                }

                if (transactionHash) {
                    let receipt = await ethersProvider.waitForTransaction(
                        transactionHash
                    );
                } else {
                }
            })
            .onEvent(biconomy.ERROR, (error, message) => {
                console.log(message);
                console.log(error);
            });
    }
};
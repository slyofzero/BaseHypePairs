// import { ethers } from "ethers";
// import nacl from "tweetnacl";
// import { errorHandler, log } from "./handlers";
// import { splitPaymentsWith } from "./constants";

// export function generateAccount() {
//   const randomBytes = ethers.utils.randomBytes(32);
//   const mnemonic = ethers.utils.entropyToMnemonic(randomBytes);
//   const seed = ethers.utils.mnemonicToSeed(mnemonic);
//   const hex = Uint8Array.from(Buffer.from(seed));
//   const keyPair = nacl.sign.keyPair.fromSeed(hex.slice(0, 32));
//   const { publicKey, secretKey } = new web3.Keypair(keyPair);
//   const data = {
//     publicKey: publicKey.toString(),
//     secretKey: `[${secretKey.toString()}]`,
//   };
//   return data;
// }

// export async function sendTransaction(
//   secretKey: string,
//   amount: number,
//   to?: string
// ) {
//   try {
//     if (!to) {
//       return false;
//     }

//     const secretKeyArray = new Uint8Array(JSON.parse(secretKey));
//     const account = web3.Keypair.fromSecretKey(secretKeyArray);
//     const toPubkey = new PublicKey(to);

//     const { lamportsPerSignature } = (
//       await solanaConnection.getRecentBlockhash("confirmed")
//     ).feeCalculator;

//     const transaction = new web3.Transaction().add(
//       web3.SystemProgram.transfer({
//         fromPubkey: account.publicKey,
//         toPubkey,
//         lamports: amount - lamportsPerSignature,
//       })
//     );

//     const signature = await web3.sendAndConfirmTransaction(
//       solanaConnection,
//       transaction,
//       [account]
//     );
//     return signature;
//   } catch (error) {
//     log(`No transaction for ${amount} to ${to}`);
//     errorHandler(error);
//   }
// }

// export async function splitPayment(
//   secretKey: string,
//   totalPaymentAmount: number
// ) {
//   const { dev, me, neo } = splitPaymentsWith;

//   const myShare = Math.floor(me.share * totalPaymentAmount);
//   const devShare = Math.floor(dev.share * totalPaymentAmount);
//   const neoShare = totalPaymentAmount - (devShare + myShare);

//   sendTransaction(secretKey, myShare, me.address).then(() =>
//     log(`Fees of ${myShare} lamports sent to account ${me.address}`)
//   );

//   sendTransaction(secretKey, devShare, dev.address).then(() =>
//     log(`Fees of ${devShare} lamports sent to account ${dev.address}`)
//   );

//   sendTransaction(secretKey, neoShare, neo.address).then(() =>
//     log(`Fees of ${neoShare} lamports sent to account ${neo.address}`)
//   );
// }

import { web3 } from "@/rpc";
import { erc20Abi } from "./abi";
import { ethers } from "ethers";
import { errorHandler, log } from "./handlers";
import { residueEth, splitPaymentsWith } from "./constants";
import { provider } from "@/rpc";
import { sleep } from "./time";
import { floatToBigInt } from "./general";

export async function getTotalSupply(token: string) {
  const contract = new web3.eth.Contract(erc20Abi, token);
  const totalSupply = BigInt(await contract.methods.totalSupply().call());
  const decimals = Number(await contract.methods.decimals().call());
  const adjustedTotalSupply = totalSupply / BigInt(Math.pow(10, decimals));
  return adjustedTotalSupply;
}

export function isValidEthAddress(address: string) {
  const regex = /^0x[a-fA-F0-9]{40}$/;
  return regex.test(address);
}

export function generateAccount() {
  const wallet = ethers.Wallet.createRandom();

  const data = {
    publicKey: wallet.address,
    secretKey: wallet.privateKey,
  };
  return data;
}

export async function sendTransaction(
  secretKey: string,
  amount: bigint,
  to: string,
  full?: boolean
) {
  for (const attempt of Array.from(Array(10).keys())) {
    try {
      const wallet = new ethers.Wallet(secretKey, provider);
      const gasPrice = await web3.eth.getGasPrice();
      const gasLimit = (
        await provider.estimateGas({
          to: to,
          value: amount,
        })
      ).toBigInt();

      if (full) amount = amount - residueEth;
      if (amount <= 0) return false;

      const valueAfterGas = amount - gasLimit * gasPrice;
      const tx = await wallet.sendTransaction({
        to: to,
        value: valueAfterGas,
        gasPrice: gasPrice,
        gasLimit: gasLimit,
      });

      return tx;
    } catch (error) {
      log(`No transaction for ${amount} to ${to}, at attempt - ${attempt + 1}`);
      await sleep(10000);
    }
  }

  log(`Transaction of ${amount} wasn't successful`);
}

export async function splitPayment(
  secretKey: string,
  totalPaymentAmount: bigint
) {
  try {
    const { dev, main, revenue } = splitPaymentsWith;

    // ------------------------------ Calculating shares ------------------------------
    const devShare = floatToBigInt(dev.share * Number(totalPaymentAmount));
    const shareLeft = totalPaymentAmount - devShare;

    const revenueShare = floatToBigInt(Number(shareLeft) * revenue.share);
    const mainShare = shareLeft - revenueShare;

    // ------------------------------ Txns ------------------------------
    const devTx = await sendTransaction(secretKey, devShare, dev.address);
    if (devTx) log(`Dev share ${devShare} sent ${devTx.hash}`);

    const revTx = await sendTransaction(secretKey, revenueShare, revenue.address); // prettier-ignore
    if (revTx) log(`Revenue share ${revenueShare} sent ${revTx.hash}`);

    const mainTx = await sendTransaction(secretKey, mainShare, main.address, true); // prettier-ignore
    if (mainTx) log(`Main share ${mainShare} sent ${mainTx.hash}`);
  } catch (error) {
    errorHandler(error);
  }
}

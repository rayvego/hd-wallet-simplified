"use client";

import { useState } from "react";
import { mnemonicToSeedSync, generateMnemonic } from "bip39";
import { Keypair } from "@solana/web3.js";
import { Button } from "@/components/ui/button";
import { derivePath } from "ed25519-hd-key";
import nacl from "tweetnacl";
import { HDNodeWallet, Wallet } from "ethers";

// ! We'll keep the mnemonic phrase same but derive keys for eth and solana with same derivation paths

export default function Home() {
  const [mnemonic, setMnemonic] = useState("");
  const [wallets, setWallets] = useState<string[]>([]);
  const [accountNumber, setAccountNumber] = useState(0);

  const path = `m/44'/501'/${accountNumber}'/0'`;

  // * Generate mnemonic phrase
  const createAccountHandler = async () => {
    const newMnemonic = generateMnemonic();
    setMnemonic(newMnemonic);
  };

  // * Generate wallet
  const createSolWalletHandler = async () => {
    if (!mnemonic) return;

    const seed = mnemonicToSeedSync(mnemonic); // UInt8Array
    // Derive the seed from the path
    const derivedSeed = derivePath(path, seed.toString("hex")).key;
    // Derive the secret key from the new derived path
    const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
    // Derive the public key from the secret key
    const publicKey = Keypair.fromSecretKey(secret).publicKey.toBase58();

    setWallets([...wallets, publicKey]);
    setAccountNumber(() => accountNumber + 1);
  };

  // const createEthWalletHandler = async () => {
  //   const wallet = HDNodeWallet.fromPhrase(mnemonic, path);
  // };

  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-y-10">
      <div className="text-5xl font-bold text-gray-900">
        Create a <span className="text-blue-500">Hierarchical Deterministic</span> Wallet
      </div>

      <div className="flex">
        {!mnemonic && <Button onClick={createAccountHandler}>Create Account</Button>}
        {mnemonic && (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Your Mnemonic Phrase</h2>
            <div className="flex flex-wrap gap-2">
              {mnemonic.split(" ").map((word, index) => (
                <div key={index} className="bg-gray-100 p-2 rounded-md">
                  {word}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Keep this phrase safe and secure. It's the only way to recover your wallet.
            </p>
          </div>
        )}
      </div>

      {mnemonic && (
        <div className="flex flex-col w-full justify-between">
          <Button onClick={createSolWalletHandler}>Create SOL Wallet</Button>
          {/* <Button onClick={createEthWalletHandler}>Create ETH Wallet</Button> */}
        </div>
      )}

      <div>
        {wallets.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mt-8">Your Wallets</h2>
            <div className="flex flex-wrap gap-4 mt-4">
              {wallets.map((address, index) => (
                <div key={index} className="bg-gray-100 p-2 rounded-md">
                  {address}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

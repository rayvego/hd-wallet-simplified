"use client";

import { useState } from "react";
import { mnemonicToSeedSync, generateMnemonic } from "bip39";
import { Keypair } from "@solana/web3.js";
import { Button } from "@/components/ui/button";
import { derivePath } from "ed25519-hd-key";
import nacl from "tweetnacl";
import { ethers } from "ethers";
import bs58 from "bs58";

// ! We'll keep the mnemonic phrase same but derive keys for eth and solana with same derivation paths

export default function Home() {
  const [mnemonic, setMnemonic] = useState("");
  const [solWallets, setSolWallets] = useState<string[]>([]);
  const [ethWallets, setEthWallets] = useState<string[]>([]);
  const [solAccountNumber, setSolAccountNumber] = useState(0);
  const [ethAccountNumber, setEthAccountNumber] = useState(0);

  // * Generate mnemonic phrase
  const createAccountHandler = async () => {
    const newMnemonic = generateMnemonic();
    setMnemonic(newMnemonic);
  };

  // * Generate wallet
  const createSolWalletHandler = async () => {
    if (!mnemonic) return;

    const seed = mnemonicToSeedSync(mnemonic); // UInt8Array
    const path = `m/44'/501'/${solAccountNumber}'/0'`;
    // Derive the seed from the path
    const derivedSeed = derivePath(path, seed.toString("hex")).key;
    // Derive the secret key from the new derived path
    const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
    // Derive the public key from the secret key
    const publicKey = Keypair.fromSecretKey(secret).publicKey.toBase58();

    setSolWallets([...solWallets, publicKey]);
    setSolAccountNumber(() => solAccountNumber + 1);
  };

  const createEthWalletHandler = async () => {
    if (!mnemonic) return;

    const seed = mnemonicToSeedSync(mnemonic); // UInt8Array
    const path = `m/44'/60'/${ethAccountNumber}'/0'`;
    // Derive the seed from the path
    const hdNode = ethers.HDNodeWallet.fromSeed(seed);
    // Derive the wallet from the path
    const wallet = hdNode.derivePath(path);
    // Derive the public key from the wallet
    const publicKey = bs58.encode(Buffer.from(wallet.publicKey));

    setEthWallets([...ethWallets, publicKey]);
    console.log(ethAccountNumber)
    setEthAccountNumber(() => ethAccountNumber + 1);
  };

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
              Keep this phrase safe and secure. Its the only way to recover your wallet.
            </p>
          </div>
        )}
      </div>

      {mnemonic && (
        <div className="flex w-[350px] justify-between">
          <Button onClick={createSolWalletHandler}>Create SOL Wallet</Button>
          <Button onClick={createEthWalletHandler}>Create ETH Wallet</Button>
        </div>
      )}

      <div className="flex flex-col w-full justify-between gap-x-5 gap-y-10">
        <div className="w-1/2 ">
          {solWallets.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mt-8">SOL Wallets</h2>
              <div className="flex flex-wrap gap-4 mt-4">
                {solWallets.map((address, index) => (
                  <div key={index} className="bg-gray-100 p-2 rounded-md">
                    {address}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-1/2">
          {ethWallets.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mt-8">ETH Wallets</h2>
              <div className="flex flex-wrap gap-4 mt-4">
                {ethWallets.map((address, index) => (
                  <div key={index} className="bg-gray-100 p-2 rounded-md">
                    {address}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

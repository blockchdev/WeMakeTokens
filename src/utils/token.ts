import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { createAndMint, TokenStandard, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { setComputeUnitLimit, transferSol, mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import { generateSigner, percentAmount, publicKey, sol, transactionBuilder } from "@metaplex-foundation/umi";
import { clusterApiUrl, Connection, Transaction, PublicKey as Web3PublicKey } from "@solana/web3.js";
import { createSetAuthorityInstruction, AuthorityType, createBurnInstruction, getAssociatedTokenAddressSync } from "@solana/spl-token";
import bs58 from "bs58";

const DEV_WALLET = publicKey("EuBWRZgBJE6ztewbKcD7huj9TMWa5iezkgULDt6AFASd");
const CREATION_FEE = 0.05;

export interface TokenCreationArgs {
  name: string;
  symbol: string;
  uri: string;
  decimals: number;
  supply: number;
  revokeMint: boolean;
  revokeFreeze: boolean;
  wallet: any;
  networkType: "devnet" | "mainnet-beta";
}

export async function createToken({
  name,
  symbol,
  uri,
  decimals,
  supply,
  revokeMint,
  revokeFreeze,
  wallet,
  networkType,
}: TokenCreationArgs) {
  // 1. Initialize Umi
  const endpoint = process.env.NEXT_PUBLIC_RPC_URL && networkType === "mainnet-beta" 
    ? process.env.NEXT_PUBLIC_RPC_URL 
    : clusterApiUrl(networkType);
    
  const umi = createUmi(endpoint)
    .use(walletAdapterIdentity(wallet))
    .use(mplTokenMetadata())
    .use(mplToolbox());
  const mint = generateSigner(umi);

  // 2. Build the transaction for payment + mint creation
  // Note: amount is in base units (e.g., 1 token with 9 decimals = 1,000,000,000)
  const amountToMint = supply * Math.pow(10, decimals);
  
  let builder = transactionBuilder()
    .add(setComputeUnitLimit(umi, { units: 400_000 }))
    .add(transferSol(umi, {
      source: umi.identity,
      destination: DEV_WALLET,
      amount: sol(CREATION_FEE),
    }))
    .add(createAndMint(umi, {
      mint,
      authority: umi.identity,
      name,
      symbol,
      uri,
      sellerFeeBasisPoints: percentAmount(0),
      decimals,
      amount: amountToMint,
      tokenOwner: umi.identity.publicKey,
      tokenStandard: TokenStandard.Fungible,
      isMutable: true,
    }));

  // 3. Send and confirm payment & token creation
  const txResult = await builder.sendAndConfirm(umi, {
    send: { skipPreflight: true },
    confirm: { commitment: "confirmed" }
  });

  const signature = bs58.encode(txResult.signature);
  const mintAddress = mint.publicKey.toString();

  // 4. Revoke Authorities if requested (in a separate transaction for safety)
  if (revokeMint || revokeFreeze) {
    const connection = new Connection(endpoint, "confirmed");
    const { sendTransaction, publicKey: walletPubkey } = wallet;
    
    const mintPubkey = new Web3PublicKey(mintAddress);
    const authPubkey = new Web3PublicKey(walletPubkey.toString());

    const revokeTx = new Transaction();
    
    if (revokeMint) {
      revokeTx.add(
        createSetAuthorityInstruction(
          mintPubkey,
          authPubkey,
          AuthorityType.MintTokens,
          null
        )
      );
    }
    
    if (revokeFreeze) {
      revokeTx.add(
        createSetAuthorityInstruction(
          mintPubkey,
          authPubkey,
          AuthorityType.FreezeAccount,
          null
        )
      );
    }

    const latestBlockhash = await connection.getLatestBlockhash();
    revokeTx.recentBlockhash = latestBlockhash.blockhash;
    revokeTx.feePayer = authPubkey;

    const authSig = await sendTransaction(revokeTx, connection);
    await connection.confirmTransaction({
      signature: authSig,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    });
  }

  return { signature, mint: mintAddress };
}

export async function burnTokens(
  mintAddress: string,
  amount: number,
  decimals: number,
  wallet: any,
  endpoint: string
) {
  const connection = new Connection(endpoint, "confirmed");
  const { sendTransaction, publicKey: walletPubkey } = wallet;
  
  const mintPubkey = new Web3PublicKey(mintAddress);
  const authPubkey = new Web3PublicKey(walletPubkey.toString());

  const ata = getAssociatedTokenAddressSync(mintPubkey, authPubkey);
  const burnAmount = amount * Math.pow(10, decimals);

  const burnTx = new Transaction().add(
    createBurnInstruction(
      ata,
      mintPubkey,
      authPubkey,
      burnAmount
    )
  );

  const latestBlockhash = await connection.getLatestBlockhash();
  burnTx.recentBlockhash = latestBlockhash.blockhash;
  burnTx.feePayer = authPubkey;

  const sig = await sendTransaction(burnTx, connection);
  await connection.confirmTransaction({
    signature: sig,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
  });

  return sig;
}

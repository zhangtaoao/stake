import { Address, Abi, getContract as getContractViem, WalletClient, GetContractReturnType, PublicClient } from "viem";
import { viemClient } from "./viem";
import { defaultChainId } from "../wagmi";

export function getContract<TAbi extends Abi | readonly unknown[], TWalletClient extends WalletClient>({ abi, address, chainId = defaultChainId, signer }: { abi: TAbi | readonly unknown[]; address: Address; chainId?: number; signer?: TWalletClient }) {
  const client = viemClient(chainId);

  const c = getContractViem({
    address,
    abi,
    client: {
      public: client,
      wallet: signer,
    },
  }) as unknown as GetContractReturnType<TAbi, PublicClient, Address>;

  return {
    ...c,
    account: signer?.account,
    chain: signer?.chain,
  };
}

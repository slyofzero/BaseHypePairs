import { log } from "@/utils/handlers";

export function rpcConfig() {
  // if (!RPC_ENDPOINT) {
  //   log("RPC endpoint is undefined");
  // }
  // solanaConnection = new Connection(RPC_ENDPOINT || "");
  log("RPC configured");
}

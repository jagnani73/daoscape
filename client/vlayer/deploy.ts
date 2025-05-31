import proverSpec from "../out/DynamicTwitterProver.sol/DynamicTwitterProver.json";
import verifierSpec from "../out/DynamicTwitterVerifier.sol/DynamicTwitterVerifier.json";
import emailProverSpec from "../out/EmailDomainProver.sol/EmailDomainProver.json";
import emailVerifierSpec from "../out/EmailProofVerifier.sol/EmailDomainVerifier.json";
import githubProverSpec from "../out/GitHubProver.sol/GitHubProver.json";
import githubVerifierSpec from "../out/GitHubVerifier.sol/GitHubVerifier.json";
import {
  deployVlayerContracts,
  getConfig,
  writeEnvVariables,
} from "@vlayer/sdk/config";

const config = getConfig();

// const { prover, verifier } = await deployVlayerContracts({
//   proverSpec,
//   verifierSpec,
// });

// const { emailProver, emailVerifier } = await deployVlayerContracts({
//   proverSpec: emailProverSpec,
//   verifierSpec: emailVerifierSpec,
// });

// console.log("prover", prover);
// console.log("verifier", verifier);
// console.log("emailProver", emailProver);
// console.log("emailVerifier", emailVerifier);

const { prover, verifier } = await deployVlayerContracts({
  proverSpec: githubProverSpec,
  verifierSpec: githubVerifierSpec,
});

console.log("prover", prover);
console.log("verifier", verifier);

// await writeEnvVariables(".env", {
//   VITE_PROVER_ADDRESS: prover,
//   VITE_VERIFIER_ADDRESS: verifier,
//   VITE_EMAIL_PROVER_ADDRESS: emailProver,
//   VITE_EMAIL_VERIFIER_ADDRESS: emailVerifier,
//   VITE_CHAIN_NAME: config.chainName,
//   VITE_PROVER_URL: config.proverUrl,
//   VITE_JSON_RPC_URL: config.jsonRpcUrl,
//   VITE_CLIENT_AUTH_MODE: config.clientAuthMode,
//   VITE_PRIVATE_KEY: config.privateKey,
//   VITE_VLAYER_API_TOKEN: config.token,
//   VITE_NOTARY_URL: config.notaryUrl,
//   VITE_WS_PROXY_URL: config.wsProxyUrl,
//   VITE_GAS_LIMIT: config.gasLimit,
// });

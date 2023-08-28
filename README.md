# season 1

## Setup
1. Deploy contract
```
forge script script/VCS1.s.sol:VCS1DeployScript --rpc-url $RPC_URL --broadcast --verify -vvvv
```
2. Update `app/src/utils/contracts/vcs1.ts` with ABI and deployed address
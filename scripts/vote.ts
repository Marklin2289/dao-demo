import { VOTING_PERIOD } from "./../helper-hardhat-config"
import { developmentChains, proposalsFile } from "../helper-hardhat-config"
import * as fs from "fs"
import { network } from "hardhat"
import { ethers } from "ethers"
import { moveBlocks } from "../utils/move-blocks"

const index = 0
async function main(proposalIndex: number) {
    const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"))
    // get the last proposal for the network. You could also change it for your index
    const proposalId = proposals[network.config.chainId!].at(-1)
    // 0 = Against, 1 = For, 2 = Abstain for this example
    const voteWay = 1
    const reason = "i like do da cha cha"
    await vote(proposalId, voteWay, reason)
}

export async function vote(proposalId: string, voteWay: number, reason: string) {
    console.log("voting...")
    // @ts-ignore
    const governor = await ethers.getContract("GovernorContract")
    const voteTx = await governor.castVoteWithReason(proposalId, voteWay, reason)
    const voteTxReceipt = await voteTx.wait(1)
    console.log(voteTxReceipt.events[0].args.reason)
    const proposalState = await governor.state(proposalId)
    console.log(`Current proposal state: ${proposalState}`)
    if (developmentChains.includes(network.name)) {
        await moveBlocks(VOTING_PERIOD + 1)
    }
}
main(index)
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })

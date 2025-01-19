import { smart } from "../T2G_Data";

/// help represents the global variable that stores and manages information related to CLI commands
/// If a new command if available from the menu interface, it requires to append a key of the same name
/// keywords() represents the list of available keywwords for help

export const help = {
    keywords: () => "Help: ".concat(
        Object.keys(help).join(" "), " S.Contract: ", ...smart.map((item) => " ".concat(item.tag) )
        ),
    rights: "manage wallet rights: all / set Account @[0 - Z] flags [0 - 127] / get Account @[0 - Z] / ban Account @[0 - Z]",
    beacon: "display beacons / available contracts",
    token: "sort out list of ERC721 tokens of any kind created",
    Accounts: "sort out list of wallets & smart contracts",
    fund: "Create a new fund or display funds : set Account @[0 - Z] Amount Rate / all ",
    mint: "Create or manage a new Honey : honey Account @[0 - Z] fundId entityId / approve Account @[0 - Z] fundId / transfer Account @[0 - Z] fundId",
    identity: "Create or display entities : set person / set entity / all",
    allowance: "Manage Stable Coin approvals : all / set / update Owner @[0 - Z] Spender @[0 - Z]",
    balance: "Show all accounts balances",
    deploy: "Command template : <Contract> <Action> <List of Smart Contract> \n where Contract = {Facet/Contract/Diamond} action = {Add/Replace/Remove} {[contractName ContractName...]} ]\n"
    }

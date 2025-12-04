# Please check Smol new repo: https://github.com/SmolDapp/SmolV2


# Smoldapp

![./public/og.png](./public/og.png)

> The safest way to transfer all your ERC20 tokens at once!

Migratooor is an easy and secure way to move all your Ethereum and ERC20 tokens from one wallet to another, with a single signature if using gnosis. This process does not involve any smart contracts!

## Why Use Migratooor?

-   **Secure:** You don't need to trust any third-party smart contract! For maximum security, you can run the source code yourself and avoid any phishing risks!
-   **Easy to Use:** Our user-friendly interface allows you to quickly select all the tokens you want to migrate!

Migratooor employs the [ethers](https://docs.ethers.org/v5/) library to transfer ERC20 tokens from one wallet to another. This generates all the transactions needed to securely move your tokens to the wallet of your choosing!

## How To Use Migratooor

Using Migratooor is simple. Here's a quick step-by-step guide to transferring tokens with Migratooor:

1. **Connect your wallet** to get started
2. **Select the tokens** you want to transfer
3. **Input the amount** of tokens you want to transfer
4. **Enter the address** of the wallet you want to transfer the tokens to
5. **Confirm the transactions** and wait for them to be processed by the Ethereum network
6. **Transfer complete!** All tokens have been sent to the recipient's wallet

## Configuring

In order to run migratooor, you need to set up the environment variables for the JSON-RPC URLs of the Ethereum networks you want to support. You also need to set up the receiver address and disperse address. These settings can be found in the `next.config.js` file:

```javascript
env: {
    JSON_RPC_URL: {
        1: process.env.RPC_URL_MAINNET,
        10: process.env.RPC_URL_OPTIMISM,
        250: process.env.RPC_URL_FANTOM,
        42161: process.env.RPC_URL_ARBITRUM
    },
    RECEIVER_ADDRESS: '0x10001192576E8079f12d6695b0948C2F41320040',
    DISPERSE_ADDRESS: '0xD152f549545093347A162Dce210e7293f1452150'
}
```

You can set these environment variables in a `.env` file in the project root directory. Make sure to replace the values with the appropriate URLs and addresses for your project.

Here's an example of a `.env` file:

```
RPC_URL_MAINNET=https://mainnet.infura.io/v3/YOUR_API_KEY
RPC_URL_OPTIMISM=https://optimism.infura.io/v3/YOUR_API_KEY
RPC_URL_FANTOM=https://fantom.infura.io/v3/YOUR_API_KEY
RPC_URL_ARBITRUM=https://arbitrum.infura.io/v3/YOUR_API_KEY
RECEIVER_ADDRESS=0x10001192576E8079f12d6695b0948C2F41320040
DISPERSE_ADDRESS=0xD152f549545093347A162Dce210e7293f1452150
```

Replace `YOUR_API_KEY` with your own Infura API key or any other Ethereum JSON-RPC provider. Make sure to use the correct receiver and disperse addresses for your project.

Once you've set up the environment variables, you're ready to run the project using the commands outlined in the previous sections.

## Build and Develop

### Prerequisites

Before you proceed, make sure you have the following installed on your machine:

-   [Node.js](https://nodejs.org/)
-   [npm](https://www.npmjs.com/) (comes bundled with Node.js)

### Installing Dependencies

First, navigate to migratooor root directory in your terminal and run the following command to install all the required dependencies:

```bash
npm install
```

### Development Mode

To run migratooor in development mode, use the following command:

```bash
npm run dev
```

If you want to run the TypeScript compiler in watch mode alongside the development server, use:

```bash
npm run dev:ts
```

### Building the Project

To build migratooor, run the following command:

```bash
npm run build
```

This command will first compile the TypeScript files and then build the project using the `next` command.

## Starting the Production Server

To start the production server, first build migratooor (if you haven't already), and then run the following command:

```bash
npm run start
```

### Exporting the Project

To export migratooor for deployment to IPFS, run the following command:

```bash
npm run export
```

This command will first compile the TypeScript files, then build migratooor using the `next` command, and finally export the build to the `ipfs` folder.

### Linting

To run the ESLint linter, use the following command:

```bash
npm run lint
```

This command will check all `.js`, `.jsx`, `.ts`, and `.tsx` files in the project for linting issues.

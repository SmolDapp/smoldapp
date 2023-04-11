# Migratooor

![./public/og.png](./public/og.png)

> The safest way to transfer all your ERC20 tokens at once!

Migratooor is an easy and secure way to move all your Ethereum and ERC20 tokens from one wallet to another with a single signature. This process does not involve any smart contracts!

## Why Use Migratooor?

* **Secure:** You don't need to trust any third-party smart contract! For maximum security, you can run the source code yourself and avoid any phishing risks!
* **Easy to Use:** Our user-friendly interface allows you to quickly select all the tokens you want to migrate!

Migratooor employs the [ethers](https://docs.ethers.org/v5/) library to transfer ERC20 tokens from one wallet to another. This generates all the transactions needed to securely move your tokens to the wallet of your choosing!


## How To Use Migratooor

Using Migratooor is simple. Here's a quick step-by-step guide to transferring tokens with Migratooor:

1. **Connect your wallet** to get started
2. **Select the tokens** you want to transfer
3. **Input the amount** of tokens you want to transfer
4. **Enter the address** of the wallet you want to transfer the tokens to
5. **Confirm the transactions** and wait for them to be processed by the Ethereum network
6. **Transfer complete!** All tokens have been sent to the recipient's wallet

## How to Build This Project

This document provides a step-by-step guide on how to build the project using the provided scripts in the `package.json` file.

### Prerequisites

Before you proceed, make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) - v14.x.x or higher
- [npm](https://www.npmjs.com/) - v6.x.x or higher (comes bundled with Node.js)

### Installing Dependencies

First, navigate to the project's root directory in your terminal and run the following command to install all the required dependencies:

```bash
npm install
```

### Development Mode

To run the project in development mode, use the following command:

```bash
npm run dev
```

If you want to run the TypeScript compiler in watch mode alongside the development server, use:

```bash
npm run dev:ts
```

### Building the Project

To build the project, run the following command:

```bash
npm run build
```

This command will first compile the TypeScript files and then build the project using the `next` command.

## Starting the Production Server

To start the production server, first build the project (if you haven't already), and then run the following command:

```bash
npm run start
```

### Exporting the Project

To export the project for deployment to IPFS, run the following command:

```bash
npm run export
```

This command will first compile the TypeScript files, then build the project using the `next` command, and finally export the build to the `ipfs` folder.

### Linting

To run the ESLint linter on the project, use the following command:

```bash
npm run lint
```

This command will check all `.js`, `.jsx`, `.ts`, and `.tsx` files in the project for linting issues.

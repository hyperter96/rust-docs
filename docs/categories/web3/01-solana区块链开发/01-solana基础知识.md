---
title: solana基础知识
author: 皮特ᴾᵗ
date: 2024/06/03 12:21
categories:
 - solana区块链开发
tags:
 - Rust
 - Web 3.0
 - solana
---

# solana基础知识

## solana网络

solana是为**大规模采用**而构建的区块链，它是一个**高性能网络**、拥有各种用例，包括金融、NFT、支付和游戏。solana作为一个单一的全球状态机运行、是**开放**的、**可互操作**的和**去中心化**的。

我们看到如下概览：

![](https://rust.hyperter.top/screenshot/solana-content.png)

### solana网络的技术优势

- 迅速的确认时间：和其他区块链相比，一个solana交易可以在大约400毫秒内被整个网络验证
- 低交易费用：通常每个交易签名大约需要`5000`个`Lamports`
- 并行执行的程序和交易
- 适合高性能应用程序

所有这些实际上是通过全球范围内分布的超过`25000`个投票验证者保持着有效的共识，因此，这是一个由来自世界各地的实体和个人运行的非常全球化的网络。

### solana网络实际是如何工作的

![](https://rust.hyperter.top/screenshot/solana-network.png)

在高层次上，有一个领导者和多个验证者，这位领导者将接收整个区块链中的所有交易。它将处理在前端创建的所有这些交易以及你习惯于与区块链交互的去中心化应用程序，然后领导者将接收的这些交易打包进区块中，这些区块随后将通过整个solana网络传播，通过全球`2500`个投票。

验证者使用一个名为`turbine`的代码片段，而`turbine`仅仅是solana协议的区块传播部分，这些交易区块就这样被发送到世界各地。

solana有趣的一点是所有这些交易实际上可以并行执行，这归功于solana的设计方式，其中的一部分原因是，solana上的每一笔交易实际上是无状态的，所以特定的交易不维护自己的状态或数据，它是与实际存储这些数据位的账户互动，但是每一笔交易都将读取和写入solana区块链上的不同账户。因为所有这些读取和写入在区块链上以不同的方式处理。它允许所有这些交易非常快速的执行，这再次导致了非常低的确认时间和整个网络非常快速的传播。

所有这些使用了一种称为历史证明的概念。

## solana编程模型

### `Accounts`

账户是solana区块链的关键部分之一，基本上在solana上一切都是账户。你可以将账户看作是操作系统上的文件，特别是如果你习惯基于Linux的操作系统，每一个程序，每一位数据都是一个文件，在solana上非常类似，一切都是账户。账户有以下特点：

- 唯一的`256`位地址
- 可持有solana区块链上本地的`SOL TOKEN`
- 存储任意数据，以原始字节的形式
- 实际的数据存储需要支付我们称之为租金的费用

:::warning 关键事项
- 任何人都可以向账户充值`SOL TOKEN`，并且任何人都可以以无需许可的形式从账户中读取数据
- 只有账户的所有者才能实际扣除`SOL`或者从中移除`SOL`余额，或者实际修改账户的底层数据

这实际上是你所希望的，因为这样可以固有的确保谁真正拥有数据，并且可以进行所有权验证。
:::

以下是`Accounts`的字段：

```json
{
    key: number, // The address of account 账户地址
    lamports: number, // Lamports currently held 实际总余额
    data: Uint8Array, // Data stored in the account 实际数据
    is_executable: boolean, // Is this data a program? 可执行程序标志
    owner: PublicKey, // The program with write access 所有者值
}
```

值得注意的是，

- 1个`sol`大约是10亿个`Lamports`
- `data`是以无符号整数或`u8`数组形式存储的原始字节
- `is_executable`如果为`true`，它是一个可执行程序，如果为`false`，那么它只是一个数据账户
- `owner`表示只有该账户的程序所有者实际上有能力更新该账户中的数据

### `Programs`

在其他区块链上，程序可能被称为智能合约，但在solana上，它们被称为程序。这些基本上是你可以部署到区块链上的代码片段，以去中心化的方式，实际上会执行某些指令和处理。特别是对于solana的程序，它们是

- 一种特殊类型的账户：如果它们有一个可执行标志为`true`，solana运行时知道它实际上是一个程序
- 存储在该特定账户内的数据是eBPF字节码：这是Berkeley数据包括滤器字节码
- 都是无状态的，它们只能读取和写入其它账户的数据，因此它们不能写入自己账户的数据

    - 这也是允许程序并行执行的因素之一，也促使solana区块链运行速度的提升
- 只有所有者才能更新账户，因此如果你正在编写程序，你可以让你编写的任何程序成为任何其它账户的所有者，只要你有适当的权限，只有你的程序才能写入那些账户的数据
- 所有程序执行指令：指令是你试图要求solana运行时或特定程序执行的信息位
- 可以使用称为跨程序调用CPI的东西相互发送指令，或者你可以用前端，如Javascript或Typescript上的网站获取中心化应用上构建指令，然后将其发送到solana示意执行

#### 程序指令

程序的原始指令形态如下：

```json
{
    program_id: number,
    keys: Array<{
        key: PublicKey,
        is_mutable: boolean,
        is_signer: boolean,
    }>,
    data: Uint8Array, // Action + args
}
```

执行指令时，你会有`key`字段的数组，这些都是实际参与执行特定指令的账户，这是让solana运行时性能非常高的原因之一，每个在交易内或特定于指令内被触及的地址或账户，你都必须在指令内提供所有这些值和地址。

这种技术是solana区块链和solana运行时能够并行执行的原因之一。

最后，你有一定量的数据以原始字节的形式。这些数据通过网络发送到你尝试交互的那个程序，也就是`program_id`，然后你取所有这些指令，可以有多个指令，并将它们在一次交易内捆绑在一起，一次交易是你实际发送到RPC或发送到solana网络上的验证者的东西，然后通过那个领导者过程和整个网络的`turbine`执行或`turbine`区块传播被处理。

```json
{
    message: {
        instructions: Array<Instruction>, // List of instructions
        recent_blockhash: number, // for de-duplication
        fee_payer: PublicKey, // pays "gas" fee
        ...
    },
    signers: Array<Uint8Array>,
}
```

这里你可以看到一次交易的原始形式，你有一些关键信息，我们有

- 指令数组`instructions`，只是这次交易尝试执行的指令列表
- 最近的区块哈希`recent_blockhash`，用于交易的去重复
- 实际将为你的特定交易支付燃料费的付费方地址`fee_payer`
- 所有签名者的宿主`signers`

    所以在每次交易中，每当一个账户更新数据时，无论是更新实际数据本身，还是从账户中扣除`Lamport`或`sol`，都需要这个公钥实际签署交易，这允许在区块链上进行加密验证和签名验证。我们只是将所有这些签名以原始字节的形式包含在每次交易中

:::warning 交易和指令的关键要点

- 程序调用指令
- 指令通过交易发送
- 交易需要是原子的
- 所有交易都必须签名
:::

## solana交易的生命周期

现在我们将通过交易的生命周期和这一切联系起来，

![](https://rust.hyperter.top/screenshot/solana-lifecycle.png)

## solana Token系统

![](https://rust.hyperter.top/screenshot/solana-token-system.png)

关于solana的Token系统，这涉及三个不同的程序如上，

- Token程序
- 关联Token程序（简称AT）
- 元数据程序

Token程序和关联Token程序是由Solana Labs部署的，而元数据程序的一个著名例子是由metaplex foundation部署的。因此这三个程序有两个不同的组织构建，几乎所有在solana区块链上的用户都会用到它们。

在创建Token的过程中，Token程序负责执行所谓的Mint操作。Mint本质上一个账户拥有创建特定Token余额的权限，可以将其类比为传统政府的运作，例如美国政府拥有财政部，财政部掌管着美国铸造厂，后者负责制造国家货币。同样的Token程序管理着一个Mint，这个Mint有权铸造新的Token，Token需要被钱包或用户拥有，以便能够与区块链的其它部分进行交互。

这是通过一种特殊的所有权关系实现的，即关联Token账户（ATA），其中一个钱包拥有对ATA的控制权和所有权。ATA存储用户在区块链上交互的`SPL Token`的地方。

此外，Token可以通过如metaplex的元数据程序关联元数据，这些元数据可能包括Token的名称，代表该Token的图像等视觉信息以及其他标识信息如Token符号，这些信息被存储在元数据程序关联的元数据账户中，该账户与Token的Mint过程相关联。

### 关联Token账户

![](https://rust.hyperter.top/screenshot/ata.png)

当我们提到关联Token账户ATA时，我们是在创建一个特定的程序派生地址PDA，这是通过用户钱包的种子、Token程序和Mint地址共同生成的，所有这些都由关联Token程序拥有，实际上它只是存储余额的一个账户。

### 元数据账户

![](https://rust.hyperter.top/screenshot/metadata-account.png)

对于NFT获益`SPL Token`的元数据账户，我们通过元数据的静态值、元数据程序和Mint地址生成了一个PDA，该PDA由元数据程序拥有。在这个数据结构中，我们在链上存储了特定的数据，如`title`、`symbol`和一个`uri`值，这个`uri`通常存储在链外，需要被检索和处理，还有一个创作者列表`creators`。

:::warning 关键要点
- Mint账户记录了Token的铸造信息
- 关联Token账户记录了用户的余额
- 元数据账户则存储了的特定Mint的详细元数据信息
:::

### 创建`SPL Token`的过程

如果你想创建一个`SPL Token`，比如为你的特定用例做一个独特的Token，你可以通过一个solana交易来实现。在这个过程中，你将构建必要的指令，来在链上执行各种操作，包括

- 创建新账户
- 初始化这个账户作为Mint
- 创建关联Token账户ATA
- 将Token从Mint铸造到关联Token账户中

所有这些操作都可以通过solana区块链上的一次交易完成，这展示了solana的强大组合能力，意味着你无需部署新程序就能创建Token或`SPL Token`。

:::warning SPL Token的关键要点
- 不需要部署新的程序
- 通过单一交易或一次RPC调用就可以创建新Token
- 涉及到多个账户，如Mint账户、关联Token账户和元数据账户，它们以可组合的方式相互作用
:::

### `SPL Token`的账户状态

我们创建了Token的Mint账户，

```json
{
    is_initialized: boolean,
    supply: number,
    decimals: number, // quantity * 10 ^ (-1 * d)
    mint_authority: PublicKey, // who can mint new tokens
    freeze_authority: PublicKey,
}
```
并观察到了小数位数`decimals`、是否初始化供应量`is_initialized`、铸造权限`mint_authority`和冻结权限`freeze_authority`在内的各种设置。NFT的小数位为0，因为它们本质上与`SPL Token`相同，只不过是关联到特定地址和特定元数据的Token

### NFTs

- NFT本质上是`SPL Token`
- 特定铸币的小数位为`0`
- 供应量恰好为1个
- 拥有高度可定制的元数据，如多个图像各种属性等

这些特性在NFT市场上非常常见。关于NFT，还有两个概念需要了解，**主板和集合**，主板和集合基本上是存储在链上的特殊账户，其中集合是一个NFT，用于分组并与集合中的NFT关联，主板账户则存储特定的元数据信息。



## 实战

仓库链接：[https://github.com/solana-developers/pirate-bootcamp](https://github.com/solana-developers/pirate-bootcamp)

首先我们先安装包和配置环境变量，

1. 安装包`yarn install`
2. 重命名`example.env`为`.env`
3. 将上述环境变量文件`.env`中的变量`RPC_URL`修改为集群的RPC供应端地址，可通过`solana config get`查看

### 创建简单的交易

我们看到`simpleTransaction.ts`这个文件，第一步先进行非常标准的导入，

```js
// import custom helpers for demos
import { payer, connection } from "@/lib/vars";
import { explorerURL, printConsoleSeparator } from "@/lib/helpers";

//
import {
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
```

在这之后，我们创建一个异步函数，我将在js中使用一些异步，

```js
console.log("Payer address:", payer.publicKey.toBase58()); // 记录付款方地址
```

然后我们将进行一个异步等待，我们将获取这个密钥对的余额，

```js
// get the current balance of the `payer` account on chain
const currentBalance = await connection.getBalance(payer.publicKey);
console.log("Current balance of 'payer' (in lamports):", currentBalance);
console.log("Current balance of 'payer' (in SOL):", currentBalance / LAMPORTS_PER_SOL);
```

如果这个地址的余额非常低，少于一个`SOL`，那么会请求空投，

```js
// airdrop on low balance
if (currentBalance <= LAMPORTS_PER_SOL) {
    console.log("Low balance, requesting an airdrop...");
    await connection.requestAirdrop(payer.publicKey, LAMPORTS_PER_SOL);
}
```
接下来，生成一个全新的密钥对，

```js
// generate a new, random address to create on chain
const keypair = Keypair.generate();

console.log("New keypair generated:", keypair.publicKey.toBase58());
```
我们会记录这个密钥对的具体地址。接下来我们将处理租金的支付问题，

```js
// on-chain space to allocated (in number of bytes)
const space = 0;

// request the cost (in lamports) to allocate `space` number of bytes on chain
const lamports = await connection.getMinimumBalanceForRentExemption(space);

console.log("Total lamports:", lamports);
```

在solana区块链上，所有账户所占用的空间都需要支付租金，这意味着你需要预付两年的租金以保证你的空间在solana区块链上得以存储，这种做法被称为免租金支付，即提前支付足够的余额。基本上，每当你打算在区块链上分配空间时，这都是一种激励措施，鼓励验证者保持你的空间和数据在区块链上的存在。因此，这就是预先支付这笔费用。

solana的`web3.js`库提供了一个名为`getMinimumBalanceForRentExemption`的辅助函数，需要我们指定打算分配多少空间。在我们的案例中，我们想创建一个简单的账户来存储`Lamport`余额或`SOL`余额，实际上并不需要分配额外空间。因此，这将是对任何特定账户支付的最低可能租金。因此，我们会请求`0`字节空间的最小免租金余额，并将所需的`Lamports`数量记录到控制台。

之后我们开始构建第一笔交易，特别是准备我们第一次交易的指令，首先我们将使用系统程序作为所有者，并在链上创建一个账户，因为每个账户都是由一个程序拥有的。对于仅仅持有余额的一般普通账户，这些都是由系统程序拥有的，系统程序在每次验证者通过验证者生命周期得到更新时，都会嵌入到solana运行时中，这意味着solana运行时程序将会定期得到修正等。这与你开发者可能尝试部署的程序不同。

```js
// create this simple instruction using web3.js helper function
const createAccountIx = SystemProgram.createAccount({
    // `fromPubkey` - this account will need to sign the transaction
    fromPubkey: payer.publicKey,
    // `newAccountPubkey` - the account address to create on chain
    newAccountPubkey: keypair.publicKey,
    // lamports to store in this account
    lamports,
    // total space to allocate
    space,
    // the owning program for this account
    programId: SystemProgram.programId,
});
```

为此，我们将使用`SOL`余额的付款方地址`payer.publicKey`，我们将告诉他我们想要在链上分配的新地址是创建新的随机密钥对`keypair.publicKey`，然后我们告诉这个新地址我们要存储多少`Lamports`，并且我们需要确保存储足够的`Lamports`以免除租金，我们会在链上分配必要的空间，以便在solana devnet区块链上注册这个地址，确保其在链上的存在。

```js
// get the latest recent blockhash
let recentBlockhash = await connection.getLatestBlockhash().then(res => res.blockhash);
```

正如之前提到的，每个交易都需要关联一个最近的区块哈希，以便我们能够有效的使用区块链并请求最新的区块哈希。获得这个值后，我们会在发送交易之前，将其加入到我们的交易中，这就是我们现在要做的工作。通过我们的连接，我们获取了最新的区块哈希，并对其进行一些解构操作，仅提取区块哈希值。随后我们将这个哈希值包含进我们的交易中，

```js
// create a message (v0)
const message = new TransactionMessage({
    payerKey: payer.publicKey,
    recentBlockhash,
    instructions: [createAccountIx],
}).compileToV0Message();
```
我们要构建的是一个版本化的交易，它正成为一个越来越普遍的标准，并得到整个生态系统的支持。

我们开始构建交易，将我们的指令列表`createAccountIx`添加到一个`instructions`字段的数组中。接着我们将指明谁将最终创建和签署交易

```js
// create a versioned transaction using the message
const tx = new VersionedTransaction(message);

// console.log("tx before signing:", tx);

// sign the transaction with our needed Signers (e.g. `payer` and `keypair`)
tx.sign([payer, keypair]);

console.log("tx after signing:", tx);
```

由于每个交易都至少涉及到从一个账户扣除或借记某个`SOL Token`，因此至少需要一个签名。在这个场景中，因为我们还涉及到链上分配空间，以及以某个地址创建账户的操作，该地址的密钥对也必须签署交易。因此，我们将使用我们的支付者账户和密钥对进行签名，

```js
// actually send the transaction
const sig = await connection.sendTransaction(tx);
```

然后通过我们的连接将交易发送至区块链。

### 创建一个带有元数据的`SPL Token`

先导入各种组件，

```js
import { payer, testWallet, connection } from "@/lib/vars";

import {
  buildTransaction,
  explorerURL,
  extractSignatureFromFailedTransaction,
  printConsoleSeparator,
  savePublicKeyToFile,
} from "@/lib/helpers";

import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { MINT_SIZE, TOKEN_PROGRAM_ID, createInitializeMint2Instruction } from "@solana/spl-token";

import {
  PROGRAM_ID as METADATA_PROGRAM_ID,
  createCreateMetadataAccountV3Instruction,
} from "@metaplex-foundation/mpl-token-metadata";
```

特别的，我们从本地存储库导入了一些变量值和函数以及来自`web3.js`的特定组件，还有solana的`SPL Token`库和metaplex基金会的`MPL metaplex`库。这些用于处理Token的元数据。

异步函数中，我们会记录我们的付款方地址和测试钱包地址，

```js
console.log("Payer address:", payer.publicKey.toBase58());
console.log("Test wallet address:", testWallet.publicKey.toBase58());
```

并随机生成一个新的密钥对，用于我们的`SPL Token`，

```js
// generate a new keypair to be used for our mint
const mintKeypair = Keypair.generate();

console.log("Mint address:", mintKeypair.publicKey.toBase58());
```

我们还会定义一些配置信息，用于描述我们想要创建的Token的元数据，包括Token的名称和符号。

```js
// define the assorted token config settings
const tokenConfig = {
    // define how many decimals we want our tokens to have
    decimals: 2,
    //
    name: "Seven Seas Gold",
    //
    symbol: "GOLD",
    //
    uri: "https://thisisnot.arealurl/info.json",
};
```
这个Token的配置URI，它指向一个可以包含你特定Token的额外元数据和信息的`json`文件地址。对于上面这个示例，我们并没有链接到一个真实的URL，但是你打算将在主网上使用的真实Token，那么你需要一个实际存在的`json`文件。Token还有一个定义`decimals`小数位数的属性，每个Token可以有不同的小数位数，范围从0小数位只允许整数到多个小数位。

接下来，我们将开始构建我们的指令，

```js
// create instruction for the token mint account
const createMintAccountInstruction = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: mintKeypair.publicKey,
    // the `space` required for a token mint is accessible in the `@solana/spl-token` sdk
    space: MINT_SIZE,
    // store enough lamports needed for our `space` to be rent exempt
    lamports: await connection.getMinimumBalanceForRentExemption(MINT_SIZE),
    // tokens are owned by the "token program"
    programId: TOKEN_PROGRAM_ID,
});
```
这与我们之前创建简单交易在链上创建账户的过程类似，我们将使用系统程序的`createAccount`方法来创建一个新账户，并为其分配足够的空间来容纳一个Mint，这个所需空间的大小是从solana `SPL Token`包中引入的常量变量，它提供了创建特定账户所需的空间值。这种做法在与各种Javascript和Typescript包交互时非常常见，因为它们提供了辅助函数和常量值避免了需要硬编码的情况。这样我们就可以分配足够的空间给我们的Mint账户，无论具体需要多少空间。

接下来的字段`lamports`，我们会计算创建Token账户所需的最低余额，以确保该账户免于支付租金。这次我们的Mint账户将由solana的Token程序拥有，和Mint所需的空间大小一样，这个值是由solana `SPL Token`包提供的，通常以`Tokenkeg`为前缀。因此Token程序将具有对我们Mint账户的完全控制权，使其能够在我们的指示下，能铸造更多Token。

我们接下来做的是初始化Mint账户，

```js
// Initialize that account as a Mint
const initializeMintInstruction = createInitializeMint2Instruction(
    mintKeypair.publicKey,
    tokenConfig.decimals,
    payer.publicKey,
    payer.publicKey,
);
```

让Token程序知道这个账户将用作铸造。我们已经为其分配了空间，并将告诉Token程序这是一个Mint，确保它能够正确的与之交互。我们将提供正确的必要信息，包括账户的地址，Token的小数位数交易付款人以及铸造权`mintAuthority`和冻结权`freezeAuthority`的所有者信息，只有被指定为铸造权`mintAuthority`的地址才能制造更多Token。

冻结权`freezeAuthority`则是一个类似的概念，它允许你冻结Token，从而防止额外的Token被铸造。如果设置了冻结权限，你还可以将冻结权限设置为空值来禁止铸造，实质上是锁定Token的Mint过程，确保没有人能为你的特定Mint再铸造新的Token。

接下来，我们将确定用于在链上保持我们Token元数据的元数据账户地址，

```js
// derive the pda address for the Metadata account
const metadataAccount = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), METADATA_PROGRAM_ID.toBuffer(), mintKeypair.publicKey.toBuffer()],
    METADATA_PROGRAM_ID,
)[0];

console.log("Metadata address:", metadataAccount.toBase58());
```

这里涉及到所谓的程序派生地址PDA。PDA是solana区块链上的一种特殊账户或地址类型，允许程序为特定用途签名交易，这主要基于solana密钥对所使用的加密曲线技术。

需要强调的是，我们计算出的这个特定元数据账户，是由Token元数据程序所拥有。其标识通常以`Matex`开头。这意味着Token元数据程序具有对这个账户的控制权。它用于存储与Token的相关信息，例如Token名称、符号、图片等。

首先我们以一个硬编码的字符串作为起始点，作为结合一系列值来定义元数据，包括元数据程序本身以及我们先前生成的铸币对。这些元素一起构成了一种键值对，我们利用它们作为种子，从元数据程序派生出程序派生地址PDA，接着我们把这个地址记录下来。

接下来我们创建指令，

```js
const createMetadataInstruction = createCreateMetadataAccountV3Instruction(
    {
        metadata: metadataAccount,
        mint: mintKeypair.publicKey,
        mintAuthority: payer.publicKey,
        payer: payer.publicKey,
        updateAuthority: payer.publicKey,
    },
    {
        createMetadataAccountArgsV3: {
            data: {
            creators: null,
            name: tokenConfig.name,
            symbol: tokenConfig.symbol,
            uri: tokenConfig.uri,
            sellerFeeBasisPoints: 0,
            collection: null,
            uses: null,
            },
            // `collectionDetails` - for non-nft type tokens, normally set to `null` to not have a value set
            collectionDetails: null,
            // should the metadata be updatable?
            isMutable: true,
        },
    },
);
```

特别的，我们创建的是一个元数据V3指令，我们传入所有必需的值和地址，以便实际创建这个账户，这包括我们刚刚派生的PDA值的元数据账户`metadataAccount`、铸币密钥对`mintKeypair.publicKey`、铸币权限`payer.publicKey`、支付方`payer.publicKey`和更新权限`payer.publicKey`。

此外，我们将提供要存储在元数据中的数据，如名称`name`、符号`symbol`、销售费用基点`sellerFeeBasisPoints`。

现在我们已经构建了三个指令，可以将它们打包进一个单一交易中，

```js
const tx = await buildTransaction({
    connection,
    payer: payer.publicKey,
    signers: [payer, mintKeypair],
    instructions: [
      createMintAccountInstruction,
      initializeMintInstruction,
      createMetadataInstruction,
    ],
});
```

利用内置的辅助函数`buildTransaction`，这个过程涉及获取最近的区块哈希，将其加入到版本交易当中，并使用所有相关地址进行签名。

在这个示例中，我们要使用支付方进行签名，因为支付方负责支付费用，同时也需要铸币密钥对的签名。我们是在链上分配新账户，这个账户也需要进行交易签名。通过将这三个指令集成到一个交易中并进行签名后，我们将交易发送到区块链，接下来进行铸造，

```js
try {
    // actually send the transaction
    const sig = await connection.sendTransaction(tx);

    // print the explorer url
    console.log("Transaction completed.");
    console.log(explorerURL({ txSignature: sig }));

    // locally save our addresses for the demo
    savePublicKeyToFile("tokenMint", mintKeypair.publicKey);
  } catch (err) {
    console.error("Failed to send transaction:");
    console.log(tx);

    // attempt to extract the signature from the failed transaction
    const failedSig = await extractSignatureFromFailedTransaction(connection, err);
    if (failedSig) console.log("Failed signature:", explorerURL({ txSignature: failedSig }));

    throw err;
  }
})();
```

### 铸造Token

首先，我们导入所需模块

```js
// import custom helpers for demos
import { payer, connection } from "@/lib/vars";
import { explorerURL, loadPublicKeysFromFile } from "@/lib/helpers";

import { PublicKey } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
```

并记录付款方地址，

```js
console.log("Payer address:", payer.publicKey.toBase58());
```

我们额外加载了一个密钥，这些密钥来自于一个本地的`json`文件。在这个情境下，我们主要是加载Token铸造地址，因为每次你想要为某个Mint铸造新的Token时，都需要这个地址，因此我们确保它被正确的转换为公钥格式，但是我们已经有了Token铸造地址。虽然在同一个脚本或指令集合中可以完成所有步骤。

```js
// load the stored PublicKeys for ease of use
let localKeys = loadPublicKeysFromFile();

// ensure the desired script was already run
if (!localKeys?.tokenMint)
    return console.warn("No local keys were found. Please run '3.createTokenWithMetadata.ts'");

const tokenMint: PublicKey = localKeys.tokenMint;

console.log("==== Local PublicKeys loaded ====");
console.log("Token's mint address:", tokenMint.toBase58());
console.log(explorerURL({ address: tokenMint.toBase58() }));
```

我们接下来需要获得或创建一个关联Token账户，

```js
// get or create the token's ata
const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    tokenMint,
    payer.publicKey,
).then(ata => ata.address);
```

如之前所说，关联Token账户是将拥有你所铸造Token的账户，然后这个关联Token账户由用户所拥有，它直接关联到你的Token。我们将使用`SPL Token` SDK的辅助函数`getOrCreateAssociatedTokenAccount`来获取或创建属于支付方`payer`的关联Token账户，同时我们也会设置交易的支付方和铸造地址。

这个函数将使用一个程序派生地址PDA，它会派生出一个地址，然后检查该账户是否已经在链上分配，如果还没有分配，它就会创建这个账户，这为我们提供了方便。

在这个过程中，我们尝试获取关联Token账户、该账户的实际所有者以及你Token的所有者，这个所有者可能与支付交易费用的支付方`payer`不同。上述示例中，这个支付方`payer`恰好也是所有者。

然而如果你是开发者，打算创建Token并将其空投给用户，你可以选择自己支付交易费用和链上分配空间的费用，或者让用户根据具体情况来承担这些费用。

```js
console.log("Token account address:", tokenAccount.toBase58());
```
我们获取我们的Token账户的公钥值，随后我们将执行铸造Token的过程，从我们的Mint账户到ATA，这个过程中，小数位数起到了关键作用，在`SPL Token`程序中铸造Token时，小数位数非常重要。我们创建的Token铸造设置了两位小数。因此如果我们请求铸造的Token数量为`1,000`，需要考虑到这些Token将包含两位小数，举例：

- 如果小数位数`decimals=2`，请求铸造的Token为`amount=1_000`，那么实际铸造的Token为`10`个
- 如果小数位数`decimals=2`，请求铸造的Token为`amount=1_0000`，那么实际铸造的Token为`100`个
- 如果小数位数`decimals=2`，请求铸造的Token为`amount=10`，那么实际铸造的Token为`0.10`个

```js
// mint some token to the "ata"
console.log("Minting some tokens to the ata...");
const mintSig = await mintTo(
    connection,
    payer,
    tokenMint,
    tokenAccount,
    payer,
    amountOfTokensToMint,
);

console.log(explorerURL({ txSignature: mintSig }));
```

现在我们可以利用`SPL Token`程序SDK提供的辅助函数`mintTo`来向ATA铸造Token，需要传入上述的必要信息：

- `payer`：谁将支付交易费用
- `mint`：哪个Mint账户将被用来铸造Token
- `destination`：哪个ATA将接收Token
- `mintAuthority`：交易的所有者
- `amount`：打算铸造的Token数量

这样我们就能完成Token的铸造过程，然后我们会在控制台记录下探索器URL并运行脚本来向我们的关联Token账户ATA铸造一些Token。

### 创建NFT

首先导入所需模块，

```js
// import custom helpers for demos
import { payer, connection } from "@/lib/vars";
import { explorerURL, loadPublicKeysFromFile, printConsoleSeparator } from "@/lib/helpers";

import { PublicKey } from "@solana/web3.js";
import { Metaplex, bundlrStorage, keypairIdentity } from "@metaplex-foundation/js";
```
获取支付方地址和所需的密钥对，

```js
console.log("Payer address:", payer.publicKey.toBase58());

//////////////////////////////////////////////////////////////////////////////

// load the stored PublicKeys for ease of use
let localKeys = loadPublicKeysFromFile();

// ensure the desired script was already run
if (!localKeys?.tokenMint)
    return console.warn("No local keys were found. Please run '3.createTokenWithMetadata.ts'");

const tokenMint: PublicKey = localKeys.tokenMint;

console.log("==== Local PublicKeys loaded ====");
console.log("Token's mint address:", tokenMint.toBase58());
console.log(explorerURL({ address: tokenMint.toBase58() }));
```
在创建NFT时，我们会添加一些元数据，并且将一个图像铸造成NFT，这里我们使用的是一个指向IPFS网络的去中心化存储提供者的链接。我们给这个NFT指定一个名称、一个符号和一段描述。

在这个示例中，我们不会手动完成铸造NFT的所有指令，相反，我们将使用`metaplex SDK`进行操作，`metaplex SDK`是由`metaplex`基金会提供的一个开源软件开发工具包，它提供了多个辅助函数，使我们能够轻松地创建NFT，并在solana区块链上进行操作，接下来我们会创建一个新的`metaplex`实例，并提供网络连接信息`connection`，

```js
// create an instance of Metaplex sdk for use
const metaplex = Metaplex.make(connection)
    // set our keypair to use, and pay for the transaction
    .use(keypairIdentity(payer))
    // define a storage mechanism to upload with
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
      }),
);
```
支付方地址`payer`将用于签署所有相关交易，同时我们将使用该地址将元数据上传至IPFS，我们还会通过捆绑器网络和IPFS提供一些必要的信息。如果你打算在主网上操作，这些配置可能就不必要了。

我们利用`metaplex SDK`上传元数据，这个过程涉及将Javascript对象作为`json`上传到IPFS网络，这是一个去中心化的文件存储系统。
```js
// upload the JSON metadata
const { uri } = await metaplex.nfts().uploadMetadata(metadata);

console.log("Metadata uploaded:", uri);
```
接下来，我们使用上述的URI、名称和符号来铸造我们的第一个NFT，

```js
console.log("Creating NFT using Metaplex...");

// create a new nft using the metaplex sdk
const { nft, response } = await metaplex.nfts().create({
    uri,
    name: metadata.name,
    symbol: metadata.symbol,

    // `sellerFeeBasisPoints` is the royalty that you can define on nft
    sellerFeeBasisPoints: 500, // Represents 5.00%.

    //
    isMutable: true,
});

console.log(nft);
```
我们调用`metaplex SDK`的`create`函数，且提供所有想要的元数据，包括图像、元数据、URL即指向我们图像的链接、名称、符号以及设置卖家费用基点`sellerFeeBasisPoints`，这通常被视为在各种市场上的版税。

:::warning 注意
所设置的版税是创作者对销售额所要求的百分比。
:::

这个示例中，是`5%`，即`500`基点，这意味着你要求对所有销售额的`5%`作为版税支付给你指定的版税地址。在我们特定的NFT示例中，我们将版税设置为`isMutable: true`，这允许我们更改和更新NFT的元数据。
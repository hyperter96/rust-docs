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

现在我们将通过交易的生命周期和这一切联系起来，

![](https://rust.hyperter.top/screenshot/solana-lifecycle.png)
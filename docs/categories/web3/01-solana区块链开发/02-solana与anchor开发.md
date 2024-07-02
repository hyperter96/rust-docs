---
title: solana与anchor开发
author: 皮特ᴾᵗ
date: 2024/06/05 11:21
categories:
 - solana区块链开发
 - Web 3.0
tags:
 - Rust
 - Web 3.0
 - solana
 - anchor
---

# solana与anchor开发

## 什么是anchor

Anchor 是一个用于快速构建安全 Solana 程序的框架。

使用 Anchor，您可以快速构建程序，因为它会为您编写各种样板，例如帐户和指令数据的（反）序列化。

您可以更轻松地构建安全程序，因为 Anchor 会为您处理某些安全检查。 最重要的是，它允许您简洁地定义其他检查并将它们与您的业务逻辑分开。

这两个方面意味着，您不必处理原始 Solana 程序的繁琐部分，而是可以花更多时间处理最重要的事情，即您的产品。

## 安装

Anchor 版本管理器是一个用于使用多个版本的 `anchor-cli` 的工具。它需要与从源代码构建相同的依赖项。如果您已安装 `NPM` 包，建议您卸载它。

使用 `Cargo` 安装 `avm`。

:::warning 注意
如果您已安装，这将替换您的 `anchor` 二进制文件。
:::

```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
```

使用 `avm` 安装最新版本的 CLI，然后将其设置为要使用的版本。

```bash
avm install latest
avm use latest
```

## 创建`Hello world`

如果初始化新项目，命令如下：

```bash
anchor init <new-workspace-name>
```

这将创建一个您可以移入的新`anchor`工作区。以下是文件夹中的一些重要文件：

- `.anchor` 文件夹：它包含最新的程序日志和用于测试的本地分类帐
- `app` 文件夹：如果您使用 `monorepo`，则可以使用它来保存前端的空文件夹
- `programs` 文件夹：此文件夹包含您的程序。它可以包含多个程序，但最初只包含一个与 `<new-workspace-name>` 同名的程序。此程序已包含一个带有一些示例代码的 `lib.rs` 文件。
- `tests` 文件夹：包含您的 `E2E` 测试的文件夹。它将已经包含一个测试 `programs/<new-workspace-name>` 中的示例代码的文件。
- `migrations` 文件夹：在此文件夹中，您可以保存程序的部署和迁移脚本。
- `Anchor.toml` 文件：此文件为您的程序配置工作区范围的设置。首先，它会配置
    - 您的程序在本地网络上的地址 (`[programs.localnet]`)
    - 您的程序可以推送到的注册表 (`[registry]`)
    - 可用于测试的提供程序 (`[provider]`)
    - `Anchor` 为您执行的脚本 (`[scripts]`)。运行`anchor test`时会运行`test`脚本。您可以使用 `anchor run <script_name>` 运行您自己的脚本。

## 高层概述

`Anchor` 程序由三部分组成。程序模块、标有 `#[derive(Accounts)]` 的 `Accounts` 结构和 `declared_id` 宏。`program`模块是您编写业务逻辑的地方。`Accounts` 结构是您验证帐户的地方。`declare_id` 宏创建一个 `ID` 字段，用于存储程序的地址。`Anchor` 使用此硬编码 `ID` 进行安全检查，它还允许其他包访问您程序的地址。

当您启动新的 `Anchor` 项目时，您将看到以下内容：

```rust
// use this import to gain access to common anchor features
use anchor_lang::prelude::*;


// declare an id for your program
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");


// write your business logic here
#[program]
mod hello_anchor {
    use super::*;
    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

// validate incoming accounts here
#[derive(Accounts)]
pub struct Initialize {}
```

我们将在下一节中详细介绍，但现在请注意，端点与其对应的 `Accounts` 结构连接的方式是端点中的 `ctx` 参数。该参数的类型为 `Context`，它是 `Accounts` 结构上的通用类型，也就是说，您可以在此处放置帐户验证结构的名称。在此示例中，它是 `Initialize`。

## `Accounts`结构体

`Accounts`结构体是您定义指令需要哪些账户以及这些账户应遵守哪些约束的地方。您可以通过两个结构体来实现这一点：类型`Types`和约束`Constraints`。

### 类型`Types`

在这里我们将简单解释一下最重要的类型，即`Account`类型。

#### `Accounts`类型

当指令倾向于帐户的反序列化数据时，使用 `Account` 类型。考虑以下示例，我们在帐户中设置一些数据：

```rust
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
mod hello_anchor {
    use super::*;
    pub fn set_data(ctx: Context<SetData>, data: u64) -> Result<()> {
        ctx.accounts.my_account.data = data;
        Ok(())
    }
}

#[account]
#[derive(Default)]
pub struct MyAccount {
    data: u64
}

#[derive(Accounts)]
pub struct SetData<'info> {
    #[account(mut)]
    pub my_account: Account<'info, MyAccount>
}
```
`Account` 是 `T` 上的通用类型。此 `T`是您可以自己创建来存储数据的类型。在此示例中，我们创建了一个带有单个`data`字段的结构 `MyAccount` 来存储 `u64`。`Account` 需要 `T` 来实现某些功能（例如，对 `T` 进行（反）序列化的功能）。大多数情况下，您可以使用 `#[account]` 属性将这些功能添加到您的数据中，如示例中所示。

最重要的是，`#[account]` 属性将该数据的所有者设置为使用 `#[account]` 的包的 `ID`（我们之前使用 `declared_id` 创建的 `ID`）。然后，`Account` 类型可以为您检查传递给您的指令的 `AccountInfo` 是否将其所有者字段设置为正确的程序。在此示例中，`MyAccount` 在我们自己的包中声明，因此 `Account` 将验证 `my_account` 的所有者是否等于我们用 `declared_id` 声明的地址。

**将 `Account<'a, T>` 与非`Anchor`程序帐户一起使用**

在某些情况下，您可能希望您的程序与非`Anchor`程序进行交互。您仍然可以获得 `Account` 的所有好处，但您必须编写自定义包装器类型，而不是使用` #[account]`。例如，`Anchor` 为代币程序帐户提供了包装器类型，因此它们可以与 `Account` 一起使用。

```rust
use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
mod hello_anchor {
    use super::*;
    pub fn set_data(ctx: Context<SetData>, data: u64) -> Result<()> {
        if ctx.accounts.token_account.amount > 0 {
            ctx.accounts.my_account.data = data;
        }
        Ok(())
    }
}

#[account]
#[derive(Default)]
pub struct MyAccount {
    data: u64,
    mint: Pubkey
}

#[derive(Accounts)]
pub struct SetData<'info> {
    #[account(mut)]
    pub my_account: Account<'info, MyAccount>,
    #[account(
        constraint = my_account.mint == token_account.mint,
        has_one = owner
    )]
    pub token_account: Account<'info, TokenAccount>,
    pub owner: Signer<'info>
}
```

要运行此示例，请将 `anchor-spl = "<version>"` 添加到 `Cargo.toml` 中的依赖项部分，位于 `programs/<your-project-name>/` 目录中。`<version>` 应等于您正在使用的 `anchor-lang` 版本。

在此示例中，如果调用者具有管理员权限，我们将设置帐户的`data`字段。我们通过检查他们是否拥有他们想要更改的帐户的管理员Token来判断调用者是否是管理员。我们通过约束来完成大部分工作，我们将在下一节中介绍。需要记住的重要一点是，我们使用 `TokenAccount` 类型（环绕Token程序的 `Account` 结构并添加所需的函数）来使锚点确保传入的帐户由Token程序拥有并让锚点对其进行反序列化。这意味着我们可以在约束（例如 `token_account.mint`）以及指令函数中使用 `TokenAccount` 属性。

### 约束`Constraints`

`Account`类型可以为您完成很多工作，但它们不够dynamic，无法处理安全程序所需的所有安全检查。

使用以下格式向帐户添加约束：

```rust
#[account(<constraints>)]
pub account: AccountType
```

一些约束支持自定义错误，

```rust
#[account(...,<constraint> @ MyError::MyErrorVariant, ...)]
pub account: AccountType
```

例如，在上面的例子中，我们使用 `mut` 约束来表明 `my_account` 应该是可变的。我们使用 `has_one` 来检查 `token_account.owner == Owner.key()`。最后，我们使用`constraint`来检查任意表达式；在本例中，传入的 `TokenAccount` 是否属于管理员铸币厂。

```rust
#[derive(Accounts)]
pub struct SetData<'info> {
    #[account(mut)]
    pub my_account: Account<'info, MyAccount>,
    #[account(
        constraint = my_account.mint == token_account.mint,
        has_one = owner
    )]
    pub token_account: Account<'info, TokenAccount>,
    pub owner: Signer<'info>
}
```

### 安全检查

两种 `Anchor` 帐户类型 `AccountInfo` 和 `UncheckedAccount` 不对传递的帐户实施任何检查。`Anchor` 实施安全检查，鼓励提供额外的文档来描述为什么不需要额外的检查。

尝试使用`anchor build`构建包含以下摘录的程序：

```rust
#[derive(Accounts)]
pub struct Initialize<'info> {
    pub potentially_dangerous: UncheckedAccount<'info>
}
```

将导致类似以下的错误：

```text
Error:
        /anchor/tests/unchecked/programs/unchecked/src/lib.rs:15:8
        Struct field "potentially_dangerous" is unsafe, but is not documented.
        Please add a `/// CHECK:` doc comment explaining why no checks through types are necessary.
        See https://book.anchor-lang.com/anchor_in_depth/the_accounts_struct.html#safety-checks for more information.
```
为了解决这个问题，请写一个文档注释来描述潜在的安全隐患，例如：

```rust
#[derive(Accounts)]
pub struct Initialize<'info> {
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub potentially_dangerous: UncheckedAccount<'info>
}
```

:::warning 注意
文档注释必须是一行或块文档注释（`///` 或 `/**`），Rust 才会将其解释为文档属性。双斜杠注释（`//`）不会被解释为文档属性。
:::

## 程序模块

程序模块是您定义业务逻辑的地方。您可以通过编写可由客户端或其他程序调用的函数来实现这一点。您已经看到了此类函数的一个示例，即上一节中的 `set_data` 函数。

```rust
#[program]
mod hello_anchor {
    use super::*;
    pub fn set_data(ctx: Context<SetData>, data: u64) -> Result<()> {
        if ctx.accounts.token_account.amount > 0 {
            ctx.accounts.my_account.data = data;
        }
        Ok(())
    }
}
```
### 上下文`Context`

每个端点函数都以 `Context` 类型作为其第一个参数。通过此上下文参数，它可以访问帐户 (`ctx.accounts`)、执行程序的程序 ID (`ctx.program_id`) 和剩余帐户 (`ctx.remaining_accounts`)。`remaining_accounts` 是一个向量，其中包含传递到指令中但未在 `Accounts` 结构中声明的所有帐户。当您希望函数处理可变数量的帐户时，这很有用，例如在初始化具有可变数量玩家的游戏时。

### 指令数据

如果您的函数需要指令数据，您可以通过在上下文参数后向函数添加参数来添加它。然后，`Anchor` 会自动将指令数据反序列化为参数。您可以拥有任意数量的参数。您甚至可以传入自己的类型，只要您对它们使用`#[derive(AnchorDeserialize)]` 或自己为它们实现 `AnchorDeserialize` 即可。以下是使用自定义类型作为指令数据参数的示例：

```rust
#[program]
mod hello_anchor {
    use super::*;
    pub fn set_data(ctx: Context<SetData>, data: Data) -> Result<()> {
        ctx.accounts.my_account.data = data.data;
        ctx.accounts.my_account.age = data.age;
        Ok(())
    }
}

#[account]
#[derive(Default)]
pub struct MyAccount {
    pub data: u64,
    pub age: u8
}

#[derive(AnchorSerialize, AnchorDeserialize, Eq, PartialEq, Clone, Copy, Debug)]
pub struct Data {
    pub data: u64,
    pub age: u8
}
```

方便的是，`#[account]` 为 `MyAccount` 实现了 `Anchor(De)Serialize`，因此上面的示例可以简化。

```rust
#[program]
mod hello_anchor {
    use super::*;
    pub fn set_data(ctx: Context<SetData>, data: MyAccount) -> Result<()> {
        ctx.accounts.my_account.set_inner(data);
        Ok(())
    }
}

#[account]
#[derive(Default)]
pub struct MyAccount {
    pub data: u64,
    pub age: u8
}
```

## 错误处理

`Anchor`程序中有两种类型的错误。`anchor`错误和`non-anchor`错误。`anchor`错误可以分为框架从其自身代码内部返回的`anchor`内部错误或用户（您！）可以返回的自定义错误。

- `anchor`错误
    - `anchor`内部错误
    - 自定义错误
- `non-anchor`错误

`anchor`错误提供了一系列信息，例如错误名称和编号、代码中抛出错误的位置或违反约束（例如 `mut` 约束）的帐户。一旦在程序内部抛出错误，您就可以在锚点客户端（如 `typescript`客户端）中访问错误信息。`typescript` 客户端还会使用其他信息丰富错误，包括抛出错误的程序以及导致抛出错误的程序的 `CPI` 调用（本书中对此进行了解释）。里程碑章节探讨了所有这些在实践中如何协同工作。现在，让我们看看如何从程序内部返回不同的错误。

### `anchor`内部错误

`Anchor` 有许多不同的内部错误代码。这些代码不供用户使用，但研究参考资料以了解代码与其原因之间的映射很有用。例如，当违反约束时会抛出这些代码，例如当帐户标记为 `mut` 但其 `is_writable` 属性为 `false` 时。

### 自定义错误

您可以使用 `error_code` 属性添加程序独有的错误。

只需将其添加到具有您选择的名称的枚举中即可。然后，您可以将枚举的变体用作程序中的错误。此外，您可以向各个变体添加消息属性。如果发生错误，客户端将显示此错误消息。自定义错误代码编号从自定义错误偏移量开始。

要实际抛出错误，请使用 `err!` 或 `error!` 宏。这些将文件和行信息添加到错误中，然后由`anchor`记录。

```rust
#[program]
mod hello_anchor {
    use super::*;
    pub fn set_data(ctx: Context<SetData>, data: MyAccount) -> Result<()> {
        if data.data >= 100 {
            return err!(MyError::DataTooLarge);
        }
        ctx.accounts.my_account.set_inner(data);
        Ok(())
    }
}

#[error_code]
pub enum MyError {
    #[msg("MyAccount may only hold data below 100")]
    DataTooLarge
}
```

#### `require!`

您可以使用 `require` 宏来简化编写错误。上面的代码可以简化为这样（请注意，`>=` 翻转为 `<`）：

```rust
#[program]
mod hello_anchor {
    use super::*;
    pub fn set_data(ctx: Context<SetData>, data: MyAccount) -> Result<()> {
        require!(data.data < 100, MyError::DataTooLarge);
        ctx.accounts.my_account.set_inner(data);
        Ok(())
    }
}

#[error_code]
pub enum MyError {
    #[msg("MyAccount may only hold data below 100")]
    DataTooLarge
}
```
有几个 `require` 宏可供选择（在文档中搜索 `require`）。比较公钥时，务必使用 `require` 语句的密钥变体，例如 `require_keys_eq` 而不是 `require_eq`，因为使用 `require_eq` 比较公钥非常昂贵。

>（最终，所有程序都会返回相同的错误：`ProgramError`。

此错误有一个用于自定义错误号的字段。这是 `Anchor` 放置其内部和自定义错误代码的地方。但是，这只是一个数字，一个数字也只是如此有用。因此，此外，在 `anchor`错误的情况下，`Anchor` 会记录返回的 `anchor`错误，`Anchor` 客户端会解析这些日志以提供尽可能多的信息。这并不总是可行的。例如，目前没有简单的方法可以在关闭预检检查的情况下获取已处理事务的日志。此外，非 `Anchor` 或旧 `Anchor` 程序可能不会记录 `anchor`错误。在这些情况下，`Anchor` 将回退到检查事务返回的错误号是否与 `IDL` 中定义的错误号或 `Anchor` 内部错误代码匹配。如果是这样，`Anchor` 至少会用错误消息丰富错误。此外，如果有可用的日志，`Anchor` 将始终尝试解析程序错误堆栈并返回该堆栈，以便您知道错误是从哪个程序返回的。

## 跨程序调用

程序之间相互交互通常很有用。在 Solana 中，这是通过跨程序调用 (CPI) 实现的。

考虑以下`puppet`和`puppet master`的例子。诚然，这不是很现实，但它可以让我们向您展示 `CPI` 的许多细微差别。中间部分的`milestone`项目涵盖了一个更现实的具有多个 `CPI` 的计划。

### 设置基本 `CPI` 功能

创建工作区，

```bash
anchor init puppet
```

并复制以下代码，

```rust
use anchor_lang::prelude::*;


declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");


#[program]
pub mod puppet {
    use super::*;
    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }

    pub fn set_data(ctx: Context<SetData>, data: u64) -> Result<()> {
        let puppet = &mut ctx.accounts.puppet;
        puppet.data = data;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 8)]
    pub puppet: Account<'info, Data>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetData<'info> {
    #[account(mut)]
    pub puppet: Account<'info, Data>,
}

#[account]
pub struct Data {
    pub data: u64,
}
```
这里没有什么特别的事情发生。这是一个非常简单的程序！有趣的部分是它如何与我们要创建的下一个程序交互。

仍然在项目内部，使用以下命令初始化一个新的 `puppet-master` 程序：

```bash
anchor new puppet-master
```

在工作区内复制以下代码，

```rust
use anchor_lang::prelude::*;
use puppet::cpi::accounts::SetData;
use puppet::program::Puppet;
use puppet::{self, Data};

declare_id!("HmbTLCmaGvZhKnn1Zfa1JVnp7vkMV4DYVxPLWBVoN65L");

#[program]
mod puppet_master {
    use super::*;
    pub fn pull_strings(ctx: Context<PullStrings>, data: u64) -> Result<()> {
        let cpi_program = ctx.accounts.puppet_program.to_account_info();
        let cpi_accounts = SetData {
            puppet: ctx.accounts.puppet.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        puppet::cpi::set_data(cpi_ctx, data)
    }
}

#[derive(Accounts)]
pub struct PullStrings<'info> {
    #[account(mut)]
    pub puppet: Account<'info, Data>,
    pub puppet_program: Program<'info, Puppet>,
}
```
还要在 `Anchor.toml` 的 `[programs.localnet]` 部分中添加行 `puppet_master = "HmbTLCmaGvZhKnn1Zfa1JVnp7vkMV4DYVxPLWBVoN65L"`。最后，通过将以下行添加到 `puppet-master` 程序文件夹内的 `Cargo.toml` 文件的 `[dependencies]` 部分，将 `puppet` 程序导入 `puppet-master` 程序：

```toml
puppet = { path = "../puppet", features = ["cpi"]}
```
使用 `features = ["cpi"]` 后，我们不仅可以使用 `puppet` 的类型，还可以使用其指令构建器和 `cpi` 函数。如果没有这些，我们将不得不使用低级 solana 系统调用。幸运的是，`anchor` 在这些之上提供了抽象。通过启用 `cpi` 功能，`puppet-master` 程序可以访问 `puppet::cpi` 模块。`Anchor`会自动生成此模块，其中包含为程序量身定制的指令构建器和 `cpi` 帮助程序。

对于 `puppet` 程序，puppet-master 使用 `puppet::cpi::accounts` 模块提供的 `SetData` 指令构建器结构来提交 `puppet` 程序的 `SetData` 指令所需的帐户。然后，`puppet-master` 创建一个新的 `cpi` 上下文并将其传递给 `puppet::cpi::set_data cpi` 函数。此函数与 `puppet` 程序中的 `set_data` 函数具有完全相同的功能，不同之处在于它需要 `CpiContext` 而不是 `Context`。

设置 `CPI` 可能会分散程序的业务逻辑，因此建议将 `CPI` 设置移至指令的 `impl` 块中。然后，`puppet-master` 程序如下所示：

```rust
use anchor_lang::prelude::*;
use puppet::cpi::accounts::SetData;
use puppet::program::Puppet;
use puppet::{self, Data};

declare_id!("HmbTLCmaGvZhKnn1Zfa1JVnp7vkMV4DYVxPLWBVoN65L");

#[program]
mod puppet_master {
    use super::*;
    pub fn pull_strings(ctx: Context<PullStrings>, data: u64) -> Result<()> {
        puppet::cpi::set_data(ctx.accounts.set_data_ctx(), data)
    }
}

#[derive(Accounts)]
pub struct PullStrings<'info> {
    #[account(mut)]
    pub puppet: Account<'info, Data>,
    pub puppet_program: Program<'info, Puppet>,
}

impl<'info> PullStrings<'info> {
    pub fn set_data_ctx(&self) -> CpiContext<'_, '_, '_, 'info, SetData<'info>> {
        let cpi_program = self.puppet_program.to_account_info();
        let cpi_accounts = SetData {
            puppet: self.puppet.to_account_info()
        };
        CpiContext::new(cpi_program, cpi_accounts)
    }
}
```
我们可以通过将 `puppet.ts` 文件的内容替换为以下内容来验证一切是否按预期工作：

```ts
import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair } from '@solana/web3.js'
import { expect } from 'chai'
import { Puppet } from '../target/types/puppet'
import { PuppetMaster } from '../target/types/puppet_master'

describe('puppet', () => {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const puppetProgram = anchor.workspace.Puppet as Program<Puppet>
  const puppetMasterProgram = anchor.workspace
    .PuppetMaster as Program<PuppetMaster>

  const puppetKeypair = Keypair.generate()

  it('Does CPI!', async () => {
    await puppetProgram.methods
      .initialize()
      .accounts({
        puppet: puppetKeypair.publicKey,
        user: provider.wallet.publicKey,
      })
      .signers([puppetKeypair])
      .rpc()

    await puppetMasterProgram.methods
      .pullStrings(new anchor.BN(42))
      .accounts({
        puppetProgram: puppetProgram.programId,
        puppet: puppetKeypair.publicKey,
      })
      .rpc()

    expect(
      (
        await puppetProgram.account.data.fetch(puppetKeypair.publicKey)
      ).data.toNumber()
    ).to.equal(42)
  })
})
```

然后运行`anchor test`。

### 特权扩展

`CPI` 将调用者的权限扩展到被调用者。`Puppet` 帐户作为可变帐户传递给 `Puppet-master`，但它在 `Puppet` 程序中仍然是可变的（否则测试中的期望会失败）。签名也是如此。

如果您想亲自证明这一点，请在 `Puppet` 程序中的数据结构中添加一个权限字段。

```rust
#[account]
pub struct Data {
    pub data: u64,
    pub authority: Pubkey
}
```

并调整`initialize`函数，

```rust
pub fn initialize(ctx: Context<Initialize>, authority: Pubkey) -> Result<()> {
    ctx.accounts.puppet.authority = authority;
    Ok(())
}
```

将`data`结构体中 `Pubkey` 字段的 `puppet` 字段的空间约束添加 `32`。

```rust
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 8 + 32)]
    pub puppet: Account<'info, Data>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
```

调整 `SetData` 验证结构体，

```rust
#[derive(Accounts)]
pub struct SetData<'info> {
    #[account(mut, has_one = authority)]
    pub puppet: Account<'info, Data>,
    pub authority: Signer<'info>
}
```

`has_one` 约束检查了 `puppet.authority = authority.key()`。

`puppet-master`程序现在也需要作出调整：

```rust
use anchor_lang::prelude::*;
use puppet::cpi::accounts::SetData;
use puppet::program::Puppet;
use puppet::{self, Data};

declare_id!("HmbTLCmaGvZhKnn1Zfa1JVnp7vkMV4DYVxPLWBVoN65L");

#[program]
mod puppet_master {
    use super::*;
    pub fn pull_strings(ctx: Context<PullStrings>, data: u64) -> Result<()> {
        puppet::cpi::set_data(ctx.accounts.set_data_ctx(), data)
    }
}

#[derive(Accounts)]
pub struct PullStrings<'info> {
    #[account(mut)]
    pub puppet: Account<'info, Data>,
    pub puppet_program: Program<'info, Puppet>,
    // Even though the puppet program already checks that authority is a signer
    // using the Signer type here is still required because the anchor ts client
    // can not infer signers from programs called via CPIs
    pub authority: Signer<'info>
}

impl<'info> PullStrings<'info> {
    pub fn set_data_ctx(&self) -> CpiContext<'_, '_, '_, 'info, SetData<'info>> {
        let cpi_program = self.puppet_program.to_account_info();
        let cpi_accounts = SetData {
            puppet: self.puppet.to_account_info(),
            authority: self.authority.to_account_info()
        };
        CpiContext::new(cpi_program, cpi_accounts)
    }
}
```

最后，修改一下测试，

```ts
import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair } from '@solana/web3.js'
import { Puppet } from '../target/types/puppet'
import { PuppetMaster } from '../target/types/puppet_master'
import { expect } from 'chai'

describe('puppet', () => {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const puppetProgram = anchor.workspace.Puppet as Program<Puppet>
  const puppetMasterProgram = anchor.workspace
    .PuppetMaster as Program<PuppetMaster>

  const puppetKeypair = Keypair.generate()
  const authorityKeypair = Keypair.generate()

  it('Does CPI!', async () => {
    await puppetProgram.methods
      .initialize(authorityKeypair.publicKey)
      .accounts({
        puppet: puppetKeypair.publicKey,
        user: provider.wallet.publicKey,
      })
      .signers([puppetKeypair])
      .rpc()

    await puppetMasterProgram.methods
      .pullStrings(new anchor.BN(42))
      .accounts({
        puppetProgram: puppetProgram.programId,
        puppet: puppetKeypair.publicKey,
        authority: authorityKeypair.publicKey,
      })
      .signers([authorityKeypair])
      .rpc()

    expect(
      (
        await puppetProgram.account.data.fetch(puppetKeypair.publicKey)
      ).data.toNumber()
    ).to.equal(42)
  })
})
```

测试通过是因为授权机构给予`puppet-master`的签名随后扩展到`puppet`程序，`puppet`程序使用该签名来检查`puppet`账户的授权机构是否已签署交易。

> 权限扩展很方便，但也很危险。如果无意中对恶意程序进行了 `CPI`，则该程序具有与调用者相同的权限。 `Anchor` 通过两种措施保护您免受恶意程序的 `CPI` 攻击。首先， `Program<'info, T>` 类型检查给定的账户是否是预期的程序 `T`。如果您忘记使用 `Program` 类型，自动生成的 `cpi` 函数（在前面的示例中为 `puppet::cpi::set_data`）还会检查 `cpi_program` 参数是否等于预期的程序。

### 重载账户

在 `puppet` 程序中，`Account<'info, T>` 类型用于 `puppet` 帐户。如果 `CPI` 编辑该类型的帐户，则调用者的帐户在指令期间不会发生变化。

您可以通过在 `puppet::cpi::set_data(ctx.accounts.set_data_ctx(), data) cpi` 调用后立即添加以下内容来轻松看到这一点。

```rust
puppet::cpi::set_data(ctx.accounts.set_data_ctx(), data)?;
if ctx.accounts.puppet.data != 42 {
    panic!();
}
Ok(())
```

:::warning 关键要点
您的测试将失败。但为什么呢？毕竟测试曾经通过，所以 `cpi` 肯定将`data`字段更改为 `42`。
:::

调用者中的`data`字段未更新为 `42` 的原因是，在指令的开头，`Account<'info, T>` 类型将传入的字节反序列化为新的结构。此结构不再与帐户中的底层数据相关联。`CPI` 更改了底层帐户中的数据，但由于调用者中的结构与底层帐户没有任何联系，因此调用者中的结构保持不变。

如果您需要读取刚刚被 `CPI` 更改的帐户的值，则可以调用其重新加载方法，该方法将重新反序列化帐户。如果您在 `cpi` 调用之后立即输入 `ctx.accounts.puppet.reload()?;`，测试将再次通过。

```rust
puppet::cpi::set_data(ctx.accounts.set_data_ctx(), data)?;
ctx.accounts.puppet.reload()?;
if ctx.accounts.puppet.data != 42 {
    panic!();
}
Ok(())
```

### 从`handler`函数返回值

`Anchor` 的`handler`程序函数能够使用 Solana `set_return_data` 和 `get_return_data` 系统调用返回数据。此数据可用于 `CPI` 调用者和客户端。

不要返回 `Result<()>`，请考虑上面的 `set_data` 函数的这个版本，该版本已被修改为返回 `Result<u64>`：

```rust
pub fn set_data(ctx: Context<SetData>, data: u64) -> Result<u64> {
    let puppet = &mut ctx.accounts.puppet;
    puppet.data = data;
    Ok(data)
}
```

定义非`unit`类型的返回类型 `()` 将导致 `Anchor` 在调用此函数时透明地使用给定类型（本例中为 `u64`）调用 `set_return_data`。`CPI` 调用的返回被包装在一个结构中，以允许延迟检索此返回数据。例如

```rust
pub fn pull_strings(ctx: Context<PullStrings>, data: u64) -> Result<()> {
    let cpi_program = ctx.accounts.puppet_program.to_account_info();
    let cpi_accounts = SetData {
        puppet: ctx.accounts.puppet.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    let result = puppet::cpi::set_data(cpi_ctx, data)?;
    // The below statement calls sol_get_return and deserializes the result.
    // `return_data` contains the return from `set_data`,
    // which in this example is just `data`.
    let return_data = result.get();
    // ... do something with the `return_data` ...
}
```

:::warning 关键要点
返回的类型必须实现 `AnchorSerialize` 和 `AnchorDeserialize` 特征，例如：
```rust
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct StructReturn {
    pub value: u64,
}
```
:::

#### 在客户端中读取返回数据

甚至可以使用没有 `CPI` 的返回值。如果您使用函数来计算前端所需的值而无需重写前端的代码，这可能会很有用。

无论您是否使用 `CPI`，您都可以使用`view`函数读取最后设置为交易中返回数据的任何内容（`view`模拟交易并读取`Program return`日志）。

例如:

```rust
const returnData = await program.methods
  .calculate(someVariable)
  .accounts({
    acc: somePubkey,
    anotherAcc: someOtherPubkey,
  })
  .view()
```

#### 返回`Data`大小限制解决方法

`set_return_data` 和 `get_return_data` 系统调用限制为 `1024` 字节，因此值得简要解释一下 `CPI` 返回值的旧解决方法。

通过将 `CPI` 与 `reload` 结合使用，可以模拟返回值。可以想象，`puppet` 程序不只是将数据字段设置为 `42`，而是使用 `42` 进行一些计算并将结果保存在数据中。然后，`puppet-master` 可以在 `cpi` 之后调用 `reload` 并使用 `puppet` 程序计算的结果。

## 程序派生地址PDA


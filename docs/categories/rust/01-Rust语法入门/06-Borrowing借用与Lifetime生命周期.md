---
title: Borrowing借用 && Lifetime生命周期
author: 皮特ᴾᵗ
date: 2024/05/08 21:33
categories:
 - Rust语法入门
tags:
 - Rust
 - Rust基础
 - 借用
 - 生命周期
---

# Borrowing借用 && Lifetime生命周期

## Borrowing && Borrow Checker && Lifetime

### Borrowing

引用（Reference）：

1. 引用是一种变量的别名，通过`&`符号来创建。（非所有权）
2. 引用可以是不可变的（`&T`）或可变的（`&mut T`）
3. 引用允许在不传递所有权的情况下访问数据，它们是安全且低开销的。

借用（Borrowing）：

1. 借用是通过引用（Reference）来借用（Borrow）数据，从而在一段时间内访问数据而不拥有它。
2. 借用分为可变借用和不可变借用。可变借用（`&mut`）允许修改数据，但在生命周期内只能有一个可变借用。不可变借用（`&`）允许多个同时存在，但不允许修改数据。
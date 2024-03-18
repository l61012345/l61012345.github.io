---
title: 同源交叉的模式定理
date: 2024/03/18
category_bar: true
categories: 
- 论文
- 进化计算
---

# 同源交叉的模式定理
> Riccardo Poli et al,. Exact Schema Thoery and Markov Chain Models for Genetic Programming and Variable-length Genetic Algorithms with Homologous Crossover, Genetic Programming and Evolvable Machines, 2004.  

在这篇论文当中，Poli等人对GP构建了两种不同的Schema Thoery 模型： Exact Schema Theory和Markov模型，这两种模型分别从不同的视角描述了一个Schema在进化过程中的动态演进过程。但是这两个模型的实质上是对同一个GP的进化过程进行的不同视角的描述。  

## 定义
进化计算的动态性研究中，不同的学者对于基本术语的理解和定义不太相同。在正式介绍这两种不同的概率模型之前，现在对这些术语在本文中的意义进行规范。  

### 模式
模式(schema)是一组具有共同语法特征的个体。(a set of points of the search sapace sharing some syntactic feature)。对于任何一个模式$H$，Holland的模式定理可以简化为这个模式的在下一代中期望的个体数目是这一代的种群大小$M$与一个和$H$、$t$相关的系数的乘积之和：  
$$E[m(H,t+1)]=Mα(H,t) \tag{1}$$
$α(H,t)$称为schema $H$的转换概率，表示第$t$代个体$H$经过选择和繁殖后留存到下一代的概率。  


## Schema的视角 - Exact Schema Thoery


### Exact Schema Thoery的完整推导
$$α(H,t) = (1-p_c)p(H,t)+p_cα_c(H,t)$$
$$α_c(H,t)=∑_{k,l}\frac{1}{C(G_k,G_l)}×∑_{i∈C(G_k,G_l)}p(U(H,i)∪G_k,t)p(L(H,i)∪G_l,t)$$

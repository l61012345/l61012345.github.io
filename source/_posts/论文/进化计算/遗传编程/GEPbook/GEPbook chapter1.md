---
title: 01. 简介：生物遗传学背景
date: 2025/4/23
category_bar: true
categories: 
- 论文
- 进化计算
- 遗传编程
- 基因表达式编程：通过人工智能的数学建模
---
# 01. 简介：生物遗传学背景
{% note info %}  
这是对《Gene Expression Programming: Mathematical Modeling by an Artificial Intelligence》的笔记，本页对应第一章： Chapter 1： Introduction: The Biological Perspective.   
  
本书可以在斯普林格购买纸质版或者电子版：https://link.springer.com/book/10.1007/3-540-32849-1
{% endnote %}  

本章试图描述两个部分的内容：  
1. 区分基因表达式编程和其他两个进化算法：遗传算法和遗传编程的不同。  
2. 介绍有关遗传学的生物背景  

## GEP和GA、GP的不同  
### 个体表示
对于遗传算法(GA)而言，其个体表示为定长的符号串。对于GA而言，其在基因层面上的操纵，即Genetic Operator的实现非常方便，但因此每个个体所承载的功能非常简单。  
GP则是非线性的表示实体（一般为语法树），拥有不同的大小和形状。因此相比于GA，GP的个体可以更方便的使用高密度信息量的表示方法来承载复杂的功能，相对地，GP的Genetic Operator的设计要考虑的问题非常多。  
在《自私的基因》一书中，查尔斯·道金斯认为生命的大爆炸（即以自然进化的方式实现涌现）需要突破两层阈值：  
- Replicator Threshold  
  简单来说即进化单元Replicator可以通过复制保留到下一代的方式来保存和传播它们的优秀的遗传信息(virtue of their own properties)。  
- Phenotype Threshold  
  表现型是实体面对环境作用时候的表现。潜在台词是个体携带的遗传信息与其面对环境时候的表现**是不对称的**：有可能实体面对环境的时候并不会表现出某些遗传信息；也有可能实体对环境的表现超过了遗传信息的描述。  

GA和GP存在优秀遗传物质通过复制到下一代实现传播和扩散的过程（参见各自的Building Block Hypothesis和Schema Theory），因此通过了Replicator Threshold。但是，GA和GP都同时工作在基因型和表现型上，因此都没有通过Phenotype Threshold。  
GP中的Developmental GP是一种为了让GP通过Phenotype Threshold的尝试：其中每五个比特会编码为一个符号，但是这种编码方式会产生相当多的非法表达式，由于非法表达式所占据的资源太多，DGP的性能提升并不强。  
  
对于GEP而言，GEP是将非线性的表示实体通过编码转换为简单的定长线性符号串。
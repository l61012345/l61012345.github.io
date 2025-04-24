---
title: 03. 基因表达式算法
date: 2025/4/24
category_bar: true
categories: 
- 论文
- 进化计算
- 遗传编程
- 基因表达式编程：通过人工智能的数学建模
---
# 03. 基因表达式算法
{% note info %}  
这是对《Gene Expression Programming: Mathematical Modeling by an Artificial Intelligence》的笔记，本页对应第一章： Chapter 3： The Basic Gene Expression Algorithm
  
本书可以在斯普林格购买纸质版或者电子版：https://link.springer.com/book/10.1007/3-540-32849-1
{% endnote %}  

基本的基因表达式算法(Gene Expression Algorithm)的运行流程包括：  
1. 随机生成初始化种群
2. 初次评估
3. 个体选择
4. 个体繁殖与变异
本书认为，进化计算的关键是要有足够多的不同种类的解来让进化选择，因此多样性是进化的重要指示。遗传操作是产生种群多样性的手段，因此本章的重点在于各种各样的遗传操作。  

## 种群
在GEP中，初始化的要求是随机初始化序列。另外，对于单基因的GEA，所有创建的个体在0位置上必须是一个function（因为如果是结点的话该个体则是一个单节点个体，这样的个体的fitness过低也没有任何结构上可以修改的空间），这个要求在多基因GEA中并不是必要的。如果种群过小，或者是fitness cases小而分布几种，那么有可能初始种群中所有个体的fitness都是0（尤其是对逻辑符号回归问题），这种情况下需要重启初始化，直到初始种群中出现一个fitness不为0的个体。  
和GP不同的是，此处并未要求或者是设计初始化个体的拓扑结构需要是什么样子的，GP中的generation-method有可能在无意之间限制了结构的多样性。  
GEP中的超参数包括：  
- Primitive Set
- 基因的长度
- chromosome的数量
- chromosome之间的关系
- fitness function
  
GP中个体的初始化需要考虑结构的合法性，尤其是比如STGP。但是GEP并不需要考虑这些，因为tails的设计可以保证树的结构永远是合法的。产生的线性chromosome只会在评估过程中展开为树，进行fitness的衡量。然后选择过程根据个体的fitness对个体进行选择，选择需要保持固定的种群大小，如此来维护选择压力。  

### 精英
选择的偏向性采样会让好的个体和不好的个体在下一代中的采样率不一致，但是都是概率性发生的，即使是表现最好的个体也有可能不会进入下一代。因此，复制前一代中最好的一个个体到下一代中有助于保持种群的可进化性，并且保护了原有的最好的个体不受Genetic Operation的影响。  

## Fitness function
最终解的质量和选择环境有关，选择环境的设计要求需要有一组fitness cases用于表示问题。Fitness cases的分布应当是均匀且有代表性的，如此模型才具备完整的解决问题的能力。  
相反的是，由不均匀的fitness cases创造出来的部分解模型如果在种群中持续的存在，其在种群中具有相对较高的fitness，在种群中呈现主导地位。这些部分解可以将较好但是fitness较低的改进击败，从而让进化陷入局部最优。  
一种解决这个问题的方法是改变fitness function，这就是为什么可以使用不止一个拟合函数，以便在一个问题上尝试几个拟合函数的原因。（但是在随后的例子中都是使用的一个fitness function）。  
下面给出了几种常见的fitness function，哪一种fitness function更适合描述问题取决于问题本身的特性，但是MSE和$R^2$是一种通用设置。  

| Fitness Function | 解释 | 数学描述 | 备注|
|:-|:-|:-|:-|
|Number of hits| 在合理误差范围内模型符合fitness cases的数量|$\text{If } E_{ij}≤p,$<br>$\text{then } f_{ij}=1,\text{else }f_{ij}=0$ <br> $E_{ij}=\|P_{ij}-T_j\|$||
|Number of hits<br>(penalty)|如果个体在fitness上并非真阳性和真阴性，则fitness为0|$\text{IF }(TP_i=0 \text{ OR } TN_i=0),$<br>$\text{then } f_{i}=0,\text{else }f_{i}=h$<br>$h=TP_i+TN_i$|如此可以减少过拟合|
|Precision and Selection| 给个体设置一个在fitness cases上的表现上限$R$，<br>超过$R$的表现对fitness没有贡献| $f_i=∑_j(R-f_{raw,i})$||
|均方差||$E_i=\frac{1}{n}∑_j(P_{ij}-T_j)^2$ <br> $E_i=\frac{1}{n}∑_j(\frac{P_{ij}-T_j}{T_j})^2$|这种方法对离群值敏感|
|$R^2$||$R_i=$<br>$\frac{n\sum_j(T_jP_{ij})-(\sum_jT_j)(\sum_jP_{ij})}{\sqrt{[n∑_jT_j^2-(∑_jT_j)^2][n∑_jP_{ij}^2-(∑_jP_{ij})^2]}}$|
| Positive/Negative Predictive Value | | $PPV_i=\frac{TN_i}{TN_i+FP_i}$<br>$NPV_i=\frac{TN_i}{TN_i+FN_i}$| 在数据集正负样本严重不平衡时可以有很大用 |

## 选择
GEP中默认设置是使用的轮盘赌，但是不管使用哪一种选择方法，核心思路是表现越好的个体越有可能被选中。在选择中，好的个体和差的个体都是概率性选择，差的个体上的优良基因也可能被传递。通过好的个体的复制实现对这一代最优性状的保护。  
在应用精英机制的前提下，几种选择方法的表现并没有明显的差异，只要保证选择方法中个体按照其fitness成倍扩散就行了。  

## 繁殖与变异
在介绍之前，首先需要明晰GEP的变异和自然界的变异之间的不同。  
首先自然界的变异概率比GEP中的变异概率要低得多，GEP设置相比于自然界更高的变异概率是因为GEP进化的时间和速度要比自然进化更快。其次，自然界不太可能知道变异在何时何地发生。GEP中所有的修改都是可知的：一方面他们都发生在基因组复制之后，而基因组的复制本身不会像自然界一样出错；另一方面，operator以有序的方式执行，首先是复制，然后是剩下的opeartor，除了复制之外，其他的operator的运行顺序对最终结果影响不大。  
另外，除了突变之外的其他operator一次只允许对同一个个体做一次修改，每个个体在同一代中可能会经历来自不同operator的修改。  

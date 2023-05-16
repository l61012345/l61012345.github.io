---
title: 多目标遗传算法：NSGA和NSGA-II
date: 2023/5/16
category_bar: true
categories: 
- 论文
- 遗传算法
---

# 多目标遗传算法：NSGA和NSGA-II

> N. Srinivas and K. Deb, "Muiltiobjective Optimization Using Nondominated Sorting in Genetic Algorithms," in Evolutionary Computation, vol. 2, no. 3, pp. 221-248, Sept. 1994, doi: 10.1162/evco.1994.2.3.221.  
> K. Deb, A. Pratap, S. Agarwal and T. Meyarivan, "A fast and elitist multiobjective genetic algorithm: NSGA-II," in IEEE Transactions on Evolutionary Computation, vol. 6, no. 2, pp. 182-197, April 2002, doi: 10.1109/4235.996017.  

## 多目标优化理论概述
在数学上，多目标优化问题可以被公式化为如下表述：  
如果多目标问题的每一种解都可以使用$n$维空间$X$中的一个的向量进行表示：$\boldsymbol{x}=\{x_1,x_2,...,x_n\}$，那么多目标优化就是找到一个解$\boldsymbol{x^*}$使得$K$个目标函数(objective function)$z_i(\boldsymbol{x})$具有最小值:  
$$z(x^*)=\{z_1(\boldsymbol{x^*}),z_2(\boldsymbol{x^*}),...,z_n(\boldsymbol{x^*})\}$$

同时，搜索空间$X$受到一系列的约束条件(constrain)$g$的限制：$g_j(\boldsymbol{x^*})=b_j$，$j=1,...,m$.   

实际情况是，许多约束的满足条件彼此之间会冲突，因此**实际上想要找到一个多目标解使得所有目标函数同时达到最优解几乎是不可能的**。因此，事实上多目标优化是寻找一组最优化的近似解，这个解在每一个目标函数中的结果都在可以接受的范围内，而且没有其他的解可以比这个解至少在一个目标函数中更好。  
详细的帕累托优化理论和定义请参考：[多目标遗传算法综述](https://l61012345.top/2023/04/24/%E8%AE%BA%E6%96%87/%E9%81%97%E4%BC%A0%E7%AE%97%E6%B3%95/%E5%A4%9A%E7%9B%AE%E6%A0%87%E9%81%97%E4%BC%A0%E7%AE%97%E6%B3%95%E7%BB%BC%E8%BF%B0/).  

## 传统方法
### 标量化
最常见的多目标优化的难点是目标之间的冲突：无法同时找到所有目标的最优。因此在数学上的帕累托最优是提供具有最小冲突的解决方案。在搜索空间中，这些解决方案表现为空间中的点，这些点从单个目标上看是最优的。但是这样的方法无法满足决策者调整不同目标满足最优的优先程度。因此，传统的一种解决多目标最优化的方法是将向量通过使用加权平均转化为单目标优化，这个过程中个体向量被标量化(scalarize)。通过权重向量来反映和调整每个目标的优先级。  

#### 目标函数加权
所有的目标函数使用一个使用一个权重向量$\boldsymbol{w}$进行线性组合：  
$$Z=∑_{i=1}^Nw_if_i(\boldsymbol{x})$$
如此，对于目标函数的优先程度反映在权重向量$\boldsymbol{w}∈(0,1)$中。通常，个体在每个目标上的值先被计算出来，然后根据决策者设置的优先级使用如上的公式将多目标优化问题转化为单目标优化问题。  
这种算法非常简单，易于实现，而且可以根据优先级控制目标函数。但是存在两个问题：第一，最优化的结果极大地依赖于权重向量。其二，决策者可能还想知道其他的备选方案。  

#### 距离函数
这种方法使用需求层级向量(demand-level vector)$\overline{\boldsymbol{y}}$来对多目标优化问题进行标量化：  
$$Z=\left[\sum_{i=1}^N|f_i(\boldsymbol{x})-\overline{y}_i|^r\right]^{1/r},1≤r<∞$$
其中需求层级向量$\overline{\boldsymbol{y}}$的值是由决策者预先设置好的。通常使用欧氏距离$r=2$。  
这种方法的优化结果极大地依赖于对需求层级向量的设置。错误的需求层级向量的设置会导致错误的帕累托优化结果，对需求层级向量需要决策者有足够的先验知识。  
这种方法其实与目标函数加权非常类似，只是在这种方法中提供的权重表示对目标的满足程度，而前者的权重强调目标函数的重视程度。  

### 最小-最大博弈
另一种解决目标冲突的方法是使用最小-最大博弈(Min-Max)：在最大化每个目标函数的前提下最小化目标函数之间的冲突：  
$$min[𝑭(\boldsymbol{x})]=max[Z_j(\boldsymbol{x})],j=1,2,...,N$$
其中：  
$$Z_j(\boldsymbol{x})=\frac{f_j-\overline{f}_j}{\overline{f}_j}$$
$\overline{f}_j$是在目标函数$j$上的平均适应度。  
对于相同优先级的目标函数，这种方法可以得出相对折中的最优方案；同时可以通过引入标量权重来设置目标函数的优先级。  
  
    
  
  
如上传统方法的缺点在于，虽然这些方法可以保证帕累托优化，但是每次只能找到一个点而不能够一次性找到多个帕累托最优解。。在充满噪声和离散变量的空间中，这些方法工作效率低下。同时其中的一些方法对于先验知识的要求很高，并且对权重和需求的设置十分敏感。  

### VEGA

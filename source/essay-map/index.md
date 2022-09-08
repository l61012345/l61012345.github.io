---
title: essay_map
banner_img: /img/essaymap.jpg
date: 2022-07-15 10:08:03
---
{%markmap%}
# 遗传算法
## GA
### GA的理论
- 【GA的综述】  
   GA tutorial：A genetic algorithm tutorial, Darrel Whitley, 1994
- 【GA的综述，中文版，不太全面但是更好理解，角度与GA tutorial不同】  
   遗传算法原理及应用，周明等，1999，国防工业出版社
### GA的应用
- 【GA在游戏中的应用,简单介绍】  
   遗传算法在游戏开发中的应用, 杨科选等，2009
- GA在MIMO和阵列天线设计中的应用
  【总结：GA不太适用于阵列天线设计，因为基因之间相关性过高】  
  - 【提出了用GA优化阵列天线参数的可能性】
    Genetic Algorithm Optimization and its Application to Antenna Design，J, Johnson et al,1994 
  - 【将阵列天线元素中的Excitation Coefficients固定，使用GA进行整体优化】
    Determining the Excitation Coefficients of an Array using Genetic Algorithms，M, Shimizu，1994
  - 【使用了点分十进制GA对线天线进行设计，未考虑天线元素之间的干扰，非常理论化】  
    Wire-antenna designs using genetic algorithms，E.E.Altshuler,1997
  - 【使用了点分十进制GA对阵列天线进行设计，未考虑天线元素之间的干扰，非常理论化】
    遗传算法在阵列天线赋形波束综合中的应用，刘昊等，2002
  - 【使用了点分十进制GA对阵列天线进行设计，并与二进制GA做了对比】
    Genetic Algorithm using Real Parameters for Array Antenna Design Optimisation，Yee.H.L et al,1999  
  - 【使用点分十进制GA对MIMO混合波束赋形的模拟BF部分的相位系数进行了设计】
    Multiuser hybrid phase-only analog/digital BF with genetic algorithm，C. Hong et al,2014  
  - 【使用点分十进制GA对MIMO混合波束赋形的模拟和数字部分的相位系数进行了设计，效果不好】
    Discrete Phase-Only Hybrid BF Method in MIMO System Based on Genetic Algorithm,Zixun, Z et al,2017
  - 【使用了MoM/GA混合算法进行阵列天线设计，二进制GA用于优化等距的阵列元素之间的距离，可行】
    Optimum Design of Linear Antenna Arrays Using a Hybrid MoM/GA Algorithm，A. H. Hussein et al，2011
  - 【使用了GA/l1混合算法对阵列天线设计，二进制GA用于优化等距的阵列元素之间的距离，可行】
    Pencil and Shaped Beam Patterns Synthesis Using a Hybrid GA/l1 Optimization and Its Application to Improve Spectral Efficiency of Massive MIMO System，Samar. F. Hussein et al, A. (2021
## GP
- 【GP的综述】  
   GPbook：Chapter 5: GENETIC PROGRAMMING，John R. Koza

## GEP
- 【GEP和事件建模器在生产上的应用，只是概要性地介绍了应用】  
   Zero Defect Manufacturing of Microsemiconductors – An Application of Machine Learning and Artificial Intelligence，Zhengwen Huang et al,2018

# 事件建模
- 【介绍了数学建模的基本方法和常识】  
  数学建模方法与分析(原书第4版)，Mark M. Meerschaert，2021，机械工业出版社。  
- ROC聚类算法  
  - 【开山之作，介绍了ROC算法的工作流程】  
     Machine-Component Group Formation in Group Technology, John R King, 1979.  
  - 【将ROC算法与结合能算法和single-link算法做了对比，并举了一个工业应用的例子】  
     Machine-component grouping in producation flow analysis: an approach using a rank order clustering algorithm, John R King, 1980.  
  - 【一种改进后的ROC算法，指出了ROC算法的不足，并且在聚类前根据生产数据为每个单元赋予了权重】  
     Modified Rank Order Clustering Algorithm Approach by Including Manufacturing Data, Nagdev Amruthnath et al. 2016  
  - 【一种基于ROC的实时事件建模器】  
     EventiC: A Real-Time Unbiased Event-Based Learning Technique for Complex Systems，Morad Danishvar et al，2020
- 【一种基于WALC的聚类方法】  
  Effective clustering method for group technology:A shourt communication，T.Ghosh et al, 2011
- 【适用于基因和样本的聚类方法综述，依据将基因还是样本视为特征划分为三类方法的理论、优缺点，以及介绍了验证方法】  
  Cluster Analysis for Gene Expression Data: A Survey, Daxin Jiang et al, 2004.
- 【适用于生物系统建模的灵敏度计算方法综述，介绍了灵敏度类型和计算方法、以及在不同场景下如何选择灵敏度、以及相关软件的介绍，十分推荐】  
   Sentitivity analysis approaches applied to systems biology models, Zhike Zi, 2011

# 神经网络
## 生成对抗网络/GAN
- 【开山之作，介绍了GAN原理，包括训练和识别过程，以及数学原理】  
  Generative Adversarial Nets, Ian J Goodfellow et al, 2014.  
- 【条件生成对抗网络，将GAN改进为监督学习，通过加入条件(标签)可以指定生成器生成特定的样本】  
  Condtional Generative Adversarial Nets, Mehdi Mirza et al, 2014.  

{% endmarkmap %}

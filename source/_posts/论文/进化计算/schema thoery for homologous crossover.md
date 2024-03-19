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

### 树的坐标表示
为了更好的公式化一颗树中节点的位置，定义树存在于一个以根节点的位置作为原点的坐标系当中，这个坐标系的表示如下图所示：  
<img src=https://cdn.jsdelivr.net/gh/l61012345/Pic/img/20240319150651.png width=30%>   

### 模式
模式(schema)是一组具有共同语法特征的个体。(a set of points of the search sapace sharing some syntactic feature)。模式带有don't care符号$=$，$=$可以是任何的端点或者函数。模式是对一群个体的拓扑结构的归纳，一组模式中的所有个体的结构在不是“=”的节点上是相同的。

对于任何一个模式$H$，Holland的模式定理可以简化为这个模式的在下一代中期望的个体数目是这一代的种群大小$M$与一个和$H$、$t$相关的系数的乘积之和：  
$$E[m(H,t+1)]=Mα(H,t) \tag{0-1}$$
$α(H,t)$称为schema $H$的转换概率，表示第$t$代个体$H$经过选择和繁殖后留存到下一代的概率。    

如果考虑交叉过程，这个转换概率应当分为发生交叉和不发生交叉两部分：  
$$α(H,t) = (1-p_c)p(H,t)+p_cα_c(H,t) \tag{0-2}$$
其中$α_c(H,t)$为发生交叉的转换概率。  



#### 最大相似区域
最大相似区域(common parts/common regions)是指两个亲本从根节点开始的最大的拓扑结构重叠区域。

{% note info %}
<p id="理论1"> 理论1：</p>  

**如果交叉发生在最大相似区域中，整个schema的多样性将不会发生任何变化**。  
下图展示了最大相似区域的定义以及这个理论在单点交叉上成立的图示：   
  
<img src=https://cdn.jsdelivr.net/gh/l61012345/Pic/img/20240319115753.png width=60%>   

因此，**要想保证schema不会受到破坏，两个亲本的交叉应当发生在它们的最大相似区域中**。  
{% endnote %}

##### 最大相似区域的数学定义
首先定义函数$A(d,i,h)$用于返回树$h$在坐标$(d,i)$处的节点需要的参数个数(arity)，如果$h$在$(d,i)$处没有节点，则返回-1.  
现在定义一个函数common region membership function $𝒞(d,i,h_1,h_2)$用于检查坐标$(d,i)$是否属于$h_1,h_2$的common region，满足如下条件则该节点属于$h_1,h_2$的common region：   

1. 该节点是一个根节点
2. $h_1$和$h_2$上该节点对应的父节点的区域属于common region
   该节点在$h_1$和$h_2$的父节点的参数数量相同（子树的分支数量相同）

$$𝒞(d,i,h_1,h_2)=\begin{cases}
    true, \text{  if}(d,i)=\text{root} &\\
    true, \text{  if} [A(parent(d,i),h_1)=A(parent(d,i),h_2)≠0] AND &\\
    [\text{  }(d,i,h_1)≥0,A(d,i,h_2)≥0] AND [ 𝒞(parent(d,i),h_1,h_2)=true] \\
    false, otherwise
\end{cases}$$

根据这个式子，可以对common region定义为所有满足$𝒞(d,i,h_1,h_2)=true$的点的集合：  
$$C(h_1,h_2)=\{(d,i)|𝒞(d,i,h_1,h_2)=true\}$$

#### shape
shape指一个schema中所有的节点都被$=$替代，它代表只关心schema的结构，不关心每个节点的具体内容。  


### 超模式
超模式(hyper schema)是对某个模式的进一步抽象，和模式不同的是，超模式允许对子树结构进行抽象，即忽略某个节点的子树结构，这个节点下的子树结构用don't care，$\#$替代。$\#$可以是任何的子树结构。  
从另一个角度理解，超模式是符合某个schema的所有个体的集合。超模式可以用于表达产生一个schema的两个亲本个体所必须具备的属性。  

### Building blocks
这篇论文中没有对building blocks给出非常详细的定义，但是通过公式可以判断，作者认为building blocks是schema的进一步抽象，并且组成schema。具体的，作者认为schema按照一定的方式划分为两半并且抽象得到的结果称为building blocks。交叉的亲本应该各持有一部分这两部分building blocks。  


## Schema的视角 - Exact Schema Thoery
### 单点交叉的模拟
#### upper build blocks和lower building blocks
作者认为，单点交叉的building blocks为schema在交叉点处划分的上下两部分的抽象，分为upper building blocks和lower building blocks， 亲本应当各持有这两个building blocks。  
这两个building blocks具体的划分如下：  

- upper building blocks  
  记为$U(H,i)$，通过将schema $H$上对应交叉点$i$下方的所有子树抽象为$\#$得到。换言之即不关心交叉点下方的结构。  

- lower building blocks  
  记为$L(H,i)$，抽象方法如下：  
  
  - schema $H$上对应交叉点$i$到根节点路线上的所有节点替换为$=$，如果这些被替换为$=$的节点存在子节点，那么这些子节点将被替换为$\#$. 换言之不关心交叉点上方的结构（但是需要保持schema的拓扑连结）。

两种划分方法如下图所示：  
<img src=https://cdn.jsdelivr.net/gh/l61012345/Pic/img/20240319140055.png width=70%>  

因此，如果两个亲本$h_1,h_2$交叉后的个体想要在schema $H$中，那么对所有可能发生的交叉点$i$，它们的两个亲本所属的shape$G_k$和$G_j$需要各自持有schema $H$的upper building blocks$U(H,i)$和lower building blocks$L(H,i)$。并且，根据[理论1](#理论1)，只有当交叉点在$G_k$和$G_j$（或者说$h_1,h_2$）的common region时，交换后才会生成/保留schema的拓扑结构。  
因此，式(0-2)中的$α_c(H,t)$进一步表示为：  
$$α_c(H,t)=∑_{k,l}\frac{1}{|C(G_k,G_l)|}×∑_{i∈C(G_k,G_l)}p(U(H,i)∩G_k,t)p(L(H,i)∩G_l,t) \tag{1-0}$$
其中$|C(G_k,G_l)|$表示$G_k$和$G_l$的common region的节点总数;$∩$表示两个树的共同部分的截取。  



### 同源交叉的模拟
接下来，作者试图将Exact Schema Thoery 拓展到同源交叉。所谓同源交叉(homologous crossover)即两个亲本个体发生的点对点的交叉。在遗传算法中，同源交叉是通过模板(mask)来实现的。简单来说，遗传算法中设计好一个二进制的mask，用0代表来自其中一个亲本$h_1$的比特片段，用1代表来自另一个亲本$h_2$的比特片段，后代根据这个模板中对应比特的来源信息从两个亲本中填入比特：  

<img src=https://cdn.jsdelivr.net/gh/l61012345/Pic/img/20240319144438.png width=40%>  

在本文中，作者借用了遗传算法中使用模板的方法，任何在common region中进行的交叉都可以用模板进行表示。因此，模板的shape应当与common region的shape相同。  
同样地，结合树的坐标表示，在common region中的任何部分都可以用0和1来表示后代中每个节点与亲本的来源关系。  

<img src=https://cdn.jsdelivr.net/gh/l61012345/Pic/img/20240319163507.png width=50%>  

定义如果$i$代表$h_1$和$h_2$的一个模板，$\overline{i}$则表示与$i$中的0/1完全相反的一个模板。  
并且定义$χ_{C(h_1,h_2)}$表示$h_1$和$h_2$的common region的所有可能的模板的集合，$χ_{C(h_1,h_2)}$中应当有$2^{|C(h_1,h_2)|}$个元素，即$2^{|C(h_1,h_2)|}$种不同的可能模板。  
进化过程中交叉所使用的模板是有概率进行选择的，记$p_i^C$表示common region $C$中的第$i$个模板被选择用于交叉的概率，那么集合$\{p_i^c|∀c\}$则表示了遗传编程中所使用的交叉算子的特性。不同的交叉算子中$p_i^c$的概率不尽相同。    

#### building block的提取
和单点交叉一样，接下来当提取出两个亲本应当各自持有的schema的一部分，称为building blocks。但是同源交叉下提取并抽象这两部分要比单点交叉更加复杂。  
定义building blocks的提取函数$Γ(H,i)$，它可以对schema $H$根据模板$i$提取出标记为1的亲本所持有的building blocks。其提取方法如下：  
对于如果在$H$上的某个非最底层节点(none-leaf node)被$i$标记为0，那么它将被“=”替代，如果一个底层节点(leaf node)被$i$标记为0，那么它将被"#"替代：  

<img src=https://cdn.jsdelivr.net/gh/l61012345/Pic/img/20240319170658.png width=50%> 

那么相应地，$Γ(H,\overline{i})$可以根据模板$i$提取出标记为0的亲本所持有的building blocks。  

此处对于“持有”的理解是，building blocks本质上也是对个体特征的描述，因此一个building block也是满足这个特征的所有个体的集合。因此，一个个体“持有”某个building block可以理解为该个体是这个building block所代表集合的成员：$h_1 ∈ Γ(H,i)$  

{% note info %}
<p id="理论2"> 理论2：</p>  

**对于一个schema $H$，持有building block$Γ(H,i)$的个体与另一个持有building block$Γ(H,\overline{i})$的个的交叉的后代一定属于schema $H$。反之，产生后代属于$H$的两个亲本一定各自持有building block$Γ(H,i)$和$Γ(H,\overline{i})$**。  

> if one crossover using crossover mask $i$ any individual in $Γ(H,i)≠∅$ with any individual in $Γ(H,\overline{i})≠∅$, the resulting offspring is always an instance of $H$. Coversely, if two individuals cross using mask $i$ to form an element of $H$, then one of them must have come from $Γ(H,\overline{i})$ and the other from $Γ(H,\overline{i})$.  

{% endnote %}


#### 同原交叉下 Exact Schema Thoery的完整推导
设$p_i(h_1,h_2,i,t)$表示个体$h_1$和$h_2$以及交叉模板$i$在第$t$代被选中的概率；$g(h_1,h_2,H,i)$为$h_1$和$h_2$按照模板$i$交叉后产生属于schema $H$的个体的概率。  
那么有:  
$$α_c(H,t)=∑_{h_1}∑_{h_2}∑_ip(h_1,h_2,i,t)g(h_1,h_2,H,i) \tag{1-1}$$
先看$p_i(h_1,h_2,i,t)$，它可以理解为“选择模板$i$”(事件$A$)和“选择个体$h_1$和$h_2$(事件$B$)”两件事情同时发生的概率，在贝叶斯公式中对应$P(AB)$. 根据贝叶斯公式$P(AB)=P(A|B)P(B)$，其中$P(B)=p(h_1,t)p(h_2,t)$，分别代表个体$h_1$和$h_2$在第$t$代时被选中的概率，那么式子$(1-1)$可以改写为：  
$$α_c(H,t)=∑_{h_1}∑_{h_2}∑_ip(h_1,t)p(h_2,t)p(i|h_1,h_2)g(h_1,h_2,H,i) \tag{1-2}$$
对$p(i|h_1,h_2)$，它指的是当$h_1$和$h_2$被选中时，模板$i$被选中的概率（在$B$的条件下发生$A$的概率）。交叉模板$i$应当与$h_1$和$h_2$的common region的形状相同，被选中需要满足两个条件：1. $i$属于$h_1$和$h_2$的common regions的模板 2. 在这些模板中，$i$需要被选中。 因此有：  
$$p(i|h_1,h_2)=δ(i∈χ(h_1,h_2))p_i^{C(h_1,h_2)}$$
其中$δ(.)$是一个判断函数，当满足其中的条件时其值为1，否则为0。$∑δ(.)$表示在可能的遍历过程中这个条件被满足了多少次。  
那么，  
$$\begin{aligned}
    α_c(H,t)=&∑_{h_1}∑_{h_2}∑_ip(h_1,t)p(h_2,t)δ(i∈χ(h_1,h_2))p_i^{C(h_1,h_2)}g(h_1,h_2,H,i)\\
    =&∑_{h_1}∑_{h_2}∑_{i∈χ(h_1,h_2)}p(h_1,t)p(h_2,t)p_i^{C(h_1,h_2)}g(h_1,h_2,H,i)
\end{aligned} \tag{1-3}$$
根据乘法分配律，现在将与模板$i$相关的内容归结到一起：  
$$α_c(H,t)=∑_{h_1}∑_{h_2}p(h_1,t)p(h_2,t)∑_{i∈χ(h_1,h_2)}p_i^{C(h_1,h_2)}g(h_1,h_2,H,i) \tag{1-4}$$
再来看$g(h_1,h_2,H,i)$，要想$h_1$和$h_2$按照模板$i$交叉后产生属于schema $H$的个体，那么根据[理论2](#理论2)，当$h_1$和$h_2$各自持有building block$Γ(H,i)$和$Γ(H,\overline{i})$时，此时一定可以产生属于schema $H$的个体（概率为1），否则一定不能产生属于schema $H$的个体（概率为0）
有：  
$$g(h_1,h_2,H,i)=δ(h_1∈Γ(H,i))δ(h_2∈Γ(H,\overline{i}))$$
乘积在此的作用相当于逻辑中的$AND$，表示两种情况同时发生时才可以发生。  
那么：  
$$\begin{aligned}
    α_c(H,t)=&∑_{h_1}∑_{h_2}p(h_1,t)p(h_2,t)\\
    &×∑_{i∈χ(h_1,h_2)}p_i^{C(h_1,h_2)}δ(h_1∈Γ(H,i))δ(h_2∈Γ(H,\overline{i}))
\end{aligned} \tag{1-5}$$
$h_1$和$h_2$一定属于某些shape，有$∑_jδ(h_1∈G_j)=1$，那么向式$(1-5)$添加关于shape的信息对式子本身不会有任何影响：  
$$\begin{aligned}
    α_c(H,t)=&∑_{h_1}∑_{h_2}∑_j∑_kp(h_1,t)p(h_2,t)\\
    &×∑_{i∈χ(h_1,h_2)}p_i^{C(h_1,h_2)}δ(h_1∈Γ(H,i))δ(h_1∈G_j)δ(h_2∈Γ(H,\overline{i}))δ(h_2∈G_k)\\
    =&∑_{h_1∈G_j}∑_{h_2∈G_k}p(h_1,t)p(h_2,t)\\
    &×∑_{i∈χ(h_1,h_2)}p_i^{C(h_1,h_2)}δ(h_1∈Γ(H,i))δ(h_2∈Γ(H,\overline{i}))
\end{aligned} \tag{1-6}$$
因为$h_1∈G_j$,$h_2∈G_k$，它们的common region应该是一样的：$C(h_1,h_2)=h(G_j,G_k)$，那么：  
$$\begin{aligned}
    α_c(H,t)=&∑_j∑_k∑_{h_1∈G_j}∑_{h_2∈G_k}p(h_1,t)p(h_2,t)\\
    &×∑_{i∈χ(h_1,h_2)}p_i^{C(G_j,G_k)}δ(h_1∈Γ(H,i))δ(h_2∈Γ(H,\overline{i}))
\end{aligned} \tag{1-6}$$
将这个式子重新整理，有：  
$$\begin{aligned}
    α_c(H,t)=&∑_j∑_k∑_{i∈χ(h_1,h_2)}p_i^{C(G_j,G_k)}∑_{h_1∈G_j}p(h_1,t)δ(h_1∈Γ(H,i))\\
    &×∑_{h_2∈G_k}p(h_2,t)δ(h_2∈Γ(H,\overline{i}))
\end{aligned} \tag{1-7}$$
其中$∑_{h_1∈G_j}p(h_1,t)=p(G_j,t)$，$∑_{h_2∈G_k}p(h_2,t)=p(G_k,t)$，有$∑_{h_1∈G_j}p(h_1,t)δ(h_1∈Γ(H,i))=p(Γ(H,i)∩G_j,t)$,$∑_{h_2∈G_k}p(h_2,t)δ(h_2∈Γ(H,i))=p(Γ(H,\overline{i})∩G_k,t)$  
那么，  
$$α_c(H,t)=∑_j∑_k∑_{i∈χ(h_1,h_2)}p_i^{C(G_j,G_k)}p(Γ(H,i)∩G_j,t)p(Γ(H,\overline{i})∩G_k,t) \tag{1-7}$$
带入式$(0-2)$中：  
$$\begin{aligned}
    α(H,t) = & (1-p_c)p(H,t)\\
    &+p_c[∑_j∑_k∑_{i∈χ(h_1,h_2)}p_i^{C(G_j,G_k)}p(Γ(H,i)∩G_j,t)p(Γ(H,\overline{i})∩G_k,t)]
\end{aligned}$$
这是最终的Exact Schema Thoery.   
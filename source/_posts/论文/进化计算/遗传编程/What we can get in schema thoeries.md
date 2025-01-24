---
title: 可以从既有的schema theory中得到什么
date: 2025/01/25
category_bar: true
categories: 
- 论文
- 进化计算
- 遗传编程
---

# 可以从既有的schema theory中得到什么

Foundations of Genetic Programming Chapter 3,4,5,6的重点

> https://link.springer.com/book/10.1007/978-3-662-04726-2  

## Chapter 3：位置信息

位置信息在schema中的表述体现为：

- schema的根节点：这个节点描述了整个schema的初始位置；如果根节点位置是don't care那么这个schema在个体中的位置是并没有被确定的，反之则被确定下来。

- Don't care - 占位符

  根据Don't care的位置其描述的信息也是不一样的：Schema定义距（按照general的定义，树中有意义的比特所能包括的最小范围）内的Don't care描述了meaningful nodes之间的相对位置；定义距之外的Don't care描述了整个schema在个体中的相对位置。

早期的schema的定义(Koza: 一组subtrees的集合，Altenberg：一个subtree，OReilly：一组含有Don't care的subtrees的集合，...）中并没有考虑到位置信息，因此同一个schema可以在一个个体中出现多次。这也可以算作是代码重用的一种方式。


{% note info %}
Schema/Building blocks实现代码重用的根本是**Building Blocks在任何环境中，即插入在个体的任何位置上其自身的语义不会发生变化**。  
{% endnote %}


在这种情况下，一个Schema被实例化的次数和在种群中出现的次数可能是非常不同的，用个体的传播对schema的传播进行建模并不准确。最早的Holland的GA的Schema Theory可以有两个不同的角度理解：

- 将Schema看做是子空间（子空间的阶数以有意义的比特数来确定），Schema Theory所描述的搜索的过程是对子空间进行采样的过程；
- 从模块性的角度去看，Schema Theory描述的是将许多低阶模块凑成高阶模块的过程，更直白地说是模块的数量发生适应性变化的过程。

如果一个schema只在一个个体上被实例化一次，对于第一个叙述，个体数=采样数；对于第二个叙述，模块数=个体数。此时这两种描述方式通过实例化的个体数量建立起等价关系。在缺乏位置信息的情况下，个体数≠采样数，同时，个体数≠模块数，因此前述的这两种叙述很可能并不是等价的。同时也难以通过估计个体的数量来估计schema的传播。下一章的schema thoery中对schema的定义都保留了schema的位置信息（比如固定了根节点），schema theory可以在个体传播的描述层面上进行。

## Chapter 4 信息密度的积累和长度的限制

Rosca的 Schema Theory表示如下，其定义的schema thoery是一个带有don't care的根节点的树：

$$E[m(H,t+1)]\geq m(H,t)\frac{f(H,t)}{\overline{f})(t)}\times\left[1-(p'_m+p_{xo}\sum_{h\in H \cap Pop(t)} \frac{O(H)}{N(h)}\frac{f(h)}{\sum_{h\in H\cap Pop(t)}f(h)})\right]$$

其中很重要的是，Rosca的schema theory将$P_d(H,h,t)$直接使用了阶和个体大小的比$\frac{O(H)}{N(h)}$来表示。$O(H)$类比于GA schema thoery的阶，表示schema含有的有意义的节点的个数，进一步可以延伸为schema含有的有效信息量（不过在这个时候如何描述高信息量和低信息量子空间搜索的层级性）， $N(h)$则可以看做是承载这个有效信息的“容器”的大小。那么合起来看：$\frac{O(H)}{N(h)}$表示个体含有的有效信息密度：个体含有的有效信息与个体大小的比值越小，即个体单位节点中含有的有效信息越多，个体越不容易受到扰乱，从这里可以看出搜索可能更偏向于信息密度更高的个体。 

随着搜索的进行， $O(H)$的逐渐增大代表了搜索过程中有效信息的逐渐积累，但是由于搜索本身不断的精度逼近，参与描述目标的节点越来越多，$N(h)$也会不断增大，因此有效信息的积累速度和信息密度的增长速度并不是同步一致的。事实上，发生在不同层级上的crossover和对底层terminal的mutation（文献也说明越到搜索的后期标准standard crossover更倾向于发生在树的底层（发生在树顶层附近的改动在搜索的后期更容易被淘汰））是导致树的size不同步增大的重要原因，而搜索更加偏好信息密度大的个体，因此这种size的不成比例的增长可能降低了搜索效率。为了保障搜索过程中信息密度的有效增长，最简单的方法是使用一些防止bloat的方法，但是静态的高度限制减少了在接近静态高度之时的搜索范围，另一种可行的方法是对crossover和mutation的单次搜索范围进行限制，防止结构的增长速度大于有效信息的积累速度。

在Langdon和Poli的Schema Theory中，为了更接近GA提出的schema theory，其模拟了GA中的crossover和mutation提出了one-point crossover和one-point mutation.  One-point crossover将交叉限定在了两个亲本形状相同的区域中，并且两个亲本在这个区域的同等位置上发生交叉。One-point mutation则是随机选择一个节点，用声明数相同的其他节点进行随机替换。这两个Operator的特点是不会改变亲本的拓扑结构，因此将搜索限定在了完全由初始种群决定的形状当中，即$N(h)$的可选择范围从一开始就被固定下来。Langdon和Poli提出的Pessimistic Schema Thoery如下：

$$E[m(H,t+1)]\geq Mp(H,t)\times(1-p_m)^{O(H)}\times \{1-p_{xo}\left[\underset{D_1}{p_{diff}(t)(1-p(G(H),t))}+\underset{D_2}{\frac{L(H)}{N(H)-1}(p(G(H),t)-p(H,t))}\right]\} \tag{2}$$

其中，$G(H)$是schema$H$的形状；$p_{diff}(t)$表示其中一个亲本不属于$G(H)$的前提下，交叉不能产生$H$的实例的概率，$p_{diff}(t)(1-p(G(H),t))$代表了交叉不能产生$H$的第一种可能：其中一个亲本和$H$的形状并不相同时，交叉无法产生$H$；$\frac{L(H)}{N(H)-1}(p(G(H),t)-p(H,t)$则表示了第二种可能：两个亲本都和$H$形状相同时，交叉无法产生$H$;其中的$O(H)$定义与之前相同，此处的定义距$L(H)$兼容了Rosca和OReilly的定义：是可以包括schema中所有有意义节点的连接的数量；另外，此处大于等于的原因是考虑一旦个体离开$H$就无法被还原。

那么根据上面的式子，在进化刚开始的时候，有非常大的概率两个亲本并不属于同一个形状，因此$D_2$项接近于0，此时$P_{diff}$有最大，那么此时交叉的disruption effect最大，以便在搜索空间中进行广泛的搜索。在进化的后期，diversity下降的快，两个亲本属于同一个形状的概率比较高（因为不同的形状之间本身也在竞争），$D_1$项因为$p_{diff}$接近于0而趋近于0。当种群中所有个体的shape相同时$D_1$项为0，$P(G(H),t)=1$此时$D_2$项与GA的schema thoery的交叉项完全相同，表明此时的搜索行为完全退化为GA，此后的搜索和收敛性将完全等同于GA。通过上述可以发现，在这个schema thoery描绘的动态性中，GP的搜索分为两部分，进化的前期不同的shape之间发生竞争，随着shape的收敛，后期GP的搜索转变为内容的竞争。  

## Chapter 5 扰乱和重建

虽然在GA中Holland认为两个不属于$H$的亲本交叉产生属于$H$的概率非常小，因此忽略不计。但是在GP中可能并非如此，随着GA中对马尔科夫过程的应用，schema theory转向exact schema thoery，即确值版本的schema theory。马尔科夫过程构建最重要的是一步转移概率，在宏观的角度上来看，即schema之间如何相互转换的过程，因此Exact schema theory更注重两个schema发生交叉如何产生某个特定的schema。在固定shape和size的前提下，schema H的转换概率表示为：

$$\alpha(H,t)=(1-p_{xo})p(H,t)+\frac{p_{xo}}{N(H)}\sum_{i=0}^{N(H)-1}p(l(H,i),t)p(u(H,i),t)$$

$l(H,i)$和$u(H,i)$分别是借用的GA的Exact Schema Theory的Left building blocks和Right building blocks，称为upper building blocks和lower building blocks，代表交叉点$i$划分的schema的上下部分各自对应的schema。

上面这个公式只在shape和size固定的情况下有用，为了进一步泛化，Langdon和Poli的exact schema中增加了新的占位符端节点#，其表示任意子树。#可以视为是比=（任意节点）的更高级的抽象，因此含有#的schema被称为Hyper Schema。  由于#不在意其内部的子树拓扑结构和子树大小，因此这样的一个hyper schema不再只能表示固定形状和大小的个体。

那么此时考虑当且仅当只有两个亲本的shape都为$G(H)$发生的交叉才会产生$H$的实例化个体的时候出现概率下界，那么上述式子在Hyper Schema下可以改写为：

$$\alpha(H,t)\geq (1-p_{xo})p(H,t)+\frac{p_{xo}}{N(H)}\sum_{i=0}^{N(H)-1}p(L(H,i)\cap G(H),t)p(U(H,i)\cap G(H),t)$$

这个式子被认为是对前式子（Langdon和Poli提出的Pessimistic Schema Thoery）考虑到重建的矫正公式。

当$p_{diff}=1$，$p_m=0$时，有：

$$\alpha(H,t)\geq p(H,t)\{1-p_{xo}\left[{1-p(G(H),t)}+{\frac{L(H)}{N(H)-1}(p(G(H),t)-p(H,t))}\right]\}$$

上面两个式子相减，在$N=L$的情况下有：

$$\Delta\alpha(H,t)=\frac{p_{xo}}{N(H)}\sum_{i\in B(H)}(p(L(H,i),t)p(U(H,i),t)-p(H,t)^2)$$

$i\in B(H)$指的是交叉发生在$H$上有意义的节点上。$\Delta \alpha \geq 0$，考虑到Pessimistic和Exact Schema Theory（same shape）相比Pessimistic没有考虑到重建，因此该项被视为是重建的概率增补。

那么反过来，

$$\underset{\alpha_1}{p(H,t)\{1-p_{xo}\left[{1-p(G(H),t)}+{\frac{L(H)}{N(H)-1}(p(G(H),t)-p(H,t))}\right]\}}+\underset{\alpha_2}{\frac{p_{xo}}{N(H)}\sum_{i\in B(H)}(p(L(H,i),t)p(U(H,i),t)-p(H,t)^2)}$$

则可能说明了搜索对building blocks的两面行为：<u>一方面交叉在不断的淘汰信息密度低的schema（$\alpha_1$），另一方面通过拼凑lower building blocks和upper building blocks可以让这个schema的采样率上升（$\alpha_2$）。</u>  

那么将Exact Schema Theory（same shape）进行泛化，考虑所有可能出现的shape，有：

$$\alpha(H,t)=(1-p_{xo})p(H,t)+p_{xo}\sum_j\sum_k\frac{1}{NC(G_j,G_k)}\sum_{i\in C(G_j,G_k)}p(L(H,i)\cap G_j,t)p(U(H,i)\cap G_k,t)$$

更进一步地泛化，Poli用建立坐标系的方法，将这个式子泛化到标准交叉中，此时交叉点应当有两个$i,j$：  

$$\alpha(H,t)=(1-p_{xo})p(H,t)+p_{xo}\sum_l\sum_k\frac{1}{N(G_j)N(G_k)}\sum_{i\in H \cap G_k}\sum_{j\in G_l}p(L(H,i,j)\cap G_l,t)p(U(H,i)\cap G_k,t)$$

注意新的定义中lower building blocks中对位置信息的控制，虽然交叉发生在lower building blocks的$j$处，但是lower building blocks的形成仍然和upper building blocks中的交叉点$i$，以及$H$本身有关。  



## Chapter 6 Effective Fitness和building blocks

Effective fitness 是代表一个schema产生后代的成功率，其目的是为了将creative和disruptive effect整合到fitness当中，如此才能真正的表示一个schema的采样率。最早的对GA的fitness的矫正来自于Goldberg：

$$f_{adj}(H,t)=f(H,t)(1-p_{xo}\frac{L(H)}{N-1}-p_mO(H))$$

这个式子同时考虑了交叉和突变，并且把个体的结构特征和表现整合到了一起，如此GA中的schema thoery可以改写为：

$$E[m(H,t+1)]\geq \frac{f_{adj}(H,t)}{\overline{f}}m(H,t)$$

GP中最早的effective fitness表示为：

$$P^{t+1}_j\approx p_j^t\frac{f_j}{\overline{f}^t}(1-p_{xo}\frac{C^e_j}{C^a_j}p^d_j)$$

其中重要的一项是被称为active part的部分的节点和整个个体$j$的个体数之比：$\frac{C^e_j}{C^a_j}$. 利用effective fitness可以为GP中的bloat和code compression进行解释：

有意义的部分和总体之比越小，$f_{eff}$应当越大，那么此处有两种降低$\frac{C^e_j}{C^a_j}$的方法：

- 增大inactive的部分 - 这可能是进化会出现bloat的原因
- 浓缩active的部分 - 这可能是为什么进化会倾向于选择同一个语义中表示最简的个体的原因。ADF更加浓缩了active的部分。

考虑$f_{eff}$的作用在于，如此选择的力度会更大，三个fitness相同的个体在$f_{eff}$下可以被分辨出来。effective fitness可以解释在没有选择压力之下的时候种群会自发进行结构迁移的现象：因为选择作用于$\frac{f_i}{\overline{f}}$但是整个进化过程却作用于$\frac{f_{eff}}{\overline{f}}$。在没有选择压力的条件下$f_{eff}(H,t)$依赖于$H$的鲁棒性，即genetic operator是否可以保留更多的$H$的实例化个体。

更近一点的版本是Poli让GP中的effecitve fitness为$f(H,t)\frac{\alpha(H,t)}{p(H,t)}$，那么有

$$f_{eff}(H,t)=f(H,t)[1-p_{xo}(1-\sum_{j}\sum_{k}\sum_{i\in C(G_j,G_k)}\frac{p(L(H,i)\cap G_j,t)p(U(H,i)\cap G_k,t)}{NC(G_j,G_k)p(H,t)})]$$

既然有effective fitness，其就可以构成fitness landscape，更进一步地说，GA具有的爬山效应如果用effective fitness进行说明，那么GA在爬的山并不是fitness的山，而是effective fitness的山。作者在Page 104画出了不同长度的个体在不同代数下的effetive fitness，表明随着进化的进行，每一代的effective fitness landscape都更倾向于扁平。当进化中出现的个体长度的分布趋近于稳定时，至少对于相对较短的程序来说，进化速度正在减慢。因此effective fitness landscape会更趋向于扁平。

### GP的building blocks

按照O'Reilly的观点，标准交叉的disruptive effect太大导致building blocks hypothesis可能在GP中并不存在。但是之后的schema theory表明building blocks至少在one-point crossover下应当是成立的。Exact schema theory中的Upper和Lower building blocks并没有一定要要求子树满足Goldberg提出的低阶长度段适应度高的要求。对于Exact Schema Theory中的building blocks，作者认为GA和GP中对于Exact Schema Theory中的building blocks认知是有差别的：GA中pair of building blocks的数量（尤其是对低阶schema来说）是很少的，因此从这些building blocks中选择重组的概率比较大；但是GP中即使是低阶的Schema也有很多building blocks，重组到同一组pair的概率是非常小的。










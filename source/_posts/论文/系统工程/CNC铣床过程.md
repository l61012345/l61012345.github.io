---
title: CNC铣床基本
date: 2023/11/29
categories: 
- 论文
- 系统工程
- 各类系统
category_bar: true
---
# CNC 铣床基本
## 系统组成
数控机床(Computer Numerical Control Machine, CNC Machine)是一种材料加工工具。CNC铣床(CNC Milling Machine)的主要功能是将放在机床上的工件材料(workpiece)通过与高速旋转的主轴(spindle)连结的刀片进行切割，使工件成型。主轴的转速和前进方向(XY轴方向)、纵向的伸缩(Z轴方向)都由电脑进行控制。  
<img src=https://cdn.jsdelivr.net/gh/l61012345/Pic/img/20231129113238.png width=80%>  
铣床本身包括了相当多的系统，如下图所示[^1]：  

| 系统名称 | 功能 |
|:--:|:--:|
| 主轴驱动 <br> Spindle Drives | 用于驱动连结主轴的马达进行高速旋转 |
| 伺服驱动 <br> Servo Drives | 用于驱动主轴进行X/Y/Z三个方向的线性移动 |
| 液压系统 <br> Hydraulic System | 对工件施加夹持压力，保证工件在加工过程中不产生晃动 |
| 冷却和润滑系统 <br> Cooling Lubrication System | 在加工过程中冷却，避免工件和主轴出现过热 | 
| 控制系统 <br> Control System | 将计算机的数值控制转换为电压控制信号传送给主轴 |
| 辅助系统 <br> Auxiliary System | 提供照明、风冷和显示等等功能 | 
| 外围系统 <br> Perphery System | 负责更换刀头等等 |

[^1]: G.Y.Zhao *et al*., Energy Consumption in Machining: Classification, prediction, and reduction stratage, *Energy*, 2017.  

各部分的能量消耗如下图所示[^1]：  
<img src=https://cdn.jsdelivr.net/gh/l61012345/Pic/img/20231129114751.png width=40%>   

## 工作流程
在铣床通电之后(下图中的Stand-by阶段)，机器开始准备进行铣削工作，但是此时主轴并未开始工作，能量消耗是一个比较稳定的值。  
此后，主轴开始旋转，但是刀头(cutting tool)并未接触到工件，此时的铣床工作状态称为空切(air-cutting). 空切的能量消耗是无意义的。需要注意的是，倘若工件本身表面不均匀，也有可能在主轴刀头接触到工件后发生空切现象。  
然后主轴逐渐下降，刀头接触到工件并开始进行铣削操作。此时主轴和辅助外围系统均会产生能耗。对于主轴系统，其能量消耗分为两部分：由主轴旋转引起的角速度（通常描述为主轴转速, spindle speed）的能量消耗和由刀头在工件表面发生相对移动并且切割工件造成的线速度（通常描述为切削速度, cutting speed）的能量消耗。总而言之，这个阶段中的有效能量来源于移除不需要的工件部分所消耗的能量，因此材料去除能(material removal energy)是衡量铣削过程中有效能量的标志。  
此后主轴抬起，机床再次进入空切状态。  
在主轴停转后（即下图中的Off阶段），电流会先经过一定的不稳定状态，此时虽然铣床中没有任何子系统工作，但是依旧有能量消耗，这个能量消耗在[^2]中定义为基本能量消耗(basic energy consumption). 这个能量消耗不和任何子系统相关，且不稳定[^2]。  
整个机床在一次铣削过程的总能量消耗大致如下图所示[^2]：  
<img src=https://cdn.jsdelivr.net/gh/l61012345/Pic/img/20231129144206.png width=60%> 

[^2]: Energy consumption modeling and prediction of the milling process: A multistage perspective, *Proceedings of Institution of Mechanical Engineers*, 2018.  

## 主要参数
### 进给率和给进速度
用于描述整个机床工作过程的最重要的参数是**进给率**（feed rate），给进率描述了切削刀具，也就是刀头相对于工件移动的速度，常用单位为英寸每分钟(inch per minute，IPM)。进给速度是切削刀具在单主轴旋转中在材料上移动的速度。它以每转距离 (DPR) 单位表示。它由刀具的转速、切屑负荷和切削刀具的排屑槽数决定。一般来说，低进给速度和高主轴速度会产生更干净和更平滑的切削，而高进给速度可能会导致更粗糙的切削和更低的表面光洁度。 [^3]。  

[^3]: CNC 加工进给和速度：你应该知道什么 https://www.runsom.com/zh-cn/blog/cnc-machining-feeds-and-speeds/#calculations-for-milling-operations   

### 材料去除率
削切加工的本质就是将工件材料中多余的材料通过铣削的方式去除。材料去除率（material removal rate， MRR）是一个衡量材料加工精度的指标，它反映了在一次加工过程中材料中被取走或去除的部分所占的比例。材料去除率越高，说明材料加工过程中，更多的材料被去除，加工精度越高。

### 切削速度
有相当多的文献发现，切削速度(cutting speed)、给进率(feed rate)和切割深度(depth of cutting)会影响机床工作的能耗效率，即材料去除能与总能耗的比值。其中切削速度对于能耗的影响最大。切削速度是工件与刀具之间的相对速度，以米每分钟（MPM）或表面英尺每分钟（SFM）计算。这是工件的特定点通过切削刃的速度，用于测量每分钟切削齿去除的表面。  
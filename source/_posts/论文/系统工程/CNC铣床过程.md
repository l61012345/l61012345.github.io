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



## 主要参数
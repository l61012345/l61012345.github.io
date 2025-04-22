---
title: TensorFlow 入门项目：训练一个VGG模型
date: 2021/09/25
category_bar: true
categories: 
- 论文
- 神经网络
tags:
- Tensorflow
---
# TensorFlow 入门项目：训练一个VGG模型
> 代码环境建议为：Python37/38/39 Tensorflow 2.3.0/2.6.0

同NUS的交通标志分类器项目一样，搭建一个训练器的算法思路基本相同。基本步骤为：
1. 读取数据集，加载数据集中的图像和标签
2. 划分训练集和测试集
3. 定义分类器，此处需要定义使用的Google的VGG模型
4. 将训练集放入分类器训练，并用测试集输出评价
5. 输出设定的评价标准
6. 保存模型

整个过程需要的函数库如下所示：
```Python
import glob
import matplotlib.pyplot as plt
import numpy as np
import tensorflow as tf
import os
from cv2 import cv2
from sklearn.model_selection import train_test_split
from tensorflow.keras import Model, Sequential, layers, models
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.preprocessing.image import ImageDataGenerator
```

在正式进行训练之前，可以利用tf中的`tf.config.experimental.list_physical_devices('GPU')`查找并选择使用GPU，写法是固定的。  
```Python
#调用GPU
gpus = tf.config.experimental.list_physical_devices('GPU')
if gpus:
    for gpu in gpus:
        tf.config.experimental.set_memory_growth(gpu, True)
```

## 加载数据集
这一部分的思路与NUS项目中使用Sklearn创建交通标志分类器的思路几乎完全相同：定义两个list用于分别存放图像集和标签集。遍历整个数据集。遍历数据集的方法使用`glob()`函数，数据集的文件夹层级为；  
--dataset  
..|-images  
....|-cato1  
....|-cato2  
....|-cato3  
....|-cato4  
其中每一张图像以类似`001_photoname.jpg`命名，001是图像的类别标签。  
对于图像，使用`cv2.imread()`将图像转为np.array格式后存放到list即可。对于图像所对应的标签，此处使用的是`split()`函数对文件路径、或者是文件名中含有的标签信息进行提取。如果标签在数据集中以*.csv或者*.exls的表格文件储存，则需要调用pandas函数库进行处理。  
需要注意的是，图像需要用`cv2.resize()`保证每张图片的大小相同，即矩阵的大小是相等的。  

```python
# 定义容器
x = []  # 图像集
y = []  # 标签集

ImgHight = 64 # 图片高度
ImgWidth = 64 # 图片宽度

# 加载数据集
dataset_root = 'dataset/images/**/'
for i in glob.glob(dataset_root + '*.jpg', recursive=True):
    img = cv2.imread(i)
    img_resize = cv2.resize(img, (ImgWidth, ImgHight))  # 裁剪图像
    x.append(img_resize)
    label = i.split("\\")[2][0:3]  # 分词找标签
    y.append(int(label))

# 错误代码
if len(x) == 0:
    print('Missing files')
elif len(y) == 0:
    print("missing names")

print("reading completed")
```
由于tf只支持标签和图像都为np.array格式，因此需要将标签和图像列表都转换为np.array格式。
此外还需要将图像列表转为一个长向量，以便输入分类器进行拟合。  
```python
# 把标签和图像转为nparry格式
x = np.array(x).reshape(-1, ImgHight, ImgWidth, 3)  # 转为1维长向量
y = np.array(y)
```

同样地，此处使用Sklearn中的`train_test_split()`函数对数据集进行随机划分，划分为测试集和训练集两部分。  
```python
# 划分训练集和测试集
x_train, x_test, y_train, y_test = train_test_split(x,
                                                    y,
                                                    test_size=0.4,
                                                    shuffle=True)
```
## 加载模型
此处使用`tf.keras.applications.vgg16.VGG16()`来加载TensorFlow中预制的VGG算法模型。  
由于数据集的量比较小，因此设置数据输入到最后的四层。  
```python
print("Loading the model..")
# VGG16预训练网络
covn_base = tf.keras.applications.vgg16.VGG16(weights='imagenet',
                                              include_top=False)
covn_base.trainable = True
# 冻结前面的层，训练最后四层
for layers in covn_base.layers[:-4]:
    layers.trainable = False
    
```
对每一层，都需要用`tf.keras.layers`中的函数指定每一层的用途和相关的参数（比如激活函数，池化方法等等）。由于采用的是预制的标准VGG16算法，因此最后4层每一层的设置遵循标准VGG16的结构。需要注意损失函数的定义，当标签以整实数形式存放时，应该使用`tf.keras.losses.SparseCategoricalCrossentropy()`，如果以二进制编码，如标签3为011，则应该使用`tf.keras.losses.CategoricalCrossentropy()`。
Logits表示网络的直接输出 。没经过sigmoid或者softmax的概率化。`from_logits=False`就表示把已经概率化了的输出，重新映射回原值。$log(p/(1-p))$。  当`from_logits=True`时损失函数会做softmax，并进行概率归一化操作。  
由于有四类图像需要识别，此处`tf.keras.layers.Dense()`的第一个参数应该为4，表示样本空间的维度。  
```python
# 构建模型
model = tf.keras.Sequential()
model.add(covn_base)
model.add(tf.keras.layers.GlobalAveragePooling2D())
model.add(tf.keras.layers.Dense(256, activation='relu'))
model.add(tf.keras.layers.Dropout(0.2))
model.add(tf.keras.layers.Dense(4, activation='softmax'))
model.summary()
# 编译模型，初始学习率0.001
# 编译模型，初始学习率0.001
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss=tf.keras.losses.SparseCategoricalCrossentropy(
        from_logits=False),  # 标签为实数
    # CategoricalCrossentropy(from_logits=False)，标签为二进制编码
    metrics=["accuracy"])
```
对于大数据集，在训练后期，当loss不再明显时，减小学习率以加大学习的压力。  
```python
# 监视'val_loss'，当两个epoch的loss不变时，学习率减小为1/10
reduce_lr = ReduceLROnPlateau(monitor='val_loss',
                              factor=0.1,
                              patience=2,
                              verbose=1)
```
将训练集的图像和标签输入到分类器中拟合，拟合过程指定训练的轮数epochs，批数等等。使用TensorFlow2.0特性`validation_data()`导入测试集图像和标签，训练器在每一轮训练后会使用测试集进行测试，并返回准确率、loss到`history`中。  
```python
# 开始训练
history = model.fit(
    x_train,
    y_train,
    batch_size=128,
    epochs=15,
    validation_data=(x_test, y_test),
)
print("train complieted")
```
## 读取训练参数并保存模型
将记录到的loss、准确率进行读取，并使用pyPlot函数库对训练结果进行可视化处理。  
```python
# 记录准确率和损失值
history_dict = history.history
train_loss = history_dict["loss"]
train_accuracy = history_dict["accuracy"]
val_loss = history_dict["val_loss"]
val_accuracy = history_dict["val_accuracy"]

# Generate predictions (probabilities -- the output of the last layer)
# on new data using `predict`
print("Generate predictions for 3 samples")
predictions = model.predict(x_test[:3])
print("predictions shape:", predictions.shape)

print("ploting..")
# 绘制损失值
plt.figure()
plt.plot(range(epochs), train_loss, label='train_loss')
plt.plot(range(epochs), val_loss, label='val_loss')
plt.legend()
plt.xlabel('epochs')
plt.ylabel('loss')

# 绘制准确率
plt.figure()
plt.plot(range(epochs), train_accuracy, label='train_accuracy')
plt.plot(range(epochs), val_accuracy, label='val_accuracy')
plt.legend()
plt.xlabel('epochs')
plt.ylabel('accuracy')
plt.show()
```
使用`model.save()`函数保存训练模型，训练模型的格式有两种：  
1. h5，生成的是一个*.h5文件，需要使用`keras`进行读取。  
2. tf，生成的是一个模型文件夹，比较容易读取。  

```python
print("saving the model...")
# 模型保存，注意：仅仅是多了一个save_format的参数而已
# 注意：这里的'path_to_saved_model'不再是模型名称，仅仅是一个文件夹，模型会保存在这个文件夹之下
model.save('model/', save_format='tf')
print("completed")
```


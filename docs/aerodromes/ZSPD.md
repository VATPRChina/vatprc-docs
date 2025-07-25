# 上海浦东国际机场（ZSPD）标准运行程序

## 1. 总则

### 1.1 依据

为了保障 VATPRC 管辖范围内的上海浦东机场（ZSPD）安全、合规、高效运行，根据中国民用航空局（CAAC）发布的[《中华人民共和国航空资料汇编（AIP CHINA）》](https://www.eaipchina.cn)，结合 VATPRC 实际运行情况，制定适用于上海浦东机场（ZSPD）的标准运行程序。

### 1.2 原则

管制员上线时需遵守 [VATSIM Code of Conduct (COC)](https://vatsim.net/docs/policy/code-of-conduct) ，并积极与上下级管制员协调以达成一致认知。

### 1.3 适用范围

本文适用范围是 VATPRC 管辖内上海浦东机场的塔台、地面、放行、机坪席位。

> [!CAUTION]
> 本文件严禁用于真实运行!

### 1.4 名词解释

本文件中出现的“西货坪”一词特指由位于 C 滑行道（不含）以西的机坪、所有滑行道和 FATO 组成的封闭区域；“一号航站楼区域”一词特指 1、2 号机坪， 301-308 机位和 B 滑行道 P6 以北部分组成的封闭区域。

本文件中所有的滑行路线图，红色代表离场使用该滑行道，绿色代表离场、到场均使用该滑行道，蓝色代表到场使用该滑行道。

## 2. 运行信息

### 2.1 跑道可用距离

#### 离场跑道可用起飞滑跑距离（TORA）

| 跑道编号  |  等待点编号  | 可用距离/米 |
| :-------: | :----------: | :---------: |
|    16R    | 全跑道（R6） |    3800     |
|    16R    |      E5      |    3700     |
|    16R    |      R5      |    3300     |
|    17L    | 全跑道（B8） |    4000     |
|    17L    |      B7      |    3780     |
|    17L    |      P6      |    3400     |
|    34L    | 全跑道（P1） |    3800     |
|    34L    |      E0      |    3700     |
|    34L    |      R2      |    3300     |
|    35R    | 全跑道（R1） |    4000     |
|    35R    |      B1      |    3800     |
|    35R    |      P2      |    3200     |
| 17R/35L ① |    全跑道    |    3400     |

> ① 停放于西货坪的航空器和 A380 经协调后可用

#### 所有跑道的跑道长度

| 跑道编号 | 跑道长度/米 |
| :------: | :---------: |
| 17R/35L  |    3400     |
| 17L/35R  |    4000     |
| 16R/34L  |    3800     |
| 16L/35R  |    3800     |

### 2.2 跑道穿越联络道

#### 2.2.1 北向运行时跑道穿越联络道使用规则

- 35L
  - P1 向东穿越，P2、P4、P6 可双向穿越
  - 去往 35R/34L 离场的航空器主用 P1、P2 向东穿越
  - 进港航空器去往西货坪主用 P4 向西穿越

- 35R
  - P1、P5 向东穿越，P3 向西穿越，P2、P4、P6 可双向穿越
  - 去往 34L 离场的航空器主用 P1、P2 向东穿越
  - 去往 35L 离场的航空器主用 P3 向西穿越
  - 进港航空器去往西货坪主用 P4 向西穿越
  - 35L 进港航空器主用 P5、P6 向东穿越

- 34R
  - 本跑道原则上不提供穿越，如有需要 R2 可供双向穿越，R1 可向西穿越

- 34L
  - R4、R5、R6 供进港航空器使用，向西穿越
  - R2 可双向穿越

![bc08e86feda7d0230068f7240fe66fb2](https://github.com/user-attachments/assets/78a78873-037c-4b42-8472-30009604431a)

图 2.1 北向穿越图（红色箭头代表离场、蓝色代表进场、绿色代表混合使用）

#### 2.2.2 南向运行时跑道穿越联络道如下：

- 17L
  - P3、P5、P6 向东穿越，P1、P2、P4 可双向穿越
  - 17R 进港航空器主用 P1-P3 向东穿越
  - 去往 17R 离场的航空器主用 P4 向西穿越
  - 去往 16R 离场的航空器主用 P5 向东穿越
  - 进港航空器去往西货坪主用 P1 向西穿越
  - 去往 B7/B8 等待点的航空器主用 P6 向东穿越

- 17R
  - P6 向东穿越，P1、P2、P4 可双向穿越
  - 去往 16R 离场的航空器主用 P4 向东穿越
  - 去往 17L 离场的航空器主用 P6 向东穿越
  - 进港航空器去往西货坪主用 P1 向西穿越

- 16R
  - R1、R2、R3 供进港航空器使用，向西穿越
  - 如需使用 R2 向东穿越，需提前告知 ZSPD_2_TWR

- 16L
  - 本跑道原则上不提供穿越，如有需要 R2 可供双向穿越，R6 可向西穿越

![5fd23b555a51169b38b274f3166e1c5f](https://github.com/user-attachments/assets/753bab8a-5f78-4d71-a72f-b4fa8e8cdf27)

图 2.2 南向穿越图（红色箭头代表离场、蓝色代表进场、绿色代表皆可使用）

### 2.3 机场运行标准跑道组合

#### 2.3.1 日常情况运行

**在正常运行的情况下**， 上海浦东国际机场的标准起降规则为“内起外落”，即：

- 南向运行：17L、16R 用于起飞；17R、16L 用于降落
- 北向运行：35R、34L 用于起飞；35L、34R 用于降落

跑道 17R/35L 与跑道 16L/34R 可以进行平行仪表进近。

#### 2.3.2 低能见度运行

**适用条件：跑道视程 RVR 小于 550 m ，或云高小于 60 m 时**

运行情况：

- 北向运行：35R 用于起飞，34L 用于落地
- 南向运行：17L 同时用于起飞和降落

## 3. 席位划分

### 3.1 塔台

|   登录名   |         呼号          |  频率   |                         场面职责范围                         |
| :--------: | :-------------------: | :-----: | :----------------------------------------------------------: |
|  ZSPD_TWR  | 浦东塔台 Pudong Tower | 118.800 |      所有跑道及联络道，滑行道 D、G、H 及 H 以东全部区域      |
| ZSPD_1_TWR | 浦东塔台 Pudong Tower | 118.800 |          17L/35R、17R/35L 及对应联络道，C、D 滑行道          |
| ZSPD_2_TWR | 浦东塔台 Pudong Tower | 118.400 | 16L/34R、16R/34L 及对应联络道，滑行道 G、H 及 H 以东全部区域 |

**若在主扇上线之后，有塔台分扇上线，主扇可以自行选择保留 ZSPD_TWR 的呼号或者更换为 ZSPD_1_TWR。**

塔台管制空域水平范围：南北切入着陆航迹或 ILS 航道后，东西 10 km 范围内

塔台场面管制范围如下：

- ZSPD_1_TWR：17L/35R、17R/35L 及对应联络道，C、D 滑行道（粉色）
- ZSPD_2_TWR：16L/34R、16R/34L 及对应联络道，滑行道 G、H 及 H 以东全部区域（橙色）

![07f21845d758527de9c51bfc21c9b0e3](https://github.com/user-attachments/assets/c5e20873-2f1e-44d3-af1b-4aa40e8b3122)

图 3.1 塔台场面管制区范围图

### 3.2 地面

|  登录名  |          呼号          |  频率   |     职责范围     |
| :------: | :--------------------: | :-----: | :--------------: |
| ZSPD_GND | 浦东地面 Pudong Ground | 121.700 | 全机场地面管制区 |

地面管制范围如下：

绿色为地面管制区，黄色与蓝色为机坪管制区，无机坪管制时 ZSPD_GND 需代管机坪管制区

![46ef00cea98d23d6893a9d36fcc9b49d](https://github.com/user-attachments/assets/63795420-4c37-46be-ae80-99b36121b0c1)

图 3.2 地面管制区范围图

### 3.3 放行

|  登录名  |           呼号           |  频率   | 职责范围 |
| :------: | :----------------------: | :-----: | :------: |
| ZSPD_DEL | 浦东放行 Pudong Delivery | 121.950 |  全机场  |

### 3.4 机坪

|   登录名    |         呼号          |  频率   |         职责范围         |
| :---------: | :-------------------: | :-----: | :----------------------: |
| ZSPD_A_GND  | 浦东机坪 Pudong Apron | 121.650 |     全机场机坪管制区     |
| ZSPD_AN_GND | 浦东机坪 Pudong Apron | 121.650 |     1-3、6-8 号机坪      |
| ZSPD_AS_GND | 浦东机坪 Pudong Apron | 122.600 | T1-T4 联络道、4-5 号机坪 |

**若在 ZSPD_A_GND 上线之后，ZSPD_AS_GND 上线，主扇可以选择保留 A_GND 的呼号或者更换为 AN_GND。**

席位开设规则：

1. ZSPD_A_GND 为机坪主扇，在 ZSPD_GND 在线且航空器数量达到要求时可开设
2. ZSPD_A_GND（或 ZSPD_AN_GND）在线时，可开设 ZSPD_AS_GND 作为分扇

各机坪管制范围如下：

- 机坪管制区（合扇）：全机场机坪管制区域
- ZSPD_AN_GND：1-3、6-8 号机坪（黄色）
- ZSPD_AS_GND：T1（含）、E（不含）、T4（含）、B（不含）之间的区域，4 号机坪（蓝色）

![00e87df39394cc0e55c91420b9efe2b8](https://github.com/user-attachments/assets/eef0cca3-666c-472c-85dd-ebecf5f97bf1)

图 3.3 机坪管制范围划分图

## 4. 席位职责

### 4.1 塔台

#### (1) 离场航空器的放飞规则和移交

> [!NOTE]
> 下列标注的“间隔”如非特别注明，则一律以机组离地（有正上升趋势）为计时起点。

离场航空器放飞需要满足下列条件：

1. 单一跑道满足其尾流间隔

2. 对于不同跑道同一离场点航空器采取最少 2 分钟（120 秒）的间隔

3. 对于相邻近距跑道（35L&35R / 34L&34R）航空器在距离其跑道头 10 公里内时，离场航空器应于进场航空器接地且有减速趋势后放飞

4. 对于相邻近距跑道（35L&35R / 34L&34R）航空器复飞后，在复飞航空器通过跑道头后 2 分钟（120 秒）后放飞

5. 对于相邻近距跑道（35L&35R / 34L&34R）航空器执行起落航线时，离场航空器在起落航线航空器加入三边后放飞

6. 跑道上没有其他航空器

7. 需要雷达引导的航空器，塔台管制员在许可航空器进入跑道前必须向当前正在对终端管制区提供管制服务的管制席位通报雷达引导需求

#### (2) 复飞航空器的处理

仪表飞行规则进近航空器根据标准复飞程序执行，在航空器有正上升趋势后移交给进近。目视飞行规则航空器复飞后加入本场起落航线。

#### (3) 目视飞行离场航空器的处理

目视飞行规则离场航空器离场时依照其协调内容给予保持一边、加入起落航线等指令，并于 300~450 米间移交给进近，目视飞行规则航空器离场前必须与上级单位协调。

#### (4) 起落航线

17R/35L 号跑道起落航线在跑道西侧进行。16L/34R 号跑道起落航线在跑道东侧进行。

C、D 类航空器高度 450 m，A、B 类航空器高度 300 m。

#### (5) 与其它场面席位的移交

35L/17R 跑道脱离且无需沿 C 滑行的航空器在 L15 前移交给 ZSPD_AN_GND；

35R/17L 跑道沿 P1 向东脱离，预计沿 T2 继续向东滑行的航空器在 V2 前移交 ZSPD_AS_GND；

机位在西货坪的航空器，在 C 上 P1-P5、Q1-Q5 前移交 ZSPD_AN_GND；

其余航空器在脱离跑道后在 A、F 前移交给 ZSPD_GND。

#### (6) 与对终端区提供雷达管制服务的席位的移交优先级

| 优先级 |    席位     |  频率   |
| :----: | :---------: | :-----: |
|   1    | ZSSS_PF_APP | 121.100 |
|   2    | ZSSS_E_APP  | 127.750 |
|   3    |  ZSSS_APP   | 120.300 |
|   4    | ZSSS_C_CTR  | 134.300 |
|   5    |  ZSSS_CTR   | 120.950 |
|   6    |  ZSHA_CTR   | 124.550 |

#### (7) T5、T6 滑行道的运行

T5 滑行道向东运行，T6 滑行道向西运行。

### 4.2 地面和机坪

#### 4.2.1 地面席位

##### **(1) 滑行道的使用以及滑行路线**

**北向运行：**

1. 滑行道使用：

- A 滑行道向南滑行，B 滑行道 T4 与 P6 之间向北滑行

- E 滑行道向南滑行，F 滑行道向北滑行

- T4、T2 滑行道向东滑行、T1、T3 滑行道向西滑行

2. 滑行路线：

- A. 离场滑行路线

| 航空器停放位置 | 离场跑道 |         滑行路线          |
| :------------: | :------: | :-----------------------: |
| 一号航站楼区域 |   35R    |             A             |
|   6-8 号机坪   |   35R    |          E→T3→A           |
|  5 号机坪北侧  |   35R    |           T3→A            |
|  5 号机坪东侧  |   35R    |     E→T1→A→P1 或 T3→A     |
|  5 号机坪西侧  |   35R    |      T3→A 或 T1→A→P1      |
|  5 号机坪南侧  |   35R    |          T1→A→P1          |
|     西货坪     |   35R    |      P2→D→P1 或 C→P1      |
| 一号航站楼区域 |   34L    |          A→T4→E           |
|   6-8 号机坪   |   34L    |             E             |
|  5 号机坪北侧  |   34L    |           T4→E            |
|  5 号机坪东侧  |   34L    |             E             |
|  5 号机坪西侧  |   34L    |       T2→E 或 T4→E        |
|  5 号机坪南侧  |   34L    |           T2→E            |
|     西货坪     |   34L    | P2→A→P1→T2→E 或 C→P1→T2→E |

- B. 进场滑行路线

| 航空器停放位置 | 落地跑道 |   滑行路线    |
| :------------: | :------: | :-----------: |
| 一号航站楼区域 |   35L    |    A 或 B     |
|   6-8 号机坪   |   35L    |    A→T4→F     |
|  5 号机坪北侧  |   35L    |     A→T4      |
|  5 号机坪东侧  |   35L    |    A→T4→E     |
|  5 号机坪西侧  |   35L    |    A→T4→B     |
|  5 号机坪南侧  |   35L    |   A→T4→B→T2   |
|     西货坪     |   35L    |      L15      |
| 一号航站楼区域 |   34R    |    E→T3→B     |
|   6-8 号机坪   |   34R    |   E→T3 或 F   |
|  5 号机坪北侧  |   34R    |     E→T3      |
|  5 号机坪东侧  |   34R    |       E       |
|  5 号机坪西侧  |   34R    |    E→T3→B     |
|  5 号机坪南侧  |   34R    |     E→T1      |
|     西货坪     |   34R    | E→T3→B→P4→L15 |

![2354f4b802d77ef0ce8943fc5c7e788b](https://github.com/user-attachments/assets/9022b3af-3561-4571-93a8-c75880ee3d75)

图 4.1 北向滑行图（红线表离场、蓝线表进场、绿线表进离场皆可、箭头代表运行方向）

**南向运行：**

1. 滑行道使用：

- A 滑行道向北滑行，B 滑行道在 T4 与 P6 之间向南滑行
- E 滑行道向南滑行，F 滑行道向北滑行
- T4、T2 滑行道向东滑行、T1、T3 滑行道向西滑行

2. 滑行路线：

- A. 离场滑行路线

| 航空器停放位置 | 离场跑道 |    滑行路线    |
| :------------: | :------: | :------------: |
| 一号航站楼区域 |   17L    |       A        |
|   6-8 号机坪   |   17L    |     E→T3→A     |
|  5 号机坪北侧  |   17L    |      T3→A      |
|  5 号机坪东侧  |   17L    | F→T3→A 或 T1→A |
|  5 号机坪西侧  |   17L    |  T3→A 或 T1→A  |
|  5 号机坪南侧  |   17L    |      T1→A      |
|     西货坪     |   17L    |      P6→A      |
| 一号航站楼区域 |   16R    |     B→T4→F     |
|   6-8 号机坪   |   16R    |   F 或 E→R6    |
|  5 号机坪北侧  |   16R    |      T4→F      |
|  5 号机坪东侧  |   16R    |       F        |
|  5 号机坪西侧  |   16R    |  T4→F 或 T2→F  |
|  5 号机坪南侧  |   16R    |      T2→F      |
|     西货坪     |   16R    |  P2/P4→B→T4→F  |

- B. 进场滑行路线

| 航空器停放位置 | 落地跑道 |      滑行路线      |
| :------------: | :------: | :----------------: |
| 一号航站楼区域 |   17R    |         A          |
|   6-8 号机坪   |   17R    |       A→T4→F       |
|  5 号机坪北侧  |   17R    |        A→T4        |
|  5 号机坪东侧  |   17R    |       B→T2→F       |
|  5 号机坪西侧  |   17R    |         B          |
|  5 号机坪南侧  |   17R    |        B→T2        |
|     西货坪     |   17R    |        L15         |
| 一号航站楼区域 |   16L    |      E/F→T1→A      |
|   6-8 号机坪   |   16L    |        F→T3        |
|  5 号机坪北侧  |   16L    |        F→T3        |
|  5 号机坪东侧  |   16L    |         F          |
|  5 号机坪西侧  |   16L    |      E/F→T1→B      |
|  5 号机坪南侧  |   16L    |       E/F→T1       |
|     西货坪     |   16L    | E/F→T1→A→P1/P2→L15 |

![30c4a6d38cf27e814cef37cafa4996d7](https://github.com/user-attachments/assets/faf9da21-7d24-4617-bace-35ec4fd471f2)

图 4.2 南向滑行图（红线表离场、蓝线表进场、绿线表进离场皆可、箭头代表运行方向）

##### **(2) 与其它地面或机坪席位的移交**

1. 在 L04 前移交 ZSPD_AN_GND，在 L02/W1/V2/L17 前移交 ZSPD_AS_GND；机位在 301-308 的航空器，北向时在 B P6 前或 P6 B 前移交 ZSPD_AN_GND，南向时在 A B7 前移交 ZSPD_AN_GND
2. ZSPD_GND 在 E8/L08/E7 前移交 ZSPD_AN_GND，在 L24/V7/W6 前移交 ZSPD_AS_GND，确定将沿 W7 进入机坪的航空器在 T3 前移交（经 ZSPD_AS_GND 同意可直接移交给 ZSPD_AN_GND）

##### **(3) 与塔台的移交**

1. 南向时，在 P6 前移交 ZSPD_1_TWR（如有沿 B7 进入机坪的航空器，在 ZSPD_AN_GND 指引进港航空器转入 B7 之前**建议**暂缓移交后续离场航空器）；在 E5 前移交 ZSPD_2_TWR
2. 北向时，在 B1 前移交 ZSPD_1_TWR；在 E0 前移交 ZSPD_2_TWR
3. 对于穿越跑道的航空器，指挥其在对应联络道外等，联系对应塔台; **航空器未联系塔台席位，不得进入联络道**

#### 4.2.2 机坪席位

(1) 机坪内滑行路线

![28b2600d9dec871768e5877c4ca54b4b](https://github.com/user-attachments/assets/d8a6734d-1629-4059-972d-624a358211dd)

图 4.3 机坪内部滑行图（红线表离场、蓝线表进场、绿线表进离场皆可、箭头代表运行方向）

**标准机坪进出路线：**

|                                           停机位                                            |                滑入                |                滑出                |
| :-----------------------------------------------------------------------------------------: | :--------------------------------: | :--------------------------------: |
|                                           Nr. 1-5                                           |                 P6                 |            W1/B4/B5/B6             |
|                                      Nr. 6-24. 201-211                                      |            P4/P5/P6/B3             |            W1/B4/B5/B6             |
|                                          Nr. 25-32                                          |                 B3                 |            W1/B4/B5/B6             |
|                               Nr. 52. 54. 56. 58. 60. 62. 64                                | E7→L11→L12A 或 W7→L07→L08→L11→L12A | L12→L10→E6 或 L12→L10→L08→E5/R4/W6 |
|                                       Nr. 50. 51. 53                                        |      E7→L10 或 W7→L07→L08→L10      |     L10→E6 或 L10→L08→E5/R4/W6     |
|                                         Nr. 801-805                                         |      E7→L11 或 W7→L07→L08→L11      |     L11→E6 或 L11→L08→E5/R4/W6     |
| Nr. 55. 57. 59. 61. 63. 65. 67. 69. 71. 73. 75. 77. 79. 81. 83. 85. 87. 89. 91. 93. 806-816 |            W7/R5/R6/E7             |            E6/E5/R4/W6             |
|                                          Nr. 95-98                                          |               W7/W5                |           W6/W4/E6/E5/R4           |
|                             Nr. 80. 82. 84. 86. 88. 90. 92. 94                              |                 W5                 |                 W4                 |
|                               Nr. 161-178. 581-586. 589. 590                                |              E3/E1/R1              |          W6/V7/E2/L22/L19          |
|                                    Nr. 112-125. 501-509                                     |              P3/P2/B2              |           W1/V2/L19/L22            |
|                                         Nr. 510-512                                         |              P3/P2/B2              |          开车后由地面指挥          |
|                                         Nr. 127-129                                         |               V4→L19               |               V2/L19               |
|                                  Nr. 130-135. 137. 567-572                                  |              V4→L21A               |              L20A→V3               |
|                              Nr. 139. 141. 143. 145. 147. 149                               |              L21/L21A              |              L20/L20A              |
|                                         Nr. 158-160                                         |               V5→L19               |               V7/L19               |
|                                     Nr. 151-157.556-560                                     |               V5→L21               |               L20→V6               |
|                                         Nr. 109-111                                         |               W3→L22               |               W1/L22               |
|                               Nr. 101-108. 136. 138. 561-566                                |              W3→L26A               |              L25A→W2               |
|                                 Nr. 140. 142. 144-146. 148                                  |              L26/L26A              |              L25/L25A              |
|                                        Nr. 179. 180                                         |               W4→L22               |               W6/L22               |
|                                  Nr. 150. 181-190. 551-555                                  |               W4→L26               |               L25→W5               |
|                                         Nr. 611-626                                         |                F→E8                |                 E                  |
|                                         4 号维修坪                                          |                L16                 |                 V2                 |

受运行方向影响的机坪进出路线：

|   停机位    | 北向运行滑入 | 北向运行滑出 | 南向运行滑入 | 南向运行滑出 |
| :---------: | :----------: | :----------: | :----------: | :----------: |
| Nr. 301-308 |      B       |    B7/B8     |      B7      |     B/B8     |

**(2) 与其它场面席位的移交**

- ZSPD_AN_GND：
  - 西货机坪滑出：在 L15 上，P1-P5、Q1-Q5 前移交给 ZSPD_1_TWR

  - 经由 W1 的滑出：在 T4 前移交给 ZSPD_AS_GND

  - 经由 W4 的滑出：在 HP05（T4 前）移交给 ZSPD_AS_GND

  - 经由 W6 的滑出：在 HP04（T4 前）移交给 ZSPD_AS_GND

  - 经由 B4/B5/B6 滑出：在 B 前移交给 ZSPD_GND

  - 经由 R4 滑出：在 HP05（E 前）移交给 ZSPD_GND

  - 经由 E6 滑出：在 HP01（E 前）移交给 ZSPD_GND（南向时经 ZSPD_GND 同意可直接移交给 ZSPD_2_TWR）

  - 经由 E5 滑出：在 HP02（E 前）移交给 ZSPD_GND（南向时经 ZSP_GND 同意可直接移交给 ZSPD_2_TWR）

  - 经由 L18 滑出：在 E7 前移交给 ZSPD_GND

  - 经由 B7 滑出（仅北向）：在 B E7 前移交给 ZSPD_GND

  - 经由 B 滑出（仅南向）：在 P6 前移交给 ZSPD_GND

- ZSPD_AS_GND：
  - 经由 T1/T3 滑出：在 B 前移交给 ZSPD_GND（北向时 T1 直接移交给 ZSPD_1_TWR）

  - 经由 E2/T2/T4 滑出：在 E 前移交给 ZSPD_GND

  - 经由 L19/L22 滑出：在 B/E 前移交给 ZSPD_GND

  - 经由 W5 滑入 7 号机坪：在 AH09（L07 前）移交给 ZSPD_AN_GND

  - 经由 W7 滑入 7 号机坪：在 AH07（L07 前）移交给 ZSPD_AN_GND

### 4.3 放行

#### (1) 飞行计划的审核与处理

见如下放行快速查询表

| 离场点 |                             方向                             |           巡航高度            |                                                        备注                                                         |
| :----: | :----------------------------------------------------------: | :---------------------------: | :-----------------------------------------------------------------------------------------------------------------: |
| SASAN  |                             ZSNJ                             |             4800              | 非主用离场点;目的地机场不得超出 ZSNJ-ZSWX-ZSSS-ZSPD-ZSYA-ZSNJ 连线范围;放行时与进近管制员协调航空器目的地和巡航高度 |
| SASAN  |                          ZSCG、ZSYA                          |           3600/4200           | 非主用离场点;目的地机场不得超出 ZSNJ-ZSWX-ZSSS-ZSPD-ZSYA-ZSNJ 连线范围;放行时与进近管制员协调航空器目的地和巡航高度 |
| PIKAS  |                             ZSJN                             |        7200/7800/8400         |                                                     主用离场点                                                      |
| PIKAS  |                             ZSOF                             |             4800              |                                                     主用离场点                                                      |
| PIKAS  |                             ZSYN                             |             4200              |                                                     主用离场点                                                      |
| PIKAS  |       华北、西北、新疆、中原、西南、蒙古、欧洲、中西亚       |           米制双数            |                                                     主用离场点                                                      |
|  NXD   | 广州情报区、香港情报区、三亚情报区、福建、贵州、云南、东南亚 |           米制双数            |                                                     主用离场点                                                      |
|  NXD   |                             ZSYW                             |             6000              |                                                     主用离场点                                                      |
|  NXD   |                       ZSFZ、ZSAM、ZSQZ                       |           7800/7200           |                                                     主用离场点                                                      |
|  AND   |                             ZSWZ                             |             5400              | 非主用离场点;目的地机场不得超出 ZSWZ-ZSYW-ZSHC-ZSPD-ZSZS-ZSWZ 连线范围;放行时与进近管制员协调航空器目的地和巡航高度 |
|  AND   |                          ZSHC、ZSNB                          |             2400              | 非主用离场点;目的地机场不得超出 ZSWZ-ZSYW-ZSHC-ZSPD-ZSZS-ZSWZ 连线范围;放行时与进近管制员协调航空器目的地和巡航高度 |
|  AND   |                    浙江东部（A470 以东）                     |       5400 以下米制双数       | 非主用离场点;目的地机场不得超出 ZSWZ-ZSYW-ZSHC-ZSPD-ZSZS-ZSWZ 连线范围;放行时与进近管制员协调航空器目的地和巡航高度 |
|  HSN   |                             ZSZS                             |             2400              |        主用离场点;W13 航路舟山 VOR（HSN）至 BEGMO 段高度限制 8400 以上，使用 8400 以下高度须由区域管制席同意        |
|  HSN   |                             ZSFZ                             |             8400              |        主用离场点;W13 航路舟山 VOR（HSN）至 BEGMO 段高度限制 8400 以上，使用 8400 以下高度须由区域管制席同意        |
|  HSN   |                          ZSAM/ZSQZ                           |           8400/9200           |        主用离场点;W13 航路舟山 VOR（HSN）至 BEGMO 段高度限制 8400 以上，使用 8400 以下高度须由区域管制席同意        |
|  HSN   |                             ZGOW                             |        8400/9200/9800         |        主用离场点;W13 航路舟山 VOR（HSN）至 BEGMO 段高度限制 8400 以上，使用 8400 以下高度须由区域管制席同意        |
|  HSN   |       W13 航路往香港情报区、广州情报区、三亚情报区方向       |       8400 以上米制双数       |        主用离场点;W13 航路舟山 VOR（HSN）至 BEGMO 段高度限制 8400 以上，使用 8400 以下高度须由区域管制席同意        |
| MIGOL  |                          台北情报区                          |          FL300/FL320          |                         仅供目的地在台北飞行情报区或由 APITO 进入福冈飞行情报区的航空器使用                         |
| MIGOL  |                 经 APITO 进入福冈飞行情报区                  |    FL250/FL290/FL310/FL390    |                         仅供目的地在台北飞行情报区或由 APITO 进入福冈飞行情报区的航空器使用                         |
| LAMEN  |                             RKPC                             |       FL230/FL270/FL330       |                                     主用离场点;放行时初始巡航高度严格按要求执行                                     |
| LAMEN  |                        Y722/B576 向北                        | FL270/FL330/FL350/FL370/FL410 |                                     主用离场点;放行时初始巡航高度严格按要求执行                                     |
| LAMEN  |                          Y591 向东                           |    FL250/FL290/FL310/FL390    |                                     主用离场点;放行时初始巡航高度严格按要求执行                                     |
| SURAK  |         ZSWH、ZSYT 、东北、东西伯利亚、日朝韩、北美          |          米制双数 ①           |                            非主用离场点；注意与上海区域管制席协调是否接受 A326 北向飞行                             |
| ODULO  |       东西伯利亚、日朝韩、北美、东北、ZSQD、ZSWH、ZSYT       |          米制单数 ②           |                                                     主用离场点                                                      |

> [!IMPORTANT]
> **注意**：浦东机场前往台北飞行情报区航空器不可走R596航路离开上海飞行情报区
>
> MIGOL 方向离场前往福冈飞行情报区需严格按 MIGOL-APITO-MIKES-AKVAS 航迹飞行，不得缺少任何航点

> ① A326 航路北向飞行使用米制双数高度层
> ② B221 航路北向飞行使用米制单数高度层

#### (2) 离场程序或者离场方式

**雷达引导离场**

> 以当班进近管制员同意为准，仅供参考

| 跑道 | 航向 |
| :--: | :--: |
| 35R  | 340  |
| 34L  | 010  |
| 17L  | 170  |
| 16R  | 150  |

**北向**

| 离场走廊口 | 主用跑道 | 离场程序 |
| :--------: | :------: | :------: |
|   PIKAS    |   35R    |  PIK95D  |
|   SASAN    |   35R    |  SAS91D  |
|    NXD     |   35R    |  NXD91D  |
|    AND     |   35R    |  AND91D  |
|    HSN     |   34L    |  HSN92D  |
|   MIGOL    |   34L    |  MIG92D  |
|   LAMEN    |   34L    |  见下表  |
|   SURAK    |   34L    |  SUR92D  |
|   ODULO    |   34L    |  ODU94D  |

| 离场走廊口 | 备选跑道 ① | 离场程序 |
| :--------: | :--------: | :------: |
|   PIKAS    |    34L     |  PIK96D  |
|   SASAN    |    34L     |  SAS92D  |
|    NXD     |    34L     |  NXD92D  |
|    HSN     |    35R     |  HSN91D  |
|   MIGOL    |    35R     |  MIG91D  |
|   LAMEN    |    35R     |  见下表  |
|   SURAK    |    35R     |  SUR95D  |
|   ODULO    |    35R     |  ODU93D  |

> ① 需经协调后分配

**LAMEN 方向离场程序分配规则**

| 飞行计划航路走向 |    跑道     | 离场程序 |
| :--------------: | :---------: | :------: |
|  Y722/B576 向北  | 34L（主用） |  LAM92D  |
|  Y722/B576 向北  | 35R（备选） |  LAM95D  |
|    Y591 向东     | 34L（主用） |  LAM94D  |
|    Y591 向东     | 35R（备选） |  LAM93D  |

**南向**

| 离场走廊口 | 主用跑道 | 离场程序 |
| :--------: | :------: | :------: |
|   PIKAS    |   17L    |  PIK81D  |
|    NXD     |   17L    |  NXD81D  |
|   SASAN    |   17L    |  SAS81D  |
|    AND     |   17L    |  AND81D  |
|    HSN     |   16R    |  HSN82D  |
|   MIGOL    |   16R    |  MIG82D  |
|   LAMEN    |   16R    |  LAM82D  |
|   SURAK    |   16R    |  SUR82D  |
|   ODULO    |   16R    |  ODU84D  |

| 离场走廊口 | 备选跑道 ② | 离场程序 |
| :--------: | :--------: | :------: |
|   PIKAS    |    16R     |  PIK84D  |
|    NXD     |    16R     |  NXD82D  |
|   SASAN    |    16R     |  SAS82D  |
|    HSN     |    17L     |  HSN81D  |
|   MIGOL    |    17L     |  MIG81D  |
|   LAMEN    |    17L     |  LAM81D  |
|   SURAK    |    17L     |  SUR81D  |
|   ODULO    |    17L     |  ODU83D  |

> ② 需经协调后分配

#### (3) 起始高度

所有航空器起始高度为 900 米。

#### (4) 跑道分配限制

A388 航空器不可使用 17L/35R 跑道，主用 16R/34L 跑道，可分配 17R/35L 跑道。

## 5. 其它参考资料

### 5.1 F 类航空器机位快查

**A388/A124**

|                  可用机位                   |  滑入  |   推出   |  滑出  |
| :-----------------------------------------: | :----: | :------: | :----: |
|                  ｜ Nr. 24                  |   W1   | L04 朝南 |   W1   |
|                 Nr. 71. 75                  | R5→L09 | L09 朝北 | L09→E5 |
|              Nr. 119. 121. 507              | P2→L02 | L02 朝南 | L02→V2 |
|                   Nr. 504                   | P2→L02 | L02 朝北 | L02→W1 |
|                   Nr. 168                   |   E1   | L23 朝南 |   E2   |
|                   Nr. 170                   | E1→L23 |   L23    |   E2   |
|                   Nr. 173                   |   E3   | L23 朝北 |   E2   |
| Nr. 310. 314. 315. 320. 325. 328. 333. 338. |  L15   |   L15    |  L15   |
|            Nr. 612-614. 616-618             |  L18   | L18 朝南 |  L18   |

> - 预计使用 24 号机位的 A388 航空器需经由 W1 滑入 1 号机坪，相关席位需要预先通知 ZSPD_AN_GND、ZSPD_AS_GND 或 ZSPD_GND
> - 在 W1 前移交 ZSPD_AN_GND
> - ZSPD_AN_GND 应密切关注对应航空器动态，提前清空相关滑行道以防出现航空器在 W1 前长时间待避

> - 使用 71、75 机位时，ZSPD_GND 在 R5 前移交 ZSPD_AN_GND
> - ZSPD_AN_GND 在 E5 前移交 ZSPD_GND（离场跑道为 16R 时经 ZSPD_GND 同意可以直接移交 ZSPD_2_TWR）

> - 使用 168、170、173 机位时，ZSPD_GND 在 E1/E3 前移交 ZSPD_AS_GND
> - ZSPD_AS_GND 指挥航空器在 L23 开车后直接移交 ZSPD_GND

**B748**

可用机位：Nr. 17. 19. 21. 24. 71. 75. 101. 102. 119. 121. 131-140. 148-156. 168. 170. 173. 174. 175. 177. 189. 190. 205. 208. 303. 305. 307. 310. 314. 315. 320. 325. 328. 333. 338. 504. 507. 510. 511 .612-614. 616- 618. 806. 809. 810. 816.

滑入、滑出参照 4.2.2 中相关内容，无特殊要求。

### 5.2 低能见度运行

**(1) 适用条件：跑道视程 RVR 小于 550 m，或云高小于 60 m 时**

**(2) 可运行区域**

![b47836541f57a5b925890125f774e40d](https://github.com/user-attachments/assets/479190f7-b69c-4efe-9677-41b2a323cf09)

图 5.1 低能见度运行范围图

跑道 17L/35R（含）、跑道 16R/34L（含）之间的区域，滑行道 P2、P4，西货坪。

**(3) 跑道联络道限制**

- 使用跑道 17L/35R 落地的航空器，不得向西脱离
- 去往西货坪的航空器如使用跑道 17L/35R 落地，应向东脱离后向西穿越跑道
- 机位在西货坪离场的航空器，应向东穿越两条跑道后滑至 17L/35R 跑道东侧的跑道等待点，不得使用 17L/35R 西侧的联络道起飞

**(4) 跑道穿越规则**

- 35L/R
  - P2 向东穿越
  - P4 向西穿越

- 17L/R
  - P2 向西穿越
  - P4 向东穿越

- 16R/34L：原则上不穿越，特殊情况需穿越时参照 2.2

**(5) 低能见度滑行路线**

**北向**

![334258cbfcfcc970daffda291285d239](https://github.com/user-attachments/assets/24760b0e-aed9-4550-8054-5a3c731f67c7)

图 5.2 北向低能见度滑行图（红线表离场、蓝线表进场、绿线表进离场皆可、箭头代表运行方向）

使用跑道 34L 落地的航空器，地面席位应尽快指挥其右转加入 F 或左转沿对应滑行道到 E 前，尽快离开跑道联络道。

**南向**

![dcc09d25d7470ad09bbbee5386c2260e](https://github.com/user-attachments/assets/23c563f0-6410-472e-bdd2-63d597084877)

图 5.3 北向低能见度滑行图（红线表离场、蓝线表进场、绿线表进离场皆可、箭头代表运行方向）

使用跑道 17L 落地的航空器，地面席位应尽快指挥其左转加入 A 或沿对应滑行道到 B 前，尽快离开跑道联络道。

**(6) 塔台席位与其他场面席位的移交**

- 跑道 35R 与跑道 34L 隔离平行运行（北向运行）
  - 考虑到低能见度运行环境，航空器脱离 34L 跑道后，在 F 前移交 ZSPD_GND
  - 航空器向西穿越 35L 跑道后，在 L15 前移交 ZSPD_AN_GND
  - 航空器向东穿越 35R 跑道后，在 A 前移交 ZSPD_GND

- 跑道 17L 运行（南向运行）
  - 考虑到低能见度运行环境，航空器脱离 34L 跑道后，在 A 前移交 ZSPD_GND
  - 航空器向西穿越 17R 跑道后，在 L15 前移交 ZSPD_AN_GND
  - 航空器向东穿越 17L 跑道后，在 A 前移交 ZSPD_GND

**(7) 地面席位与其他场面席位的移交**

- 跑道 35R 与跑道 34L 隔离平行运行（北向运行）
  - 在 B1 前移交 ZSPD_1_TWR；需要使用 34L 起飞的航空器在 E0 前移交 ZSPD_2_TWR，航空器未经 ZSPD_2_TWR 许可，不得进入 R1 联络道（不得跨越 CATII/III 等待点）
  - 对于穿越跑道的航空器，指挥其在对应联络道外等，联系对应塔台。 **航空器未联系塔台，不得进入联络道**

- 跑道 17L 运行（南向运行）
  - 在 P6 前移交 ZSPD_1_TWR（如有沿 B7 进入机坪的航空器，在 ZSPD_AN_GND 指引进港航空器转入 B7 之前**不得**移交后续离场航空器）

- **与机坪席位的移交与 4.2.1 要求相同**

**(8) 机坪席位与其他场面席位的移交**

- 北向时在 L15 P2 前移交 ZSPD_1_TWR
- 南向时在 L15 P4 前、B8 A 前移交 ZSPD_1_TWR
- **与地面的移交与 4.2.1 要求相同**

### 5.3 航空器停放位置参考

> [!NOTE]
> 此条内容仅为参考，不作为强制要求

远机位均为国内、国际港澳台航班混合停放。

**一号航站楼、S1 卫星厅**

|             类型             |    机位     |
| :--------------------------: | :---------: |
|       仅供国内航班停放       |  Nr. 1-15   |
|    仅供国际港澳台航班停放    |  Nr. 16-32  |
| 国内、国际港澳台航班混合停放 | Nr. 101-147 |

以下航空公司在一号航站楼、S1 卫星厅运行：

> 中国东方航空(CES) 上海航空 (CSH) 中国联合航空 (CUA)
>
> 日本航空(JAL) 韩国真航空 (JNA) 大韩航空 (KAL)
>
> 朝鲜高丽航空 (KOR) 澳洲航空 (QFA) 文莱皇家航空 (RBA)
>
> 中华航空(CAL) 法国航空 (AFL) 斯里兰卡航空 (ALK)
>
> 达美航空(DAL)

**二号航站楼、S2 卫星厅**

|             类型             |        机位        |
| :--------------------------: | :----------------: |
|       仅供国内航班停放       |  Nr. 50-57. 91-98  |
| 国内、国际港澳台航班混合停放 | Nr. 58-90. 148-190 |

以下航空公司在二号航站楼、S2 卫星厅运行：

> 美国航空 (AAL) 韩亚航空 (AAR) 加拿大航空 (ACA)
>
> 俄罗斯航空 (AFL) 成都航空 (UEA) 印度航空 (AIC)
>
> 泰国亚洲航空 (AIQ) 立荣航空 (UIA) 澳门航空 (AMU)
>
> 全日本航空 (ANA) 新西兰航空 (ANZ) 菲律宾亚洲航空 (APG)
>
> 乐桃航空 (APJ) 奥地利航空 (AUA) 英国航空 (BAW)
>
> 金鹏航空 (YZR) 首都航空 (CBJ) 中国国际航空 (CCA)
>
> 浙江长龙航空 (CDC) 山东航空 (CDG) 宿务太平洋航空 (CEB)
>
> 多彩贵州航空 (CGZ) 西部航空 (CHB) 海南航空 (CHH)
>
> 江西航空 (CJX) 国泰航空 (CPA) 春秋航空 (CQH)
>
> 重庆航空 (CQN) 香港航空 (CRK) 四川航空 (CSC)
>
> 中国南方航空 (CSN) 深圳航空 (CSZ) 厦门航空 (CXA)
>
> 美国联合航空 (UAL) 吉祥航空 (DKH) 汉莎航空 (DLH)
>
> 东海航空 (EPA) 韩国易斯达航空 (ESR) 阿联酋阿提哈德航空(ETD)
>
> 埃塞俄比亚航空 (ETH) 台湾长荣航空 (EVA) 芬兰航空 (FIN)
>
> 福州航空(FZA) 菲律宾鹰航 (GAP) 天津航空 (GCR)
>
> 印尼航空 (GIA) 河北航空 (HBH) 越南航空 (HVN)
>
> 华夏航空(HXA) 西班牙伊比利亚航空 (IBE) 伊朗马汉航空 (IRM)
>
> 捷星日本航空 (JJP) 九元航空 (JYH) 柬埔寨吴哥航空 (KHV)
>
> 荷兰皇家航空 (KLM) 柬埔寨航空 (KME) 昆明航空 (KNA)
>
> 老挝航空 (LAO) 祥鹏航空 (LKE) 印尼狮航空 (LNI)
>
> 马来西亚航空 (MAS) 毛里求斯航空 (MAU) 奥凯航空 (OKA)
>
> 菲律宾航空 (PAL) 青岛航空 (QDA) 卡塔尔航空 (QTR)
>
> 瑞丽航空 (RLH) 北欧航空 (SAS) 俄罗斯西伯利亚航空(SBI)
>
> 新加坡航空 (SIA) 春秋航空日本 (SJO) 天空吴哥航空 (SWM)
>
> 瑞士国际航空 (SWR) 西藏航空 (TBA) 泰国航空 (THA)
>
> 土耳其航空 (THY) 泰国狮航空 (TLM) 阿联酋航空 (UAE)
>
> 维珍航空公司 (VIR) 亚洲航空（长途） (XAX)

**其他航空器**
| 类型 | 机位 |
| :-----------: | :-----: |
| 货运飞机 | Nr. 301-308. 310-341. 346. 347. 611-626 |
| 旋翼航空器 | Nr. Z11-Z16. Z21-Z26. Z31-Z38 |
| 待维护航空器 | 4 号维修机坪内所有机位 |
| 公务机 | Nr. 201-211. 501-512. 551-572. 581-590. 806-816. Z11-Z16. Z21-Z26. Z31-Z38 |

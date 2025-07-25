# 上海 ACC 标准运行程序

## 1. 总则

### 1.1 介绍

本文档用于辅助 VATSIM 中华人民共和国分部（VATPRC）的管制员在上海 ACC 提供放行、机坪、地面和塔台管制服务，其包括了一些与上海 ACC 运行有关的信息。由于制作时间和篇幅限制，本文档所覆盖的内容可能不完全。撰写此文件的目的主要在于补充可能需要使用到的运行信息。分部并不要求所有管制员都记忆本文件中的所有内容，但在需要时可供管制员进行参考。所有上线上海 ACC 提供区域管制服务的本分部管制员、管制学员和客座管制员都应当仔细阅读此文档并知晓关键内容。如本文件被翻译为其他语言，所有内容也应以中文版本为准。如文档中包括已生效的协议书(LoA)内容，以 LoA 内容为准。在日常上线中，如无特殊情况，将默认按照此文档规定的标准操作程序进行航空器移交以及提供管制服务。如对文档内容有任何疑问，请联系分部运行主管。

本文件自 2023 年 1 月 1 日起正式试运行。如无后续修订，本文件自 2023 年 4 月 1 日起自动正式生效。

### 1.2 空域

上海 ACC（Area Control Center)是 VATPRC 管辖空域内流量最大的 ACC 之一，包含上海高低空、合肥高空、南昌高空和厦门高空空域。上海 ACC 的席位代码为 ZSSS_CTR。上海 ACC 同时与多个非 VATPRC 管辖的飞行情报区接壤，包含：

- 仁川飞行情报区（RKRR）
- 台北飞行情报区（RCAA）
- 香港飞行情报区（VHHK）

![227a3c3efca36b813a1db6d964d5ee77](https://github.com/user-attachments/assets/cc457359-d310-4821-b5e6-0933b86cd7a7)

图1: 上海 ACC 空域示意图

> [!IMPORTANT]
>
> 1. 当前 VATPRC 所管辖的上海ACC空域范围除 AKARA-福江走廊区域外，其余均与现实运行完全相同。在 VATSIM 中，上海 ACC03 扇(A593 LAMEN-SADLI 航段)属于仁川飞行情报区(RKRR)的范围。
> 2. 情报区边界和管制区边界并不一定完全相同。
> 3. 与其他分部的管制员进行移交时，严格按照对应 LoA 或协调方案进行。

## 2. 通用操作程序

### 2.1 过渡高度和过渡高度层.

管制员应当时刻监视机场的 METAR 信息以确定正确的过渡高度和过渡高度层。部分机场（如威海）在真实中由于其他用户活动频繁原因，过渡高度和过渡高度层并不是标准的 3000 m/3600 m，管制员需要根据公布的航图结合当前气象情况对 TA/TL 进行二次确认。

管制员必须在 QNH 变化后及时向机组通报新的 QNH 值。

对于全程在过渡高度层以下飞行的 IFR 航空器或 VFR 航空器，管制员应当对其高度时刻保持监控并及时给出对应更新的 QNH 值。

### 2.2 临时高度分配

除非 LoA 或管制席位间临时协调，否则禁止引导航空器突破管制席位的最高/最低高度，目的是防止突破高度之后的航空器影响其他管制席位的正常运行。管制员应当熟悉所管制的席位和邻近管制席位的最高/最低空域高度，防止产生冲突。

管制员可以视情况向航空器发布“沿程序下降”指令，此指令一般用于进近未上线或是进场程序开始点离进近扇区边界距离较远的情况。发布该类指令时，管制员必须修改航空器临时高度并且通知航空器其应当停止下降的高度，以反映指令的发布。

条件允许的情况下，管制员还应当监控航空器下降率，防止其突破程序高度限制和临时高度限制，或是因未领会指令而发生其他的潜在冲突问题。

### 2.3 METAR

管制员应当时刻监控每个活动机场的 METAR 信息，并据此制定合理的运行方案。当 METAR 发生较大变化或是出现可能危及航空器安全运行的天气类型时，应当立即通知航空器。

危险天气包括龙卷风、漏斗云、水柱、严重/极端乱流(包括晴空乱流)，严重结冰，冰雹，低空风切变以及任何其他报告的对飞行操作有危险或潜在危险的现象。

### 2.4 ATIS

区域管制员可以开设其范围内最多四个机场的 ATIS 频率。管制员应当时刻保证 ATIS 中的信息是有效且最新的。当 ATIS 更新时，管制员必须口头告知频率内所有航空器，并且将 ATIS 更新信息自动或手动发送至 ATC 协调频率。

## 3. 合扇席位划分

|  登录名  |           呼号            |  频率   |     职责范围     |
| :------: | :-----------------------: | :-----: | :--------------: |
| ZSHA_CTR | 上海区域 Shanghai Control | 124.550 | 情报区内所有空域 |
| ZSSS_CTR | 上海区域 Shanghai Control | 120.950 |     上海ACC      |

> [!IMPORTANT]
> 注意：非活动时段时，管制员应优先考虑上线 ZSHA_CTR 和 ZSSS_CTR 等合扇席位提供管制服务，以覆盖尽可能多的空域。

### 3.1 ZSHA_CTR

ZSHA_CTR 为情报区扇，其是上海 FIR 内最大的一个区域管制扇区，默认管制空域包含情报区内所有区域管制区、终端管制区和机场管制区。该席位在真实中并不存在，其为模拟中为迎合空域管理需要所创立的虚构席位。虽然 ZSHA_CTR 的呼号也为“上海区域”，但管制员应当了解该席位与真正的上海 ACC 之间的差异。

由于上海情报区内空域结构复杂，机场和终端区数量多，航路流量大，管制员可能无法在所有时间都对空域内所有的航空器提供管制服务。在条件允许的情况下，上线情报区合扇的管制员应当优先保障从热点机场（管制区）起飞或者即将落地热点机场（管制区）的航空器。热点机场（管制区）包括：

- 上海终端区（ZSSS，ZSPD）
- 杭州终端区（ZSHC）
- 厦门终端区（ZSAM）
- 南京终端区（ZSNJ）
- 合肥终端区（ZSOF）

ZSHA_CTR 同时覆盖青岛管制区除 01、02 扇外的扇区。青岛 01、02 扇(AGAVO 空域)为大连区域代管，因此沿 A593 经由 AGAVO 前往仁川方向的航空器和经由 AGAVO 从仁川方向进入上海情报区的航空器并不经过 ZSHA_CTR 的空域。

ZSHA_CTR 与多个其他分部的区域管制区接壤。在与其他分部的管制员进行移交时，必须严格按照 LoA 或临时协调方案。禁止随意移交。

### 3.2 ZSSS_CTR

ZSSS_CTR 为上海 ACC 合扇，呼号上海区域(Shanghai Control)，包括上海 ACC 所有高低空扇区（除 03 扇）。

ZSSS_CTR 与上海终端区、南京终端区、杭州终端区、青岛终端区直接接壤。与以上三个终端区的进近管制员进行航空器移交时，必须严格按照 SOP 规定移交。

## 4 分扇席位划分

![bc21852c8308faa2cb4fcceb8c1f73f1](https://github.com/user-attachments/assets/3e1bb343-8502-48b8-8e9a-156cf60fdee9)

### 4.1 上海区域北扇

|   登录名   |           呼号            |  频率   |              职责范围               |
| :--------: | :-----------------------: | :-----: | :---------------------------------: |
| ZSSS_N_CTR | 上海区域 Shanghai Control | 135.000 | ZSQDAR01/02/07/08/ZSSSAR07/16/36/38 |

上海 ACC 北扇当班管制员应视需求覆盖青岛 ACC 高空扇区（7800 m 含以上）。北扇主要流量为华北、东北和韩国北部方向前往上海的航空器。

> [!NOTE]
> 运行提示：
>
> 1. A326 航路、W108 航路和 B221 航路存在特殊使用规则，具体参见重点空域运行规则一章，请管制员注意。
> 2. 经由 A593 前往北京方向的航空器应在 DPX（邳县 VOR）-UDINO 段完成移交。移交高度一般不高于 12200 m。
> 3. 经由黄城 VOR（HCH）-W200-DOVIV 前往北京方向的航空器，过 DOVIV 移交北京ACC高度为 8400 m。

### 4.2 上海区域中扇

|   登录名   |           呼号            |  频率   |                          职责范围                           |
| :--------: | :-----------------------: | :-----: | :---------------------------------------------------------: |
| ZSSS_C_CTR | 上海区域 Shanghai Control | 134.300 | ZSSSAR01/02/04/05/08/15/18/19/21/24/26/27/28/31/32/33/34/37 |

上海区域中扇主要流量为上海、南京、杭州终端区进离港航空器和过境航空器。

> [!NOTE]
> 运行提示：
>
> 1. 西扇未上线时，中扇代管西扇空域。
> 2. 中扇管制范围不包括上海 03 扇（A593 LAMEN-SADLI 区域）。VATSIM 中，上海 03 扇由仁川区域管辖。
> 3. 中扇范围较大，空域内包含多个终端管制区和热点机场，实际管制时需要额外注意。
> 4. B591-KASKA 仅供落地机场位于台北 FIR 内的航空器使用。

### 4.3 上海区域南扇

|   登录名   |           呼号            |  频率   |              职责范围               |
| :--------: | :-----------------------: | :-----: | :---------------------------------: |
| ZSSS_S_CTR | 上海区域 Shanghai Control | 120.900 | ZSSSAR09/10/11/12/20/29/30/35/39/40 |

南扇主要负责厦门 ACC 高空、南昌 ACC 高空和上海 ACC 南侧扇区的航空器。南扇与广州 ACC 和香港 FIR 接壤，管制员需要严格按照 LoA 移交。

经 W46-OVTAN 落地长沙的航空器过 OVTAN 高度应不高于 7200 m。

经 R200 落地深圳的航空器过 AVBEP 高度应不高于 7800 m。

### 4.4 上海区域西扇

|   登录名   |           呼号            |  频率   |     职责范围      |
| :--------: | :-----------------------: | :-----: | :---------------: |
| ZSSS_W_CTR | 上海区域 Shanghai Control | 120.100 | ZSSSAR13/23/25/17 |

上海 ACC 西扇主要负责 R343、B208、W127 航路上航空器的管制。

## 5. 终端区移交

### 5.1 说明

实际运行中，如移交目标在本 SOP 内有规定明确的移交方式的，按照 SOP 移交。如未规定明确移交方式的，按照实际协调结果移交。

本节仅包括重点区域的移交方案。未来修订可能会逐步完善其他终端区。

### 5.2 上海终端区

具体运行规则参见上海终端区标准运行程序。当上海终端区 SOP 与本 SOP 有内容冲突时，以上海终端区 SOP 为准。

如上海进近按照合扇方式运行，下文中所有移交单位均自动变更为合扇席位。

- 当航空器落地机场为 ZSPD 时，按照下表移交：

|   进场点   |     移交点     |   移交高度    |  移交单位  |
| :--------: | :------------: | :-----------: | :--------: |
|   SASAN    | SASAN 前 10 nm |    6300 m     | ZSSS_W_APP |
| AND(庵东） |  AND 前 10 nm  | 5700 m/5100 m | ZSSS_S_APP |
| BK（栎社） |  BK 前 10 nm   |    5100 m     | ZSSS_S_APP |
|   DUMET    | DUMET 前 10 nm |    6000 m     | ZSSS_E_APP |
|   MATNU    | MATNU 前 10 nm |    6000 m     | ZSSS_E_APP |

- 当航空器落地机场为 ZSSS 时，按照下表移交：

|   进场点    |     移交点     |   移交高度    |  移交单位  |
| :---------: | :------------: | :-----------: | :--------: |
|    SASAN    |  ZJ 前 10 nm   |    6300 m     | ZSSS_W_APP |
|    SASAN    | ESBAG 前 10 nm |    6300 m     | ZSSS_W_APP |
| AND（庵东） |  AND 前 10 nm  | 4500 m/3900 m | ZSSS_S_APP |
|    SUPAR    |   BK 前 10nm   |    5100 m     | ZSSS_S_APP |
|     PUD     | DUMET 前 10 nm |    6000 m     | ZSSS_E_APP |
|     PUD     | MATNU 前 10 nm |    6000 m     | ZSSS_E_APP |

当上海进近南扇不在线时，由上海进近东扇兼并。

- 当航空器经由 A326、W108、A593(LAMEN 方向)航路，落地机场为 ZSHC 时，按照下表移交：

|     移交点     | 移交高度 |  移交单位  |
| :------------: | :------: | :--------: |
| PINOT 前 10 nm |  6000 m  | ZSSS_E_APP |
| DUMET 前 10 nm |  6000 m  | ZSSS_E_APP |

- 当航空器落地机场为 ZSWX 时，按照下表移交：

|   进场点    |      移交点      | 移交高度 |  移交单位  |
| :---------: | :--------------: | :------: | :--------: |
| JTN（九亭） | TMA 边界前 10 nm |  5400 m  | ZSSS_E_APP |
|    ESBAG    |  ESBAG 前 10 nm  |  4500 m  | ZSSS_W_APP |
|    PIMOL    |  PIMOL 前 10 nm  |  5100 m  | ZSSS_W_APP |

- 当航空器落地机场为 ZSNB 时，按照下表移交：

|     移交点     | 移交高度 |  移交单位  |
| :------------: | :------: | :--------: |
| PINOT 前 10 nm |  6000 m  | ZSSS_E_APP |
| DUMET 前 10 nm |  6000 m  | ZSSS_E_APP |
| SASAN 前 10 nm |  6300 m  | ZSSS_W_APP |

- 当由南京 TMA 东侧落地 ZSNJ 时，应在 SASAN 前 10 nm 以高度 6000 m 移交至上海进近。

### 5.3 南京终端区

- 当航空器落地机场为 ZSNJ 时，按照下表移交：

|    进场点    |     移交点     | 移交高度 | 移交单位 |
| :----------: | :------------: | :------: | :------: |
|    OREVO     | OREVO 前 10 nm |  2700 m  | ZSNJ_APP |
|    SUNBO     | SUNBO 前 10 nm |  4500 m  | ZSNJ_APP |
| OF（半塔集） |  OF 前 15 nm   |  6000 m  | ZSNJ_APP |
|    ESBAG     | ESBAG 前 10 nm |  4500 m  | ZSNJ_APP |
|  ZJ（奔牛）  |  ZJ 前 10 nm   |  3600 m  | ZSNJ_APP |
|    KAKIS     | TAPEN 前 10 nm |  4200 m  | ZSNJ_APP |
| HFE（骆岗）  | SUNBO 前 10 nm |  4500 m  | ZSNJ_APP |
| HFE（骆岗）  | OREVO 前 10 nm |  2700 m  | ZSNJ_APP |

### 5.4 杭州终端区

具体运行规则参见杭州终端区标准运行程序。当杭州终端区 SOP 与本 SOP 有内容冲突时，以杭州终端区 SOP 为准。

- 当航空器由 G204 航路经 OREXA 落地杭州时，上海区域应在黄山 VOR（TXN）附近控制航空器高度为 5700 m 或 6300 m 并移交杭州进近进行排序，最小水平间隔由 ATC 指定。

- 当航空器由 A599 航路经 ELNEX 落地杭州时，上海区域应在衢州 NDB（SR）附近控制航空器高度为 5100 m 或 5700 m 并移交杭州进近进行排序，最小水平间隔由 ATC 指定。
- 当航空器由 A470 航路经 UGAGO 落地杭州时，上海区域应在 AKEKO 附近控制航空器高度为 6000 m/6600 m 并移交杭州进近进行排序，最小水平间隔由 ATC 指定。

- IGRAT 方向和 SUPAR/OKTUG 方向进离港航空器移交高度由 ATC 另行指定。

### 5.5 温州终端区

由于温州 BEGMO 以及 OKATO 的程序限高高于本 SOP 移交高度，实际运行时，管制员在给予下高指令前应视情况取消航空器程序高度限制。

- 当航空器落地机场为 ZSWZ 时，按照下表移交：

|  进场点   |     移交点     | 移交高度 |
| :-------: | :------------: | :------: |
|   BEGMO   | BEGMO 前 10 nm |  6000 m  |
|   OKATO   | OKATO 前 10 nm |  6000 m  |
| SHZ(嵊州) | REMIM 前 10 nm |  6000 m  |
| BZ(云和)  |  BZ 前 10 nm   |  6300 m  |
| LJG(连江) | RUPOX 前 10 nm |  6300 m  |

## 6. 区域移交

### 6.1 北京飞行情报区

经由黄城 VOR（HCH）、W200、DOVIV 前往北京方向的航空器，过 DOVIV 移交北京 ACC 高度为 8400 m。

经由 A593 前往北京方向航空器，高度 7800 m（含）以上，应在 UDINO-DPX（邳县）移交至北京 ACC；高度 7800 m(不含）以下的航空器，移交至济南 ACC。航空器移交最高高度不高于 12200 m。

B208 往阜阳方向落地郑州的航空器应在阜阳前 10-15 海里移交下一个管制单位，高度 7800 m（不含）以下。

### 6.2 青岛 ACC

经 B221 落地青岛航空器应在 VEVED 前 10-15 海里移交青岛进近，高度 6000 m。

管制员应当在条件允许的情况下对落地青岛的航空器进行地景确认，以保证机组知晓其落地的应是胶东机场而非流亭机场。

### 6.3 广州 ACC

上海 ACC22 扇实际归属广州 ACC 管辖。

经由上海 ACC 落地揭阳潮汕、梅州梅县等机场的航空器不需要联系广州 ACC（汕头进近或 ZGZU_CTR 在线时除外）。

### 6.4 仁川 ACC

根据本文档公布时生效的 LoA 规定，上海 ACC03 扇划归仁川管辖，上海 ACC 应在 LAMEN 前 10 海里移交出境航空器给仁川区调，采用英制单数高度层。

仁川区调常见的上线呼号为 RKRR_A_CTR，A 意为“All”，即该席位包含整个仁川飞行情报区。当仁川区调进行分扇时，区域呼号可能会有不同。如管制员对移交单位有困惑，请询问对应管制单位。

### 6.5 台北飞行情报区

根据本文档公布时生效的 LoA 规定：

经由 B591 前往台北飞行情报区的航空器在 KASKA 前 10 海里移交，高度 FL300 或 FL320。

经由 R596 前往台北飞行情报区的航空器在 SULEM 前 10 海里移交，高度 FL240、FL280 或 FL340。

经由 R200 向东前往台北飞行情报区的航空器在 OLDID 前 10 海里移交，高度以实际协调为准。

当航空器在 M503 航路运行时，应遵守严格的航路使用规定，具体参见重点空域运行细则。

### 6.6 香港飞行情报区

上海区调负责由 DOTMI（A470 航路）和 LELIM（M503 航路）进入香港飞行情报区的航空器的移交。具体移交方式参见 LoA。

## 7. 重点空域运行规则

### 7.1 A326 航路

A326 航路实施“北双南单”运行。即：

- 航空器经由 A326 航路北上时，使用双数米制高度层。
- 航空器经由 A326 航路南下时，使用单数米制高度层。

### 7.2 B221 和 W108 航路

B221 和 W108 航路均为单向运行。即：

- B221 航路仅供向北单向使用，使用单数米制高度层。
- W108 航路仅供向南单向使用，使用双数米制高度层。

### 7.3 M503 航路(BEGMO-LELIM 段)

M503 航路限制使用高度为 8400 m（含）-12500 m（含），现实运行时 ATC 一般仅批准航空器使用 9200 m（含）以上高度。航路全段要求 GNSS 可靠。

M503 航路对航空器有严格的使用规定，在 VATSIM 中，管制员也应当根据以下规则进行管制：

- 当航空器位于金门 TMA 水平边界内时，高度 8400 m（含）以上航空器由上海区域管制，FL160（含）以下由高雄进近管制，FL160-8400 m 禁止任何航空器巡航。

- 当航空器位于马祖 TMA 水平边界内时，高度 8400 m（含）以上航空器由上海区域管制，FL200（含）以下由台北进近管制，FL200-8400 m 禁止任何航空器巡航。

- 航空器由 M503 向北飞行时，严格沿航路飞行，禁止向东侧偏航。

- 航空器由 M503 向南飞行时，在 PONEN-LELIM 航段，航空器必须向西偏置 6 海里。如航空器不具有偏置能力，应由管制员雷达引导进行偏置。

### 7.4 AKARA-福江空中走廊.

VATPRC 不对进入或即将进入 AKARA-福江空中走廊的航空器提供管制服务，也不对即将进入走廊的航空器飞行高度做出任何限制。VATSIM 中，走廊内航空器由仁川 ACC 和福冈 ACC 提供管制服务。管制员只需将航空器在到达 LAMEN 前 10 海里移交仁川区调或者守听咨询频率。

上海区域 03 扇(A593 LAMEN-SADLI 航段)在 VATSIM 中属于仁川区域管制范围。当仁川区域不在线且有航空器由 LAMEN 进入上海飞行情报区时，请勿提前向航空器发送.contactme 指令，最佳的时机为机组到达 LAMEN 前 10-15海里。

当本小节内容与 LoA 有不一致时，以最新生效的 LoA 为准。

![9c08ceaf228476ebe1aa8a5d2c5a2c1a](https://github.com/user-attachments/assets/ddce7838-45a2-42ce-af3d-956151e8fbe1)

图 2: AKARA-福江空中走廊示意图

### 7.5 R200 航路.

上海ACC管制范围包括R200航路AVBEP-OLDID航段。

![41f56737bc915c8bc3d6aed0f29e0822](https://github.com/user-attachments/assets/09e15727-d106-4b44-bb4c-ea653bd3e01d)

图 3: R200 航路 AVBEP-OLDID 航段示意图

## 8. 附录

### 8.1 金门、马祖终端管制区范围

金门终端管制区范围由以下坐标所围成，垂直范围 GND-FL160（含）；FL160-8400 m 空域为缓冲区，禁止任何航空器巡航。

N24.32.27 E118.17.32

N24.32.38 E118.22.07

N24.29.22 E118.32.22

N24.16.56 E118.50.39

N24.00.51 E118.37.34

N24.06.32 E118.14.20

N24.22.06 E118.07.01

N24.32.27 E118.17.32

![0b620e93c18d1f712130c548bb170920](https://github.com/user-attachments/assets/f76857c2-a008-4ab5-af43-d143e0725264)

图 4: 金门 TMA 空域示意图

马祖终端管制区范围由以下坐标所围成，垂直范围 GND-FL200；FL200-8400 m 空域为缓冲区，禁止任何航空器巡航。

N26.20.36 E120.00.00

N26.14.39 E120.28.30

N26.09.39 E120.28.01

N25.56.14 E120.22.27

N25.50.31 E120.17.55

N25.57.20 E120.07.32

N25.52.55 E119.55.37

N25.59.03 E119.45.55

N26.07.50 E119.45.26

N26.20.36 E120.00.00

图 5: 马祖 TMA 空域示意图

# 快速参考表

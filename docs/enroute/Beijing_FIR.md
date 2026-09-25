# 北京飞行情报区区域管制标准运行程序

## 1. 总则

### 1.1 根据

为了确保 VATPRC 管辖范围内的北京飞行情报区实现安全、合规和高效的运行，依据中国民用航空局（CAAC）发布的[《中华人民共和国航空资料汇编》](https://www.eaipchina.cn)，结合 VATPRC 的实际运行情况，制定了适用于北京飞行情报区区域管制的标准运行程序。

### 1.2 原则

管制员上线时需遵守 [VATSIM Code of Conduct (COC)](https://vatsim.net/docs/policy/code-of-conduct) ，并积极与其他管制员协调以达成一致认知。需要实施与本文件不一致的运行方式时，需与相关管制员协调达成一致后实施。

### 1.3 适用范围

本文件的使用范围是 VATPRC 管辖内北京飞行情报区。

> [!WARNING]
>
> 本文件严禁用于真实运行!

## 2. 运行信息

### 2.1 最小雷达间隔

#### 2.1.1 最小水平雷达间隔

北京区域管制区与呼和浩特区域管制区的航空器最小水平雷达管制间隔为9.3公里。

#### 2.1.2 最小垂直雷达间隔

北京区域管制区与呼和浩特区域管制区的航空器最小垂直雷达管制间隔为300米。

### 2.2 最小移交间隔

最小移交间隔应根据当日运行与空域特点，进行临时协调并达成一致。

## 3. 席位划分

### 3.1 登录信息

#### 3.1.1 北京区域管制区

|   登录名    |            呼号            |  频率   |
| :---------: | :------------------------: | :-----: |
|  ZBAA_CTR   | 北京区域 / Beijing Control | 128.300 |
| ZBAA_E_CTR  | 北京区域 / Beijing Control | 120.350 |
| ZBAA_E1_CTR | 北京区域 / Beijing Control | 125.900 |
| ZBAA_E2_CTR | 北京区域 / Beijing Control | 125.600 |
| ZBAA_W_CTR  | 北京区域 / Beijing Control | 128.100 |
| ZBAA_W1_CTR | 北京区域 / Beijing Control | 124.550 |
| ZBAA_W2_CTR | 北京区域 / Beijing Control | 126.700 |
| ZBAA_N_CTR  | 北京区域 / Beijing Control | 133.025 |
| ZBAA_N1_CTR | 北京区域 / Beijing Control | 127.700 |
| ZBAA_S_CTR  | 北京区域 / Beijing Control | 127.350 |
| ZBAA_S1_CTR | 北京区域 / Beijing Control | 126.950 |

#### 3.1.2 呼和浩特区域管制区

|   登录名   |             呼号              |  频率   |
| :--------: | :---------------------------: | :-----: |
|  ZBHH_CTR  | 呼和浩特区域 / Hohhot Control | 133.700 |
| ZBHH_W_CTR | 呼和浩特区域 / Hohhot Control | 119.325 |

### 3.2 席位开设规则

#### 3.2.1 北京区域管制区合扇

|  登录名  |  频率   |    职责范围    |
| :------: | :-----: | :------------: |
| ZBAA_CTR | 128.300 | 北京区域管制区 |

#### 3.2.2 北京区域管制区分扇

> [!NOTE]
>
> - 当ZBAA_CTR在线时，经ZBAA_CTR同意后可开设ZBAA_\{i}\_CTR。
>
> - ZBAA\_{i, j}\_CTR为ZBAA_\{i}\_CTR的分扇，仅当ZBAA\_{i}\_CTR在线时，经ZBAA\_{i}\_CTR同意后可开设ZBAA\_{i, j}\_CTR。
>
> - 当ZBAA\_{i, j}\_CTR不在线时，ZBAA\_{i}\_CTR对其提供管制服务。

|   登录名    |  频率   |         职责范围          |
| :---------: | :-----: | :-----------------------: |
| ZBAA_E_CTR  | 120.350 |     AR17/18/19/39/40      |
| ZBAA_E1_CTR | 125.900 |        AR02/03/04         |
| ZBAA_E2_CTR | 125.600 |        AR20/21/22         |
| ZBAA_W_CTR  | 128.100 | AR12/13/14/15/16/36/37/42 |
| ZBAA_W1_CTR | 124.550 |     AR05/06/32/35/41      |
| ZBAA_W2_CTR | 126.700 |     AR09/10/11/33/34      |
| ZBAA_N_CTR  | 133.025 |           AR01            |
| ZBAA_N1_CTR | 127.700 |          AR07/08          |
| ZBAA_S_CTR  | 127.350 |          AR23/24          |
| ZBAA_S1_CTR | 126.950 | AR25/26/27/28/29/30/31/38 |

#### 3.2.3 呼和浩特区域管制区

> [!NOTE]
>
> - ZBHH_W_CTR为ZBHH_CTR的分扇，仅当ZBHH_CTR在线时，经ZBHH_CTR同意后可开设ZBHH_W_CTR。
>
> - 当ZBHH_W_CTR不在线时，ZBHH_CTR对其提供管制服务。

|   登录名   |  频率   | 职责范围 |
| :--------: | :-----: | :------: |
|  ZBHH_CTR  | 133.700 | AR01/04  |
| ZBHH_W_CTR | 119.325 | AR02/03  |

## 4. 移交协议

> [!IMPORTANT]
>
> 1) 一般情况下，在1.3小节中所述的适用范围内，应执行以下移交协议。任何未包含在移交协议中的飞行活动，或偏离移交协议的飞行活动均应通过语音、管制员客户端内置聊天等方式进行协调。
> 2) 航空器应在下述移交协议中分配的高度层进行移交。若航空器当前巡航高度低于移交程序中分配的高度层，在保证无潜在冲突的情况下，则可在较低的高度层进行移交。否则，该飞行活动必须进行协调。
> 
>3. 当3.2小节中所述的分扇不在线时，以下程序同样适用于负责该分扇的上一级管制席位。
> 4. 当移交协议中的“下一席位”不在线时，应当移交给当前负责该扇区的上一级管制席位。管制席位归属参见 [VATPRC塔台及进近管制席位归属列表](https://community.vatprc.net/t/topic/8796)。

### 4.1 北京区域东扇

#### 4.1.1 ZBAA_E_CTR

<table style="text-align:center; border-collapse:collapse" border="1" cellpadding="6">
  <thead>
    <tr>
      <th>落地机场</th>
      <th>移交位置</th>
      <th>高度分配</th>
      <th>特殊条件</th>
      <th>下一席位</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="2">ZBAA</td>
      <td rowspan="4">AVBOX</td>
      <td rowspan="2">5100/5400</td>
      <td>-</td>
      <td>ZBAA_APP</td>
    </tr>
    <tr>
      <td>经由AVBO7X</td>
      <td rowspan="2">ZBAA_S_APP</td>
    </tr>
    <tr>
      <td>ZBAD</td>
      <td>3600/3900</td>
      <td>-</td>
    </tr>
    <tr>
      <td>ZBTJ</td>
      <td>2700/3000</td>
      <td>-</td>
      <td>ZBTJ_APP</td>
    </tr>
    <tr>
      <td>ZBYN</td>
      <td rowspan="2">PEGSO</td>
      <td>7800/8400</td>
      <td>-</td>
      <td rowspan="3">ZBAA_W_CTR</td>
    </tr>
    <tr>
      <td rowspan="2">ZBSJ</td>
      <td>6600</td>
      <td>-</td>
    </tr>
    <tr>
      <td>LOVTI前30km</td>
      <td>5400/6000</td>
      <td>-</td>
    </tr>
    <tr>
      <td rowspan="2">ZSJN</td>
      <td rowspan="2">PANKI</td>
      <td>3900/4500</td>
      <td>运行跑道为01</td>
      <td rowspan="2">ZSJN_APP</td>
    </tr>
    <tr>
      <td>2100/2400</td>
      <td>运行跑道为19</td>
    </tr>
    <tr>
      <td>ZYTL</td>
      <td rowspan="2">MUGLO</td>
      <td rowspan="2">6900/7500</td>
      <td>-</td>
      <td rowspan="2">ZBAA_E2_CTR</td>
    </tr>
    <tr>
      <td>ZSQD</td>
      <td>-</td>
    </tr>
  </tbody>
</table>

#### 4.1.2 ZBAA_E1_CTR

<table style="text-align:center; border-collapse:collapse" border="1" cellpadding="6">
  <thead>
    <tr>
      <th>落地机场</th>
      <th>移交位置</th>
      <th>高度分配</th>
      <th>特殊条件</th>
      <th>下一席位</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ZBAA</td>
      <td>OSUBA</td>
      <td>3600/3900</td>
      <td>-</td>
      <td rowspan="3">ZBAA_APP</td>
    </tr>
    <tr>
      <td>ZBAD</td>
      <td rowspan="2">BUMDU</td>
      <td>4800/5100</td>
      <td>-</td>
    </tr>
    <tr>
      <td>ZBTJ</td>
      <td>5700/6000</td>
      <td>-</td>
    </tr>
    <tr>
      <td>ZBSJ</td>
      <td rowspan="2">SOTMU前30km</td>
      <td>7800/8400</td>
      <td>-</td>
      <td rowspan="2">ZBAA_E_CTR</td>
    </tr>
    <tr>
      <td>ZSJN</td>
      <td>7500/8100</td>
      <td>-</td>
    </tr>
    <tr>
      <td rowspan="2">ZBHH</td>
      <td>AVLAP</td>
      <td>临时协调</td>
      <td>-</td>
      <td>ZBAA_W1_CTR</td>
    </tr>
    <tr>
      <td>UPREK</td>
      <td>7800</td>
      <td>-</td>
      <td>ZBHH_CTR</td>
    </tr>
  </tbody>
</table>
#### 4.1.3 ZBAA_E2_CTR

<table style="text-align:center; border-collapse:collapse" border="1" cellpadding="6">
  <thead>
    <tr>
      <th>落地机场</th>
      <th>移交位置</th>
      <th>高度分配</th>
      <th>特殊条件</th>
      <th>下一席位</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ZBAA</td>
      <td rowspan="4">DUMAP</td>
      <td>5100/5400</td>
      <td>-</td>
      <td>ZBAA_APP</td>
    </tr>
    <tr>
      <td>ZBAD</td>
      <td>3600/3900</td>
      <td>-</td>
      <td rowspan="2">ZBTJ_APP</td>
    </tr>
    <tr>
      <td>ZBTJ</td>
      <td>2700/3000</td>
      <td>-</td>
    </tr>
    <tr>
      <td>ZBSJ</td>
      <td>7200/7800</td>
      <td>-</td>
      <td>ZBAA_E_CTR</td>
    </tr>
    <tr>
      <td>ZBAA,ZBAD,ZBTJ</td>
      <td>OPIMU前80km</td>
      <td>临时协调</td>
      <td>-</td>
      <td>ZBAA_E1_CTR</td>
    </tr>
    <tr>
      <td>ZYTL</td>
      <td>ANRAT</td>
      <td>6300</td>
      <td>-</td>
      <td rowspan="2">ZYTL_CTR</td>
    </tr>
    <tr>
      <td>ZSQD</td>
      <td>USAGA</td>
      <td>6900/7500</td>
      <td>-</td>
    </tr>
  </tbody>
</table>

### 4.2 北京区域西扇

#### 4.2.1 ZBAA_W_CTR

<table style="text-align:center; border-collapse:collapse" border="1" cellpadding="6">
  <thead>
    <tr>
      <th>落地机场</th>
      <th>移交位置</th>
      <th>高度分配</th>
      <th>特殊条件</th>
      <th>下一席位</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ZBAA</td>
      <td>DUGEB</td>
      <td>5100/5400</td>
      <td>-</td>
      <td rowspan="2">ZBAA_S_APP</td>
    </tr>
    <tr>
      <td>ZBAD</td>
      <td>BELAX</td>
      <td>3600/3900</td>
      <td>-</td>
    </tr>
    <tr>
      <td>ZBTJ</td>
      <td>AVBOX</td>
      <td>2700/3000</td>
      <td>经由OMDEK STARs</td>
      <td>ZBTJ_APP</td>
    </tr>
    <tr>
      <td rowspan="3">ZBSJ</td>
      <td>IDGIS</td>
      <td>3000/3600</td>
      <td>-</td>
      <td rowspan="3">ZBSJ_APP</td>
    </tr>
    <tr>
      <td>AVLIS</td>
      <td rowspan="2">3900</td>
      <td>-</td>
    </tr>
    <tr>
      <td>LIKIT</td>
      <td>-</td>
    </tr>
    <tr>
      <td>ZBYN</td>
      <td rowspan="2">ADBES</td>
      <td>5400/6000</td>
      <td>-</td>
      <td rowspan="2">ZBAA_W2_CTR</td>
    </tr>
    <tr>
      <td>ZBHH</td>
      <td>临时协调</td>
      <td>-</td>
    </tr>
    <tr>
      <td rowspan="2">ZYTL</td>
      <td>BELAX</td>
      <td rowspan="2">7500/8100</td>
      <td>-</td>
      <td rowspan="2">ZBAA_E_CTR</td>
    </tr>
    <tr>
      <td>DUGEB</td>
      <td>-</td>
    </tr>
  </tbody>
</table>
#### 4.2.2 ZBAA_W1_CTR

<table style="text-align:center; border-collapse:collapse" border="1" cellpadding="6">
  <thead>
    <tr>
      <th>落地机场</th>
      <th>移交位置</th>
      <th>高度分配</th>
      <th>特殊条件</th>
      <th>下一席位</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ZBAA</td>
      <td rowspan="2">GUVBA</td>
      <td>4200/4500</td>
      <td>-</td>
      <td rowspan="3">ZBAA_W_APP</td>
    </tr>
    <tr>
      <td>ZBTJ</td>
      <td>5700/6000</td>
      <td>-</td>
    </tr>
    <tr>
      <td>ZBAD</td>
      <td>ELAPU</td>
      <td>3900/4200</td>
      <td>-</td>
    </tr>
    <tr>
      <td>ZBSJ</td>
      <td>VAKDA</td>
      <td>3600</td>
      <td>-</td>
      <td>ZBSJ_APP</td>
    </tr>
    <tr>
      <td>ZBYN</td>
      <td rowspan="3">NOMAX</td>
      <td>3600/4200</td>
      <td>-</td>
      <td>ZBYN_APP</td>
    </tr>
    <tr>
      <td>ZBSJ</td>
      <td>6300/6900</td>
      <td>-</td>
      <td rowspan="3">ZBAA_W2_CTR</td>
    </tr>
    <tr>
      <td>ZHCC</td>
      <td>8900</td>
      <td>-</td>
    </tr>
    <tr>
      <td>ZBYN</td>
      <td>APEXU前30km</td>
      <td>5400/6000</td>
      <td>-</td>
    </tr>
    <tr>
      <td rowspan="2">ZBHH</td>
      <td>LUGVU</td>
      <td>4800/5400</td>
      <td>-</td>
      <td rowspan="2">ZBHH_APP</td>
    </tr>
    <tr>
      <td>LAXIB前60km</td>
      <td>5100/5700</td>
      <td>经由TODAM STARs</td>
    </tr>
    <tr>
      <td>ZSJN</td>
      <td>HUR前50km</td>
      <td>8100/8900</td>
      <td>-</td>
      <td>ZBAA_E1_CTR</td>
    </tr>
  </tbody>
</table>
#### 4.2.3 ZBAA_W2_CTR

<table style="text-align:center; border-collapse:collapse" border="1" cellpadding="6">
  <thead>
    <tr>
      <th>落地机场</th>
      <th>移交位置</th>
      <th>高度分配</th>
      <th>特殊条件</th>
      <th>下一席位</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ZBAA</td>
      <td rowspan="4">TONOV</td>
      <td>8900/9500</td>
      <td>-</td>
      <td rowspan="3">ZBAA_W_CTR</td>
    </tr>
    <tr>
      <td>ZBAD</td>
      <td>7500/8100</td>
      <td>-</td>
    </tr>
    <tr>
      <td>ZBTJ</td>
      <td>6900/7500</td>
      <td>-</td>
    </tr>
    <tr>
      <td>ZBSJ</td>
      <td>3000/3900</td>
      <td>-</td>
      <td>ZBSJ_APP</td>
    </tr>
    <tr>
      <td>ZBAA</td>
      <td>AKDOM</td>
      <td>临时协调</td>
      <td>-</td>
      <td rowspan="2">ZBAA_W1_CTR</td>
    </tr>
    <tr>
      <td>ZBHH</td>
      <td>NOMAX前20km</td>
      <td>7200/7800</td>
      <td>-</td>
    </tr>
    <tr>
      <td rowspan="3">ZBYN</td>
      <td>ANPIG</td>
      <td>3600/4200</td>
      <td>-</td>
      <td rowspan="3">ZBYN_APP</td>
    </tr>
    <tr>
      <td>BISAL</td>
      <td>3900/4500</td>
      <td>-</td>
    </tr>
    <tr>
      <td>TOKUD</td>
      <td>3600/4200</td>
      <td>-</td>
    </tr>
    <tr>
      <td>ZBYC</td>
      <td>BIVAT</td>
      <td>6600/7200</td>
      <td>-</td>
      <td rowspan="2">ZLXY_CTR</td>
    </tr>
    <tr>
      <td>ZLIC</td>
      <td>OMKAK</td>
      <td>7800/8400</td>
      <td>-</td>
    </tr>
    <tr>
      <td>ZSJN</td>
      <td rowspan="2">PADNO</td>
      <td>7500</td>
      <td>-</td>
      <td rowspan="2">ZHCC_CTR</td>
    </tr>
    <tr>
      <td>ZHCC</td>
      <td>5700/6300</td>
      <td>-</td>
    </tr>
  </tbody>
</table>
### 4.3 北京区域北扇

#### 4.3.1 ZBAA_N_CTR

<table style="text-align:center; border-collapse:collapse" border="1" cellpadding="6">
  <thead>
    <tr>
      <th>落地机场</th>
      <th>移交位置</th>
      <th>高度分配</th>
      <th>特殊条件</th>
      <th>下一席位</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ZBAA</td>
      <td rowspan="2">EMVEM</td>
      <td>8100/8900</td>
      <td>-</td>
      <td rowspan="3">ZBAA_W1_CTR</td>
    </tr>
    <tr>
      <td>ZBTJ</td>
      <td>临时协调</td>
      <td>-</td>
    </tr>
    <tr>
      <td>ZBAD</td>
      <td>ESNUK</td>
      <td>8100/8900</td>
      <td>-</td>
    </tr>
  </tbody>
</table>
#### 4.3.2 ZBAA_N1_CTR

<table style="text-align:center; border-collapse:collapse" border="1" cellpadding="6">
  <thead>
    <tr>
      <th>落地机场</th>
      <th>移交位置</th>
      <th>高度分配</th>
      <th>特殊条件</th>
      <th>下一席位</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ZBAA</td>
      <td rowspan="2">LUGVU</td>
      <td>9500/10100</td>
      <td>-</td>
      <td rowspan="4">ZBAA_W1_CTR</td>
    </tr>
    <tr>
      <td>ZBTJ</td>
      <td>临时协调</td>
      <td>-</td>
    </tr>
    <tr>
      <td>ZBAD</td>
      <td>ISGID</td>
      <td>9500/10100</td>
      <td>-</td>
    </tr>
    <tr>
      <td>ZBYN</td>
      <td>DUBUB</td>
      <td>8100</td>
      <td>-</td>
    </tr>
    <tr>
      <td>ZLIC</td>
      <td>UGPOR</td>
      <td>7800</td>
      <td>-</td>
      <td>ZBHH_W_CTR</td>
    </tr>
  </tbody>
</table>
### 4.4 北京区域南扇

#### 4.4.1 ZBAA_S_CTR

<table style="text-align:center; border-collapse:collapse" border="1" cellpadding="6">
  <thead>
    <tr>
      <th>落地机场</th>
      <th>移交位置</th>
      <th>高度分配</th>
      <th>特殊条件</th>
      <th>下一席位</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ZBAA</td>
      <td rowspan="4">TUMLO</td>
      <td>8400/9200</td>
      <td>-</td>
      <td rowspan="4">ZBAA_E_CTR</td>
    </tr>
    <tr>
      <td>ZBAD</td>
      <td rowspan="3">7800/8400</td>
      <td>-</td>
    </tr>
    <tr>
      <td>ZBTJ</td>
      <td>-</td>
    </tr>
    <tr>
      <td>ZBSJ</td>
      <td>-</td>
    </tr>
    <tr>
      <td>ZHCC</td>
      <td colspan="2">临时协调</td>
      <td>经由W4</td>
      <td>ZSJN_CTR</td>
    </tr>
    <tr>
      <td>ZSQD</td>
      <td>YQG</td>
      <td rowspan="2">8100</td>
      <td>-</td>
      <td>ZSJN_E_CTR</td>
    </tr>
    <tr>
      <td>ZSOF</td>
      <td>ONAXU</td>
      <td>-</td>
      <td>ZSOF_CTR</td>
    </tr>
  </tbody>
</table>


#### 4.4.2 ZBAA_S1_CTR

<table style="text-align:center; border-collapse:collapse" border="1" cellpadding="6">
  <thead>
    <tr>
      <th>落地机场</th>
      <th>移交位置</th>
      <th>高度分配</th>
      <th>特殊条件</th>
      <th>下一席位</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ZBAA</td>
      <td rowspan="4">ORODO</td>
      <td>9500/10100</td>
      <td>-</td>
      <td rowspan="4">ZBAA_W_CTR</td>
    </tr>
    <tr>
      <td>ZBAD</td>
      <td>8900/9500</td>
      <td>-</td>
    </tr>
    <tr>
      <td>ZBTJ</td>
      <td>8100/8900</td>
      <td>-</td>
    </tr>
    <tr>
      <td>ZBSJ</td>
      <td>7500/8100</td>
      <td>-</td>
    </tr>
    <tr>
      <td>ZBYN</td>
      <td>PADNO</td>
      <td>7200/7800</td>
      <td>-</td>
      <td>ZBAA_W2_CTR</td>
    </tr>
    <tr>
      <td>ZSJN</td>
      <td colspan="2">临时协调</td>
      <td>经由W59</td>
      <td>ZSJN_CTR</td>
    </tr>
    <tr>
      <td rowspan="2">ZHHH,ZHEC</td>
      <td>ML</td>
      <td>7800</td>
      <td>-</td>
      <td>ZHHH_CTR</td>
    </tr>
    <tr>
      <td colspan="2">临时协调</td>
      <td>经由W37</td>
      <td>ZHCC_CTR</td>
    </tr>
  </tbody>
</table>
### 4.5 呼和浩特区域

#### 4.5.1 ZBHH_CTR

<table style="text-align:center; border-collapse:collapse" border="1" cellpadding="6">
  <thead>
    <tr>
      <th>落地机场</th>
      <th>移交位置</th>
      <th>高度分配</th>
      <th>特殊条件</th>
      <th>下一席位</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ZBAA</td>
      <td rowspan="3">URGOM</td>
      <td>5700/6300</td>
      <td rowspan="3">经由W52</td>
      <td rowspan="3">ZBAA_E1_CTR</td>
    </tr>
    <tr>
      <td>ZBAD</td>
      <td>6300/6900</td>
    </tr>
    <tr>
      <td>ZBTJ</td>
      <td>6900/7500</td>
    </tr>
    <tr>
      <td rowspan="2">ZBHH</td>
      <td>HH615前60km</td>
      <td rowspan="2">4800/5400</td>
      <td>运行跑道为08<br>经由TMR STARs</td>
      <td rowspan="2">ZBHH_APP</td>
    </tr>
    <tr>
      <td>IGPAS</td>
      <td>运行跑道为26<br>经由TMR STARs</td>
    </tr>
  </tbody>
</table>

#### 4.5.2 ZBHH_W_CTR

<table style="text-align:center; border-collapse:collapse" border="1" cellpadding="6">
  <thead>
    <tr>
      <th>落地机场</th>
      <th>移交位置</th>
      <th>高度分配</th>
      <th>特殊条件</th>
      <th>下一席位</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="2">ZBHH</td>
      <td rowspan="2">RUSER前20km</td>
      <td>3900/4500</td>
      <td>运行跑道为08<br>经由VALNI STARs</td>
      <td rowspan="2">ZBHH_APP</td>
    </tr>
    <tr>
      <td>5100/5700</td>
      <td>运行跑道为26<br>经由VALNI STARs</td>
    </tr>
    <tr>
      <td rowspan="3">ZBDS</td>
      <td>DS601</td>
      <td>3000/3600</td>
      <td>经由ALGOV STARs</td>
      <td rowspan="3">ZBDS_TWR</td>
    </tr>
    <tr>
      <td>VEXEB前20km</td>
      <td>2700/3600</td>
      <td>经由UGPOR STARs</td>
    </tr>
    <tr>
      <td>DS606</td>
      <td>2700/3600</td>
      <td>经由VIKON STARs</td>
    </tr>
    <tr>
      <td>ZLIC</td>
      <td>P620</td>
      <td>6600/7200</td>
      <td>-</td>
      <td>ZLLL_CTR</td>
    </tr>
  </tbody>
</table>

## 5. 移交程序

> [!IMPORTANT]
>
> 任何移交应保证2.1与2.2小节中所述的间隔标准，并保证被移交的航空器与接收方空域内既存或潜在目标无任何冲突可能。
>
> 当管制员通过管制员客户端的相应功能发起标牌移交后，除冲突解脱之外，不得改变被移交航空器的航行诸元。若出现冲突，在冲突解脱后，应及时与下一扇区协调。

### 5.1 一般移交程序

除非管制员之间另有其他移交要求并且双方达成一致，则需要按照以下程序进行移交：

1. 上一席位通过管制员客户端的相应功能发起标牌移交
2. 下一席位通过管制员客户端的相应功能接收标牌
3. 上一席位通过语音或文字指挥被移交的航空器联系下一席位频率
4. 航空器通过语音或文字在下一席位的频率中建立双向通讯，该移交程序完成

### 5.2 静默移交程序

在管制员双方达成一致后，可中止5.1小节所述的移交程序，并执行该小节的移交程序。

静默移交程序如下：

1. 上一席位通过管制员客户端的相应功能发起标牌移交
2. 上一席位通过语音或文字指挥被移交的航空器联系下一席位频率
3. 航空器通过语音或文字在下一席位的频率中建立双向通讯
4. 下一席位通过管制员客户端的相应功能接收标牌，该移交程序完成

### 5.3 特殊移交程序

- 当管制员需要将当前席位设置为 \> .break \< 状态时，需要通过ATC频道或其他方式告知其他管制员并中止5.1或5.2小节中的移交程序；在取消 \> .break \< 状态后，需要及时告知其他管制员并恢复5.1或5.2小节中的移交程序。
- 若因空域内容量饱和或其他特殊情况，有必要减少或暂缓移交，应至少提前10分钟告知其他管制员并及时协调后续方案。当移交被暂停时，5.1与5.2小节中的移交程序也随之暂停。
- 执行未列出的特殊移交程序，应通过临时协调并保证双方达成一致。

### 5.4  二次雷达编码分配

移交应保证航空器具有有效的二次雷达编码。若需要改变航空器二次雷达编码，需要先完成5.1或5.2小节中的移交程序。

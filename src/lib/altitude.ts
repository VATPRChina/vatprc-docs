const CHINA_RVSM_METERS_BY_FEET = new Map([
  [2_000, 600],
  [3_000, 900],
  [3_900, 1_200],
  [4_900, 1_500],
  [5_900, 1_800],
  [6_900, 2_100],
  [7_900, 2_400],
  [8_900, 2_700],
  [9_800, 3_000],
  [10_800, 3_300],
  [11_800, 3_600],
  [12_800, 3_900],
  [13_800, 4_200],
  [14_800, 4_500],
  [15_700, 4_800],
  [16_700, 5_100],
  [17_700, 5_400],
  [18_700, 5_700],
  [19_700, 6_000],
  [20_700, 6_300],
  [21_700, 6_600],
  [22_600, 6_900],
  [23_600, 7_200],
  [24_600, 7_500],
  [25_600, 7_800],
  [26_600, 8_100],
  [27_600, 8_400],
  [29_100, 8_900],
  [30_100, 9_200],
  [31_100, 9_500],
  [32_100, 9_800],
  [33_100, 10_100],
  [34_100, 10_400],
  [35_100, 10_700],
  [36_100, 11_000],
  [37_100, 11_300],
  [38_100, 11_600],
  [39_100, 11_900],
  [40_100, 12_200],
  [41_100, 12_500],
  [43_000, 13_100],
  [44_900, 13_700],
  [46_900, 14_300],
  [48_900, 14_900],
]);

export const feetToRoundedMeters = (feet: number) => Math.round((feet * 0.3048) / 100) * 100;

export const getCruisingLevelInMeters = (feet: number) => {
  const chinaRvsmMeters = CHINA_RVSM_METERS_BY_FEET.get(feet);

  return {
    meters: chinaRvsmMeters ?? feetToRoundedMeters(feet),
    isChinaRvsm: chinaRvsmMeters !== undefined,
  };
};

export const formatCruisingLevelInMeters = (feet: number) =>
  `${getCruisingLevelInMeters(feet).meters.toLocaleString()} m`;

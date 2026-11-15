import { createTheme } from "@mantine/core";

export const theme = createTheme({
  primaryColor: "vatprc",
  primaryShade: 8,
  colors: {
    vatprc: [
      "#ffebeb",
      "#fad5d5",
      "#f2a8a7",
      "#eb7877",
      "#e6504e",
      "#e33834",
      "#e22b26",
      "#c91e1a",
      "#ab1615",
      "#9d0b10",
    ],
  },
  fontFamily:
    '"Outfit", ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"',
  // CJK sans fonts before the generic keyword: otherwise Chinese glyphs in monospace
  // contexts fall through to the browser's default fixed font (SimSun on Windows).
  fontFamilyMonospace:
    'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New","PingFang SC","Microsoft YaHei","Noto Sans CJK SC",monospace',
  defaultRadius: 0,
});

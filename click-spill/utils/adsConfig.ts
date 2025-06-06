export interface AdConfig {
  id: string;
  key: string;
  format: string;
  height: number;
  width: number;
  targetContainers: string[];
  delay?: number;
  type: "hpf" | "profitable-rate";
}

export const AD_CONFIGS: AdConfig[] = [
  {
    id: "banner-728-90",
    key: "8e7f6d7e537e6b214665d01c83d9d0d3",
    format: "iframe",
    height: 90,
    width: 728,
    targetContainers: ["top-banner-ad"],
    delay: 500,
    type: "hpf",
  },
  // {
  //   id: "banner-160-600",
  //   key: "f48a5e0f10c5d62d5d92352185210be6",
  //   format: "iframe",
  //   height: 600,
  //   width: 160,
  //   targetContainers: ["left-sidebar-ad-1"],
  //   delay: 600,
  //   type: "hpf",
  // },
  {
    id: "banner-160-300",
    key: "99700a6546585755883e57e7a0e34d5d",
    format: "iframe",
    height: 300,
    width: 160,
    targetContainers: ["right-sidebar-ad-1"],
    delay: 400,
    type: "hpf",
  },
  {
    id: "banner-468-60",
    key: "e77c7f602f11df5b3e2936343c2da8b1",
    format: "iframe",
    height: 60,
    width: 460,
    targetContainers: ["bottom-banner-ad"],
    delay: 800,
    type: "hpf",
  },
  // {
  //   id: "banner-300-250",
  //   key: "e77c7f602f11df5b3e2936343c2da8b1",
  //   format: "iframe",
  //   height: 250,
  //   width: 300,
  //   targetContainers: ["left-sidebar-ad-2"],
  //   delay: 700,
  //   type: "hpf",
  // },
];

export const PROFITABLE_RATE_ADS = [
  {
    id: "profitable-rate-popunder",
    src: "//pl26847292.profitableratecpm.com/ba/c7/38/bac7387c219665b557ef784aba7be7ce.js",
  },
  {
    id: "profitable-rate-social",
    src: "//pl26848452.profitableratecpm.com/6a/ad/c0/6aadc0bc628575f4c95bad5a6ff11486.js",
  },
  {
    id: "profitable-rate-direct",
    src: "https://www.profitableratecpm.com/vx70g97er8?key=86f4eb02d1930da0e9d927837f4e84b7",
  },
];

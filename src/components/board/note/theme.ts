export interface ThemeConfig {
  bg: string;
  text: string;
  border?: string;
  tag: string;
}

export const themeConfig: Record<string, ThemeConfig> = {
  yellow: { bg: 'bg-[#fef6ca]', text: 'text-[#2d3142]', tag: 'TODO' },
  blue: { bg: 'bg-[#e3f0fe]', text: 'text-[#2f55cc]', border: 'border border-[#2f55cc]', tag: 'IDEAS' },
  pink: { bg: 'bg-[#ffcce5]', text: 'text-[#2d3142]', tag: 'WORK' },
  green: { bg: 'bg-[#c5ead1]', text: 'text-[#2d3142]', tag: 'DESIGN' },
  purple: { bg: 'bg-[#e2c1f3]', text: 'text-[#2d3142]', tag: 'TRAVEL' },
  // Premium Custom Combos
  xanthous: { bg: 'bg-[#F7B538]', text: 'text-[#780116]', tag: 'COMBO 01' },
  golden: { bg: 'bg-[#FEC700]', text: 'text-[#02462E]', tag: 'COMBO 03' },
  power: { bg: 'bg-[#C3D809]', text: 'text-[#222022]', tag: 'COMBO 04' },
  // Gradient Combos
  sunset: { bg: 'bg-gradient-to-br from-[#ffecd2] to-[#fcb69f]', text: 'text-[#5a2e1d]', tag: 'SUNSET' },
  ocean: { bg: 'bg-gradient-to-br from-[#e0c3fc] to-[#8ec5fc]', text: 'text-[#1e2a4a]', tag: 'OCEAN' },
  aurora: { bg: 'bg-gradient-to-br from-[#d4fc79] to-[#96e6a1]', text: 'text-[#1d4424]', tag: 'AURORA' }
};

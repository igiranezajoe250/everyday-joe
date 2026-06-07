// Icon set as react-native-svg components. Replaces the inline <svg> blocks
// from the web wireframe — those don't work in React Native, but react-native-svg
// renders the same primitives natively on iOS and Android (and is included in
// Expo Go SDK 54, so no dev-client build required).

import React from "react";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { ink } from "../theme/tokens";

type IconProps = { size?: number; color?: string };

export const ChevronRight = ({ size = 14, color = ink }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 8 14">
    <Path d="M1 1l6 6-6 6" stroke={color} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ChevronLeft = ({ size = 14, color = ink }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 14 14">
    <Path d="M9 2L4 7l5 5" stroke={color} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const PlusIcon = ({ size = 10, color = ink }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 10 10">
    <Path d="M5 1v8M1 5h8" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
  </Svg>
);

export const CloseIcon = ({ size = 10, color = ink }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 10 10">
    <Path d="M1 1l8 8M9 1l-8 8" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
  </Svg>
);

export const CheckIcon = ({ size = 14, color = ink }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 14 14">
    <Path d="M2 7l4 4 6-8" stroke={color} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const CheckBig = ({ size = 24, color = ink }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 22 22">
    <Path d="M4 11l5 5 9-10" stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const SearchIcon = ({ size = 14, color = ink }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 14 14">
    <Circle cx={6} cy={6} r={4.2} stroke={color} strokeWidth={1.4} fill="none" />
    <Path d="M9 9l4 4" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
  </Svg>
);

export const SortIcon = ({ size = 14, color = ink }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 14 14">
    <Path d="M2 4h10M3 7h8M4.5 10h5" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
  </Svg>
);

export const WalletIcon = ({ size = 16, color = ink }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 16 16">
    <Rect x={2} y={4} width={12} height={9} rx={1.5} stroke={color} strokeWidth={1.3} fill="none" />
    <Path d="M2 7h12" stroke={color} strokeWidth={1.3} />
    <Circle cx={11} cy={10} r={1} fill={color} />
  </Svg>
);

export const EyeIcon = ({ size = 16, color = ink }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 18 18">
    <Path d="M1 9s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z" stroke={color} strokeWidth={1.3} fill="none" strokeLinejoin="round" />
    <Circle cx={9} cy={9} r={2.2} stroke={color} strokeWidth={1.3} fill="none" />
  </Svg>
);

export const EyeOffIcon = ({ size = 16, color = ink }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 18 18">
    <Path d="M2 9s2.5-5 7-5c1.5 0 2.8.5 4 1.3M16 9s-2.5 5-7 5c-1.5 0-2.8-.5-4-1.3" stroke={color} strokeWidth={1.3} fill="none" strokeLinecap="round" />
    <Circle cx={9} cy={9} r={2.2} stroke={color} strokeWidth={1.3} fill="none" />
    <Path d="M3 3l12 12" stroke={color} strokeWidth={1.3} strokeLinecap="round" />
  </Svg>
);

export const InvestIcon = ({ size = 22, color = "#fff" }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 22 22">
    <Path d="M11 3v16M7.5 6.5c0-1.4 1.6-2.5 3.5-2.5s3.5 1.1 3.5 2.5-1.6 2.5-3.5 2.5-3.5 1.1-3.5 2.5 1.6 2.5 3.5 2.5 3.5-1.1 3.5-2.5"
      stroke={color} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ExternalLink = ({ size = 10, color = ink }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 11 11">
    <Path d="M3 8l5-5M4 3h4v4" stroke={color} strokeWidth={1.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

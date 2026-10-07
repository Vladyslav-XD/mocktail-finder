import * as React from 'react';
import Svg, { Path, G, Defs, ClipPath, Rect, SvgProps, Mask, Circle } from 'react-native-svg';

export interface IconProps extends SvgProps {
  color?: string;
  size?: number | string;
  focused?: boolean;
}

export const MapPinIcon = ({ size = 16, color = '#99A1AF', focused, ...props }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill={focused ? color : 'none'} {...props}>
    <Path
      d="M12.6668 9.33333C13.6602 8.36 14.6668 7.19333 14.6668 5.66667C14.6668 4.69421 14.2805 3.76158 13.5929 3.07394C12.9053 2.38631 11.9726 2 11.0002 2C9.82683 2 9.00016 2.33333 8.00016 3.33333C7.00016 2.33333 6.1735 2 5.00016 2C4.0277 2 3.09507 2.38631 2.40744 3.07394C1.7198 3.76158 1.3335 4.69421 1.3335 5.66667C1.3335 7.2 2.3335 8.36667 3.3335 9.33333L8.00016 14L12.6668 9.33333Z"
      stroke={color}
      strokeWidth={1.33333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SearchIcon = ({ size = 16, color = '#99A1AF', ...props }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none" {...props}>
    <Path
      d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z"
      stroke={color}
      strokeWidth={1.33333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 14L11.1333 11.1333"
      stroke={color}
      strokeWidth={1.33333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const HomeIcon = ({ size = 20, color = '#99A1AF', ...props }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none" {...props}>
    <Path
      d="M12.5 17.5V10.8333C12.5 10.6123 12.4122 10.4004 12.2559 10.2441C12.0996 10.0878 11.8877 10 11.6667 10H8.33333C8.11232 10 7.90036 10.0878 7.74408 10.2441C7.5878 10.4004 7.5 10.6123 7.5 10.8333V17.5"
      stroke={color}
      strokeWidth={2.08333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2.5 8.33322C2.49994 8.09078 2.55278 7.85124 2.65482 7.63132C2.75687 7.4114 2.90566 7.21639 3.09083 7.05989L8.92417 2.06073C9.22499 1.80648 9.60613 1.66699 10 1.66699C10.3939 1.66699 10.775 1.80648 11.0758 2.06073L16.9092 7.05989C17.0943 7.21639 17.2431 7.4114 17.3452 7.63132C17.4472 7.85124 17.5001 8.09078 17.5 8.33322V15.8332C17.5 16.2753 17.3244 16.6992 17.0118 17.0117C16.6993 17.3243 16.2754 17.4999 15.8333 17.4999H4.16667C3.72464 17.4999 3.30072 17.3243 2.98816 17.0117C2.67559 16.6992 2.5 16.2753 2.5 15.8332V8.33322Z"
      stroke={color}
      strokeWidth={2.08333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const HeartIcon = ({ size = 20, color = '#99A1AF', focused, ...props }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill={focused ? color : 'none'} {...props}>
    <Path
      d="M15.8332 11.6667C17.0748 10.45 18.3332 8.99167 18.3332 7.08333C18.3332 5.86776 17.8503 4.70197 16.9907 3.84243C16.1312 2.98289 14.9654 2.5 13.7498 2.5C12.2832 2.5 11.2498 2.91667 9.99984 4.16667C8.74984 2.91667 7.7165 2.5 6.24984 2.5C5.03426 2.5 3.86847 2.98289 3.00893 3.84243C2.14939 4.70197 1.6665 5.86776 1.6665 7.08333C1.6665 9 2.9165 10.4583 4.1665 11.6667L9.99984 17.5L15.8332 11.6667Z"
      stroke={color}
      strokeWidth={2.08333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const HeartPulseIcon = ({ size = 32, color = '#99A1AF', ...props }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...props}>
    <Path
      d="M25.3332 18.6667C27.3198 16.72 29.3332 14.3867 29.3332 11.3333C29.3332 9.38841 28.5606 7.52315 27.1853 6.14788C25.81 4.77262 23.9448 4 21.9998 4C19.6532 4 17.9998 4.66667 15.9998 6.66667C13.9998 4.66667 12.3465 4 9.99984 4C8.05492 4 6.18965 4.77262 4.81439 6.14788C3.43912 7.52315 2.6665 9.38841 2.6665 11.3333C2.6665 14.4 4.6665 16.7333 6.6665 18.6667L15.9998 28L25.3332 18.6667Z"
      stroke={color}
      strokeWidth={2.66667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16.0002 17.3332L14.6668 15.9998L17.3335 13.3332L13.3335 9.33317L16.0002 6.6665"
      stroke={color}
      strokeWidth={2.66667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ShuffleIcon = ({ size = 20, color = '#99A1AF', ...props }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none" {...props}>
    <G clipPath="url(#clip0_filter)">
      <Path
        d="M15 11.6665L18.3333 14.9998L15 18.3332"
        stroke={color}
        strokeWidth={2.08333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15 1.6665L18.3333 4.99984L15 8.33317"
        stroke={color}
        strokeWidth={2.08333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M1.6665 15.0001H3.31067C3.84941 15.0038 4.38102 14.8768 4.85996 14.6301C5.3389 14.3833 5.7509 14.0242 6.06067 13.5834L10.6057 6.41674C10.9154 5.97595 11.3274 5.61681 11.8064 5.37008C12.2853 5.12336 12.8169 4.9964 13.3557 5.00008H18.3332"
        stroke={color}
        strokeWidth={2.08333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M1.6665 5.00008H3.30984C3.93105 4.99576 4.54112 5.16512 5.0712 5.48906C5.60129 5.813 6.0303 6.27863 6.30984 6.83341"
        stroke={color}
        strokeWidth={2.08333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.3333 15H13.2992C12.753 14.9944 12.2165 14.8547 11.737 14.5932C11.2575 14.3316 10.8496 13.9562 10.5492 13.5L10.25 13.125"
        stroke={color}
        strokeWidth={2.08333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_filter">
        <Rect width="20" height="20" fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);

export const ShareIcon = ({ size = 16, color = '#364153', ...props }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none" {...props}>
    <G clipPath="url(#clip0_share)">
      <Path
        d="M12 5.3335C13.1046 5.3335 14 4.43807 14 3.3335C14 2.22893 13.1046 1.3335 12 1.3335C10.8954 1.3335 10 2.22893 10 3.3335C10 4.43807 10.8954 5.3335 12 5.3335Z"
        stroke={color}
        strokeWidth={1.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 10C5.10457 10 6 9.10457 6 8C6 6.89543 5.10457 6 4 6C2.89543 6 2 6.89543 2 8C2 9.10457 2.89543 10 4 10Z"
        stroke={color}
        strokeWidth={1.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 14.6665C13.1046 14.6665 14 13.7711 14 12.6665C14 11.5619 13.1046 10.6665 12 10.6665C10.8954 10.6665 10 11.5619 10 12.6665C10 13.7711 10.8954 14.6665 12 14.6665Z"
        stroke={color}
        strokeWidth={1.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.72656 9.00684L10.2799 11.6602"
        stroke={color}
        strokeWidth={1.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10.2732 4.33984L5.72656 6.99318"
        stroke={color}
        strokeWidth={1.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_share">
        <Rect width="16" height="16" fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);

export const ListIcon = ({ size = 24, color = '#99A1AF', focused, ...props }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01"
      stroke={focused ? color : color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const MartiniIcon = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Svg width={size} height={Number(size) * (43/24)} viewBox="0 0 24 43" fill="none" {...props}>
    <Mask id="mask0_118_3352" maskUnits="userSpaceOnUse" x="0" y="3" width="24" height="40">
      <Path d="M0 3.39844H24V42.6667H0V3.39844Z" fill="white"/>
    </Mask>
    <G mask="url(#mask0_118_3352)">
      <Path d="M23.7444 12.324C24.073 12.017 24.0866 11.5065 23.7747 11.1834C23.4624 10.8603 22.9432 10.847 22.6143 11.1537L20.6835 12.9557C19.2499 14.294 17.2708 14.9379 15.3159 14.6471C14.804 14.5709 14.3043 14.4336 13.8289 14.2247C12.7098 13.7334 11.7906 12.9026 10.6571 12.4419C9.97666 12.1652 9.25266 12.017 8.51988 11.9809L5.60688 3.87354C5.47481 3.50568 5.06444 3.31299 4.69084 3.44284C4.31696 3.57269 4.12069 3.97586 4.25276 4.34372L8.51253 16.2167L6.48813 12.1558C5.69738 12.329 4.93293 12.6198 4.24032 13.008L4.2389 13.0088C3.91932 13.1898 3.51659 13.1426 3.24905 12.8929L1.38558 11.1537C1.05695 10.847 0.537697 10.8603 0.225469 11.1834C-0.0864761 11.5065 -0.0731839 12.017 0.25573 12.324L11.1795 22.5195V40.4901C11.1795 40.5154 11.1585 40.5365 11.1328 40.537C8.50772 40.6182 6.50086 41.0612 6.50086 41.5953C6.50086 42.1873 8.96277 42.6669 12.0002 42.6669C15.0374 42.6669 17.4993 42.1873 17.4993 41.5953C17.4993 41.0612 15.4924 40.6182 12.8673 40.537C12.8416 40.5365 12.8207 40.5154 12.8207 40.4901V22.5195L23.7444 12.324Z" fill={color}/>
    </G>
  </Svg>
);

export const AddRecipeIcon = ({ size = 24, color = '#99A1AF', focused, ...props }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M12 5V19M5 12H19"
      stroke={focused ? color : color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const XIcon = ({ size = 20, color = '#99A1AF', focused, ...props }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke={focused ? color : color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const MoonIcon = ({ size = 14, color = 'white', ...props }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 14 14" fill="none" {...props}>
    <Path d="M6.83399 0.833008C6.03834 1.62866 5.59135 2.70779 5.59135 3.83301C5.59135 4.95823 6.03834 6.03736 6.83399 6.83301C7.62964 7.62866 8.70877 8.07565 9.83399 8.07565C10.9592 8.07565 12.0383 7.62866 12.834 6.83301C12.834 8.0197 12.4821 9.17973 11.8228 10.1664C11.1635 11.1531 10.2264 11.9222 9.13009 12.3763C8.03373 12.8304 6.82733 12.9492 5.66345 12.7177C4.49956 12.4862 3.43046 11.9148 2.59135 11.0756C1.75223 10.2365 1.18079 9.16744 0.949275 8.00355C0.717764 6.83966 0.836584 5.63326 1.29071 4.53691C1.74484 3.44055 2.51387 2.50348 3.50057 1.84419C4.48726 1.1849 5.6473 0.833008 6.83399 0.833008Z" stroke={color} strokeWidth={1.66667} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const SunIcon = ({ size = 16, color = 'white', ...props }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none" {...props}>
    <G clipPath="url(#clip0_120_3391)">
      <Path d="M8.00065 10.6663C9.47341 10.6663 10.6673 9.47243 10.6673 7.99967C10.6673 6.52692 9.47341 5.33301 8.00065 5.33301C6.52789 5.33301 5.33398 6.52692 5.33398 7.99967C5.33398 9.47243 6.52789 10.6663 8.00065 10.6663Z" stroke={color} strokeWidth={1.66667} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M8 1.33301V2.66634" stroke={color} strokeWidth={1.66667} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M8 13.333V14.6663" stroke={color} strokeWidth={1.66667} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M3.28711 3.28711L4.22711 4.22711" stroke={color} strokeWidth={1.66667} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M11.7734 11.7734L12.7134 12.7134" stroke={color} strokeWidth={1.66667} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M1.33398 8H2.66732" stroke={color} strokeWidth={1.66667} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M13.334 8H14.6673" stroke={color} strokeWidth={1.66667} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M4.22711 11.7734L3.28711 12.7134" stroke={color} strokeWidth={1.66667} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M12.7134 3.28711L11.7734 4.22711" stroke={color} strokeWidth={1.66667} strokeLinecap="round" strokeLinejoin="round"/>
    </G>
    <Defs>
      <ClipPath id="clip0_120_3391">
        <Rect width="16" height="16" fill="white"/>
      </ClipPath>
    </Defs>
  </Svg>
);

export const ArrowLeftIcon = ({ size = 24, color = '#FFFFFF', ...props }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const PencilIcon = ({ size = 20, color = '#99A1AF', ...props }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M16.5 3.5C16.8978 3.10218 17.4374 2.87868 18 2.87868C18.5626 2.87868 19.1022 3.10218 19.5 3.5C19.8978 3.89782 20.1213 4.43739 20.1213 5C20.1213 5.56261 19.8978 6.10218 19.5 6.5L7 19L3 20L4 16L16.5 3.5Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const TrashIcon = ({ size = 20, color = '#99A1AF', ...props }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M4 7H20M10 11V17M14 11V17M5 7L6 19C6 20.1046 6.89543 21 8 21H16C17.1046 21 18 20.1046 18 19L19 7M9 7V4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V7"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const LockIcon = ({ size = 16, color = '#99A1AF', strokeWidth = 2, ...props }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Rect x={4} y={11} width={16} height={10} rx={2} stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
    <Path d="M8 11V7a4 4 0 0 1 8 0v4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const CheckIcon = ({ size = 20, color = '#99A1AF', strokeWidth = 2.4, ...props }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path d="M20 6 9 17l-5-5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const PlusIcon = ({ size = 18, color = '#99A1AF', strokeWidth = 2.2, ...props }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const MinusIcon = ({ size = 18, color = '#99A1AF', strokeWidth = 2.2, ...props }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path d="M5 12h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const DotsIcon = ({ size = 20, color = '#FFFFFF', ...props }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} {...props}>
    <Circle cx={6} cy={12} r={1.8} />
    <Circle cx={12} cy={12} r={1.8} />
    <Circle cx={18} cy={12} r={1.8} />
  </Svg>
);

export const GlobeIcon = ({ size = 20, color = '#99A1AF', strokeWidth = 2, ...props }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={strokeWidth} />
    <Path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ThemeIcon = ({ size = 20, color = '#99A1AF', strokeWidth = 2, ...props }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ChevronRightIcon = ({ size = 18, color = '#99A1AF', strokeWidth = 2, ...props }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path d="m9 18 6-6-6-6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

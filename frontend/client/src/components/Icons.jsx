import React from 'react';

// ─── Icon Components (self-contained SVGs) ───────────────────────────────────
const icon = (paths, viewBox = '0 0 24 24') =>
  ({ size = 20, color = 'currentColor', className = '', style = {} }) =>
    <svg width={size} height={size} viewBox={viewBox} fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className} style={style}>
      {paths}
    </svg>;

export const Brain = icon(<>
  <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
  <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
  <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
  <path d="M12 18v4"/><path d="M12 2v3"/>
</>);

export const Bot = icon(<>
  <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/>
  <path d="M2 14h2"/><path d="M20 14h2"/>
  <path d="M15 13v2"/><path d="M9 13v2"/>
</>);

export const Database = icon(<>
  <ellipse cx="12" cy="5" rx="9" ry="3"/>
  <path d="M3 5V19A9 3 0 0 0 21 19V5"/>
  <path d="M3 12A9 3 0 0 0 21 12"/>
</>);

export const Search = icon(<>
  <circle cx="11" cy="11" r="8"/>
  <path d="m21 21-4.3-4.3"/>
</>);

export const Sparkles = icon(<>
  <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>
</>);

export const Upload = icon(<>
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
  <polyline points="17 8 12 3 7 8"/>
  <line x1="12" x2="12" y1="3" y2="15"/>
</>);

export const FileText = icon(<>
  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
  <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
  <path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>
</>);

export const Send = icon(<>
  <path d="m22 2-7 20-4-9-9-4Z"/>
  <path d="M22 2 11 13"/>
</>);

export const Trash = icon(<>
  <path d="M3 6h18"/>
  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
</>);

export const Layers = icon(<>
  <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/>
  <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/>
  <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>
</>);

export const Network = icon(<>
  <rect x="16" y="16" width="6" height="6" rx="1"/>
  <rect x="2" y="16" width="6" height="6" rx="1"/>
  <rect x="9" y="2" width="6" height="6" rx="1"/>
  <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/>
  <path d="M12 12V8"/>
</>);

export const CheckCircle = icon(<>
  <circle cx="12" cy="12" r="10"/>
  <path d="m9 12 2 2 4-4"/>
</>);

export const AlertCircle = icon(<>
  <circle cx="12" cy="12" r="10"/>
  <line x1="12" x2="12" y1="8" y2="12"/>
  <line x1="12" x2="12.01" y1="16" y2="16"/>
</>);

export const Refresh = icon(<>
  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
  <path d="M3 3v5h5"/>
  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
  <path d="M16 16h5v5"/>
</>);

export const Shield = icon(<>
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
</>);

export const BarChart = icon(<>
  <line x1="12" x2="12" y1="20" y2="10"/>
  <line x1="18" x2="18" y1="20" y2="4"/>
  <line x1="6" x2="6" y1="20" y2="16"/>
</>);

export const Activity = icon(<>
  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
</>);

export const LogOut = icon(<>
  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
  <polyline points="16 17 21 12 16 7"/>
  <line x1="21" x2="9" y1="12" y2="12"/>
</>);

export const User = icon(<>
  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
  <circle cx="12" cy="7" r="4"/>
</>);

export const Building = icon(<>
  <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
  <path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/>
  <path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/>
  <path d="M16 10h.01"/><path d="M16 14h.01"/>
  <path d="M8 10h.01"/><path d="M8 14h.01"/>
</>);

export const Copy = icon(<>
  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
</>);

export const Check = icon(<>
  <polyline points="20 6 9 17 4 12"/>
</>);

export const Eye = icon(<>
  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
  <circle cx="12" cy="12" r="3"/>
</>);

export const Play = icon(<>
  <polygon points="6 3 20 12 6 21 6 3"/>
</>);

export const ChevronRight = icon(<>
  <polyline points="9 18 15 12 9 6"/>
</>);

export const X = icon(<>
  <line x1="18" y1="6" x2="6" y2="18"/>
  <line x1="6" y1="6" x2="18" y2="18"/>
</>);

export const Zap = icon(<>
  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
</>);

export const Info = icon(<>
  <circle cx="12" cy="12" r="10"/>
  <path d="M12 16v-4"/><path d="M12 8h.01"/>
</>);

// ─── Aliases for compatibility ──────────────────────────────────────────────
export const IconBrain = Brain;
export const IconBot = Bot;
export const IconDatabase = Database;
export const IconSearch = Search;
export const IconSparkles = Sparkles;
export const IconUpload = Upload;
export const IconFileText = FileText;
export const IconSend = Send;
export const IconTrash = Trash;
export const IconLayers = Layers;
export const IconNetwork = Network;
export const IconCheckCircle = CheckCircle;
export const IconAlertCircle = AlertCircle;
export const IconRefresh = Refresh;
export const IconShield = Shield;
export const IconBarChart = BarChart;
export const IconActivity = Activity;
export const IconLogOut = LogOut;
export const IconUser = User;
export const IconBuilding = Building;
export const IconCopy = Copy;
export const IconCheck = Check;
export const IconEye = Eye;
export const IconPlay = Play;
export const IconChevronRight = ChevronRight;
export const IconClose = X;
export const IconX = X;
export const IconZap = Zap;
export const IconInfo = Info;


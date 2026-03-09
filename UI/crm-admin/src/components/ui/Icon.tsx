'use client';

import {
  Mail, Lock, Building2, Search, Plus, Pencil, Trash2,
  Eye, EyeOff, Download, Upload, Filter, ChevronDown,
  ChevronRight, ChevronLeft, ChevronUp, Check, X,
  MoreVertical, MoreHorizontal, Settings, User, Users,
  Phone, Calendar, Clock, Bell, AlertCircle, AlertTriangle,
  Info, CheckCircle, XCircle, ArrowLeft, ArrowRight,
  ArrowUp, ArrowDown, RefreshCw, ExternalLink, Copy,
  FileText, FileSpreadsheet, FileJson, File, Folder, Image, Paperclip, Send,
  Star, Heart, Bookmark, Flag, Tag, Hash,
  Home, BarChart2, PieChart, TrendingUp, DollarSign, IndianRupee,
  CreditCard, ShoppingCart, Package, Truck, MapPin,
  Globe, Wifi, WifiOff, Loader2, LogOut, Menu,
  Maximize2, Minimize2, Maximize, Minimize, Minus, Shrink, Expand,
  UserPlus, Grip, GripVertical, Briefcase,
  Target, Zap, Command, Keyboard, CircleHelp, LayoutGrid, History,
  Activity, Palette, Database, Shield, ShieldCheck, Monitor, Layers, Code,
  Bold, Italic, Underline,
  List, Type, Sliders, CheckSquare, MousePointer, Grid3X3, Wrench,
  GitBranch, BookOpen, Headphones,
  LayoutDashboard, StickyNote, Circle, Columns, MessageSquare, Edit3, Link2,
  Archive, Box, Map, MessageCircle, UserCheck,
  Save, AtSign, Server, Timer, Repeat, Key, Percent,
  FileClock, RotateCcw,
  Bot, Radio, UserX, Video, Cpu, Crown, Wallet, Receipt, ArrowUpCircle,
  UploadCloud, FolderPlus, Edit2, GitCommit, Share2, Cloud, FileX2, Move, Music, Table2, AlignLeft,
  Layout, Pause, Play, Square, TrendingDown, Terminal, ScrollText, Gift,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  // Navigation
  home: Home,
  menu: Menu,
  search: Search,
  filter: Filter,
  settings: Settings,
  logout: LogOut,

  // Actions
  plus: Plus,
  edit: Pencil,
  trash: Trash2,
  copy: Copy,
  download: Download,
  upload: Upload,
  send: Send,
  refresh: RefreshCw,
  'external-link': ExternalLink,
  minus: Minus,
  maximize: Maximize2,
  minimize: Minimize2,
  'maximize-2': Maximize2,
  'minimize-2': Minimize2,
  expand: Expand,
  shrink: Shrink,
  'user-plus': UserPlus,

  // Arrows & Chevrons
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'arrow-up': ArrowUp,
  'arrow-down': ArrowDown,

  // Status
  check: Check,
  x: X,
  'check-circle': CheckCircle,
  'x-circle': XCircle,
  'alert-circle': AlertCircle,
  'alert-triangle': AlertTriangle,
  info: Info,

  // User & Auth
  user: User,
  users: Users,
  mail: Mail,
  lock: Lock,
  eye: Eye,
  'eye-off': EyeOff,
  building: Building2,
  briefcase: Briefcase,

  // Communication
  phone: Phone,
  bell: Bell,

  // Time
  calendar: Calendar,
  clock: Clock,

  // Files
  file: File,
  'file-text': FileText,
  'file-spreadsheet': FileSpreadsheet,
  'file-json': FileJson,
  folder: Folder,
  image: Image,
  paperclip: Paperclip,

  // Data & Charts
  'bar-chart': BarChart2,
  'pie-chart': PieChart,
  'trending-up': TrendingUp,

  // Commerce
  'dollar-sign': DollarSign,
  'indian-rupee': IndianRupee,
  'credit-card': CreditCard,
  cart: ShoppingCart,
  package: Package,
  truck: Truck,

  // Rating & Marking
  star: Star,
  heart: Heart,
  bookmark: Bookmark,
  flag: Flag,
  tag: Tag,
  target: Target,
  hash: Hash,

  // Location
  'map-pin': MapPin,
  globe: Globe,

  // State
  wifi: Wifi,
  'wifi-off': WifiOff,
  loader: Loader2,

  // More
  'more-vertical': MoreVertical,
  'more-horizontal': MoreHorizontal,
  grip: Grip,
  'grip-vertical': GripVertical,

  // Misc
  zap: Zap,
  command: Command,
  keyboard: Keyboard,

  // Layout & History
  'layout-grid': LayoutGrid,
  history: History,

  // Developer / UI
  activity: Activity,
  palette: Palette,
  database: Database,
  shield: Shield,
  monitor: Monitor,
  layers: Layers,
  code: Code,
  bold: Bold,
  italic: Italic,
  underline: Underline,

  // Aliases (hyphenated variants used by CoreUI)
  'help-circle': CircleHelp,
  'log-out': LogOut,

  // Additional
  list: List,
  type: Type,
  sliders: Sliders,
  'check-square': CheckSquare,
  'mouse-pointer': MousePointer,
  grid: Grid3X3,
  tool: Wrench,

  // Sidebar / Navigation
  'git-branch': GitBranch,
  'book-open': BookOpen,
  headphones: Headphones,
  'trash-2': Trash2,

  // Dashboard & Layout
  'layout-dashboard': LayoutDashboard,
  'sticky-note': StickyNote,
  circle: Circle,
  columns: Columns,
  'message-square': MessageSquare,
  'shield-check': ShieldCheck,
  'edit-3': Edit3,
  'building-2': Building2,
  link: Link2,

  // Products & Menu icons
  archive: Archive,
  box: Box,
  map: Map,
  'message-circle': MessageCircle,
  'user-check': UserCheck,
  'bar-chart-2': BarChart2,

  // Config & Integration icons
  save: Save,
  'at-sign': AtSign,
  server: Server,
  timer: Timer,
  repeat: Repeat,
  key: Key,
  'refresh-cw': RefreshCw,
  percent: Percent,
  'file-clock': FileClock,
  'rotate-ccw': RotateCcw,

  // WhatsApp module icons
  bot: Bot,
  radio: Radio,
  'user-x': UserX,

  // Google integration
  video: Video,

  // AI integration
  cpu: Cpu,
  crown: Crown,
  wallet: Wallet,
  receipt: Receipt,
  'arrow-up-circle': ArrowUpCircle,

  // Document management
  'upload-cloud': UploadCloud,
  'folder-plus': FolderPlus,
  'edit-2': Edit2,
  'git-commit': GitCommit,
  'share-2': Share2,
  cloud: Cloud,
  'file-x': FileX2,
  move: Move,
  music: Music,
  'table-icon': Table2,
  'table2': Table2,
  'align-left': AlignLeft,
  'layout': Layout,
  'pause': Pause,
  'play': Play,
  'square': Square,
  'trending-down': TrendingDown,
  terminal: Terminal,
  'scroll-text': ScrollText,
  gift: Gift,
};

export type IconName = keyof typeof ICON_MAP;

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 18, color, className, strokeWidth = 2 }: IconProps) {
  const IconComponent = ICON_MAP[name];
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found.`);
    return null;
  }
  return <IconComponent size={size} color={color} className={className} strokeWidth={strokeWidth} />;
}

export { ICON_MAP };

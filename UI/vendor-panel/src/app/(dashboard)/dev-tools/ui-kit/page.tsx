'use client';

import {
  Home, User, Settings, Search, Bell, Mail, Phone, Calendar, Star, Heart,
  Plus, Trash2, Edit, Eye, Download, Upload, Check, X, AlertTriangle, Info,
  ChevronRight, ChevronDown, ArrowLeft, ArrowRight, ExternalLink, Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

/* ---------- Section wrapper ---------- */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold border-b pb-2">{title}</h2>
      {children}
    </div>
  );
}

/* ---------- Color swatch ---------- */
function Swatch({ name, bg }: { name: string; bg: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`h-12 w-12 rounded-lg border ${bg}`} />
      <span className="text-[10px] text-gray-500">{name}</span>
    </div>
  );
}

/* ---------- Icon cell ---------- */
function IconCell({ icon: Icon, name }: { icon: React.ComponentType<{ className?: string }>; name: string }) {
  return (
    <div className="flex flex-col items-center gap-1 p-2">
      <Icon className="h-5 w-5 text-gray-700" />
      <span className="text-[10px] text-gray-500">{name}</span>
    </div>
  );
}

export default function UIKitPage() {
  return (
    <div className="space-y-10 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">UI Kit</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Component library reference with live examples
        </p>
      </div>

      {/* ───── Colors ───── */}
      <Section title="Colors">
        <div className="flex flex-wrap gap-4">
          <Swatch name="primary" bg="bg-primary" />
          <Swatch name="primary/80" bg="bg-primary/80" />
          <Swatch name="primary/60" bg="bg-primary/60" />
          <Swatch name="primary/40" bg="bg-primary/40" />
          <Swatch name="primary/20" bg="bg-primary/20" />
          <Swatch name="primary/10" bg="bg-primary/10" />
          <Swatch name="secondary" bg="bg-secondary" />
          <Swatch name="destructive" bg="bg-destructive" />
          <Swatch name="success" bg="bg-green-500" />
          <Swatch name="warning" bg="bg-yellow-500" />
          <Swatch name="danger" bg="bg-red-500" />
          <Swatch name="info" bg="bg-blue-500" />
          <Swatch name="gray-100" bg="bg-gray-100" />
          <Swatch name="gray-200" bg="bg-gray-200" />
          <Swatch name="gray-300" bg="bg-gray-300" />
          <Swatch name="gray-400" bg="bg-gray-400" />
          <Swatch name="gray-500" bg="bg-gray-500" />
          <Swatch name="gray-600" bg="bg-gray-600" />
          <Swatch name="gray-700" bg="bg-gray-700" />
          <Swatch name="gray-800" bg="bg-gray-800" />
          <Swatch name="gray-900" bg="bg-gray-900" />
        </div>
      </Section>

      {/* ───── Typography ───── */}
      <Section title="Typography">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Heading 1 (text-4xl)</h1>
          <h2 className="text-3xl font-bold">Heading 2 (text-3xl)</h2>
          <h3 className="text-2xl font-semibold">Heading 3 (text-2xl)</h3>
          <h4 className="text-xl font-semibold">Heading 4 (text-xl)</h4>
          <h5 className="text-lg font-medium">Heading 5 (text-lg)</h5>
          <h6 className="text-base font-medium">Heading 6 (text-base)</h6>
          <p className="text-sm">Paragraph text (text-sm) &mdash; The quick brown fox jumps over the lazy dog.</p>
          <p className="text-xs text-muted-foreground">Small text (text-xs) &mdash; Secondary or muted content.</p>
        </div>
      </Section>

      {/* ───── Buttons ───── */}
      <Section title="Buttons">
        <div className="space-y-4">
          {/* Variants */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Variants (default size)</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Default</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>
          {/* Sizes */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Sizes</p>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon"><Plus className="h-4 w-4" /></Button>
            </div>
          </div>
          {/* States */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">States</p>
            <div className="flex flex-wrap gap-2">
              <Button disabled>Disabled</Button>
              <Button loading>Loading</Button>
            </div>
          </div>
        </div>
      </Section>

      {/* ───── Badges ───── */}
      <Section title="Badges">
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="info">Info</Badge>
        </div>
      </Section>

      {/* ───── Cards ───── */}
      <Section title="Cards">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Card Title</CardTitle>
              <CardDescription>Card description text goes here.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">This is the card content area. It can contain any elements.</p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button size="sm">Action</Button>
              <Button size="sm" variant="outline">Cancel</Button>
            </CardFooter>
          </Card>

          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="text-base">Highlighted Card</CardTitle>
              <CardDescription>With a colored border accent.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Cards can be styled with additional classes for emphasis.
              </p>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* ───── Inputs ───── */}
      <Section title="Inputs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <Input label="Text Input" placeholder="Enter text..." />
          <Input label="With Icon" placeholder="Search..." leftIcon={<Search className="h-4 w-4" />} />
          <Input label="With Error" placeholder="Email" error="Invalid email address" />
          <Input label="Disabled" placeholder="Disabled input" disabled />
          <Select
            label="Select Input"
            placeholder="Choose an option"
            options={[
              { value: 'opt1', label: 'Option 1' },
              { value: 'opt2', label: 'Option 2' },
              { value: 'opt3', label: 'Option 3' },
            ]}
          />
          <div className="sm:col-span-2">
            <Textarea label="Textarea" placeholder="Enter longer text here..." />
          </div>
        </div>
      </Section>

      {/* ───── Icons ───── */}
      <Section title="Icons">
        <p className="text-xs text-muted-foreground mb-2">Commonly used icons from lucide-react</p>
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1">
          <IconCell icon={Home} name="Home" />
          <IconCell icon={User} name="User" />
          <IconCell icon={Settings} name="Settings" />
          <IconCell icon={Search} name="Search" />
          <IconCell icon={Bell} name="Bell" />
          <IconCell icon={Mail} name="Mail" />
          <IconCell icon={Phone} name="Phone" />
          <IconCell icon={Calendar} name="Calendar" />
          <IconCell icon={Star} name="Star" />
          <IconCell icon={Heart} name="Heart" />
          <IconCell icon={Plus} name="Plus" />
          <IconCell icon={Trash2} name="Trash2" />
          <IconCell icon={Edit} name="Edit" />
          <IconCell icon={Eye} name="Eye" />
          <IconCell icon={Download} name="Download" />
          <IconCell icon={Upload} name="Upload" />
          <IconCell icon={Check} name="Check" />
          <IconCell icon={X} name="X" />
          <IconCell icon={AlertTriangle} name="AlertTriangle" />
          <IconCell icon={Info} name="Info" />
          <IconCell icon={ChevronRight} name="ChevronRight" />
          <IconCell icon={ChevronDown} name="ChevronDown" />
          <IconCell icon={ArrowLeft} name="ArrowLeft" />
          <IconCell icon={ArrowRight} name="ArrowRight" />
          <IconCell icon={ExternalLink} name="ExternalLink" />
          <IconCell icon={Copy} name="Copy" />
        </div>
      </Section>
    </div>
  );
}

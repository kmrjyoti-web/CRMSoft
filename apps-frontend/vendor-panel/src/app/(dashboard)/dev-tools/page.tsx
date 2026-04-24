'use client';

import { useRouter } from 'next/navigation';
import { Palette, BookOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const tools = [
  {
    title: 'UI Kit',
    description: 'Browse component library',
    icon: Palette,
    href: '/dev-tools/ui-kit',
  },
  {
    title: 'API Docs',
    description: 'API reference & Swagger',
    icon: BookOpen,
    href: '/dev-tools/api-docs',
  },
];

export default function DevToolsPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Developer Tools</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Resources and utilities for development
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card
              key={tool.href}
              className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
              onClick={() => router.push(tool.href)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{tool.title}</CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

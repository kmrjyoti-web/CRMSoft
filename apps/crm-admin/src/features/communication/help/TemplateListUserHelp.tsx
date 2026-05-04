'use client';

import { Icon } from '@/components/ui';

export function TemplateListUserHelp() {
  return (
    <div className="space-y-6 text-sm text-gray-600">
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
            <Icon name="mail" size={14} className="text-blue-600" />
          </span>
          What is this screen?
        </h3>
        <p>
          The Email Templates screen lets you manage reusable email templates
          for your CRM communications. Templates are organized by category
          (Sales, Marketing, Support, Notification, Other) and can be shared
          across your team. Each template stores a subject line and rich HTML
          body with merge-field support for dynamic personalization.
        </p>
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100">
            <Icon name="activity" size={14} className="text-green-600" />
          </span>
          Typical Workflow
        </h3>
        <ol className="list-inside list-decimal space-y-1.5">
          <li>Click <strong>Add Template</strong> to create a new email template</li>
          <li>Enter a descriptive <strong>Name</strong> and choose a <strong>Category</strong> (Sales, Marketing, Support, etc.)</li>
          <li>Write the <strong>Subject</strong> line &mdash; use merge fields like <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">{'{{contactName}}'}</code> for personalization</li>
          <li>Compose the <strong>Body</strong> using the rich text editor with formatting, links, and images</li>
          <li>Toggle <strong>Shared</strong> to make the template available to all team members</li>
          <li>Click <strong>Save</strong> &mdash; the template is now ready to use in emails and workflows</li>
          <li>Use the <strong>Preview</strong> feature to see how the template renders with sample data</li>
          <li>Manage <strong>Email Signatures</strong> separately to attach a consistent sign-off to outgoing emails</li>
        </ol>
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
            <Icon name="info" size={14} className="text-amber-600" />
          </span>
          Tips
        </h3>
        <div className="space-y-2">
          <div className="rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Use the <strong>category filter buttons</strong> at the top to quickly narrow templates
            by type &mdash; helpful when you have many templates across different use cases.
          </div>
          <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
            <strong>Shared templates</strong> are visible to all users in your tenant.
            Private templates (not shared) are only visible to the creator.
          </div>
          <div className="rounded-md border border-green-100 bg-green-50 px-3 py-2 text-xs text-green-800">
            Templates can be used in <strong>Workflow actions</strong> &mdash; configure a
            &ldquo;Send Email&rdquo; action on a transition to automatically send a template
            when a lead moves between states.
          </div>
          <div className="rounded-md border border-purple-100 bg-purple-50 px-3 py-2 text-xs text-purple-800">
            Pair each template with an <strong>Email Signature</strong> from the Signatures tab
            to maintain consistent branding across all outgoing emails.
          </div>
          <div className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-700">
            Use the <strong>search bar</strong> to find templates by name or subject &mdash;
            the search works across both fields simultaneously.
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

export function WorkflowHelpContent() {
  return (
    <div className="p-6">
      <div className="space-y-6 text-sm text-gray-600">
        {/* Section 1 */}
        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase text-gray-800">
            1. What is a Workflow?
          </h3>
          <p>
            A workflow defines the lifecycle of an entity (Lead, Quotation, Invoice, etc.)
            in your CRM. It consists of <strong>States</strong> (stages an entity can be in)
            and <strong>Transitions</strong> (allowed movements between states).
          </p>
          <div className="mt-2 rounded bg-gray-50 p-3 font-mono text-xs">
            New &rarr; Verified &rarr; Allocated &rarr; In Progress &rarr; Won
          </div>
        </section>

        {/* Section 2 */}
        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase text-gray-800">
            2. Creating a Workflow
          </h3>
          <ol className="list-inside list-decimal space-y-1">
            <li>Click <strong>Add Workflow</strong> from the Workflows list</li>
            <li>Enter a <strong>Name</strong> and <strong>Code</strong> (unique identifier)</li>
            <li>Select the <strong>Entity Type</strong> (Lead, Quotation, etc.)</li>
            <li>Optionally mark as <strong>Default</strong> for auto-assignment</li>
            <li>Click <strong>Save</strong> to create the workflow</li>
          </ol>
        </section>

        {/* Section 3 */}
        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase text-gray-800">
            3. Understanding States
          </h3>
          <p className="mb-2">
            States represent the stages an entity passes through. There are three types:
          </p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 inline-block h-4 w-4 rounded bg-green-100 border border-green-300" />
              <div>
                <strong>Initial</strong> — The starting point. Every workflow needs exactly one initial state.
                New entities start here automatically.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 inline-block h-4 w-4 rounded bg-blue-100 border border-blue-300" />
              <div>
                <strong>Intermediate</strong> — In-progress stages. Entities move through
                these stages as work progresses.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 inline-block h-4 w-4 rounded bg-gray-100 border border-gray-300" />
              <div>
                <strong>Terminal</strong> — End states. Once reached, no further transitions are possible.
                Can be categorized as Success, Failure, or Paused.
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase text-gray-800">
            4. Adding States
          </h3>
          <ol className="list-inside list-decimal space-y-1">
            <li>Click <strong>+ Add State</strong> on the workflow detail page</li>
            <li>Enter a <strong>Name</strong> (display name) and <strong>Code</strong> (unique key)</li>
            <li>Select the <strong>State Type</strong> (Initial, Intermediate, or Terminal)</li>
            <li>For Terminal states, choose a <strong>Category</strong> (Success/Failure/Paused)</li>
            <li>Pick a <strong>Color</strong> for visual identification</li>
            <li>Set the <strong>Sort Order</strong> to control the pipeline display order</li>
            <li>Click <strong>Save</strong></li>
          </ol>
          <p className="mt-2 text-xs text-gray-400">
            Tip: Use sort order numbers like 10, 20, 30 to leave room for future insertions.
          </p>
        </section>

        {/* Section 5 */}
        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase text-gray-800">
            5. Understanding Transitions
          </h3>
          <p>
            Transitions define <strong>which state movements are allowed</strong>. For example,
            a lead in &ldquo;New&rdquo; can only move to &ldquo;Verified&rdquo; or &ldquo;Lost&rdquo; if those
            transitions exist.
          </p>
          <div className="mt-2 space-y-2">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium">MANUAL</span>
              <span>User clicks a button to trigger the transition</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 inline-block rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">AUTO</span>
              <span>Transition happens automatically when conditions are met</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">SCHEDULED</span>
              <span>Transition triggers at a scheduled time</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 inline-block rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">APPROVAL</span>
              <span>Requires manager/admin approval before executing</span>
            </div>
          </div>
        </section>

        {/* Section 6 */}
        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase text-gray-800">
            6. Adding Transitions
          </h3>
          <ol className="list-inside list-decimal space-y-1">
            <li>Click <strong>+ Add Transition</strong></li>
            <li>Select the <strong>From State</strong> and <strong>To State</strong></li>
            <li>Enter a <strong>Name</strong> and <strong>Code</strong></li>
            <li>Choose the <strong>Trigger Type</strong> (Manual, Auto, Scheduled, or Approval)</li>
            <li>Optionally set <strong>Required Permission</strong> or <strong>Required Role</strong> for access control</li>
            <li>Click <strong>Save</strong></li>
          </ol>
        </section>

        {/* Section 7 */}
        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase text-gray-800">
            7. Publishing &amp; Validation
          </h3>
          <div className="space-y-2">
            <div>
              <p className="font-medium text-gray-700">Validate</p>
              <p className="text-gray-500">
                Click <strong>Validate</strong> to check your workflow for errors:
                missing initial state, orphaned states, unreachable states, etc.
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Publish</p>
              <p className="text-gray-500">
                Click <strong>Publish</strong> to activate the workflow. Only published workflows
                can be used by entities. Publishing also generates the visual diagram.
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Clone</p>
              <p className="text-gray-500">
                Use <strong>Clone</strong> to create a copy of an existing workflow. Useful for
                creating variations or testing changes without affecting the active workflow.
              </p>
            </div>
          </div>
        </section>

        {/* Section 8 */}
        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase text-gray-800">
            8. Automated Actions
          </h3>
          <p>
            Each transition can trigger automated actions when it executes:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li><strong>Field Update</strong> — Automatically update a field on the entity</li>
            <li><strong>Send Email</strong> — Send notification emails to relevant parties</li>
            <li><strong>Send Notification</strong> — Push an in-app notification</li>
            <li><strong>Create Activity</strong> — Log an activity record automatically</li>
            <li><strong>Create Task</strong> — Assign a follow-up task</li>
            <li><strong>Webhook</strong> — Call an external system (e.g., ERP, Slack)</li>
            <li><strong>Assign Owner</strong> — Automatically reassign the entity</li>
          </ul>
        </section>

        {/* Section 9 */}
        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase text-gray-800">
            9. How Workflows Connect to Leads
          </h3>
          <p>
            When a workflow is configured for Leads:
          </p>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>New leads automatically start at the <strong>Initial</strong> state</li>
            <li>The Lead Detail page shows a <strong>visual pipeline stepper</strong></li>
            <li>Users see available <strong>transition buttons</strong> based on the current state</li>
            <li>Each transition is recorded in the <strong>Pipeline History</strong></li>
            <li>The lead&apos;s <strong>status field</strong> is automatically synced via Field Update actions</li>
          </ol>
          <p className="mt-2 text-xs text-gray-400">
            Note: Existing leads get workflow instances on first view (lazy initialization).
          </p>
        </section>

        {/* Section 10 */}
        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase text-gray-800">
            10. Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            <div>
              <p className="font-medium text-gray-700">Can I have multiple workflows for the same entity?</p>
              <p className="text-gray-500">
                Yes. Create multiple workflows with the same entity type. Mark one as
                &ldquo;Default&rdquo; for auto-assignment. You can assign specific workflows to entities manually.
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700">What happens if I edit a published workflow?</p>
              <p className="text-gray-500">
                Changes to states and transitions take effect immediately for new transitions.
                Existing entities retain their current state. Re-publish to update the visual diagram.
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Can I delete a state that entities are currently in?</p>
              <p className="text-gray-500">
                It&apos;s not recommended. Deleting a state may break transitions for entities
                currently in that state. Consider deactivating instead.
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700">How do approval gates work?</p>
              <p className="text-gray-500">
                Set a transition&apos;s trigger type to &ldquo;Approval&rdquo;. When a user requests this
                transition, an approval request is created. An approver must accept or
                reject. Once approved, the transition executes automatically.
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700">What is the Sort Order for?</p>
              <p className="text-gray-500">
                Sort order determines the visual position of states in the pipeline stepper
                on the entity detail page. Lower numbers appear first (left to right).
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

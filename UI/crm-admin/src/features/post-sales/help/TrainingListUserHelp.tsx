'use client';

import { Icon } from '@/components/ui';

export function TrainingListUserHelp() {
  return (
    <div className="space-y-6 text-sm text-gray-600">
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
            <Icon name="book-open" size={14} className="text-blue-600" />
          </span>
          What is this screen?
        </h3>
        <p>
          The Trainings list manages all training sessions delivered to your
          customers after a sale. Each training record captures the session title,
          mode (Onsite, Remote, or Hybrid), trainer details, scheduling, attendee
          counts, and feedback ratings. Use this screen to plan, conduct, and
          evaluate training engagements.
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
          <li>Click <strong>+ Create</strong> to schedule a new training session</li>
          <li>Enter a title, select the training mode (Onsite / Remote / Hybrid), and set the scheduled date</li>
          <li>Link the training to a contact and organization</li>
          <li>Add trainer name, trainer contact, topics to cover, and max attendees</li>
          <li>For remote/hybrid sessions, paste the <strong>meeting link</strong>; for onsite, fill in the location</li>
          <li>Save &mdash; the training appears with status <strong>Scheduled</strong></li>
          <li>When the session begins, mark it as <strong>In Progress</strong></li>
          <li>After the session, mark it as <strong>Completed</strong>, record actual attendees, feedback, and rating</li>
          <li>Cancel the session if it is no longer required</li>
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
            Use the <strong>filter sidebar</strong> to narrow trainings by status,
            mode, contact, organization, or date range.
          </div>
          <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
            Each training receives an auto-generated <strong>Training No</strong> for
            tracking and reporting purposes.
          </div>
          <div className="rounded-md border border-green-100 bg-green-50 px-3 py-2 text-xs text-green-800">
            Record <strong>feedback and rating</strong> after completing a session to build
            a quality history you can review in reports.
          </div>
          <div className="rounded-md border border-purple-100 bg-purple-50 px-3 py-2 text-xs text-purple-800">
            Use the <strong>topics</strong> field to outline the agenda &mdash; this helps
            trainers prepare and gives customers a clear expectation.
          </div>
          <div className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-700">
            Set <strong>start time, end time, and duration</strong> to keep sessions on
            schedule and track time invested per customer.
          </div>
        </div>
      </section>
    </div>
  );
}

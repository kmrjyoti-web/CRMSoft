# Test Coverage Gap Report — CRMSoft

**Date:** 2026-04-17
**Target:** /Users/kmrjyoti/GitProject/CRM/CrmProject/Application/backend/src
**Mode:** audit

---

## Summary

| Metric | Count |
|--------|-------|
| Source files (.ts) | 2659 |
| Spec files (.spec.ts) | 350 |
| Coverage ratio | 13% |
| Untested handlers | 584 |
| Untested services | 340 |
| Multi-tenant handlers | 102 |

---

## Untested Handlers (generate tests for these first)

- `Application/backend/src/common/cqrs/base-list-query.handler.ts`
- `Application/backend/src/modules/core/identity/tenant/application/commands/update-tenant/update-tenant.handler.ts`
- `Application/backend/src/modules/core/identity/tenant/application/commands/update-plan/update-plan.handler.ts`
- `Application/backend/src/modules/core/identity/tenant/application/commands/create-tenant/create-tenant.handler.ts`
- `Application/backend/src/modules/core/identity/tenant/application/commands/change-plan/change-plan.handler.ts`
- `Application/backend/src/modules/core/identity/tenant/application/commands/create-super-admin/create-super-admin.handler.ts`
- `Application/backend/src/modules/core/identity/tenant/application/commands/complete-onboarding-step/complete-onboarding-step.handler.ts`
- `Application/backend/src/modules/core/identity/tenant/application/commands/deactivate-plan/deactivate-plan.handler.ts`
- `Application/backend/src/modules/core/identity/tenant/application/commands/create-plan/create-plan.handler.ts`
- `Application/backend/src/modules/core/identity/tenant/application/commands/update-tenant-settings/update-tenant-settings.handler.ts`
- `Application/backend/src/modules/core/identity/tenant/application/commands/record-payment/record-payment.handler.ts`
- `Application/backend/src/modules/core/identity/tenant/application/commands/subscribe/subscribe.handler.ts`
- `Application/backend/src/modules/core/identity/tenant/application/commands/suspend-tenant/suspend-tenant.handler.ts`
- `Application/backend/src/modules/core/identity/tenant/application/commands/activate-tenant/activate-tenant.handler.ts`
- `Application/backend/src/modules/core/identity/tenant/application/commands/recalculate-usage/recalculate-usage.handler.ts`
- `Application/backend/src/modules/core/identity/tenant/application/commands/generate-invoice/generate-invoice.handler.ts`
- `Application/backend/src/modules/core/identity/tenant/application/commands/cancel-subscription/cancel-subscription.handler.ts`
- `Application/backend/src/modules/core/identity/settings/application/queries/list-users/list-users.handler.ts`
- `Application/backend/src/modules/core/identity/settings/application/queries/list-roles/list-roles.handler.ts`
- `Application/backend/src/modules/core/identity/settings/application/queries/get-role/get-role.handler.ts`
- `Application/backend/src/modules/core/identity/settings/application/queries/list-permissions/list-permissions.handler.ts`
- `Application/backend/src/modules/core/identity/settings/application/queries/get-user/get-user.handler.ts`
- `Application/backend/src/modules/core/identity/settings/application/commands/permanent-delete-user/permanent-delete-user.handler.ts`
- `Application/backend/src/modules/core/identity/settings/application/commands/soft-delete-user/soft-delete-user.handler.ts`
- `Application/backend/src/modules/core/identity/settings/application/commands/restore-user/restore-user.handler.ts`
- `Application/backend/src/modules/core/identity/entity-filters/application/queries/get-entities-by-filter/get-entities-by-filter.handler.ts`
- `Application/backend/src/modules/core/identity/entity-filters/application/queries/get-entity-filters/get-entity-filters.handler.ts`
- `Application/backend/src/modules/core/identity/entity-filters/application/commands/replace-filters/replace-filters.handler.ts`
- `Application/backend/src/modules/core/identity/entity-filters/application/commands/copy-filters/copy-filters.handler.ts`
- `Application/backend/src/modules/core/identity/entity-filters/application/commands/assign-filters/assign-filters.handler.ts`
- `Application/backend/src/modules/core/identity/entity-filters/application/commands/remove-filter/remove-filter.handler.ts`
- `Application/backend/src/modules/core/identity/audit/application/queries/get-audit-stats/get-audit-stats.handler.ts`
- `Application/backend/src/modules/core/identity/audit/application/queries/get-user-activity/get-user-activity.handler.ts`
- `Application/backend/src/modules/core/identity/audit/application/queries/get-field-history/get-field-history.handler.ts`
- `Application/backend/src/modules/core/identity/audit/application/queries/get-retention-policies/get-retention-policies.handler.ts`
- `Application/backend/src/modules/core/identity/audit/application/queries/get-entity-timeline/get-entity-timeline.handler.ts`
- `Application/backend/src/modules/core/identity/audit/application/queries/search-audit-logs/search-audit-logs.handler.ts`
- `Application/backend/src/modules/core/identity/audit/application/queries/get-global-feed/get-global-feed.handler.ts`
- `Application/backend/src/modules/core/identity/audit/application/queries/get-audit-log-detail/get-audit-log-detail.handler.ts`
- `Application/backend/src/modules/core/identity/audit/application/queries/get-diff-view/get-diff-view.handler.ts`
- `Application/backend/src/modules/core/identity/audit/application/commands/create-bulk-audit-log/create-bulk-audit-log.handler.ts`
- `Application/backend/src/modules/core/identity/audit/application/commands/cleanup-old-logs/cleanup-old-logs.handler.ts`
- `Application/backend/src/modules/core/identity/audit/application/commands/update-retention-policy/update-retention-policy.handler.ts`
- `Application/backend/src/modules/core/identity/audit/application/commands/create-audit-log/create-audit-log.handler.ts`
- `Application/backend/src/modules/core/identity/menus/application/queries/get-menu-by-id/get-menu-by-id.handler.ts`
- `Application/backend/src/modules/core/identity/menus/application/queries/get-my-menu/get-my-menu.handler.ts`
- `Application/backend/src/modules/core/identity/menus/application/queries/get-menu-tree/get-menu-tree.handler.ts`
- `Application/backend/src/modules/core/identity/menus/application/commands/reorder-menus/reorder-menus.handler.ts`
- `Application/backend/src/modules/core/identity/menus/application/commands/bulk-seed-menus/bulk-seed-menus.handler.ts`
- `Application/backend/src/modules/core/identity/menus/application/commands/deactivate-menu/deactivate-menu.handler.ts`
- `Application/backend/src/modules/core/identity/menus/application/commands/create-menu/create-menu.handler.ts`
- `Application/backend/src/modules/core/identity/menus/application/commands/update-menu/update-menu.handler.ts`
- `Application/backend/src/modules/core/platform/lookups/application/queries/get-values-by-category/get-values-by-category.handler.ts`
- `Application/backend/src/modules/core/platform/lookups/application/queries/get-lookup-by-id/get-lookup-by-id.handler.ts`
- `Application/backend/src/modules/core/platform/lookups/application/queries/get-all-lookups/get-all-lookups.handler.ts`
- `Application/backend/src/modules/core/platform/lookups/application/commands/reorder-values/reorder-values.handler.ts`
- `Application/backend/src/modules/core/platform/lookups/application/commands/update-value/update-value.handler.ts`
- `Application/backend/src/modules/core/platform/lookups/application/commands/update-lookup/update-lookup.handler.ts`
- `Application/backend/src/modules/core/platform/lookups/application/commands/add-value/add-value.handler.ts`
- `Application/backend/src/modules/core/platform/lookups/application/commands/create-lookup/create-lookup.handler.ts`
- `Application/backend/src/modules/core/platform/lookups/application/commands/deactivate-lookup/deactivate-lookup.handler.ts`
- `Application/backend/src/modules/core/platform/lookups/application/commands/reset-lookup-defaults/reset-lookup-defaults.handler.ts`
- `Application/backend/src/modules/core/platform/lookups/application/commands/deactivate-value/deactivate-value.handler.ts`
- `Application/backend/src/modules/core/work/custom-fields/application/queries/get-field-definitions/get-field-definitions.handler.ts`
- `Application/backend/src/modules/core/work/custom-fields/application/queries/get-entity-values/get-entity-values.handler.ts`
- `Application/backend/src/modules/core/work/custom-fields/application/queries/get-form-schema/get-form-schema.handler.ts`
- `Application/backend/src/modules/core/work/custom-fields/application/commands/create-field-definition/create-field-definition.handler.ts`
- `Application/backend/src/modules/core/work/custom-fields/application/commands/update-field-definition/update-field-definition.handler.ts`
- `Application/backend/src/modules/core/work/custom-fields/application/commands/delete-field-definition/delete-field-definition.handler.ts`
- `Application/backend/src/modules/core/work/custom-fields/application/commands/set-field-value/set-field-value.handler.ts`
- `Application/backend/src/modules/core/work/notifications/application/queries/get-templates/get-templates.handler.ts`
- `Application/backend/src/modules/core/work/notifications/application/queries/get-notification-by-id/get-notification-by-id.handler.ts`
- `Application/backend/src/modules/core/work/notifications/application/queries/get-preferences/get-preferences.handler.ts`
- `Application/backend/src/modules/core/work/notifications/application/queries/get-notifications/get-notifications.handler.ts`
- `Application/backend/src/modules/core/work/notifications/application/queries/get-notification-stats/get-notification-stats.handler.ts`
- `Application/backend/src/modules/core/work/notifications/application/queries/get-unread-count/get-unread-count.handler.ts`
- `Application/backend/src/modules/core/work/notifications/application/commands/mark-read/mark-read.handler.ts`
- `Application/backend/src/modules/core/work/notifications/application/commands/send-notification/send-notification.handler.ts`
- `Application/backend/src/modules/core/work/notifications/application/commands/unregister-push/unregister-push.handler.ts`
- `Application/backend/src/modules/core/work/notifications/application/commands/bulk-dismiss/bulk-dismiss.handler.ts`
- `Application/backend/src/modules/core/work/notifications/application/commands/mark-all-read/mark-all-read.handler.ts`
- `Application/backend/src/modules/core/work/notifications/application/commands/register-push/register-push.handler.ts`
- `Application/backend/src/modules/core/work/notifications/application/commands/bulk-mark-read/bulk-mark-read.handler.ts`
- `Application/backend/src/modules/core/work/notifications/application/commands/create-template/create-template.handler.ts`
- `Application/backend/src/modules/core/work/notifications/application/commands/update-preferences/update-preferences.handler.ts`
- `Application/backend/src/modules/core/work/notifications/application/commands/dismiss-notification/dismiss-notification.handler.ts`
- `Application/backend/src/modules/core/work/notifications/application/commands/update-template/update-template.handler.ts`
- `Application/backend/src/modules/plugins/handlers/stripe.handler.ts`
- `Application/backend/src/modules/plugins/handlers/tally.handler.ts`
- `Application/backend/src/modules/plugins/handlers/exotel.handler.ts`
- `Application/backend/src/modules/plugins/handlers/msg91.handler.ts`
- `Application/backend/src/modules/plugins/handlers/whatsapp.handler.ts`
- `Application/backend/src/modules/plugins/handlers/gst.handler.ts`
- `Application/backend/src/modules/plugins/handlers/razorpay.handler.ts`
- `Application/backend/src/modules/plugins/handlers/gmail.handler.ts`
- `Application/backend/src/modules/softwarevendor/version-control/application/handlers/get-version.handler.ts`
- `Application/backend/src/modules/softwarevendor/version-control/application/handlers/list-versions.handler.ts`
- `Application/backend/src/modules/softwarevendor/version-control/application/handlers/create-patch.handler.ts`
- `Application/backend/src/modules/softwarevendor/version-control/application/handlers/rollback-version.handler.ts`
- `Application/backend/src/modules/softwarevendor/version-control/application/handlers/publish-version.handler.ts`
- `Application/backend/src/modules/softwarevendor/version-control/application/handlers/create-version.handler.ts`
- `Application/backend/src/modules/softwarevendor/workflows/application/queries/get-instance/get-instance.handler.ts`
- `Application/backend/src/modules/softwarevendor/workflows/application/queries/get-instance-transitions/get-instance-transitions.handler.ts`
- `Application/backend/src/modules/softwarevendor/workflows/application/queries/get-workflow-stats/get-workflow-stats.handler.ts`
- `Application/backend/src/modules/softwarevendor/workflows/application/queries/get-entity-status/get-entity-status.handler.ts`
- `Application/backend/src/modules/softwarevendor/workflows/application/queries/get-approval-by-id/get-approval-by-id.handler.ts`
- `Application/backend/src/modules/softwarevendor/workflows/application/queries/get-workflow-list/get-workflow-list.handler.ts`
- `Application/backend/src/modules/softwarevendor/workflows/application/queries/get-workflow-visual/get-workflow-visual.handler.ts`
- `Application/backend/src/modules/softwarevendor/workflows/application/queries/get-instance-history/get-instance-history.handler.ts`
- `Application/backend/src/modules/softwarevendor/workflows/application/queries/get-pending-approvals/get-pending-approvals.handler.ts`
- `Application/backend/src/modules/softwarevendor/workflows/application/queries/get-workflow-by-id/get-workflow-by-id.handler.ts`
- `Application/backend/src/modules/softwarevendor/workflows/application/queries/get-approval-history/get-approval-history.handler.ts`
- `Application/backend/src/modules/softwarevendor/workflows/application/commands/validate-workflow/validate-workflow.handler.ts`
- `Application/backend/src/modules/softwarevendor/workflows/application/commands/rollback-transition/rollback-transition.handler.ts`
- `Application/backend/src/modules/softwarevendor/workflows/application/commands/remove-state/remove-state.handler.ts`
- `Application/backend/src/modules/softwarevendor/workflows/application/commands/publish-workflow/publish-workflow.handler.ts`
- `Application/backend/src/modules/softwarevendor/workflows/application/commands/approve-transition/approve-transition.handler.ts`
- `Application/backend/src/modules/softwarevendor/workflows/application/commands/update-workflow/update-workflow.handler.ts`
- `Application/backend/src/modules/softwarevendor/workflows/application/commands/update-transition/update-transition.handler.ts`
- `Application/backend/src/modules/softwarevendor/workflows/application/commands/clone-workflow/clone-workflow.handler.ts`
- `Application/backend/src/modules/softwarevendor/workflows/application/commands/add-state/add-state.handler.ts`
- `Application/backend/src/modules/softwarevendor/workflows/application/commands/create-workflow/create-workflow.handler.ts`
- `Application/backend/src/modules/softwarevendor/workflows/application/commands/update-state/update-state.handler.ts`
- `Application/backend/src/modules/softwarevendor/workflows/application/commands/reject-transition/reject-transition.handler.ts`
- `Application/backend/src/modules/softwarevendor/workflows/application/commands/initialize-workflow/initialize-workflow.handler.ts`
- `Application/backend/src/modules/softwarevendor/workflows/application/commands/add-transition/add-transition.handler.ts`
- `Application/backend/src/modules/softwarevendor/workflows/application/commands/execute-transition/execute-transition.handler.ts`
- `Application/backend/src/modules/softwarevendor/workflows/application/commands/remove-transition/remove-transition.handler.ts`
- `Application/backend/src/modules/marketplace/offers/application/queries/get-offer/get-offer.handler.ts`
- `Application/backend/src/modules/marketplace/offers/application/queries/check-eligibility/check-eligibility.handler.ts`
- `Application/backend/src/modules/marketplace/offers/application/queries/list-offers/list-offers.handler.ts`
- `Application/backend/src/modules/marketplace/offers/application/commands/redeem-offer/redeem-offer.handler.ts`
- `Application/backend/src/modules/marketplace/offers/application/commands/create-offer/create-offer.handler.ts`
- `Application/backend/src/modules/marketplace/offers/application/commands/activate-offer/activate-offer.handler.ts`
- `Application/backend/src/modules/marketplace/listings/application/queries/list-listings/list-listings.handler.ts`
- `Application/backend/src/modules/marketplace/listings/application/queries/get-listing/get-listing.handler.ts`
- `Application/backend/src/modules/marketplace/listings/application/commands/update-listing/update-listing.handler.ts`
- `Application/backend/src/modules/marketplace/listings/application/commands/create-listing/create-listing.handler.ts`
- `Application/backend/src/modules/marketplace/listings/application/commands/publish-listing/publish-listing.handler.ts`
- `Application/backend/src/modules/marketplace/requirements/application/queries/get-requirement-quotes/get-requirement-quotes.handler.ts`
- `Application/backend/src/modules/marketplace/requirements/application/queries/list-requirements/list-requirements.handler.ts`
- `Application/backend/src/modules/marketplace/requirements/application/commands/post-requirement/post-requirement.handler.ts`
- `Application/backend/src/modules/marketplace/requirements/application/commands/accept-quote/accept-quote.handler.ts`
- `Application/backend/src/modules/marketplace/requirements/application/commands/reject-quote/reject-quote.handler.ts`
- `Application/backend/src/modules/marketplace/requirements/application/commands/submit-quote/submit-quote.handler.ts`
- `Application/backend/src/modules/marketplace/feed/application/queries/get-following/get-following.handler.ts`
- `Application/backend/src/modules/marketplace/feed/application/queries/get-feed/get-feed.handler.ts`
- `Application/backend/src/modules/marketplace/feed/application/queries/get-share-link/get-share-link.handler.ts`
- `Application/backend/src/modules/marketplace/feed/application/queries/get-followers/get-followers.handler.ts`
- `Application/backend/src/modules/marketplace/feed/application/queries/get-ranked-feed/get-ranked-feed.handler.ts`
- `Application/backend/src/modules/marketplace/feed/application/commands/engage-post/engage-post.handler.ts`
- `Application/backend/src/modules/marketplace/feed/application/commands/create-post/create-post.handler.ts`
- `Application/backend/src/modules/marketplace/feed/application/commands/unfollow-user/unfollow-user.handler.ts`
- `Application/backend/src/modules/marketplace/feed/application/commands/follow-user/follow-user.handler.ts`
- `Application/backend/src/modules/marketplace/feed/application/events/marketplace-engagement.handler.ts`
- `Application/backend/src/modules/marketplace/enquiries/application/queries/list-enquiries/list-enquiries.handler.ts`
- `Application/backend/src/modules/marketplace/enquiries/application/commands/convert-enquiry/convert-enquiry.handler.ts`
- `Application/backend/src/modules/marketplace/enquiries/application/commands/create-enquiry/create-enquiry.handler.ts`
- `Application/backend/src/modules/marketplace/analytics/application/queries/get-analytics/get-analytics.handler.ts`
- `Application/backend/src/modules/marketplace/analytics/application/commands/track-event/track-event.handler.ts`
- `Application/backend/src/modules/marketplace/reviews/application/queries/list-reviews/list-reviews.handler.ts`
- `Application/backend/src/modules/marketplace/reviews/application/commands/create-review/create-review.handler.ts`
- `Application/backend/src/modules/marketplace/reviews/application/commands/moderate-review/moderate-review.handler.ts`
- `Application/backend/src/modules/ops/test-environment/application/queries/get-test-env/get-test-env.handler.ts`
- `Application/backend/src/modules/ops/test-environment/application/queries/list-test-envs/list-test-envs.handler.ts`
- `Application/backend/src/modules/ops/test-environment/application/commands/extend-test-env-ttl/extend-test-env-ttl.handler.ts`
- `Application/backend/src/modules/ops/test-environment/application/commands/create-test-env/create-test-env.handler.ts`
- `Application/backend/src/modules/ops/test-environment/application/commands/cleanup-test-env/cleanup-test-env.handler.ts`
- `Application/backend/src/modules/ops/test-groups/application/queries/list-test-groups/list-test-groups.handler.ts`
- `Application/backend/src/modules/ops/test-groups/application/queries/list-group-executions/list-group-executions.handler.ts`
- `Application/backend/src/modules/ops/test-groups/application/queries/get-test-group/get-test-group.handler.ts`
- `Application/backend/src/modules/ops/test-groups/application/queries/get-group-execution/get-group-execution.handler.ts`
- `Application/backend/src/modules/ops/test-groups/application/commands/update-test-group/update-test-group.handler.ts`
- `Application/backend/src/modules/ops/test-groups/application/commands/delete-test-group/delete-test-group.handler.ts`
- `Application/backend/src/modules/ops/test-groups/application/commands/create-test-group/create-test-group.handler.ts`
- `Application/backend/src/modules/ops/test-groups/application/commands/run-test-group/run-test-group.handler.ts`
- `Application/backend/src/modules/ops/test-runner/application/queries/get-test-results-tree/get-test-results-tree.handler.ts`
- `Application/backend/src/modules/ops/test-runner/application/queries/get-test-run/get-test-run.handler.ts`
- `Application/backend/src/modules/ops/test-runner/application/queries/list-test-runs/list-test-runs.handler.ts`
- `Application/backend/src/modules/ops/test-runner/application/queries/get-test-dashboard/get-test-dashboard.handler.ts`
- `Application/backend/src/modules/ops/test-runner/application/queries/compare-test-runs/compare-test-runs.handler.ts`
- `Application/backend/src/modules/ops/test-runner/application/queries/get-test-results/get-test-results.handler.ts`
- `Application/backend/src/modules/ops/test-runner/application/commands/create-test-run/create-test-run.handler.ts`
- `Application/backend/src/modules/ops/test-runner/application/commands/rerun-failed-tests/rerun-failed-tests.handler.ts`
- `Application/backend/src/modules/ops/test-runner/application/commands/cancel-test-run/cancel-test-run.handler.ts`
- `Application/backend/src/modules/ops/manual-testing/application/queries/get-manual-test-log/get-manual-test-log.handler.ts`
- `Application/backend/src/modules/ops/manual-testing/application/queries/list-manual-test-logs/list-manual-test-logs.handler.ts`
- `Application/backend/src/modules/ops/manual-testing/application/queries/list-test-plans/list-test-plans.handler.ts`
- `Application/backend/src/modules/ops/manual-testing/application/queries/get-manual-test-summary/get-manual-test-summary.handler.ts`
- `Application/backend/src/modules/ops/manual-testing/application/queries/get-test-plan/get-test-plan.handler.ts`
- `Application/backend/src/modules/ops/manual-testing/application/commands/update-manual-test-log/update-manual-test-log.handler.ts`
- `Application/backend/src/modules/ops/manual-testing/application/commands/get-screenshot-upload-url/get-screenshot-upload-url.handler.ts`
- `Application/backend/src/modules/ops/manual-testing/application/commands/log-manual-test/log-manual-test.handler.ts`
- `Application/backend/src/modules/ops/manual-testing/application/commands/update-test-plan/update-test-plan.handler.ts`
- `Application/backend/src/modules/ops/manual-testing/application/commands/create-test-plan/create-test-plan.handler.ts`
- `Application/backend/src/modules/ops/manual-testing/application/commands/update-test-plan-item/update-test-plan-item.handler.ts`
- `Application/backend/src/modules/ops/scheduled-test/application/queries/list-scheduled-tests/list-scheduled-tests.handler.ts`
- `Application/backend/src/modules/ops/scheduled-test/application/queries/list-scheduled-test-runs/list-scheduled-test-runs.handler.ts`
- `Application/backend/src/modules/ops/scheduled-test/application/queries/get-scheduled-test/get-scheduled-test.handler.ts`
- `Application/backend/src/modules/ops/scheduled-test/application/commands/create-scheduled-test/create-scheduled-test.handler.ts`
- `Application/backend/src/modules/ops/scheduled-test/application/commands/trigger-scheduled-test/trigger-scheduled-test.handler.ts`
- `Application/backend/src/modules/ops/scheduled-test/application/commands/update-scheduled-test/update-scheduled-test.handler.ts`
- `Application/backend/src/modules/ops/scheduled-test/application/commands/delete-scheduled-test/delete-scheduled-test.handler.ts`
- `Application/backend/src/modules/customer-portal/application/queries/get-portal-user/get-portal-user.handler.ts`
- `Application/backend/src/modules/customer-portal/application/queries/get-portal-analytics/get-portal-analytics.handler.ts`
- `Application/backend/src/modules/customer-portal/application/queries/list-menu-categories/list-menu-categories.handler.ts`
- `Application/backend/src/modules/customer-portal/application/queries/list-portal-users/list-portal-users.handler.ts`
- `Application/backend/src/modules/customer-portal/application/queries/get-customer-menu/get-customer-menu.handler.ts`
- `Application/backend/src/modules/customer-portal/application/queries/get-customer-profile/get-customer-profile.handler.ts`
- `Application/backend/src/modules/customer-portal/application/queries/get-eligible-entities/get-eligible-entities.handler.ts`
- `Application/backend/src/modules/customer-portal/application/queries/get-menu-category/get-menu-category.handler.ts`
- `Application/backend/src/modules/customer-portal/application/commands/create-menu-category/create-menu-category.handler.ts`
- `Application/backend/src/modules/customer-portal/application/commands/admin-reset-customer-password/admin-reset-customer-password.handler.ts`
- `Application/backend/src/modules/customer-portal/application/commands/deactivate-portal/deactivate-portal.handler.ts`
- `Application/backend/src/modules/customer-portal/application/commands/forgot-customer-password/forgot-customer-password.handler.ts`
- `Application/backend/src/modules/customer-portal/application/commands/delete-menu-category/delete-menu-category.handler.ts`
- `Application/backend/src/modules/customer-portal/application/commands/update-portal-user/update-portal-user.handler.ts`
- `Application/backend/src/modules/customer-portal/application/commands/reset-customer-password/reset-customer-password.handler.ts`
- `Application/backend/src/modules/customer-portal/application/commands/refresh-customer-token/refresh-customer-token.handler.ts`
- `Application/backend/src/modules/customer-portal/application/commands/change-customer-password/change-customer-password.handler.ts`
- `Application/backend/src/modules/customer-portal/application/commands/customer-login/customer-login.handler.ts`
- `Application/backend/src/modules/customer-portal/application/commands/update-menu-category/update-menu-category.handler.ts`
- `Application/backend/src/modules/customer-portal/application/commands/activate-portal/activate-portal.handler.ts`
- `Application/backend/src/modules/customer/approval-requests/application/queries/get-pending/get-pending.handler.ts`
- `Application/backend/src/modules/customer/approval-requests/application/queries/get-my-requests/get-my-requests.handler.ts`
- `Application/backend/src/modules/customer/approval-requests/application/queries/get-request-detail/get-request-detail.handler.ts`
- `Application/backend/src/modules/customer/approval-requests/application/commands/reject-request/reject-request.handler.ts`
- `Application/backend/src/modules/customer/approval-requests/application/commands/submit-approval/submit-approval.handler.ts`
- `Application/backend/src/modules/customer/approval-requests/application/commands/approve-request/approve-request.handler.ts`
- `Application/backend/src/modules/customer/organizations/application/queries/get-organizations-list/get-organizations-list.handler.ts`
- `Application/backend/src/modules/customer/organizations/application/queries/get-organization-by-id/get-organization-by-id.handler.ts`
- `Application/backend/src/modules/customer/organizations/application/commands/soft-delete-organization/soft-delete-organization.handler.ts`
- `Application/backend/src/modules/customer/organizations/application/commands/restore-organization/restore-organization.handler.ts`
- `Application/backend/src/modules/customer/organizations/application/commands/deactivate-organization/deactivate-organization.handler.ts`
- `Application/backend/src/modules/customer/organizations/application/commands/reactivate-organization/reactivate-organization.handler.ts`
- `Application/backend/src/modules/customer/organizations/application/commands/create-organization/create-organization.handler.ts`
- `Application/backend/src/modules/customer/organizations/application/commands/permanent-delete-organization/permanent-delete-organization.handler.ts`
- `Application/backend/src/modules/customer/organizations/application/commands/update-organization/update-organization.handler.ts`
- `Application/backend/src/modules/customer/organizations/application/event-handlers/on-organization-deactivated.handler.ts`
- `Application/backend/src/modules/customer/organizations/application/event-handlers/on-organization-created.handler.ts`
- `Application/backend/src/modules/customer/recurrence/application/queries/get-recurrence-by-id/get-recurrence-by-id.handler.ts`
- `Application/backend/src/modules/customer/recurrence/application/queries/get-recurrence-list/get-recurrence-list.handler.ts`
- `Application/backend/src/modules/customer/recurrence/application/commands/create-recurrence/create-recurrence.handler.ts`
- `Application/backend/src/modules/customer/recurrence/application/commands/update-recurrence/update-recurrence.handler.ts`
- `Application/backend/src/modules/customer/recurrence/application/commands/cancel-recurrence/cancel-recurrence.handler.ts`
- `Application/backend/src/modules/customer/contact-organizations/application/queries/get-by-organization/get-by-organization.handler.ts`
- `Application/backend/src/modules/customer/contact-organizations/application/queries/get-by-contact/get-by-contact.handler.ts`
- `Application/backend/src/modules/customer/contact-organizations/application/queries/get-by-id/get-by-id.handler.ts`
- `Application/backend/src/modules/customer/contact-organizations/application/commands/unlink-contact-from-org/unlink-contact-from-org.handler.ts`
- `Application/backend/src/modules/customer/contact-organizations/application/commands/change-relation-type/change-relation-type.handler.ts`
- `Application/backend/src/modules/customer/contact-organizations/application/commands/link-contact-to-org/link-contact-to-org.handler.ts`
- `Application/backend/src/modules/customer/contact-organizations/application/commands/update-mapping/update-mapping.handler.ts`
- `Application/backend/src/modules/customer/contact-organizations/application/commands/set-primary-contact/set-primary-contact.handler.ts`
- `Application/backend/src/modules/customer/saved-filters/application/queries/list-saved-filters/list-saved-filters.handler.ts`
- `Application/backend/src/modules/customer/saved-filters/application/queries/get-saved-filter/get-saved-filter.handler.ts`
- `Application/backend/src/modules/customer/saved-filters/application/commands/create-saved-filter/create-saved-filter.handler.ts`
- `Application/backend/src/modules/customer/saved-filters/application/commands/update-saved-filter/update-saved-filter.handler.ts`
- `Application/backend/src/modules/customer/saved-filters/application/commands/delete-saved-filter/delete-saved-filter.handler.ts`
- `Application/backend/src/modules/customer/comments/application/queries/get-comment-thread/get-comment-thread.handler.ts`
- `Application/backend/src/modules/customer/comments/application/queries/get-comments-by-entity/get-comments-by-entity.handler.ts`
- `Application/backend/src/modules/customer/comments/application/commands/create-comment/create-comment.handler.ts`
- `Application/backend/src/modules/customer/comments/application/commands/delete-comment/delete-comment.handler.ts`
- `Application/backend/src/modules/customer/comments/application/commands/update-comment/update-comment.handler.ts`
- `Application/backend/src/modules/customer/tasks/application/queries/get-task-history/get-task-history.handler.ts`
- `Application/backend/src/modules/customer/tasks/application/queries/get-task-by-id/get-task-by-id.handler.ts`
- `Application/backend/src/modules/customer/tasks/application/queries/get-team-tasks-overview/get-team-tasks-overview.handler.ts`
- `Application/backend/src/modules/customer/tasks/application/queries/get-my-tasks/get-my-tasks.handler.ts`
- `Application/backend/src/modules/customer/tasks/application/queries/get-task-list/get-task-list.handler.ts`
- `Application/backend/src/modules/customer/tasks/application/queries/get-task-stats/get-task-stats.handler.ts`
- `Application/backend/src/modules/customer/tasks/application/queries/get-my-tasks-dashboard/get-my-tasks-dashboard.handler.ts`
- `Application/backend/src/modules/customer/tasks/application/commands/approve-task/approve-task.handler.ts`
- `Application/backend/src/modules/customer/tasks/application/commands/add-watcher/add-watcher.handler.ts`
- `Application/backend/src/modules/customer/tasks/application/commands/remove-watcher/remove-watcher.handler.ts`
- `Application/backend/src/modules/customer/tasks/application/commands/delete-task/delete-task.handler.ts`
- `Application/backend/src/modules/customer/tasks/application/commands/reject-task/reject-task.handler.ts`
- `Application/backend/src/modules/customer/tasks/application/commands/bulk-assign-task/bulk-assign-task.handler.ts`
- `Application/backend/src/modules/customer/tasks/application/commands/create-task/create-task.handler.ts`
- `Application/backend/src/modules/customer/tasks/application/commands/change-task-status/change-task-status.handler.ts`
- `Application/backend/src/modules/customer/tasks/application/commands/complete-task/complete-task.handler.ts`
- `Application/backend/src/modules/customer/tasks/application/commands/assign-task/assign-task.handler.ts`
- `Application/backend/src/modules/customer/tasks/application/commands/update-task/update-task.handler.ts`
- `Application/backend/src/modules/customer/products/application/queries/get-product-pricing/get-product-pricing.handler.ts`
- `Application/backend/src/modules/customer/products/application/queries/list-products/list-products.handler.ts`
- `Application/backend/src/modules/customer/products/application/queries/get-product-tree/get-product-tree.handler.ts`
- `Application/backend/src/modules/customer/products/application/queries/get-product-by-id/get-product-by-id.handler.ts`
- `Application/backend/src/modules/customer/products/application/commands/create-product/create-product.handler.ts`
- `Application/backend/src/modules/customer/products/application/commands/manage-product-images/manage-product-images.handler.ts`
- `Application/backend/src/modules/customer/products/application/commands/assign-product-filters/assign-product-filters.handler.ts`
- `Application/backend/src/modules/customer/products/application/commands/deactivate-product/deactivate-product.handler.ts`
- `Application/backend/src/modules/customer/products/application/commands/link-products/link-products.handler.ts`
- `Application/backend/src/modules/customer/products/application/commands/update-product/update-product.handler.ts`
- `Application/backend/src/modules/customer/price-lists/application/queries/get-price-list/get-price-list.handler.ts`
- `Application/backend/src/modules/customer/price-lists/application/queries/list-price-lists/list-price-lists.handler.ts`
- `Application/backend/src/modules/customer/price-lists/application/commands/remove-price-list-item/remove-price-list-item.handler.ts`
- `Application/backend/src/modules/customer/price-lists/application/commands/update-price-list-item/update-price-list-item.handler.ts`
- `Application/backend/src/modules/customer/price-lists/application/commands/create-price-list/create-price-list.handler.ts`
- `Application/backend/src/modules/customer/price-lists/application/commands/delete-price-list/delete-price-list.handler.ts`
- `Application/backend/src/modules/customer/price-lists/application/commands/update-price-list/update-price-list.handler.ts`
- `Application/backend/src/modules/customer/price-lists/application/commands/add-price-list-item/add-price-list-item.handler.ts`
- `Application/backend/src/modules/customer/raw-contacts/application/queries/get-raw-contact-by-id/get-raw-contact-by-id.handler.ts`
- `Application/backend/src/modules/customer/raw-contacts/application/queries/get-raw-contacts-list/get-raw-contacts-list.handler.ts`
- `Application/backend/src/modules/customer/raw-contacts/application/commands/reject-raw-contact/reject-raw-contact.handler.ts`
- `Application/backend/src/modules/customer/raw-contacts/application/commands/reactivate-raw-contact/reactivate-raw-contact.handler.ts`
- `Application/backend/src/modules/customer/raw-contacts/application/commands/permanent-delete-raw-contact/permanent-delete-raw-contact.handler.ts`
- `Application/backend/src/modules/customer/raw-contacts/application/commands/mark-duplicate/mark-duplicate.handler.ts`
- `Application/backend/src/modules/customer/raw-contacts/application/commands/verify-raw-contact/verify-raw-contact.handler.ts`
- `Application/backend/src/modules/customer/raw-contacts/application/commands/reopen-raw-contact/reopen-raw-contact.handler.ts`
- `Application/backend/src/modules/customer/raw-contacts/application/commands/deactivate-raw-contact/deactivate-raw-contact.handler.ts`
- `Application/backend/src/modules/customer/raw-contacts/application/commands/update-raw-contact/update-raw-contact.handler.ts`
- `Application/backend/src/modules/customer/raw-contacts/application/commands/create-raw-contact/create-raw-contact.handler.ts`
- `Application/backend/src/modules/customer/raw-contacts/application/commands/soft-delete-raw-contact/soft-delete-raw-contact.handler.ts`
- `Application/backend/src/modules/customer/raw-contacts/application/commands/restore-raw-contact/restore-raw-contact.handler.ts`
- `Application/backend/src/modules/customer/raw-contacts/application/event-handlers/on-raw-contact-verified.handler.ts`
- `Application/backend/src/modules/customer/raw-contacts/application/event-handlers/on-raw-contact-created.handler.ts`
- `Application/backend/src/modules/customer/product-pricing/application/queries/get-price-list/get-price-list.handler.ts`
- `Application/backend/src/modules/customer/product-pricing/application/queries/get-effective-price/get-effective-price.handler.ts`
- `Application/backend/src/modules/customer/product-pricing/application/commands/set-product-prices/set-product-prices.handler.ts`
- `Application/backend/src/modules/customer/product-pricing/application/commands/set-slab-price/set-slab-price.handler.ts`
- `Application/backend/src/modules/customer/product-pricing/application/commands/set-group-price/set-group-price.handler.ts`
- `Application/backend/src/modules/customer/leads/application/queries/get-lead-by-id/get-lead-by-id.handler.ts`
- `Application/backend/src/modules/customer/leads/application/queries/get-leads-list/get-leads-list.handler.ts`
- `Application/backend/src/modules/customer/leads/application/commands/allocate-lead/allocate-lead.handler.ts`
- `Application/backend/src/modules/customer/leads/application/commands/restore-lead/restore-lead.handler.ts`
- `Application/backend/src/modules/customer/leads/application/commands/change-lead-status/change-lead-status.handler.ts`
- `Application/backend/src/modules/customer/leads/application/commands/create-lead/create-lead.handler.ts`
- `Application/backend/src/modules/customer/leads/application/commands/deactivate-lead/deactivate-lead.handler.ts`
- `Application/backend/src/modules/customer/leads/application/commands/soft-delete-lead/soft-delete-lead.handler.ts`
- `Application/backend/src/modules/customer/leads/application/commands/reactivate-lead/reactivate-lead.handler.ts`
- `Application/backend/src/modules/customer/leads/application/commands/quick-create-lead/quick-create-lead.handler.ts`
- `Application/backend/src/modules/customer/leads/application/commands/permanent-delete-lead/permanent-delete-lead.handler.ts`
- `Application/backend/src/modules/customer/leads/application/commands/update-lead/update-lead.handler.ts`
- `Application/backend/src/modules/customer/leads/application/event-handlers/on-lead-status-changed.handler.ts`
- `Application/backend/src/modules/customer/leads/application/event-handlers/on-lead-allocated.handler.ts`
- `Application/backend/src/modules/customer/leads/application/event-handlers/on-lead-created.handler.ts`
- `Application/backend/src/modules/customer/contacts/application/queries/get-contacts-dashboard/get-contacts-dashboard.handler.ts`
- `Application/backend/src/modules/customer/contacts/application/queries/get-contacts-list/get-contacts-list.handler.ts`
- `Application/backend/src/modules/customer/contacts/application/queries/get-contact-by-id/get-contact-by-id.handler.ts`
- `Application/backend/src/modules/customer/contacts/application/commands/soft-delete-contact/soft-delete-contact.handler.ts`
- `Application/backend/src/modules/customer/contacts/application/commands/create-contact/create-contact.handler.ts`
- `Application/backend/src/modules/customer/contacts/application/commands/reactivate-contact/reactivate-contact.handler.ts`
- `Application/backend/src/modules/customer/contacts/application/commands/update-contact/update-contact.handler.ts`
- `Application/backend/src/modules/customer/contacts/application/commands/restore-contact/restore-contact.handler.ts`
- `Application/backend/src/modules/customer/contacts/application/commands/permanent-delete-contact/permanent-delete-contact.handler.ts`
- `Application/backend/src/modules/customer/contacts/application/commands/deactivate-contact/deactivate-contact.handler.ts`
- `Application/backend/src/modules/customer/contacts/application/event-handlers/on-contact-deactivated.handler.ts`
- `Application/backend/src/modules/customer/contacts/application/event-handlers/on-contact-created.handler.ts`
- `Application/backend/src/modules/customer/tour-plans/application/queries/get-tour-plan-by-id/get-tour-plan-by-id.handler.ts`
- `Application/backend/src/modules/customer/tour-plans/application/queries/get-tour-plan-list/get-tour-plan-list.handler.ts`
- `Application/backend/src/modules/customer/tour-plans/application/queries/get-tour-plan-stats/get-tour-plan-stats.handler.ts`
- `Application/backend/src/modules/customer/tour-plans/application/commands/reject-tour-plan/reject-tour-plan.handler.ts`
- `Application/backend/src/modules/customer/tour-plans/application/commands/update-tour-plan/update-tour-plan.handler.ts`
- `Application/backend/src/modules/customer/tour-plans/application/commands/check-in-visit/check-in-visit.handler.ts`
- `Application/backend/src/modules/customer/tour-plans/application/commands/create-tour-plan/create-tour-plan.handler.ts`
- `Application/backend/src/modules/customer/tour-plans/application/commands/approve-tour-plan/approve-tour-plan.handler.ts`
- `Application/backend/src/modules/customer/tour-plans/application/commands/submit-tour-plan/submit-tour-plan.handler.ts`
- `Application/backend/src/modules/customer/tour-plans/application/commands/cancel-tour-plan/cancel-tour-plan.handler.ts`
- `Application/backend/src/modules/customer/tour-plans/application/commands/check-out-visit/check-out-visit.handler.ts`
- `Application/backend/src/modules/customer/dashboard/application/queries/get-leaderboard/get-leaderboard.handler.ts`
- `Application/backend/src/modules/customer/dashboard/application/queries/get-revenue-analytics/get-revenue-analytics.handler.ts`
- `Application/backend/src/modules/customer/dashboard/application/queries/get-velocity-metrics/get-velocity-metrics.handler.ts`
- `Application/backend/src/modules/customer/dashboard/application/queries/get-activity-heatmap/get-activity-heatmap.handler.ts`
- `Application/backend/src/modules/customer/dashboard/application/queries/get-my-dashboard/get-my-dashboard.handler.ts`
- `Application/backend/src/modules/customer/dashboard/application/queries/get-aging-analysis/get-aging-analysis.handler.ts`
- `Application/backend/src/modules/customer/dashboard/application/queries/get-sales-pipeline/get-sales-pipeline.handler.ts`
- `Application/backend/src/modules/customer/dashboard/application/queries/get-lost-reason-analysis/get-lost-reason-analysis.handler.ts`
- `Application/backend/src/modules/customer/dashboard/application/queries/get-executive-dashboard/get-executive-dashboard.handler.ts`
- `Application/backend/src/modules/customer/dashboard/application/queries/get-sales-funnel/get-sales-funnel.handler.ts`
- `Application/backend/src/modules/customer/dashboard/application/queries/get-lead-source-analysis/get-lead-source-analysis.handler.ts`
- `Application/backend/src/modules/customer/dashboard/application/queries/get-target-tracking/get-target-tracking.handler.ts`
- `Application/backend/src/modules/customer/dashboard/application/queries/get-team-performance/get-team-performance.handler.ts`
- `Application/backend/src/modules/customer/dashboard/application/queries/get-report-exports/get-report-exports.handler.ts`
- `Application/backend/src/modules/customer/dashboard/application/commands/update-target/update-target.handler.ts`
- `Application/backend/src/modules/customer/dashboard/application/commands/delete-target/delete-target.handler.ts`
- `Application/backend/src/modules/customer/dashboard/application/commands/create-target/create-target.handler.ts`
- `Application/backend/src/modules/customer/dashboard/application/commands/export-report/export-report.handler.ts`
- `Application/backend/src/modules/customer/ownership/application/queries/get-workload-dashboard/get-workload-dashboard.handler.ts`
- `Application/backend/src/modules/customer/ownership/application/queries/get-ownership-history/get-ownership-history.handler.ts`
- `Application/backend/src/modules/customer/ownership/application/queries/get-assignment-rules/get-assignment-rules.handler.ts`
- `Application/backend/src/modules/customer/ownership/application/queries/get-reassignment-preview/get-reassignment-preview.handler.ts`
- `Application/backend/src/modules/customer/ownership/application/queries/get-entity-owners/get-entity-owners.handler.ts`
- `Application/backend/src/modules/customer/ownership/application/queries/get-user-entities/get-user-entities.handler.ts`
- `Application/backend/src/modules/customer/ownership/application/queries/get-user-workload/get-user-workload.handler.ts`
- `Application/backend/src/modules/customer/ownership/application/queries/get-unassigned-entities/get-unassigned-entities.handler.ts`
- `Application/backend/src/modules/customer/ownership/application/queries/get-delegation-status/get-delegation-status.handler.ts`
- `Application/backend/src/modules/customer/ownership/application/commands/delegate-ownership/delegate-ownership.handler.ts`
- `Application/backend/src/modules/customer/ownership/application/commands/update-assignment-rule/update-assignment-rule.handler.ts`
- `Application/backend/src/modules/customer/ownership/application/commands/create-assignment-rule/create-assignment-rule.handler.ts`
- `Application/backend/src/modules/customer/ownership/application/commands/delete-assignment-rule/delete-assignment-rule.handler.ts`
- `Application/backend/src/modules/customer/ownership/application/commands/revoke-owner/revoke-owner.handler.ts`
- `Application/backend/src/modules/customer/ownership/application/commands/revert-delegation/revert-delegation.handler.ts`
- `Application/backend/src/modules/customer/ownership/application/commands/assign-owner/assign-owner.handler.ts`
- `Application/backend/src/modules/customer/ownership/application/commands/transfer-owner/transfer-owner.handler.ts`
- `Application/backend/src/modules/customer/ownership/application/commands/set-user-availability/set-user-availability.handler.ts`
- `Application/backend/src/modules/customer/ownership/application/commands/auto-assign/auto-assign.handler.ts`
- `Application/backend/src/modules/customer/ownership/application/commands/update-user-capacity/update-user-capacity.handler.ts`
- `Application/backend/src/modules/customer/ownership/application/commands/bulk-transfer/bulk-transfer.handler.ts`
- `Application/backend/src/modules/customer/ownership/application/commands/bulk-assign/bulk-assign.handler.ts`
- `Application/backend/src/modules/customer/bulk-import/application/queries/get-row-detail/get-row-detail.handler.ts`
- `Application/backend/src/modules/customer/bulk-import/application/queries/get-job-rows/get-job-rows.handler.ts`
- `Application/backend/src/modules/customer/bulk-import/application/queries/get-job-list/get-job-list.handler.ts`
- `Application/backend/src/modules/customer/bulk-import/application/queries/get-duplicates/get-duplicates.handler.ts`
- `Application/backend/src/modules/customer/bulk-import/application/queries/get-job-result/get-job-result.handler.ts`
- `Application/backend/src/modules/customer/bulk-import/application/queries/get-job-detail/get-job-detail.handler.ts`
- `Application/backend/src/modules/customer/bulk-import/application/queries/get-profile-detail/get-profile-detail.handler.ts`
- `Application/backend/src/modules/customer/bulk-import/application/queries/get-validation-summary/get-validation-summary.handler.ts`
- `Application/backend/src/modules/customer/bulk-import/application/queries/get-mapping-suggestions/get-mapping-suggestions.handler.ts`
- `Application/backend/src/modules/customer/bulk-import/application/queries/get-profile-list/get-profile-list.handler.ts`
- `Application/backend/src/modules/customer/bulk-import/application/commands/save-profile/save-profile.handler.ts`
- `Application/backend/src/modules/customer/bulk-import/application/commands/update-profile/update-profile.handler.ts`
- `Application/backend/src/modules/customer/bulk-import/application/commands/validate-rows/validate-rows.handler.ts`
- `Application/backend/src/modules/customer/bulk-import/application/commands/delete-profile/delete-profile.handler.ts`
- `Application/backend/src/modules/customer/bulk-import/application/commands/apply-mapping/apply-mapping.handler.ts`
- `Application/backend/src/modules/customer/bulk-import/application/commands/cancel-import/cancel-import.handler.ts`
- `Application/backend/src/modules/customer/bulk-import/application/commands/commit-import/commit-import.handler.ts`
- `Application/backend/src/modules/customer/bulk-import/application/commands/clone-profile/clone-profile.handler.ts`
- `Application/backend/src/modules/customer/bulk-import/application/commands/upload-file/upload-file.handler.ts`
- `Application/backend/src/modules/customer/bulk-import/application/commands/row-action/row-action.handler.ts`
- `Application/backend/src/modules/customer/bulk-import/application/commands/row-bulk-action/row-bulk-action.handler.ts`
- `Application/backend/src/modules/customer/bulk-import/application/commands/select-profile/select-profile.handler.ts`
- `Application/backend/src/modules/customer/bulk-import/application/commands/edit-row/edit-row.handler.ts`
- `Application/backend/src/modules/customer/bulk-import/application/commands/revalidate-row/revalidate-row.handler.ts`
- `Application/backend/src/modules/customer/bulk-import/application/commands/create-profile/create-profile.handler.ts`
- `Application/backend/src/modules/customer/activities/application/queries/get-activity-by-id/get-activity-by-id.handler.ts`
- `Application/backend/src/modules/customer/activities/application/queries/get-activity-list/get-activity-list.handler.ts`
- `Application/backend/src/modules/customer/activities/application/queries/get-activities-by-entity/get-activities-by-entity.handler.ts`
- `Application/backend/src/modules/customer/activities/application/queries/get-activity-stats/get-activity-stats.handler.ts`
- `Application/backend/src/modules/customer/activities/application/commands/permanent-delete-activity/permanent-delete-activity.handler.ts`
- `Application/backend/src/modules/customer/activities/application/commands/reactivate-activity/reactivate-activity.handler.ts`
- `Application/backend/src/modules/customer/activities/application/commands/complete-activity/complete-activity.handler.ts`
- `Application/backend/src/modules/customer/activities/application/commands/delete-activity/delete-activity.handler.ts`
- `Application/backend/src/modules/customer/activities/application/commands/soft-delete-activity/soft-delete-activity.handler.ts`
- `Application/backend/src/modules/customer/activities/application/commands/create-activity/create-activity.handler.ts`
- `Application/backend/src/modules/customer/activities/application/commands/update-activity/update-activity.handler.ts`
- `Application/backend/src/modules/customer/activities/application/commands/restore-activity/restore-activity.handler.ts`
- `Application/backend/src/modules/customer/activities/application/commands/deactivate-activity/deactivate-activity.handler.ts`
- `Application/backend/src/modules/customer/follow-ups/application/queries/get-follow-up-stats/get-follow-up-stats.handler.ts`
- `Application/backend/src/modules/customer/follow-ups/application/queries/get-follow-up-by-id/get-follow-up-by-id.handler.ts`
- `Application/backend/src/modules/customer/follow-ups/application/queries/get-overdue-follow-ups/get-overdue-follow-ups.handler.ts`
- `Application/backend/src/modules/customer/follow-ups/application/queries/get-follow-up-list/get-follow-up-list.handler.ts`
- `Application/backend/src/modules/customer/follow-ups/application/commands/create-follow-up/create-follow-up.handler.ts`
- `Application/backend/src/modules/customer/follow-ups/application/commands/update-follow-up/update-follow-up.handler.ts`
- `Application/backend/src/modules/customer/follow-ups/application/commands/reassign-follow-up/reassign-follow-up.handler.ts`
- `Application/backend/src/modules/customer/follow-ups/application/commands/snooze-follow-up/snooze-follow-up.handler.ts`
- `Application/backend/src/modules/customer/follow-ups/application/commands/complete-follow-up/complete-follow-up.handler.ts`
- `Application/backend/src/modules/customer/follow-ups/application/commands/delete-follow-up/delete-follow-up.handler.ts`
- `Application/backend/src/modules/customer/quotations/application/queries/get-quotation-by-id/get-quotation-by-id.handler.ts`
- `Application/backend/src/modules/customer/quotations/application/queries/get-industry-analytics/get-industry-analytics.handler.ts`
- `Application/backend/src/modules/customer/quotations/application/queries/get-quotation-versions/get-quotation-versions.handler.ts`
- `Application/backend/src/modules/customer/quotations/application/queries/get-templates/get-templates.handler.ts`
- `Application/backend/src/modules/customer/quotations/application/queries/get-quotation-comparison/get-quotation-comparison.handler.ts`
- `Application/backend/src/modules/customer/quotations/application/queries/get-prediction-matrix/get-prediction-matrix.handler.ts`
- `Application/backend/src/modules/customer/quotations/application/queries/get-quotation-analytics/get-quotation-analytics.handler.ts`
- `Application/backend/src/modules/customer/quotations/application/queries/get-negotiation-history/get-negotiation-history.handler.ts`
- `Application/backend/src/modules/customer/quotations/application/queries/list-quotations/list-quotations.handler.ts`
- `Application/backend/src/modules/customer/quotations/application/queries/get-product-analytics/get-product-analytics.handler.ts`
- `Application/backend/src/modules/customer/quotations/application/queries/get-best-quotations/get-best-quotations.handler.ts`
- `Application/backend/src/modules/customer/quotations/application/queries/get-quotation-timeline/get-quotation-timeline.handler.ts`
- `Application/backend/src/modules/customer/quotations/application/commands/recalculate-totals/recalculate-totals.handler.ts`
- `Application/backend/src/modules/customer/quotations/application/commands/accept-quotation/accept-quotation.handler.ts`
- `Application/backend/src/modules/customer/quotations/application/commands/revise-quotation/revise-quotation.handler.ts`
- `Application/backend/src/modules/customer/quotations/application/commands/create-from-template/create-from-template.handler.ts`
- `Application/backend/src/modules/customer/quotations/application/commands/clone-quotation/clone-quotation.handler.ts`
- `Application/backend/src/modules/customer/quotations/application/commands/cancel-quotation/cancel-quotation.handler.ts`
- `Application/backend/src/modules/customer/quotations/application/commands/log-negotiation/log-negotiation.handler.ts`
- `Application/backend/src/modules/customer/quotations/application/commands/reject-quotation/reject-quotation.handler.ts`
- `Application/backend/src/modules/customer/quotations/application/commands/update-quotation/update-quotation.handler.ts`
- `Application/backend/src/modules/customer/quotations/application/commands/mark-viewed/mark-viewed.handler.ts`
- `Application/backend/src/modules/customer/quotations/application/commands/remove-line-item/remove-line-item.handler.ts`
- `Application/backend/src/modules/customer/quotations/application/commands/send-quotation/send-quotation.handler.ts`
- `Application/backend/src/modules/customer/quotations/application/commands/update-line-item/update-line-item.handler.ts`
- `Application/backend/src/modules/customer/quotations/application/commands/create-quotation/create-quotation.handler.ts`
- `Application/backend/src/modules/customer/quotations/application/commands/ai-generate-quotation/ai-generate-quotation.handler.ts`
- `Application/backend/src/modules/customer/quotations/application/commands/add-line-item/add-line-item.handler.ts`
- `Application/backend/src/modules/customer/documents/application/queries/get-document-by-id/get-document-by-id.handler.ts`
- `Application/backend/src/modules/customer/documents/application/queries/search-documents/search-documents.handler.ts`
- `Application/backend/src/modules/customer/documents/application/queries/get-entity-documents/get-entity-documents.handler.ts`
- `Application/backend/src/modules/customer/documents/application/queries/get-share-link/get-share-link.handler.ts`
- `Application/backend/src/modules/customer/documents/application/queries/get-document-stats/get-document-stats.handler.ts`
- `Application/backend/src/modules/customer/documents/application/queries/get-document-activity/get-document-activity.handler.ts`
- `Application/backend/src/modules/customer/documents/application/queries/get-cloud-connections/get-cloud-connections.handler.ts`
- `Application/backend/src/modules/customer/documents/application/queries/get-folder-contents/get-folder-contents.handler.ts`
- `Application/backend/src/modules/customer/documents/application/queries/get-document-versions/get-document-versions.handler.ts`
- `Application/backend/src/modules/customer/documents/application/queries/get-folder-tree/get-folder-tree.handler.ts`
- `Application/backend/src/modules/customer/documents/application/queries/get-document-list/get-document-list.handler.ts`
- `Application/backend/src/modules/customer/documents/application/commands/create-share-link/create-share-link.handler.ts`
- `Application/backend/src/modules/customer/documents/application/commands/connect-cloud/connect-cloud.handler.ts`
- `Application/backend/src/modules/customer/documents/application/commands/detach-document/detach-document.handler.ts`
- `Application/backend/src/modules/customer/documents/application/commands/revoke-share-link/revoke-share-link.handler.ts`
- `Application/backend/src/modules/customer/documents/application/commands/create-folder/create-folder.handler.ts`
- `Application/backend/src/modules/customer/documents/application/commands/delete-folder/delete-folder.handler.ts`
- `Application/backend/src/modules/customer/documents/application/commands/move-document/move-document.handler.ts`
- `Application/backend/src/modules/customer/documents/application/commands/update-folder/update-folder.handler.ts`
- `Application/backend/src/modules/customer/documents/application/commands/attach-document/attach-document.handler.ts`
- `Application/backend/src/modules/customer/documents/application/commands/disconnect-cloud/disconnect-cloud.handler.ts`
- `Application/backend/src/modules/customer/documents/application/commands/link-cloud-file/link-cloud-file.handler.ts`
- `Application/backend/src/modules/customer/documents/application/commands/upload-document/upload-document.handler.ts`
- `Application/backend/src/modules/customer/documents/application/commands/delete-document/delete-document.handler.ts`
- `Application/backend/src/modules/customer/documents/application/commands/upload-version/upload-version.handler.ts`
- `Application/backend/src/modules/customer/documents/application/commands/update-document/update-document.handler.ts`
- `Application/backend/src/modules/customer/performance/application/queries/get-leaderboard/get-leaderboard.handler.ts`
- `Application/backend/src/modules/customer/performance/application/queries/get-target/get-target.handler.ts`
- `Application/backend/src/modules/customer/performance/application/queries/list-targets/list-targets.handler.ts`
- `Application/backend/src/modules/customer/performance/application/queries/get-team-performance/get-team-performance.handler.ts`
- `Application/backend/src/modules/customer/performance/application/commands/update-target/update-target.handler.ts`
- `Application/backend/src/modules/customer/performance/application/commands/delete-target/delete-target.handler.ts`
- `Application/backend/src/modules/customer/performance/application/commands/create-target/create-target.handler.ts`
- `Application/backend/src/modules/customer/demos/application/queries/get-demos-by-lead/get-demos-by-lead.handler.ts`
- `Application/backend/src/modules/customer/demos/application/queries/get-demo-by-id/get-demo-by-id.handler.ts`
- `Application/backend/src/modules/customer/demos/application/queries/get-demo-stats/get-demo-stats.handler.ts`
- `Application/backend/src/modules/customer/demos/application/queries/get-demo-list/get-demo-list.handler.ts`
- `Application/backend/src/modules/customer/demos/application/commands/complete-demo/complete-demo.handler.ts`
- `Application/backend/src/modules/customer/demos/application/commands/create-demo/create-demo.handler.ts`
- `Application/backend/src/modules/customer/demos/application/commands/update-demo/update-demo.handler.ts`
- `Application/backend/src/modules/customer/demos/application/commands/cancel-demo/cancel-demo.handler.ts`
- `Application/backend/src/modules/customer/demos/application/commands/reschedule-demo/reschedule-demo.handler.ts`
- `Application/backend/src/modules/customer/reminders/application/queries/get-reminder-stats/get-reminder-stats.handler.ts`
- `Application/backend/src/modules/customer/reminders/application/queries/get-reminder-list/get-reminder-list.handler.ts`
- `Application/backend/src/modules/customer/reminders/application/queries/get-manager-reminder-stats/get-manager-reminder-stats.handler.ts`
- `Application/backend/src/modules/customer/reminders/application/queries/get-pending-reminders/get-pending-reminders.handler.ts`
- `Application/backend/src/modules/customer/reminders/application/commands/acknowledge-reminder/acknowledge-reminder.handler.ts`
- `Application/backend/src/modules/customer/reminders/application/commands/cancel-reminder/cancel-reminder.handler.ts`
- `Application/backend/src/modules/customer/reminders/application/commands/dismiss-reminder/dismiss-reminder.handler.ts`
- `Application/backend/src/modules/customer/reminders/application/commands/create-reminder/create-reminder.handler.ts`
- `Application/backend/src/modules/customer/reminders/application/commands/snooze-reminder/snooze-reminder.handler.ts`
- `Application/backend/src/modules/customer/email/application/commands/process-tracking-event/process-tracking-event.handler.ts`
- `Application/backend/src/modules/customer/email/application/commands/connect-account/connect-account.handler.ts`
- `Application/backend/src/modules/customer/email/application/commands/unlink-email-from-entity/unlink-email-from-entity.handler.ts`
- `Application/backend/src/modules/customer/email/application/commands/sync-inbox/sync-inbox.handler.ts`
- `Application/backend/src/modules/customer/email/application/commands/update-campaign/update-campaign.handler.ts`
- `Application/backend/src/modules/customer/email/application/commands/mark-read/mark-read.handler.ts`
- `Application/backend/src/modules/customer/email/application/commands/schedule-email/schedule-email.handler.ts`
- `Application/backend/src/modules/customer/email/application/commands/delete-signature/delete-signature.handler.ts`
- `Application/backend/src/modules/customer/email/application/commands/disconnect-account/disconnect-account.handler.ts`
- `Application/backend/src/modules/customer/email/application/commands/create-campaign/create-campaign.handler.ts`
- `Application/backend/src/modules/customer/email/application/commands/star-email/star-email.handler.ts`
- `Application/backend/src/modules/customer/email/application/commands/compose-email/compose-email.handler.ts`
- `Application/backend/src/modules/customer/email/application/commands/pause-campaign/pause-campaign.handler.ts`
- `Application/backend/src/modules/customer/email/application/commands/cancel-campaign/cancel-campaign.handler.ts`
- `Application/backend/src/modules/customer/email/application/commands/send-email/send-email.handler.ts`
- `Application/backend/src/modules/customer/email/application/commands/delete-template/delete-template.handler.ts`
- `Application/backend/src/modules/customer/email/application/commands/update-signature/update-signature.handler.ts`
- `Application/backend/src/modules/customer/email/application/commands/create-template/create-template.handler.ts`
- `Application/backend/src/modules/customer/email/application/commands/add-campaign-recipients/add-campaign-recipients.handler.ts`
- `Application/backend/src/modules/customer/email/application/commands/reply-email/reply-email.handler.ts`
- `Application/backend/src/modules/customer/email/application/commands/cancel-scheduled-email/cancel-scheduled-email.handler.ts`
- `Application/backend/src/modules/customer/email/application/commands/create-signature/create-signature.handler.ts`
- `Application/backend/src/modules/customer/email/application/commands/link-email-to-entity/link-email-to-entity.handler.ts`
- `Application/backend/src/modules/customer/email/application/commands/update-template/update-template.handler.ts`
- `Application/backend/src/modules/customer/email/application/commands/start-campaign/start-campaign.handler.ts`
- `Application/backend/src/modules/customer/whatsapp/application/commands/create-broadcast/create-broadcast.handler.ts`
- `Application/backend/src/modules/customer/whatsapp/application/commands/assign-conversation/assign-conversation.handler.ts`
- `Application/backend/src/modules/customer/whatsapp/application/commands/send-location-message/send-location-message.handler.ts`
- `Application/backend/src/modules/customer/whatsapp/application/commands/sync-templates/sync-templates.handler.ts`
- `Application/backend/src/modules/customer/whatsapp/application/commands/start-broadcast/start-broadcast.handler.ts`
- `Application/backend/src/modules/customer/whatsapp/application/commands/send-template-message/send-template-message.handler.ts`
- `Application/backend/src/modules/customer/whatsapp/application/commands/toggle-chatbot-flow/toggle-chatbot-flow.handler.ts`
- `Application/backend/src/modules/customer/whatsapp/application/commands/opt-out-contact/opt-out-contact.handler.ts`
- `Application/backend/src/modules/customer/whatsapp/application/commands/setup-waba/setup-waba.handler.ts`
- `Application/backend/src/modules/customer/whatsapp/application/commands/send-text-message/send-text-message.handler.ts`
- `Application/backend/src/modules/customer/whatsapp/application/commands/reopen-conversation/reopen-conversation.handler.ts`
- `Application/backend/src/modules/customer/whatsapp/application/commands/link-conversation-to-entity/link-conversation-to-entity.handler.ts`
- `Application/backend/src/modules/customer/whatsapp/application/commands/add-broadcast-recipients/add-broadcast-recipients.handler.ts`
- `Application/backend/src/modules/customer/whatsapp/application/commands/create-chatbot-flow/create-chatbot-flow.handler.ts`
- `Application/backend/src/modules/customer/whatsapp/application/commands/send-media-message/send-media-message.handler.ts`
- `Application/backend/src/modules/customer/whatsapp/application/commands/resolve-conversation/resolve-conversation.handler.ts`
- `Application/backend/src/modules/customer/whatsapp/application/commands/delete-template/delete-template.handler.ts`
- `Application/backend/src/modules/customer/whatsapp/application/commands/update-chatbot-flow/update-chatbot-flow.handler.ts`
- `Application/backend/src/modules/customer/whatsapp/application/commands/create-template/create-template.handler.ts`
- `Application/backend/src/modules/customer/whatsapp/application/commands/pause-broadcast/pause-broadcast.handler.ts`
- `Application/backend/src/modules/customer/whatsapp/application/commands/update-waba/update-waba.handler.ts`
- `Application/backend/src/modules/customer/whatsapp/application/commands/cancel-broadcast/cancel-broadcast.handler.ts`
- `Application/backend/src/modules/customer/whatsapp/application/commands/opt-in-contact/opt-in-contact.handler.ts`
- `Application/backend/src/modules/customer/whatsapp/application/commands/mark-conversation-read/mark-conversation-read.handler.ts`
- `Application/backend/src/modules/customer/whatsapp/application/commands/update-template/update-template.handler.ts`
- `Application/backend/src/modules/customer/whatsapp/application/commands/create-quick-reply/create-quick-reply.handler.ts`
- `Application/backend/src/modules/customer/whatsapp/application/commands/send-interactive-message/send-interactive-message.handler.ts`
- `Application/backend/src/modules/customer/communications/application/queries/get-communications-by-entity/get-communications-by-entity.handler.ts`
- `Application/backend/src/modules/customer/communications/application/queries/get-communication-by-id/get-communication-by-id.handler.ts`
- `Application/backend/src/modules/customer/communications/application/commands/add-communication/add-communication.handler.ts`
- `Application/backend/src/modules/customer/communications/application/commands/link-to-entity/link-to-entity.handler.ts`
- `Application/backend/src/modules/customer/communications/application/commands/delete-communication/delete-communication.handler.ts`
- `Application/backend/src/modules/customer/communications/application/commands/set-primary/set-primary.handler.ts`
- `Application/backend/src/modules/customer/communications/application/commands/mark-verified/mark-verified.handler.ts`
- `Application/backend/src/modules/customer/communications/application/commands/update-communication/update-communication.handler.ts`

---

## Untested Services (priority 2)

- `Application/backend/src/core/auth/platform-bootstrap.service.ts`
- `Application/backend/src/core/prisma/cross-db-resolver.service.ts`
- `Application/backend/src/core/permissions/services/permission-chain.service.ts`
- `Application/backend/src/core/permissions/services/permission-cache.service.ts`
- `Application/backend/src/shared/infrastructure/storage/r2-storage.service.ts`
- `Application/backend/src/common/architecture-validator/architecture-validator.service.ts`
- `Application/backend/src/common/request/request-context.service.ts`
- `Application/backend/src/modules/core/identity/tenant/infrastructure/tenant-context.service.ts`
- `Application/backend/src/modules/core/identity/tenant/services/usage-tracker.service.ts`
- `Application/backend/src/modules/core/identity/tenant/services/module-access.service.ts`
- `Application/backend/src/modules/core/identity/tenant/services/system-health.service.ts`
- `Application/backend/src/modules/core/identity/tenant/services/page-menu-sync.service.ts`
- `Application/backend/src/modules/core/identity/tenant/services/industry-patching.service.ts`
- `Application/backend/src/modules/core/identity/tenant/services/tenant-profile.service.ts`
- `Application/backend/src/modules/core/identity/tenant/services/page-scanner.service.ts`
- `Application/backend/src/modules/core/identity/tenant/services/license.service.ts`
- `Application/backend/src/modules/core/identity/tenant/services/tenant-activity.service.ts`
- `Application/backend/src/modules/core/identity/tenant/services/software-offer.service.ts`
- `Application/backend/src/modules/core/identity/tenant/services/package-builder.service.ts`
- `Application/backend/src/modules/core/identity/tenant/services/vendor-packages.service.ts`

---

## Test Template (CRMSoft CQRS Pattern)

```typescript
// Generated template — adapt to your handler
import { Test, TestingModule } from '@nestjs/testing';
import { XxxHandler } from './xxx.handler';
import { createMockPrismaService } from '../../../test/helpers/mock-prisma';

describe('XxxHandler', () => {
  let handler: XxxHandler;
  let mockPrisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(async () => {
    mockPrisma = createMockPrismaService();
    const module: TestingModule = await Test.createTestingModule({
      providers: [XxxHandler, { provide: 'PRISMA', useValue: mockPrisma }],
    }).compile();
    handler = module.get<XxxHandler>(XxxHandler);
  });

  // 1. Happy path (MANDATORY)
  it('should execute successfully', async () => {
    // arrange + act + assert
  });

  // 2. Error cases (MANDATORY — min 2)
  it('should fail when tenant not found', async () => { });
  it('should fail with invalid input', async () => { });

  // 3. Tenant isolation (MANDATORY for common modules)
  it('should not return data from other tenants', async () => { });

  // 4. verticalData (MANDATORY for common modules)
  it('should validate verticalData for SOFTWARE_VENDOR', async () => { });
  it('should accept empty verticalData for GENERAL', async () => { });
});
```

---

## Next Steps

1. Run `pnpm test:generate src/modules/<name>` to scaffold tests for a specific module
2. Run `pnpm test:api` after generating to verify tests compile
3. Target: 60% coverage minimum → 80% over time

---
_Generated by PM CLI Phase 2 Test Generator Skill_

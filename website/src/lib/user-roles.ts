import { components } from "./api";
import { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";

export const USER_ROLES = new Map<components["schemas"]["UserRole"], MessageDescriptor>([
  ["division-director", msg`Division Director`],
  ["controller-training-director", msg`Controller Training Director`],
  ["controller-training-director-assistant", msg`Controller Training Director Assistant`],
  ["controller-training-instructor", msg`Instructor`],
  ["controller-training-mentor", msg`Mentor`],
  ["controller-training-sop-editor", msg`SOP Editor`],
  ["community-director", msg`Community & Membership Director`],
  ["operation-director", msg`Operation Director`],
  ["operation-director-assistant", msg`Operation Director Assistant`],
  ["operation-sector-editor", msg`Sector Editor`],
  ["operation-loa-editor", msg`LOA Editor`],
  ["event-director", msg`Event & Organization Director`],
  ["lead-event-coordinator", msg`Lead Event Coordinator`],
  ["event-coordinator", msg`Event Coordinator`],
  ["event-graphics-designer", msg`Graphics Designer`],
  ["tech-director", msg`Tech Director`],
  ["tech-director-assistant", msg`Tech Director Assistant`],
  ["software-engineer", msg`Software Engineer`],
  ["tech-afv-facility-engineer", msg`AFV Facility Engineer`],
  ["controller", msg`Controller`],
  ["staff", msg`Staff`],
  ["volunteer", msg`Volunteer`],
  ["api-client", msg`API Client`],
  ["user", msg`User`],
]);

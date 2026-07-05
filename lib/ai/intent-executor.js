import { INTENT_CAPABILITIES } from "./capabilities";

import { executeAppointmentIntent } from "./executors/appointments";
import { executePatientIntent } from "./executors/patients";
import { executeQueueIntent } from "./executors/queue";
import { executeOperationsIntent } from "./executors/operations";
import { executeClinicalIntent } from "./executors/clinical";

export async function executeIntent({
  intent,
  parameters = {},
  session
}) {
  const capability =
    INTENT_CAPABILITIES[intent] || "unknown";

  switch (capability) {
    case "appointments":
      return executeAppointmentIntent(
        intent,
        parameters,
        session
      );

    case "patients":
      return executePatientIntent(
        intent,
        parameters,
        session
      );

    case "queue":
      return executeQueueIntent(
        intent,
        parameters,
        session
      );

    case "operations":
      return executeOperationsIntent(
        intent,
        parameters,
        session
      );

    case "clinical":
      return executeClinicalIntent(
        intent,
        parameters,
        session
      );  

    default:
      return {
        type: "message",
        message:
          "This capability has not been implemented yet."
      };
  }
}
import { executeQuery } from "@/lib/db";
import {getAzureOpenAIClient} from "@/lib/ai/azure-openai";

export async function executeClinicalIntent(
  intent,
  parameters,
  session
) {
  switch (intent) {
    case "summarizePatientHistory":
      return summarizePatientHistory(
        parameters,
        session
      );
    case "generateHandoverSummary":
        return generateHandoverSummary(
            parameters,
            session
);
    default:
      return {
        type: "message",
        message:
          "Clinical capability not implemented."
      };
  }
}

async function summarizePatientHistory(
  parameters,
  session
) {
  const patientName =
    parameters.patientName;

  if (!patientName) {
    return {
      type: "message",
      message:
        "Please specify a patient name."
    };
  }

    const patientResult =
    await executeQuery(
        `
        SELECT TOP 1 *
        FROM Patients
        WHERE fullName
        LIKE '%' + @name + '%'
        `,
        {
        name: patientName
        }
    );

    if (
    patientResult.recordset.length === 0
    ) {
    return {
        type: "message",
        message:
        `No patient found named ${patientName}.`
    };
    }

    const patient =
    patientResult.recordset[0];

    const notesResult =
    await executeQuery(
        `
        SELECT TOP 3
        note,
        createdAt
        FROM ClinicalNotes
        WHERE patientId = @patientId
        ORDER BY createdAt DESC
        `,
        {
        patientId:
            patient.patientId
        }
    );

    const vitalsResult =
    await executeQuery(
        `
        SELECT TOP 3
        temperature,
        heartRate,
        bloodPressure,
        respiratoryRate,
        oxygenSaturation,
        weight,
        height,
        recordedAt
        FROM Vitals
        WHERE patientId = @patientId
        ORDER BY recordedAt DESC
        `,
        {
        patientId:
            patient.patientId
        }
    );

    const prescriptionsResult =
    await executeQuery(
        `
        SELECT TOP 3
        medication,
        dosage,
        frequency,
        duration,
        instructions,
        status,
        createdAt
        FROM Prescriptions
        WHERE patientId = @patientId
        ORDER BY createdAt DESC
        `,
        {
        patientId:
            patient.patientId
        }
    );
    const prompt = `
    You are assisting a physician.

    PATIENT INFORMATION
    -------------------
    Name: ${patient.fullName}
    Date of Birth: ${patient.dateOfBirth}
    Gender: ${patient.gender}
    Blood Group: ${patient.bloodGroup}

    RECENT CLINICAL NOTES
    ---------------------
    ${JSON.stringify(
    notesResult.recordset,
    null,
    2
    )}

    RECENT VITALS
    -------------
    ${JSON.stringify(
    vitalsResult.recordset,
    null,
    2
    )}

    PRESCRIPTIONS
    -------------
    ${JSON.stringify(
    prescriptionsResult.recordset,
    null,
    2
    )}

    Please provide:

    1. Patient overview
    2. Significant clinical findings
    3. Medication summary
    4. Important observations
    5. Suggested follow-up considerations

    Keep the summary concise and professional.
    `;
        let summary =
        "Unable to generate patient summary at this time.";
        const client = getAzureOpenAIClient();
        try {
        const result =
            await client.chat.completions.create({
            messages: [
                {
                role: "system",
                content:
                    "You are an AI clinical assistant helping physicians summarize patient records."
                },
                {
                role: "user",
                content: prompt
                }
            ],
            model: ""
            });

        summary =
            result.choices[0].message.content;
        }
        catch (error) {
            console.error(
                "Patient summary error:",
                error
        );
        }
    return {
        type: "patientSummary",
        data: {
            patientId:
                patient.patientId,
            patientName:
                patient.fullName,
            summary
        }
    };    
}

async function generateHandoverSummary(
  parameters,
  session
) {
    const patientResult =
  await executeQuery(
    `
    SELECT TOP 1 *
    FROM Patients
    WHERE fullName
      LIKE '%' + @name + '%'
    `,
    {
      name:
        parameters.patientName
    }
  );
  if (
  patientResult.recordset.length === 0
) {
  return {
    type: "message",
    message:
      `No patient found named ${parameters.patientName}.`
  };
}

const patient =
  patientResult.recordset[0];

const vitalsResult =
  await executeQuery(
    `
    SELECT TOP 1
      temperature,
      heartRate,
      bloodPressure,
      respiratoryRate,
      oxygenSaturation,
      recordedAt
    FROM Vitals
    WHERE patientId = @patientId
    ORDER BY recordedAt DESC
    `,
    {
      patientId:
        patient.patientId
    }
  );
const medicationResult =
  await executeQuery(
    `
    SELECT TOP 1
      medication,
      dosage,
      frequency,
      status,
      route,
      administeredAt
    FROM MedicationAdministration
    WHERE patientId = @patientId
    ORDER BY administeredAt DESC
    `,
    {
      patientId:
        patient.patientId
    }
  );

const notesResult =
  await executeQuery(
    `
    SELECT TOP 1
      note,
      createdAt
    FROM ClinicalNotes
    WHERE patientId = @patientId
    ORDER BY createdAt DESC
    `,
    {
      patientId:
        patient.patientId
    }
  );

const prompt = `
You are assisting a nurse during shift handover.

PATIENT
-------
Name: ${patient.fullName}
Gender: ${patient.gender}
Date of Birth: ${patient.dateOfBirth}

RECENT VITALS
-------------
${JSON.stringify(
  vitalsResult.recordset,
  null,
  2
)}

RECENT MEDICATION ADMINISTRATION
--------------------------------
${JSON.stringify(
  medicationResult.recordset,
  null,
  2
)}

RECENT CLINICAL NOTES
---------------------
${JSON.stringify(
  notesResult.recordset,
  null,
  2
)}

Provide:

1. Current patient status
2. Recent interventions
3. Outstanding concerns
4. Monitoring requirements
5. Important information for the next nursing shift.

Keep the summary concise and practical.
`;

let summary =
  "Unable to generate handover summary at this time.";
const client = getAzureOpenAIClient();
try {
  const result =
    await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an AI nursing assistant helping with shift handovers."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: ""
    });

  summary =
    result.choices[0]
      .message.content;
}
catch (error) {
  console.error(
    "Handover summary error:",
    error
  );
}
return {
  type: "handoverSummary",
  data: {
    patientId:
      patient.patientId,
    patientName:
      patient.fullName,
    summary
  }
};
}
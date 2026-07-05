import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const BASE_URL = "http://localhost:3000/api/demo-seed";
const PATIENTS_URL = "http://localhost:3000/api/patients";

const DEPARTMENTS_URL = "http://localhost:3000/api/departments";

const DOCTORS_URL = "http://localhost:3000/api/doctors";

const NURSES_URL = "http://localhost:3000/api/nurses";


const firstNames = [
  "Samuel",
  "Ngozi",
  "Aisha",
  "David",
  "Grace",
  "Chinedu",
  "Fatima",
  "Mercy",
  "Esther",
  "John",
  "Blessing",
  "Ibrahim",
  "Mary",
  "Daniel",
  "Emeka",
  "Adaobi",
  "Tunde",
  "Kelechi",
  "Victoria",
  "Joy"
];

const lastNames = [
  "Adeyemi",
  "Okafor",
  "Bello",
  "Musa",
  "James",
  "Williams",
  "Obi",
  "Yusuf",
  "Johnson",
  "Adebayo",
  "Nwosu",
  "Okeke",
  "Ali",
  "Eze",
  "Ojo",
  "Lawal",
  "Balogun",
  "Umeh",
  "Okon",
  "Mohammed"
];

const doctors = [
  {
    doctorId: "DOC-000001",
    fullName: "Dr Amina Bello",
    email: "amina.bello@sleepnaijamomgmail.onmicrosoft.com",
    departmentCode: "GEN",
    specialization: "General Medicine"
  },
  {
    doctorId: "DOC-000002",
    fullName: "Dr Musa Ibrahim",
    email: "musa.ibrahim@sleepnaijamomgmail.onmicrosoft.com",
    departmentCode: "CAR",
    specialization: "Cardiology"
  },
  {
    doctorId: "DOC-000003",
    fullName: "Dr Esther Okeke",
    email: "esther.okeke@sleepnaijamomgmail.onmicrosoft.com",
    departmentCode: "PED",
    specialization: "Pediatrics"
  },
  {
    doctorId: "DOC-000004",
    fullName: "Dr Daniel Yusuf",
    email: "daniel.yusuf@sleepnaijamomgmail.onmicrosoft.com",
    departmentCode: "ORT",
    specialization: "Orthopedics"
  },
  {
    doctorId: "DOC-000005",
    fullName: "Dr Grace Nwosu",
    email: "grace.nwosu@sleepnaijamomgmail.onmicrosoft.com",
    departmentCode: "NEU",
    specialization: "Neurology"
  }
];

const nurses = [
  {
    nurseId: "NUR-000001",
    fullName: "Fatima Ali",
    email: "fatima.ali@sleepnaijamomgmail.onmicrosoft.com",
    departmentCode: "GEN",
    ward: "Ward A",
    defaultShift: "Morning"
  },
  {
    nurseId: "NUR-000002",
    fullName: "Joy Okafor",
    email: "joy.okafor@sleepnaijamomgmail.onmicrosoft.com",
    departmentCode: "CAR",
    ward: "Ward B",
    defaultShift: "Morning"
  },
  {
    nurseId: "NUR-000003",
    fullName: "Blessing Adeyemi",
    email: "blessing.adeyemi@sleepnaijamomgmail.onmicrosoft.com",
    departmentCode: "PED",
    ward: "Ward C",
    defaultShift: "Afternoon"
  },
  {
    nurseId: "NUR-000004",
    fullName: "Mary Johnson",
    email: "mary.johnson@sleepnaijamomgmail.onmicrosoft.com",
    departmentCode: "ORT",
    ward: "Ward D",
    defaultShift: "Night"
  },
  {
    nurseId: "NUR-000005",
    fullName: "Victoria Eze",
    email: "victoria.eze@sleepnaijamomgmail.onmicrosoft.com",
    departmentCode: "EMR",
    ward: "Emergency",
    defaultShift: "Morning"
  },
  {
    nurseId: "NUR-000006",
    fullName: "Ruth Musa",
    email: "ruth.musa@sleepnaijamomgmail.onmicrosoft.com",
    departmentCode: "GEN",
    ward: "Ward A",
    defaultShift: "Night"
  },
  {
    nurseId: "NUR-000007",
    fullName: "Chioma Okeke",
    email: "chioma.okeke@sleepnaijamomgmail.onmicrosoft.com",
    departmentCode: "PED",
    ward: "Ward C",
    defaultShift: "Morning"
  },
  {
    nurseId: "NUR-000008",
    fullName: "Patience Bello",
    email: "patience.bello@sleepnaijamomgmail.onmicrosoft.com",
    departmentCode: "CAR",
    ward: "Ward B",
    defaultShift: "Afternoon"
  },
  {
    nurseId: "NUR-000009",
    fullName: "Esther Williams",
    email: "esther.williams@sleepnaijamomgmail.onmicrosoft.com",
    departmentCode: "NEU",
    ward: "Ward E",
    defaultShift: "Morning"
  },
  {
    nurseId: "NUR-000010",
    fullName: "Deborah Obi",
    email: "deborah.obi@sleepnaijamomgmail.onmicrosoft.com",
    departmentCode: "ORT",
    ward: "Ward D",
    defaultShift: "Night"
  }
];

const departments = [
  {
    code: "GEN",
    name: "General Medicine",
    ward: "Ward A",
    floor: "1"
  },
  {
    code: "CAR",
    name: "Cardiology",
    ward: "Ward B",
    floor: "2"
  },
  {
    code: "PED",
    name: "Pediatrics",
    ward: "Ward C",
    floor: "2"
  },
  {
    code: "ORT",
    name: "Orthopedics",
    ward: "Ward D",
    floor: "3"
  },
  {
    code: "EMR",
    name: "Emergency",
    ward: "Emergency",
    floor: "Ground"
  },
  {
    code: "NEU",
    name: "Neurology",
    ward: "Ward E",
    floor: "4"
  }
];

const appointmentTypes = [
  "Consultation",
  "Follow-up",
  "Review",
  "Walk-in"
];

const statuses = [
  "Scheduled",
  "Scheduled",
  "Scheduled",
  "Scheduled",

  "Pending",
  "Pending",
  "Pending",

  "Completed",
  "Completed",

  "Cancelled"
];

const priorities = [
  "Low",
  "Low",
  "Low",
  "Medium",
  "Medium",
  "High"
];

const notes = [
  "Routine consultation",
  "Follow-up visit",
  "Blood pressure review",
  "Medication review",
  "Annual check-up",
  "Persistent headache",
  "Chest discomfort",
  "General assessment",
  "Lab result discussion",
  "Emergency review"
];

const aiReasons = [
  "Generated from AI booking assistant",
  "Validated patient request",
  "Extracted from conversation",
  "AI identified probable consultation",
  "Appointment drafted from chat"
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPatient(index) {
  const fullName =
    `${randomItem(firstNames)} ${randomItem(lastNames)}`;

  return {
    patientId: `P-${String(index).padStart(6, "0")}`,
    fullName
  };
}

const patients =[];

for (let i = 1; i <= 50; i++) {
  patients.push(randomPatient(i));
}

async function seed() {
  console.log("🌱 Seeding demo appointments...\n");

  //
  // Seed Departments
  //
  for (const dept of departments) {
    await fetch(DEPARTMENTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        departmentCode: dept.code,
        departmentName: dept.name,
        ward: dept.ward,
        floor: dept.floor,
        headDoctor: null
      })
    });
  }

  console.log("✅ Departments seeded");

  //
  // Seed Doctors
  //
  for (const doctor of doctors) {
    await fetch(DOCTORS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        doctorId: doctor.doctorId,
        fullName: doctor.fullName,
        email: doctor.email,
        departmentCode: doctor.departmentCode,
        specialization: doctor.specialization,
        status: "Active"
      })
    });
  }

  console.log("✅ Doctors seeded");

  //
  // Seed Nurses
  //
  for (const nurse of nurses) {
    await fetch(NURSES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nurseId: nurse.nurseId,
        fullName: nurse.fullName,
        email: nurse.email,
        departmentCode: nurse.departmentCode,
        ward: nurse.ward,
        defaultShift: nurse.defaultShift,
        status: "Active"
      })
    });
  }

  console.log("✅ Nurses seeded");

  //
  // Seed Patients
  //
  for (const patient of patients) {
    const patientBody = {
      patientId: patient.patientId,
      fullName: patient.fullName,

      dateOfBirth: "1995-01-01",

      gender: Math.random() > 0.5
        ? "Male"
        : "Female",

      phone: `080${Math.floor(
        10000000 + Math.random() * 90000000
      )}`,

      email:
        patient.fullName
          .toLowerCase()
          .replace(/\s+/g, ".") +
        "@example.com",

      address: "Abuja, Nigeria",

      emergencyContactName: "Next of Kin",

      emergencyContactPhone: "08030000000",

      bloodGroup: randomItem([
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "O+",
        "O-"
      ]),

      nationalId: `NIN-${Math.floor(
        100000 + Math.random() * 900000
      )}`,

      insuranceProvider: "NHIA",

      insuranceNumber: `INS-${Math.floor(
        100000 + Math.random() * 900000
      )}`
    };

    await fetch(PATIENTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(patientBody)
    });
  }

  console.log("✅ Patients seeded");


  for (let i = 1; i <= 100; i++) {
    const daysOffset = Math.floor(Math.random() * 14) - 2;
    const hoursOffset = Math.floor(Math.random() * 8) + 8;

    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    date.setHours(hoursOffset, 0, 0, 0);
    const selectedDoctor = randomItem(doctors);

    const selectedDepartment = departments.find(
      d => d.code === selectedDoctor.departmentCode
    );

    const departmentNurses = nurses.filter(
      n => n.departmentCode === selectedDoctor.departmentCode
    );

    const selectedNurse = departmentNurses.length > 0
      ? randomItem(departmentNurses)
      : randomItem(nurses);

    const patient = randomItem(patients);

    
    const appointmentNumber =
      `APT-${String(i).padStart(6, "0")}`;

    const assignmentId =
      `NA-${String(i).padStart(6, "0")}`;
    const now = new Date();

    const appointmentDay = new Date(date);
    appointmentDay.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let allowedStatuses;

    if (appointmentDay > today) {
      // Future
      allowedStatuses = [
        "Scheduled",
        "Scheduled",
        "Scheduled",
        "Pending",
        "Cancelled"
      ];
    } else if (appointmentDay < today) {
      // Past
      allowedStatuses = [
        "Completed",
        "Completed",
        "Completed",
        "Pending",
        "Cancelled"
      ];
    } else {
      // Today
      allowedStatuses = [
        "Scheduled",
        "Scheduled",
        "Scheduled",
        "Pending",
        "Completed",
        "Cancelled"
      ];
    }

    const status = randomItem(allowedStatuses);

    let medStatuses;

    if (date > now) {
      medStatuses = ["Scheduled"];
    } else {
      medStatuses = [
        "Administered",
        "Scheduled",
        "Missed"
      ];
    }

    const patientCategory = randomItem([
      "Outpatient",
      "Outpatient",
      "Outpatient",
      "Outpatient",
      "Outpatient",
      "Outpatient",
      "Outpatient",
      "Inpatient",
      "Inpatient",
      "Emergency"
    ]);

    const isVerified =
    status === "Completed"
        ? true
        : status === "Scheduled"
        ? false
        : status === "Pending"
        ? false
        : Math.random() > 0.5;

    const prescriptionMedication = randomItem([
      "Paracetamol",
      "Ibuprofen",
      "Amoxicillin",
      "Metformin",
      "Vitamin C"
    ]);

    const prescriptionDosage = randomItem([
      "250mg",
      "500mg",
      "1000mg"
    ]);

    const prescriptionFrequency = randomItem([
      "Once Daily",
      "Twice Daily",
      "Three Times Daily"
    ]);

    const prescriptionStatuses = 
     date > now
        ? ["Active"]
        : ["Active", "Completed", "Cancelled"];
        
    const body = {
      patient: patient.fullName,
      patientId: patient.patientId,
      appointmentNumber,
      doctorId: selectedDoctor.doctorId,
      doctor: selectedDoctor.fullName,
      doctorEmail: selectedDoctor.email,
      appointmentDate: date.toISOString(),
      status,
      priority: randomItem(priorities),
      notes: randomItem(notes),
      aiReasoning: randomItem(aiReasons),
      isVerified,
      department: selectedDepartment.name,
      appointmentType: randomItem(appointmentTypes),
      patientCategory,
      createdBy: selectedNurse.email,
      lastUpdatedBy: selectedNurse.email
    };

    try {
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          appointment: body,

          clinicalNote: {
            note: randomItem(notes),
            createdBy: selectedDoctor.doctorId
          },

          prescription: {
            medication: prescriptionMedication,

            dosage: prescriptionDosage,

            frequency: prescriptionFrequency,

            duration: randomItem([
              "3 Days",
              "5 Days",
              "7 Days",
              "14 Days"
            ]),

            instructions: "Take after meals",
           
            status: randomItem(prescriptionStatuses)
          },

          vitals: 
            patientCategory === "Outpatient" &&
            Math.random() < 0.4
              ? null
              : 
          {
            recordedBy: selectedNurse.email,

            temperature: 36 + Math.random() * 2,

            heartRate: 60 + Math.floor(Math.random() * 40),

            bloodPressure:
              `${110 + Math.floor(Math.random() * 20)}/${70 + Math.floor(Math.random() * 15)}`,

            respiratoryRate:
              14 + Math.floor(Math.random() * 8),

            oxygenSaturation:
              95 + Math.floor(Math.random() * 5),

            weight:
              50 + Math.floor(Math.random() * 40),

            height:
              150 + Math.floor(Math.random() * 40)
          },

            medicationAdministration:
              patientCategory === "Outpatient"
                ? null
                : {
                    medication: prescriptionMedication,

                    dosage: prescriptionDosage,

                    frequency: prescriptionFrequency,

                    route: randomItem([
                      "Oral",
                      "IV",
                      "IM"
                    ]),

                    status: randomItem(medStatuses),

                    administeredBy: selectedNurse.email
                  },

          nurseAssignment: 
            patientCategory === "Outpatient"
              ? null
              :             
          {
            assignmentId,

            nurseEmail: selectedNurse.email,

            ward: selectedDepartment.ward,

            department: selectedDepartment.name,

            shift: randomItem([
              "Morning",
              "Afternoon",
              "Night"
            ]),

            status: "Assigned",

            assignedBy: "system"
          }
        })
      });

      if (!response.ok) {
        console.log(`❌ Failed at record ${i}`);
        console.log(await response.text());
        return;
      }


      
      console.log(`✅ ${i}/100`);
    } catch (err) {
      console.error(err);
      return;
    }
  }

  console.log("\n🎉 Demo data successfully seeded.");
}

seed();
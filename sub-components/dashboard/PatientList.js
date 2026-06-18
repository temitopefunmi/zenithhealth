'use client';

import React, { useEffect, useState } from "react";
import { Card, Table, Badge } from "react-bootstrap";

const PatientList = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    async function loadPatients() {
      try {
        const res = await fetch("/api/dashboard/doctor/patients");

        if (!res.ok) {
          throw new Error("Failed to load patients");
        }

        const data = await res.json();
        setPatients(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadPatients();
  }, []);

  return (
    <Card className="h-100">
      <Card.Header className="bg-white py-4">
        <h4 className="mb-0">My Patients</h4>
      </Card.Header>

      <Table responsive className="text-nowrap">
        <thead className="table-light">
          <tr>
            <th>Patient Name</th>
            <th>Department</th>
            <th>Appointment Type</th>
            <th>Status</th>
            <th>Priority</th>
          </tr>
        </thead>

        <tbody>
          {patients.map((item, index) => (
            <tr key={index}>
              <td className="align-middle fw-semibold">
                {item.patientName}
              </td>

              <td className="align-middle">
                {item.department}
              </td>

              <td className="align-middle">
                {item.appointmentType}
              </td>

              <td className="align-middle">
                <Badge
                  bg={
                    item.status === "Completed"
                      ? "success"
                      : item.status === "Pending"
                      ? "warning"
                      : item.status === "Cancelled"
                      ? "danger"
                      : "primary"
                  }
                >
                  {item.status}
                </Badge>
              </td>

              <td className="align-middle">
                <Badge
                  bg={
                    item.priority === "High"
                      ? "danger"
                      : item.priority === "Medium"
                      ? "warning"
                      : "secondary"
                  }
                >
                  {item.priority}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
};

export default PatientList;
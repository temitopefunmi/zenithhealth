'use client';

import React, { useEffect, useState } from "react";
import { Card, Table, Badge } from "react-bootstrap";
import { Activity } from "react-feather";

const MedicationSchedule = () => {
  const [medications, setMedications] = useState([]);

  useEffect(() => {
    async function loadMedications() {
      try {
        const response = await fetch(
          "/api/medication-administration"
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load medication data"
          );
        }

        const data = await response.json();

        setMedications(data.slice(0, 10));
      } catch (error) {
        console.error(error);
      }
    }

    loadMedications();
  }, []);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "success";

      case "administered":
        return "success";

      case "active":
        return "info";

      case "pending":
        return "warning";

      default:
        return "secondary";
    }
  };

  return (
    <Card>
      <Card.Header className="bg-white py-4 d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Medication Schedule</h4>

        <Badge bg="info">
          {medications.length} tasks
        </Badge>
      </Card.Header>

      <Table responsive className="text-nowrap">
        <thead className="table-light">
          <tr>
            <th>Patient</th>
            <th>Medication</th>
            <th>Dosage</th>
            <th>Frequency</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {medications.map((med) => (
            <tr key={med.id}>
              <td className="align-middle">
                <strong>
                  {med.patientId}
                </strong>
              </td>

              <td className="align-middle">
                <div className="d-flex align-items-center">
                  <Activity
                    size={16}
                    className="me-2 text-primary"
                  />

                  {med.medication}
                </div>
              </td>

              <td className="align-middle">
                {med.dosage}
              </td>

              <td className="align-middle text-muted">
                {med.frequency}
              </td>

              <td className="align-middle">
                <Badge
                  bg={getStatusBadge(
                    med.status
                  )}
                >
                  {med.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
};

export default MedicationSchedule;
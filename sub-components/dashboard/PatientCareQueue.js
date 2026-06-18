'use client';

import React, { useEffect, useState } from "react";
import { Card, Table, Badge } from "react-bootstrap";

const PatientCareQueue = () => {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    async function loadAssignments() {
      try {
        const response = await fetch(
          "/api/nurse-assignments"
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load assignments"
          );
        }

        const data = await response.json();

        setAssignments(data.slice(0, 10));
      } catch (error) {
        console.error(error);
      }
    }

    loadAssignments();
  }, []);

  const getBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "assigned":
        return "success";

      case "pending":
        return "warning";

      default:
        return "secondary";
    }
  };

  return (
    <Card className="h-100">
      <Card.Header className="bg-white py-4">
        <h4 className="mb-0">
          Assigned Patients - Care Queue
        </h4>
      </Card.Header>

      <Table responsive className="text-nowrap">
        <thead className="table-light">
          <tr>
            <th>Patient</th>
            <th>Ward</th>
            <th>Status</th>
            <th>Shift</th>
          </tr>
        </thead>

        <tbody>
          {assignments.map((item) => (
            <tr key={item.id}>
              <td className="align-middle">
                <div>
                  <h5 className="mb-1">
                    {item.patientId}
                  </h5>

                  <p className="mb-0 text-muted small">
                    {item.assignmentId}
                  </p>
                </div>
              </td>

              <td className="align-middle">
                <strong>
                  {item.ward}
                </strong>
              </td>

              <td className="align-middle">
                <Badge
                  bg={getBadgeColor(
                    item.status
                  )}
                >
                  {item.status}
                </Badge>
              </td>

              <td className="align-middle text-muted">
                {item.shift}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
};

export default PatientCareQueue;
'use client';

import React, { useEffect, useState } from "react";
import { Card, ListGroup, Badge } from "react-bootstrap";
import { Clock } from "react-feather";

const AppointmentSchedule = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    async function loadAppointments() {
      try {
        const res = await fetch("/api/dashboard/doctor/appointments");

        if (!res.ok) {
          throw new Error("Failed to load appointments");
        }

        const data = await res.json();
        setAppointments(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadAppointments();
  }, []);

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAppointmentDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    }

    return date.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="h-100">
      <Card.Header className="bg-white py-4">
        <h4 className="mb-0">My Upcoming Appointments This Week</h4>
      </Card.Header>

      <ListGroup variant="flush">
        {appointments.map((item, index) => (
          <ListGroup.Item key={index} className="px-4 py-3">
            <div className="d-flex align-items-start">
              <Clock size={18} className="text-primary me-3 mt-1" />

              <div className="flex-grow-1">
                <h6 className="mb-1">{item.patientName}</h6>

                <small className="text-muted d-block">
                  {formatAppointmentDate(item.appointmentDate)} • {formatTime(item.appointmentDate)}
                </small>

                <small className="text-muted d-block">
                  {item.appointmentType}
                </small>

                <small className="text-muted d-block">
                  Priority: {item.priority}
                </small>

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
                  className="mt-2"
                >
                  {item.status}
                </Badge>
              </div>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card>
  );
};

export default AppointmentSchedule;
'use client'
import React from "react";
import { Card, ListGroup, Badge } from 'react-bootstrap';
import { Clock } from 'react-feather';
import AppointmentsData from "data/dashboard/AppointmentsData";

const AppointmentSchedule = () => {
    return (
        <Card className="h-100">
            <Card.Header className="bg-white py-4">
                <h4 className="mb-0">Today's Appointments</h4>
            </Card.Header>
            <ListGroup variant="flush">
                {AppointmentsData.slice(0, 3).map((item, index) => (
                    <ListGroup.Item key={index} className="px-4 py-3">
                        <div className="d-flex align-items-start">
                            <Clock size={18} className="text-primary me-3 mt-1" />
                            <div className="flex-grow-1">
                                <h6 className="mb-1">{item.patientName}</h6>
                                <small className="text-muted d-block">{item.time} - {item.type}</small>
                                <small className="text-muted d-block">Room {item.room}</small>
                                <Badge bg={item.status === 'scheduled' ? 'success' : item.status === 'completed' ? 'secondary' : 'warning'} className="mt-2">
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
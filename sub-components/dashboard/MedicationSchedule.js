'use client'
import React from "react";
import { Card, Table, Badge } from 'react-bootstrap';
import { Activity } from 'react-feather';

const MedicationSchedule = () => {
    const medications = [
        { id: 1, patient: "John Mitchell", room: "302", medication: "Aspirin", dosage: "100mg", frequency: "Twice daily", status: "completed" },
        { id: 2, patient: "Emma Wilson", room: "305", medication: "Lisinopril", dosage: "10mg", frequency: "Once daily", status: "pending" },
        { id: 3, patient: "Robert Davis", room: "ICU-2", medication: "Propofol", dosage: "1.5mg/kg/hr", frequency: "Continuous", status: "active" },
        { id: 4, patient: "Lisa Anderson", room: "310", medication: "Metformin", dosage: "500mg", frequency: "Twice daily", status: "pending" },
        { id: 5, patient: "Michael Torres", room: "312", medication: "Warfarin", dosage: "5mg", frequency: "Once daily", status: "completed" }
    ];

    const getStatusBadge = (status) => {
        switch(status) {
            case 'completed': return 'success';
            case 'active': return 'info';
            case 'pending': return 'warning';
            default: return 'secondary';
        }
    };

    return (
        <Card>
            <Card.Header className="bg-white py-4 d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Medication Schedule</h4>
                <Badge bg="info">{medications.length} tasks</Badge>
            </Card.Header>
            <Table responsive className="text-nowrap">
                <thead className="table-light">
                    <tr>
                        <th>Patient</th>
                        <th>Room</th>
                        <th>Medication</th>
                        <th>Dosage</th>
                        <th>Frequency</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {medications.map((med, index) => (
                        <tr key={index}>
                            <td className="align-middle">
                                <div>
                                    <h5 className="mb-1">{med.patient}</h5>
                                </div>
                            </td>
                            <td className="align-middle"><strong>{med.room}</strong></td>
                            <td className="align-middle">
                                <div className="d-flex align-items-center">
                                    <Activity size={16} className="me-2 text-primary" />
                                    {med.medication}
                                </div>
                            </td>
                            <td className="align-middle">{med.dosage}</td>
                            <td className="align-middle text-muted">{med.frequency}</td>
                            <td className="align-middle">
                                <Badge bg={getStatusBadge(med.status)}>{med.status}</Badge>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Card>
    );
};

export default MedicationSchedule;
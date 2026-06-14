'use client'
import React from "react";
import { Card, Table, Badge } from 'react-bootstrap';
import PatientsData from "data/dashboard/PatientsData";

const PatientList = () => {
    return (
        <Card className="h-100">
            <Card.Header className="bg-white py-4">
                <h4 className="mb-0">My Patients</h4>
            </Card.Header>
            <Table responsive className="text-nowrap">
                <thead className="table-light">
                    <tr>
                        <th>Patient Name</th>
                        <th>Room</th>
                        <th>Condition</th>
                        <th>Doctor</th>
                        <th>Next Checkup</th>
                    </tr>
                </thead>
                <tbody>
                    {PatientsData.slice(0, 4).map((item, index) => (
                        <tr key={index}>
                            <td className="align-middle">
                                <div>
                                    <h5 className="mb-1">{item.patientName}</h5>
                                    <p className="mb-0 text-muted small">{item.patientID}</p>
                                </div>
                            </td>
                            <td className="align-middle">{item.room}</td>
                            <td className="align-middle">
                                <Badge bg={item.conditionBadge}>{item.condition}</Badge>
                            </td>
                            <td className="align-middle">{item.doctor}</td>
                            <td className="align-middle text-muted">{item.nextCheckup}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Card>
    );
};

export default PatientList;
'use client'
import { useState, useEffect } from 'react';
import { Col, Card, Table, Badge } from 'react-bootstrap';

// Helper for the Status Badge color-coding
const StatusBadge = ({ status }) => {
    const variants = {
        'Scheduled': 'info',
        'Confirmed': 'success',
        'Cancelled': 'danger',
        'Pending': 'warning'
    };
    return (
        <Badge bg={variants[status] || 'secondary'} className="px-2 py-1">
            {status || 'Scheduled'}
        </Badge>
    );
};

// Add { refreshKey } here to receive the prop from page.js
const ActiveProjects = ({ refreshKey }) => { 
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch('/api/appointments')
            .then(res => res.json())
            .then(data => {
                setAppointments(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [refreshKey]); // <--- Add refreshKey here!

    return (
        <Col md={12} xs={12}>
            <Card>
                <Card.Header className="bg-white py-4">
                    <h4 className="mb-0">Upcoming Appointments</h4>
                </Card.Header>
                <Table responsive className="text-nowrap mb-0">
                    <thead className="table-light">
                        <tr>
                            <th>Patient</th>
                            <th>Doctor</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" className="text-center">Loading...</td></tr>
                        ) : (
                            appointments.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.patientName}</td>
                                    <td>{item.doctor}</td>
                                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                                    <td><StatusBadge status={item.status} /></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </Card>
        </Col>
    );
};

export default ActiveProjects;
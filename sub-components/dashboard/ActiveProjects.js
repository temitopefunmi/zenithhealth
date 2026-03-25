'use client'
import { useState, useEffect } from 'react';
import { Col, Card, Table, Badge, Button, OverlayTrigger, Tooltip, Spinner } from 'react-bootstrap';

const ActiveProjects = ({ refreshKey, userRole }) => { 
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch Appointments from Azure SQL
    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/appointments');
            const data = await res.json();
            setAppointments(data);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [refreshKey]); // Refetches when AI bar adds data or role switches

    // 2. Clinical Verification Logic (Doctor Action)
    const handleVerify = async (id) => {
        try {
            const res = await fetch('/api/appointments', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isVerified: 1, status: 'Confirmed' })
            });
            if (res.ok) fetchAppointments();
        } catch (error) {
            console.error("Verification error:", error);
        }
    };

    // 3. Helper for Priority Colors (Extracted by Azure AI)
    const getPriorityBadge = (priority) => {
        const variants = {
            'Urgent': 'danger',
            'High': 'warning',
            'Medium': 'info',
            'Low': 'secondary'
        };
        return variants[priority] || 'secondary';
    };

    return (
        <Col md={12} xs={12}>
            <Card className="shadow-sm border-0">
                <Card.Header className="bg-white py-4">
                    <h4 className="mb-0">
                        {userRole === 'doctor' ? 'Clinical Verification Queue' : 'Upcoming Appointments'}
                    </h4>
                </Card.Header>
                <Table responsive className="text-nowrap mb-0">
                    <thead className="table-light">
                        <tr>
                            <th>Patient</th>
                            <th>Doctor</th>
                            <th>Appt. Date</th> {/* ✨ NEW HEADER */}
                            <th>Priority (AI)</th>
                            <th>Status</th>
                            {userRole === 'doctor' && <th>Action</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={userRole === 'doctor' ? 6 : 5} className="text-center py-5">
                                    <Spinner animation="border" variant="primary" size="sm" className="me-2" />
                                    Loading clinical data...
                                </td>
                            </tr>
                        ) : (
                            appointments.map((item, idx) => (
                                <tr key={item.id || idx} className={!item.isVerified ? 'bg-light-soft' : ''}>
                                    <td className="align-middle font-weight-bold">{item.patientName}</td>
                                    <td className="align-middle">{item.doctor}</td>
                                    
                                    {/* DATE COLUMN */}
                                    <td className="align-middle">
                                        <div className="d-flex flex-column">
                                            <span className="fw-semi-bold">
                                                {new Date(item.appointmentDate).toLocaleDateString()}
                                            </span>
                                            <span className="text-muted small">
                                                {new Date(item.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>

                                    {/* PRIORITY COLUMN... */}
                                    <td className="align-middle">
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={<Tooltip id={`tooltip-${idx}`}>{item.aiReasoning || 'Routine extraction'}</Tooltip>}
                                        >
                                            <Badge bg={getPriorityBadge(item.priority)}>
                                                {item.priority || 'Low'}
                                            </Badge>
                                        </OverlayTrigger>
                                    </td>

                                    <td className="align-middle">
                                        <Badge bg={item.isVerified ? 'success' : 'outline-primary'} className="px-2">
                                            {item.isVerified ? 'Verified' : 'AI Draft'}
                                        </Badge>
                                    </td>

                                    {/* DOCTOR ACTION COLUMN... */}
                                    {userRole === 'doctor' && (
                                        <td className="align-middle">
                                            {!item.isVerified ? (
                                                <Button 
                                                    variant="success" 
                                                    size="sm" 
                                                    onClick={() => handleVerify(item.id)}
                                                >
                                                    Approve
                                                </Button>
                                            ) : (
                                                <span className="text-muted small">Confirmed</span>
                                            )}
                                        </td>
                                    )}
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
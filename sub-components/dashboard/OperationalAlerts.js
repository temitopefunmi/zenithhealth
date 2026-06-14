'use client'
import React from "react";
import { Card, Row, Col, Alert } from 'react-bootstrap';
import { AlertTriangle, AlertCircle } from 'react-feather';

const OperationalAlerts = () => {
    const alerts = [
        { 
            id: 1, 
            type: 'warning', 
            icon: <AlertCircle size={20} />, 
            title: 'Equipment Maintenance Due',
            message: 'ICU Ventilator #3 requires scheduled maintenance tomorrow at 10 AM',
            time: '2 hours ago'
        },
        { 
            id: 2, 
            type: 'danger', 
            icon: <AlertTriangle size={20} />, 
            title: 'Critical Patient Alert',
            message: 'Patient in ICU-2 shows elevated vital readings. Dr. Johnson notified.',
            time: '30 minutes ago'
        },
        { 
            id: 3, 
            type: 'info', 
            icon: <AlertCircle size={20} />, 
            title: 'Bed Availability Low',
            message: 'Only 6 beds available in General Ward. 3 admissions expected by EOD.',
            time: '1 hour ago'
        }
    ];

    const getAlertVariant = (type) => {
        switch(type) {
            case 'danger': return 'danger';
            case 'warning': return 'warning';
            default: return 'info';
        }
    };

    return (
        <Card>
            <Card.Header className="bg-white py-4">
                <h4 className="mb-0">Operational Alerts & Notifications</h4>
            </Card.Header>
            <Card.Body>
                <Row>
                    {alerts.map((alert, index) => (
                        <Col md={12} key={index} className="mb-3">
                            <Alert variant={getAlertVariant(alert.type)} className="mb-0">
                                <div className="d-flex align-items-start">
                                    <div className="me-3">{alert.icon}</div>
                                    <div className="flex-grow-1">
                                        <h6 className="alert-heading mb-1">{alert.title}</h6>
                                        <p className="mb-1">{alert.message}</p>
                                        <small className="text-muted">{alert.time}</small>
                                    </div>
                                </div>
                            </Alert>
                        </Col>
                    ))}
                </Row>
            </Card.Body>
        </Card>
    );
};

export default OperationalAlerts;
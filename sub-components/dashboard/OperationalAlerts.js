'use client'
import React, {useEffect, useState} from "react";
import { Card, Row, Col, Alert } from 'react-bootstrap';
import { AlertTriangle, AlertCircle } from 'react-feather';

const OperationalAlerts = () => {
    const [alerts, setAlerts] = useState([]);

    const getAlertIcon = (type) => {
        switch (type) {
            case "danger":
            return <AlertTriangle size={20} />;

            case "warning":
            return <AlertCircle size={20} />;

            default:
            return <AlertCircle size={20} />;
        }
        };

    useEffect(() => {
        async function loadAlerts() {
            try {
            const res = await fetch("/api/dashboard/admin/alerts");

            if (!res.ok) {
                throw new Error("Failed to load alerts");
            }

            const data = await res.json();

            setAlerts(data);
            } catch (err) {
            console.error(err);
            }
        }

        loadAlerts();
        }, []);

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
                                    <div className="me-3">
                                        {getAlertIcon(alert.type)}
                                    </div>
                                    <div className="flex-grow-1">
                                        <h6 className="alert-heading mb-1">{alert.title}</h6>
                                        <p className="mb-1">{alert.message}</p>
                                        
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
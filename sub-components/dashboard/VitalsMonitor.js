'use client'
import React from "react";
import { Card, ListGroup } from 'react-bootstrap';
import { Activity, Droplet, Wind, Thermometer } from 'react-feather';

const VitalsMonitor = () => {
    const vitals = [
        { label: 'Heart Rate', value: '72 bpm', icon: <Activity size={20} className="text-danger" />, status: 'normal' },
        { label: 'Blood Pressure', value: '120/80 mmHg', icon: <Droplet size={20} className="text-primary" />, status: 'normal' },
        { label: 'O2 Saturation', value: '98%', icon: <Wind size={20} className="text-info" />, status: 'normal' },
        { label: 'Temperature', value: '36.8°C', icon: <Thermometer size={20} className="text-success" />, status: 'normal' }
    ];

    return (
        <Card className="h-100">
            <Card.Header className="bg-white py-4">
                <h4 className="mb-0">Patient Vitals Monitor</h4>
            </Card.Header>
            <ListGroup variant="flush">
                {vitals.map((vital, index) => (
                    <ListGroup.Item key={index} className="px-4 py-3">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <div className="me-3">{vital.icon}</div>
                                <div>
                                    <h6 className="mb-0">{vital.label}</h6>
                                    <small className="text-muted">{vital.status}</small>
                                </div>
                            </div>
                            <h5 className="mb-0 fw-bold">{vital.value}</h5>
                        </div>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </Card>
    );
};

export default VitalsMonitor;
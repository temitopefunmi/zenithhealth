'use client'
import React from "react";
import { Card, Row, Col, ProgressBar } from 'react-bootstrap';
import { Activity, Cpu, Truck } from 'react-feather';

const ResourceAllocation = () => {
    const resources = [
        { name: 'Hospital Beds', total: 150, used: 117, available: 33, icon: <Activity size={24} />, color: 'primary' },
        { name: 'Medical Equipment', total: 80, used: 74, available: 6, icon: <Cpu size={24} />, color: 'info' },
        { name: 'Ambulances', total: 12, used: 8, available: 4, icon: <Truck size={24} />, color: 'success' }
    ];

    return (
        <Card>
            <Card.Header className="bg-white py-4">
                <h4 className="mb-0">Resource Allocation & Availability</h4>
            </Card.Header>
            <Card.Body>
                <Row>
                    {resources.map((resource, index) => (
                        <Col lg={4} md={12} key={index} className="mb-4 mb-lg-0">
                            <div className="mb-3 d-flex align-items-center">
                                <div className={`icon-shape icon-lg bg-light-${resource.color} text-${resource.color} rounded-2 me-3`}>
                                    {resource.icon}
                                </div>
                                <div>
                                    <h6 className="mb-1">{resource.name}</h6>
                                    <span className="text-muted">{resource.available} of {resource.total}</span>
                                </div>
                            </div>
                            <ProgressBar 
                                now={(resource.used / resource.total) * 100} 
                                label={`${Math.round((resource.used / resource.total) * 100)}%`}
                                variant={resource.color}
                            />
                            <small className="text-muted mt-2 d-block">
                                {resource.used} in use, {resource.available} available
                            </small>
                        </Col>
                    ))}
                </Row>
            </Card.Body>
        </Card>
    );
};

export default ResourceAllocation;
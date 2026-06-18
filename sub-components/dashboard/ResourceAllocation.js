'use client'
import React, { useEffect, useState } from "react";
import { Card, Row, Col, ProgressBar } from 'react-bootstrap';
import { Activity, Cpu, Truck } from 'react-feather';

const ResourceAllocation = () => {
    const [resources, setResources] = useState([]);

    useEffect(() => {
        async function loadResources() {
            try {
            const res = await fetch("/api/dashboard/admin/resources");

            if (!res.ok) {
                throw new Error("Failed to load resources");
            }

            const data = await res.json();

            setResources([
                {
                name: "Outpatients",
                total: data.total,
                used: data.outpatient,
                available: data.total - data.outpatient,
                icon: <Activity size={24} />,
                color: "primary",
                },
                {
                name: "Inpatients",
                total: data.total,
                used: data.inpatient,
                available: data.total - data.inpatient,
                icon: <Cpu size={24} />,
                color: "info",
                },
                {
                name: "Emergency",
                total: data.total,
                used: data.emergency,
                available: data.total - data.emergency,
                icon: <Truck size={24} />,
                color: "danger",
                },
            ]);
            } catch (err) {
            console.error(err);
            }
        }

        loadResources();
        }, []);



    return (
        <Card>
            <Card.Header className="bg-white py-4">
                <h4 className="mb-0">Patient Distribution Overview</h4>
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
                                    <span className="text-muted">{resource.used} patients</span>
                                </div>
                            </div>
                            <ProgressBar 
                                now={(resource.used / resource.total) * 100} 
                                label={`${Math.round((resource.used / resource.total) * 100)}%`}
                                variant={resource.color}
                            />
                            <small className="text-muted mt-2 d-block">
                                {Math.round((resource.used / resource.total) * 100)}% of patient population
                            </small>
                        </Col>
                    ))}
                </Row>
            </Card.Body>
        </Card>
    );
};

export default ResourceAllocation;
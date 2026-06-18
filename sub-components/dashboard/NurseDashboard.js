'use client'
import React, { useState, useEffect } from "react";
import { Container, Col, Row } from 'react-bootstrap';
import { StatRightTopIcon } from "widgets";
//import NurseMetricsStats from "data/dashboard/NurseMetricsData";
import AICommandBar from "sub-components/dashboard/AICommandBar";
import PatientCareQueue from "./PatientCareQueue";
import VitalsMonitor from "./VitalsMonitor";
import MedicationSchedule from "./MedicationSchedule";

const NurseDashboard = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [nurseMetrics, setNurseMetrics] = useState([]);

    const handleDraftCreated = () => {
        setRefreshKey(prev => prev + 1);
    };

    useEffect(() => {
        async function loadMetrics() {
            try {
                const res = await fetch("/api/dashboard/nurse");

                if (!res.ok) {
                    throw new Error("Failed to load nurse metrics");
                }

                const data = await res.json();

                setNurseMetrics([
                    {
                        id: 1,
                        title: "Assigned Patients Today",
                        value: data.assignedPatients,
                        icon: "👩‍⚕️",
                        statInfo: "Currently assigned"
                    },
                    {
                        id: 2,
                        title: "Medication Tasks",
                        value: data.medicationTasks,
                        icon: "💊",
                        statInfo: "Medication administrations today"
                    },
                    {
                        id: 3,
                        title: "Vitals Recorded Today",
                        value: data.vitalsMonitored,
                        icon: "🩺",
                        statInfo: "Patients with recorded vitals"
                    },
                    {
                        id: 4,
                        title: "Emergency Patients",
                        value: data.emergencyPatients,
                        icon: "🚨",
                        statInfo: "Require urgent care"
                    }
                ]);
            } catch (err) {
                console.error(err);
            }
        }

        loadMetrics();
    }, [refreshKey]);

    return (
        <>
            <div className="bg-primary pt-10 pb-21"></div>
            <Container fluid className="mt-n22 px-6">
                <Row>
                    <Col lg={12} md={12} xs={12}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="mb-0 text-white">Patient Care & Monitoring</h3>
                        </div>

                        <AICommandBar onDraftCreated={handleDraftCreated} />

                        <div className="d-flex justify-content-between align-items-center mt-4">
                            <div className="mb-2 mb-lg-0">
                                <h3 className="mb-0 text-dark">
                                    Welcome, Nurse
                                </h3>
                            </div>
                        </div>
                    </Col>

                    {nurseMetrics.map((item, index) => (
                        <Col xl={3} lg={6} md={12} xs={12} className="mt-6" key={index}>
                            <StatRightTopIcon info={item} />
                        </Col>
                    ))}
                </Row>

                <Row className="mt-6">
                    <Col lg={6} md={12} xs={12} className="mb-6 mb-lg-0">
                        <PatientCareQueue key={`${refreshKey}-queue`} />
                    </Col>
                    <Col lg={6} md={12} xs={12}>
                        <VitalsMonitor />
                    </Col>
                </Row>

                <Row className="my-6">
                    <Col md={12} xs={12}>
                        <MedicationSchedule />
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default NurseDashboard;
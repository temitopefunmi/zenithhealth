'use client'
import React, { useState } from "react";
import { Container, Col, Row } from 'react-bootstrap';
import { StatRightTopIcon } from "widgets";
import DoctorMetricsStats from "data/dashboard/DoctorMetricsData";
import AICommandBar from "sub-components/dashboard/AICommandBar";
import PatientList from "./PatientList";
import AppointmentSchedule from "./AppointmentSchedule";

const DoctorDashboard = () => {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleDraftCreated = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <>
            <div className="bg-primary pt-10 pb-21"></div>
            <Container fluid className="mt-n22 px-6">
                <Row>
                    <Col lg={12} md={12} xs={12}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="mb-0 text-white">My Patients & Cases</h3>
                        </div>

                        <AICommandBar onDraftCreated={handleDraftCreated} />

                        <div className="d-flex justify-content-between align-items-center mt-4">
                            <div className="mb-2 mb-lg-0">
                                <h3 className="mb-0 text-dark">
                                    Welcome, Doctor
                                </h3>
                            </div>
                        </div>
                    </Col>

                    {DoctorMetricsStats.map((item, index) => (
                        <Col xl={3} lg={6} md={12} xs={12} className="mt-6" key={index}>
                            <StatRightTopIcon info={item} />
                        </Col>
                    ))}
                </Row>

                <Row className="mt-6">
                    <Col lg={8} md={12} xs={12} className="mb-6 mb-lg-0">
                        <PatientList key={`${refreshKey}-patients`} />
                    </Col>
                    <Col lg={4} md={12} xs={12}>
                        <AppointmentSchedule key={`${refreshKey}-appointments`} />
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default DoctorDashboard;
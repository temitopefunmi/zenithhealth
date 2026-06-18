'use client'
import React, { useState, useEffect } from "react";
import { Container, Col, Row } from 'react-bootstrap';
import { StatRightTopIcon } from "widgets";
//import AdminMetricsStats from "data/dashboard/AdminMetricsData";
import AICommandBar from "sub-components/dashboard/AICommandBar";
import StaffManagement from "./StaffManagement";
import ResourceAllocation from "./ResourceAllocation";
import OperationalAlerts from "./OperationalAlerts";
import {
  CalendarDays,
  Clock3,
  CircleCheckBig,
  TriangleAlert,
} from "lucide-react";

const AdminDashboard = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [adminMetrics, setAdminMetrics] = useState([]);
    const handleDraftCreated = () => {
        setRefreshKey(prev => prev + 1);
    };
    useEffect(() => {
        async function loadMetrics() {
            try {
                const res = await fetch("/api/dashboard/admin");

                if (!res.ok) {
                    throw new Error("Failed to fetch metrics");
                }

                const data = await res.json();

                setAdminMetrics([
                    {
                        id: 1,
                        title: "Appointments Today",
                        value: data.appointmentsToday,
                        icon: <CalendarDays size={22} />,
                        statInfo: `Total number of appointments`
                    },
                    {
                        id: 2,
                        title: "High Priority",
                        value: data.highPriorityAppointments,
                        icon: <TriangleAlert size={22} />,
                        statInfo: "Needs prompt attention"
                    },                    
                    {
                        id: 3,
                        title: "Completed Appointments",
                        value: data.completedAppointments,
                        icon: <CircleCheckBig size={22} />,
                        statInfo: "Successfully completed"
                    },
                    {
                        id: 2,
                        title: "Cancelled Appointments",
                        value: data.cancelledAppointments,
                        icon: <Clock3 size={22} />,
                        statInfo: "Cancellations Today"
                    },
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
                            <h3 className="mb-0 text-white">Hospital Operations Dashboard</h3>
                        </div>

                        <AICommandBar onDraftCreated={handleDraftCreated} />

                        <div className="d-flex justify-content-between align-items-center mt-4">
                            <div className="mb-2 mb-lg-0">
                                <h3 className="mb-0 text-dark">
                                    Welcome, Hospital Administrator
                                </h3>
                            </div>
                        </div>
                    </Col>

                    {adminMetrics.map((item, index) => (
                        <Col xl={3} lg={6} md={12} xs={12} className="mt-6" key={index}>
                            <StatRightTopIcon info={item} />
                        </Col>
                    ))}
                </Row>

                <Row className="mt-6">
                    <Col md={12} xs={12}>
                        <OperationalAlerts key={`${refreshKey}-alerts`} />
                    </Col>
                </Row>

                <Row className="mt-6">
                    <Col md={12} xs={12}>
                        <StaffManagement key={`${refreshKey}-staff`} />
                    </Col>
                </Row>

                <Row className="my-6">
                    <Col md={12} xs={12}>
                        <ResourceAllocation />
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default AdminDashboard;
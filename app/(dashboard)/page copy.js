'use client'
import { Fragment, useState } from "react";
import { Container, Col, Row, Button, ButtonGroup } from 'react-bootstrap';
import { StatRightTopIcon } from "widgets";
import { ActiveProjects, Teams, TasksPerformance } from "sub-components";
import ProjectsStatsData from "data/dashboard/ProjectsStatsData";
import AICommandBar from "sub-components/dashboard/AICommandBar"; 

const Home = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    // Role state: 'receptionist' or 'doctor'
    const [role, setRole] = useState('receptionist');

    const handleDraftCreated = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <Fragment>
            <div className="bg-primary pt-10 pb-21"></div>
            <Container fluid className="mt-n22 px-6">
                <Row>
                    <Col lg={12} md={12} xs={12}>
                        {/* ROLE SELECTOR: Excellent for demoing the two "Worlds" */}
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="mb-0 text-white">Zenith AI Dashboard</h3>
                            <ButtonGroup>
                                <Button 
                                    variant={role === 'receptionist' ? 'white' : 'outline-white'} 
                                    onClick={() => setRole('receptionist')}
                                    size="sm"
                                >
                                    Receptionist View
                                </Button>
                                <Button 
                                    variant={role === 'doctor' ? 'white' : 'outline-white'} 
                                    onClick={() => setRole('doctor')}
                                    size="sm"
                                >
                                    Doctor View
                                </Button>
                            </ButtonGroup>
                        </div>

                        {/* 1. RECEPTIONIST WORLD: Only show AI Bar to Receptionists */}
                        {role === 'receptionist' && (
                            <AICommandBar onDraftCreated={handleDraftCreated} />
                        )}

                        <div className="d-flex justify-content-between align-items-center mt-4">
                            <div className="mb-2 mb-lg-0">
                                <h3 className="mb-0 text-white">
                                    {role === 'receptionist' ? 'Clinical Intake Overview' : 'My Verification Queue'}
                                </h3>
                            </div>
                        </div>
                    </Col>

                    {ProjectsStatsData.map((item, index) => (
                        <Col xl={3} lg={6} md={12} xs={12} className="mt-6" key={index}>
                            <StatRightTopIcon info={item} />
                        </Col>
                    ))}
                </Row>

                {/* 2. SHARED WORLD: The Table 
                    We pass 'userRole' as a prop so the table knows whether to show "Approve" buttons.
                */}
                <Row className="mt-6">
                   <Col md={12} xs={12}>
                        <ActiveProjects key={`${refreshKey}-${role}`} userRole={role} />
                   </Col>
                </Row>

                <Row className="my-6">
                    <Col xl={4} lg={12} md={12} xs={12} className="mb-6 mb-xl-0">
                        <TasksPerformance />
                    </Col>
                    <Col xl={8} lg={12} md={12} xs={12}>
                        <Teams />
                    </Col>
                </Row>
            </Container>
        </Fragment>
    )
}
export default Home;
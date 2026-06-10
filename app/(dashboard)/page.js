'use client'
import { Fragment, useState } from "react";
import { Container, Col, Row } from 'react-bootstrap';
import { StatRightTopIcon } from "widgets";
import { ActiveProjects, Teams, TasksPerformance } from "sub-components";
import ProjectsStatsData from "data/dashboard/ProjectsStatsData";
import AICommandBar from "sub-components/dashboard/AICommandBar"; 
import { useSession } from "next-auth/react";

const Home = () => {
    const { data: session, status } = useSession();

    const role = session?.user?.role;

    const [refreshKey, setRefreshKey] = useState(0);

    const handleDraftCreated = () => {
        setRefreshKey(prev => prev + 1);
    };

    if (status === "loading") {
          return (
            <div className="text-center mt-5">
            Loading dashboard...
            </div>
        );
    }

    return (
        <Fragment>
            <div className="bg-primary pt-10 pb-21"></div>        
            <Container fluid className="mt-n22 px-6">
                <Row>
                    <Col lg={12} md={12} xs={12}>
                        
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="mb-0 text-white">Zenith AI Dashboard</h3>
                            
                        </div>

                        {/* 1. ADMIN WORLD */}
                        {role === 'ADMIN' && (
                            <AICommandBar onDraftCreated={handleDraftCreated} />
                        )}

                        <div className="d-flex justify-content-between align-items-center mt-4">
                            <div className="mb-2 mb-lg-0">
                                <h3 className="mb-0 text-dark">
                                    Welcome, {session?.user?.name}
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
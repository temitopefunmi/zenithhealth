'use client'
import { Fragment, useState } from "react"; // Added useState
import { Container, Col, Row, Button } from 'react-bootstrap'; // Added Button
import { StatRightTopIcon } from "widgets";
import { ActiveProjects, Teams, TasksPerformance } from "sub-components";
import ProjectsStatsData from "data/dashboard/ProjectsStatsData";
import BookingModal from "sub-components/dashboard/BookingModal"; // Import your Modal

const Home = () => {
    const [showModal, setShowModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <Fragment>
            <div className="bg-primary pt-10 pb-21"></div>
            <Container fluid className="mt-n22 px-6">
                <Row>
                    <Col lg={12} md={12} xs={12}>
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="mb-2 mb-lg-0">
                                <h3 className="mb-0 text-white">Daily Overview</h3>
                            </div>
                            <div>
                                {/* Changed Link to Button */}
                                <Button 
                                    variant="white" 
                                    onClick={() => setShowModal(true)}
                                >
                                    Create New Appointment
                                </Button>
                            </div>
                        </div>
                    </Col>
                    {ProjectsStatsData.map((item, index) => (
                        <Col xl={3} lg={6} md={12} xs={12} className="mt-6" key={index}>
                            <StatRightTopIcon info={item} />
                        </Col>
                    ))}
                </Row>

                {/* Added key={refreshKey} to trigger a re-fetch when an appointment is added */}
                <Row className="mt-6">
                   <ActiveProjects key={refreshKey} />
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

            {/* Include the Modal at the bottom */}
            <BookingModal 
                show={showModal} 
                onHide={() => setShowModal(false)} 
                onSave={() => setRefreshKey(old => old + 1)} 
            />
        </Fragment>
    )
}
export default Home;
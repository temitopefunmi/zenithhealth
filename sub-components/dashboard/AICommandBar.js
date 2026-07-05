'use client';

import { useMemo, useState, useEffect } from 'react';
import { Card, Form, Button, Spinner, Alert, Badge, Row, Col } from 'react-bootstrap';
import { useSession } from 'next-auth/react';

const ROLE_CONFIGS = {
    ADMIN: {
        title: 'Hospital Operations AI Assistant',
        description: 'Ask about statistics, reports, staff, or analytics',
        placeholder: 'e.g., "How many patients checked in today?" or "Generate weekly occupancy report"',
        intents: ['viewStatistics', 'searchEntity', 'listEntity', 'generateReport', 'generateAnalytics', 'viewSummary'],
        examples: [
            'How many appointments today?',
            'Generate weekly report',
            'List all doctors',
            'Find John Doe',
            'Show patient registration trends'
        ]
    },
    DOCTOR: {
        title: 'Patient Care AI Assistant',
        description: 'Ask about your patients, appointments, and medical summaries',
        placeholder: 'e.g., "Show my appointments today" or "Summarize patient history for John"',
        intents: ['viewAppointments', 'viewMySchedule', 'viewAssignedPatients', 'summarizePatientHistory', 'draftConsultationNotes', 'draftReferral', 'draftFollowupNotes'],
        examples: [
            'Show my appointments',
            'Who is my next patient?',
            'Find John Doe',
            'Summarize patient history',
            'Draft consultation notes'
        ]
    },
    NURSE: {
        title: 'Patient Care & Workflow AI Assistant',
        description: 'Ask about patient queues, appointments, vitals, or task management',
        placeholder: 'e.g., "Book John Doe tomorrow" or "Show waiting patients"',
        intents: ['showWaitingPatients', 'showTodaysQueue', 'searchPatient', 'bookAppointment', 'rescheduleAppointment', 'cancelAppointment', 'checkInPatient', 'recordVitals', 'assistVitalsWorkflow'],
        examples: [
            'Book John Doe tomorrow',
            'Reschedule Sarah\'s appointment',
            'Cancel appointment 1045',
            'Show waiting patients',
            'Check in Jane Smith'
        ]
    }
};

const AICommandBar = ({ onDraftCreated }) => {
    const { data: session, status } = useSession();
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [responseType, setResponseType] = useState(null);
    const [executionResult, setExecutionResult] = useState(null);
    const role = session?.user?.role;
    const roleConfig = role ? ROLE_CONFIGS[role] : null;

    const resetAll = () => {
        setInput('');
        setPreview(null);
        setError('');
        setExecutionResult(null);
        setSuccess('');
        setLoading(false);
        setSaving(false);
        setResponseType(null);
    };
    

    

    const handleProcess = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        setPreview(null);
        setExecutionResult(null);
        setResponseType(null);

        try {
            const res = await fetch('/api/ai/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: input

                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error || 'AI analysis failed.');
            }

            setPreview(data);
            setResponseType(data.type || 'intent');

            if (data.intent !== "unknown") {
                await executeIntent(data);
                setInput('');
            }
            
            if (data.type === 'search' || data.type === 'list') {
                setSuccess(`Found ${data.results?.length || 0} results.`);
            }            
        } catch (err) {
            console.error('AI Error:', err);
            setError(err.message || 'Something went wrong while analyzing the request.');
        } finally {
            setLoading(false);
        }
    };

    const executeIntent = async (previewData) => {
        if (!previewData) return;


        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/ai/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    intent: previewData.intent,
                    parameters: previewData.parameters
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error || 'Failed to execute action.');
            }

            setExecutionResult(data);
            setSuccess('Action executed successfully.');
            onDraftCreated?.();
        } catch (err) {
            console.error('Execute Action Error:', err);
            setError(err.message || 'Something went wrong while executing the action.');
        } finally {
            setSaving(false);
        }
    };

    if (status === 'loading' || !roleConfig) {
        return (
            <Card className="mb-4 border-0 shadow-sm">
                <Card.Body className="p-4">
                    <Spinner animation="border" size="sm" /> Loading...
                </Card.Body>
            </Card>
        );
    }    

    function renderExecutionResult() {
    if (!executionResult) return null;

    switch (executionResult.type) {
        case "queue":
        return (
            <table className="table table-sm">
            <thead>
                <tr>
                <th>Patient</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Category</th>
                </tr>
            </thead>

            <tbody>
                {executionResult.data.map((item, index) => (
                <tr key={index}>
                    <td>{item.patientName}</td>
                    <td>{item.priority}</td>
                    <td>{item.status}</td>
                    <td>{item.patientCategory}</td>
                </tr>
                ))}
            </tbody>
            </table>
        );

        case "appointments":
        return (
            <table className="table table-sm">
            <thead>
                <tr>
                <th>Patient</th>
                <th>Date</th>
                <th>Type</th>
                <th>Status</th>
                <th>Priority</th>
                </tr>
            </thead>

            <tbody>
                {executionResult.data.map((item, index) => (
                <tr key={index}>
                    <td>{item.patientName}</td>
                    <td>
                    {new Date(
                        item.appointmentDate
                    ).toLocaleString()}
                    </td>
                    <td>{item.appointmentType}</td>
                    <td>{item.status}</td>
                    <td>{item.priority}</td>
                </tr>
                ))}
            </tbody>
            </table>
        );

        case "statistics":
        return (
            <Row>
            <Col md={3}>
                <Card body>
                <h4>
                    {executionResult.data
                    .appointmentsToday}
                </h4>
                <small>Today's Appointments</small>
                </Card>
            </Col>

            <Col md={3}>
                <Card body>
                <h4>
                    {executionResult.data
                    .pendingReviews}
                </h4>
                <small>Pending Reviews</small>
                </Card>
            </Col>

            <Col md={3}>
                <Card body>
                <h4>
                    {executionResult.data
                    .completedAppointments}
                </h4>
                <small>Completed</small>
                </Card>
            </Col>

            <Col md={3}>
                <Card body>
                <h4>
                    {executionResult.data
                    .emergencyCases}
                </h4>
                <small>Emergency Cases</small>
                </Card>
            </Col>
            </Row>
        );

        case "doctorAppointmentStats":
            return (
                <>
                <div className="mb-3">
                    <h6>
                    {executionResult.data.doctorName}
                    </h6>
                </div>

                <Row>
                    <Col md={3}>
                    <Card body>
                        <h4>
                        {executionResult.data.totalAppointments}
                        </h4>
                        <small>Total</small>
                    </Card>
                    </Col>

                    <Col md={3}>
                    <Card body>
                        <h4>
                        {executionResult.data.completed}
                        </h4>
                        <small>Completed</small>
                    </Card>
                    </Col>

                    <Col md={3}>
                    <Card body className="text-center shadow-sm">
                        <h4>
                        {executionResult.data.pending}
                        </h4>
                        <small>Pending</small>
                    </Card>
                    </Col>

                    <Col md={3}>
                    <Card body>
                        <h4>
                        {executionResult.data.scheduled}
                        </h4>
                        <small>Scheduled</small>
                    </Card>
                    </Col>
                </Row>
                </>
            );

            case "pendingReviews":
                return (
                    <table className="table table-sm">
                    <thead>
                        <tr>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Date</th>
                        <th>Priority</th>
                        </tr>
                    </thead>

                    <tbody>
                        {executionResult.data.map(
                        (item, index) => (
                            <tr key={index}>
                            <td>{item.patientName}</td>
                            <td>{item.doctor}</td>
                            <td>
                                {new Date(
                                item.appointmentDate
                                ).toLocaleString()}
                            </td>
                            <td>{item.priority}</td>
                            </tr>
                        )
                        )}
                    </tbody>
                    </table>
                );

                case "patients":
                    return (
                        <table className="table table-sm">
                        <thead>
                            <tr>
                            <th>Patient ID</th>
                            <th>Name</th>
                            </tr>
                        </thead>

                        <tbody>
                            {executionResult.data.map(
                            (item, index) => (
                                <tr key={index}>
                                <td>{item.patientId}</td>
                                <td>{item.patientName}</td>
                                </tr>
                            )
                            )}
                        </tbody>
                        </table>
                    );
            case "patientSummary":
            return (
                <Card body className="shadow-sm">
                <div className="mb-3">
                    <strong>Patient</strong>
                    <div>
                    {executionResult.data.patientName}
                    </div>
                </div>

                <div>
                    <strong>AI Summary</strong>

                    <div
                    className="mt-2"
                    style={{
                        whiteSpace: "pre-wrap"
                    }}
                    >
                    {executionResult.data.summary}
                    </div>
                </div>
                </Card>
            );      
            
            case "handoverSummary":
                return (
                    <Card body className="shadow-sm">
                    <div className="mb-3">
                        <strong>Patient</strong>
                        <div>
                        {executionResult.data.patientName}
                        </div>
                    </div>

                    <div>
                        <strong>Shift Handover</strong>

                        <div
                        className="mt-2"
                        style={{
                            whiteSpace: "pre-wrap"
                        }}
                        >
                        {executionResult.data.summary}
                        </div>
                    </div>
                    </Card>
                );

            case "message":
                return (
                    <Alert variant="info">
                    {executionResult.message}
                    </Alert>
                );
        default:
        return (
            <pre
            className="bg-light p-3 rounded small mb-0"
            style={{
                maxHeight: "300px",
                overflowY: "auto",
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                wordWrap: "break-word"
            }}
            >
            {JSON.stringify(executionResult, null, 2)}
            </pre>
        );
    }
    }
    return (
        <Card className="mb-4 border-0 shadow-sm">
            <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        
                       
                        <h5 className="mb-1">
                            {roleConfig.title}
                        </h5>
                        <p className="text-muted small mb-0">{roleConfig.description}</p>
              
                        
                    </div>
                </div>

                {error && (
                    <Alert variant="danger" className="border-0 shadow-sm">
                        <strong>Something needs attention:</strong> {error}
                    </Alert>
                )}

                {success && (
                    <Alert variant="success" className="border-0 shadow-sm">
                        {success}
                    </Alert>
                )}

                <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Your Request</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder={roleConfig.placeholder}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        isInvalid={!input.trim() && !!error}
                    />
                    <Form.Text className="text-muted">
                        Enter your request in plain language.
                    </Form.Text>
                </Form.Group>

                <div className="d-flex gap-2 mb-3">
                    <Button
                        variant="primary"
                        onClick={handleProcess}
                        disabled={loading || saving || !input.trim()}
                    >
                        {loading ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                Thinking...
                            </>
                        ) : (
                            'Ask AI'
                        )}
                    </Button>

                    <Button
                        variant="outline-secondary"
                        onClick={resetAll}
                        disabled={loading || saving}
                    >
                        Clear
                    </Button>
                </div>

                {preview && (
                 
                            <Alert variant="light" className="border shadow-sm">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                            <strong>AI Analysis</strong>
                            <Badge bg="info">{preview.intent}</Badge>
                                </div>

                        <div className="mb-3">
                            <div className="small text-muted">Intent</div>
                            <div className="fw-semibold">{preview.intent}</div>
                        </div>

                                

                    {preview.parameters && Object.keys(preview.parameters).length > 0 && (
                            <div className="mb-3">
                                <div className="small text-muted">Extracted Parameters</div>
                                <div className="small">
                                    {Object.entries(preview.parameters)
                                        .filter(([_, value]) => {
                                            if (value === null) return false;
                                            if (
                                            typeof value === "object" &&
                                            Object.keys(value).length === 0
                                            ){
                                            return false;
                                            }

                                            return true;
                                        })
                                        .map(([key, value]) => (
                                            <div key={key}>
                                                <strong>{key}:</strong>{" "} 
                                                {typeof value === "object" 
                                                  ? JSON.stringify(value)
                                                  : String(value)}
                                            </div>
                                        ))}
                                </div>                          

                               
                                    
                                </div>
                    )}
                                {preview.results && (
                                    <div className="mb-3">
                                    <div className="small text-muted">Results</div>
                                <div className="small">
                                    {Array.isArray(preview.results) ? (
                                        <ul className="mb-0">
                                            {preview.results.slice(0, 5).map((result, idx) => (
                                                <li key={idx}>{String(result)}</li>
                                            ))}
                                            {preview.results.length > 5 && (
                                                <li>... and {preview.results.length - 5} more</li>
                                            )}
                                        </ul>
                                    ) : (
                                        <div>{String(preview.results)}</div>
                                    )}                                    
                                        </div>
                                    </div>
                                )}
                        {executionResult && (
                                <div className="mb-3">
                                    <div className="small text-muted mb-2">
                                        Execution Result
                                    </div>

                                    {renderExecutionResult()}
                                </div>
                            )}
                        {preview.summary && (
                            
                            <div className="mb-3">
                                <div className="small text-muted">Summary</div>
                                <div className="small">{preview.summary}</div>
                            </div>
                        )}

                        <div className="d-flex gap-2">
                            

                            <Button
                                size="sm"
                                variant="outline-secondary"
                                onClick={() => {
                                    setPreview(null);
                                    setExecutionResult(null);
                                    setError('');
                                    setSuccess('');
                                }}
                                disabled={saving}
                            >
                                Dismiss
                            </Button>
                        </div>
                    </Alert>
                )}

                <div className="mt-4 pt-3 border-top">
                    <p className="text-muted small mb-2"><strong>Try asking:</strong></p>
                    <div className="d-flex flex-wrap gap-2">
                        {roleConfig.examples.map((example, idx) => (
                            <Button
                                key={idx}
                                size="sm"
                                variant="outline-primary"
                                onClick={() => setInput(example)}
                                className="text-nowrap"
                            >
                                {example}
                            </Button>
                        ))}
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default AICommandBar;
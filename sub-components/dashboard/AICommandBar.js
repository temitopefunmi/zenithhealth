'use client';

import { useMemo, useState } from 'react';
import { Card, Form, Button, Spinner, Alert, Badge } from 'react-bootstrap';

const AICommandBar = ({ onDraftCreated }) => {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const resetAll = () => {
        setInput('');
        setPreview(null);
        setError('');
        setSuccess('');
        setLoading(false);
        setSaving(false);
    };

    const safeDate =
        preview?.appointmentDate && !isNaN(new Date(preview.appointmentDate).getTime())
            ? new Date(preview.appointmentDate)
            : null;

    const validation = useMemo(() => {
        if (!preview) {
            return {
                canSubmit: false,
                missing: []
            };
        }

        const missing = [];

        if (!preview.patientName || preview.patientName === 'N/A') {
            missing.push('patient name');
        }

        if (!preview.appointmentDate || !safeDate) {
            missing.push('appointment date/time');
        }

        return {
            canSubmit: missing.length === 0,
            missing
        };
    }, [preview, safeDate]);

    const getPriorityVariant = (priority) => {
        switch (priority) {
            case 'Urgent':
                return 'danger';
            case 'High':
                return 'warning';
            case 'Medium':
                return 'info';
            default:
                return 'secondary';
        }
    };

    const handleProcess = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        setPreview(null);

        try {
            const res = await fetch('/api/ai/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: input })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error || 'AI analysis failed.');
            }

            setPreview(data);
        } catch (err) {
            console.error('AI Error:', err);
            setError(err.message || 'Something went wrong while analyzing the request.');
        } finally {
            setLoading(false);
        }
    };

    const confirmDraft = async () => {
        if (!preview) return;

        if (!validation.canSubmit) {
            setError(
                `Please review the draft. Missing required field(s): ${validation.missing.join(', ')}.`
            );
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patient: preview.patientName,
                    doctor: preview.doctor,
                    appointmentDate: preview.appointmentDate,
                    priority: preview.priority,
                    notes: preview.notes,
                    aiReasoning: preview.reasoning,
                    isVerified: 0
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error || 'Failed to create draft appointment.');
            }

            setSuccess('Draft appointment created successfully.');
            setInput('');
            setPreview(null);
            onDraftCreated?.();
        } catch (err) {
            console.error('Create Draft Error:', err);
            setError(err.message || 'Something went wrong while creating the draft.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card className="mb-4 border-0 shadow-sm">
            <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h5 className="mb-1">✨ AI Scheduling Assistant</h5>
                        <p className="text-muted small mb-0">
                            Turn free-text intake into a draft appointment for review.
                        </p>
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
                    <Form.Label className="fw-semibold">Booking Request</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="e.g., Schedule John Doe with Dr. Smith tomorrow for chest pain..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        isInvalid={!input.trim() && !!error}
                    />
                    <Form.Text className="text-muted">
                        Enter the receptionist’s note in plain language.
                    </Form.Text>
                </Form.Group>

                <div className="d-flex gap-2 mb-2">
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
                                Analyzing...
                            </>
                        ) : (
                            'Analyze Request'
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
                    <>
                        {!preview.patientName || preview.patientName === 'N/A' ? (
                            <Alert variant="warning" className="mt-3 border-0 shadow-sm">
                                <strong>AI clarification needed:</strong> I could not confidently
                                identify the patient name. Try a more specific instruction like:
                                {' '}
                                <em>“Schedule John Doe for tomorrow at 2pm.”</em>
                            </Alert>
                        ) : (
                            <Alert variant="light" className="mt-3 border shadow-sm mb-0">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <strong>Draft Preview</strong>
                                    <Badge bg={getPriorityVariant(preview.priority)}>
                                        {preview.priority || 'Low'}
                                    </Badge>
                                </div>

                                {!validation.canSubmit && (
                                    <Alert variant="warning" className="mb-3 py-2">
                                        <strong>Incomplete draft:</strong> Missing{' '}
                                        {validation.missing.join(', ')}.
                                    </Alert>
                                )}

                                <div className="mb-2">
                                    <div className="small text-muted">Patient</div>
                                    <div className="fw-semibold">{preview.patientName}</div>
                                </div>

                                <div className="mb-2">
                                    <div className="small text-muted">Doctor</div>
                                    <div className={!preview.doctor || preview.doctor === 'N/A' ? 'text-muted' : ''}>
                                        {!preview.doctor || preview.doctor === 'N/A'
                                            ? '⚠️ To be assigned'
                                            : preview.doctor}
                                    </div>
                                </div>

                                <div className="mb-2">
                                    <div className="small text-muted">Date / Time</div>
                                    <div className={!safeDate ? 'text-muted' : ''}>
                                        {safeDate
                                            ? safeDate.toLocaleString('en-NG', {
                                                  timeZone: 'Africa/Lagos',
                                                  dateStyle: 'medium',
                                                  timeStyle: 'short'
                                              })
                                            : '⚠️ No valid appointment date extracted'}
                                    </div>
                                </div>

                                <div className="mb-2">
                                    <div className="small text-muted">Notes</div>
                                    <div>{preview.notes || 'No notes provided'}</div>
                                </div>

                                <div className="mb-3">
                                    <div className="small text-muted">AI Reasoning</div>
                                    <div className="small">{preview.reasoning || 'No reasoning provided'}</div>
                                </div>

                                <div className="d-flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="success"
                                        onClick={confirmDraft}
                                        disabled={!validation.canSubmit || saving || loading}
                                    >
                                        {saving ? (
                                            <>
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                    className="me-2"
                                                />
                                                Saving...
                                            </>
                                        ) : (
                                            'Create Draft Appointment'
                                        )}
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="outline-secondary"
                                        onClick={() => {
                                            setPreview(null);
                                            setError('');
                                            setSuccess('');
                                        }}
                                        disabled={saving}
                                    >
                                        Dismiss Preview
                                    </Button>
                                </div>
                            </Alert>
                        )}
                    </>
                )}
            </Card.Body>
        </Card>
    );
};

export default AICommandBar;
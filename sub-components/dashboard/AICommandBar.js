'use client'
import { useState } from 'react';
import { Card, Form, Button, Spinner, Alert } from 'react-bootstrap';

const AICommandBar = ({ onDraftCreated }) => {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);

    const handleProcess = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/ai/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: input })
            });
            const data = await res.json();
            setPreview(data); // Show the AI's extraction to the receptionist
        } catch (err) {
            console.error("AI Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const confirmDraft = async () => {
        // This will call your existing POST /api/appointments but with AI data
        const res = await fetch('/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                patient: preview.patientName,
                doctor: preview.doctor,
                appointmentDate: data.appointmentDate,
                priority: preview.priority,
                notes: preview.reasoning,
                isVerified: 0 // Explicitly save as unverified draft
            })
        });
        if (res.ok) {
            setInput('');
            setPreview(null);
            onDraftCreated(); // Refresh the table
        }
    };

    return (
        <Card className="mb-4 border-0 shadow-sm">
            <Card.Body className="p-4">
                <h5 className="mb-3">✨ AI Scheduling Assistant</h5>
                <Form.Group className="mb-3">
                    <Form.Control 
                        as="textarea" 
                        rows={2} 
                        placeholder="e.g., Schedule John Doe with Dr. Smith tomorrow for chest pain..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                </Form.Group>
                
                <div className="d-flex gap-2">
                    <Button variant="primary" onClick={handleProcess} disabled={loading || !input}>
                        {loading ? <Spinner size="sm" /> : 'Analyze Request'}
                    </Button>
                    <Button variant="outline-secondary" onClick={() => {setInput(''); setPreview(null);}}>Clear</Button>
                </div>

                {preview && (
                    <Alert variant="info" className="mt-3 border-0 bg-light-primary">
                        <strong>Draft Preview:</strong>
                        <ul className="mb-2 mt-2">
                            <li>Patient: {preview.patientName}</li>
                            <li>Doctor: {preview.doctor}</li>
                            <li><strong>Date/Time:</strong> {new Date(analysis.appointmentDate).toLocaleString()}</li>
                            <li>Priority: <span className="text-danger font-weight-bold">{preview.priority}</span></li>
                        </ul>
                        <p className="small mb-2 italic">Reasoning: {preview.reasoning}</p>
                        <Button size="sm" variant="success" onClick={confirmDraft}>Create Draft Appointment</Button>
                    </Alert>
                )}
            </Card.Body>
        </Card>
    );
};

export default AICommandBar;
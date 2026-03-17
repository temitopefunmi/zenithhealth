'use client'
import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const BookingModal = ({ show, onHide, onSave }) => {
    const [patient, setPatient] = useState('');
    const [doctor, setDoctor] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const res = await fetch('/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patient, doctor })
        });

        if (res.ok) {
            setPatient('');
            setDoctor('');
            onSave(); // Refreshes the list in the parent
            onHide(); // Closes the modal
        }
        setIsSubmitting(false);
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Book New Appointment</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Patient Name</Form.Label>
                        <Form.Control 
                            placeholder="Enter patient name" 
                            value={patient} 
                            onChange={(e) => setPatient(e.target.value)} 
                            required 
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Assigned Doctor</Form.Label>
                        <Form.Control 
                            placeholder="Enter doctor name" 
                            value={doctor} 
                            onChange={(e) => setDoctor(e.target.value)} 
                            required 
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>Cancel</Button>
                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default BookingModal;
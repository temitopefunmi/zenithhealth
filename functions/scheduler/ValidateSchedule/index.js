module.exports = async function (context, req) {
    try {
        const body = req.body || {};

        const {
            patientName,
            doctor,
            appointmentDate,
            priority,
            notes,
            aiReasoning
        } = body;

        const missingFields = [];

        if (!patientName || patientName === 'N/A') {
            missingFields.push('patientName');
        }

        // For now, we keep one default doctor for simplicity.
        const normalizedDoctor = doctor && doctor !== 'N/A'
            ? doctor
            : 'Dr Smith';

        /**
         * If patient name is missing, stop here.
         * The receptionist should complete the draft before scheduling.
         */
        if (missingFields.length > 0) {
            context.res = {
                status: 200,
                body: {
                    status: 'missing_fields',
                    message: 'Some required fields are missing.',
                    missingFields,
                    draft: {
                        patientName: patientName || '',
                        doctor: normalizedDoctor,
                        appointmentDate: appointmentDate || null,
                        priority: priority || 'Low',
                        notes: notes || '',
                        aiReasoning: aiReasoning || ''
                    },
                    availableSlots: []
                }
            };
            return;
        }

        /**
         * If no date was extracted, return mock available slots.
         * SQL-backed slot checking comes in the next commit.
         */
        if (!appointmentDate) {
            context.res = {
                status: 200,
                body: {
                    status: 'needs_slot_selection',
                    message: 'No appointment date was provided. Please select an available slot.',
                    missingFields: [],
                    draft: {
                        patientName,
                        doctor: normalizedDoctor,
                        appointmentDate: null,
                        priority: priority || 'Low',
                        notes: notes || '',
                        aiReasoning: aiReasoning || ''
                    },
                    availableSlots: [
                        '2026-05-12T09:00:00+01:00',
                        '2026-05-12T09:30:00+01:00',
                        '2026-05-12T10:00:00+01:00'
                    ]
                }
            };
            return;
        }

        const parsedDate = new Date(appointmentDate);

        if (isNaN(parsedDate.getTime())) {
            context.res = {
                status: 200,
                body: {
                    status: 'invalid',
                    message: 'The appointment date is invalid.',
                    missingFields: ['appointmentDate'],
                    draft: {
                        patientName,
                        doctor: normalizedDoctor,
                        appointmentDate,
                        priority: priority || 'Low',
                        notes: notes || '',
                        aiReasoning: aiReasoning || ''
                    },
                    availableSlots: []
                }
            };
            return;
        }

        /**
         * For now, assume date is valid and no conflict exists.
         * SQL conflict checking comes in the next commit.
         */
        context.res = {
            status: 200,
            body: {
                status: 'ready',
                message: 'Draft is ready to be created.',
                missingFields: [],
                draft: {
                    patientName,
                    doctor: normalizedDoctor,
                    appointmentDate: parsedDate.toISOString(),
                    priority: priority || 'Low',
                    notes: notes || '',
                    aiReasoning: aiReasoning || ''
                },
                availableSlots: []
            }
        };
    } catch (err) {
        context.log.error('ValidateSchedule failed:', err.message);

        context.res = {
            status: 500,
            body: {
                status: 'error',
                message: 'Schedule validation failed.'
            }
        };
    }
};
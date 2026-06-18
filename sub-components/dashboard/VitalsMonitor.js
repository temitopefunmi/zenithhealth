'use client';

import React, { useEffect, useState } from "react";
import { Card, ListGroup } from "react-bootstrap";
import {
  Activity,
  Droplet,
  Wind,
  Thermometer
} from "react-feather";

const VitalsMonitor = () => {
  const [vitals, setVitals] = useState([]);

  useEffect(() => {
    async function loadVitals() {
      try {
        const response = await fetch("/api/vitals");

        if (!response.ok) {
          throw new Error("Failed to load vitals");
        }

        const data = await response.json();

        setVitals(data.slice(0, 4));
      } catch (error) {
        console.error(error);
      }
    }

    loadVitals();
  }, []);

  return (
    <Card className="h-100">
      <Card.Header className="bg-white py-4">
        <h4 className="mb-0">Latest Patient Vitals</h4>
      </Card.Header>

      <ListGroup variant="flush">
        {vitals.map((vital) => (
          <ListGroup.Item
            key={vital.id}
            className="px-4 py-3"
          >
            <div>
              <h6 className="mb-2">
                Patient: {vital.patientId}
              </h6>

              <div className="d-flex justify-content-between">
                <span>
                  <Activity
                    size={16}
                    className="text-danger me-2"
                  />
                  HR: {vital.heartRate}
                </span>

                <span>
                  <Droplet
                    size={16}
                    className="text-primary me-2"
                  />
                  {vital.bloodPressure}
                </span>
              </div>

              <div className="d-flex justify-content-between mt-2">
                <span>
                  <Wind
                    size={16}
                    className="text-info me-2"
                  />
                  {vital.oxygenSaturation}%
                </span>

                <span>
                  <Thermometer
                    size={16}
                    className="text-success me-2"
                  />
                  {Number(vital.temperature).toFixed(1)}°C
                </span>
              </div>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card>
  );
};

export default VitalsMonitor;
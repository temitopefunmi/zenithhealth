'use client';

import { Card, Col, Row, Container, Badge } from 'react-bootstrap';

const Documentation = () => {
  return (
    <Container fluid className="p-6">
      <Row>
        <Col lg={12} md={12} sm={12}>
          <div className="border-bottom pb-4 mb-4 d-md-flex justify-content-between align-items-center">
            <div className="mb-3 mb-md-0">
              <h1 className="mb-0 h2 fw-bold">Zenith Health Project Overview</h1>
              <p className="mb-0 text-muted">
                A cloud-native health-tech admin dashboard built on Azure, with an
                AI-assisted appointment intake workflow.
              </p>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={8} md={12} sm={12}>
          <Card className="mb-4 shadow-sm border-0">
            <Card.Body>
              <h2 className="fw-bold mb-3">What Zenith Health Is</h2>
              <p>
                Zenith Health is a portfolio project I use to explore how modern
                cloud and AI systems can support health-tech workflows. It started
                as a dashboard project and has evolved into a more realistic
                platform with Infrastructure as Code, secure secret handling,
                cloud deployment, observability, and AI-assisted scheduling.
              </p>
              <p>
                The current workflow allows a receptionist to enter a free-text
                booking request, uses Azure OpenAI to extract structured
                appointment details, creates a draft appointment, and sends it
                into a doctor review flow before final confirmation.
              </p>
            </Card.Body>
          </Card>

          <Card className="mb-4 shadow-sm border-0">
            <Card.Body>
              <h2 className="fw-bold mb-3">Core Architecture</h2>
              <ul className="mb-0">
                <li><strong>Frontend:</strong> Next.js dashboard UI</li>
                <li><strong>Backend:</strong> API routes in Next.js</li>
                <li><strong>Database:</strong> Azure SQL</li>
                <li><strong>AI Layer:</strong> Azure OpenAI</li>
                <li><strong>Secrets:</strong> Azure Key Vault</li>
                <li><strong>Hosting:</strong> Azure App Service</li>
                <li><strong>Observability:</strong> Application Insights + Log Analytics</li>
                <li><strong>Infrastructure:</strong> Terraform</li>
                <li><strong>CI/CD:</strong> GitHub Actions with OIDC-based Azure login</li>
              </ul>
            </Card.Body>
          </Card>

          <Card className="mb-4 shadow-sm border-0">
            <Card.Body>
              <h2 className="fw-bold mb-3">Current AI Workflow</h2>
              <ol className="mb-0">
                <li>Receptionist enters a natural-language appointment request.</li>
                <li>Azure OpenAI extracts patient, doctor, appointment date/time, and priority.</li>
                <li>The system creates a draft appointment for review.</li>
                <li>A doctor verifies the draft before final confirmation.</li>
              </ol>
            </Card.Body>
          </Card>

          <Card className="mb-4 shadow-sm border-0">
            <Card.Body>
              <h2 className="fw-bold mb-3">What I’ve Been Learning</h2>
              <ul className="mb-0">
                <li>How to move from manual cloud setup to Infrastructure as Code</li>
                <li>How to secure deployments with OIDC and Key Vault</li>
                <li>How to handle Azure SQL cold starts and connection retries</li>
                <li>How to deal with Azure OpenAI model lifecycle changes and deprecations</li>
                <li>How to design AI-assisted workflows with human review instead of blind automation</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} md={12} sm={12}>
          <Card className="mb-4 shadow-sm border-0">
            <Card.Body>
              <h3 className="fw-bold mb-3">Tech Stack</h3>
              <div className="d-flex flex-wrap gap-2">
                <Badge bg="primary">Next.js</Badge>
                <Badge bg="secondary">React</Badge>
                <Badge bg="success">Azure</Badge>
                <Badge bg="info">Terraform</Badge>
                <Badge bg="dark">GitHub Actions</Badge>
                <Badge bg="warning" text="dark">Azure OpenAI</Badge>
                <Badge bg="light" text="dark">Azure SQL</Badge>
                <Badge bg="light" text="dark">Key Vault</Badge>
                <Badge bg="light" text="dark">Application Insights</Badge>
              </div>
            </Card.Body>
          </Card>

          <Card className="mb-4 shadow-sm border-0">
            <Card.Body>
              <h3 className="fw-bold mb-3">Current Status</h3>
              <p className="mb-2">
                Zenith Health is still evolving. It is not positioned as a
                production clinical system, but as a hands-on learning and
                portfolio project for building more realistic cloud-native
                health-tech workflows.
              </p>
            </Card.Body>
          </Card>

          <Card className="shadow-sm border-0">
            <Card.Body>
              <h3 className="fw-bold mb-3">Next Areas of Improvement</h3>
              <ul className="mb-0">
                <li>Server-enforced authentication and role checks</li>
                <li>Stronger request and AI output validation</li>
                <li>Cleaner migration strategy for database schema changes</li>
                <li>More production-aware monitoring and alerting</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Documentation;
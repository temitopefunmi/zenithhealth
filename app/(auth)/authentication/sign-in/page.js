'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

import { Row, Col, Card, Button, Image } from "react-bootstrap";
import Link from "next/link";

import useMounted from "hooks/useMounted";

const SignIn = () => {
  const hasMounted = useMounted();

  const { status } = useSession();
  const router = useRouter();

  // If the user is already signed in,
  // immediately redirect to the dashboard.
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
      // or "/dashboard" if that's your route
    }
  }, [status, router]);

  return (
    <Row className="align-items-center justify-content-center g-0 min-vh-100">
      <Col xxl={4} lg={6} md={8} xs={12}>
        <Card className="smooth-shadow-md">
          <Card.Body className="p-6">

            <div className="text-center mb-5">

              <Link href="/">
                <Image
                  src="/favicon.svg"
                  height={60}
                  alt="Zenith Health Portal"
                />
              </Link>

              <h2 className="mt-4 mb-2">
                Zenith Health Portal
              </h2>

              <p className="text-muted mb-4">
                Secure sign-in powered by Microsoft Entra ID
              </p>

            </div>

            {hasMounted && (
              <div className="d-grid">

                <Button
                  variant="primary"
                  size="lg"
                  onClick={() =>
                    signIn("azure-ad", {
                      callbackUrl: "/",
                      // change to "/dashboard" if needed
                    })
                  }
                >
                  Sign In
                </Button>

                <p className="text-center text-muted mt-4 mb-0 small">
                  Authentication is securely managed by
                  Microsoft Entra ID.
                </p>

              </div>
            )}

          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default SignIn;

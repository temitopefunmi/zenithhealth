'use client'
import React from "react";
import Link from 'next/link';
import { Card, Table, Dropdown, Image, Badge } from 'react-bootstrap';
import { MoreVertical } from 'react-feather';
import StaffData from "data/dashboard/StaffData";

const StaffManagement = () => {
    const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
        (<Link
            href=""
            ref={ref}
            onClick={(e) => {
                e.preventDefault();
                onClick(e);
            }}
            className="text-muted text-primary-hover">
            {children}
        </Link>)
    ));

    CustomToggle.displayName = 'CustomToggle';

    const ActionMenu = () => {
        return (
            <Dropdown>
                <Dropdown.Toggle as={CustomToggle}>
                    <MoreVertical size="15px" className="text-muted" />
                </Dropdown.Toggle>
                <Dropdown.Menu align={'end'}>
                    <Dropdown.Item eventKey="1">View Schedule</Dropdown.Item>
                    <Dropdown.Item eventKey="2">Assign Task</Dropdown.Item>
                    <Dropdown.Item eventKey="3">Send Message</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        );
    };

    return (
        <Card>
            <Card.Header className="bg-white py-4 d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Staff Management & Scheduling</h4>
                <Badge bg="info">45 on duty</Badge>
            </Card.Header>
            <Table responsive className="text-nowrap">
                <thead className="table-light">
                    <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {StaffData.map((item, index) => (
                        <tr key={index}>
                            <td className="align-middle">
                                <div className="d-flex align-items-center">
                                    <Image src={item.image} alt="" className="avatar-md avatar rounded-circle" />
                                    <div className="ms-3 lh-1">
                                        <h5 className="mb-1">{item.name}</h5>
                                        <p className="mb-0 text-muted small">{item.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="align-middle">{item.role}</td>
                            <td className="align-middle">{item.department}</td>
                            <td className="align-middle">
                                <Badge bg="success">On Duty</Badge>
                            </td>
                            <td className="align-middle">
                                <ActionMenu />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Card>
    );
};

export default StaffManagement;
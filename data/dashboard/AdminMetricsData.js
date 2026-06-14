import {
	Briefcase,
    People,
    Bullseye,
    Activity
} from 'react-bootstrap-icons';

export const AdminMetricsStats = [
    {
       id:1,
       title : "Hospital Occupancy",
       value : '78%',
       icon: <Briefcase size={18}/>,
       statInfo: '<span className="text-dark me-2">117</span> of 150 beds' 
    },
    {
        id:2,
        title : "Staff On Duty",
        value : 45,
        icon: <People size={18}/>,
        statInfo: '<span className="text-dark me-2">12</span> Doctors, <span className="text-dark me-2">20</span> Nurses' 
     },
     {
        id:3,
        title : "Equipment Ready",
        value : 34,
        icon: <Bullseye size={18}/>,
        statInfo: '<span className="text-dark me-2">2</span> Under Maintenance' 
     },
     {
        id:4,
        title : "Pending Approvals",
        value : 8,
        icon: <Activity size={18}/>,
        statInfo: '<span className="text-danger me-2">3</span> Urgent' 
     }
];
export default AdminMetricsStats;